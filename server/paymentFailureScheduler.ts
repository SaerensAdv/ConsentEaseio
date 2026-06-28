import { db } from "./db";
import { users } from "@shared/schema";
import { eq, and, lte, isNotNull, inArray } from "drizzle-orm";
import { sendPaymentFailedEmail, sendAutoDowngradeEmail } from "./email";
import { stripeService } from "./stripeService";
import { clickup } from "./clickup-service";
import { storage } from "./storage";

const GRACE_PERIOD_DAYS = 14;
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

export async function checkPaymentFailures() {
  console.log("[PaymentScheduler] Checking for overdue payments...");

  const now = new Date();

  try {
    const pastDueUsers = await db
      .select()
      .from(users)
      .where(
        and(
          inArray(users.subscriptionStatus, ["past_due", "unpaid"]),
          isNotNull(users.pastDueSince)
        )
      );

    console.log(`[PaymentScheduler] Found ${pastDueUsers.length} users with payment issues`);

    for (const user of pastDueUsers) {
      if (!user.pastDueSince) continue;

      const daysPastDue = Math.floor(
        (now.getTime() - user.pastDueSince.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (!user.paymentFailureEmailSent) {
        try {
          await sendPaymentFailedEmail(user.email, user.firstName);
          await db
            .update(users)
            .set({ paymentFailureEmailSent: true })
            .where(eq(users.id, user.id));
          console.log(`[PaymentScheduler] Sent payment failure email to ${user.email} (${daysPastDue} days past due)`);
        } catch (error) {
          console.error(`[PaymentScheduler] Failed to send payment failure email to ${user.email}:`, error);
        }
      }

      if (daysPastDue >= GRACE_PERIOD_DAYS) {
        console.log(`[PaymentScheduler] Auto-downgrading user ${user.id} (${user.email}) after ${daysPastDue} days past due`);
        
        const previousPlan = user.plan || 'unknown';

        let stripeCanceled = true;
        if (user.stripeSubscriptionId) {
          try {
            await stripeService.cancelSubscription(user.stripeSubscriptionId);
            console.log(`[PaymentScheduler] Cancelled Stripe subscription ${user.stripeSubscriptionId}`);
          } catch (stripeErr: any) {
            if (stripeErr.code === 'resource_missing' || stripeErr.statusCode === 404) {
              console.log(`[PaymentScheduler] Stripe subscription ${user.stripeSubscriptionId} already deleted/missing`);
            } else {
              console.error(`[PaymentScheduler] Failed to cancel Stripe subscription ${user.stripeSubscriptionId}:`, stripeErr.message);
              stripeCanceled = false;
            }
          }
        }

        if (!stripeCanceled) {
          console.error(`[PaymentScheduler] Skipping local downgrade for user ${user.id} — Stripe cancellation failed. Will retry next cycle.`);
          continue;
        }

        await db
          .update(users)
          .set({
            plan: "solo",
            subscriptionStatus: "canceled",
            stripeSubscriptionId: null,
            subscriptionEndDate: null,
            pastDueSince: null,
            paymentFailureEmailSent: false,
          })
          .where(eq(users.id, user.id));

        console.log(`[PaymentScheduler] User ${user.id} downgraded to solo plan`);

        try {
          await sendAutoDowngradeEmail(user.email, user.firstName, previousPlan);
        } catch (emailErr) {
          console.error(`[PaymentScheduler] Failed to send auto-downgrade email to ${user.email}:`, emailErr);
        }

        try {
          const websites = await storage.getWebsitesByUserId(user.id);
          const primaryDomain = websites[0]?.domain;
          clickup.updateCustomerStatus({
            email: user.email,
            domain: primaryDomain,
            status: "inactive",
            plan: "solo",
          });
        } catch (e) {}
      }
    }
  } catch (error) {
    console.error("[PaymentScheduler] Error checking payment failures:", error);
  }
}

export function startPaymentFailureScheduler() {
  console.log("[PaymentScheduler] Starting payment failure scheduler...");

  checkPaymentFailures();

  setInterval(() => {
    checkPaymentFailures();
  }, CHECK_INTERVAL_MS);

  console.log(`[PaymentScheduler] Scheduler started, will check every ${CHECK_INTERVAL_MS / (60 * 60 * 1000)} hours`);
}
