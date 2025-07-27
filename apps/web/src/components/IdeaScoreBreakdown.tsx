"use client";

import { cn } from "@/lib/utils";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface IdeaScoreBreakdownProps {
  idea: {
    ideaScore?: {
      totalScore?: number;
      problemSeverity?: number;
      founderMarketFit?: number;
      technicalFeasibility?: number;
      monetizationPotential?: number;
      regulatoryRisk?: number;
      urgencyScore?: number;
      marketTimingScore?: number;
      executionDifficulty?: number;
      moatStrength?: number;
    } | null;
  };
}

export default function IdeaScoreBreakdown({ idea }: IdeaScoreBreakdownProps) {
  const ideaScore = idea.ideaScore;
  
  const scoreMetrics = [
    { label: "Problem Severity", value: ideaScore?.problemSeverity || 8 },
    { label: "Founder Fit", value: ideaScore?.founderMarketFit || 7 },
    { label: "Tech Feasibility", value: ideaScore?.technicalFeasibility || 8 },
    { label: "Monetization Potential", value: ideaScore?.monetizationPotential || 7 },
    { label: "Regulatory Risk", value: ideaScore?.regulatoryRisk || 3 },
    { label: "Urgency Score", value: ideaScore?.urgencyScore || 9 },
    { label: "Market Timing", value: ideaScore?.marketTimingScore || 8 },
    { label: "Execution Difficulty", value: ideaScore?.executionDifficulty || 6 },
    { label: "Moat Strength", value: ideaScore?.moatStrength || 6 },
  ];

  // Prepare radar chart data
  const radarChartData = [
    { 
      subject: 'Problem Severity', 
      value: ideaScore?.problemSeverity || 8,
      fullMark: 10 
    },
    { 
      subject: 'Founder Fit', 
      value: ideaScore?.founderMarketFit || 7,
      fullMark: 10 
    },
    { 
      subject: 'Tech Feasibility', 
      value: ideaScore?.technicalFeasibility || 8,
      fullMark: 10 
    },
    { 
      subject: 'Monetization', 
      value: ideaScore?.monetizationPotential || 7,
      fullMark: 10 
    },
    { 
      subject: 'Low Reg Risk', 
      value: 10 - (ideaScore?.regulatoryRisk || 3), // Invert for better visualization
      fullMark: 10 
    },
    { 
      subject: 'Urgency Score', 
      value: ideaScore?.urgencyScore || 9,
      fullMark: 10 
    },
    { 
      subject: 'Market Timing', 
      value: ideaScore?.marketTimingScore || 8,
      fullMark: 10 
    },
    { 
      subject: 'Execution Ease', 
      value: 10 - (ideaScore?.executionDifficulty || 6), // Invert for better visualization
      fullMark: 10 
    },
    { 
      subject: 'Moat Strength', 
      value: ideaScore?.moatStrength || 6,
      fullMark: 10 
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className={cn(
      "relative rounded-3xl p-6",
      "bg-white dark:bg-black/5",
      "border border-zinc-200 dark:border-zinc-800"
    )}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          📈 IDEA SCORE BREAKDOWN
        </h3>
        <div className="h-px bg-zinc-200 dark:bg-zinc-800 mb-4" />
        <div className="text-center">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            Overall Idea Score: {ideaScore?.totalScore || 75}/100
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 mt-2 w-48 mx-auto" />
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Score Breakdown */}
        <div className="space-y-3">
          {scoreMetrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {metric.label}:
              </span>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "px-3 py-1 rounded-full text-white font-medium text-sm",
                  getScoreColor(metric.value)
                )}>
                  {metric.value}
                </div>
              </div>
            </div>
          ))}
          <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            Visual Styling: Pill-shaped indicators with score inside, color-coded by performance.
          </div>
        </div>

        {/* Right Column - Radar Chart */}
        <div className="flex flex-col items-center">
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData}>
                <PolarGrid gridType="polygon" stroke="#374151" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-zinc-600 dark:text-zinc-400"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 10]} 
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-zinc-600 dark:text-zinc-400"
                />
                <Radar
                  name="Idea Score"
                  dataKey="value"
                  stroke="#ea580c"
                  fill="#ea580c"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#ea580c" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-2">
            Polygon visualization showing all metrics in relation to each other
          </div>
        </div>
      </div>
    </div>
  );
}