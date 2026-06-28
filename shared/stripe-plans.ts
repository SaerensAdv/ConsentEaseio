export type PlanId = 'starter' | 'solo' | 'premium' | 'pro' | 'business' | 'agency' | 'agency_pro';

export interface PlanConfig {
  id: PlanId;
  name: string;
  monthlyPriceId: string;
  yearlyPriceId: string;
  monthlyAmount: number;
  yearlyAmount: number;
}

export const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPriceId: 'price_1T4MstKIMURl0NBANHKl1k9s',
    yearlyPriceId: 'price_1T4MstKIMURl0NBArxF85FYB',
    monthlyAmount: 300,
    yearlyAmount: 3000,
  },
  solo: {
    id: 'solo',
    name: 'Solo',
    monthlyPriceId: 'price_1T4MsuKIMURl0NBAGTMIfxRP',
    yearlyPriceId: 'price_1T4MsuKIMURl0NBAvBXbx138',
    monthlyAmount: 700,
    yearlyAmount: 7000,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    monthlyPriceId: 'price_1T4MsvKIMURl0NBAdAXl5Z7X',
    yearlyPriceId: 'price_1T4MsvKIMURl0NBAJhLWBi5l',
    monthlyAmount: 1200,
    yearlyAmount: 12000,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPriceId: 'price_1T4MsvKIMURl0NBAlu7i6HMF',
    yearlyPriceId: 'price_1T4MswKIMURl0NBA9K86zYyu',
    monthlyAmount: 1900,
    yearlyAmount: 19000,
  },
  business: {
    id: 'business',
    name: 'Business',
    monthlyPriceId: 'price_1T4MswKIMURl0NBALlUOn9Iq',
    yearlyPriceId: 'price_1T4MswKIMURl0NBAgi2XGQjB',
    monthlyAmount: 3500,
    yearlyAmount: 35000,
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    monthlyPriceId: 'price_1T4MsxKIMURl0NBAbhS8Ji8b',
    yearlyPriceId: 'price_1T4MsxKIMURl0NBAovY4RPIr',
    monthlyAmount: 5900,
    yearlyAmount: 59000,
  },
  agency_pro: {
    id: 'agency_pro',
    name: 'Agency Pro',
    monthlyPriceId: 'price_1T4MsyKIMURl0NBAs2pkcrSv',
    yearlyPriceId: 'price_1T4MsyKIMURl0NBAaw1CsXhb',
    monthlyAmount: 12900,
    yearlyAmount: 129000,
  },
};

export const ALL_PLAN_IDS: PlanId[] = ['starter', 'solo', 'premium', 'pro', 'business', 'agency', 'agency_pro'];

const priceIdToPlanCache = new Map<string, { planId: PlanId; interval: 'monthly' | 'yearly' }>();

function buildPriceIdCache() {
  if (priceIdToPlanCache.size > 0) return;
  for (const config of Object.values(PLAN_CONFIGS)) {
    priceIdToPlanCache.set(config.monthlyPriceId, { planId: config.id, interval: 'monthly' });
    priceIdToPlanCache.set(config.yearlyPriceId, { planId: config.id, interval: 'yearly' });
  }
}

export function getPlanByPriceId(priceId: string): { planId: PlanId; interval: 'monthly' | 'yearly' } | null {
  buildPriceIdCache();
  return priceIdToPlanCache.get(priceId) || null;
}

export function getPlanByAmount(amount: number): PlanId | null {
  for (const config of Object.values(PLAN_CONFIGS)) {
    if (config.monthlyAmount === amount || config.yearlyAmount === amount) {
      return config.id;
    }
  }
  return null;
}

export function getPriceId(planId: PlanId, interval: 'monthly' | 'yearly'): string | null {
  const config = PLAN_CONFIGS[planId];
  if (!config) return null;
  return interval === 'yearly' ? config.yearlyPriceId : config.monthlyPriceId;
}

export function isValidPriceId(priceId: string): boolean {
  buildPriceIdCache();
  return priceIdToPlanCache.has(priceId);
}

export function isValidPlanId(planId: string): planId is PlanId {
  return ALL_PLAN_IDS.includes(planId as PlanId);
}

export function getPlanAmount(planId: PlanId, interval: 'monthly' | 'yearly'): number {
  const config = PLAN_CONFIGS[planId];
  return interval === 'yearly' ? config.yearlyAmount : config.monthlyAmount;
}
