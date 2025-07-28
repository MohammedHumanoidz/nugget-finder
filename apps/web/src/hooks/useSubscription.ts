import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import type {
  UseSubscriptionReturn,
  CreateCheckoutSessionInput,
  FormattedPlan,
} from "@/types/subscription";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useSubscription(): UseSubscriptionReturn {
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [billingPortalError, setBillingPortalError] = useState<string | null>(
    null
  );

  // Get authentication status
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  // Queries
  const {
    data: plans,
    isLoading: isLoadingPlans,
    refetch: refetchPlans,
  } = useQuery(trpc.subscription.getPlans.queryOptions());

  const {
    data: currentSubscription,
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription,
  } = useQuery({
    ...trpc.subscription.getCurrentSubscription.queryOptions(),
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const {
    data: subscriptionStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useQuery({
    ...trpc.subscription.getSubscriptionStatus.queryOptions(),
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: isPaying, refetch: refetchIsPaying } = useQuery({
    ...trpc.subscription.isUserPaying.queryOptions(),
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const createCheckoutMutation = useMutation(
    trpc.subscription.createCheckoutSession.mutationOptions({
      onSuccess: (data) => {
        setCheckoutError(null);
        // Redirect to Stripe checkout
        window.location.href = data.url;
      },
      onError: (error) => {
        setCheckoutError(error.message);
      },
    })
  );

  const cancelSubscriptionMutation = useMutation(
    trpc.subscription.cancelSubscription.mutationOptions({
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
    })
  );

  const restoreSubscriptionMutation = useMutation(
    trpc.subscription.restoreSubscription.mutationOptions({
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
    })
  );

  const billingPortalMutation = useMutation(
    trpc.subscription.getBillingPortalUrl.mutationOptions({
      onSuccess: (data) => {
        setBillingPortalError(null);
        // Redirect to billing portal
        window.location.href = data.url;
      },
      onError: (error) => {
        setBillingPortalError(error.message);
      },
    })
  );

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
      (plan) =>
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
      isLoading: createCheckoutMutation.isPending,
      error: checkoutError,
    },

    cancelSubscription: {
      mutate: () => {
        setCancelError(null);
        cancelSubscriptionMutation.mutate();
      },
      isLoading: cancelSubscriptionMutation.isPending,
      error: cancelError,
    },

    restoreSubscription: {
      mutate: () => {
        setRestoreError(null);
        restoreSubscriptionMutation.mutate();
      },
      isLoading: restoreSubscriptionMutation.isPending,
      error: restoreError,
    },

    getBillingPortal: {
      mutate: (input: { returnUrl: string }) => {
        setBillingPortalError(null);
        billingPortalMutation.mutate(input);
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
