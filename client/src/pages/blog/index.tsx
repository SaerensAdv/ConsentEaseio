import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, Calendar, Clock, ArrowRight, House, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCanonical } from "@/hooks/use-canonical";
import { BLOG_ARTICLES, CATEGORY_LABELS, type BlogArticle } from "@/data/blog";

function BlogSchemas() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "name": "Blog - GDPR & Cookie Consent Guides",
        "description": "Expert articles on GDPR compliance, cookie consent, Google Consent Mode, and privacy regulations for small businesses.",
        "url": "https://consentease.io/blog",
        "isPartOf": { "@id": "https://consentease.io/#website" },
        "publisher": { "@id": "https://consentease.io/#organization" }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://consentease.io" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://consentease.io/blog" }
        ]
      },
      {
        "@type": "ItemList",
        "name": "ConsentEase Blog Articles",
        "numberOfItems": BLOG_ARTICLES.length,
        "itemListElement": BLOG_ARTICLES.map((article, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `https://consentease.io/blog/${article.slug}`,
          "name": article.title
        }))
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link href={`/blog/${article.slug}`}>
      <Card className="h-full overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group" data-testid={`card-article-${article.slug}`}>
        {article.image && (
          <div className="aspect-video overflow-hidden">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
              {CATEGORY_LABELS[article.category]}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={12} />
              {article.readingTime}
            </span>
          </div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar size={12} />
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Read <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function BlogIndex() {
  useCanonical("/blog");

  useEffect(() => {
    const originalTitle = document.title;
    const title = "Blog - GDPR & Cookie Consent Guides | ConsentEase";
    const desc = "Learn about GDPR compliance, cookie consent best practices, and privacy regulations. Expert guides for small business owners.";
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";

    document.title = title;
    if (metaDescription) metaDescription.setAttribute("content", desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const origOgTitle = ogTitle?.getAttribute("content") || "";
    if (ogTitle) ogTitle.setAttribute("content", title);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const origOgDesc = ogDescription?.getAttribute("content") || "";
    if (ogDescription) ogDescription.setAttribute("content", desc);

    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
      if (ogTitle) ogTitle.setAttribute("content", origOgTitle);
      if (ogDescription) ogDescription.setAttribute("content", origOgDesc);
    };
  }, []);

  const featuredArticle = BLOG_ARTICLES[0];
  const otherArticles = BLOG_ARTICLES.slice(1);

  return (
    <>
      <BlogSchemas />
      <div className="min-h-screen bg-background font-sans">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2">
            <img src="/consentease-logo.webp" alt="ConsentEase" className="h-8 w-auto" />
            ConsentEase
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground hidden md:block">
              Pricing
            </Link>
            <Link href="/compare" className="text-muted-foreground hover:text-foreground hidden md:block">
              Compare
            </Link>
            <Link href="/onboarding">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-get-started">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <nav className="max-w-6xl mx-auto px-6 mb-8 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <House size={16} />
            <span>Home</span>
          </Link>
          <CaretRight size={16} />
          <span className="text-foreground">Blog</span>
        </nav>

        <div className="max-w-4xl mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            Learn & Grow
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            The ConsentEase Blog
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Expert guides on GDPR, CCPA, cookie consent, and privacy compliance. Written for small business owners, not lawyers.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 mb-16">
          <Link href={`/blog/${featuredArticle.slug}`}>
            <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group" data-testid="card-featured-article">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="bg-gradient p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-white/80 text-sm font-medium mb-2">Featured Article</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:underline">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-white/80 mb-6">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {featuredArticle.readingTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(featuredArticle.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="bg-secondary/30 flex items-center justify-center overflow-hidden">
                  {featuredArticle.image ? (
                    <img 
                      src={featuredArticle.image} 
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="p-8 md:p-12 text-center">
                      <Shield size={96} className="text-primary/20 mx-auto mb-4" />
                      <span className="text-primary font-medium flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                        Read Article <ArrowRight size={20} />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">All Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-24">
          <Card className="bg-primary text-primary-foreground p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Get Compliant?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
                Stop reading about compliance and start doing it. ConsentEase gets you GDPR-ready in under 2 minutes.
              </p>
              <Link href="/onboarding">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="button-start-trial">
                  Start Free Trial <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <footer className="bg-background border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              More resources:{" "}
              <Link href="/docs" className="text-primary hover:underline">Documentation</Link>
              {" · "}
              <Link href="/faq" className="text-primary hover:underline">FAQ</Link>
            </p>
            <a href="https://saerensadvertising.com?utm_source=consentease&utm_medium=footer&utm_campaign=branding" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-xs">A product by</span>
              <img src="/saerens-logo.png" alt="Saerens Advertising" className="h-5" />
            </a>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
