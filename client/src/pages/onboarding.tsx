import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle2, Loader2, Globe, ArrowRight, Search, Lock, Cookie, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Website {
  id: string;
  publicId: string;
  domain: string;
  status: string;
  lastScan: string | null;
  cookiesFound: number | null;
  scriptsFound: number | null;
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"input" | "scanning" | "complete" | "error">("input");
  const [url, setUrl] = useState("");
  const [createdWebsiteId, setCreatedWebsiteId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ cookies: number; scripts: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if user is authenticated
  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.status === 401) {
        return null;
      }
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login?redirect=/onboarding");
    }
  }, [authLoading, user, setLocation]);

  // Create website mutation
  const createWebsiteMutation = useMutation({
    mutationFn: async (domain: string) => {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ domain }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create website");
      }
      return res.json();
    },
    onSuccess: (website: Website) => {
      setCreatedWebsiteId(website.id);
      setStep("scanning");
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
      setStep("error");
      toast.error(error.message);
    },
  });

  // Poll for website status while scanning
  const { data: websiteStatus } = useQuery({
    queryKey: ["/api/websites", createdWebsiteId],
    queryFn: async () => {
      if (!createdWebsiteId) return null;
      const res = await fetch("/api/websites", { credentials: "include" });
      if (!res.ok) return null;
      const websites: Website[] = await res.json();
      return websites.find(w => w.id === createdWebsiteId);
    },
    enabled: !!createdWebsiteId && step === "scanning",
    refetchInterval: step === "scanning" ? 2000 : false,
  });

  // Check if scan is complete
  useEffect(() => {
    if (websiteStatus && step === "scanning") {
      if (websiteStatus.status === "compliant" || websiteStatus.status === "needs_attention") {
        setScanResult({
          cookies: websiteStatus.cookiesFound || 0,
          scripts: websiteStatus.scriptsFound || 0,
        });
        setStep("complete");
      } else if (websiteStatus.status === "error") {
        setErrorMessage("Failed to scan website. Please try again.");
        setStep("error");
      }
    }
  }, [websiteStatus, step]);

  const startScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Clean up the URL
    let domain = url.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    
    createWebsiteMutation.mutate(domain);
  };

  // Calculate progress based on status
  const getProgress = () => {
    if (!websiteStatus) return 10;
    switch (websiteStatus.status) {
      case "pending": return 10;
      case "scanning": return 50;
      case "compliant":
      case "needs_attention": return 100;
      default: return 30;
    }
  };

  const getScanStage = () => {
    if (!websiteStatus) return "Initializing scanner...";
    switch (websiteStatus.status) {
      case "pending": return "Preparing to scan...";
      case "scanning": return "Scanning website for cookies...";
      case "compliant": return "Scan complete!";
      case "needs_attention": return "Scan complete - review needed";
      default: return "Processing...";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient text-white mb-6 shadow-lg shadow-primary/20">
            <Shield className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">
            {step === "input" && "Let's get you compliant"}
            {step === "scanning" && "Scanning your site"}
            {step === "complete" && "Scan Complete!"}
            {step === "error" && "Something went wrong"}
          </h1>
          <p className="text-muted-foreground">
            {step === "input" && "Enter your website URL to automatically detect cookies and generate your banner."}
            {step === "scanning" && "We're analyzing your site structure and tracking technologies."}
            {step === "complete" && `We found ${scanResult?.cookies || 0} cookies. Your banner is ready.`}
            {step === "error" && errorMessage}
          </p>
        </div>

        {/* Content */}
        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {step === "input" && (
                <motion.form 
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={startScan}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="yourwebsite.com" 
                        className="pl-9 h-12 text-lg"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        autoFocus
                        data-testid="input-website-url"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 text-base shadow-lg shadow-primary/20" 
                    disabled={!url || createWebsiteMutation.isPending}
                    data-testid="button-start-scan"
                  >
                    {createWebsiteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Start Scan <ArrowRight className="w-4 h-4 ml-2" />
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
                      <Search className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-center">
                    <h3 className="font-medium text-lg">{getScanStage()}</h3>
                    <Progress value={getProgress()} className="h-2" />
                    <p className="text-xs text-muted-foreground pt-2">
                      This may take up to 30 seconds...
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className={`flex items-center gap-3 text-sm text-muted-foreground ${getProgress() >= 10 ? 'opacity-100' : 'opacity-50'}`}>
                      {getProgress() >= 30 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Connecting to website</span>
                    </div>
                    <div className={`flex items-center gap-3 text-sm text-muted-foreground ${getProgress() >= 50 ? 'opacity-100' : 'opacity-50'}`}>
                      {getProgress() >= 80 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Detecting cookies & scripts</span>
                    </div>
                    <div className={`flex items-center gap-3 text-sm text-muted-foreground ${getProgress() >= 100 ? 'opacity-100' : 'opacity-50'}`}>
                      {getProgress() >= 100 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Classifying cookies</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "complete" && (
                <motion.div 
                  key="complete"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col items-center text-center">
                      <Cookie className="w-8 h-8 text-green-500 mb-2" />
                      <span className="text-2xl font-bold text-foreground">{scanResult?.cookies || 0}</span>
                      <span className="text-sm text-muted-foreground">Cookies Found</span>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center text-center">
                      <Shield className="w-8 h-8 text-primary mb-2" />
                      <span className="text-2xl font-bold text-foreground">4</span>
                      <span className="text-sm text-muted-foreground">Categories</span>
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Compliance Status
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>GDPR (Europe)</span>
                        <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>CCPA (California)</span>
                        <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Google Consent Mode v2</span>
                        <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full h-12 text-base" 
                    onClick={() => setLocation("/dashboard/banner")}
                    data-testid="button-customize-banner"
                  >
                    Customize Banner <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {step === "error" && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-muted-foreground">{errorMessage}</p>
                  </div>

                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full h-12 text-base" 
                    onClick={() => {
                      setStep("input");
                      setErrorMessage("");
                      setCreatedWebsiteId(null);
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
      </div>
    </div>
  );
}
