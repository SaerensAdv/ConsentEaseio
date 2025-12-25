import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle2, Loader2, Globe, ArrowRight, Search, Lock, Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"input" | "scanning" | "complete">("input");
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [scanStage, setScanStage] = useState("Initializing scanner...");

  // Simulated scan process
  useEffect(() => {
    if (step === "scanning") {
      const stages = [
        { p: 10, msg: "Resolving DNS..." },
        { p: 25, msg: "Crawling homepage..." },
        { p: 40, msg: "Detecting tracking scripts..." },
        { p: 55, msg: "Identifying Google Analytics..." },
        { p: 70, msg: "Analyzing Facebook Pixel..." },
        { p: 85, msg: "Classifying cookies with AI..." },
        { p: 100, msg: "Generating compliance report..." }
      ];

      let currentStage = 0;
      const interval = setInterval(() => {
        if (currentStage >= stages.length) {
          clearInterval(interval);
          setTimeout(() => setStep("complete"), 500);
          return;
        }
        
        const stage = stages[currentStage];
        setProgress(stage.p);
        setScanStage(stage.msg);
        currentStage++;
      }, 600);

      return () => clearInterval(interval);
    }
  }, [step]);

  const startScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setStep("scanning");
  };

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
          </h1>
          <p className="text-muted-foreground">
            {step === "input" && "Enter your website URL to automatically detect cookies and generate your banner."}
            {step === "scanning" && "We're analyzing your site structure and tracking technologies."}
            {step === "complete" && "We found 12 cookies and 3 tracking scripts. Your banner is ready."}
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
                        placeholder="saerensadvertising.com" 
                        className="pl-9 h-12 text-lg"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="w-full h-12 text-base shadow-lg shadow-primary/20" disabled={!url}>
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
                    <h3 className="font-medium text-lg">{scanStage}</h3>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground pt-2">{progress}% complete</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground opacity-50">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>DNS Resolution</span>
                    </div>
                    <div className={`flex items-center gap-3 text-sm text-muted-foreground ${progress > 40 ? 'opacity-100' : 'opacity-50'}`}>
                      {progress > 40 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Tracking Scripts</span>
                    </div>
                    <div className={`flex items-center gap-3 text-sm text-muted-foreground ${progress > 80 ? 'opacity-100' : 'opacity-50'}`}>
                      {progress > 80 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Cookie Classification</span>
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
                      <span className="text-2xl font-bold text-foreground">12</span>
                      <span className="text-sm text-muted-foreground">Cookies Found</span>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center text-center">
                      <Lock className="w-8 h-8 text-amber-500 mb-2" />
                      <span className="text-2xl font-bold text-foreground">3</span>
                      <span className="text-sm text-muted-foreground">Scripts Blocked</span>
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
                    </div>
                  </div>

                  <Button size="lg" className="w-full h-12 text-base" onClick={() => setLocation("/dashboard/banner")}>
                    Customize Banner <ArrowRight className="w-4 h-4 ml-2" />
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