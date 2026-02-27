"use client";

import { getCircleNodes, getNeighborsForKey } from "@/lib/theory";
import type { PitchClass } from "@/lib/theory";
import clsx from "clsx";
import { useMemo, useState, useRef } from "react";

export type CircleOfFifthsProps = {
  selectedRoot: PitchClass;
  onSelectRoot: (root: PitchClass) => void;
  showRelativeMinors?: boolean; // default true
  highlightedRoot?: PitchClass | null; // for flashcard "reveal" use
  masteryByRoot?: Record<PitchClass, number>; // 0–1 mastery per major root
  statsByRoot?: Record<
    PitchClass,
    { mastery: number; dueCount: number }
  >; // Optional stats for tooltip (mastery + dueCount)
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
  masteryByRoot,
  statsByRoot,
}: CircleOfFifthsProps) {
  const nodes = useMemo(() => getCircleNodes(), []);
  const neighbors = useMemo(
    () => getNeighborsForKey(selectedRoot),
    [selectedRoot]
  );

  // Hover state for tooltip
  const [hoveredRoot, setHoveredRoot] = useState<PitchClass | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const STEP = 360 / nodes.length; // 30 degrees per node

  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseEnter = (
    root: PitchClass,
    svgX: number,
    svgY: number
  ) => {
    if (!statsByRoot) return;
    setHoveredRoot(root);

    // Calculate tooltip position dynamically based on actual SVG rendered size
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = rect.width / 200;
      const scaleY = rect.height / 200;
      setHoveredPosition({ x: svgX * scaleX, y: svgY * scaleY });
    } else {
      // Fallback
      setHoveredPosition({ x: svgX * (288 / 200), y: svgY * (288 / 200) });
    }
  };

  const handleMouseLeave = () => {
    setHoveredRoot(null);
    setHoveredPosition(null);
  };

  return (
    <div className="relative mx-auto flex w-full max-w-sm aspect-square items-center justify-center">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="w-full h-full"
        onMouseLeave={handleMouseLeave}
      >
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

          // Get mastery value (0-1) for this key
          const mastery = masteryByRoot?.[node.root] ?? 0;
          // Map mastery to opacity: 0.15 + mastery * 0.7 (so even 0 has faint presence)
          const masteryAlpha = 0.15 + mastery * 0.7;

          // Circle background classes and styles
          const circleClasses = clsx(
            "transition-colors duration-150",
            "rounded-full"
          );

          let circleFill: string;
          let baseOpacity: number;

          if (isHighlighted) {
            circleFill = "var(--music-highlight-bg)";
            baseOpacity = 0.7; // Highlight overrides mastery
          } else if (isSelected) {
            circleFill = "var(--foreground)";
            baseOpacity = 1.0; // Selection overrides mastery
          } else if (isNeighbor) {
            circleFill = "var(--music-neighbor-bg)";
            baseOpacity = 0.4; // Neighbor state overrides mastery
          } else {
            // Apply mastery-based styling for unselected keys
            circleFill = "var(--foreground)";
            baseOpacity = masteryAlpha; // Use mastery-based opacity
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
            minorTextFill = "var(--music-minor-highlight)";
          } else if (isSelected) {
            minorTextFill = "var(--music-minor-selected)";
          } else if (isNeighbor) {
            minorTextFill = "var(--muted)";
          } else {
            minorTextFill = "var(--music-minor-muted)";
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
                opacity={baseOpacity}
                onClick={() => onSelectRoot(node.root)}
                onMouseEnter={() =>
                  handleMouseEnter(node.root, majorX, majorY)
                }
                onMouseLeave={handleMouseLeave}
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
                onMouseEnter={() =>
                  handleMouseEnter(node.root, majorX, majorY)
                }
                onMouseLeave={handleMouseLeave}
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

      {/* Tooltip overlay */}
      {statsByRoot && hoveredRoot && hoveredPosition && (
        <div
          className="absolute z-10 rounded-lg border border-subtle bg-surface px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${hoveredPosition.x + 16}px`,
            top: `${hoveredPosition.y - 40}px`,
            pointerEvents: "none",
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-medium text-foreground">
            {hoveredRoot} major
          </div>
          <div className="mt-1 space-y-0.5 text-muted">
            <div>
              Mastery:{" "}
              <span className="font-medium text-foreground">
                {statsByRoot?.[hoveredRoot]?.mastery !== undefined
                  ? (statsByRoot[hoveredRoot].mastery * 100).toFixed(0)
                  : "0"}%
              </span>
            </div>
            <div>
              Due:{" "}
              <span className="font-medium text-foreground">
                {statsByRoot?.[hoveredRoot]?.dueCount ?? 0} card
                {(statsByRoot?.[hoveredRoot]?.dueCount ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

