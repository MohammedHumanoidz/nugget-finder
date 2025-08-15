"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { CalendarDays, Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { CustomCalendar } from "./components/custom-calendar";
import { AvailableIdeasSkeleton, CalendarSkeleton, EmptySelectedIdeas, SelectedIdeasSkeleton } from "./components/skeletons";

export default function FeaturedNuggetsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: schedule, refetch: refetchSchedule, isLoading: isLoadingSchedule } = useQuery(
    trpc.admin.getFeaturedSchedule.queryOptions({
      date: selectedDate.toISOString(),
    })
  );

  const { data: availableIdeas, isLoading: isLoadingIdeas } = useQuery(
    trpc.admin.getAvailableIdeas.queryOptions({
      search: searchTerm || undefined,
      limit: 20,
    })
  );

  const { data: calendarEvents, isLoading: isLoadingCalendar } = useQuery(
    trpc.admin.getFeaturedScheduleRange.queryOptions({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
    })
  );

  const updateScheduleMutation = useMutation(
    trpc.admin.updateFeaturedSchedule.mutationOptions({
      onSuccess: () => {
        refetchSchedule();
        setSelectedIdeas([]);
      },
    })
  );

  useMemo(() => {
    if (schedule?.ideaIds) {
      setSelectedIdeas(schedule.ideaIds);
    } else {
      setSelectedIdeas([]);
    }
  }, [schedule]);

  const handleSaveSchedule = () => {
    updateScheduleMutation.mutate({
      date: selectedDate.toISOString(),
      ideaIds: selectedIdeas,
    });
  };

  const addIdea = (ideaId: string) => {
    if (selectedIdeas.length < 3 && !selectedIdeas.includes(ideaId)) {
      setSelectedIdeas([...selectedIdeas, ideaId]);
    }
  };

  const removeIdea = (ideaId: string) => {
    setSelectedIdeas(selectedIdeas.filter((id) => id !== ideaId));
  };

  const getSelectedIdeaDetails = (ideaId: string) => {
    return availableIdeas?.find((idea: any) => idea.id === ideaId);
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Featured Nuggets Schedule</h1>
          <p className="text-muted-foreground text-sm">Manage and schedule featured ideas for daily highlights</p>
        </div>
        <Button
          onClick={handleSaveSchedule}
          disabled={updateScheduleMutation.isPending || selectedIdeas.length === 0}
          className="min-w-[140px] shadow-sm border border-primary/20"
          size="lg"
        >
          {updateScheduleMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            "Save Schedule"
          )}
        </Button>
      </div>

      {/* Wide Calendar View */}
      {isLoadingCalendar ? (
        <CalendarSkeleton />
      ) : (
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CalendarDays className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <CustomCalendar
              events={calendarEvents || []}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
            
            {/* Calendar Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary/10 border border-primary/60 rounded" />
                <span>Selected Date</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary/10 border border-primary/60 rounded relative">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full transform translate-x-1 -translate-y-1" />
                </div>
                <span>Has Scheduled Ideas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary/90 border border-primary rounded text-white flex items-center justify-center text-xs">💡</div>
                <span>Event Badge</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Date Details and Available Ideas Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Date Details */}
        {isLoadingSchedule ? (
          <SelectedIdeasSkeleton />
        ) : (
          <Card className="border-2 border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-foreground">
                Schedule for {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div>
                <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                  Selected Ideas 
                  <Badge 
                    variant={selectedIdeas.length === 3 ? "default" : "outline"} 
                    className="text-xs"
                  >
                    {selectedIdeas.length}/3
                  </Badge>
                </h3>
                {selectedIdeas.length === 0 ? (
                  <EmptySelectedIdeas />
                ) : (
                  <div className="space-y-3">
                    {selectedIdeas.map((ideaId, index) => {
                      const idea = getSelectedIdeaDetails(ideaId);
                      return (
                        <div
                          key={ideaId}
                          className="group flex items-start gap-3 p-4 border-2 border-border/30 rounded-lg bg-card hover:border-primary/40 transition-all duration-200"
                        >
                          <Badge 
                            variant="secondary" 
                            className="mt-1 min-w-[24px] h-6 flex items-center justify-center text-xs font-medium"
                          >
                            {index + 1}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold mb-2 text-foreground leading-tight">
                              {idea?.title || "Loading..."}
                            </p>
                            {idea?.narrativeHook && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                                {idea.narrativeHook}
                              </p>
                            )}
                            {idea?.ideaScore && (
                              <p className="text-xs text-muted-foreground/80 font-medium">
                                Score: {idea.ideaScore.totalScore}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeIdea(ideaId)}
                            className="shrink-0 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                            aria-label={`Remove ${idea?.title || 'idea'} from schedule`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Ideas */}
        {isLoadingIdeas ? (
          <AvailableIdeasSkeleton />
        ) : (
          <Card className="border-2 border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-foreground">Available Ideas</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-border/50 focus:border-primary/60 transition-colors"
                />
              </div>
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {availableIdeas?.map((idea: any) => {
                  const isSelected = selectedIdeas.includes(idea.id);
                  const isDisabled = selectedIdeas.length >= 3 && !isSelected;
                  
                  return (
                    <button
                      type="button"
                      key={idea.id}
                      className={clsx(
                        "w-full text-left p-4 border-2 rounded-lg transition-all duration-200 group",
                        isSelected
                          ? "bg-primary/5 border-primary/60 ring-1 ring-primary/20"
                          : "hover:bg-muted/30 border-border/40 hover:border-border/70",
                        isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:border-border/40"
                      )}
                      onClick={() => addIdea(idea.id)}
                      disabled={isDisabled}
                      aria-label={`${isSelected ? 'Remove' : 'Add'} ${idea.title} ${isSelected ? 'from' : 'to'} schedule`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold mb-2 line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                            {idea.title}
                          </p>
                          {idea.narrativeHook && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                              {idea.narrativeHook}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground/80">
                            <span className="font-medium">Score: {idea.ideaScore?.totalScore || "N/A"}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <Badge variant="default" className="shrink-0 text-xs">Selected</Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
                {(!availableIdeas || availableIdeas.length === 0) && !isLoadingIdeas && (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-1 font-medium">No ideas found</p>
                    {searchTerm ? (
                      <p className="text-sm text-muted-foreground/70">Try adjusting your search terms</p>
                    ) : (
                      <p className="text-sm text-muted-foreground/70">No ideas are available at the moment</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
