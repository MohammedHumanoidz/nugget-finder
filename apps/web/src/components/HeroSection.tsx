"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowDown, ArrowRight, CheckCircle2, Hourglass } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import PersonalizationModal, {
	type PersonalizationData,
} from "@/components/PersonalizationModal";
import { PersonalizationPromptDialog } from "@/components/PersonalizationPromptDialog";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// Generate a simple session ID for non-auth users
function generateSessionId(): string {
	return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function HeroSection() {
	const [query, setQuery] = useState("");
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const [showPersonalizationPrompt, setShowPersonalizationPrompt] =
		useState(false);
	const [showPersonalizationModal, setShowPersonalizationModal] =
		useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const generateIdeas = useMutation(
		trpc.ideas.generateOnDemand.mutationOptions({
			onSuccess: (data: { requestId: string }) => {
				// Redirect to results page
				router.push(`/browse/results/${data.requestId}`);
			},
			onError: (error: any) => {
				console.error("Failed to generate ideas:", error);

				// Handle search limit exceeded error
				if (error.message?.includes("SEARCH_LIMIT_EXCEEDED")) {
					const cleanMessage = error.message.split(":")[1] || error.message;
					toast.error(cleanMessage);
				} else {
					toast.error("Failed to generate ideas. Please try again.");
				}
				setIsGenerating(false);
			},
		}),
	);

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const q = query.trim();
		if (!q) {
			toast.error("Please enter a search query");
			return;
		}

		// Show personalization prompt dialog
		setShowPersonalizationPrompt(true);
	};

	const handlePersonalizationYes = () => {
		setShowPersonalizationPrompt(false);
		setShowPersonalizationModal(true);
	};

	const handlePersonalizationNo = () => {
		setShowPersonalizationPrompt(false);
		// Proceed with generation without personalization
		generateIdeasWithPersonalization(undefined);
	};

	const handlePersonalizationSave = (personalization: PersonalizationData) => {
		setShowPersonalizationModal(false);
		// Proceed with generation with personalization data
		generateIdeasWithPersonalization(personalization);
	};

	const handlePersonalizationSkip = () => {
		setShowPersonalizationModal(false);
		// Proceed with generation without personalization
		generateIdeasWithPersonalization(undefined);
	};

	const generateIdeasWithPersonalization = async (
		personalization?: PersonalizationData,
	) => {
		setIsGenerating(true);

		try {
			const sessionId = session?.user?.id || generateSessionId();

			await generateIdeas.mutateAsync({
				query: query.trim(),
				count: 3,
				personalization,
				sessionId: !session?.user?.id ? sessionId : undefined,
			});
		} catch (error) {
			// Error handling is done in the mutation onError callback
		}
	};

	const scrollToNextSection = () => {
		const nextSection = document.querySelector("#featured-nuggets");
		if (nextSection) {
			nextSection.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<>
			<section className="relative w-full overflow-hidden">
				{/* Background animated trend lines */}
				<div aria-hidden className="-z-10 pointer-events-none absolute inset-0">
					<svg
						aria-hidden="true"
						role="presentation"
						focusable="false"
						className="-translate-x-1/2 absolute top-0 left-1/2 h-[120%] w-[120%] opacity-[0.08] dark:opacity-[0.12]"
						viewBox="0 0 800 600"
						fill="none"
					>
						<path
							d="M0,500 C150,420 250,460 400,400 C550,340 650,360 800,300"
							stroke="currentColor"
							strokeWidth="2"
							className="text-foreground/40"
						>
							<animate
								attributeName="d"
								dur="6s"
								repeatCount="indefinite"
								values="M0,500 C150,420 250,460 400,400 C550,340 650,360 800,300; M0,520 C150,440 250,430 400,420 C550,360 650,380 800,320; M0,500 C150,420 250,460 400,400 C550,340 650,360 800,300"
							/>
						</path>
					</svg>
				</div>

				<div className="mx-auto grid grid-cols-1 items-center gap-10 px-4 py-16 md:px-24 md:py-16 lg:grid-cols-2">
					{/* Left column */}
					<div>
						<h1 className="font-extrabold text-4xl text-foreground tracking-tight md:text-5xl lg:text-6xl">
							Find Your Next Big Business Opportunity{" "}
							<span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
								Before Anyone Else
							</span>
						</h1>
						<p className="mt-4 max-w-xl text-lg text-muted-foreground">
							We scan 1,200+ market signals daily to uncover high-purity,
							ready-to-mine startup ideas — before the rest of the world catches
							on.
						</p>

						{/* Search bar */}
						<form onSubmit={onSubmit} className="mt-8">
							<div className="flex w-full flex-col gap-3 sm:flex-row">
								<Input
									aria-label="Search ideas"
									placeholder="What do you want to build?"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									className="h-12 rounded-xl shadow-sm"
									disabled={isGenerating}
								/>
								<Button
									type="submit"
									className="h-12 rounded-xl px-6"
									disabled={isGenerating}
								>
									{isGenerating ? "Generating..." : "Find Nuggets"}{" "}
									<ArrowRight className="h-4 w-4" />
								</Button>
							</div>
						</form>

						{/* Badges */}
						<div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
							<span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-muted-foreground">
								<CheckCircle2
									className="h-4 w-4 text-emerald-500"
									aria-hidden
								/>
								No sign-up needed
							</span>
							<span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-muted-foreground">
								<Hourglass className="h-4 w-4 text-amber-500" aria-hidden />
								Well refined nuggets
							</span>
						</div>
					</div>

					{/* Right column visual */}
					<div className="relative flex items-center justify-center">
						<div className="relative">
							<Image
								src="/geometric-miner-with-glowing-crystal.png"
								alt="Miner illustration holding a glowing nugget"
								width={560}
								height={560}
								priority
								className="drop-shadow-xl"
							/>
						</div>
					</div>
				</div>

				{/* Bottom gradient fade */}
				<div
					aria-hidden
					className="-mt-6 pointer-events-none relative h-16 w-full bg-gradient-to-b from-transparent to-background"
				/>

				{/* Blinking Arrow Down CTA */}
				<div className="-translate-x-1/2 absolute bottom-8 left-1/2 flex flex-col items-center gap-2">
					<span className="font-medium text-sm">
						Checkout our featured nuggets updated daily
					</span>
					<Button
						size={"icon"}
						variant={"ghost"}
						onClick={scrollToNextSection}
						className="group flex flex-col items-center gap-2 rounded-full border-primary text-muted-foreground hover:text-foreground"
						aria-label="Scroll to featured nuggets"
					>
						<ArrowDown className="h-6 w-6 animate-bounce transition-colors group-hover:text-primary" />
					</Button>
				</div>
			</section>

			{/* Dialogs */}
			<PersonalizationPromptDialog
				open={showPersonalizationPrompt}
				onOpenChange={setShowPersonalizationPrompt}
				onYes={handlePersonalizationYes}
				onNo={handlePersonalizationNo}
			/>

			<PersonalizationModal
				isOpen={showPersonalizationModal}
				onClose={handlePersonalizationSkip}
				onSave={handlePersonalizationSave}
			/>
		</>
	);
}
