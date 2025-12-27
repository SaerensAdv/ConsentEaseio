import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, ArrowLeft, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DPAPage() {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = "Data Processing Agreement (DPA) | ConsentEase";
    return () => { document.title = originalTitle; };
  }, []);

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
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                Data Processing Agreement
              </h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
            <h2 className="font-semibold mb-2">Need a signed DPA?</h2>
            <p className="text-muted-foreground mb-4">
              For enterprise customers requiring a signed Data Processing Agreement, please contact us. 
              We can provide a pre-signed DPA or execute a custom agreement upon request.
            </p>
            <Link href="/contact">
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Request Signed DPA
              </Button>
            </Link>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2>1. Introduction</h2>
            <p>
              This Data Processing Agreement ("DPA") forms part of the Terms of Service between 
              ConsentEase ("Processor," "we," "us") and the customer ("Controller," "you") who 
              subscribes to and uses the ConsentEase service.
            </p>
            <p>
              This DPA reflects the parties' agreement with respect to the processing of personal 
              data by ConsentEase on behalf of the Controller in connection with the provision of 
              the ConsentEase consent management platform.
            </p>

            <h2>2. Definitions</h2>
            <ul>
              <li><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person.</li>
              <li><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, storage, and deletion.</li>
              <li><strong>"Data Subject"</strong> means the individual to whom Personal Data relates (your website visitors).</li>
              <li><strong>"Sub-processor"</strong> means any third party engaged by ConsentEase to process Personal Data.</li>
            </ul>

            <h2>3. Scope and Purpose of Processing</h2>
            <p>
              ConsentEase processes Personal Data solely for the purpose of providing the consent 
              management service as described in our Terms of Service. This includes:
            </p>
            <ul>
              <li>Collecting and storing consent preferences from your website visitors</li>
              <li>Providing consent analytics and reporting</li>
              <li>Generating audit logs for compliance purposes</li>
              <li>Delivering the consent banner on your website</li>
            </ul>

            <h2>4. Types of Personal Data Processed</h2>
            <p>ConsentEase may process the following categories of Personal Data:</p>
            <ul>
              <li>Consent preferences and timestamps</li>
              <li>Anonymized or pseudonymized visitor identifiers</li>
              <li>IP addresses (truncated/anonymized where possible)</li>
              <li>Browser and device information for banner rendering</li>
              <li>Website domain and page URLs where consent was collected</li>
            </ul>

            <h2>5. Data Subject Categories</h2>
            <p>
              The Personal Data processed concerns the following categories of Data Subjects: 
              visitors to the Controller's website(s) who interact with the consent banner.
            </p>

            <h2>6. Duration of Processing</h2>
            <p>
              ConsentEase will process Personal Data for the duration of your subscription. 
              Upon termination, Personal Data will be deleted within 30 days, unless retention 
              is required by applicable law or you request immediate deletion.
            </p>

            <h2>7. Processor Obligations</h2>
            <p>ConsentEase shall:</p>
            <ul>
              <li>Process Personal Data only on documented instructions from the Controller</li>
              <li>Ensure that persons authorized to process Personal Data are bound by confidentiality obligations</li>
              <li>Implement appropriate technical and organizational security measures</li>
              <li>Assist the Controller in responding to Data Subject requests</li>
              <li>Assist the Controller with data protection impact assessments where required</li>
              <li>Delete or return all Personal Data upon termination of the agreement</li>
              <li>Make available information necessary to demonstrate compliance with GDPR</li>
            </ul>

            <h2>8. Security Measures</h2>
            <p>ConsentEase implements the following security measures:</p>
            <ul>
              <li>Encryption in transit using TLS 1.3</li>
              <li>Encryption at rest using AES-256</li>
              <li>Access controls and authentication for all systems</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Data center security (physical access controls, monitoring)</li>
              <li>Employee security training and background checks</li>
              <li>Incident response and disaster recovery procedures</li>
            </ul>

            <h2>9. Sub-processors</h2>
            <p>
              ConsentEase may engage Sub-processors to assist in providing the service. 
              We maintain a list of current Sub-processors and will notify you of any 
              changes with at least 30 days' notice.
            </p>
            <p>Current Sub-processors include:</p>
            <ul>
              <li><strong>Infrastructure:</strong> EU-based cloud hosting providers</li>
              <li><strong>Payment Processing:</strong> Stripe (PCI-DSS compliant)</li>
              <li><strong>Email:</strong> Transactional email service providers</li>
            </ul>

            <h2>10. Data Transfers</h2>
            <p>
              All Personal Data is processed and stored within the European Union. 
              ConsentEase does not transfer Personal Data to countries outside the 
              EU/EEA without appropriate safeguards (such as Standard Contractual Clauses) 
              and your prior consent.
            </p>

            <h2>11. Data Subject Rights</h2>
            <p>
              ConsentEase will assist you in fulfilling your obligations to respond to 
              Data Subject requests, including requests for access, rectification, 
              erasure, data portability, and objection to processing.
            </p>

            <h2>12. Data Breach Notification</h2>
            <p>
              In the event of a Personal Data breach, ConsentEase will notify you without 
              undue delay (and in any event within 72 hours) after becoming aware of the breach. 
              The notification will include the nature of the breach, categories of data affected, 
              and measures taken to address the breach.
            </p>

            <h2>13. Audit Rights</h2>
            <p>
              Upon reasonable request and subject to confidentiality obligations, ConsentEase 
              will make available information necessary to demonstrate compliance with this DPA. 
              You may also request an independent audit, conducted at your expense, with reasonable 
              notice and during normal business hours.
            </p>

            <h2>14. Liability</h2>
            <p>
              Each party's liability under this DPA is subject to the limitations set forth 
              in the Terms of Service, except that neither party's liability for breaches of 
              data protection law shall be limited.
            </p>

            <h2>15. Contact</h2>
            <p>
              For questions about this DPA or to request a signed copy, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@consentease.io<br />
              <strong>Address:</strong> ConsentEase, Belgium, EU
            </p>
          </div>

          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              This DPA is effective as of the date you accept our Terms of Service and 
              remains in effect for the duration of your subscription.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
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
