Project: Harmonia – Music Theory Learning & Visualization App

Purpose:

A stable, visually polished app to:

- Learn scales, chords, and the circle of fifths
- Identify chords from notes and notes from chords
- Visualize theory using a robust piano-roll interface
- Grow into an interactive MIDI-based music theory testing tool
- Showcase full-stack engineering and UI design skills

# **1. Core Goals**

1.1 Teach practical theory relevant to EDM, bass music, and songwriting.

1.2 Provide an interactive piano-roll that highlights notes of chords or scales.

1.3 Build a milestone-based, unlockable learning path.

1.4 Use spaced repetition and quizzes for retention.

1.5 Enable future expansion into MIDI-based chord recognition and ear-training.

1.6 Be fully usable by a single user—no authentication required.

1.7 “Free Exploration Mode” is a toggleable setting (off by default).

# **2. Curriculum Structure (Milestones)**

Circle of Fifths now appears earlier (before modal learning), per your correction.

# **Milestone 1 — Foundation: Notes, Intervals, Major Scale**

A1.1 Natural notes + sharps/flats

A1.2 Whole steps / half steps

A1.3 Construct major scale

A1.4 Visualize scales on piano roll

# **Milestone 2 — Natural Minor & Relative Keys**

A2.1 Construct natural minor scale

A2.2 Identify relative major/minor pairs

A2.3 Visualize minors + relationship on piano roll

# **Milestone 3 — Major & Minor Triads**

A3.1 Construct triads (1–3–5)

A3.2 Identify chord → notes

A3.3 Identify notes → chord

A3.4 Piano-roll highlighting for triads

# **Milestone 4 — Diatonic Triads in Major/Minor Keys**

A4.1 Identify diatonic chords within a key

A4.2 Roman numerals for major/minor keys

A4.3 Piano-roll visualization of each chord in the key

# **Milestone 5 — Circle of Fifths (Placed here)**

A5.1 Learn key signature geometry (clock positions)

A5.2 Unlock in modules/wedges

A5.3 Understand how sharps/flats accumulate

A5.4 Relative major/minor in the circle

A5.5 Neighbor keys = IV / V

A5.6 Circle interacts with the piano roll

# **Milestone 6 — 7th Chords (maj7, min7, dominant7)**

A6.1 Construct 7th chords

A6.2 Visualize extended chords on piano roll

A6.3 Identify chord → notes / notes → chord (7th level)

# **Milestone 7 — Useful Modes for Bass Music (Optional/Unlock)**

A7.1 Dorian

A7.2 Mixolydian

A7.3 Phrygian

A7.4 Show modal scales on piano roll

# **Milestone 8 — Advanced Topics (Optional)**

A8.1 Diminished triads

A8.2 Augmented triads

A8.3 Chromatic mediants, borrowed chords (future)

A8.4 Secondary dominants (future)

# **3. Flashcard & Learning Modes**

Sheet music NOT required — replaced with piano-roll visuals.

# **Flashcard Types**

B1 Chord → notes (piano roll highlight)

B2 Notes → chord (inversion-agnostic)

B3 Scale spelling (major/minor)

B4 Diatonic chord identification

B5 Circle of Fifths geometric questions

B6 Circle of Fifths “relative minor” questions

B7 Circle of Fifths “neighbor key (IV/V)” questions

B8 Build-a-key (toggle sharps/flats or highlight notes on roll)

B9 Blank Circle Challenge (boss mode, drag keys to positions)

# **Flashcard Visual Rules**

B10 Dark Harmonia theme

B11 Piano roll used as primary information surface

B12 Circle wedge glows when answer is revealed

B13 Minimalist, high-contrast UX

# **4. Circle of Fifths System**

# **Geometry**

C1 Circular ring with 12 major keys

C2 Inner ring: relative minor keys

C3 Clockwise = sharps, counterclockwise = flats

# **Key Signatures / Functionality**

C4 When a key is clicked:

- show signature
- show diatonic chords
- highlight correct notes on piano roll

C5 IV and V neighbors highlighted visually

C6 Relative minor highlight toggle

# **Unlock System**

C7 Circle unlocks in these modules:

- Anchors (C, A, Eb, F#/Gb)
- Sharps side (G, D, A, E, B)
- Flats side (F, Bb, Eb, Ab, Db)
- Inner ring (relative minors)

# **5. Assessment System**

(different modalities of testing)

D1 Tap correct slice on the circle

D2 Identify V of a given key (tap or multiple-choice)

D3 Build a key signature (toggle sharps/flats OR select notes on piano roll)

D4 Identify diatonic chords in a key

D5 Notes → chord (piano roll input)

D6 Blank Circle “Boss Mode” (drag and drop)

D7 Timing-based scoring (optional future addition)

# **6. Spaced Repetition System (SRS)**

# **SuperMemo-2 Inspired**

E1 Confidence ratings: Again / Hard / Good / Easy

E2 Each card has:

- ease factor
- interval
- next review date

E3 Fast responses = interval bonus

E4 Slow/wrong = interval reduction

E5 Daily review deck auto-built

# **Mastery Decay**

E6 Circle slices fade as memory decays

E7 Chords/scales get individual mastery tracking

# **7. Progress Tracking & Analytics**

# **Mastery Wheel**

F1 Circle initially grey

F2 Each slice fills with teal based on mastery

F3 If performance declines → color fades

F4 Hover shows:

- accuracy
- average recall speed
- next review date

# **Other Metrics**

F5 Coverage: X/Y keys mastered

F6 Accuracy by chord type

F7 Accuracy by scale type

F8 Number of cards due today

F9 Learning streak

# **8. Piano Roll Visualization System (Critical Component)**

# **Core Requirements**

P1 Piano roll spans at least 2 octaves

P2 Can highlight:

- chord tones
- scale tones
- key signature notes
- modal scales
P3 Ability to pass a chord object → piano roll auto highlights notes
P4 Ability to pass a scale object → piano roll highlights the full scale

# **Future Feature**

P5 MIDI input mode:

- User plays notes
- App identifies:
    - chord name
    - inversion
    - scale compatibility
- 

(This is aligned with your other personal projects.)

# **9. User Settings UX**

# **Toggle Options**

G1 Free Exploration Mode (on/off)

G2 Light hints vs no hints

G3 Disable advanced content until unlocked

# **10. Technical Requirements**

# **Frontend**

H1 Next.js + React + TypeScript

H2 TailwindCSS dark theme

H3 Animated SVG canvas for Circle of Fifths

H4 Custom piano-roll component (React + Canvas/SVG)

H5 State management with Zustand or Jotai

# **Backend**

H6 Next.js API routes or lightweight Node server

H7 Local JSON or SQLite/PostgreSQL (choose based on your DevOps goals)

H8 SRS scheduler

H9 Record attempts + mastery values

# **Data Models**

H10 CardTemplate

H11 CardAttempt

H12 Milestone

H13 UserProgress (single user, no auth required)

H14 Circle metadata

H15 Piano roll mapping utilities

# **11. Stretch Features (Optional)**

I1 Ear training mode (tie-in to your other app)

I2 MIDI-based chord detection

I3 Mode/scale-based melody generator

(Previously requested removals I3/I4 have been removed.)

#