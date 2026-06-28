import { Warning, Clock, ArrowRight } from "@phosphor-icons/react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface TrialBannerProps {
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
  plan: string;
}

export default function TrialBanner({ trialEndsAt, subscriptionStatus, plan }: TrialBannerProps) {
  if (!trialEndsAt || subscriptionStatus !== "trialing") {
    return null;
  }

  const trialEnd = new Date(trialEndsAt);
  const now = new Date();
  const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft <= 2;

  if (isExpired) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6" data-testid="trial-expired-banner">
        <div className="flex items-start gap-3">
          <Warning size={20} className="text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">Your trial has expired</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your 7-day free trial has ended. Subscribe now to continue using ConsentEase and keep your banners active.
            </p>
            <Link href="/dashboard/settings">
              <Button size="sm" className="mt-3 gap-2" data-testid="button-subscribe-now">
                Subscribe Now
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isUrgent) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6" data-testid="trial-urgent-banner">
        <div className="flex items-start gap-3">
          <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-700 dark:text-amber-500">
              {daysLeft === 1 ? "Last day of your trial!" : `${daysLeft} days left in your trial`}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Subscribe before your trial ends to ensure uninterrupted service. Your banners will stop working after the trial expires.
            </p>
            <Link href="/dashboard/settings">
              <Button size="sm" variant="outline" className="mt-3 gap-2 border-amber-500/50 text-amber-700 hover:bg-amber-500/10" data-testid="button-choose-plan">
                Choose a Plan
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6" data-testid="trial-info-banner">
      <div className="flex items-center gap-3">
        <Clock size={20} className="text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-sm">
            <span className="font-medium">{daysLeft} days left</span> in your free trial.{" "}
            <Link href="/dashboard/settings" className="text-primary hover:underline">
              View plans
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
