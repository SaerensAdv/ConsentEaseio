import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "./layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, DotsThree, Globe, CheckCircle, WarningCircle, ArrowSquareOut, CodeBlock, Copy, Check, ArrowsClockwise, Sparkle, Pencil, Cookie, PaintBrush, ChartLine, Scroll, Eye, Trash } from "@phosphor-icons/react";
import { SetupChecklist } from "@/components/SetupChecklist";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { getPlanById } from "@shared/plans";

interface Website {
  id: string;
  publicId: string;
  domain: string;
  status: string;
  lastScan: string | null;
  cookiesFound: number | null;
  scriptsFound: number | null;
  createdAt: string;
}

interface LimitError {
  message: string;
  plan: string;
  limit: number;
}

interface WebsiteSummary {
  totalViews: number;
  acceptRate: number;
  rejectRate: number;
  totalLogs: number;
}

export default function DashboardWebsites() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [limitError, setLimitError] = useState<LimitError | null>(null);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [editDomain, setEditDomain] = useState("");
  const [deletingWebsite, setDeletingWebsite] = useState<Website | null>(null);
  const queryClient = useQueryClient();

  const { data: websites = [], isLoading, error } = useQuery<Website[]>({
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
    refetchInterval: (query) => {
      const data = query.state.data as Website[] | undefined;
      if (data?.some(w => w.status === 'scanning')) {
        return 3000;
      }
      return false;
    },
  });

  const { data: summaries } = useQuery<Record<string, WebsiteSummary>>({
    queryKey: ["/api/websites/summaries"],
    queryFn: async () => {
      const res = await fetch("/api/websites/summaries", { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
    enabled: websites.length > 0,
    refetchInterval: 60000,
  });

  const { data: user } = useQuery<{ plan: string }>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return { plan: 'solo' };
      return res.json();
    },
  });

  const { data: scanUsage } = useQuery<{
    cookieScans: { used: number; limit: number; unlimited: boolean };
    diagnosticScans: { used: number; limit: number; unlimited: boolean };
    plan: string;
  }>({
    queryKey: ["/api/scan-usage"],
    queryFn: async () => {
      const res = await fetch("/api/scan-usage", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: bannerConfigCheck } = useQuery<{
    primaryColor: string;
    heading: string;
  }>({
    queryKey: ["/api/websites", websites[0]?.id, "banner"],
    queryFn: async () => {
      const res = await fetch(`/api/websites/${websites[0]?.id}/banner`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: websites.length > 0,
  });

  const { data: analyticsCheck } = useQuery<{ totalViews: number }>({
    queryKey: ["/api/websites", websites[0]?.id, "analytics", { days: 30 }],
    queryFn: async () => {
      const res = await fetch(`/api/websites/${websites[0]?.id}/analytics?days=30`, { credentials: "include" });
      if (!res.ok) return { totalViews: 0 };
      return res.json();
    },
    enabled: websites.length > 0,
  });

  const hasBannerConfig = !!(bannerConfigCheck && (bannerConfigCheck.primaryColor !== '#726CEA' || bannerConfigCheck.heading !== 'We value your privacy'));
  const hasEmbedInstalled = !!(analyticsCheck && analyticsCheck.totalViews > 0);

  const scanningWebsite = websites.find(w => w.status === 'scanning');
  
  const { data: scanProgress } = useQuery<{
    scanning: boolean;
    phase?: string;
    pagesScanned?: number;
    totalPages?: number;
    currentUrl?: string;
  }>({
    queryKey: ["/api/websites", scanningWebsite?.id, "scan-progress"],
    queryFn: async () => {
      if (!scanningWebsite) return { scanning: false };
      const res = await fetch(`/api/websites/${scanningWebsite.id}/scan-progress`, { credentials: "include" });
      if (!res.ok) return { scanning: false };
      return res.json();
    },
    enabled: !!scanningWebsite,
    refetchInterval: scanningWebsite ? 2000 : false,
  });

  const addWebsiteMutation = useMutation({
    mutationFn: async (domain: string) => {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ domain }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 403 && errorData.error === "Website limit reached") {
          throw { isLimitError: true, ...errorData };
        }
        throw new Error(errorData.message || errorData.error || "Failed to add website");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      setNewDomain("");
      setIsAddDialogOpen(false);
      setLimitError(null);
      toast.success("Website added! Scanning for cookies...");
    },
    onError: (error: any) => {
      if (error.isLimitError) {
        setLimitError({
          message: error.message,
          plan: error.plan,
          limit: error.limit,
        });
      } else {
        toast.error(error.message || "Failed to add website");
      }
    },
  });

  const deleteWebsiteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/websites/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to remove website");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/websites/summaries"] });
      setDeletingWebsite(null);
      toast.success("Website removed");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const rescanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/websites/${id}/scan`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const err = new Error(errorData.message || "Failed to start scan") as any;
        err.status = res.status;
        err.data = errorData;
        throw err;
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scan-usage"] });
      toast.success("Scanning for cookies...");
    },
    onError: (error: any) => {
      if (error.status === 429) {
        toast.error(error.message || "Daily scan limit reached. Please upgrade your plan for more scans.");
      } else {
        toast.error(error.message || "Failed to start scan. Please try again.");
      }
    },
  });

  const updateDomainMutation = useMutation({
    mutationFn: async ({ id, domain }: { id: string; domain: string }) => {
      const res = await fetch(`/api/websites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ domain }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update domain");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      setEditingWebsite(null);
      setEditDomain("");
      toast.success("Domain updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getFullEmbedCode = (publicId: string) => {
    return `<!-- ConsentEase: Set default consent BEFORE Google Tag Manager -->
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'granted',
  'wait_for_update': 500
});
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', true);
</script>
<!-- ConsentEase: Load consent banner -->
<script src="https://consentease.io/api/consent/${publicId}/script.js" async></script>`;
  };

  const handleCopyFull = (publicId: string) => {
    navigator.clipboard.writeText(getFullEmbedCode(publicId));
    setCopied(true);
    toast.success("Full embed code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLastScan = (lastScan: string | null) => {
    if (!lastScan) return "Never";
    return formatDistanceToNow(new Date(lastScan), { addSuffix: true });
  };

  const planInfo = getPlanById(user?.plan || 'solo');

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-36 mb-1" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Failed to load websites. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Websites</h1>
          <p className="text-muted-foreground">Manage your domains and compliance status.</p>
          {scanUsage && (
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-xs text-muted-foreground" data-testid="text-cookie-scan-usage">
                {scanUsage.cookieScans.unlimited 
                  ? 'Unlimited cookie scans' 
                  : `${scanUsage.cookieScans.used}/${scanUsage.cookieScans.limit} cookie scans today`}
              </span>
              <span className="text-xs text-muted-foreground" data-testid="text-diagnostic-scan-usage">
                {scanUsage.diagnosticScans.unlimited 
                  ? 'Unlimited diagnostic scans' 
                  : `${scanUsage.diagnosticScans.used}/${scanUsage.diagnosticScans.limit} diagnostic scans today`}
              </span>
            </div>
          )}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setLimitError(null);
            setNewDomain("");
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20" data-testid="button-add-domain">
              <Plus size={16} />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Website</DialogTitle>
              <DialogDescription>
                Enter your domain name and we'll automatically scan it for cookies and scripts.
              </DialogDescription>
            </DialogHeader>
            
            {limitError && (
              <Alert variant="destructive" className="mt-4" data-testid="alert-limit-reached">
                <WarningCircle size={16} />
                <AlertTitle>Website limit reached</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-3">{limitError.message}</p>
                  <Button 
                    size="sm" 
                    className="gap-2" 
                    data-testid="button-upgrade-from-limit"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setLimitError(null);
                      setLocation('/dashboard/settings?upgrade=true');
                    }}
                  >
                    <Sparkle size={16} />
                    Upgrade Plan
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!limitError && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newDomain.trim()) {
                    addWebsiteMutation.mutate(newDomain.trim());
                  }
                }}
                className="space-y-4 mt-4"
              >
                <Input
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  data-testid="input-domain"
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={addWebsiteMutation.isPending || !newDomain.trim()}
                  data-testid="button-submit-domain"
                >
                  {addWebsiteMutation.isPending ? (
                    <>
                      <Spinner size={16} className="mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Website"
                  )}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <SetupChecklist
        hasWebsites={websites.length > 0}
        hasBannerConfig={hasBannerConfig}
        hasEmbedInstalled={hasEmbedInstalled}
      />

      <div className="space-y-4" data-tour="websites-list">
        {websites.map((site) => {
          const summary = summaries?.[site.id];
          return (
            <Card key={site.id} className="hover:shadow-md transition-shadow" data-testid={`card-website-${site.id}`}>
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex-shrink-0 flex items-center justify-center ${
                      site.status === 'compliant' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                        : site.status === 'scanning'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {site.status === 'scanning' ? (
                        <ArrowsClockwise size={20} className="animate-spin" />
                      ) : (
                        <Globe size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base sm:text-lg truncate" data-testid={`text-domain-${site.id}`}>{site.domain}</h3>
                        <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary flex-shrink-0">
                          <ArrowSquareOut size={14} />
                        </a>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1.5">
                          {site.status === 'compliant' ? (
                            <CheckCircle size={14} className="text-green-500" />
                          ) : site.status === 'scanning' ? (
                            <ArrowsClockwise size={14} className="text-blue-500 animate-spin" />
                          ) : (
                            <WarningCircle size={14} className="text-amber-500" />
                          )}
                          <span className="capitalize" data-testid={`text-status-${site.id}`}>{site.status}</span>
                        </span>
                        {site.status === 'scanning' && scanProgress?.scanning && scanningWebsite?.id === site.id ? (
                          <>
                            <span className="hidden sm:inline">·</span>
                            <span className="text-blue-600 dark:text-blue-400" data-testid={`text-scan-progress-${site.id}`}>
                              {scanProgress.phase}
                              {scanProgress.totalPages && scanProgress.totalPages > 1 
                                ? ` (${scanProgress.pagesScanned}/${scanProgress.totalPages} pages)` 
                                : ''}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">·</span>
                            <span>Scanned {formatLastScan(site.lastScan)}</span>
                          </>
                        )}
                        {site.cookiesFound !== null && (
                          <>
                            <span className="hidden sm:inline">·</span>
                            <span>{site.cookiesFound} cookies</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-start">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5" data-testid={`button-get-code-${site.id}`}>
                          <CodeBlock size={14} />
                          <span className="hidden sm:inline">Get Code</span>
                          <span className="sm:hidden">Code</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Install Consent Banner</DialogTitle>
                          <DialogDescription>
                            Place this code at the very top of your &lt;head&gt; — before Google Tag Manager or Google Analytics.
                          </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="html" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="html">HTML</TabsTrigger>
                            <TabsTrigger value="wordpress">WordPress</TabsTrigger>
                            <TabsTrigger value="shopify">Shopify</TabsTrigger>
                          </TabsList>
                          <TabsContent value="html" className="mt-4">
                            <div className="relative rounded-md bg-muted p-4 font-mono text-xs break-all max-h-64 overflow-y-auto">
                              <code className="text-muted-foreground whitespace-pre-wrap">{getFullEmbedCode(site.publicId)}</code>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 hover:bg-background"
                                onClick={() => handleCopyFull(site.publicId)}
                                data-testid={`button-copy-code-${site.id}`}
                              >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">For the full setup guide with Google Consent Mode v2, visit the <a href="/dashboard/embed" className="text-primary hover:underline">Embed page</a>.</p>
                          </TabsContent>
                          <TabsContent value="wordpress" className="mt-4 text-sm text-muted-foreground space-y-2">
                            <p className="font-medium text-foreground">Using Insert Headers and Footers plugin:</p>
                            <p>1. Install "Insert Headers and Footers" plugin by WPCode.</p>
                            <p>2. Go to Settings {'>'} Insert Headers and Footers.</p>
                            <p>3. Paste the full snippet in the "Scripts in Header" section:</p>
                            <div className="relative rounded-md bg-muted p-3 font-mono text-xs break-all mt-2 max-h-48 overflow-y-auto">
                              <code className="text-muted-foreground whitespace-pre-wrap">{getFullEmbedCode(site.publicId)}</code>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-1 right-1 hover:bg-background"
                                onClick={() => handleCopyFull(site.publicId)}
                              >
                                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                              </Button>
                            </div>
                            <p>4. Save changes.</p>
                          </TabsContent>
                           <TabsContent value="shopify" className="mt-4 text-sm text-muted-foreground space-y-2">
                            <p>1. Open Online Store {'>'} Themes.</p>
                            <p>2. Edit Code {'>'} theme.liquid.</p>
                            <p>3. Paste the full snippet before the closing &lt;/head&gt; tag.</p>
                            <div className="relative rounded-md bg-muted p-3 font-mono text-xs break-all mt-2 max-h-48 overflow-y-auto">
                              <code className="text-muted-foreground whitespace-pre-wrap">{getFullEmbedCode(site.publicId)}</code>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-1 right-1 hover:bg-background"
                                onClick={() => handleCopyFull(site.publicId)}
                              >
                                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                              </Button>
                            </div>
                            <p>4. Save changes.</p>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-menu-${site.id}`}>
                          <DotsThree size={16} weight="bold" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setEditingWebsite(site);
                            setEditDomain(site.domain);
                          }}
                          data-testid={`button-edit-domain-${site.id}`}
                        >
                          <Pencil size={16} className="mr-2" />
                          Edit Domain
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => rescanMutation.mutate(site.id)}
                          disabled={site.status === 'scanning' || (scanUsage && !scanUsage.cookieScans.unlimited && scanUsage.cookieScans.used >= scanUsage.cookieScans.limit)}
                          data-testid={`button-rescan-${site.id}`}
                        >
                          <ArrowsClockwise size={16} className="mr-2" />
                          {scanUsage && !scanUsage.cookieScans.unlimited && scanUsage.cookieScans.used >= scanUsage.cookieScans.limit
                            ? 'Scan limit reached'
                            : 'Re-scan Cookies'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setLocation(`/dashboard/policy?website=${site.id}`)}
                          data-testid={`button-generate-policy-${site.id}`}
                        >
                          <Sparkle size={16} className="mr-2" />
                          Generate Policies
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeletingWebsite(site)}
                          data-testid={`button-delete-${site.id}`}
                        >
                          <Trash size={16} className="mr-2" />
                          Remove Domain
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {summary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t">
                    <div className="text-center sm:text-left">
                      <p className="text-xs text-muted-foreground mb-0.5">Views (30d)</p>
                      <p className="text-sm font-semibold" data-testid={`text-views-${site.id}`}>{summary.totalViews.toLocaleString()}</p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs text-muted-foreground mb-0.5">Accept Rate</p>
                      <p className={`text-sm font-semibold ${summary.acceptRate >= 60 ? 'text-green-600 dark:text-green-400' : summary.acceptRate >= 30 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`} data-testid={`text-accept-rate-${site.id}`}>
                        {summary.totalViews > 0 ? `${summary.acceptRate.toFixed(1)}%` : '—'}
                      </p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs text-muted-foreground mb-0.5">Reject Rate</p>
                      <p className="text-sm font-semibold" data-testid={`text-reject-rate-${site.id}`}>
                        {summary.totalViews > 0 ? `${summary.rejectRate.toFixed(1)}%` : '—'}
                      </p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs text-muted-foreground mb-0.5">Consent Logs</p>
                      <p className="text-sm font-semibold" data-testid={`text-logs-${site.id}`}>{summary.totalLogs.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
                    onClick={() => setLocation(`/dashboard/banner?websiteId=${site.id}`)}
                    data-testid={`button-banner-${site.id}`}
                  >
                    <PaintBrush size={14} />
                    Banner
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
                    onClick={() => setLocation(`/dashboard/cookies?websiteId=${site.id}`)}
                    data-testid={`button-cookies-${site.id}`}
                  >
                    <Cookie size={14} />
                    Cookies
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
                    onClick={() => setLocation(`/dashboard/consent-logs?websiteId=${site.id}`)}
                    data-testid={`button-logs-${site.id}`}
                  >
                    <Scroll size={14} />
                    Logs
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
                    onClick={() => setLocation(`/dashboard/analytics?websiteId=${site.id}`)}
                    data-testid={`button-analytics-${site.id}`}
                  >
                    <ChartLine size={14} />
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {websites.length === 0 && (
          <div className="text-center py-16 bg-secondary/30 rounded-xl">
            <Globe size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No websites yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">Add your first domain to start managing cookie consent and GDPR compliance.</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2" data-testid="button-add-first-domain">
              <Plus size={16} />
              Add Your First Domain
            </Button>
          </div>
        )}

        {websites.length > 0 && (
          <button 
            onClick={() => setIsAddDialogOpen(true)}
            className="border-2 border-dashed border-border rounded-xl p-6 flex items-center justify-center text-center hover:border-primary/50 hover:bg-secondary/20 transition-all group gap-3"
            data-testid="button-add-another-domain"
          >
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={18} className="text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Add another domain</p>
              <p className="text-xs text-muted-foreground">
                {planInfo ? `${planInfo.name} plan — ${planInfo.websites} website${planInfo.websites !== 1 ? 's' : ''}` : 'Included in your plan'}
              </p>
            </div>
          </button>
        )}
      </div>

      <Dialog open={!!editingWebsite} onOpenChange={(open) => {
        if (!open) {
          setEditingWebsite(null);
          setEditDomain("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Domain</DialogTitle>
            <DialogDescription>
              Update the URL for this website. The embed code will remain the same.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingWebsite && editDomain.trim()) {
                updateDomainMutation.mutate({ id: editingWebsite.id, domain: editDomain.trim() });
              }
            }}
            className="space-y-4 mt-4"
          >
            <Input
              placeholder="example.com"
              value={editDomain}
              onChange={(e) => setEditDomain(e.target.value)}
              data-testid="input-edit-domain"
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingWebsite(null);
                  setEditDomain("");
                }}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateDomainMutation.isPending || !editDomain.trim() || editDomain.trim() === editingWebsite?.domain}
                data-testid="button-save-domain"
              >
                {updateDomainMutation.isPending ? (
                  <>
                    <Spinner size={16} className="mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingWebsite} onOpenChange={(open) => {
        if (!open) setDeletingWebsite(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Website</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-medium text-foreground">{deletingWebsite?.domain}</span>? This will delete all associated cookies, categories, consent logs, and analytics data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingWebsite(null)}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingWebsite) {
                  deleteWebsiteMutation.mutate(deletingWebsite.id);
                }
              }}
              disabled={deleteWebsiteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteWebsiteMutation.isPending ? (
                <>
                  <Spinner size={16} className="mr-2" />
                  Removing...
                </>
              ) : (
                "Remove Website"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
