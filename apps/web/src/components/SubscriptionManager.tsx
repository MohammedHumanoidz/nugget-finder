"use client";

import {
	AlertTriangle,
	Calendar,
	CreditCard,
	ExternalLink,
	Loader2,
	RefreshCw,
	Settings,
	User,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBetterAuthSubscription } from "@/hooks/useBetterAuthSubscription";
import type { SubscriptionManagerProps } from "@/types/subscription";
import { PricingPage } from "./PricingPage";
import { SubscriptionNotifications } from "./SubscriptionNotifications";

export function SubscriptionManager({
	allowPlanChanges = true,
}: SubscriptionManagerProps) {
	const [activeTab, setActiveTab] = useState("overview");

	const {
		plans,
		currentSubscription,
		subscriptionStatus,
		isLoadingSubscription,
		isLoadingStatus,
		cancelSubscription,
		restoreSubscription,
		getBillingPortal,
		getCurrentPlan,
	} = useBetterAuthSubscription();

	console.log({ currentSubscription });

	const handleBillingPortal = async () => {
		await getBillingPortal.mutate({
			returnUrl: window.location.href,
		});
	};

	const getStatusBadgeVariant = (status?: string) => {
		switch (status) {
			case "active":
				return "default";
			case "trialing":
				return "secondary";
			case "canceled":
			case "incomplete":
				return "destructive";
			default:
				return "outline";
		}
	};

	const formatDate = (date?: string) => {
		if (!date) return "N/A";
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (isLoadingSubscription || isLoadingStatus) {
		return (
			<div className="flex min-h-96 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			{/* <SubscriptionNotifications /> */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Subscription Management</h1>
					<p className="text-muted-foreground">
						Manage your subscription and billing settings
					</p>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="overview" className="gap-2">
						<User className="h-4 w-4" />
						Overview
					</TabsTrigger>
					{allowPlanChanges && (
						<TabsTrigger value="plans" className="gap-2">
							<Settings className="h-4 w-4" />
							Change Plan
						</TabsTrigger>
					)}
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					{/* Current Subscription Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								Current Subscription
								{currentSubscription && (
									<Badge
										variant={getStatusBadgeVariant(currentSubscription.status)}
									>
										{currentSubscription.status}
									</Badge>
								)}
							</CardTitle>
							<CardDescription>
								Your current plan and billing information
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{(() => {
								const currentPlan = getCurrentPlan();

								if (!currentSubscription && !currentPlan) {
									return (
										<div className="py-8 text-center">
											<p className="mb-4 text-muted-foreground">
												Loading subscription information...
											</p>
										</div>
									);
								}

								// Show free plan info if no paid subscription
								if (!currentSubscription && currentPlan) {
									return (
										<div className="py-8 text-center">
											<div className="mb-4">
												<h3 className="mb-2 font-semibold text-xl">
													Free Plan
												</h3>
												<p className="text-muted-foreground">
													You're currently on the free plan
												</p>
											</div>

											{currentPlan.features.length > 0 && (
												<div className="mb-6">
													<h4 className="mb-3 font-medium">
														Included Features:
													</h4>
													<ul className="mx-auto max-w-md space-y-2 text-sm">
														{currentPlan.features.map((feature, index) => (
															<li
																key={index.toString()}
																className="flex items-center gap-2"
															>
																<div className="h-2 w-2 rounded-full bg-green-500" />
																{feature}
															</li>
														))}
													</ul>
												</div>
											)}

											<Button onClick={() => setActiveTab("plans")}>
												Upgrade to Premium
											</Button>
										</div>
									);
								}

								// Show paid subscription details
								return (
									<>
										{/* Plan Details */}
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<h4 className="mb-2 font-medium">Plan</h4>
												<p className="font-bold text-2xl">
													{getCurrentPlan()?.name || currentSubscription?.plan}
												</p>
											</div>
											<div>
												<h4 className="mb-2 font-medium">Status</h4>
												<div className="flex items-center gap-2">
													<Badge
														variant={getStatusBadgeVariant(
															currentSubscription?.status,
														)}
													>
														{currentSubscription?.status}
													</Badge>
													{subscriptionStatus?.isTrialing && (
														<span className="text-muted-foreground text-sm">
															Trial ends{" "}
															{formatDate(subscriptionStatus.trialEnd)}
														</span>
													)}
												</div>
											</div>
										</div>

										{/* Billing Period */}
										{currentSubscription?.periodStart &&
											currentSubscription?.periodEnd && (
												<div>
													<h4 className="mb-2 font-medium">Billing Period</h4>
													<div className="flex items-center gap-2">
														<Calendar className="h-4 w-4 text-muted-foreground" />
														<span>
															{formatDate(currentSubscription?.periodStart)} -{" "}
															{formatDate(currentSubscription?.periodEnd)}
														</span>
													</div>
												</div>
											)}

										{/* Cancellation Warning */}
										{subscriptionStatus?.cancelAtPeriodEnd && (
											<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
												<div className="flex items-start gap-3">
													<AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
													<div>
														<h4 className="font-medium text-yellow-800">
															Subscription Ending
														</h4>
														<p className="mb-3 text-sm text-yellow-700">
															Your subscription will end on{" "}
															{formatDate(subscriptionStatus.periodEnd)}. You'll
															lose access to premium features after this date.
														</p>
														<Button
															size="sm"
															onClick={async () =>
																await restoreSubscription.mutate()
															}
															disabled={restoreSubscription.isLoading}
														>
															{restoreSubscription.isLoading && (
																<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															)}
															Restore Subscription
														</Button>
													</div>
												</div>
											</div>
										)}

										{/* Action Buttons */}
										<div className="flex gap-3 pt-4">
											<Button
												variant="outline"
												onClick={handleBillingPortal}
												disabled={getBillingPortal.isLoading}
												className="gap-2"
											>
												{getBillingPortal.isLoading && (
													<Loader2 className="h-4 w-4 animate-spin" />
												)}
												<ExternalLink className="h-4 w-4" />
												Manage Billing
											</Button>

											{subscriptionStatus?.isActive &&
												!subscriptionStatus.cancelAtPeriodEnd && (
													<Button
														variant="destructive"
														onClick={async () =>
															await cancelSubscription.mutate()
														}
														disabled={cancelSubscription.isLoading}
													>
														{cancelSubscription.isLoading && (
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														)}
														Cancel Subscription
													</Button>
												)}
										</div>

										{/* Error Messages */}
										{(cancelSubscription.error ||
											restoreSubscription.error ||
											getBillingPortal.error) && (
											<div className="rounded-lg border border-red-200 bg-red-50 p-4">
												<p className="text-red-700 text-sm">
													{cancelSubscription.error ||
														restoreSubscription.error ||
														getBillingPortal.error}
												</p>
											</div>
										)}
									</>
								);
							})()}
						</CardContent>
					</Card>

					{/* Usage Limits Card */}
					{subscriptionStatus?.isPaying && plans && (
						<Card>
							<CardHeader>
								<CardTitle>Plan Features & Limits</CardTitle>
								<CardDescription>
									Your current plan includes these features
								</CardDescription>
							</CardHeader>
							<CardContent>
								{(() => {
									const currentPlan = plans.find(
										(plan) =>
											plan.pricing.monthly?.priceId ===
												currentSubscription?.priceId ||
											plan.pricing.yearly?.priceId ===
												currentSubscription?.priceId,
									);
									console.log({ currentSubscription, plans, currentPlan });
									if (!currentPlan)
										return (
											<p className="text-muted-foreground">
												Plan details not available
											</p>
										);

									return (
										<div className="space-y-4">
											{/* Features */}
											<div>
												<h4 className="mb-2 font-medium">Features</h4>
												<ul className="space-y-1">
													{currentPlan.description
														.split("|")
														.map((feature, index) => (
															<li
																key={index.toString()}
																className="flex items-center gap-2 text-sm"
															>
																<div className="h-1.5 w-1.5 rounded-full bg-green-500" />
																{feature}
															</li>
														))}
												</ul>
											</div>

											{/* Limits */}
											{Object.keys(currentPlan.limits).length > 0 && (
												<div>
													<h4 className="mb-2 font-medium">Limits</h4>
													<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
														{Object.entries(currentPlan.limits).map(
															([key, value]) => (
																<div
																	key={key}
																	className="rounded-lg bg-muted p-3"
																>
																	<p className="font-medium text-sm">
																		{key.replace(/_/g, " ")}
																	</p>
																	<p className="font-bold text-2xl">
																		{value === -1
																			? "∞"
																			: value.toLocaleString()}
																	</p>
																</div>
															),
														)}
													</div>
												</div>
											)}
										</div>
									);
								})()}
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Change Plan Tab */}
				{allowPlanChanges && (
					<TabsContent value="plans">
						<PricingPage
							showFreeOption={false}
							highlightedPlanId={getCurrentPlan()?.productId}
						/>
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
