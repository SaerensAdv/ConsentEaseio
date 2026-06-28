import { useEffect } from "react";
import { Link } from "wouter";
import { useCanonical } from "@/hooks/use-canonical";
import { Check, ArrowRight, Lightning, Clock, Headset } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PlanComparisonTable from "@/components/PlanComparisonTable";

const PRICING_FAQS = [
  {
    question: "Is there a free trial?",
    answer: "Yes — every plan comes with a 7-day free trial. A payment method is required at signup, but you won't be charged until the trial ends, and you can cancel any time during the trial from your dashboard."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. All plans are month-to-month with no long-term contracts. You can cancel at any time from your dashboard. If you switch to annual billing, you save 2 months — that's the only commitment."
  },
  {
    question: "What happens when I exceed my pageview limit?",
    answer: "We don't cut off your banner or charge overage fees. If you consistently exceed your limit, we'll reach out to suggest upgrading to the next plan. Your visitors' consent experience is never interrupted."
  },
  {
    question: "Do I need a developer to set up ConsentEase?",
    answer: "No. Setup takes about 2 minutes: paste one script tag into your website's HTML, customize your banner in our visual editor, and you're done. Works on WordPress, Shopify, Wix, Webflow, and any other platform."
  },
  {
    question: "Is Google Consent Mode v2 included?",
    answer: "Yes, Google Consent Mode v2 is included in every plan at no extra cost. It activates automatically — no additional configuration needed. This keeps your Google Ads and Analytics compliant with EU regulations."
  },
  {
    question: "What's the difference between Starter and Solo?",
    answer: "Starter (€3/month) gives you a basic cookie banner with 10,000 monthly pageviews. Solo (€7/month) adds the visual banner builder, consent analytics dashboard, and 25,000 monthly pageviews. Both include GDPR/CCPA compliance and Google Consent Mode v2."
  },
  {
    question: "Are prices excluding VAT?",
    answer: "Yes, all displayed prices are excluding VAT. EU customers will be charged applicable VAT at checkout based on their country. Business customers with a valid VAT number can have reverse-charge applied."
  },
];

function PricingFAQSchema() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": PRICING_FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}

function PricingSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "ConsentEase Cookie Consent Management",
    "description": "Affordable GDPR/CCPA cookie consent management platform with visual banner builder, Google Consent Mode v2, and consent analytics.",
    "brand": {
      "@type": "Brand",
      "name": "ConsentEase"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Starter",
        "description": "Basic cookie consent for a single website. Includes Google Consent Mode v2 and GDPR/CCPA compliance.",
        "price": "3",
        "priceCurrency": "EUR",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://consentease.io/pricing"
      },
      {
        "@type": "Offer",
        "name": "Solo",
        "description": "Perfect for single websites. Includes 1 website, visual banner builder, Google Consent Mode v2, and consent analytics.",
        "price": "7",
        "priceCurrency": "EUR",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://consentease.io/pricing"
      },
      {
        "@type": "Offer",
        "name": "Premium",
        "description": "Premium cookie consent for a single website. Includes branding removal, priority support, and 100K monthly views.",
        "price": "12",
        "priceCurrency": "EUR",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://consentease.io/pricing"
      },
      {
        "@type": "Offer",
        "name": "Pro",
        "description": "For growing businesses. Includes up to 5 websites, all Solo features plus priority support and advanced analytics.",
        "price": "19",
        "priceCurrency": "EUR",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://consentease.io/pricing"
      },
      {
        "@type": "Offer",
        "name": "Agency",
        "description": "For agencies and enterprises. Includes up to 25 websites, white-label options, and dedicated support.",
        "price": "59",
        "priceCurrency": "EUR",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://consentease.io/pricing"
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

export default function PricingPage() {
  useCanonical("/pricing");
  
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = ogTitle?.getAttribute("content") || "";
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const originalOgDescription = ogDescription?.getAttribute("content") || "";

    document.title = "Pricing - Cookie Consent from €3/month | ConsentEase";
    if (metaDescription) {
      metaDescription.setAttribute("content", "Simple, transparent pricing for GDPR cookie consent. Starting at €3/month. Save with annual billing — 2 months free. No hidden fees, cancel anytime.");
    }
    if (ogTitle) ogTitle.setAttribute("content", "ConsentEase Pricing - Affordable Cookie Consent");
    if (ogDescription) ogDescription.setAttribute("content", "GDPR compliance from €3/month. Save with annual billing. 7-day free trial on every plan. No hidden fees.");

    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
      if (ogTitle) ogTitle.setAttribute("content", originalOgTitle);
      if (ogDescription) ogDescription.setAttribute("content", originalOgDescription);
    };
  }, []);

  return (
    <>
      <PricingSchema />
      <PricingFAQSchema />
      <div className="min-h-screen bg-background font-sans">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2">
              <img src="/consentease-logo.webp" alt="ConsentEase" className="h-8 w-8 object-contain" />
              ConsentEase
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" data-testid="link-home">Home</Button>
              </Link>
              <Link href="/business">
                <Button variant="ghost" data-testid="link-business">Business</Button>
              </Link>
              <Link href="/onboarding">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            Simple Pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            One price. No surprises.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            No hidden fees, no per-pageview charges, no enterprise sales calls. 
            Just pick a plan and get compliant today.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 mb-20">
          <PlanComparisonTable showCTA={true} mode="single" />
        </div>

        <div className="text-center mb-8">
          <p className="text-muted-foreground">
            Managing multiple websites?{" "}
            <Link href="/business" className="text-primary hover:underline font-medium">
              View our Multi-Site plans
            </Link>
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-2xl font-display font-bold text-center mb-4">Add-ons</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Extend your compliance with our policy generators. One-time purchase, no subscription.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">EUR 9</div>
                  <div className="text-sm text-muted-foreground">one-time</div>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-center">Privacy Policy</h3>
                <p className="text-muted-foreground text-sm text-center mb-4">
                  GDPR/CCPA compliant privacy policy in 8 languages.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Customizable template</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Multi-language support</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Instant embed</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary">EUR 15</div>
                  <div className="text-sm text-muted-foreground">bundle - save EUR 3</div>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-center">Both Policies</h3>
                <p className="text-muted-foreground text-sm text-center mb-4">
                  Privacy Policy + Cookie Policy in one purchase.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Two policies for one price</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Auto-sync with cookies</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Best value</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">EUR 9</div>
                  <div className="text-sm text-muted-foreground">one-time</div>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-center">Cookie Policy</h3>
                <p className="text-muted-foreground text-sm text-center mb-4">
                  Auto-synced with your detected cookies.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Syncs with scanner</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Category explanations</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Third-party disclosures</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Agency plans include 25 policies/month. Agency Pro (EUR 129/month) includes 100 policies/month.
          </p>
          <p className="text-center text-xs text-muted-foreground mt-1">All prices excl. VAT</p>
        </div>

        <div className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-2xl font-display font-bold text-center mb-12">Why teams choose ConsentEase</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Clock size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">2-Minute Setup</h3>
                <p className="text-muted-foreground">
                  Add one script, customize your banner, and you're done. No developers needed.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Lightning size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Google Consent Mode v2</h3>
                <p className="text-muted-foreground">
                  Full compliance with Google's latest requirements. No extra setup required.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Headset size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Direct Support</h3>
                <p className="text-muted-foreground">
                  Real humans, real answers. No ticket queues or chatbots.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6">
          <Card className="bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-10 text-center relative z-10">
              <h2 className="text-2xl font-display font-bold mb-4">Ready to get compliant?</h2>
              <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
                7-day free trial on every plan. Cancel any time during the trial.
              </p>
              <Link href="/onboarding">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Start Free Trial <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto px-6 mt-20 mb-20">
          <h2 className="text-2xl font-display font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {PRICING_FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-medium" data-testid={`faq-trigger-${i}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="max-w-3xl mx-auto px-6 mt-16 text-center">
          <p className="text-muted-foreground">
            Wondering how we compare to other solutions?{" "}
            <Link href="/compare" className="text-primary hover:underline">
              See our comparison pages
            </Link>
          </p>
        </div>
      </main>

      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 ConsentEase. All rights reserved.</p>
          <a href="https://saerensadvertising.com?utm_source=consentease&utm_medium=footer&utm_campaign=branding" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xs">A product by</span>
            <img src="/saerens-logo.png" alt="Saerens Advertising" className="h-5" />
          </a>
        </div>
      </footer>
      </div>
    </>
  );
}
