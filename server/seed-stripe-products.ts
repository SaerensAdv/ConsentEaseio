import { getUncachableStripeClient } from './stripeClient';

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating ConsentEase subscription products...');

  const starterProduct = await stripe.products.create({
    name: 'Starter',
    description: 'Great for getting started. 1 website, 10,000 monthly views.',
    metadata: {
      tier: 'starter',
      websites: '1',
      visitors: '10000',
      features: 'basic_customization,email_support'
    }
  });

  await stripe.prices.create({
    product: starterProduct.id,
    unit_amount: 300,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  await stripe.prices.create({
    product: starterProduct.id,
    unit_amount: 3000,
    currency: 'eur',
    recurring: { interval: 'year' },
  });

  console.log('Created Starter plan:', starterProduct.id);

  const soloProduct = await stripe.products.create({
    name: 'Solo',
    description: 'Perfect for personal sites. 1 website, 25,000 monthly views.',
    metadata: {
      tier: 'solo',
      websites: '1',
      visitors: '25000',
      features: 'basic_customization,email_support'
    }
  });

  await stripe.prices.create({
    product: soloProduct.id,
    unit_amount: 700,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  await stripe.prices.create({
    product: soloProduct.id,
    unit_amount: 7000,
    currency: 'eur',
    recurring: { interval: 'year' },
  });

  console.log('Created Solo plan:', soloProduct.id);

  const premiumProduct = await stripe.products.create({
    name: 'Premium',
    description: 'More power for growing sites. 1 website, 100,000 monthly views.',
    metadata: {
      tier: 'premium',
      websites: '1',
      visitors: '100000',
      features: 'full_customization,priority_support'
    }
  });

  await stripe.prices.create({
    product: premiumProduct.id,
    unit_amount: 1200,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  await stripe.prices.create({
    product: premiumProduct.id,
    unit_amount: 12000,
    currency: 'eur',
    recurring: { interval: 'year' },
  });

  console.log('Created Premium plan:', premiumProduct.id);

  const proProduct = await stripe.products.create({
    name: 'Pro',
    description: 'For growing businesses. 5 websites, 250,000 monthly views.',
    metadata: {
      tier: 'pro',
      websites: '5',
      visitors: '250000',
      features: 'full_customization,priority_support,remove_branding'
    }
  });

  await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 1900,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 19000,
    currency: 'eur',
    recurring: { interval: 'year' },
  });

  console.log('Created Pro plan:', proProduct.id);

  const businessProduct = await stripe.products.create({
    name: 'Business',
    description: 'For established companies. 10 websites, 1,000,000 monthly views.',
    metadata: {
      tier: 'business',
      websites: '10',
      visitors: '1000000',
      features: 'full_customization,priority_support,remove_branding,bulk_scanning'
    }
  });

  await stripe.prices.create({
    product: businessProduct.id,
    unit_amount: 3500,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  await stripe.prices.create({
    product: businessProduct.id,
    unit_amount: 35000,
    currency: 'eur',
    recurring: { interval: 'year' },
  });

  console.log('Created Business plan:', businessProduct.id);

  const agencyProduct = await stripe.products.create({
    name: 'Agency',
    description: 'Manage multiple clients. 25 websites, 2.5M monthly views.',
    metadata: {
      tier: 'agency',
      websites: '25',
      visitors: '2500000',
      features: 'white_label,client_management,bulk_scanning'
    }
  });

  await stripe.prices.create({
    product: agencyProduct.id,
    unit_amount: 5900,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  await stripe.prices.create({
    product: agencyProduct.id,
    unit_amount: 59000,
    currency: 'eur',
    recurring: { interval: 'year' },
  });

  console.log('Created Agency plan:', agencyProduct.id);

  const agencyProProduct = await stripe.products.create({
    name: 'Agency Pro',
    description: 'Enterprise solution. 100 websites, 10M monthly views.',
    metadata: {
      tier: 'agency_pro',
      websites: '100',
      visitors: '10000000',
      features: 'white_label,client_management,priority_support,bulk_scanning'
    }
  });

  await stripe.prices.create({
    product: agencyProProduct.id,
    unit_amount: 12900,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  await stripe.prices.create({
    product: agencyProProduct.id,
    unit_amount: 129000,
    currency: 'eur',
    recurring: { interval: 'year' },
  });

  console.log('Created Agency Pro plan:', agencyProProduct.id);
  console.log('All products created successfully!');
}

seedProducts().catch(console.error);
