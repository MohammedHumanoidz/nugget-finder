"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";

export function DebugPlans() {
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkPlans = async () => {
    setIsLoading(true);
    try {
      const result = await trpc.debug.checkPlans.query();
      setDebugData(result);
      console.log("🔍 Debug data:", result);
    } catch (error) {
      console.error("❌ Debug error:", error);
      setDebugData({ error: error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Debug Plans</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkPlans} disabled={isLoading}>
          {isLoading ? "Checking..." : "Check Plans"}
        </Button>

        {debugData && (
          <div className="space-y-4">
            {debugData.error ? (
              <div className="bg-red-50 p-4 rounded">
                <h3 className="font-bold text-red-800">Error:</h3>
                <pre className="text-sm text-red-700 overflow-auto">
                  {JSON.stringify(debugData.error, null, 2)}
                </pre>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="font-bold text-blue-800">Stripe Plans ({debugData.stripePlans?.length || 0}):</h3>
                  <pre className="text-sm text-blue-700 overflow-auto">
                    {JSON.stringify(debugData.stripePlans, null, 2)}
                  </pre>
                </div>

                <div className="bg-green-50 p-4 rounded">
                  <h3 className="font-bold text-green-800">Better Auth Plans ({debugData.betterAuthPlans?.length || 0}):</h3>
                  <pre className="text-sm text-green-700 overflow-auto">
                    {JSON.stringify(debugData.betterAuthPlans, null, 2)}
                  </pre>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-bold text-gray-800">Timestamp:</h3>
                  <p className="text-sm text-gray-700">{debugData.timestamp}</p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}