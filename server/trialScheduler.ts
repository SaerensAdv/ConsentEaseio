import { db } from "./db";
import { users } from "@shared/schema";
import { eq, and, lte, gte, isNotNull } from "drizzle-orm";
import { sendTrialExpiringEmail, sendTrialExpiredEmail } from "./email";

export async function checkExpiringTrials() {
  console.log("[TrialScheduler] Checking for expiring trials...");
  
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  
  try {
    const usersWithExpiringTrials = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.subscriptionStatus, "trialing"),
          isNotNull(users.trialEndsAt),
          lte(users.trialEndsAt, twoDaysFromNow),
          gte(users.trialEndsAt, now),
          eq(users.trialReminderSent, false)
        )
      );

    console.log(`[TrialScheduler] Found ${usersWithExpiringTrials.length} users with expiring trials`);

    for (const user of usersWithExpiringTrials) {
      if (!user.trialEndsAt) continue;
      
      const daysLeft = Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      try {
        await sendTrialExpiringEmail(user.email, user.firstName, daysLeft);
        
        await db
          .update(users)
          .set({ trialReminderSent: true })
          .where(eq(users.id, user.id));
          
        console.log(`[TrialScheduler] Sent trial expiring email to ${user.email} (${daysLeft} days left)`);
      } catch (error) {
        console.error(`[TrialScheduler] Failed to send email to ${user.email}:`, error);
      }
    }
  } catch (error) {
    console.error("[TrialScheduler] Error checking expiring trials:", error);
  }
}

export async function checkExpiredTrials() {
  console.log("[TrialScheduler] Checking for expired trials...");
  
  const now = new Date();
  
  try {
    const usersWithExpiredTrials = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.subscriptionStatus, "trialing"),
          isNotNull(users.trialEndsAt),
          lte(users.trialEndsAt, now)
        )
      );

    console.log(`[TrialScheduler] Found ${usersWithExpiredTrials.length} users with expired trials`);

    for (const user of usersWithExpiredTrials) {
      try {
        await db
          .update(users)
          .set({ subscriptionStatus: "expired" })
          .where(eq(users.id, user.id));
        
        await sendTrialExpiredEmail(user.email, user.firstName);
        console.log(`[TrialScheduler] Updated trial status and sent expired email to ${user.email}`);
      } catch (error) {
        console.error(`[TrialScheduler] Failed to process expired trial for ${user.email}:`, error);
      }
    }
  } catch (error) {
    console.error("[TrialScheduler] Error checking expired trials:", error);
  }
}

export function startTrialScheduler() {
  console.log("[TrialScheduler] Starting trial check scheduler...");
  
  checkExpiringTrials();
  checkExpiredTrials();
  
  setInterval(() => {
    checkExpiringTrials();
    checkExpiredTrials();
  }, 24 * 60 * 60 * 1000);
  
  console.log("[TrialScheduler] Scheduler started, will check every 24 hours");
}
