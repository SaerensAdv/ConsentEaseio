import { useEffect } from "react";
import { Link } from "wouter";
import { useCanonical } from "@/hooks/use-canonical";
import { Check, Buildings, Users, Globe, Shield, Lightning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PlanComparisonTable from "@/components/PlanComparisonTable";

function BusinessSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "Business Plans - Multi-Site Cookie Consent Management",
        "description": "Manage cookie consent for multiple websites. Plans from €19/month. White-label, bulk cookie scanning, and agency tools included.",
        "url": "https://consentease.io/business",
        "isPartOf": { "@id": "https://consentease.io/#website" }
      },
      {
        "@type": "Product",
        "name": "ConsentEase Business Plans",
        "description": "Multi-site cookie consent management for teams and agencies.",
        "brand": { "@type": "Brand", "name": "ConsentEase" },
        "offers": [
          { "@type": "Offer", "name": "Pro", "price": "19", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31", "availability": "https://schema.org/InStock", "url": "https://consentease.io/business" },
          { "@type": "Offer", "name": "Business", "price": "35", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31", "availability": "https://schema.org/InStock", "url": "https://consentease.io/business" },
          { "@type": "Offer", "name": "Agency", "price": "59", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31", "availability": "https://schema.org/InStock", "url": "https://consentease.io/business" },
          { "@type": "Offer", "name": "Agency Pro", "price": "129", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31", "availability": "https://schema.org/InStock", "url": "https://consentease.io/business" }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://consentease.io" },
          { "@type": "ListItem", "position": 2, "name": "Business Plans", "item": "https://consentease.io/business" }
        ]
      }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default function BusinessPricingPage() {
  useCanonical("/business");
  
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";

    document.title = "Business Plans - Multi-Site Cookie Consent Management | ConsentEase";
    if (metaDescription) {
      metaDescription.setAttribute("content", "Manage cookie consent for multiple websites. Plans from €19/month. White-label, bulk cookie scanning, and agency tools included.");
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    const origOgTitle = ogTitle?.getAttribute("content") || "";
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const origOgDesc = ogDescription?.getAttribute("content") || "";
    if (ogTitle) ogTitle.setAttribute("content", "Business Plans - Multi-Site Cookie Consent Management | ConsentEase");
    if (ogDescription) ogDescription.setAttribute("content", "Manage cookie consent for multiple websites. Plans from €19/month. White-label, bulk cookie scanning, and agency tools included.");

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const origTwTitle = twitterTitle?.getAttribute("content") || "";
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const origTwDesc = twitterDescription?.getAttribute("content") || "";
    if (twitterTitle) twitterTitle.setAttribute("content", "Business Plans - Multi-Site Cookie Consent | ConsentEase");
    if (twitterDescription) twitterDescription.setAttribute("content", "Manage cookie consent for multiple websites. White-label, bulk cookie scanning, and agency tools.");

    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
      if (ogTitle) ogTitle.setAttribute("content", origOgTitle);
      if (ogDescription) ogDescription.setAttribute("content", origOgDesc);
      if (twitterTitle) twitterTitle.setAttribute("content", origTwTitle);
      if (twitterDescription) twitterDescription.setAttribute("content", origTwDesc);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      <BusinessSchema />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2">
            <img src="/consentease-logo.webp" alt="ConsentEase" className="h-8 w-8 object-contain" />
            ConsentEase
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" data-testid="link-home">Home</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" data-testid="link-pricing">Pricing</Button>
            </Link>
            <Link href="/login">
              <Button data-testid="button-login">Log In</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        {/* Hero */}
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
            <Buildings size={16} />
            Multi-Site Plans
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Cookie consent for teams and agencies
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Manage compliance across multiple websites with advanced tools, 
            white-label options, and dedicated support.
          </p>
        </div>

        {/* Value props */}
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-display font-bold text-center mb-8">Everything you need for multi-site compliance</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, title: "Multi-Site Management", desc: "Manage 5 to 100 websites from one dashboard" },
              { icon: Shield, title: "White Label", desc: "Remove ConsentEase branding for your clients" },
              { icon: Lightning, title: "Bulk Cookie Scanning", desc: "Scan up to 100 sites/day to keep every banner compliant" },
              { icon: Users, title: "Client Management", desc: "Organize and manage client websites efficiently" },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6">
                  <item.icon size={32} className="text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-background rounded-2xl shadow-xl border overflow-hidden">
            <PlanComparisonTable mode="multi" />
          </div>
          
          <div className="mt-8 text-center space-y-4">
            <p className="text-muted-foreground">
              Need a custom plan? <a href="mailto:support@consentease.io" className="text-primary underline">Contact us</a> for enterprise pricing.
            </p>
            <p className="text-sm text-muted-foreground">
              Just one website? <Link href="/pricing" className="text-primary underline">View our single-site plans</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ConsentEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
