import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Lock, Cookie, Globe, Buildings, Shield, Users, Database, ShareNetwork, SlidersHorizontal, Translate, WarningCircle, Check, Eye, Pencil, Sparkle } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface AuthUser {
  id: string;
  email: string;
  plan: string;
}

interface Website {
  id: string;
  domain: string;
  publicId: string;
  cookiesFound: number | null;
}

interface PolicyAccess {
  privacy: boolean;
  cookie: boolean;
  isAgency: boolean;
  isAgencyPro: boolean;
  quota: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
}

interface Policy {
  id: string;
  websiteId: string;
  type: "privacy" | "cookie";
  status: "draft" | "published";
  language: string;
  jurisdiction: string;
  businessName: string;
  createdAt: string;
  publishedAt: string | null;
}

interface CookieItem {
  id: string;
  name: string;
  provider: string | null;
}

const countries = [
  { value: "BE", label: "Belgium" },
  { value: "NL", label: "Netherlands" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "PT", label: "Portugal" },
  { value: "PL", label: "Poland" },
  { value: "AT", label: "Austria" },
  { value: "CH", label: "Switzerland" },
  { value: "GB", label: "United Kingdom" },
  { value: "IE", label: "Ireland" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "BR", label: "Brazil" },
  { value: "OTHER", label: "Other" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "nl", label: "Dutch" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "pl", label: "Polish" },
];

const jurisdictions = [
  { value: "gdpr", label: "GDPR (EU)" },
  { value: "ccpa", label: "CCPA (California)" },
  { value: "lgpd", label: "LGPD (Brazil)" },
  { value: "all", label: "All Jurisdictions" },
];

const dataCollectedOptions = [
  { value: "email", label: "Email Address" },
  { value: "name", label: "Name" },
  { value: "phone", label: "Phone Number" },
  { value: "address", label: "Physical Address" },
  { value: "payment", label: "Payment Information" },
  { value: "location", label: "Location Data" },
  { value: "ip_address", label: "IP Address" },
  { value: "device_info", label: "Device Information" },
  { value: "browsing_history", label: "Browsing History" },
  { value: "cookies", label: "Cookies & Tracking" },
  { value: "demographics", label: "Demographics" },
  { value: "preferences", label: "User Preferences" },
  { value: "social_profiles", label: "Social Media Profiles" },
  { value: "purchase_history", label: "Purchase History" },
];

const dataUsageOptions = [
  { value: "service_delivery", label: "Service Delivery" },
  { value: "account_management", label: "Account Management" },
  { value: "communication", label: "Communication" },
  { value: "marketing", label: "Marketing & Promotions" },
  { value: "analytics", label: "Analytics & Insights" },
  { value: "security", label: "Security & Fraud Prevention" },
  { value: "legal", label: "Legal Compliance" },
  { value: "personalization", label: "Personalization" },
];

const thirdPartyServicesOptions = [
  { value: "google_analytics", label: "Google Analytics" },
  { value: "google_ads", label: "Google Ads" },
  { value: "facebook_pixel", label: "Facebook Pixel" },
  { value: "stripe", label: "Stripe" },
  { value: "mailchimp", label: "Mailchimp" },
  { value: "hubspot", label: "HubSpot" },
  { value: "intercom", label: "Intercom" },
  { value: "hotjar", label: "Hotjar" },
  { value: "clarity", label: "Microsoft Clarity" },
];

const retentionPeriods = [
  { value: "1_year", label: "1 Year" },
  { value: "2_years", label: "2 Years" },
  { value: "5_years", label: "5 Years" },
  { value: "account_deletion", label: "Until Account Deletion" },
];

const policyFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessAddress: z.string().optional(),
  businessCountry: z.string().optional(),
  businessEmail: z.string().email("Please enter a valid email address"),
  businessPhone: z.string().optional(),
  businessWebsite: z.string().optional(),
  vatNumber: z.string().optional(),
  dpoName: z.string().optional(),
  dpoEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  dataCollected: z.array(z.string()).default([]),
  dataUsagePurposes: z.array(z.string()).default([]),
  thirdPartyServices: z.array(z.string()).default([]),
  dataRetentionPeriod: z.string().default("2_years"),
  allowsDataExport: z.boolean().default(true),
  allowsDataDeletion: z.boolean().default(true),
  hasMinors: z.boolean().default(false),
  sellsData: z.boolean().default(false),
  language: z.string().default("en"),
  jurisdiction: z.string().default("gdpr"),
});

type PolicyFormValues = z.infer<typeof policyFormSchema>;

function AccessGate({ onPurchase }: { onPurchase: (type: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Lock size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Unlock Policy Generator</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Generate professional, legally-compliant privacy and cookie policies for your website in minutes.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <Card className="relative">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Privacy Policy</CardTitle>
            <CardDescription>GDPR & CCPA compliant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              €9 <span className="text-sm font-normal text-muted-foreground">one-time</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                Multi-language support
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                Multiple jurisdictions
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                Unlimited updates
              </li>
            </ul>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => onPurchase("privacy")}
              data-testid="button-purchase-privacy"
            >
              Get Privacy Policy
            </Button>
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Cookie Policy</CardTitle>
            <CardDescription>Auto-detect from scan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              €9 <span className="text-sm font-normal text-muted-foreground">one-time</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                Auto-detect cookies
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                Third-party disclosure
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                Unlimited updates
              </li>
            </ul>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => onPurchase("cookie")}
              data-testid="button-purchase-cookie"
            >
              Get Cookie Policy
            </Button>
          </CardContent>
        </Card>

        <Card className="relative border-primary">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Policy Bundle</CardTitle>
            <CardDescription>Privacy + Cookie Policy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              €15 <span className="text-sm font-normal text-muted-foreground">one-time</span>
            </div>
            <div className="text-sm text-green-600 font-medium">Save €3</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                Both policies included
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                All features included
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                Unlimited updates
              </li>
            </ul>
            <Button 
              className="w-full"
              onClick={() => onPurchase("bundle")}
              data-testid="button-purchase-bundle"
            >
              <Sparkle size={16} className="mr-2" />
              Get Bundle
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AgencyQuotaDisplay({ quota, isAgencyPro }: { quota: { used: number; limit: number; unlimited: boolean }, isAgencyPro: boolean }) {
  return (
    <Alert className="mb-6">
      <Buildings size={16} />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {isAgencyPro ? (
            <>Agency Pro: <strong>{quota.limit - quota.used}</strong> of {quota.limit} policies remaining this month</>
          ) : (
            <>Agency Plan: <strong>{quota.limit - quota.used}</strong> policies remaining this month</>
          )}
        </span>
        {!quota.unlimited && (
          <span className="text-muted-foreground">
            {quota.used}/{quota.limit} used
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default function PolicyGenerator() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"privacy" | "cookie">("privacy");

  const { data: user, isLoading: userLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.status === 401) {
        setLocation("/login");
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  const { data: websites = [], isLoading: websitesLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
    queryFn: async () => {
      const res = await fetch("/api/websites", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch websites");
      return res.json();
    },
    enabled: !!user,
  });

  const { data: accessInfo, isLoading: accessLoading } = useQuery<PolicyAccess>({
    queryKey: ["/api/policies/access"],
    queryFn: async () => {
      const res = await fetch("/api/policies/access", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to check access");
      return res.json();
    },
    enabled: !!user,
  });

  const activeWebsiteId = selectedWebsiteId || websites[0]?.id;
  const activeWebsite = websites.find(w => w.id === activeWebsiteId);
  const hasCookiesScanned = (activeWebsite?.cookiesFound ?? 0) > 0;

  const { data: existingPolicies = [] } = useQuery<Policy[]>({
    queryKey: ["/api/policies", activeWebsiteId],
    queryFn: async () => {
      if (!activeWebsiteId) return [];
      const res = await fetch(`/api/policies?websiteId=${activeWebsiteId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch policies");
      return res.json();
    },
    enabled: !!activeWebsiteId && (accessInfo?.privacy || accessInfo?.cookie || accessInfo?.isAgency),
  });

  const { data: scannedCookies = [] } = useQuery<CookieItem[]>({
    queryKey: ["/api/websites", activeWebsiteId, "cookies"],
    queryFn: async () => {
      if (!activeWebsiteId) return [];
      const res = await fetch(`/api/websites/${activeWebsiteId}/cookies`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cookies");
      return res.json();
    },
    enabled: !!activeWebsiteId && activeTab === "cookie",
  });

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      businessName: "",
      businessAddress: "",
      businessCountry: "",
      businessEmail: user?.email || "",
      businessPhone: "",
      businessWebsite: activeWebsite?.domain || "",
      vatNumber: "",
      dpoName: "",
      dpoEmail: "",
      dataCollected: ["email", "ip_address", "cookies"],
      dataUsagePurposes: ["service_delivery", "analytics"],
      thirdPartyServices: [],
      dataRetentionPeriod: "2_years",
      allowsDataExport: true,
      allowsDataDeletion: true,
      hasMinors: false,
      sellsData: false,
      language: "en",
      jurisdiction: "gdpr",
    },
  });

  useEffect(() => {
    if (activeWebsite?.domain) {
      form.setValue("businessWebsite", activeWebsite.domain);
    }
  }, [activeWebsite?.domain, form]);

  useEffect(() => {
    if (user?.email && !form.getValues("businessEmail")) {
      form.setValue("businessEmail", user.email);
    }
  }, [user?.email, form]);

  useEffect(() => {
    if (activeTab === "cookie" && scannedCookies.length > 0) {
      const detectedServices: string[] = [];
      scannedCookies.forEach(cookie => {
        const provider = cookie.provider?.toLowerCase() || cookie.name.toLowerCase();
        if (provider.includes("google") && provider.includes("analytics")) {
          detectedServices.push("google_analytics");
        }
        if (provider.includes("google") && provider.includes("ad")) {
          detectedServices.push("google_ads");
        }
        if (provider.includes("facebook") || provider.includes("meta")) {
          detectedServices.push("facebook_pixel");
        }
        if (provider.includes("stripe")) {
          detectedServices.push("stripe");
        }
        if (provider.includes("hotjar")) {
          detectedServices.push("hotjar");
        }
        if (provider.includes("clarity")) {
          detectedServices.push("clarity");
        }
        if (provider.includes("hubspot")) {
          detectedServices.push("hubspot");
        }
        if (provider.includes("intercom")) {
          detectedServices.push("intercom");
        }
        if (provider.includes("mailchimp")) {
          detectedServices.push("mailchimp");
        }
      });
      const uniqueServices = Array.from(new Set(detectedServices));
      if (uniqueServices.length > 0) {
        form.setValue("thirdPartyServices", uniqueServices);
      }
    }
  }, [activeTab, scannedCookies, form]);

  const generateMutation = useMutation({
    mutationFn: async (data: PolicyFormValues & { type: "privacy" | "cookie"; websiteId: string }) => {
      const res = await fetch("/api/policies/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate policy");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies", activeWebsiteId] });
      queryClient.invalidateQueries({ queryKey: ["/api/policies/access"] });
      toast.success(`${activeTab === "privacy" ? "Privacy" : "Cookie"} policy generated successfully!`);
      setLocation(`/dashboard/policy/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (type: string) => {
      const res = await fetch("/api/policies/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create checkout");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.assign(data.url);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: PolicyFormValues) => {
    if (!activeWebsiteId) {
      toast.error("Please select a website first");
      return;
    }
    generateMutation.mutate({
      ...values,
      type: activeTab,
      websiteId: activeWebsiteId,
    });
  };

  const isLoading = userLoading || websitesLoading || accessLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size={32} className="text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (websites.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <Globe size={48} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Websites Added</h2>
          <p className="text-muted-foreground mb-4">
            Add a website first before generating policies.
          </p>
          <Button onClick={() => setLocation("/dashboard")} data-testid="button-add-website">
            Add Website
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Policy Generator</h1>
          <p className="text-muted-foreground">Create legally-compliant privacy and cookie policies.</p>
        </div>

        {websites.length > 1 && (
          <Select value={activeWebsiteId || ""} onValueChange={setSelectedWebsiteId}>
            <SelectTrigger className="w-[200px]" data-testid="select-website">
              <Globe size={16} className="mr-2" />
              <SelectValue placeholder="Select website" />
            </SelectTrigger>
            <SelectContent>
              {websites.map((site) => (
                <SelectItem key={site.id} value={site.id} data-testid={`option-website-${site.id}`}>
                  {site.domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {!accessInfo?.privacy && !accessInfo?.cookie && !accessInfo?.isAgency ? (
        <AccessGate onPurchase={(type) => purchaseMutation.mutate(type)} />
      ) : (
        <>
          {accessInfo?.isAgency && (
            <AgencyQuotaDisplay quota={accessInfo.quota} isAgencyPro={accessInfo.isAgencyPro} />
          )}

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "privacy" | "cookie")} className="space-y-6">
            <TabsList>
              <TabsTrigger 
                value="privacy" 
                className="gap-2"
                data-testid="tab-privacy"
              >
                <FileText size={16} />
                Privacy Policy
              </TabsTrigger>
              <TabsTrigger 
                value="cookie" 
                className="gap-2"
                disabled={!hasCookiesScanned}
                data-testid="tab-cookie"
              >
                <Cookie size={16} />
                Cookie Policy
                {!hasCookiesScanned && (
                  <Badge variant="secondary" className="ml-2 text-xs">Scan first</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {!hasCookiesScanned && activeTab === "privacy" && (
              <Alert>
                <WarningCircle size={16} />
                <AlertDescription>
                  To generate a Cookie Policy, first scan your website for cookies in the{" "}
                  <a href="/dashboard/cookies" className="text-primary underline">Cookies</a> section.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {activeTab === "privacy" ? "Privacy Policy Details" : "Cookie Policy Details"}
                    </CardTitle>
                    <CardDescription>
                      Fill in the information about your business and data practices.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Accordion type="multiple" defaultValue={["business", "data-collection", "language"]} className="space-y-4">
                          <AccordionItem value="business" className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <Buildings size={20} className="text-muted-foreground" />
                                <span className="font-medium">Business Information</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="businessName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Business Name *</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="Your Company Ltd." data-testid="input-businessName" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="businessEmail"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Contact Email *</FormLabel>
                                      <FormControl>
                                        <Input {...field} type="email" placeholder="privacy@company.com" data-testid="input-businessEmail" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={form.control}
                                name="businessAddress"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Business Address</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="123 Main Street, City, Country" data-testid="input-businessAddress" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="businessCountry"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Country</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger data-testid="select-businessCountry">
                                            <SelectValue placeholder="Select country" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {countries.map((country) => (
                                            <SelectItem key={country.value} value={country.value}>
                                              {country.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="businessPhone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Phone Number</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="+1 234 567 890" data-testid="input-businessPhone" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="businessWebsite"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Website</FormLabel>
                                      <FormControl>
                                        <Input {...field} disabled data-testid="input-businessWebsite" />
                                      </FormControl>
                                      <FormDescription>Auto-filled from selected website</FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="vatNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>VAT Number</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="BE0123456789" data-testid="input-vatNumber" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="dpo" className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <Shield size={20} className="text-muted-foreground" />
                                <span className="font-medium">Data Protection Officer</span>
                                <Badge variant="secondary" className="ml-2">Optional</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="dpoName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>DPO Name</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="John Doe" data-testid="input-dpoName" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="dpoEmail"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>DPO Email</FormLabel>
                                      <FormControl>
                                        <Input {...field} type="email" placeholder="dpo@company.com" data-testid="input-dpoEmail" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="data-collection" className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <Database size={20} className="text-muted-foreground" />
                                <span className="font-medium">Data Collection</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                              <FormField
                                control={form.control}
                                name="dataCollected"
                                render={() => (
                                  <FormItem>
                                    <FormLabel>What data do you collect?</FormLabel>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                      {dataCollectedOptions.map((option) => (
                                        <FormField
                                          key={option.value}
                                          control={form.control}
                                          name="dataCollected"
                                          render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl>
                                                <Checkbox
                                                  checked={field.value?.includes(option.value)}
                                                  onCheckedChange={(checked) => {
                                                    return checked
                                                      ? field.onChange([...field.value, option.value])
                                                      : field.onChange(field.value?.filter((v: string) => v !== option.value));
                                                  }}
                                                  data-testid={`checkbox-data-${option.value}`}
                                                />
                                              </FormControl>
                                              <FormLabel className="text-sm font-normal cursor-pointer">
                                                {option.label}
                                              </FormLabel>
                                            </FormItem>
                                          )}
                                        />
                                      ))}
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="data-usage" className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <Users size={20} className="text-muted-foreground" />
                                <span className="font-medium">Data Usage</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                              <FormField
                                control={form.control}
                                name="dataUsagePurposes"
                                render={() => (
                                  <FormItem>
                                    <FormLabel>How do you use the collected data?</FormLabel>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                      {dataUsageOptions.map((option) => (
                                        <FormField
                                          key={option.value}
                                          control={form.control}
                                          name="dataUsagePurposes"
                                          render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl>
                                                <Checkbox
                                                  checked={field.value?.includes(option.value)}
                                                  onCheckedChange={(checked) => {
                                                    return checked
                                                      ? field.onChange([...field.value, option.value])
                                                      : field.onChange(field.value?.filter((v: string) => v !== option.value));
                                                  }}
                                                  data-testid={`checkbox-usage-${option.value}`}
                                                />
                                              </FormControl>
                                              <FormLabel className="text-sm font-normal cursor-pointer">
                                                {option.label}
                                              </FormLabel>
                                            </FormItem>
                                          )}
                                        />
                                      ))}
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="third-party" className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <ShareNetwork size={20} className="text-muted-foreground" />
                                <span className="font-medium">Third-Party Services</span>
                                {activeTab === "cookie" && scannedCookies.length > 0 && (
                                  <Badge variant="secondary" className="ml-2">Auto-detected</Badge>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                              <FormField
                                control={form.control}
                                name="thirdPartyServices"
                                render={() => (
                                  <FormItem>
                                    <FormLabel>Which third-party services do you use?</FormLabel>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                      {thirdPartyServicesOptions.map((option) => (
                                        <FormField
                                          key={option.value}
                                          control={form.control}
                                          name="thirdPartyServices"
                                          render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl>
                                                <Checkbox
                                                  checked={field.value?.includes(option.value)}
                                                  onCheckedChange={(checked) => {
                                                    return checked
                                                      ? field.onChange([...field.value, option.value])
                                                      : field.onChange(field.value?.filter((v: string) => v !== option.value));
                                                  }}
                                                  data-testid={`checkbox-service-${option.value}`}
                                                />
                                              </FormControl>
                                              <FormLabel className="text-sm font-normal cursor-pointer">
                                                {option.label}
                                              </FormLabel>
                                            </FormItem>
                                          )}
                                        />
                                      ))}
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="additional" className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <SlidersHorizontal size={20} className="text-muted-foreground" />
                                <span className="font-medium">Additional Options</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                              <FormField
                                control={form.control}
                                name="dataRetentionPeriod"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Data Retention Period</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger data-testid="select-retention">
                                          <SelectValue placeholder="Select retention period" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {retentionPeriods.map((period) => (
                                          <SelectItem key={period.value} value={period.value}>
                                            {period.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="space-y-3">
                                <FormField
                                  control={form.control}
                                  name="allowsDataExport"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          data-testid="checkbox-allowsDataExport"
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                        Allow users to export their data
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="allowsDataDeletion"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          data-testid="checkbox-allowsDataDeletion"
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                        Allow users to request data deletion
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="hasMinors"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          data-testid="checkbox-hasMinors"
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                        Website targets users under 16 years old
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="sellsData"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          data-testid="checkbox-sellsData"
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                        We sell personal data (CCPA requirement)
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="language" className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <Translate size={20} className="text-muted-foreground" />
                                <span className="font-medium">Language & Jurisdiction</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="language"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Policy Language</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger data-testid="select-language">
                                            <SelectValue placeholder="Select language" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {languages.map((lang) => (
                                            <SelectItem key={lang.value} value={lang.value}>
                                              {lang.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="jurisdiction"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Jurisdiction</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger data-testid="select-jurisdiction">
                                            <SelectValue placeholder="Select jurisdiction" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {jurisdictions.map((j) => (
                                            <SelectItem key={j.value} value={j.value}>
                                              {j.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <div className="flex justify-end pt-4">
                          <Button 
                            type="submit" 
                            size="lg" 
                            disabled={generateMutation.isPending}
                            data-testid="button-generate"
                          >
                            {generateMutation.isPending ? (
                              <Spinner size={16} className="mr-2" />
                            ) : (
                              <FileText size={16} className="mr-2" />
                            )}
                            Generate {activeTab === "privacy" ? "Privacy" : "Cookie"} Policy
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Existing Policies</CardTitle>
                    <CardDescription>
                      Previously generated policies for this website.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {existingPolicies.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No policies generated yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {existingPolicies.map((policy) => (
                          <div
                            key={policy.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover-elevate cursor-pointer"
                            onClick={() => setLocation(`/dashboard/policy/${policy.id}`)}
                            data-testid={`policy-item-${policy.id}`}
                          >
                            <div className="flex items-center gap-3">
                              {policy.type === "privacy" ? (
                                <FileText size={16} className="text-muted-foreground" />
                              ) : (
                                <Cookie size={16} className="text-muted-foreground" />
                              )}
                              <div>
                                <p className="text-sm font-medium capitalize">
                                  {policy.type} Policy
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(policy.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={policy.status === "published" ? "default" : "secondary"}>
                                {policy.status}
                              </Badge>
                              <Button variant="ghost" size="icon">
                                {policy.status === "published" ? (
                                  <Eye size={16} />
                                ) : (
                                  <Pencil size={16} />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Be accurate:</strong> Only select data types you actually collect.
                    </p>
                    <p>
                      <strong className="text-foreground">Stay compliant:</strong> Update your policy when your practices change.
                    </p>
                    <p>
                      <strong className="text-foreground">GDPR tip:</strong> If you serve EU users, select GDPR or All jurisdictions.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs>
        </>
      )}
    </DashboardLayout>
  );
}
