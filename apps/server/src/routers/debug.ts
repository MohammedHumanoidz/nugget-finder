import { publicProcedure, router } from "../lib/trpc";
import { fetchPlansFromStripe } from "../utils/stripe-plans";
import { auth } from "../lib/auth";

export const debugRouter = router({
  // Debug endpoint to check what plans are loaded
  checkPlans: publicProcedure.query(async () => {
    try {
      console.log("🔍 Debug: Checking plans...");
      
      // Get plans from Stripe directly
      const stripePlans = await fetchPlansFromStripe();
      console.log("📦 Stripe plans:", stripePlans.map(p => ({ id: p.id, name: p.name })));
      
      // Get plans from Better Auth
      const authContext = auth;
      const betterAuthPlans = await (authContext as any).options.plugins
        .find((p: any) => p.id === "stripe")?.subscription?.plans?.();
      
      console.log("🔐 Better Auth plans:", betterAuthPlans?.map((p: any) => ({ id: p.id, name: p.name })));
      
      return {
        stripePlans: stripePlans.map(p => ({ id: p.id, name: p.name, price: p.price })),
        betterAuthPlans: betterAuthPlans?.map((p: any) => ({ id: p.id, name: p.name, price: p.price })) || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("❌ Debug error:", error);
      throw error;
    }
  }),
});