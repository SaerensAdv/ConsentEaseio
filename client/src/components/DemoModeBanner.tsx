import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkle, ArrowsCounterClockwise, Play, Rocket } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/contexts/DemoContext";

interface DemoModeBannerProps {
  demoExpiresAt?: string | null;
}

function formatRemaining(expiresAt: string | null | undefined): string {
  if (!expiresAt) return "";
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours >= 1) return `expires in ${hours}h ${minutes}m`;
  return `expires in ${minutes}m`;
}

export default function DemoModeBanner({ demoExpiresAt }: DemoModeBannerProps) {
  const queryClient = useQueryClient();
  const { startDemo } = useDemo();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/demo/reset", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Reset failed");
      }
      await queryClient.invalidateQueries();
      toast.success("Demo data reset to defaults");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset demo");
    } finally {
      setIsResetting(false);
    }
  };

  const handleReplayTour = () => {
    try {
      localStorage.removeItem("consentease_demo_tour_completed");
    } catch {}
    startDemo();
  };

  const remaining = formatRemaining(demoExpiresAt);

  return (
    <div
      className="mb-6 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      data-testid="banner-demo-mode"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
          data-testid="pill-demo-mode"
        >
          <Sparkle size={14} weight="fill" />
          Demo Mode
        </span>
        <p className="text-sm text-muted-foreground min-w-0 truncate">
          You're exploring with sample data{remaining ? ` — ${remaining}` : ""}. Nothing here affects a real site.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReplayTour}
          data-testid="button-replay-tour"
        >
          <Play size={14} className="mr-1.5" />
          Replay tour
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isResetting}
          data-testid="button-reset-demo"
        >
          <ArrowsCounterClockwise size={14} className={`mr-1.5 ${isResetting ? "animate-spin" : ""}`} />
          {isResetting ? "Resetting…" : "Reset data"}
        </Button>
        <Link href="/onboarding">
          <Button size="sm" data-testid="button-start-trial-from-demo">
            <Rocket size={14} className="mr-1.5" weight="fill" />
            Start free trial
          </Button>
        </Link>
      </div>
    </div>
  );
}
