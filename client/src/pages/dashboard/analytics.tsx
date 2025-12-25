import DashboardLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, Pie, PieChart } from "recharts";
import { ArrowUpRight, ArrowDownRight, Users, CheckCircle2, XCircle, MousePointerClick } from "lucide-react";

export default function Analytics() {
  // Mock Data
  const data = [
    { name: "Mon", accepted: 400, rejected: 240 },
    { name: "Tue", accepted: 300, rejected: 139 },
    { name: "Wed", accepted: 200, rejected: 980 },
    { name: "Thu", accepted: 278, rejected: 390 },
    { name: "Fri", accepted: 189, rejected: 480 },
    { name: "Sat", accepted: 239, rejected: 380 },
    { name: "Sun", accepted: 349, rejected: 430 },
  ];

  const consentData = [
    { name: "Accepted", value: 65, color: "#22c55e" },
    { name: "Rejected", value: 35, color: "#ef4444" },
  ];

  const locationData = [
    { country: "United States", visitors: 12450, percentage: 45 },
    { country: "Germany", visitors: 8320, percentage: 32 },
    { country: "United Kingdom", visitors: 4100, percentage: 15 },
    { country: "France", visitors: 1540, percentage: 8 },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground">Monitor your consent rates and compliance metrics.</p>
        </div>
        <Select defaultValue="7d">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-green-500 flex items-center"><ArrowUpRight className="h-3 w-3" /> +20.1%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consent Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65.2%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-green-500 flex items-center"><ArrowUpRight className="h-3 w-3" /> +4.3%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34.8%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-red-500 flex items-center"><ArrowDownRight className="h-3 w-3" /> -1.2%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-green-500 flex items-center"><ArrowUpRight className="h-3 w-3" /> +12%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Consent Overview</CardTitle>
            <CardDescription>Daily breakdown of accepted vs rejected consents.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                <span className="text-3xl font-bold">65%</span>
                <span className="text-xs text-muted-foreground">Accepted</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Where your visitors are consenting from.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationData.map((item) => (
                <div key={item.country} className="flex items-center">
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
                <p className="text-sm font-medium">Acceptance rate increased by 5%</p>
                <p className="text-xs text-muted-foreground mt-1">Changing your banner color to match your brand seems to have improved trust.</p>
              </div>
            </div>
             <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mt-0.5 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">High rejection rate in Germany</p>
                <p className="text-xs text-muted-foreground mt-1">Visitors from Germany reject 12% more often. Consider enabling TCF v2.2 support for this region.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </DashboardLayout>
  );
}