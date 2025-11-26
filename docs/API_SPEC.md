Base path: `/api`

### 1. Theory Utilities (Pure Functions)

These endpoints don’t hit the DB; they just use your theory engine.

### 1.1 `GET /api/theory/scale`

Compute notes in a scale for use in UI + piano roll.

**Query params:**

- `root`: string (e.g. `"C"`, `"F#"`, `"Bb"`)
- `type`: `"major" | "natural_minor" | "dorian" | "mixolydian" | "phrygian"`

**Response:**

```json
{
  "root": "C",
  "type": "major",
  "notes": ["C", "D", "E", "F", "G", "A", "B"],
  "intervals": ["1", "2", "3", "4", "5", "6", "7"],
  "midiNotes": [60, 62, 64, 65, 67, 69, 71]
}

```

---

### 1.2 `GET /api/theory/chord`

Return notes & metadata for a chord.

**Query params:**

- `root`: `"C" | "C#"` etc.
- `quality`: `"maj" | "min" | "maj7" | "min7" | "dom7" | "dim" | "aug"`

**Response:**

```json
{
  "symbol": "Cmaj7",
  "root": "C",
  "quality": "maj7",
  "notes": ["C", "E", "G", "B"],
  "degrees": ["1", "3", "5", "7"],
  "midiNotes": [60, 64, 67, 71]
}

```

---

### 1.3 `GET /api/theory/key-diatonic-chords`

Return diatonic triads or 7ths for a key.

**Query params:**

- `root`: `"C"`, `"G"`, etc.
- `type`: `"major" | "natural_minor"`
- `extensions`: `"triads" | "sevenths"`

**Response:**

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

### 2. Circle of Fifths

These do use metadata (either DB or static JSON).

### 2.1 `GET /api/circle/keys`

Return all keys + positions + signature info.

**Response:**

```json
{
  "keys": [
    {
      "id": "C_major",
      "root": "C",
      "type": "major",
      "clockPosition": 0,
      "accidentals": 0,
      "accidentalType": "none",
      "relativeMinorId": "A_minor",
      "neighbors": { "clockwise": "G_major", "counterclockwise": "F_major" }
    }
  ]
}

```

---

### 2.2 `GET /api/circle/summary`

Return summary mastery info for the “Mastery Wheel”.

**Response:**

```json
{
  "keys": [
    {
      "id": "C_major",
      "mastery": 0.85,
      "avgRecallMs": 900,
      "lastReviewedAt": "2025-11-26T12:00:00.000Z",
      "dueCount": 2
    }
  ]
}

```

---

### 3. Milestones & Curriculum

### 3.1 `GET /api/milestones`

List all milestones with completion status.

**Response:**

```json
{
  "milestones": [
    {
      "id": 1,
      "key": "FOUNDATION",
      "title": "Notes, Intervals, Major Scale",
      "description": "Learn notes, whole/half steps, and the major scale.",
      "isUnlocked": true,
      "isCompleted": false,
      "progress": 0.4
    }
  ]
}

```

---

### 3.2 `PATCH /api/milestones/:id`

Update milestone state (usually automatic, but you might manually override).

**Body:**

```json
{
  "isUnlocked": true,
  "isCompleted": false}

```

**Response:**

```json
{ "success": true }

```

---

### 4. Flashcards & SRS

### 4.1 `GET /api/cards/next`

Get the next batch of cards to review or learn.

**Query params:**

- `mode`: `"review" | "learn"`
- `limit`: optional integer, default 10

**Response:**

```json
{
  "cards": [
    {
      "id": 101,
      "templateId": 5,
      "type": "CHORD_TO_NOTES",
      "prompt": {
        "chordSymbol": "Cmaj7"
      },
      "options": [
        { "id": "opt1", "notes": ["C", "E", "G", "B"] },
        { "id": "opt2", "notes": ["C", "D#", "G", "A#"] },
        { "id": "opt3", "notes": ["C", "E", "G", "Bb"] },
        { "id": "opt4", "notes": ["C", "F", "G", "B"] }
      ],
      "srs": {
        "dueAt": "2025-11-26T10:00:00.000Z",
        "intervalDays": 3,
        "easeFactor": 2.3
      }
    }
  ]
}

```

Note: `id` is the card instance (same as template since single user, or you can separate them).

---

### 4.2 `POST /api/cards/:id/answer`

Record an answer and update SRS state.

**Body:**

```json
{
  "selectedOptionId": "opt3",
  "correct": false,
  "confidence": "Again",   // "Again" | "Hard" | "Good" | "Easy"
  "answerMs": 2800
}

```

**Response:**

```json
{
  "correct": false,
  "updatedSrs": {
    "intervalDays": 0,
    "easeFactor": 2.0,
    "dueAt": "2025-11-26T08:31:00.000Z"
  },
  "stats": {
    "totalAttempts": 12,
    "correctRate": 0.75
  }
}

```

---

### 5. Progress & Analytics

### 5.1 `GET /api/progress/overview`

Overall stats for dashboard.

**Response:**

```json
{
  "coverage": {
    "keysMastered": 7,
    "totalKeys": 12
  },
  "accuracy": {
    "overall": 0.82,
    "byCardType": {
      "CHORD_TO_NOTES": 0.9,
      "NOTES_TO_CHORD": 0.7
    }
  },
  "speed": {
    "avgRecallMs": 1100
  },
  "srs": {
    "dueToday": 23,
    "overdue": 5
  },
  "streak": {
    "currentDays": 6,
    "longestDays": 12
  }
}

```

---

### 5.2 `GET /api/progress/milestones`

Return milestone-specific progress data.

**Response:**

```json
{
  "milestones": [
    {
      "id": 1,
      "key": "FOUNDATION",
      "progress": 0.7,
      "cardsMastered": 28,
      "cardsTotal": 40
    }
  ]
}

```

---

### 5.3 `GET /api/progress/cards`

For debugging or nerding out on detailed stats.

**Query params:**

- `cardType` (optional)
- `milestoneKey` (optional)

**Response:**

```json
{
  "cards": [
    {
      "id": 101,
      "templateId": 5,
      "type": "CHORD_TO_NOTES",
      "stats": {
        "attempts": 10,
        "correct": 8,
        "avgAnswerMs": 1400
      }
    }
  ]
}

```

---

### 6. Settings (Single User)

### 6.1 `GET /api/settings`

**Response:**

```json
{
  "freeExploreMode": false,
  "enableAdvancedTopics": false,
  "hintLevel": "light"   // "none" | "light"
}

```

---

### 6.2 `PATCH /api/settings`

**Body:**

```json
{
  "freeExploreMode": true,
  "enableAdvancedTopics": true}

```

**Response:**

```json
{ "success": true }

```

---

### 7. Future MIDI Endpoint (Placeholder)

### 7.1 `POST /api/midi/analyze-chord` (future)

**Body:**

```json
{
  "midiNotes": [48, 52, 55]   // raw notes from keyboard
}

```

**Response:**

```json
{
  "chordSymbol": "C",
  "quality": "maj",
  "root": "C",
  "notes": ["C", "E", "G"],
  "inversion": "root",
  "fitsScales": ["C_major", "F_major", "G_mixolydian"]
}

```