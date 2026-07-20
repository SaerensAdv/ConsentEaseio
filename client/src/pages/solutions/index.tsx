import { useEffect, type ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCanonical } from "@/hooks/use-canonical";
import { PLATFORMS, COUNTRIES } from "@/data/solutions";
import { Shield, ArrowRight, Globe, Code } from "@phosphor-icons/react";
import { SiWordpress, SiShopify, SiWix, SiWebflow, SiSquarespace, SiNextdotjs } from "react-icons/si";

const logoImage = "/consentease-logo.webp";

const platformIcons: Record<string, ReactNode> = {
  wordpress: <SiWordpress size={28} />,
  shopify: <SiShopify size={28} />,
  wix: <SiWix size={28} />,
  webflow: <SiWebflow size={28} />,
  squarespace: <SiSquarespace size={28} />,
  nextjs: <SiNextdotjs size={28} />,
  code: <Code size={28} />,
};

export default function SolutionsIndex() {
  useCanonical("/solutions");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const title = "Cookie Consent Solutions by Platform & Country | ConsentEase";
    const desc = "GDPR cookie consent solutions for WordPress, Shopify, Wix, Webflow & more. Country-specific compliance guides for Belgium, Netherlands, Germany, France, UK, Spain, Italy & Austria.";
    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute("content", desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", desc);
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", title);
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute("content", desc);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50" role="navigation">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src={logoImage} alt="ConsentEase" className="h-8 w-8" />
              <span className="font-heading text-xl font-bold">ConsentEase</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/scan"><Button variant="ghost" size="sm">Free Scan</Button></Link>
              <Link href="/onboarding"><Button size="sm">Start Free Trial</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-4">Cookie Consent for Every Platform & Country</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">ConsentEase works with any website platform and meets privacy regulations worldwide. Find setup guides for your platform and compliance requirements for your country.</p>
          </div>

          <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2"><Code size={24} className="text-primary" />By Platform</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
            {PLATFORMS.map((platform) => (
              <Link key={platform.slug} href={`/solutions/${platform.slug}`}>
                <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6 text-center">
                    <div className="flex justify-center mb-3 text-primary">{platformIcons[platform.icon] || <Globe size={28} />}</div>
                    <h3 className="font-semibold mb-1">{platform.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{platform.seo.description.split('.')[0]}.</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2"><Globe size={24} className="text-primary" />By Country</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
            {COUNTRIES.map((country) => (
              <Link key={country.slug} href={`/compliance/${country.slug}`}>
                <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6 text-center">
                    <span className="text-3xl mb-2 block">{country.flag}</span>
                    <h3 className="font-semibold mb-1">{country.country}</h3>
                    <p className="text-xs text-muted-foreground">{country.regulation}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-8 text-center">
              <Shield size={36} className="text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold mb-2">Get Started Today</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">One solution for all platforms and countries. Set up in 2 minutes, compliant from day one.</p>
              <Link href="/onboarding"><Button size="lg" data-testid="button-start-trial">Start Free Trial<ArrowRight size={18} className="ml-2" /></Button></Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} ConsentEase. All rights reserved.</span>
            <div className="flex items-center gap-4"><Link href="/privacy" className="hover:text-foreground">Privacy</Link><Link href="/terms" className="hover:text-foreground">Terms</Link></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
