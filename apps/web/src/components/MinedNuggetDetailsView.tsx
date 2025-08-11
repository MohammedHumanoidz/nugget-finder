"use client";

import Image from "next/image";
import { useState } from "react";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NuggetChat from "./NuggetChat";

interface MinedNuggetData {
	id: string;
	userId: string;
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
	fullIdeaData: any;
}

interface MinedNuggetDetailsViewProps {
	idea: MinedNuggetData;
}

// Helper function to safely get nested data with defaults
const safeGet = (obj: any, path: string[], defaultValue: any = null) => {
	try {
		return path.reduce((current, key) => current?.[key], obj) ?? defaultValue;
	} catch {
		return defaultValue;
	}
};

const MinedNuggetDetailsView: React.FC<MinedNuggetDetailsViewProps> = ({
	idea,
}) => {
	const [competitorTab, setCompetitorTab] = useState<"direct" | "indirect">(
		"direct",
	);

	const fullData = idea.fullIdeaData || {};

	// Helper function to format currency
	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	// Helper function to render bullet points
	const renderBulletPoints = (
		items: string[],
		emptyMessage = "Not specified",
	) => {
		if (!items || items.length === 0)
			return (
				<span className="text-muted-foreground italic">{emptyMessage}</span>
			);
		return (
			<ul className="space-y-1 pl-4">
				{items.map((item) => (
					<li key={`bullet-${item}`} className="text-muted-foreground text-sm">
						• {item}
					</li>
				))}
			</ul>
		);
	};

	// Prepare radar chart data from scoring
	const scoring = safeGet(fullData, ["scoring"], {});
	const radarData = [
		{ subject: "Problem Severity", value: scoring.problemSeverity || 0 },
		{ subject: "Founder Market Fit", value: scoring.founderMarketFit || 0 },
		{
			subject: "Technical Feasibility",
			value: scoring.technicalFeasibility || 0,
		},
		{
			subject: "Monetization Potential",
			value: scoring.monetizationPotential || 0,
		},
		{ subject: "Urgency Score", value: scoring.urgencyScore || 0 },
		{ subject: "Market Timing", value: scoring.marketTimingScore || 0 },
		{
			subject: "Execution Difficulty",
			value: 10 - (scoring.executionDifficulty || 5),
		},
		{ subject: "Moat Strength", value: scoring.moatStrength || 0 },
		{ subject: "Regulatory Risk", value: 10 - (scoring.regulatoryRisk || 5) },
	];

	// Prepare financial projections bar chart data
	const financialProjections = safeGet(
		fullData,
		["monetization", "financialProjections"],
		[],
	);
	const financialData = financialProjections.map((proj: any) => ({
		year: `Year ${proj.year}`,
		revenue: proj.revenue / 1000000,
		costs: proj.costs / 1000000,
		profit: (proj.revenue - proj.costs) / 1000000,
	}));

	// Mock data for the AI chat interface compatibility
	const chatIdea = {
		id: idea.id,
		title: idea.title,
		description: idea.description,
		ideaScore: {
			totalScore: scoring.totalScore || idea.confidenceScore,
			problemSeverity: scoring.problemSeverity || 0,
			technicalFeasibility: scoring.technicalFeasibility || 0,
			monetizationPotential: scoring.monetizationPotential || 0,
			moatStrength: scoring.moatStrength || 0,
		},
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Back Navigation */}
			<div className="mx-auto max-w-7xl px-4 py-4">
				<a
					href="/mined-nuggets"
					className="text-muted-foreground text-sm transition-colors hover:text-foreground"
				>
					← Back to Mined Nuggets
				</a>
			</div>

			{/* Main Title Area */}
			<div className="mx-auto max-w-7xl px-4 pb-8 text-center">
				<div className="mb-10 flex items-end justify-center">
					<Image src="/logo.webp" alt="Mined nugget" width={100} height={100} />
					<h1 className="mb-6 ml-2 font-bold font-mono text-3xl text-amber-600">
						YOUR MINED NUGGET ⛏️
					</h1>
				</div>
				<h2 className="mb-4 font-bold text-4xl text-foreground">
					{idea.title}
				</h2>
				<div className="mx-auto mb-6 max-w-4xl border-border border-b-2 pb-4 text-amber-600 text-lg italic">
					"{idea.narrativeHook}"
					{idea.tags && idea.tags.length > 0 && (
						<div className="mt-4 flex items-center justify-center gap-2">
							<div className="flex flex-wrap gap-2">
								{idea.tags.map((tag) => (
									<span
										key={`tag-${tag}`}
										className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 font-medium text-amber-700 text-sm"
									>
										{tag}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
				<div className="mx-auto mb-8 max-w-4xl text-left text-base text-muted-foreground">
					{idea.description}
				</div>

				{/* Original Prompt Display */}
				<div className="mx-auto mb-8 flex max-w-4xl items-center justify-center gap-2 rounded-lg border bg-muted/50 p-4">
					<h4 className="mb-2 flex items-center gap-2 font-semibold">
						💡 Original Prompt:
						<span className="text-sm italic">"{idea.prompt}"</span>
					</h4>
				</div>

				{/* Badges */}
				<div className="mb-6 flex flex-wrap justify-center gap-3">
					<span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 font-semibold text-amber-700 text-xs uppercase tracking-wide">
						⛏️ User Generated
					</span>
					<span className="rounded-full border border-orange-300 bg-orange-100 px-3 py-1 font-semibold text-orange-700 text-xs uppercase tracking-wide">
						🧠 AI Analyzed
					</span>
					<span className="rounded-full border border-green-300 bg-green-100 px-3 py-1 font-semibold text-green-700 text-xs uppercase tracking-wide">
						📈 {idea.confidenceScore}% Confidence
					</span>
				</div>

				{/* Generated Date */}
				<div className="text-muted-foreground text-sm">
					Generated on {new Date(idea.createdAt).toLocaleDateString()}
				</div>
			</div>

			{/* Main Content Layout */}
			<div className="mx-auto max-w-7xl px-4 pb-16">
				<div className="flex flex-col items-start gap-8 lg:flex-row">
					{/* Left Column */}
					<div className="min-w-0 flex-2 space-y-8">
						{/* Prospector's Brief */}
						<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
							<h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
								📖 Prospector's Brief
							</h3>
							<div className="space-y-4 p-6">
								<div>
									<h4 className="mb-2 font-semibold text-foreground">
										Problem Statement:
									</h4>
									<p className="text-muted-foreground">
										{idea.problemStatement}
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-foreground">
										Executive Summary:
									</h4>
									<p className="text-muted-foreground">
										{idea.executiveSummary}
									</p>
								</div>
							</div>
						</div>

						{/* The Claim (Why Now?) */}
						{fullData.trends && (
							<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
								<h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
									🌟 The Claim (Why Now?)
								</h3>
								<div className="space-y-4 p-6">
									<h4 className="font-semibold text-foreground">
										{fullData.trends.title}
									</h4>
									<div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
										<span className="rounded bg-primary/10 px-3 py-1 font-semibold text-primary text-sm">
											{(fullData.trends.catalystType || "MARKET_SHIFT").replace(
												/_/g,
												" ",
											)}
										</span>
										<div className="flex gap-4 font-medium text-sm">
											<span>
												Strength: {fullData.trends.trendStrength || 0}/10
											</span>
											<span>
												Urgency: {fullData.trends.timingUrgency || 0}/10
											</span>
										</div>
									</div>
									<p className="text-muted-foreground">
										{fullData.trends.description}
									</p>
									{fullData.trends.supportingData &&
										fullData.trends.supportingData.length > 0 && (
											<div>
												<h4 className="mb-2 font-semibold text-foreground">
													Supporting Evidence:
												</h4>
												{renderBulletPoints(fullData.trends.supportingData)}
											</div>
										)}
								</div>
							</div>
						)}

						{/* Here's What You Should Build */}
						{fullData.whatToBuild && (
							<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
								<h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
									🔧 Here's What You Should Build
								</h3>
								<div className="space-y-6 p-6">
									{/* Platform Description */}
									<div>
										<h4 className="mb-2 font-semibold text-foreground">
											Platform Overview:
										</h4>
										<p className="text-muted-foreground">
											{fullData.whatToBuild.platformDescription}
										</p>
									</div>

									{/* Core Features */}
									{fullData.whatToBuild.coreFeaturesSummary &&
										fullData.whatToBuild.coreFeaturesSummary.length > 0 && (
											<div>
												<h4 className="mb-3 font-semibold text-foreground">
													Core Features for MVP:
												</h4>
												<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
													{fullData.whatToBuild.coreFeaturesSummary.map(
														(feature: string, index: number) => (
															<div
																key={`feature-${feature}`}
																className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-3"
															>
																<div className="min-w-fit rounded bg-primary/10 px-2 py-1 font-semibold text-primary text-xs">
																	#{index + 1}
																</div>
																<span className="text-muted-foreground text-sm">
																	{feature}
																</span>
															</div>
														),
													)}
												</div>
											</div>
										)}

									{/* User Interfaces */}
									{fullData.whatToBuild.userInterfaces &&
										fullData.whatToBuild.userInterfaces.length > 0 && (
											<div>
												<h4 className="mb-3 font-semibold text-foreground">
													Recommended User Interfaces:
												</h4>
												<div className="flex flex-wrap gap-2">
													{fullData.whatToBuild.userInterfaces.map(
														(ui: string) => (
															<span
																key={`ui-${ui}`}
																className="w-full rounded-sm p-3 font-medium text-primary-foreground text-sm"
															>
																🖥️ {ui}
															</span>
														),
													)}
												</div>
											</div>
										)}

									{/* Key Integrations */}
									{fullData.whatToBuild.keyIntegrations &&
										fullData.whatToBuild.keyIntegrations.length > 0 && (
											<div>
												<h4 className="mb-3 font-semibold text-foreground">
													Essential Third-Party Integrations:
												</h4>
												<div className="flex flex-wrap gap-2">
													{fullData.whatToBuild.keyIntegrations.map(
														(integration: string) => (
															<span
																key={`integration-${integration}`}
																className="w-full rounded-sm p-3 font-medium text-primary-foreground text-sm"
															>
																🔗 {integration}
															</span>
														),
													)}
												</div>
											</div>
										)}

									{/* Pricing Implementation */}
									{fullData.whatToBuild.pricingStrategyBuildRecommendation && (
										<div className="rounded-lg border border-border p-4">
											<h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
												💳 Technical Pricing Implementation:
											</h4>
											<p className="text-muted-foreground text-sm">
												{
													fullData.whatToBuild
														.pricingStrategyBuildRecommendation
												}
											</p>
										</div>
									)}
								</div>
							</div>
						)}

						{/* The Vein (Market Gap) */}
						{fullData.problemGaps &&
							fullData.problemGaps.gaps &&
							fullData.problemGaps.gaps.length > 0 && (
								<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
									<h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
										🗺️ The Vein (Market Gap)
									</h3>
									<div className="space-y-4 p-6">
										{fullData.problemGaps.gaps.map((gap: any) => (
											<div
												key={`gap-${gap}`}
												className="border-border border-b pb-4 last:border-b-0"
											>
												<h4 className="font-semibold text-foreground">
													{gap.title}
												</h4>
												<p className="mb-2 text-muted-foreground">
													<strong>Description:</strong> {gap.description}
												</p>
												<p className="mb-2 text-muted-foreground">
													<strong>Impact:</strong> {gap.impact}
												</p>
												<p className="mb-2 text-muted-foreground">
													<strong>Target:</strong> {gap.target}
												</p>
												<p className="text-muted-foreground">
													<strong>Opportunity:</strong> {gap.opportunity}
												</p>
											</div>
										))}
									</div>
								</div>
							)}

						{/* Competitive Landscape */}
						{fullData.competitive && fullData.competitive.competition && (
							<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
								<h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
									⚔️ Competitive Landscape
								</h3>
								<div className="space-y-6 p-6">
									<div className="rounded-lg border border-border bg-muted/50 p-4">
										<div className="mb-2 flex items-center gap-2">
											<h4 className="font-semibold text-foreground">
												Market Concentration
											</h4>
											<span
												className={`rounded px-2 py-1 font-semibold text-xs ${
													fullData.competitive.competition
														.marketConcentrationLevel === "HIGH"
														? "bg-red-100 text-red-700"
														: fullData.competitive.competition
																	.marketConcentrationLevel === "MEDIUM"
															? "bg-yellow-100 text-yellow-700"
															: "bg-green-100 text-green-700"
												}`}
											>
												{fullData.competitive.competition
													.marketConcentrationLevel || "MEDIUM"}
											</span>
										</div>
										<p className="text-muted-foreground text-sm">
											{
												fullData.competitive.competition
													.marketConcentrationJustification
											}
										</p>
									</div>

									{/* Competitor Tabs */}
									<Tabs
										value={competitorTab}
										onValueChange={(value) =>
											setCompetitorTab(value as "direct" | "indirect")
										}
									>
										<TabsList>
											<TabsTrigger value="direct">
												Direct Competitors
											</TabsTrigger>
											<TabsTrigger value="indirect">
												Indirect Competitors
											</TabsTrigger>
										</TabsList>

										<TabsContent value="direct" className="space-y-4">
											{fullData?.competitive?.competition?.directCompetitors?.map(
												(competitor: any) => (
													<div
														key={`direct-${competitor}`}
														className="rounded-lg border border-border bg-muted/30 p-4"
													>
														<h4 className="mb-2 font-semibold text-foreground">
															{competitor.name}
														</h4>
														<p className="mb-3 text-muted-foreground text-sm">
															{competitor.justification}
														</p>
														<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
															<div>
																<h5 className="mb-2 font-semibold text-green-700 text-sm">
																	Strengths:
																</h5>
																{renderBulletPoints(
																	competitor.strengths,
																	"No strengths listed",
																)}
															</div>
															<div>
																<h5 className="mb-2 font-semibold text-red-700 text-sm">
																	Weaknesses:
																</h5>
																{renderBulletPoints(
																	competitor.weaknesses,
																	"No weaknesses listed",
																)}
															</div>
														</div>
													</div>
												),
											)}
										</TabsContent>

										<TabsContent value="indirect" className="space-y-4">
											{fullData?.competitive?.competition?.indirectCompetitors?.map(
												(competitor: any) => (
													<div
														key={`indirect-${competitor}`}
														className="rounded-lg border border-border bg-muted/30 p-4"
													>
														<h4 className="mb-2 font-semibold text-foreground">
															{competitor.name}
														</h4>
														<p className="text-muted-foreground text-sm">
															{competitor.justification}
														</p>
													</div>
												),
											)}
										</TabsContent>
									</Tabs>
								</div>
							</div>
						)}

						{/* Monetization Strategy */}
						{fullData.monetization && (
							<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
								<h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
									💰 Monetization Strategy
								</h3>
								<div className="space-y-6 p-6">
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<div className="rounded-lg border border-border bg-muted/50 p-4">
											<h4 className="mb-1 font-semibold text-foreground">
												Primary Model
											</h4>
											<p className="text-muted-foreground text-sm">
												{fullData.monetization.primaryModel}
											</p>
										</div>
										<div className="rounded-lg border border-border bg-muted/50 p-4">
											<h4 className="mb-1 font-semibold text-foreground">
												Pricing Strategy
											</h4>
											<p className="text-muted-foreground text-sm">
												{fullData.monetization.pricingStrategy}
											</p>
										</div>
									</div>

									{/* Revenue Streams */}
									{fullData.monetization.revenueStreams &&
										fullData.monetization.revenueStreams.length > 0 && (
											<div>
												<h4 className="mb-3 font-semibold text-foreground">
													Revenue Stream Breakdown:
												</h4>
												<div className="space-y-3">
													{fullData.monetization.revenueStreams.map(
														(stream: any) => (
															<div
																key={`stream-${stream}`}
																className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
															>
																<div>
																	<span className="font-semibold text-foreground">
																		{stream.name}
																	</span>
																	<p className="text-muted-foreground text-sm">
																		{stream.description}
																	</p>
																</div>
																<span className="rounded bg-primary/10 px-3 py-1 font-semibold text-primary text-sm">
																	{stream.percentage}%
																</span>
															</div>
														),
													)}
												</div>
											</div>
										)}

									{/* Key Metrics */}
									{fullData.monetization.keyMetrics && (
										<div>
											<h4 className="mb-3 font-semibold text-foreground">
												Key Metrics:
											</h4>
											<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
												<div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
													<div className="font-semibold text-lg text-primary">
														{formatCurrency(
															fullData.monetization.keyMetrics.ltv,
														)}
													</div>
													<div className="text-muted-foreground text-xs">
														LTV
													</div>
												</div>
												<div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
													<div className="font-semibold text-lg text-primary">
														{formatCurrency(
															fullData.monetization.keyMetrics.cac,
														)}
													</div>
													<div className="text-muted-foreground text-xs">
														CAC
													</div>
												</div>
												<div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
													<div className="font-semibold text-lg text-primary">
														{fullData.monetization.keyMetrics.ltvCacRatio}:1
													</div>
													<div className="text-muted-foreground text-xs">
														LTV:CAC
													</div>
												</div>
												<div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
													<div className="font-semibold text-lg text-primary">
														{fullData.monetization.keyMetrics.paybackPeriod}mo
													</div>
													<div className="text-muted-foreground text-xs">
														Payback
													</div>
												</div>
											</div>

											<div className="mt-4 space-y-2 text-sm">
												<p>
													<strong>LTV:</strong>{" "}
													{fullData.monetization.keyMetrics.ltvDescription}
												</p>
												<p>
													<strong>CAC:</strong>{" "}
													{fullData.monetization.keyMetrics.cacDescription}
												</p>
												<p>
													<strong>LTV:CAC Ratio:</strong>{" "}
													{
														fullData.monetization.keyMetrics
															.ltvCacRatioDescription
													}
												</p>
												<p>
													<strong>Payback Period:</strong>{" "}
													{
														fullData.monetization.keyMetrics
															.paybackPeriodDescription
													}
												</p>
												<p>
													<strong>Runway:</strong>{" "}
													{fullData.monetization.keyMetrics.runwayDescription}
												</p>
												<p>
													<strong>Break-Even Point:</strong>{" "}
													{
														fullData.monetization.keyMetrics
															.breakEvenPointDescription
													}
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Execution & Validation */}
						<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
							<h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
								🛠️ Execution & Validation
							</h3>
							<div className="space-y-6 p-6">
								{fullData.executionPlan && (
									<div>
										<h4 className="mb-2 font-semibold text-foreground">
											Execution Plan:
										</h4>
										<p className="text-muted-foreground">
											{fullData.executionPlan}
										</p>
									</div>
								)}

								{fullData.tractionSignals && (
									<div>
										<h4 className="mb-2 font-semibold text-foreground">
											Traction Signals:
										</h4>
										<p className="text-muted-foreground">
											{fullData.tractionSignals}
										</p>
									</div>
								)}

								{fullData.frameworkFit && (
									<div>
										<h4 className="mb-2 font-semibold text-foreground">
											Framework Fit:
										</h4>
										<p className="text-muted-foreground">
											{fullData.frameworkFit}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Chat-style Interrogate Section */}
						<NuggetChat idea={chatIdea as any} />
					</div>

					{/* Right Column - Sidebar */}
					<div className="sticky top-24 w-full flex-1 space-y-6 lg:max-w-sm">
						{/* Assay Report */}
						<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
							<h3 className="border-border border-b bg-muted/50 px-4 py-3 font-semibold text-foreground text-lg">
								📊 Summarized Report
							</h3>
							<div className="space-y-4 p-4">
								<div className="rounded-lg border border-border bg-muted/50 p-4">
									<div className="mb-3 flex justify-between text-muted-foreground text-sm">
										<span>Opportunity</span>
										<span>Feasibility</span>
										<span>Defensibility</span>
									</div>
									<div className="flex justify-between font-semibold text-green-600 text-lg">
										<span>{scoring.monetizationPotential || 0}/10</span>
										<span>{scoring.technicalFeasibility || 0}/10</span>
										<span>{scoring.moatStrength || 0}/10</span>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-3 rounded border border-border bg-muted/50 p-2">
										<span>💡</span>
										<span className="text-sm">
											Innovation Level: {fullData.innovationLevel || 0}/10
										</span>
									</div>
									<div className="flex items-center gap-3 rounded border border-border bg-muted/50 p-2">
										<span>⏱️</span>
										<span className="text-sm">
											Time to Market: {fullData.timeToMarket || 0} months
										</span>
									</div>
									<div className="flex items-center gap-3 rounded border border-border bg-muted/50 p-2">
										<span>🔥</span>
										<span className="text-sm">
											Urgency Level: {fullData.urgencyLevel || 0}/10
										</span>
									</div>
									<div className="flex items-center gap-3 rounded border border-border bg-muted/50 p-2">
										<span>🏗️</span>
										<span className="text-sm">
											Execution Complexity: {fullData.executionComplexity || 0}
											/10
										</span>
									</div>
									<div className="flex items-center gap-3 rounded border border-border bg-muted/50 p-2">
										<span>✅</span>
										<span className="text-sm">
											Confidence Score: {idea.confidenceScore}/10
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Strategic Position */}
						{fullData.competitive && fullData.competitive.positioning && (
							<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
								<h3 className="border-border border-b bg-muted/50 px-4 py-3 font-semibold text-foreground text-lg">
									🏆 Strategic Position
								</h3>
								<div className="space-y-3 p-4">
									<h4 className="font-semibold text-foreground">
										{fullData.competitive.positioning.name}
									</h4>
									<p className="text-sm">
										<strong>Target Segment:</strong>{" "}
										{fullData.competitive.positioning.targetSegment}
									</p>
									<p className="text-sm">
										<strong>Value Proposition:</strong>{" "}
										{fullData.competitive.positioning.valueProposition}
									</p>
								</div>
							</div>
						)}

						{/* Key Differentiators */}
						{fullData.competitive &&
							fullData.competitive.positioning &&
							fullData.competitive.positioning.keyDifferentiators &&
							fullData.competitive.positioning.keyDifferentiators.length >
								0 && (
								<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
									<h3 className="border-border border-b bg-muted/50 px-4 py-3 font-semibold text-foreground text-lg">
										✨ Key Differentiators
									</h3>
									<div className="p-4">
										{renderBulletPoints(
											fullData.competitive.positioning.keyDifferentiators,
										)}
									</div>
								</div>
							)}

						{/* Idea Score Radar Chart */}
						<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
							<h3 className="border-border border-b bg-muted/50 px-4 py-3 font-semibold text-foreground text-lg">
								📊 IDEA SCORE RADAR CHART
							</h3>
							<div className="space-y-4 p-4">
								<div className="rounded-lg border border-border bg-muted/50 p-3 text-center text-primary">
									<strong>
										Overall Idea Score:{" "}
										{scoring.totalScore || idea.confidenceScore}/100
									</strong>
								</div>

								<div className="space-y-2 text-sm">
									<div className="flex justify-between border-border border-b pb-1">
										<span>Problem Severity:</span>
										<span>{scoring.problemSeverity || 0}</span>
									</div>
									<div className="flex justify-between border-border border-b pb-1">
										<span>Founder Market Fit:</span>
										<span>{scoring.founderMarketFit || 0}</span>
									</div>
									<div className="flex justify-between border-border border-b pb-1">
										<span>Technical Feasibility:</span>
										<span>{scoring.technicalFeasibility || 0}</span>
									</div>
									<div className="flex justify-between border-border border-b pb-1">
										<span>Monetization Potential:</span>
										<span>{scoring.monetizationPotential || 0}</span>
									</div>
									<div className="flex justify-between border-border border-b pb-1">
										<span>Urgency Score:</span>
										<span>{scoring.urgencyScore || 0}</span>
									</div>
									<div className="flex justify-between border-border border-b pb-1">
										<span>Market Timing Score:</span>
										<span>{scoring.marketTimingScore || 0}</span>
									</div>
									<div className="flex justify-between border-border border-b pb-1">
										<span>Execution Difficulty:</span>
										<span>{scoring.executionDifficulty || 0}</span>
									</div>
									<div className="flex justify-between border-border border-b pb-1">
										<span>Moat Strength:</span>
										<span>{scoring.moatStrength || 0}</span>
									</div>
									<div className="flex justify-between">
										<span>Regulatory Risk:</span>
										<span>{scoring.regulatoryRisk || 0}</span>
									</div>
								</div>

								<div className="min-h-[300px] rounded-lg border border-border bg-muted/50">
									<ChartContainer
										config={{
											score: { label: "Score", color: "#ea580c" },
										}}
										className="h-[280px]"
									>
										<RadarChart
											data={radarData}
											className="-ml-10 lg:-ml-20 w-fit scale-90"
										>
											<PolarGrid />
											<PolarAngleAxis
												dataKey="subject"
												tick={{ fontSize: 10 }}
											/>
											<PolarRadiusAxis
												angle={90}
												domain={[0, 10]}
												tick={{ fontSize: 8 }}
											/>
											<Radar
												name="Score"
												dataKey="value"
												stroke="#ea580c"
												fill="#ea580c"
												fillOpacity={0.3}
												strokeWidth={2}
												className=""
											/>
											<ChartTooltip content={<ChartTooltipContent />} />
										</RadarChart>
									</ChartContainer>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MinedNuggetDetailsView;
