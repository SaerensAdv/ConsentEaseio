import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { Link } from "wouter";

interface SetupChecklistProps {
  hasWebsites: boolean;
  hasBannerConfig: boolean;
  hasEmbedInstalled: boolean;
}

const steps = [
  {
    title: "Add your website",
    description: "Register your domain to start managing cookies.",
    href: null,
  },
  {
    title: "Customize your banner",
    description: "Design your consent banner to match your brand.",
    href: "/dashboard/banner",
  },
  {
    title: "Install embed code",
    description: "Add the script to your website to go live.",
    href: "/dashboard/embed",
  },
];

export function SetupChecklist({ hasWebsites, hasBannerConfig, hasEmbedInstalled }: SetupChecklistProps) {
  if (hasWebsites && hasBannerConfig && hasEmbedInstalled) return null;

  const completionStates = [hasWebsites, hasBannerConfig, hasEmbedInstalled];
  const firstIncompleteIndex = completionStates.findIndex((s) => !s);

  return (
    <Card className="mb-6" data-testid="setup-checklist">
      <CardHeader>
        <CardTitle>Get Started</CardTitle>
        <CardDescription>Complete these steps to go live with your consent banner</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isComplete = completionStates[index];
            const isFirstIncomplete = index === firstIncompleteIndex;

            return (
              <div key={index} className="flex items-center gap-4" data-testid={`setup-step-${index + 1}`}>
                {isComplete ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={24} className="text-green-500" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    {index + 1}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={isComplete ? "font-medium text-muted-foreground" : "font-medium"}>{step.title}</p>
                  <p className={isComplete ? "text-sm text-muted-foreground" : "text-sm text-muted-foreground"}>{step.description}</p>
                </div>
                {!isComplete && step.href && (
                  <Link href={step.href}>
                    <Button
                      size="sm"
                      variant={isFirstIncomplete ? "default" : "outline"}
                      data-testid={`button-go-step-${index + 1}`}
                    >
                      Go
                      <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
