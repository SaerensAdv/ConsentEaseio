import { Link } from "wouter";
import { Shield, Check, ArrowRight, Zap, Clock, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PlanComparisonTable from "@/components/PlanComparisonTable";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient flex items-center justify-center text-white">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            ConsentEase
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">Back to Home</Button>
            </Link>
            <Link href="/onboarding">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            Simple Pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            One price. No surprises.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            No hidden fees, no per-pageview charges, no enterprise sales calls. 
            Just pick a plan and get compliant today.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 mb-20">
          <PlanComparisonTable showCTA={true} />
        </div>

        <div className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-2xl font-display font-bold text-center mb-12">Why teams choose ConsentEase</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">2-Minute Setup</h3>
                <p className="text-muted-foreground">
                  Add one script, customize your banner, and you're done. No developers needed.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Google Consent Mode v2</h3>
                <p className="text-muted-foreground">
                  Full compliance with Google's latest requirements. No extra setup required.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <HeadphonesIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Direct Support</h3>
                <p className="text-muted-foreground">
                  Real humans, real answers. No ticket queues or chatbots.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6">
          <Card className="bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-10 text-center relative z-10">
              <h2 className="text-2xl font-display font-bold mb-4">Ready to get compliant?</h2>
              <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
                Start your 7-day free trial. No credit card required for Solo plan.
              </p>
              <Link href="/onboarding">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto px-6 mt-16 text-center">
          <p className="text-muted-foreground">
            Wondering how we compare to other solutions?{" "}
            <Link href="/compare" className="text-primary hover:underline">
              See our comparison pages
            </Link>
          </p>
        </div>
      </main>

      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 ConsentEase. All rights reserved.</p>
          <a href="https://saerens.agency?utm_source=consentease&utm_medium=footer&utm_campaign=branding" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xs">A product by</span>
            <img src="https://saerensadvertising.com/logo.svg" alt="Saerens Agency" className="h-5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
