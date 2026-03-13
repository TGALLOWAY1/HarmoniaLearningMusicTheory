# Milestone 3 - Flashcard Engine Implementation Notes

This document contains summaries from each prompt/task completed during Milestone 3 development.

---

## Prompt 3.1 - Set up Prisma + Card Models

### Goal
Set up Prisma with a SQLite database and implement the card-related models according to the project schema.

### Files Created/Modified:

1. **`prisma/schema.prisma`** - Prisma schema with three models:
   - `CardTemplate`: Flashcard definitions with question, options, correct answer, and metadata
   - `CardState`: Per-card SRS tracking with basic counters and SRS fields (for future use)
   - `CardAttempt`: History of all attempts with selected answer, correctness, and response time

2. **`lib/db.ts`** - Prisma client singleton helper:
   - Prevents multiple Prisma client instances in development
   - Configured with query/error/warn logging
   - Uses global variable pattern for Next.js compatibility

3. **`prisma/seed.ts`** - Seed script with example card templates:
   - C major chord notes question
   - Chord identification from notes
   - Key signature question (circle of fifths)

4. **`prisma.config.ts`** - Prisma configuration file (Prisma 7 format)

5. **`.env`** - Environment variables with `DATABASE_URL="file:./dev.db"`

6. **`package.json`** - Updated with:
   - Prisma dependencies (`prisma@^6.0.0`, `@prisma/client@^6.0.0`)
   - `better-sqlite3` for SQLite support
   - `tsx` for running TypeScript seed scripts
   - Seed script configuration in `prisma.config.ts`

### Database Models:

#### CardTemplate
- `id`: Auto-increment primary key
- `slug`: Unique identifier
- `kind`: Card type (e.g., "notes_from_chord", "chord_from_notes", "key_signature")
- `question`: User-facing question text
- `optionA`, `optionB`, `optionC`, `optionD`: Multiple choice options
- `correctIndex`: Correct answer (0-3)
- `meta`: Optional JSON metadata (root, quality, scale type, etc.)
- Relations: One-to-many with `CardState` and `CardAttempt`

#### CardState
- `id`: Auto-increment primary key
- `cardId`: Foreign key to `CardTemplate`
- `attemptsCount`: Total attempts (default: 0)
- `correctCount`: Correct attempts (default: 0)
- `lastAnswerAt`: Timestamp of last answer (nullable)
- `lastResult`: Boolean result of last attempt (nullable)
- SRS fields (for Milestone 4):
  - `easeFactor`: Default 2.5
  - `intervalDays`: Default 0
  - `dueAt`: Default now()

#### CardAttempt
- `id`: Auto-increment primary key
- `cardId`: Foreign key to `CardTemplate`
- `selectedIndex`: User's selected answer (0-3)
- `isCorrect`: Boolean correctness flag
- `responseMs`: Time taken to answer in milliseconds
- `createdAt`: Timestamp

### Migration:
- Initial migration: `20251126181933_init_cards`
- Database file: `prisma/dev.db` (SQLite)

### Seed Data:
Three example card templates created:
1. "Which notes make a C major triad?" (notes_from_chord)
2. "Which chord is built from C – E – G?" (chord_from_notes)
3. "Which major key has exactly one sharp?" (key_signature)

---

## Prompt 3.2 - Implement `/api/cards/next` (Basic "Next Card" Logic)

### Goal
Create an API endpoint that returns the next card for the single user, initializing `CardState` objects if they don't exist yet.

### Files Created/Modified:

1. **`app/api/cards/next/route.ts`** - GET endpoint implementation

### Implementation Details:

**Card Selection Logic:**
1. Fetches all `CardTemplate` records from database
2. Ensures `CardState` exists for each template (creates missing ones with defaults)
3. Selects next card by sorting `CardState` records:
   - Primary: `dueAt` ascending (earliest due first)
   - Secondary: `id` ascending (tiebreaker)

**Response Format:**
```typescript
{
  card: {
    id: number;
    slug: string;
    kind: string;
    question: string;
    options: string[];  // [optionA, optionB, optionC, optionD]
  },
  state: {
    id: number;
    attemptsCount: number;
    correctCount: number;
    lastResult: boolean | null;
  }
}
```

**Error Handling:**
- 404: No cards available
- 500: Database errors or state mismatches (with error logging)

### Testing:
- Endpoint tested and returning valid JSON
- All seeded card templates have corresponding `CardState` records
- Card selection logic working correctly

---

## Prompt 3.3 - Implement `/api/cards/[id]/answer` (Record Attempts)

### Goal
Create an endpoint to submit an answer for a card, record an attempt, and update the basic `CardState`. Full SRS (SM-2) logic will come in Milestone 4.

### Files Created/Modified:

1. **`app/api/cards/[id]/answer/route.ts`** - POST endpoint implementation

### Implementation Details:

**Request Validation:**
- Card ID: Parsed from route params, validated as number
- `selectedIndex`: Must be number between 0-3 (inclusive)
- `responseMs`: Optional, defaults to 0 if not provided

**Answer Processing:**
1. Looks up `CardTemplate` by ID (404 if not found)
2. Ensures `CardState` exists (creates if missing)
3. Computes `isCorrect = selectedIndex === correctIndex`
4. Creates `CardAttempt` record with:
   - `cardId`, `selectedIndex`, `isCorrect`, `responseMs`
5. Updates `CardState`:
   - `attemptsCount`: Incremented by 1
   - `correctCount`: Incremented by 1 if correct
   - `lastResult`: Set to `isCorrect`
   - `lastAnswerAt`: Set to current timestamp
   - `dueAt`: Set to current timestamp (placeholder for Milestone 4 SRS)

**Response Format:**
```typescript
{
  correct: boolean;
  correctIndex: number;
  state: {
    attemptsCount: number;
    correctCount: number;
    lastResult: boolean;
  }
}
```

**Error Handling:**
- 400: Invalid card ID or invalid `selectedIndex`
- 404: Card not found
- 500: Database errors (with error logging)

### Testing:
- Correct answers recorded and state updated
- Incorrect answers recorded and state updated
- Attempts stored in database with timestamps
- Error cases handled (invalid ID, card not found, invalid selectedIndex)
- Multiple cards work independently

---

## Prompt 3.4 - Flashcard UI & Session Page

### Goal
Create a reusable `<Flashcard />` component for MCQ (2x2 grid) and a "Practice" page that fetches cards, renders questions, submits answers, and shows feedback.

### Files Created/Modified:

1. **`components/flashcards/Flashcard.tsx`** - Reusable flashcard component
2. **`app/practice/page.tsx`** - Practice session page

### Flashcard Component (`components/flashcards/Flashcard.tsx`)

**Props:**
- `question`: Question text
- `options`: Array of `{index, label}` objects
- `selectedIndex`: Currently selected option (or null)
- `correctIndex`: Correct answer index (or null)
- `onSelect`: Callback when option is clicked
- `isSubmitting`: Disables interaction during submission
- `showResult`: Controls whether to show correct/incorrect feedback

**Features:**
- 2x2 grid layout for multiple choice options
- State-based styling:
  - **Idle**: Muted background with hover effect
  - **Selected**: Emerald highlight (before submission)
  - **Correct**: Green background when result shown
  - **Incorrect**: Red background for wrong selections
  - **Disabled**: Buttons disabled after result is shown
- Smooth transitions and hover effects
- Uses Scandinavian minimal theme with custom CSS variables

### Practice Page (`app/practice/page.tsx`)

**State Management:**
- `card`: Current card data (id, question, options)
- `selectedIndex`: User's selected answer
- `correctIndex`: Correct answer (set after submission)
- `loading`: Loading state for fetching cards
- `submitting`: Submission in progress
- `error`: Error message if any

**User Flow:**
1. **On mount**: Fetches next card from `/api/cards/next`
2. **User selects option**: Updates `selectedIndex` with visual feedback
3. **User clicks "Check answer"**: Submits to `/api/cards/[id]/answer`
4. **After submission**: Shows correct/incorrect feedback
5. **User clicks "Next card"**: Fetches next card and resets state

**UI Elements:**
- Header with "Practice" label and title
- Loading state: "Loading next card…"
- Error state: Error message with retry button
- Flashcard component: Renders question and options
- Action buttons:
  - "Check answer" (emerald button, disabled until selection)
  - "Next card" (appears after result is shown)

**Styling:**
- Uses existing Scandinavian minimal theme
- Custom CSS variables for colors (`bg-surface`, `text-muted`, etc.)
- Tailwind utility classes
- Emerald colors for success states
- Red colors for error states
- Smooth transitions and hover effects

### Testing:
- Component structure matches requirements
- State management handles all scenarios
- API integration working correctly
- Error handling in place
- Loading states implemented
- Page accessible at `/practice` route

---

## Summary

Milestone 3 successfully implements the core flashcard engine for Harmonia:

1. **Database Setup**: Prisma with SQLite, three models (CardTemplate, CardState, CardAttempt)
2. **API Endpoints**: 
   - `GET /api/cards/next` - Returns next card with state
   - `POST /api/cards/[id]/answer` - Records attempts and updates state
3. **UI Components**: 
   - Reusable Flashcard component with 2x2 grid
   - Practice page with full session management
4. **User Experience**: Complete flow from card selection to answer submission to feedback

The flashcard system is now functional and ready for Milestone 4, which will add full SM-2 spaced repetition scheduling.

