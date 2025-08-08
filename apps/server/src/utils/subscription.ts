import prisma from "../../prisma";
import type { UserSubscription, SubscriptionStatus, SubscriptionLimits } from "../types/subscription";
import { getPlanByProductId } from "./stripe-plans";

/**
 * Checks if a user has an active paying subscription
 */
export async function isUserPaying(userId: string): Promise<boolean> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { referenceId: userId },
    });

    if (!subscription) return false;

    const activeStatuses = ["active", "trialing"];
    return activeStatuses.includes(subscription.status);
  } catch (error) {
    console.error("Error checking if user is paying:", error);
    return false;
  }
}

/**
 * Gets a user's subscription details
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { referenceId: userId },
    });

    if (!subscription) return null;

    return {
      id: subscription.id,
      plan: subscription.plan,
      referenceId: subscription.referenceId,
      stripeCustomerId: subscription.stripeCustomerId || undefined,
      stripeSubscriptionId: subscription.stripeSubscriptionId || undefined,
      status: subscription.status,
      periodStart: subscription.periodStart || undefined,
      periodEnd: subscription.periodEnd || undefined,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      seats: subscription.seats || undefined,
      trialStart: subscription.trialStart || undefined,
      trialEnd: subscription.trialEnd || undefined,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      userId: subscription.referenceId,
    };
  } catch (error) {
    console.error("Error getting user subscription:", error);
    return null;
  }
}

/**
 * Gets a user's current plan name
 */
export async function getUserCurrentPlan(userId: string): Promise<string | null> {
  try {
    const subscription = await getUserSubscription(userId);
    return subscription?.plan || null;
  } catch (error) {
    console.error("Error getting user current plan:", error);
    return null;
  }
}

/**
 * Parses plan description string to extract limits
 * Example: "10 Claims Per Month | unlimited Idea View Per Day | unlimited Saves Per Month"
 */
export function parsePlanLimits(description: string): {
  claims: number;
  saves: number;
  views: number;
} {
  const parts = description.split('|').map(p => p.trim());
  let claims = 0;
  let saves = 0;
  let views = 1;

  for (const part of parts) {
    const lowerPart = part.toLowerCase();
    
    if (lowerPart.includes('claims per month')) {
      const match = part.match(/(\d+|unlimited)\s+claims/i);
      if (match) {
        claims = match[1] === 'unlimited' ? -1 : Number.parseInt(match[1], 10);
      }
    } else if (lowerPart.includes('saves per month')) {
      const match = part.match(/(\d+|unlimited)\s+saves/i);
      if (match) {
        saves = match[1] === 'unlimited' ? -1 : Number.parseInt(match[1], 10);
      }
    } else if (lowerPart.includes('idea view per day')) {
      const match = part.match(/(\d+|unlimited)\s+idea view/i);
      if (match) {
        views = match[1] === 'unlimited' ? -1 : Number.parseInt(match[1], 10);
      }
    }
  }

  return { claims, saves, views };
}

/**
 * Updates user limits based on their subscription
 */
export async function updateUserLimitsFromPlan(userId: string): Promise<void> {
  try {
    const subscription = await getUserSubscription(userId);
    
    let claims = 0;
    let saves = 0;
    let views = 1000;
    
    if (subscription && ["active", "trialing"].includes(subscription.status)) {
      // Get plan details
      const planDetails = await getPlanByProductId(subscription.plan);
      
      if (planDetails && planDetails.description) {
        const limits = parsePlanLimits(planDetails.description);
        claims = limits.claims;
        saves = limits.saves;
        views = limits.views;
      }
    }

    // Update user limits
    await prisma.user.update({
      where: { id: userId },
      data: {
        claimLimit: claims,
        saveLimit: saves,
        viewLimit: views,
      },
    });
  } catch (error) {
    console.error("Error updating user limits from plan:", error);
  }
}

/**
 * Gets subscription limits for a user based on their plan
 */
export async function getSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
  try {
    const subscription = await getUserSubscription(userId);
    
    if (!subscription || !["active", "trialing"].includes(subscription.status)) {
      // Return default/free tier limits
      return {
        ideas_per_day: 3,
        api_calls_per_month: 100,
        storage_gb: 1,
      };
    }

    // Get plan details to extract limits
    const planDetails = await getPlanByProductId(subscription.plan);
    
    if (!planDetails) {
      // Fallback to default limits if plan not found
      return {
        ideas_per_day: 3,
        api_calls_per_month: 100,
        storage_gb: 1,
      };
    }

    return planDetails.limits;
  } catch (error) {
    console.error("Error getting subscription limits:", error);
    // Return default limits on error
    return {
      ideas_per_day: 3,
      api_calls_per_month: 100,
      storage_gb: 1,
    };
  }
}

/**
 * Gets comprehensive subscription status for a user
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return {
        isActive: false,
        isPaying: false,
        isTrialing: false,
        isCanceled: false,
        cancelAtPeriodEnd: false,
      };
    }

    const now = new Date();
    const isActive = subscription.status === "active";
    const isTrialing = subscription.status === "trialing" && 
                      subscription.trialEnd && 
                      subscription.trialEnd > now;
    const isPaying = isActive || isTrialing;
    const isCanceled = subscription.status === "canceled" || 
                      subscription.cancelAtPeriodEnd;

    return {
      isActive,
      isPaying: isPaying || false,
      isTrialing: isTrialing || false,
      isCanceled,
      planName: subscription.plan,
      periodEnd: subscription.periodEnd,
      trialEnd: subscription.trialEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return {
      isActive: false,
      isPaying: false,
      isTrialing: false,
      isCanceled: false,
      cancelAtPeriodEnd: false,
    };
  }
}

/**
 * Creates or updates a user's subscription record
 */
export async function upsertUserSubscription(
  userId: string,
  subscriptionData: Partial<UserSubscription>
): Promise<UserSubscription> {
  try {
    const subscription = await prisma.subscription.upsert({
      where: { referenceId: userId },
      update: {
        plan: subscriptionData.plan || "",
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        status: subscriptionData.status || "incomplete",
        periodStart: subscriptionData.periodStart,
        periodEnd: subscriptionData.periodEnd,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
        seats: subscriptionData.seats,
        trialStart: subscriptionData.trialStart,
        trialEnd: subscriptionData.trialEnd,
        updatedAt: new Date(),
      },
      create: {
        referenceId: userId,
        plan: subscriptionData.plan || "",
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        status: subscriptionData.status || "incomplete",
        periodStart: subscriptionData.periodStart,
        periodEnd: subscriptionData.periodEnd,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
        seats: subscriptionData.seats,
        trialStart: subscriptionData.trialStart,
        trialEnd: subscriptionData.trialEnd,
        id: subscriptionData.id || "",
      },
    });

    // Update user limits when subscription changes
    if (["active", "trialing"].includes(subscription.status)) {
      await updateUserLimitsFromPlan(userId);
    }

    return {
      id: subscription.id,
      plan: subscription.plan,
      referenceId: subscription.referenceId,
      stripeCustomerId: subscription.stripeCustomerId || undefined,
      stripeSubscriptionId: subscription.stripeSubscriptionId || undefined,
      status: subscription.status,
      periodStart: subscription.periodStart || undefined,
      periodEnd: subscription.periodEnd || undefined,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      seats: subscription.seats || undefined,
      trialStart: subscription.trialStart || undefined,
      trialEnd: subscription.trialEnd || undefined,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      userId: subscription.referenceId,
    };
  } catch (error) {
    console.error("Error upserting user subscription:", error);
    throw new Error("Failed to update subscription");
  }
}

/**
 * Deletes a user's subscription record
 */
export async function deleteUserSubscription(userId: string): Promise<boolean> {
  try {
    await prisma.subscription.delete({
      where: { referenceId: userId },
    });
    return true;
  } catch (error) {
    console.error("Error deleting user subscription:", error);
    return false;
  }
}