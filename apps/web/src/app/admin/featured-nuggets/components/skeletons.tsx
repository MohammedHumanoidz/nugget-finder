import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CalendarSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-20 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-md border bg-background">
          {/* Calendar header skeleton */}
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </div>
          
          {/* Calendar grid skeleton */}
          <div className="p-4">
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                          {Array.from({ length: 7 }).map((_, i) => (
              <div key={`weekday-${i}`} className="h-8 bg-muted animate-pulse rounded" />
            ))}
            </div>
            
            {/* Calendar days */}
            {Array.from({ length: 5 }).map((_, weekIndex) => (
              <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1 mb-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={`day-${weekIndex}-${dayIndex}`} className="h-16 bg-muted/50 animate-pulse rounded border" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SelectedIdeasSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="h-5 w-36 bg-muted animate-pulse rounded mb-3" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={`selected-idea-${index}`} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="h-6 w-6 bg-muted animate-pulse rounded mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-full bg-muted/70 animate-pulse rounded" />
                  <div className="h-3 w-2/3 bg-muted/70 animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted/50 animate-pulse rounded" />
                </div>
                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AvailableIdeasSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="max-h-[400px] space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`available-idea-${index}`} className="w-full p-3 border rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-full bg-muted/70 animate-pulse rounded" />
                  <div className="h-3 w-4/5 bg-muted/70 animate-pulse rounded" />
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-16 bg-muted/50 animate-pulse rounded" />
                    <div className="h-3 w-3 bg-muted/50 animate-pulse rounded" />
                    <div className="h-3 w-20 bg-muted/50 animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptySelectedIdeas() {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <p className="text-muted-foreground mb-1 font-medium">No ideas scheduled for this date</p>
      <p className="text-sm text-muted-foreground/70">Select up to 3 ideas from the available list →</p>
    </div>
  );
}
