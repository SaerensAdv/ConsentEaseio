export interface BlogPostMeta {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string;
  articleTitle: string;
  excerpt: string;
  image?: string;
  publishedAt: string;
  author: string;
}

const BASE_URL = "https://consentease.io";

export const BLOG_POST_META: BlogPostMeta[] = [
  {
    slug: "what-is-gdpr-simple-guide",
    seoTitle: "What is GDPR? Simple Guide for Small Businesses (2025)",
    seoDescription: "Learn what GDPR means for your small business. Plain English explanation of EU privacy law, who it applies to, and how to get compliant quickly.",
    keywords: "what is GDPR, GDPR explained, GDPR small business, GDPR compliance guide, EU privacy law",
    articleTitle: "What is GDPR? A Simple Guide for Small Business Owners",
    excerpt: "GDPR can seem overwhelming, but it doesn't have to be. Here's everything you need to know about the EU's privacy regulation in plain English.",
    image: "/blog/gdpr-guide.jpg",
    publishedAt: "2025-01-15",
    author: "ConsentEase Team",
  },
  {
    slug: "google-consent-mode-v2-explained",
    seoTitle: "Google Consent Mode v2 Explained: Complete Guide (2025)",
    seoDescription: "Learn what Google Consent Mode v2 is, why you need it for EU advertising, and how to implement it on your website. Step-by-step guide included.",
    keywords: "Google Consent Mode v2, consent mode implementation, Google Ads consent, GA4 consent mode, EU advertising",
    articleTitle: "Google Consent Mode v2: What You Need to Know",
    excerpt: "Google now requires Consent Mode v2 for personalized ads in the EU. Here's what it means and how to implement it correctly.",
    image: "/blog/consent-mode.jpg",
    publishedAt: "2025-01-10",
    author: "ConsentEase Team",
  },
  {
    slug: "cookie-consent-best-practices",
    seoTitle: "Cookie Consent Best Practices: Complete Guide (2025)",
    seoDescription: "Learn cookie consent best practices for 2025. Design tips, legal requirements, and common mistakes to avoid. Make your consent banner user-friendly.",
    keywords: "cookie consent best practices, cookie banner design, GDPR cookie consent, consent UX, cookie popup",
    articleTitle: "Cookie Consent Best Practices: Do's and Don'ts",
    excerpt: "Not all cookie banners are created equal. Learn what works, what doesn't, and how to create a consent experience users actually appreciate.",
    image: "/blog/best-practices.jpg",
    publishedAt: "2025-01-05",
    author: "ConsentEase Team",
  },
  {
    slug: "ccpa-vs-gdpr-differences",
    seoTitle: "CCPA vs GDPR: Key Differences Explained (2025)",
    seoDescription: "Compare CCPA and GDPR privacy laws. Learn the key differences, who each law applies to, and how to comply with both regulations.",
    keywords: "CCPA vs GDPR, California privacy law, GDPR comparison, privacy compliance, CCPA requirements",
    articleTitle: "CCPA vs GDPR: Key Differences Explained",
    excerpt: "Both laws protect consumer privacy, but they work differently. Here's what you need to know about CCPA and GDPR compliance.",
    image: "/blog/ccpa-vs-gdpr.jpg",
    publishedAt: "2024-12-20",
    author: "ConsentEase Team",
  },
  {
    slug: "why-cookie-consent-matters-seo",
    seoTitle: "Cookie Consent and SEO: Does It Affect Rankings? (2025)",
    seoDescription: "Learn how cookie consent banners impact SEO. Understand Core Web Vitals, page speed, and how to implement consent without hurting rankings.",
    keywords: "cookie consent SEO, cookie banner page speed, GDPR SEO impact, Core Web Vitals consent, cookie popup SEO",
    articleTitle: "Does Cookie Consent Affect SEO? Here's the Truth",
    excerpt: "Some worry that cookie consent banners hurt SEO. Let's separate fact from fiction and show how proper implementation can actually help.",
    image: "/blog/seo-impact.jpg",
    publishedAt: "2024-12-15",
    author: "ConsentEase Team",
  },
  {
    slug: "how-to-audit-website-cookies",
    seoTitle: "How to Audit Website Cookies: Step-by-Step Guide (2025)",
    seoDescription: "Learn how to audit cookies on your website. Find all tracking cookies, categorize them for GDPR compliance, and document them properly.",
    keywords: "cookie audit, find website cookies, GDPR cookie audit, cookie inventory, website cookie scan",
    articleTitle: "How to Audit Your Website's Cookies (Step-by-Step)",
    excerpt: "Before you can manage consent properly, you need to know what cookies your site uses. Here's how to find out.",
    image: "/blog/cookie-audit.jpg",
    publishedAt: "2024-12-10",
    author: "ConsentEase Team",
  },
];

export const BLOG_POST_META_BY_SLUG: Map<string, BlogPostMeta> = new Map(
  BLOG_POST_META.map((p) => [p.slug, p])
);

export function getBlogPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POST_META_BY_SLUG.get(slug);
}

export function buildArticleStructuredData(post: BlogPostMeta): object[] {
  const articleUrl = `${BASE_URL}/blog/${post.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.articleTitle,
    description: post.excerpt,
    image: post.image ? `${BASE_URL}${post.image}` : undefined,
    author: {
      "@type": "Organization",
      name: "ConsentEase",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "ConsentEase",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/favicon.png`,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${BASE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.articleTitle,
        item: articleUrl,
      },
    ],
  };

  return [articleSchema, breadcrumbSchema];
}
