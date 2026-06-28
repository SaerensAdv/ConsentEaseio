import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, ArrowRight, Shield, Lightning, Palette, Globe, List, X, Clock, FileText, Lock, ChartBar, Warning, Buildings, ArrowSquareOut, Code, Plugs, MagnifyingGlass } from "@phosphor-icons/react";
import { Spinner } from "@/components/ui/spinner";
const logoImage = "/consentease-logo-56.webp";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCanonical } from "@/hooks/use-canonical";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlanComparisonTable from "@/components/PlanComparisonTable";
import { AnimatedHeroShowcase } from "@/components/AnimatedHeroShowcase";
import { SiWordpress, SiShopify, SiWix, SiWebflow, SiSquarespace, SiNextdotjs, SiReact } from "react-icons/si";

function OrganizationSchema() {
  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://consentease.io/#organization",
        "name": "ConsentEase",
        "url": "https://consentease.io",
        "logo": {
          "@type": "ImageObject",
          "url": "https://consentease.io/favicon.png"
        },
        "description": "Affordable GDPR/CCPA cookie consent management for small businesses. 2-minute setup, full compliance.",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "BE"
        },
        "sameAs": [],
        "foundingDate": "2024",
        "parentOrganization": {
          "@type": "Organization",
          "name": "Saerens Advertising",
          "url": "https://saerensadvertising.com"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://consentease.io/#website",
        "name": "ConsentEase",
        "url": "https://consentease.io",
        "publisher": { "@id": "https://consentease.io/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://consentease.io/blog?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": "ConsentEase",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "EUR",
          "lowPrice": "3",
          "highPrice": "129",
          "offerCount": "7"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "50"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
    />
  );
}

interface FeaturedAgency {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  heroText: string | null;
}


const howItWorksSteps = [
  {
    step: "01",
    title: "Add your domain",
    description: "Paste your website URL. Our scanner automatically detects all cookies and tracking scripts in seconds.",
    icon: Globe,
  },
  {
    step: "02",
    title: "Customize your banner",
    description: "Match your brand with 25+ design options. Colors, fonts, position, animation — everything is adjustable.",
    icon: Palette,
  },
  {
    step: "03",
    title: "Copy one line of code",
    description: "Add a single script tag to your website. Works with WordPress, Shopify, Wix, and any other platform.",
    icon: Code,
  },
];

const integrationPlatforms = [
  { name: "WordPress", icon: <SiWordpress size={20} /> },
  { name: "Shopify", icon: <SiShopify size={20} /> },
  { name: "Wix", icon: <SiWix size={20} /> },
  { name: "Webflow", icon: <SiWebflow size={20} /> },
  { name: "Squarespace", icon: <SiSquarespace size={20} /> },
  { name: "Next.js", icon: <SiNextdotjs size={20} /> },
  { name: "React", icon: <SiReact size={20} /> },
  { name: "Custom HTML", icon: <Code size={20} /> },
];

export default function Home() {
  useCanonical("/");
  const [, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroDomain, setHeroDomain] = useState("");
  const [heroError, setHeroError] = useState("");
  const [isHeroSubmitting, setIsHeroSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleHeroScan = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = heroDomain.trim();
    if (!raw) {
      setHeroError("Please enter your website URL.");
      return;
    }
    const cleaned = raw
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
    if (!cleaned || !cleaned.includes(".") || cleaned.length < 4) {
      setHeroError("That doesn't look like a valid domain. Try \"example.com\".");
      return;
    }
    setHeroError("");
    setIsHeroSubmitting(true);
    navigate(`/scan?domain=${encodeURIComponent(cleaned)}`);
  };

  useEffect(() => {
    document.title = "ConsentEase - GDPR Cookie Consent Banner for Small Businesses";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Cookie consent banner for small businesses. Installs in 2 minutes. GDPR and CCPA support. From €3/month.");
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "ConsentEase - GDPR Cookie Consent Banner for Small Businesses");
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", "Cookie consent banner for small businesses. Installs in 2 minutes. GDPR, CCPA, Google Consent Mode v2. From €3/month.");
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", "ConsentEase - Cookie Consent Made Simple");
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute("content", "Cookie consent banner for small businesses. 2-minute setup. From €3/month.");
  }, []);

  const { data: authUser } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });
  const isLoggedIn = !!authUser;

  const { data: featuredAgencies = [] } = useQuery<FeaturedAgency[]>({
    queryKey: ["/api/agencies/featured"],
    queryFn: async () => {
      const res = await fetch("/api/agencies/featured");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const features = [
    {
      icon: Clock,
      title: "Live in 2 Minutes",
      description: "Add your domain, customize your banner, copy one line of code. You don't need a developer."
    },
    {
      icon: Shield,
      title: "GDPR, CCPA & ePrivacy",
      description: "Supports GDPR, CCPA, ePrivacy Directive, and Google Consent Mode v2. Pre-configured so you don't have to interpret the regulations yourself."
    },
    {
      icon: Palette,
      title: "Matches Your Brand",
      description: "25+ design options so your consent banner matches your website. Colors, fonts, position, and animations are all adjustable."
    },
    {
      icon: FileText,
      title: "Audit-Ready Logs",
      description: "Every consent is timestamped and stored. When regulators ask for proof, you export a report and you're done."
    },
    {
      icon: Lock,
      title: "EU Data Residency",
      description: "Your visitor data never leaves the European Union. Hosted on encrypted servers in Germany and the Netherlands."
    },
    {
      icon: ChartBar,
      title: "Consent Analytics",
      description: "See how visitors interact with your banner. Track accept rates, bounce impact, and category preferences."
    },
    {
      icon: FileText,
      title: "Policy Generator",
      description: "Create Privacy Policies and Cookie Policies in 8 languages. One-time purchase from EUR 9, or up to 100/month with Agency Pro."
    }
  ];

  const compliancePoints = [
    "Automatic cookie detection and categorization",
    "Pre-consent blocking of non-essential scripts",
    "Google Consent Mode v2 with proper initialization",
    "Granular category controls (Analytics, Marketing, Functional)",
    "12-month consent storage per GDPR guidelines",
    "One-click consent withdrawal for visitors"
  ];

  return (
    <>
      <OrganizationSchema />
      
      <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2">
            <img src={logoImage} alt="" className="h-8 w-8 object-contain" width="32" height="32" />
            ConsentEase
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/business" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Business</Link>
            <Link href="/compare" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Compare</Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <div className="flex items-center gap-4 ml-4">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button variant="ghost" className="font-medium">Dashboard</Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" className="font-medium">Log in</Button>
                </Link>
              )}
              {!isLoggedIn && (
                <Link href="/onboarding">
                  <Button className="font-medium shadow-lg shadow-primary/20" data-testid="button-nav-start-trial">Start Free Trial</Button>
                </Link>
              )}
            </div>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle navigation menu" aria-expanded={isMenuOpen}>
            {isMenuOpen ? <X size={16} aria-hidden="true" /> : <List size={16} aria-hidden="true" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-4 shadow-xl">
            <Link href="/features" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>Features</Link>
            <Link href="/pricing" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
            <Link href="/business" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>Business</Link>
            <Link href="/compare" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>Compare</Link>
            <Link href="/about" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>About</Link>
            <hr className="border-border" />
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">Log in</Button>
                </Link>
                <Link href="/onboarding" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-center">Start Free Trial</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      <main id="main-content" className="pt-20">
        {/* Hero Section */}
        <section className="relative pt-16 md:pt-24 pb-24 md:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Google Consent Mode v2 Certified
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6">
                GDPR compliance <span className="text-gradient">without the complexity</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                Scan your site for free and see exactly what's tracking your visitors. Then fix it in 2 minutes from €3/month (excl. VAT).
              </p>

              <form onSubmit={handleHeroScan} className="max-w-xl" aria-label="Free cookie compliance scanner" noValidate>
                <div className={`group relative flex flex-col sm:flex-row gap-2 sm:gap-0 p-2 bg-background border-2 rounded-2xl shadow-xl shadow-primary/5 transition-all focus-within:ring-4 ${heroError ? "border-destructive/60 focus-within:border-destructive focus-within:ring-destructive/10" : "border-border focus-within:border-primary/50 focus-within:ring-primary/10 hover:border-primary/30"}`}>
                  <div className="flex items-center gap-3 flex-1 px-3 sm:px-4">
                    <Globe size={20} className={`shrink-0 ${heroError ? "text-destructive/70" : "text-muted-foreground/70"}`} aria-hidden="true" />
                    <label htmlFor="hero-domain" className="sr-only">Your website URL</label>
                    <input
                      id="hero-domain"
                      type="text"
                      inputMode="url"
                      autoComplete="url"
                      value={heroDomain}
                      onChange={(e) => {
                        setHeroDomain(e.target.value);
                        if (heroError) setHeroError("");
                      }}
                      placeholder="yourwebsite.com"
                      className="w-full bg-transparent border-0 outline-none text-base sm:text-lg py-3 placeholder:text-muted-foreground/50"
                      disabled={isHeroSubmitting}
                      aria-invalid={Boolean(heroError)}
                      aria-describedby={heroError ? "hero-domain-error" : undefined}
                      data-testid="input-hero-scan-domain"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isHeroSubmitting || !heroDomain.trim()}
                    className="h-12 sm:h-14 px-5 sm:px-7 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:-translate-y-0.5 transition-all"
                    data-testid="button-hero-scan"
                  >
                    {isHeroSubmitting ? (
                      <>
                        <Spinner size={18} className="mr-2" aria-hidden="true" />
                        Scanning…
                      </>
                    ) : (
                      <>
                        <MagnifyingGlass size={18} className="mr-2" aria-hidden="true" />
                        Scan My Site
                      </>
                    )}
                  </Button>
                </div>
                {heroError && (
                  <p
                    id="hero-domain-error"
                    role="alert"
                    className="mt-2 text-sm font-medium text-destructive px-1"
                    data-testid="text-hero-scan-error"
                  >
                    {heroError}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-muted-foreground px-1">
                  <div className="flex items-center gap-1.5">
                    <Check size={14} className="text-green-500" aria-hidden="true" />
                    100% free
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={14} className="text-green-500" aria-hidden="true" />
                    No signup
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={14} className="text-green-500" aria-hidden="true" />
                    Results in 30 seconds
                  </div>
                </div>
              </form>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <p className="font-medium text-muted-foreground" data-testid="text-hero-trust">
                  Trusted by 500+ small businesses in Europe
                </p>
                <span className="hidden sm:inline text-border" aria-hidden="true">•</span>
                <Link href="/onboarding" className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors" data-testid="link-hero-trial">
                  Skip the scan, start free trial
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <AnimatedHeroShowcase />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 via-accent/20 to-transparent blur-3xl -z-10 rounded-full opacity-60" />
            </div>
          </div>
        </section>

        {/* Trust Bar with Compliance Badges */}
        <section className="py-8 border-y bg-muted/30 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm text-muted-foreground font-medium mb-4" data-testid="text-trust-bar-subtitle">
              500+ businesses rely on ConsentEase
            </p>
            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 md:overflow-visible md:mx-0 md:px-0">
              <div className="flex items-center justify-start md:justify-center gap-8 md:gap-16 min-w-max md:min-w-0">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield size={20} className="text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold">GDPR & CCPA</p>
                    <p className="text-sm text-muted-foreground">Fully Compliant</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe size={20} className="text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold">EU Data Center</p>
                    <p className="text-sm text-muted-foreground">Your Data Stays in Europe</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock size={20} className="text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold">256-bit Encryption</p>
                    <p className="text-sm text-muted-foreground">All data encrypted in transit and at rest</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-14 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
                <Lightning size={16} />
                Simple as 1-2-3
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                Up and running in three steps
              </h2>
              <p className="text-lg text-muted-foreground">
                Three steps. No IT team required.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
              
              {howItWorksSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                  className="relative text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20 relative z-10">
                    <step.icon size={28} />
                  </div>
                  <div className="text-xs font-bold text-primary mb-2 tracking-widest uppercase">Step {step.step}</div>
                  <h3 className="text-xl font-display font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link href="/onboarding">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" data-testid="button-how-it-works-cta">
                  Start Your Free Setup
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-14 md:py-28 bg-secondary/30">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-6">
              <Warning size={16} />
              The Reality of Non-Compliance
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              GDPR fines are growing every year.
              <span className="block text-muted-foreground mt-2">Is your website protected?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              In 2024 alone, EU data protection authorities issued over 2,000 fines. 
              Small businesses are no longer exempt from enforcement.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-background rounded-xl p-6 border shadow-sm">
                <p className="text-3xl font-bold text-primary mb-2">€4B+</p>
                <p className="text-muted-foreground">Total GDPR fines issued since 2018</p>
              </div>
              <div className="bg-background rounded-xl p-6 border shadow-sm">
                <p className="text-3xl font-bold text-primary mb-2">2,000+</p>
                <p className="text-muted-foreground">GDPR fines issued in 2024 alone</p>
              </div>
              <div className="bg-background rounded-xl p-6 border shadow-sm">
                <p className="text-3xl font-bold text-primary mb-2">€50K</p>
                <p className="text-muted-foreground">Average fine for small businesses</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-14 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
                <Lightning size={16} />
                Built for Small Business
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                What you get
              </h2>
              <p className="text-lg text-muted-foreground">
                Features that other CMPs charge €50-100/month for, 
                starting at €3/month.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full border-none shadow-lg bg-background">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                        <feature.icon size={24} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations / Platform Support */}
        <section className="py-16 border-y bg-muted/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
                <Plugs size={16} />
                Works Everywhere
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
                Integrates with your favorite platform
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                One script tag. Any website. Full compatibility with all major platforms and frameworks.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {integrationPlatforms.map((platform, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-background border border-border/60 shadow-sm"
                  data-testid={`badge-integration-${platform.name.toLowerCase().replace(/[.\s]/g, '-')}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {platform.icon}
                  </div>
                  <span className="font-medium text-sm">{platform.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance Checklist */}
        <section className="py-14 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
                  <FileText size={16} />
                  Complete Compliance
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                  What regulators look for, built in
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  We reviewed GDPR enforcement decisions to understand what authorities actually check. 
                  ConsentEase covers those requirements.
                </p>
                <ul className="space-y-4" role="list">
                  {compliancePoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3" role="listitem">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={16} className="text-green-600" />
                      </div>
                      <span className="text-lg">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">What you get with ConsentEase</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 py-3 border-b border-white/20">
                    <span>Cookie consent banner</span>
                    <Check size={20} />
                  </div>
                  <div className="flex items-center justify-between gap-2 py-3 border-b border-white/20">
                    <span>Google Consent Mode v2</span>
                    <Check size={20} />
                  </div>
                  <div className="flex items-center justify-between gap-2 py-3 border-b border-white/20">
                    <span>Automatic cookie scanning</span>
                    <Check size={20} />
                  </div>
                  <div className="flex items-center justify-between gap-2 py-3 border-b border-white/20">
                    <span>Consent logs for audits</span>
                    <Check size={20} />
                  </div>
                  <div className="flex items-center justify-between gap-2 py-3 border-b border-white/20">
                    <span>Analytics dashboard</span>
                    <Check size={20} />
                  </div>
                  <div className="flex items-center justify-between gap-2 py-3">
                    <span>Human support (no bots)</span>
                    <Check size={20} />
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-white/80 mb-2">Starting at</p>
                  <p className="text-4xl font-bold">€3<span className="text-lg font-normal text-white/80">/month</span></p>
                  <p className="text-sm text-white/60 mt-1">Starter plan — billed monthly or annually</p>
                  <p className="text-xs text-white/40 mt-1">All prices excl. VAT</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Comparison Section */}
        <section className="py-14 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-background rounded-2xl md:rounded-3xl p-5 sm:p-8 md:p-12 border shadow-xl">
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                    Same compliance, less complexity
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Popular CMPs like Cookiebot and Usercentrics charge €15-90/month with confusing 
                    pricing based on pageviews or sessions. We keep it simple: pay per website, not per visitor.
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <Check size={20} className="text-green-500" />
                      <span>Generous view limits included in every plan</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check size={20} className="text-green-500" />
                      <span>No surprise overages or forced upgrades</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check size={20} className="text-green-500" />
                      <span>All features included, no upsells</span>
                    </div>
                  </div>
                  <Link href="/compare">
                    <Button variant="outline" className="gap-2">
                      See Full Comparison <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-xl p-6 border">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-semibold text-muted-foreground">Cookiebot</span>
                      <span className="text-muted-foreground">€15-90/month</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-full h-2 bg-red-400 rounded-full"></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Based on subpages, auto-upgrades when you grow</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 border">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-semibold text-muted-foreground">Usercentrics</span>
                      <span className="text-muted-foreground">€8-56/month</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-[85%] h-2 bg-orange-400 rounded-full"></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Session-based pricing, hard to predict costs</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 border">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-semibold text-muted-foreground">CookieYes</span>
                      <span className="text-muted-foreground">€10-55/month</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-[70%] h-2 bg-yellow-400 rounded-full"></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Pageview limits with overage fees</p>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-6 border-2 border-primary">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-primary">ConsentEase</span>
                      <span className="font-bold text-primary">€3-59/month</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-[30%] h-2 bg-primary rounded-full"></div>
                    </div>
                    <p className="text-xs text-primary mt-2">Per-website pricing, up to 100K views/month included</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">All prices excl. VAT</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-14 md:py-28 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
                Simple Pricing
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                One price. Full protection. No surprises.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                All plans include complete GDPR/CCPA compliance features. 
                Choose based on how many websites you need to protect.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-background rounded-2xl shadow-xl border overflow-hidden"
            >
              <PlanComparisonTable mode="single" />
            </motion.div>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-3">
                7-day free trial on every plan. Cancel any time during the trial.
              </p>
            </div>

            <div className="mt-6 text-center">
              <Card className="flex flex-col sm:flex-row items-center gap-3 px-5 sm:px-6 py-4 mx-auto max-w-xl sm:max-w-none sm:w-auto">
                <Buildings size={20} className="text-primary shrink-0 hidden sm:block" />
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium">Managing multiple websites or client projects?</p>
                  <p className="text-xs text-muted-foreground">Plans starting from €19/month (excl. VAT) for up to 5 websites</p>
                </div>
                <Link href="/business">
                  <Button variant="outline" size="sm" className="mt-2 sm:mt-0 w-full sm:w-auto" data-testid="link-business-plans">
                    View Business Plans <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-14 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
                  Our Story
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                  We built the tool we wished existed
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  We kept seeing small businesses pay €50-100/month for cookie consent tools 
                  with confusing pricing tiers. That felt wrong.
                </p>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  So we built ConsentEase: affordable, simple, and fully compliant. We're based 
                  in Belgium, subject to the same EU privacy rules as our users.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Based in Belgium, EU</p>
                    <p className="text-sm text-muted-foreground">EU data protection applies to us too</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }} className="bg-background p-6 rounded-xl shadow-sm border">
                  <p className="text-4xl font-bold font-display text-primary mb-2">500+</p>
                  <p className="text-muted-foreground">Websites using ConsentEase</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-background p-6 rounded-xl shadow-sm border">
                  <p className="text-4xl font-bold font-display text-primary mb-2">8</p>
                  <p className="text-muted-foreground">Languages supported</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-background p-6 rounded-xl shadow-sm border">
                  <p className="text-4xl font-bold font-display text-primary mb-2">99.9%</p>
                  <p className="text-muted-foreground">Uptime guarantee</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-background p-6 rounded-xl shadow-sm border">
                  <p className="text-4xl font-bold font-display text-primary mb-2">&lt;24h</p>
                  <p className="text-muted-foreground">Support response</p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Partners Section */}
        {featuredAgencies.length > 0 && (
          <section className="py-14 md:py-28 bg-secondary/30">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
                  <Buildings size={16} />
                  Trusted Partners
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Work with our certified partners
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  These agencies can set up ConsentEase for you and handle ongoing compliance.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredAgencies.map((agency) => (
                  <motion.div
                    key={agency.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="h-full border-2">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          {agency.logoUrl ? (
                            <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center p-1.5">
                              <img 
                                src={agency.logoUrl} 
                                alt={agency.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Buildings size={24} className="text-primary" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-lg">{agency.name}</h3>
                            {agency.heroText && (
                              <p className="text-sm text-muted-foreground">{agency.heroText}</p>
                            )}
                          </div>
                        </div>
                        {agency.description && (
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {agency.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Link href={`/agency/${agency.slug}`}>
                            <Button size="sm" variant="outline" className="gap-1">
                              About {agency.name}
                              <ArrowRight size={12} />
                            </Button>
                          </Link>
                          {agency.websiteUrl && (
                            <a href={agency.websiteUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost" className="gap-1">
                                <ArrowSquareOut size={12} />
                                Website
                              </Button>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-8">
                <p className="text-muted-foreground text-sm">
                  Want to become a ConsentEase partner? <Link href="/contact" className="text-primary hover:underline">Get in touch</Link>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-14 md:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              Ready to get compliant?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Try any plan free for 7 days. Cancel any time during the trial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button size="lg" className="text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 w-full sm:w-auto shadow-lg shadow-primary/20" data-testid="button-footer-cta">
                  Start Your Free Trial
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 w-full sm:w-auto border-2" data-testid="button-footer-contact">
                  Talk to a Human
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              7-day free trial on every plan. Cancel any time.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t border-border pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-6 gap-8 mb-12">
              <div className="col-span-2">
                <Link href="/" className="text-xl font-display font-bold flex items-center gap-2 mb-4">
                  <img src={logoImage} alt="" className="h-6 w-6 object-contain" width="24" height="24" />
                  ConsentEase
                </Link>
                <p className="text-muted-foreground max-w-xs mb-4">
                  GDPR and CCPA cookie consent for small businesses. From €3/month.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock size={16} />
                  <span>EU Data Residency</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-base">Product</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/features" className="hover:text-primary">Features</Link></li>
                  <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                  <li><Link href="/business" className="hover:text-primary">Business Plans</Link></li>
                  <li><Link href="/compare" className="hover:text-primary">Compare CMPs</Link></li>
                  <li><Link href="/demo" className="hover:text-primary">Live Demo</Link></li>
                  <li><Link href="/scan" className="hover:text-primary">Free Cookie Scanner</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-base">Resources</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                  <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
                  <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                  <li><Link href="/solutions" className="hover:text-primary">Platform Guides</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-base">Company</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                  <li><Link href="/roadmap" className="hover:text-primary">Roadmap</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-base">Legal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                  <li><Link href="/cookies" className="hover:text-primary">Cookie Policy</Link></li>
                  <li><Link href="/dpa" className="hover:text-primary">DPA</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>&copy; {currentYear} ConsentEase. All rights reserved.</p>
              <a href="https://saerensadvertising.com?utm_source=consentease&utm_medium=footer&utm_campaign=branding" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-xs">A product by</span>
                <img src="/saerens-logo.png" alt="Saerens Advertising" className="h-5 w-5" width="20" height="20" />
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
    </>
  );
}
