import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  ArrowRight,
  ChartLine,
  CheckCircle,
  Code,
  Cookie,
  Globe,
  Pulse,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react";
import DashboardLayout from "./layout";
import { useWebsite } from "@/contexts/WebsiteContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsSummary {
  totalViews: number;
  acceptRate: number;
  rejectRate: number;
  dailyStats: Array<{ date: string; views: number; accepts: number; rejects: number }>;
}

interface UsageData {
  views: { used: number; limit: number; percentUsed: number };
}

interface BannerConfig {
  primaryColor: string;
  heading: string;
}

interface DiagnosticScan {
  status: string;
  bannerScriptDetected: boolean | null;
  consentModeDetected: boolean | null;
  defaultConsentSet: boolean | null;
  scannedAt: string;
}

export default function DashboardOverview() {
  const [, setLocation] = useLocation();
  const { selectedWebsite: website, isLoading: websitesLoading } = useWebsite();

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["/api/websites", website?.id, "analytics", "30"],
    queryFn: async () => {
      const response = await fetch(`/api/websites/${website?.id}/analytics?days=30`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load analytics");
      return response.json();
    },
    enabled: !!website?.id,
  });

  const { data: banner } = useQuery<BannerConfig>({
    queryKey: ["/api/websites", website?.id, "banner"],
    queryFn: async () => {
      const response = await fetch(`/api/websites/${website?.id}/banner`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load banner");
      return response.json();
    },
    enabled: !!website?.id,
  });

  const { data: diagnostic } = useQuery<DiagnosticScan | null>({
    queryKey: ["/api/websites", website?.id, "diagnostic-scan", "latest"],
    queryFn: async () => {
      const response = await fetch(`/api/websites/${website?.id}/diagnostic-scan/latest`, { credentials: "include" });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to load diagnostics");
      return response.json();
    },
    enabled: !!website?.id,
  });

  const { data: usage } = useQuery<UsageData>({
    queryKey: ["/api/usage"],
    queryFn: async () => {
      const response = await fetch("/api/usage", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load usage");
      return response.json();
    },
  });

  if (websitesLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-32 rounded-xl" />)}</div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!website) {
    return (
      <DashboardLayout>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Globe size={48} className="mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-display font-bold">Add your first website</h1>
            <p className="mt-2 max-w-md text-muted-foreground">ConsentEase needs a domain before it can scan cookies, create a banner, or collect consent proof.</p>
            <Button className="mt-6" onClick={() => setLocation("/dashboard/websites")}>Add website <ArrowRight size={16} className="ml-2" /></Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const embedDetected = (analytics?.totalViews || 0) > 0 || diagnostic?.bannerScriptDetected === true;
  const consentModeReady = diagnostic?.consentModeDetected === true && diagnostic?.defaultConsentSet === true;
  const needsScan = website.status !== "compliant";
  const isDefaultBanner = banner?.primaryColor === "#726CEA" && banner?.heading === "We value your privacy";

  const actions = [
    needsScan ? { priority: 1, title: "Cookie scan needs attention", description: "Review the latest scan or run it again.", label: "Open websites", href: "/dashboard/websites", icon: WarningCircle } : null,
    !embedDetected ? { priority: 2, title: "Install the consent banner", description: "No live banner activity has been detected yet.", label: "Get embed code", href: "/dashboard/embed", icon: Code } : null,
    isDefaultBanner ? { priority: 3, title: "Make the banner yours", description: "The active banner still uses the default design.", label: "Customize banner", href: "/dashboard/banner", icon: Cookie } : null,
    !diagnostic ? { priority: 4, title: "Verify Consent Mode", description: "Run a diagnostic after installing the banner.", label: "Run diagnostics", href: "/dashboard/diagnostics", icon: Pulse } : null,
  ].filter(Boolean).sort((a, b) => a!.priority - b!.priority);

  const maxDailyViews = Math.max(1, ...(analytics?.dailyStats || []).map((day) => day.views));

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5"><span className={`h-2 w-2 rounded-full ${website.status === "compliant" ? "bg-emerald-500" : "bg-amber-500"}`} />{website.status === "compliant" ? "Scan healthy" : "Needs attention"}</Badge>
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
          <Card>
            <CardHeader>
              <CardTitle>30-day activity</CardTitle>
              <CardDescription>Daily banner impressions, honest and intentionally simple.</CardDescription>
            </CardHeader>
            <CardContent>
              {(analytics?.dailyStats || []).length > 0 ? (
                <div className="flex h-40 items-end gap-1.5" aria-label="Daily banner impressions chart">
                  {analytics!.dailyStats.map((day) => (
                    <div key={day.date} className="group flex h-full flex-1 items-end">
                      <div className="w-full min-h-1 rounded-t bg-primary/70 transition-colors group-hover:bg-primary" style={{ height: `${Math.max(3, (day.views / maxDailyViews) * 100)}%` }} title={`${new Date(day.date).toLocaleDateString()}: ${day.views} impressions`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                  <ChartLine size={32} className="mb-2 text-muted-foreground/50" />
                  <p className="text-sm font-medium">No live activity yet</p>
                  <p className="text-xs text-muted-foreground">Install the embed to start collecting data.</p>
                </div>
              )}
              <Button variant="ghost" className="mt-4 px-0" onClick={() => setLocation("/dashboard/analytics")}>Open full analytics <ArrowRight size={15} className="ml-2" /></Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next actions</CardTitle>
              <CardDescription>Highest-impact work first.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {actions.length > 0 ? actions.slice(0, 3).map((action) => {
                const Icon = action!.icon;
                return (
                  <button key={action!.title} onClick={() => setLocation(action!.href)} className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/60">
                    <span className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary"><Icon size={17} /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{action!.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{action!.description}</span><span className="mt-2 flex items-center text-xs font-medium text-primary">{action!.label}<ArrowRight size={12} className="ml-1" /></span></span>
                  </button>
                );
              }) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                  <CheckCircle size={22} className="mb-2" /><p className="text-sm font-semibold">Nothing urgent</p><p className="mt-1 text-xs opacity-80">Scan, embed, and configuration all look healthy.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, detail, icon: Icon, tone }: { title: string; value: string | null; detail: string; icon: typeof Globe; tone?: "good" | "warning" }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className={`rounded-md p-2 ${tone === "good" ? "bg-emerald-500/10 text-emerald-600" : tone === "warning" ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}><Icon size={16} /></span>
      </CardHeader>
      <CardContent>{value === null ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}<p className="mt-1 text-xs text-muted-foreground">{detail}</p></CardContent>
    </Card>
  );
}
