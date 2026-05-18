# Harmonia — Mobile Implementation Plan

> Phased implementation plan for the Harmonia mobile UX upgrade.
> Companion document: `MOBILE_UX_AUDIT.md` (read it first — issue numbers below
> reference its Section B).
>
> **Audience:** a coding agent implementing the upgrade. This document is meant
> to be specific enough to execute without re-deriving the design.

---

## Ground rules (apply to every phase)

1. **CSS-only responsiveness.** Use Tailwind responsive variants only. No
   `useMediaQuery`, no `window.innerWidth`, no `isMobile` state, no `@media`
   queries in `globals.css`. Local `useState` booleans for UI toggles
   (overflow menu open, settings expanded) are allowed — they are not
   media-query JS.
2. **Mobile = `< lg` (1024px).** Reuse the app's existing single breakpoint.
   Every mobile rule must ship with an `lg:` counterpart that restores the exact
   current desktop value.
3. **Desktop must render byte-identical.** Where mobile needs different markup,
   render both blocks and toggle with `flex lg:hidden` / `hidden lg:flex`. Where
   only styling differs, layer `lg:` resets onto the same element.
4. **No business-logic / store changes.** All needed behavior is already
   exposed (see `MOBILE_UX_AUDIT.md` §A.2). Touch presentation only. Do not
   change `lib/state/progressionStore.ts`, generators, or audio code.
5. **Preserve fragile couplings.** Honor `MOBILE_UX_AUDIT.md` §C — card/roll
   alignment (`paddingLeft: 53` + `durationToFlex`), the playhead ref, the
   substitution mount condition, and the header z-index.
6. **Z-index contract** (define once, use everywhere):
   `header sticky = z-50` (unchanged) · `substitution scrim = z-50` ·
   `substitution bottom sheet = z-50` (above its scrim) ·
   `bottom action bar = z-40`. The substitution sheet sits **above** the bottom
   action bar; the bottom action bar sits above page content.
7. **Verify after every phase:** `npm run lint` and `npm run build` clean, plus
   the phase's regression check. Do not batch phases before verifying.

---

## Phase 1 — Safe Mobile Layout Improvements

**Goal:** reduce mobile clutter and height with the lowest-risk changes.
**Files:** `app/page.tsx`, `components/feedback/FeedbackChart.tsx`,
`app/globals.css` (optional, for a `safe-area` utility only — see Phase 2).

### 1.1 Simplify the mobile header  *(Audit Issue 2)*
- In `app/page.tsx` 451–508, split the header right cluster into two sibling
  blocks:
  - **Desktop block** — the current row exactly as-is, wrapped with
    `hidden lg:flex`.
  - **Mobile block** — `flex lg:hidden`: the logo stays; add one overflow
    button (kebab `…`, lucide `MoreVertical` or `Menu`) that toggles a small
    dropdown/menu.
- The overflow menu contains, as full-width tappable rows (≥44px tall):
  Feedback, Save to favorites (only when `currentProgression`), Favorites
  (with count), Export Chords (only when `currentProgression`), Export Melody
  (only when `melodyEnabled && melody`), Sketchpad link. Reuse the existing
  `onClick` handlers verbatim (`addFavorite(...)`, `exportMidi`,
  `exportMelodyMidi`, `setShowFavorites`, the `FeedbackChart` open, the
  `/sketchpad` `<Link>`).
- Menu open/close: a new local `useState` boolean (e.g. `headerMenuOpen`).
  Close on item tap and on outside tap.
- `FeedbackChart` currently renders its own button + inline panel. For the
  mobile menu, trigger the same open state — simplest: keep `<FeedbackChart>`
  rendered, and in the mobile menu add an item that opens it. If `FeedbackChart`
  does not expose an external open handler, the minimal allowed change is to
  add an optional `renderTrigger`/controlled `open` prop; keep its default
  behavior unchanged for desktop.

### 1.2 Collapse the settings panel on mobile  *(Audit Issue 3)*
- In `app/page.tsx` 514–650, wrap the existing three-group `<div>` (517–649) so
  that:
  - At `lg:` it renders expanded, exactly as today.
  - Below `lg` it is hidden by default and replaced by a **"Current Settings"
    summary row** — a single tappable bar showing a compact digest, e.g.
    `D# Minor · 140 BPM · 4 Chords · Rich · Lyrical · Piano`, built from
    `rootKey`, `mode`, `bpm`, `numChords`, the `COMPLEXITY_LABELS[complexity]`,
    `melodyStyle`, `soundPreset`.
  - Tapping the summary row expands the full panel inline (the same markup,
    now shown); tapping again collapses it.
- Use a new local `useState` boolean (e.g. `settingsExpanded`, default
  `false`). Apply with classes, not JS branching of markup: e.g. the full panel
  gets `hidden lg:flex` plus, when `settingsExpanded`, `flex` on mobile; the
  summary row gets `flex lg:hidden`.
- Do **not** touch any `<select>` / `<input>` element or its `setSettings` /
  `setMelodyStyle` / `setSoundPreset` handler.

### 1.3 Relax mobile gutters & typography  *(Audit Issue 9)*
- Header (`:446`) and `<main>` (`:512`): `px-6` → `px-4 lg:px-6`.
- Bump the smallest labels one step on mobile where they read as cramped
  (settings group labels 521/564/607, card sub-labels 911/915/919/924): add
  `text-[11px] lg:text-[10px]`-style pairs. Keep changes conservative; do not
  alter card/roll alignment.
- Enlarge icon-only tap targets to ≥44px on mobile: card lock/shuffle buttons
  (`:886`, `:896` — `p-1` → `p-2.5 lg:p-1`), mute toggles, substitution close.
  Increase padding/min-size, not icon size, to avoid layout shift.

### Phase 1 regression check
- Desktop (`≥1024px`): header row, settings panel, gutters, and all label sizes
  visually identical to pre-change.
- Mobile: header shows logo + `…` only, no horizontal overflow at 375/390/414px;
  settings collapsed to one summary row; summary digest matches current
  settings; expand/collapse works.
- All header actions still function from the overflow menu (save, favorites,
  exports, feedback, sketchpad).

---

## Phase 2 — Mobile Action Model

**Goal:** make core actions always reachable, with one dominant CTA.
**Files:** `app/page.tsx` (action bar 705–808, `<main>` padding),
`app/globals.css` (one safe-area helper, optional).

### 2.1 Sticky bottom action bar  *(Audit Issues 1, 4)*
- Keep the action bar as **one** rendered element. Apply breakpoint-layered
  classes so that:
  - `< lg`: `fixed inset-x-0 bottom-0 z-40` with top border, surface background
    (drop the wrapping `flex-wrap` pill look — use a solid bar so it reads as
    chrome), and bottom padding for the iOS home indicator.
  - `lg:`: reset to the current centered, in-flow, `rounded-full`,
    `backdrop-blur-xl` pill (`lg:static lg:inset-auto lg:bottom-auto`, restore
    `lg:rounded-full`, `lg:flex-wrap`, current paddings/border).
- Safe area: add `pb-[env(safe-area-inset-bottom)]` to the bar (or a small
  `.safe-bottom` utility in `globals.css`). Add matching bottom padding to
  `<main>` on `< lg` only (`pb-28 lg:pb-0`, value ≈ bar height) so the footer
  and last content are not hidden behind the fixed bar.

### 2.2 One dominant Generate CTA  *(Audit Issue 1)*
- Within the mobile bar, make **Generate** (the `handleGenerate` button,
  currently "Gen Chords", `:746`) the visually dominant control: accent fill
  (`bg-accent text-white`), largest width (flex-grow / widest), ≥48px tall.
- Consider renaming the visible label to **"Generate"** on mobile to match the
  empty-state copy at `:1002` (desktop label may stay "Gen Chords" behind
  `lg:`, or unify — unifying is an optional, additive cleanup; flag it).

### 2.3 Chords / Melody as a split action  *(Audit Issue 1)*
- Treat melody generation as clearly secondary: in the mobile bar, "Gen Melody"
  becomes a smaller secondary button (or a segment paired with Generate). The
  Chords/Melody mute toggles (`setChordsEnabled`, `setMelodyEnabled`) should
  remain accessible — acceptable to keep them as small icon buttons attached to
  their respective generate buttons, or move them into a small "..." within the
  bar. Do not remove them.

### 2.4 Play / Stop
- Keep the Play/Stop button (`handleTogglePlayback`, `:709`) in the mobile bar,
  clearly available alongside Generate. Preserve the loading-spinner and
  disabled states (`!currentProgression || isSynthLoading`).

### Phase 2 regression check
- Desktop: action bar is the original centered pill, identical position and
  styling; no fixed positioning.
- Mobile: bar is pinned to the bottom, visible while scrolling the chord
  cards / piano roll; does not cover the footer (main has bottom padding);
  clears the iOS home indicator.
- Generate / Play / Stop / Gen Melody / both mute toggles all function;
  `isSynthLoading` and disabled states intact.
- Z-index: bar sits above page content, below the (future) substitution sheet.

---

## Phase 3 — Output Interaction Improvements

**Goal:** make the musical output legible and clearly interactive.
**Files:** `app/page.tsx` (chord cards 823–947, roll mount 952–973),
`components/creative/InteractivePianoRoll.tsx`, `app/globals.css` (roll styles).

### 3.1 Strong selected chord state  *(Audit Issue 5)*
- In `app/page.tsx` 852–860, strengthen the `selectedChordIndex === index`
  branch: raise ring opacity and border weight and add a subtle bg tint so it
  is unmistakable and clearly distinct from both `isActive` (playing) and the
  `isLocked` state. Example direction (tune to taste):
  `bg-accent/5 border-accent ring-2 ring-accent/40`.
- Keep the `isActive` (playing) branch visually distinct (it already has the
  pulsing glow at 863–869). Ensure the three states — playing, selected,
  locked — are mutually distinguishable.
- Apply on all viewports (safe, additive clarity gain). This is a deliberate,
  minor desktop visual change — call it out in the PR description.

### 3.2 Active / playing state
- Confirm the playing state remains the strongest cue during playback. No
  structural change required; only verify it still out-reads the strengthened
  selected state from 3.1.

### 3.3 Piano roll context label / affordance  *(Audit Issue 7)*
- Add a small caption above `InteractivePianoRoll` (in `app/page.tsx` near
  952, or inside the component): e.g. "Piano roll — tap a note to hear it, drag
  to edit". Mobile-only (`lg:hidden`) is the conservative choice; showing it on
  all sizes is also acceptable (harmless).
- Add a horizontal-scroll affordance on mobile (edge fade gradient on the
  scrolling grid container, or a "scroll →" hint) so users know more columns
  exist off-screen. Implement via CSS in `globals.css` scoped to the roll's
  scroll container; do not change roll interaction logic.

### 3.4 Chord card ↔ piano roll relationship
- Verify tapping a chord card and tapping a roll column both drive the same
  `selectedChordIndex` (cards call `handleChordClick` → `setSelectedChordIndex`;
  roll receives `onSelectChord={setSelectedChordIndex}` at `:959`). Ensure the
  strengthened selected style (3.1) is mirrored by the roll column's selected
  styling (`app/globals.css` roll-column selected rules) so the two read as
  linked.

### Phase 3 regression check
- Selecting a chord (tap card or roll column) produces an obvious, consistent
  highlight on both the card and the matching roll column.
- Playback highlight still tracks the playhead; playing vs selected vs locked
  are all visually distinct.
- Card/roll column alignment unchanged (`paddingLeft: 53` + `durationToFlex`
  intact).
- Roll horizontal scroll, note tap-to-hear, and drag-edit still work.

---

## Phase 4 — Substitute Chord Bottom Sheet

**Goal:** make substitution usable and readable on mobile; fix the touch
blocker. **Files:** `components/creative/SubstitutionPanel.tsx`,
`app/page.tsx` (mount 975–989).

### 4.1 Fix the hover-only action buttons — **critical**  *(Audit Issue 6)*
- In `SubstitutionPanel.tsx:126`, the row Play/Apply buttons are wrapped in
  `opacity-0 group-hover:opacity-100`. Change so the buttons are **always
  visible on touch**: either remove the opacity wrapper entirely, or gate it
  behind `lg:` (`lg:opacity-0 lg:group-hover:opacity-100`) so only desktop
  keeps hover-reveal. **Recommended:** keep `lg:` hover-reveal so desktop is
  unchanged. This single fix unblocks substitution on mobile.

### 4.2 Bottom-sheet presentation on mobile
- The panel is mounted in `app/page.tsx` 976–989 inside `<div className="mt-4
  max-w-md">`. Change the wrapper + panel root so that:
  - `< lg`: the panel is a **bottom sheet** — `fixed inset-x-0 bottom-0 z-50`,
    rounded top corners, max-height ~80vh with internal scroll, rendered above
    a **scrim** (`fixed inset-0 z-50 bg-black/40`, tap-to-close calling
    `closeSubstitution`). The sheet must sit above the Phase 2 bottom action bar
    (`z-40`).
  - `lg:`: reset to the current inline docked card (`lg:static lg:max-w-md
    lg:mt-4`, no scrim — `scrim` element is `lg:hidden`).
- Keep the mount condition (`substitutionTarget !== null && ...`) and all
  handler props (`onPreview`, `onApply`, `onRevert`, `onClose`, `canRevert`)
  exactly as-is.
- Optional CSS-only body scroll containment while the sheet is open: acceptable
  to add `overflow-hidden` on a wrapping container via a class. A JS scroll-lock
  is out of scope.

### 4.3 Compact rows with expand-for-detail  *(Audit Issue 6)*
- In `SubstitutionPanel.tsx` rows (113–149), restructure each row so the
  **primary line** is always visible and scannable: `candidateSymbol` ·
  `candidateRomanNumeral` · category badge · **Apply** button.
- Move the secondary detail — `candidateNotes.join(" · ")` and `reason` — into
  an **expandable** area revealed by tapping the row (local `useState` for the
  expanded row id, or a native `<details>`). Preview (Play) button lives in the
  expanded area or stays on the primary line as a small icon — keep it reachable
  on touch (per 4.1).
- Keep category filter pills (79–103) — they already wrap; just verify spacing
  and ≥44px tap height on mobile.

### 4.4 Apply / preview clarity
- Apply remains visible and obvious on every row. Preview (Play) must be
  tappable on touch. The footer "Revert to original chord" (155–165) stays;
  ensure it is reachable inside the scrollable sheet.

### Phase 4 regression check
- Desktop: substitution panel is the original inline `max-w-md` card; row
  Play/Apply still hover-reveal; no scrim.
- Mobile: opening substitution shows a bottom sheet over a scrim; tapping the
  scrim or the X closes it; Apply and Preview are visible and work **without
  hover**; rows are compact and expand to show notes + reason.
- `applySubstitution`, `revertChord`, `closeSubstitution`, preview audio all
  behave as before; chord source badge ("Substituted") still appears on the
  card.
- Substitution sheet renders above the bottom action bar.

---

## Phase 5 — QA / Regression Testing

**Goal:** confirm the mobile upgrade ships without desktop regressions.

### 5.1 Build / static checks
- `npm run lint` — clean (no new warnings/errors).
- `npm run build` — succeeds, no TypeScript errors.
- (`lib/db.ts` Prisma import error and the stale `lib/theory/__tests__`
  adapter references are **pre-existing** per CLAUDE.md — not introduced here,
  not blocking.)

### 5.2 Browsers
- Mobile Safari (iOS) — primary; verify `env(safe-area-inset-bottom)`.
- Chrome on Android.
- Desktop Chrome.
- Desktop Safari.

### 5.3 Viewport matrix
Test at: **375px, 390px, 414px, 768px**, and a typical **desktop width
(≥1280px)**. At 768px (still `< lg`) the full mobile treatment must apply; at
≥1024px the desktop layout must be intact.

| Check | 375 | 390 | 414 | 768 | desktop |
|---|---|---|---|---|---|
| No horizontal page overflow | ✓ | ✓ | ✓ | ✓ | ✓ |
| Header: mobile shows logo + `…`; desktop shows full row | m | m | m | m | d |
| Settings collapsed to summary (mobile) / expanded (desktop) | m | m | m | m | d |
| Bottom action bar fixed (mobile) / in-flow pill (desktop) | m | m | m | m | d |
| Substitution = bottom sheet (mobile) / inline card (desktop) | m | m | m | m | d |
| Generate CTA visibly dominant | ✓ | ✓ | ✓ | ✓ | n/a |

### 5.4 Functional regression checklist (all viewports)
- [ ] Generate chords produces a progression; cards animate in.
- [ ] Generate melody works; melody overlay appears on the roll.
- [ ] Play / Stop toggles; playhead animates and tracks; loop works.
- [ ] Chord & melody mute toggles affect audio.
- [ ] Tapping a chord card selects it and previews audio.
- [ ] Lock / unlock a chord; locked chords survive regeneration.
- [ ] Delete chord via keyboard (desktop) still works.
- [ ] Save to favorites; load a favorite; remove a favorite.
- [ ] Export Chords MIDI and Export Melody MIDI download files.
- [ ] Open substitution, preview, apply, revert; source badge updates.
- [ ] Rate voicing thumbs submit and lock to "Logged".
- [ ] Feedback chart opens and shows history.
- [ ] Sketchpad link navigates.
- [ ] Card ↔ roll column alignment correct at every viewport.

---

## Acceptance Criteria

The upgrade is complete when **all** of the following hold:

- **Desktop layout remains functionally and visually unchanged** at ≥1024px
  (header, settings panel, action bar, substitution panel, chord cards, piano
  roll) — except the deliberate, minor, additive selected-chord-state
  strengthening (Phase 3.1), which is called out in the PR description.
- **Mobile header no longer overflows horizontally** at 375 / 390 / 414 / 768px.
- **The primary generation action is immediately visible and thumb-reachable**
  on mobile (dominant CTA in the sticky bottom bar).
- **Settings are collapsed / compact by default on mobile**, expandable on tap.
- **Chord selection state is visually obvious** and distinct from the playing
  and locked states.
- **The substitute chord sheet is readable and usable on mobile** — it appears
  as a bottom sheet over a scrim, and **Apply / Preview work without hover**.
- **The piano roll remains usable**, communicates its interactivity, and does
  not block the core actions.
- **No existing behavior breaks** — generation, playback, favorites, lock,
  delete, MIDI export, substitution apply/revert, melody, rating all function
  as before.
- **No TypeScript, lint, or build errors** are introduced.

---

## File-change summary (expected touch list)

| File | Phases | Nature of change |
|---|---|---|
| `app/page.tsx` | 1, 2, 3 | Header split, settings collapse, gutter/type tweaks, bottom action bar, CTA, selected-card style, roll caption, substitution mount wrapper |
| `components/feedback/FeedbackChart.tsx` | 1 | Minimal — optional controlled-open prop for the mobile overflow menu |
| `components/creative/SubstitutionPanel.tsx` | 4 | Bottom-sheet styling, fix hover-only buttons, compact expandable rows |
| `components/creative/InteractivePianoRoll.tsx` | 3 | Optional — caption / scroll affordance (may instead live in `page.tsx` + `globals.css`) |
| `app/globals.css` | 2, 3, 4 | Safe-area helper, roll scroll-affordance gradient, optional sheet styles |

**Not changed:** `lib/state/progressionStore.ts`, `lib/favorites/*`,
`lib/feedback/*`, `lib/creative/*` (engines/types), `lib/music/*`, `lib/audio/*`,
`tailwind.config.ts` (no new breakpoints needed). If `tailwind.config.ts` must
change at all, limit it to additive token/utility entries.
