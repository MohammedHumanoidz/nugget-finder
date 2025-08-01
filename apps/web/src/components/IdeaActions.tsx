"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface IdeaActionsProps {
  ideaId: string;
  isSaved?: boolean;
  isClaimed?: boolean;
  isClaimedByOther?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export default function IdeaActions({
  ideaId,
  isSaved = false,
  isClaimed = false,
  isClaimedByOther = false,
  className = "",
  size = "default"
}: IdeaActionsProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  // Get user limits
  const { data: limits } = useQuery({
    ...trpc.ideas.getLimits.queryOptions(),
    enabled: isAuthenticated,
  });

  // Save/Unsave mutations
  const saveIdeaMutation = useMutation(
    trpc.ideas.saveIdea.mutationOptions({
      onSuccess: () => {
        toast.success("Idea saved!");
        // You might want to invalidate queries here instead of reloading
        window.location.reload();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const unsaveIdeaMutation = useMutation(
    trpc.ideas.unsaveIdea.mutationOptions({
      onSuccess: () => {
        toast.success("Idea removed from saved!");
        window.location.reload();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  // Claim/Unclaim mutations
  const claimIdeaMutation = useMutation(
    trpc.ideas.claimIdea.mutationOptions({
      onSuccess: () => {
        toast.success("Idea claimed!");
        window.location.reload();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const unclaimIdeaMutation = useMutation(
    trpc.ideas.unclaimIdea.mutationOptions({
      onSuccess: () => {
        toast.success("Idea unclaimed!");
        window.location.reload();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleSaveClick = () => {
    if (!isAuthenticated) {
      router.push("/auth/sign-in");
      return;
    }

    if (isSaved) {
      unsaveIdeaMutation.mutate({ ideaId });
    } else {
      saveIdeaMutation.mutate({ ideaId });
    }
  };

  const handleClaimClick = () => {
    if (!isAuthenticated) {
      router.push("/auth/sign-in");
      return;
    }

    if (isClaimed) {
      unclaimIdeaMutation.mutate({ ideaId });
    } else {
      claimIdeaMutation.mutate({ ideaId });
    }
  };

  const isSaveLoading = saveIdeaMutation.isPending || unsaveIdeaMutation.isPending;
  const isClaimLoading = claimIdeaMutation.isPending || unclaimIdeaMutation.isPending;

  // Check if user can save (either they have saves left or the idea is already saved)
  const canSave = !isAuthenticated || limits?.canSave || isSaved;
  
  // Check if user can claim (either they have claims left or the idea is already claimed by them)
  const canClaim = !isAuthenticated || limits?.canClaim || isClaimed;

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Save Button */}
      <Button
        variant={isSaved ? "default" : "outline"}
        size={size}
        onClick={handleSaveClick}
        disabled={isSaveLoading || (!canSave && !isSaved)}
        className="flex-1"
        title={
          !isAuthenticated 
            ? "Sign in to save ideas" 
            : !canSave && !isSaved 
            ? "Upgrade for more saves" 
            : ""
        }
      >
        {isSaveLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : isSaved ? (
          <>
            <BookmarkCheck className="h-4 w-4 mr-2" />
            Saved
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4 mr-2" />
            Save
          </>
        )}
      </Button>

      {/* Claim Button */}
      {isClaimedByOther ? (
        <Button variant="outline" size={size} disabled className="flex-1">
          Already Claimed
        </Button>
      ) : (
        <Button
          variant={isClaimed ? "destructive" : "secondary"}
          size={size}
          onClick={handleClaimClick}
          disabled={isClaimLoading || (!canClaim && !isClaimed)}
          className="flex-1"
          title={
            !isAuthenticated 
              ? "Sign in to claim ideas" 
              : !canClaim && !isClaimed 
              ? "Upgrade for more access or unclaim another idea" 
              : ""
          }
        >
          {isClaimLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isClaimed ? (
            "Unclaim"
          ) : (
            "Claim"
          )}
        </Button>
      )}
    </div>
  );
} 