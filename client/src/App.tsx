import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { IconContext } from "@phosphor-icons/react";
import { Spinner } from "@/components/ui/spinner";
import { WebsiteProvider } from "@/contexts/WebsiteContext";

const PUBLIC_BASE_URL = "https://consentease.io";
const APP_BASE_URL = "https://app.consentease.io";
const PUBLIC_HOST = "consentease.io";
const APP_HOST = "app.consentease.io";

const APP_AUTH_PATHS = new Set([
  "/login", "/onboarding", "/forgot-password", "/reset-password",
  "/verify-email", "/verify-email-change", "/demo",
]);

function isAppRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === "/dashboard" || normalized.startsWith("/dashboard/") || APP_AUTH_PATHS.has(normalized);
}

function getHostNavigationTarget(): string | null {
  const { hostname, pathname, search, hash } = window.location;
  const suffix = `${pathname}${search}${hash}`;
  if (hostname === PUBLIC_HOST && isAppRoute(pathname)) return `${APP_BASE_URL}${suffix}`;
  if (hostname === APP_HOST) {
    if (pathname === "/") return `${APP_BASE_URL}/dashboard${search}${hash}`;
    if (!isAppRoute(pathname)) return `${PUBLIC_BASE_URL}${suffix}`;
  }
  return null;
}

function HostNavigationBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const target = getHostNavigationTarget();
  useEffect(() => { if (target) window.location.assign(target); }, [location, target]);
  if (target) return <PageLoader />;
  return <>{children}</>;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  return null;
}

function PageLoader() {
  return <div className="flex items-center justify-center min-h-screen"><Spinner variant="brand" size={32} className="text-primary" /></div>;
}

// Route components receive path-specific params from Wouter. Keeping this
// wrapper generic over `any` preserves those inferred props instead of forcing
// every lazy page into Record<string, any>, which is incompatible with routes
// whose `params` prop is required.
function lazyPage(
  importer: () => Promise<{ default: ComponentType<any> }>,
): ComponentType<any> {
  const Lazy = lazy(importer);
  return (props: any) => <Suspense fallback={<PageLoader />}><Lazy {...props} /></Suspense>;
}

import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

const PricingPage = lazyPage(() => import("@/pages/pricing"));
const BusinessPricingPage = lazyPage(() => import("@/pages/business"));
const CompareIndex = lazyPage(() => import("@/pages/compare/index"));
const CompareOneTrust = lazyPage(() => import("@/pages/compare/onetrust"));
const CompareCookiebot = lazyPage(() => import("@/pages/compare/cookiebot"));
const CompareUsercentrics = lazyPage(() => import("@/pages/compare/usercentrics"));
const CompareComplianz = lazyPage(() => import("@/pages/compare/complianz"));
const CompareIubenda = lazyPage(() => import("@/pages/compare/iubenda"));
const CompareCookieFirst = lazyPage(() => import("@/pages/compare/cookiefirst"));
const CompareCookieScript = lazyPage(() => import("@/pages/compare/cookie-script"));
const CompareCookieYes = lazyPage(() => import("@/pages/compare/cookieyes"));
const CompareAxeptio = lazyPage(() => import("@/pages/compare/axeptio"));
const LoginPage = lazyPage(() => import("@/pages/login"));
const ForgotPassword = lazyPage(() => import("@/pages/forgot-password"));
const ResetPassword = lazyPage(() => import("@/pages/reset-password"));
const VerifyEmail = lazyPage(() => import("@/pages/verify-email"));
const VerifyEmailChange = lazyPage(() => import("@/pages/verify-email-change"));
const PrivacyPolicy = lazyPage(() => import("@/pages/legal/privacy"));
const TermsOfService = lazyPage(() => import("@/pages/legal/terms"));
const CookiePolicy = lazyPage(() => import("@/pages/legal/cookies"));
const AboutPage = lazyPage(() => import("@/pages/about"));
const ContactPage = lazyPage(() => import("@/pages/contact"));
const FAQPage = lazyPage(() => import("@/pages/faq"));
const DocsPage = lazyPage(() => import("@/pages/docs"));
const DPAPage = lazyPage(() => import("@/pages/dpa"));
const FeaturesPage = lazyPage(() => import("@/pages/features"));
const DemoPage = lazyPage(() => import("@/pages/demo"));
const BrandPage = lazyPage(() => import("@/pages/brand"));
const ScanPage = lazyPage(() => import("@/pages/scan"));
const PoweredByPage = lazyPage(() => import("@/pages/powered-by"));
const SolutionsIndex = lazyPage(() => import("@/pages/solutions/index"));
const PlatformSolutionPage = lazyPage(() => import("@/pages/solutions/platform"));
const CountrySolutionPage = lazyPage(() => import("@/pages/solutions/country"));
const AgencyProfilePage = lazyPage(() => import("@/pages/agency/[slug]"));
const RoadmapPage = lazyPage(() => import("@/pages/roadmap"));
const BlogIndex = lazyPage(() => import("@/pages/blog/index"));
const BlogPost = lazyPage(() => import("@/pages/blog/[slug]"));

const DashboardOverview = lazyPage(() => import("@/pages/dashboard/overview"));
const DashboardWebsites = lazyPage(() => import("@/pages/dashboard/websites"));
const BannerConfigurator = lazyPage(() => import("@/pages/dashboard/banner"));
const Analytics = lazyPage(() => import("@/pages/dashboard/analytics"));
const Settings = lazyPage(() => import("@/pages/dashboard/settings"));
const EmbedCode = lazyPage(() => import("@/pages/dashboard/embed"));
const CookiesManagement = lazyPage(() => import("@/pages/dashboard/cookies"));
const ConsentLogs = lazyPage(() => import("@/pages/dashboard/consent-logs"));
const Diagnostics = lazyPage(() => import("@/pages/dashboard/diagnostics"));
const AgencyDashboard = lazyPage(() => import("@/pages/dashboard/agency"));
const PolicyGenerator = lazyPage(() => import("@/pages/dashboard/policy"));
const PolicyView = lazyPage(() => import("@/pages/dashboard/policy-view"));
const SupportPage = lazyPage(() => import("@/pages/dashboard/support"));
const Onboarding = lazyPage(() => import("@/pages/onboarding"));

import { DemoProvider } from "@/contexts/DemoContext";
import { DemoTour } from "@/components/DemoTour";
import { CursorTrail } from "@/components/CursorTrail";
const ChatWidget = lazy(() => import("@/components/ChatWidget").then((m) => ({ default: m.ChatWidget })));

const HIDDEN_CHAT_PREFIXES = [
  "/dashboard", "/login", "/onboarding", "/forgot-password", "/reset-password", "/verify-email", "/demo",
];

function PublicChat() {
  const [location] = useLocation();
  const hidden = HIDDEN_CHAT_PREFIXES.some((prefix) => location === prefix || location.startsWith(prefix + "/"));
  if (hidden) return null;
  return <Suspense fallback={null}><ChatWidget /></Suspense>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/business" component={BusinessPricingPage} />
      <Route path="/compare" component={CompareIndex} />
      <Route path="/compare/onetrust" component={CompareOneTrust} />
      <Route path="/compare/cookiebot" component={CompareCookiebot} />
      <Route path="/compare/usercentrics" component={CompareUsercentrics} />
      <Route path="/compare/complianz" component={CompareComplianz} />
      <Route path="/compare/iubenda" component={CompareIubenda} />
      <Route path="/compare/cookiefirst" component={CompareCookieFirst} />
      <Route path="/compare/cookie-script" component={CompareCookieScript} />
      <Route path="/compare/cookieyes" component={CompareCookieYes} />
      <Route path="/compare/axeptio" component={CompareAxeptio} />
      <Route path="/agency/:slug" component={AgencyProfilePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/verify-email-change" component={VerifyEmailChange} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/demo" component={DemoPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/docs" component={DocsPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/roadmap" component={RoadmapPage} />
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/cookies" component={CookiePolicy} />
      <Route path="/dpa" component={DPAPage} />
      <Route path="/brand" component={BrandPage} />
      <Route path="/scan" component={ScanPage} />
      <Route path="/powered-by" component={PoweredByPage} />
      <Route path="/solutions" component={SolutionsIndex} />
      <Route path="/solutions/:slug" component={PlatformSolutionPage} />
      <Route path="/compliance/:slug" component={CountrySolutionPage} />
      <Route path="/dashboard" component={DashboardOverview} />
      <Route path="/dashboard/websites" component={DashboardWebsites} />
      <Route path="/dashboard/banner" component={BannerConfigurator} />
      <Route path="/dashboard/cookies" component={CookiesManagement} />
      <Route path="/dashboard/embed" component={EmbedCode} />
      <Route path="/dashboard/analytics" component={Analytics} />
      <Route path="/dashboard/consent-logs" component={ConsentLogs} />
      <Route path="/dashboard/diagnostics" component={Diagnostics} />
      <Route path="/dashboard/agency" component={AgencyDashboard} />
      <Route path="/dashboard/policy" component={PolicyGenerator} />
      <Route path="/dashboard/policy/:id" component={PolicyView} />
      <Route path="/dashboard/support" component={SupportPage} />
      <Route path="/dashboard/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function RoutedContent() {
  const [location] = useLocation();
  const router = <Router />;
  return location === "/dashboard" || location.startsWith("/dashboard/")
    ? <WebsiteProvider>{router}</WebsiteProvider>
    : router;
}

function SkipLink() {
  return <a href="#main-content" className="skip-link">Skip to main content</a>;
}

function App() {
  return (
    <IconContext.Provider value={{ weight: "duotone" }}>
      <QueryClientProvider client={queryClient}>
        <DemoProvider>
          <HostNavigationBoundary>
            <SkipLink />
            <CursorTrail />
            <ScrollToTop />
            <Toaster />
            <SonnerToaster position="top-right" richColors closeButton />
            <RoutedContent />
            <DemoTour />
            <PublicChat />
          </HostNavigationBoundary>
        </DemoProvider>
      </QueryClientProvider>
    </IconContext.Provider>
  );
}

export default App;
