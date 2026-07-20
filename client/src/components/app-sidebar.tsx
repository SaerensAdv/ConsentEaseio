import { Link, useLocation } from "wouter";
import { SquaresFour, Globe, ChartBar, Gear, SignOut, Code, Cookie, FileText, Stethoscope, Buildings, Scroll, Headset, House } from "@phosphor-icons/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const logoImage = "/consentease-logo.webp";

interface NavItem {
  icon: typeof Globe;
  label: string;
  href: string;
  pro?: boolean;
  exact?: boolean;
}

const setupItems: NavItem[] = [
  { icon: House, label: "Overview", href: "/dashboard", exact: true },
  { icon: Globe, label: "Websites", href: "/dashboard/websites" },
  { icon: SquaresFour, label: "Banner Design", href: "/dashboard/banner" },
  { icon: Code, label: "Embed Code", href: "/dashboard/embed" },
];

const complianceItems: NavItem[] = [
  { icon: Cookie, label: "Cookies", href: "/dashboard/cookies" },
  { icon: FileText, label: "Consent Logs", href: "/dashboard/consent-logs", pro: true },
  { icon: Stethoscope, label: "Diagnostics", href: "/dashboard/diagnostics", pro: true },
  { icon: Scroll, label: "Policy Generator", href: "/dashboard/policy", pro: true },
];

const insightsItems: NavItem[] = [
  { icon: ChartBar, label: "Analytics", href: "/dashboard/analytics" },
];

const supportItems: NavItem[] = [
  { icon: Headset, label: "Help & Feedback", href: "/dashboard/support" },
];

const agencyNavItem: NavItem = {
  icon: Buildings,
  label: "Agency",
  href: "/dashboard/agency",
};

interface AppSidebarProps {
  user?: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    plan: string;
  } | null;
  onLogout: () => void;
}

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const [location] = useLocation();

  const showAgency = user?.plan === "agency" || user?.plan === "agency_pro";
  const showProBadge = user?.plan === "starter" || user?.plan === "solo";

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email?.split("@")[0] || "User";
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = item.exact ? location === item.href : location === item.href || location.startsWith(`${item.href}/`);
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
          <Link href={item.href} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <item.icon size={16} />
            <span className="flex items-center gap-2">
              {item.label}
              {item.pro && showProBadge && <Badge variant="outline" className="text-[10px] px-1 py-0 leading-tight">Pro</Badge>}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const settingsIsActive = location === "/dashboard/settings";

  return (
    <Sidebar role="navigation" aria-label="Main navigation">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/" className="text-xl font-display font-bold flex items-center gap-2" data-testid="link-sidebar-logo">
          <img src={logoImage} alt="ConsentEase" className="w-6 h-6 object-contain" />
          ConsentEase
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {showAgency && (
          <SidebarGroup><SidebarGroupContent><SidebarMenu>{renderNavItem(agencyNavItem)}</SidebarMenu></SidebarGroupContent></SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{setupItems.map(renderNavItem)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Compliance</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{complianceItems.map(renderNavItem)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Insights</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{insightsItems.map(renderNavItem)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{supportItems.map(renderNavItem)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={settingsIsActive} tooltip="Settings">
              <Link href="/dashboard/settings" data-testid="nav-settings"><Gear size={16} /><span>Settings</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "default"}`} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">{getDisplayName()}</p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground" onClick={onLogout} data-testid="button-sidebar-logout">
          <SignOut size={16} className="mr-2" />Log out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
