import { TrendingUp, Activity } from "lucide-react";

export default function MetricsSection({
  signalsTracked = 12764,
  patternsDetected = 35431,
}: { signalsTracked?: number; patternsDetected?: number }) {
  return (
    <section className="w-full bg-transparent">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Activity className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <div className="text-3xl font-semibold tracking-tight">
              {signalsTracked.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Market signals tracked today</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <TrendingUp className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <div className="text-3xl font-semibold tracking-tight">
              {patternsDetected.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Emerging patterns detected</div>
          </div>
        </div>
      </div>
    </section>
  );
} 