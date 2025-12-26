import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import DashboardLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Undo2, Save, Monitor, Smartphone, Palette, Layout, Type, Shield, BoxSelect, Loader2, Globe, Sparkles, Lock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface AuthUser {
  id: string;
  plan: string;
}

interface Website {
  id: string;
  domain: string;
  publicId: string;
}

interface BannerConfig {
  id: string;
  websiteId: string;
  heading: string;
  description: string;
  acceptText: string;
  rejectText: string;
  settingsText: string;
  position: string;
  theme: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  showIcon: boolean;
  fontFamily: string;
  fontSize: string;
  shadow: string;
  backdropBlur: boolean;
  animation: string;
  buttonStyle: string;
  buttonShape: string;
}

const defaultConfig = {
  heading: "We value your privacy",
  description: "We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking \"Accept All\", you consent to our use of cookies.",
  acceptText: "Accept All",
  rejectText: "Reject All",
  settingsText: "Preferences",
  position: "bottom-left",
  theme: "light",
  primaryColor: "#726CEA",
  backgroundColor: "#ffffff",
  textColor: "#1e1e1e",
  borderRadius: 12,
  showIcon: true,
  fontFamily: "Inter",
  fontSize: "medium",
  shadow: "medium",
  backdropBlur: true,
  animation: "slide-up",
  buttonStyle: "filled",
  buttonShape: "rounded",
};

export default function BannerConfigurator() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [config, setConfig] = useState(defaultConfig);
  const [activeTab, setActiveTab] = useState("appearance");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [showPreferencesPreview, setShowPreferencesPreview] = useState(false);

  // Sample cookie categories for preview
  const previewCategories = [
    { name: "necessary", displayName: "Necessary", description: "Essential cookies required for the website to function properly.", isRequired: true },
    { name: "functional", displayName: "Functional", description: "Enable enhanced functionality and personalization.", isRequired: false },
    { name: "analytics", displayName: "Analytics", description: "Help us understand how visitors interact with the website.", isRequired: false },
    { name: "marketing", displayName: "Marketing", description: "Used to track visitors across websites for advertising purposes.", isRequired: false },
  ];
  const [categoryStates, setCategoryStates] = useState({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true,
  });

  const { data: user } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  const { data: websites = [], isLoading: websitesLoading } = useQuery<Website[]>({
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
  
  const isSoloPlan = user?.plan === 'solo';

  const activeWebsiteId = selectedWebsiteId || websites[0]?.id;

  const { data: bannerConfig, isLoading: configLoading } = useQuery<BannerConfig>({
    queryKey: ["/api/websites", activeWebsiteId, "banner"],
    queryFn: async () => {
      if (!activeWebsiteId) return null;
      const res = await fetch(`/api/websites/${activeWebsiteId}/banner`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch banner config");
      return res.json();
    },
    enabled: !!activeWebsiteId,
  });

  useEffect(() => {
    if (bannerConfig) {
      setConfig({
        heading: bannerConfig.heading,
        description: bannerConfig.description,
        acceptText: bannerConfig.acceptText,
        rejectText: bannerConfig.rejectText,
        settingsText: bannerConfig.settingsText,
        position: bannerConfig.position,
        theme: bannerConfig.theme,
        primaryColor: bannerConfig.primaryColor,
        backgroundColor: bannerConfig.backgroundColor,
        textColor: bannerConfig.textColor,
        borderRadius: bannerConfig.borderRadius,
        showIcon: bannerConfig.showIcon,
        fontFamily: bannerConfig.fontFamily,
        fontSize: bannerConfig.fontSize,
        shadow: bannerConfig.shadow,
        backdropBlur: bannerConfig.backdropBlur,
        animation: bannerConfig.animation,
        buttonStyle: bannerConfig.buttonStyle,
        buttonShape: bannerConfig.buttonShape,
      });
    }
  }, [bannerConfig]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/websites/${activeWebsiteId}/banner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites", activeWebsiteId, "banner"] });
      toast.success("Banner settings saved!");
    },
    onError: () => {
      toast.error("Failed to save changes");
    },
  });

  const handleReset = () => {
    if (bannerConfig) {
      setConfig({
        heading: bannerConfig.heading,
        description: bannerConfig.description,
        acceptText: bannerConfig.acceptText,
        rejectText: bannerConfig.rejectText,
        settingsText: bannerConfig.settingsText,
        position: bannerConfig.position,
        theme: bannerConfig.theme,
        primaryColor: bannerConfig.primaryColor,
        backgroundColor: bannerConfig.backgroundColor,
        textColor: bannerConfig.textColor,
        borderRadius: bannerConfig.borderRadius,
        showIcon: bannerConfig.showIcon,
        fontFamily: bannerConfig.fontFamily,
        fontSize: bannerConfig.fontSize,
        shadow: bannerConfig.shadow,
        backdropBlur: bannerConfig.backdropBlur,
        animation: bannerConfig.animation,
        buttonStyle: bannerConfig.buttonStyle,
        buttonShape: bannerConfig.buttonShape,
      });
    }
  };

  if (websitesLoading) {
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
          <p className="text-muted-foreground mb-4">Add a website first to customize your banner.</p>
          <Button onClick={() => setLocation("/dashboard")}>Add Website</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold">Banner Design</h1>
            <p className="text-muted-foreground">Customize how the consent banner looks on your site.</p>
          </div>
          <div className="flex items-center gap-3">
            {websites.length > 1 && (
              <Select value={selectedWebsiteId || websites[0]?.id} onValueChange={setSelectedWebsiteId}>
                <SelectTrigger className="w-[200px]" data-testid="select-website">
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
            )}
            <Button variant="outline" size="sm" onClick={handleReset} data-testid="button-reset">
              <Undo2 className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              size="sm" 
              className="shadow-lg shadow-primary/20"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              data-testid="button-save"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {isSoloPlan && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800" data-testid="alert-solo-branding">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-amber-800 dark:text-amber-200">
                Solo plan banners include "Powered by ConsentEase" branding.
              </span>
              <Link href="/dashboard/settings?upgrade=true">
                <Button size="sm" variant="outline" className="ml-4 gap-1 border-amber-300 text-amber-700 hover:bg-amber-100">
                  <Sparkles className="w-3 h-3" />
                  Upgrade to remove
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex-1 grid lg:grid-cols-12 gap-8 min-h-0">
          {/* Controls Panel */}
          <Card className="lg:col-span-4 h-full overflow-hidden flex flex-col border-none shadow-lg">
            <div className="p-1">
              <Tabs defaultValue="appearance" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="appearance" className="gap-2"><Palette className="w-4 h-4"/> Style</TabsTrigger>
                  <TabsTrigger value="content" className="gap-2"><Type className="w-4 h-4"/> Content</TabsTrigger>
                  <TabsTrigger value="layout" className="gap-2"><Layout className="w-4 h-4"/> Layout</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-8">
              {activeTab === "appearance" && (
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Colors</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Primary Brand</Label>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full border border-border shadow-sm overflow-hidden relative">
                            <input 
                              type="color" 
                              value={config.primaryColor}
                              onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                              className="absolute inset-[-50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                              data-testid="input-primary-color"
                            />
                          </div>
                          <Input 
                            value={config.primaryColor}
                            onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                            className="font-mono text-xs h-8"
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-xs text-muted-foreground">Background</Label>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full border border-border shadow-sm overflow-hidden relative">
                            <input 
                              type="color" 
                              value={config.backgroundColor}
                              onChange={(e) => setConfig({...config, backgroundColor: e.target.value})}
                              className="absolute inset-[-50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                            />
                          </div>
                          <Input 
                            value={config.backgroundColor}
                            onChange={(e) => setConfig({...config, backgroundColor: e.target.value})}
                            className="font-mono text-xs h-8"
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-xs text-muted-foreground">Text</Label>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full border border-border shadow-sm overflow-hidden relative">
                            <input 
                              type="color" 
                              value={config.textColor}
                              onChange={(e) => setConfig({...config, textColor: e.target.value})}
                              className="absolute inset-[-50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                            />
                          </div>
                          <Input 
                            value={config.textColor}
                            onChange={(e) => setConfig({...config, textColor: e.target.value})}
                            className="font-mono text-xs h-8"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Shape & Effects</Label>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Border Radius</Label>
                        <span className="text-xs text-muted-foreground">{config.borderRadius}px</span>
                      </div>
                      <Slider 
                        value={[config.borderRadius]} 
                        min={0} 
                        max={24} 
                        step={1}
                        onValueChange={(val) => setConfig({...config, borderRadius: val[0]})} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label>Shadow</Label>
                        <Select value={config.shadow} onValueChange={(val) => setConfig({...config, shadow: val})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                       <div className="space-y-2">
                        <Label>Backdrop Blur</Label>
                         <div className="flex items-center h-10">
                           <Switch 
                            checked={config.backdropBlur}
                            onCheckedChange={(checked) => setConfig({...config, backdropBlur: checked})}
                          />
                         </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                     <Label className="text-base font-semibold">Buttons</Label>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label>Style</Label>
                        <Select value={config.buttonStyle} onValueChange={(val) => setConfig({...config, buttonStyle: val})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="filled">Filled</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Shape</Label>
                        <Select value={config.buttonShape} onValueChange={(val) => setConfig({...config, buttonShape: val})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pill">Pill</SelectItem>
                            <SelectItem value="rounded">Rounded</SelectItem>
                            <SelectItem value="sharp">Sharp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === "content" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-3">
                    <Label>Font Family</Label>
                     <Select value={config.fontFamily} onValueChange={(val) => setConfig({...config, fontFamily: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                   <div className="space-y-3">
                    <Label>Font Size</Label>
                     <Select value={config.fontSize} onValueChange={(val) => setConfig({...config, fontSize: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Compact</SelectItem>
                        <SelectItem value="medium">Standard</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Heading</Label>
                    <Input 
                      value={config.heading}
                      onChange={(e) => setConfig({...config, heading: e.target.value})}
                      data-testid="input-heading"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Description</Label>
                    <textarea 
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                      value={config.description}
                      onChange={(e) => setConfig({...config, description: e.target.value})}
                      data-testid="input-description"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Accept Button</Label>
                    <Input 
                      value={config.acceptText}
                      onChange={(e) => setConfig({...config, acceptText: e.target.value})}
                      data-testid="input-accept-text"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Reject Button</Label>
                    <Input 
                      value={config.rejectText}
                      onChange={(e) => setConfig({...config, rejectText: e.target.value})}
                      data-testid="input-reject-text"
                    />
                  </div>
                </div>
              )}

              {activeTab === "layout" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Position & Alignment</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 cursor-pointer transition-all ${config.position === 'bottom' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                        onClick={() => setConfig({...config, position: "bottom"})}
                      >
                         <div className="w-full h-12 bg-gray-100 rounded border border-gray-200 relative">
                          <div className="absolute bottom-1 left-1 right-1 h-3 bg-primary/50 rounded-sm"></div>
                        </div>
                        <span className="text-xs font-medium">Bottom Bar</span>
                      </div>
                      
                      <div 
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 cursor-pointer transition-all ${config.position === 'top-bar' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                        onClick={() => setConfig({...config, position: "top-bar"})}
                      >
                         <div className="w-full h-12 bg-gray-100 rounded border border-gray-200 relative">
                          <div className="absolute top-0 left-0 right-0 h-3 bg-primary/50 rounded-t-sm"></div>
                        </div>
                        <span className="text-xs font-medium">Top Bar</span>
                      </div>

                       <div 
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 cursor-pointer transition-all ${config.position === 'center' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                        onClick={() => setConfig({...config, position: "center"})}
                      >
                         <div className="w-full h-12 bg-gray-100 rounded border border-gray-200 relative flex items-center justify-center">
                          <div className="w-8 h-6 bg-primary/50 rounded-sm"></div>
                        </div>
                        <span className="text-xs font-medium">Center Modal</span>
                      </div>

                       <div 
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 cursor-pointer transition-all ${config.position === 'bottom-left' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                        onClick={() => setConfig({...config, position: "bottom-left"})}
                      >
                         <div className="w-full h-12 bg-gray-100 rounded border border-gray-200 relative">
                          <div className="absolute bottom-1 left-1 w-8 h-6 bg-primary/50 rounded-sm"></div>
                        </div>
                        <span className="text-xs font-medium">Bottom Left</span>
                      </div>

                       <div 
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 cursor-pointer transition-all ${config.position === 'bottom-right' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                        onClick={() => setConfig({...config, position: "bottom-right"})}
                      >
                         <div className="w-full h-12 bg-gray-100 rounded border border-gray-200 relative">
                          <div className="absolute bottom-1 right-1 w-8 h-6 bg-primary/50 rounded-sm"></div>
                        </div>
                        <span className="text-xs font-medium">Bottom Right</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                     <Label className="text-base font-semibold">Animation</Label>
                     <Select value={config.animation} onValueChange={(val) => setConfig({...config, animation: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slide-up">Slide Up</SelectItem>
                        <SelectItem value="fade">Fade In</SelectItem>
                        <SelectItem value="zoom">Zoom In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-icon">Show Icon</Label>
                    <Switch 
                      id="show-icon" 
                      checked={config.showIcon}
                      onCheckedChange={(checked) => setConfig({...config, showIcon: checked})}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Area */}
          <div className="lg:col-span-8 bg-muted/30 rounded-2xl border border-border/50 relative overflow-hidden flex flex-col">
            {/* Preview Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-black/50 backdrop-blur border border-border/50 rounded-full p-1 flex items-center gap-1 shadow-sm z-20">
              <button 
                onClick={() => setPreviewDevice("desktop")}
                className={`p-2 rounded-full transition-colors ${previewDevice === 'desktop' ? 'bg-primary text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
                title="Desktop view"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPreviewDevice("mobile")}
                className={`p-2 rounded-full transition-colors ${previewDevice === 'mobile' ? 'bg-primary text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
                title="Mobile view"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-border mx-1" />
              <button 
                onClick={() => {
                  setCategoryStates({ necessary: true, functional: true, analytics: true, marketing: true });
                  toast.success("Consent reset - all categories enabled");
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:bg-muted text-muted-foreground"
                title="Reset consent preferences"
                data-testid="button-reset-consent"
              >
                Reset Consent
              </button>
            </div>

            {/* Preview Viewport */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
              <div 
                className={`bg-white shadow-2xl transition-all duration-500 relative overflow-hidden flex flex-col ${
                  previewDevice === 'mobile' ? 'w-[375px] h-[667px] rounded-[3rem] border-8 border-gray-900' : 'w-full h-full rounded-lg border border-border'
                }`}
              >
                {/* Fake Website Content */}
                <div className="w-full h-full bg-slate-50 relative overflow-y-auto font-sans text-slate-900">
                  {/* Fake Nav */}
                  <div className="h-14 bg-white border-b flex items-center px-4 justify-between sticky top-0 z-0">
                    <div className="w-24 h-4 bg-slate-200 rounded"></div>
                    <div className="flex gap-2">
                      <div className="w-16 h-4 bg-slate-100 rounded"></div>
                      <div className="w-16 h-4 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                  {/* Fake Hero */}
                  <div className="h-64 bg-slate-100 m-4 rounded-xl flex items-center justify-center text-slate-300">
                     <BoxSelect className="w-12 h-12" />
                  </div>
                  <div className="space-y-3 px-4 pb-20">
                    <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-4 w-full bg-slate-100 rounded"></div>
                    <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                    <div className="h-4 w-4/6 bg-slate-100 rounded"></div>
                    <br />
                     <div className="h-4 w-full bg-slate-100 rounded"></div>
                    <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                    <div className="h-4 w-4/6 bg-slate-100 rounded"></div>
                  </div>
                  
                  {/* THE BANNER PREVIEW */}
                  <div className={`absolute inset-0 pointer-events-none z-50 flex ${
                    config.position === 'bottom' ? 'items-end' : 
                    config.position === 'bottom-left' ? 'items-end justify-start p-4' : 
                    config.position === 'bottom-right' ? 'items-end justify-end p-4' : 
                    config.position === 'center' ? 'items-center justify-center p-4 bg-black/40 backdrop-blur-sm' : 
                    config.position === 'top-bar' ? 'items-start' : 'items-end'
                  }`}>
                    <motion.div 
                      layout
                      key={config.position + config.animation}
                      initial={config.animation === 'slide-up' ? { y: 100, opacity: 0 } : config.animation === 'zoom' ? { scale: 0.5, opacity: 0 } : { opacity: 0 }}
                      animate={config.animation === 'slide-up' ? { y: 0, opacity: 1 } : config.animation === 'zoom' ? { scale: 1, opacity: 1 } : { opacity: 1 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      className={`pointer-events-auto ${
                        config.position === 'bottom' || config.position === 'top-bar' ? 'w-full' : 
                        previewDevice === 'mobile' ? 'w-[calc(100%-2rem)]' : 'max-w-md'
                      }`}
                      style={{
                        backgroundColor: config.backgroundColor,
                        color: config.textColor,
                        borderRadius: config.position === 'bottom' || config.position === 'top-bar' ? 0 : config.borderRadius,
                        boxShadow: config.shadow === 'none' ? 'none' : 
                                   config.shadow === 'small' ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 
                                   config.shadow === 'medium' ? '0 8px 30px rgba(0, 0, 0, 0.12)' : 
                                   '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        backdropFilter: config.backdropBlur ? 'blur(8px)' : 'none',
                        fontFamily: config.fontFamily,
                        fontSize: config.fontSize === 'small' ? '13px' : config.fontSize === 'large' ? '16px' : '14px',
                      }}
                    >
                      <div className="p-5 flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                          {config.showIcon && (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
                              <Shield className="w-5 h-5" style={{ color: config.primaryColor }} />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1" style={{ color: config.textColor }}>{config.heading}</h3>
                            <p className="text-sm opacity-80 leading-relaxed">{config.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-end">
                          <button 
                            className="px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
                            style={{
                              color: config.primaryColor,
                              borderRadius: config.buttonShape === 'pill' ? 999 : config.buttonShape === 'rounded' ? 8 : 0,
                            }}
                            onClick={() => setShowPreferencesPreview(true)}
                            data-testid="button-banner-preferences"
                          >
                            {config.settingsText}
                          </button>
                          <button 
                            className="px-4 py-2 text-sm font-medium border transition-colors"
                            style={{
                              color: config.buttonStyle === 'filled' ? config.textColor : config.primaryColor,
                              backgroundColor: config.buttonStyle === 'filled' ? 'transparent' : 'transparent',
                              borderColor: config.primaryColor,
                              borderRadius: config.buttonShape === 'pill' ? 999 : config.buttonShape === 'rounded' ? 8 : 0,
                            }}
                          >
                            {config.rejectText}
                          </button>
                          <button 
                            className="px-4 py-2 text-sm font-medium transition-colors"
                            style={{
                              color: '#fff',
                              backgroundColor: config.primaryColor,
                              borderRadius: config.buttonShape === 'pill' ? 999 : config.buttonShape === 'rounded' ? 8 : 0,
                            }}
                          >
                            {config.acceptText}
                          </button>
                        </div>
                      </div>
                      {isSoloPlan && (
                        <div 
                          className="text-center text-[11px] py-2 border-t opacity-60"
                          style={{ borderColor: 'rgba(0,0,0,0.05)' }}
                        >
                          Powered by ConsentEase
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal Preview */}
      <AnimatePresence>
        {showPreferencesPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowPreferencesPreview(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
              style={{
                backgroundColor: config.backgroundColor,
                color: config.textColor,
                borderRadius: config.borderRadius,
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                fontFamily: config.fontFamily,
              }}
            >
              {/* Header */}
              <div className="p-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Cookie Preferences</h3>
                  <button 
                    onClick={() => setShowPreferencesPreview(false)}
                    className="p-1 rounded hover:bg-black/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm opacity-70 mt-1">
                  Customize your cookie preferences below. Required cookies are necessary for the website to function properly.
                </p>
              </div>

              {/* Categories */}
              <div className="flex-1 overflow-y-auto">
                {previewCategories.map((cat) => (
                  <div 
                    key={cat.name} 
                    className="p-4 border-b"
                    style={{ borderColor: 'rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cat.displayName}</span>
                        {cat.isRequired && (
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded font-medium"
                            style={{ 
                              backgroundColor: `${config.primaryColor}20`,
                              color: config.primaryColor,
                            }}
                          >
                            Required
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (!cat.isRequired) {
                            setCategoryStates(prev => ({
                              ...prev,
                              [cat.name]: !prev[cat.name as keyof typeof prev],
                            }));
                          }
                        }}
                        className={`relative w-11 h-6 rounded-full transition-colors ${cat.isRequired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{
                          backgroundColor: categoryStates[cat.name as keyof typeof categoryStates] ? config.primaryColor : 'rgba(0,0,0,0.2)',
                        }}
                        disabled={cat.isRequired}
                      >
                        <span 
                          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                          style={{
                            left: '2px',
                            transform: categoryStates[cat.name as keyof typeof categoryStates] ? 'translateX(20px)' : 'translateX(0)',
                          }}
                        />
                      </button>
                    </div>
                    <p className="text-sm opacity-70">{cat.description}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t flex gap-2 justify-end" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <button 
                  className="px-4 py-2 text-sm font-medium border transition-colors"
                  style={{
                    color: config.primaryColor,
                    borderColor: config.primaryColor,
                    borderRadius: config.buttonShape === 'pill' ? 999 : config.buttonShape === 'rounded' ? 8 : 0,
                  }}
                  onClick={() => {
                    setCategoryStates({ necessary: true, functional: false, analytics: false, marketing: false });
                    setShowPreferencesPreview(false);
                    toast.info("Preview: Rejected non-essential cookies");
                  }}
                >
                  Reject All
                </button>
                <button 
                  className="px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    color: '#fff',
                    backgroundColor: config.primaryColor,
                    borderRadius: config.buttonShape === 'pill' ? 999 : config.buttonShape === 'rounded' ? 8 : 0,
                  }}
                  onClick={() => {
                    setCategoryStates({ necessary: true, functional: true, analytics: true, marketing: true });
                    setShowPreferencesPreview(false);
                    toast.info("Preview: Accepted all cookies");
                  }}
                >
                  Accept All
                </button>
                <button 
                  className="px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    color: '#fff',
                    backgroundColor: config.primaryColor,
                    borderRadius: config.buttonShape === 'pill' ? 999 : config.buttonShape === 'rounded' ? 8 : 0,
                  }}
                  onClick={() => {
                    setShowPreferencesPreview(false);
                    toast.info("Preview: Saved preferences");
                  }}
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
