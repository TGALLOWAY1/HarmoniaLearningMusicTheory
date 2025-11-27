"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

type MilestoneDto = {
  id: number;
  key: string;
  title: string;
  description: string;
  order: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
  totalCards: number;
  seenCards: number;
  masteredCards: number;
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
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-2">
            Learning path
          </h1>
          <p className="text-muted max-w-xl text-sm">
            Follow a structured curriculum through notes, scales, chords, and the circle of fifths.
            Milestones unlock automatically as you master concepts through practice.
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
          <div className="grid gap-6 md:grid-cols-2">
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
    <div className="rounded-2xl border border-subtle bg-surface p-5 shadow-sm space-y-3">
      {/* Status row at top */}
      <div className="flex items-center">
        <MilestoneStatusBadge
          isUnlocked={milestone.isUnlocked}
          isCompleted={milestone.isCompleted}
        />
      </div>

      {/* Title and subtitle */}
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          {milestone.title}
        </h2>
        <p className="text-xs text-muted leading-relaxed">
          {milestone.description}
        </p>
      </div>

      {/* Smaller progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 rounded-full bg-surface-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex items-center gap-2 pt-1">
        {milestone.isUnlocked ? (
          <>
            <Link
              href={`/learn/${milestone.key}`}
              className="inline-flex items-center justify-center rounded-full bg-foreground text-surface px-4 py-2 text-xs font-medium hover:opacity-90 transition flex-1"
            >
              Open milestone
            </Link>
            <Link
              href={`/practice?milestone=${encodeURIComponent(milestone.key)}`}
              className="inline-flex items-center justify-center rounded-full border border-subtle text-foreground px-3 py-1.5 text-[11px] font-medium hover:bg-surface-muted transition"
            >
              Practice this
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled
              title="Complete previous milestones to unlock this content"
              className="inline-flex items-center justify-center rounded-full bg-foreground text-surface px-4 py-2 text-xs font-medium opacity-50 cursor-not-allowed flex-1"
            >
              Open milestone
            </button>
            <button
              type="button"
              disabled
              title="Complete previous milestones to unlock this content"
              className="inline-flex items-center justify-center rounded-full border border-subtle text-muted px-3 py-1.5 text-[11px] font-medium opacity-50 cursor-not-allowed"
            >
              Practice this
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function MilestoneStatusBadge({
  isUnlocked,
  isCompleted,
}: {
  isUnlocked: boolean;
  isCompleted: boolean;
}) {
  if (!isUnlocked) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium text-muted bg-surface-muted/50 border border-subtle/50">
        <Lock className="w-3 h-3" />
        Locked
      </span>
    );
  }

  if (isCompleted) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-foreground text-surface">
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border border-subtle text-foreground">
      In progress
    </span>
  );
}

