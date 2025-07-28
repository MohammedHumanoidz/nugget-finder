"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search, Loader2, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";

interface Idea {
  id: string;
  title: string;
  description: string;
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
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const observerRef = useRef<IntersectionObserver>(null);

  // Infinite query for browsing ideas
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['browse-ideas', debouncedSearchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 12;
      
      try {
        // Fetch ideas using direct HTTP call to avoid tRPC issues
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/agents.getDailyIdeas?batch=1&input=%7B%220%22%3A%7B%22limit%22%3A${limit * 4}%2C%22offset%22%3A0%7D%7D`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch ideas');
        }
        
        const data = await response.json();
        const ideas = data?.[0]?.result?.data?.ideas || [];
        
        if (debouncedSearchQuery.trim()) {
          // Filter ideas based on search query
          const filteredIdeas = ideas.filter((idea: Idea) =>
            idea.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            idea.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
          ).slice(pageParam * limit, (pageParam + 1) * limit);
          
          return {
            ideas: filteredIdeas,
            nextCursor: filteredIdeas.length === limit ? pageParam + 1 : undefined,
            hasMore: filteredIdeas.length === limit
          };
        }
        
        // Regular browse pagination
        const paginatedIdeas = ideas.slice(pageParam * limit, (pageParam + 1) * limit);
        return {
          ideas: paginatedIdeas,
          nextCursor: paginatedIdeas.length === limit ? pageParam + 1 : undefined,
          hasMore: paginatedIdeas.length === limit
        };
      } catch (error) {
        console.error('Failed to fetch ideas:', error);
        return {
          ideas: [],
          nextCursor: undefined,
          hasMore: false
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  // Combine all pages of ideas
  const allIdeas = data?.pages.flatMap(page => page.ideas) || [];

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
      </div>

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
              
              <CardFooter>
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
    </div>
  );
}