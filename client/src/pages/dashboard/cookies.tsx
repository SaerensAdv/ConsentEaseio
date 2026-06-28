import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "./layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash, Cookie, Shield, ChartBar, Megaphone, Wrench, Globe, Lock, Info, ArrowsClockwise, Clock, CheckCircle, Robot, LinkSimple, Warning, ShieldCheck, ShieldWarning, XCircle, ArrowSquareOut, WifiSlash, Timer } from "@phosphor-icons/react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface Website {
  id: string;
  domain: string;
  publicId: string;
  status: string;
  lastScan: string | null;
  cookiesFound: number | null;
}

interface CookieCategory {
  id: string;
  websiteId: string;
  name: string;
  displayName: string;
  description: string;
  isRequired: boolean;
  isEnabled: boolean;
  sortOrder: number;
}

interface CookieItem {
  id: string;
  websiteId: string;
  categoryId: string;
  name: string;
  provider: string | null;
  purpose: string;
  expiry: string | null;
  type: string;
  isAutoDetected: boolean;
  sourceUrl: string | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
  necessary: <Shield size={16} />,
  functional: <Wrench size={16} />,
  analytics: <ChartBar size={16} />,
  marketing: <Megaphone size={16} />,
};

export default function CookiesPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('websiteId');
  });
  const [isAddCookieOpen, setIsAddCookieOpen] = useState(false);
  const [isEditCookieOpen, setIsEditCookieOpen] = useState(false);
  const [editingCookie, setEditingCookie] = useState<CookieItem | null>(null);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CookieCategory | null>(null);
  const [deletingCookieId, setDeletingCookieId] = useState<string | null>(null);
  const [showScanSummary, setShowScanSummary] = useState(false);
  const wasScanningRef = useRef(false);
  const scanEndTimeRef = useRef<number | null>(null);

  const [newCookie, setNewCookie] = useState({
    name: "",
    provider: "",
    purpose: "",
    expiry: "",
    type: "first-party",
    categoryId: "",
  });

  const { data: websites = [], isLoading: websitesLoading } = useQuery<Website[]>({
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

  const activeWebsiteId = selectedWebsiteId || websites[0]?.id;
  const activeWebsite = websites.find(w => w.id === activeWebsiteId);
  const isScanning = activeWebsite?.status === 'scanning';

  const [scanError, setScanError] = useState<{
    error: string;
    errorType: string;
    suggestions: string[];
  } | null>(null);

  const { data: scanProgress } = useQuery<{
    scanning: boolean;
    failed?: boolean;
    phase?: string;
    pagesScanned?: number;
    totalPages?: number;
    currentUrl?: string;
    error?: string;
    errorType?: string;
    suggestions?: string[];
  }>({
    queryKey: ["/api/websites", activeWebsiteId, "scan-progress"],
    queryFn: async () => {
      if (!activeWebsiteId) return { scanning: false };
      const res = await fetch(`/api/websites/${activeWebsiteId}/scan-progress`, { credentials: "include" });
      if (!res.ok) return { scanning: false };
      return res.json();
    },
    enabled: !!activeWebsiteId && (isScanning || (scanEndTimeRef.current !== null && Date.now() - scanEndTimeRef.current < 5000)),
    refetchInterval: isScanning ? 2000 : ((scanEndTimeRef.current !== null && Date.now() - scanEndTimeRef.current < 5000) ? 1000 : false),
  });

  const rescanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/websites/${id}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setScanError(null);
      toast.success("Scanning for cookies...");
    },
    onError: (error: any) => {
      if (error.status === 429) {
        const canUpgrade = error.data?.canUpgrade;
        const upgradePlan = error.data?.upgradePlan;
        if (canUpgrade && upgradePlan) {
          setScanError({
            error: error.message || `You've reached your daily scan limit.`,
            errorType: 'rate_limit',
            suggestions: [
              `Your current plan has reached its daily scan limit`,
              `Upgrade to ${upgradePlan} for more daily scans`,
              `Your scan limit resets at midnight`,
            ],
          });
        }
        toast.error(error.message || "Daily scan limit reached.");
      } else {
        toast.error(error.message || "Could not start the scan. Please try again.");
      }
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<CookieCategory[]>({
    queryKey: ["/api/websites", activeWebsiteId, "cookie-categories"],
    queryFn: async () => {
      if (!activeWebsiteId) return [];
      const res = await fetch(`/api/websites/${activeWebsiteId}/cookie-categories`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    enabled: !!activeWebsiteId,
  });

  const { data: cookies = [], isLoading: cookiesLoading } = useQuery<CookieItem[]>({
    queryKey: ["/api/websites", activeWebsiteId, "cookies"],
    queryFn: async () => {
      if (!activeWebsiteId) return [];
      const res = await fetch(`/api/websites/${activeWebsiteId}/cookies`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cookies");
      return res.json();
    },
    enabled: !!activeWebsiteId,
    refetchInterval: isScanning ? 3000 : false,
  });

  const createCookieMutation = useMutation({
    mutationFn: async (data: typeof newCookie) => {
      const res = await fetch(`/api/websites/${activeWebsiteId}/cookies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create cookie");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites", activeWebsiteId, "cookies"] });
      setIsAddCookieOpen(false);
      setNewCookie({ name: "", provider: "", purpose: "", expiry: "", type: "first-party", categoryId: "" });
      toast.success("Cookie added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateCookieMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CookieItem> & { id: string }) => {
      const res = await fetch(`/api/cookies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update cookie");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites", activeWebsiteId, "cookies"] });
      setIsEditCookieOpen(false);
      setEditingCookie(null);
      toast.success("Cookie updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteCookieMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cookies/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete cookie");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites", activeWebsiteId, "cookies"] });
      toast.success("Cookie deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CookieCategory> & { id: string }) => {
      const res = await fetch(`/api/cookie-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update category");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites", activeWebsiteId, "cookie-categories"] });
      setIsEditCategoryOpen(false);
      setEditingCategory(null);
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddCookie = () => {
    if (!newCookie.name || !newCookie.purpose || !newCookie.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }
    createCookieMutation.mutate(newCookie);
  };

  const handleUpdateCookie = () => {
    if (!editingCookie) return;
    updateCookieMutation.mutate(editingCookie);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    updateCategoryMutation.mutate(editingCategory);
  };

  const getCookiesForCategory = (categoryId: string) => {
    return cookies.filter((c) => c.categoryId === categoryId);
  };

  useEffect(() => {
    if (isScanning) {
      wasScanningRef.current = true;
      scanEndTimeRef.current = null;
      setScanError(null);
    } else if (wasScanningRef.current && !isScanning) {
      wasScanningRef.current = false;
      scanEndTimeRef.current = Date.now();
      const timer = setTimeout(() => {
        const progress = scanProgress;
        if (progress?.failed && progress.error) {
          setScanError({
            error: progress.error,
            errorType: progress.errorType || 'unknown',
            suggestions: progress.suggestions || [],
          });
        } else {
          setShowScanSummary(true);
        }
        scanEndTimeRef.current = null;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isScanning, scanProgress]);

  useEffect(() => {
    if (scanProgress?.failed && scanProgress.error && !isScanning) {
      setScanError({
        error: scanProgress.error,
        errorType: scanProgress.errorType || 'unknown',
        suggestions: scanProgress.suggestions || [],
      });
    }
  }, [scanProgress, isScanning]);

  const formatLastScan = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const categoryColors: Record<string, string> = {
    necessary: "bg-emerald-500",
    functional: "bg-blue-500",
    analytics: "bg-amber-500",
    marketing: "bg-rose-500",
  };

  const getCategoryBreakdown = () => {
    return categories.map((cat) => {
      const count = getCookiesForCategory(cat.id).length;
      return {
        id: cat.id,
        name: cat.name,
        displayName: cat.displayName,
        count,
        percentage: cookies.length > 0 ? Math.round((count / cookies.length) * 100) : 0,
      };
    }).filter(c => c.count > 0);
  };

  const getComplianceScore = () => {
    const checks: { label: string; passed: boolean; weight: number }[] = [];

    const allCategorized = cookies.length > 0 && cookies.every(c => c.categoryId);
    checks.push({ label: "All cookies categorized", passed: allCategorized, weight: 25 });

    const hasPurpose = cookies.length > 0 && cookies.every(c => c.purpose && c.purpose.trim().length > 0);
    checks.push({ label: "All cookies have a purpose description", passed: hasPurpose, weight: 20 });

    const hasNecessaryCategory = categories.some(c => c.name === 'necessary' && c.isEnabled);
    checks.push({ label: "Necessary cookies category enabled", passed: hasNecessaryCategory, weight: 15 });

    const nonRequiredConfigured = categories.filter(c => !c.isRequired).length > 0
      ? categories.filter(c => !c.isRequired).every(c => c.description && c.description.trim().length > 5)
      : true;
    checks.push({ label: "Category descriptions configured", passed: nonRequiredConfigured, weight: 15 });

    let recentlyScanStatus = false;
    if (activeWebsite?.lastScan) {
      const lastScanDate = new Date(activeWebsite.lastScan);
      const daysSinceScan = (Date.now() - lastScanDate.getTime()) / (1000 * 60 * 60 * 24);
      recentlyScanStatus = daysSinceScan <= 30;
    }
    checks.push({ label: "Scanned within last 30 days", passed: recentlyScanStatus, weight: 15 });

    const hasMultipleCategories = getCategoryBreakdown().length >= 2;
    checks.push({ label: "Cookies spread across categories", passed: hasMultipleCategories, weight: 10 });

    const score = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0);

    return { score, checks };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 80) return "[&>div]:bg-emerald-500";
    if (score >= 50) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-rose-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Good";
    if (score >= 50) return "Needs Improvement";
    return "At Risk";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <ShieldCheck size={24} className="text-emerald-500" />;
    if (score >= 50) return <ShieldWarning size={24} className="text-amber-500" />;
    return <Warning size={24} className="text-rose-500" />;
  };

  if (websitesLoading || categoriesLoading || cookiesLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-52 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (websites.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Globe size={48} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No websites yet</h2>
          <p className="text-muted-foreground mb-4">Add a website first to manage its cookies.</p>
          <Button onClick={() => setLocation("/dashboard")} data-testid="button-go-to-websites">
            Go to Websites
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" data-tour="cookie-categories">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold" data-testid="text-page-title">Cookie Management</h1>
            <p className="text-muted-foreground">
              Manage cookie categories and individual cookies for your consent banner.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={activeWebsiteId || ""} onValueChange={setSelectedWebsiteId}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-website">
                <SelectValue placeholder="Select website" />
              </SelectTrigger>
              <SelectContent>
                {websites.map((site) => (
                  <SelectItem key={site.id} value={site.id} data-testid={`option-website-${site.id}`}>
                    <span className="flex items-center gap-2">
                      {site.domain}
                      {site.lastScan && (
                        <span className="text-xs text-muted-foreground">
                          {formatLastScan(site.lastScan)}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => activeWebsiteId && rescanMutation.mutate(activeWebsiteId)}
              disabled={isScanning || !activeWebsiteId || (scanUsage != null && !scanUsage.cookieScans.unlimited && scanUsage.cookieScans.used >= scanUsage.cookieScans.limit)}
              data-testid="button-rescan-cookies"
            >
              <ArrowsClockwise size={16} className={`mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning 
                ? (scanProgress?.scanning ? scanProgress.phase : 'Scanning...') 
                : (scanUsage && !scanUsage.cookieScans.unlimited && scanUsage.cookieScans.used >= scanUsage.cookieScans.limit
                  ? 'Scan limit reached'
                  : 'Scan Cookies')}
            </Button>

            <Dialog open={isAddCookieOpen} onOpenChange={setIsAddCookieOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-cookie">
                  <Plus size={16} className="mr-2" />
                  Add Cookie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Cookie</DialogTitle>
                  <DialogDescription>
                    Add a cookie that your website uses. This will be shown to visitors in the consent preferences.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={newCookie.categoryId}
                      onValueChange={(v) => setNewCookie({ ...newCookie, categoryId: v })}
                    >
                      <SelectTrigger data-testid="select-cookie-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cookie Name *</Label>
                    <Input
                      placeholder="e.g., _ga"
                      value={newCookie.name}
                      onChange={(e) => setNewCookie({ ...newCookie, name: e.target.value })}
                      data-testid="input-cookie-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Input
                      placeholder="e.g., Google Analytics"
                      value={newCookie.provider}
                      onChange={(e) => setNewCookie({ ...newCookie, provider: e.target.value })}
                      data-testid="input-cookie-provider"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Purpose *</Label>
                    <Textarea
                      placeholder="Describe what this cookie is used for..."
                      value={newCookie.purpose}
                      onChange={(e) => setNewCookie({ ...newCookie, purpose: e.target.value })}
                      data-testid="input-cookie-purpose"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry</Label>
                      <Input
                        placeholder="e.g., 2 years"
                        value={newCookie.expiry}
                        onChange={(e) => setNewCookie({ ...newCookie, expiry: e.target.value })}
                        data-testid="input-cookie-expiry"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newCookie.type}
                        onValueChange={(v) => setNewCookie({ ...newCookie, type: v })}
                      >
                        <SelectTrigger data-testid="select-cookie-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first-party">First-party</SelectItem>
                          <SelectItem value="third-party">Third-party</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddCookieOpen(false)}
                    data-testid="button-cancel-cookie"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddCookie}
                    disabled={createCookieMutation.isPending}
                    data-testid="button-save-cookie"
                  >
                    {createCookieMutation.isPending && <Spinner size={16} className="mr-2" />}
                    Add Cookie
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {isScanning && scanProgress?.scanning && (
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400" data-testid="text-scan-progress">
              <Spinner size={12} />
              <span>{scanProgress.phase}{scanProgress.totalPages && scanProgress.totalPages > 1 ? ` (${scanProgress.pagesScanned}/${scanProgress.totalPages} pages)` : ''}</span>
            </div>
          )}
          {scanUsage && !isScanning && (
            <p className="text-xs text-muted-foreground" data-testid="text-scan-usage">
              {scanUsage.cookieScans.unlimited 
                ? 'Unlimited cookie scans available' 
                : `${scanUsage.cookieScans.used}/${scanUsage.cookieScans.limit} cookie scans used today`}
            </p>
          )}
        </div>

        {activeWebsite?.lastScan && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-last-scanned">
            <Clock size={14} />
            <span>Last scanned: {formatLastScan(activeWebsite.lastScan)}</span>
            {activeWebsite.cookiesFound !== null && (
              <span>({activeWebsite.cookiesFound} cookies found)</span>
            )}
          </div>
        )}

        {scanError && !isScanning && (
          <Card className="border-destructive/50" data-testid="card-scan-error">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                {scanError.errorType === 'rate_limit' ? (
                  <Timer size={18} className="text-amber-500" />
                ) : scanError.errorType === 'security_block' ? (
                  <ShieldWarning size={18} className="text-amber-500" />
                ) : scanError.errorType === 'domain_not_found' || scanError.errorType === 'connection_refused' ? (
                  <WifiSlash size={18} className="text-destructive" />
                ) : (
                  <XCircle size={18} className="text-destructive" />
                )}
                {scanError.errorType === 'rate_limit' ? 'Scan Limit Reached' : scanError.errorType === 'security_block' ? 'Website Blocked Our Scanner' : 'Scan Failed'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScanError(null)}
                data-testid="button-dismiss-error"
              >
                Dismiss
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground" data-testid="text-scan-error-message">
                {scanError.error}
              </p>

              {scanError.suggestions.length > 0 && (
                <div className="space-y-2" data-testid="list-scan-suggestions">
                  <p className="text-xs font-medium text-muted-foreground">
                    {scanError.errorType === 'rate_limit' ? 'What you can do:' : 'Suggestions:'}
                  </p>
                  <ul className="space-y-1">
                    {scanError.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {scanError.errorType !== 'rate_limit' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setScanError(null);
                      if (activeWebsiteId) rescanMutation.mutate(activeWebsiteId);
                    }}
                    disabled={rescanMutation.isPending}
                    data-testid="button-retry-scan"
                  >
                    <ArrowsClockwise size={14} className={`mr-2 ${rescanMutation.isPending ? 'animate-spin' : ''}`} />
                    Try Again
                  </Button>
                )}
                {scanError.errorType === 'rate_limit' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      window.location.href = '/pricing';
                    }}
                    data-testid="button-upgrade-plan"
                  >
                    <ArrowSquareOut size={14} className="mr-2" />
                    View Plans
                  </Button>
                )}
                {(scanError.errorType === 'domain_not_found' || scanError.errorType === 'connection_refused' || scanError.errorType === 'http_error') && activeWebsite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.open(`https://${activeWebsite.domain}`, '_blank');
                    }}
                    data-testid="button-check-website"
                  >
                    <Globe size={14} className="mr-2" />
                    Check Website
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {cookies.length > 0 && !isScanning && (() => {
          const { score, checks } = getComplianceScore();
          return (
            <Card data-testid="card-compliance-score">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {getScoreIcon(score)}
                  Compliance Score
                </CardTitle>
                <Badge
                  variant={score >= 80 ? "secondary" : "outline"}
                  className={`text-xs ${getScoreColor(score)}`}
                  data-testid="badge-compliance-label"
                >
                  {getScoreLabel(score)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <span className={`text-3xl font-bold ${getScoreColor(score)}`} data-testid="text-compliance-score">
                    {score}%
                  </span>
                  <div className="flex-1">
                    <Progress value={score} className={`h-2.5 ${getScoreProgressColor(score)}`} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {checks.map((check) => (
                    <div key={check.label} className="flex items-center gap-2 text-sm" data-testid={`check-${check.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {check.passed ? (
                        <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Warning size={16} className="text-muted-foreground shrink-0" />
                      )}
                      <span className={check.passed ? "text-foreground" : "text-muted-foreground"}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {(showScanSummary || cookies.length > 0) && !isScanning && (
          <Card data-testid="card-scan-summary">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle size={18} className="text-emerald-500" />
                Scan Summary
              </CardTitle>
              {showScanSummary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowScanSummary(false)}
                  data-testid="button-dismiss-summary"
                >
                  Dismiss
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center" data-testid="stat-total-cookies">
                  <div className="text-2xl font-bold">{cookies.length}</div>
                  <div className="text-xs text-muted-foreground">Total Cookies</div>
                </div>
                <div className="text-center" data-testid="stat-categories-used">
                  <div className="text-2xl font-bold">{getCategoryBreakdown().length}</div>
                  <div className="text-xs text-muted-foreground">Categories</div>
                </div>
                <div className="text-center" data-testid="stat-first-party">
                  <div className="text-2xl font-bold">{cookies.filter(c => c.type === 'first-party').length}</div>
                  <div className="text-xs text-muted-foreground">First-party</div>
                </div>
                <div className="text-center" data-testid="stat-third-party">
                  <div className="text-2xl font-bold">{cookies.filter(c => c.type === 'third-party').length}</div>
                  <div className="text-xs text-muted-foreground">Third-party</div>
                </div>
              </div>

              {getCategoryBreakdown().length > 0 && (
                <div className="space-y-3" data-testid="breakdown-categories">
                  <div className="text-sm font-medium text-muted-foreground">Category Distribution</div>
                  <div className="flex h-3 rounded-full overflow-hidden">
                    {getCategoryBreakdown().map((cat) => (
                      <div
                        key={cat.id}
                        className={`${categoryColors[cat.name] || 'bg-muted-foreground'} transition-all`}
                        style={{ width: `${cat.percentage}%` }}
                        title={`${cat.displayName}: ${cat.count} cookies (${cat.percentage}%)`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {getCategoryBreakdown().map((cat) => (
                      <div key={cat.id} className="flex items-center gap-2 text-sm">
                        <div className={`w-2.5 h-2.5 rounded-full ${categoryColors[cat.name] || 'bg-muted-foreground'}`} />
                        <span className="text-muted-foreground">{cat.displayName}</span>
                        <span className="font-medium">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie size={20} />
              Cookie Categories
            </CardTitle>
            <CardDescription>
              Configure which cookie categories are shown to visitors and customize their descriptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2">
              {categories.map((category) => {
                const categoryCookies = getCookiesForCategory(category.id);
                return (
                  <AccordionItem
                    key={category.id}
                    value={category.id}
                    className="border rounded-lg px-4"
                  >
                    <div className="flex items-center py-4">
                      <AccordionTrigger className="hover:no-underline flex-1 [&>svg]:ml-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {categoryIcons[category.name] || <Cookie size={16} />}
                          </div>
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{category.displayName}</span>
                              {category.isRequired && (
                                <Badge variant="secondary" className="text-xs">
                                  <Lock size={12} className="mr-1" />
                                  Required
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {categoryCookies.length} cookie{categoryCookies.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={category.isEnabled}
                          disabled={category.isRequired}
                          onCheckedChange={(checked) => {
                            updateCategoryMutation.mutate({ id: category.id, isEnabled: checked });
                          }}
                          data-testid={`switch-category-${category.id}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCategory(category);
                            setIsEditCategoryOpen(true);
                          }}
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          <Pencil size={16} />
                        </Button>
                      </div>
                    </div>
                    <AccordionContent>
                      <div className="pt-2 pb-4 space-y-3">
                        {categoryCookies.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            <Info size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No cookies in this category yet.</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setNewCookie({ ...newCookie, categoryId: category.id });
                                setIsAddCookieOpen(true);
                              }}
                              data-testid={`button-add-cookie-to-${category.id}`}
                            >
                              <Plus size={16} className="mr-1" />
                              Add Cookie
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {categoryCookies.map((cookie) => (
                              <div
                                key={cookie.id}
                                className="flex items-start justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary/80 transition-colors duration-200"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <code className="text-sm font-mono bg-background px-2 py-0.5 rounded">
                                      {cookie.name}
                                    </code>
                                    {cookie.provider && (
                                      <span className="text-xs text-muted-foreground">
                                        by {cookie.provider}
                                      </span>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {cookie.type}
                                    </Badge>
                                    {cookie.isAutoDetected && (
                                      <Badge variant="secondary" className="text-xs" data-testid={`badge-auto-detected-${cookie.id}`}>
                                        <Robot size={12} className="mr-1" />
                                        Auto-detected
                                      </Badge>
                                    )}
                                    {cookie.expiry && (
                                      <span className="text-xs text-muted-foreground">
                                        {cookie.expiry}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{cookie.purpose}</p>
                                  {cookie.sourceUrl && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-source-url-${cookie.id}`}>
                                      <LinkSimple size={12} />
                                      <span>Found on: {cookie.sourceUrl}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingCookie(cookie);
                                      setIsEditCookieOpen(true);
                                    }}
                                    data-testid={`button-edit-cookie-${cookie.id}`}
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingCookieId(cookie.id)}
                                    data-testid={`button-delete-cookie-${cookie.id}`}
                                  >
                                    <Trash size={16} className="text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Customize how this category appears to your website visitors.
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={editingCategory.displayName}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, displayName: e.target.value })
                  }
                  data-testid="input-category-display-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  data-testid="input-category-description"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCategoryOpen(false)}
              data-testid="button-cancel-category"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCategory}
              disabled={updateCategoryMutation.isPending}
              data-testid="button-save-category"
            >
              {updateCategoryMutation.isPending && <Spinner size={16} className="mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCookieOpen} onOpenChange={setIsEditCookieOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cookie</DialogTitle>
            <DialogDescription>
              Update the cookie information.
            </DialogDescription>
          </DialogHeader>
          {editingCookie && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editingCookie.categoryId}
                  onValueChange={(v) => setEditingCookie({ ...editingCookie, categoryId: v })}
                >
                  <SelectTrigger data-testid="select-edit-cookie-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cookie Name</Label>
                <Input
                  value={editingCookie.name}
                  onChange={(e) => setEditingCookie({ ...editingCookie, name: e.target.value })}
                  data-testid="input-edit-cookie-name"
                />
              </div>

              <div className="space-y-2">
                <Label>Provider</Label>
                <Input
                  value={editingCookie.provider || ""}
                  onChange={(e) => setEditingCookie({ ...editingCookie, provider: e.target.value })}
                  data-testid="input-edit-cookie-provider"
                />
              </div>

              <div className="space-y-2">
                <Label>Purpose</Label>
                <Textarea
                  value={editingCookie.purpose}
                  onChange={(e) => setEditingCookie({ ...editingCookie, purpose: e.target.value })}
                  data-testid="input-edit-cookie-purpose"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry</Label>
                  <Input
                    value={editingCookie.expiry || ""}
                    onChange={(e) => setEditingCookie({ ...editingCookie, expiry: e.target.value })}
                    data-testid="input-edit-cookie-expiry"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editingCookie.type}
                    onValueChange={(v) => setEditingCookie({ ...editingCookie, type: v })}
                  >
                    <SelectTrigger data-testid="select-edit-cookie-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first-party">First-party</SelectItem>
                      <SelectItem value="third-party">Third-party</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCookieOpen(false)}
              data-testid="button-cancel-edit-cookie"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCookie}
              disabled={updateCookieMutation.isPending}
              data-testid="button-save-edit-cookie"
            >
              {updateCookieMutation.isPending && <Spinner size={16} className="mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCookieId} onOpenChange={(open) => { if (!open) setDeletingCookieId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cookie</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this cookie? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-cookie">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => {
                if (deletingCookieId) {
                  deleteCookieMutation.mutate(deletingCookieId);
                  setDeletingCookieId(null);
                }
              }}
              data-testid="button-confirm-delete-cookie"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
