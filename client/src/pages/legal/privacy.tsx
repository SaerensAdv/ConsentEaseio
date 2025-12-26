import { Link } from "wouter";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient flex items-center justify-center text-white">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            ConsentEase
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1 className="text-4xl font-display font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg mb-8">Last updated: December 26, 2025</p>

          <section className="mb-8">
            <h2>1. Introduction</h2>
            <p>
              ConsentEase ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our consent management platform.
            </p>
            <p>
              ConsentEase is operated by Saerens Advertising, based in Belgium, European Union. We process data in accordance with the General Data Protection Regulation (GDPR) and other applicable privacy laws.
            </p>
          </section>

          <section className="mb-8">
            <h2>2. Information We Collect</h2>
            <h3>2.1 Account Information</h3>
            <p>When you create an account, we collect:</p>
            <ul>
              <li>Email address</li>
              <li>First and last name</li>
              <li>Password (encrypted)</li>
              <li>Billing information (processed by Stripe)</li>
            </ul>

            <h3>2.2 Website Data</h3>
            <p>When you add websites to ConsentEase, we collect:</p>
            <ul>
              <li>Website domain names</li>
              <li>Cookie and script information from scans</li>
              <li>Banner configuration preferences</li>
            </ul>

            <h3>2.3 Analytics Data</h3>
            <p>We collect aggregated, anonymized consent data from your website visitors:</p>
            <ul>
              <li>Consent acceptance/rejection rates</li>
              <li>Geographic distribution (country level only)</li>
              <li>Daily consent statistics</li>
            </ul>
            <p>We do not collect personal information about your website visitors.</p>
          </section>

          <section className="mb-8">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our service</li>
              <li>Process your subscription payments</li>
              <li>Send service-related communications</li>
              <li>Improve our platform and develop new features</li>
              <li>Ensure compliance with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>4. Data Sharing</h2>
            <p>We do not sell your personal data. We may share information with:</p>
            <ul>
              <li><strong>Stripe:</strong> For payment processing</li>
              <li><strong>Service providers:</strong> Who help us operate our platform (hosting, analytics)</li>
              <li><strong>Legal authorities:</strong> When required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption, secure data storage, and regular security audits. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2>6. Your Rights (GDPR)</h2>
            <p>Under GDPR, you have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>
            <p>To exercise these rights, contact us at privacy@consentease.com</p>
          </section>

          <section className="mb-8">
            <h2>7. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Analytics data is retained for 2 years. Upon account deletion, we remove your data within 30 days, except where retention is required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2>8. International Transfers</h2>
            <p>
              Your data is processed within the European Union. If we transfer data outside the EU, we ensure appropriate safeguards are in place (Standard Contractual Clauses).
            </p>
          </section>

          <section className="mb-8">
            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2>10. Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your rights:
            </p>
            <ul>
              <li>Email: privacy@consentease.com</li>
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
