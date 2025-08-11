export interface FormattedPlan {
	id: string;
	productId: string;
	name: string;
	description: string;
	features: string[];
	limits: Record<string, number>;
	pricing: {
		monthly?: {
			priceId: string;
			amount: number;
			currency: string;
		};
		yearly?: {
			priceId: string;
			amount: number;
			currency: string;
		};
	};
	trialDays?: number;
	popular: boolean;
	group?: string;
	active: boolean;
}

// Better Auth Stripe plugin subscription format
export interface BetterAuthSubscription {
	id: string;
	plan: string;
	priceId: string;
	status:
		| "active"
		| "trialing"
		| "canceled"
		| "incomplete"
		| "past_due"
		| "unpaid";
	periodStart?: string;
	periodEnd?: string;
	cancelAtPeriodEnd: boolean;
	stripeSubscriptionId?: string;
	stripeCustomerId?: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

// Legacy interface for backward compatibility
export interface UserSubscription {
	id: string;
	plan: string;
	referenceId: string;
	stripeCustomerId?: string;
	stripeSubscriptionId?: string;
	status: string;
	periodStart?: string;
	periodEnd?: string;
	cancelAtPeriodEnd: boolean;
	seats?: number;
	trialStart?: string;
	trialEnd?: string;
	createdAt: string;
	updatedAt: string;
	userId: string;
}

export interface SubscriptionStatus {
	isActive: boolean;
	isPaying: boolean;
	isTrialing: boolean;
	isCanceled: boolean;
	planName?: string;
	periodEnd?: string;
	trialEnd?: string;
	cancelAtPeriodEnd: boolean;
}

export interface CreateCheckoutSessionInput {
	priceId: string;
	successUrl: string;
	cancelUrl: string;
	mode?: "subscription" | "payment";
}

export interface CheckoutSessionResponse {
	sessionId: string;
	url: string;
}

export interface BillingInterval {
	type: "monthly" | "yearly";
	label: string;
	discount?: string;
}

export interface PricingPageProps {
	showFreeOption?: boolean;
	highlightedPlanId?: string;
	onPlanSelect?: (priceId: string) => void;
}

export interface SubscriptionManagerProps {
	showBillingHistory?: boolean;
	allowPlanChanges?: boolean;
}

// Better Auth specific types
export interface BetterAuthUpgradeOptions {
	plan: string;
	subscriptionId?: string;
	successUrl: string;
	cancelUrl: string;
}

export interface BetterAuthCancelOptions {
	returnUrl?: string;
}

export interface UseSubscriptionReturn {
	// Data
	plans: FormattedPlan[] | undefined;
	currentSubscription: BetterAuthSubscription | null | undefined;
	subscriptionStatus: SubscriptionStatus | undefined;
	isPaying: boolean | undefined;

	// Loading states
	isLoadingPlans: boolean;
	isLoadingSubscription: boolean;
	isLoadingStatus: boolean;

	// Better Auth Mutations
	upgradeSubscription: {
		mutate: (options: BetterAuthUpgradeOptions) => Promise<void>;
		isLoading: boolean;
		error: string | null;
	};

	cancelSubscription: {
		mutate: (options?: BetterAuthCancelOptions) => Promise<void>;
		isLoading: boolean;
		error: string | null;
	};

	restoreSubscription: {
		mutate: () => Promise<void>;
		isLoading: boolean;
		error: string | null;
	};

	getBillingPortal: {
		mutate: (options: { returnUrl: string }) => Promise<void>;
		isLoading: boolean;
		error: string | null;
	};

	// Utilities
	formatPrice: (amount: number, currency: string) => string;
	getPlanByPriceId: (priceId: string) => FormattedPlan | undefined;
	getCurrentPlan: () => FormattedPlan | null;
	getFreePlan: () => FormattedPlan | null;
	refetchAll: () => void;
}

export type BillingPeriod = "monthly" | "yearly";
