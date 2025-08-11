import { ArrowLeft, Lightbulb } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { serverTRPC } from "@/lib/server-trpc";

interface MinedIdeaItem {
	id: string;
	prompt: string;
	title: string;
	description: string;
	executiveSummary: string;
	problemStatement: string;
	narrativeHook: string;
	tags: string[];
	confidenceScore: number;
	createdAt: string;
	updatedAt: string;
}

export default async function MinedNuggets() {
	// Fetch data server-side
	const [minedIdeas, limits] = await Promise.all([
		serverTRPC.getMinedIdeas(),
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
					<h1 className="mb-4 font-bold text-4xl">⛏️ Your Mined Nuggets</h1>
					<p className="mb-4 text-lg text-muted-foreground">
						Business ideas you've personally generated and mined
					</p>

					<div className="text-muted-foreground text-sm">
						You have {minedIdeas?.length || 0} mined nuggets
					</div>
				</div>
			</div>

			{/* Content */}
			{minedIdeas && minedIdeas.length > 0 ? (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{minedIdeas.map((idea: MinedIdeaItem) => {
						return (
							<Card
								key={idea.id}
								className="flex h-full flex-col transition-all hover:shadow-lg"
							>
								<CardHeader className="flex-1">
									<div className="mb-2 flex flex-col items-start justify-between gap-2">
										<CardTitle className="flex-1 text-xl">
											{idea.title || "Untitled Idea"}
										</CardTitle>
									</div>

									{/* Tags */}
									{idea.tags && idea.tags.length > 0 && (
										<div className="mb-2 flex flex-wrap gap-1">
											{idea.tags.slice(0, 3).map((tag) => (
												<Badge
													key={`${idea.id}-${tag}`}
													variant="secondary"
													className="text-xs"
												>
													{tag}
												</Badge>
											))}
											{idea.tags.length > 3 && (
												<Badge variant="secondary" className="text-xs">
													+{idea.tags.length - 3} more
												</Badge>
											)}
										</div>
									)}
								</CardHeader>

								<CardContent className="flex-1">
									<p className="mb-3 line-clamp-3 text-muted-foreground">
										{idea.description ||
											idea.executiveSummary ||
											"No description available for this business idea."}
									</p>

									{/* Original Prompt */}
									<div className="mt-3 rounded-md border p-2">
										<div className="mb-1 flex items-center gap-2 text-xs">
											<Lightbulb className="h-3 w-3" />
											<span className="font-medium">Original Prompt</span>
										</div>
										<p className="line-clamp-2 text-muted-foreground text-xs">
											"{idea.prompt}"
										</p>
									</div>

									<div className="mt-3 text-muted-foreground text-xs">
										Generated on {new Date(idea.createdAt).toLocaleDateString()}
									</div>
								</CardContent>

								<CardFooter className="flex flex-col gap-2">
									<Button asChild variant="outline" className="w-full">
										<Link href={`/nugget/mined/${idea.id}`}>
											View Full Details →
										</Link>
									</Button>
								</CardFooter>
							</Card>
						);
					})}
				</div>
			) : (
				<div className="py-12 text-center">
					<div className="mb-4 text-4xl">⛏️</div>
					<h3 className="mb-2 font-semibold text-lg">No mined nuggets yet</h3>
					<p className="mb-6 text-muted-foreground">
						Generate your first business ideas by describing what you'd like to
						build
					</p>
					<div className="mx-auto mb-6 max-w-md rounded-lg bg-muted p-4">
						<h4 className="mb-2 font-medium text-sm">How to mine nuggets?</h4>
						<ul className="space-y-1 text-muted-foreground text-sm">
							<li>• Go to the homepage and describe your interests</li>
							<li>• Our AI will generate personalized business ideas</li>
							<li>• Your generated ideas become your "mined nuggets"</li>
							<li>• Access them anytime from here</li>
						</ul>
					</div>
					<Button asChild>
						<Link href="/">Start Mining Ideas</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
