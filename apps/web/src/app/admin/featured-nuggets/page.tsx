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
      calendarEvents?.map((event: any) => ({
        id: event.id,
        title: `${event.ideaIds.length} idea${event.ideaIds.length > 1 ? "s" : ""} scheduled`,
        start: new Date(event.date),
        end: new Date(event.date),
        allDay: true,
      })) || [],
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Featured Nuggets Schedule</h1>
        <Button
          onClick={handleSaveSchedule}
          disabled={updateScheduleMutation.isPending}
        >
          {updateScheduleMutation.isPending ? "Saving..." : "Save Schedule"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-md border bg-background text-foreground dark:border-gray-700">
              <Calendar
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
                dayPropGetter={(date) => ({
                  className: clsx(
                    "cursor-pointer hover:bg-muted transition-colors",
                    moment(date).isSame(selectedDate, "day") && "bg-primary/20"
                  ),
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Idea Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Schedule for {selectedDate.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">
                  Selected Ideas ({selectedIdeas.length}/3)
                </h3>
                <div className="space-y-2">
                  {selectedIdeas.map((ideaId, index) => {
                    const idea = getSelectedIdeaDetails(ideaId);
                    return (
                      <div
                        key={ideaId}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <Badge variant="outline">{index + 1}</Badge>
                        <div className="flex-1">
                          <p className="font-medium">
                            {idea?.title || "Loading..."}
                          </p>
                          {idea?.narrativeHook && (
                            <p className="text-sm text-muted-foreground truncate">
                              {idea.narrativeHook}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeIdea(ideaId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Available Ideas</h3>
                <Input
                  placeholder="Search ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-96 overflow-y-auto space-y-4 w-full py-4">
                  {availableIdeas?.map((idea: any) => (
                    <button
                      type="button"
                      key={idea.id}
                      className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted w-full"
                      onClick={() => addIdea(idea.id)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{idea.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {idea.ideaScore?.totalScore || "N/A"} |
                          Created:{" "}
                          {new Date(idea.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedIdeas.includes(idea.id) && (
                        <Badge>Selected</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
