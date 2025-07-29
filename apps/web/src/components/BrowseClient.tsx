"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  BookmarkCheck,
  Loader2,
  Lock,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/useDebounce";
import { trpc, queryClient } from "@/utils/trpc";

interface IdeaScore {
  totalScore?: number;
  problemSeverity?: number;
  technicalFeasibility?: number;
  marketTimingScore?: number;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  isSaved?: boolean;
  isClaimed?: boolean;
  isClaimedByOther?: boolean | null; // Changed to match server response
  ideaScore?: IdeaScore | null;
}

interface SavedIdea {
  idea: Idea;
}

interface ClaimedIdea {
  idea: Idea;
}

interface Limits {
  canSave: boolean;
  canClaim: boolean;
  claimsRemaining: number;
  savesRemaining: number;
  viewsRemaining: number;
}

export default function BrowseClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const observerRef = useRef<IntersectionObserver>(null);

  // Get user limits and other data
  const { data: limits, refetch: refetchLimits } = useQuery({
    ...trpc.ideas.getLimits.queryOptions(),
  });

  const { data: savedIdeas, refetch: refetchSaved } = useQuery({
    ...trpc.ideas.getSavedIdeas.queryOptions(),
  });

  const { data: claimedIdeas, refetch: refetchClaimed } = useQuery({
    ...trpc.ideas.getClaimedIdeas.queryOptions(),
  });

  // Mutations
  const saveIdeaMutation = useMutation(
    trpc.ideas.saveIdea.mutationOptions({
      onSuccess: () => {
        refetchLimits();
        refetchSaved();
        refetch();
        toast.success("Idea saved!");
      },
      onError: (error: { message: string }) => {
        toast.error(error.message);
      },
    })
  );

  const unsaveIdeaMutation = useMutation(
    trpc.ideas.unsaveIdea.mutationOptions({
      onSuccess: () => {
        refetchLimits();
        refetchSaved();
        refetch();
        toast.success("Idea unsaved!");
      },
      onError: (error: { message: string }) => {
        toast.error(error.message);
      },
    })
  );

  const claimIdeaMutation = useMutation(
    trpc.ideas.claimIdea.mutationOptions({
      onSuccess: () => {
        refetchLimits();
        refetchClaimed();
        refetch();
        toast.success("Idea claimed!");
      },
      onError: (error: { message: string }) => {
        toast.error(error.message);
      },
    })
  );

  const unclaimIdeaMutation = useMutation(
    trpc.ideas.unclaimIdea.mutationOptions({
      onSuccess: () => {
        refetchLimits();
        refetchClaimed();
        refetch();
        toast.success("Idea unclaimed!");
      },
      onError: (error: { message: string }) => {
        toast.error(error.message);
      },
    })
  );

  // Infinite query for browsing ideas - using standard React Query with tRPC
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "ideas.getIdeas",
      { limit: 12, searchQuery: debouncedSearchQuery },
    ],
    queryFn: async ({ pageParam = 0, queryKey, signal }) => {
      // Get the tRPC query options
      const queryOptions = trpc.ideas.getIdeas.queryOptions({
        limit: 12,
        offset: pageParam,
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      });

      // Execute the query function with the correct parameters
      if (queryOptions.queryFn) {
        return await queryOptions.queryFn({
          client: queryClient,
          queryKey: queryOptions.queryKey,
          signal,
          meta: undefined,
        });
      }

      throw new Error("Query function not available");
    },
    getNextPageParam: (lastPage: Idea[], pages: Idea[][]) => {
      return lastPage.length === 12 ? pages.length * 12 : undefined;
    },
    initialPageParam: 0,
  });

  // Combine all pages of ideas
  const allIdeas = data?.pages.flat() || [];

  // Handler functions
  const handleSaveIdea = (ideaId: string, isSaved: boolean) => {
    if (isSaved) {
      unsaveIdeaMutation.mutate({ ideaId });
    } else {
      saveIdeaMutation.mutate({ ideaId });
    }
  };

  const handleClaimIdea = (ideaId: string, isClaimed: boolean) => {
    if (isClaimed) {
      unclaimIdeaMutation.mutate({ ideaId });
    } else {
      claimIdeaMutation.mutate({ ideaId });
    }
  };

  // Set up intersection observer for infinite scroll
  const lastIdeaRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() !== debouncedSearchQuery.trim()) {
      setIsSearching(true);
    }
  };

  // Reset searching state when debounced query changes
  useEffect(() => {
    setIsSearching(false);
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      refetch();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    refetch();
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">🔍 Browse All Ideas</h1>
        <p className="text-lg text-muted-foreground">
          Discover startup opportunities with AI-powered semantic search
        </p>
        {limits && (
          <div className="mt-4 text-sm text-muted-foreground">
            Claims:{" "}
            {limits.claimsRemaining === -1
              ? "unlimited"
              : limits.claimsRemaining}{" "}
            left
            {limits.savesRemaining !== -1 &&
              ` • Saves: ${limits.savesRemaining} left`}
            {limits.viewsRemaining !== -1 &&
              ` • Views: ${limits.viewsRemaining} left today`}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Ideas</TabsTrigger>
          <TabsTrigger value="saved">
            Saved ({savedIdeas?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="claimed">
            Claimed ({claimedIdeas?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {/* Chat-like Search Bar */}
          <div className="mx-auto mb-8 max-w-3xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative rounded-2xl border-2 border-border bg-background shadow-sm transition-colors focus-within:border-primary hover:border-primary/50">
                <div className="flex items-center gap-3 p-4">
                  <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Describe your startup idea... (e.g., 'AI compliance software', 'healthcare automation')"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="h-auto min-h-[4rem] flex-1 border-0 bg-transparent p-4 text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {searchQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="h-auto px-2 py-1 text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="h-auto rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
                      disabled={!searchQuery.trim() || isSearching}
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Find Nuggets
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {debouncedSearchQuery && (
                <div className="mt-3 flex items-center gap-2 pl-4 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {isSearching
                      ? "Searching with AI..."
                      : `Found results for "${debouncedSearchQuery}"`}
                  </span>
                </div>
              )}
            </form>
          </div>

          {/* Results Count */}
          {!isLoading && allIdeas.length > 0 && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                {debouncedSearchQuery
                  ? `Found ${allIdeas.length} ideas matching your search`
                  : `Showing ${allIdeas.length} ideas`}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">
                  {debouncedSearchQuery
                    ? "Searching ideas..."
                    : "Loading ideas..."}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="py-12 text-center">
              <div className="mb-4 text-red-500">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Failed to load ideas
              </h3>
              <p className="mb-4 text-muted-foreground">
                Please try refreshing the page
              </p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          )}

          {/* No Results */}
          {!isLoading &&
            !error &&
            allIdeas.length === 0 &&
            debouncedSearchQuery && (
              <div className="py-12 text-center">
                <div className="mb-4 text-4xl">🔍</div>
                <h3 className="mb-2 text-lg font-semibold">No ideas found</h3>
                <p className="mb-4 text-muted-foreground">
                  Try a different search term or browse all ideas
                </p>
                <Button onClick={clearSearch}>Browse All Ideas</Button>
              </div>
            )}

          {/* Ideas Grid */}
          {!isLoading && allIdeas.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allIdeas.map((idea: Idea, index) => (
                <Card
                  key={`${idea.id}-${index}`}
                  className="flex h-full flex-col transition-shadow hover:shadow-lg"
                  ref={index === allIdeas.length - 1 ? lastIdeaRef : undefined}
                >
                  <CardHeader className="flex-1">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 flex-1 text-lg">
                        {idea.title || "Untitled Idea"}
                      </CardTitle>
                      {idea.ideaScore?.totalScore && (
                        <div
                          className={`text-sm font-semibold ${getScoreColor(idea.ideaScore.totalScore)}`}
                        >
                          {idea.ideaScore.totalScore}/100
                        </div>
                      )}
                    </div>
                    {idea.ideaScore && (
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>
                          Problem: {idea.ideaScore.problemSeverity || 0}
                        </span>
                        <span>•</span>
                        <span>
                          Feasibility:{" "}
                          {idea.ideaScore.technicalFeasibility || 0}
                        </span>
                        <span>•</span>
                        <span>
                          Timing: {idea.ideaScore.marketTimingScore || 0}
                        </span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="line-clamp-3 text-muted-foreground">
                      {idea.description ||
                        "No description available for this startup opportunity."}
                    </p>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2">
                    <div className="flex w-full gap-2">
                      {/* Save Button */}
                      <Button
                        variant={idea.isSaved ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          handleSaveIdea(idea.id, idea.isSaved || false)
                        }
                        disabled={!limits?.canSave && !idea.isSaved}
                        className="flex-1"
                      >
                        {idea.isSaved ? (
                          <>
                            <BookmarkCheck className="mr-2 h-4 w-4" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Bookmark className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>

                      {/* Claim Button */}
                      {idea.isClaimedByOther ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="flex-1"
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          Claimed
                        </Button>
                      ) : (
                        <Button
                          variant={idea.isClaimed ? "destructive" : "default"}
                          size="sm"
                          onClick={() =>
                            handleClaimIdea(idea.id, idea.isClaimed || false)
                          }
                          disabled={!limits?.canClaim && !idea.isClaimed}
                          className="flex-1"
                          title={
                            !limits?.canClaim && !idea.isClaimed
                              ? "Upgrade for more access or unclaim idea"
                              : ""
                          }
                        >
                          {idea.isClaimed ? "Unclaim" : "Claim"}
                        </Button>
                      )}
                    </div>

                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/nugget/${idea.id}`}>View Details →</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Loading More */}
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span className="text-muted-foreground">
                Loading more ideas...
              </span>
            </div>
          )}

          {/* End of Results */}
          {!hasNextPage && allIdeas.length > 0 && !isLoading && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                You've reached the end of the list!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved">
          {savedIdeas && savedIdeas.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedIdeas.map((savedIdea: SavedIdea) => {
                const idea = savedIdea.idea;
                return (
                  <Card
                    key={idea.id}
                    className="flex h-full flex-col transition-shadow hover:shadow-lg"
                  >
                    <CardHeader className="flex-1">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 flex-1 text-lg">
                          {idea.title || "Untitled Idea"}
                        </CardTitle>
                        {idea.ideaScore?.totalScore && (
                          <div
                            className={`text-sm font-semibold ${getScoreColor(idea.ideaScore.totalScore)}`}
                          >
                            {idea.ideaScore.totalScore}/100
                          </div>
                        )}
                      </div>
                      {idea.ideaScore && (
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>
                            Problem: {idea.ideaScore.problemSeverity || 0}
                          </span>
                          <span>•</span>
                          <span>
                            Feasibility:{" "}
                            {idea.ideaScore.technicalFeasibility || 0}
                          </span>
                          <span>•</span>
                          <span>
                            Timing: {idea.ideaScore.marketTimingScore || 0}
                          </span>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="flex-1">
                      <p className="line-clamp-3 text-muted-foreground">
                        {idea.description ||
                          "No description available for this startup opportunity."}
                      </p>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2">
                      <div className="flex w-full gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSaveIdea(idea.id, true)}
                          className="flex-1"
                        >
                          <BookmarkCheck className="mr-2 h-4 w-4" />
                          Saved
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClaimIdea(idea.id, false)}
                          disabled={!limits?.canClaim}
                          className="flex-1"
                        >
                          Claim
                        </Button>
                      </div>

                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/nugget/${idea.id}`}>View Details →</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">📚</div>
              <h3 className="mb-2 text-lg font-semibold">No saved ideas yet</h3>
              <p className="mb-4 text-muted-foreground">
                Save ideas from the "All Ideas" tab to view them here
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="claimed">
          {claimedIdeas && claimedIdeas.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {claimedIdeas.map((claimedIdea: ClaimedIdea) => {
                const idea = claimedIdea.idea;
                return (
                  <Card
                    key={idea.id}
                    className="flex h-full flex-col border-primary/20 transition-shadow hover:shadow-lg"
                  >
                    <CardHeader className="flex-1">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 flex-1 text-lg">
                          {idea.title || "Untitled Idea"}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <div className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                            CLAIMED
                          </div>
                          {idea.ideaScore?.totalScore && (
                            <div
                              className={`text-sm font-semibold ${getScoreColor(idea.ideaScore.totalScore)}`}
                            >
                              {idea.ideaScore.totalScore}/100
                            </div>
                          )}
                        </div>
                      </div>
                      {idea.ideaScore && (
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>
                            Problem: {idea.ideaScore.problemSeverity || 0}
                          </span>
                          <span>•</span>
                          <span>
                            Feasibility:{" "}
                            {idea.ideaScore.technicalFeasibility || 0}
                          </span>
                          <span>•</span>
                          <span>
                            Timing: {idea.ideaScore.marketTimingScore || 0}
                          </span>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="flex-1">
                      <p className="line-clamp-3 text-muted-foreground">
                        {idea.description ||
                          "No description available for this startup opportunity."}
                      </p>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2">
                      <div className="flex w-full gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSaveIdea(idea.id, false)}
                          disabled={!limits?.canSave}
                          className="flex-1"
                        >
                          <Bookmark className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleClaimIdea(idea.id, true)}
                          className="flex-1"
                        >
                          Unclaim
                        </Button>
                      </div>

                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/nugget/${idea.id}`}>View Details →</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">🔒</div>
              <h3 className="mb-2 text-lg font-semibold">
                No claimed ideas yet
              </h3>
              <p className="mb-4 text-muted-foreground">
                Claim ideas from the "All Ideas" tab to make them exclusively
                yours
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
