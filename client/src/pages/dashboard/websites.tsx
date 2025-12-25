import { useState } from "react";
import DashboardLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Globe, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardWebsites() {
  // Mock data
  const websites = [
    { id: "83xh5b9n0we3", domain: "saerensadvertising.com", status: "compliant", lastScan: "2 mins ago", visitors: "12.4k" },
    { id: "92yk2m1p4rq9", domain: "shop.saerens.com", status: "attention", lastScan: "1 day ago", visitors: "3.2k" },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Websites</h1>
          <p className="text-muted-foreground">Manage your domains and compliance status.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add Domain
        </Button>
      </div>

      <div className="grid gap-4">
        {websites.map((site) => (
          <Card key={site.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  site.status === 'compliant' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{site.domain}</h3>
                    <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5">
                      {site.status === 'compliant' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span className="capitalize">{site.status}</span>
                    </span>
                    <span>•</span>
                    <span>Scanned {site.lastScan}</span>
                    <span>•</span>
                    <span>{site.visitors} visits</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline">Configure Banner</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Re-scan Cookies</DropdownMenuItem>
                    <DropdownMenuItem>View Report</DropdownMenuItem>
                    <DropdownMenuItem>Get Embed Code</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Remove Domain</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State / Add New Placeholder */}
        <button className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-secondary/20 transition-all group">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
          </div>
          <h3 className="font-medium mb-1">Add another domain</h3>
          <p className="text-sm text-muted-foreground">Included in your Pro plan</p>
        </button>
      </div>
    </DashboardLayout>
  );
}