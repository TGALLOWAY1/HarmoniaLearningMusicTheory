"use client";

import { getCircleNodes, getNeighborsForKey } from "@/lib/theory";
import type { PitchClass } from "@/lib/theory";
import clsx from "clsx";
import { useMemo } from "react";

export type CircleOfFifthsProps = {
  selectedRoot: PitchClass;
  onSelectRoot: (root: PitchClass) => void;
  showRelativeMinors?: boolean; // default true
  highlightedRoot?: PitchClass | null; // for flashcard "reveal" use
};

const CENTER_X = 100;
const CENTER_Y = 100;
const MAJOR_RADIUS = 70; // Distance from center to major key labels
const MINOR_RADIUS = 55; // Distance from center to relative minor labels

export function CircleOfFifths({
  selectedRoot,
  onSelectRoot,
  showRelativeMinors = true,
  highlightedRoot = null,
}: CircleOfFifthsProps) {
  const nodes = useMemo(() => getCircleNodes(), []);
  const neighbors = useMemo(
    () => getNeighborsForKey(selectedRoot),
    [selectedRoot]
  );

  const STEP = 360 / nodes.length; // 30 degrees per node

  return (
    <div className="relative mx-auto flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-72 w-72">
        {nodes.map((node, index) => {
          // Calculate angle: C at 12 o'clock (subtract 90 degrees)
          const angle = index * STEP - 90;
          const angleRad = (angle * Math.PI) / 180;

          // Major key position (outer ring)
          const majorX = CENTER_X + MAJOR_RADIUS * Math.cos(angleRad);
          const majorY = CENTER_Y + MAJOR_RADIUS * Math.sin(angleRad);

          // Relative minor position (inner ring)
          const minorX = CENTER_X + MINOR_RADIUS * Math.cos(angleRad);
          const minorY = CENTER_Y + MINOR_RADIUS * Math.sin(angleRad);

          // Determine visual state
          const isSelected = node.root === selectedRoot;
          const isHighlighted = highlightedRoot && node.root === highlightedRoot;
          const isNeighbor =
            !isSelected &&
            (node.root === neighbors.left || node.root === neighbors.right);

          // Circle background classes and styles
          const circleClasses = clsx(
            "transition-colors duration-150",
            "rounded-full"
          );

          let circleFill: string;
          if (isHighlighted) {
            circleFill = "rgba(16, 185, 129, 0.7)"; // emerald-500/70
          } else if (isSelected) {
            circleFill = "var(--foreground)";
          } else if (isNeighbor) {
            circleFill = "rgba(107, 107, 107, 0.4)"; // muted/40
          } else {
            circleFill = "var(--surface-muted)";
          }

          // Text classes for major key
          const textClasses = clsx(
            "text-[10px] font-medium cursor-pointer select-none"
          );

          let textFill: string;
          if (isHighlighted) {
            textFill = "var(--background)";
          } else if (isSelected) {
            textFill = "var(--background)";
          } else if (isNeighbor) {
            textFill = "var(--foreground)";
          } else {
            textFill = "var(--muted)";
          }

          // Relative minor text fill
          let minorTextFill: string;
          if (isHighlighted) {
            minorTextFill = "rgba(245, 245, 240, 0.8)"; // background/80
          } else if (isSelected) {
            minorTextFill = "rgba(245, 245, 240, 0.7)"; // background/70
          } else if (isNeighbor) {
            minorTextFill = "var(--muted)";
          } else {
            minorTextFill = "rgba(107, 107, 107, 0.6)"; // muted/60
          }

          return (
            <g key={node.root}>
              {/* Circular background for the wedge label */}
              <circle
                cx={majorX}
                cy={majorY}
                r="12"
                className={circleClasses}
                fill={circleFill}
                onClick={() => onSelectRoot(node.root)}
              />

              {/* Major key label */}
              <text
                x={majorX}
                y={majorY}
                textAnchor="middle"
                dominantBaseline="middle"
                className={textClasses}
                fill={textFill}
                onClick={() => onSelectRoot(node.root)}
              >
                {node.label}
              </text>

              {/* Relative minor label (inner ring) */}
              {showRelativeMinors && (
                <text
                  x={minorX}
                  y={minorY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[8px] cursor-pointer select-none"
                  fill={minorTextFill}
                  onClick={() => onSelectRoot(node.root)}
                >
                  {node.relativeMinor.toLowerCase()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

