import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { useCalendar } from './useCalendar';

interface Event {
  id: string;
  date: string;
  ideaIds: string[];
}

interface CustomCalendarProps {
  events: Event[];
  onDateSelect: (date: Date) => void;
  initialDate?: Date;
  selectedDate?: Date | null;
}

export function CustomCalendar({
  events,
  onDateSelect,
  initialDate,
  selectedDate: externalSelectedDate
}: CustomCalendarProps) {
  const {
    selectedDate: internalSelectedDate,
    currentMonthYear,
    calendarDays,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    setSelectedDate,
    isDateSelected
  } = useCalendar({ initialDate });

  // Use external selected date if provided, otherwise use internal
  const selectedDate = externalSelectedDate !== undefined ? externalSelectedDate : internalSelectedDate;

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      <CalendarHeader
        currentMonthYear={currentMonthYear}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />
      
      <CalendarGrid
        days={calendarDays}
        events={events}
        selectedDate={selectedDate}
        onDateClick={handleDateClick}
        isDateSelected={isDateSelected}
      />
    </div>
  );
}

export { useCalendar };
export type { Event };
