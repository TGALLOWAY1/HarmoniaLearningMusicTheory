export type MilestoneContentSection = {
  id: string;
  title: string;
  kind: "text" | "info" | "pianoRollDemo" | "circleDemo";
  body?: string; // used for text/info sections
};

export type MilestoneContent = {
  key: string; // matches Milestone.key (e.g., "FOUNDATION")
  heroSummary: string; // short TL;DR for the milestone
  sections: MilestoneContentSection[];
};

export const MILESTONE_CONTENT: MilestoneContent[] = [
  {
    key: "FOUNDATION",
    heroSummary:
      "Learn the building blocks: natural notes, sharps and flats, whole and half steps, and how to construct the major scale. Essential foundation for everything that follows.",
    sections: [
      {
        id: "foundation-notes",
        title: "Natural Notes and Accidentals",
        kind: "text",
        body:
          "The 12 pitch classes in Western music are the foundation of all harmony. Natural notes (A, B, C, D, E, F, G) can be modified with sharps (#) or flats (b) to create all 12 unique pitches. Understanding this chromatic system is crucial for navigating keys and building chords.",
      },
      {
        id: "foundation-intervals",
        title: "Whole Steps and Half Steps",
        kind: "text",
        body:
          "The distance between notes is measured in steps. A half step (semitone) is the smallest interval—moving from one key to the next on a piano. A whole step (tone) equals two half steps. These intervals form the basis of scales and chords.",
      },
      {
        id: "foundation-major-scale",
        title: "The Major Scale",
        kind: "text",
        body:
          "The major scale follows a specific pattern of whole and half steps: W-W-H-W-W-W-H. This pattern creates the familiar do-re-mi sound and serves as the foundation for major keys. In EDM and bass music, major scales provide the bright, uplifting harmonic foundation for many tracks.",
      },
      {
        id: "foundation-demo",
        title: "Explore the Major Scale",
        kind: "pianoRollDemo",
      },
      {
        id: "foundation-tip",
        title: "Tip",
        kind: "info",
        body:
          "Practice identifying notes on the piano roll. Visualizing intervals helps when building chords and understanding key relationships later.",
      },
    ],
  },
  {
    key: "NATURAL_MINOR",
    heroSummary:
      "Understand natural minor scales and their relationship to major scales through relative keys. Learn how minor tonality creates darker, more emotional sounds in bass music.",
    sections: [
      {
        id: "minor-pattern",
        title: "The Natural Minor Scale Pattern",
        kind: "text",
        body:
          "The natural minor scale follows a different pattern: W-H-W-W-H-W-W. This creates a darker, more melancholic sound compared to major. The pattern starts from the 6th degree of the major scale, which is why minor and major scales share the same notes when they're relative keys.",
      },
      {
        id: "minor-relative",
        title: "Relative Major and Minor",
        kind: "text",
        body:
          "Every major key has a relative minor that shares the same notes. For example, A minor is the relative minor of C major—both use only white keys. This relationship is powerful in music production: you can switch between major and minor modes while staying in the same key signature, creating emotional contrast without changing keys.",
      },
      {
        id: "minor-edm",
        title: "Minor in EDM and Bass Music",
        kind: "text",
        body:
          "Minor scales dominate darker genres like deep house, techno, and bass music. The minor third interval creates that characteristic emotional tension. Many iconic basslines and chord progressions use minor tonality to create mood and atmosphere.",
      },
      {
        id: "minor-tip",
        title: "Tip",
        kind: "info",
        body:
          "To find the relative minor of any major key, go down three half steps (a minor third) from the major root. For example, C major → A minor, G major → E minor.",
      },
    ],
  },
  {
    key: "TRIADS",
    heroSummary:
      "Master major and minor triads—the fundamental building blocks of harmony. These three-note chords appear constantly in EDM and bass music, forming the backbone of most chord progressions.",
    sections: [
      {
        id: "triads-basics",
        title: "What Are Triads?",
        kind: "text",
        body:
          "A triad is a three-note chord built by stacking thirds. The major triad uses a major third (4 half steps) plus a minor third (3 half steps), creating a bright, stable sound. The minor triad uses a minor third plus a major third, creating a darker, more emotional sound.",
      },
      {
        id: "triads-construction",
        title: "Building Triads",
        kind: "text",
        body:
          "To build a major triad, take the root, add the major third, then add the perfect fifth. For C major: C-E-G. For minor, lower the third by a half step: C-Eb-G. These intervals create the fundamental harmonic colors in music.",
      },
      {
        id: "triads-demo",
        title: "Explore Triads on the Piano Roll",
        kind: "pianoRollDemo",
      },
      {
        id: "triads-edm",
        title: "Triads in EDM",
        kind: "text",
        body:
          "In electronic music, triads form the foundation of most chord progressions. Whether it's a four-on-the-floor house track or a deep bassline, triads provide the harmonic structure. Learning to recognize and build triads quickly is essential for music production.",
      },
      {
        id: "triads-tip",
        title: "Tip",
        kind: "info",
        body:
          "Practice building triads from different roots. Start with C major and A minor, then move around the circle of fifths. Visual recognition on the piano roll speeds up your workflow.",
      },
    ],
  },
  {
    key: "DIATONIC_TRIADS",
    heroSummary:
      "Learn how chords fit within a key using Roman numerals. Understand the seven diatonic triads and how they create the harmonic framework for entire songs.",
    sections: [
      {
        id: "diatonic-intro",
        title: "Chords Within a Key",
        kind: "text",
        body:
          "Every major or minor key contains seven natural chords built from the scale notes. These are called diatonic chords. In a major key, the pattern is: I (major), ii (minor), iii (minor), IV (major), V (major), vi (minor), vii° (diminished). This sequence is universal across all major keys.",
      },
      {
        id: "diatonic-roman",
        title: "Roman Numeral Notation",
        kind: "text",
        body:
          "Roman numerals represent chord functions within a key, not specific notes. I, IV, and V are major; ii, iii, and vi are minor; vii° is diminished. This system lets you understand chord progressions abstractly—the same progression works in any key. For example, I-V-vi-IV is a common pop/EDM progression.",
      },
      {
        id: "diatonic-demo",
        title: "Explore Diatonic Chords",
        kind: "pianoRollDemo",
      },
      {
        id: "diatonic-progressions",
        title: "Common Progressions",
        kind: "text",
        body:
          "Many iconic songs use simple diatonic progressions. The vi-IV-I-V progression appears in countless tracks. Understanding these patterns helps you recognize and create progressions quickly. In EDM, these progressions often repeat with variations, creating the harmonic foundation for entire tracks.",
      },
      {
        id: "diatonic-tip",
        title: "Tip",
        kind: "info",
        body:
          "Memorize the quality pattern: Major keys = I, IV, V are major; ii, iii, vi are minor. This pattern is consistent across all major keys, making it easy to build progressions in any key.",
      },
    ],
  },
  {
    key: "CIRCLE_OF_FIFTHS",
    heroSummary:
      "Master the circle of fifths to navigate keys, find relative minors, and understand key relationships. This visual tool connects all keys and is essential for understanding harmony and modulation.",
    sections: [
      {
        id: "circle-intro",
        title: "What is the Circle of Fifths?",
        kind: "text",
        body:
          "The circle of fifths is a visual representation of all 12 keys arranged by their relationship. Moving clockwise, each key adds one sharp (or removes one flat). Moving counter-clockwise, each key adds one flat (or removes one sharp). C major sits at the top (12 o'clock) with no sharps or flats.",
      },
      {
        id: "circle-demo",
        title: "Explore the Circle",
        kind: "circleDemo",
      },
      {
        id: "circle-relative",
        title: "Finding Relative Minors",
        kind: "text",
        body:
          "Each major key has a relative minor located three positions clockwise on the circle. For example, C major's relative minor is A minor. This relationship is consistent: the relative minor is always a minor third below the major root. Understanding this helps you switch between major and minor modes.",
      },
      {
        id: "circle-neighbors",
        title: "Neighbor Keys (IV and V)",
        kind: "text",
        body:
          "On the circle, each key's closest neighbors are its IV (subdominant) and V (dominant) chords. These are the most common chord progressions in music. For example, in C major, F (IV) is one position counter-clockwise and G (V) is one position clockwise. These relationships create smooth, natural-sounding progressions.",
      },
      {
        id: "circle-modulation",
        title: "Using the Circle for Modulation",
        kind: "text",
        body:
          "The circle helps you understand key changes (modulations). Moving to adjacent keys on the circle creates smooth transitions. Moving further creates more dramatic shifts. In EDM, subtle modulations can add energy to a track, while dramatic shifts create powerful moments.",
      },
      {
        id: "circle-tip",
        title: "Tip",
        kind: "info",
        body:
          "Memorize the circle positions. Start with C at 12 o'clock, then learn the sharp keys clockwise (G, D, A, E, B, F#) and flat keys counter-clockwise (F, Bb, Eb, Ab, Db, Gb). This mental map speeds up key navigation.",
      },
    ],
  },
];

/**
 * Retrieves the content configuration for a milestone by its key.
 * @param key - The milestone key (e.g., "FOUNDATION", "TRIADS")
 * @returns The milestone content if found, undefined otherwise
 */
export function getMilestoneContent(
  key: string
): MilestoneContent | undefined {
  return MILESTONE_CONTENT.find((m) => m.key === key);
}

