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

const TOUR_COMPLETED_KEY = "consentease_demo_tour_completed";

// Tour ordered to lead with the "wow" moment (live banner preview), then
// customisation, then how to ship it ("Try this on your site"), then
// classification, analytics, and the multi-site manager last.
const TOUR_STEPS: TourStep[] = [
  {
    id: "banner-preview",
    target: "[data-tour='banner-preview']",
    title: "Live Banner Preview",
    content: "This is the wow moment — a real banner overlaid on a real-looking site. Tweak anything on the left and watch it update instantly.",
    page: "/dashboard/banner",
    position: "left",
  },
  {
    id: "banner-styles",
    target: "[data-tour='banner-styles']",
    title: "Customize Everything",
    content: "Colors, fonts, position, animations — change anything to match your brand. No CSS required.",
    page: "/dashboard/banner",
    position: "right",
  },
  {
    id: "embed-code",
    target: "[data-tour='embed-code']",
    title: "One Line. Try It on Your Site.",
    content: "Drop this single <script> tag in your <head> and you're GDPR-compliant. Copy it now and paste it into your real site to see it live in 60 seconds.",
    page: "/dashboard/embed",
    position: "bottom",
  },
  {
    id: "cookies",
    target: "[data-tour='cookie-categories']",
    title: "Cookies, Already Classified",
    content: "Every cookie we found is sorted into Necessary, Functional, Analytics, and Marketing — so visitors can give granular consent.",
    page: "/dashboard/cookies",
    position: "bottom",
  },
  {
    id: "analytics",
    target: "[data-tour='analytics-chart']",
    title: "Audit-Ready Consent Logs",
    content: "Track accept/reject rates and prove compliance. Every consent event is logged and exportable.",
    page: "/dashboard/analytics",
    position: "bottom",
  },
  {
    id: "websites",
    target: "[data-tour='websites-list']",
    title: "Manage All Your Sites",
    content: "Agencies and multi-brand teams: manage every property in one place. Add a new domain whenever you're ready.",
    page: "/dashboard/websites",
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
  skipTour: () => void;
  hasCompletedTour: () => boolean;
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
    // Reset the completed flag so an explicit start (e.g., Replay tour) always runs
    try { localStorage.removeItem(TOUR_COMPLETED_KEY); } catch {}
    setIsDemoMode(true);
    setCurrentStep(0);
    setShowFloatingCTA(true);
    localStorage.setItem("demoMode", "true");
    setLocation(TOUR_STEPS[0].page);
  }, [setLocation]);

  const markCompleted = useCallback(() => {
    try { localStorage.setItem(TOUR_COMPLETED_KEY, "1"); } catch {}
  }, []);

  const endDemo = useCallback(() => {
    setIsDemoMode(false);
    setCurrentStep(0);
    setShowFloatingCTA(false);
    localStorage.removeItem("demoMode");
    markCompleted();
  }, [markCompleted]);

  const skipTour = useCallback(() => {
    // User dismissed the tour but stays in the demo dashboard.
    setIsDemoMode(false);
    setCurrentStep(0);
    setShowFloatingCTA(false);
    markCompleted();
  }, [markCompleted]);

  const hasCompletedTour = useCallback(() => {
    try { return localStorage.getItem(TOUR_COMPLETED_KEY) === "1"; } catch { return false; }
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
        skipTour,
        hasCompletedTour,
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
