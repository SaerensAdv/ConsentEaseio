import { getUncachableStripeClient } from './stripeClient';

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating ConsentEase subscription products...');

  const soloProduct = await stripe.products.create({
    name: 'Solo',
    description: 'Perfect for personal sites. 1 website, 10,000 monthly views.',
    metadata: {
      tier: 'solo',
      websites: '1',
      visitors: '10000',
      features: 'basic_customization,email_support'
    }
  });

  await stripe.prices.create({
    product: soloProduct.id,
    unit_amount: 500,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  console.log('Created Solo plan:', soloProduct.id);

  const proProduct = await stripe.products.create({
    name: 'Pro',
    description: 'For growing businesses. 5 websites, 100,000 monthly views.',
    metadata: {
      tier: 'pro',
      websites: '5',
      visitors: '100000',
      features: 'full_customization,priority_support,remove_branding'
    }
  });

  await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 1200,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  console.log('Created Pro plan:', proProduct.id);

  const agencyProduct = await stripe.products.create({
    name: 'Agency',
    description: 'Manage multiple clients. Unlimited websites, 1M monthly views.',
    metadata: {
      tier: 'agency',
      websites: 'unlimited',
      visitors: '1000000',
      features: 'white_label,api_access,client_management'
    }
  });

  await stripe.prices.create({
    product: agencyProduct.id,
    unit_amount: 3900,
    currency: 'eur',
    recurring: { interval: 'month' },
  });

  console.log('Created Agency plan:', agencyProduct.id);
  console.log('All products created successfully!');
}

seedProducts().catch(console.error);
