import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useCanonical } from "@/hooks/use-canonical";
import { Shield, ArrowLeft, Envelope, ChatText, Clock, MapPin } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

function ContactPageSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact ConsentEase",
    "description": "Need help with GDPR cookie consent? Contact the ConsentEase team. We respond within 24 hours. Based in Belgium, EU.",
    "url": "https://consentease.io/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "ConsentEase",
      "url": "https://consentease.io",
      "logo": "https://consentease.io/consentease-logo.webp",
      "email": "support@consentease.com",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "BE",
        "addressRegion": "Belgium"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "email": "support@consentease.com",
          "availableLanguage": ["English", "Dutch", "French"],
          "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "09:00",
            "closes": "18:00"
          }
        },
        {
          "@type": "ContactPoint",
          "contactType": "sales",
          "email": "sales@consentease.com",
          "availableLanguage": ["English", "Dutch", "French"]
        }
      ],
      "parentOrganization": {
        "@type": "Organization",
        "name": "Saerens Advertising",
        "url": "https://saerensadvertising.com"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function ContactPage() {
  const { toast } = useToast();
  
  useCanonical("/contact");
  
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = ogTitle?.getAttribute("content") || "";
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const originalOgDescription = ogDescription?.getAttribute("content") || "";

    document.title = "Contact Us - Get Help with Cookie Consent | ConsentEase Support";
    if (metaDescription) {
      metaDescription.setAttribute("content", "Need help with GDPR cookie consent? Contact the ConsentEase team. We respond within 24 hours. Based in Belgium, EU.");
    }
    if (ogTitle) ogTitle.setAttribute("content", "Contact ConsentEase - We're Here to Help");
    if (ogDescription) ogDescription.setAttribute("content", "Get support for your cookie consent questions. Response within 24 hours.");

    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
      if (ogTitle) ogTitle.setAttribute("content", originalOgTitle);
      if (ogDescription) ogDescription.setAttribute("content", originalOgDescription);
    };
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Something went wrong",
          description: data.error || "Please try again later.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast({
        title: "Connection error",
        description: "Could not reach the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ContactPageSchema />
      <div className="min-h-screen bg-background font-sans">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2" data-testid="link-logo-home">
              <img src="/consentease-logo.webp" alt="ConsentEase" className="h-8 w-8 object-contain" />
              ConsentEase
            </Link>
            <Link href="/">
              <Button variant="ghost" className="gap-2" data-testid="button-back-home">
                <ArrowLeft size={16} />
                Back to Home
              </Button>
            </Link>
          </div>
        </nav>

        <main className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about ConsentEase? We're here to help. 
              Reach out and we'll respond within 24 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-display font-bold mb-8">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      data-testid="input-name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      data-testid="input-email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    data-testid="input-subject"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    data-testid="input-message"
                    placeholder="Tell us more..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                  data-testid="button-submit-contact"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl font-display font-bold mb-8">Other ways to reach us</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Envelope size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Support</h3>
                    <p className="text-muted-foreground text-sm mb-1">For general inquiries and support</p>
                    <a href="mailto:support@consentease.com" className="text-primary hover:underline">
                      support@consentease.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ChatText size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Sales Questions</h3>
                    <p className="text-muted-foreground text-sm mb-1">For pricing and enterprise plans</p>
                    <a href="mailto:sales@consentease.com" className="text-primary hover:underline">
                      sales@consentease.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Response Time</h3>
                    <p className="text-muted-foreground text-sm">
                      We respond to all inquiries within 24 hours during business days (Mon-Fri, 9AM-6PM CET).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-muted-foreground text-sm">
                      Saerens Advertising<br />
                      Belgium, European Union
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-xl p-6 border border-border/50 mt-8">
                <h3 className="font-semibold mb-2">Looking for technical help?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Check out our documentation for guides on setting up your consent banner, 
                  integrating with Google Tag Manager, and more.
                </p>
                <Link href="/docs">
                  <Button variant="outline" size="sm" data-testid="link-docs">
                    View Documentation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2025 ConsentEase. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-primary">Cookie Policy</Link>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
