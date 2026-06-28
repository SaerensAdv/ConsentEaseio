import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { type Express, type Request } from "express";
import { storage } from "./storage";
import { db } from "./db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { users as usersTable, type User } from "@shared/schema";
import { authRateLimiter, passwordResetRateLimiter } from "./rateLimiter";
import { getBaseUrl } from "./email";
import { eq } from "drizzle-orm";
import { scanWebsite, type ClassifiedCookie } from "./cookie-scanner";
import { isValidPublicDomain } from "./routes";

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
      stripeSubscriptionId: string | null;
      trialEndsAt: Date | null;
      billingInterval: string | null;
      companyName: string | null;
      vatNumber: string | null;
      billingCountry: string | null;
      isDemo: boolean;
      demoExpiresAt: Date | null;
    }
  }
}

function toSessionUser(user: any): Express.User {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionEndDate: user.subscriptionEndDate,
    stripeSubscriptionId: user.stripeSubscriptionId,
    trialEndsAt: user.trialEndsAt,
    billingInterval: user.billingInterval,
    companyName: user.companyName,
    vatNumber: user.vatNumber,
    billingCountry: user.billingCountry,
    isDemo: user.isDemo === true,
    demoExpiresAt: user.demoExpiresAt ?? null,
  };
}

// Default cookies seeded for unpersonalised demos.
const DEMO_FALLBACK_COOKIES: ClassifiedCookie[] = [
  { name: "_ga", provider: "Google Analytics", category: "analytics", purpose: "Distinguishes unique users", expiry: "2 years", type: "third-party", domain: "demo-store.example.com" },
  { name: "_gid", provider: "Google Analytics", category: "analytics", purpose: "Distinguishes users for 24h", expiry: "24 hours", type: "third-party", domain: "demo-store.example.com" },
  { name: "_fbp", provider: "Meta (Facebook) Pixel", category: "marketing", purpose: "Tracks conversions from Facebook ads", expiry: "3 months", type: "third-party", domain: "demo-store.example.com" },
  { name: "_hjSession", provider: "Hotjar", category: "analytics", purpose: "Holds the current session data", expiry: "30 minutes", type: "third-party", domain: "demo-store.example.com" },
  { name: "session_id", provider: "Demo Store", category: "necessary", purpose: "Maintains the user's logged-in session", expiry: "Session", type: "first-party", domain: "demo-store.example.com" },
  { name: "cart_token", provider: "Demo Store", category: "necessary", purpose: "Remembers items in the shopping cart", expiry: "14 days", type: "first-party", domain: "demo-store.example.com" },
  { name: "user_lang", provider: "Demo Store", category: "functional", purpose: "Remembers preferred language", expiry: "1 year", type: "first-party", domain: "demo-store.example.com" },
  { name: "_pin_unauth", provider: "Pinterest", category: "marketing", purpose: "Tracks unauthenticated Pinterest visitors", expiry: "1 year", type: "third-party", domain: "demo-store.example.com" },
];

// Run a fast lightweight scan with a hard timeout. Returns null on failure.
async function quickScanForDemo(domain: string): Promise<ClassifiedCookie[] | null> {
  try {
    const result = await Promise.race([
      scanWebsite(`https://${domain}`),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 12_000)),
    ]);
    if (!result || !('cookies' in result)) return null;
    return result.cookies as ClassifiedCookie[];
  } catch (err) {
    console.warn(`[Demo] Scan of ${domain} failed:`, (err as Error)?.message);
    return null;
  }
}

// Seeds a demo website (with categories, cookies, banner config, analytics) for a user.
// Tries a real lightweight scan when isPersonalized=true, falls back to defaults otherwise.
async function seedDemoWebsiteForUser(userId: string, domain: string, isPersonalized: boolean): Promise<void> {
  const website = await storage.createWebsite({
    userId,
    publicId: "demo" + crypto.randomBytes(4).toString('hex'),
    domain,
    status: "needs_attention",
    lastScan: new Date(),
    cookiesFound: 0,
    scriptsFound: 0,
  });

  // Default category set (necessary, functional, analytics, marketing)
  const categories = await storage.createDefaultCategoriesForWebsite(website.id);
  const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
  const fallbackCatId = categories[0]?.id;

  // Pick a cookie set
  let cookieSet: ClassifiedCookie[] = DEMO_FALLBACK_COOKIES;
  if (isPersonalized) {
    const scanned = await quickScanForDemo(domain);
    if (scanned && scanned.length > 0) {
      cookieSet = scanned.slice(0, 25); // cap to keep dashboards readable
    }
  }

  // Persist cookies
  for (const ck of cookieSet) {
    const categoryId = catByName.get(ck.category.toLowerCase()) || fallbackCatId;
    if (!categoryId) continue;
    await storage.createCookie({
      websiteId: website.id,
      categoryId,
      name: ck.name,
      provider: ck.provider,
      purpose: ck.purpose,
      expiry: ck.expiry,
      type: ck.type,
      isAutoDetected: true,
      sourceUrl: ck.sourceUrl ?? null,
    });
  }

  // Update website counts
  await storage.updateWebsite(website.id, {
    cookiesFound: cookieSet.length,
    scriptsFound: Math.max(3, Math.round(cookieSet.length / 3)),
  });

  // Banner config
  await storage.createBannerConfig({
    websiteId: website.id,
    heading: "We value your privacy",
    description: "We use cookies to enhance your browsing experience and analyze site traffic.",
    primaryColor: "#726CEA",
    position: "bottom-left",
    theme: "light",
  });

  // Sample analytics events so charts aren't empty
  const eventTypes = ['banner_shown', 'accept', 'reject', 'settings_click'];
  const countries = ['BE', 'NL', 'DE', 'FR', 'US'];
  const eventsToCreate: Array<{ websiteId: string; eventType: string; country: string }> = [];
  for (let i = 0; i < 50; i++) {
    eventsToCreate.push({
      websiteId: website.id,
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
    });
  }
  await Promise.all(eventsToCreate.map((e) => storage.createAnalyticsEvent(e)));
}

export function setupAuth(app: Express) {
  // Session configuration
  const isProduction = process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1";
  
  app.set("trust proxy", 1); // Trust first proxy for secure cookies behind reverse proxy

  // SESSION_SECRET is also reused as the salt for HMAC-pseudonymising visitor IPs
  // in consent logs (server/routes.ts). If it's missing in production, sessions
  // would silently fall back to a constant string AND every server restart would
  // generate a fresh salt — breaking session continuity and rotating every
  // visitor's pseudonymous ID. Fail loudly instead.
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    if (isProduction) {
      throw new Error(
        "SESSION_SECRET is required in production. Set it in the deployment environment before booting."
      );
    }
    console.warn(
      "[auth] SESSION_SECRET not set — using a development fallback. DO NOT deploy without setting SESSION_SECRET."
    );
  }

  app.use(
    session({
      secret: sessionSecret || "consentease-dev-only-fallback-do-not-deploy",
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
            return done(null, false, { message: "No account found with this email. Please sign up first." });
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Incorrect password. Please try again." });
          }

          return done(null, toSessionUser(user));
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
      done(null, toSessionUser(user));
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

      // Create user with 7-day trial
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        plan: "solo",
        subscriptionStatus: "trialing",
        trialEndsAt,
      });

      // Send verification email
      try {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await storage.createEmailVerificationToken(user.id, token, expiresAt);
        
        const verifyUrl = `${getBaseUrl()}/verify-email?token=${token}`;
        const { sendVerificationEmail } = await import('./email');
        await sendVerificationEmail(user.email, token, verifyUrl);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't block registration if email fails
      }

      const sessionUser = toSessionUser(user);
      req.login(sessionUser, (err) => {
          if (err) {
            return res.status(500).json({ error: "Failed to log in after registration" });
          }
          res.json(sessionUser);
        }
      );
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", authRateLimiter, (req, res, next) => {
    const rememberMe = req.body.rememberMe === true;
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
        if (rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
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

      const { firstName, lastName, companyName, vatNumber, billingCountry } = req.body;

      const updates: Record<string, any> = {
        firstName: firstName || null,
        lastName: lastName || null,
      };
      if (companyName !== undefined) updates.companyName = companyName || null;
      if (vatNumber !== undefined) updates.vatNumber = vatNumber || null;
      if (billingCountry !== undefined) updates.billingCountry = billingCountry || null;

      let updatedUser = await storage.updateUser(req.user.id, updates);

      let vatWarning: string | undefined;
      if (updatedUser.stripeCustomerId) {
        try {
          const { stripeService } = await import('./stripeService');
          if (companyName !== undefined) {
            await stripeService.updateCustomer(updatedUser.stripeCustomerId, {
              name: companyName || null,
            });
          }
          // Only call Stripe if the VAT number actually changed. The frontend
          // re-sends every field on save, so without this guard a user editing
          // only their name could trigger Stripe revalidation and lose their
          // existing valid VAT if Stripe momentarily rejects it.
          const previousVat = req.user.vatNumber ?? null;
          const newVat = vatNumber !== undefined ? (vatNumber || null) : previousVat;
          const vatChanged = vatNumber !== undefined && newVat !== previousVat;
          if (vatChanged) {
            const result = await stripeService.syncCustomerTaxId(
              updatedUser.stripeCustomerId,
              newVat
            );
            if (!result.success) {
              vatWarning = result.error;
              // Roll back to the previously stored VAT (which Stripe still has
              // on file) instead of nuking valid historical data.
              updatedUser = await storage.updateUser(req.user.id, { vatNumber: previousVat });
            }
          }
        } catch (stripeErr) {
          console.error('Failed to sync profile to Stripe:', stripeErr);
        }
      }

      const sessionUser = toSessionUser(updatedUser);

      req.login(sessionUser, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to update session" });
        }
        res.json({ ...sessionUser, vatWarning });
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

      const sessionUser = toSessionUser(user);

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

  // Request email change - sends verification to new email
  app.post("/api/auth/change-email", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { newEmail, password } = req.body;

      if (!newEmail || !password) {
        return res.status(400).json({ error: "New email and password are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Password is incorrect" });
      }

      // Check if new email is same as current
      if (newEmail.toLowerCase() === user.email.toLowerCase()) {
        return res.status(400).json({ error: "New email must be different from current email" });
      }

      // Check if email is already in use
      const existingUser = await storage.getUserByEmail(newEmail);
      if (existingUser) {
        return res.status(400).json({ error: "This email is already in use" });
      }

      // Generate verification token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store pending email change
      await storage.updateUser(req.user.id, {
        pendingEmail: newEmail.toLowerCase(),
        pendingEmailToken: token,
        pendingEmailExpires: expiresAt,
      });

      // Send verification email to new address
      const verifyUrl = `${getBaseUrl()}/verify-email-change?token=${token}`;
      
      try {
        const { sendEmailChangeVerification } = await import('./email');
        await sendEmailChangeVerification(user.email, newEmail, verifyUrl);
      } catch (emailError) {
        console.error('Failed to send email change verification:', emailError);
        // Clear pending email on failure
        await storage.updateUser(req.user.id, {
          pendingEmail: null,
          pendingEmailToken: null,
          pendingEmailExpires: null,
        });
        return res.status(500).json({ error: "Failed to send verification email" });
      }

      res.json({ success: true, message: "Verification email sent to your new email address" });
    } catch (error) {
      console.error('Change email error:', error);
      res.status(500).json({ error: "Failed to initiate email change" });
    }
  });

  // Verify email change - confirms new email address
  app.post("/api/auth/verify-email-change", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }

      // Find user with this token
      const users = await db.select().from(usersTable).where(eq(usersTable.pendingEmailToken, token));
      const user = users[0];

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      // Check if token is expired
      if (!user.pendingEmailExpires || new Date() > new Date(user.pendingEmailExpires)) {
        // Clear expired token
        await storage.updateUser(user.id, {
          pendingEmail: null,
          pendingEmailToken: null,
          pendingEmailExpires: null,
        });
        return res.status(400).json({ error: "Token has expired. Please request a new email change." });
      }

      if (!user.pendingEmail) {
        return res.status(400).json({ error: "No pending email change found" });
      }

      // Check if new email is still available
      const existingUser = await storage.getUserByEmail(user.pendingEmail);
      if (existingUser) {
        await storage.updateUser(user.id, {
          pendingEmail: null,
          pendingEmailToken: null,
          pendingEmailExpires: null,
        });
        return res.status(400).json({ error: "This email is now in use by another account" });
      }

      const newEmail = user.pendingEmail;
      await storage.updateUser(user.id, {
        email: newEmail,
        pendingEmail: null,
        pendingEmailToken: null,
        pendingEmailExpires: null,
      });

      if (user.stripeCustomerId) {
        try {
          const { stripeService } = await import('./stripeService');
          await stripeService.updateCustomer(user.stripeCustomerId, { email: newEmail });
          console.log(`[Auth] Synced email change to Stripe for customer ${user.stripeCustomerId}`);
        } catch (stripeErr) {
          console.error('Failed to sync email change to Stripe:', stripeErr);
        }
      }

      if (req.user && req.user.id === user.id) {
        const sessionUser = toSessionUser({ ...user, email: newEmail });

        req.login(sessionUser, (err) => {
          if (err) {
            console.error('Session update error:', err);
          }
        });
      }

      res.json({ success: true, message: "Email address updated successfully", newEmail });
    } catch (error) {
      console.error('Verify email change error:', error);
      res.status(500).json({ error: "Failed to verify email change" });
    }
  });

  // Cancel pending email change
  app.delete("/api/auth/pending-email", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      await storage.updateUser(req.user.id, {
        pendingEmail: null,
        pendingEmailToken: null,
        pendingEmailExpires: null,
      });

      res.json({ success: true, message: "Pending email change cancelled" });
    } catch (error) {
      console.error('Cancel pending email error:', error);
      res.status(500).json({ error: "Failed to cancel pending email change" });
    }
  });

  // Demo login — creates a unique throwaway demo account per visitor.
  // Optional ?domain query param personalises the seeded website with a real
  // lightweight scan of that domain so prospects see THEIR data in the dashboard.
  app.post("/api/demo/login", async (req, res) => {
    try {
      // Sanitise + validate optional domain. Reject internal/private/reserved
      // hosts so the lightweight scan can't be abused for SSRF.
      const rawDomain = String(req.query.domain || "").trim().toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];
      const matchesShape = !!rawDomain && /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,63}$/.test(rawDomain);
      const isValidDomain = matchesShape && isValidPublicDomain(rawDomain);
      const seedDomain = isValidDomain ? rawDomain : "demo-store.example.com";

      // Lazy cleanup: best-effort delete of expired demo accounts.
      // Fire-and-forget so it doesn't slow this request.
      storage.getExpiredDemoUsers(20)
        .then((expired) => Promise.all(expired.map((u) => storage.deleteUser(u.id).catch(() => {}))))
        .catch((err) => console.warn('[Demo] Lazy cleanup failed:', err?.message));

      // Create unique throwaway user
      const shortid = crypto.randomBytes(6).toString('hex');
      const demoEmail = `demo+${shortid}@consentease.io`;
      const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      const user = await storage.createUser({
        email: demoEmail,
        password: hashedPassword,
        firstName: "Demo",
        lastName: "User",
        plan: "pro",
        subscriptionStatus: "active",
        emailVerified: true,
        isDemo: true,
        demoExpiresAt: expiresAt,
      });

      // Seed website + banner + cookies (real scan if domain provided, defaults otherwise)
      await seedDemoWebsiteForUser(user.id, seedDomain, isValidDomain);

      const sessionUser = toSessionUser(user);

      req.login(sessionUser, (err) => {
        if (err) {
          console.error('Demo login error:', err);
          return res.status(500).json({ error: "Failed to start demo" });
        }
        res.json({
          success: true,
          user: sessionUser,
          seededDomain: seedDomain,
          isPersonalized: isValidDomain,
        });
      });
    } catch (error) {
      console.error('Demo login error:', error);
      res.status(500).json({ error: "Failed to start demo" });
    }
  });

  // Demo reset — wipes the demo user's seeded data and re-seeds defaults.
  // Only callable by an active demo user.
  app.post("/api/demo/reset", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.user.isDemo) {
      return res.status(403).json({ error: "Only demo accounts can be reset" });
    }
    try {
      const websites = await storage.getWebsitesByUserId(req.user.id);
      for (const w of websites) {
        await storage.deleteWebsite(w.id);
      }
      await seedDemoWebsiteForUser(req.user.id, "demo-store.example.com", false);
      res.json({ success: true });
    } catch (error) {
      console.error('Demo reset error:', error);
      res.status(500).json({ error: "Failed to reset demo" });
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
