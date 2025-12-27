import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import DashboardWebsites from "@/pages/dashboard/websites";
import BannerConfigurator from "@/pages/dashboard/banner";
import Analytics from "@/pages/dashboard/analytics";
import Settings from "@/pages/dashboard/settings";
import EmbedCode from "@/pages/dashboard/embed";
import CookiesManagement from "@/pages/dashboard/cookies";
import ConsentLogs from "@/pages/dashboard/consent-logs";
import Diagnostics from "@/pages/dashboard/diagnostics";
import AgencyDashboard from "@/pages/dashboard/agency";
import AgencyProfilePage from "@/pages/agency/[slug]";
import Onboarding from "@/pages/onboarding";
import PricingPage from "@/pages/pricing";
import CompareIndex from "@/pages/compare/index";
import CompareOneTrust from "@/pages/compare/onetrust";
import CompareCookiebot from "@/pages/compare/cookiebot";
import CompareUsercentrics from "@/pages/compare/usercentrics";
import CompareComplianz from "@/pages/compare/complianz";
import CompareIubenda from "@/pages/compare/iubenda";
import CompareCookieFirst from "@/pages/compare/cookiefirst";
import CompareCookieScript from "@/pages/compare/cookie-script";
import CompareCookieYes from "@/pages/compare/cookieyes";
import CompareAxeptio from "@/pages/compare/axeptio";
import LoginPage from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import VerifyEmail from "@/pages/verify-email";
import PrivacyPolicy from "@/pages/legal/privacy";
import TermsOfService from "@/pages/legal/terms";
import CookiePolicy from "@/pages/legal/cookies";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import FAQPage from "@/pages/faq";
import DocsPage from "@/pages/docs";
import DPAPage from "@/pages/dpa";
import FeaturesPage from "@/pages/features";
import DemoPage from "@/pages/demo";
import ChangelogPage from "@/pages/changelog";
import RoadmapPage from "@/pages/roadmap";
import BlogIndex from "@/pages/blog/index";
import BlogPost from "@/pages/blog/[slug]";
import { DemoProvider } from "@/contexts/DemoContext";
import { DemoTour } from "@/components/DemoTour";
import { CursorTrail } from "@/components/CursorTrail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/pricing" component={PricingPage}/>
      <Route path="/compare" component={CompareIndex}/>
      <Route path="/compare/onetrust" component={CompareOneTrust}/>
      <Route path="/compare/cookiebot" component={CompareCookiebot}/>
      <Route path="/compare/usercentrics" component={CompareUsercentrics}/>
      <Route path="/compare/complianz" component={CompareComplianz}/>
      <Route path="/compare/iubenda" component={CompareIubenda}/>
      <Route path="/compare/cookiefirst" component={CompareCookieFirst}/>
      <Route path="/compare/cookie-script" component={CompareCookieScript}/>
      <Route path="/compare/cookieyes" component={CompareCookieYes}/>
      <Route path="/compare/axeptio" component={CompareAxeptio}/>
      <Route path="/agency/:slug" component={AgencyProfilePage}/>
      <Route path="/login" component={LoginPage}/>
      <Route path="/forgot-password" component={ForgotPassword}/>
      <Route path="/reset-password" component={ResetPassword}/>
      <Route path="/verify-email" component={VerifyEmail}/>
      <Route path="/onboarding" component={Onboarding}/>
      <Route path="/demo" component={DemoPage}/>
      <Route path="/about" component={AboutPage}/>
      <Route path="/contact" component={ContactPage}/>
      <Route path="/faq" component={FAQPage}/>
      <Route path="/docs" component={DocsPage}/>
      <Route path="/features" component={FeaturesPage}/>
      <Route path="/changelog" component={ChangelogPage}/>
      <Route path="/roadmap" component={RoadmapPage}/>
      <Route path="/blog" component={BlogIndex}/>
      <Route path="/blog/:slug" component={BlogPost}/>
      <Route path="/privacy" component={PrivacyPolicy}/>
      <Route path="/terms" component={TermsOfService}/>
      <Route path="/cookies" component={CookiePolicy}/>
      <Route path="/dpa" component={DPAPage}/>
      <Route path="/dashboard" component={DashboardWebsites}/>
      <Route path="/dashboard/websites" component={DashboardWebsites}/>
      <Route path="/dashboard/banner" component={BannerConfigurator}/>
      <Route path="/dashboard/cookies" component={CookiesManagement}/>
      <Route path="/dashboard/embed" component={EmbedCode}/>
      <Route path="/dashboard/analytics" component={Analytics}/>
      <Route path="/dashboard/consent-logs" component={ConsentLogs}/>
      <Route path="/dashboard/diagnostics" component={Diagnostics}/>
      <Route path="/dashboard/agency" component={AgencyDashboard}/>
      <Route path="/dashboard/settings" component={Settings}/>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DemoProvider>
        <CursorTrail />
        <ScrollToTop />
        <Toaster />
        <Router />
        <DemoTour />
      </DemoProvider>
    </QueryClientProvider>
  );
}

export default App;
