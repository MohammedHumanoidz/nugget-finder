"use client";

import { AlertCircle, Check, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBetterAuthSubscription } from "@/hooks/useBetterAuthSubscription";
import { authClient } from "@/lib/auth-client";
import type { BillingPeriod, PricingPageProps } from "@/types/subscription";
import { useNavigationLoader } from "@/hooks/use-navigation-loader";

export function PricingPage({
	highlightedPlanId,
	onPlanSelect,
}: PricingPageProps) {
	const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
	const router = useRouter();
	const searchParams = useSearchParams();

	// Get authentication status
	const { data: session } = authClient.useSession();
	const isAuthenticated = !!session?.user;
	const { startLoading } = useNavigationLoader();

	// Check if user was redirected due to view limit
	const reason = searchParams.get("reason");
	const isViewLimitRedirect =
		reason === "view_limit" || reason === "view_limit_non_auth";

	const {
		plans,
		currentSubscription,
		subscriptionStatus,
		isLoadingPlans,
		upgradeSubscription,
		formatPrice,
		getCurrentPlan,
	} = useBetterAuthSubscription();

	const handlePlanSelect = async (priceId: string) => {
		if (onPlanSelect) {
			onPlanSelect(priceId);
			return;
		}

		// Check if user is authenticated
		if (!isAuthenticated) {
			// Redirect to login page
			startLoading("Loading login...");
			router.push("/auth/sign-in");
			return;
		}

		// Find the plan by price ID to get the plan name
		const selectedPlan = plans?.find(
			(plan) =>
				plan.pricing.monthly?.priceId === priceId ||
				plan.pricing.yearly?.priceId === priceId,
		);

		if (!selectedPlan) {
			console.error("Plan not found for price ID:", priceId);
			return;
		}

		// Debug logging
		console.log("Attempting to upgrade subscription:", {
			priceId,
			selectedPlan: selectedPlan.name,
			productId: selectedPlan.productId,
			currentSubscriptionId: currentSubscription?.stripeSubscriptionId,
		});

		// Use Better Auth upgrade method
		const upgradeOptions: any = {
			plan: priceId, // Use price ID as plan identifier (Better Auth expects price ID)
			successUrl: `${window.location.origin}/subscription?upgrade=success`,
			cancelUrl: `${window.location.origin}/pricing?upgrade=canceled`,
		};

		// Only include subscriptionId if user has an existing subscription
		if (currentSubscription?.stripeSubscriptionId) {
			upgradeOptions.subscriptionId = currentSubscription.stripeSubscriptionId;
		}

		startLoading("Processing subscription...");
		await upgradeSubscription.mutate(upgradeOptions);
	};

	if (isLoadingPlans) {
		return (
			<div className="flex min-h-96 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!plans || plans.length === 0) {
		return (
			<div className="py-12 text-center">
				<p className="text-muted-foreground">
					No pricing plans available at the moment.
				</p>
			</div>
		);
	}

	const activePlans = plans.filter((plan) => plan.active);

	return (
		<div className="mx-auto max-w-7xl px-4 py-12">
			{/* Header */}
			<div className="mb-12 text-center">
				<h1 className="mb-4 font-bold text-4xl">Choose Your Plan</h1>
				<p className="mb-8 text-muted-foreground text-xl">
					Select the perfect plan for your needs. Upgrade or downgrade anytime.
				</p>

				{/* Billing Period Selector */}
				<Tabs
					value={billingPeriod}
					onValueChange={(value) => setBillingPeriod(value as BillingPeriod)}
				>
					<TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
						<TabsTrigger value="monthly">Monthly</TabsTrigger>
						<TabsTrigger value="yearly">
							Yearly
							<Badge variant="secondary" className="ml-2">
								Save 20%
							</Badge>
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{/* View Limit Notice */}
			{isViewLimitRedirect && (
				<div className="mx-auto mb-8 max-w-2xl">
					<Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
								<AlertCircle className="h-5 w-5" />
								{reason === "view_limit_non_auth"
									? "You've used your free nugget view!"
									: "View limit reached"}
							</CardTitle>
							<CardDescription className="text-amber-700 dark:text-amber-300">
								{reason === "view_limit_non_auth"
									? "Want to explore more startup opportunities? Create an account or upgrade to get unlimited access to our entire library of AI-generated ideas."
									: "You've reached your view limit for your current plan. Upgrade to continue exploring startup opportunities."}
							</CardDescription>
						</CardHeader>
						{reason === "view_limit_non_auth" && (
							<CardContent>
								<div className="flex flex-col gap-2 sm:flex-row">
									<Button asChild className="flex-1">
										<Link href="/auth/sign-in">Sign In to Continue</Link>
									</Button>
									<p className="py-2 text-center text-amber-600 text-sm dark:text-amber-400">
										or upgrade below for unlimited access
									</p>
								</div>
							</CardContent>
						)}
					</Card>
				</div>
			)}

			{/* Pricing Cards */}
			<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{activePlans.map((plan) => {
					const pricing =
						billingPeriod === "monthly"
							? plan.pricing.monthly
							: plan.pricing.yearly;
					const currentPlan = getCurrentPlan();
					const isCurrentPlan = currentPlan?.productId === plan.productId;
					const isHighlighted =
						highlightedPlanId === plan.productId || plan.popular;

					if (!pricing) return null;

					return (
						<Card
							key={plan.id}
							className={`relative ${isHighlighted ? "scale-105 shadow-lg ring-2 ring-primary" : ""}`}
						>
							{/* Popular Badge */}
							{plan.popular && (
								<div className="-top-3 -translate-x-1/2 absolute left-1/2 transform">
									<Badge className="bg-primary text-primary-foreground">
										<Star className="mr-1 h-3 w-3" />
										Most Popular
									</Badge>
								</div>
							)}

							<CardHeader>
								<div className="flex items-start justify-between">
									<div>
										<CardTitle className="text-2xl">{plan.name}</CardTitle>
									</div>
									{isCurrentPlan && (
										<Badge variant="secondary" className="cursor-not-allowed">
											Current Plan
										</Badge>
									)}
								</div>

								<div className="font-bold text-3xl">
									{formatPrice(pricing.amount, pricing.currency)}
									<span className="font-normal text-lg text-muted-foreground">
										/{billingPeriod === "monthly" ? "month" : "year"}
									</span>
								</div>

								{/* Show savings for yearly billing */}
								{billingPeriod === "yearly" && plan.pricing.monthly && (
									<div className="text-green-600 text-sm">
										Save{" "}
										{formatPrice(
											plan.pricing.monthly.amount * 12 - pricing.amount,
											pricing.currency,
										)}{" "}
										per year
									</div>
								)}

								{/* Trial Information */}
								{plan.trialDays && (
									<div className="text-muted-foreground text-sm">
										{plan.trialDays} day free trial
									</div>
								)}
							</CardHeader>

							<CardContent>
								<ul className="space-y-3">
									{plan.description.split("|").map((feature, index) => (
										<li key={index.toString()} className="flex items-start">
											<Check className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
											<span className="text-muted-foreground text-sm">
												{feature}
											</span>
										</li>
									))}
								</ul>

								{/* Limits Display */}
								{Object.keys(plan.limits).length > 0 && (
									<div className="mt-4 border-t pt-4">
										<h4 className="mb-2 font-medium">Limits:</h4>
										<ul className="space-y-1 text-muted-foreground text-sm">
											{Object.entries(plan.limits).map(([key, value]) => (
												<li key={key}>
													{key.replace(/_/g, " ")}:{" "}
													{value === -1 ? "Unlimited" : value.toLocaleString()}
												</li>
											))}
										</ul>
									</div>
								)}
							</CardContent>

							<CardFooter>
								{isCurrentPlan ? (
									<Button className="w-full" variant="outline" disabled>
										Current Plan
									</Button>
								) : subscriptionStatus?.isPaying &&
									!subscriptionStatus.isCanceled ? (
									<Button
										className="w-full"
										variant="default"
										onClick={() => handlePlanSelect(pricing.priceId)}
										disabled={upgradeSubscription.isLoading}
									>
										{upgradeSubscription.isLoading && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Switch to {plan.name}
									</Button>
								) : (
									<Button
										className="w-full"
										onClick={() => handlePlanSelect(pricing.priceId)}
										disabled={upgradeSubscription.isLoading}
									>
										{upgradeSubscription.isLoading && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										{!isAuthenticated
											? "Sign Up to Get Started"
											: plan.trialDays
												? `Start ${plan.trialDays}-Day Trial`
												: `Choose ${plan.name}`}
									</Button>
								)}
							</CardFooter>

							{/* Error Display */}
							{upgradeSubscription.error && (
								<div className="px-6 pb-4">
									<p className="text-red-600 text-sm">
										{upgradeSubscription.error}
									</p>
								</div>
							)}
						</Card>
					);
				})}
			</div>

			{/* FAQ or Additional Info */}
			<div className="mt-16 text-center">
				<p className="mb-4 text-muted-foreground">
					All plans include 24/7 support and can be canceled anytime.
				</p>
				<Link href="mailto:david@humanoidz.ai">
					<p className="text-muted-foreground text-sm">
						Questions?{" "}
						<Button variant="link" className="h-auto p-0">
							Contact our sales team
						</Button>
					</p>
				</Link>
			</div>
		</div>
	);
}
