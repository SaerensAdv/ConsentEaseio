import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { apiV1Router } from "./api/v1";
import { serveStatic } from "./static";
import { createServer } from "http";
import { setupAuth } from "./auth";
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from './stripeClient';
import { WebhookHandlers } from './webhookHandlers';
import { startTrialScheduler } from './trialScheduler';
import { startPaymentFailureScheduler } from './paymentFailureScheduler';
import { WEBHOOK_BASE_URL } from './base-urls';
import { hostRedirects } from './middleware/hostRedirects';

// Boot-time guardrails. Fail fast in production rather than silently falling
// back to weak defaults that break analytics continuity (see auth.ts and
// routes.ts for why SESSION_SECRET is critical beyond just sessions).
const IS_PRODUCTION_BOOT = process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1";
if (IS_PRODUCTION_BOOT && !process.env.SESSION_SECRET) {
  console.error("FATAL: SESSION_SECRET must be set in production. Aborting boot.");
  process.exit(1);
}

// Explicit opt-in for PROVISIONING/managing the Stripe webhook endpoint at boot.
// Default OFF: startup must never silently create, replace, duplicate, or modify a
// Stripe webhook just because WEBHOOK_BASE_URL changed. This is independent of
// PROCESSING incoming webhook requests (POST /api/stripe/webhook), which always runs.
const MANAGE_STRIPE_WEBHOOK = /^(true|1|yes|on)$/i.test(
  (process.env.MANAGE_STRIPE_WEBHOOK ?? "").trim(),
);

const app = express();

// Trust the platform proxy so req.ip and secure-cookie detection work behind
// Replit's Google Frontend.
app.set("trust proxy", 1);

// Security headers. CSP is intentionally disabled here — the embedded banner
// loader and Stripe both require inline/foreign scripts that don't fit a
// strict CSP without a nonce pipeline. We keep all the other defaults
// (X-Content-Type-Options, Referrer-Policy, etc.) which were missing from
// the live site.
// X-Frame-Options (frameguard) is disabled in favour of a targeted
// frame-ancestors CSP directive set below, which supports per-domain allowlists.
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: false, // replaced by frame-ancestors directive below
    crossOriginEmbedderPolicy: false, // banner is embedded cross-origin
    crossOriginResourcePolicy: { policy: "cross-origin" }, // banner script must load on customer sites
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge: 63072000, // 2 years (matches what Replit edge already sets)
      includeSubDomains: true,
      preload: false,
    },
  })
);

// Allow this app to be embedded as an iframe on authorised domains.
// Add new origins here when customers need iframe embedding.
const IFRAME_ALLOWED_ORIGINS = [
  "'self'",
  "https://saerensadvertising.com",
];
app.use((_req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    `frame-ancestors ${IFRAME_ALLOWED_ORIGINS.join(" ")}`
  );
  next();
});

app.use(compression());
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn('DATABASE_URL not set, skipping Stripe initialization');
    return;
  }

  try {
    console.log('Initializing Stripe schema...');
    await runMigrations({ databaseUrl });
    console.log('Stripe schema ready');

    const stripeSync = await getStripeSync();

    // Provisioning/managing the Stripe webhook ENDPOINT is deliberately separate
    // from PROCESSING incoming webhook requests. The incoming handler is registered
    // unconditionally at POST /api/stripe/webhook (below) and always works. Endpoint
    // provisioning is gated behind MANAGE_STRIPE_WEBHOOK (default OFF) so that a
    // WEBHOOK_BASE_URL change can never silently create, replace, duplicate, or
    // modify a Stripe webhook at startup. When enabled it manages only
    // WEBHOOK_BASE_URL/api/stripe/webhook. Webhook secrets are never logged.
    if (!MANAGE_STRIPE_WEBHOOK) {
      console.log(
        'Skipping managed Stripe webhook provisioning (MANAGE_STRIPE_WEBHOOK is off). ' +
        'Incoming webhook processing at POST /api/stripe/webhook is unaffected.',
      );
    } else {
      console.log('Setting up managed webhook...');
      // Webhook host is an explicit config (WEBHOOK_BASE_URL), not REPLIT_DOMAINS[0],
      // so the endpoint is intentional and stable across the two-hostname setup.
      // In dev this resolves to the Replit dev domain; in production it defaults
      // to https://consentease.io.
      const webhookUrl = `${WEBHOOK_BASE_URL}/api/stripe/webhook`;
      const hasPublicWebhookHost = !/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(WEBHOOK_BASE_URL);
      if (!hasPublicWebhookHost) {
        console.warn('WEBHOOK_BASE_URL has no public host, skipping managed webhook setup');
        // Still kick off the data sync below so the dev environment has Stripe data.
      }
      try {
        if (!hasPublicWebhookHost) {
          throw new Error('webhook URL unavailable (no public WEBHOOK_BASE_URL host)');
        }
        const webhook = await stripeSync.findOrCreateManagedWebhook(webhookUrl);
        if (webhook?.url) {
          console.log(`Webhook configured: ${webhook.url} (id: ${webhook.id}, status: ${webhook.status})`);
        } else if (webhook?.id) {
          console.log(`Webhook configured with id: ${webhook.id}`);
        } else {
          console.log('Webhook setup completed but no webhook details returned');
        }
      } catch (webhookError: any) {
        console.error('Webhook setup failed:', webhookError.message);
        if (webhookError.message?.includes('No such webhook endpoint')) {
          console.log('Stale webhook reference detected. Retrying webhook creation...');
          try {
            if (!webhookUrl) throw new Error('webhook URL unavailable');
            const retryWebhook = await stripeSync.findOrCreateManagedWebhook(webhookUrl);
            if (retryWebhook?.url) {
              console.log(`Webhook configured on retry: ${retryWebhook.url} (id: ${retryWebhook.id})`);
            }
          } catch (retryError: any) {
            console.error('Webhook retry also failed:', retryError.message);
          }
        }
      }
    }

    console.log('Syncing Stripe data...');
    stripeSync.syncBackfill()
      .then(() => {
        console.log('Stripe data synced');
      })
      .catch((err: any) => {
        console.error('Error syncing Stripe data:', err);
      });
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;

      if (!Buffer.isBuffer(req.body)) {
        console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      await WebhookHandlers.processWebhook(req.body as Buffer, sig);

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

setupAuth(app);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    // Skip logging for analytics and tracking endpoints to reduce log noise
    if (path.startsWith("/api") && 
        !path.includes("/api/analytics") && 
        !path.includes("/api/track") &&
        !path.includes("/api/consent/log")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await initStripe();
  await registerRoutes(httpServer, app);

  // Versioned public REST API (API-key authenticated). Mounted after the dashboard
  // routes and before the SPA/static fallback so every /api/v1/* request is handled
  // here. All auth, rate-limiting and scope checks live inside apiV1Router.
  app.use("/api/v1", apiV1Router);
  
  startTrialScheduler();
  startPaymentFailureScheduler();

  // Host-aware redirects between the public marketing site and the app
  // subdomain. Flag-gated (ENABLE_HOST_REDIRECTS) and a no-op until enabled;
  // must run before the SPA/static fallback and it never touches /api/* traffic.
  app.use(hostRedirects);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const isProduction = process.env.NODE_ENV === "production" || 
                       process.env.REPLIT_DEPLOYMENT === "1" ||
                       !process.env.NODE_ENV;
  
  if (isProduction) {
    log("Running in production mode, serving static files");
    serveStatic(app);
  } else {
    try {
      const devModulePath = [".", "vite"].join("/");
      const viteModule = await (eval(`import("${devModulePath}")`) as Promise<typeof import("./vite")>);
      await viteModule.setupVite(httpServer, app);
    } catch (e) {
      log("Vite not available, falling back to static serving");
      serveStatic(app);
    }
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
