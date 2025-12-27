import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Shield, ArrowLeft, Book, Code, Zap, Settings, ExternalLink, Copy, Check, Globe, BarChart3, Lock, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marked } from "marked";

const guides = [
  {
    id: "quickstart",
    title: "Quick Start",
    icon: Zap,
    description: "Get up and running in under 2 minutes",
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

\`\`\`html
<!-- ConsentEase Consent Banner -->
<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>
\`\`\`

### Step 4: Verify Installation

Visit your website in an incognito/private browser window. You should see your consent banner appear. Try accepting and rejecting to ensure it works correctly.

**That's it!** Your website now has a fully functional, GDPR-compliant consent banner.

---

## Next Steps

- [Configure cookie categories](#cookie-categories) for granular consent
- [Set up Google Consent Mode v2](#gtm) for accurate analytics
- [Customize your banner design](#customization) to match your brand
    `
  },
  {
    id: "gtm",
    title: "Google Tag Manager",
    icon: Code,
    description: "Integrate with GTM and Consent Mode v2",
    content: `
## Integrating with Google Tag Manager

ConsentEase works seamlessly with Google Tag Manager and supports Google Consent Mode v2.

### Important: Script Order

For proper consent mode integration, the ConsentEase script **MUST** load BEFORE your GTM container. This ensures consent defaults are set before any Google tags fire.

### Step 1: Add ConsentEase Script

Add the ConsentEase script in your HTML \`<head>\` section, BEFORE your GTM snippet:

\`\`\`html
<!-- ConsentEase - MUST be first -->
<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>

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
4. Choose appropriate consent types:
   - \`analytics_storage\` - for Google Analytics
   - \`ad_storage\` - for Google Ads conversion tracking
   - \`ad_personalization\` - for remarketing
   - \`ad_user_data\` - for user data collection

### How It Works

When a visitor makes a consent choice:

1. ConsentEase updates the consent state in localStorage
2. It sends \`gtag('consent', 'update', {...})\` to the data layer
3. GTM receives the update and fires/blocks tags accordingly
4. The consent state persists for 12 months

### Consent Mode v2 Signals

ConsentEase maps cookie categories to Consent Mode signals:

| Cookie Category | Consent Mode Signal |
|----------------|---------------------|
| Analytics | \`analytics_storage\` |
| Marketing | \`ad_storage\`, \`ad_personalization\`, \`ad_user_data\` |
| Functional | \`functionality_storage\`, \`personalization_storage\` |
| Necessary | \`security_storage\` (always granted) |

### Testing Your Integration

1. Open Chrome DevTools → Console
2. Type \`dataLayer\` and press Enter
3. Look for consent events with your settings
4. Verify tags fire/block based on consent state
    `
  },
  {
    id: "wordpress",
    title: "WordPress",
    icon: Settings,
    description: "Install on WordPress sites",
    content: `
## Installing on WordPress

There are several ways to add ConsentEase to your WordPress site.

### Option 1: Theme Header (Recommended)

1. Go to Appearance → Theme File Editor
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

This is the **safest method** as it survives theme updates.

### Option 3: Functions.php

Add this code to your theme's \`functions.php\`:

\`\`\`php
function add_consentease_script() {
    echo '<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>';
}
add_action('wp_head', 'add_consentease_script', 1);
\`\`\`

The priority \`1\` ensures it loads before other scripts.

### Verification

1. Clear any caching plugins (WP Super Cache, W3 Total Cache, etc.)
2. Clear your CDN cache if you use one (Cloudflare, etc.)
3. Visit your site in incognito mode
4. The consent banner should appear

### Common Issues

**Banner not showing?**
- Check if a caching plugin is serving old pages
- Verify the script is in the \`<head>\` section
- Ensure no JavaScript errors in the console

**Conflicts with other plugins?**
- Disable other cookie/consent plugins
- Check for duplicate consent scripts
- Deactivate plugins one by one to find conflicts

**WooCommerce sites:**
- The banner works normally with WooCommerce
- Ensure analytics cookies are in the right category
- Test checkout flow with consent declined
    `
  },
  {
    id: "shopify",
    title: "Shopify",
    icon: Settings,
    description: "Install on Shopify stores",
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
<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>
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

**Dawn theme or OS 2.0 themes:**
- The theme.liquid file is still the best place for the script
- Don't use theme app blocks for consent scripts
    `
  },
  {
    id: "wix",
    title: "Wix",
    icon: Globe,
    description: "Install on Wix websites",
    content: `
## Installing on Wix

Add ConsentEase to your Wix website using the Custom Code feature.

### Step 1: Access Settings

1. Go to your Wix Dashboard
2. Click on "Settings" in the left menu
3. Select "Custom Code" under "Advanced Settings"

### Step 2: Add the Script

1. Click "+ Add Custom Code"
2. Paste the ConsentEase script:

\`\`\`html
<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>
\`\`\`

3. Name it "ConsentEase Banner"
4. Under "Add Code to Pages", select "All pages"
5. Under "Place Code in", select "Head"
6. Click "Apply"

### Step 3: Publish

1. Click "Publish" to make changes live
2. Visit your site in incognito mode to verify

### Alternative: Wix Velo (Advanced)

If you're using Wix Velo:

1. Go to Dev Mode → masterPage.js
2. Add the following:

\`\`\`javascript
$w.onReady(function () {
    // ConsentEase loads automatically via Custom Code
    // Use this for additional integrations
});
\`\`\`

### Important Notes

- Wix may cache pages - clear cache after changes
- Premium Wix plans are required for custom code
- The script works with all Wix templates
    `
  },
  {
    id: "squarespace",
    title: "Squarespace",
    icon: Globe,
    description: "Install on Squarespace sites",
    content: `
## Installing on Squarespace

Add ConsentEase to your Squarespace website through Code Injection.

### Step 1: Access Code Injection

1. Go to your Squarespace Dashboard
2. Navigate to Settings → Advanced → Code Injection

### Step 2: Add the Script

1. In the "Header" section, paste:

\`\`\`html
<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>
\`\`\`

2. Click "Save"

### Step 3: Verify Installation

1. Open your site in a new incognito window
2. The consent banner should appear
3. Test accept/reject functionality

### Site-Wide vs Page-Specific

The Header Code Injection applies to all pages. If you need different behavior for specific pages, use Page-specific code injection:

1. Edit the specific page
2. Go to Page Settings → Advanced
3. Add code in the "Page Header Code Injection" field

### Squarespace 7.1 Notes

- Code Injection is available on Business and Commerce plans
- Personal plans don't support custom code injection
- Consider upgrading if you need consent management

### Commerce Sites

For Squarespace Commerce:
- The banner appears on all pages including checkout
- Ensure your payment processor cookies are categorized correctly
- Test the full checkout flow with consent declined
    `
  },
  {
    id: "cookie-categories",
    title: "Cookie Categories",
    icon: Book,
    description: "Manage and categorize your cookies",
    content: `
## Understanding Cookie Categories

ConsentEase uses four standard cookie categories aligned with GDPR requirements.

### Necessary Cookies

**Always active** - no consent required

These cookies are essential for your website to function:
- Session management
- Shopping cart functionality
- Security features
- Load balancing

Examples: session_id, csrf_token, cart_items

### Functional Cookies

Enhance user experience but aren't strictly necessary:
- Language preferences
- Region settings
- User interface customization
- Remember login status

Examples: language, theme_preference, remember_me

### Analytics Cookies

Track website usage and performance:
- Page views and sessions
- User journeys
- Performance metrics
- A/B testing

Examples: _ga, _gid, _gat (Google Analytics)

### Marketing Cookies

Used for advertising and tracking:
- Remarketing
- Conversion tracking
- Social media pixels
- Ad personalization

Examples: _fbp (Facebook), IDE (Google Ads), _gcl_au

---

## Managing Cookie Categories

### Automatic Detection

When you add a website, ConsentEase scans for common cookies and auto-categorizes them:

1. Go to your dashboard
2. Select your website
3. View detected cookies under "Cookie Management"
4. Review and adjust categories if needed

### Manual Cookie Entry

Add cookies that weren't detected:

1. Click "Add Cookie"
2. Enter the cookie name
3. Select the appropriate category
4. Add a description for transparency
5. Save

### Best Practices

1. **Be accurate** - Miscategorizing cookies can lead to compliance issues
2. **Be transparent** - Provide clear descriptions for each cookie
3. **Audit regularly** - New services may add new cookies
4. **Test thoroughly** - Verify cookies are blocked when consent is denied
    `
  },
  {
    id: "analytics",
    title: "Analytics Guide",
    icon: BarChart3,
    description: "Understand your consent analytics",
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

**Category Breakdown**
- Shows which categories visitors accept/reject
- Helps understand privacy sensitivity

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

**4. Offer Choices**
- Let users customize preferences
- Don't hide the reject button
- Be transparent about categories

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

### Key Performance Indicators

| Metric | Good | Needs Work |
|--------|------|------------|
| Consent Rate | >75% | <60% |
| Bounce Rate After Banner | <5% | >15% |
| Category Acceptance | Balanced | All-or-nothing |
    `
  },
  {
    id: "customization",
    title: "Banner Customization",
    icon: Smartphone,
    description: "Design your perfect consent banner",
    content: `
## Customizing Your Consent Banner

ConsentEase offers extensive customization options to match your brand.

### Visual Configurator

Access the visual configurator from your dashboard:

1. Select your website
2. Click "Banner Configurator"
3. See live preview as you make changes

### Available Options

**Colors**
- Background color
- Text color
- Primary button color
- Secondary button color
- Border color

**Position**
- Bottom (recommended)
- Top
- Bottom-left corner
- Bottom-right corner

**Layout**
- Full-width bar
- Compact card
- Floating dialog

**Styling**
- Border radius (0-24px)
- Shadow intensity
- Backdrop blur effect
- Animation style

**Content**
- Main heading
- Description text
- Accept button text
- Reject button text
- Preferences button text

### Mobile Optimization

The banner automatically adapts to mobile screens:

- Full-width on small screens
- Larger tap targets for buttons
- Responsive text sizing

Preview mobile layout using the toggle in the configurator.

### White-labeling

Remove "Powered by ConsentEase" branding (Pro & Agency plans):

1. Go to Settings → Branding
2. Toggle off "Show ConsentEase branding"
3. Save and republish your banner

### Custom CSS

For advanced customization, inject custom CSS:

\`\`\`css
/* Example: Change font family */
.ce-banner {
  font-family: 'Your Font', sans-serif !important;
}

/* Example: Adjust button hover */
.ce-banner .ce-accept:hover {
  transform: scale(1.02);
}
\`\`\`

Add custom CSS in Settings → Advanced → Custom Styles.
    `
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: AlertCircle,
    description: "Common issues and solutions",
    content: `
## Troubleshooting Common Issues

### Banner Not Showing

**Check these first:**

1. **Caching** - Clear browser cache and any server/CDN cache
2. **Script placement** - Ensure script is in the \`<head>\` section
3. **Console errors** - Check browser console for JavaScript errors
4. **Ad blockers** - Temporarily disable ad blockers for testing

**Verify installation:**

\`\`\`javascript
// In browser console, type:
window.ConsentEase
// Should return an object if loaded correctly
\`\`\`

### Banner Shows But Doesn't Work

**Buttons not responding:**
- Check for CSS conflicts (\`pointer-events: none\`)
- Look for JavaScript errors in console
- Verify no duplicate consent scripts

**Preferences not saving:**
- Check if localStorage is enabled
- Look for privacy browser settings blocking storage
- Test in a different browser

### Google Analytics Not Receiving Data

**With consent given:**
1. Verify consent mode signals are being sent
2. Check GTM tag firing rules
3. Ensure GA4 tag has consent settings configured

**Debugging:**
\`\`\`javascript
// Check current consent state
console.log(window.ConsentEase.getConsent());

// Check data layer for consent events
console.log(dataLayer.filter(e => e.event === 'consent_update'));
\`\`\`

### Performance Issues

**Banner loading slowly:**
- Ensure script is cached (we use CDN)
- Check network tab for load times
- Verify no render-blocking issues

**Page speed affected:**
- Script is async and shouldn't block rendering
- If issues persist, load script with \`defer\` attribute

### Conflicts with Other Tools

**Other consent tools:**
- Remove all other consent management scripts
- Only use one consent solution

**Cookie plugins (WordPress):**
- Disable plugins like "Cookie Notice", "Complianz", etc.
- ConsentEase replaces these completely

### Need More Help?

1. Check our [FAQ](/faq) for common questions
2. Contact support at support@consentease.io
3. Include your website URL and browser console logs
    `
  }
];

function DocsJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "ConsentEase Documentation",
    "description": "Complete documentation for setting up and using ConsentEase consent management platform. Installation guides, integration tutorials, and troubleshooting.",
    "author": {
      "@type": "Organization",
      "name": "ConsentEase"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ConsentEase"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function DocsPage() {
  const [activeGuide, setActiveGuide] = useState("quickstart");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";

    document.title = "Documentation - Setup Guides & Tutorials | ConsentEase";
    if (metaDescription) {
      metaDescription.setAttribute("content", "Complete documentation for ConsentEase. Step-by-step installation guides for WordPress, Shopify, Wix, Squarespace. Google Tag Manager integration and troubleshooting.");
    }

    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
    };
  }, []);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const currentGuide = guides.find(g => g.id === activeGuide) || guides[0];

  const exampleScript = `<!-- ConsentEase Consent Banner -->
<script src="https://cdn.consentease.com/banner.js?id=YOUR_WEBSITE_ID"></script>`;

  return (
    <>
      <DocsJsonLd />
      <div className="min-h-screen bg-background font-sans">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="text-2xl font-display font-bold flex items-center gap-2" data-testid="link-logo-home">
              <div className="w-8 h-8 rounded-lg bg-gradient flex items-center justify-center text-white">
                <Shield className="w-5 h-5 fill-current" />
              </div>
              ConsentEase
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/faq" className="text-muted-foreground hover:text-foreground hidden md:block">
                FAQ
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

        <div className="pt-20 flex">
          <aside className="hidden lg:block w-72 fixed left-0 top-20 bottom-0 border-r bg-muted/20 overflow-y-auto">
            <div className="p-6">
              <h2 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                Documentation
              </h2>
              <nav className="space-y-1">
                {guides.map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => setActiveGuide(guide.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeGuide === guide.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                    data-testid={`nav-${guide.id}`}
                  >
                    <guide.icon className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{guide.title}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1 lg:ml-72">
            <div className="max-w-4xl mx-auto px-6 py-12">
              <div className="lg:hidden mb-8">
                <select
                  value={activeGuide}
                  onChange={(e) => setActiveGuide(e.target.value)}
                  className="w-full p-3 rounded-lg border bg-background"
                >
                  {guides.map((guide) => (
                    <option key={guide.id} value={guide.id}>
                      {guide.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <currentGuide.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-display font-bold">{currentGuide.title}</h1>
                    <p className="text-muted-foreground">{currentGuide.description}</p>
                  </div>
                </div>
              </div>

              {activeGuide === "quickstart" && (
                <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 mb-8">
                  <h3 className="font-semibold mb-3">Quick Install Code</h3>
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
              )}

              <div 
                className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:text-sm prose-pre:bg-muted prose-pre:border prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
                dangerouslySetInnerHTML={{ __html: marked.parse(currentGuide.content) as string }}
              />

              <div className="mt-16 flex flex-col sm:flex-row gap-6">
                <div className="flex-1 bg-muted/30 rounded-xl border border-border/50 p-6">
                  <h2 className="text-lg font-display font-bold mb-3">Need More Help?</h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Our support team is ready to help you get set up.
                  </p>
                  <Link href="/contact">
                    <Button data-testid="button-contact-support">Contact Support</Button>
                  </Link>
                </div>

                <div className="flex-1 bg-muted/30 rounded-xl border border-border/50 p-6">
                  <h2 className="text-lg font-display font-bold mb-3">API Documentation</h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Agency plan users can access our REST API.
                  </p>
                  <Button variant="outline" disabled className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>

        <footer className="lg:ml-72 border-t py-8 px-6">
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
    </>
  );
}
