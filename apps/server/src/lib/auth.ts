import { stripeClient } from "@/utils/configs/stripe.config";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../../prisma";
import { fetchPlansFromStripe } from "../utils/stripe-plans";

// Cache for plans to avoid frequent Stripe API calls
let cachedPlans: any[] = [];
let lastPlansFetch = 0;
const PLANS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getPlansForAuth() {
  const now = Date.now();
  
  // Return cached plans if they're still fresh
  if (cachedPlans.length > 0 && now - lastPlansFetch < PLANS_CACHE_DURATION) {
    return cachedPlans;
  }

  try {
    const stripePlans = await fetchPlansFromStripe();
    
    // Transform Stripe plans to Better Auth format
    cachedPlans = stripePlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      intervalCount: plan.intervalCount,
      trialPeriodDays: plan.trialPeriodDays,
      metadata: plan.metadata,
    }));
    
    lastPlansFetch = now;
    return cachedPlans;
  } catch (error) {
    console.error("Error fetching plans for Better Auth:", error);
    // Return cached plans or empty array as fallback
    return cachedPlans;
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: async () => {
          return await getPlansForAuth();
        },
      },
    }),
  ],
});
