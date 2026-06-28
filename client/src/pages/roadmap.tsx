import { useEffect } from "react";
import { Link } from "wouter";
import { useCanonical } from "@/hooks/use-canonical";
import { motion } from "framer-motion";
import type { ElementType } from "react";
import {
  ArrowLeft,
  Sparkle,
  Rocket,
  Globe,
  Lightning,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Storefront,
  Brain,
  Plugs,
  DeviceMobile,
  ChartLineUp,
  Envelope,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface RoadmapPhase {
  label: string;
  period: string;
  status: "shipped" | "building" | "next";
  items: {
    title: string;
    description: string;
    icon: ElementType;
    shipped?: boolean;
  }[];
}

const phases: RoadmapPhase[] = [
  {
    label: "Already live",
    period: "Available now",
    status: "shipped",
    items: [
      {
        title: "Visual banner builder",
        description: "Design your cookie banner with 20+ styling options and see changes in real-time. No code needed.",
        icon: Sparkle,
        shipped: true,
      },
      {
        title: "Automatic cookie scanner",
        description: "We scan your website and detect all cookies automatically, so you know exactly what to disclose.",
        icon: ShieldCheck,
        shipped: true,
      },
      {
        title: "Google Consent Mode v2",
        description: "Full integration with Google's latest consent framework. Your ads and analytics keep working compliantly.",
        icon: ChartLineUp,
        shipped: true,
      },
      {
        title: "Multi-language banners",
        description: "Show your banner in your visitor's language. 8 languages included, with auto-detection.",
        icon: Globe,
        shipped: true,
      },
      {
        title: "Agency management",
        description: "Manage all your clients' websites from one dashboard. Bulk updates, shared analytics, and client onboarding.",
        icon: Storefront,
        shipped: true,
      },
      {
        title: "Privacy & cookie policy generator",
        description: "Generate legally compliant policies in 8 languages. One-time purchase or included in Agency plans.",
        icon: ShieldCheck,
        shipped: true,
      },
    ],
  },
  {
    label: "Building now",
    period: "Coming this quarter",
    status: "building",
    items: [
      {
        title: "Smart cookie classification",
        description: "AI automatically categorises your cookies and suggests the right privacy settings — so you don't have to guess.",
        icon: Brain,
      },
      {
        title: "Lightning-fast banner loading",
        description: "Your banner loads from edge servers worldwide in under 50ms. Zero impact on your site speed.",
        icon: Lightning,
      },
      {
        title: "WordPress plugin",
        description: "Install ConsentEase directly from the WordPress plugin directory. One click, fully configured.",
        icon: Plugs,
      },
      {
        title: "Shopify app",
        description: "A native Shopify app that matches your store's look and handles checkout consent automatically.",
        icon: Storefront,
      },
    ],
  },
  {
    label: "Up next",
    period: "On the horizon",
    status: "next",
    items: [
      {
        title: "A/B testing for banners",
        description: "Test different banner designs and automatically use the one that gets the best consent rates.",
        icon: Rocket,
      },
      {
        title: "API & webhooks",
        description: "Connect ConsentEase to your existing tools. Get notified in real-time when visitors make consent choices.",
        icon: Plugs,
      },
      {
        title: "Mobile SDKs",
        description: "Native consent management for your iOS and Android apps, with beautiful built-in UI.",
        icon: DeviceMobile,
      },
      {
        title: "Privacy-first analytics",
        description: "Cookie-free visitor insights that don't require consent. See what matters without compromising privacy.",
        icon: ChartLineUp,
      },
    ],
  },
];

const phaseStyles = {
  shipped: {
    accent: "text-green-600",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    dot: "bg-green-500",
    badge: "bg-green-500/10 text-green-700",
  },
  building: {
    accent: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    dot: "bg-primary",
    badge: "bg-primary/10 text-primary",
  },
  next: {
    accent: "text-amber-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-700",
  },
};

function RoadmapSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "Product Roadmap | ConsentEase",
        "description": "See what we're building next at ConsentEase. From smart cookie classification to WordPress and Shopify integrations — privacy compliance keeps getting easier.",
        "url": "https://consentease.io/roadmap",
        "isPartOf": { "@id": "https://consentease.io/#website" },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://consentease.io" },
          { "@type": "ListItem", "position": 2, "name": "Roadmap", "item": "https://consentease.io/roadmap" },
        ],
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default function RoadmapPage() {
  useCanonical("/roadmap");

  useEffect(() => {
    document.title = "Product Roadmap | ConsentEase";

    const desc = "See what we're building next at ConsentEase. From smart cookie classification to WordPress and Shopify integrations — privacy compliance keeps getting easier.";
    const img = "https://consentease.io/opengraph.jpg";

    const metaMap: Record<string, string> = {
      'meta[name="description"]': desc,
      'meta[property="og:title"]': "Product Roadmap | ConsentEase",
      'meta[property="og:description"]': desc,
      'meta[property="og:image"]': img,
      'meta[name="twitter:card"]': "summary_large_image",
      'meta[name="twitter:title"]': "Product Roadmap | ConsentEase",
      'meta[name="twitter:description"]': desc,
    };

    Object.entries(metaMap).forEach(([selector, content]) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute("content", content);
    });

    return () => {
      document.title = "ConsentEase - Privacy Compliance for Humans";
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <RoadmapSchema />

      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-display font-bold flex items-center gap-2">
            <img src="/consentease-logo.webp" alt="ConsentEase" className="h-8 w-8 object-contain" />
            ConsentEase
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="link-back-home">
              <ArrowLeft size={16} /> Back
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
            <Rocket size={16} weight="duotone" />
            What we're working on
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
            Making compliance <span className="text-gradient">even simpler</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're building the tools small businesses actually need to stay compliant — without the complexity or the enterprise price tag.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-20">
            {phases.map((phase, phaseIdx) => {
              const style = phaseStyles[phase.status];

              return (
                <motion.section
                  key={phase.label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: phaseIdx * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-8 relative">
                    <div className={`hidden md:flex w-16 h-16 rounded-2xl ${style.bg} items-center justify-center shrink-0 relative z-10`}>
                      {phase.status === "shipped" && <CheckCircle size={28} weight="duotone" className={style.accent} />}
                      {phase.status === "building" && <Sparkle size={28} weight="duotone" className={style.accent} />}
                      {phase.status === "next" && <Clock size={28} weight="duotone" className={style.accent} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl md:text-3xl font-display font-bold">{phase.label}</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${style.badge}`}>
                          {phase.period}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="md:pl-20 grid gap-4">
                    {phase.items.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.05 }}
                          className={`group bg-card border border-border rounded-xl p-5 md:p-6 hover:border-primary/30 transition-all duration-200 hover:shadow-sm`}
                        >
                          <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center shrink-0`}>
                              <Icon size={20} weight="duotone" className={style.accent} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">{item.title}</h3>
                                {item.shipped && (
                                  <CheckCircle size={16} weight="fill" className="text-green-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border rounded-2xl p-8 md:p-12"
        >
          <Envelope size={32} weight="duotone" className="text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-display font-bold mb-3">Missing something?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We build what our customers need most. Tell us what would make ConsentEase perfect for your business.
          </p>
          <Link href="/contact">
            <Button className="bg-primary hover:bg-primary/90 gap-2" data-testid="button-request-feature">
              Share your idea <ArrowRight size={16} />
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
