import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, CheckCircle, Globe, ArrowRight, MagnifyingGlass, Cookie, WarningCircle, Envelope, Lock, Eye, EyeSlash } from "@phosphor-icons/react";
import { Spinner } from "@/components/ui/spinner";
const logoImage = "/consentease-logo.webp";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ClassifiedCookie {
  name: string;
  category: string;
  provider: string;
  purpose: string;
  expiry: string;
  type: string;
}

interface ScanResult {
  success: boolean;
  domain: string;
  cookies: ClassifiedCookie[];
  cookiesFound: number;
}

const stepProgress: Record<string, number> = {
  url: 20,
  scanning: 40,
  results: 60,
  register: 80,
  complete: 100,
  error: 20,
};

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<"url" | "scanning" | "results" | "register" | "complete" | "error">("url");
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cleanDomain, setCleanDomain] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const referralAgency = urlParams.get("referralAgency");
  const inviteId = urlParams.get("inviteId");

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
      setCleanDomain(result.domain);
      setStep("results");
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
      setStep("error");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/onboarding/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          domain: cleanDomain,
          cookies: scanResult?.cookies || [],
          ...(referralAgency && { referralAgency }),
          ...(inviteId && { inviteId }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }
      return data;
    },
    onSuccess: (data) => {
      if (isRedirecting) return;
      setIsRedirecting(true);
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      toast.success("Account created successfully!");
      setStep("complete");
      
      const redirect = data.redirect || "/dashboard/banner";
      if (redirect.startsWith("http")) {
        window.location.assign(redirect);
      } else {
        setLocation(redirect);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const startScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    let domain = url.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    setCleanDomain(domain);
    
    setStep("scanning");
    scanMutation.mutate(domain);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 shadow-lg shadow-primary/20">
            <img src={logoImage} alt="ConsentEase" className="h-10 w-10 object-contain" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">
            {step === "url" && "Let's get you compliant"}
            {step === "scanning" && "Scanning your site"}
            {step === "results" && "Scan Complete!"}
            {step === "register" && "Create your account"}
            {step === "complete" && "You're all set!"}
            {step === "error" && "Something went wrong"}
          </h1>
          <p className="text-muted-foreground">
            {step === "url" && "Enter your website URL to see what cookies need consent."}
            {step === "scanning" && "Analyzing your website for cookies and tracking scripts..."}
            {step === "results" && `Found ${scanResult?.cookiesFound || 0} cookies on ${cleanDomain}`}
            {step === "register" && "Save your scan results and create your consent banner."}
            {step === "complete" && "Redirecting you to your dashboard..."}
            {step === "error" && "We couldn't complete the scan."}
          </p>
        </div>

        <div className="mb-4">
          <Progress value={stepProgress[step] || 20} className="h-2" aria-label="Onboarding progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stepProgress[step] || 20} />
          <p className="text-xs text-muted-foreground mt-1.5 text-right" aria-live="polite">
            Step {step === "url" ? 1 : step === "scanning" ? 2 : step === "results" ? 3 : step === "register" ? 4 : step === "complete" ? 5 : 1} of 5
          </p>
        </div>

        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {step === "url" && (
                <motion.form 
                  key="url"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={startScan}
                  className="space-y-4"
                  aria-label="Website URL form"
                >
                  <div className="space-y-2">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input 
                        placeholder="yourwebsite.com" 
                        className="pl-9 h-12 text-lg"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        autoFocus
                        data-testid="input-url"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">No account needed - see your results first</p>
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full" 
                    disabled={!url}
                    data-testid="button-scan"
                  >
                    Scan My Website <ArrowRight size={16} className="ml-2" />
                  </Button>
                </motion.form>
              )}

              {step === "scanning" && (
                <motion.div 
                  key="scanning"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-6 py-4"
                >
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MagnifyingGlass size={32} className="text-primary animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-center">
                    <h3 className="font-medium text-lg">Scanning {cleanDomain}...</h3>
                    <p className="text-xs text-muted-foreground pt-2">
                      This usually takes 15-30 seconds
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Spinner size={16} />
                      <span>Loading your website in a browser...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground opacity-50">
                      <Spinner size={16} className="animate-none" />
                      <span>Detecting cookies and scripts...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground opacity-50">
                      <Spinner size={16} className="animate-none" />
                      <span>Classifying by purpose...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "results" && (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                  aria-live="polite"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col items-center text-center">
                      <Cookie size={32} className="text-green-500 mb-2" />
                      <span className="text-2xl font-bold text-foreground">{scanResult?.cookiesFound || 0}</span>
                      <span className="text-sm text-muted-foreground">Cookies Found</span>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center text-center">
                      <Shield size={32} className="text-primary mb-2" />
                      <span className="text-2xl font-bold text-foreground">4</span>
                      <span className="text-sm text-muted-foreground">Categories</span>
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Shield size={16} className="text-primary" />
                      What we'll help you with
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span>GDPR Compliance (Europe)</span>
                        <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle size={12} /> Ready</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span>CCPA Compliance (California)</span>
                        <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle size={12} /> Ready</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span>Google Consent Mode v2</span>
                        <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle size={12} /> Ready</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full" 
                    onClick={() => setStep("register")}
                    data-testid="button-continue-to-register"
                  >
                    Create My Banner <ArrowRight size={16} className="ml-2" />
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Free 7-day trial on every plan. Cancel any time.
                  </p>
                </motion.div>
              )}

              {step === "register" && (
                <motion.form 
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                  aria-label="Create account form"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input 
                        id="email"
                        type="email"
                        placeholder="you@company.com" 
                        className="pl-9 h-12"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={registerMutation.isPending}
                        autoFocus
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input 
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 6 characters" 
                        className="pl-9 pr-10 h-12"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={registerMutation.isPending}
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        data-testid="button-toggle-password"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full" 
                    disabled={!email || !password || registerMutation.isPending}
                    data-testid="button-register"
                  >
                    {registerMutation.isPending ? (
                      <Spinner size={16} className="mr-2" />
                    ) : null}
                    Create Account & Continue
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    By creating an account, you agree to our{" "}
                    <a href="/legal/terms" className="underline hover:text-foreground">Terms</a>
                    {" "}and{" "}
                    <a href="/legal/privacy" className="underline hover:text-foreground">Privacy Policy</a>
                  </p>
                  
                  <div className="pt-2 text-center">
                    <button 
                      type="button"
                      onClick={() => setStep("results")}
                      className="text-sm text-muted-foreground hover:text-foreground"
                      data-testid="button-back-to-results"
                    >
                      ← Back to results
                    </button>
                  </div>
                </motion.form>
              )}

              {step === "complete" && (
                <motion.div 
                  key="complete"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium">Account Created!</h3>
                  <p className="text-muted-foreground">Taking you to your dashboard...</p>
                  <Spinner size={20} className="mx-auto text-primary" />
                </motion.div>
              )}

              {step === "error" && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <Alert variant="destructive">
                    <WarningCircle size={16} />
                    <AlertTitle>Scan Failed</AlertTitle>
                    <AlertDescription>
                      {errorMessage || "We couldn't scan your website. Please check the URL and try again."}
                    </AlertDescription>
                  </Alert>

                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full" 
                    onClick={() => {
                      setStep("url");
                      setErrorMessage("");
                      setScanResult(null);
                    }}
                    data-testid="button-try-again"
                  >
                    Try Again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        
        {(step === "url" || step === "register") && (
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline font-medium" data-testid="link-login">Log in</a>
          </p>
        )}
      </div>
    </div>
  );
}
