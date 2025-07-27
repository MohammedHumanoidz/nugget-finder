"use client";

import { TrendingUp, Target, Zap, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Metric {
  label: string;
  value: string;
  trend: number;
  description?: string;
}

interface StatsCardsProps {
  idea: {
    ideaScore?: {
      problemSeverity?: number;
      technicalFeasibility?: number;
      marketTimingScore?: number;
    } | null;
  };
}

const METRIC_COLORS = {
  Opportunity: "#2CD758",
  Problem: "#FF2D55", 
  Feasibility: "#FF9500",
  "Why Now": "#007AFF",
} as const;

const METRIC_ICONS = {
  Opportunity: TrendingUp,
  Problem: Target,
  Feasibility: Zap,
  "Why Now": Clock,
} as const;

export default function StatsCards({ idea }: StatsCardsProps) {
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const metrics: Metric[] = [
    {
      label: "Opportunity",
      value: (idea.ideaScore?.problemSeverity || 9).toString(),
      trend: (idea.ideaScore?.problemSeverity || 9) * 10,
      description: "Exceptional"
    },
    {
      label: "Problem",
      value: (idea.ideaScore?.problemSeverity || 9).toString(),
      trend: (idea.ideaScore?.problemSeverity || 9) * 10,
      description: "Severe Pain"
    },
    {
      label: "Feasibility", 
      value: (idea.ideaScore?.technicalFeasibility || 6).toString(),
      trend: (idea.ideaScore?.technicalFeasibility || 6) * 10,
      description: "Challenging"
    },
    {
      label: "Why Now",
      value: (idea.ideaScore?.marketTimingScore || 9).toString(),
      trend: (idea.ideaScore?.marketTimingScore || 9) * 10,
      description: "Perfect Timing"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = METRIC_ICONS[metric.label as keyof typeof METRIC_ICONS];
        return (
          <div
            key={metric.label}
            className={cn(
              "relative h-full rounded-3xl p-6",
              "bg-white dark:bg-black/5",
              "border border-zinc-200 dark:border-zinc-800",
              "hover:border-zinc-300 dark:hover:border-zinc-700",
              "transition-all duration-300"
            )}
            onMouseEnter={() => setIsHovering(metric.label)}
            onMouseLeave={() => setIsHovering(null)}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
                <Icon 
                  className="w-5 h-5" 
                  style={{ color: METRIC_COLORS[metric.label as keyof typeof METRIC_COLORS] }}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {metric.label}
                </h3>
              </div>
            </div>

            {/* Metric Ring */}
            <div className="flex flex-col items-center">
              <div
                className="relative flex flex-col items-center"
              >
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800/50" />
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full border-4 transition-all duration-500",
                      isHovering === metric.label && "scale-105"
                    )}
                    style={{
                      borderColor: METRIC_COLORS[metric.label as keyof typeof METRIC_COLORS],
                      background: `conic-gradient(${METRIC_COLORS[metric.label as keyof typeof METRIC_COLORS]} ${metric.trend * 3.6}deg, transparent 0deg)`,
                      borderRadius: '50%',
                      mask: 'radial-gradient(circle at center, transparent 60%, black 60%)',
                      WebkitMask: 'radial-gradient(circle at center, transparent 60%, black 60%)',
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {metric.value}
                    </span>
                  </div>
                </div>
                <span className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  ({metric.description})
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}