import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BLOG_ARTICLES, CATEGORY_LABELS, type BlogArticle } from "@/data/blog";

function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link href={`/blog/${article.slug}`}>
      <Card className="h-full p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group" data-testid={`card-article-${article.slug}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
            {CATEGORY_LABELS[article.category]}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
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
            <Calendar className="w-3 h-3" />
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Read <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

export default function BlogIndex() {
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";

    document.title = "Blog - GDPR & Cookie Consent Guides | ConsentEase";
    if (metaDescription) {
      metaDescription.setAttribute("content", "Learn about GDPR compliance, cookie consent best practices, and privacy regulations. Expert guides for small business owners.");
    }

    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
    };
  }, []);

  const featuredArticle = BLOG_ARTICLES[0];
  const otherArticles = BLOG_ARTICLES.slice(1);

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient flex items-center justify-center text-white">
              <Shield className="w-5 h-5 fill-current" />
            </div>
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
                      <Clock className="w-4 h-4" />
                      {featuredArticle.readingTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredArticle.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="bg-secondary/30 p-8 md:p-12 flex items-center justify-center">
                  <div className="text-center">
                    <Shield className="w-24 h-24 text-primary/20 mx-auto mb-4" />
                    <span className="text-primary font-medium flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                      Read Article <ArrowRight className="w-5 h-5" />
                    </span>
                  </div>
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
                  Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
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
            <a href="https://saerens.agency?utm_source=consentease&utm_medium=footer&utm_campaign=branding" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-xs">A product by</span>
              <img src="https://saerensadvertising.com/logo.svg" alt="Saerens Agency" className="h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
