const BASE_URL = "https://consentease.io";

interface PageMeta {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string; // optional per-page OG image (relative or absolute)
  canonical?: string;
  keywords?: string;
  structuredData?: object;
}

const DEFAULT_OG_IMAGE = `${BASE_URL}/opengraph.jpg`;

function resolveImageUrl(url: string | undefined): string {
  if (!url) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
}

const pageMeta: Record<string, PageMeta> = {
  "/": {
    title: "ConsentEase - Privacy Compliance for Humans",
    description: "The consent banner that installs in 2 minutes, costs less than a coffee, and keeps you compliant forever.",
    ogTitle: "ConsentEase - Privacy Compliance for Humans",
    ogDescription: "Privacy compliance for businesses, not lawyers.",
    keywords: "GDPR, CCPA, cookie consent, privacy compliance, consent banner, cookie banner, consent management",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ConsentEase",
      "url": BASE_URL,
      "logo": `${BASE_URL}/consentease-logo.webp`,
      "description": "Affordable GDPR and CCPA cookie consent management for small businesses.",
      "sameAs": [],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": `${BASE_URL}/contact`
      },
      "foundingDate": "2024",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "EUR",
        "lowPrice": "0",
        "highPrice": "2.50",
        "offerCount": "3"
      }
    }
  },
  "/pricing": {
    title: "Pricing - ConsentEase | Cookie Consent from €3/month",
    description: "Simple, transparent pricing for cookie consent management. Plans from €3/month with a 7-day free trial on every plan. No hidden fees.",
    ogTitle: "ConsentEase Pricing - Privacy Compliance from €3/month",
    ogDescription: "Simple, transparent pricing from €3/month. 7-day free trial on every plan. No hidden costs.",
    keywords: "cookie consent pricing, GDPR compliance cost, affordable consent banner, cheap cookie banner"
  },
  "/business": {
    title: "Business Plans - ConsentEase | Multi-Site & Agency Pricing",
    description: "ConsentEase business plans for agencies and multi-site management. Volume pricing, white-label options, and dedicated support for privacy compliance at scale.",
    ogTitle: "ConsentEase for Business - Multi-Site Privacy Compliance",
    ogDescription: "Agency and business plans for managing cookie consent across multiple websites.",
    keywords: "agency cookie consent, multi-site consent management, business GDPR compliance, white-label consent banner"
  },
  "/features": {
    title: "Features - ConsentEase | GDPR & CCPA Consent Management",
    description: "Geo-targeted consent banners, Google Consent Mode v2, cookie scanning, consent analytics, and policy generation. Everything you need for privacy compliance.",
    ogTitle: "ConsentEase Features - Complete Consent Management",
    ogDescription: "Geo-targeting, Google Consent Mode v2, analytics, policy generation and more.",
    keywords: "consent banner features, Google Consent Mode v2, cookie scanning, consent analytics, geo-targeted consent"
  },
  "/compare": {
    title: "Compare ConsentEase vs Other Consent Tools",
    description: "See how ConsentEase compares to OneTrust, Cookiebot, Usercentrics, and other consent management platforms. Feature comparison and pricing breakdown.",
    ogTitle: "ConsentEase vs Competitors - Honest Comparison",
    ogDescription: "Compare features and pricing with OneTrust, Cookiebot, Usercentrics and more.",
    keywords: "cookie consent comparison, OneTrust alternative, Cookiebot alternative, consent management comparison"
  },
  "/compare/onetrust": {
    title: "ConsentEase vs OneTrust - Comparison | 2025",
    description: "Compare ConsentEase with OneTrust. See how our affordable consent solution stacks up against enterprise-grade OneTrust for small business needs.",
    ogTitle: "ConsentEase vs OneTrust",
    ogDescription: "Affordable consent management vs enterprise pricing. See the full comparison.",
    keywords: "ConsentEase vs OneTrust, OneTrust alternative, affordable OneTrust replacement"
  },
  "/compare/cookiebot": {
    title: "ConsentEase vs Cookiebot - Comparison | 2025",
    description: "Compare ConsentEase with Cookiebot. Feature-by-feature breakdown of two popular cookie consent solutions for small businesses and websites.",
    ogTitle: "ConsentEase vs Cookiebot",
    ogDescription: "How does ConsentEase compare to Cookiebot? Full feature and pricing comparison.",
    keywords: "ConsentEase vs Cookiebot, Cookiebot alternative, cookie consent comparison"
  },
  "/compare/usercentrics": {
    title: "ConsentEase vs Usercentrics - Comparison | 2025",
    description: "Compare ConsentEase with Usercentrics. Find out which consent management platform fits your business better.",
    ogTitle: "ConsentEase vs Usercentrics",
    ogDescription: "Affordable consent management vs Usercentrics. Full comparison.",
    keywords: "ConsentEase vs Usercentrics, Usercentrics alternative"
  },
  "/compare/complianz": {
    title: "ConsentEase vs Complianz - Comparison | 2025",
    description: "Compare ConsentEase with Complianz. See how a hosted consent platform compares to a WordPress plugin approach.",
    ogTitle: "ConsentEase vs Complianz",
    ogDescription: "Hosted consent platform vs WordPress plugin. Which is right for you?",
    keywords: "ConsentEase vs Complianz, Complianz alternative"
  },
  "/compare/iubenda": {
    title: "ConsentEase vs iubenda - Comparison | 2025",
    description: "Compare ConsentEase with iubenda for cookie consent and privacy compliance. Feature comparison and pricing breakdown.",
    ogTitle: "ConsentEase vs iubenda",
    ogDescription: "Two consent platforms compared. Features, pricing, and ease of use.",
    keywords: "ConsentEase vs iubenda, iubenda alternative"
  },
  "/compare/cookiefirst": {
    title: "ConsentEase vs CookieFirst - Comparison | 2025",
    description: "Compare ConsentEase with CookieFirst. Both affordable consent solutions compared on features, pricing, and compliance capabilities.",
    ogTitle: "ConsentEase vs CookieFirst",
    ogDescription: "Affordable consent tools compared. See which one fits your needs.",
    keywords: "ConsentEase vs CookieFirst, CookieFirst alternative"
  },
  "/compare/cookie-script": {
    title: "ConsentEase vs Cookie-Script - Comparison | 2025",
    description: "Compare ConsentEase with Cookie-Script for cookie consent management. Full feature and pricing comparison.",
    ogTitle: "ConsentEase vs Cookie-Script",
    ogDescription: "Two popular consent tools compared. Features and pricing breakdown.",
    keywords: "ConsentEase vs Cookie-Script, Cookie-Script alternative"
  },
  "/compare/cookieyes": {
    title: "ConsentEase vs CookieYes - Comparison | 2025",
    description: "Compare ConsentEase with CookieYes. See how both consent management platforms handle GDPR and CCPA compliance.",
    ogTitle: "ConsentEase vs CookieYes",
    ogDescription: "Full feature comparison of two consent management solutions.",
    keywords: "ConsentEase vs CookieYes, CookieYes alternative"
  },
  "/compare/axeptio": {
    title: "ConsentEase vs Axeptio - Comparison | 2025",
    description: "Compare ConsentEase with Axeptio. See which consent management platform offers better value for your website.",
    ogTitle: "ConsentEase vs Axeptio",
    ogDescription: "Consent management comparison: ConsentEase vs Axeptio.",
    keywords: "ConsentEase vs Axeptio, Axeptio alternative"
  },
  "/about": {
    title: "About ConsentEase - Our Mission & Team",
    description: "ConsentEase makes privacy compliance accessible for every business. Learn about our mission to simplify GDPR and CCPA consent management.",
    ogTitle: "About ConsentEase",
    ogDescription: "Our mission: make privacy compliance accessible for every business.",
    keywords: "about ConsentEase, privacy compliance mission, consent management team"
  },
  "/contact": {
    title: "Contact ConsentEase - Get in Touch",
    description: "Have questions about ConsentEase? Contact our team for support, partnership inquiries, or feature requests.",
    ogTitle: "Contact ConsentEase",
    ogDescription: "Get in touch with our team for support or questions.",
    keywords: "contact ConsentEase, consent management support"
  },
  "/faq": {
    title: "FAQ - ConsentEase | Common Questions Answered",
    description: "Frequently asked questions about ConsentEase, GDPR compliance, cookie consent banners, and privacy regulations. Get clear answers.",
    ogTitle: "ConsentEase FAQ",
    ogDescription: "Common questions about cookie consent, GDPR, and ConsentEase answered.",
    keywords: "cookie consent FAQ, GDPR questions, consent banner help"
  },
  "/docs": {
    title: "Documentation - ConsentEase | Setup & Integration Guide",
    description: "Step-by-step documentation for setting up ConsentEase. Integration guides for WordPress, Shopify, React, and custom HTML sites.",
    ogTitle: "ConsentEase Documentation",
    ogDescription: "Setup guides and integration documentation for all platforms.",
    keywords: "ConsentEase documentation, consent banner setup, cookie banner installation guide"
  },
  "/blog": {
    title: "Blog - ConsentEase | Privacy & Compliance Insights",
    description: "Articles about GDPR, CCPA, cookie consent best practices, and privacy compliance updates for small businesses.",
    ogTitle: "ConsentEase Blog",
    ogDescription: "Privacy compliance insights and best practices for your business.",
    keywords: "GDPR blog, cookie consent articles, privacy compliance insights"
  },
  "/demo": {
    title: "Interactive Demo - ConsentEase | Try Before You Buy",
    description: "Try ConsentEase with our interactive demo. See how the consent banner looks and works on your site without signing up.",
    ogTitle: "Try ConsentEase Demo",
    ogDescription: "Interactive demo of our consent management platform. No signup required.",
    keywords: "consent banner demo, try ConsentEase, cookie consent preview"
  },
  "/scan": {
    title: "Free Cookie Scanner - ConsentEase | Audit Your Website",
    description: "Scan your website for cookies and trackers for free. See what data your site collects and get compliance recommendations.",
    ogTitle: "Free Cookie Scanner by ConsentEase",
    ogDescription: "Scan your website for cookies and trackers. Free audit tool.",
    keywords: "cookie scanner, free cookie audit, website tracker scan, GDPR cookie check"
  },
  "/solutions": {
    title: "Platform Solutions - ConsentEase | WordPress, Shopify & More",
    description: "ConsentEase integrates with WordPress, Shopify, Wix, Webflow, Squarespace, and custom-built websites. Step-by-step setup guides for every platform.",
    ogTitle: "ConsentEase Platform Solutions",
    ogDescription: "Consent management for every platform. Setup guides included.",
    keywords: "WordPress cookie consent, Shopify consent banner, Wix GDPR, Webflow cookies"
  },
  "/roadmap": {
    title: "Product Roadmap - ConsentEase | What We're Building",
    description: "See what features are coming to ConsentEase. Our public roadmap shows planned features, in-progress work, and completed updates.",
    ogTitle: "ConsentEase Roadmap",
    ogDescription: "See what we're building next. Public product roadmap.",
    keywords: "ConsentEase roadmap, upcoming features, consent management updates"
  },
  "/powered-by": {
    title: "Powered by ConsentEase - Sites Using Our Platform",
    description: "Websites and businesses that trust ConsentEase for their cookie consent management and privacy compliance needs.",
    ogTitle: "Powered by ConsentEase",
    ogDescription: "See who trusts ConsentEase for privacy compliance.",
    keywords: "ConsentEase customers, sites using ConsentEase"
  },
  "/privacy": {
    title: "Privacy Policy - ConsentEase",
    description: "ConsentEase privacy policy. Learn how we handle your data, what we collect, and your rights under GDPR and CCPA.",
    ogTitle: "ConsentEase Privacy Policy",
    ogDescription: "How ConsentEase handles your data.",
    keywords: "ConsentEase privacy policy, data handling, GDPR rights"
  },
  "/terms": {
    title: "Terms of Service - ConsentEase",
    description: "ConsentEase terms of service. The rules and conditions for using our consent management platform.",
    ogTitle: "ConsentEase Terms of Service",
    ogDescription: "Terms and conditions for using ConsentEase.",
    keywords: "ConsentEase terms, service conditions"
  },
  "/cookies": {
    title: "Cookie Policy - ConsentEase",
    description: "ConsentEase cookie policy. What cookies we use, why we use them, and how you can manage your preferences.",
    ogTitle: "ConsentEase Cookie Policy",
    ogDescription: "Our cookie usage and your choices.",
    keywords: "ConsentEase cookies, cookie policy"
  },
  "/dpa": {
    title: "Data Processing Agreement - ConsentEase",
    description: "ConsentEase Data Processing Agreement (DPA) for GDPR compliance. Standard contractual clauses and data processing terms.",
    ogTitle: "ConsentEase DPA",
    ogDescription: "Our Data Processing Agreement for GDPR compliance.",
    keywords: "ConsentEase DPA, data processing agreement, GDPR DPA"
  },
  "/brand": {
    title: "Brand Assets - ConsentEase | Logos & Guidelines",
    description: "Download ConsentEase brand assets including logos, colors, and usage guidelines.",
    ogTitle: "ConsentEase Brand Assets",
    ogDescription: "Official logos, colors, and brand guidelines.",
    keywords: "ConsentEase logo, brand assets, brand guidelines"
  },
};

export function getMetaForPath(path: string): PageMeta | null {
  if (pageMeta[path]) {
    return pageMeta[path];
  }

  if (path.startsWith("/solutions/")) {
    const slug = path.replace("/solutions/", "");
    const platformName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
    return {
      title: `${platformName} Cookie Consent Setup - ConsentEase`,
      description: `Step-by-step guide to adding GDPR and CCPA compliant cookie consent to your ${platformName} website with ConsentEase.`,
      ogTitle: `ConsentEase for ${platformName}`,
      ogDescription: `Cookie consent setup guide for ${platformName}.`,
      keywords: `${platformName} cookie consent, ${platformName} GDPR, ${slug} consent banner`
    };
  }

  if (path.startsWith("/compliance/")) {
    const slug = path.replace("/compliance/", "");
    const countryName = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return {
      title: `${countryName} Cookie Law & Compliance Guide - ConsentEase`,
      description: `Understand ${countryName}'s cookie consent requirements and privacy regulations. Get compliant with ConsentEase.`,
      ogTitle: `Cookie Compliance in ${countryName}`,
      ogDescription: `${countryName} privacy law guide and cookie consent requirements.`,
      keywords: `${countryName} GDPR, ${countryName} cookie law, ${countryName} privacy compliance`
    };
  }

  if (path.startsWith("/blog/") && path !== "/blog") {
    return null;
  }

  return null;
}

export function injectMetaTags(html: string, path: string): string {
  const meta = getMetaForPath(path);
  if (!meta) return html;

  const canonical = `${BASE_URL}${path === "/" ? "" : path}`;

  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(meta.title)}</title>`
  );

  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`
  );

  if (meta.keywords) {
    html = html.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/,
      `<meta name="keywords" content="${escapeAttr(meta.keywords)}" />`
    );
  }

  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeAttr(meta.ogTitle || meta.title)}" />`
  );

  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeAttr(meta.ogDescription || meta.description)}" />`
  );

  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`
  );

  // Always force og:image and twitter:image to an absolute consentease.io URL.
  // This corrects any build-time replacement that may have leaked a Replit subdomain
  // and supports per-page images via meta.ogImage.
  const imageUrl = resolveImageUrl(meta.ogImage);
  // Attribute-order tolerant — match any <meta ...> tag whose attribute list
  // contains the target property/name, no matter where `content` sits.
  html = html.replace(
    /<meta\b[^>]*\bproperty=["']og:image["'][^>]*\/?>/i,
    `<meta property="og:image" content="${escapeAttr(imageUrl)}" />`
  );

  html = html.replace(
    /<meta\b[^>]*\bname=["']twitter:image["'][^>]*\/?>/i,
    `<meta name="twitter:image" content="${escapeAttr(imageUrl)}" />`
  );

  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeAttr(meta.ogTitle || meta.title)}" />`
  );

  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeAttr(meta.ogDescription || meta.description)}" />`
  );

  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeAttr(canonical)}" />`
  );

  if (meta.structuredData) {
    const structuredDataScript = `<script type="application/ld+json">${JSON.stringify(meta.structuredData)}</script>`;
    html = html.replace("</head>", `${structuredDataScript}\n</head>`);
  }

  return html;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
