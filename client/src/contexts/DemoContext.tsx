import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useLocation } from "wouter";

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  page: string;
  position?: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "websites",
    target: "[data-tour='websites-list']",
    title: "Your Websites",
    content: "Here you can see all your websites. We've already scanned your demo site and found cookies that need consent.",
    page: "/dashboard/websites",
    position: "bottom",
  },
  {
    id: "cookies",
    target: "[data-tour='cookie-categories']",
    title: "Cookie Categories",
    content: "Organize cookies into categories like Analytics, Marketing, and Functional. Users can give granular consent for each.",
    page: "/dashboard/cookies",
    position: "bottom",
  },
  {
    id: "banner-preview",
    target: "[data-tour='banner-preview']",
    title: "Live Banner Preview",
    content: "See exactly how your consent banner will look. Customize colors, text, and layout to match your brand.",
    page: "/dashboard/banner",
    position: "left",
  },
  {
    id: "banner-styles",
    target: "[data-tour='banner-styles']",
    title: "Customize Everything",
    content: "20+ style options including colors, fonts, animations, and positions. Make it truly yours!",
    page: "/dashboard/banner",
    position: "right",
  },
  {
    id: "embed-code",
    target: "[data-tour='embed-code']",
    title: "One-Line Integration",
    content: "Copy this single line of code to your website. That's it - you're GDPR compliant!",
    page: "/dashboard/embed",
    position: "bottom",
  },
  {
    id: "analytics",
    target: "[data-tour='analytics-chart']",
    title: "Track Consent Rates",
    content: "See how users respond to your banner. Optimize your messaging to improve acceptance rates.",
    page: "/dashboard/analytics",
    position: "bottom",
  },
];

interface DemoContextType {
  isDemoMode: boolean;
  currentStep: number;
  currentTourStep: TourStep | null;
  totalSteps: number;
  startDemo: () => void;
  endDemo: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipToStep: (step: number) => void;
  showFloatingCTA: boolean;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [, setLocation] = useLocation();

  const currentTourStep = isDemoMode ? TOUR_STEPS[currentStep] || null : null;
  const totalSteps = TOUR_STEPS.length;

  const startDemo = useCallback(() => {
    setIsDemoMode(true);
    setCurrentStep(0);
    setShowFloatingCTA(true);
    localStorage.setItem("demoMode", "true");
    setLocation(TOUR_STEPS[0].page);
  }, [setLocation]);

  const endDemo = useCallback(() => {
    setIsDemoMode(false);
    setCurrentStep(0);
    setShowFloatingCTA(false);
    localStorage.removeItem("demoMode");
  }, []);

  const nextStep = useCallback(() => {
    const next = currentStep + 1;
    if (next < TOUR_STEPS.length) {
      setCurrentStep(next);
      const nextTourStep = TOUR_STEPS[next];
      if (nextTourStep.page !== TOUR_STEPS[currentStep]?.page) {
        setLocation(nextTourStep.page);
      }
    } else {
      endDemo();
    }
  }, [currentStep, setLocation, endDemo]);

  const prevStep = useCallback(() => {
    const prev = currentStep - 1;
    if (prev >= 0) {
      setCurrentStep(prev);
      const prevTourStep = TOUR_STEPS[prev];
      if (prevTourStep.page !== TOUR_STEPS[currentStep]?.page) {
        setLocation(prevTourStep.page);
      }
    }
  }, [currentStep, setLocation]);

  const skipToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOUR_STEPS.length) {
      setCurrentStep(step);
      setLocation(TOUR_STEPS[step].page);
    }
  }, [setLocation]);

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        currentStep,
        currentTourStep,
        totalSteps,
        startDemo,
        endDemo,
        nextStep,
        prevStep,
        skipToStep,
        showFloatingCTA,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
