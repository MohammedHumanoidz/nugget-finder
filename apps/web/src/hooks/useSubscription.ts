import { useState } from "react";
import { trpc } from "@/utils/trpc";
import type { 
  UseSubscriptionReturn, 
  CreateCheckoutSessionInput,
  FormattedPlan 
} from "@/types/subscription";

export function useSubscription(): UseSubscriptionReturn {
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [billingPortalError, setBillingPortalError] = useState<string | null>(null);

  // Queries
  const { 
    data: plans, 
    isLoading: isLoadingPlans,
    refetch: refetchPlans 
  } = trpc.subscription.getPlans.useQuery();

  const { 
    data: currentSubscription, 
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription 
  } = trpc.subscription.getCurrentSubscription.useQuery();

  const { 
    data: subscriptionStatus, 
    isLoading: isLoadingStatus,
    refetch: refetchStatus 
  } = trpc.subscription.getSubscriptionStatus.useQuery();

  const { 
    data: isPaying,
    refetch: refetchIsPaying 
  } = trpc.subscription.isUserPaying.useQuery();

  // Mutations
  const createCheckoutMutation = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      setCheckoutError(null);
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      setCheckoutError(error.message);
    },
  });

  const cancelSubscriptionMutation = trpc.subscription.cancelSubscription.useMutation({
    onSuccess: () => {
      setCancelError(null);
      // Refetch subscription data
      refetchSubscription();
      refetchStatus();
      refetchIsPaying();
    },
    onError: (error) => {
      setCancelError(error.message);
    },
  });

  const restoreSubscriptionMutation = trpc.subscription.restoreSubscription.useMutation({
    onSuccess: () => {
      setRestoreError(null);
      // Refetch subscription data
      refetchSubscription();
      refetchStatus();
      refetchIsPaying();
    },
    onError: (error) => {
      setRestoreError(error.message);
    },
  });

  const billingPortalMutation = trpc.subscription.getBillingPortalUrl.useMutation({
    onSuccess: (data) => {
      setBillingPortalError(null);
      // Redirect to billing portal
      window.location.href = data.url;
    },
    onError: (error) => {
      setBillingPortalError(error.message);
    },
  });

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
    
    return plans.find(plan => 
      plan.pricing.monthly?.priceId === priceId || 
      plan.pricing.yearly?.priceId === priceId
    );
  };

  const refetchAll = () => {
    refetchPlans();
    refetchSubscription();
    refetchStatus();
    refetchIsPaying();
  };

  return {
    // Data
    plans,
    currentSubscription,
    subscriptionStatus,
    isPaying,
    
    // Loading states
    isLoadingPlans,
    isLoadingSubscription,
    isLoadingStatus,
    
    // Mutations
    createCheckout: {
      mutate: (input: CreateCheckoutSessionInput) => {
        setCheckoutError(null);
        createCheckoutMutation.mutate(input);
      },
      isLoading: createCheckoutMutation.isLoading,
      error: checkoutError,
    },
    
    cancelSubscription: {
      mutate: () => {
        setCancelError(null);
        cancelSubscriptionMutation.mutate();
      },
      isLoading: cancelSubscriptionMutation.isLoading,
      error: cancelError,
    },
    
    restoreSubscription: {
      mutate: () => {
        setRestoreError(null);
        restoreSubscriptionMutation.mutate();
      },
      isLoading: restoreSubscriptionMutation.isLoading,
      error: restoreError,
    },
    
    getBillingPortal: {
      mutate: (input: { returnUrl: string }) => {
        setBillingPortalError(null);
        billingPortalMutation.mutate(input);
      },
      isLoading: billingPortalMutation.isLoading,
      error: billingPortalError,
    },
    
    // Utilities
    formatPrice,
    getPlanByPriceId,
    refetchAll,
  };
}