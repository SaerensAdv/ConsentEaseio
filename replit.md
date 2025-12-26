# ConsentEase - GDPR/CCPA Consent Banner Management Platform

## Overview
ConsentEase is a simplified consent banner management platform positioned as an affordable alternative to enterprise solutions like OneTrust. Target market is small business owners who need compliance without the complexity or cost of enterprise tools.

**Value Proposition:** "€5/month vs $30k/year, 2-minute setup vs 2-week implementation."

## Current State
The platform is a full-stack application with:
- User authentication (login/register)
- Website management with cookie scanning simulation
- Visual banner configurator with 20+ customization options
- Embeddable JavaScript consent banner script
- Analytics tracking (banner shown, accept, reject events)
- Stripe payment integration for subscriptions
- Plan limit enforcement (website limits, view tracking)

## Demo Account
- Email: demo@consentease.com
- Password: demo123

## Subscription Plans (Stripe)
- Solo: €5/month - 1 website, 10K views, 7-day free trial
- Pro: €12/month - 5 websites, 100K views (highlighted as "Best Value")
- Agency: €39/month - Unlimited websites, 1M views

## Plan Feature Restrictions
- Solo: Shows "Powered by ConsentEase" branding on banner
- Pro/Agency: Can remove branding (white-label ready)
- Agency only: API Access feature

## Project Architecture

### Frontend (React + TypeScript)
- `/client/src/pages/` - Page components
  - `home.tsx` - Landing page with hero, features, pricing
  - `compare.tsx` - OneTrust comparison page
  - `login.tsx` - Authentication page
  - `onboarding.tsx` - New user onboarding flow
  - `dashboard/` - Dashboard pages (websites, banner, embed, analytics, settings)

### Backend (Express + TypeScript)
- `/server/index.ts` - App entry point with Stripe initialization
- `/server/routes.ts` - API endpoints
- `/server/auth.ts` - Passport.js authentication
- `/server/storage.ts` - Database operations
- `/server/stripeClient.ts` - Stripe client with credential caching
- `/server/stripeService.ts` - Stripe API operations
- `/server/banner-script.ts` - Embeddable consent banner script generator

### Database (PostgreSQL + Drizzle ORM)
- `/shared/schema.ts` - Database schema
  - users (with Stripe customer/subscription IDs)
  - websites
  - banner_configs
  - analytics_events

### Styling
- TailwindCSS v4
- Primary color: #726CEA (purple - Saerens Advertising branding)
- Fonts: Plus Jakarta Sans (headings), Inter (body)

## Key Features

### Banner Configurator
- Live preview with desktop/mobile toggle
- Style options: colors, border radius, shadow, backdrop blur
- Content options: heading, description, button text, font family/size
- Layout options: position (5 options), animation (3 options), icon toggle
- Button customization: style (filled/outline), shape (pill/rounded/sharp)

### Embed Script
- Generated JavaScript that customers add to their websites
- Tracks consent events (banner shown, accept, reject)
- Stores consent in localStorage with 1-year expiration
- Sends analytics to ConsentEase API

### Stripe Integration
- Webhook handling for subscription events
- Checkout sessions for new subscriptions
- Customer portal for subscription management
- Products synced from Stripe to local database

## Recent Changes
- December 26, 2025: Added "Powered by ConsentEase" branding in banner preview for Solo users
- December 26, 2025: Added branding notice alert in banner configurator with upgrade button for Solo users
- December 26, 2025: Banner script shows branding footer for Solo users, hidden for Pro/Agency
- December 26, 2025: Added 7-day free trial badge to Solo plan in comparison table
- December 26, 2025: Added centralized plan configuration in shared/plans.ts with pricing, limits, and features
- December 26, 2025: Created PlanComparisonTable component with feature comparison and "Most Popular" highlighting
- December 26, 2025: Updated landing page and settings upgrade modal to use shared plan components
- December 26, 2025: Added inline limit error UX with upgrade path when adding websites
- December 26, 2025: Added plan limit enforcement (websites per plan, monthly views tracking)
- December 26, 2025: Added usage stats display in dashboard settings with progress bars
- December 26, 2025: Secured plan sync endpoint to verify Stripe subscription
- December 25, 2025: Fixed Stripe checkout integration with plan selection modal
- December 25, 2025: Added About section to landing page
- December 25, 2025: Updated pricing to Solo €5, Pro €12, Agency €39
- December 25, 2025: Added Google Consent Mode v2 support with proper initialization order
- December 25, 2025: Added Stripe payment integration
- December 25, 2025: Created embed code page and script generation
- December 25, 2025: Connected banner configurator to API
- December 25, 2025: Converted from prototype to full-stack app

## Development Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database
- `npx tsx server/seed-stripe-products.ts` - Seed Stripe products
