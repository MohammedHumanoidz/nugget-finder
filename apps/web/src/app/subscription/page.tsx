"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import Navbar from "@/components/Navbar";

export default function SubscriptionPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/auth/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">        
        <div className="flex justify-center items-center min-h-96">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SubscriptionManager 
        allowPlanChanges={true}
      />
    </div>
  );
}