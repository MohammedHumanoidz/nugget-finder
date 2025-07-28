import prisma from "../../prisma";
import type { UserSubscription, SubscriptionStatus, SubscriptionLimits } from "../types/subscription";
import { getPlanByProductId } from "./stripe-plans";

/**
 * Checks if a user has an active paying subscription
 */
export async function isUserPaying(userId: string): Promise<boolean> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
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
      where: { userId },
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
      userId: subscription.userId,
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
      isPaying,
      isTrialing,
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
      where: { userId },
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
        userId,
        plan: subscriptionData.plan || "",
        referenceId: subscriptionData.referenceId || userId,
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        status: subscriptionData.status || "incomplete",
        periodStart: subscriptionData.periodStart,
        periodEnd: subscriptionData.periodEnd,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
        seats: subscriptionData.seats,
        trialStart: subscriptionData.trialStart,
        trialEnd: subscriptionData.trialEnd,
      },
    });

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
      userId: subscription.userId,
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
      where: { userId },
    });
    return true;
  } catch (error) {
    console.error("Error deleting user subscription:", error);
    return false;
  }
}