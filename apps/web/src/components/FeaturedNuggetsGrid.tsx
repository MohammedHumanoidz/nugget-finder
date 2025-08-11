import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export interface FeaturedNugget {
	id: string;
	title: string;
	narrativeHook?: string;
	problemStatement?: string;
	description?: string;
	tags?: string[];
}

interface CardProps {
	nugget: FeaturedNugget;
	className?: string;
}

const NuggetCard = ({ nugget, className = "" }: CardProps) => (
	<Card
		key={nugget.id}
		className={`hover:-translate-y-1 h-fit w-sm rounded-xl border border-border bg-card shadow-sm transition-transform duration-300 hover:shadow-lg ${className}`}
	>
		<CardHeader className="pb-2">
			<CardTitle className="font-semibold text-xl">{nugget.title}</CardTitle>
			{nugget.narrativeHook && (
				<p className="mt-2 text-muted-foreground text-primary/80 italic">
					{nugget.narrativeHook}
				</p>
			)}
		</CardHeader>
		<CardContent className="space-y-3">
			{nugget.problemStatement && (
				<div>
					<p className="text-foreground text-sm">{nugget.problemStatement}</p>
				</div>
			)}
			{nugget.description && (
				<p className="line-clamp-3 text-muted-foreground text-sm">
					{nugget.description}
				</p>
			)}
			{nugget.tags && nugget.tags.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-2">
					{nugget.tags.slice(0, 3).map((t, i) => (
						<span
							key={`${nugget.id}-tag-${i}`}
							className="rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-xs"
						>
							{t}
						</span>
					))}
				</div>
			)}
			<div className="pt-2">
				<Link href={`/nugget/${nugget.id}`}>
					<Button variant="outline" className="w-full">
						View Full Details
					</Button>
				</Link>
			</div>
		</CardContent>
	</Card>
);

export default function FeaturedNuggetsGrid({
	nuggets,
}: {
	nuggets: FeaturedNugget[];
}) {
	if (!nuggets || nuggets.length === 0) return null;

	// Pick the largest card (for now, just the first one)
	const centerCard = nuggets[0];
	const leftCards = nuggets.slice(1, Math.ceil(nuggets.length / 2));
	const rightCards = nuggets.slice(Math.ceil(nuggets.length / 2));

	return (
		<section className="w-full">
			<div className="mx-auto max-w-7xl px-4">
				{/* Section Header */}
				<div className="mb-8 space-y-2">
					<h2 className="text-center font-bold text-3xl">Featured Nuggets</h2>
					<p className="text-center text-muted-foreground">
						These are the top ideas that have been mined today.
					</p>
				</div>

				{/* Custom 3-column layout */}
				<div className="grid grid-cols-1 items-center justify-center gap-6 lg:grid-cols-[1fr_1.5fr_1fr]">
					{/* Left Column */}
					<div className="flex flex-col gap-6">
						{leftCards.map((n) => (
							<NuggetCard key={n.id} nugget={n} />
						))}
					</div>

					{/* Center Column (largest card) */}
					<div className="flex flex-col items-center justify-center">
						<NuggetCard
							nugget={centerCard}
							className="scale-105 border-primary/50 shadow-lg"
						/>
					</div>

					{/* Right Column */}
					<div className="flex flex-col gap-6">
						{rightCards.map((n) => (
							<NuggetCard key={n.id} nugget={n} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
