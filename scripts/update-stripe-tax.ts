import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const plans = [
  { name: 'Solo', price: 500 },
  { name: 'Pro', price: 1200 },
  { name: 'Agency', price: 3900 },
  { name: 'Agency Pro', price: 9900 },
];

async function updateStripeTax() {
  console.log('Checking and updating Stripe prices for tax...\n');

  const products = await stripe.products.list({ active: true, limit: 100 });
  const prices = await stripe.prices.list({ active: true, limit: 100 });

  for (const plan of plans) {
    const product = products.data.find(p => p.name === plan.name);
    if (!product) {
      console.log(`Product not found: ${plan.name}`);
      continue;
    }

    const existingPrice = prices.data.find(
      p => p.product === product.id && 
           p.unit_amount === plan.price && 
           p.currency === 'eur' && 
           p.recurring?.interval === 'month'
    );

    if (existingPrice) {
      if (existingPrice.tax_behavior === 'exclusive') {
        console.log(`${plan.name}: Already has tax_behavior: exclusive`);
      } else {
        console.log(`${plan.name}: Has tax_behavior: ${existingPrice.tax_behavior || 'unspecified'}`);
        console.log(`  Creating new price with tax_behavior: exclusive...`);
        
        const newPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.price,
          currency: 'eur',
          recurring: { interval: 'month' },
          tax_behavior: 'exclusive',
          metadata: { plan_id: plan.name.toLowerCase().replace(' ', '_') },
        });
        console.log(`  Created new price: ${newPrice.id}`);
        
        await stripe.prices.update(existingPrice.id, { active: false });
        console.log(`  Deactivated old price: ${existingPrice.id}`);
      }
    }
  }

  console.log('\nDone! Active prices:');
  const updatedPrices = await stripe.prices.list({ active: true, limit: 100 });
  for (const price of updatedPrices.data) {
    if (price.recurring?.interval === 'month') {
      const prod = products.data.find(p => p.id === price.product);
      console.log(`  ${prod?.name || price.product}: €${(price.unit_amount || 0) / 100}/month (${price.id}) - tax: ${price.tax_behavior || 'unspecified'}`);
    }
  }
}

updateStripeTax().catch(console.error);
