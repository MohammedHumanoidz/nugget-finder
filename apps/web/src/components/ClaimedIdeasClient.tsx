"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, Loader2, Lock } from "lucide-react";
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

export default function ClaimedIdeasClient() {
	const [unclaimingIds, setUnclaimingIds] = useState<Set<string>>(new Set());

	// Fetch claimed ideas and user limits
	const {
		data: claimedIdeas,
		isLoading,
		refetch,
	} = useQuery(trpc.ideas.getClaimedIdeas.queryOptions());
	const { data: limits, refetch: refetchLimits } = useQuery(
		trpc.ideas.getLimits.queryOptions(),
	);

	// Mutations
	const unclaimIdeaMutation = useMutation(
		trpc.ideas.unclaimIdea.mutationOptions({
			onSuccess: () => {
				refetchLimits();
				refetch();
				toast.success("Idea unclaimed successfully!");
			},
			onError: (error) => {
				toast.error(error.message);
			},
			onSettled: (_, __, variables) => {
				setUnclaimingIds((prev) => {
					const newSet = new Set(prev);
					newSet.delete(variables.ideaId);
					return newSet;
				});
			},
		}),
	);

	const saveIdeaMutation = useMutation(
		trpc.ideas.saveIdea.mutationOptions({
			onSuccess: () => {
				refetchLimits();
				toast.success("Idea saved!");
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const handleUnclaimIdea = (ideaId: string) => {
		setUnclaimingIds((prev) => new Set(prev).add(ideaId));
		unclaimIdeaMutation.mutate({ ideaId });
	};

	const handleSaveIdea = (ideaId: string) => {
		saveIdeaMutation.mutate({ ideaId });
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
						<p className="text-muted-foreground">
							Loading your claimed ideas...
						</p>
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
					<h1 className="mb-4 font-bold text-4xl">🔒 Your Claimed Ideas</h1>
					<p className="mb-4 text-lg text-muted-foreground">
						Startup ideas you've claimed exclusively for yourself
					</p>

					{limits && (
						<div className="text-muted-foreground text-sm">
							You have {claimedIdeas?.length || 0} claimed ideas
							{limits.claimsRemaining !== -1 &&
								` • ${limits.claimsRemaining} claims remaining`}
						</div>
					)}
				</div>
			</div>

			{/* Content */}
			{claimedIdeas && claimedIdeas.length > 0 ? (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{claimedIdeas.map((claimedIdea) => {
						const idea = claimedIdea.idea;
						const isUnclaiming = unclaimingIds.has(idea.id);

						return (
							<Card
								key={idea.id}
								className={`flex h-full flex-col border-primary/20 transition-all hover:shadow-lg ${
									isUnclaiming ? "scale-95 opacity-50" : ""
								}`}
							>
								<CardHeader className="flex-1">
									<div className="mb-2 flex items-start justify-between gap-2">
										<CardTitle className="line-clamp-2 flex-1 text-lg">
											{idea.title || "Untitled Idea"}
										</CardTitle>
										<div className="flex items-center gap-2">
											<div className="rounded bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
												CLAIMED
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
										Claimed on{" "}
										{new Date(claimedIdea.createdAt).toLocaleDateString()}
									</div>
									<div className="mt-2 rounded-md border border-primary/10 bg-primary/5 p-2">
										<div className="flex items-center gap-2 text-primary text-xs">
											<Lock className="h-3 w-3" />
											<span className="font-medium">
												This idea is exclusively yours
											</span>
										</div>
										<p className="mt-1 text-muted-foreground text-xs">
											Other users cannot see or claim this idea while you have
											it claimed.
										</p>
									</div>
								</CardContent>

								<CardFooter className="flex flex-col gap-2">
									<div className="flex w-full gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleSaveIdea(idea.id)}
											disabled={!limits?.canSave || saveIdeaMutation.isPending}
											className="flex-1"
											title={!limits?.canSave ? "Upgrade for more saves" : ""}
										>
											{saveIdeaMutation.isPending ? (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<>
													<Bookmark className="mr-2 h-4 w-4" />
													Save
												</>
											)}
										</Button>

										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleUnclaimIdea(idea.id)}
											disabled={isUnclaiming}
											className="flex-1"
										>
											{isUnclaiming ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Unclaiming...
												</>
											) : (
												"Unclaim"
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
					<div className="mb-4 text-4xl">🔒</div>
					<h3 className="mb-2 font-semibold text-lg">No claimed ideas yet</h3>
					<p className="mb-6 text-muted-foreground">
						Claim startup ideas to make them exclusively yours and hidden from
						other users
					</p>
					<div className="mx-auto mb-6 max-w-md rounded-lg bg-muted p-4">
						<h4 className="mb-2 font-medium text-sm">
							What does claiming mean?
						</h4>
						<ul className="space-y-1 text-muted-foreground text-sm">
							<li>• The idea becomes exclusively yours</li>
							<li>• Other users can't see or claim it</li>
							<li>• Use your claim quota wisely</li>
							<li>• You can unclaim to free up quota</li>
						</ul>
					</div>
					<Button asChild>
						<Link href="/browse">Browse Ideas to Claim</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
