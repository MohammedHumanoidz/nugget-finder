interface CalendarHeaderProps {
  currentMonthYear: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentMonthYear,
  onPrevMonth,
  onNextMonth,
  onToday
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevMonth}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Previous month"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>Previous</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          type="button"
          onClick={onNextMonth}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Next month"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>Next</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Month/Year title */}
      <h2 className="text-lg font-semibold text-foreground">
        {currentMonthYear}
      </h2>

      {/* Today button */}
      <button
        type="button"
        onClick={onToday}
        className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 py-1 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        Today
      </button>
    </div>
  );
}
