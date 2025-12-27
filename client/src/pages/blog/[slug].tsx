import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { Shield, Calendar, Clock, ArrowLeft, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getArticleBySlug, getRelatedArticles, CATEGORY_LABELS, type BlogArticle } from "@/data/blog";

function ArticleJsonLd({ article }: { article: BlogArticle }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: {
      "@type": "Organization",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "ConsentEase",
      logo: {
        "@type": "ImageObject",
        url: "https://consentease.io/logo.png",
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://consentease.io/blog/${article.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function RelatedArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link href={`/blog/${article.slug}`}>
      <Card className="p-4 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group h-full" data-testid={`card-related-${article.slug}`}>
        <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
          {CATEGORY_LABELS[article.category]}
        </span>
        <h4 className="font-bold mt-2 mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
      </Card>
    </Link>
  );
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug || "");

  useEffect(() => {
    if (!article) return;

    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const originalKeywords = metaKeywords?.getAttribute("content") || "";
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = ogTitle?.getAttribute("content") || "";
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const originalOgDescription = ogDescription?.getAttribute("content") || "";

    document.title = article.seo.title;
    if (metaDescription) metaDescription.setAttribute("content", article.seo.description);
    if (metaKeywords) metaKeywords.setAttribute("content", article.seo.keywords.join(", "));
    if (ogTitle) ogTitle.setAttribute("content", article.seo.title);
    if (ogDescription) ogDescription.setAttribute("content", article.seo.description);

    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
      if (metaKeywords) metaKeywords.setAttribute("content", originalKeywords);
      if (ogTitle) ogTitle.setAttribute("content", originalOgTitle);
      if (ogDescription) ogDescription.setAttribute("content", originalOgDescription);
    };
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedArticles = getRelatedArticles(article.slug, 3);

  return (
    <>
      <ArticleJsonLd article={article} />
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
              <Link href="/blog">
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  All Articles
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-24">
          <article className="max-w-3xl mx-auto px-6">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                  {CATEGORY_LABELS[article.category]}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readingTime}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pb-8 border-b">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {article.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div 
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:text-sm"
              dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
            />

            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 text-sm bg-secondary rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <Card className="bg-primary text-primary-foreground p-8 mt-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-3">
                  Ready to Implement This?
                </h2>
                <p className="text-primary-foreground/80 mb-6">
                  Get GDPR-compliant in under 2 minutes with ConsentEase.
                </p>
                <Link href="/onboarding">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="button-article-cta">
                    Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          </article>

          {relatedArticles.length > 0 && (
            <div className="max-w-5xl mx-auto px-6 mt-16">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <RelatedArticleCard key={related.slug} article={related} />
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="bg-background border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>
                <Link href="/blog" className="text-primary hover:underline">Back to Blog</Link>
                {" · "}
                <Link href="/docs" className="text-primary hover:underline">Documentation</Link>
              </p>
              <a href="https://saerens.agency?utm_source=consentease&utm_medium=footer&utm_campaign=branding" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-xs">A product by</span>
                <img src="https://saerensadvertising.com/logo.svg" alt="Saerens Agency" className="h-5" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function formatContent(markdown: string): string {
  const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g;
  let html = markdown.replace(tableRegex, (_, header, body) => {
    const headers = header.split('|').filter((h: string) => h.trim());
    const rows = body.trim().split('\n').map((row: string) => 
      row.split('|').filter((c: string) => c.trim())
    );
    
    let table = '<table><thead><tr>';
    headers.forEach((h: string) => { table += `<th>${h.trim()}</th>`; });
    table += '</tr></thead><tbody>';
    rows.forEach((row: string[]) => {
      table += '<tr>';
      row.forEach((cell: string) => { table += `<td>${cell.trim()}</td>`; });
      table += '</tr>';
    });
    table += '</tbody></table>';
    return table;
  });

  html = html
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  html = html.replace(/(^- .+\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line => 
      `<li>${line.replace(/^- /, '')}</li>`
    ).join('');
    return `<ul>${items}</ul>`;
  });

  html = html.replace(/(^\d+\. .+\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line => 
      `<li>${line.replace(/^\d+\. /, '')}</li>`
    ).join('');
    return `<ol>${items}</ol>`;
  });

  html = html
    .split('\n\n')
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || 
          trimmed.startsWith('<ol') || trimmed.startsWith('<table')) {
        return trimmed;
      }
      return `<p>${trimmed}</p>`;
    })
    .join('\n');

  return html.replace(/<p><\/p>/g, '').replace(/<p>\s*<\/p>/g, '');
}
