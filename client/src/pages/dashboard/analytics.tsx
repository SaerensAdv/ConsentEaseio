import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, Pie, PieChart, Bar, BarChart, Funnel, FunnelChart, LabelList } from "recharts";
import { ArrowUpRight, ArrowDownRight, Users, CheckCircle2, XCircle, MousePointerClick, Loader2, Globe, TrendingUp, Filter, Clock } from "lucide-react";
import { LiveEventFeed } from "@/components/LiveEventFeed";
import { WebVitalsCard } from "@/components/WebVitalsCard";

interface Website {
  id: string;
  domain: string;
  publicId: string;
}

interface AnalyticsSummary {
  totalViews: number;
  acceptRate: number;
  rejectRate: number;
  dailyStats: Array<{ date: string; views: number; accepts: number; rejects: number }>;
  countryBreakdown: Array<{ country: string; count: number }>;
}

interface AdvancedAnalytics {
  trends: {
    currentPeriod: { views: number; accepts: number; rejects: number; rate: number };
    previousPeriod: { views: number; accepts: number; rejects: number; rate: number };
    change: number;
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
}

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
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

  const { data: analytics, isLoading } = useQuery<AnalyticsSummary>({
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

  const { data: advancedAnalytics } = useQuery<AdvancedAnalytics>({
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

  const chartData = analytics?.dailyStats?.map((stat) => ({
    name: new Date(stat.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    accepted: stat.accepts,
    rejected: stat.rejects,
    views: stat.views,
  })) || [];

  const consentData = [
    { name: "Accepted", value: Math.round(analytics?.acceptRate || 0), color: "#22c55e" },
    { name: "Rejected", value: Math.round(analytics?.rejectRate || 0), color: "#ef4444" },
  ];

  const funnelData = advancedAnalytics?.funnel ? [
    { name: "Banner Views", value: advancedAnalytics.funnel.impressions, fill: "#726CEA" },
    { name: "Interactions", value: advancedAnalytics.funnel.interactions, fill: "#8B85ED" },
    { name: "Accepted", value: advancedAnalytics.funnel.accepts, fill: "#22c55e" },
    { name: "Rejected", value: advancedAnalytics.funnel.rejects, fill: "#ef4444" },
  ] : [];

  const hourlyData = advancedAnalytics?.hourlyDistribution?.map(h => ({
    hour: `${h.hour.toString().padStart(2, '0')}:00`,
    count: h.count,
  })) || [];

  const trendChange = advancedAnalytics?.trends?.change || 0;

  if (isLoading && !analytics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
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
        <div className="flex flex-wrap gap-3">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-sessions">
              {analytics?.totalViews?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-green-500 flex items-center"><ArrowUpRight className="h-3 w-3" /> Banner views</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consent Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-consent-rate">
              {(analytics?.acceptRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {trendChange >= 0 ? (
                <span className="text-green-500 flex items-center"><ArrowUpRight className="h-3 w-3" /> +{trendChange.toFixed(1)}% vs prev</span>
              ) : (
                <span className="text-red-500 flex items-center"><ArrowDownRight className="h-3 w-3" /> {trendChange.toFixed(1)}% vs prev</span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-rejection-rate">
              {(analytics?.rejectRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-red-500 flex items-center"><ArrowDownRight className="h-3 w-3" /> Rejected cookies</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-interactions">
              {advancedAnalytics?.funnel?.interactions?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-green-500 flex items-center"><ArrowUpRight className="h-3 w-3" /> Total clicks</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="funnel" className="gap-2">
            <Filter className="h-4 w-4" /> Funnel
          </TabsTrigger>
          <TabsTrigger value="geographic" className="gap-2">
            <Globe className="h-4 w-4" /> Geographic
          </TabsTrigger>
          <TabsTrigger value="timing" className="gap-2">
            <Clock className="h-4 w-4" /> Timing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Consent Overview</CardTitle>
                <CardDescription>Daily breakdown of accepted vs rejected consents.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
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
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No data available for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Consent Ratio</CardTitle>
                <CardDescription>Overall acceptance ratio.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={consentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {consentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-bold" data-testid="stat-pie-percentage">
                      {Math.round(analytics?.acceptRate || 0)}%
                    </span>
                    <span className="text-xs text-muted-foreground">Accepted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                <div className="h-[350px]">
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
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No funnel data available yet
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
                  {[
                    { label: "Banner Impressions", value: advancedAnalytics?.funnel?.impressions || 0, color: "bg-primary" },
                    { label: "Settings Clicked", value: advancedAnalytics?.funnel?.settingsClicks || 0, color: "bg-blue-500" },
                    { label: "Accepted All", value: advancedAnalytics?.funnel?.accepts || 0, color: "bg-green-500" },
                    { label: "Rejected All", value: advancedAnalytics?.funnel?.rejects || 0, color: "bg-red-500" },
                    { label: "Custom Preferences", value: advancedAnalytics?.funnel?.customSaves || 0, color: "bg-amber-500" },
                    { label: "Dismissed (No Choice)", value: advancedAnalytics?.funnel?.dismissed || 0, color: "bg-gray-500" },
                  ].map((item) => {
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
                      <div key={item.country} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors" data-testid={`geo-${item.countryCode}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.flag}</span>
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
                  <div className="text-center py-8 text-muted-foreground">
                    No geographic data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Geographic Insights</CardTitle>
                <CardDescription>AI-generated recommendations based on location data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {advancedAnalytics?.geographic && advancedAnalytics.geographic.length > 0 ? (
                  <>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Top Market: {advancedAnalytics.geographic[0].flag} {advancedAnalytics.geographic[0].country}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {advancedAnalytics.geographic[0].views.toLocaleString()} banner views with {advancedAnalytics.geographic[0].acceptRate.toFixed(1)}% acceptance rate.
                        </p>
                      </div>
                    </div>

                    {advancedAnalytics.geographic.find(g => g.countryCode === 'DE' || g.countryCode === 'FR' || g.countryCode === 'NL') && (
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mt-0.5 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
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
                          <TrendingUp className="w-4 h-4" />
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
                  <div className="text-center py-4 text-muted-foreground">
                    Start collecting data to see geographic insights
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
                <div className="h-[300px]">
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
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No timing data available yet
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
                        week: new Date(w.week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
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
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Not enough data for weekly trends
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Timing Insights</CardTitle>
              <CardDescription>Optimize your banner based on visitor behavior patterns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 shrink-0">
                  <Clock className="w-4 h-4" />
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
