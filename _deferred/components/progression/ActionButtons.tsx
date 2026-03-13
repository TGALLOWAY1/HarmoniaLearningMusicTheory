"use client";

import { useState } from "react";
import { useProgressionStore } from "../../lib/state/progressionStore";
import AdvancedGenerateModal from "./AdvancedGenerateModal";

export default function ActionButtons() {
    const { generateNew, isPlaying, setIsPlaying } = useProgressionStore();
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    return (
        <>
            <div className="flex gap-3">
                <button
                    onClick={generateNew}
                    className="
          px-8 py-3 rounded-full
          bg-accent text-white
          font-medium
          transition-opacity duration-200
          hover:opacity-90
          active:opacity-75
        "
                >
                    Generate
                </button>
                <button
                    onClick={() => setIsAdvancedOpen(true)}
                    className="
          px-8 py-3 rounded-full
          border border-border-subtle
          font-medium
          bg-surface hover:bg-surface-muted
          transition-colors duration-200
        "
                >
                    Advanced...
                </button>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`
          px-8 py-3 rounded-full
          border border-border-subtle
          font-medium
          transition-colors duration-200
          ${isPlaying
                            ? "bg-surface-muted"
                            : "bg-surface hover:bg-surface-muted"
                        }
        `}
                >
                    {isPlaying ? "Stop" : "Play"}
                </button>
            </div>
            <AdvancedGenerateModal open={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} />
        </>
    );
}
