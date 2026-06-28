import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { logout } from "@/lib/auth";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import TrialBanner from "@/components/TrialBanner";
import DemoModeBanner from "@/components/DemoModeBanner";

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
        <main id="main-content" role="main" className="flex-1 min-w-0">
          <div className="flex items-center gap-2 p-2 border-b md:hidden sticky top-0 z-30 bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" aria-label="Toggle sidebar navigation" />
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
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
