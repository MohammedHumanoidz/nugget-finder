"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { authClient } from "@/lib/auth-client";
import { PageLoader } from "@/components/ui/page-loader";

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
				<PageLoader message="Loading subscription..." />
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background">
			<SubscriptionManager allowPlanChanges={true} />
		</div>
	);
}
