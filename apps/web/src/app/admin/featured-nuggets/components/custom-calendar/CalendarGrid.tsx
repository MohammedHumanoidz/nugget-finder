/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
import { CalendarDay } from './useCalendar';

interface Event {
  id: string;
  date: string;
  ideaIds: string[];
}

interface CalendarGridProps {
  days: CalendarDay[];
  events: Event[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  isDateSelected: (date: Date) => boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({
  days,
  events,
  selectedDate,
  onDateClick,
  isDateSelected
}: CalendarGridProps) {
  // Helper function to check if a date has events
  const hasEvents = (dateString: string): boolean => {
    return events.some(event => {
      const eventDate = event.date.split('T')[0]; // Extract YYYY-MM-DD part
      return eventDate === dateString && event.ideaIds.length > 0;
    });
  };

  return (
    <div className="flex flex-col">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="bg-muted/50 p-3 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const hasEventsForDay = hasEvents(day.dateString);
          const isSelected = isDateSelected(day.date);
          
          return (
            <div
              key={day.dateString}
              onClick={() => onDateClick(day.date)}
              className={`relative min-h-[80px] cursor-pointer border-border border-r border-b p-2 transition-all duration-200 hover:bg-muted/50 ${!day.isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : 'text-foreground'} ${day.isToday ? 'border-primary/60 bg-primary/10' : ''} ${isSelected ? 'border-primary bg-primary/20 ring-1 ring-primary/20' : ''} ${hasEventsForDay && !isSelected ? 'border-primary/50 bg-primary/50' : ''} `}
            >
              {/* Date number */}
              <div className={`font-medium text-sm ${day.isToday ? 'font-semibold text-primary' : ''} ${!day.isCurrentMonth ? 'text-muted-foreground' : ''} `}>
                {day.dayNumber}
              </div>

              {/* Event indicator dot */}
              {hasEventsForDay && (
                <div className="absolute right-2 top-2">
                  <div className="h-2.5 w-2.5 rounded-full border border-white bg-primary shadow-sm" />
                </div>
              )}

              {/* Today indicator */}
              {day.isToday && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 transform">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
