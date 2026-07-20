import { useLocation } from "wouter";
import { ArrowRight, ChartLine, CheckCircle, Code, Globe, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import DashboardLayout from "./layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityCard, MetricCard, NextActionsCard, OverviewEmpty, OverviewLoading } from "./overview/overview-widgets";
import { useOverviewData } from "./overview/use-overview-data";

export default function DashboardOverview() {
  const [, setLocation] = useLocation();
  const {
    website,
    websiteStatus,
    websitesLoading,
    analytics,
    analyticsLoading,
    usage,
    embedDetected,
    consentModeReady,
    actions,
  } = useOverviewData();

  if (websitesLoading) return <DashboardLayout><OverviewLoading /></DashboardLayout>;
  if (!website) return <DashboardLayout><OverviewEmpty onAddWebsite={() => setLocation("/dashboard/websites")} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <span className={`h-2 w-2 rounded-full ${websiteStatus.dotClass}`} />
                {websiteStatus.label}
              </Badge>
              {embedDetected && <Badge variant="outline" className="gap-1.5 text-emerald-700"><CheckCircle size={12} /> Live</Badge>}
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Overview</h1>
            <p className="mt-1 text-muted-foreground">What matters right now for {website.domain}.</p>
          </div>
          <Button variant="outline" onClick={() => window.open(`https://${website.domain}`, "_blank")}>Visit website <ArrowRight size={16} className="ml-2" /></Button>
        </div>

        {usage && usage.views.percentUsed >= 80 && (
          <Alert className={usage.views.percentUsed >= 100 ? "border-destructive" : "border-amber-500/50"}>
            <WarningCircle size={16} />
            <AlertTitle>{usage.views.percentUsed >= 100 ? "Monthly view limit reached" : "Monthly view limit is getting close"}</AlertTitle>
            <AlertDescription>{usage.views.used.toLocaleString()} of {usage.views.limit.toLocaleString()} banner views used ({usage.views.percentUsed}%).</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Banner impressions" value={analyticsLoading ? null : (analytics?.totalViews || 0).toLocaleString()} detail="Last 30 days" icon={Globe} />
          <MetricCard title="Consent rate" value={analyticsLoading ? null : `${(analytics?.acceptRate || 0).toFixed(1)}%`} detail="Accepted per impression" icon={ShieldCheck} />
          <MetricCard title="Rejection rate" value={analyticsLoading ? null : `${(analytics?.rejectRate || 0).toFixed(1)}%`} detail="Rejected per impression" icon={ChartLine} />
          <MetricCard title="Implementation" value={embedDetected ? "Live" : "Not detected"} detail={consentModeReady ? "Consent Mode verified" : "Diagnostics pending"} icon={Code} tone={embedDetected ? "good" : "warning"} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <ActivityCard analytics={analytics} onOpenAnalytics={() => setLocation("/dashboard/analytics")} />
          <NextActionsCard actions={actions} onNavigate={setLocation} />
        </div>
      </div>
    </DashboardLayout>
  );
}
