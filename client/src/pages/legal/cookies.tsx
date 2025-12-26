import { Link } from "wouter";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiePolicy() {
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
          <h1 className="text-4xl font-display font-bold mb-2">Cookie Policy</h1>
          <p className="text-muted-foreground text-lg mb-8">Last updated: December 26, 2025</p>

          <section className="mb-8">
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and understand how you interact with the site.
            </p>
          </section>

          <section className="mb-8">
            <h2>2. How We Use Cookies</h2>
            <p>
              ConsentEase uses a minimal set of cookies to provide our service. We practice what we preach - we only use essential cookies and respect your privacy choices.
            </p>
          </section>

          <section className="mb-8">
            <h2>3. Types of Cookies We Use</h2>
            
            <h3>3.1 Essential Cookies</h3>
            <p>These cookies are necessary for the website to function properly:</p>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>connect.sid</code></td>
                  <td>Session management - keeps you logged in</td>
                  <td>7 days</td>
                </tr>
              </tbody>
            </table>

            <h3>3.2 Functional Cookies</h3>
            <p>These cookies remember your preferences:</p>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>theme</code></td>
                  <td>Remembers your dark/light mode preference</td>
                  <td>1 year</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-8">
            <h2>4. Third-Party Cookies</h2>
            <p>We use the following third-party services that may set cookies:</p>
            
            <h3>Stripe (Payment Processing)</h3>
            <p>
              When you make a payment, Stripe may set cookies for fraud prevention and payment processing. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe's Privacy Policy</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2>5. Cookies on Your Websites</h2>
            <p>
              The ConsentEase consent banner script that you embed on your websites sets the following cookie:
            </p>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>ce_consent_[id]</code></td>
                  <td>Stores visitor consent preferences</td>
                  <td>1 year</td>
                </tr>
              </tbody>
            </table>
            <p>
              This cookie is essential for remembering your visitors' consent choices and is set in localStorage, not as a traditional cookie.
            </p>
          </section>

          <section className="mb-8">
            <h2>6. Managing Cookies</h2>
            <p>
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul>
              <li>View what cookies are stored</li>
              <li>Delete individual or all cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies (note: this may affect website functionality)</li>
            </ul>
            
            <h3>Browser-Specific Instructions:</h3>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>7. Do Not Track</h2>
            <p>
              ConsentEase respects the "Do Not Track" browser signal. When enabled, we minimize data collection to essential functions only.
            </p>
          </section>

          <section className="mb-8">
            <h2>8. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy to reflect changes in our practices or for legal reasons. We encourage you to review this page periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2>9. Contact Us</h2>
            <p>
              If you have questions about our use of cookies:
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
