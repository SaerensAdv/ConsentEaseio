# ConsentEase - GDPR/CCPA Consent Banner Management Platform

## Run & Operate
- **Run:** `npm start`
- **Build:** `npm run build`
- **Typecheck:** `npm run check`
- **DB Push:** `npm run db:push` (updates DB schema)
- **Required Env Vars:** `SESSION_SECRET`, `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLICKUP_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`, `CHROMIUM_PATH` (optional for cookie scanner).
- **Optional Host/Base-URL Env Vars (see `server/base-urls.ts`):** `PUBLIC_BASE_URL` (default `https://consentease.io`), `APP_BASE_URL` (default `https://app.consentease.io`), `WEBHOOK_BASE_URL` (default `https://consentease.io`) override the intentional base URLs for marketing links, dashboard/auth/Stripe-return links, and the Stripe managed webhook respectively (defaults apply only in production; dev falls back to the Replit dev domain). `ENABLE_HOST_REDIRECTS` (default off) is the master switch that turns on production host redirects between `consentease.io` and `app.consentease.io` — keep it OFF until DNS for `app.consentease.io` is live. `MANAGE_STRIPE_WEBHOOK` (default off) must be explicitly enabled for startup to provision/update the Stripe managed webhook endpoint at `WEBHOOK_BASE_URL/api/stripe/webhook`; when off, startup never creates/replaces/modifies any Stripe webhook and incoming webhook processing at `POST /api/stripe/webhook` is unaffected.

## Stack
- **Frontend:** React, TypeScript, TailwindCSS v4, Shadcn UI, wouter
- **Backend:** Express, TypeScript, Node.js
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Passport.js
- **Validation:** Zod
- **Build Tool:** Vite

## Where things live
- `client/`: Frontend React application.
  - `client/src/components/`: Reusable UI components.
  - `client/src/pages/`: Page-level components and routes.
  - `client/src/index.css`: TailwindCSS main styling.
  - `client/src/App.tsx`: Main application entry point, global context, and routing.
- `server/`: Backend Express application.
  - `server/api/`: API route handlers.
  - `server/db/`: Database schema and Drizzle ORM setup.
  - `server/services/`: Business logic and external integrations (Stripe, ClickUp).
  - `server/middleware/`: Express middleware (auth, rate limiting).
  - `server/auth.ts`: Authentication strategies and helpers.
  - `server/routes.ts`: API route definitions.
  - `server/index.ts`: Main server entry point.
- `shared/`: Shared types, constants, and utilities between frontend and backend.
  - `shared/schema.ts`: Database schema definition (source of truth for DB).
  - `shared/plans.ts`: Plan definitions and feature mappings.
  - `shared/domain-utils.ts`: Domain authorization logic.
- `scripts/`: Utility scripts (e.g., `seed-demo-analytics.ts`, `cleanup-old-stripe-products.ts`).
- `docs/`: Documentation and plans (e.g., `docs/plans/analytics-weekend-plan.md`).
- `public/`: Static assets.
- `uploads/logos/`: Uploaded logo storage.

## Architecture decisions
- **Simplified Consent Management:** Focus on core GDPR/CCPA features for small businesses, avoiding the complexity and cost of enterprise solutions.
- **Client-Side Embed Script:** The consent banner is delivered via an embeddable JavaScript script, allowing seamless integration and dynamic updates on customer websites. Includes platform-specific integrations (Shopify, Wix, WordPress).
- **Puppeteer-core for Scanning:** Utilizes `puppeteer-core` with system Chromium for robust cookie and diagnostic scanning, with an HTTP-only fallback for environments without Chromium.
- **Stripe as Single Source of Truth for Billing:** All subscription and payment logic is managed through Stripe, with webhooks ensuring data consistency and plan limit enforcement.
- **ClickUp Integration for CRM & Project Management:** Automated syncing of users, leads, support tickets, and bugs to ClickUp for centralized management and workflow automation.
- **Atomic Monthly View Counters:** Uses a dedicated `monthly_view_counters` table with an `INSERT...ON CONFLICT DO UPDATE` strategy to prevent race conditions and ensure accurate monthly view tracking.
- **Aggressive Bundle Splitting & Lazy Loading:** Public pages and dashboard routes are lazy-loaded and aggressively split into vendor-specific chunks to optimize initial page load performance and SEO.

## Product
- **User Authentication & Website Management:** Secure login, registration, and management of multiple websites.
- **Visual Banner Configurator:** Live preview configurator with extensive customization for banner style, content, layout, and behavior.
- **Revisit Consent Button:** Configurable floating button for users to re-open consent preferences.
- **Website Cookie Scanning:** Automated scanning to detect and classify cookies, populating the cookie management system.
- **Subscription Management:** Stripe integration for recurring payments, trial periods, and plan limit enforcement.
- **Analytics Tracking:** Records banner impressions, acceptances, and rejections with detailed dashboard insights (device, browser, category breakdown, trends).
- **Compliance Features:** Default cookie categories, Google Consent Mode v2 integration, white-labeling options, and compliance score indicator.
- **SEO Optimization:** Server-side meta tag injection, structured data, dynamic sitemap, canonical URLs, and lazy loading for marketing pages.
- **Agency Client Management:** Agencies can manage client websites, including banner configuration, cookies, and analytics.
- **Iris AI Assistant:** A public-facing chatbot for user support, powered by OpenAI, with privacy-first design (no server-side conversation persistence).

## User preferences
I prefer detailed explanations.
Do not make changes to the `clickup-automation.config.json` file.
Do not make changes to the `scripts/clickup-cli.ts` file.
I prefer to be asked before major changes are made to the core architecture or database schema.

## Gotchas
- **Chromium Availability:** Cookie and diagnostic scanners rely on `puppeteer-core` and a system Chromium binary. Ensure `CHROMIUM_PATH` is correctly set in production or use the HTTP-only fallback.
- **Stripe Webhook Idempotency:** Webhook events are tracked in-memory for 24 hours to prevent duplicate processing. Ensure proper error handling to trigger Stripe retries.
- **Trial Anchoring:** Trial end dates are anchored at signup. Converting to a paid plan mid-trial no longer extends the trial window.
- **Performance Monitoring:** Run `git gc` periodically (every few months) to compact Git history and improve Replit workspace performance.
- **Analytics Data Integrity:** The dashboard includes an "Data anomaly" alert if actions exceed impressions, indicating potential data overcounting.
- **API Access:** The public REST API is not yet implemented; it has been removed from feature lists. Contact support for early access.

## Pointers
- **Drizzle ORM Docs:** `https://orm.drizzle.team/docs/overview`
- **Stripe API Docs:** `https://stripe.com/docs/api`
- **TailwindCSS Docs:** `https://tailwindcss.com/docs`
- **React Docs:** `https://react.dev/`
- **ClickUp API Docs:** `https://developer.clickup.com/`
- **GDPR Compliance Guide:** `https://gdpr-info.eu/`
- **CCPA Compliance Guide:** `https://oag.ca.gov/privacy/ccpa`
- **Analytics Weekend Plan:** `docs/plans/analytics-weekend-plan.md`
- **Production Indexing:** `docs/PRODUCTION_INDEXES.sql`
- **Connect API Reference (v1):** `docs/api/consentease-api-v1.md`
- **Connect Phase-1 Build Sequence:** `docs/plans/connect-phase1-build-sequence.md`
