/** biome-ignore-all lint/a11y/useValidAnchor: <explanation> */
"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";

interface NuggetData {
	title: string;
	summary: string;
	badges: string[];
	brief: string;
	assay: {
		opportunity: number;
		feasibility: number;
		defensibility: number;
	};
	whyNow: string[];
	marketGap: string;
	plan: string[];
	valuation: {
		cac: string;
		ltv: string;
		yieldRatio: string;
		projectedRevenue: string;
	};
	meta: {
		claimType: string;
		target: string;
		strength: number;
		rivals: string[];
		advantage: string;
	};
}

// Transform database response to NuggetPage format
const transformDbToNugget = (dbIdea: any): NuggetData => {
	// Handle whyNow - it's an object with supportingData array, not an array itself
	const getWhyNowPoints = () => {
		if (dbIdea.whyNow?.supportingData && Array.isArray(dbIdea.whyNow.supportingData)) {
			return dbIdea.whyNow.supportingData;
		}
		if (dbIdea.whyNow?.description) {
			return [dbIdea.whyNow.description];
		}
		return [
			"Market timing is optimal",
			"Technology enablers are mature", 
			"Customer pain points are intensifying"
		];
	};

	// Handle execution plan - it's null in the response, so we need fallback
	const getExecutionPlan = () => {
		if (dbIdea.executionPlan?.phases && Array.isArray(dbIdea.executionPlan.phases)) {
			return dbIdea.executionPlan.phases.map((phase: any) => phase.description || phase.title);
		}
		return [
			"MVP Development and Initial Market Testing",
			"Customer Acquisition and Product Refinement",
			"Scale Operations and Market Expansion",
		];
	};

	// Handle competitive advantage
	const getAdvantage = () => {
		if (dbIdea.competitiveAdvantage?.description) {
			return dbIdea.competitiveAdvantage.description;
		}
		if (dbIdea.marketCompetition?.unfairAdvantage && Array.isArray(dbIdea.marketCompetition.unfairAdvantage)) {
			return dbIdea.marketCompetition.unfairAdvantage[0] || "First-to-market advantage";
		}
		return "First-to-market advantage";
	};

	// Handle rivals
	const getRivals = () => {
		if (dbIdea.marketCompetition?.directCompetitors && Array.isArray(dbIdea.marketCompetition.directCompetitors)) {
			return dbIdea.marketCompetition.directCompetitors
				.slice(0, 3)
				.map((comp: any) => comp.name);
		}
		return ["TechCorp", "StartupX"];
	};

	return {
		title: dbIdea.title || "Untitled Startup Nugget",
		summary:
			dbIdea.executiveSummary ||
			dbIdea.description ||
			"AI-generated startup opportunity",
		badges: ["High Purity", "Prime Claim", "Ready to Mine", "Assayed"],
		brief:
			dbIdea.problemSolution ||
			dbIdea.description ||
			"Detailed analysis of the startup opportunity",
		assay: {
			opportunity: dbIdea.ideaScore?.problemSeverity || 85,
			feasibility: dbIdea.ideaScore?.technicalFeasibility || 78,
			defensibility: dbIdea.ideaScore?.moatStrength || 72,
		},
		whyNow: getWhyNowPoints(),
		marketGap:
			dbIdea.marketGap?.description ||
			dbIdea.marketGap?.opportunity ||
			"Identified market gap with significant opportunity",
		plan: getExecutionPlan(),
		valuation: {
			cac: dbIdea.monetizationStrategy?.keyMetrics?.cac
				? `$${dbIdea.monetizationStrategy.keyMetrics.cac}`
				: "$120",
			ltv: dbIdea.monetizationStrategy?.keyMetrics?.ltv
				? `$${dbIdea.monetizationStrategy.keyMetrics.ltv}`
				: "$1,200",
			yieldRatio: dbIdea.monetizationStrategy?.keyMetrics?.ltvCacRatio
				? `${dbIdea.monetizationStrategy.keyMetrics.ltvCacRatio}:1`
				: "10:1",
			projectedRevenue: dbIdea.monetizationStrategy?.financialProjections?.[0]
				?.revenue
				? `$${Math.round(dbIdea.monetizationStrategy.financialProjections[0].revenue / 1000)}K`
				: "$50K",
		},
		meta: {
			claimType: dbIdea.strategicPositioning?.name || "B2B SaaS",
			target: dbIdea.strategicPositioning?.targetSegment || "SMB Market",
			strength: dbIdea.ideaScore?.totalScore || 78,
			rivals: getRivals(),
			advantage: getAdvantage(),
		},
	};
};

const LoadingSkeleton = ({ className }: { className?: string }) => (
	<div className={`animate-pulse rounded bg-muted ${className}`} />
);

const BadgeRow = ({ isVisible }: { isVisible: boolean }) => (
	<div
		className={`mb-8 flex gap-3 transition-all duration-700 ${
			isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
		}`}
	>
		<span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm">
			💎 High Purity
		</span>
		<span className="rounded-full bg-destructive/10 px-3 py-1 font-medium text-destructive text-sm">
			🔥 Prime Claim
		</span>
		<span className="rounded-full bg-chart-2/10 px-3 py-1 font-medium text-chart-2 text-sm">
			⛏️ Ready to Mine
		</span>
		<span className="rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground text-sm">
			✅ Assayed
		</span>
	</div>
);

export default function NuggetPage() {
	// Generate daily idea mutation
	const generateIdeaMutation = useMutation(
		trpc.agents.generateDailyIdea.mutationOptions({}),
	);

	// Get the latest idea
	const { data: ideasResponse } = useQuery({
		...trpc.agents.getDailyIdeas.queryOptions({ limit: 1, offset: 0 }),
		enabled: generateIdeaMutation.isSuccess || true, // Always try to fetch existing ideas
	});

	const latestIdea = ideasResponse?.ideas?.[0];
	const nuggetData = latestIdea ? transformDbToNugget(latestIdea) : null;
	const isLoading = generateIdeaMutation.isPending;

	const handleGenerateIdea = () => {
		generateIdeaMutation.mutate({});
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Top Navigation */}
			<nav className="border-border border-b">
				<div className="mx-auto max-w-7xl px-4 py-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="text-xl">⛏️</span>
							<span className="font-semibold text-lg">NuggetFinder.io</span>
						</div>
						<div className="flex items-center gap-6 text-sm">
							<a
								href="#"
								className="text-muted-foreground hover:text-foreground"
							>
								Prospect
							</a>
							<a
								href="#"
								className="text-muted-foreground hover:text-foreground"
							>
								Claims
							</a>
							<a
								href="#"
								className="text-muted-foreground hover:text-foreground"
							>
								Vault
							</a>
							<a
								href="#"
								className="text-muted-foreground hover:text-foreground"
							>
								Account
							</a>
						</div>
					</div>
				</div>
			</nav>

			<div className="mx-auto max-w-7xl px-4 py-8">
				{!nuggetData && !isLoading ? (
					<div className="py-16 text-center">
						<h1 className="mb-4 font-bold text-4xl">
							Discover Your Next Startup Nugget
						</h1>
						<p className="mb-8 text-lg text-muted-foreground">
							AI-powered startup idea discovery and validation
						</p>
						<Button
							onClick={handleGenerateIdea}
							disabled={isLoading}
							className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
						>
							{isLoading ? "Generating..." : "Generate Idea"}
						</Button>
					</div>
				) : (
					<>
						{/* Hero Section */}
						<div className="mb-8">
							{isLoading ? (
								<div>
									<LoadingSkeleton className="mb-4 h-10 w-3/4" />
									<LoadingSkeleton className="h-6 w-1/2" />
								</div>
							) : (
								<div
									className={`transition-all duration-500 ${
										nuggetData ? "opacity-100" : "opacity-0"
									}`}
								>
									<h1 className="mb-2 font-bold text-4xl">
										{nuggetData?.title}
									</h1>
									<p className="text-lg text-muted-foreground">
										{nuggetData?.summary}
									</p>
								</div>
							)}
						</div>

						{/* Badge Row */}
						<BadgeRow isVisible={!!nuggetData} />

						{/* Main Content Grid */}
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
							{/* Left Column - Main Content */}
							<div className="space-y-8 lg:col-span-2">
								{/* Prospector's Brief */}
								<section className="rounded-lg border bg-card p-6">
									<h2 className="mb-4 font-semibold text-xl">
										Prospector's Brief
									</h2>
									{isLoading ? (
										<div className="space-y-3">
											<LoadingSkeleton className="h-4 w-full" />
											<LoadingSkeleton className="h-4 w-5/6" />
											<LoadingSkeleton className="h-4 w-4/5" />
										</div>
									) : (
										<p className="text-muted-foreground leading-relaxed">
											{nuggetData?.brief}
										</p>
									)}
								</section>

								{/* Assay Report */}
								<section className="rounded-lg border bg-card p-6">
									<h2 className="mb-4 font-semibold text-xl">Assay Report</h2>
									{isLoading ? (
										<div className="grid grid-cols-3 gap-4">
											{[1, 2, 3].map((i) => (
												<div key={i} className="space-y-2">
													<LoadingSkeleton className="h-4 w-20" />
													<LoadingSkeleton className="h-3 w-full" />
													<LoadingSkeleton className="h-2 w-full" />
												</div>
											))}
										</div>
									) : (
										<div className="grid grid-cols-3 gap-4">
											<div>
												<div className="font-medium text-muted-foreground text-sm">
													Opportunity
												</div>
												<div className="font-bold text-2xl">
													{nuggetData?.assay.opportunity}%
												</div>
												<div className="mt-1 h-2 w-full rounded-full bg-secondary">
													<div
														className="h-2 rounded-full bg-primary"
														style={{
															width: `${nuggetData?.assay.opportunity}%`,
														}}
													/>
												</div>
											</div>
											<div>
												<div className="font-medium text-muted-foreground text-sm">
													Feasibility
												</div>
												<div className="font-bold text-2xl">
													{nuggetData?.assay.feasibility}%
												</div>
												<div className="mt-1 h-2 w-full rounded-full bg-secondary">
													<div
														className="h-2 rounded-full bg-chart-2"
														style={{
															width: `${nuggetData?.assay.feasibility}%`,
														}}
													/>
												</div>
											</div>
											<div>
												<div className="font-medium text-muted-foreground text-sm">
													Defensibility
												</div>
												<div className="font-bold text-2xl">
													{nuggetData?.assay.defensibility}%
												</div>
												<div className="mt-1 h-2 w-full rounded-full bg-secondary">
													<div
														className="h-2 rounded-full bg-chart-3"
														style={{
															width: `${nuggetData?.assay.defensibility}%`,
														}}
													/>
												</div>
											</div>
										</div>
									)}
								</section>

								{/* The Claim (Why Now?) */}
								<section className="rounded-lg border bg-card p-6">
									<h2 className="mb-4 font-semibold text-xl">
										The Claim (Why Now?)
									</h2>
									{isLoading ? (
										<div className="space-y-3">
											{[1, 2, 3].map((i) => (
												<LoadingSkeleton key={i} className="h-4 w-full" />
											))}
										</div>
									) : (
										<ul className="space-y-2">
											{nuggetData?.whyNow.map((point) => (
												<li key={point} className="flex items-start gap-2">
													<span className="mt-1 text-primary">•</span>
													<span className="text-muted-foreground">{point}</span>
												</li>
											))}
										</ul>
									)}
								</section>

								{/* The Vein (Market Gap) */}
								<section className="rounded-lg border bg-card p-6">
									<h2 className="mb-4 font-semibold text-xl">
										The Vein (Market Gap)
									</h2>
									{isLoading ? (
										<div className="space-y-3">
											<LoadingSkeleton className="h-4 w-full" />
											<LoadingSkeleton className="h-4 w-4/5" />
										</div>
									) : (
										<p className="text-muted-foreground leading-relaxed">
											{nuggetData?.marketGap}
										</p>
									)}
								</section>

								{/* Extraction Plan */}
								<section className="rounded-lg border bg-card p-6">
									<h2 className="mb-4 font-semibold text-xl">
										Extraction Plan
									</h2>
									{isLoading ? (
										<div className="space-y-3">
											{[1, 2, 3].map((i) => (
												<LoadingSkeleton key={i} className="h-4 w-full" />
											))}
										</div>
									) : (
										<ol className="space-y-3">
											{nuggetData?.plan.map((phase, index) => (
												<li key={phase} className="flex items-start gap-3">
													<span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
														{index + 1}
													</span>
													<span className="text-muted-foreground">{phase}</span>
												</li>
											))}
										</ol>
									)}
								</section>

								{/* Valuation */}
								<section className="rounded-lg border bg-card p-6">
									<h2 className="mb-4 font-semibold text-xl">Valuation</h2>
									{isLoading ? (
										<div className="grid grid-cols-2 gap-4">
											{[1, 2, 3, 4].map((i) => (
												<div key={i} className="space-y-2">
													<LoadingSkeleton className="h-4 w-16" />
													<LoadingSkeleton className="h-6 w-20" />
												</div>
											))}
										</div>
									) : (
										<div className="grid grid-cols-2 gap-4">
											<div>
												<div className="font-medium text-muted-foreground text-sm">
													CAC
												</div>
												<div className="font-bold text-xl">
													{nuggetData?.valuation.cac}
												</div>
											</div>
											<div>
												<div className="font-medium text-muted-foreground text-sm">
													LTV
												</div>
												<div className="font-bold text-xl">
													{nuggetData?.valuation.ltv}
												</div>
											</div>
											<div>
												<div className="font-medium text-muted-foreground text-sm">
													Net Yield
												</div>
												<div className="font-bold text-xl">
													{nuggetData?.valuation.yieldRatio}
												</div>
											</div>
											<div>
												<div className="font-medium text-muted-foreground text-sm">
													MRR Projection
												</div>
												<div className="font-bold text-xl">
													{nuggetData?.valuation.projectedRevenue}
												</div>
											</div>
										</div>
									)}
								</section>
							</div>

							{/* Right Sidebar */}
							<div className="space-y-6">
								{/* Action Buttons */}
								<div className="space-y-3 rounded-lg border bg-card p-6">
									<Button className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
										Start Mining
									</Button>
									<Button className="w-full rounded-lg border border-border py-3 font-medium transition-colors hover:bg-accent">
										Get Assay Report
									</Button>
								</div>

								{/* Claim Metadata */}
								<div className="space-y-4 rounded-lg border bg-card p-6">
									<div>
										<div className="font-medium text-muted-foreground text-sm">
											Claim
										</div>
										{isLoading ? (
											<LoadingSkeleton className="mt-1 h-4 w-24" />
										) : (
											<div className="font-medium">
												{nuggetData?.meta.claimType}
											</div>
										)}
									</div>

									<div>
										<div className="font-medium text-muted-foreground text-sm">
											Type
										</div>
										{isLoading ? (
											<LoadingSkeleton className="mt-1 h-4 w-32" />
										) : (
											<div className="font-medium">
												{nuggetData?.meta.target}
											</div>
										)}
									</div>

									<div>
										<div className="font-medium text-muted-foreground text-sm">
											Claim Strength
										</div>
										{isLoading ? (
											<LoadingSkeleton className="mt-2 h-2 w-full" />
										) : (
											<div className="mt-2">
												<div className="h-2 w-full rounded-full bg-secondary">
													<div
														className="h-2 rounded-full bg-primary"
														style={{ width: `${nuggetData?.meta.strength}%` }}
													/>
												</div>
												<div className="mt-1 text-muted-foreground text-sm">
													{nuggetData?.meta.strength}%
												</div>
											</div>
										)}
									</div>

									<div>
										<div className="font-medium text-muted-foreground text-sm">
											Rival Prospectors
										</div>
										{isLoading ? (
											<div className="mt-2 space-y-1">
												<LoadingSkeleton className="h-3 w-20" />
												<LoadingSkeleton className="h-3 w-24" />
											</div>
										) : (
											<div className="mt-1 text-sm">
												{nuggetData?.meta.rivals.map((rival, index) => (
													<div key={rival} className="text-muted-foreground">
														{rival}
													</div>
												))}
											</div>
										)}
									</div>

									<div>
										<div className="font-medium text-muted-foreground text-sm">
											Unfair Advantage
										</div>
										{isLoading ? (
											<LoadingSkeleton className="mt-1 h-4 w-full" />
										) : (
											<div className="mt-1 text-muted-foreground text-sm">
												{nuggetData?.meta.advantage}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Footer Prompt */}
						<div className="mt-12 text-center">
							<div className="mx-auto max-w-2xl rounded-lg border bg-card p-6">
								<div className="mb-4 flex items-center justify-center gap-2">
									<span>💬</span>
									<span className="font-medium">
										Interrogate this Nugget...
									</span>
								</div>
								<div className="flex gap-2">
									<input
										type="text"
										placeholder="What's the 3rd idea about?"
										className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
									/>
									<Button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90">
										Ask
									</Button>
								</div>
								<div className="mt-3 flex justify-center gap-2 text-sm">
									<Button variant={"outline"}>
										Show me risks
									</Button>
									<span className="text-muted-foreground">•</span>
									<Button variant={"outline"}>
										Competitive analysis
									</Button>
									<span className="text-muted-foreground">•</span>
									<Button variant={"outline"}>
										Market size
									</Button>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
