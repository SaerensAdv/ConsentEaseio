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
import Onboarding from "@/pages/onboarding";
import ComparePage from "@/pages/compare";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/compare" component={ComparePage}/>
      <Route path="/onboarding" component={Onboarding}/>
      <Route path="/dashboard" component={DashboardWebsites}/>
      <Route path="/dashboard/websites" component={DashboardWebsites}/>
      <Route path="/dashboard/banner" component={BannerConfigurator}/>
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