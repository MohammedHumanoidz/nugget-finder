import type { Stripe } from "stripe";

export interface StripePlan {
	id: string;
	productId: string;
	name: string;
	description: string;
	price: number;
	currency: string;
	interval: "month" | "year";
	intervalCount: number;
	metadata: {
		features?: string;
		limits?: string;
		trial_days?: string;
		popular?: string;
		group?: string;
	};
	trialPeriodDays?: number;
	active: boolean;
}

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

export interface UserSubscription {
	id: string;
	plan: string;
	referenceId: string;
	stripeCustomerId?: string;
	stripeSubscriptionId?: string;
	status: string;
	periodStart?: Date;
	periodEnd?: Date;
	cancelAtPeriodEnd: boolean;
	seats?: number;
	trialStart?: Date;
	trialEnd?: Date;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
}

export interface SubscriptionStatus {
	isActive: boolean;
	isPaying: boolean;
	isTrialing: boolean;
	isCanceled: boolean;
	planName?: string;
	periodEnd?: Date;
	trialEnd?: Date;
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

export interface SubscriptionLimits {
	[key: string]: number;
}

export type SubscriptionProcedures = {
	getPlans: {
		input: void;
		output: FormattedPlan[];
	};
	getCurrentSubscription: {
		input: void;
		output: UserSubscription | null;
	};
	createCheckoutSession: {
		input: CreateCheckoutSessionInput;
		output: CheckoutSessionResponse;
	};
	cancelSubscription: {
		input: void;
		output: { success: boolean; message: string };
	};
	restoreSubscription: {
		input: void;
		output: { success: boolean; message: string };
	};
	getSubscriptionStatus: {
		input: void;
		output: SubscriptionStatus;
	};
};

export interface WebhookEvent {
	id: string;
	type: string;
	data: {
		object: Stripe.Subscription | Stripe.Customer | Stripe.Invoice;
	};
}
