import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, ArrowRight, Shield, Zap, Palette, Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import abstractImage from "@assets/generated_images/abstract_3d_glass_shapes_in_purple_and_yellow_on_white.png";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const pricing = [
    {
      name: "Solo",
      price: "€5",
      period: "/month",
      description: "Perfect for personal sites.",
      features: ["1 Website", "10,000 Views/mo", "Basic Customization", "Email Support"],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Pro",
      price: "€12",
      period: "/month",
      description: "For growing businesses.",
      features: ["5 Websites", "100,000 Views/mo", "Full Customization", "Priority Support", "Remove Branding"],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Agency",
      price: "€39",
      period: "/month",
      description: "Manage multiple clients.",
      features: ["Unlimited Websites", "1M Views/mo", "White Label", "API Access", "Client Management"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
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
            <Button variant="outline" className="w-full justify-center">Log in</Button>
            <Button className="w-full justify-center">Start Free Trial</Button>
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
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2 hover:bg-secondary/50">
                  View Live Demo
                </Button>
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
              <div className="relative z-10 animate-in fade-in zoom-in duration-1000">
                <img 
                  src={abstractImage} 
                  alt="ConsentEase Dashboard Abstract" 
                  className="w-full h-auto drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              {/* Decorative background blurs */}
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
              <p className="text-lg text-muted-foreground">No hidden fees. No surprises.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricing.map((plan, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className={`h-full flex flex-col relative ${plan.popular ? 'border-primary shadow-2xl shadow-primary/10 ring-2 ring-primary ring-offset-2' : 'hover:shadow-lg transition-shadow'}`}>
                    {plan.popular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-bold shadow-md">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-4xl font-bold font-display">{plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className={`w-full ${plan.popular ? 'bg-primary' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                        {plan.cta}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t border-border pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-2">
                <Link href="/">
                  <a className="text-xl font-display font-bold flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-gradient flex items-center justify-center text-white">
                      <Shield className="w-3 h-3 fill-current" />
                    </div>
                    ConsentEase
                  </a>
                </Link>
                <p className="text-muted-foreground max-w-xs">
                  The privacy compliance platform built for business owners, not compliance officers.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary">Features</a></li>
                  <li><a href="#" className="hover:text-primary">Pricing</a></li>
                  <li><a href="#" className="hover:text-primary">Changelog</a></li>
                  <li><a href="#" className="hover:text-primary">Documentation</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-primary">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-primary">DPA</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>&copy; 2025 ConsentEase. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-foreground">Twitter</a>
                <a href="#" className="hover:text-foreground">LinkedIn</a>
                <a href="#" className="hover:text-foreground">GitHub</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}