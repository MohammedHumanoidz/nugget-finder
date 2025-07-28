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

export interface UseSubscriptionReturn {
  // Data
  plans: FormattedPlan[] | undefined;
  currentSubscription: UserSubscription | null | undefined;
  subscriptionStatus: SubscriptionStatus | undefined;
  isPaying: boolean | undefined;
  
  // Loading states
  isLoadingPlans: boolean;
  isLoadingSubscription: boolean;
  isLoadingStatus: boolean;
  
  // Mutations
  createCheckout: {
    mutate: (input: CreateCheckoutSessionInput) => void;
    isLoading: boolean;
    error: string | null;
  };
  
  cancelSubscription: {
    mutate: () => void;
    isLoading: boolean;
    error: string | null;
  };
  
  restoreSubscription: {
    mutate: () => void;
    isLoading: boolean;
    error: string | null;
  };
  
  getBillingPortal: {
    mutate: (input: { returnUrl: string }) => void;
    isLoading: boolean;
    error: string | null;
  };
  
  // Utilities
  formatPrice: (amount: number, currency: string) => string;
  getPlanByPriceId: (priceId: string) => FormattedPlan | undefined;
  refetchAll: () => void;
}

export type BillingPeriod = "monthly" | "yearly";