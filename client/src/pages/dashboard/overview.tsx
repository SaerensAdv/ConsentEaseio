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
  const data = useOverviewData();

  if (data.websitesLoading) return <DashboardLayout><OverviewLoading /></DashboardLayout>;
  if (!data.website) return <DashboardLayout><OverviewEmpty onAddWebsite={() => setLocation("/dashboard/websites")} /></DashboardLayout>;

  const metric = (available: boolean, value: string) => available ? value : "Unavailable";

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5"><span className={`h-2 w-2 rounded-full ${data.websiteStatus.dotClass}`} />{data.websiteStatus.label}</Badge>
              {data.embedAvailable && data.embedDetected && <Badge variant="outline" className="gap-1.5 text-emerald-700"><CheckCircle size={12} /> Live</Badge>}
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Overview</h1>
            <p className="mt-1 text-muted-foreground">What matters right now for {data.website.domain}.</p>
          </div>
          <Button variant="outline" onClick={() => window.open(`https://${data.website!.domain}`, "_blank")}>Visit website <ArrowRight size={16} className="ml-2" /></Button>
        </div>

        {data.unavailableSections.length > 0 && (
          <Alert className="border-amber-500/50">
            <WarningCircle size={16} />
            <AlertTitle>Some Overview data is unavailable</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>Could not load {data.unavailableSections.join(", ")}. Available evidence is still shown below.</span>
              <Button variant="outline" size="sm" onClick={() => data.retryUnavailable()}>Retry unavailable data</Button>
            </AlertDescription>
          </Alert>
        )}

        {data.usage && data.usage.views.percentUsed >= 80 && (
          <Alert className={data.usage.views.percentUsed >= 100 ? "border-destructive" : "border-amber-500/50"}>
            <WarningCircle size={16} />
            <AlertTitle>{data.usage.views.percentUsed >= 100 ? "Monthly view limit reached" : "Monthly view limit is getting close"}</AlertTitle>
            <AlertDescription>{data.usage.views.used.toLocaleString()} of {data.usage.views.limit.toLocaleString()} banner views used ({data.usage.views.percentUsed}%).</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Banner impressions" value={data.analyticsLoading ? null : metric(data.analyticsAvailable, (data.analytics?.totalViews || 0).toLocaleString())} detail={data.analyticsAvailable ? "Last 30 days" : "Analytics request failed"} icon={Globe} tone={data.analyticsAvailable ? undefined : "warning"} />
          <MetricCard title="Consent rate" value={data.analyticsLoading ? null : metric(data.analyticsAvailable, `${(data.analytics?.acceptRate || 0).toFixed(1)}%`)} detail={data.analyticsAvailable ? "Accepted per impression" : "Analytics request failed"} icon={ShieldCheck} tone={data.analyticsAvailable ? undefined : "warning"} />
          <MetricCard title="Rejection rate" value={data.analyticsLoading ? null : metric(data.analyticsAvailable, `${(data.analytics?.rejectRate || 0).toFixed(1)}%`)} detail={data.analyticsAvailable ? "Rejected per impression" : "Analytics request failed"} icon={ChartLine} tone={data.analyticsAvailable ? undefined : "warning"} />
          <MetricCard title="Implementation" value={data.embedAvailable ? (data.embedDetected ? "Live" : "Not detected") : "Not verified"} detail={data.diagnosticAvailable ? (data.consentModeReady ? "Consent Mode verified" : "Diagnostics pending") : "Diagnostics unavailable"} icon={Code} tone={data.embedAvailable && data.embedDetected ? "good" : "warning"} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <ActivityCard analytics={data.analyticsAvailable ? data.analytics : undefined} onOpenAnalytics={() => setLocation("/dashboard/analytics")} />
          <NextActionsCard actions={data.actions} onNavigate={setLocation} />
        </div>
      </div>
    </DashboardLayout>
  );
}
