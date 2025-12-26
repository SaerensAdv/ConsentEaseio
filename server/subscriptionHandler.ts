import { storage } from './storage';
import { getStripeClient } from './stripeClient';
import Stripe from 'stripe';

const PRICE_TO_PLAN: Record<number, string> = {
  500: 'solo',
  1200: 'pro',
  3900: 'agency',
};

export class SubscriptionHandler {
  static async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer.id;
    
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) {
      console.log(`[Subscription] No user found for customer ${customerId}`);
      return;
    }

    const priceId = subscription.items.data[0]?.price.id;
    const amount = subscription.items.data[0]?.price.unit_amount || 0;
    const plan = PRICE_TO_PLAN[amount] || 'solo';

    await storage.updateUser(user.id, {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      plan,
    });

    console.log(`[Subscription] Created: User ${user.id} -> ${plan} (${subscription.status})`);
  }

  static async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer.id;
    
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) {
      console.log(`[Subscription] No user found for customer ${customerId}`);
      return;
    }

    const amount = subscription.items.data[0]?.price.unit_amount || 0;
    const plan = PRICE_TO_PLAN[amount] || user.plan;
    
    const updates: Record<string, any> = {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
    };

    // Only update plan if subscription is active or trialing
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      updates.plan = plan;
      updates.subscriptionEndDate = null;
    }

    // If canceled, set end date
    const periodEnd = (subscription as any).current_period_end;
    if (subscription.cancel_at_period_end && periodEnd) {
      updates.subscriptionEndDate = new Date(periodEnd * 1000);
    }

    await storage.updateUser(user.id, updates);
    console.log(`[Subscription] Updated: User ${user.id} -> status: ${subscription.status}, plan: ${updates.plan || user.plan}`);
  }

  static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer.id;
    
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) {
      console.log(`[Subscription] No user found for customer ${customerId}`);
      return;
    }

    // Downgrade to solo (free tier behavior) when subscription is deleted
    await storage.updateUser(user.id, {
      subscriptionStatus: 'canceled',
      plan: 'solo',
      stripeSubscriptionId: null,
      subscriptionEndDate: null,
    });

    console.log(`[Subscription] Deleted: User ${user.id} downgraded to solo`);
  }

  static async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = typeof invoice.customer === 'string' 
      ? invoice.customer 
      : invoice.customer?.id;
    
    if (!customerId) return;

    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) {
      console.log(`[Invoice] No user found for customer ${customerId}`);
      return;
    }

    // Update status to past_due but don't immediately downgrade
    await storage.updateSubscriptionStatus(user.id, 'past_due');
    console.log(`[Invoice] Payment failed: User ${user.id} marked as past_due`);
  }

  static async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const customerId = typeof invoice.customer === 'string' 
      ? invoice.customer 
      : invoice.customer?.id;
    
    if (!customerId) return;

    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    // If user was past_due, restore to active
    if (user.subscriptionStatus === 'past_due') {
      await storage.updateSubscriptionStatus(user.id, 'active');
      console.log(`[Invoice] Payment succeeded: User ${user.id} restored to active`);
    }
  }

  // Sync subscription status from Stripe (useful for manual verification)
  static async syncUserSubscription(userId: string): Promise<{ status: string; plan: string } | null> {
    const user = await storage.getUser(userId);
    if (!user?.stripeCustomerId) return null;

    try {
      const stripe = await getStripeClient();
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        // No active subscription
        if (user.subscriptionStatus !== 'canceled' && user.subscriptionStatus !== 'none') {
          await storage.updateUser(user.id, {
            subscriptionStatus: 'none',
            plan: 'solo',
          });
        }
        return { status: 'none', plan: 'solo' };
      }

      const subscription = subscriptions.data[0];
      const amount = subscription.items.data[0]?.price.unit_amount || 0;
      const plan = PRICE_TO_PLAN[amount] || 'solo';

      const periodEnd = (subscription as any).current_period_end;
      await storage.updateUser(user.id, {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        plan: subscription.status === 'active' || subscription.status === 'trialing' ? plan : user.plan,
        subscriptionEndDate: subscription.cancel_at_period_end && periodEnd 
          ? new Date(periodEnd * 1000) 
          : null,
      });

      return { status: subscription.status, plan };
    } catch (error) {
      console.error(`[Subscription] Sync failed for user ${userId}:`, error);
      return null;
    }
  }
}
