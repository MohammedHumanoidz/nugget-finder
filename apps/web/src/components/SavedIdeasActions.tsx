"use client";

import { useMutation } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";

interface SavedIdeasActionsProps {
	ideaId: string;
	isSaved: boolean;
	canSave: boolean;
	canClaim: boolean;
}

export default function SavedIdeasActions({
	ideaId,
	isSaved,
	canSave,
	canClaim,
}: SavedIdeasActionsProps) {
	const [isRemoving, setIsRemoving] = useState(false);

	// Mutations
	const unsaveIdeaMutation = useMutation(
		trpc.ideas.unsaveIdea.mutationOptions({
			onSuccess: () => {
				toast.success("Idea removed from saved!");
				// Refresh the page to show updated data
				window.location.reload();
			},
			onError: (error) => {
				toast.error(error.message);
				setIsRemoving(false);
			},
		}),
	);

	const claimIdeaMutation = useMutation(
		trpc.ideas.claimIdea.mutationOptions({
			onSuccess: () => {
				toast.success("Idea claimed!");
				// Refresh the page to show updated data
				window.location.reload();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const handleUnsaveIdea = () => {
		setIsRemoving(true);
		unsaveIdeaMutation.mutate({ ideaId });
	};

	const handleClaimIdea = () => {
		claimIdeaMutation.mutate({ ideaId });
	};

	return (
		<div className="flex w-full gap-2">
			<Button
				variant="outline"
				size="sm"
				onClick={handleUnsaveIdea}
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
				onClick={handleClaimIdea}
				disabled={!canClaim || claimIdeaMutation.isPending}
				className="flex-1"
				title={
					!canClaim ? "Upgrade for more access or unclaim another idea" : ""
				}
			>
				{claimIdeaMutation.isPending ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					"Claim"
				)}
			</Button>
		</div>
	);
}
