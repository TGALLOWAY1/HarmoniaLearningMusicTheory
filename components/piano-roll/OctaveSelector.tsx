"use client";

export type OctaveSelectorProps = {
  value: number; // e.g. 3 means starting at C3
  onChange: (value: number) => void;
  min?: number; // min octave, default 1
  max?: number; // max octave, default 7
};

export function OctaveSelector({
  value,
  onChange,
  min = 1,
  max = 7,
}: OctaveSelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-muted">Octave</label>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className={`
            px-2 py-1 rounded border border-subtle
            text-muted text-sm font-mono
            transition-colors duration-150
            ${
              value <= min
                ? "opacity-50 cursor-not-allowed bg-surface-muted"
                : "bg-surface hover:bg-surface-muted active:bg-surface-muted"
            }
          `}
          aria-label="Decrease octave"
        >
          −
        </button>
        <span className="text-foreground font-mono text-lg font-semibold min-w-[2rem] text-center">
          {value}
        </span>
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className={`
            px-2 py-1 rounded border border-subtle
            text-muted text-sm font-mono
            transition-colors duration-150
            ${
              value >= max
                ? "opacity-50 cursor-not-allowed bg-surface-muted"
                : "bg-surface hover:bg-surface-muted active:bg-surface-muted"
            }
          `}
          aria-label="Increase octave"
        >
          +
        </button>
      </div>
    </div>
  );
}

