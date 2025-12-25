import { useState } from "react";
import DashboardLayout from "./layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Globe, CheckCircle2, AlertCircle, ExternalLink, Code2, Copy, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardWebsites() {
  const [copied, setCopied] = useState(false);

  // Mock data
  const websites = [
    { id: "83xh5b9n0we3", domain: "saerensadvertising.com", status: "compliant", lastScan: "2 mins ago", visitors: "12.4k" },
    { id: "92yk2m1p4rq9", domain: "shop.saerens.com", status: "attention", lastScan: "1 day ago", visitors: "3.2k" },
    { id: "71zm3k8j2lw5", domain: "blog.saerens.com", status: "compliant", lastScan: "3 hours ago", visitors: "8.1k" },
    { id: "45vb6n7m8kp2", domain: "app.saerens.com", status: "compliant", lastScan: "5 mins ago", visitors: "45.6k" },
    { id: "19xc4v5b6nm7", domain: "dev.saerens.com", status: "scanning", lastScan: "Just now", visitors: "120" },
    { id: "33as2d4f5gh6", domain: "staging.saerens.com", status: "attention", lastScan: "2 days ago", visitors: "450" },
    { id: "66ty7u8i9op0", domain: "careers.saerens.com", status: "compliant", lastScan: "1 week ago", visitors: "2.3k" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText('<script src="https://cdn.consentease.com/banner.js" data-id="83xh5b9n0we3"></script>');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Code2 className="w-4 h-4" />
                      Get Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Install Consent Banner</DialogTitle>
                      <DialogDescription>
                        Copy and paste this code into the &lt;head&gt; of your website.
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="html" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="wordpress">WordPress</TabsTrigger>
                        <TabsTrigger value="shopify">Shopify</TabsTrigger>
                      </TabsList>
                      <TabsContent value="html" className="mt-4">
                        <div className="relative rounded-md bg-muted p-4 font-mono text-sm break-all">
                          <code className="text-muted-foreground">
                            &lt;script src="https://cdn.consentease.com/banner.js" data-id="{site.id}"&gt;&lt;/script&gt;
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-8 w-8 hover:bg-background"
                            onClick={handleCopy}
                          >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="wordpress" className="mt-4 text-sm text-muted-foreground">
                        <p>1. Download the ConsentEase plugin.</p>
                        <p>2. Go to Settings {'>'} ConsentEase.</p>
                        <p>3. Enter your Site ID: <strong className="text-foreground">{site.id}</strong></p>
                      </TabsContent>
                       <TabsContent value="shopify" className="mt-4 text-sm text-muted-foreground">
                        <p>1. Open Online Store {'>'} Themes.</p>
                        <p>2. Edit Code {'>'} theme.liquid.</p>
                        <p>3. Paste the HTML snippet before the closing &lt;/head&gt; tag.</p>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Re-scan Cookies</DropdownMenuItem>
                    <DropdownMenuItem>View Report</DropdownMenuItem>
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