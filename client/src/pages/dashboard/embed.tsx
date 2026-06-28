import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SpinnerGap, Globe, Copy, Check, Code, Lightning, Shield, ArrowSquareOut, Plus, CaretDown } from "@phosphor-icons/react"
import { SiWordpress, SiShopify, SiWix, SiWebflow, SiSquarespace, SiNextdotjs, SiReact } from "react-icons/si"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { ClaritySettings } from "@/components/ClaritySettings";
import { ExcludedPathsSettings } from "@/components/ExcludedPathsSettings";
import { AllowedDomainsSettings } from "@/components/AllowedDomainsSettings";

interface Website {
  id: string;
  domain: string;
  publicId: string;
  clarityProjectId: string | null;
  excludedPaths: string[] | null;
  allowedDomains: string[] | null;
}

interface AuthUser {
  id: string;
  email: string;
  plan: string;
}

interface BannerConfig {
  id: string;
  updatedAt: string;
}

export default function EmbedCode() {
  const [, setLocation] = useLocation();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: user } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

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
  
  // Fetch banner config to get updatedAt for cache busting
  const { data: bannerConfig } = useQuery<BannerConfig>({
    queryKey: ["/api/websites", activeWebsite?.id, "banner"],
    queryFn: async () => {
      const res = await fetch(`/api/websites/${activeWebsite?.id}/banner`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch banner config");
      return res.json();
    },
    enabled: !!activeWebsite?.id,
  });
  
  // Use banner config updatedAt for stable cache busting (only changes when config changes)
  const scriptVersion = bannerConfig?.updatedAt 
    ? new Date(bannerConfig.updatedAt).getTime() 
    : Date.now();
  // Embed code must always point to the public production endpoint, even when
  // the dashboard is opened on a preview/dev URL. Override via VITE_PUBLIC_URL.
  const productionDomain = (import.meta.env.VITE_PUBLIC_URL as string | undefined) || 'https://consentease.io';
  const scriptUrl = activeWebsite 
    ? `${productionDomain}/api/consent/${activeWebsite.publicId}/script.js?v=${scriptVersion}`
    : '';
  
  // Full embed code with inline consent default (must run BEFORE GTM)
  const embedCode = activeWebsite 
    ? `<!-- ConsentEase: Set default consent BEFORE Google Tag Manager -->
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'granted',
  'wait_for_update': 500
});
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', true);
</script>
<!-- ConsentEase: Load consent banner (handles user interaction) -->
<script src="${scriptUrl}" async></script>`
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
        <div className="mb-8">
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full rounded-lg mb-4" />
            <Skeleton className="h-10 w-full rounded-md" />
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-8 rounded mb-3" />
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (websites.length === 0) {
    return (
      <DashboardLayout>
        <EmptyState
          icon={Globe}
          title="No websites yet"
          description="Add a website first to get your embed code."
          action={{ label: "Add Website", onClick: () => setLocation("/dashboard"), icon: Plus }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold">Embed Code</h1>
          <p className="text-muted-foreground">Add this code to your website to show the consent banner.</p>
        </div>

        {websites.length > 1 && (
          <div className="mb-6">
            <Select value={selectedWebsiteId || websites[0]?.id} onValueChange={setSelectedWebsiteId}>
              <SelectTrigger className="w-full sm:w-[300px]" data-testid="select-website">
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

        <Card className="mb-6" data-tour="embed-code">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code size={20} className="text-primary" />
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
                    <Check size={16} className="mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Button className="mt-4 w-full" onClick={handleCopy} data-testid="button-copy-main">
              {copied ? (
                <>
                  <Check size={16} className="mr-2" />
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Copy Embed Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <Lightning size={32} className="text-amber-500 mb-3" />
              <h3 className="font-semibold mb-1">Lightweight</h3>
              <p className="text-sm text-muted-foreground">Less than 5KB gzipped. Won't slow down your site.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Shield size={32} className="text-green-500 mb-3" />
              <h3 className="font-semibold mb-1">GDPR Compliant</h3>
              <p className="text-sm text-muted-foreground">Blocks tracking until consent is given.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Globe size={32} className="text-blue-500 mb-3" />
              <h3 className="font-semibold mb-1">Auto Updates</h3>
              <p className="text-sm text-muted-foreground">Design changes sync automatically.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Lightning size={20} />
              Platform Installation Guides
            </CardTitle>
            <CardDescription className="text-amber-600">
              Select your platform for step-by-step instructions. The embed code must be placed BEFORE Google Tag Manager or Google Analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="wordpress" className="w-full">
              <TabsList className="flex flex-wrap h-auto gap-1 bg-amber-100/80 p-1.5">
                <TabsTrigger value="wordpress" className="gap-1.5 text-xs data-[state=active]:bg-white" data-testid="tab-install-wordpress">
                  <SiWordpress size={14} /> WordPress
                </TabsTrigger>
                <TabsTrigger value="shopify" className="gap-1.5 text-xs data-[state=active]:bg-white" data-testid="tab-install-shopify">
                  <SiShopify size={14} /> Shopify
                </TabsTrigger>
                <TabsTrigger value="wix" className="gap-1.5 text-xs data-[state=active]:bg-white" data-testid="tab-install-wix">
                  <SiWix size={14} /> Wix
                </TabsTrigger>
                <TabsTrigger value="webflow" className="gap-1.5 text-xs data-[state=active]:bg-white" data-testid="tab-install-webflow">
                  <SiWebflow size={14} /> Webflow
                </TabsTrigger>
                <TabsTrigger value="squarespace" className="gap-1.5 text-xs data-[state=active]:bg-white" data-testid="tab-install-squarespace">
                  <SiSquarespace size={14} /> Squarespace
                </TabsTrigger>
                <TabsTrigger value="nextjs" className="gap-1.5 text-xs data-[state=active]:bg-white" data-testid="tab-install-nextjs">
                  <SiNextdotjs size={14} /> Next.js
                </TabsTrigger>
                <TabsTrigger value="react" className="gap-1.5 text-xs data-[state=active]:bg-white" data-testid="tab-install-react">
                  <SiReact size={14} /> React
                </TabsTrigger>
                <TabsTrigger value="html" className="gap-1.5 text-xs data-[state=active]:bg-white" data-testid="tab-install-html">
                  <Code size={14} /> HTML
                </TabsTrigger>
              </TabsList>

              <TabsContent value="wordpress" className="mt-4 space-y-4 text-sm">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">1</div>
                  <div>
                    <p className="font-medium">Install a header/footer plugin</p>
                    <p className="text-muted-foreground">We recommend <strong>WPCode</strong> (free) or <strong>Insert Headers and Footers</strong>. Go to <em>Plugins → Add New</em> and search for it.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">2</div>
                  <div>
                    <p className="font-medium">Paste the embed code in the Header section</p>
                    <p className="text-muted-foreground">Go to the plugin settings and paste your ConsentEase embed code in the <strong>Header</strong> section. Make sure it's placed <strong>before</strong> any Google Analytics or GTM code.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">3</div>
                  <div>
                    <p className="font-medium">Save and verify</p>
                    <p className="text-muted-foreground">Save the plugin settings and visit your site. The consent banner should appear. If you use a caching plugin (WP Super Cache, W3 Total Cache), clear the cache first.</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-200 text-amber-700 text-xs">
                  <p><strong>Alternative:</strong> If you prefer not to use a plugin, you can add the code directly to your theme's <code className="bg-amber-100 px-1 rounded">header.php</code> file, just before the closing <code className="bg-amber-100 px-1 rounded">&lt;/head&gt;</code> tag. Use a child theme to prevent losing changes during theme updates.</p>
                </div>
              </TabsContent>

              <TabsContent value="shopify" className="mt-4 space-y-4 text-sm">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">1</div>
                  <div>
                    <p className="font-medium">Open your theme code</p>
                    <p className="text-muted-foreground">In your Shopify admin, go to <strong>Online Store → Themes → Actions → Edit code</strong>.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">2</div>
                  <div>
                    <p className="font-medium">Edit theme.liquid</p>
                    <p className="text-muted-foreground">Open the <strong>theme.liquid</strong> file under <em>Layout</em>. Find the <code className="bg-amber-100 px-1 rounded">&lt;head&gt;</code> tag and paste the ConsentEase embed code right after it — <strong>before</strong> any GTM or analytics scripts.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">3</div>
                  <div>
                    <p className="font-medium">Save and preview</p>
                    <p className="text-muted-foreground">Click <strong>Save</strong> and preview your store. The banner will automatically appear. Consent carries over to the checkout page via Shopify's Customer Privacy system.</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-200 text-amber-700 text-xs">
                  <p><strong>Tip:</strong> Works with all Shopify themes including Dawn and OS 2.0 themes. You can also add it via <strong>Online Store → Themes → Customize → App embeds</strong> if your theme supports it.</p>
                </div>
              </TabsContent>

              <TabsContent value="wix" className="mt-4 space-y-4 text-sm">
                <div className="bg-white rounded-lg p-3 border border-amber-200 text-amber-700 text-xs mb-2">
                  <p><strong>Requirement:</strong> You need a <strong>Wix Premium plan</strong> (any paid plan) to add custom code. Free Wix plans don't support this feature.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">1</div>
                  <div>
                    <p className="font-medium">Open Wix Custom Code settings</p>
                    <p className="text-muted-foreground">Go to your <strong>Wix Dashboard → Settings → Custom Code</strong> (under Advanced). Click <strong>+ Add Code</strong>.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">2</div>
                  <div>
                    <p className="font-medium">Paste your embed code</p>
                    <p className="text-muted-foreground">Paste the ConsentEase embed code, name it "ConsentEase", set placement to <strong>Head</strong>, and select <strong>All pages</strong> → <strong>Load code once</strong>.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">3</div>
                  <div>
                    <p className="font-medium">Apply and publish</p>
                    <p className="text-muted-foreground">Click <strong>Apply</strong> and then <strong>Publish</strong> your site. Wix caches pages — wait a few minutes or clear your browser cache to see changes.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="webflow" className="mt-4 space-y-4 text-sm">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">1</div>
                  <div>
                    <p className="font-medium">Open Project Settings</p>
                    <p className="text-muted-foreground">In the Webflow Designer, go to <strong>Project Settings → Custom Code</strong>.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">2</div>
                  <div>
                    <p className="font-medium">Add to Head Code</p>
                    <p className="text-muted-foreground">Paste the ConsentEase embed code in the <strong>Head Code</strong> section. This applies it to all pages on your site automatically.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">3</div>
                  <div>
                    <p className="font-medium">Save and publish</p>
                    <p className="text-muted-foreground">Click <strong>Save Changes</strong> and then <strong>Publish</strong> your site. The consent banner will appear on all pages.</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-200 text-amber-700 text-xs">
                  <p><strong>Per-page code:</strong> If you only need the banner on specific pages, you can add the code to individual pages instead via <strong>Page Settings → Custom Code → Head Code</strong>.</p>
                </div>
              </TabsContent>

              <TabsContent value="squarespace" className="mt-4 space-y-4 text-sm">
                <div className="bg-white rounded-lg p-3 border border-amber-200 text-amber-700 text-xs mb-2">
                  <p><strong>Requirement:</strong> Custom code injection requires a <strong>Squarespace Business plan</strong> or higher. Personal and Basic plans don't support code injection.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">1</div>
                  <div>
                    <p className="font-medium">Open Code Injection</p>
                    <p className="text-muted-foreground">Go to <strong>Settings → Developer Tools → Code Injection</strong> in your Squarespace admin.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">2</div>
                  <div>
                    <p className="font-medium">Paste in the Header section</p>
                    <p className="text-muted-foreground">Paste the ConsentEase embed code in the <strong>Header</strong> field. Make sure it appears before any existing tracking scripts.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">3</div>
                  <div>
                    <p className="font-medium">Save</p>
                    <p className="text-muted-foreground">Click <strong>Save</strong>. The banner will appear immediately on all pages of your Squarespace site. No need to publish separately.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="nextjs" className="mt-4 space-y-4 text-sm">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">1</div>
                  <div>
                    <p className="font-medium">Add to your layout file</p>
                    <p className="text-muted-foreground">
                      <strong>App Router:</strong> Open <code className="bg-amber-100 px-1 rounded">app/layout.tsx</code> and add the scripts inside the <code className="bg-amber-100 px-1 rounded">&lt;head&gt;</code> tag using Next.js <code className="bg-amber-100 px-1 rounded">&lt;Script&gt;</code> component.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">2</div>
                  <div>
                    <p className="font-medium">Use the Script component</p>
                    <div className="bg-slate-900 rounded-lg p-3 mt-2">
                      <pre className="text-green-400 text-xs font-mono overflow-x-auto">{`import Script from 'next/script'

// In your layout's <head>:
<Script
  id="consentease-defaults"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{ __html: \`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'analytics_storage': 'denied',
      'wait_for_update': 500
    });
  \`}}
/>
<Script
  src="${scriptUrl}"
  strategy="afterInteractive"
/>`}</pre>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">3</div>
                  <div>
                    <p className="font-medium">Deploy</p>
                    <p className="text-muted-foreground">Deploy your application. The consent banner will load on all pages. Use <code className="bg-amber-100 px-1 rounded">beforeInteractive</code> for the consent defaults to ensure they load before any tracking.</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-200 text-amber-700 text-xs">
                  <p><strong>Pages Router:</strong> If you use the Pages Router, add the scripts to <code className="bg-amber-100 px-1 rounded">pages/_document.tsx</code> inside the <code className="bg-amber-100 px-1 rounded">&lt;Head&gt;</code> component instead.</p>
                </div>
              </TabsContent>

              <TabsContent value="react" className="mt-4 space-y-4 text-sm">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">1</div>
                  <div>
                    <p className="font-medium">Add to your index.html</p>
                    <p className="text-muted-foreground">Open <code className="bg-amber-100 px-1 rounded">public/index.html</code> (Create React App) or <code className="bg-amber-100 px-1 rounded">index.html</code> (Vite). Paste the embed code inside the <code className="bg-amber-100 px-1 rounded">&lt;head&gt;</code> tag, before any other scripts.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">2</div>
                  <div>
                    <p className="font-medium">Place before other scripts</p>
                    <p className="text-muted-foreground">Make sure the ConsentEase code comes <strong>before</strong> React's root script and any analytics scripts. This ensures consent defaults are set before any tracking fires.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">3</div>
                  <div>
                    <p className="font-medium">Build and deploy</p>
                    <p className="text-muted-foreground">Run your build command (<code className="bg-amber-100 px-1 rounded">npm run build</code>) and deploy. The banner will work on all routes, including single-page app navigation.</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-200 text-amber-700 text-xs">
                  <p><strong>Vite users:</strong> With Vite, the file is <code className="bg-amber-100 px-1 rounded">index.html</code> in the project root (not in a public folder).</p>
                </div>
              </TabsContent>

              <TabsContent value="html" className="mt-4 space-y-4 text-sm">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">1</div>
                  <div>
                    <p className="font-medium">Open your HTML file</p>
                    <p className="text-muted-foreground">Open each HTML page where you want the consent banner to appear.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">2</div>
                  <div>
                    <p className="font-medium">Paste in the &lt;head&gt; section</p>
                    <p className="text-muted-foreground">Paste the embed code at the <strong>top</strong> of the <code className="bg-amber-100 px-1 rounded">&lt;head&gt;</code> section, right after the opening <code className="bg-amber-100 px-1 rounded">&lt;head&gt;</code> tag. It must come before any Google Analytics, GTM, or other tracking scripts.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-semibold text-xs">3</div>
                  <div>
                    <p className="font-medium">Upload and test</p>
                    <p className="text-muted-foreground">Upload the modified file to your server and visit the page. The consent banner will appear immediately.</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-200 text-amber-700 text-xs">
                  <p><strong>Multi-page sites:</strong> Add the embed code to every HTML page, or use a server-side include/template to avoid repetition. If you use PHP, add it to your shared header include file.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-6 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Check size={20} />
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
                  <Check size={12} className="text-green-500" />
                  <span>ad_storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-green-500" />
                  <span>ad_user_data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-green-500" />
                  <span>ad_personalization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-green-500" />
                  <span>analytics_storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-green-500" />
                  <span>functionality_storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-green-500" />
                  <span>personalization_storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-green-500" />
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

        {/* Microsoft Clarity Integration */}
        {activeWebsite && (
          <div className="mt-6">
            <ClaritySettings 
              websiteId={activeWebsite.id}
              domain={activeWebsite.domain}
              clarityProjectId={activeWebsite.clarityProjectId}
            />
          </div>
        )}

        {/* Domain Authorization */}
        {activeWebsite && (
          <div className="mt-6">
            <AllowedDomainsSettings 
              websiteId={activeWebsite.id}
              domain={activeWebsite.domain}
              allowedDomains={activeWebsite.allowedDomains}
              userPlan={user?.plan || 'solo'}
            />
          </div>
        )}

        {/* Analytics Exclusions */}
        {activeWebsite && (
          <div className="mt-6">
            <ExcludedPathsSettings 
              websiteId={activeWebsite.id}
              domain={activeWebsite.domain}
              excludedPaths={activeWebsite.excludedPaths}
            />
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setLocation("/dashboard/banner")}>
            <ArrowSquareOut size={16} className="mr-2" />
            Customize Banner Design
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
