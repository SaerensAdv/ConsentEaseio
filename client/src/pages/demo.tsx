import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useDemo } from "@/contexts/DemoContext";

export default function DemoPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { startDemo } = useDemo();

  useEffect(() => {
    const loginAndStartDemo = async () => {
      try {
        const res = await fetch("/api/demo/login", {
          method: "POST",
          credentials: "include",
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to start demo");
        }
        
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        
        startDemo();
      } catch (err) {
        console.error("Demo start error:", err);
        setError(err instanceof Error ? err.message : "Failed to start demo");
        setStatus("error");
      }
    };
    
    loginAndStartDemo();
  }, [queryClient, startDemo, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold">Starting Demo...</h1>
            <p className="text-muted-foreground">Preparing your interactive tour</p>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-red-500" />
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
