import { Link } from "wouter";
import { motion } from "framer-motion";
import type { ElementType } from "react";
import { 
  Shield, 
  ArrowLeft, 
  FileText, 
  Cookie, 
  Sparkles, 
  Rocket, 
  Lock, 
  Globe, 
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  Star,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoadmapItem {
  title: string;
  description: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  status: "planned" | "in-progress" | "completed";
  type: "feature" | "add-on" | "integration";
  icon: ElementType;
  details: string[];
  pricing?: string;
}

const roadmap2026: RoadmapItem[] = [
  // Q1 - Completed & Near-term
  {
    title: "Multi-Language Banner Support",
    description: "Automatically detect visitor language and show localized consent banners in 8+ languages.",
    quarter: "Q1",
    status: "completed",
    type: "feature",
    icon: Globe,
    details: [
      "Auto-detect browser language",
      "8 languages included (EN, NL, FR, DE, ES, IT, PT, PL)",
      "Fallback translation system",
      "Live preview in configurator",
      "RTL language support coming soon"
    ]
  },
  {
    title: "Agency Management Platform",
    description: "Complete multi-tenant system for agencies to manage client websites at scale.",
    quarter: "Q1",
    status: "completed",
    type: "feature",
    icon: Lock,
    details: [
      "3-tier hierarchy: Agency → Account → Domain",
      "Aggregate analytics across all clients",
      "Bulk banner updates for efficiency",
      "Email invite system for client onboarding",
      "Public agency profiles with referral signup"
    ]
  },
  {
    title: "Privacy Policy Generator",
    description: "Generate legally compliant privacy policies tailored to your business and jurisdiction.",
    quarter: "Q1",
    status: "in-progress",
    type: "add-on",
    icon: FileText,
    details: [
      "GDPR, CCPA, and LGPD compliant templates",
      "Customizable sections based on your data practices",
      "Automatic updates when regulations change",
      "Multiple export formats (HTML, PDF, Markdown)",
      "Embed directly on your website with one click"
    ],
    pricing: "€9/one-time or included in Agency"
  },
  {
    title: "Cookie Policy Generator",
    description: "Create comprehensive cookie policies that automatically sync with your detected cookies.",
    quarter: "Q1",
    status: "planned",
    type: "add-on",
    icon: Cookie,
    details: [
      "Auto-syncs with your scanned cookies",
      "Explains each cookie category clearly",
      "Updates automatically when new cookies detected",
      "Includes third-party provider disclosures",
      "Direct integration with consent banner"
    ],
    pricing: "€9/one-time or included in Agency"
  },
  // Q2 - Competitive Advantages
  {
    title: "AI-Powered Cookie Classification",
    description: "Machine learning automatically categorizes detected cookies with 95%+ accuracy.",
    quarter: "Q2",
    status: "planned",
    type: "feature",
    icon: Sparkles,
    details: [
      "Automatic cookie purpose detection",
      "Learn from global cookie database",
      "Suggest optimal privacy settings",
      "Detect tracking scripts and pixels",
      "Compliance risk scoring per cookie"
    ]
  },
  {
    title: "Zero-Latency Edge Banner",
    description: "Banner served from edge locations worldwide for sub-50ms load times.",
    quarter: "Q2",
    status: "planned",
    type: "feature",
    icon: Zap,
    details: [
      "Global CDN deployment (200+ locations)",
      "No impact on Core Web Vitals",
      "Offline-first with service workers",
      "Compressed script under 5KB gzipped",
      "Async loading with no render blocking"
    ]
  },
  {
    title: "WordPress Plugin",
    description: "One-click WordPress integration with native admin panel configuration.",
    quarter: "Q2",
    status: "planned",
    type: "integration",
    icon: Package,
    details: [
      "Install directly from WordPress plugin directory",
      "Configure everything from WP admin",
      "Auto-sync with ConsentEase dashboard",
      "Compatible with popular caching plugins",
      "WooCommerce integration for e-commerce"
    ]
  },
  {
    title: "Shopify App",
    description: "Native Shopify app for e-commerce consent management with checkout integration.",
    quarter: "Q2",
    status: "planned",
    type: "integration",
    icon: Package,
    details: [
      "Install from Shopify App Store",
      "Theme-aware banner styling",
      "Checkout consent capture",
      "Marketing email consent sync",
      "Shopify Analytics integration"
    ]
  },
  // Q3 - Enterprise & Certification
  {
    title: "Google CMP Partner Certification",
    description: "Official Google Certified CMP Partner status for enhanced ad ecosystem integration.",
    quarter: "Q3",
    status: "in-progress",
    type: "feature",
    icon: Star,
    details: [
      "TCF 2.2 full compliance",
      "Google Consent Mode v2 certified",
      "Direct integration with Google Ads",
      "Enhanced measurement features",
      "Priority support from Google"
    ]
  },
  {
    title: "Consent Receipts & Blockchain Proof",
    description: "Tamper-proof consent records with optional blockchain verification for audits.",
    quarter: "Q3",
    status: "planned",
    type: "feature",
    icon: Lock,
    details: [
      "Cryptographically signed receipts",
      "Optional blockchain timestamping",
      "Regulator-ready export format",
      "Consent version history",
      "Third-party verification portal"
    ]
  },
  {
    title: "A/B Testing Engine",
    description: "Test different banner designs and measure impact on consent rates.",
    quarter: "Q3",
    status: "planned",
    type: "feature",
    icon: Rocket,
    details: [
      "Visual A/B test builder",
      "Statistical significance calculator",
      "Auto-winner selection",
      "Test copy, colors, positions",
      "Detailed conversion reports"
    ]
  },
  {
    title: "API Access & Webhooks",
    description: "Full REST API for custom integrations and real-time webhook notifications.",
    quarter: "Q3",
    status: "planned",
    type: "feature",
    icon: Rocket,
    details: [
      "RESTful API with OpenAPI docs",
      "Webhooks for consent events",
      "Bulk operations for agencies",
      "Rate limiting based on plan",
      "JavaScript & PHP SDKs"
    ]
  },
  // Q4 - Advanced & Enterprise
  {
    title: "Mobile SDK (iOS & Android)",
    description: "Native mobile SDKs for in-app consent management with beautiful UI components.",
    quarter: "Q4",
    status: "planned",
    type: "feature",
    icon: Package,
    details: [
      "Swift & Kotlin native libraries",
      "Pre-built UI components",
      "ATT (App Tracking Transparency) integration",
      "Sync with web consent preferences",
      "React Native & Flutter wrappers"
    ]
  },
  {
    title: "Privacy-First Analytics Alternative",
    description: "Cookie-free analytics that doesn't require consent, fully GDPR compliant.",
    quarter: "Q4",
    status: "planned",
    type: "add-on",
    icon: Zap,
    details: [
      "No cookies, no consent needed",
      "Privacy-focused visitor insights",
      "Page views, referrers, devices",
      "Real-time dashboard",
      "GDPR/CCPA compliant by design"
    ],
    pricing: "€5/month or included in Pro+"
  },
  {
    title: "Enterprise SSO & SCIM",
    description: "SAML SSO and automated user provisioning for enterprise customers.",
    quarter: "Q4",
    status: "planned",
    type: "feature",
    icon: Lock,
    details: [
      "SAML 2.0 & OpenID Connect",
      "Azure AD, Okta, Google Workspace",
      "SCIM user provisioning",
      "Just-in-time account creation",
      "Custom domain login"
    ]
  },
  {
    title: "White-Label Reseller Program",
    description: "Fully rebrandable solution for agencies to resell under their own brand.",
    quarter: "Q4",
    status: "planned",
    type: "feature",
    icon: Star,
    details: [
      "Custom domain & branding",
      "Your logo, colors, emails",
      "Client billing management",
      "Wholesale pricing tiers",
      "Dedicated partner support"
    ]
  },
];

const quarterColors = {
  Q1: "bg-green-500",
  Q2: "bg-blue-500",
  Q3: "bg-purple-500",
  Q4: "bg-orange-500",
};

const statusConfig = {
  planned: { label: "Planned", icon: Clock, color: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", icon: Sparkles, color: "bg-primary/20 text-primary" },
  completed: { label: "Completed", icon: CheckCircle2, color: "bg-green-500/20 text-green-600" },
};

const typeConfig = {
  feature: { label: "Core Feature", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  "add-on": { label: "Paid Add-on", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  integration: { label: "Integration", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
};

export default function RoadmapPage() {
  const quarters = ["Q1", "Q2", "Q3", "Q4"] as const;
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-display font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient flex items-center justify-center text-white">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            ConsentEase
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Calendar className="w-4 h-4" />
            2026 Vision
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Product Roadmap
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Here's what we're building next. Our focus: making compliance even simpler while adding powerful features for growing businesses.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(typeConfig).map(([type, config]) => (
              <div key={type} className={`px-3 py-1.5 rounded-full border text-sm ${config.color}`}>
                {config.label}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mb-12 flex items-center justify-center gap-2 md:gap-4">
          {quarters.map((q) => (
            <a 
              key={q} 
              href={`#${q}`}
              className={`px-4 py-2 rounded-lg font-medium transition-colors hover:bg-muted ${quarterColors[q]} bg-opacity-10 hover:bg-opacity-20`}
            >
              {q} 2026
            </a>
          ))}
        </div>

        <div className="space-y-16">
          {quarters.map((quarter) => {
            const items = roadmap2026.filter((item) => item.quarter === quarter);
            if (items.length === 0) return null;
            
            return (
              <motion.section
                key={quarter}
                id={quarter}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="scroll-mt-24"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 rounded-xl ${quarterColors[quarter]} flex items-center justify-center text-white font-bold text-lg`}>
                    {quarter}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{quarter} 2026</h2>
                    <p className="text-muted-foreground">
                      {quarter === "Q1" && "January - March"}
                      {quarter === "Q2" && "April - June"}
                      {quarter === "Q3" && "July - September"}
                      {quarter === "Q4" && "October - December"}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {items.map((item, idx) => {
                    const Icon = item.icon;
                    const StatusIcon = statusConfig[item.status].icon;
                    
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl ${quarterColors[quarter]}/10 flex items-center justify-center`}>
                            <Icon className="w-6 h-6" style={{ color: quarterColors[quarter].replace('bg-', '') }} />
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={typeConfig[item.type].color}>
                              {typeConfig[item.type].label}
                            </Badge>
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground mb-4">{item.description}</p>

                        {item.pricing && (
                          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 text-sm font-medium">
                            <Star className="w-4 h-4" />
                            {item.pricing}
                          </div>
                        )}

                        <ul className="space-y-2">
                          {item.details.map((detail, detailIdx) => (
                            <li key={detailIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 pt-4 border-t border-border">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[item.status].color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig[item.status].label}
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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center bg-card border border-border rounded-2xl p-8 md:p-12"
        >
          <h3 className="text-2xl font-bold mb-4">Have a feature request?</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            We're always looking for ways to make ConsentEase better. Let us know what features would help your business.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button className="bg-primary hover:bg-primary/90">
                Request a Feature
              </Button>
            </Link>
            <Link href="/changelog">
              <Button variant="outline">
                View Changelog
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
