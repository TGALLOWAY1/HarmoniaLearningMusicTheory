"use client";

import { useState, useEffect } from "react";
import type { PitchClass } from "@/lib/theory";
import { getCircleNodes } from "@/lib/theory";
import { markModuleCompleted } from "@/lib/curriculum/skillCompletion";

const CENTER_X = 100;
const CENTER_Y = 100;
const RADIUS = 70;
const STEP = 360 / 12; // 30 degrees per slot

type SlotState = {
  key: PitchClass | null;
  index: number;
};

type FeedbackState = "idle" | "checking" | "correct" | "incorrect";

export function CircleBossModule({ moduleId }: { moduleId: string }) {
  const [slots, setSlots] = useState<SlotState[]>(
    Array.from({ length: 12 }, (_, i) => ({ key: null, index: i }))
  );
  const [availableKeys, setAvailableKeys] = useState<PitchClass[]>([]);
  const [draggedKey, setDraggedKey] = useState<PitchClass | null>(null);
  const [draggedFromSlot, setDraggedFromSlot] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [wrongSlots, setWrongSlots] = useState<Set<number>>(new Set());
  const [showAnswer, setShowAnswer] = useState(false);

  const correctNodes = getCircleNodes();

  // Initialize available keys on mount
  useEffect(() => {
    const allKeys: PitchClass[] = [
      "C",
      "G",
      "D",
      "A",
      "E",
      "B",
      "F#",
      "C#",
      "G#",
      "D#",
      "A#",
      "F",
    ];
    // Shuffle the keys for the token pool
    const shuffled = [...allKeys].sort(() => Math.random() - 0.5);
    setAvailableKeys(shuffled);
    setSlots(Array.from({ length: 12 }, (_, i) => ({ key: null, index: i })));
    setFeedback("idle");
    setWrongSlots(new Set());
    setShowAnswer(false);
  }, [moduleId]);

  const handleDragStart = (
    e: React.DragEvent,
    key: PitchClass,
    fromSlotIndex: number | null
  ) => {
    setDraggedKey(key);
    setDraggedFromSlot(fromSlotIndex);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    if (!draggedKey) return;

    setSlots((prev) => {
      const newSlots = [...prev];
      const targetSlot = newSlots[slotIndex];

      // If dropping on an occupied slot, swap or move
      if (targetSlot.key) {
        // If dragging from another slot, swap
        if (draggedFromSlot !== null) {
          newSlots[draggedFromSlot] = { ...targetSlot };
        } else {
          // If dragging from available keys, put the old key back in available
          setAvailableKeys((prevKeys) => [...prevKeys, targetSlot.key!]);
        }
      }

      // Place the dragged key in the target slot
      newSlots[slotIndex] = { ...targetSlot, key: draggedKey };

      // If dragging from a slot, clear that slot
      if (draggedFromSlot !== null && draggedFromSlot !== slotIndex) {
        newSlots[draggedFromSlot] = { ...newSlots[draggedFromSlot], key: null };
      }

      // If dragging from available keys, remove from available
      if (draggedFromSlot === null) {
        setAvailableKeys((prevKeys) =>
          prevKeys.filter((k) => k !== draggedKey)
        );
      }

      return newSlots;
    });

    setDraggedKey(null);
    setDraggedFromSlot(null);
  };

  const handleRemoveFromSlot = (slotIndex: number) => {
    setSlots((prev) => {
      const newSlots = [...prev];
      const keyToRemove = newSlots[slotIndex].key;
      if (keyToRemove) {
        setAvailableKeys((prevKeys) => [...prevKeys, keyToRemove]);
        newSlots[slotIndex] = { ...newSlots[slotIndex], key: null };
      }
      return newSlots;
    });
  };

  const checkCircle = () => {
    const userOrder = slots.map((slot) => slot.key);
    const correctOrder = correctNodes.map((node) => node.root);

    const wrongIndices = new Set<number>();
    userOrder.forEach((key, index) => {
      if (key !== correctOrder[index]) {
        wrongIndices.add(index);
      }
    });

    setWrongSlots(wrongIndices);
    const isCorrect = wrongIndices.size === 0;
    setFeedback(isCorrect ? "correct" : "incorrect");

    // Mark as completed on perfect circle
    if (isCorrect) {
      markModuleCompleted(moduleId);
    }
  };

  const revealAnswer = () => {
    const correctSlots: SlotState[] = correctNodes.map((node, index) => ({
      key: node.root,
      index,
    }));
    setSlots(correctSlots);
    setAvailableKeys([]);
    setShowAnswer(true);
    setFeedback("idle");
    setWrongSlots(new Set());
  };

  const reset = () => {
    const allKeys: PitchClass[] = [
      "C",
      "G",
      "D",
      "A",
      "E",
      "B",
      "F#",
      "C#",
      "G#",
      "D#",
      "A#",
      "F",
    ];
    const shuffled = [...allKeys].sort(() => Math.random() - 0.5);
    setAvailableKeys(shuffled);
    setSlots(Array.from({ length: 12 }, (_, i) => ({ key: null, index: i })));
    setFeedback("idle");
    setWrongSlots(new Set());
    setShowAnswer(false);
  };

  const getSlotPosition = (index: number) => {
    const angle = index * STEP - 90; // C at 12 o'clock
    const angleRad = (angle * Math.PI) / 180;
    const x = CENTER_X + RADIUS * Math.cos(angleRad);
    const y = CENTER_Y + RADIUS * Math.sin(angleRad);
    return { x, y };
  };

  const allSlotsFilled = slots.every((slot) => slot.key !== null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-medium mb-1">Rebuild the Circle of Fifths</h3>
        <p className="text-sm text-muted">
          Drag keys into the circle slots in the correct order
        </p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-center">
        {/* Available Keys (Left) */}
        <div className="w-full lg:w-auto">
          <div className="mb-2 text-xs text-muted font-medium">Available Keys</div>
          <div className="flex flex-wrap gap-2 max-w-xs">
            {availableKeys.map((key) => (
              <div
                key={key}
                draggable
                onDragStart={(e) => handleDragStart(e, key, null)}
                className="px-3 py-2 rounded-full bg-surface border border-subtle text-sm font-medium cursor-move hover:bg-surface-muted hover:border-foreground/20 transition"
              >
                {key}
              </div>
            ))}
            {availableKeys.length === 0 && (
              <div className="text-xs text-muted italic">All keys placed</div>
            )}
          </div>
        </div>

        {/* Circle (Center) */}
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <svg viewBox="0 0 200 200" className="w-80 h-80">
              {/* Draw connecting lines */}
              {slots.map((slot, index) => {
                if (index === slots.length - 1) return null;
                const pos1 = getSlotPosition(index);
                const pos2 = getSlotPosition(index + 1);
                return (
                  <line
                    key={`line-${index}`}
                    x1={pos1.x}
                    y1={pos1.y}
                    x2={pos2.x}
                    y2={pos2.y}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-subtle opacity-30"
                  />
                );
              })}
              {/* Draw line from last to first */}
              {slots.length > 0 && (
                <line
                  x1={getSlotPosition(slots.length - 1).x}
                  y1={getSlotPosition(slots.length - 1).y}
                  x2={getSlotPosition(0).x}
                  y2={getSlotPosition(0).y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-subtle opacity-30"
                />
              )}

              {/* Drop Zones */}
              {slots.map((slot, index) => {
                const pos = getSlotPosition(index);
                const isWrong = wrongSlots.has(index);
                const isCorrect = feedback === "correct";

                return (
                  <g key={`slot-${index}`}>
                    {/* Drop zone circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="12"
                      fill={isWrong ? "rgb(239 68 68 / 0.1)" : "transparent"}
                      stroke={
                        isWrong
                          ? "rgb(239 68 68)"
                          : slot.key
                          ? "currentColor"
                          : "currentColor"
                      }
                      strokeWidth={slot.key ? "2" : "1"}
                      strokeDasharray={slot.key ? "0" : "4 2"}
                      className={
                        slot.key
                          ? isWrong
                            ? "text-red-600"
                            : isCorrect
                            ? "text-green-600"
                            : "text-foreground"
                          : "text-subtle"
                      }
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    />
                    {/* Slot label (index) */}
                    {!slot.key && (
                      <text
                        x={pos.x}
                        y={pos.y + 4}
                        textAnchor="middle"
                        className="text-[8px] fill-muted pointer-events-none"
                      >
                        {index}
                      </text>
                    )}
                    {/* Key label */}
                    {slot.key && (
                      <>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="10"
                          fill="currentColor"
                          className={
                            isWrong
                              ? "text-red-600"
                              : isCorrect
                              ? "text-green-600"
                              : "text-foreground"
                          }
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 4}
                          textAnchor="middle"
                          className="text-[10px] fill-surface font-medium pointer-events-none"
                        >
                          {slot.key}
                        </text>
                        {/* Remove button (X) */}
                        {!showAnswer && (
                          <circle
                            cx={pos.x + 8}
                            cy={pos.y - 8}
                            r="6"
                            fill="currentColor"
                            className="text-muted hover:text-foreground cursor-pointer"
                            onClick={() => handleRemoveFromSlot(index)}
                          />
                        )}
                        {!showAnswer && (
                          <text
                            x={pos.x + 8}
                            y={pos.y - 8 + 3}
                            textAnchor="middle"
                            className="text-[8px] fill-surface font-bold pointer-events-none"
                          >
                            ×
                          </text>
                        )}
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Feedback and Actions */}
      <div className="space-y-3">
        {feedback === "correct" && (
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-green-600">
              ✓ Boss cleared! Perfect circle of fifths!
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-full bg-foreground text-surface px-6 py-2 text-sm font-medium hover:opacity-90 transition"
            >
              Try again
            </button>
          </div>
        )}

        {feedback === "incorrect" && (
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-red-600">
              {wrongSlots.size} slot{wrongSlots.size !== 1 ? "s" : ""} incorrect.
              Keep trying!
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={checkCircle}
                className="inline-flex items-center justify-center rounded-full border border-subtle bg-surface text-foreground px-6 py-2 text-sm font-medium hover:bg-surface-muted transition"
              >
                Check again
              </button>
              <button
                onClick={revealAnswer}
                className="inline-flex items-center justify-center rounded-full bg-foreground text-surface px-6 py-2 text-sm font-medium hover:opacity-90 transition"
              >
                Reveal answer
              </button>
            </div>
          </div>
        )}

        {feedback === "idle" && (
          <div className="text-center space-y-3">
            <div className="flex gap-2 justify-center">
              <button
                onClick={checkCircle}
                disabled={!allSlotsFilled}
                className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-medium transition ${
                  allSlotsFilled
                    ? "bg-foreground text-surface hover:opacity-90"
                    : "bg-surface-muted text-muted border border-subtle cursor-not-allowed"
                }`}
              >
                Check circle
              </button>
              {!showAnswer && (
                <button
                  onClick={revealAnswer}
                  className="inline-flex items-center justify-center rounded-full border border-subtle bg-surface text-foreground px-6 py-2 text-sm font-medium hover:bg-surface-muted transition"
                >
                  Reveal answer
                </button>
              )}
            </div>
            {showAnswer && (
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-full border border-subtle bg-surface text-foreground px-6 py-2 text-sm font-medium hover:bg-surface-muted transition"
              >
                Start over
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

