import { Link, useLocation } from "wouter";
import { Shield, LayoutDashboard, Globe, BarChart3, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { icon: Globe, label: "Websites", href: "/dashboard" },
    { icon: LayoutDashboard, label: "Banner Design", href: "/dashboard/banner" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link href="/">
              <a className="text-xl font-display font-bold flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient flex items-center justify-center text-white">
                  <Shield className="w-3.5 h-3.5 fill-current" />
                </div>
                ConsentEase
              </a>
            </Link>
          </div>

          <div className="flex-1 py-6 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <a className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-9 h-9 border border-border">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">john@example.com</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-w-0">
        <div className="h-16 bg-background border-b border-border flex items-center justify-between px-6 md:hidden sticky top-0 z-30">
          <Link href="/">
            <a className="text-lg font-bold flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient flex items-center justify-center text-white">
                <Shield className="w-3.5 h-3.5 fill-current" />
              </div>
              ConsentEase
            </a>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}