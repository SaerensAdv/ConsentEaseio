import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "./layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, MoreHorizontal, Globe, CheckCircle2, AlertCircle, ExternalLink, Code2, Copy, Check, Loader2, RefreshCw, Sparkles } from "lucide-react";
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
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Website {
  id: string;
  publicId: string;
  domain: string;
  status: string;
  lastScan: string | null;
  cookiesFound: number | null;
  scriptsFound: number | null;
  createdAt: string;
}

interface LimitError {
  message: string;
  plan: string;
  limit: number;
}

export default function DashboardWebsites() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [limitError, setLimitError] = useState<LimitError | null>(null);
  const queryClient = useQueryClient();

  const { data: websites = [], isLoading, error } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
    queryFn: async () => {
      const res = await fetch("/api/websites", { credentials: "include" });
      if (res.status === 401) {
        setLocation("/login");
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to fetch websites");
      return res.json();
    },
  });

  const addWebsiteMutation = useMutation({
    mutationFn: async (domain: string) => {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ domain }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 403 && errorData.error === "Website limit reached") {
          throw { isLimitError: true, ...errorData };
        }
        throw new Error(errorData.message || errorData.error || "Failed to add website");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      setNewDomain("");
      setIsAddDialogOpen(false);
      setLimitError(null);
      toast.success("Website added! Scanning for cookies...");
    },
    onError: (error: any) => {
      if (error.isLimitError) {
        setLimitError({
          message: error.message,
          plan: error.plan,
          limit: error.limit,
        });
      } else {
        toast.error(error.message || "Failed to add website");
      }
    },
  });

  const deleteWebsiteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/websites/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete website");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      toast.success("Website removed");
    },
    onError: () => {
      toast.error("Failed to remove website");
    },
  });

  const handleCopy = (publicId: string) => {
    navigator.clipboard.writeText(`<script src="https://cdn.consentease.com/banner.js" data-id="${publicId}"></script>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLastScan = (lastScan: string | null) => {
    if (!lastScan) return "Never";
    return formatDistanceToNow(new Date(lastScan), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Failed to load websites. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Websites</h1>
          <p className="text-muted-foreground">Manage your domains and compliance status.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setLimitError(null);
            setNewDomain("");
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20" data-testid="button-add-domain">
              <Plus className="w-4 h-4" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Website</DialogTitle>
              <DialogDescription>
                Enter your domain name and we'll automatically scan it for cookies and scripts.
              </DialogDescription>
            </DialogHeader>
            
            {limitError && (
              <Alert variant="destructive" className="mt-4" data-testid="alert-limit-reached">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Website limit reached</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-3">{limitError.message}</p>
                  <Button 
                    size="sm" 
                    className="gap-2" 
                    data-testid="button-upgrade-from-limit"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setLimitError(null);
                      setLocation('/dashboard/settings?upgrade=true');
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Upgrade Plan
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!limitError && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newDomain.trim()) {
                    addWebsiteMutation.mutate(newDomain.trim());
                  }
                }}
                className="space-y-4 mt-4"
              >
                <Input
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  data-testid="input-domain"
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={addWebsiteMutation.isPending || !newDomain.trim()}
                  data-testid="button-submit-domain"
                >
                  {addWebsiteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Website"
                  )}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {websites.map((site) => (
          <Card key={site.id} className="hover:shadow-md transition-shadow" data-testid={`card-website-${site.id}`}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  site.status === 'compliant' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                    : site.status === 'scanning'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {site.status === 'scanning' ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Globe className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg" data-testid={`text-domain-${site.id}`}>{site.domain}</h3>
                    <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5">
                      {site.status === 'compliant' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      ) : site.status === 'scanning' ? (
                        <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span className="capitalize" data-testid={`text-status-${site.id}`}>{site.status}</span>
                    </span>
                    <span>•</span>
                    <span>Scanned {formatLastScan(site.lastScan)}</span>
                    {site.cookiesFound !== null && (
                      <>
                        <span>•</span>
                        <span>{site.cookiesFound} cookies</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2" data-testid={`button-get-code-${site.id}`}>
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
                            &lt;script src="https://cdn.consentease.com/banner.js" data-id="{site.publicId}"&gt;&lt;/script&gt;
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-8 w-8 hover:bg-background"
                            onClick={() => handleCopy(site.publicId)}
                            data-testid={`button-copy-code-${site.id}`}
                          >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="wordpress" className="mt-4 text-sm text-muted-foreground">
                        <p>1. Download the ConsentEase plugin.</p>
                        <p>2. Go to Settings {'>'} ConsentEase.</p>
                        <p>3. Enter your Site ID: <strong className="text-foreground">{site.publicId}</strong></p>
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
                    <Button variant="ghost" size="icon" data-testid={`button-menu-${site.id}`}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Re-scan Cookies</DropdownMenuItem>
                    <DropdownMenuItem>View Report</DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => deleteWebsiteMutation.mutate(site.id)}
                      data-testid={`button-delete-${site.id}`}
                    >
                      Remove Domain
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}

        {websites.length === 0 && (
          <div className="text-center py-12 bg-secondary/30 rounded-xl">
            <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No websites yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first domain to get started with compliance.</p>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-domain">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Domain
            </Button>
          </div>
        )}

        {websites.length > 0 && (
          <button 
            onClick={() => setIsAddDialogOpen(true)}
            className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-secondary/20 transition-all group"
            data-testid="button-add-another-domain"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
            </div>
            <h3 className="font-medium mb-1">Add another domain</h3>
            <p className="text-sm text-muted-foreground">Included in your Pro plan</p>
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}
