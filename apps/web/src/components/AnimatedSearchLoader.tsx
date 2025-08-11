"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type AnimationState =
	| "preparing"
	| "researching"
	| "building"
	| "finalizing"
	| "found";

interface AnimatedSearchLoaderProps {
	searchQuery: string;
	onAnimationComplete?: () => void;
	progressMessage?: string;
	imageState?: string;
	currentStep?: string;
}

// Dynamic word lists for each step to make it feel alive
const STEP_WORD_LISTS = {
	Initializing: [
		"Initializing",
		"Preparing",
		"Loading",
		"Starting",
		"Beginning",
		"Launching",
		"Activating",
		"Booting",
		"Setting up",
		"Powering up",
	],
	Starting: [
		"Initializing",
		"Preparing",
		"Loading",
		"Starting",
		"Beginning",
		"Launching",
		"Activating",
		"Booting",
		"Setting up",
		"Powering up",
	],
	"Research Direction": [
		"Strategizing",
		"Planning",
		"Analyzing direction",
		"Setting course",
		"Mapping strategy",
		"Defining scope",
		"Outlining approach",
		"Charting path",
		"Designing framework",
		"Establishing focus",
	],
	"Trend Research": [
		"Scanning markets",
		"Tracking trends",
		"Analyzing patterns",
		"Monitoring signals",
		"Studying movements",
		"Observing shifts",
		"Detecting changes",
		"Mapping dynamics",
		"Exploring frontiers",
		"Investigating waves",
	],
	"Problem Analysis": [
		"Identifying gaps",
		"Finding problems",
		"Uncovering pain points",
		"Discovering opportunities",
		"Spotting issues",
		"Detecting friction",
		"Analyzing bottlenecks",
		"Exploring challenges",
		"Mapping inefficiencies",
		"Investigating barriers",
	],
	"Competitive Analysis": [
		"Analyzing competitors",
		"Studying landscape",
		"Mapping players",
		"Researching market",
		"Evaluating competition",
		"Investigating rivals",
		"Assessing market position",
		"Benchmarking solutions",
		"Profiling leaders",
		"Examining strategies",
	],
	"Monetization Strategy": [
		"Designing revenue",
		"Planning monetization",
		"Structuring pricing",
		"Building business model",
		"Creating value streams",
		"Optimizing revenue",
		"Calculating pricing",
		"Modeling financials",
		"Strategizing income",
		"Forecasting earnings",
	],
	"Technical Planning": [
		"Architecting solution",
		"Designing system",
		"Planning features",
		"Blueprinting platform",
		"Structuring product",
		"Outlining MVP",
		"Mapping functionality",
		"Defining specs",
		"Creating roadmap",
		"Building framework",
	],
	"Idea Synthesis": [
		"Synthesizing insights",
		"Combining elements",
		"Creating concepts",
		"Merging findings",
		"Generating ideas",
		"Crafting solutions",
		"Blending research",
		"Forming opportunities",
		"Weaving together",
		"Connecting dots",
	],
	Evaluation: [
		"Scoring opportunities",
		"Evaluating potential",
		"Ranking ideas",
		"Assessing viability",
		"Measuring impact",
		"Calculating scores",
		"Analyzing feasibility",
		"Reviewing concepts",
		"Validating ideas",
		"Testing assumptions",
	],
	"Critical Review": [
		"Evaluating feasibility",
		"Testing assumptions",
		"Challenging ideas",
		"Refining concepts",
		"Validating approaches",
		"Scrutinizing details",
		"Improving quality",
		"Strengthening position",
		"Enhancing value",
		"Optimizing potential",
	],
	"Final Refinement": [
		"Polishing concepts",
		"Perfecting details",
		"Finalizing structure",
		"Enhancing clarity",
		"Optimizing presentation",
		"Completing synthesis",
		"Adding finishing touches",
		"Ensuring quality",
		"Maximizing impact",
		"Preparing delivery",
	],
	"Saving Results": [
		"Securing nuggets",
		"Preserving insights",
		"Storing treasures",
		"Cataloging gems",
		"Archiving discoveries",
		"Safeguarding ideas",
		"Banking opportunities",
		"Collecting results",
		"Vaulting findings",
		"Harvesting gold",
	],
	Complete: [
		"Mission accomplished",
		"Discovery complete",
		"Nuggets secured",
		"Treasures found",
		"Goals achieved",
		"Success delivered",
		"Opportunities unlocked",
		"Gold discovered",
		"Value created",
		"Ready to explore",
	],
	Failed: [
		"Encountered obstacles",
		"Facing challenges",
		"Temporary setback",
		"Need to regroup",
		"Adjusting approach",
		"Exploring alternatives",
		"Refining strategy",
		"Learning from data",
		"Preparing retry",
		"Analyzing feedback",
	],
	// New mappings for idea generation steps
	"Generating idea 1/3": [
		"Crafting first opportunity",
		"Building concept 1",
		"Developing idea 1",
		"Creating first nugget",
		"Forging opportunity 1",
		"Sculpting concept 1",
		"Engineering idea 1",
		"Designing solution 1",
		"Constructing vision 1",
		"Innovating concept 1",
	],
	"Generating idea 2/3": [
		"Crafting second opportunity",
		"Building concept 2",
		"Developing idea 2",
		"Creating second nugget",
		"Forging opportunity 2",
		"Sculpting concept 2",
		"Engineering idea 2",
		"Designing solution 2",
		"Constructing vision 2",
		"Innovating concept 2",
	],
	"Generating idea 3/3": [
		"Crafting final opportunity",
		"Building concept 3",
		"Developing idea 3",
		"Creating final nugget",
		"Forging opportunity 3",
		"Sculpting concept 3",
		"Engineering idea 3",
		"Designing solution 3",
		"Constructing vision 3",
		"Innovating concept 3",
	],
};

// Simple particle component for subtle effects
const Particles = ({
	show,
	type,
}: {
	show: boolean;
	type: "dust" | "sparkle";
}) => {
	if (!show) return null;

	const particleCount = type === "dust" ? 6 : 8;

	return (
		<div className="pointer-events-none absolute inset-0">
			{Array.from({ length: particleCount }, (_, i) => (
				<motion.div
					key={`${type}-particle-${i}-${Math.random().toString(36).substr(2, 5)}`}
					className={`absolute h-1 w-1 rounded-full ${
						type === "dust" ? "bg-muted-foreground" : "bg-primary"
					}`}
					style={{
						left: `${45 + Math.random() * 10}%`,
						top: `${55 + Math.random() * 10}%`,
					}}
					animate={{
						y: [0, -20, -40],
						opacity: [0, 0.6, 0],
						scale: [0.5, 1, 0],
					}}
					transition={{
						duration: 2,
						delay: i * 0.2,
						repeat: Number.POSITIVE_INFINITY,
						repeatType: "loop",
					}}
				/>
			))}
		</div>
	);
};

// Dynamic word animation component
const DynamicWordAnimation = ({
	step,
	isActive,
}: {
	step: string;
	isActive: boolean;
}) => {
	const [currentWordIndex, setCurrentWordIndex] = useState(0);
	const [displayText, setDisplayText] = useState("");

	// Get words for the current step
	const getWordsForStep = (stepName: string) => {
		// First try exact match
		if (STEP_WORD_LISTS[stepName as keyof typeof STEP_WORD_LISTS]) {
			return STEP_WORD_LISTS[stepName as keyof typeof STEP_WORD_LISTS];
		}

		// Handle idea generation steps with pattern matching
		if (stepName.includes("Generating idea") && /\d\/\d/.test(stepName)) {
			// Extract the current idea number
			const match = stepName.match(/Generating idea (\d)\/(\d)/);
			if (match) {
				const currentIdea = match[1];
				const totalIdeas = match[2];

				// Use dynamic generation words based on idea number
				if (currentIdea === "1") {
					return [
						"Crafting first opportunity",
						"Building concept 1",
						"Developing idea 1",
						"Creating first nugget",
						"Forging opportunity 1",
						"Sculpting concept 1",
						"Engineering idea 1",
						"Designing solution 1",
						"Constructing vision 1",
						"Innovating concept 1",
					];
				}
				if (currentIdea === "2") {
					return [
						"Crafting second opportunity",
						"Building concept 2",
						"Developing idea 2",
						"Creating second nugget",
						"Forging opportunity 2",
						"Sculpting concept 2",
						"Engineering idea 2",
						"Designing solution 2",
						"Constructing vision 2",
						"Innovating concept 2",
					];
				}
				if (currentIdea === "3") {
					return [
						"Crafting final opportunity",
						"Building concept 3",
						"Developing idea 3",
						"Creating final nugget",
						"Forging opportunity 3",
						"Sculpting concept 3",
						"Engineering idea 3",
						"Designing solution 3",
						"Constructing vision 3",
						"Innovating concept 3",
					];
				}
				return [
					`Crafting opportunity ${currentIdea}`,
					`Building concept ${currentIdea}`,
					`Developing idea ${currentIdea}`,
					`Creating nugget ${currentIdea}`,
					`Forging opportunity ${currentIdea}`,
					`Sculpting concept ${currentIdea}`,
					`Engineering idea ${currentIdea}`,
					`Designing solution ${currentIdea}`,
					`Constructing vision ${currentIdea}`,
					`Innovating concept ${currentIdea}`,
				];
			}
		}

		// Find matching key with fuzzy matching
		const matchingKey = Object.keys(STEP_WORD_LISTS).find(
			(key) =>
				stepName.toLowerCase().includes(key.toLowerCase()) ||
				key.toLowerCase().includes(stepName.toLowerCase()),
		);

		return matchingKey
			? STEP_WORD_LISTS[matchingKey as keyof typeof STEP_WORD_LISTS]
			: STEP_WORD_LISTS["Initializing"];
	};

	const words = getWordsForStep(step);

	useEffect(() => {
		if (!isActive) {
			setDisplayText(step);
			return;
		}

		const interval = setInterval(() => {
			setCurrentWordIndex((prev) => (prev + 1) % words.length);
		}, 1500); // Change word every 1.5 seconds

		return () => clearInterval(interval);
	}, [words, isActive, step]);

	useEffect(() => {
		if (isActive && words.length > 0) {
			setDisplayText(words[currentWordIndex]);
		}
	}, [currentWordIndex, words, isActive]);

	if (!isActive) {
		return <span>{step}</span>;
	}

	return (
		<AnimatePresence mode="wait">
			<motion.span
				key={displayText}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.3 }}
				className="inline-block"
			>
				{displayText}
				<motion.span
					animate={{ opacity: [1, 0, 1] }}
					transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
					className="ml-1"
				>
					•••
				</motion.span>
			</motion.span>
		</AnimatePresence>
	);
};

export default function AnimatedSearchLoader({
	searchQuery,
	onAnimationComplete,
	progressMessage,
	imageState,
	currentStep,
}: AnimatedSearchLoaderProps) {
	const [animationState, setAnimationState] =
		useState<AnimationState>("preparing");

	// Update animation state based on current step or use timer fallback
	useEffect(() => {
		if (currentStep) {
			// Use real data to determine animation state
			if (
				currentStep.includes("Research") ||
				currentStep.includes("Starting") ||
				currentStep.includes("Direction") ||
				currentStep.includes("Initializing")
			) {
				setAnimationState("researching");
			} else if (
				currentStep.includes("Analysis") ||
				currentStep.includes("Generation") ||
				currentStep.includes("Intelligence") ||
				currentStep.includes("Monetization") ||
				currentStep.includes("Technical") ||
				currentStep.includes("Synthesis")
			) {
				setAnimationState("building");
			} else if (
				currentStep.includes("Critical") ||
				currentStep.includes("Final") ||
				currentStep.includes("Refinement") ||
				currentStep.includes("Saving")
			) {
				setAnimationState("finalizing");
			} else if (
				currentStep.includes("Complete") ||
				currentStep.includes("Finished") ||
				currentStep.includes("Evaluation") ||
				currentStep.includes("Completion")
			) {
				setAnimationState("found");
			}
		} else {
			// Fallback to timer-based animation if no real data
			const timer1 = setTimeout(() => {
				setAnimationState("building");
			}, 1500);

			const timer2 = setTimeout(() => {
				setAnimationState("found");
			}, 4000);

			const timer3 = setTimeout(() => {
				if (onAnimationComplete) {
					onAnimationComplete();
				}
			}, 6500);

			return () => {
				clearTimeout(timer1);
				clearTimeout(timer2);
				clearTimeout(timer3);
			};
		}
	}, [currentStep, onAnimationComplete]);

	// Map imageState to image files
	const getImageForState = (state?: string) => {
		switch (state) {
			case "confused":
				return "/nuggetfinder-confused.png";
			case "digging":
				return "/nuggetfinder-digging-hard.png";
			case "happy":
				return "/nuggetfinder-super-happy.png";
			case "found":
				return "/checkout-this-nugget.png";
			default:
				return "/nuggetfinder-confused.png";
		}
	};

	const content = {
		preparing: {
			image: imageState
				? getImageForState(imageState)
				: "/nuggetfinder-confused.png",
			title: currentStep || "Preparing for discovery...",
			description:
				progressMessage || "Getting ready to find amazing opportunities",
		},
		researching: {
			image: imageState
				? getImageForState(imageState)
				: "/nuggetfinder-confused.png",
			title: currentStep || "Researching the market...",
			description: progressMessage || "Looking for the best opportunities",
		},
		building: {
			image: imageState
				? getImageForState(imageState)
				: "/nuggetfinder-digging-hard.png",
			title: currentStep || "Building your ideas...",
			description:
				progressMessage || "Analyzing and crafting business opportunities",
		},
		finalizing: {
			image: imageState
				? getImageForState(imageState)
				: "/nuggetfinder-happy.png",
			title: currentStep || "Finalizing discoveries...",
			description: progressMessage || "Polishing your golden nuggets",
		},
		found: {
			image: imageState
				? getImageForState(imageState)
				: "/nuggetfinder-super-happy.png",
			title: currentStep || "Nuggets found!",
			description:
				progressMessage ||
				"These nuggets look good, might just run away with them!",
		},
	};

	// If we have dynamic data, use the current state directly
	const currentContent =
		progressMessage || currentStep
			? {
					image: getImageForState(imageState),
					title: currentStep || "Processing...",
					description: progressMessage || "Working on your request...",
				}
			: content[animationState];

	const getCharacterAnimation = () => {
		switch (animationState) {
			case "preparing":
				return {
					y: [0, -3, 0],
					rotate: [0, 0.5, -0.5, 0],
				};
			case "researching":
				return {
					y: [0, -5, 0],
					rotate: [0, 1, -1, 0],
				};
			case "building":
				return {
					y: [0, -10, 0],
					rotate: [0, 3, -3, 0],
				};
			case "finalizing":
				return {
					y: [0, -8, 0],
					scale: [1, 1.02, 1],
				};
			case "found":
				return {
					y: [0, -15, 0],
					scale: [1, 1.05, 1],
				};
			default:
				return {};
		}
	};

	// Determine if we should show dynamic word animation
	const isCurrentlyProcessing =
		currentStep &&
		!currentStep.includes("Complete") &&
		!currentStep.includes("Finished");

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
			<div className="w-full max-w-4xl space-y-8 px-4 text-center">
				<AnimatePresence mode="wait">
					<motion.div
						key={animationState}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
						className="flex flex-col items-center justify-center space-y-8"
					>
						{/* Search Query */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="space-y-2"
						>
							<p className="text-muted-foreground text-sm uppercase tracking-wide">
								Mining for
							</p>
							<h1 className="max-w-2xl font-bold text-2xl text-foreground md:text-3xl">
								"{searchQuery}"
							</h1>
						</motion.div>

						{/* Character with subtle animation */}
						<div className="relative">
							<motion.div
								animate={getCharacterAnimation()}
								transition={{
									duration: animationState === "building" ? 1.0 : 1.5,
									repeat:
										animationState === "building"
											? Number.POSITIVE_INFINITY
											: animationState === "found"
												? 2
												: 0,
									repeatType: "loop",
									ease: "easeInOut",
								}}
							>
								<Image
									src={currentContent.image}
									alt={currentContent.title}
									width={250}
									height={250}
									className="mx-auto"
									priority
								/>
							</motion.div>

							{/* Subtle particles */}
							<Particles show={animationState === "building"} type="dust" />
							<Particles show={animationState === "found"} type="sparkle" />
						</div>

						{/* Status text with dynamic word animation */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
							className="space-y-3"
						>
							<h2 className="font-bold text-3xl text-primary md:text-4xl">
								<DynamicWordAnimation
									step={currentContent.title}
									isActive={isCurrentlyProcessing || false}
								/>
							</h2>
							<p className="text-lg text-muted-foreground">
								{currentContent.description}
							</p>
						</motion.div>

						{/* Clean progress bar */}
						<motion.div
							className="mx-auto w-full max-w-md"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
						>
							<div className="h-2 overflow-hidden rounded-full bg-muted">
								<motion.div
									className="h-full rounded-full bg-primary"
									initial={{ width: 0 }}
									animate={{
										width:
											animationState === "preparing"
												? "20%"
												: animationState === "researching"
													? "40%"
													: animationState === "building"
														? "60%"
														: animationState === "finalizing"
															? "80%"
															: "100%",
									}}
									transition={{ duration: 0.8, ease: "easeInOut" }}
								/>
							</div>
							<div className="mt-2 flex justify-between text-muted-foreground text-xs">
								<span
									className={
										animationState === "preparing" ||
										animationState === "researching"
											? "font-medium text-primary"
											: ""
									}
								>
									Searching
								</span>
								<span
									className={
										animationState === "building"
											? "font-medium text-primary"
											: ""
									}
								>
									Analyzing
								</span>
								<span
									className={
										animationState === "found" ? "font-medium text-primary" : ""
									}
								>
									Complete
								</span>
							</div>
						</motion.div>

						{/* Final message */}
						{animationState === "found" && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 1.0 }}
								className="text-muted-foreground"
							>
								Time to see what treasures we've discovered! 💎
							</motion.div>
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}
