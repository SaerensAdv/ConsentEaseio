import { useQuery } from "@tanstack/react-query";
import { Code, Cookie, Pulse, WarningCircle, type Icon } from "@phosphor-icons/react";
import { getWebsiteStatusPresentation } from "@/lib/website-status";
import type { Website } from "@shared/schema";

export interface AnalyticsSummary {
  totalViews: number;
  acceptRate: number;
  rejectRate: number;
  dailyStats: Array<{ date: string; views: number; accepts: number; rejects: number }>;
}

interface UsageData {
  views: { used: number; limit: number; percentUsed: number };
}

interface BannerConfig {
  primaryColor: string;
  heading: string;
}

interface DiagnosticScan {
  status: string;
  bannerScriptDetected: boolean | null;
  consentModeDetected: boolean | null;
  defaultConsentSet: boolean | null;
  scannedAt: string;
}

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
  const { data: websites = [], isLoading: websitesLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
  });
  const website = websites[0] || null;

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["/api/websites", website?.id, "analytics", "30"],
    queryFn: () => getJson(`/api/websites/${website?.id}/analytics?days=30`, "Failed to load analytics"),
    enabled: !!website?.id,
  });

  const { data: banner } = useQuery<BannerConfig>({
    queryKey: ["/api/websites", website?.id, "banner"],
    queryFn: () => getJson(`/api/websites/${website?.id}/banner`, "Failed to load banner"),
    enabled: !!website?.id,
  });

  const { data: diagnostic } = useQuery<DiagnosticScan | null>({
    queryKey: ["/api/websites", website?.id, "diagnostic-scan", "latest"],
    queryFn: async () => {
      const response = await fetch(`/api/websites/${website?.id}/diagnostic-scan/latest`, { credentials: "include" });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to load diagnostics");
      return response.json();
    },
    enabled: !!website?.id,
  });

  const { data: usage } = useQuery<UsageData>({
    queryKey: ["/api/usage"],
    queryFn: () => getJson("/api/usage", "Failed to load usage"),
  });

  const embedDetected = (analytics?.totalViews || 0) > 0 || diagnostic?.bannerScriptDetected === true;
  const consentModeReady = diagnostic?.consentModeDetected === true && diagnostic?.defaultConsentSet === true;
  const isDefaultBanner = banner?.primaryColor === "#726CEA" && banner?.heading === "We value your privacy";
  const websiteStatus = getWebsiteStatusPresentation(website?.status);

  const actions: OverviewAction[] = [
    websiteStatus.tone === "warning" ? {
      priority: 1,
      title: websiteStatus.label,
      description: websiteStatus.detail,
      label: websiteStatus.action || "Open websites",
      href: "/dashboard/websites",
      icon: WarningCircle,
    } : null,
    !embedDetected ? {
      priority: 2,
      title: "Install the consent banner",
      description: "No live banner activity has been detected yet.",
      label: "Get embed code",
      href: "/dashboard/embed",
      icon: Code,
    } : null,
    isDefaultBanner ? {
      priority: 3,
      title: "Make the banner yours",
      description: "The active banner still uses the default design.",
      label: "Customize banner",
      href: "/dashboard/banner",
      icon: Cookie,
    } : null,
    !diagnostic ? {
      priority: 4,
      title: "Verify Consent Mode",
      description: "Run a diagnostic after installing the banner.",
      label: "Run diagnostics",
      href: "/dashboard/diagnostics",
      icon: Pulse,
    } : null,
  ].filter((action): action is OverviewAction => action !== null).sort((a, b) => a.priority - b.priority);

  return {
    website,
    websiteStatus,
    websitesLoading,
    analytics,
    analyticsLoading,
    usage,
    embedDetected,
    consentModeReady,
    actions,
  };
}
