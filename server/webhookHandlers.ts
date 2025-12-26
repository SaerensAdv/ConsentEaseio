import { getStripeSync, getStripeClient } from './stripeClient';
import { SubscriptionHandler } from './subscriptionHandler';
import { storage } from './storage';
import Stripe from 'stripe';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    // First, let stripe-replit-sync process the webhook for data syncing
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    // Now verify the webhook ourselves using the Stripe SDK for our custom processing
    // FAIL CLOSED: If no webhook secret is configured, skip custom processing entirely
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.log('[Webhook] STRIPE_WEBHOOK_SECRET not configured - skipping custom subscription processing');
      console.log('[Webhook] Users should use manual sync via /api/stripe/sync-subscription');
      return;
    }

    // Verify the webhook signature using official Stripe SDK
    let verifiedEvent: Stripe.Event;
    try {
      const stripe = await getStripeClient();
      verifiedEvent = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error('[Webhook] Signature verification failed:', err.message);
      // Don't throw - stripe-replit-sync already processed, just skip our custom logic
      return;
    }

    // Now we have a verified event - process subscription events
    try {
      await WebhookHandlers.handleSubscriptionEvent(verifiedEvent);
    } catch (err: any) {
      console.log('[Webhook] Custom handler error (non-fatal):', err.message);
    }
  }

  static async handleSubscriptionEvent(event: Stripe.Event): Promise<void> {
    const subscriptionEvents = [
      'customer.subscription.created',
      'customer.subscription.updated', 
      'customer.subscription.deleted',
      'invoice.payment_failed',
      'invoice.paid',
    ];

    if (!subscriptionEvents.includes(event.type)) {
      return;
    }

    console.log(`[Webhook] Processing subscription event: ${event.type}`);

    // Extract customer ID from the event
    // We only use this to identify WHICH customer to sync - all actual data
    // is fetched fresh from Stripe API by syncUserSubscription
    let customerId: string | null = null;
    
    if (event.type.startsWith('customer.subscription.')) {
      const subscription = event.data.object as Stripe.Subscription;
      customerId = typeof subscription.customer === 'string' 
        ? subscription.customer 
        : subscription.customer?.id || null;
    } else if (event.type.startsWith('invoice.')) {
      const invoice = event.data.object as Stripe.Invoice;
      customerId = typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id || null;
    }

    // Validate customer ID format (Stripe customer IDs start with 'cus_')
    if (!customerId || !customerId.startsWith('cus_')) {
      console.log('[Webhook] Invalid or missing customer ID:', customerId);
      return;
    }

    // Find the user by Stripe customer ID
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) {
      console.log(`[Webhook] No user found for customer: ${customerId}`);
      return;
    }

    // Sync subscription status from Stripe API
    // This fetches fresh data from Stripe, so it's authoritative and safe
    try {
      const result = await SubscriptionHandler.syncUserSubscription(user.id);
      if (result) {
        console.log(`[Webhook] Synced user ${user.id}: status=${result.status}, plan=${result.plan}`);
      }
    } catch (syncError: any) {
      console.error(`[Webhook] Failed to sync user ${user.id}:`, syncError.message);
      // Don't throw - let the webhook succeed so Stripe doesn't retry
      // The user can manually refresh or we'll sync on next event
    }
  }
}
