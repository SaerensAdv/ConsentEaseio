import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  Search, 
  Cookie, 
  Palette, 
  BarChart3, 
  CheckCircle2, 
  Shield,
  Sparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEP_DURATION = 2800;
const STORAGE_KEY = "consentease_intro_seen";

interface IntroOverlayProps {
  onComplete: () => void;
}

export function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);

  const steps = [
    { 
      id: 0, 
      title: "Add Your Website", 
      subtitle: "Just paste your URL and we'll do the rest",
      icon: Globe,
      color: "#726CEA"
    },
    { 
      id: 1, 
      title: "Automatic Cookie Scan", 
      subtitle: "We detect every cookie and tracker instantly",
      icon: Search,
      color: "#3b82f6"
    },
    { 
      id: 2, 
      title: "Smart Categorization", 
      subtitle: "Cookies sorted by purpose, GDPR-ready",
      icon: Cookie,
      color: "#f97316"
    },
    { 
      id: 3, 
      title: "Brand-Perfect Design", 
      subtitle: "Customize every pixel to match your site",
      icon: Palette,
      color: "#ec4899"
    },
    { 
      id: 4, 
      title: "Real-Time Analytics", 
      subtitle: "Track consent rates and user behavior",
      icon: BarChart3,
      color: "#22c55e"
    },
    { 
      id: 5, 
      title: "You're Compliant!", 
      subtitle: "GDPR, CCPA & Google Consent Mode v2",
      icon: CheckCircle2,
      color: "#22c55e"
    },
  ];

  const handleSkip = useCallback(() => {
    setIsExiting(true);
    localStorage.setItem(STORAGE_KEY, "true");
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 600);
  }, [onComplete]);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem(STORAGE_KEY);
    if (hasSeenIntro) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(handleSkip, 1500);
          return prev;
        }
        return prev + 1;
      });
    }, STEP_DURATION);

    return () => clearInterval(interval);
  }, [steps.length, handleSkip, onComplete]);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        skipButtonRef.current?.focus();
        return;
      }
      e.preventDefault();
      handleSkip();
    };
    
    if (isVisible) {
      window.addEventListener("keydown", handleKeyDown);
      setTimeout(() => skipButtonRef.current?.focus(), 100);
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, handleSkip]);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Product introduction"
          initial={{ opacity: 1 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute w-[800px] h-[800px] rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: currentStepData.color }}
              animate={{
                x: ["-20%", "60%", "-20%"],
                y: ["-20%", "40%", "-20%"],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute right-0 bottom-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-15"
              style={{ backgroundColor: steps[(currentStep + 2) % steps.length].color }}
              animate={{
                x: ["20%", "-40%", "20%"],
                y: ["20%", "-30%", "20%"],
                scale: [1.2, 1, 1.2],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <Button
            ref={skipButtonRef}
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute top-6 right-6 z-10 text-muted-foreground hover:text-foreground gap-2"
            aria-label="Skip intro"
          >
            Skip <X className="w-4 h-4" />
          </Button>

          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient flex items-center justify-center text-white">
                  <Shield className="w-6 h-6 fill-current" />
                </div>
                <span className="text-2xl font-display font-bold">ConsentEase</span>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-12"
              >
                <motion.div
                  className="w-28 h-28 rounded-3xl mx-auto mb-8 flex items-center justify-center"
                  style={{ backgroundColor: currentStepData.color + "20" }}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon className="w-14 h-14" style={{ color: currentStepData.color }} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span 
                    className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
                    style={{ 
                      backgroundColor: currentStepData.color + "15",
                      color: currentStepData.color 
                    }}
                  >
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </motion.div>

                <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight">
                  {currentStepData.title}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto">
                  {currentStepData.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <StepVisual step={currentStep} color={currentStepData.color} />
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6">
            <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
              <span>{Math.round(progress)}% complete</span>
              <span className="text-xs opacity-60">Press any key to skip</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: currentStepData.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentStep 
                      ? "w-6" 
                      : idx < currentStep 
                        ? "opacity-100" 
                        : "opacity-30"
                  }`}
                  style={{ 
                    backgroundColor: idx <= currentStep ? step.color : "hsl(var(--border))"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StepVisual({ step, color }: { step: number; color: string }) {
  const visuals = [
    <UrlInputVisual key={0} color={color} />,
    <ScanningVisual key={1} color={color} />,
    <CategoriesVisual key={2} color={color} />,
    <CustomizationVisual key={3} color={color} />,
    <AnalyticsVisual key={4} color={color} />,
    <CompletionVisual key={5} color={color} />,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="h-[180px] flex items-center justify-center"
    >
      {visuals[step]}
    </motion.div>
  );
}

function UrlInputVisual({ color }: { color: string }) {
  const [text, setText] = useState("");
  const fullText = "https://mystore.com";

  useEffect(() => {
    let idx = 0;
    let interval: NodeJS.Timeout | null = null;
    
    interval = setInterval(() => {
      if (idx <= fullText.length) {
        setText(fullText.slice(0, idx));
        idx++;
      } else if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }, 60);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <motion.div 
      className="bg-card border border-border rounded-xl p-4 shadow-xl w-full max-w-sm"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
    >
      <div className="flex items-center gap-3 bg-secondary/50 rounded-lg px-4 py-3">
        <Globe className="w-5 h-5 text-muted-foreground" />
        <span className="font-mono text-sm flex-1">{text}<span className="animate-pulse">|</span></span>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: text.length > 10 ? 1 : 0 }}
        className="mt-3 flex justify-end"
      >
        <div 
          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: color }}
        >
          Start Scanning
        </div>
      </motion.div>
    </motion.div>
  );
}

function ScanningVisual({ color }: { color: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    interval = setInterval(() => {
      setProgress((p) => {
        const newProgress = Math.min(p + 4, 100);
        if (newProgress >= 100 && interval) {
          clearInterval(interval);
          interval = null;
        }
        return newProgress;
      });
    }, 50);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Scanning cookies...</span>
        <span className="text-sm font-mono" style={{ color }}>{progress}%</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, width: `${progress}%` }}
        />
      </div>
      <div className="flex gap-2 mt-4 flex-wrap justify-center">
        {["_ga", "_gid", "_fbp", "session"].slice(0, Math.floor(progress / 25)).map((cookie) => (
          <motion.span
            key={cookie}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-3 py-1 bg-card border border-border rounded-full text-xs font-mono"
          >
            {cookie}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function CategoriesVisual({ color }: { color: string }) {
  const categories = [
    { name: "Necessary", count: 3, c: "#22c55e" },
    { name: "Analytics", count: 4, c: "#3b82f6" },
    { name: "Marketing", count: 2, c: "#f97316" },
  ];

  return (
    <div className="flex gap-3">
      {categories.map((cat, idx) => (
        <motion.div
          key={cat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.15 }}
          className="bg-card border border-border rounded-xl p-4 text-center min-w-[100px]"
        >
          <div 
            className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: cat.c }}
          >
            {cat.count}
          </div>
          <div className="text-xs font-medium">{cat.name}</div>
        </motion.div>
      ))}
    </div>
  );
}

function CustomizationVisual({ color }: { color: string }) {
  const [activeColor, setActiveColor] = useState(color);
  const colors = ["#726CEA", "#22c55e", "#3b82f6", "#f97316"];

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % colors.length;
      setActiveColor(colors[idx]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="bg-card border rounded-xl p-4 shadow-xl max-w-xs"
      animate={{ borderColor: activeColor + "60" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4" style={{ color: activeColor }} />
        <span className="text-sm font-semibold">Cookie Consent</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">We use cookies to enhance your experience.</p>
      <div className="flex gap-2">
        <motion.div
          className="px-3 py-1.5 rounded-md text-white text-xs font-medium"
          style={{ backgroundColor: activeColor }}
        >
          Accept All
        </motion.div>
        <div className="px-3 py-1.5 rounded-md border text-xs font-medium">
          Settings
        </div>
      </div>
    </motion.div>
  );
}

function AnalyticsVisual({ color }: { color: string }) {
  const bars = [40, 65, 45, 80, 60, 75, 90];

  return (
    <div className="flex items-end gap-2 h-24">
      {bars.map((height, idx) => (
        <motion.div
          key={idx}
          className="w-8 rounded-t-md"
          style={{ backgroundColor: color }}
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ delay: idx * 0.1, duration: 0.4 }}
        />
      ))}
    </div>
  );
}

function CompletionVisual({ color }: { color: string }) {
  const badges = ["GDPR", "CCPA", "ePrivacy", "GCM v2"];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {badges.map((badge, idx) => (
        <motion.div
          key={badge}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1, type: "spring" }}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full"
        >
          <CheckCircle2 className="w-4 h-4" style={{ color }} />
          <span className="text-sm font-medium">{badge}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function useIntroOverlay() {
  const [showIntro, setShowIntro] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem(STORAGE_KEY);
    if (hasSeenIntro) {
      setShowIntro(false);
    }
    setIsReady(true);
  }, []);

  const resetIntro = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setShowIntro(true);
  }, []);

  const completeIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  return { showIntro: isReady && showIntro, resetIntro, completeIntro };
}
