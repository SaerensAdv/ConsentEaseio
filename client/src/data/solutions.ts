export interface PlatformSolution {
  slug: string;
  name: string;
  icon: string;
  headline: string;
  description: string;
  setupSteps: string[];
  specificBenefits: string[];
  faqItems: { q: string; a: string }[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface CountrySolution {
  slug: string;
  country: string;
  flag: string;
  regulation: string;
  headline: string;
  description: string;
  requirements: string[];
  penalties: string;
  faqItems: { q: string; a: string }[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const PLATFORMS: PlatformSolution[] = [
  {
    slug: "wordpress",
    name: "WordPress",
    icon: "wordpress",
    headline: "GDPR Cookie Consent Banner for WordPress",
    description: "Add a fully compliant GDPR/CCPA cookie consent banner to your WordPress site in under 2 minutes. No plugin conflicts, no bloated code — just paste one script tag into your theme header and you're live. ConsentEase automatically detects all cookies and tracking scripts on your WordPress site, including those added by plugins like WooCommerce, Yoast SEO, Contact Form 7, and Google Analytics.",
    setupSteps: [
      "Go to Appearance → Theme File Editor (or use a header/footer plugin like Insert Headers and Footers)",
      "Paste the ConsentEase script tag in your <head> section",
      "Save — your cookie banner is now live and scanning cookies automatically",
    ],
    specificBenefits: [
      "Works with any WordPress theme (Astra, Divi, Elementor, GeneratePress, etc.)",
      "Auto-detects cookies from WooCommerce, Yoast, Contact Form 7, Jetpack, and 50+ plugins",
      "Integrates with WordPress Consent API for plugin compatibility",
      "No plugin installation needed — avoids plugin conflicts and performance issues",
      "Lighter than Cookiebot, Complianz, or GDPR Cookie Consent plugins (single script tag vs. full plugin)",
    ],
    faqItems: [
      { q: "Do I need to install a WordPress plugin?", a: "No. ConsentEase works with a single script tag in your header. This is actually better than plugins because it avoids conflicts, doesn't slow down your admin panel, and works regardless of caching plugins." },
      { q: "Does it work with WooCommerce?", a: "Yes. ConsentEase automatically detects and categorizes WooCommerce cookies (cart, session, login tokens) as 'Necessary' and any tracking cookies as 'Analytics' or 'Marketing'." },
      { q: "What about caching plugins like WP Rocket or W3 Total Cache?", a: "ConsentEase works perfectly with all caching plugins. The banner script loads asynchronously and doesn't interfere with page caching." },
      { q: "Is it cheaper than Cookiebot or Complianz?", a: "Yes. ConsentEase starts at €3/month vs Cookiebot's €7+/month (which gets expensive based on subpages). Complianz is 'free' but requires manual setup and lacks auto-scanning." },
    ],
    seo: {
      title: "Cookie Consent Banner for WordPress — GDPR Compliant in 2 Minutes | ConsentEase",
      description: "Add a GDPR/CCPA cookie consent banner to WordPress without plugins. Auto-detects cookies from WooCommerce, Yoast & 50+ plugins. From €3/month. 2-minute setup.",
      keywords: ["WordPress cookie consent", "WordPress GDPR plugin", "WordPress cookie banner", "WooCommerce cookie consent", "WordPress GDPR compliance", "cookie consent WordPress"],
    },
  },
  {
    slug: "shopify",
    name: "Shopify",
    icon: "shopify",
    headline: "GDPR Cookie Consent Banner for Shopify",
    description: "Make your Shopify store GDPR and CCPA compliant in 2 minutes. ConsentEase integrates directly with Shopify's Customer Privacy API, ensuring cookies are properly blocked until consent is given. No app installation fees, no theme modifications — just paste one script tag and your store is compliant.",
    setupSteps: [
      "In your Shopify admin, go to Online Store → Themes → Edit Code",
      "Open theme.liquid and paste the ConsentEase script tag before the closing </head> tag",
      "Save — your cookie banner is now live with Shopify Privacy API integration",
    ],
    specificBenefits: [
      "Native Shopify Customer Privacy API integration (loadFeatures + consent signals)",
      "Auto-detects Shopify analytics, Facebook Pixel, Google Analytics, Klaviyo, and other app cookies",
      "Works with all Shopify themes (Dawn, Debut, Brooklyn, custom themes)",
      "No monthly Shopify app fees — just your ConsentEase plan",
      "Google Consent Mode v2 compatible for Shopify stores running Google Ads",
    ],
    faqItems: [
      { q: "Does it work with Shopify's Customer Privacy API?", a: "Yes. ConsentEase automatically integrates with Shopify's privacy API, sending proper consent signals so tracking scripts respect visitor choices." },
      { q: "Will it detect cookies from Shopify apps?", a: "Yes. Our scanner detects cookies from Klaviyo, Omnisend, Facebook Pixel, Google Analytics, Hotjar, and 100+ other common Shopify apps." },
      { q: "Do I need a Shopify app?", a: "No. ConsentEase works as a simple script tag, which is faster, cheaper, and more reliable than Shopify apps that can conflict with your theme." },
      { q: "Is it compatible with Shopify Markets (multi-currency/region)?", a: "Yes. ConsentEase auto-detects visitor location and shows the appropriate consent options for their jurisdiction (EU for GDPR, California for CCPA, etc.)." },
    ],
    seo: {
      title: "Cookie Consent Banner for Shopify — GDPR Compliant in 2 Minutes | ConsentEase",
      description: "Add GDPR/CCPA cookie consent to your Shopify store. Native Customer Privacy API integration. Detects cookies from Klaviyo, Facebook Pixel & more. From €3/month.",
      keywords: ["Shopify cookie consent", "Shopify GDPR", "Shopify cookie banner", "Shopify privacy", "Shopify GDPR compliance", "cookie consent Shopify store"],
    },
  },
  {
    slug: "wix",
    name: "Wix",
    icon: "wix",
    headline: "GDPR Cookie Consent Banner for Wix",
    description: "Add a fully compliant GDPR/CCPA cookie consent banner to your Wix website. ConsentEase integrates with Wix's Consent Policy API, automatically managing cookie consent across your Wix site. Simple setup through Wix's custom code feature — no coding skills required.",
    setupSteps: [
      "In your Wix dashboard, go to Settings → Custom Code (or use Wix Editor → Add → Embed Code)",
      "Paste the ConsentEase script tag and set it to load in the Head",
      "Publish your site — your cookie banner is now live",
    ],
    specificBenefits: [
      "Integrates with Wix Consent Policy API for native consent management",
      "Auto-detects cookies from Wix Analytics, Wix Chat, and third-party integrations",
      "Works with Wix Editor, Wix Studio (formerly Editor X), and Wix ADI sites",
      "Replaces Wix's built-in cookie banner with a more customizable, compliant alternative",
      "No Wix premium plan required for the integration — works on all Wix plans",
    ],
    faqItems: [
      { q: "Is ConsentEase better than Wix's built-in cookie banner?", a: "Yes. Wix's built-in banner is basic and lacks features like auto-scanning, Google Consent Mode v2, and detailed consent logging. ConsentEase gives you full customization and compliance." },
      { q: "Does it work with Wix Studio?", a: "Yes. ConsentEase works with Wix Studio (formerly Editor X), standard Wix Editor, and Wix ADI sites." },
      { q: "Can I customize the banner design on Wix?", a: "Absolutely. Unlike Wix's limited built-in options, ConsentEase offers 25+ design customizations including colors, fonts, positions, animations, and button styles." },
    ],
    seo: {
      title: "Cookie Consent Banner for Wix — GDPR Compliant in 2 Minutes | ConsentEase",
      description: "Add a customizable GDPR/CCPA cookie consent banner to Wix. Better than Wix's built-in banner. Wix Consent Policy API integration. From €3/month.",
      keywords: ["Wix cookie consent", "Wix GDPR", "Wix cookie banner", "Wix privacy", "Wix GDPR compliance", "cookie banner Wix website"],
    },
  },
  {
    slug: "webflow",
    name: "Webflow",
    icon: "webflow",
    headline: "GDPR Cookie Consent Banner for Webflow",
    description: "Add a pixel-perfect GDPR/CCPA cookie consent banner to your Webflow site. ConsentEase respects your design standards — customize every detail to match your Webflow project's aesthetic. Simple setup through Webflow's Project Settings custom code.",
    setupSteps: [
      "In Webflow, go to Project Settings → Custom Code → Head Code",
      "Paste the ConsentEase script tag",
      "Publish your site — the banner is live on your published domain",
    ],
    specificBenefits: [
      "Designed for design-conscious Webflow users — 25+ customization options",
      "Auto-detects cookies from Webflow Analytics, Google Analytics, Hotjar, Hubspot, and other integrations",
      "Works with Webflow Hosting and custom domains",
      "No Webflow app or extension needed",
      "Respects Webflow's clean code approach — single lightweight script tag",
    ],
    faqItems: [
      { q: "Will it match my Webflow design?", a: "Yes. ConsentEase offers extensive design customization including colors, fonts, border radius, shadows, and animations. Your consent banner will look like a native part of your Webflow site." },
      { q: "Does it work with Webflow's staging and published sites?", a: "Yes. The banner works on both staging (webflow.io) and your published custom domain." },
    ],
    seo: {
      title: "Cookie Consent Banner for Webflow — GDPR Compliant in 2 Minutes | ConsentEase",
      description: "Add a design-perfect GDPR cookie consent banner to Webflow. 25+ customization options. Auto-detects cookies. From €3/month. No extensions needed.",
      keywords: ["Webflow cookie consent", "Webflow GDPR", "Webflow cookie banner", "Webflow privacy compliance", "cookie consent Webflow site"],
    },
  },
  {
    slug: "squarespace",
    name: "Squarespace",
    icon: "squarespace",
    headline: "GDPR Cookie Consent Banner for Squarespace",
    description: "Replace Squarespace's limited built-in cookie banner with a fully customizable, GDPR/CCPA compliant solution. ConsentEase gives you complete control over design, cookie categorization, and consent logging — all through a simple code injection.",
    setupSteps: [
      "In Squarespace, go to Settings → Developer Tools → Code Injection",
      "Paste the ConsentEase script tag in the Header section",
      "Save — your compliant cookie banner is now live",
    ],
    specificBenefits: [
      "Far more customizable than Squarespace's built-in cookie banner",
      "Auto-detects cookies from Squarespace Analytics, connected social accounts, and marketing integrations",
      "Works with all Squarespace templates and versions",
      "Proper GDPR compliance with granular consent categories (Squarespace's banner only offers accept/reject)",
      "Google Consent Mode v2 support for Squarespace sites running Google Ads",
    ],
    faqItems: [
      { q: "Is this better than Squarespace's built-in cookie banner?", a: "Yes. Squarespace's banner is very basic — it doesn't categorize cookies, doesn't support Google Consent Mode v2, and has limited customization. ConsentEase gives you full compliance and design control." },
      { q: "Do I need a Squarespace Business plan for code injection?", a: "Code injection is available on Business plan and higher. On Personal plans, you can add the script through a Code Block instead." },
    ],
    seo: {
      title: "Cookie Consent Banner for Squarespace — GDPR Compliant in 2 Minutes | ConsentEase",
      description: "Replace Squarespace's basic cookie banner with a fully compliant GDPR/CCPA solution. Auto-scanning, consent logging, Google Consent Mode v2. From €3/month.",
      keywords: ["Squarespace cookie consent", "Squarespace GDPR", "Squarespace cookie banner", "Squarespace privacy", "cookie consent Squarespace"],
    },
  },
  {
    slug: "nextjs",
    name: "Next.js",
    icon: "nextjs",
    headline: "GDPR Cookie Consent Banner for Next.js",
    description: "Add GDPR/CCPA cookie consent to your Next.js application with a single script tag. ConsentEase works with both Next.js App Router and Pages Router, handles SSR correctly, and integrates with Google Consent Mode v2 for Next.js sites using Google Analytics or Google Tag Manager.",
    setupSteps: [
      "Add the ConsentEase script tag to your _document.tsx (Pages Router) or layout.tsx (App Router) inside the <head>",
      "Or use next/script with strategy='afterInteractive' for optimal loading",
      "Deploy — your consent banner is live",
    ],
    specificBenefits: [
      "Works with both App Router and Pages Router",
      "SSR-compatible — no hydration issues",
      "Integrates with next/script for optimal loading performance",
      "Auto-detects cookies from Google Analytics, Vercel Analytics, Segment, and other common Next.js integrations",
      "TypeScript-friendly — window.ConsentEase API is fully typed",
    ],
    faqItems: [
      { q: "Does it work with Next.js App Router?", a: "Yes. Add the script to your root layout.tsx using next/script with strategy='afterInteractive'. It works perfectly with both App Router and Pages Router." },
      { q: "Will it cause hydration errors?", a: "No. ConsentEase loads as an external script and doesn't interfere with React's hydration process." },
      { q: "Can I conditionally load tracking scripts based on consent?", a: "Yes. ConsentEase exposes a JavaScript API (window.ConsentEase) that you can use to check consent status before loading any tracking scripts." },
    ],
    seo: {
      title: "Cookie Consent Banner for Next.js — GDPR Compliant | ConsentEase",
      description: "Add GDPR cookie consent to Next.js with one script tag. Works with App Router & Pages Router. SSR-compatible. Google Consent Mode v2. From €3/month.",
      keywords: ["Next.js cookie consent", "Next.js GDPR", "Next.js cookie banner", "React cookie consent", "Next.js privacy compliance"],
    },
  },
  {
    slug: "custom-html",
    name: "Custom HTML",
    icon: "code",
    headline: "GDPR Cookie Consent Banner for Any Website",
    description: "Add a fully compliant GDPR/CCPA cookie consent banner to any website with a single line of HTML. Whether you're using a custom CMS, static HTML, or a framework we don't specifically mention — ConsentEase works everywhere with a simple script tag.",
    setupSteps: [
      "Copy your unique ConsentEase script tag from the dashboard",
      "Paste it in the <head> section of your HTML (before the closing </head> tag)",
      "Load your page — the cookie banner is live",
    ],
    specificBenefits: [
      "Works on any website that supports HTML — no framework or CMS required",
      "Single script tag — no dependencies, no build steps",
      "Auto-detects all cookies and tracking scripts regardless of how they're loaded",
      "Lightweight (~15KB gzipped) — won't impact your Core Web Vitals",
      "JavaScript API for advanced integrations and custom consent handling",
    ],
    faqItems: [
      { q: "Does it work with any website?", a: "Yes. If your website can load a <script> tag, ConsentEase works. Static HTML, PHP, Ruby on Rails, Django, Laravel, ASP.NET — any technology." },
      { q: "How lightweight is the script?", a: "The ConsentEase banner script is approximately 15KB gzipped. It loads asynchronously and won't block your page rendering." },
    ],
    seo: {
      title: "Cookie Consent Banner for Any Website — GDPR Compliant in 2 Minutes | ConsentEase",
      description: "Add a GDPR/CCPA cookie consent banner to any website with one script tag. Works with any CMS or framework. Auto cookie scanning. From €3/month.",
      keywords: ["cookie consent banner", "GDPR cookie consent", "cookie consent script", "website cookie banner", "GDPR compliance", "cookie consent HTML"],
    },
  },
];

export const COUNTRIES: CountrySolution[] = [
  {
    slug: "belgium",
    country: "Belgium",
    flag: "🇧🇪",
    regulation: "GDPR + Belgian DPA (GBA/APD)",
    headline: "Cookie Compliance for Belgian Websites",
    description: "Belgian websites must comply with the GDPR and the Belgian Data Protection Authority (GBA/APD) guidelines. The GBA has been particularly active in enforcing cookie consent rules — issuing fines to major websites for non-compliant cookie banners. ConsentEase ensures your Belgian website meets all requirements from day one.",
    requirements: [
      "Prior consent required before placing non-essential cookies (GDPR Art. 6 + ePrivacy)",
      "Cookie banners must not use pre-ticked checkboxes or deceptive dark patterns",
      "Reject option must be as easy to access as the accept option (GBA enforcement)",
      "Detailed cookie policy listing all cookies, their purposes, and retention periods",
      "Consent records must be stored and accessible for audits",
      "Cookie walls (blocking content until consent) are not allowed under Belgian interpretation",
    ],
    penalties: "The Belgian DPA (GBA) can impose fines up to €20 million or 4% of annual global turnover under GDPR. In practice, Belgian fines for cookie violations have ranged from €15,000 to €250,000.",
    faqItems: [
      { q: "Is the Belgian DPA strict about cookie consent?", a: "Yes. The GBA/APD is one of Europe's more active regulators. They've fined companies for cookie walls, pre-ticked consent, and non-compliant banners. ConsentEase is designed to meet their standards." },
      { q: "Do I need a Dutch and French version of my cookie banner?", a: "If your website targets both Dutch and French-speaking Belgians, a multilingual banner is recommended. ConsentEase supports custom text so you can configure banners in any language." },
    ],
    seo: {
      title: "Cookie Consent for Belgian Websites — GDPR & GBA Compliant | ConsentEase",
      description: "Make your Belgian website cookie compliant. Meets GDPR and Belgian DPA (GBA/APD) requirements. Auto cookie scanning, consent logging. From €3/month.",
      keywords: ["cookie consent Belgium", "GDPR Belgium", "Belgian cookie banner", "GBA compliance", "APD cookie consent", "Belgian website GDPR"],
    },
  },
  {
    slug: "netherlands",
    country: "Netherlands",
    flag: "🇳🇱",
    regulation: "GDPR + Dutch Telecom Act (Telecommunicatiewet)",
    headline: "Cookie Compliance for Dutch Websites",
    description: "Dutch websites must comply with the GDPR and the Dutch Telecommunications Act (Telecommunicatiewet), enforced by the Autoriteit Persoonsgegevens (AP). The Netherlands was one of the first EU countries to implement strict cookie laws back in 2012. ConsentEase ensures your Dutch website meets all current requirements.",
    requirements: [
      "Prior informed consent required before placing tracking cookies (Art. 11.7a Telecommunicatiewet)",
      "Analytical cookies with minimal privacy impact can be placed without consent (if properly anonymized)",
      "Clear information about each cookie's purpose must be provided",
      "Consent must be freely given — no cookie walls",
      "Easy withdrawal of consent must be available at all times",
      "First-party analytics cookies with IP anonymization are exempt from consent requirement",
    ],
    penalties: "The Dutch AP can impose fines up to €20 million or 4% of annual global turnover. Dutch enforcement focuses on large platforms and repeat offenders.",
    faqItems: [
      { q: "Are analytics cookies allowed without consent in the Netherlands?", a: "Partially. First-party analytics with IP anonymization and no cross-site tracking can be used without consent. ConsentEase correctly categorizes these and only requires consent for tracking analytics like Google Analytics without anonymization." },
      { q: "What about the Dutch 'cookie wall' ban?", a: "Dutch law prohibits cookie walls (blocking content until consent). ConsentEase never blocks content — visitors can always dismiss the banner and browse freely." },
    ],
    seo: {
      title: "Cookie Consent for Dutch Websites — GDPR & Telecommunicatiewet Compliant | ConsentEase",
      description: "Make your Dutch website cookie compliant. Meets GDPR and Telecommunicatiewet requirements. Auto cookie scanning, consent logging. From €3/month.",
      keywords: ["cookie consent Netherlands", "GDPR Netherlands", "Dutch cookie banner", "Telecommunicatiewet", "AP compliance", "Dutch website cookies"],
    },
  },
  {
    slug: "germany",
    country: "Germany",
    flag: "🇩🇪",
    regulation: "GDPR + TTDSG (Telekommunikation-Telemedien-Datenschutz-Gesetz)",
    headline: "Cookie Compliance for German Websites",
    description: "Germany has some of Europe's strictest data privacy traditions. The TTDSG (effective since December 2021) and GDPR together create comprehensive cookie consent requirements, enforced by 16 state-level data protection authorities and the Federal Commissioner (BfDI). ConsentEase ensures your German website meets all federal and state-level requirements.",
    requirements: [
      "Prior consent required for all non-essential cookies and similar technologies (§25 TTDSG)",
      "Consent must be informed, specific, and freely given",
      "Reject option must be equally prominent as accept (German DPA guidance)",
      "Detailed information about all cookies and their purposes",
      "Consent management must cover all tracking technologies including fingerprinting",
      "German courts have ruled that pre-selected checkboxes are invalid consent (Planet49 case)",
    ],
    penalties: "Fines up to €20 million or 4% of annual global turnover under GDPR. German DPAs have been among the most active enforcers in the EU, with combined fines exceeding €100 million across all authorities.",
    faqItems: [
      { q: "Which German DPA oversees my website?", a: "It depends on where your company is headquartered. Each of Germany's 16 states has its own DPA. ConsentEase ensures compliance with all German DPA requirements, regardless of state." },
      { q: "What is the TTDSG?", a: "The TTDSG (Telecommunications Telemedia Data Protection Act) is Germany's national implementation of the ePrivacy Directive. It specifically requires consent before accessing or storing information on a user's device (like cookies)." },
    ],
    seo: {
      title: "Cookie Consent for German Websites — GDPR & TTDSG Compliant | ConsentEase",
      description: "Make your German website cookie compliant. Meets GDPR and TTDSG requirements. Auto cookie scanning, consent logging. From €3/month.",
      keywords: ["cookie consent Germany", "GDPR Germany", "German cookie banner", "TTDSG compliance", "German cookie law", "Datenschutz cookie consent"],
    },
  },
  {
    slug: "france",
    country: "France",
    flag: "🇫🇷",
    regulation: "GDPR + Loi Informatique et Libertés + CNIL Guidelines",
    headline: "Cookie Compliance for French Websites",
    description: "France's CNIL (Commission Nationale de l'Informatique et des Libertés) is one of Europe's most influential data protection regulators. Their 2020 cookie guidelines set strict standards that many EU regulators have since followed. CNIL has issued record fines for cookie violations, including €150 million to Google and €60 million to Facebook. ConsentEase ensures full compliance with CNIL requirements.",
    requirements: [
      "Prior consent required before placing any non-essential cookies",
      "Reject option must be available on the first layer of the cookie banner (CNIL requirement since 2021)",
      "Consent must be refreshed every 6 months (CNIL recommendation, though 13 months max for cookie lifespan)",
      "Users must be able to withdraw consent as easily as they gave it",
      "Cookie banner must not use deceptive design patterns (dark patterns)",
      "Legitimate interest cannot be used as a legal basis for cookies in most cases",
    ],
    penalties: "CNIL can impose fines up to €20 million or 4% of global turnover. CNIL has issued some of Europe's largest cookie-specific fines: €150M to Google (2022), €60M to Facebook (2022), €40M to Criteo (2023).",
    faqItems: [
      { q: "Why is CNIL considered strict?", a: "CNIL has issued Europe's largest cookie consent fines and was the first regulator to require a first-layer reject button. They actively monitor major websites for compliance. ConsentEase meets all CNIL requirements by default." },
      { q: "Does ConsentEase support French language banners?", a: "Yes. You can fully customize all banner text in French. ConsentEase supports custom text in any language." },
    ],
    seo: {
      title: "Cookie Consent for French Websites — GDPR & CNIL Compliant | ConsentEase",
      description: "Make your French website cookie compliant. Meets GDPR and CNIL requirements including first-layer reject button. Auto scanning. From €3/month.",
      keywords: ["cookie consent France", "GDPR France", "CNIL cookie consent", "French cookie banner", "CNIL compliance", "French website GDPR"],
    },
  },
  {
    slug: "united-kingdom",
    country: "United Kingdom",
    flag: "🇬🇧",
    regulation: "UK GDPR + PECR (Privacy and Electronic Communications Regulations)",
    headline: "Cookie Compliance for UK Websites",
    description: "Post-Brexit, the UK has its own version of the GDPR (UK GDPR) alongside the PECR, enforced by the ICO (Information Commissioner's Office). The ICO has taken a pragmatic approach to cookie enforcement, but non-compliance still carries significant risks. ConsentEase ensures your UK website meets both UK GDPR and PECR requirements.",
    requirements: [
      "Prior consent required for non-essential cookies under PECR Regulation 6",
      "Strictly necessary cookies are exempt from consent",
      "Clear, comprehensive information about cookies must be provided",
      "Consent must be freely given, specific, and informed",
      "Analytics cookies require consent (ICO position — no 'legitimate interest' exemption)",
      "ICO guidance requires 'clear and positive' consent — not inferred from continued browsing",
    ],
    penalties: "The ICO can impose fines up to £17.5 million or 4% of annual global turnover under UK GDPR. PECR violations carry fines up to £500,000.",
    faqItems: [
      { q: "Does UK GDPR differ from EU GDPR for cookies?", a: "The cookie consent requirements are essentially the same. UK GDPR + PECR mirror EU GDPR + ePrivacy Directive. ConsentEase automatically detects UK visitors and shows appropriate consent options." },
      { q: "Does the ICO enforce cookie rules?", a: "Yes, though they've taken a more guidance-focused approach than some EU regulators. However, the ICO has explicitly stated that analytics cookies require consent and 'implied consent' is not valid." },
    ],
    seo: {
      title: "Cookie Consent for UK Websites — UK GDPR & PECR Compliant | ConsentEase",
      description: "Make your UK website cookie compliant. Meets UK GDPR and PECR requirements. ICO-compliant consent logging. Auto scanning. From €3/month.",
      keywords: ["cookie consent UK", "UK GDPR", "PECR compliance", "UK cookie banner", "ICO cookie consent", "UK website privacy"],
    },
  },
  {
    slug: "spain",
    country: "Spain",
    flag: "🇪🇸",
    regulation: "GDPR + LOPDGDD + LSSI-CE",
    headline: "Cookie Compliance for Spanish Websites",
    description: "Spanish websites must comply with the GDPR, Spain's Organic Law on Data Protection (LOPDGDD), and the LSSI-CE (Information Society Services Act), enforced by the AEPD. The AEPD published updated cookie guidelines in 2023, tightening requirements around cookie walls and consent mechanisms. ConsentEase ensures your Spanish website meets all current AEPD requirements.",
    requirements: [
      "Prior informed consent required before placing non-essential cookies",
      "Second-layer granular options must be available (cookie categories)",
      "Cookie walls are prohibited — users must be able to reject all cookies",
      "Continued browsing does not constitute valid consent (AEPD position since 2020)",
      "Cookie policy must be easily accessible and updated",
      "Consent records must be maintained for accountability",
    ],
    penalties: "The AEPD can impose fines up to €20 million or 4% of annual global turnover under GDPR. Spain has been one of the most active EU member states in issuing GDPR fines.",
    faqItems: [
      { q: "Does 'continued browsing' count as consent in Spain?", a: "No. The AEPD explicitly stated in 2020 that continued browsing is not valid consent. ConsentEase requires an explicit action (click or toggle) to register consent." },
      { q: "Do I need a Spanish-language cookie banner?", a: "If your website targets Spanish visitors, a Spanish-language banner is strongly recommended. ConsentEase supports fully customizable text in any language." },
    ],
    seo: {
      title: "Cookie Consent for Spanish Websites — GDPR & AEPD Compliant | ConsentEase",
      description: "Make your Spanish website cookie compliant. Meets GDPR, LOPDGDD, and AEPD requirements. Auto cookie scanning, consent logging. From €3/month.",
      keywords: ["cookie consent Spain", "GDPR Spain", "AEPD cookie consent", "Spanish cookie banner", "LSSI-CE compliance", "Spanish website GDPR"],
    },
  },
  {
    slug: "italy",
    country: "Italy",
    flag: "🇮🇹",
    regulation: "GDPR + Italian Cookie Guidelines (Garante 2021)",
    headline: "Cookie Compliance for Italian Websites",
    description: "Italy's data protection authority (Garante per la protezione dei dati personali) issued comprehensive cookie guidelines in June 2021, setting some of the EU's most detailed requirements for cookie banners. The Garante specifically regulates scroll-through consent, cookie wall practices, and banner design. ConsentEase meets all Garante requirements.",
    requirements: [
      "Prior consent required for profiling and non-technical cookies",
      "First banner layer must include a reject-all button (Garante 2021 guidelines)",
      "Scrolling does NOT constitute valid consent (Garante explicit ruling)",
      "Cookie banners must re-appear every 6 months for renewed consent",
      "Technical/analytical cookies with anonymized IP can be exempt from consent",
      "Must provide an 'X' close button that equals rejection (Garante specific requirement)",
    ],
    penalties: "The Garante can impose fines up to €20 million or 4% of annual global turnover. Italy has consistently been among the top EU countries for GDPR enforcement actions.",
    faqItems: [
      { q: "What makes Italian cookie rules unique?", a: "The Garante's 2021 guidelines are very specific about banner design: they require a reject-all button on the first layer, mandate that closing the banner (X button) equals rejection, and ban scroll-as-consent. ConsentEase is designed to meet all these requirements." },
      { q: "Are analytics cookies exempt in Italy?", a: "First-party analytics with anonymized IP addresses are generally exempt from consent. Third-party analytics like standard Google Analytics still require consent." },
    ],
    seo: {
      title: "Cookie Consent for Italian Websites — GDPR & Garante Compliant | ConsentEase",
      description: "Make your Italian website cookie compliant. Meets GDPR and Garante 2021 guidelines. First-layer reject button, auto scanning. From €3/month.",
      keywords: ["cookie consent Italy", "GDPR Italy", "Garante cookie guidelines", "Italian cookie banner", "Italian website GDPR", "cookie consent Italia"],
    },
  },
  {
    slug: "austria",
    country: "Austria",
    flag: "🇦🇹",
    regulation: "GDPR + Austrian TKG 2021 (Telekommunikationsgesetz)",
    headline: "Cookie Compliance for Austrian Websites",
    description: "Austrian websites must comply with the GDPR and the TKG 2021 (Telecommunications Act), enforced by the Austrian DSB (Datenschutzbehörde). Austria shares many compliance patterns with Germany but has its own regulatory nuances. ConsentEase ensures your Austrian website meets all current requirements.",
    requirements: [
      "Prior consent required for non-essential cookies (§165 TKG 2021)",
      "Consent must be informed, specific, and freely given",
      "Reject option must be easily accessible",
      "Cookie information must be clear and in understandable language",
      "Consent records must be stored for accountability",
    ],
    penalties: "The Austrian DSB can impose fines up to €20 million or 4% of annual global turnover under GDPR.",
    faqItems: [
      { q: "Is the Austrian DSB strict about cookies?", a: "The Austrian DSB has been active in GDPR enforcement, particularly around Google Analytics (the 'Schrems II' decisions). ConsentEase helps you stay compliant with Austrian requirements." },
    ],
    seo: {
      title: "Cookie Consent for Austrian Websites — GDPR & TKG Compliant | ConsentEase",
      description: "Make your Austrian website cookie compliant. Meets GDPR and TKG 2021 requirements. Auto cookie scanning, consent logging. From €3/month.",
      keywords: ["cookie consent Austria", "GDPR Austria", "Austrian cookie banner", "DSB compliance", "TKG 2021 cookies", "Austrian website GDPR"],
    },
  },
];

export function getPlatformBySlug(slug: string): PlatformSolution | undefined {
  return PLATFORMS.find(p => p.slug === slug);
}

export function getCountryBySlug(slug: string): CountrySolution | undefined {
  return COUNTRIES.find(c => c.slug === slug);
}
