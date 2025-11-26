# Milestone 11 - Curriculum UI Full Version Notes

This document contains summaries from each prompt/task completed during Milestone 11 development.

---

## Prompt 1 - Analyze Current Curriculum + Practice Implementation

### Goal
Analyze the current curriculum and practice implementation to understand the system before extending it with milestone progress, unlocking, and detail pages.

### Analysis Summary:

**Database Schema:**
- `Milestone` model has: `id`, `key` (unique), `title`, `description`, `order`, `isUnlocked` (default: false), `isCompleted` (default: false), `progress` (default: 0.0, Float 0-1)
- `CardTemplate` has nullable `milestoneKey String?` field (string reference, no foreign key)
- No automatic progress computation or unlock logic exists

**Seed Data:**
- 8 milestones seeded (FOUNDATION unlocked by default, others locked)
- CardTemplate assignments: TRIADS (2 cards), CIRCLE_OF_FIFTHS (7 cards)
- 6 milestones have no cards assigned yet

**API Endpoints:**
- `GET /api/milestones` - Returns all milestones sorted by order (no computation)
- `PATCH /api/milestones/[id]` - Manual updates only
- `GET /api/cards/next` - Supports optional `milestoneKey` filtering
- `POST /api/cards/[id]/answer` - Updates CardState only, no milestone tracking

**UI Pages:**
- `/learn` - Displays milestones with static progress/unlock status
- `/practice` - Supports `?milestone=` query parameter for filtering

**Key Findings:**
- Progress and unlock status are completely static/manual
- No computed progress from CardState data
- No automatic unlock logic
- System ready for extension without breaking changes

---

## Prompt 2 - Implement Backend Milestone Progress & Unlock Logic

### Goal
Enhance `GET /api/milestones` to automatically compute progress and unlock milestones based on CardTemplate/CardState data.

### Files Created/Modified:

1. **`lib/curriculum/milestonesService.ts`** - New service module:
   - `isCardMastered()` - Determines if a card is mastered (attemptsCount >= 3 AND correctCount/attemptsCount >= 0.7)
   - `computeMilestoneProgress()` - Calculates progress and completion for a milestone
   - `updateMilestonesProgressAndUnlock()` - Main function that:
     - Computes progress for all milestones (masteredCount / totalTemplates)
     - Sets `isCompleted = true` if progress >= 0.85
     - Forces first milestone to be unlocked
     - Unlocks subsequent milestones when previous is completed
     - Persists all updates to database

2. **`app/api/milestones/route.ts`** - Updated GET handler:
   - Calls `updateMilestonesProgressAndUnlock()` before fetching milestones
   - Returns updated milestones with computed progress, completion, and unlock status

### Implementation Details:

**Card Mastery Criteria:**
- CardState must exist
- attemptsCount >= 3
- correctCount / attemptsCount >= 0.7 (70% accuracy)

**Progress Computation:**
- For each milestone: masteredCount / totalTemplates (0-1)
- If no templates: progress = 0.0, isCompleted = false

**Completion Detection:**
- Milestone is completed when progress >= 0.85 (85% of cards mastered)

**Unlock Logic:**
- First milestone (order: 1) always unlocked
- Subsequent milestones unlock when previous milestone is completed
- Respects manual unlock overrides (doesn't force unlock to false)

**Database Updates:**
- All progress, completion, and unlock updates are persisted before returning response
- Updates happen on every GET request (ensures fresh data)

---

## Prompt 3 - Curriculum Content Registry

### Goal
Create a structured registry describing what each milestone's lesson page should show (text, demos, circle, etc.) without touching the database.

### Files Created:

1. **`lib/curriculum/milestonesContent.ts`** - Content registry module:
   - `MilestoneContentSection` type - Defines section structure (id, title, kind, body)
   - `MilestoneContent` type - Defines milestone content (key, heroSummary, sections)
   - `MILESTONE_CONTENT` constant - Content entries for 5 milestones:
     - FOUNDATION (5 sections: 3 text, 1 pianoRollDemo, 1 info)
     - NATURAL_MINOR (4 sections: 3 text, 1 info)
     - TRIADS (5 sections: 3 text, 1 pianoRollDemo, 1 info)
     - DIATONIC_TRIADS (5 sections: 3 text, 1 pianoRollDemo, 1 info)
     - CIRCLE_OF_FIFTHS (6 sections: 4 text, 1 circleDemo, 1 info)
   - `getMilestoneContent()` helper function

### Section Types:
- `text` - Explanatory paragraphs
- `info` - Tips and callouts
- `pianoRollDemo` - Interactive piano roll demo
- `circleDemo` - Circle of fifths visualization

---

## Prompt 4 - Implement `/learn/[key]` Milestone Detail Page

### Goal
Create a dynamic milestone detail page that shows milestone status, progress, curriculum sections, and practice CTA.

### Files Created:

1. **`app/learn/[key]/page.tsx`** - Milestone detail page:
   - Client component using React hooks
   - Reads milestone key from URL params
   - Fetches milestones from `/api/milestones`
   - Loads content from `getMilestoneContent()`

### Implementation Details:

**Locked State:**
- Shows "Locked" badge
- Displays message with previous milestone title (if available)
- "Back to curriculum" and "View previous milestone" buttons
- No sections or practice CTA shown

**Unlocked State:**
- Title, description, status chip ("Completed" or "In progress")
- Progress bar (0-100%)
- Hero summary from content registry
- Sections rendered by type:
  - `text`: Card with title and body
  - `info`: Info callout with muted background
  - `pianoRollDemo`: Embeds PianoRollDemo component
  - `circleDemo`: Embeds CircleOfFifths with interactive selection
- Practice CTA section with link to `/practice?milestone=<key>`

**Error Handling:**
- Loading state
- Error state with retry button
- 404 state for missing milestones
- Missing content fallback

**Helper Components:**
- `CircleDemoSection` - Manages state for interactive CircleOfFifths
- `SectionRenderer` - Renders different section types

---

## Prompt 5 - Polish `/learn` Overview to Use New Progress & Detail Pages

### Goal
Update the main `/learn` page to be a polished curriculum hub using computed progress/unlock and linking to detail pages.

### Files Modified:

1. **`app/learn/page.tsx`** - Enhanced curriculum overview:
   - Updated header: "Learning path" with improved description
   - Enhanced MilestoneCard component:
     - Improved status chips: "Locked" / "Completed" / "In progress"
     - Primary CTA: "Open milestone" button linking to `/learn/${milestone.key}`
     - Secondary CTA: "Practice this" link for unlocked milestones
     - Better visual hierarchy and spacing
   - Increased container width and grid gap for better layout

### Visual Improvements:
- Completed milestones have foreground background chip
- In-progress milestones show standard border style
- Locked milestones show muted style with reduced opacity
- Better button hierarchy (primary vs secondary actions)

---

## Prompt 6 - Implement `GET /api/theory/scale`

### Goal
Create `/api/theory/scale` endpoint that wraps the theory engine and matches API_SPEC.md contract.

### Files Created/Modified:

1. **`lib/theory/scale.ts`** - Added modal scale functions:
   - `getDorianScale(root)` - Dorian mode (W-H-W-W-W-H-W)
   - `getMixolydianScale(root)` - Mixolydian mode (W-W-H-W-W-H-W)
   - `getPhrygianScale(root)` - Phrygian mode (H-W-W-W-H-W-W)
   - Updated `getScaleDefinition()` to handle all scale types

2. **`lib/theory/types.ts`** - Extended ScaleType:
   - Added: "dorian" | "mixolydian" | "phrygian"

3. **`app/api/theory/scale/route.ts`** - New API endpoint:
   - Query params: `root` (PitchClass), `type` (ScaleType)
   - Validates parameters (400 for invalid)
   - Uses theory engine functions to get scale definition
   - Maps to MIDI notes using octave 3 (same as PianoRollDemo)
   - Returns: `{ root, type, notes, intervals, midiNotes }`

### Response Format:
```json
{
  "root": "C",
  "type": "major",
  "notes": ["C", "D", "E", "F", "G", "A", "B"],
  "intervals": ["1", "2", "3", "4", "5", "6", "7"],
  "midiNotes": [48, 50, 52, 53, 55, 57, 59]
}
```

---

## Prompt 7 - Implement `GET /api/theory/chord`

### Goal
Create `/api/theory/chord` endpoint to return notes for a chord symbol (root + quality).

### Files Created/Modified:

1. **`lib/theory/chord.ts`** - Added chord building functions:
   - `addSemitones(root, semitones)` - Helper to calculate pitch class intervals
   - `buildTriadFromRoot(root, quality)` - Builds triads directly from root + quality:
     - maj: M3 (4) + m3 (3) = perfect 5th (7)
     - min: m3 (3) + M3 (4) = perfect 5th (7)
     - dim: m3 (3) + m3 (3) = diminished 5th (6)
     - aug: M3 (4) + M3 (4) = augmented 5th (8)
   - `buildSeventhFromRoot(root, quality)` - Builds seventh chords:
     - maj7: Major triad + major 7th (11 semitones)
     - min7: Minor triad + minor 7th (10 semitones)
     - dom7: Major triad + minor 7th (10 semitones)
   - `formatChordSymbol(root, quality)` - Formats chord symbols:
     - maj → "C", min → "Cm", maj7 → "Cmaj7", min7 → "Cm7", dom7 → "C7", dim → "C°", aug → "C+"
   - `ChordQuality` type - Union type for all supported qualities

2. **`app/api/theory/chord/route.ts`** - New API endpoint:
   - Query params: `root` (PitchClass), `quality` (ChordQualityParam)
   - Validates parameters (400 for invalid)
   - Builds chord using `buildTriadFromRoot()` or `buildSeventhFromRoot()`
   - Formats symbol using `formatChordSymbol()`
   - Maps to MIDI notes using octave 3
   - Returns: `{ symbol, root, quality, notes, degrees, midiNotes }`

### Response Format:
```json
{
  "symbol": "Cmaj7",
  "root": "C",
  "quality": "maj7",
  "notes": ["C", "E", "G", "B"],
  "degrees": ["1", "3", "5", "7"],
  "midiNotes": [48, 52, 55, 59]
}
```

---

## Prompt 8 - Implement `GET /api/theory/key-diatonic-chords`

### Goal
Expose the diatonic chord generator via `/api/theory/key-diatonic-chords`.

### Files Created:

1. **`app/api/theory/key-diatonic-chords/route.ts`** - New API endpoint:
   - Query params: `root` (PitchClass), `type` ("major" | "natural_minor"), `extensions` ("triads" | "sevenths")
   - Validates all parameters (400 for invalid)
   - Uses `getDiatonicChords()` from theory engine
   - Maps to response format based on extensions parameter
   - Formats chord symbols using `formatChordSymbol()`
   - Returns: `{ key: { root, type }, chords: [{ degree, symbol, quality, notes }] }`

### Response Format:
```json
{
  "key": { "root": "C", "type": "major" },
  "chords": [
    {
      "degree": "I",
      "symbol": "C",
      "quality": "maj",
      "notes": ["C", "E", "G"]
    },
    {
      "degree": "ii",
      "symbol": "Dm",
      "quality": "min",
      "notes": ["D", "F", "A"]
    }
  ]
}
```

---

## Prompt 9 - Dev Test Page for Theory API

### Goal
Add a small `/dev/theory` page to test the new theory API endpoints from the browser.

### Files Created:

1. **`app/dev/theory/page.tsx`** - Dev test page:
   - Three test forms:
     - **Scale Tester**: Root + Type inputs, displays notes and MIDI notes
     - **Chord Tester**: Root + Quality inputs, displays symbol, notes, MIDI notes
     - **Diatonic Chords Tester**: Root + Type + Extensions inputs, displays formatted chord list
   - Error handling with red error messages
   - Loading states on buttons
   - Full JSON response display (collapsible for diatonic chords)
   - Simple, functional design using semantic Tailwind classes

---

## Summary

Milestone 11 completes the full curriculum UI system:

1. **Backend Progress & Unlock Logic**: Automatic computation of milestone progress and sequential unlocking
2. **Content Registry**: Structured content definitions for milestone detail pages
3. **Milestone Detail Pages**: Full-featured lesson pages with interactive demos
4. **Enhanced Overview Page**: Polished curriculum hub with clear navigation
5. **Theory API Endpoints**: Three new endpoints for scales, chords, and diatonic chords
6. **Dev Tools**: Internal test page for theory API endpoints

The system now provides:
- Automatic progress tracking based on card mastery
- Sequential milestone unlocking
- Rich curriculum content with interactive demos
- Complete theory API for scales and chords
- Polished user experience throughout the curriculum flow

All changes maintain backward compatibility, use proper TypeScript types, and follow existing design patterns. The curriculum system is now fully functional and ready for users to progress through structured learning milestones.

