import { Link } from "wouter";
import { Shield, ArrowLeft, Palette, Code, BarChart3, Zap, Globe, Lock, Smartphone, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Palette,
    title: "Visual Banner Builder",
    description: "Design your perfect consent banner with our intuitive visual editor. Customize colors, fonts, positions, animations, and more - no coding required.",
    highlights: [
      "20+ customization options",
      "Live preview (desktop & mobile)",
      "Multiple layout options",
      "Brand color matching"
    ]
  },
  {
    icon: Code,
    title: "Google Consent Mode v2",
    description: "Full support for Google Consent Mode v2 with proper initialization order. Works seamlessly with Google Analytics, Google Ads, and Google Tag Manager.",
    highlights: [
      "Consent defaults before GTM",
      "Automatic consent signals",
      "Ad personalization support",
      "Analytics measurement controls"
    ]
  },
  {
    icon: BarChart3,
    title: "Consent Analytics",
    description: "Understand how visitors interact with your consent banner. Track acceptance rates, optimize messaging, and prove compliance.",
    highlights: [
      "Real-time consent tracking",
      "Acceptance/rejection rates",
      "Geographic insights",
      "Trend analysis over time"
    ]
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Our lightweight script won't slow down your website. Asynchronous loading ensures zero impact on page performance.",
    highlights: [
      "Under 10KB script size",
      "Async loading",
      "CDN delivery",
      "No render blocking"
    ]
  },
  {
    icon: Globe,
    title: "Multi-Region Compliance",
    description: "One solution for GDPR, CCPA, and ePrivacy Directive. Automatically adapt your consent requirements based on visitor location.",
    highlights: [
      "GDPR compliant",
      "CCPA/CPRA ready",
      "ePrivacy Directive support",
      "Geo-targeting (coming soon)"
    ]
  },
  {
    icon: Lock,
    title: "Privacy-First Architecture",
    description: "We practice what we preach. Your data and your visitors' consent choices are handled with the highest security standards.",
    highlights: [
      "EU data residency",
      "Encrypted storage",
      "No personal data collection",
      "SOC 2 aligned practices"
    ]
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Banners that look great and work perfectly on any device. Responsive design ensures a seamless experience for all visitors.",
    highlights: [
      "Responsive layouts",
      "Touch-friendly buttons",
      "Mobile preview mode",
      "Optimized for all screens"
    ]
  },
  {
    icon: Settings,
    title: "Easy Integration",
    description: "Works with any website platform. Simple script installation with detailed guides for WordPress, Shopify, Wix, and more.",
    highlights: [
      "One-line installation",
      "Platform guides included",
      "GTM compatible",
      "SPA/React support"
    ]
  }
];

const comparisonData = [
  { feature: "Monthly cost", consentease: "From €5", onetrust: "From $30,000/year" },
  { feature: "Setup time", consentease: "2 minutes", onetrust: "2-4 weeks" },
  { feature: "Technical expertise required", consentease: "None", onetrust: "Dedicated team" },
  { feature: "Google Consent Mode v2", consentease: "Yes", onetrust: "Yes" },
  { feature: "Visual customization", consentease: "20+ options", onetrust: "Limited without dev" },
  { feature: "Contract length", consentease: "Monthly", onetrust: "Annual minimum" },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2" data-testid="link-logo-home">
            <div className="w-8 h-8 rounded-lg bg-gradient flex items-center justify-center text-white">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            ConsentEase
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Everything you need for <span className="text-gradient">cookie compliance</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional consent management without the enterprise complexity. 
              Built for small businesses, priced for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-muted/30 rounded-2xl border border-border/50 p-8 hover:border-primary/30 transition-colors"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, hIndex) => (
                    <li key={hIndex} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                ConsentEase vs Enterprise Solutions
              </h2>
              <p className="text-muted-foreground">
                See how we compare to enterprise consent platforms like OneTrust
              </p>
            </div>

            <div className="bg-muted/30 rounded-2xl border border-border/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold bg-primary/5">
                      <span className="text-primary">ConsentEase</span>
                    </th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">Enterprise CMP</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-b border-border/50 last:border-0">
                      <td className="p-4 text-muted-foreground">{row.feature}</td>
                      <td className="p-4 text-center bg-primary/5 font-medium">{row.consentease}</td>
                      <td className="p-4 text-center text-muted-foreground">{row.onetrust}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center mt-8">
              <Link href="/compare">
                <Button variant="outline" data-testid="link-full-comparison">
                  See Full Comparison
                </Button>
              </Link>
            </div>
          </section>

          <section className="bg-gradient rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-display font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of websites using ConsentEase for simple, affordable cookie compliance.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button variant="secondary" size="lg" data-testid="button-start-free-trial">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/#pricing">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" data-testid="button-view-pricing">
                  View Pricing
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2025 ConsentEase. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-primary">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
