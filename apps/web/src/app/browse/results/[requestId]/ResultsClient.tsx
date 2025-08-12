"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
	ExternalLink,
	Lightbulb,
	Target,
	TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AnimatedSearchLoader from "@/components/AnimatedSearchLoader";
import NuggetsCards from "@/components/nuggetsCards";
import type { FeaturedNugget } from "@/components/nuggetsCards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/utils/trpc";

interface ResultsClientProps {
	requestId: string;
}

export default function ResultsClient({ requestId }: ResultsClientProps) {
	const router = useRouter();
	const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);

	// Poll for generation status
	const { data: generationStatus, error } = useQuery({
		...trpc.ideas.getGenerationStatus.queryOptions({ requestId }),
		refetchInterval: (query) => {
			const data = query.state.data;
			if (!data || data.status === "RUNNING" || data.status === "PENDING") {
				return 1000; // Poll every 1 second during generation
			}
			if (data.status === "COMPLETED" || data.status === "FAILED") {
				return false; // Stop polling when done
			}
			return 2000; // Default fallback
		},
		refetchIntervalInBackground: true,
		retry: 3,
	});

	// Fetch generated ideas when generation is complete
	const { data: ideas } = useQuery({
		...trpc.ideas.getGeneratedIdeas.queryOptions({ limit: 10 }),
		enabled:
			generationStatus?.status === "COMPLETED" && generatedIdeas.length === 0,
	});

	useEffect(() => {
		if (
			generationStatus?.status === "COMPLETED" &&
			ideas &&
			generatedIdeas.length === 0
		) {
			// Filter ideas that were just generated based on timing
			const recentIdeas = ideas.filter((idea: any) => {
				const ideaTime = new Date(idea.createdAt).getTime();
				const requestTime = new Date(generationStatus.createdAt).getTime();
				return ideaTime >= requestTime - 60000; // Within 1 minute of request
			});
			setGeneratedIdeas(recentIdeas.slice(0, 3)); // Show only the latest 3
		}
	}, [generationStatus, ideas, generatedIdeas.length]);

	useEffect(() => {
		if (generationStatus?.status === "FAILED") {
			toast.error(generationStatus.errorMessage || "Failed to generate ideas");
		}
	}, [generationStatus?.status, generationStatus?.errorMessage]);

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center text-white">
				<div className="text-center">
					<h1 className="mb-4 font-bold text-2xl">Error Loading Results</h1>
					<p className="mb-6 text-slate-400">
						Unable to load generation status
					</p>
					<Button onClick={() => router.push("/")}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Home
					</Button>
				</div>
			</div>
		);
	}

	if (!generationStatus) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	const isGenerating =
		generationStatus.status === "PENDING" ||
		generationStatus.status === "RUNNING";
	const isComplete = generationStatus.status === "COMPLETED";
	const isFailed = generationStatus.status === "FAILED";

	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-6xl px-4 py-8">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<Button
						variant="ghost"
						onClick={() => router.push("/")}
						className="text-slate-400 hover:text-white"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Home
					</Button>
				</div>

				{/* Generation Status */}
				{isGenerating && (
					<div className="flex min-h-[60vh] flex-col items-center justify-center">
						<AnimatedSearchLoader
							searchQuery="Generating your ideas..."
							progressMessage={generationStatus.progressMessage ?? undefined}
							imageState={generationStatus.imageState ?? undefined}
							currentStep={generationStatus.currentStep ?? undefined}
						/>
						<div className="mt-8 max-w-md text-center">
							<h2 className="mb-4 font-bold text-2xl">
								{generationStatus.currentStep}
							</h2>
							<p className="text-lg text-slate-400">
								{generationStatus.progressMessage}
							</p>
						</div>
					</div>
				)}

				{/* Error State */}
				{isFailed && (
					<div className="flex min-h-[60vh] flex-col items-center justify-center">
						<div className="max-w-md text-center">
							<h2 className="mb-4 font-bold text-2xl text-red-400">
								Generation Failed
							</h2>
							<p className="mb-6 text-lg text-slate-400">
								{generationStatus.errorMessage ||
									"Something went wrong while generating your ideas."}
							</p>
							<Button onClick={() => router.push("/")}>Try Again</Button>
						</div>
					</div>
				)}

				{/* Results */}
				{isComplete && generatedIdeas.length > 0 && (
					<div>
						<div className="mb-12 text-center">
							<h1 className="mb-4 font-bold text-4xl">
								🎉 Your Business Ideas Are Ready!
							</h1>
							<p className="text-slate-400 text-xl">
								Here are {generatedIdeas.length} high-potential opportunities
								tailored for you
							</p>
						</div>

						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
							{generatedIdeas.map((idea: any, index: number) => {
								// Convert idea to FeaturedNugget format
								const featuredNugget: FeaturedNugget = {
									id: idea.id,
									title: idea.title,
									narrativeHook: idea.executiveSummary,
									problemStatement: idea.problemStatement,
									description: idea.description || idea.executiveSummary,
									tags: idea.tags || [],
									innovationLevel: idea.confidenceScore ? `${idea.confidenceScore}/100` : undefined,
									timeToMarket: idea.marketTimingScore ? `${idea.marketTimingScore}/10` : undefined,
									urgencyLevel: idea.problemSeverity ? `${idea.problemSeverity}/10` : undefined,
								};

								return (
									<div key={idea.id}>
										<NuggetsCards 
											nugget={featuredNugget}
											className="border-slate-700 hover:border-slate-600"
										/>
									</div>
								);
							})}
						</div>

						{/* CTA Section */}
						<div className="mt-16 border-slate-800 border-t py-12 text-center">
							<h3 className="mb-4 font-bold text-2xl">
								Want to explore more ideas?
							</h3>
							<p className="mb-6 text-slate-400">
								Discover thousands of validated business opportunities in our
								nugget collection
							</p>
							<div className="flex flex-col justify-center gap-4 sm:flex-row">
								<Button size="lg" onClick={() => router.push("/browse")}>
									<TrendingUp className="mr-2 h-5 w-5" />
									Browse All Nuggets
								</Button>
								<Button
									variant="outline"
									size="lg"
									onClick={() => router.push("/")}
								>
									Generate More Ideas
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* No Ideas Generated */}
				{isComplete && generatedIdeas.length === 0 && (
					<div className="flex min-h-[60vh] flex-col items-center justify-center">
						<div className="max-w-md text-center">
							<h2 className="mb-4 font-bold text-2xl">Generation Complete</h2>
							<p className="mb-6 text-lg text-slate-400">
								Your ideas were generated successfully, but we couldn't display
								them here. Check your dashboard to view them.
							</p>
							<div className="flex justify-center gap-4">
								<Button onClick={() => router.push("/dashboard")}>
									View Dashboard
								</Button>
								<Button variant="outline" onClick={() => router.push("/")}>
									Generate More
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
