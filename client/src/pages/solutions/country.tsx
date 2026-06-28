import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCanonical } from "@/hooks/use-canonical";
import { getCountryBySlug, COUNTRIES } from "@/data/solutions";
import { Shield, ArrowRight, CheckCircle, Warning, Scales, MagnifyingGlass, Globe } from "@phosphor-icons/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const logoImage = "/consentease-logo.webp";

function CountryJsonLd({ country, slug }: { country: string; slug: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": `Cookie Compliance for ${country}`,
        "url": `https://consentease.io/compliance/${slug}`,
        "description": `Complete guide to cookie consent compliance for websites in ${country}. Understand local regulations and get compliant today.`,
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://consentease.io" },
          { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://consentease.io/solutions" },
          { "@type": "ListItem", "position": 3, "name": country, "item": `https://consentease.io/compliance/${slug}` },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function CountrySolutionPage() {
  const params = useParams<{ slug: string }>();
  const country = getCountryBySlug(params.slug || "");
  const currentYear = new Date().getFullYear();

  useCanonical(`/compliance/${params.slug}`);

  useEffect(() => {
    if (country) {
      document.title = country.seo.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute("content", country.seo.description);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", country.seo.title);
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.setAttribute("content", country.seo.description);
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute("content", country.seo.title);
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) twitterDescription.setAttribute("content", country.seo.description);
    }
  }, [country]);

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Country Not Found</h1>
          <Link href="/solutions">
            <Button>View All Countries</Button>
          </Link>
        </div>
      </div>
    );
  }

  const otherCountries = COUNTRIES.filter(c => c.slug !== country.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <CountryJsonLd country={country.country} slug={country.slug} />

      <nav className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50" role="navigation">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src={logoImage} alt="ConsentEase" className="h-8 w-8" />
              <span className="font-heading text-xl font-bold">ConsentEase</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/scan">
                <Button variant="ghost" size="sm">Free Scan</Button>
              </Link>
              <Link href="/onboarding">
                <Button size="sm">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-5xl mb-4 block">{country.flag}</span>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-4">
              {country.headline}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {country.description}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm">
              <Scales size={14} />
              {country.regulation}
            </div>
          </div>

          <Card className="mb-10 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="py-6">
              <h2 className="text-lg font-heading font-bold mb-3 flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <Warning size={20} />
                Penalties for Non-Compliance
              </h2>
              <p className="text-sm text-amber-800 dark:text-amber-300">{country.penalties}</p>
            </CardContent>
          </Card>

          <div className="mb-10">
            <h2 className="text-xl font-heading font-bold mb-4">
              Cookie Consent Requirements in {country.country}
            </h2>
            <div className="space-y-3">
              {country.requirements.map((req, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{req}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="mb-10 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <h2 className="text-lg font-heading font-bold mb-3">
                How ConsentEase Meets {country.country} Requirements
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Prior consent for non-essential cookies",
                  "First-layer reject button",
                  "Granular cookie categories",
                  "Consent record storage",
                  "Automatic cookie scanning",
                  "Google Consent Mode v2",
                  "Geo-targeted banner display",
                  "Easy consent withdrawal",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mb-10">
            <h2 className="text-xl font-heading font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {country.faqItems.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm font-medium">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <Card className="border-primary/30 bg-primary/5 mb-10">
            <CardContent className="py-8 text-center">
              <Shield size={36} className="text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold mb-2">
                Get Compliant in {country.country} Today
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                ConsentEase is pre-configured to meet {country.country}'s cookie consent requirements. 
                Set up in 2 minutes. From €3/month.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/onboarding">
                  <Button size="lg" data-testid="button-start-trial">
                    Start Free Trial
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/scan">
                  <Button variant="outline" size="lg" data-testid="button-scan">
                    <MagnifyingGlass size={18} className="mr-2" />
                    Scan Your Site Free
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-heading font-bold mb-4">
              Cookie Compliance in Other Countries
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {otherCountries.map((c) => (
                <Link key={c.slug} href={`/compliance/${c.slug}`}>
                  <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
                    <CardContent className="pt-4 pb-4 text-center">
                      <span className="text-2xl mb-2 block">{c.flag}</span>
                      <span className="text-sm font-medium">{c.country}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} ConsentEase. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
