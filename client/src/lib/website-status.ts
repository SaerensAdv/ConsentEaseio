export type WebsiteStatusTone = "success" | "progress" | "warning";

export interface WebsiteStatusPresentation {
  label: string;
  detail: string;
  action: string | null;
  tone: WebsiteStatusTone;
  dotClass: string;
  iconClass: string;
  surfaceClass: string;
}

const STATUS_PRESENTATIONS: Record<string, WebsiteStatusPresentation> = {
  compliant: {
    label: "Scan complete",
    detail: "Cookie inventory is up to date.",
    action: null,
    tone: "success",
    dotClass: "bg-emerald-500",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    surfaceClass: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  scanning: {
    label: "Scanning now",
    detail: "ConsentEase is checking pages, cookies, and scripts.",
    action: "Wait for the scan to finish",
    tone: "progress",
    dotClass: "bg-blue-500",
    iconClass: "text-blue-600 dark:text-blue-400",
    surfaceClass: "bg-blue-100 dark:bg-blue-900/30",
  },
  attention: {
    label: "Scan needs attention",
    detail: "The latest scan could not complete cleanly.",
    action: "Review and run the scan again",
    tone: "warning",
    dotClass: "bg-amber-500",
    iconClass: "text-amber-600 dark:text-amber-400",
    surfaceClass: "bg-amber-100 dark:bg-amber-900/30",
  },
  needs_attention: {
    label: "Setup needs attention",
    detail: "Finish setup before relying on this website's compliance state.",
    action: "Review website setup",
    tone: "warning",
    dotClass: "bg-amber-500",
    iconClass: "text-amber-600 dark:text-amber-400",
    surfaceClass: "bg-amber-100 dark:bg-amber-900/30",
  },
};

const FALLBACK_STATUS: WebsiteStatusPresentation = {
  label: "Status unavailable",
  detail: "ConsentEase has not confirmed this website's current state.",
  action: "Review website setup",
  tone: "warning",
  dotClass: "bg-slate-400",
  iconClass: "text-slate-600 dark:text-slate-400",
  surfaceClass: "bg-slate-100 dark:bg-slate-900/30",
};

export function getWebsiteStatusPresentation(status: string | null | undefined): WebsiteStatusPresentation {
  return STATUS_PRESENTATIONS[(status || "").toLowerCase()] || FALLBACK_STATUS;
}
