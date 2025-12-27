import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, ArrowLeft, HelpCircle, CreditCard, Lock, Settings, Cookie, Palette, Zap } from "lucide-react";
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
    icon: Zap,
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
      },
      {
        question: "What happens after I sign up?",
        answer: "You'll be guided through a simple onboarding process: add your website domain, customize your banner design, and copy your embed code. The whole process takes about 2 minutes."
      },
      {
        question: "Can I migrate from another consent management platform?",
        answer: "Absolutely! Simply remove your old consent script and add the ConsentEase script. Visitor consent preferences will be collected fresh, which is actually recommended for compliance accuracy."
      }
    ]
  },
  {
    category: "GDPR & Compliance",
    icon: Shield,
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
      },
      {
        question: "Do you provide consent records for audits?",
        answer: "Yes! ConsentEase maintains detailed consent logs including timestamps, consent choices, and visitor identifiers. Pro and Agency plans can export these records for compliance audits."
      },
      {
        question: "Is ConsentEase suitable for websites outside the EU?",
        answer: "Yes! While ConsentEase is designed with GDPR in mind, cookie consent is becoming a global standard. Many countries including Brazil (LGPD), Canada (PIPEDA), and US states are implementing similar requirements."
      }
    ]
  },
  {
    category: "Cookie Categories",
    icon: Cookie,
    questions: [
      {
        question: "What cookie categories does ConsentEase support?",
        answer: "ConsentEase supports four standard categories: Necessary (always active, required for site function), Functional (preferences and settings), Analytics (traffic analysis), and Marketing (advertising and tracking). You can customize descriptions for each category."
      },
      {
        question: "Can visitors choose individual cookie categories?",
        answer: "Yes! Your banner can show a 'Preferences' button that lets visitors granularly select which categories they accept. This is recommended for full GDPR compliance."
      },
      {
        question: "What are 'Necessary' cookies?",
        answer: "Necessary cookies are essential for your website to function properly - things like session management, shopping carts, and security features. These don't require consent and are always active."
      },
      {
        question: "How does ConsentEase handle third-party cookies?",
        answer: "ConsentEase integrates with Google Consent Mode to signal consent state to third-party scripts. When visitors decline, these scripts are blocked from setting cookies until consent is given."
      },
      {
        question: "Can I add custom cookies to categories?",
        answer: "Yes! Our automatic cookie scanner detects common cookies, but you can also manually add cookies and assign them to appropriate categories in your dashboard."
      }
    ]
  },
  {
    category: "Pricing & Plans",
    icon: CreditCard,
    questions: [
      {
        question: "What's included in each plan?",
        answer: "Solo (€5/month): 1 website, 10K monthly views, 7-day free trial. Pro (€12/month): 5 websites, 100K monthly views, white-labeling. Agency (€39/month): Unlimited websites, 1M monthly views, API access, white-labeling. All plans include full banner customization and analytics."
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
      },
      {
        question: "Is there a free plan?",
        answer: "We offer a 7-day free trial on the Solo plan so you can test all features risk-free. After the trial, you'll need to subscribe to continue using ConsentEase."
      },
      {
        question: "Can I get a refund?",
        answer: "If you're not satisfied within the first 14 days of a paid subscription, contact us and we'll provide a full refund. No questions asked."
      }
    ]
  },
  {
    category: "Customization & White-labeling",
    icon: Palette,
    questions: [
      {
        question: "How much can I customize the banner?",
        answer: "Almost everything! Colors, fonts, text, button styles, position (top/bottom), animations, backdrop blur, border radius, and more. Our visual configurator shows changes in real-time."
      },
      {
        question: "Can I remove 'Powered by ConsentEase' branding?",
        answer: "Yes! White-labeling is available on Pro and Agency plans. This lets you present a fully branded experience to your visitors."
      },
      {
        question: "Can I use my own fonts?",
        answer: "The banner inherits fonts from your website, so it automatically matches your branding. You can also override with web-safe fonts through CSS."
      },
      {
        question: "Does the banner work on mobile devices?",
        answer: "Absolutely! The banner is fully responsive and automatically adapts to different screen sizes. You can preview both desktop and mobile layouts in our configurator."
      },
      {
        question: "Can I add my company logo to the banner?",
        answer: "Yes, you can upload a custom icon or logo to display in your consent banner. This is available on all plans."
      },
      {
        question: "Can I customize the banner per website?",
        answer: "Yes! Each website can have its own unique banner design and settings. Perfect for agencies managing multiple client sites."
      }
    ]
  },
  {
    category: "Technical",
    icon: Settings,
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
      },
      {
        question: "Does ConsentEase affect SEO?",
        answer: "No, ConsentEase is designed to have minimal impact on SEO. The script loads asynchronously and doesn't affect Core Web Vitals. Proper consent management can actually improve SEO by ensuring compliance."
      },
      {
        question: "Is there an API available?",
        answer: "Yes! Agency plan subscribers have access to our REST API for advanced integrations, automation, and custom reporting. Full API documentation is available in the dashboard."
      },
      {
        question: "What browsers are supported?",
        answer: "ConsentEase supports all modern browsers: Chrome, Firefox, Safari, Edge, and their mobile versions. We also support Internet Explorer 11 for legacy users."
      }
    ]
  },
  {
    category: "Security & Privacy",
    icon: Lock,
    questions: [
      {
        question: "Where is my data stored?",
        answer: "All data is processed and stored within the European Union, in compliance with GDPR data residency requirements. We use secure, encrypted infrastructure hosted on enterprise-grade servers."
      },
      {
        question: "Is my data encrypted?",
        answer: "Yes! All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. We follow industry best practices for data security."
      },
      {
        question: "Who has access to my consent data?",
        answer: "Only you and authorized team members on your account can access your consent data. ConsentEase employees cannot access customer data without explicit permission."
      },
      {
        question: "What happens to my data if I cancel?",
        answer: "Upon cancellation, your data is retained for 30 days in case you change your mind. After that, it's permanently deleted from our systems. You can request immediate deletion if needed."
      },
      {
        question: "Is ConsentEase itself GDPR compliant?",
        answer: "Yes! As a company handling EU visitor data, we are fully GDPR compliant. We act as a Data Processor on your behalf, and we have a comprehensive Data Processing Agreement available."
      },
      {
        question: "Do you share data with third parties?",
        answer: "Never. Your consent data is yours alone. We don't sell, share, or use your data for any purpose other than providing the ConsentEase service."
      }
    ]
  },
  {
    category: "Support",
    icon: HelpCircle,
    questions: [
      {
        question: "What kind of support do you offer?",
        answer: "All plans include email support with 24-hour response times during business days. We also provide comprehensive documentation, video tutorials, and setup guides."
      },
      {
        question: "Do you offer implementation help?",
        answer: "Yes! If you're stuck, our support team can help troubleshoot your setup. For complex implementations, we can arrange a consultation call."
      },
      {
        question: "Is there a community or forum?",
        answer: "We're building a community! In the meantime, you can reach us directly via email or through the in-app chat for quick questions."
      },
      {
        question: "Do you provide training or onboarding calls?",
        answer: "For Agency plan customers, we offer personalized onboarding calls to help you get the most out of ConsentEase. Solo and Pro users have access to our comprehensive video tutorials."
      },
      {
        question: "How do I report a bug or request a feature?",
        answer: "You can report bugs or request features through our in-app feedback button or by emailing support@consentease.io. We actively incorporate user feedback into our roadmap."
      }
    ]
  }
];

function FAQJsonLd() {
  const faqItems = faqs.flatMap(section => 
    section.questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function FAQPage() {
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";

    document.title = "FAQ - Frequently Asked Questions | ConsentEase";
    if (metaDescription) {
      metaDescription.setAttribute("content", "Find answers to common questions about ConsentEase, GDPR compliance, cookie consent, pricing, and more. Get the help you need to implement compliant consent management.");
    }

    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
    };
  }, []);

  return (
    <>
      <FAQJsonLd />
      <div className="min-h-screen bg-background font-sans">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2" data-testid="link-logo-home">
              <div className="w-8 h-8 rounded-lg bg-gradient flex items-center justify-center text-white">
                <Shield className="w-5 h-5 fill-current" />
              </div>
              ConsentEase
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/docs" className="text-muted-foreground hover:text-foreground hidden md:block">
                Documentation
              </Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground hidden md:block">
                Blog
              </Link>
              <Link href="/">
                <Button variant="ghost" className="gap-2" data-testid="button-back-home">
                  <ArrowLeft className="w-4 h-4" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
                <HelpCircle className="w-4 h-4" />
                Help Center
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about ConsentEase. 
                Can't find what you're looking for? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {faqs.map((section, index) => (
                <a 
                  key={index}
                  href={`#${section.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium"
                >
                  <section.icon className="w-4 h-4" />
                  {section.category}
                </a>
              ))}
            </div>

            <div className="space-y-12">
              {faqs.map((section, sectionIndex) => (
                <div key={sectionIndex} id={section.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-display font-bold">{section.category}</h2>
                  </div>
                  <Accordion type="single" collapsible className="space-y-3">
                    {section.questions.map((faq, faqIndex) => (
                      <AccordionItem 
                        key={faqIndex} 
                        value={`${sectionIndex}-${faqIndex}`}
                        className="bg-muted/30 rounded-xl border border-border/50 px-6"
                        data-testid={`faq-item-${sectionIndex}-${faqIndex}`}
                      >
                        <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            <div className="mt-20 bg-gradient rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Still have questions?</h2>
                <p className="text-white/80 mb-6 max-w-lg mx-auto">
                  Our team is happy to help. Reach out and we'll respond within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="button-contact-support">
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/docs">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      Read Documentation
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t py-8 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
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
