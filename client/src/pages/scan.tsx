import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCanonical } from "@/hooks/use-canonical";
import { Shield, MagnifyingGlass, Cookie, CheckCircle, Warning, ArrowRight, Globe, ChartBar, Lock, Eye, Code, CurrencyEur, Info } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";

const logoImage = "/consentease-logo.webp";

interface ClassifiedCookie {
  name: string;
  category: string;
  provider: string;
  purpose: string;
  expiry: string;
  type: string;
}

interface DetectedScript {
  url: string;
  domain: string;
  category: string;
  provider: string;
}

interface ScanResult {
  success: boolean;
  domain: string;
  cookies: ClassifiedCookie[];
  cookiesFound: number;
  scanMode?: "full" | "lightweight";
  trackingScripts?: DetectedScript[];
}

interface DetectedCmp {
  name: string;
  pricing: string;
  isCompetitor: boolean;
  isOurs: boolean;
}

const KNOWN_CMPS: Array<{ name: string; cookieMatch?: RegExp; scriptMatch?: RegExp; pricing: string; isCompetitor: boolean; isOurs?: boolean }> = [
  { name: "OneTrust", cookieMatch: /^Optanon/i, scriptMatch: /onetrust\.com|cookielaw\.org/i, pricing: "from €100/month", isCompetitor: true },
  { name: "Cookiebot", cookieMatch: /^CookieConsent$/, scriptMatch: /cookiebot\.com/i, pricing: "from €10/month", isCompetitor: true },
  { name: "Iubenda", cookieMatch: /^(_iub|euconsent)/i, scriptMatch: /iubenda\.com/i, pricing: "from €10/month", isCompetitor: true },
  { name: "Usercentrics", cookieMatch: /^(uc_|usercentrics)/i, scriptMatch: /usercentrics\.eu|usercentrics\.com/i, pricing: "from €40/month", isCompetitor: true },
  { name: "Termly", cookieMatch: /^TermlyCookieConsent/i, scriptMatch: /termly\.io/i, pricing: "from $10/month", isCompetitor: true },
  { name: "Complianz", cookieMatch: /^cmplz_/i, pricing: "WordPress plugin", isCompetitor: true },
  { name: "Osano", scriptMatch: /osano\.com/i, pricing: "from $99/month", isCompetitor: true },
  { name: "TrustArc", scriptMatch: /trustarc\.com|truste\.com/i, pricing: "enterprise pricing", isCompetitor: true },
  { name: "Quantcast Choice", scriptMatch: /quantcast\.com.*choice|cmp\.quantcast/i, pricing: "from $0/month", isCompetitor: true },
  { name: "WP Consent API", cookieMatch: /^wp_consent_/i, pricing: "WordPress plugin", isCompetitor: false },
  { name: "ConsentEase", cookieMatch: /^ce_consent_/i, pricing: "from €3/month", isCompetitor: false, isOurs: true },
];

function detectCmp(cookies: ClassifiedCookie[], scripts: DetectedScript[]): DetectedCmp | null {
  for (const cmp of KNOWN_CMPS) {
    const cookieHit = cmp.cookieMatch && cookies.some((c) => cmp.cookieMatch!.test(c.name));
    const scriptHit = cmp.scriptMatch && scripts.some((s) => cmp.scriptMatch!.test(s.url) || cmp.scriptMatch!.test(s.domain));
    if (cookieHit || scriptHit) {
      return {
        name: cmp.name,
        pricing: cmp.pricing,
        isCompetitor: cmp.isCompetitor,
        isOurs: Boolean(cmp.isOurs),
      };
    }
  }
  return null;
}

interface ComplianceGrade {
  letter: "A" | "B" | "C" | "D" | "F";
  score: number;
  color: string;
  label: string;
  verdict: string;
}

function calculateGrade(result: ScanResult, cmp: DetectedCmp | null): ComplianceGrade {
  const cookies = result.cookies || [];
  const scripts = result.trackingScripts || [];

  let score = 100;
  const marketingCookies = cookies.filter((c) => c.category === "marketing").length;
  const analyticsCookies = cookies.filter((c) => c.category === "analytics").length;
  const thirdPartyCookies = cookies.filter((c) => c.type === "third-party").length;
  const marketingScripts = scripts.filter((s) => s.category === "marketing").length;
  const analyticsScripts = scripts.filter((s) => s.category === "analytics").length;

  // Cookies set pre-consent are HARD evidence of collection without consent — heavily weighted.
  score -= marketingCookies * 8;
  score -= analyticsCookies * 4;
  score -= thirdPartyCookies * 4;
  // Scripts being LOADED is softer evidence — many ad platforms (Google Consent Mode v2,
  // Meta consent signaling, TikTok consent mode) allow scripts to load pre-consent as long
  // as they respect the consent state. Lower weight, used as a hint of risk.
  score -= marketingScripts * 1.5;
  score -= analyticsScripts * 1;

  // No CMP at all + tracking happening = high risk
  if (!cmp && marketingCookies > 0) {
    score -= 25;
  }
  if (!cmp && (marketingScripts > 0 || analyticsCookies > 2)) {
    score -= 10;
  }

  // CMP present but cookies still being set pre-consent: the wrapper is failing.
  // Cap at D (max 50). Scripts alone don't trigger this — they may be using consent mode.
  if (cmp && marketingCookies >= 3) {
    score = Math.min(score, 50);
  }
  // Egregious: many marketing cookies set pre-consent → automatic F.
  if (marketingCookies >= 8) {
    score = Math.min(score, 30);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  if (score >= 90) {
    return { letter: "A", score, color: "text-green-700 bg-green-50 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900", label: "Excellent", verdict: "Your site looks compliant." };
  }
  if (score >= 75) {
    return { letter: "B", score, color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900", label: "Good", verdict: "Minor improvements would make your site fully compliant." };
  }
  if (score >= 55) {
    return { letter: "C", score, color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900", label: "Needs work", verdict: "Your site is at risk. Several issues need attention." };
  }
  if (score >= 35) {
    return { letter: "D", score, color: "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-900", label: "Non-compliant", verdict: "Your site is not GDPR compliant. Action needed." };
  }
  return { letter: "F", score, color: "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900", label: "Critical", verdict: "Your site has serious compliance issues. You're at risk of fines." };
}

const categoryColors: Record<string, string> = {
  necessary: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  functional: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  analytics: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  marketing: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const categoryLabels: Record<string, string> = {
  necessary: "Necessary",
  functional: "Functional",
  analytics: "Analytics",
  marketing: "Marketing",
};

function ScanJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ConsentEase Free Cookie Scanner",
    "url": "https://consentease.io/scan",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web",
    "description": "Free cookie compliance scanner. Check if your website is GDPR compliant. Detects all cookies and tracking scripts automatically.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
    },
    "creator": {
      "@type": "Organization",
      "name": "ConsentEase",
      "url": "https://consentease.io",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function ScanPage() {
  useCanonical("/scan");
  const [url, setUrl] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [phase, setPhase] = useState<"input" | "scanning" | "results" | "error">("input");
  const [errorMessage, setErrorMessage] = useState("");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    document.title = "Free Cookie Scanner — Check Your Website's GDPR Compliance | ConsentEase";
    const desc = "Scan your website for free. Discover all cookies and tracking scripts. Check if you're GDPR/CCPA compliant. Instant results, no sign-up needed.";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute("content", desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "Free Cookie Scanner — Check GDPR Compliance | ConsentEase");
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", desc);
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", "Free Cookie Scanner — Check GDPR Compliance | ConsentEase");
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute("content", desc);
  }, []);

  const scanMutation = useMutation({
    mutationFn: async (domain: string) => {
      const res = await fetch("/api/public/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to scan website");
      }
      return data as ScanResult;
    },
    onSuccess: (result) => {
      setScanResult(result);
      setPhase("results");
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
      setPhase("error");
    },
  });

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setPhase("scanning");
    scanMutation.mutate(url.trim());
  };

  const autoTriggeredRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (autoTriggeredRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const domainParam = params.get("domain");
    if (domainParam && domainParam.trim()) {
      autoTriggeredRef.current = true;
      const cleaned = domainParam.trim();
      setUrl(cleaned);
      setPhase("scanning");
      scanMutation.mutate(cleaned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryCounts = () => {
    if (!scanResult) return {};
    const counts: Record<string, number> = {};
    scanResult.cookies.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  };

  // Returns { hardIssues, softIssues } — hardIssues = definitive violations (cookies set
  // pre-consent). softIssues = scripts loaded that need to use consent mode correctly.
  const getComplianceIssues = () => {
    const hard: string[] = [];
    const soft: string[] = [];
    if (!scanResult) return { hard, soft };
    const cats = getCategoryCounts();
    const scripts = scanResult.trackingScripts || [];
    const marketingScripts = scripts.filter((s) => s.category === "marketing");
    const analyticsScripts = scripts.filter((s) => s.category === "analytics");
    const thirdParty = scanResult.cookies.filter((c) => c.type === "third-party");

    // HARD violations — cookies actually set without consent
    if (cats.marketing && cats.marketing > 0) {
      hard.push(`${cats.marketing} marketing cookie${cats.marketing > 1 ? "s" : ""} set before consent — confirmed GDPR violation`);
    }
    if (cats.analytics && cats.analytics > 0) {
      hard.push(`${cats.analytics} analytics cookie${cats.analytics > 1 ? "s" : ""} set before consent — most require prior consent under GDPR`);
    }
    if (thirdParty.length > 0) {
      hard.push(`${thirdParty.length} third-party cookie${thirdParty.length > 1 ? "s" : ""} set — these require explicit consent in the EU`);
    }

    // SOFT signals — scripts loaded, may or may not be a violation depending on consent mode
    if (marketingScripts.length > 0) {
      const providers = Array.from(new Set(marketingScripts.map((s) => s.provider))).slice(0, 3).join(", ");
      soft.push(`Marketing scripts loaded pre-consent (${providers}${marketingScripts.length > 3 ? ", and more" : ""}) — these must respect consent state via Consent Mode, or be blocked entirely`);
    }
    if (analyticsScripts.length > 0 && marketingScripts.length === 0) {
      soft.push(`${analyticsScripts.length} analytics script${analyticsScripts.length > 1 ? "s" : ""} loaded pre-consent — must use consent mode or be blocked`);
    }
    if (scanResult.cookiesFound > 5 && (cats.marketing || cats.analytics)) {
      soft.push("A properly configured consent banner that genuinely blocks scripts is mandatory");
    }

    return { hard, soft };
  };

  return (
    <div className="min-h-screen bg-background">
      <ScanJsonLd />

      <nav className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src={logoImage} alt="ConsentEase" className="h-8 w-8" />
              <span className="font-heading text-xl font-bold">ConsentEase</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" data-testid="link-login">Log in</Button>
              </Link>
              <Link href="/onboarding">
                <Button size="sm" data-testid="link-signup">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <MagnifyingGlass size={16} />
            Free Tool — No Sign-up Required
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight mb-4">
            Is Your Website Cookie Compliant?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Scan your website for free and discover all cookies and tracking scripts. 
            Find out if you need a cookie consent banner — in seconds.
          </p>

          <form onSubmit={handleScan} className="max-w-xl mx-auto">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter your website URL (e.g. example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 text-base"
                disabled={phase === "scanning"}
                data-testid="input-scan-url"
              />
              <Button
                type="submit"
                size="lg"
                disabled={phase === "scanning" || !url.trim()}
                className="h-12 px-6"
                data-testid="button-scan"
              >
                {phase === "scanning" ? (
                  <>
                    <Spinner size={18} className="mr-2" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <MagnifyingGlass size={18} className="mr-2" />
                    Scan
                  </>
                )}
              </Button>
            </div>
          </form>

          {phase === "scanning" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10"
            >
              <Card>
                <CardContent className="py-12 text-center">
                  <Spinner variant="brand" size={48} className="text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Scanning your website...</h3>
                  <p className="text-muted-foreground">Detecting cookies, tracking scripts, and localStorage items. This usually takes 15-30 seconds.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10"
            >
              <Card className="border-destructive/30">
                <CardContent className="py-8 text-center">
                  <Warning size={40} className="text-destructive mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Scan Failed</h3>
                  <p className="text-muted-foreground mb-4">{errorMessage}</p>
                  <Button onClick={() => { setPhase("input"); setErrorMessage(""); }} data-testid="button-try-again">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <AnimatePresence>
            {phase === "results" && scanResult && (() => {
              const trackingScripts = scanResult.trackingScripts || [];
              const cmp = detectCmp(scanResult.cookies, trackingScripts);
              const isEmpty = scanResult.cookiesFound === 0 && trackingScripts.length === 0;
              const grade = calculateGrade(scanResult, cmp);
              const cats = getCategoryCounts();
              const thirdPartyCount = scanResult.cookies.filter((c) => c.type === "third-party").length;
              const marketingScriptCount = trackingScripts.filter((s) => s.category === "marketing").length;
              const hasHardViolation = (cats.marketing || 0) + (cats.analytics || 0) + scanResult.cookies.filter((c) => c.type === "third-party").length > 0;

              const headlineCta = isEmpty
                ? `Verify ${scanResult.domain} is truly compliant`
                : hasHardViolation
                  ? `Stop the violations on ${scanResult.domain} in 2 minutes`
                  : marketingScriptCount > 0
                    ? `Make sure ${marketingScriptCount} marketing tracker${marketingScriptCount > 1 ? "s" : ""} on ${scanResult.domain} respect consent`
                    : `Set up a proper consent banner on ${scanResult.domain}`;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 text-left"
                >
                  {!isEmpty && (
                    <Card className={`mb-6 border-2 ${grade.color}`} data-testid="card-grade">
                      <CardContent className="py-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                          <div className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center font-heading font-bold text-5xl sm:text-6xl border-2 ${grade.color}`} data-testid="text-grade-letter">
                            {grade.letter}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Globe size={18} weight="duotone" className="opacity-70" />
                              <span className="text-sm font-mono opacity-80 truncate" data-testid="text-domain">{scanResult.domain}</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-heading font-bold mb-1" data-testid="text-verdict-label">
                              Compliance grade: {grade.label}
                            </h3>
                            <p className="text-sm sm:text-base opacity-90" data-testid="text-verdict-message">{grade.verdict}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-3xl font-bold" data-testid="text-grade-score">{grade.score}<span className="text-base opacity-60">/100</span></div>
                            <div className="text-xs uppercase tracking-wide opacity-70">Score</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {cmp && (
                    <Card className="mb-6 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20" data-testid="card-cmp">
                      <CardContent className="py-5">
                        <div className="flex items-start gap-3">
                          <Info size={22} weight="duotone" className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1" data-testid="text-cmp-name">
                              {cmp.isOurs ? `${cmp.name} detected — you're already with us 👋` : `Existing consent banner detected: ${cmp.name}`}
                            </h4>
                            {cmp.isCompetitor && !cmp.isOurs && (
                              <p className="text-sm text-blue-800 dark:text-blue-300">
                                {cmp.name} typically costs {cmp.pricing}. ConsentEase delivers the same compliance from €3/month — and you can switch in under 5 minutes.
                              </p>
                            )}
                            {!cmp.isCompetitor && !cmp.isOurs && (
                              <p className="text-sm text-blue-800 dark:text-blue-300">
                                We detected the {cmp.name}. Tracking cookies are still firing pre-consent below — your current setup may not be fully blocking them.
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {isEmpty ? (
                    <Card className="mb-6 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20" data-testid="card-empty-state">
                      <CardContent className="py-6">
                        <div className="flex items-start gap-3 mb-4">
                          <Warning size={24} weight="duotone" className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-1">No cookies or trackers detected on {scanResult.domain}</h3>
                            <p className="text-sm text-amber-800 dark:text-amber-300">This usually means one of the following:</p>
                          </div>
                        </div>
                        <ul className="space-y-2 ml-1 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle size={18} weight="duotone" className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                            <span>Your site uses a consent banner that <strong>genuinely blocks all scripts before consent</strong> — that's compliant. Well done.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Warning size={18} weight="duotone" className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                            <span>The scanner couldn't fully load your site (heavy JS, geo-block, or bot protection). The scan may be incomplete.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Eye size={18} weight="duotone" className="text-muted-foreground shrink-0 mt-0.5" />
                            <span>Your site is genuinely cookie-free (rare for modern websites).</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        <Card data-testid="card-stat-cookies">
                          <CardContent className="py-4 text-center">
                            <Cookie size={20} weight="duotone" className="text-primary mx-auto mb-1" />
                            <div className="text-2xl font-bold" data-testid="text-stat-cookies">{scanResult.cookiesFound}</div>
                            <div className="text-xs text-muted-foreground">Cookies</div>
                          </CardContent>
                        </Card>
                        <Card data-testid="card-stat-trackers">
                          <CardContent className="py-4 text-center">
                            <Code size={20} weight="duotone" className="text-primary mx-auto mb-1" />
                            <div className="text-2xl font-bold" data-testid="text-stat-trackers">{trackingScripts.length}</div>
                            <div className="text-xs text-muted-foreground">Tracking scripts</div>
                          </CardContent>
                        </Card>
                        <Card data-testid="card-stat-third-party">
                          <CardContent className="py-4 text-center">
                            <Globe size={20} weight="duotone" className="text-primary mx-auto mb-1" />
                            <div className="text-2xl font-bold" data-testid="text-stat-third-party">{thirdPartyCount}</div>
                            <div className="text-xs text-muted-foreground">Third-party</div>
                          </CardContent>
                        </Card>
                        <Card data-testid="card-stat-high-risk">
                          <CardContent className="py-4 text-center">
                            <Warning size={20} weight="duotone" className="text-red-500 mx-auto mb-1" />
                            <div className="text-2xl font-bold" data-testid="text-stat-high-risk">{(cats.marketing || 0) + marketingScriptCount}</div>
                            <div className="text-xs text-muted-foreground">High-risk items</div>
                          </CardContent>
                        </Card>
                      </div>

                      {Object.keys(cats).length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6" data-testid="grid-categories">
                          {Object.entries(cats).map(([category, count]) => (
                            <div key={category} className={`rounded-lg px-3 py-2 text-center ${categoryColors[category] || "bg-gray-100 text-gray-800"}`} data-testid={`badge-cat-${category}`}>
                              <div className="text-xl font-bold">{count}</div>
                              <div className="text-xs font-medium">{categoryLabels[category] || category}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {(() => {
                        const { hard, soft } = getComplianceIssues();
                        if (hard.length === 0 && soft.length === 0) return null;
                        return (
                          <>
                            {hard.length > 0 && (
                              <Card className="mb-6 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20" data-testid="card-issues-hard">
                                <CardContent className="py-5">
                                  <h4 className="font-semibold text-red-900 dark:text-red-200 flex items-center gap-2 mb-3">
                                    <Warning size={20} weight="duotone" />
                                    Confirmed violations ({hard.length})
                                  </h4>
                                  <ul className="space-y-2">
                                    {hard.map((issue, i) => (
                                      <li key={i} className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2" data-testid={`text-issue-hard-${i}`}>
                                        <span className="mt-1 shrink-0">•</span>
                                        {issue}
                                      </li>
                                    ))}
                                  </ul>
                                  <p className="mt-3 text-xs text-red-700 dark:text-red-400 opacity-90">
                                    Cookies set by your site before the visitor consented. This is hard evidence of data collection without legal basis under GDPR.
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                            {soft.length > 0 && (
                              <Card className="mb-6 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20" data-testid="card-issues-soft">
                                <CardContent className="py-5">
                                  <h4 className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-3">
                                    <Info size={20} weight="duotone" />
                                    Needs verification ({soft.length})
                                  </h4>
                                  <ul className="space-y-2">
                                    {soft.map((issue, i) => (
                                      <li key={i} className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2" data-testid={`text-issue-soft-${i}`}>
                                        <span className="mt-1 shrink-0">•</span>
                                        {issue}
                                      </li>
                                    ))}
                                  </ul>
                                  <p className="mt-3 text-xs text-amber-700 dark:text-amber-400 opacity-90">
                                    Tracker scripts can legitimately load pre-consent if they use{" "}
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button
                                          type="button"
                                          className="underline decoration-dotted underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200 focus:outline-none focus:text-amber-900 dark:focus:text-amber-200"
                                          data-testid="button-explain-consent-mode"
                                        >
                                          Google Consent Mode v2
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-72 text-xs leading-relaxed" side="top" align="start" data-testid="popover-consent-mode">
                                        <p className="font-medium text-foreground mb-1.5">Google Consent Mode v2</p>
                                        <p className="text-muted-foreground">
                                          A signaling system that lets Google tags load pre-consent but adjust their behaviour based on the visitor's choice — sending only cookieless pings until consent is granted. Required by Google for EEA traffic since March 2024.
                                        </p>
                                      </PopoverContent>
                                    </Popover>
                                    , Meta consent signaling, or similar — and only collect data once the visitor opts in. Worth confirming.
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                          </>
                        );
                      })()}

                      {trackingScripts.length > 0 && (
                        <Card className="mb-6" data-testid="card-trackers">
                          <CardContent className="py-5">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Code size={18} weight="duotone" className="text-primary" />
                              Tracking scripts loaded ({trackingScripts.length})
                            </h4>
                            <div className="max-h-[260px] overflow-y-auto space-y-1">
                              {trackingScripts.map((script, i) => (
                                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50 text-sm" data-testid={`row-tracker-${i}`}>
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Code size={14} className="text-muted-foreground shrink-0" />
                                    <div className="min-w-0">
                                      <div className="font-medium truncate">{script.provider}</div>
                                      <div className="text-xs text-muted-foreground font-mono truncate">{script.domain}</div>
                                    </div>
                                  </div>
                                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 ${categoryColors[script.category] || "bg-gray-100 text-gray-800"}`}>
                                    {categoryLabels[script.category] || script.category}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {scanResult.cookies.length > 0 && (
                        <Card className="mb-6" data-testid="card-cookies">
                          <CardContent className="py-5">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Cookie size={18} weight="duotone" className="text-primary" />
                              Detected cookies ({scanResult.cookies.length})
                            </h4>
                            <div className="max-h-[300px] overflow-y-auto space-y-1">
                              {scanResult.cookies.map((cookie, i) => (
                                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50 text-sm" data-testid={`row-cookie-${i}`}>
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Cookie size={14} className="text-muted-foreground shrink-0" />
                                    <div className="min-w-0">
                                      <span className="font-mono text-xs truncate block">{cookie.name}</span>
                                      <span className="text-xs text-muted-foreground truncate block">{cookie.provider}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0 ml-2">
                                    <span className="text-xs text-muted-foreground hidden sm:inline">{cookie.type}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[cookie.category] || "bg-gray-100 text-gray-800"}`}>
                                      {categoryLabels[cookie.category] || cookie.category}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  <Card className="border-primary/30 bg-primary/5" data-testid="card-cta">
                    <CardContent className="py-8 text-center">
                      <Shield size={40} weight="duotone" className="text-primary mx-auto mb-3" />
                      <h3 className="text-xl sm:text-2xl font-heading font-bold mb-2" data-testid="text-cta-headline">{headlineCta}</h3>
                      <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                        {cmp?.isCompetitor && !cmp.isOurs
                          ? `Switch from ${cmp.name} (${cmp.pricing}) to ConsentEase (from €3/month). Same compliance, fraction of the cost. 7-day free trial on every plan.`
                          : isEmpty
                            ? `ConsentEase generates a properly configured banner that genuinely blocks scripts pre-consent — and proves it with audit-ready logs. From €3/month, 7-day free trial on every plan.`
                            : `ConsentEase automatically creates a compliant banner that blocks every script and cookie until your visitors consent. From €3/month, 7-day free trial on every plan.`}
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/onboarding">
                          <Button size="lg" data-testid="button-start-trial">
                            Start Free Trial
                            <ArrowRight size={18} className="ml-2" />
                          </Button>
                        </Link>
                        <Link href={`/demo?domain=${encodeURIComponent(scanResult.domain)}`}>
                          <Button variant="secondary" size="lg" data-testid="button-try-demo-with-domain">
                            Try the demo with {scanResult.domain}
                          </Button>
                        </Link>
                        <Link href="/pricing">
                          <Button variant="outline" size="lg" data-testid="button-view-pricing">
                            View Pricing
                          </Button>
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        See your dashboard, banner preview & analytics — no signup required.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </section>

      {phase === "input" && (
        <>
          <section className="py-16 border-t">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-heading font-bold text-center mb-10">What Our Scanner Checks</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <Cookie size={28} className="text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Cookies & Storage</h3>
                    <p className="text-sm text-muted-foreground">Detects HTTP cookies, localStorage, and sessionStorage items across your entire site.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <Eye size={28} className="text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Tracking Scripts</h3>
                    <p className="text-sm text-muted-foreground">Identifies Google Analytics, Facebook Pixel, Hotjar, and 100+ other tracking scripts.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <ChartBar size={28} className="text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Category Classification</h3>
                    <p className="text-sm text-muted-foreground">Automatically categorizes each cookie as Necessary, Functional, Analytics, or Marketing.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="py-16 border-t bg-muted/30">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl font-heading font-bold mb-4">Why Do You Need a Cookie Consent Banner?</h2>
              <p className="text-muted-foreground mb-8">
                If your website uses any non-essential cookies (analytics, marketing, social media), 
                EU law (GDPR) and California law (CCPA) require you to get visitor consent before loading them.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background border">
                  <Lock size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">GDPR Fines</h4>
                    <p className="text-xs text-muted-foreground">Up to €20 million or 4% of annual revenue for non-compliance.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background border">
                  <Shield size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Google Consent Mode v2</h4>
                    <p className="text-xs text-muted-foreground">Required since March 2024 for Google Ads measurement in the EU.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background border">
                  <Globe size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">CCPA Requirements</h4>
                    <p className="text-xs text-muted-foreground">California consumers must be able to opt out of the sale of personal information.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background border">
                  <CheckCircle size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Trust & Transparency</h4>
                    <p className="text-xs text-muted-foreground">Visitors trust websites that are transparent about data collection.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} ConsentEase. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
