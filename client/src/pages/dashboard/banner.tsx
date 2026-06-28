import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link, useSearch } from "wouter";
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
import { ArrowCounterClockwise, FloppyDisk, Monitor, DeviceMobile, Palette, Layout, TextT, BoundingBox, Globe, Sparkle, Lock, X, SlidersHorizontal, Link as LinkIcon, Clock, Timer, Translate, CheckCircle, WarningCircle, ShieldCheck, UploadSimple, Trash, Image, Plus } from "@phosphor-icons/react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import defaultLogoImage from "/consentease-logo.webp";
import { translations, supportedLanguages, getTranslation, BannerTranslations } from "@shared/translations";
import { Spinner } from "@/components/ui/spinner";

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
  borderColor: string;
  borderWidth: number;
  secondaryButtonColor: string;
  maxWidth: number;
  showOverlay: boolean;
  overlayOpacity: number;
  logoUrl: string | null;
  displayDelay: number;
  autoHideDelay: number | null;
  showCloseButton: boolean;
  reconsentDays: number;
  respectDnt: boolean;
  privacyPolicyUrl: string | null;
  privacyPolicyText: string;
  cookiePolicyUrl: string | null;
  cookiePolicyText: string;
  customFooter: string | null;
  language: string;
  translations: string | null;
  buttonLayout: 'inline' | 'stacked' | 'auto';
  autoDetectLanguage: boolean;
  headingFontSize: 'small' | 'medium' | 'large';
  descriptionFontSize: 'small' | 'medium' | 'large';
  fontWeight: 'normal' | 'medium' | 'semibold';
  excludedPaths: string[];
  showRevisitButton: boolean;
  revisitButtonPosition: 'bottom-left' | 'bottom-right';
  revisitButtonColor: string | null;
  revisitButtonLogoUrl: string | null;
  revisitButtonShape: 'circle' | 'rounded' | 'square';
}

function TranslationPreview({ language }: { language: string }) {
  const t = getTranslation(language);
  
  return (
    <div className="space-y-3 text-sm">
      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Heading:</span>
          <span className="font-medium text-right max-w-[200px] truncate">{t.heading}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Accept:</span>
          <span className="font-medium">{t.acceptAll}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Reject:</span>
          <span className="font-medium">{t.rejectAll}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Settings:</span>
          <span className="font-medium">{t.settingsText}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Save:</span>
          <span className="font-medium">{t.savePreferences}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Required:</span>
          <span className="font-medium">{t.required}</span>
        </div>
      </div>
    </div>
  );
}

function LogoUploader({ websiteId, target, currentUrl, onUploaded, onRemoved, defaultImage }: {
  websiteId: string;
  target: 'banner' | 'revisit';
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  onRemoved: () => void;
  defaultImage: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch(`/api/websites/${websiteId}/logo?target=${target}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || err.message || 'Upload failed');
      }
      const data = await res.json();
      onUploaded(data.url);
      toast.success('Logo uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/logo?target=${target}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove logo');
      onRemoved();
      toast.success('Logo removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove logo');
    }
  };

  const hasCustomLogo = currentUrl && currentUrl !== defaultImage;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-md border border-border flex items-center justify-center bg-muted/30 overflow-hidden">
          <img
            src={currentUrl || defaultImage}
            alt="Logo preview"
            className="w-10 h-10 object-contain"
            data-testid={`img-logo-preview-${target}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleUpload}
            data-testid={`input-logo-file-${target}`}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            data-testid={`button-upload-logo-${target}`}
          >
            {uploading ? (
              <Spinner size={16} className="mr-1" />
            ) : (
              <UploadSimple size={16} className="mr-1" />
            )}
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
          {hasCustomLogo && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              data-testid={`button-remove-logo-${target}`}
            >
              <Trash size={16} className="text-destructive" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        PNG, JPG, WebP, or SVG. Max 512KB, 200x200px.
      </p>
    </div>
  );
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
  borderColor: "#e5e7eb",
  borderWidth: 1,
  secondaryButtonColor: "#6b7280",
  maxWidth: 400,
  showOverlay: false,
  overlayOpacity: 50,
  logoUrl: null as string | null,
  displayDelay: 0,
  autoHideDelay: null as number | null,
  showCloseButton: false,
  reconsentDays: 365,
  respectDnt: false,
  privacyPolicyUrl: null as string | null,
  privacyPolicyText: "Privacy Policy",
  cookiePolicyUrl: null as string | null,
  cookiePolicyText: "Cookie Policy",
  customFooter: null as string | null,
  language: "en",
  translations: null as string | null,
  buttonLayout: "auto" as 'inline' | 'stacked' | 'auto',
  autoDetectLanguage: false,
  headingFontSize: "medium" as 'small' | 'medium' | 'large',
  descriptionFontSize: "medium" as 'small' | 'medium' | 'large',
  fontWeight: "medium" as 'normal' | 'medium' | 'semibold',
  excludedPaths: [] as string[],
  showRevisitButton: true,
  revisitButtonPosition: "bottom-left" as 'bottom-left' | 'bottom-right',
  revisitButtonColor: null as string | null,
  revisitButtonLogoUrl: null as string | null,
  revisitButtonShape: "circle" as 'circle' | 'rounded' | 'square',
};

const bannerPresets = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and subtle',
    config: {
      position: 'bottom-left',
      primaryColor: '#726CEA',
      backgroundColor: '#ffffff',
      textColor: '#1e1e1e',
      borderRadius: 12,
      shadow: 'medium',
      buttonStyle: 'filled',
      buttonShape: 'rounded',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      showOverlay: false,
      animation: 'slide-up',
      backdropBlur: true,
      showIcon: false,
      maxWidth: 380,
    }
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'High visibility',
    config: {
      position: 'bottom-bar',
      primaryColor: '#726CEA',
      backgroundColor: '#1e1e1e',
      textColor: '#ffffff',
      borderRadius: 0,
      shadow: 'large',
      buttonStyle: 'filled',
      buttonShape: 'pill',
      borderWidth: 0,
      borderColor: '#1e1e1e',
      showOverlay: true,
      overlayOpacity: 30,
      animation: 'slide-up',
      backdropBlur: false,
      showIcon: true,
      maxWidth: 900,
    }
  },
  {
    id: 'corner',
    name: 'Corner',
    description: 'Bottom-right popup',
    config: {
      position: 'bottom-right',
      primaryColor: '#22c55e',
      backgroundColor: '#ffffff',
      textColor: '#1e1e1e',
      borderRadius: 16,
      shadow: 'large',
      buttonStyle: 'filled',
      buttonShape: 'rounded',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      showOverlay: false,
      animation: 'slide-up',
      backdropBlur: true,
      showIcon: true,
      maxWidth: 400,
    }
  },
  {
    id: 'center',
    name: 'Centered',
    description: 'Modal overlay',
    config: {
      position: 'center',
      primaryColor: '#726CEA',
      backgroundColor: '#ffffff',
      textColor: '#1e1e1e',
      borderRadius: 16,
      shadow: 'large',
      buttonStyle: 'filled',
      buttonShape: 'rounded',
      borderWidth: 0,
      borderColor: '#ffffff',
      showOverlay: true,
      overlayOpacity: 50,
      animation: 'fade',
      backdropBlur: true,
      showIcon: true,
      maxWidth: 480,
    }
  },
];

export default function BannerConfigurator() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const queryClient = useQueryClient();
  const queryWebsiteId = new URLSearchParams(searchString).get("websiteId");
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(queryWebsiteId);
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

  const { data: ownWebsites = [], isLoading: websitesLoading } = useQuery<Website[]>({
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

  const { data: agencyWebsites = [] } = useQuery<(Website & { clientName?: string })[]>({
    queryKey: ["/api/agency/websites"],
    queryFn: async () => {
      const res = await fetch("/api/agency/websites", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user && ['agency', 'agency_pro'].includes(user.plan || ''),
  });

  const websites = [
    ...ownWebsites,
    ...agencyWebsites.filter(aw => !ownWebsites.some(ow => ow.id === aw.id)),
  ];
  
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

  // Query to check if policies exist for this website
  interface PolicyStatus {
    hasPrivacyPolicy: boolean;
    hasCookiePolicy: boolean;
  }
  const { data: policyStatus } = useQuery<PolicyStatus>({
    queryKey: ["/api/policies", activeWebsiteId, "status"],
    queryFn: async () => {
      if (!activeWebsiteId) return { hasPrivacyPolicy: false, hasCookiePolicy: false };
      const res = await fetch(`/api/policies/${activeWebsiteId}`, { credentials: "include" });
      if (!res.ok) return { hasPrivacyPolicy: false, hasCookiePolicy: false };
      const policies = await res.json();
      return {
        hasPrivacyPolicy: policies.some((p: { type: string; status: string }) => p.type === 'privacy' && p.status === 'published'),
        hasCookiePolicy: policies.some((p: { type: string; status: string }) => p.type === 'cookie' && p.status === 'published'),
      };
    },
    enabled: !!activeWebsiteId,
  });

  const mapBannerConfigToState = (bc: BannerConfig) => ({
    heading: bc.heading,
    description: bc.description,
    acceptText: bc.acceptText,
    rejectText: bc.rejectText,
    settingsText: bc.settingsText,
    position: bc.position === 'bottom' ? 'bottom-bar' : bc.position,
    theme: bc.theme,
    primaryColor: bc.primaryColor,
    backgroundColor: bc.backgroundColor,
    textColor: bc.textColor,
    borderRadius: bc.borderRadius,
    showIcon: bc.showIcon,
    fontFamily: bc.fontFamily,
    fontSize: bc.fontSize,
    shadow: bc.shadow,
    backdropBlur: bc.backdropBlur,
    animation: bc.animation,
    buttonStyle: bc.buttonStyle,
    buttonShape: bc.buttonShape,
    borderColor: bc.borderColor ?? "#e5e7eb",
    borderWidth: bc.borderWidth ?? 1,
    secondaryButtonColor: bc.secondaryButtonColor ?? "#6b7280",
    maxWidth: bc.maxWidth ?? 400,
    showOverlay: bc.showOverlay ?? false,
    overlayOpacity: bc.overlayOpacity ?? 50,
    logoUrl: bc.logoUrl,
    displayDelay: bc.displayDelay ?? 0,
    autoHideDelay: bc.autoHideDelay,
    showCloseButton: bc.showCloseButton ?? false,
    reconsentDays: bc.reconsentDays ?? 365,
    respectDnt: bc.respectDnt ?? false,
    privacyPolicyUrl: bc.privacyPolicyUrl,
    privacyPolicyText: bc.privacyPolicyText ?? "Privacy Policy",
    cookiePolicyUrl: bc.cookiePolicyUrl,
    cookiePolicyText: bc.cookiePolicyText ?? "Cookie Policy",
    customFooter: bc.customFooter,
    language: bc.language ?? "en",
    translations: bc.translations,
    buttonLayout: (bc.buttonLayout ?? "auto") as 'inline' | 'stacked' | 'auto',
    autoDetectLanguage: bc.autoDetectLanguage ?? false,
    headingFontSize: (bc.headingFontSize ?? "medium") as 'small' | 'medium' | 'large',
    descriptionFontSize: (bc.descriptionFontSize ?? "medium") as 'small' | 'medium' | 'large',
    fontWeight: (bc.fontWeight ?? "medium") as 'normal' | 'medium' | 'semibold',
    excludedPaths: bc.excludedPaths ?? [],
    showRevisitButton: bc.showRevisitButton ?? true,
    revisitButtonPosition: (bc.revisitButtonPosition ?? "bottom-left") as 'bottom-left' | 'bottom-right',
    revisitButtonColor: bc.revisitButtonColor ?? null,
    revisitButtonLogoUrl: bc.revisitButtonLogoUrl ?? null,
    revisitButtonShape: (bc.revisitButtonShape ?? "circle") as 'circle' | 'rounded' | 'square',
  });

  useEffect(() => {
    if (bannerConfig) {
      setConfig(mapBannerConfigToState(bannerConfig));
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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save banner settings");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites", activeWebsiteId, "banner"] });
      toast.success("Banner settings saved!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleReset = () => {
    if (bannerConfig) {
      setConfig(mapBannerConfigToState(bannerConfig));
    }
  };

  if (websitesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Spinner size={32} className="text-primary" />
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
          description="Add a website first to customize your banner."
          action={{ label: "Add Website", onClick: () => setLocation("/dashboard"), icon: Plus }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:h-[calc(100vh-8rem)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-display font-bold">Banner Design</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Customize how the consent banner looks on your site.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {websites.length > 1 && (
              <Select value={selectedWebsiteId || websites[0]?.id} onValueChange={setSelectedWebsiteId}>
                <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-website">
                  <SelectValue placeholder="Select website" />
                </SelectTrigger>
                <SelectContent>
                  {websites.map((site) => {
                    const isClientSite = agencyWebsites.some(aw => aw.id === site.id);
                    return (
                      <SelectItem key={site.id} value={site.id}>
                        {site.domain}{isClientSite ? ` (client)` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" onClick={handleReset} data-testid="button-reset">
              <ArrowCounterClockwise size={16} className="mr-2" />
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
                <Spinner size={16} className="mr-2" />
              ) : (
                <FloppyDisk size={16} className="mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {isSoloPlan && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800" data-testid="alert-solo-branding">
            <Lock size={16} className="text-amber-600 flex-shrink-0" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-amber-800 dark:text-amber-200 text-sm">
                Solo plan banners include "Powered by ConsentEase" branding.
              </span>
              <Link href="/dashboard/settings?upgrade=true">
                <Button size="sm" variant="outline" className="gap-1 border-amber-300 text-amber-700 hover:bg-amber-100 whitespace-nowrap">
                  <Sparkle size={12} />
                  Upgrade to remove
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 min-h-0 pb-4 lg:pb-0">
          {/* Controls Panel */}
          <Card className="lg:col-span-4 max-h-[50vh] lg:max-h-none lg:h-full overflow-hidden flex flex-col border-none shadow-lg order-2 lg:order-1" data-tour="banner-styles">
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkle size={14} className="text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Quick Start</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {bannerPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setConfig({ ...config, ...preset.config })}
                    className="p-2 rounded-md border text-center transition-colors hover-elevate"
                    data-testid={`button-preset-${preset.id}`}
                  >
                    <span className="text-xs font-medium block">{preset.name}</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">{preset.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="p-1">
              <Tabs defaultValue="appearance" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-5 h-auto">
                  <TabsTrigger value="appearance" className="gap-1 flex-col py-2 text-xs"><Palette size={16}/> Style</TabsTrigger>
                  <TabsTrigger value="content" className="gap-1 flex-col py-2 text-xs"><TextT size={16}/> Content</TabsTrigger>
                  <TabsTrigger value="layout" className="gap-1 flex-col py-2 text-xs"><Layout size={16}/> Layout</TabsTrigger>
                  <TabsTrigger value="behavior" className="gap-1 flex-col py-2 text-xs"><SlidersHorizontal size={16}/> Behavior</TabsTrigger>
                  <TabsTrigger value="links" className="gap-1 flex-col py-2 text-xs"><LinkIcon size={16}/> Links</TabsTrigger>
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
                          <div className="w-8 h-8 rounded-full border border-border shadow-sm overflow-hidden relative">
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
                          <div className="w-8 h-8 rounded-full border border-border shadow-sm overflow-hidden relative">
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
                          <div className="w-8 h-8 rounded-full border border-border shadow-sm overflow-hidden relative">
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
                     <div className="space-y-2">
                       <Label className="text-xs text-muted-foreground">Secondary Button Color</Label>
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full border border-border shadow-sm overflow-hidden relative">
                           <input 
                             type="color" 
                             value={config.secondaryButtonColor}
                             onChange={(e) => setConfig({...config, secondaryButtonColor: e.target.value})}
                             className="absolute inset-[-50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                           />
                         </div>
                         <Input 
                           value={config.secondaryButtonColor}
                           onChange={(e) => setConfig({...config, secondaryButtonColor: e.target.value})}
                           className="font-mono text-xs h-8"
                           maxLength={7}
                         />
                       </div>
                     </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Border</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Border Color</Label>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full border border-border shadow-sm overflow-hidden relative">
                            <input 
                              type="color" 
                              value={config.borderColor}
                              onChange={(e) => setConfig({...config, borderColor: e.target.value})}
                              className="absolute inset-[-50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                            />
                          </div>
                          <Input 
                            value={config.borderColor}
                            onChange={(e) => setConfig({...config, borderColor: e.target.value})}
                            className="font-mono text-xs h-8"
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Width</Label>
                          <span className="text-xs text-muted-foreground">{config.borderWidth}px</span>
                        </div>
                        <Slider 
                          value={[config.borderWidth]} 
                          min={0} 
                          max={4} 
                          step={1}
                          onValueChange={(val) => setConfig({...config, borderWidth: val[0]})} 
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Overlay</Label>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Overlay</Label>
                        <p className="text-xs text-muted-foreground">Dark backdrop behind banner</p>
                      </div>
                      <Switch 
                        checked={config.showOverlay}
                        onCheckedChange={(checked) => setConfig({...config, showOverlay: checked})}
                      />
                    </div>
                    {config.showOverlay && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Opacity</Label>
                          <span className="text-xs text-muted-foreground">{config.overlayOpacity}%</span>
                        </div>
                        <Slider 
                          value={[config.overlayOpacity]} 
                          min={10} 
                          max={90} 
                          step={5}
                          onValueChange={(val) => setConfig({...config, overlayOpacity: val[0]})} 
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Size</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Max Width</Label>
                        <span className="text-xs text-muted-foreground">{config.maxWidth}px</span>
                      </div>
                      <Slider 
                        value={[config.maxWidth]} 
                        min={300} 
                        max={600} 
                        step={25}
                        onValueChange={(val) => setConfig({...config, maxWidth: val[0]})} 
                      />
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
                        <SelectItem value="inherit">Inherit (use website font)</SelectItem>
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

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Typography</Label>
                    <div className="space-y-3">
                      <Label>Heading Font Size</Label>
                      <Select value={config.headingFontSize} onValueChange={(val: 'small' | 'medium' | 'large') => setConfig({...config, headingFontSize: val})}>
                        <SelectTrigger data-testid="select-heading-font-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label>Description Font Size</Label>
                      <Select value={config.descriptionFontSize} onValueChange={(val: 'small' | 'medium' | 'large') => setConfig({...config, descriptionFontSize: val})}>
                        <SelectTrigger data-testid="select-description-font-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label>Font Weight</Label>
                      <Select value={config.fontWeight} onValueChange={(val: 'normal' | 'medium' | 'semibold') => setConfig({...config, fontWeight: val})}>
                        <SelectTrigger data-testid="select-font-weight">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="semibold">Semibold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                  <div className="space-y-3">
                    <Label>Preferences Button</Label>
                    <Input 
                      value={config.settingsText}
                      onChange={(e) => setConfig({...config, settingsText: e.target.value})}
                      data-testid="input-settings-text"
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
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 cursor-pointer transition-all ${config.position === 'bottom-bar' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                        onClick={() => setConfig({...config, position: "bottom-bar"})}
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
                        <SelectItem value="slide-down">Slide Down</SelectItem>
                        <SelectItem value="fade">Fade In</SelectItem>
                        <SelectItem value="zoom">Zoom In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Button Layout</Label>
                    <Select value={config.buttonLayout} onValueChange={(val: 'inline' | 'stacked' | 'auto') => setConfig({...config, buttonLayout: val})}>
                      <SelectTrigger data-testid="select-button-layout">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inline">Inline (Side by side)</SelectItem>
                        <SelectItem value="stacked">Stacked (Full width)</SelectItem>
                        <SelectItem value="auto">Auto (Stacked on mobile)</SelectItem>
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

              {activeTab === "behavior" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Timing</Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Display Delay</Label>
                          <span className="text-xs text-muted-foreground">{config.displayDelay}s</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Wait before showing banner</p>
                        <Slider 
                          value={[config.displayDelay]} 
                          min={0} 
                          max={10} 
                          step={1}
                          onValueChange={(val) => setConfig({...config, displayDelay: val[0]})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Auto-hide Timer</Label>
                          <span className="text-xs text-muted-foreground">
                            {config.autoHideDelay ? `${config.autoHideDelay}s` : 'Off'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Hide banner automatically (0 = disabled)</p>
                        <Slider 
                          value={[config.autoHideDelay || 0]} 
                          min={0} 
                          max={60} 
                          step={5}
                          onValueChange={(val) => setConfig({...config, autoHideDelay: val[0] === 0 ? null : val[0]})} 
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Consent Settings</Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Re-consent Period</Label>
                          <span className="text-xs text-muted-foreground">{config.reconsentDays} days</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Ask for consent again after</p>
                        <Slider 
                          value={[config.reconsentDays]} 
                          min={30} 
                          max={730} 
                          step={30}
                          onValueChange={(val) => setConfig({...config, reconsentDays: val[0]})} 
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Controls</Label>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Close Button</Label>
                        <p className="text-xs text-muted-foreground">Allow dismissing without consent</p>
                      </div>
                      <Switch 
                        checked={config.showCloseButton}
                        onCheckedChange={(checked) => setConfig({...config, showCloseButton: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Respect Do Not Track</Label>
                        <p className="text-xs text-muted-foreground">Honor browser DNT setting</p>
                      </div>
                      <Switch 
                        checked={config.respectDnt}
                        onCheckedChange={(checked) => setConfig({...config, respectDnt: checked})}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Revisit Consent Button</Label>
                    <p className="text-xs text-muted-foreground">A floating button that allows visitors to reopen the consent banner and change their preferences at any time (GDPR requirement).</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Revisit Button</Label>
                        <p className="text-xs text-muted-foreground">Floating privacy shield icon</p>
                      </div>
                      <Switch 
                        checked={config.showRevisitButton}
                        onCheckedChange={(checked) => setConfig({...config, showRevisitButton: checked})}
                        data-testid="switch-show-revisit-button"
                      />
                    </div>
                    {config.showRevisitButton && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Position</Label>
                          <Select value={config.revisitButtonPosition} onValueChange={(val: 'bottom-left' | 'bottom-right') => setConfig({...config, revisitButtonPosition: val})}>
                            <SelectTrigger data-testid="select-revisit-position">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bottom-left">Bottom Left</SelectItem>
                              <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Button Color</Label>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full border border-border shadow-sm overflow-hidden relative">
                              <input 
                                type="color" 
                                value={config.revisitButtonColor || config.primaryColor}
                                onChange={(e) => setConfig({...config, revisitButtonColor: e.target.value})}
                                className="absolute inset-[-50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                                data-testid="input-revisit-button-color"
                              />
                            </div>
                            <Input 
                              value={config.revisitButtonColor || config.primaryColor}
                              onChange={(e) => setConfig({...config, revisitButtonColor: e.target.value})}
                              className="font-mono text-xs h-8"
                              maxLength={7}
                            />
                            {config.revisitButtonColor && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfig({...config, revisitButtonColor: null})}
                                className="text-xs"
                              >
                                Use primary
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Button Logo</Label>
                          {activeWebsiteId && (
                            <LogoUploader
                              websiteId={activeWebsiteId}
                              target="revisit"
                              currentUrl={config.revisitButtonLogoUrl}
                              onUploaded={(url) => setConfig({...config, revisitButtonLogoUrl: url})}
                              onRemoved={() => setConfig({...config, revisitButtonLogoUrl: null})}
                              defaultImage={defaultLogoImage}
                            />
                          )}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Or enter a URL</Label>
                            <Input
                              value={config.revisitButtonLogoUrl || ''}
                              onChange={(e) => setConfig({...config, revisitButtonLogoUrl: e.target.value || null})}
                              placeholder="https://yoursite.com/icon.png"
                              data-testid="input-revisit-logo-url"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Button Shape</Label>
                          <Select
                            value={config.revisitButtonShape}
                            onValueChange={(value) => setConfig({...config, revisitButtonShape: value as 'circle' | 'rounded' | 'square'})}
                          >
                            <SelectTrigger data-testid="select-revisit-button-shape">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="circle">Circle</SelectItem>
                              <SelectItem value="rounded">Rounded Square</SelectItem>
                              <SelectItem value="square">Square</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Language</Label>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-detect Language</Label>
                        <p className="text-xs text-muted-foreground">Detect from browser settings</p>
                      </div>
                      <Switch 
                        checked={config.autoDetectLanguage}
                        onCheckedChange={(checked) => setConfig({...config, autoDetectLanguage: checked})}
                        data-testid="switch-auto-detect-language"
                      />
                    </div>
                    {config.autoDetectLanguage && (
                      <p className="text-xs text-primary bg-primary/10 rounded-md p-2">
                        Language will be detected from browser settings
                      </p>
                    )}
                    <Select 
                      value={config.language} 
                      onValueChange={(val) => setConfig({...config, language: val})}
                      disabled={config.autoDetectLanguage}
                    >
                      <SelectTrigger data-testid="select-language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose a default language for the banner UI labels
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Translation Preview</Label>
                      <Translate size={16} className="text-muted-foreground" />
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                      <TranslationPreview language={config.language} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      These translations are automatically applied based on your selected language. The banner and preferences modal text will use these localized strings.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Excluded Pages</Label>
                    <p className="text-xs text-muted-foreground">Pages where the banner will not be shown. Use paths like /checkout or subdomain patterns like app.example.com</p>
                    <div className="space-y-2">
                      {config.excludedPaths.map((path, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={path}
                            onChange={(e) => {
                              const newPaths = [...config.excludedPaths];
                              newPaths[index] = e.target.value;
                              setConfig({...config, excludedPaths: newPaths});
                            }}
                            placeholder="/checkout or app.example.com"
                            className="font-mono text-xs"
                            data-testid={`input-excluded-path-${index}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newPaths = config.excludedPaths.filter((_, i) => i !== index);
                              setConfig({...config, excludedPaths: newPaths});
                            }}
                            data-testid={`button-remove-path-${index}`}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfig({...config, excludedPaths: [...config.excludedPaths, '']})}
                        data-testid="button-add-excluded-path"
                      >
                        Add Path
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "links" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-base font-semibold">Privacy Policy</Label>
                      {policyStatus?.hasPrivacyPolicy ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                          <WarningCircle size={12} className="mr-1" />
                          Not generated
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Link Text</Label>
                        <Input 
                          value={config.privacyPolicyText}
                          onChange={(e) => setConfig({...config, privacyPolicyText: e.target.value})}
                          placeholder="Privacy Policy"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">URL</Label>
                        <Input 
                          value={config.privacyPolicyUrl || ''}
                          onChange={(e) => setConfig({...config, privacyPolicyUrl: e.target.value || null})}
                          placeholder="https://yoursite.com/privacy"
                        />
                      </div>
                      {!policyStatus?.hasPrivacyPolicy && !config.privacyPolicyUrl && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Generate a Privacy Policy in the Policy Generator to auto-fill this URL.
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-base font-semibold">Cookie Policy</Label>
                      {policyStatus?.hasCookiePolicy ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                          <WarningCircle size={12} className="mr-1" />
                          Not generated
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Link Text</Label>
                        <Input 
                          value={config.cookiePolicyText}
                          onChange={(e) => setConfig({...config, cookiePolicyText: e.target.value})}
                          placeholder="Cookie Policy"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">URL</Label>
                        <Input 
                          value={config.cookiePolicyUrl || ''}
                          onChange={(e) => setConfig({...config, cookiePolicyUrl: e.target.value || null})}
                          placeholder="https://yoursite.com/cookies"
                        />
                      </div>
                      {!policyStatus?.hasCookiePolicy && !config.cookiePolicyUrl && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Generate a Cookie Policy in the Policy Generator to auto-fill this URL.
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Custom Footer</Label>
                    <div className="space-y-2">
                      <textarea 
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                        value={config.customFooter || ''}
                        onChange={(e) => setConfig({...config, customFooter: e.target.value || null})}
                        placeholder="Add custom text at the bottom of your banner..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Appears below the buttons. HTML is not supported.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Logo</Label>
                    {activeWebsiteId && (
                      <LogoUploader
                        websiteId={activeWebsiteId}
                        target="banner"
                        currentUrl={config.logoUrl}
                        onUploaded={(url) => setConfig({...config, logoUrl: url})}
                        onRemoved={() => setConfig({...config, logoUrl: null})}
                        defaultImage={defaultLogoImage}
                      />
                    )}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Or enter a URL</Label>
                      <Input 
                        value={config.logoUrl || ''}
                        onChange={(e) => setConfig({...config, logoUrl: e.target.value || null})}
                        placeholder="https://yoursite.com/logo.png"
                        data-testid="input-logo-url"
                      />
                      <p className="text-xs text-muted-foreground">
                        Display your logo at the top of the banner
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Area */}
          <div className="lg:col-span-8 bg-muted/30 rounded-2xl border border-border/50 relative overflow-hidden flex flex-col h-[300px] sm:h-[400px] lg:h-auto order-1 lg:order-2" data-tour="banner-preview">
            {/* Preview Toolbar */}
            <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-black/50 backdrop-blur border border-border/50 rounded-full p-1 flex items-center gap-1 shadow-sm z-20">
              <button 
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 sm:p-2 rounded-full transition-colors ${previewDevice === 'desktop' ? 'bg-primary text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <Monitor size={12} className="sm:w-4 sm:h-4" />
              </button>
              <button 
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 sm:p-2 rounded-full transition-colors ${previewDevice === 'mobile' ? 'bg-primary text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <DeviceMobile size={12} className="sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Preview Viewport */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
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
                     <BoundingBox size={48} />
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
                  
                  {/* Overlay for banner preview */}
                  {config.showOverlay && (
                    <div 
                      className="absolute inset-0 z-40 pointer-events-none"
                      style={{ backgroundColor: `rgba(0,0,0,${config.overlayOpacity / 100})` }}
                    />
                  )}
                  
                  {/* THE BANNER PREVIEW */}
                  <div className={`absolute inset-0 pointer-events-none z-50 flex ${
                    config.position === 'bottom' || config.position === 'bottom-bar' ? 'items-end' : 
                    config.position === 'bottom-left' ? 'items-end justify-start p-4' : 
                    config.position === 'bottom-right' ? 'items-end justify-end p-4' : 
                    config.position === 'center' ? `items-center justify-center p-4 ${!config.showOverlay ? 'bg-black/40 backdrop-blur-sm' : ''}` : 
                    config.position === 'top-bar' ? 'items-start' : 'items-end'
                  }`}>
                    <motion.div 
                      layout
                      key={config.position + config.animation}
                      initial={config.animation === 'slide-up' ? { y: 100, opacity: 0 } : config.animation === 'slide-down' ? { y: -100, opacity: 0 } : config.animation === 'zoom' ? { scale: 0.5, opacity: 0 } : { opacity: 0 }}
                      animate={config.animation === 'slide-up' ? { y: 0, opacity: 1 } : config.animation === 'slide-down' ? { y: 0, opacity: 1 } : config.animation === 'zoom' ? { scale: 1, opacity: 1 } : { opacity: 1 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      className={`pointer-events-auto relative ${
                        config.position === 'bottom' || config.position === 'bottom-bar' || config.position === 'top-bar' ? 'w-full' : 
                        previewDevice === 'mobile' ? 'w-[calc(100%-2rem)]' : 'max-w-md'
                      }`}
                      style={{
                        backgroundColor: config.backdropBlur ? `${config.backgroundColor}dd` : config.backgroundColor,
                        maxWidth: config.position === 'bottom' || config.position === 'bottom-bar' || config.position === 'top-bar' ? 'none' : `${config.maxWidth}px`,
                        color: config.textColor,
                        borderRadius: config.position === 'bottom' || config.position === 'bottom-bar' || config.position === 'top-bar' ? 0 : config.borderRadius,
                        boxShadow: config.shadow === 'none' ? 'none' : 
                                   config.shadow === 'small' ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 
                                   config.shadow === 'medium' ? '0 8px 30px rgba(0, 0, 0, 0.12)' : 
                                   '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        backdropFilter: config.backdropBlur ? 'blur(8px)' : 'none',
                        fontFamily: config.fontFamily,
                        fontSize: config.fontSize === 'small' ? '13px' : config.fontSize === 'large' ? '16px' : '14px',
                        border: `${config.borderWidth}px solid ${config.borderColor}`,
                        direction: getTranslation(config.language).direction,
                      }}
                    >
                      {/* Close Button */}
                      {config.showCloseButton && (
                        <button 
                          className="absolute top-2 right-2 p-1 opacity-50 hover:opacity-100 transition-opacity"
                          style={{ background: 'transparent', border: 'none' }}
                        >
                          <X size={16} />
                        </button>
                      )}
                      
                      <div className="flex flex-col" style={{
                        padding: previewDevice === 'mobile' ? '14px' : '20px',
                        gap: previewDevice === 'mobile' ? '10px' : '16px',
                        overflow: 'hidden',
                        wordBreak: 'break-word' as const,
                      }}>
                        <div className="flex items-start gap-3" style={{
                          flexDirection: previewDevice === 'mobile' ? 'column' : 'row',
                        }}>
                          {config.showIcon && (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: `${config.primaryColor}15` }}>
                              <img 
                                src={config.logoUrl || defaultLogoImage} 
                                alt="Logo" 
                                className="w-6 h-6 object-contain"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="mb-1" style={{ 
                              color: config.textColor,
                              fontSize: config.headingFontSize === 'small' ? '1em' : config.headingFontSize === 'large' ? '1.3em' : '1.1em',
                              fontWeight: config.fontWeight === 'normal' ? 500 : config.fontWeight === 'semibold' ? 700 : 600,
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                            }}>{config.heading}</h3>
                            <p className="opacity-80 leading-relaxed" style={{
                              fontSize: config.descriptionFontSize === 'small' ? '0.85em' : config.descriptionFontSize === 'large' ? '1.05em' : '0.95em',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                            }}>{config.description}</p>
                            {/* Policy Links */}
                            {(config.privacyPolicyUrl || config.cookiePolicyUrl) && (
                              <div className="text-xs mt-2 opacity-70">
                                {config.privacyPolicyUrl && (
                                  <a href={config.privacyPolicyUrl} target="_blank" rel="noopener" style={{ color: config.primaryColor, textDecoration: 'underline' }}>
                                    {config.privacyPolicyText}
                                  </a>
                                )}
                                {config.privacyPolicyUrl && config.cookiePolicyUrl && <span> • </span>}
                                {config.cookiePolicyUrl && (
                                  <a href={config.cookiePolicyUrl} target="_blank" rel="noopener" style={{ color: config.primaryColor, textDecoration: 'underline' }}>
                                    {config.cookiePolicyText}
                                  </a>
                                )}
                              </div>
                            )}
                            {/* Custom Footer */}
                            {config.customFooter && (
                              <div className="text-xs mt-2 opacity-70">{config.customFooter}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2" style={{
                          flexDirection: config.buttonLayout === 'stacked' || (config.buttonLayout === 'auto' && previewDevice === 'mobile') ? 'column' : 'row',
                          flexWrap: config.buttonLayout === 'inline' ? 'wrap' : 'nowrap',
                          justifyContent: config.buttonLayout === 'stacked' || (config.buttonLayout === 'auto' && previewDevice === 'mobile') ? 'stretch' : 'flex-end',
                        }}>
                          <button 
                            className="px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
                            style={{
                              width: config.buttonLayout === 'stacked' || (config.buttonLayout === 'auto' && previewDevice === 'mobile') ? '100%' : 'auto',
                              color: config.buttonStyle === 'filled' ? '#fff' : config.secondaryButtonColor,
                              backgroundColor: config.buttonStyle === 'filled' ? config.primaryColor : 'transparent',
                              border: config.buttonStyle === 'outline' ? `1px solid ${config.primaryColor}` : 'none',
                              borderRadius: config.buttonShape === 'pill' ? 999 : config.buttonShape === 'rounded' ? 8 : 0,
                            }}
                            onClick={() => setShowPreferencesPreview(true)}
                            data-testid="button-banner-preferences"
                          >
                            {config.settingsText}
                          </button>
                          <button 
                            className="px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
                            style={{
                              width: config.buttonLayout === 'stacked' || (config.buttonLayout === 'auto' && previewDevice === 'mobile') ? '100%' : 'auto',
                              color: config.buttonStyle === 'filled' ? '#fff' : config.secondaryButtonColor,
                              backgroundColor: config.buttonStyle === 'filled' ? config.secondaryButtonColor : 'transparent',
                              border: config.buttonStyle === 'outline' ? `1px solid ${config.primaryColor}` : 'none',
                              borderRadius: config.buttonShape === 'pill' ? 999 : config.buttonShape === 'rounded' ? 8 : 0,
                            }}
                          >
                            {config.rejectText}
                          </button>
                          <button 
                            className="px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
                            style={{
                              width: config.buttonLayout === 'stacked' || (config.buttonLayout === 'auto' && previewDevice === 'mobile') ? '100%' : 'auto',
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

                  {/* Revisit Consent Button Preview */}
                  {config.showRevisitButton && (
                    <div
                      className="absolute z-50 pointer-events-auto"
                      style={{
                        bottom: '16px',
                        [config.revisitButtonPosition === 'bottom-right' ? 'right' : 'left']: '16px',
                      }}
                      data-testid="preview-revisit-button"
                    >
                      <div
                        className={`w-10 h-10 ${config.revisitButtonShape === 'circle' ? 'rounded-full' : config.revisitButtonShape === 'rounded' ? 'rounded-lg' : 'rounded-none'} flex items-center justify-center shadow-lg cursor-pointer transition-transform`}
                        style={{
                          backgroundColor: config.revisitButtonColor || config.primaryColor,
                          color: '#fff',
                        }}
                        onClick={() => setShowPreferencesPreview(true)}
                      >
                        {config.revisitButtonLogoUrl ? (
                          <img src={config.revisitButtonLogoUrl} alt="Revisit consent" size={20} className="object-contain" />
                        ) : (
                          <img src={defaultLogoImage} alt="ConsentEase" size={20} className="object-contain" />
                        )}
                      </div>
                    </div>
                  )}
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
              dir={getTranslation(config.language).direction}
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
                  <h3 className="font-semibold text-lg">{getTranslation(config.language).preferencesTitle}</h3>
                  <button 
                    onClick={() => setShowPreferencesPreview(false)}
                    className="p-1 rounded hover:bg-black/10"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm opacity-70 mt-1">
                  {getTranslation(config.language).preferencesDescription}
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
                            {getTranslation(config.language).required}
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
                          size={20} className="absolute top-0.5 bg-white rounded-full shadow transition-transform"
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
                  {getTranslation(config.language).rejectAll}
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
                  {getTranslation(config.language).acceptAll}
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
                  {getTranslation(config.language).savePreferences}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
