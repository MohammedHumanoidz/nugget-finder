"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Calendar, 
  CreditCard, 
  ExternalLink, 
  Loader2, 
  RefreshCw,
  Settings,
  User
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { PricingPage } from "./PricingPage";
import type { SubscriptionManagerProps } from "@/types/subscription";

export function SubscriptionManager({ 
  showBillingHistory = true,
  allowPlanChanges = true 
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
    formatPrice,
    refetchAll,
  } = useSubscription();

  const handleBillingPortal = () => {
    getBillingPortal.mutate({
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

  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoadingSubscription || isLoadingStatus) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage your subscription and billing settings</p>
        </div>
        <Button 
          variant="outline" 
          onClick={refetchAll}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <User className="w-4 h-4" />
            Overview
          </TabsTrigger>
          {allowPlanChanges && (
            <TabsTrigger value="plans" className="gap-2">
              <Settings className="w-4 h-4" />
              Change Plan
            </TabsTrigger>
          )}
          {showBillingHistory && (
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
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
                  <Badge variant={getStatusBadgeVariant(currentSubscription.status)}>
                    {currentSubscription.status}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Your current plan and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!currentSubscription ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have an active subscription</p>
                  <Button onClick={() => setActiveTab("plans")}>
                    View Available Plans
                  </Button>
                </div>
              ) : (
                <>
                  {/* Plan Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Plan</h4>
                      <p className="text-2xl font-bold">{currentSubscription.plan}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(currentSubscription.status)}>
                          {currentSubscription.status}
                        </Badge>
                        {subscriptionStatus?.isTrialing && (
                          <span className="text-sm text-muted-foreground">
                            Trial ends {formatDate(subscriptionStatus.trialEnd)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Billing Period */}
                  {currentSubscription.periodStart && currentSubscription.periodEnd && (
                    <div>
                      <h4 className="font-medium mb-2">Billing Period</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {formatDate(currentSubscription.periodStart)} - {formatDate(currentSubscription.periodEnd)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Warning */}
                  {subscriptionStatus?.cancelAtPeriodEnd && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Subscription Ending</h4>
                          <p className="text-sm text-yellow-700 mb-3">
                            Your subscription will end on {formatDate(subscriptionStatus.periodEnd)}. 
                            You'll lose access to premium features after this date.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => restoreSubscription.mutate()}
                            disabled={restoreSubscription.isLoading}
                          >
                            {restoreSubscription.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
                      {getBillingPortal.isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <ExternalLink className="w-4 h-4" />
                      Manage Billing
                    </Button>
                    
                    {subscriptionStatus?.isActive && !subscriptionStatus.cancelAtPeriodEnd && (
                      <Button
                        variant="destructive"
                        onClick={() => cancelSubscription.mutate()}
                        disabled={cancelSubscription.isLoading}
                      >
                        {cancelSubscription.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Cancel Subscription
                      </Button>
                    )}
                  </div>

                  {/* Error Messages */}
                  {(cancelSubscription.error || restoreSubscription.error || getBillingPortal.error) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700">
                        {cancelSubscription.error || restoreSubscription.error || getBillingPortal.error}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Usage Limits Card */}
          {subscriptionStatus?.isPaying && plans && (
            <Card>
              <CardHeader>
                <CardTitle>Plan Features & Limits</CardTitle>
                <CardDescription>Your current plan includes these features</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const currentPlan = plans.find(plan => plan.productId === currentSubscription?.plan);
                  if (!currentPlan) return <p className="text-muted-foreground">Plan details not available</p>;

                  return (
                    <div className="space-y-4">
                      {/* Features */}
                      <div>
                        <h4 className="font-medium mb-2">Features</h4>
                        <ul className="space-y-1">
                          {currentPlan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Limits */}
                      {Object.keys(currentPlan.limits).length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Limits</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(currentPlan.limits).map(([key, value]) => (
                              <div key={key} className="bg-muted rounded-lg p-3">
                                <p className="text-sm font-medium">{key.replace(/_/g, ' ')}</p>
                                <p className="text-2xl font-bold">
                                  {value === -1 ? '∞' : value.toLocaleString()}
                                </p>
                              </div>
                            ))}
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
              highlightedPlanId={currentSubscription?.plan}
            />
          </TabsContent>
        )}

        {/* Billing Tab */}
        {showBillingHistory && (
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing Management</CardTitle>
                <CardDescription>
                  Manage your payment methods, view invoices, and update billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Access your complete billing history and manage payment methods through Stripe's secure portal.
                  </p>
                  <Button
                    onClick={handleBillingPortal}
                    disabled={getBillingPortal.isLoading || !currentSubscription?.stripeCustomerId}
                    className="gap-2"
                  >
                    {getBillingPortal.isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <ExternalLink className="w-4 h-4" />
                    Open Billing Portal
                  </Button>
                  
                  {getBillingPortal.error && (
                    <p className="text-sm text-red-600 mt-2">{getBillingPortal.error}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}