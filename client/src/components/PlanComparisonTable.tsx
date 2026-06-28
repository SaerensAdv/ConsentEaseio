import { useState } from "react";
import { Check, X, Sparkle } from "@phosphor-icons/react";
import { PLANS, PLAN_FEATURES, SINGLE_SITE_PLANS, MULTI_SITE_PLANS, SINGLE_SITE_FEATURES, MULTI_SITE_FEATURES, type PlanFeature, getAnnualMonthlyEquivalent, getAnnualSavings } from "@shared/plans";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Spinner } from "@/components/ui/spinner";

type BillingInterval = 'monthly' | 'yearly';

function BillingToggle({ 
  interval, 
  onChange 
}: { 
  interval: BillingInterval; 
  onChange: (interval: BillingInterval) => void;
}) {
  return (
    <div className="flex justify-center mb-8">
      <div 
        className="inline-flex items-center bg-secondary rounded-full p-1 gap-1"
        data-testid="billing-toggle"
      >
        <div
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all select-none",
            interval === 'monthly' 
              ? "bg-background shadow-sm" 
              : "text-muted-foreground"
          )}
          onClick={() => onChange('monthly')}
          data-testid="billing-monthly"
        >
          Monthly
        </div>
        <div
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all select-none flex items-center gap-2",
            interval === 'yearly' 
              ? "bg-background shadow-sm" 
              : "text-muted-foreground"
          )}
          onClick={() => onChange('yearly')}
          data-testid="billing-yearly"
        >
          Yearly
          {interval === 'yearly' && (
            <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
              2 months free
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface PlanComparisonTableProps {
  currentPlan?: string;
  currentBillingInterval?: string | null;
  onSelectPlan?: (planId: string) => void;
  showCTA?: boolean;
  compact?: boolean;
  mode?: 'single' | 'multi' | 'all';
  billingInterval?: BillingInterval;
  onBillingChange?: (interval: BillingInterval) => void;
  showBillingToggle?: boolean;
}

export default function PlanComparisonTable({ 
  currentPlan, 
  currentBillingInterval,
  onSelectPlan, 
  showCTA = true,
  compact = false,
  mode = 'all',
  billingInterval: controlledInterval,
  onBillingChange,
  showBillingToggle = true
}: PlanComparisonTableProps) {
  const [internalInterval, setInternalInterval] = useState<BillingInterval>('yearly');
  const interval = controlledInterval ?? internalInterval;
  const handleIntervalChange = (newInterval: BillingInterval) => {
    if (onBillingChange) {
      onBillingChange(newInterval);
    } else {
      setInternalInterval(newInterval);
    }
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check size={20} className="text-green-500 mx-auto" />
      ) : (
        <X size={20} className="text-muted-foreground/40 mx-auto" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  const displayPlans = mode === 'single' ? SINGLE_SITE_PLANS : mode === 'multi' ? MULTI_SITE_PLANS : PLANS;
  const allFeatures = mode === 'single' ? SINGLE_SITE_FEATURES : mode === 'multi' ? MULTI_SITE_FEATURES : PLAN_FEATURES;
  const displayFeatures = compact ? allFeatures.slice(0, 6) : allFeatures;

  const isCurrentPlanAndInterval = (planId: string) => {
    if (currentPlan !== planId) return false;
    if (!currentBillingInterval) return false;
    return currentBillingInterval === interval;
  };

  return (
    <div className="w-full pt-6">
      {showBillingToggle && (
        <BillingToggle interval={interval} onChange={handleIntervalChange} />
      )}
      <p className="text-center text-xs text-muted-foreground -mt-4 mb-4">All prices excl. VAT</p>
      <div className="w-full overflow-x-auto pt-4">
      <table className="w-full border-collapse" data-testid="plan-comparison-table">
        <thead>
          <tr>
            <th className="text-left p-4 border-b border-border font-medium text-muted-foreground w-[200px]">
              Features
            </th>
            {displayPlans.map((plan) => (
              <th 
                key={plan.id} 
                className={cn(
                  "p-4 pb-6 border-b border-border text-center min-w-[160px]",
                  plan.popular && "bg-primary/5 relative",
                  isCurrentPlanAndInterval(plan.id) && "ring-2 ring-primary/50"
                )}
                data-testid={`plan-header-${plan.id}`}
              >
                {plan.popular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap z-10">
                    <Sparkle size={12} />
                    Best Value
                  </div>
                ) : plan.trialDays ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap z-10">
                    {plan.trialDays}-day free trial
                  </div>
                ) : null}
                <div className="font-display font-bold text-lg">{plan.name}</div>
                <div className="mt-1">
                  {interval === 'yearly' ? (
                    <>
                      <span className="text-2xl font-bold">{getAnnualMonthlyEquivalent(plan)}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        billed as {plan.annualPriceDisplay}/year
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold">{plan.priceDisplay}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </>
                  )}
                </div>
                {isCurrentPlanAndInterval(plan.id) && (
                  <div className="mt-2 text-xs text-primary font-medium">Current Plan</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayFeatures.map((feature, idx) => (
            <tr 
              key={feature.name} 
              className="transition-colors hover:bg-muted/40"
              data-testid={`feature-row-${idx}`}
            >
              <td className="p-4 border-b border-border/50 text-sm font-medium">
                {feature.name}
              </td>
              {displayPlans.map((plan, planIdx) => (
                <td 
                  key={plan.id}
                  className={cn(
                    "p-4 border-b border-border/50 text-center",
                    planIdx === 1 && "bg-primary/5"
                  )}
                >
                  {renderFeatureValue(feature[plan.id as keyof typeof feature] as boolean | string)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {showCTA && (
          <tfoot>
            <tr>
              <td className="p-6"></td>
              {displayPlans.map((plan) => (
                <td 
                  key={plan.id} 
                  className={cn(
                    "p-6 text-center",
                    plan.popular && "bg-primary/5"
                  )}
                >
                  {onSelectPlan ? (
                    <Button
                      onClick={() => onSelectPlan(plan.id)}
                      variant={plan.popular ? "default" : "outline"}
                      className={cn(
                        "w-full",
                        plan.popular && "shadow-lg shadow-primary/20"
                      )}
                      disabled={isCurrentPlanAndInterval(plan.id)}
                      data-testid={`button-select-${plan.id}`}
                    >
                      {isCurrentPlanAndInterval(plan.id) ? "Current Plan" : currentPlan === plan.id ? `Switch to ${interval === 'yearly' ? 'Yearly' : 'Monthly'}` : `Choose ${plan.name}`}
                    </Button>
                  ) : (
                    <Link href="/onboarding">
                      <Button
                        variant={plan.popular ? "default" : "outline"}
                        className={cn(
                          "w-full",
                          plan.popular && "shadow-lg shadow-primary/20"
                        )}
                        data-testid={`button-select-${plan.id}`}
                      >
                        {plan.trialDays ? `Start ${plan.trialDays}-Day Trial` : "Get Started"}
                      </Button>
                    </Link>
                  )}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
      </div>
    </div>
  );
}

interface PlanComparisonCardsProps {
  currentPlan?: string;
  currentBillingInterval?: string | null;
  onSelectPlan?: (planId: string) => void;
  loadingPlan?: string | null;
  mode?: 'single' | 'multi' | 'all';
  billingInterval?: BillingInterval;
  onBillingChange?: (interval: BillingInterval) => void;
  showBillingToggle?: boolean;
}

export function PlanComparisonCards({ 
  currentPlan, 
  currentBillingInterval,
  onSelectPlan,
  loadingPlan,
  mode = 'all',
  billingInterval: controlledInterval,
  onBillingChange,
  showBillingToggle = true
}: PlanComparisonCardsProps) {
  const [internalInterval, setInternalInterval] = useState<BillingInterval>('yearly');
  const interval = controlledInterval ?? internalInterval;
  const handleIntervalChange = (newInterval: BillingInterval) => {
    if (onBillingChange) {
      onBillingChange(newInterval);
    } else {
      setInternalInterval(newInterval);
    }
  };

  const displayPlans = mode === 'single' ? SINGLE_SITE_PLANS : mode === 'multi' ? MULTI_SITE_PLANS : PLANS;
  const allFeatures = mode === 'single' ? SINGLE_SITE_FEATURES : mode === 'multi' ? MULTI_SITE_FEATURES : PLAN_FEATURES;

  const isCurrentPlanAndInterval = (planId: string) => {
    if (currentPlan !== planId) return false;
    if (!currentBillingInterval) return false;
    return currentBillingInterval === interval;
  };

  return (
    <div>
      {showBillingToggle && (
        <BillingToggle interval={interval} onChange={handleIntervalChange} />
      )}
      <p className="text-center text-xs text-muted-foreground -mt-4 mb-4">All prices excl. VAT</p>
      <div className={cn("grid gap-6", displayPlans.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4")} data-testid="plan-comparison-cards">
        {displayPlans.map((plan) => {
          const savings = getAnnualSavings(plan);
          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border-2 p-6 transition-all",
                plan.popular 
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" 
                  : "border-border bg-background hover:border-primary/50",
                isCurrentPlanAndInterval(plan.id) && "ring-2 ring-primary"
              )}
              data-testid={`plan-card-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkle size={12} />
                  Most Popular
                </div>
              )}
              
              {interval === 'yearly' && savings > 0 && (
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold px-2 py-1 rounded-full">
                  Save {savings}&euro;
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div>
                  {interval === 'yearly' ? (
                    <>
                      <span className="text-4xl font-bold">{getAnnualMonthlyEquivalent(plan)}</span>
                      <span className="text-muted-foreground">/mo</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        Billed as {plan.annualPriceDisplay}/year
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">{plan.priceDisplay}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {allFeatures.slice(0, 8).map((feature) => {
                  const value = feature[plan.id as keyof typeof feature];
                  const hasFeature = typeof value === 'boolean' ? value : true;
                  
                  return (
                    <li 
                      key={feature.name} 
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        !hasFeature && "text-muted-foreground/50"
                      )}
                    >
                      {hasFeature ? (
                        <Check size={16} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <X size={16} className="text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span>
                        {typeof value === 'string' ? `${feature.name}: ${value}` : feature.name}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {onSelectPlan ? (
                <Button
                  onClick={() => onSelectPlan(plan.id)}
                  variant={plan.popular ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    plan.popular && "shadow-lg shadow-primary/20"
                  )}
                  disabled={isCurrentPlanAndInterval(plan.id) || loadingPlan === plan.id}
                  data-testid={`button-choose-${plan.id}`}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Spinner size={16} className="mr-2" />
                      Processing...
                    </>
                  ) : isCurrentPlanAndInterval(plan.id) ? (
                    "Current Plan"
                  ) : currentPlan === plan.id ? (
                    `Switch to ${interval === 'yearly' ? 'Yearly' : 'Monthly'}`
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
              ) : (
                <Link href="/onboarding">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className={cn(
                      "w-full",
                      plan.popular && "shadow-lg shadow-primary/20"
                    )}
                    data-testid={`button-choose-${plan.id}`}
                  >
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
