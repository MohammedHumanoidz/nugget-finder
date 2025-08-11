"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import IdeaDetailsView from "@/components/IdeaDetailsView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNonAuthViewTracker } from "@/hooks/useNonAuthViewTracker";
import { trpc } from "@/utils/trpc";

interface NonAuthIdeaWrapperProps {
	ideaId: string;
}

// Helper function to ensure all required arrays exist (same as server-side)
function transformIdeaData(idea: any) {
	return {
		...idea,
		tags: idea.tags || [],
		whatToBuild: idea.whatToBuild
			? {
					...idea.whatToBuild,
					coreFeaturesSummary: idea.whatToBuild.coreFeaturesSummary || [],
					userInterfaces: idea.whatToBuild.userInterfaces || [],
					keyIntegrations: idea.whatToBuild.keyIntegrations || [],
				}
			: {
					id: "",
					platformDescription: "",
					coreFeaturesSummary: [],
					userInterfaces: [],
					keyIntegrations: [],
					pricingStrategyBuildRecommendation: "",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
		marketCompetition: idea.marketCompetition
			? {
					...idea.marketCompetition,
					directCompetitors: idea.marketCompetition.directCompetitors || [],
					indirectCompetitors: idea.marketCompetition.indirectCompetitors || [],
					competitorFailurePoints:
						idea.marketCompetition.competitorFailurePoints || [],
					unfairAdvantage: idea.marketCompetition.unfairAdvantage || [],
					moat: idea.marketCompetition.moat || [],
				}
			: {
					id: "",
					marketConcentrationLevel: "MEDIUM" as const,
					marketConcentrationJustification: "",
					directCompetitors: [],
					indirectCompetitors: [],
					competitorFailurePoints: [],
					unfairAdvantage: [],
					moat: [],
					competitivePositioningScore: 0,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
		monetizationStrategy: idea.monetizationStrategy
			? {
					...idea.monetizationStrategy,
					revenueStreams: idea.monetizationStrategy.revenueStreams || [],
					financialProjections:
						idea.monetizationStrategy.financialProjections || [],
				}
			: {
					id: "",
					primaryModel: "",
					pricingStrategy: "",
					businessScore: 0,
					confidence: 0,
					revenueModelValidation: "",
					pricingSensitivity: "",
					revenueStreams: [],
					keyMetrics: null,
					financialProjections: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
		strategicPositioning: idea.strategicPositioning
			? {
					...idea.strategicPositioning,
					keyDifferentiators:
						idea.strategicPositioning.keyDifferentiators || [],
				}
			: {
					id: "",
					name: "",
					targetSegment: "",
					valueProposition: "",
					keyDifferentiators: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
		executionPlan: idea.executionPlan
			? {
					...idea.executionPlan,
					keyMilestones: idea.executionPlan.keyMilestones || [],
					teamRequirements: idea.executionPlan.teamRequirements || [],
					riskFactors: idea.executionPlan.riskFactors || [],
				}
			: {
					id: "",
					mvpDescription: "",
					keyMilestones: [],
					resourceRequirements: "",
					teamRequirements: [],
					riskFactors: [],
					technicalRoadmap: "",
					goToMarketStrategy: "",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
		tractionSignals: idea.tractionSignals
			? {
					...idea.tractionSignals,
					regulatoryChanges: idea.tractionSignals.regulatoryChanges || [],
					expertEndorsements: idea.tractionSignals.expertEndorsements || [],
					earlyAdopterSignals: idea.tractionSignals.earlyAdopterSignals || [],
				}
			: {
					id: "",
					waitlistCount: null,
					socialMentions: null,
					searchVolume: null,
					competitorFunding: null,
					patentActivity: null,
					regulatoryChanges: [],
					mediaAttention: null,
					expertEndorsements: [],
					earlyAdopterSignals: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
		frameworkFit: idea.frameworkFit
			? {
					...idea.frameworkFit,
					jobsToBeDone: idea.frameworkFit.jobsToBeDone || [],
				}
			: {
					id: "",
					jobsToBeDone: [],
					blueOceanFactors: {},
					leanCanvasScore: 0,
					designThinkingStage: "",
					innovationDilemmaFit: "",
					crossingChasmStage: "",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
	};
}

export default function NonAuthIdeaWrapper({
	ideaId,
}: NonAuthIdeaWrapperProps) {
	const router = useRouter();
	const {
		isLoaded,
		hasViewedIdea,
		canViewNewIdea,
		getRemainingViews,
		trackView,
	} = useNonAuthViewTracker();

	const [hasCheckedAccess, setHasCheckedAccess] = useState(false);
	const [canAccess, setCanAccess] = useState(false);

	// Fetch the idea data
	const {
		data: ideaData,
		isLoading,
		error,
	} = useQuery({
		...trpc.agents.getIdeaById.queryOptions({ id: ideaId }),
		enabled: canAccess, // Only fetch if user can access
	});

	// Check access when localStorage is loaded
	useEffect(() => {
		if (!isLoaded) return;

		const alreadyViewed = hasViewedIdea(ideaId);
		const canViewNew = canViewNewIdea();

		if (alreadyViewed || canViewNew) {
			// User can access this idea
			setCanAccess(true);

			// Track the view if it's a new idea
			if (!alreadyViewed) {
				trackView(ideaId);
			}
		} else {
			// User has exceeded their limit, redirect to pricing
			router.push("/pricing?reason=view_limit_non_auth");
			return;
		}

		setHasCheckedAccess(true);
	}, [isLoaded, ideaId, hasViewedIdea, canViewNewIdea, trackView, router]);

	// Show loading while checking access or fetching data
	if (!hasCheckedAccess || (canAccess && isLoading)) {
		return (
			<div
				className="flex items-center justify-center"
				style={{ minHeight: "calc(100vh - 80px)" }}
			>
				<div className="text-center">
					<Loader2 className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
					<p className="mt-4 text-muted-foreground">
						Loading nugget details...
					</p>
				</div>
			</div>
		);
	}

	// Show error state
	if (error || !ideaData) {
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

	// Transform the data and render the idea details
	// For non-authenticated users, add default user-specific flags
	const transformedIdea = transformIdeaData({
		...ideaData,
		isSaved: false,
		isClaimed: false,
		isClaimedByOther: false,
	});

	return (
		<div>
			{/* Free tier notice */}
			{getRemainingViews() === 0 && (
				<Card className="mb-4 border-amber-200 bg-amber-50 lg:mx-54 dark:border-amber-800 dark:bg-amber-950/20">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
							⚡ You've used your free nugget view!
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mb-4 text-amber-700 dark:text-amber-300">
							Want to explore more startup opportunities? Upgrade to get
							unlimited access to our entire library of AI-generated ideas.
						</p>
						<div className="flex gap-2">
							<Button asChild>
								<Link href="/pricing">
									Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/auth/sign-in">Sign In</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<IdeaDetailsView idea={transformedIdea} />
		</div>
	);
}
