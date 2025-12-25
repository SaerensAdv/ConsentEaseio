import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe, Copy, Check, Code, Zap, Shield, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Website {
  id: string;
  domain: string;
  publicId: string;
}

export default function EmbedCode() {
  const [, setLocation] = useLocation();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: websites = [], isLoading } = useQuery<Website[]>({
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

  const activeWebsite = websites.find(w => w.id === selectedWebsiteId) || websites[0];
  const scriptUrl = activeWebsite 
    ? `${window.location.origin}/api/consent/${activeWebsite.publicId}/script.js`
    : '';
  
  const embedCode = activeWebsite 
    ? `<script src="${scriptUrl}" async></script>`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Embed code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
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

  if (websites.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No websites yet</h2>
          <p className="text-muted-foreground mb-4">Add a website first to get your embed code.</p>
          <Button onClick={() => setLocation("/dashboard")}>Add Website</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold">Embed Code</h1>
          <p className="text-muted-foreground">Add this code to your website to show the consent banner.</p>
        </div>

        {websites.length > 1 && (
          <div className="mb-6">
            <Select value={selectedWebsiteId || websites[0]?.id} onValueChange={setSelectedWebsiteId}>
              <SelectTrigger className="w-[300px]" data-testid="select-website">
                <SelectValue placeholder="Select website" />
              </SelectTrigger>
              <SelectContent>
                {websites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              Your Embed Code
            </CardTitle>
            <CardDescription>
              Copy and paste this code snippet into the &lt;head&gt; section of your website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-4 relative group">
              <pre className="text-green-400 text-sm font-mono overflow-x-auto">
                <code data-testid="embed-code">{embedCode}</code>
              </pre>
              <Button 
                size="sm" 
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleCopy}
                data-testid="button-copy"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Button className="mt-4 w-full" onClick={handleCopy} data-testid="button-copy-main">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Embed Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <Zap className="w-8 h-8 text-amber-500 mb-3" />
              <h3 className="font-semibold mb-1">Lightweight</h3>
              <p className="text-sm text-muted-foreground">Less than 5KB gzipped. Won't slow down your site.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Shield className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-semibold mb-1">GDPR Compliant</h3>
              <p className="text-sm text-muted-foreground">Blocks tracking until consent is given.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Globe className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-semibold mb-1">Auto Updates</h3>
              <p className="text-sm text-muted-foreground">Design changes sync automatically.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Installation Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold">1</div>
              <div>
                <p className="font-medium">Copy the embed code above</p>
                <p className="text-muted-foreground">Click the copy button to copy the script tag.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold">2</div>
              <div>
                <p className="font-medium">Paste it in your website's &lt;head&gt; section</p>
                <p className="text-muted-foreground">Add it before other tracking scripts like Google Analytics.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold">3</div>
              <div>
                <p className="font-medium">That's it!</p>
                <p className="text-muted-foreground">The banner will appear automatically. Customize it anytime from the Banner Design page.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Check className="w-5 h-5" />
              Google Consent Mode v2 Included
            </CardTitle>
            <CardDescription className="text-green-600">
              Works automatically with Google Analytics, Google Ads, and Google Tag Manager
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-green-700">
              Our script automatically integrates with <strong>Google Consent Mode v2</strong>, 
              which is required for running Google Ads in the EU/EEA since March 2024.
            </p>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="font-medium text-slate-700 mb-2">Consent types managed:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>ad_storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>ad_user_data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>ad_personalization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>analytics_storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>functionality_storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>personalization_storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>security_storage</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">
              The script sets default consent to "denied" and updates it when users make their choice.
              URL passthrough and ads data redaction are enabled for enhanced privacy.
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setLocation("/dashboard/banner")}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Customize Banner Design
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
