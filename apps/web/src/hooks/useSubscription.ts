import { useState, useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import type {
  UseSubscriptionReturn,
  FormattedPlan,
  BetterAuthSubscription,
  SubscriptionStatus,
  BetterAuthUpgradeOptions,
} from "@/types/subscription";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useSubscription(): UseSubscriptionReturn {
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [billingPortalError, setBillingPortalError] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  // Get authentication status
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  // Helper function to get current subscription from Better Auth
  const getCurrentSubscription = async (): Promise<BetterAuthSubscription | null> => {
    if (!isAuthenticated) return null;
    
    const result = await authClient.subscription.list();
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    // Find active or trialing subscription
    const activeSubscription = result.data?.find(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    );
    
    return activeSubscription as unknown as BetterAuthSubscription | null;
  };

  // Get plans from your API (keep this as TRPC if you have it set up)
  const {
    data: plans,
    isLoading: isLoadingPlans,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: async () => {
      // Replace with your actual plans API endpoint
      const response = await fetch('/api/plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      return response.json();
    },
  });

  // Get current subscription
  const {
    data: currentSubscription,
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: getCurrentSubscription,
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Derive subscription status from current subscription
  const subscriptionStatus: SubscriptionStatus | null = useMemo(() => {
    if (!currentSubscription) return null;
    
    return {
      isPaying: ['active', 'trialing'].includes(currentSubscription.status),
      isActive: currentSubscription.status === 'active',
      isTrialing: currentSubscription.status === 'trialing',
      isCanceled: currentSubscription.status === 'canceled',
      cancelAtPeriodEnd: currentSubscription.cancelAtPeriodEnd,
      periodEnd: currentSubscription.periodEnd,
    };
  }, [currentSubscription]);

  const isPaying = subscriptionStatus?.isPaying || false;

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (options?: { returnUrl?: string }) => {
      const result = await authClient.subscription.cancel({
        returnUrl: options?.returnUrl || window.location.href,
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result;
    },
    onSuccess: () => {
      setCancelError(null);
      refetchSubscription();
    },
    onError: (error: Error) => {
      setCancelError(error.message);
    },
  });

  const upgradeSubscriptionMutation = useMutation({
    mutationFn: async (options: BetterAuthUpgradeOptions) => {
      const result = await authClient.subscription.upgrade(options);
      return result;
    },
    onSuccess: () => {
      setUpgradeError(null);
      refetchSubscription();
    },
    onError: (error: Error) => {
      setUpgradeError(error.message);
    },
  });

  const restoreSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.subscription.restore();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result;
    },
    onSuccess: () => {
      setRestoreError(null);
      refetchSubscription();
    },
    onError: (error: Error) => {
      setRestoreError(error.message);
    },
  });

  const billingPortalMutation = useMutation({
    mutationFn: async (options: { returnUrl: string }) => {
      // Use cancel with returnUrl to access billing portal
      const result = await authClient.subscription.cancel({
        returnUrl: options.returnUrl,
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result;
    },
    onSuccess: () => {
      setBillingPortalError(null);
      // Better Auth handles redirect automatically
    },
    onError: (error: Error) => {
      setBillingPortalError(error.message);
    },
  });

  // Utility functions
  const formatPrice = (amount: number, currency: string): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const getPlanByPriceId = (priceId: string): FormattedPlan | undefined => {
    if (!plans) return undefined;

    return plans.find(
      (plan: FormattedPlan) =>
        plan.pricing.monthly?.priceId === priceId ||
        plan.pricing.yearly?.priceId === priceId
    );
  };

  const refetchAll = () => {
    refetchPlans();
    refetchSubscription();
  };

  //@ts-ignore
  return {
    // Data
    plans,
    currentSubscription,
    subscriptionStatus: subscriptionStatus as SubscriptionStatus | undefined,
    isPaying,

    // Loading states
    isLoadingPlans,
    isLoadingSubscription,
    isLoadingStatus: false, // Derived from subscription data

    // Mutations with proper async signatures

    upgradeSubscription: {
      mutate: async (options: BetterAuthUpgradeOptions) => {
        setUpgradeError(null);
        return upgradeSubscriptionMutation.mutate(options);
      },
      isLoading: upgradeSubscriptionMutation.isPending,
      error: upgradeError,
    },

    cancelSubscription: {
      mutate: async (options?: { returnUrl?: string }) => {
        setCancelError(null);
        return cancelSubscriptionMutation.mutate(options);
      },
      isLoading: cancelSubscriptionMutation.isPending,
      error: cancelError,
    },

    restoreSubscription: {
      mutate: async () => {
        setRestoreError(null);
        return restoreSubscriptionMutation.mutate();
      },
      isLoading: restoreSubscriptionMutation.isPending,
      error: restoreError,
    },

    getBillingPortal: {
      mutate: async (options: { returnUrl: string }) => {
        setBillingPortalError(null);
        return billingPortalMutation.mutate(options);
      },
      isLoading: billingPortalMutation.isPending,
      error: billingPortalError,
    },

    // Utilities
    formatPrice,
    getPlanByPriceId,
    refetchAll,
  };
}