import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import type {
	BetterAuthSubscription,
	BetterAuthUpgradeOptions,
	FormattedPlan,
	SubscriptionStatus,
	UseSubscriptionReturn,
} from "@/types/subscription";

export function useSubscription(): UseSubscriptionReturn {
	const [checkoutError, setCheckoutError] = useState<string | null>(null);
	const [cancelError, setCancelError] = useState<string | null>(null);
	const [restoreError, setRestoreError] = useState<string | null>(null);
	const [billingPortalError, setBillingPortalError] = useState<string | null>(
		null,
	);
	const [upgradeError, setUpgradeError] = useState<string | null>(null);
	// Get authentication status
	const { data: session } = authClient.useSession();
	const isAuthenticated = !!session?.user;

	// Helper function to get current subscription from Better Auth
	const getCurrentSubscription =
		async (): Promise<BetterAuthSubscription | null> => {
			if (!isAuthenticated) return null;

			try {
				const result = await authClient.subscription.list();
				if (result.error) {
					console.warn("Subscription list error:", result.error.message);
					return null; // Return null instead of throwing for free users
				}

				// Find active or trialing subscription
				const activeSubscription = result.data?.find(
					(sub) => sub.status === "active" || sub.status === "trialing",
				);

				return activeSubscription as unknown as BetterAuthSubscription | null;
			} catch (error) {
				console.warn("Failed to fetch subscription:", error);
				return null; // Default to free user
			}
		};

	// Get plans using TRPC
	const {
		data: plans,
		isLoading: isLoadingPlans,
		refetch: refetchPlans,
	} = useQuery(trpc.subscription.getPlans.queryOptions());

	// Get current subscription
	const {
		data: currentSubscription = null, // Default to null
		isLoading: isLoadingSubscription,
		refetch: refetchSubscription,
		error: subscriptionError,
	} = useQuery({
		queryKey: ["subscription", "current"],
		queryFn: getCurrentSubscription,
		enabled: isAuthenticated,
		retry: 1, // Allow one retry
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		placeholderData: null, // Provide placeholder data to prevent undefined
	});

	// Derive subscription status from current subscription
	const subscriptionStatus: SubscriptionStatus | null = useMemo(() => {
		if (!currentSubscription) return null;

		return {
			isPaying: ["active", "trialing"].includes(currentSubscription.status),
			isActive: currentSubscription.status === "active",
			isTrialing: currentSubscription.status === "trialing",
			isCanceled: currentSubscription.status === "canceled",
			cancelAtPeriodEnd: currentSubscription.cancelAtPeriodEnd,
			periodEnd: currentSubscription.periodEnd,
		};
	}, [currentSubscription]);

	// For unauthenticated users, always treat as not paying
	// For authenticated users with no subscription data (loading or error), default to false
	const isPaying = isAuthenticated ? (subscriptionStatus?.isPaying || false) : false;

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
				plan.pricing.yearly?.priceId === priceId,
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
		currentSubscription: currentSubscription || null, // Ensure we return null instead of undefined
		subscriptionStatus: subscriptionStatus as SubscriptionStatus | undefined,
		isPaying,

		// Loading states
		isLoadingPlans,
		isLoadingSubscription,
		isLoadingStatus: false, // Derived from subscription data

		// Debug information
		//@ts-ignore
		subscriptionError,
		isAuthenticated,

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
