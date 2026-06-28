import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useCanonical } from "@/hooks/use-canonical";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DownloadSimple,
  Copy,
  Check,
  X,
  CheckCircle,
  XCircle,
  TextAa,
  Palette,
  Image,
  Megaphone,
  Package,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const BRAND_COLORS = [
  { name: "Primary Purple", hex: "#726CEA", hsl: "262 65% 65%", rgb: "114, 108, 234", usage: "Primary brand color, buttons, links, accents" },
  { name: "Dark Purple", hex: "#2D1F4E", hsl: "260 20% 15%", rgb: "45, 31, 78", usage: "Headings, body text, dark backgrounds" },
  { name: "Accent Orange", hex: "#F5A623", hsl: "35 95% 55%", rgb: "245, 166, 35", usage: "Call-to-action highlights, badges, emphasis" },
  { name: "Light Purple", hex: "#F0EEF9", hsl: "262 50% 96%", rgb: "240, 238, 249", usage: "Secondary backgrounds, subtle accents" },
  { name: "Muted Grey", hex: "#F4F4F5", hsl: "240 5% 96%", rgb: "244, 244, 245", usage: "Muted backgrounds, dividers" },
  { name: "White", hex: "#FFFFFF", hsl: "0 0% 100%", rgb: "255, 255, 255", usage: "Page backgrounds, card surfaces" },
];

const LOGO_VARIANTS = [
  { name: "Primary Logo", desc: "Full color on light backgrounds", bg: "bg-white", textColor: "text-foreground", file: "/consentease-logo-primary.svg" },
  { name: "White Logo", desc: "For use on dark or colored backgrounds", bg: "bg-[#2D1F4E]", textColor: "text-white", file: "/consentease-logo-white.svg" },
  { name: "Icon Only", desc: "When space is limited or as a favicon", bg: "bg-white", textColor: "text-foreground", file: "/consentease-logo-icon-only.svg" },
  { name: "Icon on Dark", desc: "Icon variant on dark backgrounds", bg: "bg-[#2D1F4E]", textColor: "text-white", file: "/consentease-logo-icon-on-dark.svg" },
  { name: "Primary Transparent", desc: "Full logo with transparent background", bg: "checkerboard", textColor: "text-foreground", file: "/consentease-logo-primary-transparent.svg" },
  { name: "Icon Transparent", desc: "Icon with transparent background", bg: "checkerboard", textColor: "text-foreground", file: "/consentease-logo-icon-only-transparent.svg" },
];

const DOS = [
  "Use the logo with sufficient clear space around it",
  "Keep the logo proportions intact when resizing",
  "Use approved color variations only",
  "Place the logo on clean, uncluttered backgrounds",
  "Maintain minimum size of 32px for the icon, 120px for the full logo",
];

const DONTS = [
  "Stretch, distort, or rotate the logo",
  "Change the logo colors outside brand palette",
  "Place the logo on busy or low-contrast backgrounds",
  "Add effects like shadows, gradients, or outlines to the logo",
  "Crop or partially hide the logo",
];

const TONE_DOS = [
  { example: "Get compliant in 2 minutes", label: "Direct & confident" },
  { example: "We help you protect your visitors' privacy", label: "Empathetic & clear" },
  { example: "GDPR doesn't have to be complicated", label: "Reassuring & approachable" },
];

const TONE_DONTS = [
  { example: "Our revolutionary AI-powered paradigm-shifting solution", label: "Avoid buzzwords & jargon" },
  { example: "If you don't comply, you'll get fined!", label: "Don't use fear tactics" },
  { example: "The best cookie consent tool ever made", label: "Avoid superlatives without proof" },
];

function ColorSwatch({ color }: { color: typeof BRAND_COLORS[0] }) {
  const [copied, setCopied] = useState(false);

  const copyHex = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <button
        type="button"
        className="w-full h-28 rounded-t-xl border border-b-0 border-border/50 cursor-pointer relative overflow-hidden transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-primary"
        style={{ backgroundColor: color.hex }}
        onClick={copyHex}
        aria-label={`Copy ${color.name} hex value ${color.hex}`}
        data-testid={`swatch-${color.name.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          {copied ? (
            <span className="text-white text-sm font-medium flex items-center gap-1">
              <Check size={16} /> Copied!
            </span>
          ) : (
            <span className="text-white text-sm font-medium flex items-center gap-1">
              <Copy size={16} /> Copy HEX
            </span>
          )}
        </div>
      </button>
      <div className="p-4 rounded-b-xl border border-t-0 border-border/50 bg-card">
        <h4 className="font-semibold text-sm mb-1">{color.name}</h4>
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <p>HEX: {color.hex}</p>
          <p>RGB: {color.rgb}</p>
          <p>HSL: {color.hsl}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">{color.usage}</p>
      </div>
    </motion.div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h2 className="text-3xl font-display font-bold">{title}</h2>
      </div>
      <p className="text-muted-foreground max-w-2xl">{subtitle}</p>
    </motion.div>
  );
}

export default function BrandPage() {
  useCanonical("/brand");

  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = ogTitle?.getAttribute("content") || "";
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const originalOgDescription = ogDescription?.getAttribute("content") || "";

    document.title = "Brand Guidelines - Download Logos, Colors & Assets | ConsentEase";
    if (metaDescription) {
      metaDescription.setAttribute("content", "Download ConsentEase brand assets including logos, color palette, typography guidelines, badges, and tone of voice documentation for partners.");
    }
    if (ogTitle) ogTitle.setAttribute("content", "ConsentEase Brand Guidelines");
    if (ogDescription) ogDescription.setAttribute("content", "Everything you need to represent ConsentEase consistently. Download the complete brand kit.");

    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
      if (ogTitle) ogTitle.setAttribute("content", originalOgTitle);
      if (ogDescription) ogDescription.setAttribute("content", originalOgDescription);
    };
  }, []);

  const handleDownloadAll = () => {
    const brandKit = generateBrandKitSVG();
    const blob = new Blob([brandKit], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "consentease-brand-kit.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadLogo = (variant: typeof LOGO_VARIANTS[0]) => {
    const a = document.createElement("a");
    a.href = variant.file;
    a.download = variant.file.split("/").pop() || "consentease-logo.svg";
    a.click();
  };

  const handleDownloadBadge = (variant: string) => {
    const svg = generateBadgeSVG(variant);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consentease-badge-${variant.toLowerCase().replace(/\s+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
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

      <main className="pt-32 pb-20 px-6" id="main-content">
        <div className="max-w-6xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="mb-8">
              <img src="/consentease-logo.webp" alt="ConsentEase Logo" className="h-20 w-20 object-contain mx-auto mb-6" data-testid="img-hero-logo" />
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Brand <span className="text-gradient">Guidelines</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Everything you need to represent ConsentEase consistently. Download logos, colors, 
              typography specs, and ready-made assets for your communications.
            </p>
            <Button
              size="lg"
              className="gap-2 text-base px-8 py-6"
              onClick={handleDownloadAll}
              data-testid="button-download-brand-kit"
            >
              <Package size={20} />
              Download Complete Brand Kit
            </Button>
          </motion.div>

          <div className="w-full h-px bg-border mb-20" />

          <section className="mb-24" id="logos">
            <SectionHeader
              icon={<Image size={24} />}
              title="Logo"
              subtitle="Our logo is the cornerstone of the ConsentEase brand. Use it consistently to build recognition and trust."
            />

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {LOGO_VARIANTS.map((variant) => (
                <motion.div
                  key={variant.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-border/50 overflow-hidden"
                >
                  <div
                    className={`${variant.bg === "checkerboard" ? "" : variant.bg} p-8 flex items-center justify-center min-h-[200px]`}
                    style={variant.bg === "checkerboard" ? { background: "repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%) 0 0 / 20px 20px" } : undefined}
                  >
                    <img
                      src={variant.file}
                      alt={variant.name}
                      className={`${variant.name.includes("Icon") ? "h-16 w-16" : "h-16 max-w-[280px]"} object-contain`}
                    />
                  </div>
                  <div className="p-5 bg-card flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{variant.name}</h4>
                      <p className="text-xs text-muted-foreground">{variant.desc}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleDownloadLogo(variant)}
                      data-testid={`button-download-logo-${variant.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <DownloadSimple size={14} />
                      SVG
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border/50 p-8 bg-card"
              >
                <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2 text-green-600">
                  <CheckCircle size={24} />
                  Do's
                </h3>
                <ul className="space-y-3">
                  {DOS.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border/50 p-8 bg-card"
              >
                <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2 text-red-500">
                  <XCircle size={24} />
                  Don'ts
                </h3>
                <ul className="space-y-3">
                  {DONTS.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <X size={16} className="text-red-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </section>

          <div className="w-full h-px bg-border mb-20" />

          <section className="mb-24" id="colors">
            <SectionHeader
              icon={<Palette size={24} />}
              title="Color Palette"
              subtitle="Our colors reflect trust, approachability, and professionalism. Click any swatch to copy the HEX value."
            />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {BRAND_COLORS.map((color) => (
                <ColorSwatch key={color.name} color={color} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border/50 p-8 bg-card"
            >
              <h3 className="font-display font-bold text-lg mb-4">Color Usage Guidelines</h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
                <div>
                  <div className="w-full h-2 rounded-full bg-primary mb-3" />
                  <h4 className="font-semibold text-foreground mb-1">Primary Purple</h4>
                  <p>Use for interactive elements, CTAs, links, and key brand moments. Should be the dominant brand color in any composition.</p>
                </div>
                <div>
                  <div className="w-full h-2 rounded-full bg-accent mb-3" />
                  <h4 className="font-semibold text-foreground mb-1">Accent Orange</h4>
                  <p>Sparingly for highlights, badges, and emphasis. Creates contrast against the purple palette. Never use as a background for large areas.</p>
                </div>
                <div>
                  <div className="w-full h-2 rounded-full bg-muted mb-3" />
                  <h4 className="font-semibold text-foreground mb-1">Neutral Tones</h4>
                  <p>Light greys and whites for backgrounds and surfaces. Dark purple-grey for text. Ensures readability and a clean, professional look.</p>
                </div>
              </div>
            </motion.div>
          </section>

          <div className="w-full h-px bg-border mb-20" />

          <section className="mb-24" id="typography">
            <SectionHeader
              icon={<TextAa size={24} />}
              title="Typography"
              subtitle="Consistent typography creates a professional and recognizable brand experience across all touchpoints."
            />

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border/50 p-8 bg-card"
              >
                <div className="mb-6">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Display Font</span>
                </div>
                <h3 className="font-display text-4xl font-bold mb-2">Plus Jakarta Sans</h3>
                <p className="text-muted-foreground text-sm mb-6">Used for headings, titles, and display text. Weights: Bold (700) and Semibold (600).</p>
                <div className="space-y-3 border-t border-border/50 pt-6">
                  <p className="font-display text-3xl font-bold">Heading 1 — 36px Bold</p>
                  <p className="font-display text-2xl font-bold">Heading 2 — 24px Bold</p>
                  <p className="font-display text-xl font-semibold">Heading 3 — 20px Semibold</p>
                  <p className="font-display text-lg font-semibold">Heading 4 — 18px Semibold</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border/50 p-8 bg-card"
              >
                <div className="mb-6">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Body Font</span>
                </div>
                <h3 className="font-sans text-4xl font-bold mb-2">Inter</h3>
                <p className="text-muted-foreground text-sm mb-6">Used for body text, labels, and UI elements. Weights: Regular (400), Medium (500), Semibold (600).</p>
                <div className="space-y-3 border-t border-border/50 pt-6">
                  <p className="font-sans text-base">Body Regular — 16px / 400 weight. The quick brown fox jumps over the lazy dog.</p>
                  <p className="font-sans text-base font-medium">Body Medium — 16px / 500 weight. The quick brown fox jumps over the lazy dog.</p>
                  <p className="font-sans text-sm text-muted-foreground">Caption — 14px / 400 weight. Secondary text and descriptions.</p>
                  <p className="font-sans text-xs text-muted-foreground">Small — 12px / 400 weight. Labels and fine print.</p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border/50 p-8 bg-card"
            >
              <h3 className="font-display font-bold text-lg mb-4">Typography Rules</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                    <span>Use <strong className="text-foreground">Plus Jakarta Sans</strong> exclusively for headings</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                    <span>Use <strong className="text-foreground">Inter</strong> for all body text and UI</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                    <span>Maintain consistent heading hierarchy</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <X size={16} className="text-red-400 mt-0.5 shrink-0" />
                    <span>Don't mix display and body fonts interchangeably</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X size={16} className="text-red-400 mt-0.5 shrink-0" />
                    <span>Don't use weights outside the specified range</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X size={16} className="text-red-400 mt-0.5 shrink-0" />
                    <span>Don't substitute with similar-looking fonts</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          <div className="w-full h-px bg-border mb-20" />

          <section className="mb-24" id="badges">
            <SectionHeader
              icon={<Image size={24} />}
              title="Banners & Badges"
              subtitle="Ready-to-use badges for partners. Available in multiple color variants and formats."
            />

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "light", label: "Light", bg: "bg-white", border: true },
                { name: "dark", label: "Dark", bg: "bg-[#2D1F4E]", border: false },
                { name: "purple", label: "Purple", bg: "bg-primary", border: false },
              ].map((variant) => (
                <motion.div
                  key={variant.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-border/50 overflow-hidden"
                >
                  <div className={`${variant.bg} p-10 flex items-center justify-center min-h-[160px] ${variant.border ? "border-b border-border/50" : ""}`}>
                    <div className={`flex items-center gap-2.5 px-5 py-3 rounded-xl ${
                      variant.name === "light"
                        ? "bg-white border border-border/60 text-foreground shadow-sm"
                        : variant.name === "dark"
                        ? "bg-white/10 text-white border border-white/20"
                        : "bg-white/20 text-white border border-white/30"
                    }`}>
                      <img src="/consentease-logo.webp" alt="" className="h-6 w-6 object-contain" />
                      <div className="text-left">
                        <div className="text-[10px] opacity-70 leading-tight">Powered by</div>
                        <div className="text-sm font-display font-bold leading-tight">ConsentEase</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-card flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{variant.label} Badge</h4>
                      <p className="text-xs text-muted-foreground">For {variant.name === "light" ? "light" : "dark"} backgrounds</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleDownloadBadge(variant.name)}
                      data-testid={`button-download-badge-${variant.name}`}
                    >
                      <DownloadSimple size={14} />
                      SVG
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="w-full h-px bg-border mb-20" />

          <section className="mb-24" id="tone">
            <SectionHeader
              icon={<Megaphone size={24} />}
              title="Tone of Voice"
              subtitle="How ConsentEase speaks and writes. Our voice is confident, clear, and approachable — never intimidating or overly technical."
            />

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border/50 p-8 bg-card"
              >
                <h3 className="font-display font-bold text-lg mb-2">Brand Personality</h3>
                <p className="text-sm text-muted-foreground mb-6">ConsentEase is like a knowledgeable friend who makes complex topics feel simple.</p>
                <div className="space-y-4">
                  {[
                    { trait: "Confident", desc: "We know our stuff and speak with authority, without being arrogant." },
                    { trait: "Approachable", desc: "We use plain language. If a simpler word works, use it." },
                    { trait: "Empathetic", desc: "We understand GDPR can be overwhelming. We reassure, not scare." },
                    { trait: "Professional", desc: "We're a serious tool for serious compliance, presented with polish." },
                  ].map((item) => (
                    <div key={item.trait} className="flex gap-3">
                      <div className="w-1.5 rounded-full bg-primary shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm">{item.trait}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-border/50 p-8 bg-card"
                >
                  <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2 text-green-600">
                    <CheckCircle size={20} />
                    Write like this
                  </h3>
                  <div className="space-y-4">
                    {TONE_DOS.map((item, i) => (
                      <div key={i} className="bg-green-50 rounded-lg p-3 border border-green-100">
                        <p className="text-sm font-medium text-green-900 mb-1">"{item.example}"</p>
                        <p className="text-xs text-green-600">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-border/50 p-8 bg-card"
                >
                  <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2 text-red-500">
                    <XCircle size={20} />
                    Not like this
                  </h3>
                  <div className="space-y-4">
                    {TONE_DONTS.map((item, i) => (
                      <div key={i} className="bg-red-50 rounded-lg p-3 border border-red-100">
                        <p className="text-sm font-medium text-red-900 mb-1">"{item.example}"</p>
                        <p className="text-xs text-red-500">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-gradient p-12 text-center text-white mb-8"
          >
            <h2 className="text-3xl font-display font-bold mb-4">Need something else?</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Can't find the asset you're looking for? Get in touch and we'll help you out.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
                onClick={handleDownloadAll}
                data-testid="button-download-brand-kit-bottom"
              >
                <Package size={18} />
                Download Brand Kit
              </Button>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:text-white hover:bg-white/15" data-testid="button-contact-brand">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ConsentEase. All rights reserved.</p>
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

function generateBadgeSVG(variant: string): string {
  const isLight = variant === "light";
  const isPurple = variant === "purple";
  const bg = isLight ? "#FFFFFF" : isPurple ? "#726CEA" : "#2D1F4E";
  const textColor = isLight ? "#2D1F4E" : "#FFFFFF";
  const subtextColor = isLight ? "#71717a" : "rgba(255,255,255,0.7)";
  const borderColor = isLight ? "#E5E5E5" : "rgba(255,255,255,0.15)";
  const shieldColor = isLight ? "#726CEA" : isPurple ? "rgba(255,255,255,0.25)" : "rgba(114,108,234,0.4)";
  const checkStroke = "#FFFFFF";
  const w = 220;
  const h = 56;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <filter id="bs" x="-5%" y="-10%" width="110%" height="130%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.08)"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" rx="12" fill="${bg}" filter="url(#bs)" stroke="${borderColor}" stroke-width="1"/>
  <path d="M28,12 C33,12 37,16 37,19 L37,25 C37,31 33,34 28,36 C23,34 19,31 19,25 L19,19 C19,16 23,12 28,12 Z" fill="${shieldColor}"/>
  <path d="M24,24 L27,27 L32,21" fill="none" stroke="${checkStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="46" y="24" fill="${subtextColor}" font-size="9" font-family="'Inter',system-ui,sans-serif" font-weight="500">Powered by</text>
  <text x="46" y="40" fill="${textColor}" font-size="15" font-weight="700" font-family="'Plus Jakarta Sans','Inter',system-ui,sans-serif">ConsentEase</text>
</svg>`;
}

function generateBrandKitSVG(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ConsentEase Brand Kit</title>
<style>
  body { font-family: 'Inter', 'Helvetica Neue', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #2D1F4E; }
  h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 32px; margin-bottom: 8px; }
  h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; margin-top: 40px; border-bottom: 2px solid #F0EEF9; padding-bottom: 8px; }
  .color-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
  .color-card { border-radius: 12px; overflow: hidden; border: 1px solid #E5E5E5; }
  .color-swatch { height: 60px; }
  .color-info { padding: 12px; font-size: 13px; }
  .color-info strong { display: block; margin-bottom: 4px; }
  .rule { display: flex; align-items: flex-start; gap: 8px; margin: 8px 0; font-size: 14px; }
  .do { color: #16a34a; }
  .dont { color: #dc2626; }
  .section { margin-bottom: 32px; }
  .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
  .font-body { font-family: 'Inter', sans-serif; }
  .personality { display: flex; gap: 8px; margin: 8px 0; font-size: 14px; }
  .personality-bar { width: 4px; border-radius: 4px; background: #726CEA; }
</style>
</head>
<body>
<h1>ConsentEase Brand Kit</h1>
<p style="color: #71717a;">Complete brand guidelines for partners and collaborators.</p>

<h2>Colors</h2>
<div class="color-grid">
  <div class="color-card"><div class="color-swatch" style="background:#726CEA;"></div><div class="color-info"><strong>Primary Purple</strong>HEX: #726CEA<br>RGB: 114, 108, 234</div></div>
  <div class="color-card"><div class="color-swatch" style="background:#2D1F4E;"></div><div class="color-info"><strong>Dark Purple</strong>HEX: #2D1F4E<br>RGB: 45, 31, 78</div></div>
  <div class="color-card"><div class="color-swatch" style="background:#F5A623;"></div><div class="color-info"><strong>Accent Orange</strong>HEX: #F5A623<br>RGB: 245, 166, 35</div></div>
  <div class="color-card"><div class="color-swatch" style="background:#F0EEF9;"></div><div class="color-info"><strong>Light Purple</strong>HEX: #F0EEF9<br>RGB: 240, 238, 249</div></div>
  <div class="color-card"><div class="color-swatch" style="background:#F4F4F5;"></div><div class="color-info"><strong>Muted Grey</strong>HEX: #F4F4F5<br>RGB: 244, 244, 245</div></div>
  <div class="color-card"><div class="color-swatch" style="background:#FFFFFF; border: 1px solid #E5E5E5;"></div><div class="color-info"><strong>White</strong>HEX: #FFFFFF<br>RGB: 255, 255, 255</div></div>
</div>

<h2>Typography</h2>
<div class="section">
  <p><strong>Display Font:</strong> Plus Jakarta Sans (Bold 700, Semibold 600)</p>
  <p><strong>Body Font:</strong> Inter (Regular 400, Medium 500, Semibold 600)</p>
  <p style="margin-top:12px; font-size:14px; color:#71717a;">Use Plus Jakarta Sans for headings and Inter for body text. Never substitute with other fonts.</p>
</div>

<h2>Logo Files</h2>
<div class="section">
  <p style="margin-bottom:16px;">Download the official logo files from the ConsentEase Brand page at <a href="https://consentease.io/brand" style="color:#726CEA;">consentease.io/brand</a></p>
  <p style="font-size:14px; color:#71717a; margin-bottom:8px;">Available variants: Primary Logo, White Logo, Icon Only, Icon on Dark.</p>
</div>

<h2>Logo Usage</h2>
<div class="section">
  <p><strong>Do:</strong></p>
  <div class="rule do">✓ Use the logo with sufficient clear space</div>
  <div class="rule do">✓ Keep proportions intact when resizing</div>
  <div class="rule do">✓ Use approved color variations only</div>
  <div class="rule do">✓ Place on clean, uncluttered backgrounds</div>
  <div class="rule do">✓ Minimum size: 32px icon, 120px full logo</div>
  <p style="margin-top:16px;"><strong>Don't:</strong></p>
  <div class="rule dont">✗ Stretch, distort, or rotate the logo</div>
  <div class="rule dont">✗ Change colors outside brand palette</div>
  <div class="rule dont">✗ Place on busy or low-contrast backgrounds</div>
  <div class="rule dont">✗ Add shadows, gradients, or outlines</div>
  <div class="rule dont">✗ Crop or partially hide the logo</div>
</div>

<h2>Tone of Voice</h2>
<div class="section">
  <div class="personality"><div class="personality-bar"></div><div><strong>Confident</strong> — We know our stuff, without being arrogant.</div></div>
  <div class="personality"><div class="personality-bar"></div><div><strong>Approachable</strong> — Plain language. Simpler words win.</div></div>
  <div class="personality"><div class="personality-bar"></div><div><strong>Empathetic</strong> — We reassure, not scare.</div></div>
  <div class="personality"><div class="personality-bar"></div><div><strong>Professional</strong> — Serious compliance, polished presentation.</div></div>
</div>

<hr style="border: none; border-top: 1px solid #E5E5E5; margin: 32px 0;">
<p style="font-size:12px; color:#71717a;">&copy; ${new Date().getFullYear()} ConsentEase. All rights reserved. For questions, contact us at hello@consentease.io</p>
</body>
</html>`;
}
