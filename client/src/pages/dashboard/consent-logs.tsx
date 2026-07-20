import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "./layout";
import { useWebsite } from "@/contexts/WebsiteContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DownloadSimple, FileText, Clock, CheckCircle, XCircle, SlidersHorizontal, ArrowsClockwise, WarningCircle, MagnifyingGlass, TrendUp, TrendDown, Minus, Funnel } from "@phosphor-icons/react";
import type { ConsentLog } from "@shared/schema";

type DateRange = "today" | "7days" | "30days" | "all";

interface ConsentLogStats {
  totalRecords: number;
  acceptCount: number;
  rejectCount: number;
  customCount: number;
  dismissedCount: number;
  acceptRate: number;
  rejectRate: number;
  mostCommonAction: string;
  trendAcceptRate: number | null;
  trendRejectRate: number | null;
}

interface ConsentLogsResponse {
  logs: ConsentLog[];
  total: number;
  stats: ConsentLogStats;
}

const PAGE_SIZE = 50;

function getDateRange(range: DateRange): { dateFrom?: string; dateTo?: string } {
  if (range === "all") return {};
  const now = new Date();
  const from = new Date();
  if (range === "today") from.setHours(0, 0, 0, 0);
  if (range === "7days") from.setDate(from.getDate() - 7);
  if (range === "30days") from.setDate(from.getDate() - 30);
  return { dateFrom: from.toISOString(), dateTo: now.toISOString() };
}

function formatActionLabel(action: string): string {
  if (action === "accept_all") return "Accept all";
  if (action === "reject_all") return "Reject all";
  if (action === "custom") return "Custom choice";
  if (action === "dismissed") return "Dismissed";
  return action;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseConsentChoices(choices: string): string {
  try {
    const parsed = JSON.parse(choices);
    return Object.entries(parsed).map(([key, value]) => `${key}: ${value ? "Yes" : "No"}`).join(", ");
  } catch {
    return choices;
  }
}

export default function ConsentLogsPage() {
  const { selectedWebsite, websites, isLoading: websitesLoading } = useWebsite();
  const [page, setPage] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>("30days");
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(0);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(0);
  }, [selectedWebsite?.id]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) });
    const { dateFrom, dateTo } = getDateRange(dateRange);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (actionFilter !== "all") params.set("action", actionFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);
    return params.toString();
  }, [page, dateRange, actionFilter, debouncedSearch]);

  const { data, isLoading, error, refetch } = useQuery<ConsentLogsResponse>({
    queryKey: ["/api/websites", selectedWebsite?.id, "consent-logs", queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/websites/${selectedWebsite?.id}/consent-logs?${queryParams}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch consent logs");
      return response.json();
    },
    enabled: !!selectedWebsite?.id,
  });

  const exportLogs = () => {
    if (!selectedWebsite?.id) return;
    const { dateFrom, dateTo } = getDateRange(dateRange);
    const params = new URLSearchParams();
    if (dateFrom) params.set("startDate", dateFrom);
    if (dateTo) params.set("endDate", dateTo);
    window.open(`/api/websites/${selectedWebsite.id}/consent-logs/export?${params}`, "_blank");
  };

  if (websitesLoading) {
    return <DashboardLayout><div className="flex h-64 items-center justify-center"><ArrowsClockwise size={24} className="animate-spin text-muted-foreground" /></div></DashboardLayout>;
  }

  if (websites.length === 0 || !selectedWebsite) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeading domain={null} />
          <Card><CardContent className="flex flex-col items-center py-12 text-center"><WarningCircle size={48} className="mb-4 text-muted-foreground" /><p className="font-medium">Add a website to collect consent proof</p><p className="mt-1 text-sm text-muted-foreground">Records appear after visitors interact with an installed banner.</p></CardContent></Card>
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.stats;
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / PAGE_SIZE));
  const filtersActive = dateRange !== "all" || actionFilter !== "all" || !!debouncedSearch;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeading domain={selectedWebsite.domain} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}><ArrowsClockwise size={16} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />Refresh</Button>
            <Button onClick={exportLogs} disabled={!data?.logs.length}><DownloadSimple size={16} className="mr-2" />Export CSV</Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive bg-destructive/5"><CardContent className="flex items-center gap-3 py-4"><WarningCircle size={20} className="shrink-0 text-destructive" /><p className="text-sm text-destructive">Consent records could not be loaded.</p><Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">Retry</Button></CardContent></Card>
        )}

        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/20 p-3">
          <Select value={dateRange} onValueChange={(value) => { setDateRange(value as DateRange); setPage(0); }}>
            <SelectTrigger className="w-[160px] bg-background"><Clock size={14} className="mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="today">Today</SelectItem><SelectItem value="7days">Last 7 days</SelectItem><SelectItem value="30days">Last 30 days</SelectItem><SelectItem value="all">All time</SelectItem></SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={(value) => { setActionFilter(value); setPage(0); }}>
            <SelectTrigger className="w-[170px] bg-background"><Funnel size={14} className="mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All actions</SelectItem><SelectItem value="accept_all">Accept all</SelectItem><SelectItem value="reject_all">Reject all</SelectItem><SelectItem value="custom">Custom choice</SelectItem><SelectItem value="dismissed">Dismissed</SelectItem></SelectContent>
          </Select>
          <div className="relative min-w-[220px] flex-1 sm:max-w-[320px]"><MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search anonymized visitor ID" className="bg-background pl-9" /></div>
          {filtersActive && <Button variant="ghost" size="sm" onClick={() => { setDateRange("all"); setActionFilter("all"); setSearchQuery(""); setPage(0); }}>Clear filters</Button>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Accept rate" value={stats ? `${stats.acceptRate.toFixed(1)}%` : "—"} footer={<Trend trend={stats?.trendAcceptRate ?? null} />} />
          <StatCard title="Reject rate" value={stats ? `${stats.rejectRate.toFixed(1)}%` : "—"} footer={<Trend trend={stats?.trendRejectRate ?? null} />} />
          <StatCard title="Most common action" value={stats ? formatActionLabel(stats.mostCommonAction) : "—"} footer={<span>{stats?.totalRecords || 0} records in this view</span>} />
          <StatCard title="Decision mix" value={`${stats?.acceptCount || 0} accepted`} footer={<span>{stats?.rejectCount || 0} rejected · {stats?.customCount || 0} custom · {stats?.dismissedCount || 0} dismissed</span>} />
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText size={20} />Consent records</CardTitle><CardDescription>Timestamped, pseudonymized proof of each recorded consent decision for {selectedWebsite.domain}.</CardDescription></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12"><ArrowsClockwise size={24} className="animate-spin text-muted-foreground" /></div>
            ) : !data?.logs.length ? (
              <div className="py-12 text-center"><FileText size={44} className="mx-auto mb-3 text-muted-foreground/40" /><p className="font-medium">No consent records found</p><p className="mt-1 text-sm text-muted-foreground">{filtersActive ? "Try a wider date range or clear the filters." : "Records will appear after visitors interact with the banner."}</p></div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Visitor ID</TableHead><TableHead>Action</TableHead><TableHead>Consent choices</TableHead><TableHead>Location</TableHead><TableHead>Expires</TableHead></TableRow></TableHeader>
                    <TableBody>{data.logs.map((log) => { const choices = parseConsentChoices(log.consentChoices); return <TableRow key={log.id}><TableCell className="whitespace-nowrap tabular-nums">{formatDate(log.timestamp)}</TableCell><TableCell className="font-mono text-xs">{log.visitorId.slice(0, 12)}…</TableCell><TableCell><ActionBadge action={log.action} /></TableCell><TableCell className="max-w-[240px] truncate text-sm" title={choices}>{choices}</TableCell><TableCell>{log.country || "Unknown"}</TableCell><TableCell className="whitespace-nowrap text-muted-foreground">{log.expiresAt ? formatDate(log.expiresAt) : "—"}</TableCell></TableRow>; })}</TableBody>
                  </Table>
                </div>
                <div className="mt-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page === 0}>Previous</Button><Button variant="outline" size="sm" onClick={() => setPage((value) => value + 1)} disabled={page + 1 >= totalPages}>Next</Button></div></div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function PageHeading({ domain }: { domain: string | null }) {
  return <div><h1 className="text-2xl font-bold tracking-tight">Consent Proof Logs</h1><p className="text-muted-foreground">{domain ? `Audit-ready consent records for ${domain}.` : "View and export consent records."}</p></div>;
}

function StatCard({ title, value, footer }: { title: string; value: string; footer: React.ReactNode }) {
  return <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold tabular-nums">{value}</div><div className="mt-1 text-xs text-muted-foreground">{footer}</div></CardContent></Card>;
}

function Trend({ trend }: { trend: number | null }) {
  if (trend === null) return <span>No prior-period comparison</span>;
  if (Math.abs(trend) < 0.5) return <span className="inline-flex items-center gap-1"><Minus size={12} />Stable</span>;
  if (trend > 0) return <span className="inline-flex items-center gap-1 text-emerald-600"><TrendUp size={12} />+{trend.toFixed(1)} percentage points</span>;
  return <span className="inline-flex items-center gap-1 text-red-600"><TrendDown size={12} />{trend.toFixed(1)} percentage points</span>;
}

function ActionBadge({ action }: { action: string }) {
  if (action === "accept_all") return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"><CheckCircle size={12} className="mr-1" />Accept all</Badge>;
  if (action === "reject_all") return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"><XCircle size={12} className="mr-1" />Reject all</Badge>;
  if (action === "custom") return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"><SlidersHorizontal size={12} className="mr-1" />Custom</Badge>;
  if (action === "dismissed") return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"><Minus size={12} className="mr-1" />Dismissed</Badge>;
  return <Badge variant="outline">{formatActionLabel(action)}</Badge>;
}
