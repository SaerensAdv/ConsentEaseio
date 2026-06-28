import { useEffect } from "react";
import { Link } from "wouter";
import { useCanonical } from "@/hooks/use-canonical";
import { Shield, ArrowRight, Users } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COMPETITORS } from "@/data/competitors";

function CompareIndexSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "name": "Compare Cookie Consent Solutions",
        "description": "Compare ConsentEase vs OneTrust, Cookiebot, Usercentrics and other cookie consent solutions. See features, pricing, and find the best fit.",
        "url": "https://consentease.io/compare",
        "isPartOf": { "@id": "https://consentease.io/#website" }
      },
      {
        "@type": "ItemList",
        "name": "Cookie Consent Platform Comparisons",
        "numberOfItems": Object.keys(COMPETITORS).length,
        "itemListElement": Object.values(COMPETITORS).map((c, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "url": `https://consentease.io/compare/${c.slug}`,
          "name": `ConsentEase vs ${c.name}`
        }))
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://consentease.io" },
          { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://consentease.io/compare" }
        ]
      }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default function CompareIndex() {
  useCanonical("/compare");
  
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = ogTitle?.getAttribute("content") || "";
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const originalOgDescription = ogDescription?.getAttribute("content") || "";

    document.title = "Compare Cookie Consent Solutions - OneTrust, Cookiebot & More | ConsentEase";
    if (metaDescription) {
      metaDescription.setAttribute("content", "Compare ConsentEase vs OneTrust, Cookiebot, Usercentrics and other cookie consent solutions. See features, pricing, and find the best fit for your business.");
    }
    if (ogTitle) ogTitle.setAttribute("content", "Compare Cookie Consent Solutions | ConsentEase");
    if (ogDescription) ogDescription.setAttribute("content", "Honest comparisons with OneTrust, Cookiebot, and more. Find the right consent solution.");

    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
      if (ogTitle) ogTitle.setAttribute("content", originalOgTitle);
      if (ogDescription) ogDescription.setAttribute("content", originalOgDescription);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      <CompareIndexSchema />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2">
            <img src="/consentease-logo.webp" alt="ConsentEase" className="h-8 w-8 object-contain" />
            ConsentEase
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" data-testid="button-back-home">Back to Home</Button>
            </Link>
            <Link href="/onboarding">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-start-trial-nav">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            Honest Comparisons
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Compare ConsentEase
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            See how ConsentEase stacks up against the most popular cookie consent solutions on the market.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPETITORS.map((competitor) => (
              <Link key={competitor.slug} href={`/compare/${competitor.slug}`}>
                <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group" data-testid={`card-compare-${competitor.slug}`}>
                  <CardContent className="p-6">
                    {competitor.logo && (
                      <div className="h-8 mb-4 flex items-center">
                        <img src={competitor.logo} alt={competitor.name} className="h-6 max-w-[120px] object-contain" />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-lg">{competitor.name}</h3>
                      <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{competitor.tagline}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users size={12} />
                      <span>{competitor.targetAudience}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 mt-20">
          <Card className="bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-10 text-center relative z-10">
              <h2 className="text-2xl font-display font-bold mb-4">Ready to try ConsentEase?</h2>
              <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
                Start your 7-day free trial and see why thousands of websites choose us.
              </p>
              <Link href="/onboarding">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="button-start-trial">
                  Start Free Trial <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ConsentEase. All rights reserved.</p>
          <a href="https://saerensadvertising.com?utm_source=consentease&utm_medium=footer&utm_campaign=branding" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xs">A product by</span>
            <img src="/saerens-logo.png" alt="Saerens Advertising" className="h-5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
