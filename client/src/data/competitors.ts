export interface CompetitorFeature {
  feature: string;
  us: string;
  them: string;
}

export interface PricingTier {
  name: string;
  price: string;
  details?: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
}

export interface CompetitorData {
  slug: string;
  name: string;
  logo?: string;
  tagline: string;
  tldr: string;
  description: string;
  targetAudience: string;
  trialLength: string;
  pricingTiers: PricingTier[];
  supportedAAPs?: string[];
  features: CompetitorFeature[];
  chooseThemIf: string[];
  chooseUsIf: string[];
  seo: SEOData;
}

export const COMPETITORS: CompetitorData[] = [
  {
    slug: "onetrust",
    name: "OneTrust",
    tagline: "Enterprise Privacy Management",
    tldr: "OneTrust is built for large enterprises with dedicated compliance teams and complex multi-jurisdiction needs. ConsentEase gives small and mid-sized businesses the same core compliance — GDPR, CCPA, Consent Mode v2 — for a fraction of the cost and without a weeks-long implementation.",
    description: "OneTrust is the market leader for enterprise privacy management, trusted by Fortune 500 companies worldwide. It covers everything from data mapping to vendor risk, but that scope comes with enterprise pricing ($30,000+/year) and a setup that requires technical consultants. If you're a small business that needs a compliant cookie banner rather than a full privacy programme, ConsentEase delivers GDPR and CCPA compliance in 2 minutes — not 2 weeks.",
    targetAudience: "For Compliance Officers",
    trialLength: "Demo only",
    pricingTiers: [
      { name: "Enterprise", price: "Custom", details: "Starting ~$30,000/year" },
    ],
    features: [
      { feature: "Setup Time", us: "2 minutes (Auto-scan)", them: "2-4 weeks (Manual config)" },
      { feature: "Pricing Model", us: "Flat monthly fee (€3-129/mo)", them: "Custom quote (~$30k/yr)" },
      { feature: "Cookie Scanning", us: "Automatic & Weekly", them: "Manual Trigger" },
      { feature: "Banner Design", us: "Visual Editor", them: "CSS/Developer Required" },
      { feature: "Google Consent Mode v2", us: "Included (One-click)", them: "Paid Add-on / Complex Setup" },
      { feature: "Support", us: "Direct Chat", them: "Dedicated Account Manager" },
      { feature: "Self-Service Setup", us: "Yes — no onboarding call needed", them: "Requires onboarding project" },
    ],
    chooseThemIf: [
      "You're a Fortune 500 company with a dedicated privacy team.",
      "You need data mapping, vendor risk management, and DSARs beyond cookie consent.",
      "You operate in 50+ jurisdictions and need bespoke legal frameworks for each.",
    ],
    chooseUsIf: [
      "You want to be GDPR-compliant by lunchtime — not in 2 weeks.",
      "You want transparent pricing you can see before a sales call.",
      "You need cookie consent and Google Consent Mode v2, not a full privacy programme.",
    ],
    seo: {
      title: "ConsentEase vs OneTrust: Affordable GDPR Alternative (2026)",
      description: "Compare ConsentEase to OneTrust. Get GDPR compliance from €3/month instead of $30,000/year. 2-minute setup vs 2-week implementation. Perfect for small businesses.",
      keywords: ["OneTrust alternative", "OneTrust pricing", "GDPR consent management", "cookie consent", "affordable OneTrust", "OneTrust vs ConsentEase"],
    },
  },
  {
    slug: "cookiebot",
    name: "Cookiebot",
    logo: "/logos/cookiebot.webp",
    tagline: "Cookie Consent Solution",
    tldr: "ConsentEase starts at €3/month (Starter) while Cookiebot's paid plans begin at €7/month — but the bigger difference is how they price. Cookiebot counts subpages, so a 200-page site jumps to €15+/month. ConsentEase counts pageviews, which is more predictable for growing websites.",
    description: "Cookiebot (by Usercentrics) is one of the most recognised cookie consent tools globally, with strong multi-language support and detailed compliance reports. Their pricing is based on how many subpages your site has, which can become expensive as your content grows. ConsentEase uses pageview-based pricing instead — more predictable if you're publishing new pages regularly — and offers a visual banner editor for faster customisation without writing CSS.",
    targetAudience: "For Website Owners",
    trialLength: "14 days",
    pricingTiers: [
      { name: "Free", price: "€0", details: "1 domain, under 50 subpages" },
      { name: "Premium Lite", price: "€7/month", details: "1 domain, up to 50 subpages" },
      { name: "Premium Small", price: "€15/month", details: "4+ domains" },
      { name: "Premium Medium", price: "€30/month", details: "More domains & features" },
      { name: "Premium Large", price: "€50/month", details: "Enterprise features" },
      { name: "Premium Extra Large", price: "€90/month", details: "Maximum scale" },
    ],
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "15-30 minutes" },
      { feature: "Entry Pricing", us: "From €3/month (10K views)", them: "€7/month (50 subpages)" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Template-based" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "Pricing Model", us: "By pageviews (grows with traffic)", them: "By subpages (grows with content)" },
      { feature: "Multi-Language", us: "8 languages (auto-detect)", them: "40+ languages" },
    ],
    chooseThemIf: [
      "You need consent banners in 40+ languages for a truly global audience.",
      "You want detailed, exportable compliance reports for legal teams.",
      "You have a small site (under 50 pages) and want the free tier.",
    ],
    chooseUsIf: [
      "You publish new content regularly and don't want your bill to rise with each page.",
      "You want a drag-and-drop visual editor to design your banner without CSS.",
      "You want the fastest possible setup — paste one script and you're done.",
    ],
    seo: {
      title: "ConsentEase vs Cookiebot: Better Value Cookie Consent (2026)",
      description: "Compare ConsentEase to Cookiebot. Starting at €3/month with pageview-based pricing. Visual banner editor, automatic scanning, Google Consent Mode v2.",
      keywords: ["Cookiebot alternative", "Cookiebot pricing", "cookie consent solution", "GDPR banner", "Cookiebot vs ConsentEase", "cookie compliance"],
    },
  },
  {
    slug: "usercentrics",
    name: "Usercentrics",
    logo: "/logos/usercentrics.webp",
    tagline: "Consent Management Platform",
    tldr: "Usercentrics charges per session — meaning a single visitor browsing 5 pages counts as 1 session. Their €7/month tier gives you only 1,500 sessions. ConsentEase starts at €3/month with 10,000 pageviews, and the €7/month Solo plan includes 25,000 pageviews. For most small businesses, that's a significant difference.",
    description: "Usercentrics is a German-based consent management platform that's well-respected in the enterprise market. They offer A/B testing for consent rates and mobile app SDK support, making them a strong choice for large marketing teams. However, their session-based pricing can get expensive fast — a site with 10,000 monthly visitors already needs the €30/month Pro tier. ConsentEase uses pageview-based pricing that's more generous at every tier, and the setup takes minutes instead of an hour.",
    targetAudience: "For Marketing Teams",
    trialLength: "14 days",
    pricingTiers: [
      { name: "Free", price: "€0", details: "<1,000 sessions, 1 domain" },
      { name: "Essential", price: "€7/month", details: "Up to 1,500 sessions" },
      { name: "Plus", price: "€15/month", details: "Up to 3,000 sessions" },
      { name: "Pro", price: "€30/month", details: "Up to 15,000 sessions" },
      { name: "Business", price: "€50-750/month", details: "50K-1M sessions" },
      { name: "Corporate", price: "Custom", details: "On demand" },
    ],
    supportedAAPs: ["Adjust", "AppsFlyer", "Singular"],
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "30-60 minutes" },
      { feature: "Entry Pricing", us: "From €3/month (10K views)", them: "€7/month (1.5K sessions)" },
      { feature: "Pricing Model", us: "Pageviews", them: "Sessions (more expensive)" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "A/B Testing", us: "Coming Soon", them: "Included" },
      { feature: "Mobile App SDKs", us: "Web only", them: "iOS, Android, React Native" },
    ],
    chooseThemIf: [
      "You need A/B testing to optimise consent rates across millions of visitors.",
      "You have a mobile app and need native SDK support for iOS and Android.",
      "You have a dedicated privacy team that can handle the longer setup.",
    ],
    chooseUsIf: [
      "Session pricing would cost you 5-10x more than pageview pricing for your traffic.",
      "You want to be up and running in minutes, not an hour.",
      "You need consent for your website only (not a mobile app).",
    ],
    seo: {
      title: "ConsentEase vs Usercentrics: Simpler Consent Management (2026)",
      description: "Compare ConsentEase to Usercentrics. Pageview pricing vs session pricing. Starting from €3/month. No complex setup. Google Consent Mode v2 included.",
      keywords: ["Usercentrics alternative", "Usercentrics pricing", "consent management platform", "CMP comparison", "Usercentrics vs ConsentEase"],
    },
  },
  {
    slug: "complianz",
    name: "Complianz",
    logo: "/logos/complianz.webp",
    tagline: "WordPress Privacy Plugin",
    tldr: "Complianz is cheaper per year (€59) but only works on WordPress. If all your sites are on WordPress, it's solid. If you also run a Shopify store, a Wix landing page, or a custom-built site, you'll need ConsentEase's platform-agnostic approach.",
    description: "Complianz is a popular WordPress plugin that handles cookie consent, privacy policy generation, and GDPR compliance — all within the WordPress dashboard. At €59/year for a single site, it's affordable for WordPress-only businesses. The trade-off is that it's locked to WordPress: if you ever move to a different platform or add a non-WordPress property, you'll need a second tool. ConsentEase works on any website platform and offers monthly pricing with flexibility to scale.",
    targetAudience: "For WordPress Users",
    trialLength: "N/A (Yearly plans)",
    pricingTiers: [
      { name: "Personal", price: "€59/year", details: "1 website" },
      { name: "Professional", price: "€159/year", details: "5 websites" },
      { name: "Agencies", price: "€359/year", details: "25 websites" },
    ],
    features: [
      { feature: "Platform", us: "Any Website", them: "WordPress Only" },
      { feature: "Setup Time", us: "2 minutes", them: "20-40 minutes (wizard)" },
      { feature: "Pricing", us: "From €3/month (€30/year)", them: "€59/year (1 site)" },
      { feature: "Multi-site Pricing", us: "€19/mo Pro (5 sites)", them: "€159/year for 5 sites" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included (Premium)" },
      { feature: "Privacy Policy Generator", us: "Coming Q2 2026", them: "Included" },
    ],
    chooseThemIf: [
      "All your websites are on WordPress and will stay on WordPress.",
      "You prefer managing everything from within the WordPress dashboard.",
      "You want a lower annual cost for a single WordPress site.",
    ],
    chooseUsIf: [
      "You have or plan to have websites on different platforms (Shopify, Wix, custom).",
      "You want one dashboard that manages consent across all your properties.",
      "You prefer monthly payments so you can cancel anytime.",
    ],
    seo: {
      title: "ConsentEase vs Complianz: Platform-Agnostic Alternative (2026)",
      description: "Compare ConsentEase to Complianz. Works on any website, not just WordPress. Monthly pricing from €3. Visual editor, automatic cookie scanning included.",
      keywords: ["Complianz alternative", "Complianz pricing", "WordPress cookie consent", "GDPR plugin", "Complianz vs ConsentEase"],
    },
  },
  {
    slug: "iubenda",
    name: "Iubenda",
    logo: "/logos/iubenda.webp",
    tagline: "Legal Compliance Suite",
    tldr: "Iubenda is a full legal suite — privacy policies, terms, and cookie banners in one package. If you need legal document generation today, it's a strong choice. If you already have legal docs and just need a great cookie banner, ConsentEase is more focused and better value at the Pro tier.",
    description: "Iubenda stands out by offering a complete legal compliance toolkit: privacy policy generator, terms of service generator, cookie banner, and consent management — all in one platform. They also support 7 mobile attribution partners for app developers. The trade-off is complexity: the setup wizard takes longer, and you're paying for features you may not need if you already have a lawyer or use a separate terms generator. ConsentEase focuses specifically on cookie consent and does it well — with a faster setup and better value at the Pro tier (€19 vs €19.99).",
    targetAudience: "For Legal Compliance",
    trialLength: "90 days",
    pricingTiers: [
      { name: "Free", price: "€0", details: "Up to 5,000 pageviews/month" },
      { name: "Essentials", price: "€4.99/month", details: "Basic features" },
      { name: "Advanced", price: "€19.99/month", details: "Full features" },
      { name: "Ultimate", price: "€79.99/month", details: "All features + priority" },
      { name: "Enterprise", price: "Custom", details: "On demand" },
    ],
    supportedAAPs: ["Adjust", "Airbridge", "AppsFlyer", "Branch", "Kochava", "Singular", "Tenjin"],
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "15-30 minutes" },
      { feature: "Entry Pricing", us: "From €3/month (Starter)", them: "€4.99/month" },
      { feature: "Full Features", us: "€19/month (Pro)", them: "€19.99/month (Advanced)" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Privacy Policy Generator", us: "Coming Q2 2026", them: "Included" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "Mobile App SDKs", us: "Web only", them: "7 attribution partners" },
    ],
    chooseThemIf: [
      "You need a privacy policy and terms of service generated for you.",
      "You want cookie consent + legal documents in a single subscription.",
      "You develop mobile apps and need attribution partner support.",
    ],
    chooseUsIf: [
      "You already have legal documents and just need a great cookie banner.",
      "You want faster setup and a more intuitive visual editor.",
      "You want better value at the Pro/full-feature tier (€19 vs €19.99).",
    ],
    seo: {
      title: "ConsentEase vs Iubenda: Focused Cookie Consent (2026)",
      description: "Compare ConsentEase to Iubenda. Better Pro tier value at €19 vs €19.99. Focused on cookie consent with visual editor. Google Consent Mode v2 included.",
      keywords: ["Iubenda alternative", "Iubenda pricing", "cookie consent banner", "GDPR compliance", "Iubenda vs ConsentEase"],
    },
  },
  {
    slug: "cookiefirst",
    name: "CookieFirst",
    logo: "/logos/cookiefirst.webp",
    tagline: "Cookie Consent Management",
    tldr: "CookieFirst and ConsentEase are very similar products for similar audiences. The key differences: ConsentEase starts at €3/month (67% cheaper than CookieFirst's €9 entry) and offers a visual drag-and-drop editor instead of pre-built templates.",
    description: "CookieFirst is a Dutch cookie consent platform aimed at small and medium businesses. It's straightforward, reliable, and does the basics well. Where ConsentEase pulls ahead is on price — starting at €3/month (Starter) vs CookieFirst's €9/month entry level — and customisation. CookieFirst uses template-based banner designs, while ConsentEase offers a visual editor that lets you match your banner exactly to your brand without writing code.",
    targetAudience: "For Small Businesses",
    trialLength: "14 days",
    pricingTiers: [
      { name: "Basic", price: "€9/month", details: "Or €99/year" },
      { name: "Plus", price: "€19/month", details: "Or €209/year" },
      { name: "Custom", price: "Custom", details: "Multiple domains, 300k+ pageviews" },
    ],
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "10-20 minutes" },
      { feature: "Entry Pricing", us: "From €3/month (Starter)", them: "€9/month" },
      { feature: "Yearly Savings", us: "€30/year (Starter)", them: "€99/year (Basic)" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Template-based" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
    ],
    chooseThemIf: [
      "You prefer a no-frills tool and don't need deep banner customisation.",
      "You value their specific compliance certifications.",
      "You're already using CookieFirst and happy with it.",
    ],
    chooseUsIf: [
      "You want to save 67% at entry level (€3 vs €9/month).",
      "You want a visual editor to design your banner without templates.",
      "You want 2-minute setup instead of 10-20 minutes.",
    ],
    seo: {
      title: "ConsentEase vs CookieFirst: 67% Cheaper Cookie Consent (2026)",
      description: "Compare ConsentEase to CookieFirst. Starting from €3/month vs €9/month. Visual banner editor, automatic scanning, Google Consent Mode v2 included.",
      keywords: ["CookieFirst alternative", "CookieFirst pricing", "cookie consent management", "GDPR banner", "CookieFirst vs ConsentEase"],
    },
  },
  {
    slug: "cookie-script",
    name: "Cookie Script",
    logo: "/logos/cookie-script.webp",
    tagline: "Easy Cookie Compliance",
    tldr: "Cookie Script has a generous free tier (10 pages, 20K views) that's great for testing. Once you need a paid plan, ConsentEase offers better value starting at €3/month vs €8/month, with a more polished visual banner editor.",
    description: "Cookie Script is a budget-friendly cookie consent tool with one of the more generous free tiers on the market — 10 pages and 20,000 monthly views at no cost. It's a good starting point for very small sites. When you outgrow the free tier, their paid plans start at €8/month. ConsentEase starts at €3/month (Starter) with a more modern visual editor and a cleaner banner design out of the box. If polish and brand consistency matter to you, ConsentEase is the better fit.",
    targetAudience: "For Website Owners",
    trialLength: "14 days",
    pricingTiers: [
      { name: "Free", price: "€0", details: "10 pages, 20K monthly views" },
      { name: "Lite", price: "€8/month", details: "More pages & views" },
      { name: "Standard", price: "€15/month", details: "Standard features" },
      { name: "Plus", price: "€19/month", details: "Advanced features" },
      { name: "Agencies", price: "Custom", details: "Custom pricing" },
    ],
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "5-15 minutes" },
      { feature: "Entry Pricing", us: "From €3/month (Starter)", them: "€8/month" },
      { feature: "Free Tier", us: "7-day trial", them: "10 pages, 20K views" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Basic Editor" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
    ],
    chooseThemIf: [
      "You need a permanent free tier and your site is under 10 pages.",
      "You want the absolute lowest-cost option for basic compliance.",
      "You don't need advanced banner customisation.",
    ],
    chooseUsIf: [
      "You want a banner that looks professional and matches your brand.",
      "You want a modern visual editor with real-time preview.",
      "You want 63% savings on paid plans (€3 vs €8/month).",
    ],
    seo: {
      title: "ConsentEase vs Cookie Script: Better Design & Value (2026)",
      description: "Compare ConsentEase to Cookie Script. Starting from €3/month vs €8/month. Modern visual editor, polished banner designs, Google Consent Mode v2.",
      keywords: ["Cookie Script alternative", "Cookie Script pricing", "cookie compliance", "GDPR consent", "Cookie Script vs ConsentEase"],
    },
  },
  {
    slug: "cookieyes",
    name: "CookieYes",
    logo: "/logos/cookieyes.webp",
    tagline: "GDPR Cookie Consent",
    tldr: "CookieYes is popular and has a free tier, but their Pro tier costs €23/month while ConsentEase Pro is €19/month — that's 17% savings for the same core features. Both include Google Consent Mode v2.",
    description: "CookieYes is one of the most popular GDPR cookie consent solutions, with over 1 million websites using their service. They offer a permanent free tier for sites under 15,000 monthly views, which is generous. Where costs diverge is at the Pro level: CookieYes charges €23/month while ConsentEase offers comparable features for €19/month. ConsentEase also provides a visual banner editor with more customisation freedom — you're not limited to pre-built templates.",
    targetAudience: "For Website Owners",
    trialLength: "14 days",
    pricingTiers: [
      { name: "Free", price: "€0", details: "15K views/month" },
      { name: "Basic", price: "€9/month", details: "More views" },
      { name: "Pro", price: "€23/month", details: "Pro features" },
      { name: "Ultimate", price: "€50/month", details: "All features" },
    ],
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "10-20 minutes" },
      { feature: "Entry Pricing", us: "From €3/month (Starter)", them: "€9/month" },
      { feature: "Free Tier", us: "7-day trial", them: "15K views/month" },
      { feature: "Pro Features", us: "€19/month", them: "€23/month" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "Banner Customisation", us: "Full visual editor", them: "Template-based" },
    ],
    chooseThemIf: [
      "You need a permanent free tier for a site with under 15K monthly views.",
      "You're already using CookieYes and don't want the hassle of switching.",
      "You prefer a well-known brand with a large user base.",
    ],
    chooseUsIf: [
      "You want Pro features for 17% less (€19 vs €23/month).",
      "You want full creative control over your banner design.",
      "You want the fastest setup — 2 minutes, paste one script, done.",
    ],
    seo: {
      title: "ConsentEase vs CookieYes: Save 17% on Pro Features (2026)",
      description: "Compare ConsentEase to CookieYes. Pro tier at €19 vs €23 (17% savings). Unlimited customization, visual editor, Google Consent Mode v2 included.",
      keywords: ["CookieYes alternative", "CookieYes pricing", "GDPR cookie consent", "cookie banner", "CookieYes vs ConsentEase"],
    },
  },
  {
    slug: "axeptio",
    name: "Axeptio",
    logo: "/logos/axeptio.webp",
    tagline: "Playful Cookie Consent",
    tldr: "Axeptio stands out with its playful, gamified consent experience. It's genuinely delightful — but at €26/month (vs ConsentEase's €3 Starter), you're paying nearly 9x more. If your brand calls for that personality, Axeptio is worth it. For everyone else, ConsentEase offers professional design at a fraction of the cost.",
    description: "Axeptio takes a unique approach to cookie consent: instead of the typical legal-looking banner, they offer playful, gamified interfaces that make consent almost enjoyable. Their UX is genuinely impressive and can increase consent rates through sheer novelty. The premium for that creativity is significant though — starting at €26/month compared to ConsentEase's €3/month Starter plan. If your brand identity thrives on personality and creativity (think lifestyle brands, creative agencies), Axeptio's playful approach could be worth the investment. For most businesses that want clean, professional compliance, ConsentEase delivers at nearly 9x less cost.",
    targetAudience: "For UX-focused Teams",
    trialLength: "Forever (limited)",
    pricingTiers: [
      { name: "Small", price: "€26/month", details: "Small sites" },
      { name: "Medium", price: "€62/month", details: "Medium sites" },
      { name: "Large", price: "€116/month", details: "Large sites" },
      { name: "Enterprise", price: "Custom", details: "On demand" },
      { name: "Agency", price: "Custom", details: "On demand" },
    ],
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "15-30 minutes" },
      { feature: "Entry Pricing", us: "From €3/month (Starter)", them: "€26/month" },
      { feature: "Price Difference", us: "Nearly 9x cheaper", them: "Premium pricing" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Playful Templates" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "UX Approach", us: "Clean & professional", them: "Gamified & playful" },
    ],
    chooseThemIf: [
      "Your brand is playful and creative, and you want your consent banner to match.",
      "You have the budget for a premium consent experience.",
      "Maximising consent rates through novelty is a top priority.",
    ],
    chooseUsIf: [
      "You want professional, clean consent for nearly 9x less cost.",
      "You prefer full control over your banner design with a visual editor.",
      "You want the simplest setup — 2 minutes, no configuration needed.",
    ],
    seo: {
      title: "ConsentEase vs Axeptio: Nearly 9x Cheaper Professional Consent (2026)",
      description: "Compare ConsentEase to Axeptio. Get professional cookie consent from €3/month vs €26/month. Visual editor, Google Consent Mode v2 included.",
      keywords: ["Axeptio alternative", "Axeptio pricing", "playful cookie consent", "GDPR banner", "Axeptio vs ConsentEase"],
    },
  },
];

export function getCompetitorBySlug(slug: string): CompetitorData | undefined {
  return COMPETITORS.find(c => c.slug === slug);
}

export function getAllCompetitorSlugs(): string[] {
  return COMPETITORS.map(c => c.slug);
}
