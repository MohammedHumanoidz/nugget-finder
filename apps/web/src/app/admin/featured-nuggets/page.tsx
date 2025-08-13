"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { X } from "lucide-react";
import moment from "moment";
import { useMemo, useState } from "react";
import { Calendar, momentLocalizer, type ToolbarProps } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function CustomToolbar({ label, onNavigate }: ToolbarProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("PREV")}>
          Prev
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("NEXT")}>
          Next
        </Button>
      </div>
      <span className="font-semibold">{label}</span>
    </div>
  );
}

export default function FeaturedNuggetsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: schedule, refetch: refetchSchedule } = useQuery(
    trpc.admin.getFeaturedSchedule.queryOptions({
      date: selectedDate.toISOString(),
    })
  );

  const { data: availableIdeas } = useQuery(
    trpc.admin.getAvailableIdeas.queryOptions({
      search: searchTerm || undefined,
      limit: 20,
    })
  );

  const { data: calendarEvents } = useQuery(
    trpc.admin.getFeaturedScheduleRange.queryOptions({
      startDate: moment(calendarDate).startOf("month").toISOString(),
      endDate: moment(calendarDate).endOf("month").toISOString(),
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

  const events = useMemo(
    () =>
      calendarEvents?.map((event: any) => {
        // Create a date that matches the stored date without timezone conversion
        const storedDate = new Date(event.date);
        const eventDate = new Date(storedDate.getFullYear(), storedDate.getMonth(), storedDate.getDate());
        return {
          id: event.id,
          title: `${event.ideaIds.length} idea${event.ideaIds.length > 1 ? "s" : ""} scheduled`,
          start: eventDate,
          end: eventDate,
          allDay: true,
        };
      }) || [],
    [calendarEvents]
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Featured Nuggets Schedule</h1>
        <Button
          onClick={handleSaveSchedule}
          disabled={updateScheduleMutation.isPending}
        >
          {updateScheduleMutation.isPending ? "Saving..." : "Save Schedule"}
        </Button>
      </div>

      {/* Wide Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] rounded-md border bg-background text-foreground">
            <Calendar
              key={selectedDate.toISOString()}
              localizer={localizer}
              events={events}
              date={calendarDate}
              onNavigate={(date) => setCalendarDate(date)}
              startAccessor="start"
              endAccessor="end"
              selectable
              views={["month"]}
              defaultView="month"
              onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
              onSelectEvent={(event) =>
                setSelectedDate(new Date(event.start))
              }
              components={{
                toolbar: CustomToolbar as any,
              }}
              eventPropGetter={() => ({
                className:
                  "bg-primary text-primary-foreground rounded px-1 text-sm",
                style: {},
              })}
              dayPropGetter={(date) => {
                const isSelected = moment(date).format('YYYY-MM-DD') === moment(selectedDate).format('YYYY-MM-DD');
                return {
                  className: clsx(
                    "cursor-pointer hover:bg-muted transition-colors",
                    isSelected && "!bg-primary/20 border-2 border-primary/40"
                  ),
                };
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details and Available Ideas Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              Schedule for {selectedDate.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">
                Selected Ideas ({selectedIdeas.length}/3)
              </h3>
              {selectedIdeas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No ideas scheduled for this date</p>
                  <p className="text-sm">Select ideas from the available list →</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedIdeas.map((ideaId, index) => {
                    const idea = getSelectedIdeaDetails(ideaId);
                    return (
                      <div
                        key={ideaId}
                        className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30"
                      >
                        <Badge variant="outline" className="mt-1">{index + 1}</Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium mb-1">
                            {idea?.title || "Loading..."}
                          </p>
                          {idea?.narrativeHook && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {idea.narrativeHook}
                            </p>
                          )}
                          {idea?.ideaScore && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Score: {idea.ideaScore.totalScore}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeIdea(ideaId)}
                          className="shrink-0"
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

        {/* Available Ideas */}
        <Card>
          <CardHeader>
            <CardTitle>Available Ideas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {availableIdeas?.map((idea: any) => (
                <button
                  type="button"
                  key={idea.id}
                  className={clsx(
                    "w-full text-left p-3 border rounded-lg transition-colors",
                    selectedIdeas.includes(idea.id)
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted border-border",
                    selectedIdeas.length >= 3 && !selectedIdeas.includes(idea.id) && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => addIdea(idea.id)}
                  disabled={selectedIdeas.length >= 3 && !selectedIdeas.includes(idea.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium mb-1 line-clamp-1">{idea.title}</p>
                      {idea.narrativeHook && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                          {idea.narrativeHook}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Score: {idea.ideaScore?.totalScore || "N/A"}</span>
                        <span>•</span>
                        <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {selectedIdeas.includes(idea.id) && (
                      <Badge variant="secondary" className="shrink-0">Selected</Badge>
                    )}
                  </div>
                </button>
              ))}
              {(!availableIdeas || availableIdeas.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No ideas found</p>
                  {searchTerm && (
                    <p className="text-sm">Try adjusting your search terms</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
