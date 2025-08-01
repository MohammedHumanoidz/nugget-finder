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
  Settings,
  Badge,
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
import { useDebounce } from "@/hooks/useDebounce";
import { trpc, queryClient } from "@/utils/trpc";
import PersonalizationModal, { type PersonalizationData } from "./PersonalizationModal";

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
  narrativeHook: string;
  isSaved?: boolean;
  isClaimed?: boolean;
  isClaimedByOther?: boolean | null;
  ideaScore?: IdeaScore | null;
}

interface SemanticSearchResult extends Idea {
  relevanceScore: number;
  personalizedScore: number;
  matchHighlights: string[];
  personalizationMatches: string[];
}

export default function BrowseClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [isSemanticLoading, setIsSemanticLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const observerRef = useRef<IntersectionObserver>(null);

  // Get user limits
  const { data: limits, refetch: refetchLimits } = useQuery({
    ...trpc.ideas.getLimits.queryOptions(),
  });

  // Mutations
  const saveIdeaMutation = useMutation(
    trpc.ideas.saveIdea.mutationOptions({
      onSuccess: () => {
        refetchLimits();
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
        refetch();
        toast.success("Idea unclaimed!");
      },
      onError: (error: { message: string }) => {
        toast.error(error.message);
      },
    })
  );

  // Infinite query for browsing ideas
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
    queryFn: async ({ pageParam = 0 }) => {
      const queryOptions = trpc.ideas.getIdeas.queryOptions({
        limit: 12,
        offset: pageParam,
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      });

      if (queryOptions.queryFn) {
        return await queryOptions.queryFn({
          client: queryClient,
          queryKey: queryOptions.queryKey,
          signal: new AbortController().signal,
          meta: undefined,
        });
      }

      throw new Error("Query function not available");
    },
    getNextPageParam: (lastPage: Idea[], pages: Idea[][]) => {
      return lastPage.length === 12 ? pages.length * 12 : undefined;
    },
    initialPageParam: 0,
    enabled: !debouncedSearchQuery.trim(),
  });

  // Use semantic results when searching, otherwise show regular results
  const allIdeas = searchQuery.trim() ? semanticResults : (data?.pages.flat() || []);

  // Reset searching state when debounced query changes
  useEffect(() => {
    setIsSearching(false);
  }, []);

  // Semantic search mutation
  const semanticSearchMutation = useMutation(
    trpc.search.search.mutationOptions({
      onSuccess: (data: any) => {
        setSemanticResults(data.results);
        setIsSemanticLoading(false);
      },
      onError: (error: { message: string }) => {
        toast.error(`Search failed: ${error.message}`);
        setIsSemanticLoading(false);
      },
    })
  );

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSemanticSearch();
    }
  };

  // Handle semantic search
  const handleSemanticSearch = useCallback(() => {
    const currentQuery = debouncedSearchQuery || searchQuery;
    if (!currentQuery.trim()) return;
    
    setIsSemanticLoading(true);
    semanticSearchMutation.mutate({
      query: currentQuery,
      personalization: personalizationData || undefined,
      options: {
        limit: 20,
        threshold: 0.15,
      },
    });
  }, [debouncedSearchQuery, searchQuery, personalizationData]);

  // Trigger semantic search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      handleSemanticSearch();
    } else {
      // Clear semantic results when query is empty
      setSemanticResults([]);
      setIsSemanticLoading(false);
    }
  }, [debouncedSearchQuery, handleSemanticSearch]);

  // Handle personalization modal save
  const handlePersonalizationSave = (data: PersonalizationData) => {
    setPersonalizationData(data);
    setShowPersonalizationModal(false);
    
    // Re-run semantic search if we have a query
    if (searchQuery.trim()) {
      handleSemanticSearch();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSemanticResults([]);
    // When clearing, show all ideas through regular query
    refetch();
  };

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

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Only set loading if we're switching from no search to search, not on every keystroke
    if (!debouncedSearchQuery.trim() && value.trim()) {
      setIsSemanticLoading(true);
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

      {/* Main Content */}
      <div className="mb-8">
        {/* Chat-like Search Bar */}
        <div className="mx-auto mb-8 max-w-3xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative bg-background shadow-sm transition-colors focus-within:border-primary hover:border-primary/50">
              <div className="flex items-center gap-3 p-4">
                <Input
                  type="text"
                  placeholder="Describe what you want to build... (AI-powered semantic search)"
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
                    disabled={!searchQuery.trim() || isSearching || isSemanticLoading}
                  >
                    {(isSearching || isSemanticLoading) ? (
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
            
            {/* Search status and personalization */}
            <div className="mt-3 flex items-center justify-center gap-4 pl-4">
              <div className="flex items-center gap-4">
                {(debouncedSearchQuery || searchQuery) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge className="h-4 w-4" />
                    <span>
                      {isSemanticLoading
                        ? "Performing semantic search..."
                        : searchQuery.trim() && semanticResults.length > 0
                        ? `Found ${semanticResults.length} semantic matches`
                        : "AI-powered semantic search"}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPersonalizationModal(true)}
                  className="h-auto px-3 py-2 text-xs"
                >
                  <Settings className="mr-2 h-3 w-3" />
                  {personalizationData ? "Update Profile" : "Personalize Search"}
                </Button>
              </div>
            </div>
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
        {(isLoading || isSemanticLoading) && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">
                {isSemanticLoading
                  ? "Performing semantic analysis..."
                  : debouncedSearchQuery
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
          !isSemanticLoading &&
          !error &&
          allIdeas.length === 0 &&
          (debouncedSearchQuery || searchQuery) && (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">🔍</div>
              <h3 className="mb-2 text-lg font-semibold">
                No semantic matches found
              </h3>
              <p className="mb-4 text-muted-foreground">
                Try adjusting your search terms or personalization settings
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={clearSearch}>Browse All Ideas</Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPersonalizationModal(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Adjust Personalization
                </Button>
              </div>
            </div>
          )}

        {/* Ideas Grid */}
        {!isLoading && !isSemanticLoading && allIdeas.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allIdeas.map((idea: Idea | SemanticSearchResult, index) => {
              const semanticResult = (searchQuery.trim() && semanticResults.length > 0) ? idea as SemanticSearchResult : null;
              const baseIdea = idea as Idea;
              
              return (
                <Card
                  key={`${baseIdea.id}-${index}`}
                  className={`flex h-full flex-col transition-shadow hover:shadow-lg ${
                    semanticResult ? 'border-primary/20' : ''
                  }`}
                  ref={index === allIdeas.length - 1 && (!searchQuery.trim() || semanticResults.length === 0) ? lastIdeaRef : undefined}
                >
                  <CardHeader className="flex-1">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 flex-1 text-lg">
                        {baseIdea.title || "Untitled Idea"}
                      </CardTitle>
                    </div>
                    
                    {/* Personalization badges */}
                    {semanticResult?.personalizationMatches && semanticResult.personalizationMatches.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {semanticResult.personalizationMatches.slice(0, 2).map((match, i) => (
                          <span 
                            key={`${match}-${i.toString()}`}
                            className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                          >
                            {match}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {baseIdea.ideaScore && (
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>
                          Problem: {baseIdea.ideaScore.problemSeverity || 0}
                        </span>
                        <span>•</span>
                        <span>
                          Feasibility:{" "}
                          {baseIdea.ideaScore.technicalFeasibility || 0}
                        </span>
                        <span>•</span>
                        <span>
                          Timing: {baseIdea.ideaScore.marketTimingScore || 0}
                        </span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="line-clamp-3 text-muted-foreground">
                      {baseIdea.description ||
                        "No description available for this startup opportunity."}
                    </p>
                    
                    {/* Relevance indicator for semantic search */}
                    {semanticResult && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge className="h-3 w-3" />
                        <span>Relevance: {semanticResult.relevanceScore}%</span>
                        {personalizationData && (
                          <span>• Personalized: {semanticResult.personalizedScore}%</span>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2">
                    <div className="flex w-full gap-2">
                      {/* Save Button */}
                      <Button
                        variant={baseIdea.isSaved ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          handleSaveIdea(baseIdea.id, baseIdea.isSaved || false)
                        }
                        disabled={!limits?.canSave && !baseIdea.isSaved}
                        className="flex-1"
                      >
                        {baseIdea.isSaved ? (
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
                      {baseIdea.isClaimedByOther ? (
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
                          variant={baseIdea.isClaimed ? "destructive" : "default"}
                          size="sm"
                          onClick={() =>
                            handleClaimIdea(baseIdea.id, baseIdea.isClaimed || false)
                          }
                          disabled={!limits?.canClaim && !baseIdea.isClaimed}
                          className="flex-1"
                          title={
                            !limits?.canClaim && !baseIdea.isClaimed
                              ? "Upgrade for more access or unclaim idea"
                              : ""
                          }
                        >
                          {baseIdea.isClaimed ? "Unclaim" : "Claim"}
                        </Button>
                      )}
                    </div>

                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/nugget/${baseIdea.id}`}>View Details →</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
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
      </div>
      
      {/* Personalization Modal */}
      <PersonalizationModal
        isOpen={showPersonalizationModal}
        onClose={() => setShowPersonalizationModal(false)}
        onSave={handlePersonalizationSave}
        initialData={personalizationData || undefined}
      />
    </div>
  );
}