# Harmonia — Mobile UX Audit

> Audit of the mobile experience of the Harmonia main generator page
> (`app/page.tsx`). Companion document: `MOBILE_IMPLEMENTATION_PLAN.md`.
>
> **Scope:** the main progression generator route (`/`). The Sketchpad route
> (`/sketchpad`) is out of scope.
>
> **Goal:** improve the mobile experience without regressing the desktop
> experience. Desktop changes are allowed only where additive, cleanup-related,
> or naturally consistency-improving.

---

## How the page is built (summary)

- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Tone.js, Zustand,
  Framer Motion.
- **Responsive model:** pure CSS. The page uses Tailwind utility classes; the
  only breakpoint actually used on the main page is `lg` (1024px), at
  `app/page.tsx:517` (`flex-wrap lg:flex-nowrap`). There is **no** JS mobile
  detection (`useMediaQuery`, `window.innerWidth`, `isMobile`), and **no**
  `@media` queries in `app/globals.css`.
- **Overlays:** there is no shared modal/dialog/sheet/drawer primitive. The
  Substitution panel and Feedback chart are inline conditional panels with no
  scrim/backdrop.
- **Decided direction for the upgrade:** stay CSS-only (Tailwind responsive
  variants), and treat **anything `< lg` (1024px)** as "mobile". Every mobile
  rule must be paired with an `lg:` reset so desktop renders identically.

---

# Section A — Codebase Audit (reference map)

### A.1 Component / area locations

| Area | File | Lines |
|---|---|---|
| Page root / layout shell | `app/page.tsx` | 442–1018 |
| App header / nav | `app/page.tsx` | 445–510 |
| `FeedbackChart` (header button + inline panel) | `components/feedback/FeedbackChart.tsx` | 1–207 |
| Settings panel — Foundation / Generation / Textures | `app/page.tsx` | 514–650 |
| Favorites panel (conditional) | `app/page.tsx` | 652–702 |
| Action bar — Play, Gen Chords, Gen Melody, Rate | `app/page.tsx` | 705–808 |
| `VoicingFeedback` (Rate voicing thumbs) | `components/feedback/VoicingFeedback.tsx` | 1–133 |
| Chord cards (rendered inline — **no dedicated component**) | `app/page.tsx` | 823–947 |
| `InteractivePianoRoll` | `components/creative/InteractivePianoRoll.tsx` | 1–~478 |
| Piano-roll styles | `app/globals.css` | 301–552 |
| `SubstitutionPanel` | `components/creative/SubstitutionPanel.tsx` | 1–168 |
| Empty state | `app/page.tsx` | 992–1006 |
| Footer | `app/page.tsx` | 1012–1015 |
| Global styles / design tokens | `app/globals.css` | 1–779 |
| Tailwind theme config | `tailwind.config.ts` | 1–47 |

### A.2 State / data flow

**Zustand — `lib/state/progressionStore.ts` (`useProgressionStore`):**

| Concern | Field / action |
|---|---|
| Generated progression | `currentProgression: Progression \| null` |
| Generate chords | `generateNew()` |
| Generate melody | `generateMelodyForProgression()` |
| Playback flag | `isPlaying`, `setIsPlaying()` |
| Generation settings | `bpm`, `rootKey`, `mode`, `complexity`, `numChords`, `voicingStyle`, `voiceCount`; `setSettings()` |
| Lock a chord | `toggleLock(index)` (chord carries `isLocked`) |
| Delete a chord | `deleteChord(index)` |
| MIDI export | `exportMidi()`, `exportMelodyMidi()` |
| Substitution | `substitutionTarget`, `substitutionOptions`, `openSubstitution()`, `closeSubstitution()`, `applySubstitution()`, `revertChord()`, `originalChords` |
| Chord provenance | `chordSourceTypes: ChordSourceType[]` (`"generated" \| "substituted" \| "manual"`) |
| Note editing | `addNote`, `removeNote`, `moveNote`, `resetChord`, `shiftNote` |
| Melody | `melody`, `melodyEnabled`, `melodyStyle`, `setMelodyEnabled()`, `setMelodyStyle()`, `moveMelodyNote()` |
| Chords mute | `chordsEnabled`, `setChordsEnabled()` |

**Local React state — `app/page.tsx`:**

| State | Line | Purpose |
|---|---|---|
| `playbackIndex` | 117 | Currently sounding chord (drives card glow + roll highlight) |
| `soundPreset` | 118 | Selected synth preset |
| `generationKey` | 119 | Forces card re-animation on regen |
| `isSynthLoading` | 120 | Disables Play while a sampled synth loads |
| `selectedChordIndex` | 121 | UI-selected chord (cards + roll); set on tap, cleared on Escape |
| `showVoicingControls` | 122 | (declared; minor) |
| `showFavorites` | 123 | Toggles the favorites panel |
| `showMelodyOnRoll` | 124 | Toggles melody overlay on the roll |

**Favorites — `lib/favorites/favoritesStore.ts` (`useFavoritesStore`):**
`favorites`, `addFavorite()`, `removeFavorite()`, `renameFavorite()` —
persisted to `localStorage`.

**Feedback — `lib/feedback/feedbackStore.ts` (`useFeedbackStore`):**
`entries`, `addFeedback()`, `clearAll()` — persisted to `localStorage`
(key `harmonia-voicing-feedback`).

> **Key takeaway:** every behavior the mobile UI needs (generate, play,
> mute, lock, export, substitute, rate, favorite) is **already exposed** by the
> store or local state. **No business-logic or store changes are required** —
> the mobile upgrade is presentation/layout only.

### A.3 CSS / Tailwind / layout patterns

- **Design tokens** (CSS variables, `app/globals.css` 5–14): `--background`
  `#f5f5f0`, `--foreground` `#2c2c2c`, `--surface` `#ffffff`,
  `--surface-muted` `#fafafa`, `--border-subtle` `#e5e5e5`, `--muted` `#6b6b6b`,
  `--accent` `#4a4a4a`. Exposed to Tailwind via `tailwind.config.ts` 10–42
  (`bg-surface`, `text-muted`, `border-subtle`, `text-accent`, etc.).
- **Container:** `max-w-5xl mx-auto px-6` for both header and `<main>`
  (`app/page.tsx:446`, `:512`). `<main>` adds `py-10 space-y-10`.
- **Glassmorphism:** controls/action bars use
  `bg-surface/40 backdrop-blur-xl border border-white/10 rounded-3xl|rounded-full`.
- **Fonts:** Geist Sans (body), Geist Mono (labels/roman numerals).
- **No custom utilities, no plugins, no custom breakpoints** in
  `tailwind.config.ts`.

### A.4 Breakpoints in use

| Breakpoint | Width | Where used |
|---|---|---|
| `lg` | 1024px | `app/page.tsx:517` — settings groups go `flex-wrap` → `lg:flex-nowrap`. The **only** responsive class on the main page. |

`InteractivePianoRoll` carries internal size constants but no Tailwind
breakpoints. The action bar (705–808) relies on `flex-wrap` with no breakpoint,
so it wraps purely by available width.

---

# Section B — Mobile UX Audit (prioritized issues)

Issues are ordered by the requested priority. Risk level describes the risk to
the **existing desktop experience** if the recommended fix is implemented.

---

### Issue 1 — Primary generation action is not obvious  *(Priority 1)*

- **Problem:** "Gen Chords" (`app/page.tsx` 744–751) is a plain text button with
  a small `Sparkles` icon, sitting inside a wrapping pill. It has the same
  visual weight as "Gen Melody" and less weight than the accent-filled
  Play/Stop button. The single most important action on the page does not read
  as the primary call-to-action.
- **User impact:** First-time mobile users do not know where to start. The
  empty state copy says "click **Generate**", but no button is labelled
  "Generate" or visually dominant.
- **Files / components:** `app/page.tsx` 705–808 (action bar), 744–764 (Gen
  Chords group), 992–1006 (empty-state copy referencing "Generate").
- **Recommended fix:** Promote one dominant **Generate** CTA — accent fill,
  larger touch target, full-width or clearly widest in the mobile bottom action
  bar (see Plan Phase 2). Keep "Gen Melody" as a clearly secondary action.
  Align the button label with the empty-state copy.
- **Risk level:** Low. The CTA restyle is mobile-scoped via `lg:` resets; the
  `handleGenerate` handler (`app/page.tsx:337`) is unchanged.
- **Desktop impact:** None if the desktop pill keeps its current classes behind
  `lg:`. *Optional, additive:* the empty-state/button label mismatch ("Gen
  Chords" vs "Generate") could be unified on desktop too — flagged as a safe
  consistency cleanup, not required.

---

### Issue 2 — Header is overcrowded and overflows on mobile  *(Priority 2)*

- **Problem:** The header right cluster (`app/page.tsx` 451–508) packs, in one
  non-wrapping flex row: `<FeedbackChart>` button, Save icon button, Favorites
  button (with count), "Chords" export, "Melody" export, and the "Sketchpad"
  link. Inside `max-w-5xl px-6` this exceeds ~390–420px viewports and overflows
  horizontally (visible in screenshot 1, where the right-side buttons run to the
  screen edge / are clipped).
- **User impact:** Buttons are clipped or pushed off-screen; horizontal overflow
  can cause the whole page to scroll sideways; tap targets are cramped.
- **Files / components:** `app/page.tsx` 445–510; `components/feedback/FeedbackChart.tsx`
  (header button 45–58).
- **Recommended fix:** On `< lg`, reduce the header to logo + a single
  **overflow menu** (kebab/`…`) that contains Feedback, Save, Favorites, Chords
  export, Melody export, and Sketchpad. Render the full button row only at
  `lg:`. Pure CSS toggle of two markup blocks (`flex lg:hidden` /
  `hidden lg:flex`); the overflow menu open/close is a local `useState` boolean
  (allowed — it is UI toggle state, not media-query JS).
- **Risk level:** Low–Medium. Medium only because it introduces a new
  (small) menu element; mitigated by keeping the desktop row a separate,
  untouched markup block.
- **Desktop impact:** None — the desktop row is preserved verbatim behind
  `hidden lg:flex`.

---

### Issue 3 — Settings panel consumes too much vertical space  *(Priority 3)*

- **Problem:** The settings section (`app/page.tsx` 514–650) has three groups —
  Foundation, Generation, Textures — each with `min-w-[240px]` / `min-w-[260px]`
  / `min-w-[280px]`. Below `lg` the row `flex-wrap`s, so all three stack into
  three full-width rows of paired dropdowns. On a 390px-tall-ish first viewport
  this pushes the actual output (chords + piano roll) far below the fold.
- **User impact:** The page opens looking like a settings form. The "generate →
  hear → adjust → explore" flow is buried; users must scroll past configuration
  before seeing or doing anything musical.
- **Files / components:** `app/page.tsx` 514–650.
- **Recommended fix:** On `< lg`, collapse the three groups into a single
  tappable **"Current Settings" summary row** (e.g. `D# Minor · 140 BPM · 4
  Chords · Rich`) that expands the full panel on tap. Show the full panel
  inline at `lg:` exactly as today. Use a local `useState` toggle for
  expand/collapse (UI state only).
- **Risk level:** Low. The collapse wrapper is mobile-only; the full panel
  markup and all `<select>`/`setSettings` wiring are unchanged.
- **Desktop impact:** None — desktop always renders the expanded panel.

---

### Issue 4 — Core actions are not thumb-reachable  *(Priority 4)*

- **Problem:** The action bar (`app/page.tsx` 705–808) is a centered pill that
  `flex-wrap`s into 2–3 rows on narrow screens (Play / Gen Chords+mute / Gen
  Melody+mute / Rate voicing). It is positioned in normal document flow, so once
  the user scrolls down to the chord cards or piano roll, the actions scroll off
  the top of the screen.
- **User impact:** To regenerate, play, or stop while looking at the output, the
  user must scroll back up. The most-used controls are not reachable in the
  thumb zone. Wrapped rows also produce an untidy, unstable layout.
- **Files / components:** `app/page.tsx` 705–808.
- **Recommended fix:** On `< lg`, render the action bar as a **sticky bottom
  action bar** (`fixed inset-x-0 bottom-0`) with `safe-area-inset-bottom`
  padding; add bottom padding to `<main>` so content clears it. At `lg:`, reset
  to the current centered in-flow pill. Same single component, restyled by
  breakpoint — no duplicate logic.
- **Risk level:** Medium. `position: fixed` interacts with page scroll and the
  sticky header (`z-50`); z-index and safe-area handling must be correct, and
  the bar must not overlap the piano roll's horizontal scroll affordance.
- **Desktop impact:** None if the `fixed` rules are `< lg`-only and `lg:static`
  restores current behavior. **Flagged:** verify the bottom bar does not cover
  the substitution sheet (also bottom-anchored — see Issue 6); z-index ordering
  between the two must be defined in the plan.

---

### Issue 5 — Selected chord state is too weak  *(Priority 5)*

- **Problem:** Chord cards (`app/page.tsx` 852–860) have four visual states:
  `isActive` (playing) → `bg-accent/10 border-accent ring-2 ring-accent/20`;
  selected → `bg-surface border-accent/50 ring-2 ring-accent/15`; locked →
  `border-accent/30 ring-1 ring-accent/10`; default. The **selected** state
  uses `ring-accent/15` (15% opacity) — barely visible, especially on mobile in
  daylight, and easily confused with the locked state.
- **User impact:** After tapping a chord the user gets little feedback about
  which chord is "in focus" for substitution/editing. The link between a tapped
  card and the piano roll column is unclear.
- **Files / components:** `app/page.tsx` 852–860 (card state classes); selection
  also reflected in `InteractivePianoRoll` via the `selectedIndex` prop
  (`app/page.tsx:955`).
- **Recommended fix:** Strengthen the selected state — stronger border + ring
  opacity + subtle background tint, clearly distinct from both the playing
  (`isActive`) state and the locked state. Apply on all viewports (this is a
  safe, additive clarity improvement, not mobile-only).
- **Risk level:** Low. Pure class-value change on an existing state branch.
- **Desktop impact:** Minor and intentional — the selected ring becomes more
  visible on desktop too. This is an additive consistency improvement; flagged
  here because it is a deliberate (small) desktop visual change.

---

### Issue 6 — Substitute chord sheet is cluttered and unusable on touch  *(Priority 6)*

- **Problem (two parts):**
  1. **Critical mobile blocker:** each substitution row's Play and Apply buttons
     are wrapped in `opacity-0 group-hover:opacity-100`
     (`components/creative/SubstitutionPanel.tsx:126`). Touch devices have no
     hover, so **the Apply and Preview buttons never appear — a user cannot
     apply a substitution on mobile at all.**
  2. The panel is an inline docked card (`app/page.tsx` 976–989, wrapped in
     `max-w-md`) with no scrim/backdrop. It renders in document flow below the
     piano roll, so it competes with the main UI and the user may not notice it
     appeared (screenshot 2 shows it sitting low in the page).
- **User impact:** Substitution — a core creative feature — is effectively
  broken on mobile. Even when the panel is found, rows are dense (symbol +
  roman + badge + two hidden buttons + a notes/reason line) and hard to scan.
- **Files / components:** `components/creative/SubstitutionPanel.tsx` (whole
  file; row 113–149, hover-gated actions 126); mount point `app/page.tsx`
  975–989; data shape `lib/creative/types.ts` (`SubstitutionOption`).
- **Recommended fix:**
  - **Make Play/Apply always visible on touch** — drop the
    `opacity-0 group-hover:opacity-100` wrapper, or gate it behind `lg:` so only
    desktop keeps hover-reveal.
  - On `< lg`, render the panel as a **bottom sheet** (`fixed inset-x-0
    bottom-0`, rounded top corners) over a dimming **scrim**; `lg:` resets to the
    current inline `max-w-md` card.
  - Make rows **compact** — primary line (symbol · roman · category badge ·
    Apply) always visible; tap a row to **expand** the notes + `reason`
    explanation.
- **Risk level:** Medium. Adds a fixed-position layer + scrim where none exists
  today; must coordinate z-index with the new bottom action bar (Issue 4) and
  the sticky header. The hover-reveal removal is itself a desktop-visible change
  (see below).
- **Desktop impact:** The bottom-sheet/scrim behavior is `< lg`-only. The
  hover-reveal change **does** affect desktop unless gated behind `lg:` —
  recommendation: keep `lg:` hover-reveal so desktop is unchanged, OR (cleaner,
  flagged for approval) show the buttons always on desktop too. Plan assumes
  desktop hover-reveal is preserved via `lg:`.

---

### Issue 7 — Piano roll dominates but does not explain itself  *(Priority 7)*

- **Problem:** `InteractivePianoRoll` (`components/creative/InteractivePianoRoll.tsx`)
  renders a 52px fixed piano-key column plus a horizontally scrolling note grid
  (`app/globals.css` ~338, ~411). It is the tallest element on screen but has no
  label or affordance hint — nothing tells the user it is interactive (tap to
  hear, drag notes, edit) or that it scrolls horizontally.
- **User impact:** Users do not know the roll is editable, or that more content
  exists off-screen horizontally. It reads as a static decoration that simply
  takes space.
- **Files / components:** `components/creative/InteractivePianoRoll.tsx`;
  styles `app/globals.css` 301–552; mount `app/page.tsx` 952–973.
- **Recommended fix:** Add a small context label / caption above the roll
  (e.g. "Piano roll — tap notes to hear, drag to edit · scroll →"). Ensure a
  horizontal-scroll affordance is visible on mobile (edge fade or hint). Keep
  the roll's existing interaction logic untouched.
- **Risk level:** Low. A caption is additive; no change to roll internals.
- **Desktop impact:** None if the caption is `< lg`-only, or negligible/additive
  if shown on all sizes (a caption is harmless on desktop). Plan treats it as
  mobile-only to be conservative.

---

### Issue 8 — "Rate voicing" feels detached from the result  *(Priority 8)*

- **Problem:** `VoicingFeedback` (the thumbs up/down + "Rate voicing" label) is
  rendered as the last item inside the wrapping action pill
  (`app/page.tsx` 793–805). On mobile it wraps onto its own row, far from the
  chord cards/piano roll it is rating, and far from the Generate action that
  produced the voicing.
- **User impact:** Users do not connect the rating control to the generated
  output; the prompt to rate is easy to miss, lowering feedback capture.
- **Files / components:** `app/page.tsx` 793–805;
  `components/feedback/VoicingFeedback.tsx`.
- **Recommended fix:** On `< lg`, move "Rate voicing" out of the action bar and
  place it adjacent to the generated output — e.g. a slim row directly under the
  chord cards / above or below the piano roll, near the result it scores. Keep
  it inline in the action bar at `lg:`.
- **Risk level:** Low. `VoicingFeedback` is self-contained; it just needs to be
  rendered in a different container on mobile. Its props
  (`progression`, `rootKey`, `mode`, …) are all already available at the new
  location in `app/page.tsx`.
- **Desktop impact:** None if desktop keeps the current in-action-bar placement
  behind `lg:`.

---

### Issue 9 — General spacing & typography are too tight for mobile  *(Priority 9)*

- **Problem:** `px-6` page gutters; many labels at `text-[8px]`–`text-[10px]`
  (`app/page.tsx` 521, 564, 607, 611, 873, 911, 915, 919, 924); icon-only
  buttons with `p-1` (lock/shuffle on cards, `app/page.tsx` 886, 896) yield tap
  targets well under the 44×44px touch guideline.
- **User impact:** Text is hard to read; small controls (lock, shuffle, mute,
  thumbs, row close) are hard to hit accurately on a phone, causing mis-taps.
- **Files / components:** `app/page.tsx` (gutters `:446`, `:512`; label/badge
  sizes throughout cards & settings); `components/creative/SubstitutionPanel.tsx`
  (row padding, close button); `components/feedback/VoicingFeedback.tsx`
  (`p-1.5` thumb buttons).
- **Recommended fix:** On `< lg`, slightly relax gutters (`px-4`), bump the
  smallest labels up a step, and enlarge interactive icon targets to ≥44px
  (padding/min-size, not necessarily larger icons). Pair each with an `lg:`
  reset to preserve the desktop's compact density.
- **Risk level:** Low. Spacing/size tweaks only, all `< lg`-scoped.
- **Desktop impact:** None — desktop density preserved via `lg:` resets.

---

# Section C — Fragile areas (desktop-regression flags)

The following are tightly coupled and must be preserved exactly when making
mobile changes:

1. **Chord-card ↔ piano-roll column alignment.** The chord-card row is offset by
   `paddingLeft: 53` (`app/page.tsx:823`) and each card's width is set by
   `durationToFlex(chord.durationClass)` (`app/page.tsx` 58–66, applied at 850)
   so cards line up with roll columns. Any change to card width, padding, or the
   roll's 52px key column must keep this alignment intact (CLAUDE.md calls this
   out explicitly).

2. **Playhead animation.** `app/page.tsx` 302–333 writes
   `playheadRef.current.style.left` every animation frame; `playheadRef` is
   passed into `InteractivePianoRoll` (`app/page.tsx:966`). The roll and its
   playhead element must stay mounted and positioned (`position: relative`
   ancestor) for the playhead to track correctly. Do not relocate or
   conditionally unmount the roll on mobile.

3. **Substitution mount condition.** The panel renders only when
   `substitutionTarget !== null && currentProgression.chords[substitutionTarget]`
   (`app/page.tsx:976`). Converting it to a bottom sheet must change *styling/
   placement only* — not the mount condition or the `openSubstitution` /
   `closeSubstitution` / `applySubstitution` / `revertChord` wiring.

4. **The single existing breakpoint.** `flex-wrap lg:flex-nowrap`
   (`app/page.tsx:517`) is the only responsive class on the page today. Every
   new mobile rule must ship with an `lg:` counterpart that restores the exact
   current desktop value — otherwise desktop silently regresses.

5. **Sticky header z-index.** The header is `sticky top-0 z-50`
   (`app/page.tsx:445`). A new fixed bottom action bar and a new substitution
   bottom sheet + scrim must have a defined, consistent z-index order relative
   to the header (recommended order documented in the implementation plan).

6. **No overlay primitive exists.** Introducing the first scrim/bottom-sheet
   means there is no existing pattern to copy. Body scroll-lock while a sheet is
   open is *not* currently handled anywhere — decide explicitly whether to add
   it (CSS-only: `overflow-hidden` on a container is acceptable; a JS lock is
   out of the agreed CSS-only scope).

---

## Summary table

| # | Issue | Priority | Risk to desktop | Mobile-only fix? |
|---|---|---|---|---|
| 1 | Primary action not obvious | 1 | Low | Yes (`lg:` reset) |
| 2 | Header overcrowded / overflows | 2 | Low–Med | Yes (`lg:` reset) |
| 3 | Settings panel too tall | 3 | Low | Yes (`lg:` reset) |
| 4 | Actions not thumb-reachable | 4 | Med | Yes (`lg:` reset) |
| 5 | Weak selected chord state | 5 | Low (intentional, additive) | No — all sizes |
| 6 | Substitute sheet unusable on touch | 6 | Med | Mostly (hover-fix needs care) |
| 7 | Piano roll lacks affordance | 7 | Low | Yes |
| 8 | Rate voicing detached | 8 | Low | Yes (`lg:` reset) |
| 9 | Tight spacing / typography | 9 | Low | Yes (`lg:` reset) |
