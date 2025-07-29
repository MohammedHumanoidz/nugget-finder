import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { formatErrorForDisplay, parseSubscriptionError } from "@/utils/subscription-errors";
import type { 
  UseSubscriptionReturn, 
  BetterAuthSubscription,
  BetterAuthUpgradeOptions,
  BetterAuthCancelOptions,
  FormattedPlan,
  SubscriptionStatus
} from "@/types/subscription";
import { useQuery } from "@tanstack/react-query";

export function useBetterAuthSubscription(): UseSubscriptionReturn {
  // State for loading and errors
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [billingPortalLoading, setBillingPortalLoading] = useState(false);
  
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [billingPortalError, setBillingPortalError] = useState<string | null>(null);

  // State for subscription data
  const [currentSubscription, setCurrentSubscription] = useState<BetterAuthSubscription | null>();
  const [lastFetch, setLastFetch] = useState(0);

  // Get authentication status
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  // Fetch plans from TRPC (public data)
  const {
    data: plans,
    isLoading: isLoadingPlans,
    refetch: refetchPlans,
  } = useQuery(trpc.subscription.getPlans.queryOptions());

  // Fetch subscription data using Better Auth
  const fetchSubscriptionData = useCallback(async () => {
    if (!isAuthenticated) {
      setCurrentSubscription(null);
      return;
    }

    setIsLoadingSubscription(true);
    try {
      // Use Better Auth subscription.list() method
      const subscriptions = await authClient.subscription.list();
      
      // Get the active subscription (assuming user has only one)
      const activeSubscription = Array.isArray(subscriptions) 
        ? subscriptions.find((sub: BetterAuthSubscription) => 
            sub.status === 'active' || sub.status === 'trialing' || sub.status === 'canceled'
          ) || null
        : null;

      setCurrentSubscription(activeSubscription);
      setLastFetch(Date.now());
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setCurrentSubscription(null);
    } finally {
      setIsLoadingSubscription(false);
    }
  }, [isAuthenticated]);

  // Fetch subscription data on mount and when auth changes
  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // Auto-refresh subscription data every 30 seconds if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const timeSinceLastFetch = Date.now() - lastFetch;
      if (timeSinceLastFetch > 30000) { // 30 seconds
        fetchSubscriptionData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, lastFetch, fetchSubscriptionData]);

  // Get the free plan (price = 0 or amount = 0)
  const getFreePlan = (): FormattedPlan | null => {
    if (!plans) return null;
    return plans.find((plan: FormattedPlan) => 
      (plan.pricing.monthly?.amount === 0) || 
      (plan.pricing.yearly?.amount === 0) ||
      plan.name.toLowerCase().includes('free')
    ) || null;
  };

  // Derive subscription status with free plan fallback
  const subscriptionStatus: SubscriptionStatus | undefined = isAuthenticated ? {
    isActive: currentSubscription?.status === 'active' || !currentSubscription,
    isPaying: currentSubscription ? ['active', 'trialing'].includes(currentSubscription.status) : false,
    isTrialing: currentSubscription?.status === 'trialing' || false,
    isCanceled: currentSubscription ? (currentSubscription.status === 'canceled' || currentSubscription.cancelAtPeriodEnd) : false,
    planName: currentSubscription?.plan || getFreePlan()?.name || 'Free',
    periodEnd: currentSubscription?.periodEnd,
    trialEnd: undefined, // Better Auth doesn't provide trial end directly
    cancelAtPeriodEnd: currentSubscription?.cancelAtPeriodEnd || false,
  } : undefined;

  const isPaying = subscriptionStatus?.isPaying;

  // Better Auth subscription operations
  const upgradeSubscription = {
    mutate: async (options: BetterAuthUpgradeOptions) => {
      if (!isAuthenticated) {
        setUpgradeError("Authentication required");
        return;
      }

      setUpgradeLoading(true);
      setUpgradeError(null);
      
      try {
        await authClient.subscription.upgrade({
          plan: options.plan,
          subscriptionId: options.subscriptionId || currentSubscription?.stripeSubscriptionId,
          successUrl: options.successUrl,
          cancelUrl: options.cancelUrl,
        });
        
        // Refresh subscription data after successful upgrade
        await fetchSubscriptionData();
      } catch (error: unknown) {
        console.error("Error upgrading subscription:", error);
        const formattedError = formatErrorForDisplay(error);
        setUpgradeError(formattedError);
        
        // Optional: Implement retry logic for retryable errors
        const parsedError = parseSubscriptionError(error);
        console.log("Parsed error:", parsedError);
      } finally {
        setUpgradeLoading(false);
      }
    },
    isLoading: upgradeLoading,
    error: upgradeError,
  };

  const cancelSubscription = {
    mutate: async (options?: BetterAuthCancelOptions) => {
      if (!isAuthenticated || !currentSubscription) {
        setCancelError("No active subscription found");
        return;
      }

      setCancelLoading(true);
      setCancelError(null);
      
      try {
        await authClient.subscription.cancel({
          returnUrl: options?.returnUrl || window.location.href,
        });
        
        // Refresh subscription data after successful cancellation
        await fetchSubscriptionData();
      } catch (error: unknown) {
        console.error("Error canceling subscription:", error);
        setCancelError(formatErrorForDisplay(error));
      } finally {
        setCancelLoading(false);
      }
    },
    isLoading: cancelLoading,
    error: cancelError,
  };

  const restoreSubscription = {
    mutate: async () => {
      if (!isAuthenticated || !currentSubscription) {
        setRestoreError("No subscription found to restore");
        return;
      }

      setRestoreLoading(true);
      setRestoreError(null);
      
      try {
        await authClient.subscription.restore();
        
        // Refresh subscription data after successful restoration
        await fetchSubscriptionData();
      } catch (error: unknown) {
        console.error("Error restoring subscription:", error);
        setRestoreError(formatErrorForDisplay(error));
      } finally {
        setRestoreLoading(false);
      }
    },
    isLoading: restoreLoading,
    error: restoreError,
  };

  const getBillingPortal = {
    mutate: async (options: { returnUrl: string }) => {
      if (!isAuthenticated || !currentSubscription) {
        setBillingPortalError("No subscription found");
        return;
      }

      setBillingPortalLoading(true);
      setBillingPortalError(null);
      
      try {
        // Better Auth uses the cancel method with returnUrl to open billing portal
        await authClient.subscription.cancel({
          returnUrl: options.returnUrl,
        });
      } catch (error: unknown) {
        console.error("Error opening billing portal:", error);
        setBillingPortalError(formatErrorForDisplay(error));
      } finally {
        setBillingPortalLoading(false);
      }
    },
    isLoading: billingPortalLoading,
    error: billingPortalError,
  };

  // Utility functions
  const formatPrice = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const getPlanByPriceId = (priceId: string): FormattedPlan | undefined => {
    if (!plans) return undefined;
    
    return plans.find((plan: FormattedPlan) => 
      plan.pricing.monthly?.priceId === priceId || 
      plan.pricing.yearly?.priceId === priceId
    );
  };

  // Get current effective plan (subscription plan or free plan)
  const getCurrentPlan = (): FormattedPlan | null => {
    if (currentSubscription?.plan) {
      // Find the plan by product ID
      return plans?.find((plan: FormattedPlan) => plan.productId === currentSubscription.plan) || null;
    }
    return getFreePlan();
  };

  const refetchAll = useCallback(() => {
    refetchPlans();
    fetchSubscriptionData();
  }, [refetchPlans, fetchSubscriptionData]);

  return {
    // Data
    plans,
    currentSubscription,
    subscriptionStatus,
    isPaying,
    
    // Loading states
    isLoadingPlans,
    isLoadingSubscription,
    isLoadingStatus: false, // Derived synchronously
    
    // Better Auth Mutations
    upgradeSubscription,
    cancelSubscription,
    restoreSubscription,
    getBillingPortal,
    
    // Utilities
    formatPrice,
    getPlanByPriceId,
    getCurrentPlan,
    getFreePlan,
    refetchAll,
  };
}