"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as Tone from "tone";
import Link from "next/link";
import { Music, ArrowLeft } from "lucide-react";
import { useSketchpadStore } from "@/lib/sketchpad/store";
import { SketchpadProjectList } from "@/components/sketchpad/ProjectList";
import { SketchpadWorkspace } from "@/components/sketchpad/Workspace";

export default function SketchpadPage() {
  const {
    projects,
    activeProjectId,
    loadFromStorage,
    setActiveProject,
  } = useSketchpadStore();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setLoaded(true);
  }, [loadFromStorage]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface/80 backdrop-blur-md flex-shrink-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-px h-5 bg-border-subtle" />
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-accent" />
              <h1 className="text-sm font-semibold tracking-tight">Harmonia</h1>
            </div>
            <span className="text-xs text-muted">Harmonic Sketchpad</span>
          </div>
          {activeProject && (
            <div className="text-sm text-muted">
              {activeProject.title}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {activeProject ? (
          <SketchpadWorkspace project={activeProject} />
        ) : (
          <SketchpadProjectList
            projects={projects}
            onSelectProject={setActiveProject}
          />
        )}
      </div>
    </div>
  );
}
