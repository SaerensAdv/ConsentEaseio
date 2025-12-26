import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { type Express, type Request } from "express";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { User } from "@shared/schema";
import { authRateLimiter, passwordResetRateLimiter } from "./rateLimiter";
import { getBaseUrl } from "./email";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      plan: string;
      subscriptionStatus: string | null;
      subscriptionEndDate: Date | null;
    }
  }
}

export function setupAuth(app: Express) {
  // Session configuration
  const isProduction = process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1";
  
  app.set("trust proxy", 1); // Trust first proxy for secure cookies behind reverse proxy
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "consentease-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict", // Strict for CSRF protection on state-changing requests
      },
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            plan: user.plan,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionEndDate: user.subscriptionEndDate,
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndDate: user.subscriptionEndDate,
      });
    } catch (error) {
      done(error);
    }
  });

  // Auth routes with rate limiting
  app.post("/api/auth/register", authRateLimiter, async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        plan: "solo",
      });

      // Log them in
      req.login(
        {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          plan: user.plan,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionEndDate: user.subscriptionEndDate,
        },
        (err) => {
          if (err) {
            return res.status(500).json({ error: "Failed to log in after registration" });
          }
          res.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            plan: user.plan,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionEndDate: user.subscriptionEndDate,
          });
        }
      );
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", authRateLimiter, (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Login failed" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(req.user);
  });

  // Request password reset (rate limited)
  app.post("/api/auth/forgot-password", passwordResetRateLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ success: true, message: "If an account exists, a password reset email has been sent." });
      }

      // Delete any existing tokens for this user
      await storage.deletePasswordResetTokensByUserId(user.id);

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.createPasswordResetToken(user.id, token, expiresAt);

      // Send email
      const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
      
      try {
        const { sendPasswordResetEmail } = await import('./email');
        await sendPasswordResetEmail(email, token, resetUrl);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Still return success to prevent enumeration
      }

      res.json({ success: true, message: "If an account exists, a password reset email has been sent." });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Reset password with token (rate limited)
  app.post("/api/auth/reset-password", passwordResetRateLimiter, async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ error: "Token and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      
      if (!resetToken) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      if (new Date() > resetToken.expiresAt) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({ error: "Reset token has expired" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update user password
      await storage.updateUser(resetToken.userId, { password: hashedPassword });
      
      // Delete all reset tokens for this user
      await storage.deletePasswordResetTokensByUserId(resetToken.userId);

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Verify email token
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: "Token is required" });
      }

      const verifyToken = await storage.getEmailVerificationToken(token);
      
      if (!verifyToken) {
        return res.status(400).json({ error: "Invalid or expired verification token" });
      }

      if (new Date() > verifyToken.expiresAt) {
        await storage.deleteEmailVerificationToken(token);
        return res.status(400).json({ error: "Verification token has expired" });
      }

      // Mark email as verified
      await storage.updateUser(verifyToken.userId, { emailVerified: true });
      
      // Delete all verification tokens for this user
      await storage.deleteEmailVerificationTokensByUserId(verifyToken.userId);

      res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({ error: "Failed to verify email" });
    }
  });

  // Resend verification email
  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.emailVerified) {
        return res.json({ success: true, message: "Email is already verified" });
      }

      // Delete any existing tokens
      await storage.deleteEmailVerificationTokensByUserId(user.id);

      // Generate new token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await storage.createEmailVerificationToken(user.id, token, expiresAt);

      // Send email
      const verifyUrl = `${getBaseUrl()}/verify-email?token=${token}`;
      
      try {
        const { sendVerificationEmail } = await import('./email');
        await sendVerificationEmail(user.email, token, verifyUrl);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        return res.status(500).json({ error: "Failed to send verification email" });
      }

      res.json({ success: true, message: "Verification email sent" });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: "Failed to send verification email" });
    }
  });

  // Update profile (first name, last name)
  app.put("/api/auth/profile", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { firstName, lastName } = req.body;

      const updatedUser = await storage.updateUser(req.user.id, {
        firstName: firstName || null,
        lastName: lastName || null,
      });

      // Update session with new data
      const sessionUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        plan: updatedUser.plan,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionEndDate: updatedUser.subscriptionEndDate,
      };

      req.login(sessionUser, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to update session" });
        }
        res.json(sessionUser);
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Change password (requires current password)
  app.put("/api/auth/password", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await storage.updateUser(req.user.id, { password: hashedPassword });

      // Invalidate any existing password reset tokens
      await storage.deletePasswordResetTokensByUserId(req.user.id);

      // Regenerate session to invalidate other sessions
      const sessionUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndDate: user.subscriptionEndDate,
      };

      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.json({ success: true, message: "Password updated successfully" });
        }
        req.login(sessionUser, (loginErr) => {
          if (loginErr) {
            console.error('Re-login error:', loginErr);
          }
          res.json({ success: true, message: "Password updated successfully" });
        });
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });
}

// Middleware to require authentication
export function requireAuth(req: Request, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
