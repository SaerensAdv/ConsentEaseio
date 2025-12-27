import { Link } from "wouter";
import { Shield, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CompetitorData } from "@/data/competitors";

interface ComparisonLayoutProps {
  competitor: CompetitorData;
}

export default function ComparisonLayout({ competitor }: ComparisonLayoutProps) {
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
            <Link href="/compare">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                All Comparisons
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Compliant</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            Honest Comparison
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            ConsentEase vs. {competitor.name}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {competitor.description}
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 mb-24">
          <Card className="border-none shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-3 bg-secondary/30 divide-y md:divide-y-0 md:divide-x border-b">
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <span className="text-muted-foreground font-medium mb-2">Feature</span>
              </div>
              <div className="p-8 flex flex-col items-center justify-center text-center bg-background">
                <h3 className="text-xl font-bold text-primary mb-1">ConsentEase</h3>
                <span className="text-sm text-muted-foreground">For Business Owners</span>
              </div>
              <div className="p-8 flex flex-col items-center justify-center text-center opacity-60">
                <h3 className="text-xl font-bold text-foreground mb-1">{competitor.name}</h3>
                <span className="text-sm text-muted-foreground">{competitor.targetAudience}</span>
              </div>
            </div>

            <div className="divide-y">
              {competitor.features.map((row, i) => (
                <div key={i} className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x hover:bg-secondary/10 transition-colors">
                  <div className="p-6 font-medium text-muted-foreground flex items-center justify-center md:justify-start">
                    {row.feature}
                  </div>
                  <div className="p-6 font-bold text-foreground flex items-center justify-center bg-primary/5">
                    {row.us.includes("Included") || row.us.includes("2 minutes") || row.us.includes("Automatic") ? (
                      <span className="flex items-center gap-2 text-primary"><Check className="w-5 h-5" /> {row.us}</span>
                    ) : row.us}
                  </div>
                  <div className="p-6 text-muted-foreground flex items-center justify-center">
                    {row.them}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div className="bg-secondary/30 rounded-3xl p-10 border border-border">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-muted-foreground" />
              Choose {competitor.name} if...
            </h3>
            <ul className="space-y-4">
              {competitor.chooseThemIf.map((item, i) => (
                <li key={i} className="flex gap-3 text-muted-foreground">
                  <Check className="w-5 h-5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary text-primary-foreground rounded-3xl p-10 shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Shield className="w-5 h-5 fill-current" />
              </div>
              Choose ConsentEase if...
            </h3>
            <ul className="space-y-4 relative z-10">
              {competitor.chooseUsIf.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <Check className="w-5 h-5 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 relative z-10">
              <Link href="/onboarding">
                <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 border-none">
                  Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-background border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              See more comparisons:{" "}
              <Link href="/compare" className="text-primary hover:underline">View all competitors</Link>
            </p>
            <a href="https://saerens.agency?utm_source=consentease&utm_medium=footer&utm_campaign=branding" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-xs">A product by</span>
              <img src="https://saerensadvertising.com/logo.svg" alt="Saerens Agency" className="h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
