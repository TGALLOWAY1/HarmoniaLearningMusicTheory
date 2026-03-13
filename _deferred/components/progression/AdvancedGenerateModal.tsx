"use client";

import { useMemo, useState } from "react";

import { generateFromRegistry, type AdvancedProgressionResult, type VoicingStyle } from "@/lib/music/generators";
import { normalizeToPitchClass } from "@/lib/theory/midiUtils";
import { useProgressionStore } from "@/lib/state/progressionStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

const VOICING_STYLES: VoicingStyle[] = ["auto", "closed", "open", "drop2", "drop3", "spread"];

export default function AdvancedGenerateModal({ open, onClose }: Props) {
  const { rootKey, mode, numChords, applyAdvancedProgression } = useProgressionStore();

  const [complexity, setComplexity] = useState<1 | 2 | 3 | 4>(2);
  const [voicingStyle, setVoicingStyle] = useState<VoicingStyle>("auto");
  const [voiceCount, setVoiceCount] = useState<3 | 4 | 5>(4);
  const [rangeLow, setRangeLow] = useState(48);
  const [rangeHigh, setRangeHigh] = useState(72);
  const [usePassingChords, setUsePassingChords] = useState(true);
  const [useSuspensions, setUseSuspensions] = useState(true);
  const [useSecondaryDominants, setUseSecondaryDominants] = useState(true);
  const [useTritoneSubstitution, setUseTritoneSubstitution] = useState(false);
  const [seedInput, setSeedInput] = useState("");
  const [result, setResult] = useState<AdvancedProgressionResult | null>(null);

  const parsedSeed = useMemo(() => {
    if (!seedInput.trim()) {
      return undefined;
    }

    const parsed = Number(seedInput.trim());
    if (Number.isNaN(parsed)) {
      return undefined;
    }
    return Math.trunc(parsed);
  }, [seedInput]);

  if (!open) {
    return null;
  }

  const handleGenerate = () => {
    const root = normalizeToPitchClass(rootKey) ?? "C";

    const generated = generateFromRegistry({
      generatorId: "advanced",
      options: {
        rootKey: root,
        mode,
        numChords,
        complexity,
        voicingStyle,
        voiceCount,
        rangeLow,
        rangeHigh,
        usePassingChords,
        useSuspensions,
        useSecondaryDominants,
        useTritoneSubstitution,
        seed: parsedSeed,
      },
    });

    applyAdvancedProgression(generated);
    setResult(generated);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-border-subtle bg-surface p-6 shadow-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold">Advanced Generate</h3>
            <p className="text-sm text-muted mt-1">Voice-led progression with substitutions and realized MIDI voicings.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-border-subtle px-3 py-1 text-sm hover:bg-surface-muted"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Complexity: {complexity}</span>
            <input
              type="range"
              min={1}
              max={4}
              value={complexity}
              onChange={(e) => setComplexity(Number(e.target.value) as 1 | 2 | 3 | 4)}
              className="accent-accent"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Voicing Style</span>
            <select
              value={voicingStyle}
              onChange={(e) => setVoicingStyle(e.target.value as VoicingStyle)}
              className="rounded-lg border border-border-subtle bg-background px-3 py-2"
            >
              {VOICING_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Voice Count</span>
            <select
              value={voiceCount}
              onChange={(e) => setVoiceCount(Number(e.target.value) as 3 | 4 | 5)}
              className="rounded-lg border border-border-subtle bg-background px-3 py-2"
            >
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Seed (optional)</span>
            <input
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              placeholder="blank = random"
              className="rounded-lg border border-border-subtle bg-background px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Range Low (MIDI)</span>
            <input
              type="number"
              min={24}
              max={96}
              value={rangeLow}
              onChange={(e) => setRangeLow(Number(e.target.value))}
              className="rounded-lg border border-border-subtle bg-background px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Range High (MIDI)</span>
            <input
              type="number"
              min={24}
              max={108}
              value={rangeHigh}
              onChange={(e) => setRangeHigh(Number(e.target.value))}
              className="rounded-lg border border-border-subtle bg-background px-3 py-2"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={usePassingChords} onChange={(e) => setUsePassingChords(e.target.checked)} />
            Passing chords
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={useSuspensions} onChange={(e) => setUseSuspensions(e.target.checked)} />
            Suspensions
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useSecondaryDominants}
              onChange={(e) => setUseSecondaryDominants(e.target.checked)}
            />
            Secondary dominants
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useTritoneSubstitution}
              onChange={(e) => setUseTritoneSubstitution(e.target.checked)}
            />
            Tritone substitution
          </label>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleGenerate}
            className="rounded-full bg-accent px-6 py-2 font-medium text-white hover:opacity-90"
          >
            Generate Advanced
          </button>
          <span className="text-xs text-muted">Key: {rootKey} · Mode: {mode}</span>
        </div>

        {result && (
          <div className="rounded-xl border border-border-subtle bg-background p-4">
            <div className="mb-3 text-sm text-muted">
              Output ({result.chords.length} chords){" "}
              {result.debug?.seed !== undefined ? <span>· seed {result.debug.seed}</span> : null}
            </div>
            <ol className="space-y-3">
              {result.chords.map((chord, idx) => (
                <li key={`${chord.degreeLabel}-${chord.symbol}-${idx}`} className="rounded-lg border border-border-subtle p-3">
                  <div className="font-medium">
                    {idx + 1}. {chord.degreeLabel} · {chord.symbol}
                  </div>
                  <div className="text-sm text-muted mt-1">
                    {chord.notes.map((note, noteIdx) => `${note} (${chord.midi[noteIdx]})`).join("  |  ")}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
