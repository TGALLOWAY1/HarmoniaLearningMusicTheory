"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MilestoneDto = {
  id: number;
  key: string;
  title: string;
  description: string;
  order: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
};

type GetMilestonesResponse = {
  milestones: MilestoneDto[];
};

export default function LearnPage() {
  const [data, setData] = useState<MilestoneDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/milestones");
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const json: GetMilestonesResponse = await res.json();
      // Sort by order defensively (API should already sort, but be safe)
      const sorted = (json.milestones ?? []).sort((a, b) => a.order - b.order);
      setData(sorted);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load milestones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-2">
            Learn path
          </h1>
          <p className="text-muted max-w-xl text-sm">
            Follow a structured path through notes, scales, chords, and the circle of fifths.
            Milestones unlock over time as you practice and explore.
          </p>
        </div>

        {loading && (
          <p className="text-sm text-muted">Loading milestones…</p>
        )}

        {error && !loading && (
          <div className="space-y-2">
            <p className="text-sm text-red-600">
              {error}
            </p>
            <button
              onClick={load}
              className="inline-flex items-center rounded-full border border-subtle px-3 py-1 text-xs font-medium hover:bg-surface-muted"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <div className="grid gap-4 md:grid-cols-2">
            {data.map((m) => (
              <MilestoneCard key={m.id} milestone={m} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function MilestoneCard({ milestone }: { milestone: MilestoneDto }) {
  const pct = Math.round(milestone.progress * 100);

  return (
    <div className="rounded-2xl border border-subtle bg-surface p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">{milestone.title}</h2>
          <p className="text-xs text-muted mt-1">
            {milestone.description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={
              "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide border " +
              (milestone.isUnlocked
                ? "border-subtle text-muted"
                : "border-subtle text-muted opacity-60")
            }
          >
            {milestone.isUnlocked ? "Unlocked" : "Locked"}
          </span>
          {milestone.isCompleted && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide bg-foreground text-surface">
              Completed
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex justify-end">
        {milestone.isUnlocked ? (
          <Link
            href={`/practice?milestone=${encodeURIComponent(milestone.key)}`}
            className="text-[11px] font-medium text-foreground border border-subtle rounded-full px-3 py-1 hover:bg-surface-muted transition"
          >
            Practice this
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="text-[11px] font-medium text-muted border border-subtle rounded-full px-3 py-1 opacity-60 cursor-not-allowed"
          >
            Locked
          </button>
        )}
      </div>
    </div>
  );
}

