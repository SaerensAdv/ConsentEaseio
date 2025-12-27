import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Shield, 
  Code2, 
  Loader2,
  AlertCircle,
  ExternalLink,
  Lightbulb
} from "lucide-react";
import type { Website, DiagnosticScan } from "@shared/schema";

export default function DiagnosticsPage() {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: websites, isLoading: websitesLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
  });

  const selectedWebsite = websites?.find((w) => w.id === selectedWebsiteId) || websites?.[0];

  const { data: latestScan, isLoading: scanLoading, refetch: refetchScan } = useQuery<DiagnosticScan | null>({
    queryKey: ["/api/websites", selectedWebsite?.id, "diagnostic-scan", "latest"],
    queryFn: async () => {
      if (!selectedWebsite?.id) return null;
      const res = await fetch(`/api/websites/${selectedWebsite.id}/diagnostic-scan/latest`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch scan");
      return res.json();
    },
    enabled: !!selectedWebsite?.id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.status === 'running') return 2000;
      return false;
    },
  });

  const runScanMutation = useMutation({
    mutationFn: async (websiteId: string) => {
      const res = await fetch(`/api/websites/${websiteId}/diagnostic-scan`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to start scan");
      return res.json();
    },
    onSuccess: () => {
      refetchScan();
    },
  });

  const handleRunScan = () => {
    if (selectedWebsite?.id) {
      runScanMutation.mutate(selectedWebsite.id);
    }
  };

  const parseJsonArray = (jsonString: string | null | undefined): string[] => {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Running</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCheckIcon = (value: boolean | null | undefined) => {
    if (value === true) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (value === false) return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  if (websitesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!websites || websites.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consent Mode Diagnostics</h1>
          <p className="text-muted-foreground">Verify your Google Consent Mode v2 implementation.</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No websites found. Add a website first to run diagnostics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const issues = parseJsonArray(latestScan?.issues);
  const recommendations = parseJsonArray(latestScan?.recommendations);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consent Mode Diagnostics</h1>
          <p className="text-muted-foreground">Verify your Google Consent Mode v2 implementation.</p>
        </div>
        <div className="flex gap-3">
          <Select
            value={selectedWebsite?.id || ""}
            onValueChange={(value) => {
              setSelectedWebsiteId(value);
            }}
          >
            <SelectTrigger className="w-[200px]" data-testid="select-website">
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
          <Button 
            onClick={handleRunScan} 
            disabled={runScanMutation.isPending || latestScan?.status === 'running'}
            data-testid="button-run-scan"
          >
            {runScanMutation.isPending || latestScan?.status === 'running' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Run Diagnostic Scan
              </>
            )}
          </Button>
        </div>
      </div>

      {latestScan?.status === 'running' && (
        <Alert>
          <Loader2 className="w-4 h-4 animate-spin" />
          <AlertTitle>Scan in progress</AlertTitle>
          <AlertDescription>
            We're analyzing your website for Consent Mode implementation. This usually takes 30-60 seconds.
          </AlertDescription>
        </Alert>
      )}

      {latestScan && latestScan.status !== 'running' && (
        <>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Last scan: {new Date(latestScan.scannedAt).toLocaleString()}</span>
            {getStatusBadge(latestScan.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">ConsentEase Banner</CardTitle>
                  {getCheckIcon(latestScan.bannerScriptDetected)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {latestScan.bannerScriptDetected 
                    ? "Banner script is installed correctly" 
                    : "Banner script not detected on your website"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Google Consent Mode</CardTitle>
                  {getCheckIcon(latestScan.consentModeDetected)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {latestScan.consentModeDetected 
                    ? `Consent Mode ${latestScan.consentModeVersion || ''} detected` 
                    : "Consent Mode not detected"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Default Consent Set</CardTitle>
                  {getCheckIcon(latestScan.defaultConsentSet)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {latestScan.defaultConsentSet 
                    ? "Default consent values are properly initialized" 
                    : "Default consent not set before GTM loads"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Consent Update</CardTitle>
                  {getCheckIcon(latestScan.updateConsentCalled)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {latestScan.updateConsentCalled 
                    ? "Consent updates are being sent correctly" 
                    : "No consent update detected (normal if no interaction yet)"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Google Tag Manager</CardTitle>
                  {getCheckIcon(latestScan.gtmDetected)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {latestScan.gtmDetected 
                    ? "GTM is installed on your website" 
                    : "GTM not detected (may not be needed)"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Google Analytics (gtag.js)</CardTitle>
                  {getCheckIcon(latestScan.gtagDetected)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {latestScan.gtagDetected 
                    ? "gtag.js is installed" 
                    : "gtag.js not detected"}
                </p>
              </CardContent>
            </Card>
          </div>

          {issues.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <XCircle className="w-5 h-5" />
                  Issues Found ({issues.length})
                </CardTitle>
                <CardDescription className="text-red-700">
                  These issues should be addressed for proper Consent Mode compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2 text-red-800">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {recommendations.length > 0 && (
            <Card className={issues.length > 0 ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${issues.length > 0 ? 'text-yellow-800' : 'text-green-800'}`}>
                  <Lightbulb className="w-5 h-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <li key={index} className={`flex items-start gap-2 ${issues.length > 0 ? 'text-yellow-800' : 'text-green-800'}`}>
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!latestScan && !scanLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No diagnostic scans yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Run a diagnostic scan to verify that your Google Consent Mode v2 implementation is working correctly.
            </p>
            <Button onClick={handleRunScan} disabled={runScanMutation.isPending} data-testid="button-first-scan">
              <Search className="w-4 h-4 mr-2" />
              Run First Scan
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            What We Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">ConsentEase Integration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Banner script is properly loaded</li>
                <li>• Consent banner appears on page</li>
                <li>• Script version is up to date</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Google Consent Mode v2</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Default consent is set before GTM</li>
                <li>• Consent updates are properly sent</li>
                <li>• All required consent types configured</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Script Loading Order</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ConsentEase loads before Google tags</li>
                <li>• dataLayer is properly initialized</li>
                <li>• No timing conflicts detected</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Compliance Signals</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ad_storage consent type</li>
                <li>• analytics_storage consent type</li>
                <li>• ad_user_data and ad_personalization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p>
          Need help implementing Consent Mode?{" "}
          <a 
            href="/docs" 
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            Read our documentation <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </div>
  );
}
