"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PianoRollDemo } from "@/components/piano-roll/PianoRollDemo";
import { CircleOfFifths } from "@/components/circle/CircleOfFifths";
import {
  getMilestoneContent,
  type MilestoneContentSection,
} from "@/lib/curriculum/milestonesContent";
import type { PitchClass } from "@/lib/theory";

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

export default function MilestoneDetailPage() {
  const params = useParams();
  const milestoneKey = params.key as string;

  const [milestones, setMilestones] = useState<MilestoneDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/milestones");
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const json: GetMilestonesResponse = await res.json();
      setMilestones(json.milestones ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load milestones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMilestones();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-sm text-muted">Loading milestone…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-4">
          <p className="text-sm text-red-600">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={loadMilestones}
              className="inline-flex items-center rounded-full border border-subtle px-3 py-1 text-xs font-medium hover:bg-surface-muted"
            >
              Retry
            </button>
            <Link
              href="/learn"
              className="inline-flex items-center rounded-full border border-subtle px-3 py-1 text-xs font-medium hover:bg-surface-muted"
            >
              Back to curriculum
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!milestones) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-4">
          <p className="text-sm text-muted">No milestones found.</p>
          <Link
            href="/learn"
            className="inline-flex items-center rounded-full border border-subtle px-3 py-1 text-xs font-medium hover:bg-surface-muted"
          >
            Back to curriculum
          </Link>
        </div>
      </main>
    );
  }

  const milestone = milestones.find((m) => m.key === milestoneKey);

  if (!milestone) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-4">
          <p className="text-sm text-muted">
            Milestone not found. It may have been removed or the URL is incorrect.
          </p>
          <Link
            href="/learn"
            className="inline-flex items-center rounded-full border border-subtle px-3 py-1 text-xs font-medium hover:bg-surface-muted"
          >
            Back to curriculum
          </Link>
        </div>
      </main>
    );
  }

  const content = getMilestoneContent(milestoneKey);
  const previousMilestone = milestones
    .filter((m) => m.order < milestone.order)
    .sort((a, b) => b.order - a.order)[0];

  // Locked state
  if (!milestone.isUnlocked) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
          <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-light tracking-tight mb-2">
                  {milestone.title}
                </h1>
                <p className="text-muted text-sm">{milestone.description}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide border border-subtle text-muted opacity-60">
                Locked
              </span>
            </div>

            <div className="pt-4 border-t border-subtle">
              <p className="text-sm text-muted">
                {previousMilestone
                  ? `Complete "${previousMilestone.title}" to unlock this milestone.`
                  : "Complete the previous milestone to unlock this one."}
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/learn"
                className="inline-flex items-center rounded-full border border-subtle px-4 py-2 text-sm font-medium hover:bg-surface-muted transition"
              >
                Back to curriculum
              </Link>
              {previousMilestone && (
                <Link
                  href={`/learn/${previousMilestone.key}`}
                  className="inline-flex items-center rounded-full bg-foreground text-surface px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                >
                  View previous milestone
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Unlocked state
  const progressPercent = Math.round(milestone.progress * 100);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-light tracking-tight mb-2">
                {milestone.title}
              </h1>
              <p className="text-muted">{milestone.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide border ${
                  milestone.isCompleted
                    ? "bg-foreground text-surface border-foreground"
                    : "border-subtle text-muted"
                }`}
              >
                {milestone.isCompleted ? "Completed" : "In progress"}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Hero summary */}
          {content?.heroSummary && (
            <div className="rounded-2xl border border-subtle bg-surface p-4 shadow-sm">
              <p className="text-sm text-foreground">{content.heroSummary}</p>
            </div>
          )}
        </div>

        {/* Sections */}
        {content && content.sections.length > 0 ? (
          <div className="space-y-6">
            {content.sections.map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-sm">
            <p className="text-sm text-muted">Content coming soon.</p>
          </div>
        )}

        {/* Practice CTA */}
        <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-medium mb-2">Practice this milestone</h2>
            <p className="text-sm text-muted">
              Practice cards are tailored to this milestone. Work through
              flashcards to master the concepts you just learned.
            </p>
          </div>
          <Link
            href={`/practice?milestone=${encodeURIComponent(milestone.key)}`}
            className="inline-flex items-center justify-center rounded-full bg-foreground text-surface px-4 py-2 text-sm font-medium hover:opacity-90 transition"
          >
            Practice this milestone
          </Link>
        </div>
      </div>
    </main>
  );
}

function CircleDemoSection({
  section,
}: {
  section: MilestoneContentSection;
}) {
  const [selectedRoot, setSelectedRoot] = useState<PitchClass>("C");

  return (
    <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-medium">{section.title}</h3>
      <div className="flex justify-center">
        <CircleOfFifths
          selectedRoot={selectedRoot}
          onSelectRoot={setSelectedRoot}
          showRelativeMinors={true}
        />
      </div>
    </div>
  );
}

function SectionRenderer({
  section,
}: {
  section: MilestoneContentSection;
}) {
  switch (section.kind) {
    case "text":
      return (
        <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-sm space-y-3">
          <h3 className="text-lg font-medium">{section.title}</h3>
          {section.body && (
            <p className="text-sm text-foreground leading-relaxed">
              {section.body}
            </p>
          )}
        </div>
      );

    case "info":
      return (
        <div className="rounded-lg border border-subtle bg-surface-muted p-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
            {section.title}
          </h4>
          {section.body && (
            <p className="text-xs text-foreground leading-relaxed">
              {section.body}
            </p>
          )}
        </div>
      );

    case "pianoRollDemo":
      return (
        <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-medium">{section.title}</h3>
          <p className="text-xs text-muted">
            Interactive keyboard: try this scale/chord
          </p>
          <PianoRollDemo />
        </div>
      );

    case "circleDemo":
      return <CircleDemoSection section={section} />;

    default:
      return null;
  }
}

