import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useCanonical } from "@/hooks/use-canonical";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Book,
  Code,
  Lightning,
  Gear,
  Copy,
  Check,
  Globe,
  ChartBar,
  DeviceMobile,
  WarningCircle,
  MagnifyingGlass,
  ArrowRight,
  CaretRight,
  ShieldCheck,
  UserCirclePlus,
  Translate,
  ListChecks,
  Scales,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { marked } from "marked";

interface Guide {
  id: string;
  title: string;
  icon: typeof Lightning;
  description: string;
  category: "start" | "platform" | "features" | "compliance";
  content: string;
}

const categoryLabels: Record<string, string> = {
  start: "Getting started",
  platform: "Platform guides",
  features: "Features & tools",
  compliance: "Compliance & proof",
};

const guides: Guide[] = [
  {
    id: "why-consent",
    title: "Why Cookie Consent?",
    icon: ShieldCheck,
    category: "start",
    description: "What you need to know before you start",
    content: `
## Why does your website need a cookie banner?

If your website uses cookies — and almost every website does — privacy laws like the **GDPR** (Europe) and **CCPA** (California) require you to inform visitors and get their permission before tracking them.

### What counts as a cookie?

Cookies are small files that websites store on a visitor's device. Common examples:

- **Google Analytics** tracks how people use your site
- **Facebook Pixel** helps target ads to people who visited your site
- **Shopping carts** remember what's in a visitor's basket
- **Login sessions** keep people signed in

Even if you didn't add these yourself, your website builder, hosting provider, or plugins may have added them.

### What happens if you don't comply?

- **GDPR fines** can reach up to €20 million or 4% of annual revenue
- **CCPA fines** up to $7,500 per intentional violation
- **Google Ads** may limit your advertising if you don't use Consent Mode v2
- **Visitor trust** decreases when people feel their privacy isn't respected

### What does ConsentEase do for you?

1. **Detects cookies** on your website automatically
2. **Shows a customisable banner** asking visitors for permission
3. **Blocks tracking cookies** until the visitor agrees
4. **Keeps a record** of every consent decision (proof for audits)
5. **Integrates with Google** so your analytics and ads keep working properly

### Do I need this if I only have a simple website?

If your website has **any** third-party scripts — Google Analytics, a contact form, embedded videos, social media buttons — then yes, you likely need a consent banner. Even a basic WordPress site with a few plugins typically sets 10-20 cookies.

> **The good news:** Setting up ConsentEase takes about 2 minutes, and once it's running, it handles everything automatically.
    `
  },
  {
    id: "account-setup",
    title: "Account Setup",
    icon: UserCirclePlus,
    category: "start",
    description: "Create your account and add your first website",
    content: `
## Setting Up Your ConsentEase Account

### Step 1: Create your account

1. Go to [consentease.io](https://consentease.io) and click **Get Started Free**
2. Enter your email address and choose a password
3. Check your inbox for a verification email and click the confirmation link
4. You're in!

### Step 2: Choose your plan

ConsentEase offers several plans depending on your needs:

- **Starter** (€3/mo) — 1 website, 10K monthly views, basic banner
- **Solo** (€7/mo) — 1 website, 25K monthly views, full customisation, analytics
- **Premium** (€12/mo) — 1 website, 100K monthly views, branding removal, priority support
- **Pro** (€19/mo) — 5 websites, 250K monthly views, white-labelling
- **Business** (€35/mo) — 10 websites, 1M monthly views
- **Agency** (€59/mo) — 25 websites, 2.5M monthly views, white-label + client management + 25 policies/month
- **Agency Pro** (€129/mo) — 100 websites, 10M monthly views, highest scan limits

Every plan comes with a 7-day free trial. A payment method is required at signup, but you won't be charged until the trial ends. You can upgrade, downgrade, or cancel at any time, and your data is preserved when you switch plans.

### Step 3: Add your website

1. In your dashboard, click **Add Website**
2. Enter your domain name (e.g. \`www.yourbusiness.com\`)
3. ConsentEase will automatically scan your site for cookies
4. Review the detected cookies — we categorise most of them automatically

### Step 4: Customise your banner

1. Click **Banner Configurator** on your website card
2. Choose colours that match your brand
3. Pick a position (bottom of the page works best for most sites)
4. Write a short, friendly message — or use our defaults
5. Preview how it looks on desktop and mobile

### Step 5: Install the banner

After customising, click **Get Embed Code** to get your installation script. The next guides show you exactly how to install it on your specific platform (WordPress, Shopify, Wix, etc.).

### Finding your way around the dashboard

- **Websites** — Your domains and their settings
- **Banner Configurator** — Design your cookie banner
- **Cookies** — View and manage detected cookies per website
- **Analytics** — See how visitors interact with your banner
- **Consent Logs** — Proof of every consent decision
- **Settings** — Account, billing, and plan management
    `
  },
  {
    id: "quickstart",
    title: "Quick Start",
    icon: Lightning,
    category: "start",
    description: "Install your banner in under 2 minutes",
    content: `
## Installing Your Consent Banner

Once you've set up your account and customised your banner, you need to add a small piece of code to your website. Don't worry — it's just one line, and we'll show you exactly where to put it.

### Your embed code

You'll find your unique embed code in the dashboard under **Embed Code**. It looks like this:

\`\`\`html
<!-- ConsentEase Consent Banner -->
<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>
\`\`\`

> **Important:** Replace \`YOUR_WEBSITE_ID\` with the actual ID from your dashboard. Each website has its own unique ID.

### Where to put it

This script needs to go in the **head section** of your website. The head section is a part of your website's code that loads before the visible page appears. Putting the consent script here ensures it runs before any tracking starts.

**Using a website builder?** Skip to the platform-specific guide for your platform:
- WordPress → see the **WordPress** guide
- Shopify → see the **Shopify** guide
- Wix → see the **Wix** guide
- Squarespace → see the **Squarespace** guide

**Using custom HTML?** Paste the script just before the \`</head>\` line in your HTML file.

### Verify it's working

1. Open your website in a **private/incognito browser window** (this ensures no old cookies interfere)
2. Your consent banner should appear
3. Try clicking Accept and Reject — both should work
4. Check your ConsentEase dashboard — you should see the interaction appear in Analytics within a minute

### What happens next?

Once installed:
- **New visitors** see the banner and make a choice
- **Returning visitors** who already made a choice won't see it again (their preference is remembered for 12 months)
- **Your dashboard** shows real-time analytics on consent rates
- **Cookies are blocked** until the visitor gives permission (except necessary cookies like login sessions)
    `
  },
  {
    id: "gtm",
    title: "Google Tag Manager",
    icon: Code,
    category: "start",
    description: "Set up Consent Mode v2 for Google Analytics & Ads",
    content: `
## Google Tag Manager & Consent Mode v2

> **Skip this guide** if you don't use Google Tag Manager. If you only have a standard Google Analytics tracking code on your site, ConsentEase handles it automatically — no extra setup needed.

### Why this matters

Since March 2024, Google requires websites to use **Consent Mode v2** to keep collecting analytics data and running ads in the EU. Without it, Google may stop processing your data from European visitors.

ConsentEase supports Consent Mode v2 out of the box. This guide shows you how to make sure everything is connected properly.

### The key rule: load order

The ConsentEase script **must load before** your Google Tag Manager code. This ensures consent preferences are set before any Google tracking starts.

\`\`\`html
<!-- 1. ConsentEase - MUST be first -->
<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>

<!-- 2. Google Tag Manager - AFTER ConsentEase -->
<script>(function(w,d,s,l,i){...your GTM code...})</script>
\`\`\`

### How it works

When a visitor makes a consent choice on your banner:

1. ConsentEase tells Google which types of tracking are allowed
2. Google Tag Manager receives the signal and enables/disables tags accordingly
3. The visitor's choice is remembered for 12 months

### What ConsentEase sends to Google

Each cookie category on your banner maps to a Google consent signal:

| Your banner category | What Google calls it | What it controls |
|---------------------|---------------------|-----------------|
| Analytics | \`analytics_storage\` | Google Analytics tracking |
| Marketing | \`ad_storage\` | Google Ads conversion tracking |
| Marketing | \`ad_personalization\` | Remarketing and audiences |
| Marketing | \`ad_user_data\` | Sending user data to Google |
| Functional | \`functionality_storage\` | Enhanced features |
| Necessary | \`security_storage\` | Always on (security) |

### Checking that it works

1. Install your banner and GTM code in the correct order
2. Open your website in an incognito window
3. Accept all cookies on the banner
4. Check your Google Analytics real-time view — you should see yourself as a visitor
5. Then reject cookies and verify the visit stops being tracked

### For developers

<details>
<summary>Advanced: verify consent signals in browser console</summary>

Open Chrome DevTools (F12) → Console and type:

\`\`\`javascript
// Check current consent state
window.ConsentEase.getConsent()

// View consent events in the data layer
dataLayer.filter(e => e.event === 'consent_update')
\`\`\`

In GTM, verify each tag has consent settings configured:
1. Click on the tag → Consent Settings
2. Enable "Require consent for this tag to fire"
3. Select the appropriate consent types

</details>
    `
  },
  {
    id: "wordpress",
    title: "WordPress",
    icon: Gear,
    category: "platform",
    description: "Install on WordPress sites",
    content: `
## Installing on WordPress

### Recommended: use a header/footer plugin

This is the easiest and safest method. It survives theme updates and doesn't require editing any code files.

1. Install a free plugin like **WPCode** or **Insert Headers and Footers**
2. Go to the plugin settings
3. Paste your ConsentEase embed code in the **Header** section
4. Save changes

That's it! Visit your site in an incognito window to verify the banner appears.

### Alternative: edit your theme files

> **Note:** Changes made this way will be lost if you update your theme. The plugin method above is recommended for most users.

1. Go to Appearance → Theme File Editor
2. Select your theme's \`header.php\` file
3. Find the \`</head>\` line
4. Paste the ConsentEase embed code just **above** that line
5. Save the file

### After installation

1. **Clear your cache** — If you use a caching plugin (WP Super Cache, W3 Total Cache, LiteSpeed, etc.), clear it so the new script is included
2. **Clear your CDN** — If you use Cloudflare or another CDN, purge the cache
3. **Test in incognito** — Open your site in a private browser window to verify

### WooCommerce sites

The banner works normally with WooCommerce. Make sure your analytics and marketing cookies are categorised correctly so that tracking only happens after consent.

### Troubleshooting

**Banner not showing?**
- Clear your caching plugin and CDN cache
- Check that the script is in the header (not footer) section
- Make sure no other cookie/consent plugins are active — disable plugins like "Cookie Notice", "Complianz", or "CookieYes" as they conflict with ConsentEase

**Using a page builder (Elementor, Divi, etc.)?**
- Page builders don't affect the consent banner — it loads independently
- Use the plugin method above, not the page builder's custom code feature

### For developers

<details>
<summary>Advanced: add via functions.php</summary>

If you prefer to add the script programmatically:

\`\`\`php
function add_consentease_script() {
    echo '<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>';
}
add_action('wp_head', 'add_consentease_script', 1);
\`\`\`

The priority \`1\` ensures it loads before other scripts, which is important for Consent Mode v2 compatibility.

</details>
    `
  },
  {
    id: "shopify",
    title: "Shopify",
    icon: Gear,
    category: "platform",
    description: "Install on Shopify stores",
    content: `
## Installing on Shopify

ConsentEase works with all Shopify plans and all themes (including Dawn and other OS 2.0 themes).

### Step 1: Open your theme code

1. In your Shopify admin, go to **Online Store → Themes**
2. Click **"..." → Edit code** on your active theme

### Step 2: Add the script

1. In the left panel, open **Layout → theme.liquid**
2. Find the \`</head>\` line (usually around line 50-100)
3. Paste your ConsentEase embed code just **above** that line:

\`\`\`html
<!-- ConsentEase Consent Banner -->
<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>
</head>
\`\`\`

4. Click **Save**

### Step 3: Enable Customer Privacy settings

1. Go to **Settings → Customer privacy**
2. Enable "Collect customer consent"
3. Select the regions where you want consent collection (EU, California, etc.)

ConsentEase automatically syncs with Shopify's Customer Privacy system, so consent given on your storefront carries over to checkout.

### Step 4: Verify

1. Click **Preview** on your theme
2. Open the preview in an **incognito window**
3. The consent banner should appear
4. Test accepting and rejecting cookies

### What about checkout?

Consent automatically carries over from your store to the checkout page. No extra setup needed — Shopify handles this through their Customer Privacy system once ConsentEase is installed.

### Troubleshooting

**Banner not appearing?**
- Make sure the script is in \`theme.liquid\`, not in a theme app block (app blocks load too late for consent)
- Try a hard refresh (Ctrl+Shift+R) in your preview

**Theme app blocks?**
- Don't use theme app blocks for the consent script — they load after the page renders, which is too late for Consent Mode
- The \`theme.liquid\` method works with every Shopify theme

### For developers

<details>
<summary>Advanced: Shopify JavaScript API</summary>

Check if the Shopify integration is active:

\`\`\`javascript
if (window.ConsentEase.isShopify()) {
  console.log('Shopify Customer Privacy API detected');
}

// Manually sync consent to Shopify (rarely needed)
window.ConsentEase.syncShopify();
\`\`\`

</details>
    `
  },
  {
    id: "wix",
    title: "Wix",
    icon: Globe,
    category: "platform",
    description: "Install on Wix websites",
    content: `
## Installing on Wix

> **Requirement:** You need a Wix **Premium plan** (any paid plan) to add custom code. Free Wix plans don't support this feature.

### Step 1: Open Custom Code settings

1. Go to your **Wix Dashboard**
2. Click **Settings** in the left menu
3. Under **Advanced Settings**, click **Custom Code**

### Step 2: Add the ConsentEase script

1. Click **+ Add Custom Code**
2. Paste your ConsentEase embed code:

\`\`\`html
<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>
\`\`\`

3. Name it **"ConsentEase Banner"**
4. Under **Add Code to Pages**, select **All pages**
5. Under **Place Code in**, select **Head**
6. Click **Apply**

### Step 3: Publish and test

1. Click **Publish** in the top right
2. Visit your live site in an **incognito window**
3. The consent banner should appear

### Troubleshooting

**Banner not showing after publishing?**
- Wix caches pages aggressively — wait a few minutes or try clearing your browser cache
- Make sure you selected "Head" (not "Body" or "Footer") when adding the code
- Verify you clicked **Publish** after adding the custom code

**Not seeing the Custom Code option?**
- This feature requires any paid Wix plan. If you're on the free plan, you'll need to upgrade first.
    `
  },
  {
    id: "squarespace",
    title: "Squarespace",
    icon: Globe,
    category: "platform",
    description: "Install on Squarespace sites",
    content: `
## Installing on Squarespace

> **Requirement:** Code Injection is available on Squarespace **Business** and **Commerce** plans. Personal plans don't support custom code.

### Step 1: Open Code Injection

1. Go to your **Squarespace Dashboard**
2. Navigate to **Settings → Advanced → Code Injection**

### Step 2: Add the script

1. In the **Header** field, paste your ConsentEase embed code:

\`\`\`html
<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>
\`\`\`

2. Click **Save**

### Step 3: Verify

1. Open your site in an **incognito window**
2. The consent banner should appear on every page
3. Test the Accept and Reject buttons

### Squarespace Commerce

If you run a Squarespace online store:
- The banner appears on all pages, including product and checkout pages
- Make sure your payment-related cookies (Stripe, PayPal) are categorised as **Necessary** so they're not blocked
- Test a complete checkout flow after installation

### Troubleshooting

**Don't see Code Injection in settings?**
- This feature requires a Business or Commerce plan. Personal plans don't support custom code injection.

**Banner not appearing?**
- Try a hard refresh (Ctrl+Shift+R)
- Squarespace may cache pages briefly after changes
    `
  },
  {
    id: "other-platforms",
    title: "Other Platforms",
    icon: Globe,
    category: "platform",
    description: "Webflow, static sites, and custom setups",
    content: `
## Installing on Other Platforms

### Webflow

1. Go to **Project Settings → Custom Code**
2. Paste the ConsentEase embed code in the **Head Code** section
3. Click **Save Changes** and **Publish**

### GoDaddy Website Builder

1. Go to your site editor
2. Click **Settings → Custom Code**
3. Paste the code in the **Header** section
4. Click **Done** and **Publish**

### Static HTML sites

If your site is built with plain HTML files, add the embed code directly in each page's \`<head>\` section, just before the \`</head>\` line:

\`\`\`html
<head>
  <title>Your Page</title>
  <!-- other tags... -->

  <!-- ConsentEase Consent Banner -->
  <script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>
</head>
\`\`\`

### React, Next.js, or other JavaScript frameworks

Add the script to your root HTML template or layout component. The script should load on every page of your site.

For **Next.js**, add it to your \`_document.tsx\` or use the \`<Script>\` component in your layout:

\`\`\`jsx
import Script from 'next/script'

export default function Layout({ children }) {
  return (
    <>
      <Script
        src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"
        strategy="beforeInteractive"
      />
      {children}
    </>
  )
}
\`\`\`

### General rule

No matter what platform you use, the ConsentEase script needs to:
1. Be placed in the **head section** of your page
2. Load on **every page** of your site
3. Load **before** any analytics or marketing scripts (especially Google Tag Manager)
    `
  },
  {
    id: "cookie-categories",
    title: "Cookie Categories",
    icon: Book,
    category: "features",
    description: "Understand and manage your cookies",
    content: `
## Understanding Cookie Categories

ConsentEase organises cookies into four standard categories. This is how privacy laws expect you to present cookie choices to visitors.

### Necessary Cookies (always active)

These cookies are essential for your website to work. Visitors don't need to give permission for these — they're always allowed.

**Examples:**
- **Session cookies** — keep a visitor logged in as they browse
- **Shopping cart** — remember what's in a visitor's basket
- **Security tokens** — protect forms from spam and attacks
- **Cookie consent** — remember the visitor's banner choice

### Functional Cookies

These improve the visitor's experience but aren't strictly required for the site to work.

**Examples:**
- **Language preference** — remember which language the visitor chose
- **Theme setting** — remember if they prefer dark mode
- **Video preferences** — remember playback settings on embedded videos

### Analytics Cookies

These help you understand how visitors use your website — which pages they visit, how long they stay, and where they come from.

**Examples:**
- **Google Analytics** — the most common analytics tool
- **Hotjar** — records how visitors interact with your pages
- **Plausible/Fathom** — privacy-friendly analytics alternatives

### Marketing Cookies

These are used for advertising, remarketing, and tracking visitors across websites.

**Examples:**
- **Facebook Pixel** — tracks visitors for Facebook/Instagram ad targeting
- **Google Ads** — conversion tracking and remarketing
- **LinkedIn Insight Tag** — B2B ad targeting

---

## Managing Your Cookies

### Automatic detection

When you add a website to ConsentEase, we scan it and detect most cookies automatically. We also categorise the most common ones for you.

### Reviewing detected cookies

1. Go to your dashboard and select your website
2. Click **Cookies** to see all detected cookies
3. Check that each cookie is in the right category
4. Add a clear description so visitors know what each cookie does

### What happens when a visitor rejects a category?

When a visitor rejects a cookie category (e.g. "Marketing"):
- ConsentEase **prevents those cookies from being set** in the first place
- Any existing cookies in that category are **removed** from the visitor's browser
- The corresponding Google Consent Mode signals are set to "denied"

### Best practices

- **Check regularly** — new plugins or services may add cookies you don't know about. Run a re-scan every few months.
- **Be honest** — don't put analytics cookies in the "Necessary" category. Regulators check for this.
- **Write clear descriptions** — "This cookie tracks your browsing for personalised ads" is better than "_fbp: Facebook tracking pixel cookie"
    `
  },
  {
    id: "analytics",
    title: "Analytics Guide",
    icon: ChartBar,
    category: "features",
    description: "Understand your consent analytics",
    content: `
## Understanding Your Consent Analytics

Your ConsentEase dashboard shows you how visitors interact with your cookie banner. Use these insights to improve your consent rates and stay compliant.

### Key metrics

**Consent Rate**
The percentage of visitors who accept cookies. The industry average is 70-80%. If yours is significantly lower, your banner design or messaging might need tweaking.

**Banner Views**
How many times your banner was shown. This roughly tracks your website traffic from new visitors.

**Accept vs. Reject**
The split between visitors who accept and those who reject. A high reject rate isn't necessarily bad — it might mean your visitors are privacy-conscious, which is fine.

**Category Breakdown**
Shows which specific categories visitors accept or reject. If most people reject "Marketing" but accept "Analytics," that's a normal pattern.

### How to improve your consent rate

**1. Keep your message short and friendly**
- Explain briefly why you use cookies
- "We use cookies to improve your experience and understand how our site is used"
- Avoid legal jargon that scares people

**2. Make your banner look trustworthy**
- Use your brand colours so it feels like part of your site
- Don't use dark patterns (like hiding the reject button)
- Give equal visual weight to Accept and Reject buttons

**3. Choose the right position**
- Bottom banners typically get the highest consent rates
- Avoid pop-ups that cover the entire page — visitors find them annoying
- Make sure buttons are big enough to tap on mobile

**4. Let people customise**
- Offering a "Manage preferences" option builds trust
- Some visitors are happy to allow analytics but not marketing — let them choose

### Exporting your data

On **Pro** and **Agency** plans, you can export analytics data:

1. Go to **Analytics** in your dashboard
2. Select your date range
3. Click **Export** for a CSV download

### Consent Rate Benchmarks

| Metric | Healthy | Needs attention |
|--------|---------|-----------------|
| Overall consent rate | Above 70% | Below 55% |
| Bounce after banner | Below 5% | Above 15% |
| Category acceptance | Mixed choices | Only all-or-nothing |

> **"Only all-or-nothing"** means visitors either accept everything or reject everything — nobody uses the category toggles. This often means your preferences panel is hard to find or use.
    `
  },
  {
    id: "customization",
    title: "Banner Customization",
    icon: DeviceMobile,
    category: "features",
    description: "Design your perfect consent banner",
    content: `
## Customizing Your Consent Banner

Your consent banner should feel like part of your website, not an intrusive pop-up. ConsentEase gives you full control over how it looks.

### Using the visual configurator

1. Go to your dashboard and select your website
2. Click **Banner Configurator**
3. You'll see a live preview that updates as you make changes

### What you can customise

**Colours**
- Background, text, and button colours
- Match them to your brand for a cohesive look

**Position**
- Bottom bar (recommended — least intrusive)
- Top bar
- Bottom-left or bottom-right corner card

**Text**
- Banner heading and description
- Button labels (Accept, Reject, Manage Preferences)
- Write in your own tone of voice

**Styling**
- Corner roundness (sharp corners to fully rounded)
- Shadow intensity
- Backdrop blur effect
- Entrance animation

### Mobile optimisation

The banner automatically adapts to smaller screens:
- Buttons become full-width for easy tapping
- Text resizes for readability
- Position adjusts to avoid covering important content

Use the mobile preview toggle in the configurator to see how it looks.

### Removing "Powered by ConsentEase"

On **Pro** and **Agency** plans, you can remove the ConsentEase branding:

1. In the configurator, scroll to **Branding**
2. Toggle off "Show ConsentEase branding"
3. Save and your banner will appear as fully your own

### For developers

<details>
<summary>Advanced: Custom CSS overrides</summary>

You can inject custom CSS for pixel-perfect control:

\`\`\`css
/* Change the banner font */
.ce-banner {
  font-family: 'Your Font', sans-serif !important;
}

/* Customise the accept button hover effect */
.ce-banner .ce-accept:hover {
  transform: scale(1.02);
}
\`\`\`

Add custom CSS in **Settings → Advanced → Custom Styles** in your dashboard.

</details>
    `
  },
  {
    id: "multi-language",
    title: "Multi-Language Banners",
    icon: Translate,
    category: "features",
    description: "Show banners in your visitors' language",
    content: `
## Multi-Language Consent Banners

If your website has international visitors, you want your consent banner to appear in their language. ConsentEase supports automatic language detection and 8 built-in languages.

### Supported languages

- English (EN)
- Dutch (NL)
- French (FR)
- German (DE)
- Spanish (ES)
- Italian (IT)
- Portuguese (PT)
- Polish (PL)

### How it works

1. When a visitor lands on your site, ConsentEase checks their browser language
2. If their language is one of the 8 supported languages, the banner appears in that language
3. If their language isn't supported, it falls back to your default language (usually English)

### Setting it up

1. Go to your **Banner Configurator**
2. Under **Language**, select your primary/default language
3. Enable **Auto-detect browser language**
4. That's it — ConsentEase handles the rest

### Previewing different languages

In the configurator, use the language dropdown to preview how your banner looks in each language. This lets you verify that all text fits well and looks good.

### Custom text overrides

If you want to change the default translations:

1. Select a language in the configurator
2. Edit any text field (heading, description, button labels)
3. Your custom text will be used instead of the default translation

### Tips for multilingual sites

- **Set your default to your most common audience** — If 80% of your visitors speak Dutch, make Dutch the default
- **Keep messages short** — Translations can be longer than the original text, so shorter messages work better across languages
- **Test each language** — Preview all active languages to make sure buttons and text don't overflow
    `
  },
  {
    id: "consent-logs",
    title: "Consent Logs & Proof",
    icon: ListChecks,
    category: "compliance",
    description: "Keep proof of every consent decision",
    content: `
## Consent Logs — Your Proof of Compliance

One of the key requirements of GDPR is that you can **prove** you obtained consent. If a regulator ever asks, you need to show that each visitor actively made a choice on your banner.

ConsentEase automatically records every consent decision.

### What gets recorded

For each visitor interaction, we store:

- **Date and time** of the decision
- **What they chose** — accept all, reject all, or custom preferences
- **Which categories** they accepted or rejected
- **A unique visitor ID** (anonymised — no personal data)
- **The website** where the consent was given

### Viewing consent logs

1. Go to your dashboard
2. Click **Consent Logs**
3. Use the filters to narrow down:
   - **Date range** — Today, last 7 days, last 30 days, or custom
   - **Action type** — Accept, reject, custom, or dismissed
   - **Search** — Find a specific visitor ID

### Summary statistics

At the top of the Consent Logs page, you'll see:
- **Accept rate** with trend compared to the previous period
- **Reject rate** with trend
- **Most common action** (usually "accept all")
- **Action breakdown** showing the distribution

### How long are logs kept?

ConsentEase retains consent logs for the duration required by applicable law:
- **GDPR** recommends keeping consent records for as long as the consent is valid (typically 12 months)
- We store logs securely and you can export them at any time

### Exporting for audits

If you need to provide proof of consent to a regulator or during an audit:

1. Go to **Consent Logs**
2. Set your date range
3. Click **Export** to download a CSV file with all records

This export includes all the details a regulator would need to verify your compliance.

### Tips

- **Check your logs regularly** — If you see a very low number of consent entries relative to your traffic, your banner might not be loading correctly on all pages
- **Keep exports safe** — Download quarterly exports as backups
- **Don't delete logs** — Even if a visitor later withdraws consent, keep the original consent record as proof that consent was valid at the time
    `
  },
  {
    id: "gdpr-ccpa",
    title: "GDPR vs CCPA",
    icon: Scales,
    category: "compliance",
    description: "Understand the differences and what you need",
    content: `
## GDPR vs CCPA: What You Need to Know

Two of the biggest privacy laws that affect websites are the **GDPR** (Europe) and the **CCPA/CPRA** (California). Here's what each one means for your business.

### GDPR (General Data Protection Regulation)

**Who it applies to:** Any website that has visitors from the EU or EEA — regardless of where your business is located.

**Key requirements:**
- You must get **explicit consent** before setting non-essential cookies
- Visitors must be able to **reject** cookies as easily as they accept them
- You need to keep **proof** that consent was given
- Your banner must clearly explain what cookies are used for
- Consent must be **freely given** — you can't force acceptance to use the site

**What ConsentEase does:** Blocks all non-essential cookies until the visitor actively clicks Accept. Records every decision for your compliance records.

### CCPA/CPRA (California Consumer Privacy Act)

**Who it applies to:** Businesses that collect data from California residents AND meet at least one of these:
- Annual revenue over $25 million
- Buy/sell personal data of 100,000+ consumers
- Earn 50%+ of revenue from selling personal data

**Key requirements:**
- You must provide a **"Do Not Sell My Personal Information"** link
- Visitors can **opt out** of data selling (but you don't need prior consent)
- You must disclose what data you collect and why
- Consumers can request deletion of their data

**What ConsentEase does:** Provides opt-out functionality and honours "Do Not Sell" signals. Records all opt-out decisions.

### The main difference

| | GDPR | CCPA |
|---|------|------|
| **Default** | Cookies blocked until consent | Cookies allowed until opt-out |
| **Consent model** | Opt-in (ask first) | Opt-out (allow until declined) |
| **Applies to** | All EU visitors | California residents (with revenue thresholds) |
| **Penalties** | Up to €20M or 4% of revenue | Up to $7,500 per violation |

### Do I need both?

If your website gets visitors from both Europe and California, yes. ConsentEase can detect where a visitor is located and apply the right consent model automatically:

- **EU visitors** see an opt-in banner (GDPR)
- **California visitors** see an opt-out notice (CCPA)
- **Other visitors** follow your default settings

### Other regulations

Privacy laws are expanding globally. ConsentEase also helps with:
- **ePrivacy Directive** (EU) — the "cookie law" that specifically governs cookies
- **LGPD** (Brazil) — similar to GDPR
- **POPIA** (South Africa) — requires consent for data processing
- **UK GDPR** — post-Brexit version of GDPR, nearly identical
    `
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: WarningCircle,
    category: "features",
    description: "Common issues and how to fix them",
    content: `
## Troubleshooting Common Issues

### Banner not showing

**Most common causes:**

1. **Caching** — Your website or CDN is serving an older version of the page without the script. Clear your cache (browser, hosting, CDN like Cloudflare) and try again in an incognito window.

2. **Script not in the right place** — The ConsentEase script must be in the head section of your page. If it's in the footer or body, it may not load correctly.

3. **Ad blocker** — Some ad blockers also block consent banners. Temporarily disable your ad blocker and try again.

4. **Another consent tool is active** — If you have another cookie consent plugin or script (CookieYes, Complianz, Osano, etc.), it may conflict with ConsentEase. Remove the other tool first.

5. **Wrong website ID** — Double-check that the ID in your embed code matches the one shown in your ConsentEase dashboard.

### Banner shows but buttons don't work

- **CSS conflict** — Your website's styles might be interfering with the banner. This is rare but can happen with aggressive CSS resets.
- **JavaScript error** — Open your browser's developer tools (F12) and check the Console tab for red error messages. If you see errors related to ConsentEase, contact support with a screenshot.

### Consent not being remembered

If the banner keeps appearing for the same visitor:

- Check if your site has strict cookie policies that clear storage
- Some privacy-focused browsers (Brave, Firefox with strict settings) may clear consent data
- Verify that your website domain matches the one configured in ConsentEase

### Google Analytics stopped tracking

After installing ConsentEase, you might see a drop in Analytics data. This is normal and expected — you're now only tracking visitors who actually gave consent.

If Analytics isn't tracking **any** visitors (even those who accept):
- Make sure the ConsentEase script loads **before** your GTM/Analytics script
- Check the Google Tag Manager guide for Consent Mode v2 setup

### Need more help?

1. Check our [FAQ](/faq) for quick answers
2. Contact support at **support@consentease.io**
3. Include your website URL and a description of the issue — screenshots help!
    `
  },
  {
    id: "scanner-ip-block",
    title: "Scanner Blocked by Hosting",
    icon: WarningCircle,
    category: "features",
    description: "What to do when your hosting provider blocks the cookie scanner",
    content: `
## Scanner Blocked by Hosting Provider

In some cases, the ConsentEase cookie scanner cannot access your website because your **hosting provider's firewall is blocking our server's IP address**. This is a security feature of certain hosting providers (notably SiteGround, and some Cloudflare configurations) that rate-limit or challenge unfamiliar IP addresses with a CAPTCHA page.

When this happens, the scanner loads the challenge page instead of your real website, so no cookies are detected. You will see the error:

> **"Website Blocked Our Scanner"**

This is not a problem with your website or banner — it is a server-level restriction.

---

### How to recognise this issue

- The scan finishes quickly (in a few seconds) but finds 0 cookies
- You see the "Website Blocked Our Scanner" error in the Cookies section
- Your website loads fine in a regular browser

---

### Option 1: Whitelist our scanner IP (recommended)

Ask your hosting provider to whitelist the following IP address:

\`\`\`
34.61.219.128
\`\`\`

**For SiteGround users:**
1. Log in to your SiteGround account
2. Go to **Security** → **IP Manager** (or **Blocked IPs**)
3. Add \`34.61.219.128\` to the **Allow list**
4. Save, then run the scan again from your ConsentEase dashboard

**For Cloudflare users:**
1. Go to your Cloudflare dashboard → **Security** → **WAF** → **Tools**
2. Add an **IP Access Rule** to **Allow** the IP \`34.61.219.128\`
3. Save, then run the scan again

---

### Option 2: Add cookies manually

If you cannot or prefer not to whitelist our IP, you can add cookies manually:

1. Open your website in a **regular browser** (not incognito)
2. Open **DevTools** (press F12) → go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Cookies** → select your domain
4. You will see all cookies currently set on your site
5. Go back to ConsentEase → **Cookies** tab → click **Add Cookie** to add them manually

**Common cookies to look for on a typical WordPress site:**

| Cookie name | Category | Duration |
|---|---|---|
| \`_ga\` | Analytics (Google Analytics) | 2 years |
| \`_ga_XXXXXXXXXX\` | Analytics (GA4 session) | 2 years |
| \`_gid\` | Analytics | 24 hours |
| \`_gcl_au\` | Marketing (Google Ads) | 90 days |
| \`trp_language\` | Functional (TranslatePress) | 1 year |
| \`woocommerce_cart_hash\` | Functional (WooCommerce) | Session |
| \`wordpress_test_cookie\` | Necessary | Session |
| \`ce_cookie_consent\` | Necessary (ConsentEase) | 1 year |

---

### Option 3: Contact support

If you are unsure which cookies your site sets or need help with the manual setup, contact us at **support@consentease.io** and include your website URL. We can help you identify the right cookies for your setup.
    `
  }
];

function DocsJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "headline": "ConsentEase Documentation",
        "description": "Complete documentation for setting up and using ConsentEase consent management platform. Installation guides, integration tutorials, and troubleshooting.",
        "url": "https://consentease.io/docs",
        "author": { "@type": "Organization", "name": "ConsentEase" },
        "publisher": { "@type": "Organization", "name": "ConsentEase", "logo": { "@type": "ImageObject", "url": "https://consentease.io/consentease-logo.webp" } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": "https://consentease.io/docs" }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://consentease.io" },
          { "@type": "ListItem", "position": 2, "name": "Documentation", "item": "https://consentease.io/docs" }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function DocsPage() {
  useCanonical("/docs");
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";

    document.title = "Documentation - Setup Guides & Tutorials | ConsentEase";
    if (metaDescription) {
      metaDescription.setAttribute("content", "Complete documentation for ConsentEase. Step-by-step installation guides for WordPress, Shopify, Wix, Squarespace. Google Tag Manager integration and troubleshooting.");
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    const origOgTitle = ogTitle?.getAttribute("content") || "";
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const origOgDesc = ogDescription?.getAttribute("content") || "";
    if (ogTitle) ogTitle.setAttribute("content", "Documentation - Setup Guides & Tutorials | ConsentEase");
    if (ogDescription) ogDescription.setAttribute("content", "Complete documentation for ConsentEase. Step-by-step installation guides for WordPress, Shopify, Wix, Squarespace.");

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const origTwTitle = twitterTitle?.getAttribute("content") || "";
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const origTwDesc = twitterDescription?.getAttribute("content") || "";
    if (twitterTitle) twitterTitle.setAttribute("content", "Documentation - Setup Guides | ConsentEase");
    if (twitterDescription) twitterDescription.setAttribute("content", "Step-by-step installation guides for WordPress, Shopify, Wix, and more.");

    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
      if (ogTitle) ogTitle.setAttribute("content", origOgTitle);
      if (ogDescription) ogDescription.setAttribute("content", origOgDesc);
      if (twitterTitle) twitterTitle.setAttribute("content", origTwTitle);
      if (twitterDescription) twitterDescription.setAttribute("content", origTwDesc);
    };
  }, []);

  const copyToClipboard = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const currentGuide = activeGuide ? guides.find(g => g.id === activeGuide) : null;

  const filteredGuides = searchQuery
    ? guides.filter(g =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : guides;

  const categories = ["start", "platform", "features", "compliance"] as const;

  const exampleScript = `<!-- ConsentEase Consent Banner -->\n<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>`;

  if (currentGuide) {
    return (
      <>
        <DocsJsonLd />
        <div className="min-h-screen bg-background">
          <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
            <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
              <Link href="/" className="text-xl font-display font-bold flex items-center gap-2" data-testid="link-logo-home">
                <img src="/consentease-logo.webp" alt="ConsentEase" className="h-8 w-8 object-contain" />
                ConsentEase
              </Link>
              <button
                onClick={() => setActiveGuide(null)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-back-docs"
              >
                <ArrowLeft size={16} />
                All docs
              </button>
            </div>
          </nav>

          <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <button onClick={() => setActiveGuide(null)} className="hover:text-primary transition-colors">Docs</button>
              <CaretRight size={12} />
              <span className="text-foreground">{currentGuide.title}</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border/40">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <currentGuide.icon size={24} weight="duotone" className="text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold">{currentGuide.title}</h1>
                  <p className="text-muted-foreground mt-1">{currentGuide.description}</p>
                </div>
              </div>

              {currentGuide.id === "quickstart" && (
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20 p-6 mb-10">
                  <h3 className="font-display font-semibold mb-2">Your embed code</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Find your unique code in the dashboard, or use this template:
                  </p>
                  <div className="relative">
                    <pre className="bg-background rounded-lg p-4 text-sm overflow-x-auto border border-border font-mono">
                      <code>{exampleScript}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(exampleScript, "quick-install")}
                      data-testid="button-copy-script"
                    >
                      {copiedCode === "quick-install" ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div
                className="prose prose-lg max-w-none
                  prose-headings:font-display prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                  prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-li:text-muted-foreground
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-table:text-sm
                  prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border prose-pre:rounded-lg
                  prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
                  prose-hr:border-border/40 prose-hr:my-10
                  prose-blockquote:border-primary/30 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:not-italic"
                dangerouslySetInnerHTML={{ __html: marked.parse(currentGuide.content) as string }}
              />
            </motion.div>

            <div className="mt-16 pt-8 border-t border-border/40">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Continue reading</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {guides
                  .filter(g => g.id !== currentGuide.id)
                  .slice(0, 4)
                  .map(g => {
                    const Icon = g.icon;
                    return (
                      <button
                        key={g.id}
                        onClick={() => { setActiveGuide(g.id); window.scrollTo(0, 0); }}
                        className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                        data-testid={`link-guide-${g.id}`}
                      >
                        <Icon size={20} weight="duotone" className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{g.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{g.description}</div>
                        </div>
                        <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary ml-auto shrink-0 transition-colors" />
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl border border-border p-8 text-center">
              <h3 className="text-xl font-display font-bold mb-2">Still need help?</h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">
                Our support team typically responds within a few hours.
              </p>
              <Link href="/contact">
                <Button className="gap-2" data-testid="button-contact-support">
                  Contact support <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <DocsJsonLd />
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-display font-bold flex items-center gap-2" data-testid="link-logo-home">
              <img src="/consentease-logo.webp" alt="ConsentEase" className="h-8 w-8 object-contain" />
              ConsentEase
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-home">
                <ArrowLeft size={16} /> Back
              </Button>
            </Link>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
              <Book size={16} weight="duotone" />
              Documentation
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              Everything you need to <span className="text-gradient">get started</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Step-by-step guides for every platform. From first install to advanced integrations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative max-w-lg mx-auto mb-16"
          >
            <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              data-testid="input-search-docs"
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {searchQuery ? (
              <motion.div
                key="search-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredGuides.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No guides found for "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try a different search term or <Link href="/contact" className="text-primary hover:underline">contact support</Link>.</p>
                  </div>
                )}
                {filteredGuides.map((guide, idx) => {
                  const Icon = guide.icon;
                  return (
                    <motion.button
                      key={guide.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => { setActiveGuide(guide.id); setSearchQuery(""); }}
                      className="w-full flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all text-left group"
                      data-testid={`search-result-${guide.id}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={20} weight="duotone" className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold">{guide.title}</div>
                        <div className="text-sm text-muted-foreground">{guide.description}</div>
                      </div>
                      <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="categories"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {categories.map((cat, catIdx) => {
                  const catGuides = filteredGuides.filter(g => g.category === cat);
                  if (catGuides.length === 0) return null;

                  return (
                    <motion.section
                      key={cat}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + catIdx * 0.1 }}
                    >
                      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 pl-1">
                        {categoryLabels[cat]}
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {catGuides.map((guide) => {
                          const Icon = guide.icon;
                          return (
                            <button
                              key={guide.id}
                              onClick={() => setActiveGuide(guide.id)}
                              className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all text-left group"
                              data-testid={`guide-card-${guide.id}`}
                            >
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Icon size={20} weight="duotone" className="text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold mb-1 group-hover:text-primary transition-colors">{guide.title}</div>
                                <div className="text-sm text-muted-foreground leading-relaxed">{guide.description}</div>
                              </div>
                              <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary mt-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                          );
                        })}
                      </div>
                    </motion.section>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 grid sm:grid-cols-2 gap-4"
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-bold mb-2">Need help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our support team is ready to help you get set up.
              </p>
              <Link href="/contact">
                <Button size="sm" className="gap-2" data-testid="button-contact-support">
                  Contact support <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-bold mb-2">FAQ</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Quick answers to the most common questions.
              </p>
              <Link href="/faq">
                <Button size="sm" variant="outline" className="gap-2" data-testid="link-faq">
                  View FAQ <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>

        <footer className="border-t border-border/40 py-8 px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ConsentEase. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
