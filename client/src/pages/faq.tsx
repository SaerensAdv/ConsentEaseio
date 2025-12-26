import { Link } from "wouter";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How long does it take to set up ConsentEase?",
        answer: "Most users are up and running in under 2 minutes. Simply add your website, customize your banner, and paste our script into your site. No technical knowledge required."
      },
      {
        question: "Do I need a developer to install ConsentEase?",
        answer: "No! If you can add a script tag to your website (or use a tool like Google Tag Manager), you can install ConsentEase. We provide step-by-step instructions for popular platforms like WordPress, Shopify, Wix, and Squarespace."
      },
      {
        question: "Can I try ConsentEase before committing?",
        answer: "Yes! Our Solo plan comes with a 7-day free trial. No credit card required to start. You can test all features and cancel anytime during the trial period."
      }
    ]
  },
  {
    category: "GDPR & Compliance",
    questions: [
      {
        question: "Does ConsentEase make my website GDPR compliant?",
        answer: "ConsentEase provides the technical infrastructure for cookie consent management, which is a key GDPR requirement. However, full GDPR compliance also depends on your privacy policy, data processing practices, and other factors. We help with the consent part - you should consult with a legal professional for complete compliance."
      },
      {
        question: "What about CCPA compliance?",
        answer: "Yes, ConsentEase supports CCPA requirements including the 'Do Not Sell My Personal Information' option. Our banners can be configured to show different options based on visitor location."
      },
      {
        question: "Does ConsentEase support Google Consent Mode v2?",
        answer: "Absolutely! ConsentEase fully supports Google Consent Mode v2 with proper initialization order. Our script sets consent defaults BEFORE loading Google Tag Manager, ensuring accurate consent signals for Google Analytics and Google Ads."
      },
      {
        question: "How long is consent stored?",
        answer: "Visitor consent preferences are stored for 12 months, which is the recommended period under GDPR. After this period, visitors will be prompted again."
      }
    ]
  },
  {
    category: "Pricing & Plans",
    questions: [
      {
        question: "What's included in each plan?",
        answer: "Solo (€5/month): 1 website, 10K monthly views, 7-day free trial. Pro (€12/month): 5 websites, 100K monthly views. Agency (€39/month): Unlimited websites, 1M monthly views, API access. All plans include full banner customization and analytics."
      },
      {
        question: "What happens if I exceed my monthly views?",
        answer: "We'll notify you when you reach 80% of your limit. If you exceed your limit, your banner will continue to work, but we'll reach out to discuss upgrading your plan. We never abruptly disable your consent banner."
      },
      {
        question: "Can I upgrade or downgrade my plan?",
        answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades apply at the start of your next billing cycle."
      },
      {
        question: "How does billing work?",
        answer: "All plans are billed monthly in Euros. We use Stripe for secure payment processing. You can cancel anytime, and your access continues until the end of your billing period."
      },
      {
        question: "Do you offer discounts for annual billing?",
        answer: "Not yet, but we're working on it! Sign up for our newsletter to be notified when annual plans become available."
      }
    ]
  },
  {
    category: "Technical",
    questions: [
      {
        question: "Will ConsentEase slow down my website?",
        answer: "Our script is lightweight (under 10KB) and loads asynchronously, so it won't block your page from rendering. Most users see no measurable impact on page load times."
      },
      {
        question: "Does ConsentEase work with single-page applications (SPAs)?",
        answer: "Yes! ConsentEase works with React, Vue, Angular, and other SPA frameworks. The consent state is managed in localStorage and persists across navigation."
      },
      {
        question: "Can I use ConsentEase with Google Tag Manager?",
        answer: "Absolutely! In fact, we recommend using GTM for maximum flexibility. Our documentation includes step-by-step instructions for GTM integration with proper consent mode configuration."
      },
      {
        question: "What if I need to customize beyond the visual options?",
        answer: "Our Pro and Agency plans give you access to additional customization. For enterprise needs with custom requirements, contact our sales team."
      }
    ]
  },
  {
    category: "Support",
    questions: [
      {
        question: "What kind of support do you offer?",
        answer: "All plans include email support with 24-hour response times during business days. We also provide comprehensive documentation and setup guides."
      },
      {
        question: "Do you offer implementation help?",
        answer: "Yes! If you're stuck, our support team can help troubleshoot your setup. For complex implementations, we can arrange a consultation call."
      },
      {
        question: "Where is my data stored?",
        answer: "All data is processed and stored within the European Union, in compliance with GDPR data residency requirements. We use secure, encrypted infrastructure."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2" data-testid="link-logo-home">
            <div className="w-8 h-8 rounded-lg bg-gradient flex items-center justify-center text-white">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            ConsentEase
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about ConsentEase. 
              Can't find what you're looking for? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>.
            </p>
          </div>

          <div className="space-y-12">
            {faqs.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="text-2xl font-display font-bold mb-6">{section.category}</h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {section.questions.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${sectionIndex}-${faqIndex}`}
                      className="bg-muted/30 rounded-xl border border-border/50 px-6"
                      data-testid={`faq-item-${sectionIndex}-${faqIndex}`}
                    >
                      <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-primary/5 rounded-2xl p-8 border border-primary/20 text-center">
            <h2 className="text-2xl font-display font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Our team is happy to help. Reach out and we'll respond within 24 hours.
            </p>
            <Link href="/contact">
              <Button data-testid="button-contact-support">Contact Support</Button>
            </Link>
          </div>
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
