export type VoiceLeadingSelection = {
  voicing: number[];
  cost: number;
};

function spanPenalty(voicing: number[]): number {
  if (voicing.length < 2) return 0;
  const span = voicing[voicing.length - 1] - voicing[0];
  return span > 24 ? (span - 24) * 0.5 : 0;
}

export function calculateVoiceLeadingCost(previous: number[], next: number[]): number {
  if (previous.length === 0 || next.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  const a = [...previous].sort((x, y) => x - y);
  const b = [...next].sort((x, y) => x - y);

  const overlap = Math.min(a.length, b.length);
  let movement = 0;

  for (let i = 0; i < overlap; i++) {
    const delta = Math.abs(a[i] - b[i]);
    movement += delta;
    if (delta > 7) {
      movement += (delta - 7) * 1.2;
    }
  }

  const extraVoices = Math.abs(a.length - b.length) * 2;
  return movement + extraVoices + spanPenalty(b);
}

export function pickBestVoiceLedCandidate(
  previous: number[] | null,
  candidates: number[][],
  fallbackCenter: number
): VoiceLeadingSelection {
  if (candidates.length === 0) {
    return {
      voicing: [fallbackCenter],
      cost: Number.POSITIVE_INFINITY,
    };
  }

  if (!previous) {
    let best = candidates[0];
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const candidate of candidates) {
      const center = (candidate[0] + candidate[candidate.length - 1]) / 2;
      const distance = Math.abs(center - fallbackCenter) + spanPenalty(candidate);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }

    return {
      voicing: best,
      cost: bestDistance,
    };
  }

  let winner = candidates[0];
  let winnerCost = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const cost = calculateVoiceLeadingCost(previous, candidate);
    if (cost < winnerCost) {
      winner = candidate;
      winnerCost = cost;
    }
  }

  return {
    voicing: winner,
    cost: winnerCost,
  };
}
