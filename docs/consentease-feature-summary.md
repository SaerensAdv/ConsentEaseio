# ConsentEase – Platform Feature Summary

> This document is a structured summary of ConsentEase's current capabilities, intended for strategic analysis of positioning, differentiation, and product roadmap planning.

---

## 1. Product Overview

ConsentEase is a GDPR/CCPA Consent Management Platform (CMP) targeted at small-to-medium businesses and digital agencies. It provides an embeddable consent banner, cookie scanning, compliance logging, and a subscription-based SaaS model. The platform aims to reduce the complexity and cost of enterprise CMPs while delivering meaningful compliance coverage.

---

## 2. Core Features

### 2.1 User Authentication & Account Management
- Email/password registration with first/last name and avatar support
- Email verification and password reset flows
- Guided onboarding flow to complete initial website setup
- GDPR-compliant IP hashing (HMAC-SHA256) for consent logging
- 7-day free trial on all paid plans

### 2.2 Website Management
- Multi-domain support (number of sites scales by plan)
- Automatic domain cleaning and validation on entry
- Interactive setup checklist to guide users to full compliance
- Trial status indicators and upgrade prompts in-dashboard

### 2.3 Visual Banner Configurator
**Style controls:**
- Light/dark theme selection
- Custom colors: primary, background, text, border
- Border radius, shadow intensity, backdrop blur

**Layout controls:**
- Banner position: bottom-left, bottom-right, top-left, top-right, center
- Max-width control
- Button shape: pill, rounded, flat
- Button layout: auto or stacked

**Typography:**
- Custom font families (Inter, Roboto, Open Sans, Lato, Poppins, etc.)
- Configurable font sizes and weights for headings and body text

**Content:**
- Custom heading, description, footer text
- Custom button labels for Accept, Reject, and Preferences actions

**Behavior:**
- Display delay configuration
- Auto-hide option
- "Revisit Consent" floating button (toggleable, with position and color controls)
- Do Not Track (DNT) header detection and respect

**Preview:**
- Real-time live preview of the banner within the dashboard

### 2.4 Analytics & Consent Tracking
- Event tracking: `banner_shown`, `accept`, `reject`, `preferences_saved`
- Real-time updates via WebSockets
- Visitor demographics: country, device type (mobile/desktop/tablet), browser
- Web Vitals monitoring: LCP, CLS, INP, FCP, TTFB (banner performance impact)
- Trend charts and time-series breakdowns
- Data anomaly alerts (e.g., actions exceeding impressions)
- Monthly view counters with atomic increment to prevent race conditions

### 2.5 Consent Proof Logs
- Immutable audit trail of every consent decision
- Records: anonymized visitor ID, hashed IP, timestamp, and category-level choices
- Automatic log expiration after 1 year (configurable retention)
- Exportable for regulatory audits

### 2.6 Cookie Scanning & Management
- Puppeteer-based automated scanner that crawls the customer's website
- Detects first-party and third-party cookies
- Rule-based and AI-assisted categorization into:
  - Necessary
  - Functional
  - Analytics
  - Marketing
- Built-in knowledge base for common trackers (Google Analytics, Facebook Pixel, LinkedIn Insight, etc.)
- Manual add/edit/delete of cookies and categories
- Scheduled re-scans (frequency scales by plan tier)

### 2.7 Policy Generator
- Automated Privacy Policy and Cookie Policy generation
- Driven by a business intake questionnaire (business type, data practices, etc.)
- Output is ready-to-publish text

### 2.8 Subscription & Billing (Stripe)
**Plan tiers (monthly pricing):**

| Plan | Price | Sites | Monthly Views |
|---|---|---|---|
| Starter | €3 | 1 | 10,000 |
| Solo | €7 | 1 | 50,000 |
| Premium | €12 | 1 | 150,000 |
| Pro | €19 | 3 | 300,000 |
| Business | €35 | 10 | 1,000,000 |
| Agency | €59 | 25 | 3,000,000 |
| Agency Pro | €129 | Unlimited | 10,000,000 |

- Monthly and yearly billing intervals
- Stripe-managed billing cycle, payment failure recovery, and tax handling
- Stripe webhooks as source of truth for subscription state
- Feature gating enforced server-side based on active plan

### 2.9 Agency & Team Features
- White-labeling: remove "Powered by ConsentEase" branding (higher-tier plans)
- Public-facing agency profile pages (`/agency/:slug`)
- Client sub-account management from a single agency dashboard
- Team roles: Owner, Admin, Member
- Invitation system for adding clients and team members
- Agencies can manage banner configuration, cookies, and analytics per client

### 2.10 Compliance & Platform Integrations
**Regulatory:**
- Google Consent Mode v2 (full signal set: `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`) with `wait_for_update`
- Do Not Track (DNT) signal detection

**Platform-specific integrations (via embed script):**
- Shopify Consent API
- Wix Consent API
- WordPress (via embed snippet guidance)
- Microsoft Clarity conditional injection based on consent state

**Localization:**
- 10+ languages supported
- Automatic language detection from browser settings

### 2.11 Embeddable Banner Script
- Lightweight vanilla JavaScript bundle served from ConsentEase CDN
- Handles banner rendering, preference persistence, and platform API syncing
- Dynamically pulls latest banner configuration on each page load
- No heavy framework dependencies — minimal performance impact

### 2.12 Diagnostic Tools
- Implementation verification scan: checks for GTM/gtag detection, Consent Mode setup correctness
- Actionable recommendations returned when misconfiguration is detected
- HTTP-only fallback scanner for environments without Chromium

### 2.13 Iris AI Assistant
- Specialized GPT-powered chatbot embedded on public-facing pages
- Handles GDPR/CCPA questions, product guidance, and light conversion optimization
- Links users to relevant app pages or upgrade paths
- Privacy-first: no server-side conversation persistence
- Powered by OpenAI (gpt-4o-mini)

### 2.14 Public & Marketing Features
- Free public cookie scanner at `/scan`
- Interactive live demo at `/demo`
- Competitor comparison pages
- SEO-optimized marketing pages with structured data, dynamic sitemap, and canonical URLs
- Server-side meta tag injection for Open Graph and social sharing

---

## 3. Technical Architecture (Relevant to Positioning)

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, TailwindCSS v4, Shadcn UI |
| Backend | Express.js, TypeScript, Node.js |
| Database | PostgreSQL via Drizzle ORM |
| Auth | Passport.js |
| Billing | Stripe |
| AI | OpenAI API (via Replit AI Integrations) |
| Scanning | Puppeteer-core + system Chromium |
| Real-time | WebSockets |
| CRM Sync | ClickUp API |

---

## 4. Known Limitations & Gaps

- **No public REST API:** Documented as "not yet implemented"; removed from feature lists.
- **No server-side consent enforcement:** Consent logic runs client-side; no server-side tag blocking or proxy.
- **No A/B testing for banners:** Only one active configuration per website.
- **No consent rate benchmarking:** Users can't compare their accept rates against industry averages.
- **No TCF 2.2 (IAB) support:** Not mentioned anywhere in the codebase.
- **No native CMP integrations:** No direct integrations with ad platforms (DV360, The Trade Desk) beyond GCM v2.
- **Chromium dependency for scanning:** Requires environment setup; HTTP fallback is less thorough.
- **No multi-language banner A/B:** Language detection is automatic, but can't test copy variants per language.
- **No data export (analytics):** No CSV/PDF export of analytics or consent logs visible in the codebase.
- **No consent preference center (separate page):** Preferences are managed via the banner modal only.
- **Iris AI is public-only:** The AI assistant is not available inside the authenticated dashboard.
