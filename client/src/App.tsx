import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import DashboardWebsites from "@/pages/dashboard/websites";
import BannerConfigurator from "@/pages/dashboard/banner";
import Analytics from "@/pages/dashboard/analytics";
import Settings from "@/pages/dashboard/settings";
import EmbedCode from "@/pages/dashboard/embed";
import Onboarding from "@/pages/onboarding";
import ComparePage from "@/pages/compare";
import LoginPage from "@/pages/login";
import PrivacyPolicy from "@/pages/legal/privacy";
import TermsOfService from "@/pages/legal/terms";
import CookiePolicy from "@/pages/legal/cookies";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import FAQPage from "@/pages/faq";
import DocsPage from "@/pages/docs";
import FeaturesPage from "@/pages/features";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/compare" component={ComparePage}/>
      <Route path="/login" component={LoginPage}/>
      <Route path="/onboarding" component={Onboarding}/>
      <Route path="/about" component={AboutPage}/>
      <Route path="/contact" component={ContactPage}/>
      <Route path="/faq" component={FAQPage}/>
      <Route path="/docs" component={DocsPage}/>
      <Route path="/features" component={FeaturesPage}/>
      <Route path="/privacy" component={PrivacyPolicy}/>
      <Route path="/terms" component={TermsOfService}/>
      <Route path="/cookies" component={CookiePolicy}/>
      <Route path="/dashboard" component={DashboardWebsites}/>
      <Route path="/dashboard/websites" component={DashboardWebsites}/>
      <Route path="/dashboard/banner" component={BannerConfigurator}/>
      <Route path="/dashboard/embed" component={EmbedCode}/>
      <Route path="/dashboard/analytics" component={Analytics}/>
      <Route path="/dashboard/settings" component={Settings}/>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;