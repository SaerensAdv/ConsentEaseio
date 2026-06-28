import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useCanonical } from "@/hooks/use-canonical";
import { Sparkle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useDemo } from "@/contexts/DemoContext";
import { Spinner } from "@/components/ui/spinner";

function DemoSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Interactive Demo - Try ConsentEase Free",
    "description": "Try ConsentEase without signing up. Explore the dashboard, banner builder, and analytics in our interactive demo.",
    "url": "https://consentease.io/demo",
    "isPartOf": { "@id": "https://consentease.io/#website" },
    "about": {
      "@type": "SoftwareApplication",
      "name": "ConsentEase",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web"
    }
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default function DemoPage() {
  useCanonical("/demo");
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { startDemo, hasCompletedTour } = useDemo();

  useEffect(() => {
    document.title = "Interactive Demo | ConsentEase";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', 'Try ConsentEase with our interactive demo. Experience our GDPR/CCPA cookie consent management platform with a guided tour of all features.');
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', 'Interactive Demo | ConsentEase');
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', 'Try ConsentEase with our interactive demo. Experience our GDPR/CCPA cookie consent management platform with a guided tour of all features.');
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', 'https://consentease.io/attached_assets/image_1766697261644.png');
    
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (twitterCard) twitterCard.setAttribute('content', 'summary_large_image');
    
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', 'Interactive Demo | ConsentEase');
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', 'Try ConsentEase with our interactive demo. Experience our GDPR/CCPA cookie consent management platform with a guided tour of all features.');
    
    return () => {
      document.title = "ConsentEase - Privacy Compliance for Humans";
    };
  }, []);

  // Read ?domain query param so we can personalise the seeded demo data
  const requestedDomain = (() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return (params.get("domain") || "").trim();
  })();
  const [seededDomain, setSeededDomain] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    const loginAndStartDemo = async () => {
      try {
        const url = requestedDomain
          ? `/api/demo/login?domain=${encodeURIComponent(requestedDomain)}`
          : "/api/demo/login";
        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to start demo");
        }

        const data = await res.json();
        setSeededDomain(data.seededDomain ?? null);
        setIsPersonalized(!!data.isPersonalized);

        await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

        // Respect criterion #7: don't auto-replay the tour for visitors who've
        // already completed it once in this browser. They land in the dashboard
        // and can hit "Replay tour" from the demo banner if they want it back.
        if (hasCompletedTour()) {
          setLocation("/dashboard/banner");
        } else {
          startDemo();
        }
      } catch (err) {
        console.error("Demo start error:", err);
        setError(err instanceof Error ? err.message : "Failed to start demo");
        setStatus("error");
      }
    };

    loginAndStartDemo();
  }, [queryClient, startDemo, setLocation, requestedDomain]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <DemoSchema />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkle size={32} className="text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold">Starting Demo...</h1>
            <p className="text-muted-foreground">Preparing your interactive tour</p>
            <Spinner variant="brand" size={24} className="mx-auto text-primary" />
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <Sparkle size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold">Demo Unavailable</h1>
            <p className="text-muted-foreground">{error}</p>
            <button 
              onClick={() => setLocation("/")}
              className="text-primary hover:underline"
            >
              Return to homepage
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
