import { getUncachableStripeClient } from './stripeClient';

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating ConsentEase subscription products...');

  const starterProduct = await stripe.products.create({
    name: 'Starter',
    description: 'Perfect for small websites and blogs. Up to 3 websites, 10,000 monthly visitors.',
    metadata: {
      tier: 'starter',
      websites: '3',
      visitors: '10000',
      features: 'basic_analytics,email_support'
    }
  });

  await stripe.prices.create({
    product: starterProduct.id,
    unit_amount: 1200,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  console.log('Created Starter plan:', starterProduct.id);

  const proProduct = await stripe.products.create({
    name: 'Pro',
    description: 'For growing businesses. Up to 10 websites, 100,000 monthly visitors.',
    metadata: {
      tier: 'pro',
      websites: '10',
      visitors: '100000',
      features: 'advanced_analytics,priority_support,custom_branding,geo_targeting'
    }
  });

  await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 3900,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  console.log('Created Pro plan:', proProduct.id);

  const enterpriseProduct = await stripe.products.create({
    name: 'Enterprise',
    description: 'For large organizations. Unlimited websites and visitors.',
    metadata: {
      tier: 'enterprise',
      websites: 'unlimited',
      visitors: 'unlimited',
      features: 'all_features,dedicated_support,sla,white_label,api_access'
    }
  });

  await stripe.prices.create({
    product: enterpriseProduct.id,
    unit_amount: 9900,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  console.log('Created Enterprise plan:', enterpriseProduct.id);
  console.log('All products created successfully!');
}

seedProducts().catch(console.error);
