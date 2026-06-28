import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const OLD_PRODUCT_IDS = [
  'prod_TlKXSHQTiIDrrH',  // Old Solo (€5/mo)
  'prod_TlKXdpSExuMPIZ',  // Old Pro (€12/mo) — CONFLICTS with Premium!
  'prod_TlKXY5MqfU2bcy',  // Old Agency (€39/mo)
  'prod_TlKXhhHHqVAhsY',  // Old Agency Pro (€99/mo)
];

async function cleanupOldProducts() {
  console.log('Deactivating old Stripe products and their prices...\n');

  for (const productId of OLD_PRODUCT_IDS) {
    try {
      const product = await stripe.products.retrieve(productId);
      console.log(`Processing: ${product.name} (${productId})`);

      const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
      for (const price of prices.data) {
        console.log(`  Deactivating price: EUR ${(price.unit_amount || 0) / 100}/${price.recurring?.interval || 'one-time'} (${price.id})`);
        await stripe.prices.update(price.id, { active: false });
      }

      console.log(`  Deactivating product: ${product.name}`);
      await stripe.products.update(productId, { active: false });
      console.log(`  Done\n`);
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        console.log(`  Product ${productId} not found (already deleted?)\n`);
      } else {
        console.error(`  Error processing ${productId}:`, error.message, '\n');
      }
    }
  }

  console.log('Cleanup complete! Verifying remaining active products...\n');

  const activeProducts = await stripe.products.list({ active: true, limit: 100 });
  const activePrices = await stripe.prices.list({ active: true, limit: 100 });

  for (const product of activeProducts.data) {
    const productPrices = activePrices.data.filter(p => p.product === product.id);
    console.log(`${product.name} (${product.id}):`);
    for (const price of productPrices) {
      console.log(`  EUR ${(price.unit_amount || 0) / 100}/${price.recurring?.interval || 'one-time'} (${price.id})`);
    }
  }
}

cleanupOldProducts().catch(console.error);
