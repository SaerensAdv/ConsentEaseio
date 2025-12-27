import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, ArrowRight, Shield, Zap, Palette, Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlanComparisonTable from "@/components/PlanComparisonTable";
import { AnimatedHeroShowcase } from "@/components/AnimatedHeroShowcase";
import { IntroOverlay, useIntroOverlay } from "@/components/IntroOverlay";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { showIntro, completeIntro } = useIntroOverlay();

  const features = [
    {
      icon: Zap,
      title: "Zero-Config Setup",
      description: "Scan first, ask questions later. We crawl your site, identify cookies, and configure your banner automatically in under 60 seconds."
    },
    {
      icon: Palette,
      title: "Visual Control",
      description: "25+ design settings to make the banner match your brand. Don't let a legal requirement ruin your site's aesthetic."
    },
    {
      icon: Shield,
      title: "True Compliance",
      description: "GDPR, CCPA, and ePrivacy Directive ready. We handle the complex legal logic so you can focus on your business."
    }
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
        <section className="relative pt-20 pb-32 overflow-hidden">
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
                GDPR & Google Consent Mode v2 Ready
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6">
                Privacy compliance for <span className="text-gradient">humans</span>, not lawyers.
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                The consent banner that installs in 2 minutes, costs less than a coffee, and keeps you compliant forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/onboarding">
                  <Button size="lg" className="text-lg h-14 px-8 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:scale-105">
                    Get Compliant Now
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2 hover:bg-secondary/50" data-testid="button-view-demo">
                    View Live Demo
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Avatar" />
                    </div>
                  ))}
                </div>
                <p>Trusted by 1,000+ businesses</p>
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

        {/* Features Section */}
        <section id="features" className="py-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything you need to dominate online</h2>
              <p className="text-lg text-muted-foreground">
                Actually, just everything you need to be compliant. We stripped away the enterprise bloat.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
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

        {/* Comparison/Pain Point Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-primary rounded-3xl p-8 md:p-16 text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Stop paying for complexity.</h2>
                  <p className="text-primary-foreground/80 text-lg mb-8 max-w-md">
                    Enterprise tools charge $30,000/year for features you'll never use. We built the tool for business owners who just want to get back to work.
                  </p>
                  <ul className="space-y-4 mb-8">
                    {[
                      "No sales calls or hidden pricing",
                      "No 'contact us for enterprise' buttons",
                      "No confusing compliance questionnaires"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-background/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="font-semibold">Enterprise CMP</span>
                      <span className="opacity-60">$30,000/yr</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="font-semibold">Dedicated Legal Team</span>
                      <span className="opacity-60">$150,000/yr</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold text-accent">ConsentEase</span>
                      <span className="text-xl font-bold text-accent">€5/mo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Transparent Pricing</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No hidden fees. No surprises. Choose the plan that fits your needs.
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
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Built by people who understand your frustration.</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  We started ConsentEase after being quoted €25,000 for a "basic" consent management setup. 
                  That's when we realized: privacy compliance shouldn't require a mortgage.
                </p>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Our mission is simple: make GDPR compliance accessible to every business, 
                  from solo entrepreneurs to growing agencies.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Based in Belgium</p>
                    <p className="text-sm text-muted-foreground">EU-first, privacy-focused</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-background p-6 rounded-xl shadow-sm border">
                  <p className="text-4xl font-bold font-display text-primary mb-2">1,000+</p>
                  <p className="text-muted-foreground">Active websites</p>
                </div>
                <div className="bg-background p-6 rounded-xl shadow-sm border">
                  <p className="text-4xl font-bold font-display text-primary mb-2">50M+</p>
                  <p className="text-muted-foreground">Consents managed</p>
                </div>
                <div className="bg-background p-6 rounded-xl shadow-sm border">
                  <p className="text-4xl font-bold font-display text-primary mb-2">99.9%</p>
                  <p className="text-muted-foreground">Uptime</p>
                </div>
                <div className="bg-background p-6 rounded-xl shadow-sm border">
                  <p className="text-4xl font-bold font-display text-primary mb-2">2 min</p>
                  <p className="text-muted-foreground">Average setup time</p>
                </div>
              </div>
            </div>
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
                <p className="text-muted-foreground max-w-xs">
                  The privacy compliance platform built for business owners, not compliance officers.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/features" className="hover:text-primary">Features</Link></li>
                  <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                  <li><Link href="/compare" className="hover:text-primary">Compare to...</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
                  <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                  <li><Link href="/changelog" className="hover:text-primary">Changelog</Link></li>
                  <li><Link href="/roadmap" className="hover:text-primary">Roadmap 2026</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                  <li><Link href="/cookies" className="hover:text-primary">Cookie Policy</Link></li>
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