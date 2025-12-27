import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "./layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Clock, CheckCircle, XCircle, Settings2, RefreshCw, AlertCircle } from "lucide-react";
import type { Website, ConsentLog } from "@shared/schema";

export default function ConsentLogsPage() {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const limit = 50;

  const { data: websites, isLoading: websitesLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
  });

  const selectedWebsite = websites?.find((w) => w.id === selectedWebsiteId) || websites?.[0];

  const { data: logsData, isLoading: logsLoading, refetch } = useQuery<{ logs: ConsentLog[]; total: number }>({
    queryKey: ["/api/websites", selectedWebsite?.id, "consent-logs", { limit, offset: page * limit }],
    queryFn: async () => {
      if (!selectedWebsite?.id) return { logs: [], total: 0 };
      const res = await fetch(`/api/websites/${selectedWebsite.id}/consent-logs?limit=${limit}&offset=${page * limit}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
    enabled: !!selectedWebsite?.id,
  });

  const handleExport = () => {
    if (!selectedWebsite?.id) return;
    window.open(`/api/websites/${selectedWebsite.id}/consent-logs/export`, "_blank");
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
        return <Badge className="bg-green-100 text-green-800" data-testid={`badge-action-${action}`}><CheckCircle className="w-3 h-3 mr-1" /> Accept All</Badge>;
      case "reject_all":
        return <Badge className="bg-red-100 text-red-800" data-testid={`badge-action-${action}`}><XCircle className="w-3 h-3 mr-1" /> Reject All</Badge>;
      case "custom":
        return <Badge className="bg-blue-100 text-blue-800" data-testid={`badge-action-${action}`}><Settings2 className="w-3 h-3 mr-1" /> Custom</Badge>;
      default:
        return <Badge data-testid={`badge-action-${action}`}>{action}</Badge>;
    }
  };

  const parseConsentChoices = (choices: string) => {
    try {
      const parsed = JSON.parse(choices);
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${value ? "✓" : "✗"}`)
        .join(", ");
    } catch {
      return choices;
    }
  };

  if (websitesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
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
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
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
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} disabled={!logsData?.logs.length} data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-records">{logsData?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Showing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-showing">{logsData?.logs.length || 0} records</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-retention">1 year</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Consent Records
          </CardTitle>
          <CardDescription>
            Each record documents a visitor's consent decision with timestamp, anonymized identifier, and choices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !logsData?.logs.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No consent records yet.</p>
              <p className="text-sm mt-2">Records will appear here when visitors interact with your consent banner.</p>
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
                            <Clock className="w-4 h-4 text-muted-foreground" />
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
