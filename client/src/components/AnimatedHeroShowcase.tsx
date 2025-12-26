import { useState, useEffect } from "react";
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
  MousePointerClick,
  ArrowRight
} from "lucide-react";

const STEP_DURATION = 3000;

interface AnimatedStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function AnimatedHeroShowcase() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const steps: AnimatedStep[] = [
    {
      id: 0,
      title: "Enter your website",
      subtitle: "Just paste your URL",
      icon: <Globe className="w-5 h-5" />,
      content: <Step1Content />
    },
    {
      id: 1,
      title: "We scan everything",
      subtitle: "Automatic cookie detection",
      icon: <Search className="w-5 h-5" />,
      content: <Step2Content />
    },
    {
      id: 2,
      title: "Cookies categorized",
      subtitle: "GDPR-ready classification",
      icon: <Cookie className="w-5 h-5" />,
      content: <Step3Content />
    },
    {
      id: 3,
      title: "Customize your banner",
      subtitle: "Match your brand perfectly",
      icon: <Palette className="w-5 h-5" />,
      content: <Step4Content />
    },
    {
      id: 4,
      title: "Track consent rates",
      subtitle: "Real-time analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      content: <Step5Content />
    },
    {
      id: 5,
      title: "You're compliant!",
      subtitle: "GDPR & CCPA ready",
      icon: <CheckCircle2 className="w-5 h-5" />,
      content: <Step6Content />
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, STEP_DURATION);

    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  return (
    <div 
      className="relative w-full max-w-xl mx-auto"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      <div className="relative bg-gradient-to-br from-background via-background to-secondary/50 rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5" />
        
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 h-7 bg-secondary/80 rounded-lg flex items-center px-3">
              <span className="text-xs text-muted-foreground font-mono">consentease.io</span>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {steps.map((step, idx) => (
              <motion.button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  currentStep === idx 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {step.icon}
                <span className="hidden sm:inline">{step.title}</span>
              </motion.button>
            ))}
          </div>

          <div className="relative h-[320px] overflow-hidden rounded-xl bg-secondary/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 p-4"
              >
                {steps[currentStep].content}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === currentStep ? "w-6 bg-primary" : "w-2 bg-border"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 text-primary" />
              <span>{steps[currentStep].subtitle}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-black/10 blur-xl rounded-full" />
    </div>
  );
}

function Step1Content() {
  const [typing, setTyping] = useState("");
  const fullUrl = "https://mybusiness.com";

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      if (idx <= fullUrl.length) {
        setTyping(fullUrl.slice(0, idx));
        idx++;
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <motion.div 
        className="w-full max-w-sm"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-background rounded-xl border border-border p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-semibold">Add your website</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={typing}
              readOnly
              className="w-full h-12 px-4 rounded-lg border border-border bg-secondary/50 font-mono text-sm"
              placeholder="https://yoursite.com"
            />
            <motion.div
              className="absolute right-1 top-1 bottom-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: typing.length > 10 ? 1 : 0, x: typing.length > 10 ? 0 : 10 }}
            >
              <button className="h-full px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2">
                Scan <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Step2Content() {
  const [progress, setProgress] = useState(0);
  const [foundCookies, setFoundCookies] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 3, 100));
      if (Math.random() > 0.6) {
        setFoundCookies((c) => c + 1);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-background rounded-xl border border-border p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Search className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="font-semibold">Scanning website...</span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-primary">{Math.min(foundCookies, 12)}</div>
              <div className="text-xs text-muted-foreground">Cookies found</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-500">{Math.floor(foundCookies / 3)}</div>
              <div className="text-xs text-muted-foreground">Trackers blocked</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {["_ga", "_gid", "_fbp", "session", "csrf"].slice(0, Math.min(5, Math.floor(progress / 20))).map((cookie) => (
              <motion.span
                key={cookie}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-mono"
              >
                {cookie}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Content() {
  const categories = [
    { name: "Necessary", count: 3, color: "bg-green-500", enabled: true },
    { name: "Functional", count: 2, color: "bg-blue-500", enabled: true },
    { name: "Analytics", count: 4, color: "bg-yellow-500", enabled: false },
    { name: "Marketing", count: 3, color: "bg-red-500", enabled: false },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-background rounded-xl border border-border p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Cookie className="w-5 h-5 text-primary" />
          <span className="font-semibold">Cookie Categories</span>
        </div>
        
        <div className="space-y-3">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                <div>
                  <div className="font-medium text-sm">{cat.name}</div>
                  <div className="text-xs text-muted-foreground">{cat.count} cookies</div>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className={`w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${
                  cat.enabled ? "bg-primary justify-end" : "bg-border justify-start"
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4Content() {
  const [activeColor, setActiveColor] = useState("#726CEA");
  const colors = ["#726CEA", "#22c55e", "#3b82f6", "#f97316", "#ec4899"];

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % colors.length;
      setActiveColor(colors[idx]);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <motion.div 
          className="w-full max-w-sm bg-background rounded-xl border border-border overflow-hidden shadow-lg"
          animate={{ borderColor: activeColor + "40" }}
        >
          <div className="h-24 bg-secondary/30 flex items-center justify-center text-muted-foreground text-sm">
            <Globe className="w-4 h-4 mr-2" /> mybusiness.com
          </div>
          
          <motion.div
            className="p-4 border-t"
            style={{ backgroundColor: activeColor + "10" }}
          >
            <motion.div
              className="flex items-start gap-3"
              animate={{ backgroundColor: activeColor + "05" }}
            >
              <Shield className="w-5 h-5 mt-0.5" style={{ color: activeColor }} />
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">We value your privacy</div>
                <div className="text-xs text-muted-foreground mb-3">
                  We use cookies to enhance your experience.
                </div>
                <div className="flex gap-2">
                  <motion.button
                    className="px-3 py-1.5 text-xs font-medium rounded-md text-white"
                    style={{ backgroundColor: activeColor }}
                    whileHover={{ scale: 1.02 }}
                  >
                    Accept All
                  </motion.button>
                  <button className="px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-background">
                    Customize
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="flex gap-2">
          {colors.map((color) => (
            <motion.button
              key={color}
              className="w-6 h-6 rounded-full border-2 transition-all"
              style={{ 
                backgroundColor: color,
                borderColor: activeColor === color ? "white" : "transparent",
                boxShadow: activeColor === color ? `0 0 12px ${color}` : "none"
              }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setActiveColor(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Step5Content() {
  const [data, setData] = useState([30, 45, 38, 52, 48, 65, 72]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => prev.map((v) => Math.max(20, Math.min(80, v + (Math.random() - 0.4) * 15))));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const maxVal = Math.max(...data);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-background rounded-xl border border-border p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="font-semibold">Analytics</span>
          </div>
          <span className="text-xs text-muted-foreground">Last 7 days</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-500">67%</div>
            <div className="text-xs text-muted-foreground">Accept Rate</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">4,821</div>
            <div className="text-xs text-muted-foreground">Total Views</div>
          </div>
        </div>

        <div className="h-24 flex items-end gap-1">
          {data.map((value, idx) => (
            <motion.div
              key={idx}
              className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-sm"
              initial={{ height: 0 }}
              animate={{ height: `${(value / maxVal) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step6Content() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-center"
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </motion.div>

        <h3 className="text-xl font-bold mb-2">You're All Set!</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Your website is now GDPR & CCPA compliant with Google Consent Mode v2.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["GDPR", "CCPA", "ePrivacy", "Consent Mode v2"].map((badge, idx) => (
            <motion.span
              key={badge}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
            >
              {badge}
            </motion.span>
          ))}
        </div>

        <motion.div
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <MousePointerClick className="w-4 h-4" />
          <span>Takes only 2 minutes to set up</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
