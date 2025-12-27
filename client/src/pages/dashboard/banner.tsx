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
import { Undo2, Save, Monitor, Smartphone, Palette, Layout, Type, Shield, BoxSelect, Loader2, Globe, Sparkles, Lock, X, Settings2, Link2, Clock, Timer, Languages } from "lucide-react";
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
}

const translationData: Record<string, Record<string, string>> = {
  en: {
    heading: "We value your privacy",
    description: "We use cookies to enhance your browsing experience and analyze our traffic. By clicking Accept All, you consent to our use of cookies.",
    acceptAll: "Accept All",
    rejectAll: "Reject All",
    settings: "Preferences",
    preferencesTitle: "Cookie Preferences",
    savePreferences: "Save Preferences",
    required: "Required",
    cookies: "Cookies",
  },
  nl: {
    heading: "Wij respecteren uw privacy",
    description: "Wij gebruiken cookies om uw browse-ervaring te verbeteren en ons verkeer te analyseren.",
    acceptAll: "Alles Accepteren",
    rejectAll: "Alles Weigeren",
    settings: "Voorkeuren",
    preferencesTitle: "Cookievoorkeuren",
    savePreferences: "Voorkeuren Opslaan",
    required: "Vereist",
    cookies: "Cookies",
  },
  de: {
    heading: "Wir schätzen Ihre Privatsphäre",
    description: "Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern und unseren Datenverkehr zu analysieren.",
    acceptAll: "Alle Akzeptieren",
    rejectAll: "Alle Ablehnen",
    settings: "Einstellungen",
    preferencesTitle: "Cookie-Einstellungen",
    savePreferences: "Einstellungen Speichern",
    required: "Erforderlich",
    cookies: "Cookies",
  },
  fr: {
    heading: "Nous respectons votre vie privée",
    description: "Nous utilisons des cookies pour améliorer votre expérience de navigation et analyser notre trafic.",
    acceptAll: "Tout Accepter",
    rejectAll: "Tout Refuser",
    settings: "Préférences",
    preferencesTitle: "Préférences de Cookies",
    savePreferences: "Sauvegarder",
    required: "Requis",
    cookies: "Cookies",
  },
  es: {
    heading: "Valoramos su privacidad",
    description: "Utilizamos cookies para mejorar su experiencia de navegación y analizar nuestro tráfico.",
    acceptAll: "Aceptar Todo",
    rejectAll: "Rechazar Todo",
    settings: "Preferencias",
    preferencesTitle: "Preferencias de Cookies",
    savePreferences: "Guardar",
    required: "Obligatorio",
    cookies: "Cookies",
  },
  it: {
    heading: "Rispettiamo la tua privacy",
    description: "Utilizziamo i cookie per migliorare la tua esperienza di navigazione e analizzare il nostro traffico.",
    acceptAll: "Accetta Tutto",
    rejectAll: "Rifiuta Tutto",
    settings: "Preferenze",
    preferencesTitle: "Preferenze Cookie",
    savePreferences: "Salva",
    required: "Obbligatorio",
    cookies: "Cookie",
  },
  pt: {
    heading: "Valorizamos sua privacidade",
    description: "Usamos cookies para melhorar sua experiência de navegação e analisar nosso tráfego.",
    acceptAll: "Aceitar Tudo",
    rejectAll: "Recusar Tudo",
    settings: "Preferências",
    preferencesTitle: "Preferências de Cookies",
    savePreferences: "Salvar",
    required: "Obrigatório",
    cookies: "Cookies",
  },
  pl: {
    heading: "Cenimy Twoją prywatność",
    description: "Używamy plików cookie, aby ulepszyć Twoje przeglądanie i analizować nasz ruch.",
    acceptAll: "Akceptuj Wszystko",
    rejectAll: "Odrzuć Wszystko",
    settings: "Ustawienia",
    preferencesTitle: "Ustawienia Cookies",
    savePreferences: "Zapisz",
    required: "Wymagane",
    cookies: "Cookies",
  },
};

function TranslationPreview({ language }: { language: string }) {
  const t = translationData[language] || translationData.en;
  
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
          <span className="font-medium">{t.settings}</span>
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
        borderColor: bannerConfig.borderColor || "#e5e7eb",
        borderWidth: bannerConfig.borderWidth || 1,
        secondaryButtonColor: bannerConfig.secondaryButtonColor || "#6b7280",
        maxWidth: bannerConfig.maxWidth || 400,
        showOverlay: bannerConfig.showOverlay || false,
        overlayOpacity: bannerConfig.overlayOpacity || 50,
        logoUrl: bannerConfig.logoUrl,
        displayDelay: bannerConfig.displayDelay || 0,
        autoHideDelay: bannerConfig.autoHideDelay,
        showCloseButton: bannerConfig.showCloseButton || false,
        reconsentDays: bannerConfig.reconsentDays || 365,
        respectDnt: bannerConfig.respectDnt || false,
        privacyPolicyUrl: bannerConfig.privacyPolicyUrl,
        privacyPolicyText: bannerConfig.privacyPolicyText || "Privacy Policy",
        cookiePolicyUrl: bannerConfig.cookiePolicyUrl,
        cookiePolicyText: bannerConfig.cookiePolicyText || "Cookie Policy",
        customFooter: bannerConfig.customFooter,
        language: bannerConfig.language || "en",
        translations: bannerConfig.translations,
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
        borderColor: bannerConfig.borderColor || "#e5e7eb",
        borderWidth: bannerConfig.borderWidth || 1,
        secondaryButtonColor: bannerConfig.secondaryButtonColor || "#6b7280",
        maxWidth: bannerConfig.maxWidth || 400,
        showOverlay: bannerConfig.showOverlay || false,
        overlayOpacity: bannerConfig.overlayOpacity || 50,
        logoUrl: bannerConfig.logoUrl,
        displayDelay: bannerConfig.displayDelay || 0,
        autoHideDelay: bannerConfig.autoHideDelay,
        showCloseButton: bannerConfig.showCloseButton || false,
        reconsentDays: bannerConfig.reconsentDays || 365,
        respectDnt: bannerConfig.respectDnt || false,
        privacyPolicyUrl: bannerConfig.privacyPolicyUrl,
        privacyPolicyText: bannerConfig.privacyPolicyText || "Privacy Policy",
        cookiePolicyUrl: bannerConfig.cookiePolicyUrl,
        cookiePolicyText: bannerConfig.cookiePolicyText || "Cookie Policy",
        customFooter: bannerConfig.customFooter,
        language: bannerConfig.language || "en",
        translations: bannerConfig.translations,
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
          <Card className="lg:col-span-4 h-full overflow-hidden flex flex-col border-none shadow-lg" data-tour="banner-styles">
            <div className="p-1">
              <Tabs defaultValue="appearance" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-5 h-auto">
                  <TabsTrigger value="appearance" className="gap-1 flex-col py-2 text-xs"><Palette className="w-4 h-4"/> Style</TabsTrigger>
                  <TabsTrigger value="content" className="gap-1 flex-col py-2 text-xs"><Type className="w-4 h-4"/> Content</TabsTrigger>
                  <TabsTrigger value="layout" className="gap-1 flex-col py-2 text-xs"><Layout className="w-4 h-4"/> Layout</TabsTrigger>
                  <TabsTrigger value="behavior" className="gap-1 flex-col py-2 text-xs"><Settings2 className="w-4 h-4"/> Behavior</TabsTrigger>
                  <TabsTrigger value="links" className="gap-1 flex-col py-2 text-xs"><Link2 className="w-4 h-4"/> Links</TabsTrigger>
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
                     <div className="space-y-2">
                       <Label className="text-xs text-muted-foreground">Secondary Button Color</Label>
                       <div className="flex items-center gap-2">
                         <div className="h-8 w-8 rounded-full border border-border shadow-sm overflow-hidden relative">
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
                          <div className="h-8 w-8 rounded-full border border-border shadow-sm overflow-hidden relative">
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
                    <Label className="text-base font-semibold">Language</Label>
                    <Select value={config.language} onValueChange={(val) => setConfig({...config, language: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="nl">Nederlands</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="pl">Polski</SelectItem>
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
                      <Languages className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                      <TranslationPreview language={config.language} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      These translations are automatically applied based on your selected language. The banner and preferences modal text will use these localized strings.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "links" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Privacy Policy</Label>
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
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Cookie Policy</Label>
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
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Logo URL</Label>
                      <Input 
                        value={config.logoUrl || ''}
                        onChange={(e) => setConfig({...config, logoUrl: e.target.value || null})}
                        placeholder="https://yoursite.com/logo.png"
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
          <div className="lg:col-span-8 bg-muted/30 rounded-2xl border border-border/50 relative overflow-hidden flex flex-col" data-tour="banner-preview">
            {/* Preview Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-black/50 backdrop-blur border border-border/50 rounded-full p-1 flex items-center gap-1 shadow-sm z-20">
              <button 
                onClick={() => setPreviewDevice("desktop")}
                className={`p-2 rounded-full transition-colors ${previewDevice === 'desktop' ? 'bg-primary text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPreviewDevice("mobile")}
                className={`p-2 rounded-full transition-colors ${previewDevice === 'mobile' ? 'bg-primary text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <Smartphone className="w-4 h-4" />
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
