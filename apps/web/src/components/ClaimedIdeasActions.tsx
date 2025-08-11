"use client";

import { useMutation } from "@tanstack/react-query";
import { Bookmark, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";

interface ClaimedIdeasActionsProps {
	ideaId: string;
	canSave: boolean;
}

export default function ClaimedIdeasActions({
	ideaId,
	canSave,
}: ClaimedIdeasActionsProps) {
	const [isUnclaiming, setIsUnclaiming] = useState(false);

	// Mutations
	const unclaimIdeaMutation = useMutation(
		trpc.ideas.unclaimIdea.mutationOptions({
			onSuccess: () => {
				toast.success("Idea unclaimed successfully!");
				// Refresh the page to show updated data
				window.location.reload();
			},
			onError: (error) => {
				toast.error(error.message);
				setIsUnclaiming(false);
			},
		}),
	);

	const saveIdeaMutation = useMutation(
		trpc.ideas.saveIdea.mutationOptions({
			onSuccess: () => {
				toast.success("Idea saved!");
				// Refresh the page to show updated data
				window.location.reload();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const handleUnclaimIdea = () => {
		setIsUnclaiming(true);
		unclaimIdeaMutation.mutate({ ideaId });
	};

	const handleSaveIdea = () => {
		saveIdeaMutation.mutate({ ideaId });
	};

	return (
		<div className="flex w-full gap-2">
			<Button
				variant="outline"
				size="sm"
				onClick={handleSaveIdea}
				disabled={!canSave || saveIdeaMutation.isPending}
				className="flex-1"
				title={!canSave ? "Upgrade for more saves" : ""}
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
				onClick={handleUnclaimIdea}
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
	);
}
