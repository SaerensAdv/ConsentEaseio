export interface CompetitorFeature {
  feature: string;
  us: string;
  them: string;
}

export interface CompetitorData {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  targetAudience: string;
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
    features: [
      { feature: "Setup Time", us: "2 minutes (Auto-scan)", them: "2-4 weeks (Manual config)" },
      { feature: "Pricing Model", us: "Flat monthly fee (€12/mo)", them: "Custom quote (~$30k/yr)" },
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
    tagline: "Cookie Consent Solution",
    description: "Cookiebot is a popular cookie consent solution. Here's how ConsentEase compares.",
    targetAudience: "For Website Owners",
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "15-30 minutes" },
      { feature: "Pricing", us: "From €5/month", them: "From €12/month" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Template-based" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "Support", us: "Direct Chat", them: "Email Support" },
    ],
    chooseThemIf: [
      "You need multi-language support for 40+ languages.",
      "You require detailed compliance reports.",
      "You prefer a well-established brand.",
    ],
    chooseUsIf: [
      "You want the simplest possible setup.",
      "You're looking for better value for money.",
      "You want a more modern, customizable banner.",
    ],
  },
  {
    slug: "usercentrics",
    name: "Usercentrics",
    tagline: "Consent Management Platform",
    description: "Usercentrics is a German CMP focused on enterprise features. See how we compare.",
    targetAudience: "For Marketing Teams",
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "30-60 minutes" },
      { feature: "Pricing", us: "From €5/month", them: "From €49/month" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Advanced Customization" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "A/B Testing", us: "Coming Soon", them: "Included" },
    ],
    chooseThemIf: [
      "You need advanced A/B testing for consent rates.",
      "You require enterprise-level analytics.",
      "You have complex multi-domain setups.",
    ],
    chooseUsIf: [
      "You want simple, transparent pricing.",
      "You don't need enterprise-level complexity.",
      "You want faster setup with less configuration.",
    ],
  },
  {
    slug: "complianz",
    name: "Complianz",
    tagline: "WordPress Privacy Plugin",
    description: "Complianz is a WordPress-focused privacy plugin. Here's how we compare.",
    targetAudience: "For WordPress Users",
    features: [
      { feature: "Platform", us: "Any Website", them: "WordPress Only" },
      { feature: "Setup Time", us: "2 minutes", them: "20-40 minutes" },
      { feature: "Pricing", us: "From €5/month", them: "€45/year" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "WordPress Customizer" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included (Premium)" },
    ],
    chooseThemIf: [
      "You only use WordPress.",
      "You prefer a one-time yearly payment.",
      "You want everything managed within WordPress.",
    ],
    chooseUsIf: [
      "You have multiple websites on different platforms.",
      "You want a platform-agnostic solution.",
      "You prefer monthly payments with flexibility.",
    ],
  },
  {
    slug: "iubenda",
    name: "Iubenda",
    tagline: "Legal Compliance Suite",
    description: "Iubenda offers a full legal compliance suite including privacy policies. Here's our comparison.",
    targetAudience: "For Legal Compliance",
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "15-30 minutes" },
      { feature: "Pricing", us: "From €5/month", them: "From €29/month" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Privacy Policy Generator", us: "Coming Q2 2026", them: "Included" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "Terms Generator", us: "Coming Q3 2026", them: "Included" },
    ],
    chooseThemIf: [
      "You need a complete legal document suite today.",
      "You want privacy policy + cookie banner in one.",
      "You need detailed legal customization.",
    ],
    chooseUsIf: [
      "You already have your legal documents.",
      "You want the best cookie banner experience.",
      "You're looking for simpler, focused tools.",
    ],
  },
  {
    slug: "cookiefirst",
    name: "CookieFirst",
    tagline: "Cookie Consent Management",
    description: "CookieFirst is a straightforward cookie consent solution. See how we compare.",
    targetAudience: "For Small Businesses",
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "10-20 minutes" },
      { feature: "Pricing", us: "From €5/month", them: "From €9/month" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Template-based" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "Consent Logs", us: "Included", them: "Included" },
    ],
    chooseThemIf: [
      "You want a simple, no-frills solution.",
      "You need basic consent management.",
      "You prefer their specific banner designs.",
    ],
    chooseUsIf: [
      "You want more customization options.",
      "You prefer our visual banner editor.",
      "You want better value at entry-level.",
    ],
  },
  {
    slug: "cookie-script",
    name: "Cookie Script",
    tagline: "Easy Cookie Compliance",
    description: "Cookie Script offers simple cookie compliance. Here's how ConsentEase compares.",
    targetAudience: "For Website Owners",
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "5-15 minutes" },
      { feature: "Pricing", us: "From €5/month", them: "From €8/month" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Basic Editor" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "White-label", us: "Pro Plan", them: "Business Plan" },
    ],
    chooseThemIf: [
      "You want a budget-friendly option.",
      "You need basic cookie compliance.",
      "You prefer their specific interface.",
    ],
    chooseUsIf: [
      "You want a more polished banner design.",
      "You need better customization options.",
      "You prefer our modern visual editor.",
    ],
  },
  {
    slug: "cookieyes",
    name: "CookieYes",
    tagline: "GDPR Cookie Consent",
    description: "CookieYes is a popular GDPR consent solution. See how we stack up.",
    targetAudience: "For Website Owners",
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "10-20 minutes" },
      { feature: "Pricing", us: "From €5/month", them: "From €10/month" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Template-based" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "Free Plan", us: "7-day Trial", them: "Limited Free Tier" },
    ],
    chooseThemIf: [
      "You want a free tier for small sites.",
      "You need specific template designs.",
      "You prefer their workflow.",
    ],
    chooseUsIf: [
      "You want unlimited customization.",
      "You prefer our visual editor approach.",
      "You need better Google Consent Mode support.",
    ],
  },
  {
    slug: "axeptio",
    name: "Axeptio",
    tagline: "Playful Cookie Consent",
    description: "Axeptio focuses on user-friendly, playful consent banners. Here's our comparison.",
    targetAudience: "For UX-focused Teams",
    features: [
      { feature: "Setup Time", us: "2 minutes", them: "15-30 minutes" },
      { feature: "Pricing", us: "From €5/month", them: "From €15/month" },
      { feature: "Cookie Scanning", us: "Automatic", them: "Automatic" },
      { feature: "Banner Design", us: "Visual Editor", them: "Playful Templates" },
      { feature: "Google Consent Mode v2", us: "Included", them: "Included" },
      { feature: "Animation Options", us: "3 Animations", them: "Unique Animations" },
    ],
    chooseThemIf: [
      "You want a more playful, gamified experience.",
      "You prefer their unique banner style.",
      "You want to stand out with creative banners.",
    ],
    chooseUsIf: [
      "You prefer a professional, clean design.",
      "You want more control over customization.",
      "You're looking for better pricing.",
    ],
  },
];

export function getCompetitorBySlug(slug: string): CompetitorData | undefined {
  return COMPETITORS.find(c => c.slug === slug);
}

export function getAllCompetitorSlugs(): string[] {
  return COMPETITORS.map(c => c.slug);
}
