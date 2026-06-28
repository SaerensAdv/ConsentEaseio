import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCanonical } from "@/hooks/use-canonical";
import { Shield, Lightning, Palette, Globe, ArrowRight, CheckCircle, Clock, ChartBar, Lock, Code, Cookie } from "@phosphor-icons/react";

const logoImage = "/consentease-logo.webp";

export default function PoweredByPage() {
  useCanonical("/powered-by");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    document.title = "This Website Uses ConsentEase — Cookie Consent Made Simple";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "ConsentEase is the affordable cookie consent platform trusted by 500+ small businesses. GDPR, CCPA, Google Consent Mode v2. From €3/month. 2-minute setup.");
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "ConsentEase — Cookie Consent Banner for Small Businesses");
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", "The cookie consent banner used by this website. GDPR compliant in 2 minutes. From €3/month.");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src={logoImage} alt="ConsentEase" className="h-8 w-8" />
              <span className="font-heading text-xl font-bold">ConsentEase</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/scan">
                <Button variant="ghost" size="sm" data-testid="link-scan">Free Scan</Button>
              </Link>
              <Link href="/onboarding">
                <Button size="sm" data-testid="link-signup">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield size={16} />
            Trusted by 500+ Small Businesses
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight mb-4">
            This Website Uses ConsentEase
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            The cookie consent banner you just saw is powered by ConsentEase — 
            the affordable, easy-to-use cookie consent platform built for small businesses.
            Want the same for your website?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/onboarding">
              <Button size="lg" data-testid="button-get-started">
                Get Started — From €3/month
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/scan">
              <Button variant="outline" size="lg" data-testid="button-scan-website">
                Scan Your Website Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-center mb-10">
            Why Small Businesses Choose ConsentEase
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "Live in 2 Minutes",
                description: "Add your domain, customize your banner, paste one line of code. No developers, no complex setup.",
              },
              {
                icon: Shield,
                title: "Full GDPR/CCPA Compliance",
                description: "Pre-configured for EU, UK, and US privacy laws. Google Consent Mode v2 included.",
              },
              {
                icon: Palette,
                title: "Matches Your Brand",
                description: "25+ design customizations. Colors, fonts, animations — your banner, your style.",
              },
              {
                icon: Cookie,
                title: "Auto Cookie Scanning",
                description: "Automatically detects and categorizes all cookies on your website. No manual setup.",
              },
              {
                icon: ChartBar,
                title: "Analytics Dashboard",
                description: "See how visitors interact with your banner. Track consent rates and optimize.",
              },
              {
                icon: Lock,
                title: "Audit-Ready Logs",
                description: "Every consent is timestamped and stored. Ready for regulators when they ask.",
              },
            ].map((feature) => (
              <Card key={feature.title}>
                <CardContent className="pt-6">
                  <feature.icon size={28} className="text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-center mb-10">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Globe, title: "Add Your Domain", description: "Enter your website URL. Our scanner detects all cookies and tracking scripts automatically." },
              { step: "02", icon: Palette, title: "Customize Your Banner", description: "Match your brand with colors, fonts, and layout options. Preview in real-time." },
              { step: "03", icon: Code, title: "Copy One Script Tag", description: "Paste a single line of code into your website. Works with WordPress, Shopify, Wix, and more." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-center mb-10">
            Pricing That Makes Sense
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "Starter", price: "€3", period: "/month", features: ["1 website", "10,000 views/month", "Auto cookie scanning"] },
              { name: "Solo", price: "€7", period: "/month", features: ["3 websites", "25,000 views/month", "Custom branding"], highlight: true },
              { name: "Premium", price: "€12", period: "/month", features: ["10 websites", "100,000 views/month", "Priority support"] },
            ].map((plan) => (
              <Card key={plan.name} className={plan.highlight ? "border-primary shadow-md" : ""}>
                <CardContent className="pt-6 text-center">
                  <h3 className="font-semibold mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">excl. VAT</p>
                  <ul className="space-y-2 text-sm text-left">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Save 2 months with annual billing. <Link href="/pricing" className="text-primary hover:underline">See all plans</Link>
          </p>
        </div>
      </section>

      <section className="py-16 border-t bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-heading font-bold mb-4">
            Ready to Make Your Website Compliant?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join 500+ small businesses who trust ConsentEase for their cookie consent management. 
            Set up in 2 minutes, compliant from day one.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/onboarding">
              <Button size="lg" data-testid="button-cta-signup">
                Start Free 7-Day Trial
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/compare">
              <Button variant="outline" size="lg" data-testid="button-compare">
                Compare Alternatives
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} ConsentEase. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
