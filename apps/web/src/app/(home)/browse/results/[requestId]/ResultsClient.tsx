"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
	Lightbulb,
	TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AnimatedSearchLoader from "@/components/AnimatedSearchLoader";
import NuggetsCards from "@/components/nuggetsCards";
import type { FeaturedNugget } from "@/components/nuggetsCards";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";

interface ResultsClientProps {
	requestId: string;
}

interface GeneratedIdea {
	id: string;
	title: string;
	description?: string;
	executiveSummary?: string;
	problemStatement?: string;
	narrativeHook?: string;
	tags?: string[] | string;
	confidenceScore?: number;
	createdAt?: string;
	updatedAt?: string;
	// Additional fields that might come from direct generation data
	[key: string]: any;
}

export default function ResultsClient({ requestId }: ResultsClientProps) {
	const router = useRouter();
	const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);

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

	// Fetch generated ideas when generation is complete (only for authenticated users)
	const { data: allGeneratedIdeas } = useQuery({
		...trpc.ideas.getGeneratedIdeas.queryOptions({ limit: 50 }),
		enabled:
			generationStatus?.status === "COMPLETED" && 
			generationStatus.generatedIdeaIds &&
			generationStatus.generatedIdeaIds.length > 0 &&
			generatedIdeas.length === 0 &&
			!(generationStatus as any).generatedIdeasData, // Only fetch from DB if no direct data available
	});

	useEffect(() => {
		if (
			generationStatus?.status === "COMPLETED" &&
			generationStatus.generatedIdeaIds &&
			generationStatus.generatedIdeaIds.length > 0 &&
			generatedIdeas.length === 0
		) {
			// Always use the direct idea data from the response if available (both auth and non-auth users)
			if ((generationStatus as any).generatedIdeasData) {
				setGeneratedIdeas((generationStatus as any).generatedIdeasData);
			} 
			// Fallback: For authenticated users, filter from the database query if direct data not available
			else if (allGeneratedIdeas) {
				const justGeneratedIdeas = allGeneratedIdeas.filter((idea: GeneratedIdea) =>
					generationStatus.generatedIdeaIds.includes(idea.id)
				);
				setGeneratedIdeas(justGeneratedIdeas);
			}
		}
	}, [generationStatus, allGeneratedIdeas, generatedIdeas.length]);

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
						<p className="text-center text-slate-400">We&apos;re generating your idea. Feel free to move around since it might take a bit and we&apos;ll handle it from here.</p>
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
								🎉 Your Business Idea Is Ready!
							</h1>
							<p className="text-slate-400 text-xl">
								{generatedIdeas.length === 1 
									? "Here's your personalized high-potential business opportunity"
									: `Here are ${generatedIdeas.length} high-potential opportunities tailored for you`}
							</p>
						</div>

						<div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
							{generatedIdeas.map((idea: GeneratedIdea) => {
								// Convert idea to FeaturedNugget format
								const featuredNugget: FeaturedNugget = {
									id: idea.id,
									title: idea.title || "Your Business Idea",
									narrativeHook: idea.narrativeHook || idea.executiveSummary,
									problemStatement: idea.problemStatement,
									description: idea.description || idea.executiveSummary,
									tags: Array.isArray(idea.tags) ? idea.tags : (idea.tags ? [idea.tags] : []),
									innovationLevel: idea.confidenceScore ? `${idea.confidenceScore}/10` : undefined,
								};

								return (
									<div key={idea.id} className="w-full">
										<NuggetsCards 
											nugget={featuredNugget}
											className="w-full border-slate-700 hover:border-slate-600"
										/>
									</div>
								);
							})}
						</div>

						{/* CTA Section */}
						<div className="mt-16 border-slate-800 border-t py-12 text-center">
							<h3 className="mb-4 font-bold text-2xl">
								Ready to dive deeper or explore more?
							</h3>
							<p className="mb-6 text-slate-400">
								Generate another idea or discover thousands of validated business opportunities in our nugget collection
							</p>
							<div className="flex flex-col justify-center gap-4 sm:flex-row">
								<Button size="lg" onClick={() => router.push("/")}>
									<Lightbulb className="mr-2 h-5 w-5" />
									Generate Another Idea
								</Button>
								<Button
									variant="outline"
									size="lg"
									onClick={() => router.push("/browse")}
								>
									<TrendingUp className="mr-2 h-5 w-5" />
									Browse All Nuggets
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* No Ideas Generated or Loading Ideas */}
				{isComplete && generatedIdeas.length === 0 && (
					<div className="flex min-h-[60vh] flex-col items-center justify-center">
						<div className="max-w-md text-center">
							<h2 className="mb-4 font-bold text-2xl">🎉 Generation Complete!</h2>
							<p className="mb-6 text-lg text-slate-400">
								Your personalized business idea has been generated successfully. 
								{generationStatus?.generatedIdeaIds?.length > 0 
									? " Loading your idea details..."
									: " Generate another idea to explore more opportunities!"}
							</p>
							<div className="flex justify-center gap-4">
								<Button onClick={() => router.push("/")}>
									Generate Another Idea
								</Button>
								<Button variant="outline" onClick={() => router.push("/browse")}>
									Browse All Ideas
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
