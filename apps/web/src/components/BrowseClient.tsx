"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search, Loader2, Sparkles, Send, Bookmark, BookmarkCheck, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

interface Idea {
  id: string;
  title: string;
  description: string;
  isSaved?: boolean;
  isClaimed?: boolean;
  isClaimedByOther?: boolean;
  ideaScore?: {
    totalScore?: number;
    problemSeverity?: number;
    technicalFeasibility?: number;
    marketTimingScore?: number;
  } | null;
}

export default function BrowseClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const observerRef = useRef<IntersectionObserver>(null);

  // Get user limits and other data
  const { data: limits, refetch: refetchLimits } = trpc.ideas.getLimits.useQuery();
  const { data: savedIdeas, refetch: refetchSaved } = trpc.ideas.getSavedIdeas.useQuery();
  const { data: claimedIdeas, refetch: refetchClaimed } = trpc.ideas.getClaimedIdeas.useQuery();
  
  // Mutations
  const saveIdeaMutation = trpc.ideas.saveIdea.useMutation({
    onSuccess: () => {
      refetchLimits();
      refetchSaved();
      refetch();
      toast.success("Idea saved!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const unsaveIdeaMutation = trpc.ideas.unsaveIdea.useMutation({
    onSuccess: () => {
      refetchLimits();
      refetchSaved();
      refetch();
      toast.success("Idea unsaved!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const claimIdeaMutation = trpc.ideas.claimIdea.useMutation({
    onSuccess: () => {
      refetchLimits();
      refetchClaimed();
      refetch();
      toast.success("Idea claimed!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const unclaimIdeaMutation = trpc.ideas.unclaimIdea.useMutation({
    onSuccess: () => {
      refetchLimits();
      refetchClaimed();
      refetch();
      toast.success("Idea unclaimed!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Infinite query for browsing ideas
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = trpc.ideas.getIdeas.useInfiniteQuery(
    { limit: 12 },
    {
      getNextPageParam: (lastPage, pages) => {
        return lastPage.length === 12 ? pages.length * 12 : undefined;
      },
    }
  );

  // Combine all pages of ideas
  const allIdeas = data?.pages.flatMap(page => page) || [];

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
  const lastIdeaRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, isFetchingNextPage, fetchNextPage, hasNextPage]);

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
  }, [debouncedSearchQuery]);

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🔍 Browse All Ideas</h1>
        <p className="text-muted-foreground text-lg">
          Discover startup opportunities with AI-powered semantic search
        </p>
        {limits && (
          <div className="mt-4 text-sm text-muted-foreground">
            Claims: {limits.claimsRemaining === -1 ? "unlimited" : limits.claimsRemaining} left
            {limits.savesRemaining !== -1 && ` • Saves: ${limits.savesRemaining} left`}
            {limits.viewsRemaining !== -1 && ` • Views: ${limits.viewsRemaining} left today`}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Ideas</TabsTrigger>
          <TabsTrigger value="saved">Saved ({savedIdeas?.length || 0})</TabsTrigger>
          <TabsTrigger value="claimed">Claimed ({claimedIdeas?.length || 0})</TabsTrigger>
        </TabsList>
      </Tabs>

      <TabsContent value="all">
        {/* Chat-like Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative bg-background border-2 border-border rounded-2xl shadow-sm hover:border-primary/50 focus-within:border-primary transition-colors">
              <div className="flex items-center gap-3 p-4">
                <Search className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Describe your startup idea... (e.g., 'AI compliance software', 'healthcare automation')"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="flex-1 border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 p-4 h-auto min-h-[4rem]"
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="text-muted-foreground hover:text-foreground px-2 py-1 h-auto"
                    >
                      Clear
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 h-auto rounded-xl font-medium"
                    disabled={!searchQuery.trim() || isSearching}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Find Nuggets
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            {debouncedSearchQuery && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground pl-4">
                <Sparkles className="h-4 w-4" />
                <span>
                  {isSearching ? "Searching with AI..." : `Found results for "${debouncedSearchQuery}"`}
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
              : `Showing ${allIdeas.length} ideas`
            }
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {debouncedSearchQuery ? "Searching ideas..." : "Loading ideas..."}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load ideas</h3>
          <p className="text-muted-foreground mb-4">Please try refreshing the page</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {/* No Results */}
      {!isLoading && !error && allIdeas.length === 0 && debouncedSearchQuery && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No ideas found</h3>
          <p className="text-muted-foreground mb-4">
            Try a different search term or browse all ideas
          </p>
          <Button onClick={clearSearch}>Browse All Ideas</Button>
        </div>
      )}

      {/* Ideas Grid */}
      {!isLoading && allIdeas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allIdeas.map((idea: Idea, index) => (
            <Card 
              key={`${idea.id}-${index}`}
              className="hover:shadow-lg transition-shadow h-full flex flex-col"
              ref={index === allIdeas.length - 1 ? lastIdeaRef : undefined}
            >
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-2 flex-1">
                    {idea.title || "Untitled Idea"}
                  </CardTitle>
                  {idea.ideaScore?.totalScore && (
                    <div className={`text-sm font-semibold ${getScoreColor(idea.ideaScore.totalScore)}`}>
                      {idea.ideaScore.totalScore}/100
                    </div>
                  )}
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
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2">
                <div className="flex gap-2 w-full">
                  {/* Save Button */}
                  <Button
                    variant={idea.isSaved ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSaveIdea(idea.id, idea.isSaved || false)}
                    disabled={!limits?.canSave && !idea.isSaved}
                    className="flex-1"
                  >
                    {idea.isSaved ? (
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
                  {idea.isClaimedByOther ? (
                    <Button variant="outline" size="sm" disabled className="flex-1">
                      <Lock className="h-4 w-4 mr-2" />
                      Claimed
                    </Button>
                  ) : (
                    <Button
                      variant={idea.isClaimed ? "destructive" : "secondary"}
                      size="sm"
                      onClick={() => handleClaimIdea(idea.id, idea.isClaimed || false)}
                      disabled={!limits?.canClaim && !idea.isClaimed}
                      className="flex-1"
                      title={!limits?.canClaim && !idea.isClaimed ? "Upgrade for more access or unclaim idea" : ""}
                    >
                      {idea.isClaimed ? "Unclaim" : "Claim"}
                    </Button>
                  )}
                </div>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/nugget/${idea.id}`}>
                    View Details →
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Loading More */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading more ideas...</span>
        </div>
      )}

        {/* End of Results */}
        {!hasNextPage && allIdeas.length > 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              You've reached the end of the list!
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="saved">
        {savedIdeas && savedIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedIdeas.map((savedIdea) => {
              const idea = savedIdea.idea;
              return (
                <Card key={idea.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-lg line-clamp-2 flex-1">
                        {idea.title || "Untitled Idea"}
                      </CardTitle>
                      {idea.ideaScore?.totalScore && (
                        <div className={`text-sm font-semibold ${getScoreColor(idea.ideaScore.totalScore)}`}>
                          {idea.ideaScore.totalScore}/100
                        </div>
                      )}
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
                  </CardContent>
                  
                  <CardFooter className="flex flex-col gap-2">
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSaveIdea(idea.id, true)}
                        className="flex-1"
                      >
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                        Saved
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleClaimIdea(idea.id, false)}
                        disabled={!limits?.canClaim}
                        className="flex-1"
                      >
                        Claim
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
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">No saved ideas yet</h3>
            <p className="text-muted-foreground mb-4">
              Save ideas from the "All Ideas" tab to view them here
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="claimed">
        {claimedIdeas && claimedIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claimedIdeas.map((claimedIdea) => {
              const idea = claimedIdea.idea;
              return (
                <Card key={idea.id} className="hover:shadow-lg transition-shadow h-full flex flex-col border-primary/20">
                  <CardHeader className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-lg line-clamp-2 flex-1">
                        {idea.title || "Untitled Idea"}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
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
                  </CardContent>
                  
                  <CardFooter className="flex flex-col gap-2">
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSaveIdea(idea.id, false)}
                        disabled={!limits?.canSave}
                        className="flex-1"
                      >
                        <Bookmark className="h-4 w-4 mr-2" />
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
            <p className="text-muted-foreground mb-4">
              Claim ideas from the "All Ideas" tab to make them exclusively yours
            </p>
          </div>
        )}
      </TabsContent>
    </div>
  );
}