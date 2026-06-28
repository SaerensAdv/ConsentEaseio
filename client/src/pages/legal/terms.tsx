import { useEffect } from "react";
import { Link } from "wouter";
import { useCanonical } from "@/hooks/use-canonical";
import { Shield, ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  useCanonical("/terms");
  
  useEffect(() => {
    document.title = "Terms of Service | ConsentEase";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', 'Read the ConsentEase Terms of Service. Understand the terms and conditions for using our GDPR/CCPA consent management platform including subscriptions, usage policies, and liability.');
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', 'Terms of Service | ConsentEase');
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', 'Read the ConsentEase Terms of Service. Understand the terms and conditions for using our GDPR/CCPA consent management platform including subscriptions, usage policies, and liability.');
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', 'https://consentease.io/attached_assets/image_1766697261644.png');
    
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (twitterCard) twitterCard.setAttribute('content', 'summary_large_image');
    
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', 'Terms of Service | ConsentEase');
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', 'Read the ConsentEase Terms of Service. Understand the terms and conditions for using our GDPR/CCPA consent management platform including subscriptions, usage policies, and liability.');
    
    return () => {
      document.title = "ConsentEase - Privacy Compliance for Humans";
    };
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
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
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1 className="text-4xl font-display font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground text-lg mb-8">Last updated: December 26, 2025</p>

          <section className="mb-8">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using ConsentEase ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you do not have permission to access the Service.
            </p>
            <p>
              ConsentEase is operated by Saerens Advertising, a company registered in Belgium.
            </p>
          </section>

          <section className="mb-8">
            <h2>2. Description of Service</h2>
            <p>
              ConsentEase provides a consent management platform that enables website owners to:
            </p>
            <ul>
              <li>Display customizable cookie consent banners</li>
              <li>Manage visitor consent preferences</li>
              <li>Integrate with Google Consent Mode v2</li>
              <li>Track consent analytics</li>
              <li>Maintain GDPR and CCPA compliance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>3. Account Registration</h2>
            <p>To use ConsentEase, you must:</p>
            <ul>
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
            <p>You are responsible for all activities that occur under your account.</p>
          </section>

          <section className="mb-8">
            <h2>4. Subscription Plans and Payment</h2>
            <h3>4.1 Plans</h3>
            <p>We offer seven subscription tiers: Starter (€3/month), Solo (€7/month), Premium (€12/month), Pro (€19/month), Business (€35/month), Agency (€59/month), and Agency Pro (€129/month). Features and limits vary by plan.</p>
            
            <h3>4.2 Billing</h3>
            <ul>
              <li>Subscriptions are billed monthly in advance</li>
              <li>Payments are processed securely by Stripe</li>
              <li>Prices are in Euros and include applicable taxes</li>
            </ul>

            <h3>4.3 Cancellation</h3>
            <p>
              You may cancel your subscription at any time. Your access continues until the end of the current billing period. No refunds are provided for partial months.
            </p>

            <h3>4.4 Free Trial</h3>
            <p>
              All paid plans include a 7-day free trial. A valid payment method is required at signup to start the trial, but you will not be charged until the trial period ends. You may cancel at any time before the trial ends to avoid charges.
            </p>
          </section>

          <section className="mb-8">
            <h2>5. Acceptable Use</h2>
            <p>You agree not to use ConsentEase to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malware or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for fraudulent purposes</li>
              <li>Resell the service without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>6. Your Responsibilities</h2>
            <p>As a ConsentEase user, you are responsible for:</p>
            <ul>
              <li>Ensuring your use of consent banners complies with applicable privacy laws</li>
              <li>Providing accurate information to your website visitors</li>
              <li>Properly implementing the consent script on your websites</li>
              <li>Maintaining accurate cookie classifications</li>
            </ul>
            <p>
              ConsentEase provides tools to help with compliance, but you remain responsible for your website's legal compliance.
            </p>
          </section>

          <section className="mb-8">
            <h2>7. Intellectual Property</h2>
            <p>
              ConsentEase and its original content, features, and functionality are owned by Saerens Advertising and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You retain ownership of your website content and configurations. You grant us a license to host and display your banner configurations as part of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2>8. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
            </p>
            <p>
              We do not guarantee that using ConsentEase will make your website fully compliant with all privacy laws. Compliance depends on proper implementation and configuration.
            </p>
          </section>

          <section className="mb-8">
            <h2>9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CONSENTEASE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES.
            </p>
            <p>
              Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless ConsentEase and Saerens Advertising from any claims, damages, or expenses arising from your use of the service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2>11. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
            <p>
              Upon termination, your right to use the Service ceases immediately. We may delete your data within 30 days of termination.
            </p>
          </section>

          <section className="mb-8">
            <h2>12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Belgium. Any disputes shall be resolved in the courts of Belgium. If you are a consumer in the EU, you may also be entitled to use the EU Online Dispute Resolution platform.
            </p>
          </section>

          <section className="mb-8">
            <h2>13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes via email or through the Service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2>14. Contact</h2>
            <p>
              For questions about these Terms, contact us at:
            </p>
            <ul>
              <li>Email: legal@consentease.com</li>
              <li>Saerens Advertising, Belgium</li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2025 ConsentEase. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-primary">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
