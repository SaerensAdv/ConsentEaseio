import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, Check, ArrowRight, ArrowLeft, Clock, CreditCard, TrendDown, Lightning } from "@phosphor-icons/react";
const logoImage = "/consentease-logo.webp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCanonical } from "@/hooks/use-canonical";
import { COMPETITORS, type CompetitorData } from "@/data/competitors";

interface ComparisonLayoutProps {
  competitor: CompetitorData;
}

function ComparisonJsonLd({ competitor }: { competitor: CompetitorData }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": competitor.seo.title,
        "description": competitor.seo.description,
        "url": `https://consentease.io/compare/${competitor.slug}`,
        "isPartOf": { "@id": "https://consentease.io/#website" },
        "mainEntity": {
          "@type": "Product",
          "name": "ConsentEase",
          "description": "GDPR/CCPA consent banner management platform",
          "brand": { "@type": "Brand", "name": "ConsentEase" },
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "EUR",
            "lowPrice": "3",
            "highPrice": "129",
            "offerCount": "7"
          }
        },
        "about": {
          "@type": "SoftwareApplication",
          "name": competitor.name,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://consentease.io" },
          { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://consentease.io/compare" },
          { "@type": "ListItem", "position": 3, "name": `vs ${competitor.name}`, "item": `https://consentease.io/compare/${competitor.slug}` }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function ComparisonLayout({ competitor }: ComparisonLayoutProps) {
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const originalKeywords = metaKeywords?.getAttribute("content") || "";
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = ogTitle?.getAttribute("content") || "";
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const originalOgDescription = ogDescription?.getAttribute("content") || "";
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const originalTwitterTitle = twitterTitle?.getAttribute("content") || "";
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const originalTwitterDescription = twitterDescription?.getAttribute("content") || "";

    document.title = competitor.seo.title;
    
    if (metaDescription) {
      metaDescription.setAttribute("content", competitor.seo.description);
    }
    if (metaKeywords) {
      metaKeywords.setAttribute("content", competitor.seo.keywords.join(", "));
    }
    if (ogTitle) ogTitle.setAttribute("content", competitor.seo.title);
    if (ogDescription) ogDescription.setAttribute("content", competitor.seo.description);
    if (twitterTitle) twitterTitle.setAttribute("content", competitor.seo.title);
    if (twitterDescription) twitterDescription.setAttribute("content", competitor.seo.description);

    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
      if (metaKeywords) metaKeywords.setAttribute("content", originalKeywords);
      if (ogTitle) ogTitle.setAttribute("content", originalOgTitle);
      if (ogDescription) ogDescription.setAttribute("content", originalOgDescription);
      if (twitterTitle) twitterTitle.setAttribute("content", originalTwitterTitle);
      if (twitterDescription) twitterDescription.setAttribute("content", originalTwitterDescription);
    };
  }, [competitor]);

  useCanonical(`/compare/${competitor.slug}`);

  const otherCompetitors = COMPETITORS.filter(c => c.slug !== competitor.slug).slice(0, 4);

  const theirLowestPrice = competitor.pricingTiers.find(t => {
    const match = t.price.match(/[\d.]+/);
    return match && parseFloat(match[0]) > 0;
  });
  const theirPriceValue = theirLowestPrice ? parseFloat(theirLowestPrice.price.match(/[\d.]+/)![0]) : null;
  const savingsPercent = theirPriceValue ? Math.round((1 - 3 / theirPriceValue) * 100) : null;

  return (
    <>
      <ComparisonJsonLd competitor={competitor} />
      <div className="min-h-screen bg-background font-sans">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2">
              <img src={logoImage} alt="ConsentEase" className="h-8 w-8 object-contain" />
              ConsentEase
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/compare">
                <Button variant="ghost" data-testid="button-all-comparisons">
                  <ArrowLeft size={16} className="mr-2" />
                  All Comparisons
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-get-compliant">Get Compliant</Button>
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-24">
          <div className="max-w-4xl mx-auto px-6 text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary"></span>
              Honest Comparison
            </div>
            {competitor.logo && (
              <div className="mb-6">
                <img src={competitor.logo} alt={competitor.name} className="h-12 mx-auto" />
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              ConsentEase vs. {competitor.name}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {competitor.description}
            </p>
          </div>

          <div className="max-w-3xl mx-auto px-6 mb-16">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">TL;DR</h2>
              <p className="text-foreground leading-relaxed">{competitor.tldr}</p>
            </Card>
          </div>

          {savingsPercent && savingsPercent > 0 && (
            <div className="max-w-3xl mx-auto px-6 mb-16">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20 p-6 md:p-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-green-500/15">
                    <TrendDown size={32} className="text-green-600 dark:text-green-400" weight="bold" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <p className="text-lg font-bold text-green-700 dark:text-green-300 mb-1">
                      Save up to {savingsPercent}% vs {competitor.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ConsentEase starts at <span className="font-semibold text-foreground">€3/month</span> {theirLowestPrice && <>compared to {competitor.name}'s <span className="font-semibold text-foreground">{theirLowestPrice.price}</span> entry price</>}. Same core features — GDPR, CCPA, Google Consent Mode v2 — at a fraction of the cost.
                    </p>
                  </div>
                  <Link href="/onboarding" className="flex-shrink-0">
                    <Button className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-savings-cta">
                      <Lightning size={16} className="mr-2" />
                      Start Saving
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto px-6 mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">{competitor.name} Pricing</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 bg-secondary/30">
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={20} className="text-primary" />
                  <span className="font-semibold">Free Trial</span>
                </div>
                <p className="text-2xl font-bold">{competitor.trialLength}</p>
              </Card>
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard size={20} className="text-primary" />
                  <span className="font-semibold">ConsentEase Trial</span>
                </div>
                <p className="text-2xl font-bold text-primary">7 days free</p>
              </Card>
            </div>
            
            <Card className="overflow-hidden">
              <div className="bg-secondary/50 p-4 border-b">
                <h3 className="font-semibold text-center">{competitor.name} Pricing Tiers</h3>
              </div>
              <div className="divide-y">
                {competitor.pricingTiers.map((tier, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-secondary/10">
                    <div>
                      <span className="font-medium">{tier.name}</span>
                      {tier.details && <span className="text-sm text-muted-foreground ml-2">— {tier.details}</span>}
                    </div>
                    <span className="font-bold">{tier.price}</span>
                  </div>
                ))}
              </div>
            </Card>

            {competitor.supportedAAPs && competitor.supportedAAPs.length > 0 && (
              <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Supported Mobile Attribution Partners: </span>
                <span className="text-sm font-medium">{competitor.supportedAAPs.join(", ")}</span>
              </div>
            )}
          </div>

          <div className="max-w-5xl mx-auto px-6 mb-24">
            <h2 className="text-2xl font-bold mb-6 text-center">Feature Comparison</h2>
            <Card className="border-none shadow-2xl overflow-hidden">
              <div className="grid md:grid-cols-3 bg-secondary/30 divide-y md:divide-y-0 md:divide-x border-b">
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <span className="text-muted-foreground font-medium mb-2">Feature</span>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center bg-background">
                  <h3 className="text-xl font-bold text-primary mb-1">ConsentEase</h3>
                  <span className="text-sm text-muted-foreground">For Business Owners</span>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center opacity-60">
                  {competitor.logo && <img src={competitor.logo} alt={competitor.name} className="h-8 mb-2" />}
                  <h3 className="text-xl font-bold text-foreground mb-1">{competitor.name}</h3>
                  <span className="text-sm text-muted-foreground">{competitor.targetAudience}</span>
                </div>
              </div>

              <div className="divide-y">
                {competitor.features.map((row, i) => (
                  <div key={i} className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x hover:bg-secondary/10 transition-colors">
                    <div className="p-6 font-medium text-muted-foreground flex items-center justify-center md:justify-start">
                      {row.feature}
                    </div>
                    <div className="p-6 font-bold text-foreground flex items-center justify-center bg-primary/5">
                      {row.us.includes("Included") || row.us.includes("2 minutes") || row.us.includes("Automatic") || row.us.includes("cheaper") ? (
                        <span className="flex items-center gap-2 text-primary"><Check size={20} /> {row.us}</span>
                      ) : row.us}
                    </div>
                    <div className="p-6 text-muted-foreground flex items-center justify-center">
                      {row.them}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 mb-24">
            <div className="bg-secondary/30 rounded-3xl p-10 border border-border">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Shield size={24} className="text-muted-foreground" />
                Choose {competitor.name} if...
              </h3>
              <ul className="space-y-4">
                {competitor.chooseThemIf.map((item, i) => (
                  <li key={i} className="flex gap-3 text-muted-foreground">
                    <Check size={20} className="shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-primary text-primary-foreground rounded-3xl p-10 shadow-xl shadow-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 relative z-10">
                <img src={logoImage} alt="ConsentEase" className="h-8 w-8 object-contain" />
                Choose ConsentEase if...
              </h3>
              <ul className="space-y-4 relative z-10">
                {competitor.chooseUsIf.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <Check size={20} className="shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 relative z-10">
                <Link href="/onboarding">
                  <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 border-none" data-testid="button-start-trial">
                    Start Free Trial <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Compare with Other Solutions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherCompetitors.map((comp) => (
                <Link key={comp.slug} href={`/compare/${comp.slug}`}>
                  <Card className="p-4 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group h-full">
                    {comp.logo && (
                      <div className="h-6 mb-3 flex items-center">
                        <img src={comp.logo} alt={comp.name} className="h-5 max-w-[100px] object-contain" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{comp.name}</span>
                      <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{comp.tagline}</p>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/compare">
                <Button variant="outline" data-testid="button-view-all-comparisons">View All Comparisons</Button>
              </Link>
            </div>
          </div>
        </main>

        <footer className="bg-background border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>
                See more comparisons:{" "}
                <Link href="/compare" className="text-primary hover:underline">View all competitors</Link>
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
