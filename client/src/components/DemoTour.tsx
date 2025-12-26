import { useEffect, useState, useRef, useCallback } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export function DemoTour() {
  const { 
    isDemoMode, 
    currentTourStep, 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    endDemo,
    showFloatingCTA 
  } = useDemo();
  const [, setLocation] = useLocation();
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showEndModal, setShowEndModal] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 200 });

  const [targetFound, setTargetFound] = useState(false);
  
  const measureTooltip = useCallback(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTooltipSize({ width: rect.width, height: rect.height });
      }
    }
  }, []);

  useEffect(() => {
    if (targetFound && tooltipRef.current) {
      requestAnimationFrame(measureTooltip);
    }
  }, [targetFound, measureTooltip, currentStep]);
  
  useEffect(() => {
    if (!isDemoMode || !currentTourStep) return;
    
    setTargetFound(false);
    let attempts = 0;
    const maxAttempts = 50;
    let pollInterval: NodeJS.Timeout | null = null;
    let hasScrolled = false;

    const updatePosition = () => {
      const target = document.querySelector(currentTourStep.target);
      if (!target) {
        attempts++;
        if (attempts < maxAttempts) {
          pollInterval = setTimeout(updatePosition, 100);
        }
        return;
      }

      setTargetFound(true);
      
      const rect = target.getBoundingClientRect();
      const tooltipWidth = tooltipSize.width || 320;
      const tooltipHeight = tooltipSize.height || 200;
      const padding = 16;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;
      let finalPosition = currentTourStep.position || "bottom";

      const fitsTop = rect.top - tooltipHeight - padding > padding;
      const fitsBottom = rect.bottom + tooltipHeight + padding < viewportHeight - padding;
      const fitsLeft = rect.left - tooltipWidth - padding > padding;
      const fitsRight = rect.right + tooltipWidth + padding < viewportWidth - padding;

      if (finalPosition === "top" && !fitsTop) finalPosition = fitsBottom ? "bottom" : "right";
      if (finalPosition === "bottom" && !fitsBottom) finalPosition = fitsTop ? "top" : "right";
      if (finalPosition === "left" && !fitsLeft) finalPosition = fitsRight ? "right" : "bottom";
      if (finalPosition === "right" && !fitsRight) finalPosition = fitsLeft ? "left" : "bottom";

      switch (finalPosition) {
        case "top":
          top = rect.top - tooltipHeight - padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - padding;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + padding;
          break;
        default:
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
      }

      left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding));
      top = Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding));

      setTooltipPosition({ top, left });

      if (!hasScrolled) {
        hasScrolled = true;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(updatePosition, 500);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      if (pollInterval) clearTimeout(pollInterval);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isDemoMode, currentTourStep, currentStep, tooltipSize]);

  const handleNext = () => {
    if (currentStep === totalSteps - 1) {
      setShowEndModal(true);
    } else {
      nextStep();
    }
  };

  const handleStartTrial = () => {
    endDemo();
    setLocation("/onboarding");
  };

  if (!isDemoMode) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />

      <AnimatePresence>
        {currentTourStep && !showEndModal && !targetFound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <Card className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </Card>
          </motion.div>
        )}
        {currentTourStep && !showEndModal && targetFound && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50"
            style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
          >
            <Card className="w-80 p-4 shadow-xl border-primary/20 bg-card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Step {currentStep + 1} of {totalSteps}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={endDemo}
                  data-testid="button-end-tour"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <h3 className="font-semibold text-lg mb-1">{currentTourStep.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{currentTourStep.content}</p>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  data-testid="button-prev-step"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={handleNext}
                  data-testid="button-next-step"
                >
                  {currentStep === totalSteps - 1 ? "Finish" : "Next"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {showFloatingCTA && !showEndModal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            size="lg"
            className="shadow-xl"
            onClick={handleStartTrial}
            data-testid="button-start-trial-cta"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Your Free Trial
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowEndModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative"
            >
              <Card className="w-full max-w-md p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">You've seen it all!</h2>
                <p className="text-muted-foreground mb-6">
                  Ready to make your own website GDPR compliant? Start your 7-day free trial - no credit card required to explore.
                </p>
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={handleStartTrial}
                    data-testid="button-start-trial-final"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Free Trial
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => {
                      setShowEndModal(false);
                      endDemo();
                    }}
                    data-testid="button-continue-exploring"
                  >
                    Continue exploring demo
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
