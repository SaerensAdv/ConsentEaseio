import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCanonical } from "@/hooks/use-canonical";
import { getPlatformBySlug, PLATFORMS } from "@/data/solutions";
import { Shield, ArrowRight, CheckCircle, Code, Globe, MagnifyingGlass, ArrowSquareOut } from "@phosphor-icons/react";
import { SiWordpress, SiShopify, SiWix, SiWebflow, SiSquarespace, SiNextdotjs } from "react-icons/si";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const logoImage = "/consentease-logo.webp";

const platformIcons: Record<string, JSX.Element> = {
  wordpress: <SiWordpress size={40} />,
  shopify: <SiShopify size={40} />,
  wix: <SiWix size={40} />,
  webflow: <SiWebflow size={40} />,
  squarespace: <SiSquarespace size={40} />,
  nextjs: <SiNextdotjs size={40} />,
  code: <Code size={40} />,
};

function PlatformJsonLd({ name, slug }: { name: string; slug: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": `Cookie Consent Banner for ${name}`,
        "url": `https://consentease.io/solutions/${slug}`,
        "description": `Add a GDPR/CCPA compliant cookie consent banner to your ${name} website. Auto cookie scanning, consent logging, Google Consent Mode v2.`,
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://consentease.io" },
          { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://consentease.io/solutions" },
          { "@type": "ListItem", "position": 3, "name": name, "item": `https://consentease.io/solutions/${slug}` },
        ],
      },
      {
        "@type": "HowTo",
        "name": `How to add cookie consent to ${name}`,
        "step": [
          { "@type": "HowToStep", "position": 1, "text": "Sign up for ConsentEase and add your domain" },
          { "@type": "HowToStep", "position": 2, "text": "Customize your cookie consent banner design" },
          { "@type": "HowToStep", "position": 3, "text": `Add the ConsentEase script tag to your ${name} site` },
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

export default function PlatformSolutionPage() {
  const params = useParams<{ slug: string }>();
  const platform = getPlatformBySlug(params.slug || "");
  const currentYear = new Date().getFullYear();

  useCanonical(`/solutions/${params.slug}`);

  useEffect(() => {
    if (platform) {
      document.title = platform.seo.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute("content", platform.seo.description);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", platform.seo.title);
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.setAttribute("content", platform.seo.description);
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute("content", platform.seo.title);
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) twitterDescription.setAttribute("content", platform.seo.description);
    }
  }, [platform]);

  if (!platform) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Platform Not Found</h1>
          <Link href="/solutions">
            <Button>View All Platforms</Button>
          </Link>
        </div>
      </div>
    );
  }

  const otherPlatforms = PLATFORMS.filter(p => p.slug !== platform.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <PlatformJsonLd name={platform.name} slug={platform.slug} />

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
            <div className="flex justify-center mb-4 text-primary">
              {platformIcons[platform.icon] || <Globe size={40} />}
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-4">
              {platform.headline}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {platform.description}
            </p>
          </div>

          <Card className="mb-10">
            <CardContent className="py-6">
              <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
                <Code size={22} className="text-primary" />
                Setup in 3 Steps
              </h2>
              <ol className="space-y-4">
                {platform.setupSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="mb-10">
            <h2 className="text-xl font-heading font-bold mb-4">
              Why ConsentEase for {platform.name}?
            </h2>
            <div className="space-y-3">
              {platform.specificBenefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-heading font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {platform.faqItems.map((faq, i) => (
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
                Make Your {platform.name} Site Compliant Today
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Join 500+ businesses using ConsentEase. Set up in 2 minutes, compliant from day one. 7-day free trial on every plan, cancel any time.
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
              Cookie Consent for Other Platforms
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {otherPlatforms.map((p) => (
                <Link key={p.slug} href={`/solutions/${p.slug}`}>
                  <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
                    <CardContent className="pt-4 pb-4 text-center">
                      <div className="flex justify-center mb-2 text-muted-foreground">
                        {platformIcons[p.icon] ? <span className="[&>svg]:w-6 [&>svg]:h-6">{platformIcons[p.icon]}</span> : <Globe size={24} />}
                      </div>
                      <span className="text-sm font-medium">{p.name}</span>
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
