import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import BrowseServerClient from "@/components/BrowseServerClient";
import { serverTRPC } from "@/lib/server-trpc";
import { PageLoader } from "@/components/ui/page-loader";

async function getInitialData() {
	try {
		// Fetch initial data in parallel
		const [initialIdeas, initialLimits] = await Promise.all([
			serverTRPC.getIdeas({ limit: 12, offset: 0 }),
			serverTRPC
				.getUserLimits()
				.catch(() => null), // Don't fail if user not authenticated
		]);

		return {
			initialIdeas: initialIdeas || [],
			initialLimits,
		};
	} catch (error) {
		console.error("Error fetching initial browse data:", error);
		return {
			initialIdeas: [],
			initialLimits: null,
		};
	}
}

export const metadata: Metadata = {
	title: "Discover AI Startup Ideas",
	description:
		"Explore validated AI startup ideas with market research, competitor insights, and practical next steps.",
	alternates: { canonical: "/browse" },
};

export default async function BrowsePage() {
	const { initialIdeas, initialLimits } = await getInitialData();

	return (
		<div className="min-h-screen bg-background">
			<Suspense
				fallback={<PageLoader message="Loading ideas..." />}
			>
				<BrowseServerClient
					initialIdeas={initialIdeas}
					initialLimits={initialLimits}
				/>
			</Suspense>
		</div>
	);
}
