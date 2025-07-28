"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { authClient } from "@/lib/auth-client";
import type { PricingPageProps, BillingPeriod } from "@/types/subscription";

export function PricingPage({ 
  highlightedPlanId,
  onPlanSelect 
}: PricingPageProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const router = useRouter();
  
  // Get authentication status
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;
  
  const {
    plans,
    currentSubscription,
    subscriptionStatus,
    isLoadingPlans,
    createCheckout,
    formatPrice,
  } = useSubscription();

  const handlePlanSelect = (priceId: string) => {
    if (onPlanSelect) {
      onPlanSelect(priceId);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page
      router.push("/auth/sign-in");
      return;
    }

    // Default checkout flow
    createCheckout.mutate({
      priceId,
      successUrl: `${window.location.origin}/dashboard?subscription=success`,
      cancelUrl: `${window.location.origin}/pricing?subscription=canceled`,
      mode: "subscription",
    });
  };

  if (isLoadingPlans) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No pricing plans available at the moment.</p>
      </div>
    );
  }

  const activePlans = plans.filter(plan => plan.active);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Select the perfect plan for your needs. Upgrade or downgrade anytime.
        </p>

        {/* Billing Period Selector */}
        <Tabs value={billingPeriod} onValueChange={(value) => setBillingPeriod(value as BillingPeriod)}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly
              <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activePlans.map((plan) => {
          const pricing = billingPeriod === "monthly" ? plan.pricing.monthly : plan.pricing.yearly;
          const isCurrentPlan = currentSubscription?.plan === plan.productId;
          const isHighlighted = highlightedPlanId === plan.id || plan.popular;
          
          if (!pricing) return null;

          return (
            <Card 
              key={plan.id} 
              className={`relative ${isHighlighted ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  {isCurrentPlan && (
                    <Badge variant="secondary">Current Plan</Badge>
                  )}
                </div>
                
                <div className="text-3xl font-bold">
                  {formatPrice(pricing.amount, pricing.currency)}
                  <span className="text-lg font-normal text-muted-foreground">
                    /{billingPeriod === "monthly" ? "month" : "year"}
                  </span>
                </div>

                {/* Show savings for yearly billing */}
                {billingPeriod === "yearly" && plan.pricing.monthly && (
                  <div className="text-sm text-green-600">
                    Save {formatPrice(
                      (plan.pricing.monthly.amount * 12) - pricing.amount, 
                      pricing.currency
                    )} per year
                  </div>
                )}

                {/* Trial Information */}
                {plan.trialDays && (
                  <div className="text-sm text-muted-foreground">
                    {plan.trialDays} day free trial
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                    {plan.description.split("|").map((feature, index) => (
                      <li key={index.toString()} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                </ul>

                {/* Limits Display */}
                {Object.keys(plan.limits).length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Limits:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {Object.entries(plan.limits).map(([key, value]) => (
                        <li key={key}>
                          {key.replace(/_/g, ' ')}: {value === -1 ? 'Unlimited' : value.toLocaleString()}
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
                ) : subscriptionStatus?.isPaying && !subscriptionStatus.isCanceled ? (
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={() => handlePlanSelect(pricing.priceId)}
                    disabled={createCheckout.isLoading}
                  >
                    {createCheckout.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Switch to {plan.name}
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handlePlanSelect(pricing.priceId)}
                    disabled={createCheckout.isLoading}
                  >
                    {createCheckout.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {!isAuthenticated 
                      ? "Sign Up to Get Started"
                      : plan.trialDays 
                        ? `Start ${plan.trialDays}-Day Trial` 
                        : `Choose ${plan.name}`
                    }
                  </Button>
                )}
              </CardFooter>

              {/* Error Display */}
              {createCheckout.error && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-red-600">{createCheckout.error}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-16 text-center">
        <p className="text-muted-foreground mb-4">
          All plans include 24/7 support and can be canceled anytime.
        </p>
        <p className="text-sm text-muted-foreground">
          Questions? <Button variant="link" className="p-0 h-auto">Contact our sales team</Button>
        </p>
      </div>
    </div>
  );
}