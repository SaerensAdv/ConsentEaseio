import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import DashboardLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, User, Mail, Shield, Check, Loader2, Sparkles, ArrowRight, BarChart3, AlertTriangle, XCircle, Clock, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { logout } from "@/lib/auth";
import { toast } from "sonner";
import { PLANS, getPlanById } from "@shared/plans";
import { PlanComparisonCards } from "@/components/PlanComparisonTable";

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
}

function SubscriptionStatusBadge({ status, endDate }: { status: string | null; endDate: string | null }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!status || status === 'active' || status === 'none') {
    return (
      <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full flex items-center gap-1.5" data-testid="badge-subscription-status">
        <Check className="w-4 h-4" />
        Active
      </div>
    );
  }

  if (status === 'trialing') {
    return (
      <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full flex items-center gap-1.5" data-testid="badge-subscription-status">
        <Clock className="w-4 h-4" />
        Trial
      </div>
    );
  }

  if (status === 'past_due') {
    return (
      <div className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full flex items-center gap-1.5" data-testid="badge-subscription-status">
        <AlertTriangle className="w-4 h-4" />
        Past Due
      </div>
    );
  }

  if (status === 'canceled') {
    return (
      <div className="flex flex-col items-end gap-1" data-testid="badge-subscription-status">
        <div className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full flex items-center gap-1.5">
          <XCircle className="w-4 h-4" />
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
        <XCircle className="w-4 h-4" />
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
  const [activeTab, setActiveTab] = useState<"profile" | "billing">("profile");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Handle checkout success - sync plan
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const success = params.get('success');
    const plan = params.get('plan');
    const upgrade = params.get('upgrade');
    
    if (success === 'true' && plan) {
      // Sync the subscription status from Stripe
      Promise.all([
        fetch('/api/stripe/sync-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ plan }),
        }),
        fetch('/api/stripe/sync-subscription', {
          method: 'POST',
          credentials: 'include',
        }),
      ]).then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        queryClient.invalidateQueries({ queryKey: ['/api/usage'] });
        toast.success(`Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`);
        // Remove query params from URL
        window.history.replaceState({}, '', '/dashboard/settings');
        setActiveTab('billing');
      });
    }
    
    // Auto-open upgrade modal when coming from limit error
    if (upgrade === 'true') {
      setActiveTab('billing');
      setShowUpgradeModal(true);
      // Remove query params from URL
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

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    setLocation("/login");
  };

  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create checkout");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
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
      if (!res.ok) throw new Error("Failed to open billing portal");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error("Failed to open billing portal");
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
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
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast.success("Profile updated successfully");
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

  // Initialize profile form when user data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
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
      limit: plan.websites === 'unlimited' ? 'Unlimited' : plan.websites,
      views: plan.viewsDisplay,
    };
  };

  const planInfo = getPlanDisplay(user?.plan || "solo");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
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
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "profile" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              data-testid="button-tab-profile"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "billing" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              data-testid="button-tab-billing"
            >
              <CreditCard className="w-4 h-4" />
              Billing
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
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">Change Avatar</Button>
                      <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max 1MB.</p>
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
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input defaultValue={user?.email || ""} className="pl-9" disabled data-testid="input-email" />
                    </div>
                  </div>

                  <Button 
                    onClick={() => profileMutation.mutate({ firstName, lastName })}
                    disabled={profileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {profileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Changes
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
                        <Shield className="w-5 h-5" />
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
              <Card className="border-primary shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Current Plan</CardTitle>
                      <CardDescription>
                        You are currently on the <span className="font-bold text-primary capitalize" data-testid="text-plan-name">{planInfo.name} Plan</span>.
                      </CardDescription>
                    </div>
                    <SubscriptionStatusBadge status={user?.subscriptionStatus || null} endDate={user?.subscriptionEndDate || null} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
                      <p className="text-2xl font-bold">{planInfo.price}<span className="text-base font-normal text-muted-foreground">/mo</span></p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Websites</p>
                      <p className="text-2xl font-bold">{planInfo.limit}</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Pageviews</p>
                      <p className="text-2xl font-bold">{planInfo.views}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => portalMutation.mutate()}
                      disabled={portalMutation.isPending}
                      data-testid="button-manage-subscription"
                    >
                      {portalMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Manage Subscription
                    </Button>
                    <Button 
                      onClick={() => setShowUpgradeModal(true)}
                      data-testid="button-upgrade-plan"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Usage This Month
                  </CardTitle>
                  <CardDescription>Track your usage against plan limits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Websites Usage */}
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
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        You've reached your website limit. Upgrade to add more.
                      </p>
                    )}
                  </div>

                  {/* Pageviews Usage */}
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
                  <CardTitle>Payment & Billing</CardTitle>
                  <CardDescription>Manage your payment methods, view invoices, and download receipts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Stripe Customer Portal</p>
                        <p className="text-sm text-muted-foreground">Update payment methods, view invoices, and download receipts</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => portalMutation.mutate()}
                      disabled={portalMutation.isPending}
                      data-testid="button-open-stripe-portal"
                    >
                      {portalMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                      Open Portal
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The Stripe Customer Portal allows you to securely manage all your billing information, update payment methods, view past invoices, and download receipts.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              Choose a plan that fits your needs. You can change or cancel anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <PlanComparisonCards 
              currentPlan={user?.plan}
              onSelectPlan={(planId) => {
                setSelectedPlan(planId);
                handleUpgrade(planId);
              }}
            />
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
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              {passwordMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
