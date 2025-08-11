"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/utils/trpc";

export default function SavedIdeasClient() {
	const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

	// Fetch saved ideas and user limits
	const {
		data: savedIdeas,
		isLoading,
		refetch,
	} = useQuery(trpc.ideas.getSavedIdeas.queryOptions());
	const { data: limits, refetch: refetchLimits } = useQuery(
		trpc.ideas.getLimits.queryOptions(),
	);

	// Mutations
	const unsaveIdeaMutation = useMutation(
		trpc.ideas.unsaveIdea.mutationOptions({
			onSuccess: () => {
				refetchLimits();
				refetch();
				toast.success("Idea removed from saved!");
			},
			onError: (error) => {
				toast.error(error.message);
			},
			onSettled: (_, __, variables) => {
				setRemovingIds((prev) => {
					const newSet = new Set(prev);
					newSet.delete(variables.ideaId);
					return newSet;
				});
			},
		}),
	);

	const claimIdeaMutation = useMutation(
		trpc.ideas.claimIdea.mutationOptions({
			onSuccess: () => {
				refetchLimits();
				toast.success("Idea claimed!");
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const handleUnsaveIdea = (ideaId: string) => {
		setRemovingIds((prev) => new Set(prev).add(ideaId));
		unsaveIdeaMutation.mutate({ ideaId });
	};

	const handleClaimIdea = (ideaId: string) => {
		claimIdeaMutation.mutate({ ideaId });
	};

	const getScoreColor = (score?: number) => {
		if (!score) return "text-gray-500";
		if (score >= 80) return "text-green-600";
		if (score >= 60) return "text-yellow-600";
		return "text-red-600";
	};

	if (isLoading) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-8">
				<div className="flex items-center justify-center py-12">
					<div className="text-center">
						<Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
						<p className="text-muted-foreground">Loading your saved ideas...</p>
					</div>
				</div>
			</div>
		);
	}

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
					{savedIdeas.map((savedIdea) => {
						const idea = savedIdea.idea;
						const isRemoving = removingIds.has(idea.id);

						return (
							<Card
								key={idea.id}
								className={`flex h-full flex-col transition-all hover:shadow-lg ${
									isRemoving ? "scale-95 opacity-50" : ""
								}`}
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
									<div className="flex w-full gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleUnsaveIdea(idea.id)}
											disabled={isRemoving}
											className="flex-1"
										>
											{isRemoving ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Removing...
												</>
											) : (
												<>
													<BookmarkCheck className="mr-2 h-4 w-4" />
													Remove
												</>
											)}
										</Button>

										<Button
											variant="secondary"
											size="sm"
											onClick={() => handleClaimIdea(idea.id)}
											disabled={
												!limits?.canClaim || claimIdeaMutation.isPending
											}
											className="flex-1"
											title={
												!limits?.canClaim
													? "Upgrade for more access or unclaim another idea"
													: ""
											}
										>
											{claimIdeaMutation.isPending ? (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											) : (
												"Claim"
											)}
										</Button>
									</div>

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
