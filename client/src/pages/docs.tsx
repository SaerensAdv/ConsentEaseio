import { useState } from "react";
import { Link } from "wouter";
import { Shield, ArrowLeft, Book, Code, Zap, Settings, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const guides = [
  {
    id: "quickstart",
    title: "Quick Start",
    icon: Zap,
    content: `
## Getting Started with ConsentEase

Follow these steps to add a consent banner to your website in under 2 minutes.

### Step 1: Add Your Website

1. Log in to your ConsentEase dashboard
2. Click "Add Website" and enter your domain
3. We'll automatically scan for common cookies

### Step 2: Customize Your Banner

1. Go to the Banner Configurator
2. Choose your colors, position, and text
3. Preview how it looks on desktop and mobile

### Step 3: Get Your Embed Code

1. Navigate to "Embed Code" in the dashboard
2. Copy the script tag
3. Paste it just before the closing \`</head>\` tag on your website

### Step 4: Verify Installation

Visit your website in an incognito/private browser window. You should see your consent banner appear. Try accepting and rejecting to ensure it works correctly.

**That's it!** Your website now has a fully functional, GDPR-compliant consent banner.
    `
  },
  {
    id: "gtm",
    title: "Google Tag Manager",
    icon: Code,
    content: `
## Integrating with Google Tag Manager

ConsentEase works seamlessly with Google Tag Manager and supports Google Consent Mode v2.

### Important: Script Order

For proper consent mode integration, the ConsentEase script MUST load BEFORE your GTM container. This ensures consent defaults are set before any Google tags fire.

### Step 1: Add ConsentEase Script

Add the ConsentEase script in your HTML \`<head>\` section, BEFORE your GTM snippet:

\`\`\`html
<!-- ConsentEase - MUST be first -->
<script src="https://yoursite.consentease.com/banner.js"></script>

<!-- Google Tag Manager - AFTER ConsentEase -->
<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXX');</script>
\`\`\`

### Step 2: Configure Consent Mode in GTM

1. In GTM, go to Admin → Container Settings
2. Enable "Consent Mode" if not already enabled
3. Your tags will now respect the consent signals from ConsentEase

### Step 3: Update Your Tags

For each Google tag (Analytics, Ads, etc.):

1. Click on the tag
2. Go to "Consent Settings"
3. Select "Require consent for this tag to fire"
4. Choose appropriate consent types (analytics_storage, ad_storage, etc.)

### How It Works

When a visitor makes a consent choice:
1. ConsentEase updates the consent state
2. It sends \`gtag('consent', 'update', {...})\` to the data layer
3. GTM receives the update and fires/blocks tags accordingly
    `
  },
  {
    id: "wordpress",
    title: "WordPress",
    icon: Settings,
    content: `
## Installing on WordPress

There are several ways to add ConsentEase to your WordPress site.

### Option 1: Theme Header (Recommended)

1. Go to Appearance → Theme Editor
2. Select your theme's \`header.php\` file
3. Find the \`</head>\` tag
4. Paste the ConsentEase script just before it
5. Save the file

### Option 2: Using a Plugin

Use a plugin like "Insert Headers and Footers" or "WPCode":

1. Install and activate the plugin
2. Go to the plugin settings
3. Paste the ConsentEase script in the "Header" section
4. Save changes

### Option 3: Child Theme

For theme updates, use a child theme:

1. Create a child theme if you don't have one
2. Add the script to the child theme's \`header.php\`
3. This preserves your changes during parent theme updates

### Verification

1. Clear any caching plugins
2. Visit your site in incognito mode
3. The consent banner should appear

### Common Issues

**Banner not showing?**
- Check if a caching plugin is serving old pages
- Verify the script is in the \`<head>\` section
- Ensure no JavaScript errors in the console

**Conflicts with other plugins?**
- Disable other cookie/consent plugins
- Check for duplicate consent scripts
    `
  },
  {
    id: "shopify",
    title: "Shopify",
    icon: Settings,
    content: `
## Installing on Shopify

Add ConsentEase to your Shopify store in a few clicks.

### Step 1: Access Theme Code

1. Go to Online Store → Themes
2. Click "Actions" → "Edit code" on your current theme

### Step 2: Edit theme.liquid

1. Find and open \`Layout/theme.liquid\`
2. Locate the \`</head>\` tag
3. Paste the ConsentEase script just before it:

\`\`\`html
<!-- ConsentEase Consent Banner -->
<script src="https://yoursite.consentease.com/banner.js"></script>
</head>
\`\`\`

4. Click "Save"

### Step 3: Verify

1. Preview your store
2. Open in a new incognito window
3. The consent banner should appear

### For Shopify Plus

If you're using Shopify Plus with checkout.liquid:

1. Also add the script to \`checkout.liquid\`
2. This ensures consent is collected on checkout pages

### Troubleshooting

**Theme app blocks not working?**
- Use the theme.liquid method instead
- App blocks may load after the page renders

**Script not loading?**
- Check if Content Security Policy is blocking external scripts
- Contact Shopify support if you have custom security headers
    `
  },
  {
    id: "analytics",
    title: "Analytics Guide",
    icon: Book,
    content: `
## Understanding Your Consent Analytics

ConsentEase provides detailed analytics to help you understand visitor consent behavior.

### Dashboard Metrics

**Consent Rate**
- Percentage of visitors who accept cookies
- Industry average is 70-80%
- Lower rates may indicate banner design issues

**Banner Views**
- Total number of times your banner was shown
- Helps track reach and traffic

**Decisions**
- Accept vs. Reject breakdown
- Helps optimize banner messaging

### Improving Consent Rates

**1. Clear Messaging**
- Explain why you use cookies
- Highlight benefits to the user
- Avoid legal jargon

**2. Design Matters**
- Use colors that match your brand
- Make buttons easily clickable
- Don't be intrusive

**3. Position Wisely**
- Bottom banners tend to have higher consent rates
- Avoid blocking important content
- Consider mobile users

### Exporting Data

Pro and Agency plans can export analytics data:

1. Go to Analytics in your dashboard
2. Select your date range
3. Click "Export" for CSV download

### Compliance Reports

Generate compliance reports for audits:

1. Navigate to Settings → Reports
2. Select the reporting period
3. Download PDF documentation of consent records
    `
  }
];

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const exampleScript = `<!-- ConsentEase Consent Banner -->
<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>`;

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <span className="text-gradient">Documentation</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to set up and get the most out of ConsentEase.
            </p>
          </div>

          <div className="bg-muted/30 rounded-xl border border-border/50 p-6 mb-12">
            <h2 className="font-semibold mb-4">Quick Install</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Add this script to your website's \`&lt;head&gt;\` section:
            </p>
            <div className="relative">
              <pre className="bg-background rounded-lg p-4 text-sm overflow-x-auto border border-border">
                <code>{exampleScript}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(exampleScript, "quick-install")}
                data-testid="button-copy-script"
              >
                {copiedCode === "quick-install" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="quickstart" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-2 bg-transparent mb-8">
              {guides.map((guide) => (
                <TabsTrigger
                  key={guide.id}
                  value={guide.id}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid={`tab-${guide.id}`}
                >
                  <guide.icon className="w-4 h-4" />
                  {guide.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {guides.map((guide) => (
              <TabsContent key={guide.id} value={guide.id}>
                <div className="bg-muted/30 rounded-xl border border-border/50 p-8">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: guide.content
                        .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-display font-bold mt-8 mb-4">$1</h2>')
                        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/`([^`]+)`/g, '<code class="bg-background px-1.5 py-0.5 rounded text-sm">$1</code>')
                        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-background rounded-lg p-4 text-sm overflow-x-auto border border-border my-4"><code>$2</code></pre>')
                        .replace(/^\d\. (.*$)/gm, '<li class="ml-4">$1</li>')
                        .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
                        .replace(/\n\n/g, '</p><p class="text-muted-foreground mb-4">')
                        .replace(/^(?!<)(.+)$/gm, '<p class="text-muted-foreground mb-4">$1</p>')
                    }} />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="bg-muted/30 rounded-xl border border-border/50 p-8">
              <h2 className="text-xl font-display font-bold mb-4">Need More Help?</h2>
              <p className="text-muted-foreground mb-6">
                Our support team is ready to help you get set up. Reach out and we'll respond within 24 hours.
              </p>
              <Link href="/contact">
                <Button data-testid="button-contact-support">Contact Support</Button>
              </Link>
            </div>

            <div className="bg-muted/30 rounded-xl border border-border/50 p-8">
              <h2 className="text-xl font-display font-bold mb-4">API Documentation</h2>
              <p className="text-muted-foreground mb-6">
                Agency plan users can access our REST API for advanced integrations and automation.
              </p>
              <Button variant="outline" disabled className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Coming Soon
              </Button>
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
  );
}
