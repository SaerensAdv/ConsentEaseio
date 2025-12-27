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

export interface CompetitorData {
  slug: string;
  name: string;
  logo?: string;
  tagline: string;
  description: string;
  targetAudience: string;
  trialLength: string;
  pricingTiers: PricingTier[];
  supportedAAPs?: string[];
  features: CompetitorFeature[];
  chooseThemIf: string[];
  chooseUsIf: string[];
}

export const COMPETITORS: CompetitorData[] = [
  {
    slug: "onetrust",
    name: "OneTrust",
    tagline: "Enterprise Privacy Management",
    description: "OneTrust is the industry standard for enterprise compliance. But if you don't have a dedicated legal team, it might be the wrong tool for the job.",
    targetAudience: "For Compliance Officers",
    trialLength: "Demo only",
    pricingTiers: [
      { name: "Enterprise", price: "Custom", details: "Starting ~$30,000/year" },
    ],
    features: [
      { feature: "Setup Time", us: "2 minutes (Auto-scan)", them: "2-4 weeks (Manual config)" },
      { feature: "Pricing Model", us: "Flat monthly fee (€5-39/mo)", them: "Custom quote (~$30k/yr)" },
      { feature: "Cookie Scanning", us: "Automatic & Weekly", them: "Manual Trigger" },
      { feature: "Banner Design", us: "Visual Editor", them: "CSS/Developer Required" },
      { feature: "Google Consent Mode v2", us: "Included (One-click)", them: "Paid Add-on / Complex Setup" },
      { feature: "Support", us: "Direct Chat", them: "Dedicated Account Manager" },
    ],
    chooseThemIf: [
      "You are a Fortune 500 company.",
      "You have a dedicated legal/compliance department.",
      "You need bespoke legal frameworks for 50+ jurisdictions.",
    ],
    chooseUsIf: [
      "You want to be compliant by lunchtime today.",
      "You want a banner that matches your brand (not a legal document).",
      "You hate getting on sales calls to ask \"how much?\".",
    ],
  },
  {
    slug: "cookiebot",
    name: "Cookiebot",
    logo: "/attached_assets/cookiebot_1766797596287.webp",
    tagline: "Cookie Consent Solution",
    description: "Cookiebot is one of the most popular cookie consent solutions. Here's how ConsentEase compares on pricing and simplicity.",
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
      { feature: "Entry Pricing", us: "€5/month (10K views)", them: "€7/month (50 subpages)" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Template-based" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "Pricing Model", us: "By pageviews", them: "By subpages" },
    ],
    chooseThemIf: [
      "You need multi-language support for 40+ languages.",
      "You require detailed compliance reports.",
      "You prefer a well-established brand.",
    ],
    chooseUsIf: [
      "You want the simplest possible setup.",
      "You prefer pageview-based pricing (more flexible).",
      "You want a more modern, customizable banner.",
    ],
  },
  {
    slug: "usercentrics",
    name: "Usercentrics",
    logo: "/attached_assets/usercentrics_1766797586505.webp",
    tagline: "Consent Management Platform",
    description: "Usercentrics is a German CMP with session-based pricing. Great for enterprise, but can get expensive quickly.",
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
      { feature: "Entry Pricing", us: "€5/month (10K views)", them: "€7/month (1.5K sessions)" },
      { feature: "Pricing Model", us: "Pageviews", them: "Sessions (more expensive)" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "A/B Testing", us: "Coming Soon", them: "Included" },
    ],
    chooseThemIf: [
      "You need advanced A/B testing for consent rates.",
      "You require enterprise-level analytics.",
      "You need mobile app SDK support (AAPs).",
    ],
    chooseUsIf: [
      "You want simple, transparent pricing.",
      "Sessions pricing would be too expensive for your traffic.",
      "You want faster setup with less configuration.",
    ],
  },
  {
    slug: "complianz",
    name: "Complianz",
    logo: "/attached_assets/complianz_1766797615675.webp",
    tagline: "WordPress Privacy Plugin",
    description: "Complianz is a WordPress-focused privacy plugin with yearly pricing. Great for WordPress, but limited to that platform.",
    targetAudience: "For WordPress Users",
    trialLength: "N/A (Yearly plans)",
    pricingTiers: [
      { name: "Personal", price: "€59/year", details: "1 website" },
      { name: "Professional", price: "€159/year", details: "5 websites" },
      { name: "Agencies", price: "€359/year", details: "25 websites" },
    ],
    features: [
      { feature: "Platform", us: "Any Website", them: "WordPress Only" },
      { feature: "Setup Time", us: "2 minutes", them: "20-40 minutes" },
      { feature: "Pricing", us: "€5/month (€60/year)", them: "€59/year (1 site)" },
      { feature: "Multi-site Pricing", us: "€12/mo for 5 sites", them: "€159/year for 5 sites" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included (Premium)" },
    ],
    chooseThemIf: [
      "You only use WordPress and want deep integration.",
      "You prefer a one-time yearly payment.",
      "You want everything managed within WordPress.",
    ],
    chooseUsIf: [
      "You have websites on different platforms.",
      "You want a platform-agnostic solution.",
      "You prefer monthly payments with flexibility.",
    ],
  },
  {
    slug: "iubenda",
    name: "Iubenda",
    logo: "/attached_assets/iubenda_1766797582562.webp",
    tagline: "Legal Compliance Suite",
    description: "Iubenda offers a full legal compliance suite including privacy policies and terms generators. More features, but higher price.",
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
      { feature: "Entry Pricing", us: "€5/month", them: "€4.99/month" },
      { feature: "Full Features", us: "€12/month (Pro)", them: "€19.99/month (Advanced)" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Privacy Policy Generator", us: "Coming Q2 2026", them: "Included" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
    ],
    chooseThemIf: [
      "You need a complete legal document suite today.",
      "You want privacy policy + cookie banner in one.",
      "You need mobile app SDK support (AAPs).",
    ],
    chooseUsIf: [
      "You already have your legal documents.",
      "You want the best cookie banner experience.",
      "You want better value at the Pro tier.",
    ],
  },
  {
    slug: "cookiefirst",
    name: "CookieFirst",
    logo: "/attached_assets/cookie-first_1766797593277.webp",
    tagline: "Cookie Consent Management",
    description: "CookieFirst is a straightforward cookie consent solution with simple pricing. Similar to ConsentEase but slightly higher priced.",
    targetAudience: "For Small Businesses",
    trialLength: "14 days",
    pricingTiers: [
      { name: "Basic", price: "€9/month", details: "Or €99/year" },
      { name: "Plus", price: "€19/month", details: "Or €209/year" },
      { name: "Custom", price: "Custom", details: "Multiple domains, 300k+ pageviews" },
    ],
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "10-20 minutes" },
      { feature: "Entry Pricing", us: "€5/month", them: "€9/month" },
      { feature: "Yearly Savings", us: "€60/year (Solo)", them: "€99/year (Basic)" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Template-based" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
    ],
    chooseThemIf: [
      "You want a simple, no-frills solution.",
      "You need specific compliance certifications.",
      "You prefer their specific banner designs.",
    ],
    chooseUsIf: [
      "You want more customization options.",
      "You prefer our visual banner editor.",
      "You want 44% savings at entry-level (€5 vs €9).",
    ],
  },
  {
    slug: "cookie-script",
    name: "Cookie Script",
    logo: "/attached_assets/cookie-script_1766797600924.webp",
    tagline: "Easy Cookie Compliance",
    description: "Cookie Script offers simple cookie compliance with a generous free tier. Good budget option, but ConsentEase offers better value.",
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
      { feature: "Entry Pricing", us: "€5/month", them: "€8/month" },
      { feature: "Free Tier", us: "7-day trial", them: "10 pages, 20K views" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Basic Editor" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
    ],
    chooseThemIf: [
      "You need a permanent free tier for tiny sites.",
      "You want budget-friendly basic compliance.",
      "You prefer their specific interface.",
    ],
    chooseUsIf: [
      "You want a more polished banner design.",
      "You need better customization options.",
      "You want 37% savings on paid plans (€5 vs €8).",
    ],
  },
  {
    slug: "cookieyes",
    name: "CookieYes",
    logo: "/attached_assets/cookieyes_1766797607935.webp",
    tagline: "GDPR Cookie Consent",
    description: "CookieYes is a popular GDPR consent solution with a free tier. Similar offering, but ConsentEase provides better value.",
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
      { feature: "Entry Pricing", us: "€5/month", them: "€9/month" },
      { feature: "Free Tier", us: "7-day trial", them: "15K views/month" },
      { feature: "Pro Features", us: "€12/month", them: "€23/month" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
    ],
    chooseThemIf: [
      "You want a permanent free tier for small sites.",
      "You need specific template designs.",
      "You prefer their workflow.",
    ],
    chooseUsIf: [
      "You want unlimited customization.",
      "You want 48% savings on Pro tier (€12 vs €23).",
      "You prefer our visual editor approach.",
    ],
  },
  {
    slug: "axeptio",
    name: "Axeptio",
    logo: "/attached_assets/axeptio_1766797590002.webp",
    tagline: "Playful Cookie Consent",
    description: "Axeptio focuses on user-friendly, playful consent banners. More expensive, but offers a unique UX-focused approach.",
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
      { feature: "Entry Pricing", us: "€5/month", them: "€26/month" },
      { feature: "Price Difference", us: "5x cheaper", them: "Premium pricing" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Playful Templates" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
    ],
    chooseThemIf: [
      "You want a more playful, gamified experience.",
      "Budget is not a concern.",
      "You want to stand out with creative banners.",
    ],
    chooseUsIf: [
      "You prefer a professional, clean design.",
      "You want 5x savings at entry-level.",
      "You want more control over customization.",
    ],
  },
];

export function getCompetitorBySlug(slug: string): CompetitorData | undefined {
  return COMPETITORS.find(c => c.slug === slug);
}

export function getAllCompetitorSlugs(): string[] {
  return COMPETITORS.map(c => c.slug);
}
