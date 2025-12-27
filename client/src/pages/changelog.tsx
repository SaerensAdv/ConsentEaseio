import { Link } from "wouter";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Calendar, Sparkles, Bug, Zap, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  title: string;
  changes: {
    type: "feature" | "improvement" | "fix";
    text: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "1.4.0",
    date: "December 26, 2025",
    type: "minor",
    title: "Cookie Scanner & Management",
    changes: [
      { type: "feature", text: "Playwright-based automatic cookie scanner using headless Chromium" },
      { type: "feature", text: "Cookie categories management with 4 default categories (Necessary, Functional, Analytics, Marketing)" },
      { type: "feature", text: "Individual cookie management with provider, purpose, expiry, and type fields" },
      { type: "feature", text: "Granular consent modal in banner with per-category toggles" },
      { type: "feature", text: "Google Consent Mode v2 integration mapping categories to consent types" },
      { type: "improvement", text: "Preferences preserved in localStorage and restored when modal reopens" },
    ]
  },
  {
    version: "1.3.0",
    date: "December 26, 2025",
    type: "minor",
    title: "Security & Authentication",
    changes: [
      { type: "feature", text: "Password reset flow with secure tokens and email links (1-hour expiry)" },
      { type: "feature", text: "Email verification during registration (24-hour expiry)" },
      { type: "feature", text: "Rate limiting on authentication endpoints" },
      { type: "improvement", text: "Added Forgot Password and Reset Password pages" },
    ]
  },
  {
    version: "1.2.0",
    date: "December 26, 2025",
    type: "minor",
    title: "Billing & Subscription Management",
    changes: [
      { type: "feature", text: "Subscription status tracking (active, trialing, past_due, canceled)" },
      { type: "feature", text: "SubscriptionStatusBadge component showing status visually" },
      { type: "feature", text: "Manual subscription sync endpoint for reliability" },
      { type: "feature", text: "7-day free trial for Solo plan" },
      { type: "improvement", text: "Plan limit enforcement (websites per plan, monthly views tracking)" },
      { type: "improvement", text: "Usage stats display in dashboard settings with progress bars" },
    ]
  },
  {
    version: "1.1.0",
    date: "December 25, 2025",
    type: "minor",
    title: "Interactive Demo & Onboarding",
    changes: [
      { type: "feature", text: "Interactive demo tour with step-by-step guided walkthrough" },
      { type: "feature", text: "Animated intro overlay showcasing platform features" },
      { type: "feature", text: "Demo account with realistic sample data" },
      { type: "improvement", text: "Improved onboarding flow for new users" },
    ]
  },
  {
    version: "1.0.0",
    date: "December 25, 2025",
    type: "major",
    title: "Initial Release",
    changes: [
      { type: "feature", text: "Visual banner configurator with 20+ customization options" },
      { type: "feature", text: "Embeddable JavaScript consent banner script" },
      { type: "feature", text: "Analytics tracking (banner shown, accept, reject events)" },
      { type: "feature", text: "Stripe payment integration for subscriptions" },
      { type: "feature", text: "Google Consent Mode v2 support with proper initialization" },
      { type: "feature", text: "Three pricing tiers: Solo (€5), Pro (€12), Agency (€39)" },
    ]
  },
];

const typeColors = {
  feature: { bg: "bg-green-500/10", text: "text-green-600", icon: Sparkles },
  improvement: { bg: "bg-blue-500/10", text: "text-blue-600", icon: Zap },
  fix: { bg: "bg-orange-500/10", text: "text-orange-600", icon: Bug },
};

const versionColors = {
  major: "bg-primary text-white",
  minor: "bg-primary/20 text-primary",
  patch: "bg-muted text-muted-foreground",
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
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

      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Package className="w-4 h-4" />
            Version History
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Changelog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            All the latest updates, improvements, and fixes to ConsentEase.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[22px] top-0 bottom-0 w-px bg-border hidden md:block" />
          
          <div className="space-y-12">
            {changelog.map((entry, idx) => (
              <motion.div
                key={entry.version}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="flex items-start gap-6">
                  <div className="hidden md:flex flex-col items-center">
                    <div className={`w-11 h-11 rounded-full ${versionColors[entry.type]} flex items-center justify-center text-sm font-bold z-10`}>
                      {entry.version.split('.')[0]}.{entry.version.split('.')[1]}
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-card border border-border rounded-xl p-6">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`md:hidden px-3 py-1 rounded-full text-sm font-bold ${versionColors[entry.type]}`}>
                        v{entry.version}
                      </span>
                      <span className="hidden md:inline text-lg font-bold">v{entry.version}</span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {entry.date}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-4">{entry.title}</h3>
                    
                    <ul className="space-y-3">
                      {entry.changes.map((change, changeIdx) => {
                        const TypeIcon = typeColors[change.type].icon;
                        return (
                          <li key={changeIdx} className="flex items-start gap-3">
                            <span className={`p-1 rounded ${typeColors[change.type].bg} ${typeColors[change.type].text} mt-0.5`}>
                              <TypeIcon className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-muted-foreground">{change.text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Want to see what's coming next?
          </p>
          <Link href="/roadmap">
            <Button className="bg-primary hover:bg-primary/90">
              View 2026 Roadmap
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
