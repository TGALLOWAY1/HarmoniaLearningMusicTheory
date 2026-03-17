# Harmonia — Chord Progression Generator

Generate musically coherent chord progressions in any key and mode. Hear them instantly with real piano samples, edit individual notes, and export to MIDI.

![Harmonia screenshot](public/screenshot.png)

## Features

- **5 modes** — Major, Minor, Dorian, Mixolydian, Phrygian
- **4 complexity levels** — Simple triads through altered dominants, tritone substitutions, and passing chords
- **Variable-duration chords** — Full, half, quarter, and eighth-note durations assigned contextually
- **Real piano samples** — Salamander Grand Piano via Tone.js, plus Mellow, Bell, and Bright synth presets
- **Interactive piano roll** — Click notes to preview, select and shift individual notes up/down by octave
- **Chord locking** — Lock specific chords to preserve them while regenerating the rest
- **MIDI export** — Download your progression as a standard MIDI file
- **Adjustable BPM** — 60–180 BPM with looping playback

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start generating.

## Tech Stack

- [Next.js 14](https://nextjs.org) — React framework
- [Tone.js](https://tonejs.github.io) — Web audio synthesis and scheduling
- [Zustand](https://zustand.docs.pmnd.rs) — State management
- [Tailwind CSS](https://tailwindcss.com) — Utility-first styling
- [Framer Motion](https://motion.dev) — Animations
- TypeScript

## Usage

1. Pick a **key** and **mode** from the control panel
2. Set **complexity** (Simple → Altered) and number of chords
3. Click **Generate** to create a progression
4. Click any chord card to preview it, or hit **Play** to loop the full progression
5. Use the piano roll to inspect voicings — click a note then **Cmd/Ctrl + Arrow Up/Down** to shift it by octave
6. **Lock** chords you like, then regenerate to replace only the unlocked ones
7. **Export MIDI** to bring your progression into a DAW

## About the Name

Harmonia originally began as a music theory learning platform. The app has since evolved to focus entirely on chord progression generation. The learning features are archived.
