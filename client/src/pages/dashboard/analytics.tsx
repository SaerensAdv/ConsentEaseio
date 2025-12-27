import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, Pie, PieChart } from "recharts";
import { ArrowUpRight, ArrowDownRight, Users, CheckCircle2, XCircle, MousePointerClick, Loader2 } from "lucide-react";
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

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("14");

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

  const chartData = analytics?.dailyStats?.map((stat) => ({
    name: new Date(stat.date).toLocaleDateString("en-US", { weekday: "short" }),
    accepted: stat.accepts,
    rejected: stat.rejects,
  })) || [];

  const consentData = [
    { name: "Accepted", value: Math.round(analytics?.acceptRate || 0), color: "#22c55e" },
    { name: "Rejected", value: Math.round(analytics?.rejectRate || 0), color: "#ef4444" },
  ];

  const locationData = analytics?.countryBreakdown?.slice(0, 8).map((item, index, arr) => {
    const maxCount = arr[0]?.count || 1;
    return {
      country: item.country,
      visitors: item.count,
      percentage: Math.round((item.count / maxCount) * 100),
    };
  }) || [];

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground">Monitor your consent rates and compliance metrics.</p>
        </div>
        <div className="flex gap-3">
          {websites.length > 1 && (
            <Select value={selectedWebsite || websites[0]?.id} onValueChange={setSelectedWebsite}>
              <SelectTrigger className="w-[200px]" data-testid="select-website">
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
            <SelectTrigger className="w-[180px]" data-testid="select-date-range">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
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
              <span className="text-green-500 flex items-center"><ArrowUpRight className="h-3 w-3" /> Accepted cookies</span>
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
              {analytics?.dailyStats?.reduce((acc, stat) => acc + stat.accepts + stat.rejects, 0)?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-green-500 flex items-center"><ArrowUpRight className="h-3 w-3" /> Total clicks</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7" data-tour="analytics-chart">
        {/* Main Chart */}
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
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="accepted" stroke="#22c55e" fillOpacity={1} fill="url(#colorAccepted)" />
                    <Area type="monotone" dataKey="rejected" stroke="#ef4444" fillOpacity={1} fill="url(#colorRejected)" />
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

        {/* Side Charts */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ratio</CardTitle>
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
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
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
          </CardContent>
        </Card>
      </div>

      {/* Web Vitals & Live Event Feed */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <WebVitalsCard websiteId={activeWebsiteId || null} />
        <LiveEventFeed websiteId={activeWebsiteId || null} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Where your visitors are consenting from.</CardDescription>
          </CardHeader>
          <CardContent>
            {locationData.length > 0 ? (
              <div className="space-y-4">
                {locationData.map((item) => (
                  <div key={item.country} className="flex items-center" data-testid={`country-${item.country}`}>
                    <div className="w-full space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.country}</span>
                        <span className="text-muted-foreground">{item.visitors.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No location data available yet
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 border-primary/20">
           <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>AI-generated compliance recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {(analytics?.acceptRate || 0) > 70 
                    ? "Great acceptance rate!" 
                    : "Room for improvement"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(analytics?.acceptRate || 0) > 70 
                    ? "Your consent rate is above industry average. Keep it up!" 
                    : "Try customizing your banner colors to match your brand for better trust."}
                </p>
              </div>
            </div>
             <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mt-0.5 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {locationData[0]?.country || "No location data"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {locationData[0] 
                    ? `Most of your visitors are from ${locationData[0].country}. Make sure your banner is localized.`
                    : "Start collecting data to see visitor insights."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </DashboardLayout>
  );
}
