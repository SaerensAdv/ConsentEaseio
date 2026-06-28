import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, Pie, PieChart, Bar, BarChart, Funnel, FunnelChart, LabelList } from "recharts";
import { ArrowUpRight, ArrowDownRight, Users, CheckCircle, XCircle, CursorClick, SpinnerGap, Globe, TrendUp, Funnel as FunnelIcon, Clock, ChartBar, Code, Warning, DeviceMobile, Desktop, Laptop, Browser, DownloadSimple, EyeSlash, ShieldCheck } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LiveEventFeed } from "@/components/LiveEventFeed";
import { WebVitalsCard } from "@/components/WebVitalsCard";

interface UsageData {
  plan: string;
  websites: { used: number; limit: number | 'unlimited'; remaining: number | 'unlimited'; unlimited: boolean };
  views: { used: number; limit: number; remaining: number; percentUsed: number };
}

interface Website {
  id: string;
  domain: string;
  publicId: string;
}

interface AnalyticsSummary {
  totalViews: number;
  acceptRate: number;
  rejectRate: number;
  dismissedRate: number;
  customRate: number;
  noActionRate: number;
  dailyStats: Array<{ date: string; views: number; accepts: number; rejects: number }>;
  countryBreakdown: Array<{ country: string; count: number }>;
  // M3: present when interactions exceed impressions (duplicate POSTs, missing
  // banner_shown events, multi-tab interactions). Surfaced as a warning so
  // users don't read percentages that don't add up and assume a math bug.
  dataIntegrity?: {
    overcount: boolean;
    totalActions: number;
    totalViews: number;
    ratio: number;
  };
}

interface AdvancedAnalytics {
  trends: {
    currentPeriod: { views: number; accepts: number; rejects: number; rate: number };
    previousPeriod: { views: number; accepts: number; rejects: number; rate: number };
    // M4: null when previous period < 50 impressions — too small to report a
    // meaningful percentage delta, so the UI shows "—" instead of e.g. "+9472%".
    change: number | null;
  };
  funnel: {
    impressions: number;
    interactions: number;
    settingsClicks: number;
    accepts: number;
    rejects: number;
    customSaves: number;
    dismissed: number;
  };
  geographic: Array<{
    country: string;
    countryCode: string;
    flag: string;
    views: number;
    accepts: number;
    rejects: number;
    acceptRate: number;
  }>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
  weeklyTrend: Array<{ week: string; views: number; acceptRate: number }>;
  deviceBreakdown: Array<{ deviceType: string; count: number; acceptRate: number }>;
  browserBreakdown: Array<{ browser: string; count: number; acceptRate: number }>;
  categoryBreakdown: Array<{ category: string; granted: number; denied: number; total: number; grantRate: number }>;
}

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('websiteId');
  });
  const [dateRange, setDateRange] = useState("14");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: websites = [] } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
    queryFn: async () => {
      const res = await fetch("/api/websites", { credentials: "include" });
      if (res.status === 401) {
        setLocation("/login");
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to fetch websites");
      return res.json();
    },
  });

  const activeWebsiteId = selectedWebsite || websites[0]?.id;

  const { data: analytics, isLoading, error: analyticsError } = useQuery<AnalyticsSummary>({
    queryKey: ["/api/websites", activeWebsiteId, "analytics", dateRange],
    queryFn: async () => {
      if (!activeWebsiteId) return null;
      const res = await fetch(`/api/websites/${activeWebsiteId}/analytics?days=${dateRange}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!activeWebsiteId,
  });

  const { data: advancedAnalytics, error: advancedError } = useQuery<AdvancedAnalytics>({
    queryKey: ["/api/websites", activeWebsiteId, "analytics/advanced", dateRange],
    queryFn: async () => {
      if (!activeWebsiteId) return null;
      const res = await fetch(`/api/websites/${activeWebsiteId}/analytics/advanced?days=${dateRange}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch advanced analytics");
      return res.json();
    },
    enabled: !!activeWebsiteId,
  });

  const { data: usage } = useQuery<UsageData>({
    queryKey: ["/api/usage"],
    queryFn: async () => {
      const res = await fetch("/api/usage", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch usage");
      return res.json();
    },
  });

  const userLocale = typeof navigator !== 'undefined' ? navigator.language : 'en';

  const chartData = analytics?.dailyStats?.map((stat) => ({
    name: new Date(stat.date).toLocaleDateString(userLocale, { weekday: "short", month: "short", day: "numeric" }),
    accepted: stat.accepts,
    rejected: stat.rejects,
    views: stat.views,
  })) || [];

  const consentDataRaw = [
    { name: "Accepted", value: parseFloat((analytics?.acceptRate || 0).toFixed(1)), color: "#22c55e" },
    { name: "Rejected", value: parseFloat((analytics?.rejectRate || 0).toFixed(1)), color: "#ef4444" },
    { name: "Custom", value: parseFloat((analytics?.customRate || 0).toFixed(1)), color: "#f59e0b" },
    { name: "Dismissed", value: parseFloat((analytics?.dismissedRate || 0).toFixed(1)), color: "#6b7280" },
    { name: "No Action", value: parseFloat((analytics?.noActionRate || 0).toFixed(1)), color: "#d1d5db" },
  ];
  const consentData = consentDataRaw.filter(d => d.value > 0);
  const hasConsentData = consentData.length > 0;

  const funnelData = advancedAnalytics?.funnel ? (() => {
    const f = advancedAnalytics.funnel;
    const noAction = Math.max(0, f.impressions - f.accepts - f.rejects - f.dismissed - f.customSaves);
    return [
      { name: "Banner Views", value: f.impressions, fill: "#726CEA" },
      { name: "Accepted", value: f.accepts, fill: "#22c55e" },
      { name: "Rejected", value: f.rejects, fill: "#ef4444" },
      { name: "Custom", value: f.customSaves, fill: "#f59e0b" },
      { name: "Dismissed", value: f.dismissed, fill: "#6b7280" },
      { name: "No Action", value: noAction, fill: "#d1d5db" },
    ].filter(d => d.name === "Banner Views" || d.value > 0);
  })() : [];

  const hourlyData = advancedAnalytics?.hourlyDistribution?.map(h => ({
    hour: `${h.hour.toString().padStart(2, '0')}:00`,
    count: h.count,
  })) || [];

  // M4: null trend = not enough data. Don't coerce to 0 (would render as a
  // green "+0.0%"), use null sentinel and render "—" in the tile.
  const trendChange = advancedAnalytics?.trends?.change ?? null;

  if (isLoading && !analytics) {
    return (
      <DashboardLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (analyticsError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold">Analytics</h1>
            <p className="text-muted-foreground">Monitor your consent rates and compliance metrics.</p>
          </div>
        </div>
        <Alert variant="destructive" data-testid="alert-analytics-error">
          <Warning size={16} />
          <AlertTitle>Failed to load analytics</AlertTitle>
          <AlertDescription>
            We couldn't load your analytics data. Please try refreshing the page or check back later.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground">Monitor your consent rates and compliance metrics.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {activeWebsiteId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(`/api/websites/${activeWebsiteId}/analytics/export?days=${dateRange}`, '_blank');
              }}
              data-testid="button-export-csv"
            >
              <DownloadSimple size={16} className="mr-1.5" />
              Export CSV
            </Button>
          )}
          {websites.length > 1 && (
            <Select value={selectedWebsite || websites[0]?.id} onValueChange={setSelectedWebsite}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-website">
                <SelectValue placeholder="Select website" />
              </SelectTrigger>
              <SelectContent>
                {websites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-date-range">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {usage && usage.views.percentUsed >= 100 && (
        <Alert variant="destructive" className="mb-6" data-testid="alert-view-limit-exceeded">
          <Warning size={16} />
          <AlertTitle>Monthly view limit exceeded</AlertTitle>
          <AlertDescription>
            You've exceeded your monthly view limit ({(usage.views.used).toLocaleString()} / {(usage.views.limit).toLocaleString()} views). Analytics recording has been paused. Upgrade your plan to continue tracking.
          </AlertDescription>
        </Alert>
      )}

      {usage && usage.views.percentUsed >= 80 && usage.views.percentUsed < 100 && (
        <Alert className="mb-6 border-amber-500/50 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400" data-testid="alert-view-limit-warning">
          <Warning size={16} />
          <AlertTitle>Approaching view limit</AlertTitle>
          <AlertDescription>
            You've used {Math.round(usage.views.percentUsed)}% of your monthly banner views ({(usage.views.used).toLocaleString()} / {(usage.views.limit).toLocaleString()}). Consider upgrading your plan to avoid interruptions.
          </AlertDescription>
        </Alert>
      )}

      {/* M3: warn when actions outnumber impressions. Means the rates below
          have been clamped and the funnel won't add to 100%. Caused by
          duplicate POSTs, multi-tab interactions, or missing banner_shown
          events from earlier sessions. Surfacing it so users don't think the
          dashboard math is broken. */}
      {analytics?.dataIntegrity?.overcount && (
        <Alert className="mb-6 border-amber-500/50 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400" data-testid="alert-data-integrity">
          <Warning size={16} />
          <AlertTitle>Data anomaly: more interactions than impressions</AlertTitle>
          <AlertDescription>
            We've recorded {analytics.dataIntegrity.totalActions.toLocaleString()} consent
            actions but only {analytics.dataIntegrity.totalViews.toLocaleString()} banner
            impressions in the selected period. This usually means visitors interacted
            across multiple tabs or sessions where the banner_shown event didn't fire
            (e.g. older banner versions, ad-blockers). Rates have been clamped to 100%
            to keep the dashboard readable.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-8">
        {/* M2: each tile carries a precise definition. The previous "Total
            Sessions" was misleading — the metric is banner_shown events, which
            doesn't equal user sessions (one user can have many impressions
            across page navigations, and an impression can fire without a
            session in single-page apps). Renamed + clarified denominators on
            the rate cards so users know everything is per-impression. */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" title="Number of banner_shown events. One visitor can produce multiple impressions across page loads.">Banner Impressions</CardTitle>
            <Users size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-sessions" aria-label={`Banner impressions: ${analytics?.totalViews?.toLocaleString() || 0}`}>
              {analytics?.totalViews?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Times the banner rendered in selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" title="accepts ÷ banner impressions">Consent Rate</CardTitle>
            <CheckCircle size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-consent-rate" aria-label={`Consent rate: ${(analytics?.acceptRate || 0).toFixed(1)}%`}>
              {(analytics?.acceptRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1" title="per impression — change vs previous period">
              {trendChange === null ? (
                <span className="text-muted-foreground">— vs prev (insufficient data)</span>
              ) : trendChange >= 0 ? (
                <span className="text-green-500 flex items-center"><ArrowUpRight size={12} /> +{trendChange.toFixed(1)}% vs prev</span>
              ) : (
                <span className="text-red-500 flex items-center"><ArrowDownRight size={12} /> {trendChange.toFixed(1)}% vs prev</span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" title="rejects ÷ banner impressions">Rejection Rate</CardTitle>
            <XCircle size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-rejection-rate" aria-label={`Rejection rate: ${(analytics?.rejectRate || 0).toFixed(1)}%`}>
              {(analytics?.rejectRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Declined per impression
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" title="banner_dismissed ÷ banner impressions">Dismissed</CardTitle>
            <EyeSlash size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-dismissed" aria-label={`Dismissed: ${(analytics?.dismissedRate || 0).toFixed(1)}%`}>
              {(analytics?.dismissedRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Closed banner per impression
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" title="impressions with no follow-up event ÷ banner impressions">No Action</CardTitle>
            <CursorClick size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-no-action" aria-label={`No Action: ${(analytics?.noActionRate || 0).toFixed(1)}%`}>
              {(analytics?.noActionRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Left without any interaction
            </p>
          </CardContent>
        </Card>
      </div>

      {advancedError && (
        <Alert variant="destructive" className="mb-4">
          <Warning size={16} />
          <AlertTitle>Advanced analytics unavailable</AlertTitle>
          <AlertDescription>
            Could not load device, browser, and category data. Basic analytics are still shown.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <TrendUp size={16} /> Overview
          </TabsTrigger>
          <TabsTrigger value="funnel" className="gap-2">
            <FunnelIcon size={16} /> Funnel
          </TabsTrigger>
          <TabsTrigger value="geographic" className="gap-2">
            <Globe size={16} /> Geographic
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-2">
            <Desktop size={16} /> Devices
          </TabsTrigger>
          <TabsTrigger value="timing" className="gap-2">
            <Clock size={16} /> Timing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4" data-tour="analytics-chart">
              <CardHeader>
                <CardTitle>Consent Overview</CardTitle>
                <CardDescription>Daily breakdown of accepted vs rejected consents.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]" role="img" aria-label="Area chart showing daily accepted and rejected consents over time">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Area type="monotone" dataKey="accepted" stroke="#22c55e" fillOpacity={1} fill="url(#colorAccepted)" name="Accepted" />
                        <Area type="monotone" dataKey="rejected" stroke="#ef4444" fillOpacity={1} fill="url(#colorRejected)" name="Rejected" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center" data-testid="empty-overview-chart">
                      <ChartBar size={40} className="text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No consent data for this period</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Charts will populate as visitors interact with your consent banner.</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setLocation("/dashboard/embed")} data-testid="link-empty-embed-overview">
                        <Code size={14} className="mr-1.5" /> Install embed code
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Consent Ratio</CardTitle>
                <CardDescription>Breakdown of all visitor responses.</CardDescription>
              </CardHeader>
              <CardContent>
                {hasConsentData ? (
                  <>
                    <div className="h-[240px] relative" role="img" aria-label="Pie chart showing overall consent breakdown">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={consentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {consentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                            formatter={(value: number) => `${value.toFixed(1)}%`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-3xl font-bold" data-testid="stat-pie-percentage">
                          {Math.round(analytics?.acceptRate || 0)}%
                        </span>
                        <span className="text-xs text-muted-foreground">Accepted</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
                      {consentData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-medium">{item.value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center" data-testid="empty-consent-ratio">
                    <ChartBar size={40} className="text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No consent data for this period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {advancedAnalytics?.categoryBreakdown && advancedAnalytics.categoryBreakdown.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-primary" />
                  Consent by Category
                </CardTitle>
                <CardDescription>How visitors choose per cookie category when customizing preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {advancedAnalytics.categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="p-4 rounded-lg border bg-card" data-testid={`category-${cat.category}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{cat.category}</span>
                        <span className={`text-sm font-semibold ${cat.grantRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                          {cat.grantRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${cat.grantRate}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{cat.granted.toLocaleString()} granted</span>
                        <span>{cat.denied.toLocaleString()} denied</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <WebVitalsCard websiteId={activeWebsiteId || null} />
            <LiveEventFeed websiteId={activeWebsiteId || null} />
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Track how visitors move through the consent flow.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]" role="img" aria-label="Bar chart showing consent conversion funnel from banner views to final actions">
                  {funnelData.length > 0 && funnelData[0].value > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={funnelData} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {funnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                          <LabelList dataKey="value" position="right" fontSize={12} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center" data-testid="empty-funnel-chart">
                      <FunnelIcon size={40} className="text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No funnel data yet</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">See how visitors move through your consent flow once traffic starts.</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setLocation("/dashboard/embed")} data-testid="link-empty-embed-funnel">
                        <Code size={14} className="mr-1.5" /> Install embed code
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funnel Breakdown</CardTitle>
                <CardDescription>Detailed interaction metrics.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const impressions = advancedAnalytics?.funnel?.impressions || 0;
                    const accepts = advancedAnalytics?.funnel?.accepts || 0;
                    const rejects = advancedAnalytics?.funnel?.rejects || 0;
                    const dismissed = advancedAnalytics?.funnel?.dismissed || 0;
                    const customSaves = advancedAnalytics?.funnel?.customSaves || 0;
                    const noAction = Math.max(0, impressions - accepts - rejects - dismissed - customSaves);
                    return [
                      { label: "Banner Impressions", value: impressions, color: "bg-primary" },
                      { label: "Accepted All", value: accepts, color: "bg-green-500" },
                      { label: "Rejected All", value: rejects, color: "bg-red-500" },
                      { label: "Custom Preferences", value: customSaves, color: "bg-amber-500" },
                      { label: "Dismissed", value: dismissed, color: "bg-gray-500" },
                      { label: "No Action", value: noAction, color: "bg-gray-300" },
                      { label: "Settings Clicked", value: advancedAnalytics?.funnel?.settingsClicks || 0, color: "bg-blue-500" },
                    ];
                  })().map((item) => {
                    const total = advancedAnalytics?.funnel?.impressions || 1;
                    const percentage = (item.value / total) * 100;
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-muted-foreground">{item.value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Breakdown</CardTitle>
                <CardDescription>Consent rates by country with detailed metrics.</CardDescription>
              </CardHeader>
              <CardContent>
                {advancedAnalytics?.geographic && advancedAnalytics.geographic.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {advancedAnalytics.geographic.map((item) => (
                      <div key={item.country} className="p-3 rounded-lg border bg-card hover-elevate" data-testid={`geo-${item.countryCode}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium bg-muted px-1.5 py-0.5 rounded">{item.countryCode}</span>
                            <span className="font-medium">{item.country}</span>
                          </div>
                          <span className="text-sm font-semibold text-primary">{item.acceptRate.toFixed(1)}%</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div className="flex flex-col">
                            <span>Views</span>
                            <span className="font-medium text-foreground">{item.views.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col">
                            <span>Accepted</span>
                            <span className="font-medium text-green-500">{item.accepts.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col">
                            <span>Rejected</span>
                            <span className="font-medium text-red-500">{item.rejects.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${item.acceptRate}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-8" data-testid="empty-geographic">
                    <Globe size={40} className="text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No geographic data yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Country-level consent rates will appear as visitors from different regions interact with your banner.</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setLocation("/dashboard/embed")} data-testid="link-empty-embed-geo">
                      <Code size={14} className="mr-1.5" /> Install embed code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Insights</CardTitle>
                <CardDescription>AI-generated recommendations based on location data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {advancedAnalytics?.geographic && advancedAnalytics.geographic.length > 0 ? (
                  <>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 shrink-0">
                        <Globe size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Top Market: {advancedAnalytics.geographic[0].country} ({advancedAnalytics.geographic[0].countryCode})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {advancedAnalytics.geographic[0].views.toLocaleString()} banner views with {advancedAnalytics.geographic[0].acceptRate.toFixed(1)}% acceptance rate.
                        </p>
                      </div>
                    </div>

                    {advancedAnalytics.geographic.find(g => g.countryCode === 'DE' || g.countryCode === 'FR' || g.countryCode === 'NL') && (
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mt-0.5 shrink-0">
                          <CheckCircle size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">GDPR Region Traffic</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            You have significant EU traffic. Consider enabling multi-language support for better conversion.
                          </p>
                        </div>
                      </div>
                    )}

                    {advancedAnalytics.geographic.some(g => g.acceptRate < 50) && (
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mt-0.5 shrink-0">
                          <TrendUp size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Low Acceptance Regions</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Some countries show below 50% acceptance. Try localizing the banner text for those regions.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-4" data-testid="empty-geo-insights">
                    <Globe size={32} className="text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Start collecting data to see geographic insights</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Type</CardTitle>
                <CardDescription>Banner views and consent rates by device.</CardDescription>
              </CardHeader>
              <CardContent>
                {advancedAnalytics?.deviceBreakdown && advancedAnalytics.deviceBreakdown.some(d => d.count > 0) ? (
                  <div className="space-y-4">
                    {advancedAnalytics.deviceBreakdown.map((device) => {
                      const total = advancedAnalytics.deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
                      const percentage = total > 0 ? (device.count / total) * 100 : 0;
                      const DeviceIcon = device.deviceType === 'mobile' ? DeviceMobile : device.deviceType === 'tablet' ? Laptop : Desktop;
                      return (
                        <div key={device.deviceType} className="p-4 rounded-lg border bg-card" data-testid={`device-${device.deviceType}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <DeviceIcon size={20} className="text-muted-foreground" />
                              <span className="font-medium capitalize">{device.deviceType}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold">{device.count.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground ml-1">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Consent rate: <span className={device.acceptRate >= 50 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>{device.acceptRate.toFixed(1)}%</span></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-8" data-testid="empty-devices">
                    <Desktop size={40} className="text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No device data yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Device breakdown will appear as visitors interact with your banner.</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setLocation("/dashboard/embed")} data-testid="link-empty-embed-devices">
                      <Code size={14} className="mr-1.5" /> Install embed code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browser Breakdown</CardTitle>
                <CardDescription>Consent rates across different browsers.</CardDescription>
              </CardHeader>
              <CardContent>
                {advancedAnalytics?.browserBreakdown && advancedAnalytics.browserBreakdown.some(b => b.count > 0) ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {advancedAnalytics.browserBreakdown.map((item) => {
                      const total = advancedAnalytics.browserBreakdown.reduce((sum, b) => sum + b.count, 0);
                      const percentage = total > 0 ? (item.count / total) * 100 : 0;
                      return (
                        <div key={item.browser} className="p-3 rounded-lg border bg-card" data-testid={`browser-${item.browser.toLowerCase().replace(/\s+/g, '-')}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Browser size={16} className="text-muted-foreground" />
                              <span className="font-medium">{item.browser}</span>
                            </div>
                            <span className="text-sm font-semibold">{item.count.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mb-1.5">
                            <div className="h-full bg-primary/70 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{percentage.toFixed(1)}% of traffic</span>
                            <span className={item.acceptRate >= 50 ? 'text-green-500' : 'text-red-500'}>{item.acceptRate.toFixed(1)}% consent</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-8" data-testid="empty-browsers">
                    <Browser size={40} className="text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No browser data yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Browser breakdown will appear as visitors interact with your banner.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timing" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Distribution</CardTitle>
                <CardDescription>When visitors interact with your consent banner (UTC).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]" role="img" aria-label="Bar chart showing hourly distribution of banner views">
                  {hourlyData.some(h => h.count > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <XAxis dataKey="hour" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                        <Bar dataKey="count" fill="#726CEA" radius={[4, 4, 0, 0]} name="Banner Views" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center" data-testid="empty-timing-chart">
                      <Clock size={40} className="text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No timing data yet</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Hourly distribution will show when your visitors are most active.</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setLocation("/dashboard/embed")} data-testid="link-empty-embed-timing">
                        <Code size={14} className="mr-1.5" /> Install embed code
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Trend</CardTitle>
                <CardDescription>Consent rate trends over weeks.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {advancedAnalytics?.weeklyTrend && advancedAnalytics.weeklyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={advancedAnalytics.weeklyTrend.map(w => ({
                        week: new Date(w.week).toLocaleDateString(userLocale, { month: "short", day: "numeric" }),
                        views: w.views,
                        rate: w.acceptRate,
                      }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#726CEA" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#726CEA" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="week" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }} formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accept Rate']} />
                        <Area type="monotone" dataKey="rate" stroke="#726CEA" fillOpacity={1} fill="url(#colorRate)" name="Accept Rate" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center" data-testid="empty-weekly-chart">
                      <TrendUp size={40} className="text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">Not enough data for weekly trends</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Week-over-week consent rate trends will appear after collecting enough data.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Timing Insights</CardTitle>
              <CardDescription>Optimize your banner based on visitor behavior patterns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">Peak Traffic Hours</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hourlyData.length > 0 ? (
                      (() => {
                        const peak = hourlyData.reduce((max, h) => h.count > max.count ? h : max, hourlyData[0]);
                        return `Most banner views occur at ${peak.hour}. Consider A/B testing banner timing around this window.`;
                      })()
                    ) : (
                      "Collect more data to identify peak traffic hours."
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </DashboardLayout>
  );
}
