import { Check, X, Sparkles } from "lucide-react";
import { PLANS, PLAN_FEATURES, type PlanFeature } from "@shared/plans";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface PlanComparisonTableProps {
  currentPlan?: string;
  onSelectPlan?: (planId: string) => void;
  showCTA?: boolean;
  compact?: boolean;
}

export default function PlanComparisonTable({ 
  currentPlan, 
  onSelectPlan, 
  showCTA = true,
  compact = false 
}: PlanComparisonTableProps) {
  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  const displayFeatures = compact ? PLAN_FEATURES.slice(0, 6) : PLAN_FEATURES;

  return (
    <div className="w-full overflow-x-auto pt-4">
      <table className="w-full border-collapse" data-testid="plan-comparison-table">
        <thead>
          <tr>
            <th className="text-left p-4 border-b border-border font-medium text-muted-foreground w-[200px]">
              Features
            </th>
            {PLANS.map((plan) => (
              <th 
                key={plan.id} 
                className={cn(
                  "p-4 pb-6 border-b border-border text-center min-w-[160px]",
                  plan.popular && "bg-primary/5 relative",
                  currentPlan === plan.id && "ring-2 ring-primary/50"
                )}
                data-testid={`plan-header-${plan.id}`}
              >
                {plan.popular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap z-10">
                    <Sparkles className="w-3 h-3" />
                    Best Value
                  </div>
                ) : plan.trialDays ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap z-10">
                    {plan.trialDays}-day free trial
                  </div>
                ) : null}
                <div className="font-display font-bold text-lg">{plan.name}</div>
                <div className="mt-1">
                  <span className="text-2xl font-bold">{plan.priceDisplay}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                {currentPlan === plan.id && (
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
              <td className="p-4 border-b border-border/50 text-center">
                {renderFeatureValue(feature.solo)}
              </td>
              <td className={cn(
                "p-4 border-b border-border/50 text-center bg-primary/5"
              )}>
                {renderFeatureValue(feature.pro)}
              </td>
              <td className="p-4 border-b border-border/50 text-center">
                {renderFeatureValue(feature.agency)}
              </td>
            </tr>
          ))}
        </tbody>
        {showCTA && (
          <tfoot>
            <tr>
              <td className="p-6"></td>
              {PLANS.map((plan) => (
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
                      disabled={currentPlan === plan.id}
                      data-testid={`button-select-${plan.id}`}
                    >
                      {currentPlan === plan.id ? "Current Plan" : `Choose ${plan.name}`}
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
  );
}

export function PlanComparisonCards({ 
  currentPlan, 
  onSelectPlan 
}: { 
  currentPlan?: string;
  onSelectPlan?: (planId: string) => void;
}) {
  return (
    <div className="grid md:grid-cols-3 gap-6" data-testid="plan-comparison-cards">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "relative rounded-2xl border-2 p-6 transition-all",
            plan.popular 
              ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" 
              : "border-border bg-background hover:border-primary/50",
            currentPlan === plan.id && "ring-2 ring-primary"
          )}
          data-testid={`plan-card-${plan.id}`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Most Popular
            </div>
          )}
          
          <div className="text-center mb-6">
            <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
            <div>
              <span className="text-4xl font-bold">{plan.priceDisplay}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            {PLAN_FEATURES.slice(0, 8).map((feature) => {
              const value = feature[plan.id as keyof PlanFeature];
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
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
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
              disabled={currentPlan === plan.id}
              data-testid={`button-choose-${plan.id}`}
            >
              {currentPlan === plan.id ? "Current Plan" : `Choose ${plan.name}`}
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
      ))}
    </div>
  );
}
