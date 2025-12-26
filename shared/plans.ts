export interface PlanFeature {
  name: string;
  solo: boolean | string;
  pro: boolean | string;
  agency: boolean | string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  period: string;
  description: string;
  websites: number | 'unlimited';
  views: number;
  viewsDisplay: string;
  popular?: boolean;
  trialDays?: number;
}

export const PLANS: Plan[] = [
  {
    id: "solo",
    name: "Solo",
    price: 5,
    priceDisplay: "€5",
    period: "/month",
    description: "Perfect for personal sites and side projects.",
    websites: 1,
    views: 10000,
    viewsDisplay: "10K",
    popular: false,
    trialDays: 7,
  },
  {
    id: "pro",
    name: "Pro",
    price: 12,
    priceDisplay: "€12",
    period: "/month",
    description: "For growing businesses and multiple sites.",
    websites: 5,
    views: 100000,
    viewsDisplay: "100K",
    popular: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: 39,
    priceDisplay: "€39",
    period: "/month",
    description: "Manage unlimited client websites.",
    websites: 'unlimited',
    views: 1000000,
    viewsDisplay: "1M",
    popular: false,
  },
];

export const PLAN_FEATURES: PlanFeature[] = [
  { name: "Websites", solo: "1", pro: "5", agency: "Unlimited" },
  { name: "Monthly Views", solo: "10,000", pro: "100,000", agency: "1,000,000" },
  { name: "Banner Customization", solo: "Basic", pro: "Full", agency: "Full" },
  { name: "Google Consent Mode v2", solo: true, pro: true, agency: true },
  { name: "GDPR & CCPA Compliance", solo: true, pro: true, agency: true },
  { name: "Cookie Scanner", solo: true, pro: true, agency: true },
  { name: "Analytics Dashboard", solo: true, pro: true, agency: true },
  { name: "Remove ConsentEase Branding", solo: false, pro: true, agency: true },
  { name: "Priority Support", solo: false, pro: true, agency: true },
  { name: "White Label", solo: false, pro: false, agency: true },
  { name: "API Access", solo: false, pro: false, agency: true },
  { name: "Client Management", solo: false, pro: false, agency: true },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find(plan => plan.id === id);
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
  API_ACCESS: "API Access",
  CLIENT_MANAGEMENT: "Client Management",
  PRIORITY_SUPPORT: "Priority Support",
  FULL_CUSTOMIZATION: "Banner Customization",
} as const;
