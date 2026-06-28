import { storage } from './storage';
import { getStripeClient } from './stripeClient';
import Stripe from 'stripe';
import { getPlanByPriceId, getPlanByAmount, type PlanId } from '@shared/stripe-plans';

export class SubscriptionHandler {
  private static resolvePlan(subscription: Stripe.Subscription): { plan: PlanId; billingInterval: 'monthly' | 'yearly' } {
    const priceId = subscription.items.data[0]?.price.id;
    const amount = subscription.items.data[0]?.price.unit_amount || 0;
    const interval = subscription.items.data[0]?.price.recurring?.interval;

    const byPriceId = priceId ? getPlanByPriceId(priceId) : null;
    if (byPriceId) {
      return { plan: byPriceId.planId, billingInterval: byPriceId.interval };
    }

    const byAmount = getPlanByAmount(amount);
    const billingInterval = interval === 'year' ? 'yearly' as const : 'monthly' as const;
    return { plan: byAmount || 'solo', billingInterval };
  }

  static async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer.id;
    
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) {
      console.log(`[Subscription] No user found for customer ${customerId}`);
      return;
    }

    const { plan, billingInterval } = SubscriptionHandler.resolvePlan(subscription);

    await storage.updateUser(user.id, {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      plan,
      billingInterval,
    });

    console.log(`[Subscription] Created: User ${user.id} -> ${plan} (${subscription.status}, ${billingInterval})`);
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

    const { plan, billingInterval } = SubscriptionHandler.resolvePlan(subscription);
    
    const updates: Record<string, any> = {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
    };

    if (subscription.status === 'active' || subscription.status === 'trialing') {
      updates.plan = plan;
      updates.billingInterval = billingInterval;
      updates.subscriptionEndDate = null;
    }

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

    const updates: Record<string, any> = { subscriptionStatus: 'past_due' };
    if (!user.pastDueSince) {
      updates.pastDueSince = new Date();
    }
    await storage.updateUser(user.id, updates);
    console.log(`[Invoice] Payment failed: User ${user.id} marked as past_due (since ${user.pastDueSince || 'now'})`);

    if (!user.paymentFailureEmailSent) {
      try {
        const { sendPaymentFailedEmail } = await import('./email');
        await sendPaymentFailedEmail(user.email, user.firstName);
        await storage.updateUser(user.id, { paymentFailureEmailSent: true });
        console.log(`[Invoice] Payment failure email sent to ${user.email}`);
      } catch (emailErr) {
        console.error(`[Invoice] Failed to send payment failure email to ${user.email}:`, emailErr);
      }
    }
  }

  static async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const customerId = typeof invoice.customer === 'string' 
      ? invoice.customer 
      : invoice.customer?.id;
    
    if (!customerId) return;

    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    if (user.subscriptionStatus === 'past_due') {
      await storage.updateUser(user.id, {
        subscriptionStatus: 'active',
        pastDueSince: null,
        paymentFailureEmailSent: false,
      });
      console.log(`[Invoice] Payment succeeded: User ${user.id} restored to active, past_due cleared`);
    }
  }

  static async syncUserSubscription(userId: string): Promise<{ status: string; plan: string; billingInterval?: string } | null> {
    const user = await storage.getUser(userId);
    if (!user?.stripeCustomerId) return null;

    try {
      const stripe = await getStripeClient();
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        if (user.subscriptionStatus !== 'canceled' && user.subscriptionStatus !== 'none') {
          await storage.updateUser(user.id, {
            subscriptionStatus: 'none',
            plan: 'solo',
          });
        }
        return { status: 'none', plan: 'solo' };
      }

      const subscription = subscriptions.data[0];
      const { plan, billingInterval } = SubscriptionHandler.resolvePlan(subscription);

      const periodEnd = (subscription as any).current_period_end;
      const syncUpdates: Record<string, any> = {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        plan: subscription.status === 'active' || subscription.status === 'trialing' ? plan : user.plan,
        billingInterval: subscription.status === 'active' || subscription.status === 'trialing' ? billingInterval : user.billingInterval,
        subscriptionEndDate: subscription.cancel_at_period_end && periodEnd 
          ? new Date(periodEnd * 1000) 
          : null,
      };

      if (subscription.status === 'past_due' && !user.pastDueSince) {
        syncUpdates.pastDueSince = new Date();
      } else if (subscription.status === 'active' || subscription.status === 'trialing') {
        syncUpdates.pastDueSince = null;
        syncUpdates.paymentFailureEmailSent = false;
      }

      await storage.updateUser(user.id, syncUpdates);

      return { status: subscription.status, plan, billingInterval };
    } catch (error) {
      console.error(`[Subscription] Sync failed for user ${userId}:`, error);
      return null;
    }
  }
}
