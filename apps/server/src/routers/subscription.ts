import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { TRPCError } from "@trpc/server";
import { stripeClient } from "../utils/configs/stripe.config";
import { 
  getAvailablePlans, 
  getPlanByPriceId 
} from "../utils/stripe-plans";
import {
  getUserSubscription,
  getSubscriptionStatus,
  isUserPaying,
} from "../utils/subscription";
import type { 
  CreateCheckoutSessionInput,
  CheckoutSessionResponse,
} from "../types/subscription";

export const subscriptionRouter = router({
  // Public procedure to get available plans
  getPlans: publicProcedure.query(async () => {
    try {
      return await getAvailablePlans();
    } catch (error) {
      console.error("Error fetching plans:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch available plans",
      });
    }
  }),

  // Protected procedure to get current user's subscription
  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id;
      return await getUserSubscription(userId);
    } catch (error) {
      console.error("Error fetching current subscription:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch subscription",
      });
    }
  }),

  // Protected procedure to get subscription status
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id;
      return await getSubscriptionStatus(userId);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch subscription status",
      });
    }
  }),

  // Protected procedure to check if user is paying
  isUserPaying: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id;
      return await isUserPaying(userId);
    } catch (error) {
      console.error("Error checking payment status:", error);
      return false;
    }
  }),

  // Protected procedure to create checkout session
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string().min(1, "Price ID is required"),
        successUrl: z.string().url("Valid success URL is required"),
        cancelUrl: z.string().url("Valid cancel URL is required"),
        mode: z.enum(["subscription", "payment"]).optional().default("subscription"),
      })
    )
    .mutation(async ({ input, ctx }): Promise<CheckoutSessionResponse> => {
      try {
        const userId = ctx.session.user.id;
        const user = ctx.session.user;

        // Validate the price ID exists
        const plan = await getPlanByPriceId(input.priceId);
        if (!plan) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid price ID",
          });
        }

        // Check if user already has an active subscription
        const existingSubscription = await getUserSubscription(userId);
        if (existingSubscription && ["active", "trialing"].includes(existingSubscription.status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User already has an active subscription",
          });
        }

        // Create Stripe checkout session
        const session = await stripeClient.checkout.sessions.create({
          mode: input.mode,
          payment_method_types: ["card"],
          line_items: [
            {
              price: input.priceId,
              quantity: 1,
            },
          ],
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          customer_email: user.email,
          client_reference_id: userId,
          metadata: {
            userId,
            priceId: input.priceId,
            planName: plan.name,
          },
        });

        if (!session.id || !session.url) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create checkout session",
          });
        }

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("Error creating checkout session:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }
    }),

  // Protected procedure to cancel subscription
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id;
      
      const subscription = await getUserSubscription(userId);
      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No active subscription found",
        });
      }

      if (!["active", "trialing"].includes(subscription.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Subscription is not active",
        });
      }

      // Cancel subscription at period end
      await stripeClient.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      return {
        success: true,
        message: "Subscription will be canceled at the end of the current billing period",
      };
    } catch (error) {
      console.error("Error canceling subscription:", error);
      
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to cancel subscription",
      });
    }
  }),

  // Protected procedure to restore subscription
  restoreSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id;
      
      const subscription = await getUserSubscription(userId);
      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No subscription found",
        });
      }

      if (!subscription.cancelAtPeriodEnd) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Subscription is not scheduled for cancellation",
        });
      }

      // Remove cancellation
      await stripeClient.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      return {
        success: true,
        message: "Subscription has been restored",
      };
    } catch (error) {
      console.error("Error restoring subscription:", error);
      
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to restore subscription",
      });
    }
  }),

  // Protected procedure to get billing portal URL
  getBillingPortalUrl: protectedProcedure
    .input(
      z.object({
        returnUrl: z.string().url("Valid return URL is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.session.user.id;
        
        const subscription = await getUserSubscription(userId);
        if (!subscription || !subscription.stripeCustomerId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No Stripe customer found",
          });
        }

        const session = await stripeClient.billingPortal.sessions.create({
          customer: subscription.stripeCustomerId,
          return_url: input.returnUrl,
        });

        return {
          url: session.url,
        };
      } catch (error) {
        console.error("Error creating billing portal session:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create billing portal session",
        });
      }
    }),
});