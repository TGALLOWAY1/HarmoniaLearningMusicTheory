import { Midi } from "@tonejs/midi";
import { Note } from "@tonaljs/tonal";

export type ProgressionChord = {
  symbol: string;
  notesWithOctave: string[];
};

/**
 * Export a chord progression to a MIDI file.
 * Each chord gets one bar (4 beats) in 4/4 time.
 * Includes tempo, track name, and a subtle velocity curve.
 */
export function progressionToMidi(
  chords: ProgressionChord[],
  bpm: number
): Blob {
  const midi = new Midi();
  midi.header.setTempo(bpm);
  midi.header.name = "Harmonia Progression";

  const track = midi.addTrack();
  track.name = "Harmonia Progression";
  const beatsPerBar = 4;
  const secondsPerBeat = 60 / bpm;

  chords.forEach((chord, index) => {
    const startTime = index * beatsPerBar * secondsPerBeat;
    const duration = beatsPerBar * secondsPerBeat;

    // Subtle velocity curve: first beat slightly louder, inner notes slightly softer
    const baseVelocity = 0.72;
    const accentBoost = index === 0 ? 0.08 : 0;

    chord.notesWithOctave.forEach((noteName, noteIdx) => {
      const midiNumber = Note.midi(noteName);
      if (typeof midiNumber !== "number") return;

      // Root note (first) gets a slight accent, upper voices slightly softer
      const velocity = Math.min(
        1,
        baseVelocity + accentBoost + (noteIdx === 0 ? 0.05 : -0.03 * Math.min(noteIdx, 3))
      );

      track.addNote({
        midi: midiNumber,
        time: startTime,
        duration: duration * 0.95, // slight gap between chords
        velocity,
      });
    });
  });

  const bytes = midi.toArray();
  return new Blob([bytes as BlobPart], { type: "audio/midi" });
}
