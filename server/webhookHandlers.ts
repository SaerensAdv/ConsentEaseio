import { getStripeSync } from './stripeClient';
import { SubscriptionHandler } from './subscriptionHandler';
import { storage } from './storage';
import { clickup } from './clickup-service';
import Stripe from 'stripe';

const processedEvents = new Map<string, number>();
const MAX_EVENT_CACHE = 1000;
const EVENT_EXPIRY_MS = 24 * 60 * 60 * 1000;

function isEventProcessed(eventId: string): boolean {
  const timestamp = processedEvents.get(eventId);
  if (!timestamp) return false;
  if (Date.now() - timestamp > EVENT_EXPIRY_MS) {
    processedEvents.delete(eventId);
    return false;
  }
  return true;
}

function markEventProcessed(eventId: string): void {
  processedEvents.set(eventId, Date.now());
  if (processedEvents.size > MAX_EVENT_CACHE) {
    const oldest = processedEvents.entries().next().value;
    if (oldest) processedEvents.delete(oldest[0]);
  }
}

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

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    let event: Stripe.Event;
    try {
      event = JSON.parse(payload.toString()) as Stripe.Event;
    } catch (err: any) {
      console.error('[Webhook] Failed to parse event JSON:', err.message);
      return;
    }

    if (isEventProcessed(event.id)) {
      console.log(`[Webhook] Skipping already-processed event ${event.id}: ${event.type}`);
      return;
    }

    console.log(`Received webhook ${event.id}: ${event.type} for ${(event.data.object as any).id || 'unknown'}`);

    if (event.type === 'checkout.session.completed') {
      await WebhookHandlers.handleCheckoutCompleted(event);
    } else {
      await WebhookHandlers.handleSubscriptionEvent(event);
    }

    markEventProcessed(event.id);
  }

  static async handleCheckoutCompleted(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    
    if (session.mode === 'payment' && session.payment_status === 'paid') {
      const purchaseType = session.metadata?.purchaseType;
      const userId = session.metadata?.userId;
      
      if (purchaseType && userId) {
        console.log(`[Webhook] Processing policy purchase: type=${purchaseType}, user=${userId}`);
        
        const purchases = await storage.getPolicyPurchasesByUserId(userId);
        const purchase = purchases.find(p => p.stripeSessionId === session.id);
        
        if (purchase && purchase.status === 'pending') {
          await storage.updatePolicyPurchase(purchase.id, {
            status: 'completed',
            stripePaymentIntentId: session.payment_intent as string,
          });
          console.log(`[Webhook] Policy purchase confirmed: ${purchase.id} (${purchaseType})`);
        } else if (!purchase) {
          await storage.createPolicyPurchase({
            userId,
            type: purchaseType as any,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            amount: session.amount_total || 0,
            currency: session.currency || 'eur',
            status: 'completed',
          });
          console.log(`[Webhook] Policy purchase created from webhook: ${purchaseType} for user ${userId}`);
        }
        
        const updatedPurchases = await storage.getPolicyPurchasesByUserId(userId);
        if (purchaseType === 'bundle' || (purchase && purchase.type === 'bundle')) {
          const privacyExists = updatedPurchases.find(p => p.type === 'privacy' && p.status === 'completed');
          const cookieExists = updatedPurchases.find(p => p.type === 'cookie' && p.status === 'completed');
          
          if (!privacyExists) {
            await storage.createPolicyPurchase({
              userId,
              type: 'privacy',
              stripePaymentIntentId: session.payment_intent as string,
              amount: 0,
              currency: 'eur',
              status: 'completed',
            });
          }
          if (!cookieExists) {
            await storage.createPolicyPurchase({
              userId,
              type: 'cookie',
              stripePaymentIntentId: session.payment_intent as string,
              amount: 0,
              currency: 'eur',
              status: 'completed',
            });
          }
        }
      }
    }
    
    if (session.mode === 'subscription') {
      const customerId = typeof session.customer === 'string' 
        ? session.customer 
        : (session.customer as any)?.id;
      
      if (customerId) {
        const user = await storage.getUserByStripeCustomerId(customerId);
        if (user) {
          await SubscriptionHandler.syncUserSubscription(user.id);
          console.log(`[Webhook] Checkout completed, synced subscription for user ${user.id}`);
        }
      }
    }
  }

  static async handleSubscriptionEvent(event: Stripe.Event): Promise<void> {
    const subscriptionEvents = [
      'customer.subscription.created',
      'customer.subscription.updated', 
      'customer.subscription.deleted',
      'customer.subscription.paused',
      'customer.subscription.resumed',
      'customer.subscription.trial_will_end',
      'invoice.payment_failed',
      'invoice.paid',
      'invoice.payment_action_required',
      'charge.refunded',
      'charge.dispute.created',
    ];

    if (!subscriptionEvents.includes(event.type)) {
      return;
    }

    console.log(`[Webhook] Processing subscription event: ${event.type}`);

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
    } else if (event.type.startsWith('charge.')) {
      const charge = event.data.object as Stripe.Charge;
      customerId = typeof charge.customer === 'string'
        ? charge.customer
        : (charge.customer as any)?.id || null;
    }

    if (!customerId || !customerId.startsWith('cus_')) {
      console.log('[Webhook] Invalid or missing customer ID:', customerId);
      return;
    }

    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) {
      console.log(`[Webhook] No user found for customer: ${customerId}`);
      return;
    }

    if (event.type === 'customer.subscription.trial_will_end') {
      console.log(`[Webhook] Trial ending soon for user ${user.id}`);
    }

    if (event.type === 'invoice.payment_failed') {
      await SubscriptionHandler.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
    }

    if (event.type === 'invoice.paid') {
      await SubscriptionHandler.handleInvoicePaid(event.data.object as Stripe.Invoice);
    }

    if (event.type === 'invoice.payment_action_required') {
      console.log(`[Webhook] Payment action required (3D Secure/SCA) for user ${user.id}`);
      await storage.updateSubscriptionStatus(user.id, 'past_due');
    }

    if (event.type === 'charge.dispute.created') {
      console.log(`[Webhook] Dispute/chargeback created for user ${user.id}`);
    }

    if (event.type === 'charge.refunded') {
      console.log(`[Webhook] Charge refunded for user ${user.id}`);
    }

    if (event.type === 'customer.subscription.paused') {
      console.log(`[Webhook] Subscription paused for user ${user.id}`);
      await storage.updateSubscriptionStatus(user.id, 'paused');
    }

    if (event.type === 'customer.subscription.resumed') {
      console.log(`[Webhook] Subscription resumed for user ${user.id}`);
    }

    if (event.type === 'customer.subscription.deleted') {
      console.log(`[Webhook] Subscription deleted for user ${user.id}`);
      await SubscriptionHandler.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      
      try {
        const websites = await storage.getWebsitesByUserId(user.id);
        const primaryDomain = websites[0]?.domain;
        clickup.updateCustomerStatus({
          email: user.email,
          domain: primaryDomain,
          status: "inactive",
          plan: 'solo',
        });
      } catch (e) {}
      return;
    }

    const result = await SubscriptionHandler.syncUserSubscription(user.id);
    if (result) {
      console.log(`[Webhook] Synced user ${user.id}: status=${result.status}, plan=${result.plan}`);

      const statusMap: Record<string, "active" | "inactive" | "in progress"> = {
        active: "active",
        trialing: "active",
        past_due: "in progress",
        paused: "in progress",
        canceled: "inactive",
        incomplete: "in progress",
        incomplete_expired: "inactive",
        unpaid: "inactive",
        none: "inactive",
      };

      try {
        const websites = await storage.getWebsitesByUserId(user.id);
        const primaryDomain = websites[0]?.domain;

        clickup.updateCustomerStatus({
          email: user.email,
          domain: primaryDomain,
          status: statusMap[result.status] || "active",
          plan: result.plan || undefined,
          billingInterval: result.billingInterval || undefined,
        });
      } catch (e) {}
    }
  }
}
