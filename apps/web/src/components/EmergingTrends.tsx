import { TrendingDown, TrendingUp } from "lucide-react";

interface TrendItem {
	icon?: string;
	name: string;
	growthPercent: number; // positive or negative
	description: string;
}

export default function EmergingTrends({ trends }: { trends: TrendItem[] }) {
	return (
		<section className="w-full">
			<div className="mx-auto max-w-7xl px-4 py-16">
				<div className="mb-8">
					<h2 className="font-bold text-3xl">Emerging Trends</h2>
					<p className="text-muted-foreground">
						Discover fast-rising themes and opportunities
					</p>
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					{trends.map((t, i) => {
						const positive = t.growthPercent >= 0;
						return (
							<div
								key={`${t.name}-${i.toString()}`}
								className="rounded-xl border border-border bg-card p-6 shadow-xs"
							>
								<div className="mb-3 text-3xl" aria-hidden>
									{t.icon ?? "📈"}
								</div>
								<div className="flex items-center justify-between">
									<h3 className="font-semibold text-lg">{t.name}</h3>
									<div
										className={`flex items-center gap-1 font-semibold text-sm ${positive ? "text-emerald-600" : "text-red-600"}`}
									>
										{positive ? (
											<TrendingUp className="h-4 w-4" />
										) : (
											<TrendingDown className="h-4 w-4" />
										)}
										<span>
											{positive ? "+" : ""}
											{t.growthPercent}%
										</span>
									</div>
								</div>
								<p className="mt-2 text-muted-foreground text-sm">
									{t.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
