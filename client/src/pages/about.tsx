import { Link } from "wouter";
import { Shield, ArrowLeft, Users, Target, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
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
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Privacy compliance for <span className="text-gradient">everyone</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We believe every business deserves access to professional privacy tools, 
              not just enterprises with massive budgets.
            </p>
          </div>

          <section className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    ConsentEase was born from frustration. As digital marketing professionals at 
                    Saerens Advertising, we watched small business clients struggle with GDPR compliance. 
                    The enterprise solutions cost tens of thousands of euros, while free alternatives 
                    were clunky and unreliable.
                  </p>
                  <p>
                    We asked ourselves: why should a local bakery or boutique agency need to choose 
                    between breaking the bank or risking non-compliance?
                  </p>
                  <p>
                    So we built ConsentEase - a platform that brings enterprise-grade consent management 
                    to businesses of all sizes, at a price that makes sense. No complicated contracts, 
                    no hidden fees, no compliance degree required.
                  </p>
                </div>
              </div>
              <div className="bg-muted/30 rounded-2xl p-8 border border-border/50">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-display font-bold text-primary mb-2">2024</div>
                    <div className="text-sm text-muted-foreground">Founded in Belgium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-display font-bold text-primary mb-2">1000+</div>
                    <div className="text-sm text-muted-foreground">Websites Protected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-display font-bold text-primary mb-2">50M+</div>
                    <div className="text-sm text-muted-foreground">Consents Managed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-display font-bold text-primary mb-2">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime SLA</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-20">
            <h2 className="text-3xl font-display font-bold mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Accessibility</h3>
                <p className="text-sm text-muted-foreground">
                  Privacy tools should be available to every business, not just the largest ones.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Simplicity</h3>
                <p className="text-sm text-muted-foreground">
                  Complex problems deserve elegant solutions. We remove the jargon and confusion.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Trust</h3>
                <p className="text-sm text-muted-foreground">
                  We practice what we preach. Your data is protected with the same care we help you provide.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">European</h3>
                <p className="text-sm text-muted-foreground">
                  Based in Belgium, built for GDPR. Your data stays in the EU, always.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-20">
            <div className="bg-muted/30 rounded-2xl p-12 border border-border/50 text-center">
              <h2 className="text-3xl font-display font-bold mb-4">Powered by Saerens Advertising</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                ConsentEase is a product of Saerens Advertising, a Belgian digital marketing agency 
                with over a decade of experience helping businesses navigate the digital landscape. 
                We understand the challenges because we've lived them.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/contact">
                  <Button data-testid="button-contact-us">Get in Touch</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" data-testid="button-view-pricing">View Pricing</Button>
                </Link>
              </div>
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
