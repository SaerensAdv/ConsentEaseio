export interface PlanFeature {
  name: string;
  [planId: string]: boolean | string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  annualPrice: number;
  annualPriceDisplay: string;
  period: string;
  description: string;
  websites: number;
  views: number;
  viewsDisplay: string;
  popular?: boolean;
  trialDays: number;
  category: 'single' | 'multi';
}

// Single-Site Plans (one website per account)
const starter: Plan = {
  id: "starter",
  name: "Starter",
  price: 3,
  priceDisplay: "€3",
  annualPrice: 30,
  annualPriceDisplay: "€30",
  period: "/month",
  description: "Get started with cookie consent management for one website.",
  websites: 1,
  views: 10000,
  viewsDisplay: "10K",
  trialDays: 7,
  category: 'single',
};

const solo: Plan = {
  id: "solo",
  name: "Solo",
  price: 7,
  priceDisplay: "€7",
  annualPrice: 70,
  annualPriceDisplay: "€70",
  period: "/month",
  description: "Perfect for personal sites and side projects.",
  websites: 1,
  views: 25000,
  viewsDisplay: "25K",
  popular: true,
  trialDays: 7,
  category: 'single',
};

const premium: Plan = {
  id: "premium",
  name: "Premium",
  price: 12,
  priceDisplay: "€12",
  annualPrice: 120,
  annualPriceDisplay: "€120",
  period: "/month",
  description: "Full-featured consent management for one high-traffic website.",
  websites: 1,
  views: 100000,
  viewsDisplay: "100K",
  trialDays: 7,
  category: 'single',
};

// Multi-Site Plans (manage multiple websites from one account)
const pro: Plan = {
  id: "pro",
  name: "Pro",
  price: 19,
  priceDisplay: "€19",
  annualPrice: 190,
  annualPriceDisplay: "€190",
  period: "/month",
  description: "For growing businesses managing multiple websites.",
  websites: 5,
  views: 250000,
  viewsDisplay: "250K",
  trialDays: 7,
  category: 'multi',
};

const business: Plan = {
  id: "business",
  name: "Business",
  price: 35,
  priceDisplay: "€35",
  annualPrice: 350,
  annualPriceDisplay: "€350",
  period: "/month",
  description: "Manage up to 10 websites with advanced features.",
  websites: 10,
  views: 1000000,
  viewsDisplay: "1M",
  popular: true,
  trialDays: 7,
  category: 'multi',
};

const agency: Plan = {
  id: "agency",
  name: "Agency",
  price: 59,
  priceDisplay: "€59",
  annualPrice: 590,
  annualPriceDisplay: "€590",
  period: "/month",
  description: "Manage up to 25 client websites with white-label support.",
  websites: 25,
  views: 2500000,
  viewsDisplay: "2.5M",
  trialDays: 7,
  category: 'multi',
};

const agency_pro: Plan = {
  id: "agency_pro",
  name: "Agency Pro",
  price: 129,
  priceDisplay: "€129",
  annualPrice: 1290,
  annualPriceDisplay: "€1,290",
  period: "/month",
  description: "Scale to 100 websites with the highest limits and full agency tooling.",
  websites: 100,
  views: 10000000,
  viewsDisplay: "10M",
  trialDays: 7,
  category: 'multi',
};

export const SINGLE_SITE_PLANS: Plan[] = [starter, solo, premium];
export const MULTI_SITE_PLANS: Plan[] = [pro, business, agency, agency_pro];
export const ALL_PLANS: Plan[] = [...SINGLE_SITE_PLANS, ...MULTI_SITE_PLANS];

// Backward-compatible aliases (do NOT use in new code)
export const PLANS = ALL_PLANS;

// Single-Site Feature Table
export const SINGLE_SITE_FEATURES: PlanFeature[] = [
  { name: "Websites", starter: "1", solo: "1", premium: "1" },
  { name: "Monthly Views", starter: "10,000", solo: "25,000", premium: "100,000" },
  { name: "Banner Customization", starter: "Full", solo: "Full", premium: "Full" },
  { name: "Google Consent Mode v2", starter: true, solo: true, premium: true },
  { name: "GDPR & CCPA Compliance", starter: true, solo: true, premium: true },
  { name: "Cookie Scanner", starter: true, solo: true, premium: true },
  { name: "Analytics Dashboard", starter: true, solo: true, premium: true },
  { name: "Daily Cookie Scans", starter: "1", solo: "3", premium: "5" },
  { name: "Daily Diagnostic Scans", starter: "1", solo: "2", premium: "3" },
  { name: "Remove ConsentEase Branding", starter: false, solo: false, premium: true },
  { name: "Priority Support", starter: false, solo: false, premium: true },
];

// Multi-Site Feature Table
export const MULTI_SITE_FEATURES: PlanFeature[] = [
  { name: "Websites", pro: "5", business: "10", agency: "25", agency_pro: "100" },
  { name: "Monthly Views", pro: "250,000", business: "1,000,000", agency: "2,500,000", agency_pro: "10,000,000" },
  { name: "Banner Customization", pro: "Full", business: "Full", agency: "Full", agency_pro: "Full" },
  { name: "Google Consent Mode v2", pro: true, business: true, agency: true, agency_pro: true },
  { name: "GDPR & CCPA Compliance", pro: true, business: true, agency: true, agency_pro: true },
  { name: "Cookie Scanner", pro: true, business: true, agency: true, agency_pro: true },
  { name: "Analytics Dashboard", pro: true, business: true, agency: true, agency_pro: true },
  { name: "Daily Cookie Scans", pro: "10", business: "20", agency: "50", agency_pro: "100" },
  { name: "Daily Diagnostic Scans", pro: "5", business: "10", agency: "25", agency_pro: "50" },
  { name: "Remove ConsentEase Branding", pro: true, business: true, agency: true, agency_pro: true },
  { name: "Priority Support", pro: true, business: true, agency: true, agency_pro: true },
  { name: "White Label", pro: false, business: false, agency: true, agency_pro: true },
  { name: "Client Management", pro: false, business: false, agency: true, agency_pro: true },
  { name: "Policy Generator Quota", pro: "Add-on", business: "Add-on", agency: "25/month", agency_pro: "100/month" },
];

// Combined Feature Table (used on /pricing comparison and dashboard upgrade modal)
export const PLAN_FEATURES: PlanFeature[] = [
  { name: "Websites", starter: "1", solo: "1", premium: "1", pro: "5", business: "10", agency: "25", agency_pro: "100" },
  { name: "Monthly Views", starter: "10,000", solo: "25,000", premium: "100,000", pro: "250,000", business: "1,000,000", agency: "2,500,000", agency_pro: "10,000,000" },
  { name: "Banner Customization", starter: "Full", solo: "Full", premium: "Full", pro: "Full", business: "Full", agency: "Full", agency_pro: "Full" },
  { name: "Google Consent Mode v2", starter: true, solo: true, premium: true, pro: true, business: true, agency: true, agency_pro: true },
  { name: "GDPR & CCPA Compliance", starter: true, solo: true, premium: true, pro: true, business: true, agency: true, agency_pro: true },
  { name: "Cookie Scanner", starter: true, solo: true, premium: true, pro: true, business: true, agency: true, agency_pro: true },
  { name: "Analytics Dashboard", starter: true, solo: true, premium: true, pro: true, business: true, agency: true, agency_pro: true },
  { name: "Daily Cookie Scans", starter: "1", solo: "3", premium: "5", pro: "10", business: "20", agency: "50", agency_pro: "100" },
  { name: "Daily Diagnostic Scans", starter: "1", solo: "2", premium: "3", pro: "5", business: "10", agency: "25", agency_pro: "50" },
  { name: "Remove ConsentEase Branding", starter: false, solo: false, premium: true, pro: true, business: true, agency: true, agency_pro: true },
  { name: "Priority Support", starter: false, solo: false, premium: true, pro: true, business: true, agency: true, agency_pro: true },
  { name: "White Label", starter: false, solo: false, premium: false, pro: false, business: false, agency: true, agency_pro: true },
  { name: "Client Management", starter: false, solo: false, premium: false, pro: false, business: false, agency: true, agency_pro: true },
  { name: "Policy Generator Quota", starter: "Add-on", solo: "Add-on", premium: "Add-on", pro: "Add-on", business: "Add-on", agency: "25/month", agency_pro: "100/month" },
];

export function getPlanById(id: string): Plan | undefined {
  return ALL_PLANS.find(plan => plan.id === id);
}

export function formatViewCount(views: number): string {
  if (views >= 1000000) return `${views / 1000000}M`;
  if (views >= 1000) return `${views / 1000}K`;
  return views.toString();
}

export function getFeatureAccess(planId: string, featureName: string): boolean | string {
  const feature = PLAN_FEATURES.find(f => f.name === featureName);
  if (!feature) return false;
  return feature[planId as keyof PlanFeature] as boolean | string;
}

export function hasFeature(planId: string, featureName: string): boolean {
  const access = getFeatureAccess(planId, featureName);
  if (typeof access === 'boolean') return access;
  return true;
}

export const PLAN_FEATURE_KEYS = {
  REMOVE_BRANDING: "Remove ConsentEase Branding",
  WHITE_LABEL: "White Label",
  CLIENT_MANAGEMENT: "Client Management",
  PRIORITY_SUPPORT: "Priority Support",
} as const;

export function getAnnualMonthlyEquivalent(plan: Plan): string {
  const monthly = plan.annualPrice / 12;
  const formatted = monthly % 1 === 0 ? monthly.toString() : monthly.toFixed(2).replace(/\.?0+$/, '');
  return `€${formatted}`;
}

export function getAnnualSavings(plan: Plan): number {
  return (plan.price * 12) - plan.annualPrice;
}
