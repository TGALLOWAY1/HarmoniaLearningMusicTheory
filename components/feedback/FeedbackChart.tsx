"use client";

import { useState } from "react";
import { BarChart3, X, Trash2 } from "lucide-react";
import { useFeedbackStore } from "@/lib/feedback/feedbackStore";

/** Group feedback entries into time buckets and compute up/down ratios. */
function computeChartData(entries: { timestamp: number; rating: "up" | "down" }[]) {
  if (entries.length === 0) return [];

  // Sort by time
  const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);

  // Group into buckets of ~5 entries each for smoother visualization
  const bucketSize = Math.max(1, Math.ceil(sorted.length / 20));
  const buckets: { label: string; up: number; down: number; total: number; ratio: number }[] = [];

  for (let i = 0; i < sorted.length; i += bucketSize) {
    const slice = sorted.slice(i, i + bucketSize);
    const up = slice.filter((e) => e.rating === "up").length;
    const down = slice.filter((e) => e.rating === "down").length;
    const total = up + down;
    const date = new Date(slice[0].timestamp);
    buckets.push({
      label: `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`,
      up,
      down,
      total,
      ratio: total > 0 ? up / total : 0,
    });
  }

  return buckets;
}

export function FeedbackChart() {
  const entries = useFeedbackStore((s) => s.entries);
  const clearAll = useFeedbackStore((s) => s.clearAll);
  const [isOpen, setIsOpen] = useState(false);

  const totalUp = entries.filter((e) => e.rating === "up").length;
  const totalDown = entries.filter((e) => e.rating === "down").length;
  const total = totalUp + totalDown;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-subtle bg-surface-muted hover:bg-accent/10 hover:border-accent/30 text-xs font-medium text-muted hover:text-foreground transition-all"
        title="View voicing feedback history"
      >
        <BarChart3 className="w-3.5 h-3.5" />
        Feedback
        {total > 0 && (
          <span className="ml-1 text-[10px] text-muted/60">({total})</span>
        )}
      </button>
    );
  }

  const chartData = computeChartData(entries);

  return (
    <div className="bg-surface rounded-2xl border border-border-subtle p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Voicing Feedback</h3>
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear all feedback data?")) clearAll();
              }}
              className="p-1 rounded text-muted/40 hover:text-red-400 transition-colors"
              title="Clear all feedback"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-muted/40 hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-muted">Up: {totalUp}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-xs text-muted">Down: {totalDown}</span>
        </div>
        <div className="text-xs text-muted">
          Ratio: {total > 0 ? `${Math.round((totalUp / total) * 100)}%` : "—"} positive
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted/50">
          No feedback yet. Rate some progressions to see trends.
        </div>
      ) : (
        <div className="relative">
          {/* SVG bar chart showing up/down ratio over time */}
          <svg
            viewBox={`0 0 ${chartData.length * 40 + 20} 120`}
            className="w-full h-32"
            preserveAspectRatio="none"
          >
            {/* Gridlines */}
            <line x1="0" y1="60" x2={chartData.length * 40 + 20} y2="60" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />
            <line x1="0" y1="30" x2={chartData.length * 40 + 20} y2="30" stroke="currentColor" strokeOpacity="0.05" />
            <line x1="0" y1="90" x2={chartData.length * 40 + 20} y2="90" stroke="currentColor" strokeOpacity="0.05" />

            {chartData.map((bucket, i) => {
              const x = i * 40 + 10;
              const barWidth = 28;
              const maxBarHeight = 50;

              // Up bar (grows upward from center line at y=60)
              const upHeight = bucket.total > 0 ? (bucket.up / bucket.total) * maxBarHeight : 0;
              // Down bar (grows downward from center line)
              const downHeight = bucket.total > 0 ? (bucket.down / bucket.total) * maxBarHeight : 0;

              return (
                <g key={i}>
                  {/* Up bar */}
                  {upHeight > 0 && (
                    <rect
                      x={x}
                      y={60 - upHeight}
                      width={barWidth}
                      height={upHeight}
                      rx="3"
                      fill="#34d399"
                      fillOpacity="0.6"
                    />
                  )}
                  {/* Down bar */}
                  {downHeight > 0 && (
                    <rect
                      x={x}
                      y={60}
                      width={barWidth}
                      height={downHeight}
                      rx="3"
                      fill="#f87171"
                      fillOpacity="0.6"
                    />
                  )}
                  {/* Count label */}
                  <text
                    x={x + barWidth / 2}
                    y={115}
                    textAnchor="middle"
                    fontSize="7"
                    fill="currentColor"
                    fillOpacity="0.3"
                  >
                    {bucket.total}
                  </text>
                </g>
              );
            })}

            {/* Ratio trend line */}
            {chartData.length > 1 && (
              <polyline
                points={chartData
                  .map((b, i) => `${i * 40 + 24},${100 - b.ratio * 80}`)
                  .join(" ")}
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
            )}
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-between mt-1 px-1">
            <span className="text-[9px] text-muted/40">Older</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-indigo-400 rounded" />
                <span className="text-[9px] text-muted/40">Approval trend</span>
              </div>
            </div>
            <span className="text-[9px] text-muted/40">Newer</span>
          </div>
        </div>
      )}
    </div>
  );
}
