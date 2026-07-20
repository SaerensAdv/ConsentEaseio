import { ArrowRight, ChartLine, CheckCircle, Globe, type Icon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsSummary, OverviewAction } from "./use-overview-data";

export function OverviewLoading() {
  return <div className="space-y-6"><Skeleton className="h-10 w-64" /><div className="grid gap-4 md:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-32 rounded-xl" />)}</div><Skeleton className="h-64 rounded-xl" /></div>;
}

export function OverviewEmpty({ onAddWebsite }: { onAddWebsite: () => void }) {
  return <Card className="border-dashed"><CardContent className="flex flex-col items-center py-16 text-center"><Globe size={48} className="mb-4 text-muted-foreground" /><h1 className="text-2xl font-display font-bold">Add your first website</h1><p className="mt-2 max-w-md text-muted-foreground">ConsentEase needs a domain before it can scan cookies, create a banner, or collect consent proof.</p><Button className="mt-6" onClick={onAddWebsite}>Add website <ArrowRight size={16} className="ml-2" /></Button></CardContent></Card>;
}

export function MetricCard({ title, value, detail, icon: Icon, tone }: { title: string; value: string | null; detail: string; icon: Icon; tone?: "good" | "warning" }) {
  return <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle><span className={`rounded-md p-2 ${tone === "good" ? "bg-emerald-500/10 text-emerald-600" : tone === "warning" ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}><Icon size={16} /></span></CardHeader><CardContent>{value === null ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}<p className="mt-1 text-xs text-muted-foreground">{detail}</p></CardContent></Card>;
}

export function ActivityCard({ analytics, onOpenAnalytics }: { analytics?: AnalyticsSummary; onOpenAnalytics: () => void }) {
  const maxDailyViews = Math.max(1, ...(analytics?.dailyStats || []).map((day) => day.views));
  return <Card><CardHeader><CardTitle>30-day activity</CardTitle><CardDescription>Daily banner impressions, honest and intentionally simple.</CardDescription></CardHeader><CardContent>{(analytics?.dailyStats || []).length > 0 ? <div className="flex h-40 items-end gap-1.5" aria-label="Daily banner impressions chart">{analytics!.dailyStats.map((day) => <div key={day.date} className="group flex h-full flex-1 items-end"><div className="w-full min-h-1 rounded-t bg-primary/70 transition-colors group-hover:bg-primary" style={{ height: `${Math.max(3, (day.views / maxDailyViews) * 100)}%` }} title={`${new Date(day.date).toLocaleDateString()}: ${day.views} impressions`} /></div>)}</div> : <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center"><ChartLine size={32} className="mb-2 text-muted-foreground/50" /><p className="text-sm font-medium">No live activity yet</p><p className="text-xs text-muted-foreground">Install the embed to start collecting data.</p></div>}<Button variant="ghost" className="mt-4 px-0" onClick={onOpenAnalytics}>Open full analytics <ArrowRight size={15} className="ml-2" /></Button></CardContent></Card>;
}

export function NextActionsCard({ actions, onNavigate }: { actions: OverviewAction[]; onNavigate: (href: string) => void }) {
  return <Card><CardHeader><CardTitle>Next actions</CardTitle><CardDescription>Highest-impact work first.</CardDescription></CardHeader><CardContent className="space-y-3">{actions.length > 0 ? actions.slice(0, 3).map((action) => { const Icon = action.icon; return <button key={action.title} onClick={() => onNavigate(action.href)} className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/60"><span className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary"><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{action.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{action.description}</span><span className="mt-2 flex items-center text-xs font-medium text-primary">{action.label}<ArrowRight size={12} className="ml-1" /></span></span></button>; }) : <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"><CheckCircle size={22} className="mb-2" /><p className="text-sm font-semibold">Nothing urgent</p><p className="mt-1 text-xs opacity-80">Scan, embed, and configuration all look healthy.</p></div>}</CardContent></Card>;
}
