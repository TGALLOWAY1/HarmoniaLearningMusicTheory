# ChordGenerator Adapter Policy

**Never import from ChordGenerator/** outside `lib/chordGeneratorAdapter.ts`.

The ChordGenerator folder (`ChordGenerator/Harmonia Chord Progression Generator/`) is an internal implementation. The only public entrypoint is `lib/chordGeneratorAdapter.ts`, which:

- Accepts Harmonia canonical inputs (`PitchClass`, `ScaleType`)
- Returns Harmonia-shaped progressions (`{ degree, symbol, quality, notes: PitchClass[] }[]`)
- Normalizes enharmonics to Harmonia's sharps-only policy

All other imports from ChordGenerator/** are forbidden.
