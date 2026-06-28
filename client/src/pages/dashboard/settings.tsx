import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import DashboardLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, User, Envelope, Shield, Check, Sparkle, ArrowRight, ChartBar, Warning, XCircle, Clock, ArrowSquareOut, Eye, EyeSlash, Receipt, DownloadSimple, ArrowUpRight, CalendarBlank, CaretDown, CaretUp, Info, ArrowsClockwise, Key } from "@phosphor-icons/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { logout } from "@/lib/auth";
import { toast } from "sonner";
import { PLANS, ALL_PLANS, getPlanById } from "@shared/plans";
import { PlanComparisonCards } from "@/components/PlanComparisonTable";
import { Spinner } from "@/components/ui/spinner";
import ApiKeysManager from "@/components/ApiKeysManager";

const BILLING_COUNTRIES: { code: string; name: string }[] = [
  { code: "BE", name: "Belgium" },
  { code: "NL", name: "Netherlands" },
  { code: "LU", name: "Luxembourg" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AT", name: "Austria" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "MT", name: "Malta" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "GB", name: "United Kingdom" },
  { code: "CH", name: "Switzerland" },
  { code: "NO", name: "Norway" },
  { code: "IS", name: "Iceland" },
  { code: "LI", name: "Liechtenstein" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" },
  { code: "SG", name: "Singapore" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "MY", name: "Malaysia" },
  { code: "PH", name: "Philippines" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "IL", name: "Israel" },
  { code: "TR", name: "Turkey" },
  { code: "ZA", name: "South Africa" },
  { code: "EG", name: "Egypt" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "MA", name: "Morocco" },
  { code: "RU", name: "Russia" },
  { code: "UA", name: "Ukraine" },
  { code: "RS", name: "Serbia" },
  { code: "OTHER", name: "Other" },
];

interface UsageData {
  plan: string;
  websites: { used: number; limit: number | 'unlimited'; remaining: number | 'unlimited'; unlimited: boolean };
  views: { used: number; limit: number; remaining: number; percentUsed: number };
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  plan: string;
  subscriptionStatus: string | null;
  subscriptionEndDate: string | null;
  stripeSubscriptionId: string | null;
  billingInterval: string | null;
  companyName: string | null;
  vatNumber: string | null;
  billingCountry: string | null;
}

interface InvoiceData {
  id: string;
  number: string | null;
  status: string | null;
  amountPaid: number;
  amountDue: number;
  currency: string;
  created: number;
  periodStart: number;
  periodEnd: number;
  invoicePdf: string | null;
  hostedUrl: string | null;
}

interface PaymentMethodData {
  type: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
}

interface SubscriptionDetailsData {
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  cancelAt: number | null;
  status: string;
  trialEnd: number | null;
}

function SubscriptionStatusBadge({ status, endDate }: { status: string | null; endDate: string | null }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!status || status === 'none') {
    return (
      <div className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-sm font-bold rounded-full flex items-center gap-1.5" data-testid="badge-subscription-status">
        <Clock size={16} />
        No Subscription
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full flex items-center gap-1.5" data-testid="badge-subscription-status">
        <Check size={16} />
        Active
      </div>
    );
  }

  if (status === 'trialing') {
    return (
      <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full flex items-center gap-1.5" data-testid="badge-subscription-status">
        <Clock size={16} />
        Trial
      </div>
    );
  }

  if (status === 'past_due') {
    return (
      <div className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full flex items-center gap-1.5" data-testid="badge-subscription-status">
        <Warning size={16} />
        Past Due
      </div>
    );
  }

  if (status === 'canceled') {
    return (
      <div className="flex flex-col items-end gap-1" data-testid="badge-subscription-status">
        <div className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full flex items-center gap-1.5">
          <XCircle size={16} />
          Canceled
        </div>
        {endDate && (
          <span className="text-xs text-muted-foreground">Access until {formatDate(endDate)}</span>
        )}
      </div>
    );
  }

  if (status === 'unpaid' || status === 'incomplete') {
    return (
      <div className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full flex items-center gap-1.5" data-testid="badge-subscription-status">
        <XCircle size={16} />
        Payment Issue
      </div>
    );
  }

  return (
    <div className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-bold rounded-full" data-testid="badge-subscription-status">
      {status}
    </div>
  );
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "billing" | "api-keys">("profile");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('yearly');
  const isRedirectingRef = useRef(false);
  
  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Company / billing info state
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [billingCountry, setBillingCountry] = useState("");
  
  // Email change form state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  
  // Upgrade modal plan category toggle
  const [upgradePlanMode, setUpgradePlanMode] = useState<'single' | 'multi'>('single');

  // Handle checkout success - sync plan
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const success = params.get('success');
    const plan = params.get('plan');
    const upgrade = params.get('upgrade');
    
    if (success === 'true' && plan) {
      // Single sync call: the webhook already updates the DB, this is just
      // a safety net in case the user lands here before the webhook fires.
      fetch('/api/stripe/sync-subscription', {
        method: 'POST',
        credentials: 'include',
      })
        .catch(() => {/* silent: webhook will catch up */})
        .finally(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
          queryClient.invalidateQueries({ queryKey: ['/api/usage'] });
          queryClient.invalidateQueries({ queryKey: ['/api/stripe/subscription-details'] });
          queryClient.invalidateQueries({ queryKey: ['/api/stripe/invoices'] });
          toast.success(`Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`);
          window.history.replaceState({}, '', '/dashboard/settings');
          setActiveTab('billing');
        });
    }
    
    if (params.get('canceled') === 'true') {
      toast("Checkout was canceled. No charges were made.");
      window.history.replaceState({}, '', '/dashboard/settings');
      setActiveTab('billing');
    }

    if (params.get('purchase_verified') === 'true') {
      const purchaseType = params.get('type');
      const sessionId = params.get('session_id');
      if (sessionId) {
        fetch(`/api/policies/purchase/verify?session_id=${sessionId}`, { credentials: 'include' })
          .then(res => res.json())
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['/api/policies/purchases'] });
            toast.success(`${purchaseType === 'bundle' ? 'Policy Bundle' : purchaseType === 'privacy' ? 'Privacy Policy' : 'Cookie Policy'} purchased successfully!`);
          })
          .catch(() => {
            queryClient.invalidateQueries({ queryKey: ['/api/policies/purchases'] });
            toast.success("Purchase completed! Your policy access is being activated.");
          });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/policies/purchases'] });
        toast.success("Purchase completed!");
      }
      window.history.replaceState({}, '', '/dashboard/settings');
    }

    if (params.get('purchase_cancelled') === 'true') {
      toast("Policy purchase was canceled. No charges were made.");
      window.history.replaceState({}, '', '/dashboard/settings');
    }
    
    if (upgrade === 'true') {
      setActiveTab('billing');
      setShowUpgradeModal(true);
      window.history.replaceState({}, '', '/dashboard/settings');
    }
  }, [searchString, queryClient]);

  const { data: user, isLoading } = useQuery<AuthUser>({
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

  const { data: usage } = useQuery<UsageData>({
    queryKey: ["/api/usage"],
    queryFn: async () => {
      const res = await fetch("/api/usage", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch usage");
      return res.json();
    },
    enabled: !!user,
  });

  const { data: invoicesData } = useQuery<{ invoices: InvoiceData[] }>({
    queryKey: ["/api/stripe/invoices"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/invoices", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json();
    },
    enabled: !!user && activeTab === "billing",
  });

  const { data: paymentMethodData } = useQuery<{ paymentMethod: PaymentMethodData | null }>({
    queryKey: ["/api/stripe/payment-method"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/payment-method", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch payment method");
      return res.json();
    },
    enabled: !!user && activeTab === "billing",
  });

  const { data: subDetailsData } = useQuery<{ details: SubscriptionDetailsData | null }>({
    queryKey: ["/api/stripe/subscription-details"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/subscription-details", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch subscription details");
      return res.json();
    },
    enabled: !!user && !!user.stripeSubscriptionId && activeTab === "billing",
  });

  const [showAllInvoices, setShowAllInvoices] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      setLocation("/login");
    } catch {
      toast.error("Failed to log out. Please try again.");
    }
  };

  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId, billingInterval }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create checkout");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.updated) {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        queryClient.invalidateQueries({ queryKey: ['/api/usage'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stripe/subscription-details'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stripe/invoices'] });
        toast.success(`Plan changed to ${data.plan?.charAt(0).toUpperCase()}${data.plan?.slice(1)}!`);
        setShowUpgradeModal(false);
        setSelectedPlan(null);
      } else if (data.url && !isRedirectingRef.current) {
        isRedirectingRef.current = true;
        window.location.assign(data.url);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to open billing portal");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url && !isRedirectingRef.current) {
        isRedirectingRef.current = true;
        window.location.assign(data.url);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/cancel", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to cancel subscription");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Your subscription will be canceled at the end of the current billing period.");
      setShowCancelModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/subscription-details"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/reactivate", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to reactivate subscription");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Your subscription has been reactivated!");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/subscription-details"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; companyName?: string; vatNumber?: string; billingCountry?: string }) => {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update profile");
      }
      return res.json() as Promise<AuthUser & { vatWarning?: string }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      if (data?.vatWarning) {
        // Reset local VAT field so it matches what was actually saved (cleared).
        setVatNumber("");
        toast.error(data.vatWarning, { duration: 8000 });
      } else {
        toast.success("Profile updated successfully");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to change password");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const emailChangeMutation = useMutation({
    mutationFn: async (data: { newEmail: string; password: string }) => {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to request email change");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Verification email sent! Check your new email address to confirm the change.");
      setShowEmailModal(false);
      setNewEmail("");
      setEmailPassword("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setCompanyName(user.companyName || "");
      setVatNumber(user.vatNumber || "");
      setBillingCountry(user.billingCountry || "");
      setUpgradePlanMode(['pro', 'business', 'agency', 'agency_pro'].includes(user.plan) ? 'multi' : 'single');
    }
  }, [user]);

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    checkoutMutation.mutate(planId);
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getPlanDisplay = (planId: string) => {
    const plan = getPlanById(planId) || PLANS[0];
    return {
      name: plan.name,
      price: plan.priceDisplay,
      limit: plan.websites,
      views: plan.viewsDisplay,
    };
  };

  const planInfo = getPlanDisplay(user?.plan || "solo");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
          <div className="lg:col-span-9 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-28" />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and subscription.</p>
        </div>
        <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
          Log Out
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-3">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                activeTab === "profile" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              data-testid="button-tab-profile"
            >
              <User size={16} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                activeTab === "billing" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              data-testid="button-tab-billing"
            >
              <CreditCard size={16} />
              Billing
            </button>
            <button
              onClick={() => setActiveTab("api-keys")}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                activeTab === "api-keys" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              data-testid="button-tab-api-keys"
            >
              <Key size={16} />
              API Keys
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === "profile" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20 border-2 border-border">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        data-testid="input-firstName" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        data-testid="input-lastName" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input value={user?.email || ""} className="pl-9" disabled data-testid="input-email" />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowEmailModal(true)}
                        data-testid="button-change-email"
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={() => profileMutation.mutate({ firstName, lastName, companyName, vatNumber, billingCountry })}
                    disabled={profileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {profileMutation.isPending ? <Spinner size={16} className="mr-2" /> : null}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company / Billing Information</CardTitle>
                  <CardDescription>Used for invoicing and bookkeeping. Your VAT/Tax ID will appear on invoices.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your company or business name"
                      data-testid="input-companyName"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>VAT / Tax ID</Label>
                      <Input 
                        value={vatNumber}
                        onChange={(e) => setVatNumber(e.target.value)}
                        placeholder="e.g. BE0123456789, NL123456789B01"
                        data-testid="input-vatNumber"
                      />
                      <p className="text-xs text-muted-foreground">
                        Include the country prefix (BE, NL, DE, FR…). VAT changes apply to <strong>future</strong> invoices only.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Select value={billingCountry || ""} onValueChange={setBillingCountry}>
                        <SelectTrigger data-testid="select-billingCountry">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Make sure existing customers with a country code outside our
                              curated list still see their stored value as a valid option. */}
                          {billingCountry && !BILLING_COUNTRIES.some((c) => c.code === billingCountry) && (
                            <SelectItem key={billingCountry} value={billingCountry}>
                              {billingCountry}
                            </SelectItem>
                          )}
                          {BILLING_COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    onClick={() => profileMutation.mutate({ firstName, lastName, companyName, vatNumber, billingCountry })}
                    disabled={profileMutation.isPending}
                    data-testid="button-save-billing-info"
                  >
                    {profileMutation.isPending ? <Spinner size={16} className="mr-2" /> : null}
                    Save Billing Info
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your password and authentication methods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-muted-foreground">Change your account password</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowPasswordModal(true)}
                      data-testid="button-change-password"
                    >
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "billing" && (
            <>
              <Card className="border-primary/30 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Current Plan</CardTitle>
                      <CardDescription>
                        You are on the <span className="font-bold text-primary capitalize" data-testid="text-plan-name">{planInfo.name}</span> plan
                        {user?.billingInterval && (
                          <span className="text-muted-foreground"> — billed {user.billingInterval === 'yearly' ? 'annually' : 'monthly'}</span>
                        )}
                      </CardDescription>
                    </div>
                    <SubscriptionStatusBadge status={user?.subscriptionStatus || null} endDate={user?.subscriptionEndDate || null} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment failed / past_due banner — direct call-to-action */}
                  {(['past_due', 'unpaid', 'incomplete'].includes(user?.subscriptionStatus || '')) && (() => {
                    const openInvoice = invoicesData?.invoices?.find(
                      (inv) => inv.status === 'open' || inv.status === 'uncollectible'
                    );
                    return (
                      <div
                        className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg"
                        data-testid="alert-payment-issue"
                      >
                        <Warning size={20} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                            Payment issue — action required
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">
                            {user?.subscriptionStatus === 'past_due'
                              ? "Your last payment didn't go through. Pay your open invoice to keep your subscription active."
                              : "We couldn't complete your last payment. Please update your payment method or pay the invoice."}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {openInvoice?.hostedUrl && (
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => window.open(openInvoice.hostedUrl!, '_blank')}
                                data-testid="button-pay-now"
                              >
                                Pay Now
                                <ArrowSquareOut size={14} className="ml-1.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-800 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                              onClick={() => portalMutation.mutate()}
                              disabled={portalMutation.isPending}
                              data-testid="button-update-payment-method-banner"
                            >
                              {portalMutation.isPending ? <Spinner size={14} className="mr-1.5" /> : null}
                              Update payment method
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Canceled-after-period banner — guide user to start a new subscription */}
                  {user?.subscriptionStatus === 'canceled' && !subDetailsData?.details?.cancelAtPeriodEnd && (
                    <div
                      className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                      data-testid="alert-subscription-ended"
                    >
                      <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                          Your subscription has ended
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
                          Choose a plan to reactivate your account and restore full access. Your websites and data are preserved.
                        </p>
                        <Button
                          size="sm"
                          className="mt-3"
                          onClick={() => setShowUpgradeModal(true)}
                          data-testid="button-choose-plan-canceled"
                        >
                          <Sparkle size={14} className="mr-1.5" />
                          Choose a plan
                        </Button>
                      </div>
                    </div>
                  )}

                  {subDetailsData?.details?.cancelAtPeriodEnd && (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg" data-testid="alert-cancel-at-period-end">
                      <Warning size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Subscription ending</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          Your plan will cancel on {new Date(subDetailsData.details.currentPeriodEnd * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. You'll retain access until then.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950"
                          onClick={() => reactivateMutation.mutate()}
                          disabled={reactivateMutation.isPending}
                          data-testid="button-reactivate-subscription"
                        >
                          {reactivateMutation.isPending ? <Spinner size={14} className="mr-1.5" /> : null}
                          Keep my subscription
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
                      <p className="text-2xl font-bold">
                        {user?.billingInterval === 'yearly' ? (
                          <>{(() => { const p = getPlanById(user?.plan || 'solo'); return p ? `€${Math.round(p.annualPrice / 12)}` : planInfo.price; })()}</>
                        ) : planInfo.price}
                        <span className="text-base font-normal text-muted-foreground">/mo</span>
                      </p>
                      {user?.billingInterval === 'yearly' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {(() => { const p = getPlanById(user?.plan || 'solo'); return p ? `€${p.annualPrice}/year` : ''; })()}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">excl. VAT</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Websites</p>
                      <p className="text-2xl font-bold">{planInfo.limit}</p>
                      {usage && (
                        <p className="text-xs text-muted-foreground mt-1">{usage.websites.used} used</p>
                      )}
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Pageviews</p>
                      <p className="text-2xl font-bold">{planInfo.views}</p>
                      {usage && (
                        <p className="text-xs text-muted-foreground mt-1">{usage.views.percentUsed}% used</p>
                      )}
                    </div>
                  </div>

                  {subDetailsData?.details && !subDetailsData.details.cancelAtPeriodEnd && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarBlank size={16} />
                      {subDetailsData.details.trialEnd && subDetailsData.details.trialEnd * 1000 > Date.now() ? (
                        <span>Trial ends {new Date(subDetailsData.details.trialEnd * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      ) : (
                        <span>Next billing date: {new Date(subDetailsData.details.currentPeriodEnd * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap justify-end gap-3">
                    {user?.stripeSubscriptionId && subDetailsData?.details && !subDetailsData.details.cancelAtPeriodEnd && user?.subscriptionStatus !== 'canceled' && (
                      <Button 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setShowCancelModal(true)}
                        data-testid="button-cancel-subscription"
                      >
                        Cancel Subscription
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => portalMutation.mutate()}
                      disabled={portalMutation.isPending || !user?.stripeSubscriptionId}
                      title={!user?.stripeSubscriptionId ? "Complete checkout first to manage subscription" : undefined}
                      data-testid="button-manage-subscription"
                    >
                      {portalMutation.isPending ? <Spinner size={16} className="mr-2" /> : null}
                      Manage Subscription
                    </Button>
                    <Button 
                      onClick={() => setShowUpgradeModal(true)}
                      data-testid="button-upgrade-plan"
                    >
                      <Sparkle size={16} className="mr-2" />
                      {!user?.stripeSubscriptionId || user?.subscriptionStatus === 'canceled' ? 'Choose Plan' : 'Change Plan'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartBar size={20} />
                    Usage This Month
                  </CardTitle>
                  <CardDescription>Track your usage against plan limits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Websites</span>
                      <span className="text-sm text-muted-foreground" data-testid="text-websites-usage">
                        {usage?.websites.used || 0} of {usage?.websites.unlimited ? '∞' : (usage?.websites.limit || 0)}
                      </span>
                    </div>
                    <Progress 
                      value={usage?.websites.unlimited ? 0 : ((usage?.websites.used || 0) / (Number(usage?.websites.limit) || 1)) * 100} 
                      className="h-2"
                    />
                    {usage && !usage.websites.unlimited && usage.websites.used >= Number(usage.websites.limit) && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        You've reached your website limit. Upgrade to add more.
                      </p>
                    )}
                    {usage && !usage.websites.unlimited && usage.websites.used < Number(usage.websites.limit) && (usage.websites.used / Number(usage.websites.limit)) >= 0.8 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        You're approaching your website limit ({usage.websites.used} of {usage.websites.limit}).
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pageviews</span>
                      <span className="text-sm text-muted-foreground" data-testid="text-views-usage">
                        {(usage?.views.used || 0).toLocaleString()} of {(usage?.views.limit || 0).toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={usage?.views.percentUsed || 0} 
                      className="h-2"
                    />
                    {usage && usage.views.percentUsed >= 80 && usage.views.percentUsed < 100 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        You're approaching your pageview limit ({usage.views.percentUsed}% used).
                      </p>
                    )}
                    {usage && usage.views.percentUsed >= 100 && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        You've exceeded your pageview limit. Upgrade to continue tracking.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Payment Method
                  </CardTitle>
                  <CardDescription>Your payment method on file.</CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentMethodData?.paymentMethod ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-secondary rounded-lg">
                          <CreditCard size={24} weight="duotone" className="text-foreground" />
                        </div>
                        <div>
                          <p className="font-medium capitalize" data-testid="text-payment-method">
                            {paymentMethodData.paymentMethod.brand} ····{paymentMethodData.paymentMethod.last4}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires {String(paymentMethodData.paymentMethod.expMonth).padStart(2, '0')}/{paymentMethodData.paymentMethod.expYear}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => portalMutation.mutate()}
                        disabled={portalMutation.isPending}
                        data-testid="button-update-payment-method"
                      >
                        Update
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 border border-dashed rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-secondary rounded-lg">
                          <CreditCard size={24} weight="duotone" className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">No payment method</p>
                          <p className="text-sm text-muted-foreground">Add a payment method to subscribe to a plan.</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowUpgradeModal(true)}
                        data-testid="button-add-payment-method"
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt size={20} />
                        Invoice History
                      </CardTitle>
                      <CardDescription>Your past invoices and receipts.</CardDescription>
                    </div>
                    {user?.stripeSubscriptionId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => portalMutation.mutate()}
                        disabled={portalMutation.isPending}
                        className="text-muted-foreground"
                        data-testid="button-billing-portal-link"
                      >
                        <ArrowSquareOut size={16} className="mr-1.5" />
                        Billing Portal
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {invoicesData?.invoices && invoicesData.invoices.length > 0 ? (
                    <div className="space-y-3">
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-secondary/50 text-muted-foreground">
                              <th className="text-left px-4 py-2.5 font-medium">Date</th>
                              <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Invoice</th>
                              <th className="text-right px-4 py-2.5 font-medium">Amount</th>
                              <th className="text-center px-4 py-2.5 font-medium">Status</th>
                              <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {(() => {
                              // Surface open / failed invoices first so users see what needs attention.
                              const sorted = [...invoicesData.invoices].sort((a, b) => {
                                const isOpenA = a.status === 'open' || a.status === 'uncollectible';
                                const isOpenB = b.status === 'open' || b.status === 'uncollectible';
                                if (isOpenA && !isOpenB) return -1;
                                if (!isOpenA && isOpenB) return 1;
                                return b.created - a.created;
                              });
                              return (showAllInvoices ? sorted : sorted.slice(0, 6));
                            })().map((invoice) => {
                              const needsAction = invoice.status === 'open' || invoice.status === 'uncollectible';
                              return (
                              <tr
                                key={invoice.id}
                                className={`hover:bg-secondary/30 transition-colors ${needsAction ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                                data-testid={`row-invoice-${invoice.id}`}
                              >
                                <td className="px-4 py-3">
                                  {new Date(invoice.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                                  {invoice.number || '—'}
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                  {((invoice.status === 'paid' ? invoice.amountPaid : invoice.amountDue) / 100).toLocaleString('en-US', { style: 'currency', currency: invoice.currency.toUpperCase() })}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {invoice.status === 'paid' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 rounded-full text-xs font-medium">
                                      <Check size={12} /> Paid
                                    </span>
                                  )}
                                  {invoice.status === 'open' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 rounded-full text-xs font-medium">
                                      <Clock size={12} /> Open
                                    </span>
                                  )}
                                  {invoice.status === 'void' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-medium">
                                      Void
                                    </span>
                                  )}
                                  {invoice.status === 'draft' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 rounded-full text-xs font-medium">
                                      Draft
                                    </span>
                                  )}
                                  {invoice.status === 'uncollectible' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 rounded-full text-xs font-medium">
                                      <XCircle size={12} /> Failed
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    {invoice.hostedUrl && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => window.open(invoice.hostedUrl!, '_blank')}
                                        title="View invoice"
                                        data-testid={`button-view-invoice-${invoice.id}`}
                                      >
                                        <ArrowUpRight size={16} />
                                      </Button>
                                    )}
                                    {invoice.invoicePdf && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => window.open(invoice.invoicePdf!, '_blank')}
                                        title="Download PDF"
                                        data-testid={`button-download-invoice-${invoice.id}`}
                                      >
                                        <DownloadSimple size={16} />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {invoicesData.invoices.length > 6 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground"
                          onClick={() => setShowAllInvoices(!showAllInvoices)}
                          data-testid="button-toggle-invoices"
                        >
                          {showAllInvoices ? (
                            <><CaretUp size={16} className="mr-1.5" /> Show less</>
                          ) : (
                            <><CaretDown size={16} className="mr-1.5" /> Show all {invoicesData.invoices.length} invoices</>
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Receipt size={32} className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No invoices yet</p>
                      <p className="text-xs mt-1">Invoices will appear here once you subscribe to a plan.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
          {activeTab === "api-keys" && <ApiKeysManager />}
        </div>
      </div>

      <Dialog open={showUpgradeModal} onOpenChange={(open) => { setShowUpgradeModal(open); if (!open) setSelectedPlan(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Change Your Plan</DialogTitle>
            <DialogDescription>
              Choose a plan that fits your needs. All prices are excl. VAT. You can change or cancel anytime.
            </DialogDescription>
          </DialogHeader>
          {user?.stripeSubscriptionId && user?.plan && (
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg text-sm" data-testid="current-plan-indicator">
              <Info size={16} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                Currently on <span className="font-medium text-foreground capitalize">{getPlanById(user.plan)?.name || user.plan}</span>
                {user.billingInterval && <span> ({user.billingInterval})</span>}
                {(() => {
                  const currentPlan = getPlanById(user.plan);
                  if (!currentPlan) return null;
                  const currentPrice = user.billingInterval === 'yearly' ? Math.round(currentPlan.annualPrice / 12) : currentPlan.price;
                  return <span> — €{currentPrice}/mo</span>;
                })()}
              </span>
            </div>
          )}
          <div className="flex justify-center mt-2 mb-2">
            <div className="inline-flex items-center bg-secondary rounded-full p-1 gap-1" data-testid="plan-category-toggle">
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all select-none ${
                  upgradePlanMode === 'single' ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
                onClick={() => setUpgradePlanMode('single')}
                data-testid="plan-category-single"
              >
                Single Site
              </div>
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all select-none ${
                  upgradePlanMode === 'multi' ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
                onClick={() => setUpgradePlanMode('multi')}
                data-testid="plan-category-multi"
              >
                Multi-Site
              </div>
            </div>
          </div>
          <div>
            {user && (
              <PlanComparisonCards 
                currentPlan={user.plan}
                currentBillingInterval={user.billingInterval}
                onSelectPlan={(planId) => {
                  const targetPlan = getPlanById(planId);
                  const currentPlan = getPlanById(user.plan);
                  if (targetPlan && currentPlan && user.stripeSubscriptionId) {
                    const currentPrice = user.billingInterval === 'yearly' ? currentPlan.annualPrice : currentPlan.price * 12;
                    const targetPrice = billingInterval === 'yearly' ? targetPlan.annualPrice : targetPlan.price * 12;
                    if (targetPrice < currentPrice) {
                      const confirmed = window.confirm(
                        `You're switching from ${currentPlan.name} to ${targetPlan.name}.\n\nYour new plan includes ${targetPlan.websites} website(s) and ${targetPlan.viewsDisplay} pageviews/month.\n\nThe change will take effect at the end of your current billing period.`
                      );
                      if (!confirmed) return;
                    }
                  }
                  setSelectedPlan(planId);
                  handleUpgrade(planId);
                }}
                loadingPlan={checkoutMutation.isPending ? selectedPlan : null}
                mode={upgradePlanMode}
                billingInterval={billingInterval}
                onBillingChange={setBillingInterval}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input 
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  data-testid="input-current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input 
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  data-testid="input-new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                data-testid="input-confirm-password"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => passwordMutation.mutate({ currentPassword, newPassword })}
              disabled={passwordMutation.isPending || !currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 6}
              data-testid="button-submit-password"
            >
              {passwordMutation.isPending ? <Spinner size={16} className="mr-2" /> : null}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your new email address and current password to confirm.
              We'll send a verification link to your new email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>New Email Address</Label>
              <Input 
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                data-testid="input-new-email"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm with Password</Label>
              <div className="relative">
                <Input 
                  type={showEmailPassword ? "text" : "password"}
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Enter your password"
                  data-testid="input-email-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                >
                  {showEmailPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => emailChangeMutation.mutate({ newEmail, password: emailPassword })}
              disabled={emailChangeMutation.isPending || !newEmail || !emailPassword || newEmail === user?.email}
              data-testid="button-submit-email-change"
            >
              {emailChangeMutation.isPending ? <Spinner size={16} className="mr-2" /> : null}
              Send Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              <Warning size={24} className="text-destructive" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="p-3 bg-secondary/50 rounded-lg space-y-2 text-sm">
              <p>When you cancel:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>You'll keep access to your current plan until the end of your billing period</li>
                <li>After that, your account will be downgraded to the Solo plan</li>
                <li>Your websites and settings will be preserved</li>
                <li>You can reactivate anytime before the period ends</li>
              </ul>
            </div>
            {subDetailsData?.details?.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                Your access continues until <strong>{new Date(subDetailsData.details.currentPeriodEnd * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCancelModal(false)} data-testid="button-cancel-modal-dismiss">
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              data-testid="button-confirm-cancel-subscription"
            >
              {cancelMutation.isPending ? <Spinner size={16} className="mr-2" /> : null}
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
