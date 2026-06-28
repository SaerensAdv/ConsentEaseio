import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "./layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DownloadSimple, FileText, Clock, CheckCircle, XCircle, SlidersHorizontal, ArrowsClockwise, WarningCircle, MagnifyingGlass, TrendUp, TrendDown, Minus, Funnel } from "@phosphor-icons/react"
import type { Website, ConsentLog } from "@shared/schema";

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
  previousPeriodAcceptRate: number | null;
  previousPeriodRejectRate: number | null;
  trendAcceptRate: number | null;
  trendRejectRate: number | null;
}

function getDateRange(range: DateRange): { dateFrom?: string; dateTo?: string } {
  if (range === "all") return {};
  const now = new Date();
  const dateTo = now.toISOString();
  const from = new Date();
  if (range === "today") {
    from.setHours(0, 0, 0, 0);
  } else if (range === "7days") {
    from.setDate(from.getDate() - 7);
  } else if (range === "30days") {
    from.setDate(from.getDate() - 30);
  }
  return { dateFrom: from.toISOString(), dateTo };
}

function formatActionLabel(action: string): string {
  switch (action) {
    case "accept_all": return "Accept All";
    case "reject_all": return "Reject All";
    case "custom": return "Custom";
    case "dismissed": return "Dismissed";
    default: return action;
  }
}

export default function ConsentLogsPage() {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('websiteId');
  });
  const [page, setPage] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>("30days");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const limit = 50;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    clearTimeout((window as any).__consentSearchTimeout);
    (window as any).__consentSearchTimeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
    }, 400);
  };

  const { data: websites, isLoading: websitesLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
  });

  const selectedWebsite = websites?.find((w) => w.id === selectedWebsiteId) || websites?.[0];

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(page * limit));
    const { dateFrom, dateTo } = getDateRange(dateRange);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (actionFilter !== "all") params.set("action", actionFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);
    return params.toString();
  }, [page, dateRange, actionFilter, debouncedSearch]);

  const { data: logsData, isLoading: logsLoading, error: logsError, refetch } = useQuery<{ logs: ConsentLog[]; total: number; stats: ConsentLogStats }>({
    queryKey: ["/api/websites", selectedWebsite?.id, "consent-logs", queryParams],
    queryFn: async () => {
      if (!selectedWebsite?.id) return { logs: [], total: 0, stats: { totalRecords: 0, acceptCount: 0, rejectCount: 0, customCount: 0, dismissedCount: 0, acceptRate: 0, rejectRate: 0, mostCommonAction: "none", previousPeriodAcceptRate: null, previousPeriodRejectRate: null, trendAcceptRate: null, trendRejectRate: null } };
      const res = await fetch(`/api/websites/${selectedWebsite.id}/consent-logs?${queryParams}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
    enabled: !!selectedWebsite?.id,
  });

  const stats = logsData?.stats;

  const handleExport = () => {
    if (!selectedWebsite?.id) return;
    const { dateFrom, dateTo } = getDateRange(dateRange);
    const params = new URLSearchParams();
    if (dateFrom) params.set("startDate", dateFrom);
    if (dateTo) params.set("endDate", dateTo);
    window.open(`/api/websites/${selectedWebsite.id}/consent-logs/export?${params.toString()}`, "_blank");
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "accept_all":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" data-testid={`badge-action-${action}`}><CheckCircle size={12} className="mr-1" /> Accept All</Badge>;
      case "reject_all":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" data-testid={`badge-action-${action}`}><XCircle size={12} className="mr-1" /> Reject All</Badge>;
      case "custom":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" data-testid={`badge-action-${action}`}><SlidersHorizontal size={12} className="mr-1" /> Custom</Badge>;
      case "dismissed":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" data-testid={`badge-action-${action}`}><Minus size={12} className="mr-1" /> Dismissed</Badge>;
      default:
        return <Badge data-testid={`badge-action-${action}`}>{action}</Badge>;
    }
  };

  const parseConsentChoices = (choices: string) => {
    try {
      const parsed = JSON.parse(choices);
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${value ? "Y" : "N"}`)
        .join(", ");
    } catch {
      return choices;
    }
  };

  const renderTrendIndicator = (trend: number | null) => {
    if (trend === null) return <span className="text-xs text-muted-foreground">No prior data</span>;
    if (Math.abs(trend) < 0.5) return <span className="flex items-center gap-1 text-xs text-muted-foreground"><Minus size={12} /> Stable</span>;
    if (trend > 0) return <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><TrendUp size={12} /> +{trend.toFixed(1)}pp</span>;
    return <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400"><TrendDown size={12} /> {trend.toFixed(1)}pp</span>;
  };

  if (websitesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <ArrowsClockwise size={24} className="animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!websites || websites.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Consent Proof Logs</h1>
            <p className="text-muted-foreground">View and export consent records for compliance documentation.</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <WarningCircle size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No websites found. Add a website first to view consent logs.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consent Proof Logs</h1>
          <p className="text-muted-foreground">View and export consent records for compliance documentation.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            value={selectedWebsite?.id || ""}
            onValueChange={(value) => {
              setSelectedWebsiteId(value);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-website">
              <SelectValue placeholder="Select website" />
            </SelectTrigger>
            <SelectContent>
              {websites.map((website) => (
                <SelectItem key={website.id} value={website.id} data-testid={`option-website-${website.id}`}>
                  {website.domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
            <ArrowsClockwise size={16} className="mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} disabled={!logsData?.logs.length} data-testid="button-export">
            <DownloadSimple size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {logsError && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <WarningCircle size={20} className="text-destructive shrink-0" />
            <p className="text-sm text-destructive" data-testid="text-logs-error">
              Failed to load consent logs. Please try refreshing.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto shrink-0" data-testid="button-retry-logs">
              <ArrowsClockwise size={14} className="mr-1" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <Select
          value={dateRange}
          onValueChange={(value) => {
            setDateRange(value as DateRange);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[160px]" data-testid="select-date-range">
            <Clock size={14} className="mr-2 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={actionFilter}
          onValueChange={(value) => {
            setActionFilter(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[160px]" data-testid="select-action-filter">
            <Funnel size={14} className="mr-2 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="accept_all">Accept All</SelectItem>
            <SelectItem value="reject_all">Reject All</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by visitor ID..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            data-testid="input-search-visitor"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accept Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-accept-rate">
              {stats ? `${stats.acceptRate.toFixed(1)}%` : "—"}
            </div>
            <div className="mt-1" data-testid="text-accept-trend">
              {stats ? renderTrendIndicator(stats.trendAcceptRate) : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reject Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-reject-rate">
              {stats ? `${stats.rejectRate.toFixed(1)}%` : "—"}
            </div>
            <div className="mt-1" data-testid="text-reject-trend">
              {stats ? renderTrendIndicator(stats.trendRejectRate) : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Common Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-most-common-action">
              {stats ? formatActionLabel(stats.mostCommonAction) : "—"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {stats && stats.totalRecords > 0 ? `${stats.totalRecords} total records` : "No data"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm" data-testid="text-action-breakdown">
              <span className="text-green-600 dark:text-green-400">{stats?.acceptCount ?? 0} accepted</span>
              <span className="text-red-600 dark:text-red-400">{stats?.rejectCount ?? 0} rejected</span>
              <span className="text-blue-600 dark:text-blue-400">{stats?.customCount ?? 0} custom</span>
              <span className="text-amber-600 dark:text-amber-400">{stats?.dismissedCount ?? 0} dismissed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Consent Records
          </CardTitle>
          <CardDescription>
            Each record documents a visitor's consent decision with timestamp, anonymized identifier, and choices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center py-12">
              <ArrowsClockwise size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : !logsData?.logs.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No consent records found.</p>
              <p className="text-sm mt-2">
                {debouncedSearch || actionFilter !== "all" || dateRange !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "Records will appear here when visitors interact with your consent banner."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Visitor ID</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Consent Choices</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsData.logs.map((log) => (
                      <TableRow key={log.id} data-testid={`row-consent-log-${log.id}`}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-muted-foreground" />
                            {formatDate(log.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{log.visitorId.substring(0, 12)}...</TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm" title={parseConsentChoices(log.consentChoices)}>
                          {parseConsentChoices(log.consentChoices)}
                        </TableCell>
                        <TableCell>{log.country || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {log.expiresAt ? formatDate(log.expiresAt) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page + 1} of {Math.ceil((logsData.total || 0) / limit)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    data-testid="button-prev-page"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={(page + 1) * limit >= (logsData.total || 0)}
                    data-testid="button-next-page"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
