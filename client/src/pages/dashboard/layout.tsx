import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { logout } from "@/lib/auth";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import TrialBanner from "@/components/TrialBanner";
import DemoModeBanner from "@/components/DemoModeBanner";
import { GlobalWebsiteSelector, WebsiteProvider, useWebsite } from "@/contexts/WebsiteContext";

interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  plan: string;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  isDemo?: boolean;
  demoExpiresAt?: string | null;
}

const sidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
} as React.CSSProperties;

function DashboardContent({ children, user }: { children: React.ReactNode; user?: AuthUser }) {
  const { selectedWebsiteId } = useWebsite();

  return (
    <main id="main-content" role="main" className="flex-1 min-w-0">
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6 md:py-3">
        <SidebarTrigger className="md:hidden" data-testid="button-sidebar-toggle" aria-label="Toggle sidebar navigation" />
        <div className="ml-auto w-full sm:w-auto">
          <GlobalWebsiteSelector />
        </div>
      </div>
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        {user?.isDemo ? (
          <DemoModeBanner demoExpiresAt={user?.demoExpiresAt || null} />
        ) : (
          <TrialBanner
            trialEndsAt={user?.trialEndsAt || null}
            subscriptionStatus={user?.subscriptionStatus || null}
            plan={user?.plan || "solo"}
          />
        )}
        <div key={selectedWebsiteId || "no-website"}>
          {children}
        </div>
      </div>
    </main>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.status === 401) {
        setLocation("/login");
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    setLocation("/login");
  };

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex min-h-screen w-full">
        <AppSidebar user={user} onLogout={handleLogout} />
        <WebsiteProvider>
          <DashboardContent user={user}>{children}</DashboardContent>
        </WebsiteProvider>
      </div>
    </SidebarProvider>
  );
}
