import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, ArrowRight, Shield, Zap, Palette, Globe, Menu, X, Clock, FileCheck, Lock, BarChart3, AlertTriangle, Building2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlanComparisonTable from "@/components/PlanComparisonTable";
import { AnimatedHeroShowcase } from "@/components/AnimatedHeroShowcase";
import { IntroOverlay, useIntroOverlay } from "@/components/IntroOverlay";

interface FeaturedAgency {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  heroText: string | null;
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { showIntro, completeIntro } = useIntroOverlay();

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
      description: "Add your domain, customize your banner, copy one line of code. No developers needed. No complex setup wizards. Just compliance."
    },
    {
      icon: Shield,
      title: "Full Legal Coverage",
      description: "GDPR, CCPA, ePrivacy Directive, and Google Consent Mode v2. Pre-configured for compliance so you don't have to interpret regulations."
    },
    {
      icon: Palette,
      title: "Matches Your Brand",
      description: "Your consent banner shouldn't look like legal fine print. 25+ design options to seamlessly blend with your website's look and feel."
    },
    {
      icon: FileCheck,
      title: "Audit-Ready Logs",
      description: "Every consent is timestamped and stored. When regulators ask for proof, you'll have it. Exportable reports for peace of mind."
    },
    {
      icon: Lock,
      title: "EU Data Residency",
      description: "Your visitor data never leaves the European Union. Hosted on secure, encrypted infrastructure that meets the strictest standards."
    },
    {
      icon: BarChart3,
      title: "Consent Analytics",
      description: "See exactly how visitors interact with your banner. Optimize consent rates without compromising on compliance."
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
      {showIntro && <IntroOverlay onComplete={completeIntro} />}
      
      <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient flex items-center justify-center text-white">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            ConsentEase
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Link href="/compare" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Compare</Link>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
            <div className="flex items-center gap-4 ml-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Log in</Button>
              </Link>
              <Link href="/onboarding">
                <Button className="font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">Start Free Trial</Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-4 shadow-xl">
            <a href="#features" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#pricing" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <Link href="/compare" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>Compare</Link>
            <a href="#about" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>About</a>
            <hr className="border-border" />
            <Link href="/login">
              <Button variant="outline" className="w-full justify-center">Log in</Button>
            </Link>
            <Link href="/onboarding">
              <Button className="w-full justify-center">Start Free Trial</Button>
            </Link>
          </div>
        )}
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative pt-16 md:pt-24 pb-24 md:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Google Consent Mode v2 Certified
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6">
                GDPR compliance <span className="text-gradient">without the complexity</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-4 leading-relaxed max-w-xl">
                Fines up to €20 million. Complex regulations. Expensive consultants.
              </p>
              <p className="text-xl mb-8 leading-relaxed max-w-xl">
                <strong>Or:</strong> A 2-minute setup, €5/month, and complete peace of mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/onboarding">
                  <Button size="lg" className="text-lg h-14 px-8 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:scale-105">
                    Get Compliant in 2 Minutes
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2 hover:bg-secondary/50" data-testid="button-view-demo">
                    See Live Demo
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  7-day free trial
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  Cancel anytime
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <AnimatedHeroShowcase />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 via-accent/20 to-transparent blur-3xl -z-10 rounded-full opacity-60" />
            </motion.div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-8 border-y bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">GDPR & CCPA</p>
                  <p className="text-sm text-muted-foreground">Fully Compliant</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">EU Data Center</p>
                  <p className="text-sm text-muted-foreground">Your Data Stays in Europe</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">256-bit Encryption</p>
                  <p className="text-sm text-muted-foreground">Bank-Level Security</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium mb-6">
              <AlertTriangle className="w-4 h-4" />
              The Reality of Non-Compliance
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              €20 million in fines. 4% of annual revenue. 
              <span className="block text-muted-foreground mt-2">Is your website protected?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Since 2018, data protection authorities have issued over €4 billion in GDPR fines. 
              Small businesses are increasingly targeted. The question isn't <em>if</em> you need 
              consent management—it's whether you can afford not to have it.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-muted/30 rounded-xl p-6 border">
                <p className="text-3xl font-bold text-primary mb-2">€4B+</p>
                <p className="text-muted-foreground">Total GDPR fines issued since 2018</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-6 border">
                <p className="text-3xl font-bold text-primary mb-2">400%</p>
                <p className="text-muted-foreground">Increase in enforcement actions in 2024</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-6 border">
                <p className="text-3xl font-bold text-primary mb-2">2 min</p>
                <p className="text-muted-foreground">Time to protect your business with ConsentEase</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Built for Small Business
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                Enterprise-grade compliance at small business prices
              </h2>
              <p className="text-lg text-muted-foreground">
                The same protection that Fortune 500 companies pay €30,000/year for. 
                We've stripped away the complexity and kept what actually matters.
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
                  <Card className="h-full border-none shadow-lg bg-background hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                        <feature.icon className="w-6 h-6" />
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

        {/* Compliance Checklist */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
                  <FileCheck className="w-4 h-4" />
                  Complete Compliance
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                  Everything regulators require. Nothing you don't need.
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  We've studied hundreds of enforcement decisions to build a consent solution 
                  that meets every regulatory requirement—without the enterprise complexity.
                </p>
                <ul className="space-y-4">
                  {compliancePoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-lg">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">What you get with ConsentEase</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/20">
                    <span>Cookie consent banner</span>
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/20">
                    <span>Google Consent Mode v2</span>
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/20">
                    <span>Automatic cookie scanning</span>
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/20">
                    <span>Consent logs for audits</span>
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/20">
                    <span>Analytics dashboard</span>
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span>Human support (no bots)</span>
                    <Check className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-white/80 mb-2">Starting at</p>
                  <p className="text-4xl font-bold">€5<span className="text-lg font-normal text-white/80">/month</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-background rounded-3xl p-8 md:p-12 border shadow-xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                    Stop paying for features you'll never use
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Enterprise CMPs charge €30,000/year for complex dashboards, multi-team permissions, 
                    and "strategic consulting." You just need a consent banner that works.
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>No sales calls or demos required</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>No annual contracts or hidden fees</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>No compliance jargon or legal speak</span>
                    </div>
                  </div>
                  <Link href="/compare">
                    <Button variant="outline" className="gap-2">
                      See Full Comparison <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-xl p-6 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-muted-foreground">OneTrust / Cookiebot</span>
                      <span className="text-muted-foreground">~€30,000/year</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-full h-2 bg-red-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-muted-foreground">Legal consultant setup</span>
                      <span className="text-muted-foreground">€5,000–15,000</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-2/3 h-2 bg-orange-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-6 border-2 border-primary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-primary">ConsentEase</span>
                      <span className="font-bold text-primary">€60/year</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-[3%] h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Same compliance. 500x less cost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
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
              <PlanComparisonTable />
            </motion.div>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                All plans include a 7-day free trial. No credit card required.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 md:py-28 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
                  Our Story
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                  We built the tool we wished existed
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  When we were quoted €25,000 for a "basic" consent management setup for a client's 
                  small e-commerce site, we knew something was broken. Privacy compliance shouldn't 
                  require a second mortgage.
                </p>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  ConsentEase was born from frustration—and a belief that every business, regardless of 
                  size, deserves access to proper compliance tools. We're based in Belgium, in the heart 
                  of EU privacy regulation, and we eat our own cooking.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Based in Belgium, EU</p>
                    <p className="text-sm text-muted-foreground">Privacy-first, always</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-background p-6 rounded-xl shadow-sm border">
                  <p className="text-4xl font-bold font-display text-primary mb-2">1,000+</p>
                  <p className="text-muted-foreground">Websites protected</p>
                </div>
                <div className="bg-background p-6 rounded-xl shadow-sm border">
                  <p className="text-4xl font-bold font-display text-primary mb-2">50M+</p>
                  <p className="text-muted-foreground">Consents processed</p>
                </div>
                <div className="bg-background p-6 rounded-xl shadow-sm border">
                  <p className="text-4xl font-bold font-display text-primary mb-2">99.9%</p>
                  <p className="text-muted-foreground">Uptime guarantee</p>
                </div>
                <div className="bg-background p-6 rounded-xl shadow-sm border">
                  <p className="text-4xl font-bold font-display text-primary mb-2">&lt;24h</p>
                  <p className="text-muted-foreground">Support response</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Partners Section */}
        {featuredAgencies.length > 0 && (
          <section className="py-20 md:py-28">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
                  <Building2 className="w-4 h-4" />
                  Trusted Partners
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Work with our certified partners
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Our partner agencies are experts in GDPR compliance and can help you implement ConsentEase for your business.
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
                    <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          {agency.logoUrl ? (
                            <img 
                              src={agency.logoUrl} 
                              alt={agency.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-primary" />
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
                              Learn More
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </Link>
                          {agency.websiteUrl && (
                            <a href={agency.websiteUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost" className="gap-1">
                                <ExternalLink className="w-3 h-3" />
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
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              Your compliance journey starts here
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join 1,000+ businesses that chose simplicity over complexity. 
              Set up in 2 minutes. Protected forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button size="lg" className="text-lg h-14 px-8 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25">
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2">
                  Talk to a Human
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required. 7-day free trial. Cancel anytime.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t border-border pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-6 gap-8 mb-12">
              <div className="col-span-2">
                <Link href="/" className="text-xl font-display font-bold flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-gradient flex items-center justify-center text-white">
                    <Shield className="w-3 h-3 fill-current" />
                  </div>
                  ConsentEase
                </Link>
                <p className="text-muted-foreground max-w-xs mb-4">
                  GDPR and CCPA compliance made simple. Protect your business without the enterprise price tag.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>EU Data Residency</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-primary">Features</a></li>
                  <li><a href="#pricing" className="hover:text-primary">Pricing</a></li>
                  <li><Link href="/compare" className="hover:text-primary">Compare CMPs</Link></li>
                  <li><Link href="/demo" className="hover:text-primary">Live Demo</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                  <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
                  <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                  <li><Link href="/changelog" className="hover:text-primary">Changelog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#about" className="hover:text-primary">About Us</a></li>
                  <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                  <li><Link href="/roadmap" className="hover:text-primary">Roadmap</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                  <li><Link href="/cookies" className="hover:text-primary">Cookie Policy</Link></li>
                  <li><Link href="/dpa" className="hover:text-primary">DPA</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>&copy; 2025 ConsentEase. All rights reserved.</p>
              <a href="https://saerens.agency?utm_source=consentease&utm_medium=footer&utm_campaign=branding" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-xs">A product by</span>
                <img src="https://saerensadvertising.com/logo.svg" alt="Saerens Agency" className="h-5" />
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
    </>
  );
}
