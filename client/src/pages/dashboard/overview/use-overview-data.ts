import { useQuery } from "@tanstack/react-query";
import { Code, Cookie, Pulse, WarningCircle, type Icon } from "@phosphor-icons/react";
import { useWebsite } from "@/contexts/WebsiteContext";
import { getWebsiteStatusPresentation } from "@/lib/website-status";

export interface AnalyticsSummary {
  totalViews: number;
  acceptRate: number;
  rejectRate: number;
  dailyStats: Array<{ date: string; views: number; accepts: number; rejects: number }>;
}
interface UsageData { views: { used: number; limit: number; percentUsed: number } }
interface BannerConfig { primaryColor: string; heading: string }
interface DiagnosticScan { status: string; bannerScriptDetected: boolean | null; consentModeDetected: boolean | null; defaultConsentSet: boolean | null; scannedAt: string }

export interface OverviewAction {
  priority: number;
  title: string;
  description: string;
  label: string;
  href: string;
  icon: Icon;
}

async function getJson<T>(url: string, errorMessage: string): Promise<T> {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error(errorMessage);
  return response.json();
}

export function useOverviewData() {
  const { selectedWebsite: website, isLoading: websitesLoading } = useWebsite();

  const analyticsQuery = useQuery<AnalyticsSummary>({
    queryKey: ["/api/websites", website?.id, "analytics", "30"],
    queryFn: () => getJson(`/api/websites/${website?.id}/analytics?days=30`, "Analytics are unavailable"),
    enabled: !!website?.id,
  });
  const bannerQuery = useQuery<BannerConfig>({
    queryKey: ["/api/websites", website?.id, "banner"],
    queryFn: () => getJson(`/api/websites/${website?.id}/banner`, "Banner configuration is unavailable"),
    enabled: !!website?.id,
  });
  const diagnosticQuery = useQuery<DiagnosticScan | null>({
    queryKey: ["/api/websites", website?.id, "diagnostic-scan", "latest"],
    queryFn: async () => {
      const response = await fetch(`/api/websites/${website?.id}/diagnostic-scan/latest`, { credentials: "include" });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Diagnostics are unavailable");
      return response.json();
    },
    enabled: !!website?.id,
  });
  const usageQuery = useQuery<UsageData>({
    queryKey: ["/api/usage"],
    queryFn: () => getJson("/api/usage", "Usage is unavailable"),
  });

  const analytics = analyticsQuery.data;
  const banner = bannerQuery.data;
  const diagnostic = diagnosticQuery.data;
  const embedDetected = analyticsQuery.isSuccess && analytics.totalViews > 0 || diagnosticQuery.isSuccess && diagnostic?.bannerScriptDetected === true;
  const consentModeReady = diagnosticQuery.isSuccess && diagnostic?.consentModeDetected === true && diagnostic?.defaultConsentSet === true;
  const isDefaultBanner = bannerQuery.isSuccess && banner.primaryColor === "#726CEA" && banner.heading === "We value your privacy";
  const websiteStatus = getWebsiteStatusPresentation(website?.status);

  const actions: OverviewAction[] = [
    websiteStatus.tone === "warning" ? { priority: 1, title: websiteStatus.label, description: websiteStatus.detail, label: websiteStatus.action || "Open websites", href: "/dashboard/websites", icon: WarningCircle } : null,
    analyticsQuery.isSuccess && diagnosticQuery.isSuccess && !embedDetected ? { priority: 2, title: "Install the consent banner", description: "No live banner activity has been detected yet.", label: "Get embed code", href: "/dashboard/embed", icon: Code } : null,
    isDefaultBanner ? { priority: 3, title: "Make the banner yours", description: "The active banner still uses the default design.", label: "Customize banner", href: "/dashboard/banner", icon: Cookie } : null,
    diagnosticQuery.isSuccess && !diagnostic ? { priority: 4, title: "Verify Consent Mode", description: "Run a diagnostic after installing the banner.", label: "Run diagnostics", href: "/dashboard/diagnostics", icon: Pulse } : null,
  ].filter((action): action is OverviewAction => action !== null).sort((a, b) => a.priority - b.priority);

  const unavailableSections = [
    analyticsQuery.isError ? "analytics" : null,
    bannerQuery.isError ? "banner configuration" : null,
    diagnosticQuery.isError ? "diagnostics" : null,
    usageQuery.isError ? "usage" : null,
  ].filter((value): value is string => value !== null);

  return {
    website,
    websiteStatus,
    websitesLoading,
    analytics,
    analyticsLoading: analyticsQuery.isLoading,
    analyticsAvailable: analyticsQuery.isSuccess,
    usage: usageQuery.data,
    embedDetected,
    embedAvailable: analyticsQuery.isSuccess || diagnosticQuery.isSuccess,
    consentModeReady,
    diagnosticAvailable: diagnosticQuery.isSuccess,
    actions,
    unavailableSections,
    retryUnavailable: () => Promise.all([
      analyticsQuery.isError ? analyticsQuery.refetch() : Promise.resolve(),
      bannerQuery.isError ? bannerQuery.refetch() : Promise.resolve(),
      diagnosticQuery.isError ? diagnosticQuery.refetch() : Promise.resolve(),
      usageQuery.isError ? usageQuery.refetch() : Promise.resolve(),
    ]),
  };
}
