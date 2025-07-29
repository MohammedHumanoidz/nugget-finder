"use client";

import { useState } from "react";
import { Bookmark, Lock, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function ClaimedIdeasClient() {
  const [unclaimingIds, setUnclaimingIds] = useState<Set<string>>(new Set());

  // Fetch claimed ideas and user limits
  const { data: claimedIdeas, isLoading, refetch } = useQuery(trpc.ideas.getClaimedIdeas.queryOptions());
  const { data: limits, refetch: refetchLimits } = useQuery(trpc.ideas.getLimits.queryOptions());

  // Mutations
  const unclaimIdeaMutation = useMutation(trpc.ideas.unclaimIdea.mutationOptions({
    onSuccess: () => {
      refetchLimits();
      refetch();
      toast.success("Idea unclaimed successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: (_, __, variables) => {
      setUnclaimingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.ideaId);
        return newSet;
      });
    },
  }));

  const saveIdeaMutation = useMutation(trpc.ideas.saveIdea.mutationOptions({
    onSuccess: () => {
      refetchLimits();
      toast.success("Idea saved!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  }));

  const handleUnclaimIdea = (ideaId: string) => {
    setUnclaimingIds(prev => new Set(prev).add(ideaId));
    unclaimIdeaMutation.mutate({ ideaId });
  };

  const handleSaveIdea = (ideaId: string) => {
    saveIdeaMutation.mutate({ ideaId });
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your claimed ideas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/browse">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Link>
          </Button>
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🔒 Your Claimed Ideas</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Startup ideas you've claimed exclusively for yourself
          </p>
          
          {limits && (
            <div className="text-sm text-muted-foreground">
              You have {claimedIdeas?.length || 0} claimed ideas
              {limits.claimsRemaining !== -1 && ` • ${limits.claimsRemaining} claims remaining`}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {claimedIdeas && claimedIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claimedIdeas.map((claimedIdea) => {
            const idea = claimedIdea.idea;
            const isUnclaiming = unclaimingIds.has(idea.id);
            
            return (
              <Card 
                key={idea.id} 
                className={`hover:shadow-lg transition-all h-full flex flex-col border-primary/20 ${
                  isUnclaiming ? 'opacity-50 scale-95' : ''
                }`}
              >
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg line-clamp-2 flex-1">
                      {idea.title || "Untitled Idea"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                        CLAIMED
                      </div>
                      {idea.ideaScore?.totalScore && (
                        <div className={`text-sm font-semibold ${getScoreColor(idea.ideaScore.totalScore)}`}>
                          {idea.ideaScore.totalScore}/100
                        </div>
                      )}
                    </div>
                  </div>
                  {idea.ideaScore && (
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>Problem: {idea.ideaScore.problemSeverity || 0}</span>
                      <span>•</span>
                      <span>Feasibility: {idea.ideaScore.technicalFeasibility || 0}</span>
                      <span>•</span>
                      <span>Timing: {idea.ideaScore.marketTimingScore || 0}</span>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="flex-1">
                  <p className="text-muted-foreground line-clamp-3">
                    {idea.description || "No description available for this startup opportunity."}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Claimed on {new Date(claimedIdea.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mt-2 p-2 bg-primary/5 rounded-md border border-primary/10">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Lock className="h-3 w-3" />
                      <span className="font-medium">This idea is exclusively yours</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Other users cannot see or claim this idea while you have it claimed.
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-2">
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveIdea(idea.id)}
                      disabled={!limits?.canSave || saveIdeaMutation.isPending}
                      className="flex-1"
                      title={!limits?.canSave ? "Upgrade for more saves" : ""}
                    >
                      {saveIdeaMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUnclaimIdea(idea.id)}
                      disabled={isUnclaiming}
                      className="flex-1"
                    >
                      {isUnclaiming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Unclaiming...
                        </>
                      ) : (
                        "Unclaim"
                      )}
                    </Button>
                  </div>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/nugget/${idea.id}`}>
                      View Details →
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold mb-2">No claimed ideas yet</h3>
          <p className="text-muted-foreground mb-6">
            Claim startup ideas to make them exclusively yours and hidden from other users
          </p>
          <div className="max-w-md mx-auto mb-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">What does claiming mean?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• The idea becomes exclusively yours</li>
              <li>• Other users can't see or claim it</li>
              <li>• Use your claim quota wisely</li>
              <li>• You can unclaim to free up quota</li>
            </ul>
          </div>
          <Button asChild>
            <Link href="/browse">
              Browse Ideas to Claim
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}