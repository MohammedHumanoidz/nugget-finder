import { stripeClient } from "./configs/stripe.config";
import type { StripePlan, FormattedPlan } from "../types/subscription";

/**
 * Fetches all active products and their prices from Stripe
 */
export async function fetchPlansFromStripe(): Promise<StripePlan[]> {
  try {
    console.log("🔍 Fetching plans from Stripe...");
    
    // Fetch all active products
    const products = await stripeClient.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    // Fetch all active prices
    const prices = await stripeClient.prices.list({
      active: true,
      type: "recurring",
      expand: ["data.product"],
    });

    console.log(`📦 Found ${products.data.length} products and ${prices.data.length} prices`);
    console.log("💰 Price IDs:", prices.data.map(p => p.id));

    const plans: StripePlan[] = [];

    for (const price of prices.data) {
      const product = typeof price.product === "string" 
        ? products.data.find(p => p.id === price.product)
        : price.product;

      if (!product || !product.active) continue;

      plans.push({
        id: price.id,
        productId: product.id,
        name: product.name,
        description: product.description || "",
        price: price.unit_amount || 0,
        currency: price.currency,
        interval: price.recurring?.interval || "month",
        intervalCount: price.recurring?.interval_count || 1,
        metadata: product.metadata as StripePlan["metadata"],
        trialPeriodDays: price.recurring?.trial_period_days || undefined,
        active: price.active,
      });
    }

    return plans;
  } catch (error) {
    console.error("Error fetching plans from Stripe:", error);
    throw new Error("Failed to fetch plans from Stripe");
  }
}

/**
 * Formats Stripe plans for frontend consumption
 */
export function formatPlansForFrontend(stripePlans: StripePlan[]): FormattedPlan[] {
  const planGroups = new Map<string, StripePlan[]>();

  // Group plans by product ID
  for (const plan of stripePlans) {
    if (!planGroups.has(plan.productId)) {
      planGroups.set(plan.productId, []);
    }
    planGroups.get(plan.productId)!.push(plan);
  }

  const formattedPlans: FormattedPlan[] = [];

  for (const [productId, plans] of planGroups) {
    const basePlan = plans[0];
    
    // Parse features from metadata
    const features = basePlan.metadata.features 
      ? basePlan.metadata.features.split(",").map(f => f.trim())
      : [];

    // Parse limits from metadata
    const limits: Record<string, number> = {};
    if (basePlan.metadata.limits) {
      try {
        const limitsData = JSON.parse(basePlan.metadata.limits);
        Object.assign(limits, limitsData);
      } catch {
        // If JSON parsing fails, treat as simple key-value pairs
        const limitPairs = basePlan.metadata.limits.split(",");
        for (const pair of limitPairs) {
          const [key, value] = pair.split(":").map(s => s.trim());
          if (key && value) {
            limits[key] = parseInt(value, 10) || 0;
          }
        }
      }
    }

    // Group pricing by interval
    const pricing: FormattedPlan["pricing"] = {};
    for (const plan of plans) {
      if (plan.interval === "month") {
        pricing.monthly = {
          priceId: plan.id,
          amount: plan.price,
          currency: plan.currency,
        };
      } else if (plan.interval === "year") {
        pricing.yearly = {
          priceId: plan.id,
          amount: plan.price,
          currency: plan.currency,
        };
      }
    }

    formattedPlans.push({
      id: productId,
      productId,
      name: basePlan.name,
      description: basePlan.description,
      features,
      limits,
      pricing,
      trialDays: basePlan.trialPeriodDays,
      popular: basePlan.metadata.popular === "true",
      group: basePlan.metadata.group,
      active: basePlan.active,
    });
  }

  // Sort plans by group and name
  return formattedPlans.sort((a, b) => {
    if (a.group && b.group && a.group !== b.group) {
      return a.group.localeCompare(b.group);
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Gets all available plans formatted for frontend
 */
export async function getAvailablePlans(): Promise<FormattedPlan[]> {
  const stripePlans = await fetchPlansFromStripe();
  return formatPlansForFrontend(stripePlans);
}

/**
 * Gets a specific plan by price ID
 */
export async function getPlanByPriceId(priceId: string): Promise<StripePlan | null> {
  try {
    const price = await stripeClient.prices.retrieve(priceId, {
      expand: ["product"],
    });

    const product = price.product as any;
    if (!product || !product.active || !price.active) {
      return null;
    }

    return {
      id: price.id,
      productId: product.id,
      name: product.name,
      description: product.description || "",
      price: price.unit_amount || 0,
      currency: price.currency,
      interval: price.recurring?.interval || "month",
      intervalCount: price.recurring?.interval_count || 1,
      metadata: product.metadata as StripePlan["metadata"],
      trialPeriodDays: price.recurring?.trial_period_days || undefined,
      active: price.active,
    };
  } catch (error) {
    console.error("Error fetching plan by price ID:", error);
    return null;
  }
}

/**
 * Gets plan details by product ID
 */
export async function getPlanByProductId(productId: string): Promise<FormattedPlan | null> {
  try {
    const plans = await getAvailablePlans();
    return plans.find(plan => plan.productId === productId) || null;
  } catch (error) {
    console.error("Error fetching plan by product ID:", error);
    return null;
  }
}