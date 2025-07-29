import { stripeClient } from "@/utils/configs/stripe.config";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../../prisma";
import { fetchPlansFromStripe } from "../utils/stripe-plans";

// Cache for plans to avoid frequent Stripe API calls
let cachedPlans: any[] = [];
let lastPlansFetch = 0;
let plansLoading = false;
const PLANS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getPlansForAuth() {
  const now = Date.now();
  
  console.log("🔍 getPlansForAuth called, cache status:", {
    hasCachedPlans: cachedPlans.length > 0,
    cacheAge: now - lastPlansFetch,
    isLoading: plansLoading,
    cacheValid: cachedPlans.length > 0 && now - lastPlansFetch < PLANS_CACHE_DURATION
  });
  
  // Return cached plans if they're still fresh
  if (cachedPlans.length > 0 && now - lastPlansFetch < PLANS_CACHE_DURATION) {
    console.log("✅ Returning cached plans:", cachedPlans.length, "plans");
    return cachedPlans;
  }

  // If already loading, wait for the existing request
  if (plansLoading) {
    console.log("⏳ Plans already loading, waiting...");
    // Wait for up to 10 seconds for plans to load
    for (let i = 0; i < 100; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!plansLoading && cachedPlans.length > 0) {
        console.log("✅ Got plans from concurrent load");
        return cachedPlans;
      }
    }
    console.log("⚠️ Timeout waiting for plans, returning cached or empty");
    return cachedPlans;
  }

  plansLoading = true;
  try {
    console.log("🚀 Fetching fresh plans from Stripe...");
    const stripePlans = await fetchPlansFromStripe();
    
    // Transform Stripe plans to Better Auth format
    // Better Auth expects the plan "name" to be the identifier used in upgrade calls
    // and "priceId" to be the actual Stripe price ID
    cachedPlans = stripePlans.map(plan => ({
      name: plan.id, // Use the Stripe price ID as the plan name for Better Auth
      priceId: plan.id, // The actual Stripe price ID
      displayName: plan.name, // Keep the human readable name as displayName
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      intervalCount: plan.intervalCount,
      trialPeriodDays: plan.trialPeriodDays,
      metadata: plan.metadata,
    }));
    
    console.log("✅ Better Auth plans loaded:", cachedPlans.length, "plans");
    console.log("📋 Plan Names (identifiers):", cachedPlans.map(p => p.name));
    console.log("💰 Full plan details:", cachedPlans.map(p => ({ 
      name: p.name, // This is what Better Auth will match against
      priceId: p.priceId,
      displayName: p.displayName, 
      price: p.price, 
      currency: p.currency,
      interval: p.interval 
    })));
    
    // Log the exact format Better Auth expects
    if (cachedPlans.length > 0) {
      console.log("🔧 Better Auth plan format sample:", cachedPlans[0]);
    }
    
    lastPlansFetch = now;
    return cachedPlans;
  } catch (error) {
    console.error("❌ Error fetching plans for Better Auth:", error);
    // Return cached plans or empty array as fallback
    return cachedPlans;
  } finally {
    plansLoading = false;
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
	requireEmailVerification: false
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
  socialProviders: {
	google: {
		clientId: process.env.GOOGLE_CLIENT_ID ?? "",
		clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
	},
  }
});
