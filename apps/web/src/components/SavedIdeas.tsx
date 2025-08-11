import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { serverTRPC } from "@/lib/server-trpc";
import SavedIdeasActions from "./SavedIdeasActions";

interface SavedIdeaItem {
	id: string;
	idea: {
		id: string;
		title: string;
		description: string;
		ideaScore?: {
			totalScore?: number;
			problemSeverity?: number;
			technicalFeasibility?: number;
			marketTimingScore?: number;
		} | null;
	};
	createdAt: string; // Will be string when coming from API
}

function getScoreColor(score?: number) {
	if (!score) return "text-gray-500";
	if (score >= 80) return "text-green-600";
	if (score >= 60) return "text-yellow-600";
	return "text-red-600";
}

export default async function SavedIdeas() {
	// Fetch data server-side
	const [savedIdeas, limits] = await Promise.all([
		serverTRPC.getSavedIdeas(),
		serverTRPC.getUserLimits(),
	]);

	return (
		<div className="mx-auto max-w-7xl px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<div className="mb-4 flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/browse">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Browse
						</Link>
					</Button>
				</div>

				<div className="text-center">
					<h1 className="mb-4 font-bold text-4xl">📚 Your Saved Ideas</h1>
					<p className="mb-4 text-lg text-muted-foreground">
						Ideas you've bookmarked for future reference
					</p>

					{limits && (
						<div className="text-muted-foreground text-sm">
							You have {savedIdeas?.length || 0} saved ideas
							{limits.savesRemaining !== -1 &&
								` • ${limits.savesRemaining} saves remaining`}
						</div>
					)}
				</div>
			</div>

			{/* Content */}
			{savedIdeas && savedIdeas.length > 0 ? (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{savedIdeas.map((savedIdea: SavedIdeaItem) => {
						const idea = savedIdea.idea;

						return (
							<Card
								key={idea.id}
								className="flex h-full flex-col transition-all hover:shadow-lg"
							>
								<CardHeader className="flex-1">
									<div className="mb-2 flex items-start justify-between gap-2">
										<CardTitle className="line-clamp-2 flex-1 text-lg">
											{idea.title || "Untitled Idea"}
										</CardTitle>
										<div className="flex items-center gap-2">
											<div className="rounded bg-blue-100 px-2 py-1 text-blue-700 text-xs">
												SAVED
											</div>
											{idea.ideaScore?.totalScore && (
												<div
													className={`font-semibold text-sm ${getScoreColor(idea.ideaScore.totalScore)}`}
												>
													{idea.ideaScore.totalScore}/100
												</div>
											)}
										</div>
									</div>
									{idea.ideaScore && (
										<div className="flex gap-2 text-muted-foreground text-xs">
											<span>
												Problem: {idea.ideaScore.problemSeverity || 0}
											</span>
											<span>•</span>
											<span>
												Feasibility: {idea.ideaScore.technicalFeasibility || 0}
											</span>
											<span>•</span>
											<span>
												Timing: {idea.ideaScore.marketTimingScore || 0}
											</span>
										</div>
									)}
								</CardHeader>

								<CardContent className="flex-1">
									<p className="line-clamp-3 text-muted-foreground">
										{idea.description ||
											"No description available for this startup opportunity."}
									</p>
									<div className="mt-3 text-muted-foreground text-xs">
										Saved on{" "}
										{new Date(savedIdea.createdAt).toLocaleDateString()}
									</div>
								</CardContent>

								<CardFooter className="flex flex-col gap-2">
									<SavedIdeasActions
										ideaId={idea.id}
										isSaved={true}
										canSave={limits?.canSave || false}
										canClaim={limits?.canClaim || false}
									/>

									<Button asChild variant="outline" className="w-full">
										<Link href={`/nugget/${idea.id}`}>View Details →</Link>
									</Button>
								</CardFooter>
							</Card>
						);
					})}
				</div>
			) : (
				<div className="py-12 text-center">
					<div className="mb-4 text-4xl">📚</div>
					<h3 className="mb-2 font-semibold text-lg">No saved ideas yet</h3>
					<p className="mb-6 text-muted-foreground">
						Start saving startup ideas that interest you for easy access later
					</p>
					<Button asChild>
						<Link href="/browse">Browse Ideas</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
