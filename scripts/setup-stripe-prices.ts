import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const plans = [
  { 
    name: 'Starter', 
    planId: 'starter',
    monthlyPrice: 300,
    yearlyPrice: 3000,
    description: 'For small personal websites',
    features: ['1 website', '10,000 monthly views', 'Basic customization', 'GDPR & CCPA compliance']
  },
  { 
    name: 'Solo', 
    planId: 'solo',
    monthlyPrice: 700,
    yearlyPrice: 7000,
    description: 'Perfect for personal sites and side projects',
    features: ['2 websites', '25,000 monthly views', 'Full customization', 'GDPR & CCPA compliance']
  },
  { 
    name: 'Premium', 
    planId: 'premium',
    monthlyPrice: 1200,
    yearlyPrice: 12000,
    description: 'For growing personal brands and businesses',
    features: ['5 websites', '100,000 monthly views', 'Full customization', 'Remove branding']
  },
  { 
    name: 'Pro', 
    planId: 'pro',
    monthlyPrice: 1900,
    yearlyPrice: 19000,
    description: 'For professional businesses',
    features: ['10 websites', '250,000 monthly views', 'Full customization', 'Remove branding', 'Priority support']
  },
  { 
    name: 'Business', 
    planId: 'business',
    monthlyPrice: 3500,
    yearlyPrice: 35000,
    description: 'For multi-site businesses',
    features: ['25 websites', '1,000,000 monthly views', 'White label', 'API access']
  },
  { 
    name: 'Agency', 
    planId: 'agency',
    monthlyPrice: 5900,
    yearlyPrice: 59000,
    description: 'Manage up to 50 client websites',
    features: ['50 websites', '2,500,000 monthly views', 'White label', 'API access', '25 policies/month']
  },
  { 
    name: 'Agency Pro', 
    planId: 'agency_pro',
    monthlyPrice: 12900,
    yearlyPrice: 129000,
    description: 'Unlimited websites for large agencies',
    features: ['Unlimited websites', '10,000,000 monthly views', 'White label', 'API access', 'Unlimited policies']
  },
];

async function setupStripePrices() {
  console.log('Setting up Stripe products and prices...\n');

  for (const plan of plans) {
    try {
      const existingProducts = await stripe.products.list({ limit: 100 });
      let product = existingProducts.data.find(p => p.name === plan.name && p.active);

      if (!product) {
        console.log(`Creating product: ${plan.name}`);
        product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: {
            plan_id: plan.planId,
          },
        });
        console.log(`  Created product: ${product.id}`);
      } else {
        console.log(`Product already exists: ${plan.name} (${product.id})`);
      }

      const existingPrices = await stripe.prices.list({ 
        product: product.id, 
        active: true,
        limit: 100 
      });

      const monthlyPrice = existingPrices.data.find(
        p => p.unit_amount === plan.monthlyPrice && 
             p.currency === 'eur' && 
             p.recurring?.interval === 'month'
      );

      if (!monthlyPrice) {
        console.log(`Creating monthly price: EUR ${plan.monthlyPrice / 100}/month for ${plan.name}`);
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.monthlyPrice,
          currency: 'eur',
          recurring: { interval: 'month' },
          metadata: { plan_id: plan.planId },
        });
        console.log(`  Created monthly price: ${price.id}`);
      } else {
        console.log(`Monthly price already exists for ${plan.name}: ${monthlyPrice.id}`);
      }

      const yearlyPrice = existingPrices.data.find(
        p => p.unit_amount === plan.yearlyPrice && 
             p.currency === 'eur' && 
             p.recurring?.interval === 'year'
      );

      if (!yearlyPrice) {
        console.log(`Creating yearly price: EUR ${plan.yearlyPrice / 100}/year for ${plan.name}`);
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.yearlyPrice,
          currency: 'eur',
          recurring: { interval: 'year' },
          metadata: { plan_id: plan.planId },
        });
        console.log(`  Created yearly price: ${price.id}`);
      } else {
        console.log(`Yearly price already exists for ${plan.name}: ${yearlyPrice.id}`);
      }

      console.log('');
    } catch (error) {
      console.error(`Error setting up ${plan.name}:`, error);
    }
  }

  console.log('Done! Verifying setup...\n');

  const products = await stripe.products.list({ active: true, limit: 100 });
  const prices = await stripe.prices.list({ active: true, limit: 100 });

  console.log('Active Products:');
  for (const product of products.data) {
    console.log(`  - ${product.name} (${product.id})`);
  }

  console.log('\nActive Prices:');
  for (const price of prices.data) {
    const productName = typeof price.product === 'string' 
      ? products.data.find(p => p.id === price.product)?.name || price.product
      : price.product.name;
    console.log(`  - ${productName}: EUR ${(price.unit_amount || 0) / 100}/${price.recurring?.interval || 'one-time'} (${price.id})`);
  }
}

setupStripePrices().catch(console.error);
