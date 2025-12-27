import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Building2, Globe, Mail, ExternalLink, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function AgencyProfilePage() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { email: string; agencySlug: string }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          referralAgency: data.agencySlug,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to sign up");
      }
      return res.json();
    },
    onSuccess: () => {
      setShowSuccess(true);
      toast.success("Check your email to complete registration!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    signupMutation.mutate({ email, agencySlug: params.slug! });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Agency Not Found</h1>
        <p className="text-muted-foreground mb-6">The agency you're looking for doesn't exist or is no longer active.</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-display font-bold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient flex items-center justify-center text-white">
              <Shield className="w-4 h-4 fill-current" />
            </div>
            ConsentEase
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/onboarding">
              <Button>Start Free Trial</Button>
            </Link>
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
                  <Building2 className="w-12 h-12 text-primary" />
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
                <Globe className="w-4 h-4" />
                {agency.websiteUrl.replace(/^https?:\/\//, '')}
                <ExternalLink className="w-3 h-3" />
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
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-display font-bold mb-2">
                    Get Started with ConsentEase
                  </h2>
                  <p className="text-muted-foreground">
                    {agency.name} recommends ConsentEase for GDPR/CCPA compliance. Sign up for a free trial and get personalized support from their team.
                  </p>
                </div>

                {showSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Check your email!</h3>
                    <p className="text-muted-foreground mb-4">
                      We've sent you a link to complete your registration. {agency.name} will be notified that you've signed up.
                    </p>
                    <Link href="/login">
                      <Button variant="outline">Go to Login</Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSignup} className="max-w-md mx-auto">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          data-testid="input-signup-email"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={signupMutation.isPending}
                        data-testid="button-signup"
                      >
                        {signupMutation.isPending ? "Signing up..." : "Start Free 7-Day Trial"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      No credit card required. Cancel anytime.
                    </p>
                  </form>
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
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Full Compliance</h3>
                <p className="text-sm text-muted-foreground">GDPR, CCPA, and Google Consent Mode v2</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">EU Data Residency</h3>
                <p className="text-sm text-muted-foreground">Your data stays in Europe</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-primary" />
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
