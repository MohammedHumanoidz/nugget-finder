"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

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
  canClaim 
}: SavedIdeasActionsProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  // Mutations
  const unsaveIdeaMutation = useMutation(trpc.ideas.unsaveIdea.mutationOptions({
    onSuccess: () => {
      toast.success("Idea removed from saved!");
      // Refresh the page to show updated data
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message);
      setIsRemoving(false);
    },
  }));

  const claimIdeaMutation = useMutation(trpc.ideas.claimIdea.mutationOptions({
    onSuccess: () => {
      toast.success("Idea claimed!");
      // Refresh the page to show updated data
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  }));

  const handleUnsaveIdea = () => {
    setIsRemoving(true);
    unsaveIdeaMutation.mutate({ ideaId });
  };

  const handleClaimIdea = () => {
    claimIdeaMutation.mutate({ ideaId });
  };

  return (
    <div className="flex gap-2 w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnsaveIdea}
        disabled={isRemoving}
        className="flex-1"
      >
        {isRemoving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Removing...
          </>
        ) : (
          <>
            <BookmarkCheck className="h-4 w-4 mr-2" />
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
        title={!canClaim ? "Upgrade for more access or unclaim another idea" : ""}
      >
        {claimIdeaMutation.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          "Claim"
        )}
      </Button>
    </div>
  );
}