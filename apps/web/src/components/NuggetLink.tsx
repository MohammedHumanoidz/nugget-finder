"use client";

import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useNonAuthViewTracker } from "@/hooks/useNonAuthViewTracker";
import { authClient } from "@/lib/auth-client";
import { useNavigationLoader } from "@/hooks/use-navigation-loader";

interface NuggetLinkProps {
	ideaId: string;
	children: React.ReactNode;
	className?: string;
}

export default function NuggetLink({
	ideaId,
	children,
	className,
}: NuggetLinkProps) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const isAuthenticated = !!session?.user;

	const { isLoaded, hasViewedIdea, canViewNewIdea, getRemainingViews } =
		useNonAuthViewTracker();

	const [showUpgradeModal, setShowUpgradeModal] = useState(false);
	const { startLoading } = useNavigationLoader();

	const handleClick = (e: React.MouseEvent) => {
		// For authenticated users, let them navigate normally
		if (isAuthenticated) {
			startLoading("Loading nugget...");
			return; // Continue with normal navigation
		}

		// For non-authenticated users, check localStorage limits
		if (!isLoaded) {
			e.preventDefault();
			return;
		}

		const alreadyViewed = hasViewedIdea(ideaId);
		const canViewNew = canViewNewIdea();

		if (alreadyViewed || canViewNew) {
			// User can access this idea, continue with navigation
			startLoading("Loading nugget...");
			return;
		}

		// User has exceeded their limit, prevent navigation and show upgrade modal
		e.preventDefault();
		setShowUpgradeModal(true);
	};

	return (
		<>
			<Link
				href={`/nugget/${ideaId}`}
				className={className}
				onClick={handleClick}
			>
				{children}
			</Link>

			{/* Upgrade Modal for non-authenticated users who hit the limit */}
			<Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Lock className="h-5 w-5 text-amber-500" />
							You've hit your free limit!
						</DialogTitle>
						<DialogDescription>
							You've already viewed your{" "}
							{getRemainingViews() === 0 ? "free" : ""} nugget today. Want to
							explore more startup opportunities?
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3 pt-4">
						<p className="text-muted-foreground text-sm">
							🚀 Get unlimited access to our entire library of AI-generated
							startup ideas
						</p>

						<div className="flex flex-col gap-2">
							<Button asChild className="w-full">
								<Link
									href="/pricing"
									onClick={() => setShowUpgradeModal(false)}
								>
									View Pricing Plans <ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>

							<Button variant="outline" asChild className="w-full">
								<Link
									href="/auth/sign-in"
									onClick={() => setShowUpgradeModal(false)}
								>
									Sign In Instead
								</Link>
							</Button>
						</div>

						<p className="text-center text-muted-foreground text-xs">
							Already have an account? Sign in to access your subscription
							benefits.
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
