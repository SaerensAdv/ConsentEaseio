import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe, WarningCircle } from "@phosphor-icons/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Website } from "@shared/schema";

const STORAGE_KEY = "consentease:selected-website";

interface WebsiteContextValue {
  websites: Website[];
  selectedWebsite: Website | null;
  selectedWebsiteId: string | null;
  isLoading: boolean;
  selectWebsite: (websiteId: string) => void;
}

const WebsiteContext = createContext<WebsiteContextValue | null>(null);

function requestedWebsiteId(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("websiteId");
}

function storedWebsiteId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<string | null>(() => requestedWebsiteId() || storedWebsiteId());

  const { data: websites = [], isLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
    queryFn: async () => {
      const response = await fetch("/api/websites", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch websites");
      return response.json();
    },
  });

  const selectedWebsite = useMemo(() => {
    return websites.find((website) => website.id === selection) || websites[0] || null;
  }, [selection, websites]);

  const selectedWebsiteId = selectedWebsite?.id || null;

  useEffect(() => {
    if (!selectedWebsiteId || typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, selectedWebsiteId);
    } catch {
      // Selection still works for this session when storage is unavailable.
    }

    const url = new URL(window.location.href);
    if (url.searchParams.get("websiteId") !== selectedWebsiteId) {
      url.searchParams.set("websiteId", selectedWebsiteId);
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [selectedWebsiteId]);

  const selectWebsite = (websiteId: string) => {
    const websiteExists = websites.some((website) => website.id === websiteId);
    if (!websiteExists) return;
    setSelection(websiteId);
  };

  return (
    <WebsiteContext.Provider value={{ websites, selectedWebsite, selectedWebsiteId, isLoading, selectWebsite }}>
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  const context = useContext(WebsiteContext);
  if (!context) throw new Error("useWebsite must be used within WebsiteProvider");
  return context;
}

export function GlobalWebsiteSelector() {
  const { websites, selectedWebsiteId, isLoading, selectWebsite } = useWebsite();

  if (isLoading) {
    return <div className="h-10 w-full sm:w-72 animate-pulse rounded-lg bg-muted" aria-label="Loading websites" />;
  }

  if (websites.length === 0) {
    return (
      <div className="flex h-10 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
        <WarningCircle size={16} />
        No website selected
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground lg:inline">Website</span>
      <Select value={selectedWebsiteId || undefined} onValueChange={selectWebsite}>
        <SelectTrigger className="h-10 w-full min-w-0 bg-background sm:w-72" data-testid="global-website-selector" aria-label="Select active website">
          <Globe size={16} className="mr-2 shrink-0 text-primary" />
          <SelectValue placeholder="Select website" />
        </SelectTrigger>
        <SelectContent>
          {websites.map((website) => (
            <SelectItem key={website.id} value={website.id}>
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${website.status === "compliant" ? "bg-emerald-500" : website.status === "scanning" ? "bg-blue-500" : "bg-amber-500"}`} />
                {website.domain}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
