import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "./layout";
import { useWebsite } from "@/contexts/WebsiteContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowsClockwise, CheckCircle, XCircle, Warning, MagnifyingGlass, Shield, CodeBlock, WarningCircle, ArrowSquareOut, Lightbulb } from "@phosphor-icons/react";
import type { DiagnosticScan } from "@shared/schema";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface DiagnosticCheck {
  title: string;
  value: boolean | null | undefined;
  success: string;
  failure: string;
}

export default function DiagnosticsPage() {
  const { selectedWebsite, websites, isLoading: websitesLoading } = useWebsite();

  const { data: latestScan, isLoading: scanLoading, error: scanError, refetch: refetchScan } = useQuery<DiagnosticScan | null>({
    queryKey: ["/api/websites", selectedWebsite?.id, "diagnostic-scan", "latest"],
    queryFn: async () => {
      if (!selectedWebsite?.id) return null;
      const res = await fetch(`/api/websites/${selectedWebsite.id}/diagnostic-scan/latest`, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch scan");
      return res.json();
    },
    enabled: !!selectedWebsite?.id,
    refetchInterval: (query) => query.state.data?.status === "running" ? 2000 : false,
  });

  const runScanMutation = useMutation({
    mutationFn: async (websiteId: string) => {
      const res = await fetch(`/api/websites/${websiteId}/diagnostic-scan`, { method: "POST", credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const error = new Error(data.message || "Failed to start scan") as Error & { status?: number };
        error.status = res.status;
        throw error;
      }
      return res.json();
    },
    onSuccess: () => refetchScan(),
    onError: (error: Error & { status?: number }) => {
      toast.error(error.status === 429
        ? error.message || "Daily diagnostic scan limit reached."
        : error.message || "Failed to start diagnostic scan.");
    },
  });

  const handleRunScan = () => {
    if (selectedWebsite?.id) runScanMutation.mutate(selectedWebsite.id);
  };

  const parseJsonArray = (value: string | null | undefined): string[] => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (websitesLoading) {
    return <DashboardLayout><div className="flex h-64 items-center justify-center"><ArrowsClockwise size={24} className="animate-spin text-muted-foreground" /></div></DashboardLayout>;
  }

  if (websites.length === 0 || !selectedWebsite) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeading domain={null} />
          <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center"><WarningCircle size={48} className="mb-4 text-muted-foreground" /><p className="font-medium">Add a website before running diagnostics</p><p className="mt-1 text-sm text-muted-foreground">The diagnostic checks need a live domain to inspect.</p></CardContent></Card>
        </div>
      </DashboardLayout>
    );
  }

  const issues = parseJsonArray(latestScan?.issues);
  const recommendations = parseJsonArray(latestScan?.recommendations);
  const isRunning = latestScan?.status === "running" || runScanMutation.isPending;

  const checks: DiagnosticCheck[] = latestScan ? [
    { title: "ConsentEase Banner", value: latestScan.bannerScriptDetected, success: "Banner script is installed correctly", failure: "Banner script was not detected" },
    { title: "Google Consent Mode", value: latestScan.consentModeDetected, success: `Consent Mode ${latestScan.consentModeVersion || "v2"} detected`, failure: "Consent Mode was not detected" },
    { title: "Default Consent", value: latestScan.defaultConsentSet, success: "Default consent is initialized before tags", failure: "Default consent is not set before GTM" },
    { title: "Consent Updates", value: latestScan.updateConsentCalled, success: "Consent updates are being sent", failure: "No consent update was detected yet" },
    { title: "Google Tag Manager", value: latestScan.gtmDetected, success: "Google Tag Manager is installed", failure: "GTM was not detected (it may not be needed)" },
    { title: "Google Analytics", value: latestScan.gtagDetected, success: "gtag.js is installed", failure: "gtag.js was not detected" },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeading domain={selectedWebsite.domain} />
          <Button onClick={handleRunScan} disabled={isRunning} data-testid="button-run-scan">
            {isRunning ? <><Spinner size={16} className="mr-2" />Scanning...</> : <><MagnifyingGlass size={16} className="mr-2" />Run diagnostic scan</>}
          </Button>
        </div>

        {scanError && (
          <Alert variant="destructive"><WarningCircle size={16} /><AlertTitle>Diagnostics unavailable</AlertTitle><AlertDescription className="flex items-center justify-between gap-3">We could not load the latest scan.<Button variant="outline" size="sm" onClick={() => refetchScan()}>Retry</Button></AlertDescription></Alert>
        )}

        {latestScan?.status === "running" && (
          <Alert><Spinner size={16} /><AlertTitle>Scan in progress</AlertTitle><AlertDescription>We are checking {selectedWebsite.domain}. This usually takes 30 to 60 seconds.</AlertDescription></Alert>
        )}

        {latestScan && latestScan.status !== "running" && (
          <>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>Last scan: {new Date(latestScan.scannedAt).toLocaleString()}</span>
              <ScanStatusBadge status={latestScan.status} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {checks.map((check) => <CheckCard key={check.title} check={check} />)}
            </div>

            {issues.length > 0 && (
              <Card className="border-red-200 bg-red-50/70 dark:border-red-900/60 dark:bg-red-950/20">
                <CardHeader><CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-300"><XCircle size={20} />Fix these issues ({issues.length})</CardTitle><CardDescription className="text-red-700 dark:text-red-400">These items can prevent reliable Consent Mode behavior.</CardDescription></CardHeader>
                <CardContent><ul className="space-y-2">{issues.map((issue, index) => <li key={`${issue}-${index}`} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300"><Warning size={16} className="mt-0.5 shrink-0" /><span>{issue}</span></li>)}</ul></CardContent>
              </Card>
            )}

            {recommendations.length > 0 && (
              <Card className={issues.length > 0 ? "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20" : "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20"}>
                <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb size={20} />Recommended next steps</CardTitle></CardHeader>
                <CardContent><ul className="space-y-2">{recommendations.map((recommendation, index) => <li key={`${recommendation}-${index}`} className="flex items-start gap-2 text-sm"><CheckCircle size={16} className="mt-0.5 shrink-0 text-emerald-600" /><span>{recommendation}</span></li>)}</ul></CardContent>
              </Card>
            )}
          </>
        )}

        {!latestScan && !scanLoading && !scanError && (
          <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center"><Shield size={56} className="mb-4 text-muted-foreground" /><h3 className="text-lg font-semibold">No diagnostic scan yet</h3><p className="mt-2 max-w-md text-sm text-muted-foreground">Run the first scan to verify banner installation, tag order, and Google Consent Mode v2.</p><Button className="mt-6" onClick={handleRunScan} disabled={isRunning}><MagnifyingGlass size={16} className="mr-2" />Run first scan</Button></CardContent></Card>
        )}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CodeBlock size={20} />What we check</CardTitle><CardDescription>Implementation signals, not legal guarantees.</CardDescription></CardHeader>
          <CardContent className="grid gap-5 text-sm md:grid-cols-2">
            <CheckList title="ConsentEase integration" items={["Banner script loads", "Banner can render", "Current script version responds"]} />
            <CheckList title="Google Consent Mode v2" items={["Defaults run before Google tags", "Required consent types exist", "Updates fire after a visitor choice"]} />
            <CheckList title="Script order" items={["ConsentEase precedes tracking", "dataLayer is initialized", "No obvious timing conflict appears"]} />
            <CheckList title="Compliance signals" items={["ad_storage", "analytics_storage", "ad_user_data and ad_personalization"]} />
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">Need implementation help? <a href="/docs" className="inline-flex items-center gap-1 text-primary hover:underline">Read the documentation <ArrowSquareOut size={12} /></a></p>
      </div>
    </DashboardLayout>
  );
}

function PageHeading({ domain }: { domain: string | null }) {
  return <div><h1 className="text-2xl font-bold tracking-tight">Consent Mode Diagnostics</h1><p className="text-muted-foreground">{domain ? `Verify the live implementation on ${domain}.` : "Verify your Google Consent Mode v2 implementation."}</p></div>;
}

function ScanStatusBadge({ status }: { status: string }) {
  if (status === "completed") return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"><CheckCircle size={12} className="mr-1" />Scan complete</Badge>;
  if (status === "failed") return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"><XCircle size={12} className="mr-1" />Scan failed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function CheckCard({ check }: { check: DiagnosticCheck }) {
  const icon = check.value === true ? <CheckCircle size={20} className="text-emerald-600" /> : check.value === false ? <XCircle size={20} className="text-red-500" /> : <Warning size={20} className="text-amber-500" />;
  return <Card><CardHeader className="pb-2"><div className="flex items-center justify-between gap-3"><CardTitle className="text-sm font-medium">{check.title}</CardTitle>{icon}</div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{check.value ? check.success : check.failure}</p></CardContent></Card>;
}

function CheckList({ title, items }: { title: string; items: string[] }) {
  return <div><h4 className="font-medium">{title}</h4><ul className="mt-2 space-y-1 text-muted-foreground">{items.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">•</span><span>{item}</span></li>)}</ul></div>;
}
