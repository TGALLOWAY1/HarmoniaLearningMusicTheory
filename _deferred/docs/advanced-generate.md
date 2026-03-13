# Advanced Generate

## How to Access
- Open the progression page (`/progression`)
- Keep using `Generate` for the existing default flow
- Click `Advanced...` to open the new Advanced Generate modal
- Click `Generate Advanced` to create a voiced progression

## Advanced Options
- `Complexity (1-4)`
  - `1`: triads
  - `2`: seventh chords
  - `3`: extensions (9/13 where applicable)
  - `4`: altered dominants (e.g., `7alt`) with tighter resolution tendencies
- `Voicing Style`
  - `auto`, `closed`, `open`, `drop2`, `drop3`, `spread`
- `Voice Count`
  - 3 to 5 voices
- `Range Low / High`
  - MIDI range bounds used by voicing and voice-leading selection
- `Passing chords`
  - Enables passing diminished insertions between whole-step bass motions
- `Suspensions`
  - Enables sus4-prep chords before selected dominant-resolution points
- `Secondary dominants`
  - Injects `V/x` dominant approach chords
- `Tritone substitution`
  - Applies dominant tritone substitutions to selected dominant functions
- `Seed`
  - Optional deterministic seed; blank uses random seed

## Output Meaning
- Each row shows:
  - Degree label (Roman/function label)
  - Chord symbol
  - Realized voiced notes
- Notes are shown as note names with octaves plus MIDI numbers
- MIDI notes are sorted low-to-high and chosen by shortest-path style voice-leading

## Backward Compatibility
- Existing `Generate` behavior remains unchanged
- Advanced generation runs in a separate, additive code path behind the `Advanced...` entry point
