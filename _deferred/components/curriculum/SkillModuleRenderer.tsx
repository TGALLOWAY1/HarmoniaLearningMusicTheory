"use client";

import { useState, useEffect } from "react";
import type { SkillModule } from "@/lib/curriculum/skillModules";
import { TriadBuilderModule } from "@/components/skills/TriadBuilderModule";
import { CircleBossModule } from "@/components/skills/CircleBossModule";
import { isModuleCompleted } from "@/lib/curriculum/skillCompletion";

export function SkillModuleRenderer({ module }: { module: SkillModule }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check completion status on mount and when module closes
  useEffect(() => {
    const checkCompletion = () => {
      setIsCompleted(isModuleCompleted(module.id));
    };
    
    checkCompletion();
    
    // Listen for storage changes (when modules mark themselves as completed in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "harmonia.skillCompletion.v1") {
        checkCompletion();
      }
    };
    
    // Listen for custom completion events (same-window updates)
    const handleCompletionEvent = (e: CustomEvent) => {
      if (e.detail?.moduleId === module.id) {
        checkCompletion();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("skillModuleCompleted", handleCompletionEvent as EventListener);
    
    // Also check when module closes (for same-window updates)
    if (!isOpen) {
      checkCompletion();
    }
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("skillModuleCompleted", handleCompletionEvent as EventListener);
    };
  }, [module.id, isOpen]);

  const getDifficultyColor = (difficulty: SkillModule["difficulty"]) => {
    switch (difficulty) {
      case "intro":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "core":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "boss":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted border-subtle";
    }
  };

  const getDifficultyLabel = (difficulty: SkillModule["difficulty"]) => {
    switch (difficulty) {
      case "intro":
        return "Intro";
      case "core":
        return "Core";
      case "boss":
        return "Boss";
      default:
        return difficulty;
    }
  };

  const renderModuleContent = () => {
    switch (module.kind) {
      case "triad_builder":
        return <TriadBuilderModule moduleId={module.id} />;
      case "circle_boss":
        return <CircleBossModule moduleId={module.id} />;
      case "interval_quiz":
        return <div className="text-sm text-muted">Interval Quiz module (coming soon)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl border border-subtle bg-surface p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-medium">{module.title}</h4>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(
                module.difficulty
              )}`}
            >
              {getDifficultyLabel(module.difficulty)}
            </span>
            {isCompleted && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-green-500/10 text-green-600 border-green-500/20">
                Completed
              </span>
            )}
          </div>
          <p className="text-sm text-muted">{module.description}</p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center rounded-full border border-subtle bg-surface-muted text-foreground px-4 py-2 text-sm font-medium hover:bg-surface hover:border-foreground/20 transition whitespace-nowrap"
        >
          {isOpen ? "Close module" : isCompleted ? "Review module" : "Open module"}
        </button>
      </div>
      {isOpen && (
        <div className="pt-3 border-t border-subtle">
          {renderModuleContent()}
        </div>
      )}
    </div>
  );
}

