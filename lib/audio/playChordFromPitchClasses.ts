/**
 * Audio Utilities for Playing Chords and Scales
 * 
 * Uses Web Audio API to play chords and scales from pitch classes.
 */

import type { PitchClass } from "../theory/midiUtils";
import { pitchClassToMidi } from "../theory";

/**
 * Play a chord from an array of pitch classes
 * @param pitchClasses - Array of pitch classes to play
 * @param octave - Octave number (default: 4, middle octave)
 * @param duration - Duration in seconds (default: 1.0)
 */
export function playChordFromPitchClasses(
  pitchClasses: PitchClass[],
  octave: number = 4,
  duration: number = 1.0
): void {
  if (typeof window === "undefined") return; // SSR guard

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;

    // Play all notes simultaneously
    pitchClasses.forEach((pc) => {
      const midiNote = pitchClassToMidi(pc, octave);
      const frequency = 440 * Math.pow(2, (midiNote - 69) / 12); // A4 = 440Hz, MIDI 69

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine"; // Use sine wave for cleaner sound

      // Envelope: fade in and out
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // Fade in
      gainNode.gain.linearRampToValueAtTime(0.3, now + duration - 0.1);
      gainNode.gain.linearRampToValueAtTime(0, now + duration); // Fade out

      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  } catch (error) {
    console.warn("Audio playback not available:", error);
  }
}

/**
 * Play a scale from an array of pitch classes (ascending)
 * @param pitchClasses - Array of pitch classes to play
 * @param octave - Starting octave number (default: 4)
 * @param noteDuration - Duration of each note in seconds (default: 0.3)
 */
export function playScaleFromPitchClasses(
  pitchClasses: PitchClass[],
  octave: number = 4,
  noteDuration: number = 0.3
): void {
  if (typeof window === "undefined") return; // SSR guard

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    let currentTime = audioContext.currentTime;

    // Play notes sequentially
    pitchClasses.forEach((pc, index) => {
      // Determine octave for this note (wrap to next octave if needed)
      const noteOctave = octave + Math.floor(index / 7);
      const midiNote = pitchClassToMidi(pc, noteOctave);
      const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      // Envelope: quick fade in/out
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.3, currentTime + noteDuration - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + noteDuration);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + noteDuration);

      currentTime += noteDuration;
    });
  } catch (error) {
    console.warn("Audio playback not available:", error);
  }
}

