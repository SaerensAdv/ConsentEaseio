import { getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { sql } from 'drizzle-orm';

const SELLER_INVOICE_CUSTOM_FIELDS = [
  { name: 'BTW-nummer verkoper', value: 'BE 1019.436.742' },
  { name: 'IBAN verkoper', value: 'BE29 3630 5381 8064' },
];

export class StripeService {
  async createCustomer(email: string, userId: string, name?: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      ...(name ? { name } : {}),
      metadata: { userId },
      invoice_settings: {
        custom_fields: SELLER_INVOICE_CUSTOM_FIELDS,
        footer: 'ConsentEase BV | BTW: BE 1019.436.742 | IBAN: BE29 3630 5381 8064',
      },
    });
  }

  async updateCustomer(customerId: string, updates: { name?: string | null; email?: string }) {
    const stripe = await getUncachableStripeClient();
    const updateData: Record<string, any> = {};
    if (updates.name !== undefined) updateData.name = updates.name || '';
    if (updates.email !== undefined) updateData.email = updates.email;
    updateData.invoice_settings = {
      custom_fields: SELLER_INVOICE_CUSTOM_FIELDS,
      footer: 'ConsentEase BV | BTW: BE 1019.436.742 | IBAN: BE29 3630 5381 8064',
    };
    return await stripe.customers.update(customerId, updateData);
  }

  async syncCustomerTaxId(
    customerId: string,
    vatNumber: string | null
  ): Promise<{ success: boolean; cleaned?: string; error?: string }> {
    const stripe = await getUncachableStripeClient();

    // Always clear existing Tax IDs first (so an empty vatNumber removes them).
    try {
      const existingTaxIds = await stripe.customers.listTaxIds(customerId, { limit: 10 });
      for (const taxId of existingTaxIds.data) {
        await stripe.customers.deleteTaxId(customerId, taxId.id);
      }
    } catch (err: any) {
      console.error(`[Stripe] Failed to clear existing tax IDs for ${customerId}:`, err.message);
      return { success: false, error: 'Could not update VAT info on Stripe. Please try again.' };
    }

    if (!vatNumber || !vatNumber.trim()) {
      return { success: true };
    }

    const cleaned = vatNumber.replace(/[\s.-]/g, '').toUpperCase();
    let taxType = 'eu_vat';
    if (cleaned.startsWith('GB')) taxType = 'gb_vat';
    if (cleaned.startsWith('CH')) taxType = 'ch_vat';
    if (cleaned.startsWith('NO')) taxType = 'no_vat';

    try {
      await stripe.customers.createTaxId(customerId, {
        type: taxType as any,
        value: cleaned,
      });
      console.log(`[Stripe] Tax ID synced for customer ${customerId}: ${cleaned}`);
      return { success: true, cleaned };
    } catch (err: any) {
      console.error(`[Stripe] Failed to sync tax ID for ${customerId}:`, err.message);
      const friendly =
        err?.code === 'tax_id_invalid'
          ? `"${vatNumber}" is not a valid ${taxType.toUpperCase().replace('_', ' ')} number. Please double-check the country prefix and digits.`
          : err?.message || 'Stripe rejected this VAT number.';
      return { success: false, cleaned, error: friendly };
    }
  }

  async createAndSyncCustomer(email: string, userId: string, name?: string, vatNumber?: string | null) {
    const customer = await this.createCustomer(email, userId, name);
    if (vatNumber) {
      // Best-effort: don't break customer creation if VAT is invalid.
      await this.syncCustomerTaxId(customer.id, vatNumber);
    }
    return customer;
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    trialOptions?: { trialDays?: number; trialEnd?: number }
  ) {
    const stripe = await getUncachableStripeClient();

    const sessionParams: any = {
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    };

    // Trial: prefer absolute trial_end (anchored to user.trialEndsAt) so that
    // upgrading mid-trial does NOT extend the user's total trial window.
    // Stripe rejects trial_end if it is less than ~48h in the future for paid
    // subscriptions, so we require a 48h buffer; otherwise we omit the trial
    // entirely (the user's locally-tracked trial has effectively expired and
    // they should be charged immediately on the new plan).
    const nowSec = Math.floor(Date.now() / 1000);
    const MIN_TRIAL_BUFFER_SEC = 48 * 60 * 60; // Stripe minimum
    if (trialOptions?.trialEnd && trialOptions.trialEnd > nowSec + MIN_TRIAL_BUFFER_SEC) {
      sessionParams.subscription_data = {
        trial_end: trialOptions.trialEnd,
      };
    } else if (trialOptions?.trialDays && trialOptions.trialDays > 0) {
      sessionParams.subscription_data = {
        trial_period_days: trialOptions.trialDays,
      };
    }
    // else: no trial — user converts straight to paid (e.g. trial already
    // expired or has <48h remaining, which Stripe would reject anyway).

    return await stripe.checkout.sessions.create(sessionParams);
  }

  async createOneTimeCheckoutSession(
    customerId: string, 
    amount: number, 
    currency: string,
    productName: string,
    productDescription: string,
    successUrl: string, 
    cancelUrl: string,
    metadata?: Record<string, string>
  ) {
    const stripe = await getUncachableStripeClient();
    
    return await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: productName,
            description: productDescription,
          },
          unit_amount: amount,
          tax_behavior: 'exclusive',
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer_update: { 
        address: 'auto',
        name: 'auto',
      },
      billing_address_collection: 'required',
    });
  }

  async getCheckoutSession(sessionId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.retrieve(sessionId);
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }

  async listProducts(active = true) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE active = ${active}`
    );
    return result.rows;
  }

  async listProductsWithPrices(active = true) {
    const result = await db.execute(
      sql`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring,
          pr.active as price_active
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = ${active}
        ORDER BY pr.unit_amount ASC
      `
    );
    return result.rows;
  }

  async getSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }

  async listCustomerInvoices(customerId: string, limit = 24) {
    const stripe = await getUncachableStripeClient();
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });
    return invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amountPaid: inv.amount_paid,
      amountDue: inv.amount_due,
      currency: inv.currency,
      created: inv.created,
      periodStart: inv.period_start,
      periodEnd: inv.period_end,
      invoicePdf: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    }));
  }

  async getCustomerPaymentMethod(customerId: string) {
    const stripe = await getUncachableStripeClient();
    const customer = await stripe.customers.retrieve(customerId, {
      expand: ['invoice_settings.default_payment_method'],
    });
    if (customer.deleted) return null;

    const pm = customer.invoice_settings?.default_payment_method;
    if (!pm || typeof pm === 'string') return null;

    if (pm.type === 'card' && pm.card) {
      return {
        type: 'card' as const,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      };
    }
    return { type: pm.type, brand: null, last4: null, expMonth: null, expYear: null };
  }

  async updateSubscriptionPlan(subscriptionId: string, newPriceId: string, isDowngrade: boolean) {
    const stripe = await getUncachableStripeClient();
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const currentItemId = sub.items.data[0]?.id;
    if (!currentItemId) {
      throw new Error('No subscription item found');
    }

    if (isDowngrade) {
      return await stripe.subscriptions.update(subscriptionId, {
        items: [{ id: currentItemId, price: newPriceId }],
        proration_behavior: 'none',
        billing_cycle_anchor: 'unchanged',
      });
    }

    return await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: currentItemId, price: newPriceId }],
      proration_behavior: 'always_invoice',
      billing_cycle_anchor: 'unchanged',
    });
  }

  async cancelSubscription(subscriptionId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  async cancelSubscriptionAtPeriodEnd(subscriptionId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async reactivateSubscription(subscriptionId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  async getSubscriptionDetails(subscriptionId: string) {
    const stripe = await getUncachableStripeClient();
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    return {
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      cancelAt: sub.cancel_at,
      status: sub.status,
      trialEnd: sub.trial_end,
    };
  }
}

export const stripeService = new StripeService();
