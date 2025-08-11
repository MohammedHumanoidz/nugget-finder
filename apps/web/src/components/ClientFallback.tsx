"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import AnimatedHowItWorks from "@/components/AnimatedHowItWorks";
import IdeaScoreBreakdown from "@/components/IdeaScoreBreakdown";
import NuggetLink from "@/components/NuggetLink";
import StatsCards from "@/components/StatsCards";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useNonAuthViewTracker } from "@/hooks/useNonAuthViewTracker";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

interface ClientFallbackProps {
	type: "home" | "nugget";
	nuggetId?: string;
}

export default function ClientFallback({
	type,
	nuggetId,
}: ClientFallbackProps) {
	const { data: session } = authClient.useSession();
	const isAuthenticated = !!session?.user;

	const { isLoaded, hasViewedIdea, canViewNewIdea } = useNonAuthViewTracker();

	const {
		data: ideasResponse,
		isLoading: homeLoading,
		error: homeError,
	} = useQuery({
		...trpc.agents.getDailyIdeas.queryOptions({
			limit: 50,
			offset: 0,
		}),
		enabled: type === "home",
	});

	// For nugget detail, check access for non-authenticated users
	const canAccessNugget =
		isAuthenticated ||
		!isLoaded ||
		(nuggetId && (hasViewedIdea(nuggetId) || canViewNewIdea()));

	const {
		data: nuggetData,
		isLoading: nuggetLoading,
		error: nuggetError,
	} = useQuery({
		...trpc.agents.getIdeaById.queryOptions({ id: nuggetId! }),
		enabled: Boolean(type === "nugget" && nuggetId && canAccessNugget),
	});

	if (type === "home") {
		const dailyIdeas = (ideasResponse as any)?.ideas || [];
		const featuredNugget = dailyIdeas[0];
		const otherNuggets = dailyIdeas.slice(1, 7);

		// Calculate market intelligence metrics
		const aiTrendsTracked = dailyIdeas.reduce((sum: number, idea: any) => {
			return sum + (idea.problemGaps?.problems?.length || 0);
		}, 0);

		const signalsAnalyzed = dailyIdeas.reduce((sum: number, idea: any) => {
			const whyNowData = idea.whyNow?.supportingData?.length || 0;
			const revenueStreams =
				idea.monetizationStrategy?.revenueStreams?.length || 0;
			const financialProjections =
				idea.monetizationStrategy?.financialProjections?.length || 0;
			return sum + whyNowData + revenueStreams + financialProjections;
		}, 0);

		const marketOpportunities = dailyIdeas.length;
		const activeUsers = 0;

		if (homeLoading) {
			return (
				<div className="flex min-h-screen items-center justify-center bg-background">
					<div className="text-center">
						<div className="mb-4 text-4xl">⛏️</div>
						<div className="font-semibold text-xl">
							Loading NuggetFinder.io...
						</div>
						<div className="text-muted-foreground">
							Mining fresh startup opportunities...
						</div>
					</div>
				</div>
			);
		}

		if (homeError) {
			return (
				<div className="flex min-h-screen items-center justify-center bg-background">
					<div className="text-center">
						<div className="mb-4 text-4xl">⚠️</div>
						<div className="font-semibold text-xl">Failed to load nuggets</div>
						<div className="text-muted-foreground">
							Please try refreshing the page
						</div>
					</div>
				</div>
			);
		}

		return (
			<>
				{/* Hero Section - Nuggets Mined Today */}
				<section className="mx-auto max-w-7xl px-4 py-12">
					<div className="mb-12 text-center">
						<h1 className="mb-4 font-bold text-4xl">
							🆕 NUGGETS MINED TODAY 🌟
						</h1>
						<div className="mx-auto h-1 w-24 bg-primary" />
					</div>

					{featuredNugget && (
						<Card className="mb-8">
							<CardHeader>
								<CardTitle className="text-2xl">
									{featuredNugget.title}
								</CardTitle>
								<div className="mt-4 flex flex-wrap gap-2">
									<span className="rounded-full border border-green-600 bg-green-600/10 px-3 py-1 font-medium text-foreground text-sm">
										✅ Unfair Advantage
									</span>
									<span className="rounded-full border border-purple-600 bg-purple-600/10 px-3 py-1 font-medium text-foreground text-sm">
										✅ Product Ready
									</span>
								</div>
							</CardHeader>

							<CardContent className="space-y-6">
								<p className="text-lg text-muted-foreground leading-relaxed">
									{featuredNugget.description}
								</p>

								<StatsCards idea={featuredNugget} />
								<IdeaScoreBreakdown idea={featuredNugget} />
							</CardContent>

							<CardFooter>
								<NuggetLink ideaId={featuredNugget.id} className="w-full">
									<Button className="w-full">Read Full Analysis →</Button>
								</NuggetLink>
							</CardFooter>
						</Card>
					)}
				</section>

				{/* Rest of the sections would go here - Market Intelligence, etc. */}
				<div className="py-8 text-center">
					<p className="text-muted-foreground">
						Client-side fallback mode - Server data fetch failed
					</p>
				</div>

				<AnimatedHowItWorks />
			</>
		);
	}

	// Nugget detail fallback
	if (type === "nugget") {
		// Check if non-authenticated user has exceeded their view limit
		if (
			!isAuthenticated &&
			isLoaded &&
			nuggetId &&
			!hasViewedIdea(nuggetId) &&
			!canViewNewIdea()
		) {
			// Redirect to pricing page for non-authenticated users who exceeded limit
			if (typeof window !== "undefined") {
				window.location.href = "/pricing?reason=view_limit_non_auth";
				return null;
			}
		}

		if (nuggetLoading || (!isAuthenticated && !isLoaded)) {
			return (
				<div
					className="flex items-center justify-center"
					style={{ minHeight: "calc(100vh - 80px)" }}
				>
					<div className="text-center">
						<div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
						<p className="mt-4 text-muted-foreground">
							Loading nugget details...
						</p>
					</div>
				</div>
			);
		}

		if (nuggetError || !nuggetData) {
			// Check if error is due to view limit exceeded
			const errorMessage = (nuggetError as any)?.message || "";

			if (errorMessage.includes("VIEW_LIMIT_EXCEEDED")) {
				// Redirect to pricing page
				if (typeof window !== "undefined") {
					window.location.href = "/pricing?reason=view_limit";
					return null;
				}
			}

			return (
				<div
					className="flex items-center justify-center"
					style={{ minHeight: "calc(100vh - 80px)" }}
				>
					<div className="text-center">
						<h1 className="mb-4 font-bold text-4xl">Nugget Not Found</h1>
						<p className="mb-8 text-lg text-muted-foreground">
							The nugget you're looking for doesn't exist or has been removed.
						</p>
						<Link
							href="/"
							className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
						>
							Back to Home
						</Link>
					</div>
				</div>
			);
		}

		return (
			<div>
				<p className="py-4 text-center text-muted-foreground">
					Client-side fallback mode - Server data fetch failed
				</p>
				{/* IdeaDetailsView would go here */}
			</div>
		);
	}

	return null;
}
