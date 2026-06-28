import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Buildings, Globe, Envelope, ArrowSquareOut, ArrowRight, Check, UserPlus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Agency {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  heroText: string | null;
  isFeatured: boolean;
}

interface CurrentUser {
  id: string;
  email: string;
}

export default function AgencyProfilePage() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  const inviteId = new URLSearchParams(window.location.search).get("invite");

  const { data: currentUser } = useQuery<CurrentUser>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: agency, isLoading, error } = useQuery<Agency>({
    queryKey: ["/api/agencies", params.slug],
    queryFn: async () => {
      const res = await fetch(`/api/agencies/${params.slug}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Agency not found");
        throw new Error("Failed to fetch agency");
      }
      return res.json();
    },
    enabled: !!params.slug,
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await fetch(`/api/agency/invites/${inviteId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to accept invitation");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setAcceptSuccess(true);
      toast.success(`You are now connected to ${data.agencyName}!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleStartOnboarding = () => {
    const onboardingUrl = new URL("/onboarding", window.location.origin);
    if (params.slug) {
      onboardingUrl.searchParams.set("referralAgency", params.slug);
    }
    if (inviteId) {
      onboardingUrl.searchParams.set("inviteId", inviteId);
    }
    setLocation(onboardingUrl.pathname + onboardingUrl.search);
  };

  if (isLoading || !params.slug) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Buildings size={64} className="text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Agency Not Found</h1>
        <p className="text-muted-foreground mb-6">The agency you're looking for doesn't exist or is no longer active.</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const isLoggedIn = !!currentUser;

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-display font-bold flex items-center gap-2">
            <img src="/consentease-logo.webp" alt="ConsentEase" className="h-7 w-7 object-contain" />
            ConsentEase
          </Link>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button variant="ghost" data-testid="link-dashboard">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/onboarding">
                  <Button>Start Free Trial</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              {agency.logoUrl ? (
                <img 
                  src={agency.logoUrl} 
                  alt={agency.name}
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg">
                  <Buildings size={48} className="text-primary" />
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              {agency.name}
            </h1>
            
            {agency.heroText && (
              <p className="text-xl text-muted-foreground mb-4">{agency.heroText}</p>
            )}
            
            {agency.websiteUrl && (
              <a 
                href={agency.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <Globe size={16} />
                {agency.websiteUrl.replace(/^https?:\/\//, '')}
                <ArrowSquareOut size={12} />
              </a>
            )}
          </motion.div>

          {agency.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-12"
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg mb-3">About {agency.name}</h2>
                  <p className="text-muted-foreground leading-relaxed">{agency.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                {acceptSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" data-testid="text-accept-success">Connected!</h3>
                    <p className="text-muted-foreground mb-4">
                      You are now connected to {agency.name}. They can now help manage your consent banners.
                    </p>
                    <Link href="/dashboard">
                      <Button data-testid="button-go-dashboard">Go to Dashboard</Button>
                    </Link>
                  </div>
                ) : isLoggedIn && inviteId ? (
                  <div className="text-center">
                    <div className="mb-6">
                      <h2 className="text-2xl font-display font-bold mb-2" data-testid="text-invite-heading">
                        {agency.name} has invited you
                      </h2>
                      <p className="text-muted-foreground" data-testid="text-invite-description">
                        Accept this invitation to let {agency.name} manage your consent banners. They will be able to view your websites and update banner settings on your behalf.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => acceptInviteMutation.mutate(inviteId)}
                      disabled={acceptInviteMutation.isPending}
                      data-testid="button-accept-invite"
                    >
                      {acceptInviteMutation.isPending ? "Accepting..." : "Accept Invitation"}
                      <UserPlus size={16} className="ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-display font-bold mb-2" data-testid="text-signup-heading">
                        {inviteId ? `You've been invited by ${agency.name}` : "Get Started with ConsentEase"}
                      </h2>
                      <p className="text-muted-foreground" data-testid="text-signup-description">
                        {inviteId
                          ? `${agency.name} has invited you to join ConsentEase. Create your account to get started and connect with their team.`
                          : `${agency.name} recommends ConsentEase for GDPR/CCPA compliance. Sign up for a free trial and get personalized support from their team.`}
                      </p>
                    </div>
                    <div className="max-w-md mx-auto text-center">
                      <Button 
                        size="lg"
                        className="w-full"
                        onClick={handleStartOnboarding}
                        data-testid="button-start-trial"
                      >
                        Start Free 7-Day Trial
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                      <p className="text-sm text-muted-foreground mt-4">
                        7-day free trial on every plan. Cancel anytime.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Already have an account?{" "}
                        <Link href={`/login?redirect=/agency/${params.slug}${inviteId ? `?invite=${inviteId}` : ''}`} className="text-primary hover:underline">
                          Log in
                        </Link>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Shield size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Full Compliance</h3>
                <p className="text-sm text-muted-foreground">GDPR, CCPA, and Google Consent Mode v2</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Globe size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-1">EU Data Residency</h3>
                <p className="text-sm text-muted-foreground">Your data stays in Europe</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Envelope size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Partner Support</h3>
                <p className="text-sm text-muted-foreground">Get help from {agency.name}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ConsentEase. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/legal/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-primary">Terms</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
