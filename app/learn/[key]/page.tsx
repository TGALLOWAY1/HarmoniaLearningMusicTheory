"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { PianoRollDemo } from "@/components/piano-roll/PianoRollDemo";
import { CircleOfFifths } from "@/components/circle/CircleOfFifths";
import {
  getMilestoneContent,
  type MilestoneContentSection,
} from "@/lib/curriculum/milestonesContent";
import {
  getSkillModulesForMilestone,
  type SkillModule,
} from "@/lib/curriculum/skillModules";
import { SkillModuleRenderer } from "@/components/curriculum/SkillModuleRenderer";
import { isModuleCompleted } from "@/lib/curriculum/skillCompletion";
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
  totalCards: number;
  seenCards: number;
  masteredCards: number;
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

  // Auto-scroll to first incomplete section (must be before early returns)
  // Safely access milestone and content with optional chaining
  const milestoneForScroll = milestones?.find((m) => m.key === milestoneKey);
  const contentForScroll = milestoneKey ? getMilestoneContent(milestoneKey) : null;
  useEffect(() => {
    if (!milestoneForScroll?.isUnlocked || !contentForScroll || !contentForScroll.sections || contentForScroll.sections.length === 0) {
      return;
    }

    // Calculate first incomplete section index
    const numSections = contentForScroll.sections.length;
    const completedSections = Math.floor(milestoneForScroll.progress * numSections);
    const firstIncompleteIndex = completedSections;

    // Only scroll if there's an incomplete section (not at 100%)
    if (firstIncompleteIndex < numSections) {
      const sectionId = `section-${contentForScroll.sections[firstIncompleteIndex].id}`;
      
      // Small timeout to allow layout to render
      const timeoutId = setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [milestoneForScroll?.isUnlocked, milestoneForScroll?.progress, milestoneKey, contentForScroll]);

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

  const foundMilestone = milestones.find((m) => m.key === milestoneKey);

  if (!foundMilestone) {
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

  // Use the found milestone (guaranteed to exist here)
  const milestone = foundMilestone;
  
  // Find previous and next milestones based on order
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);
  const currentIndex = sortedMilestones.findIndex((m) => m.id === milestone.id);
  const previousMilestone = currentIndex > 0 ? sortedMilestones[currentIndex - 1] : null;
  const nextMilestone = currentIndex < sortedMilestones.length - 1 ? sortedMilestones[currentIndex + 1] : null;

  // Locked state
  if (!milestone.isUnlocked) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* Top Navigation */}
          <div className="flex justify-end">
            <MilestoneNavigation
              previousMilestone={previousMilestone}
              nextMilestone={nextMilestone}
            />
          </div>

          {/* Locked milestone card */}
          <div className="rounded-xl border border-subtle bg-surface-muted p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  {previousMilestone ? (
                    <>
                      This milestone is locked. Complete{" "}
                      <span className="font-medium">
                        &ldquo;{previousMilestone.title}&rdquo;
                      </span>{" "}
                      to unlock it.
                    </>
                  ) : (
                    "This milestone is locked. Complete the previous milestone to unlock it."
                  )}
                </p>
              </div>
            </div>

            {previousMilestone && (
              <div className="flex justify-start pt-1">
                <Link
                  href={`/learn/${previousMilestone.key}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-subtle bg-surface text-foreground px-3 py-1.5 text-xs font-medium hover:bg-surface-muted transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  View previous milestone
                </Link>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-center">
            <MilestoneNavigation
              previousMilestone={previousMilestone}
              nextMilestone={nextMilestone}
            />
          </div>
        </div>
      </main>
    );
  }

  // Unlocked state
  const progressPercent = Math.round(milestone.progress * 100);
  const content = getMilestoneContent(milestoneKey);
  const skillModules = getSkillModulesForMilestone(milestoneKey);
  
  // Calculate completion stats for skill modules (with state for updates)
  const [completedCount, setCompletedCount] = useState(() =>
    skillModules.filter((module) => isModuleCompleted(module.id)).length
  );
  
  // Update completion count when modules complete
  useEffect(() => {
    const updateCount = () => {
      const modules = getSkillModulesForMilestone(milestoneKey);
      setCompletedCount(
        modules.filter((module) => isModuleCompleted(module.id)).length
      );
    };
    
    // Initial calculation
    updateCount();
    
    // Listen for completion events
    const handleCompletionEvent = () => {
      updateCount();
    };
    
    window.addEventListener("skillModuleCompleted", handleCompletionEvent);
    window.addEventListener("storage", handleCompletionEvent);
    
    return () => {
      window.removeEventListener("skillModuleCompleted", handleCompletionEvent);
      window.removeEventListener("storage", handleCompletionEvent);
    };
  }, [milestoneKey]);

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
              <MilestoneNavigation
                previousMilestone={previousMilestone}
                nextMilestone={nextMilestone}
              />
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

          {/* Progress Summary */}
          {milestone.totalCards > 0 && (
            <div className="rounded-xl border border-subtle bg-surface p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-semibold text-foreground mb-0.5">
                    {milestone.totalCards}
                  </div>
                  <div className="text-xs text-muted">Total cards</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-semibold text-foreground mb-0.5">
                    {milestone.seenCards}
                  </div>
                  <div className="text-xs text-muted">Cards seen</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-semibold text-foreground mb-0.5">
                    {milestone.masteredCards}
                  </div>
                  <div className="text-xs text-muted">Cards mastered</div>
                </div>
              </div>
            </div>
          )}

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

        {/* Skill modules */}
        {skillModules.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Skill modules</h2>
              <span className="text-sm text-muted">
                {completedCount} of {skillModules.length} completed
              </span>
            </div>
            <div className="space-y-3">
              {skillModules.map((module) => (
                <SkillModuleRenderer key={module.id} module={module} />
              ))}
            </div>
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

        {/* Bottom Navigation */}
        <MilestoneNavigation
          previousMilestone={previousMilestone}
          nextMilestone={nextMilestone}
        />
      </div>
    </main>
  );
}

function MilestoneNavigation({
  previousMilestone,
  nextMilestone,
}: {
  previousMilestone: MilestoneDto | null;
  nextMilestone: MilestoneDto | null;
}) {
  return (
    <div className="flex items-center gap-2">
      {previousMilestone ? (
        <Link
          href={`/learn/${previousMilestone.key}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-subtle text-muted px-3 py-1.5 text-xs font-medium hover:bg-surface-muted transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous milestone
        </Link>
      ) : (
        <button
          type="button"
          disabled
          title="Not available yet"
          className="inline-flex items-center gap-1.5 rounded-full border border-subtle text-muted px-3 py-1.5 text-xs font-medium opacity-50 cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous milestone
        </button>
      )}

      {nextMilestone ? (
        <Link
          href={`/learn/${nextMilestone.key}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-subtle text-muted px-3 py-1.5 text-xs font-medium hover:bg-surface-muted transition"
        >
          Next milestone
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          title="Not available yet"
          className="inline-flex items-center gap-1.5 rounded-full border border-subtle text-muted px-3 py-1.5 text-xs font-medium opacity-50 cursor-not-allowed"
        >
          Next milestone
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
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
  const sectionId = `section-${section.id}`;

  switch (section.kind) {
    case "text":
      return (
        <div
          id={sectionId}
          className="rounded-2xl border border-subtle bg-surface p-6 shadow-sm space-y-3"
        >
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
        <div
          id={sectionId}
          className="rounded-lg border border-subtle bg-surface-muted p-4 space-y-2"
        >
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
        <div
          id={sectionId}
          className="rounded-2xl border border-subtle bg-surface p-6 shadow-sm space-y-4"
        >
          <h3 className="text-lg font-medium">{section.title}</h3>
          <p className="text-xs text-muted">
            Interactive keyboard: try this scale/chord
          </p>
          <PianoRollDemo />
        </div>
      );

    case "circleDemo":
      return (
        <div id={sectionId}>
          <CircleDemoSection section={section} />
        </div>
      );

    default:
      return null;
  }
}

