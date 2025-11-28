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
      "Master the 12-note chromatic system and the major scale pattern. These fundamentals shape every chord, melody, and bassline in your productions.",
    sections: [
      {
        id: "foundation-notes",
        title: "Natural Notes and Accidentals",
        kind: "text",
        body:
          "Western music uses 12 unique pitch classes. The seven natural notes (A, B, C, D, E, F, G) can be raised with sharps (#) or lowered with flats (b) to create all 12 pitches. On a piano, each key—white or black—represents one of these pitch classes. Understanding this chromatic system is essential for navigating keys and building chords in your DAW.",
      },
      {
        id: "foundation-intervals",
        title: "Whole Steps and Half Steps",
        kind: "text",
        body:
          "The distance between notes is measured in steps. A half step (semitone) is the smallest interval—moving from one key to the next on a piano, like C to C#. A whole step (tone) equals two half steps, like C to D. These intervals are the building blocks of scales and chords. In C major, the pattern uses both: C (whole) D (whole) E (half) F (whole) G (whole) A (whole) B (half) C.",
      },
      {
        id: "foundation-major-scale",
        title: "The Major Scale Pattern",
        kind: "text",
        body:
          "The major scale follows a specific pattern: W-W-H-W-W-W-H (whole, whole, half, whole, whole, whole, half). This creates the familiar do-re-mi sound. In C major, this gives us C-D-E-F-G-A-B-C (all white keys). In EDM and bass music, major scales provide the bright, uplifting harmonic foundation for many tracks. The pattern is universal—apply it from any root note to build any major scale.",
      },
      {
        id: "foundation-demo",
        title: "Explore the Major Scale",
        kind: "pianoRollDemo",
        body:
          "Visualize the C major scale pattern (W-W-H-W-W-W-H) on the piano roll and hear how whole and half steps create the familiar major sound.",
      },
      {
        id: "foundation-production",
        title: "Why This Matters in Production",
        kind: "text",
        body:
          "When programming melodies or basslines, knowing the major scale ensures your notes fit harmonically. In C major, you can freely use C, D, E, F, G, A, B without clashing. This knowledge speeds up your workflow—no more guessing which notes work together. Many iconic EDM leads and pads are built directly from major scale patterns.",
      },
      {
        id: "foundation-tip",
        title: "Tip",
        kind: "info",
        body:
          "Practice identifying intervals on the piano roll. Visualizing whole and half steps helps when building chords and understanding key relationships. Start with C major (all white keys) to internalize the pattern before moving to other keys.",
      },
      {
        id: "foundation-production-notes",
        title: "EDM Production Notes",
        kind: "info",
        body:
          "In Ableton, set your Scale device to the major scale to constrain MIDI notes—this prevents harmonic clashes when programming basslines and leads. Use the major scale pattern to build chord stacks: stack thirds from scale notes to create diatonic chords. For tension/resolution, the leading tone (7th degree) naturally resolves to the tonic—use this in breakdowns to build anticipation. In drops, stick to strong scale degrees (1, 3, 5) for stability; in breakdowns, use the 7th and 4th for tension.",
      },
    ],
  },
  {
    key: "NATURAL_MINOR",
    heroSummary:
      "Discover the natural minor scale and its relationship to major through relative keys. Minor tonality creates the darker, emotional foundation that drives deep house, techno, and bass music.",
    sections: [
      {
        id: "minor-pattern",
        title: "The Natural Minor Scale Pattern",
        kind: "text",
        body:
          "The natural minor scale follows a different pattern: W-H-W-W-H-W-W. This creates a darker, more melancholic sound compared to major. In A minor (relative to C major), we get A-B-C-D-E-F-G-A—the same notes as C major, but starting from A. The lowered third (C instead of C#) gives minor its characteristic emotional tension. This pattern is universal—apply it from any root to build any natural minor scale.",
      },
      {
        id: "minor-relative",
        title: "Relative Major and Minor",
        kind: "text",
        body:
          "Every major key has a relative minor that shares the same notes. A minor is the relative minor of C major—both use only white keys. This relationship is powerful in music production: you can switch between major and minor modes while staying in the same key signature, creating emotional contrast without changing keys. In your DAW, this means the same scale notes work for both—just change which note feels like home.",
      },
      {
        id: "minor-demo",
        title: "Explore Minor Scales",
        kind: "pianoRollDemo",
        body:
          "Compare A natural minor (W-H-W-W-H-W-W) with C major—same notes, different starting point—and hear how the lowered third creates minor's emotional character.",
      },
      {
        id: "minor-edm",
        title: "Minor in EDM and Bass Music",
        kind: "text",
        body:
          "Minor scales dominate darker genres like deep house, techno, and bass music. The minor third interval creates that characteristic emotional tension. Many iconic basslines and chord progressions use minor tonality to create mood and atmosphere. In A minor, progressions like Am-F-C-G (i-VI-III-VII) create that classic melancholic vibe. Understanding minor opens up entire genres of electronic music.",
      },
      {
        id: "minor-progressions",
        title: "Minor Progressions in Practice",
        kind: "text",
        body:
          "In A minor, common progressions include i-iv-V (Am-Dm-E) and i-VI-III-VII (Am-F-C-G). These progressions work because all chords are built from the A natural minor scale. The relative relationship means you can borrow from C major too—mixing Am and C major chords creates interesting harmonic color. This modal interchange is common in progressive house and melodic techno.",
      },
      {
        id: "minor-tip",
        title: "Tip",
        kind: "info",
        body:
          "To find the relative minor of any major key, go down three half steps (a minor third) from the major root. For example, C major → A minor, G major → E minor, F major → D minor. This mental shortcut helps you quickly identify which minor key shares notes with any major key.",
      },
      {
        id: "minor-production-notes",
        title: "EDM Production Notes",
        kind: "info",
        body:
          "Minor scales excel for bass design—the lowered third creates that characteristic dark tension. In Ableton, use the minor scale in your bass MIDI clips to ensure harmonic consistency. For chord stacks, minor triads provide emotional weight in breakdowns; layer them with pads using the same scale notes. The relative major/minor relationship lets you switch tonal centers without changing key signatures—use this to create emotional contrast between drop (major) and breakdown (minor) sections. The minor 7th degree creates less resolution than major's leading tone, perfect for open, floating breakdowns.",
      },
    ],
  },
  {
    key: "TRIADS",
    heroSummary:
      "Triads are the foundation of harmony. They shape bass motion, chord stacks, and drop energy in every EDM track you produce.",
    sections: [
      {
        id: "triads-basics",
        title: "What Are Triads?",
        kind: "text",
        body:
          "A triad is a three-note chord built by stacking thirds. The major triad uses a major third (4 half steps) plus a minor third (3 half steps), creating a bright, stable sound. C major is C-E-G. The minor triad uses a minor third plus a major third, creating a darker, more emotional sound. A minor is A-C-E. These three-note chords are the fundamental building blocks—every complex chord is built from triads.",
      },
      {
        id: "triads-construction",
        title: "Building Triads",
        kind: "text",
        body:
          "To build a major triad, take the root, add the major third, then add the perfect fifth. For C major: C (root) + E (major third) + G (perfect fifth). For minor, lower the third by a half step: A (root) + C (minor third) + E (perfect fifth) gives A minor. In C major, the triads are: C (C-E-G), Dm (D-F-A), Em (E-G-B), F (F-A-C), G (G-B-D), Am (A-C-E), B° (B-D-F). These intervals create the fundamental harmonic colors in music.",
      },
      {
        id: "triads-demo",
        title: "Explore Triads on the Piano Roll",
        kind: "pianoRollDemo",
        body:
          "Build major and minor triads by stacking thirds, and explore different voicings (root position, inversions) to hear how triads function in harmony.",
      },
      {
        id: "triads-functions",
        title: "How Triads Function in a Key",
        kind: "text",
        body:
          "In C major, each triad has a function. C major (I) feels like home—stable and resolved. G major (V) creates tension that wants to resolve back to C—this is the dominant function. F major (IV) provides a gentle departure before returning. In A minor, Am (i) is home, E (V) creates tension, and Dm (iv) provides movement. Understanding these functions helps you build progressions that feel intentional and musically satisfying.",
      },
      {
        id: "triads-edm",
        title: "Triads in EDM Production",
        kind: "text",
        body:
          "Triads form the foundation of most chord progressions in electronic music. Whether you're making a four-on-the-floor house track or a deep bassline, triads provide the harmonic structure. Stack them in your DAW's chord plugin, layer them with pads, or use them as the foundation for your bassline. Learning to recognize and build triads quickly is essential for music production. Many iconic EDM tracks use simple triadic progressions—the power comes from rhythm, sound design, and arrangement, not complex harmony.",
      },
      {
        id: "triads-tip",
        title: "Tip",
        kind: "info",
        body:
          "Practice building triads from different roots. Start with C major and A minor, then move around the circle of fifths. Visual recognition on the piano roll speeds up your workflow. In your DAW, try building a simple progression using only triads from C major: C-F-G-C. Notice how each chord feels and how they create forward motion.",
      },
      {
        id: "triads-production-notes",
        title: "EDM Production Notes",
        kind: "info",
        body:
          "Triads form the foundation of chord stacks—layer them in Ableton's Instrument Rack with different voicings (root position, first inversion, second inversion) for width. For bass design, use triadic roots as your bassline foundation; the third and fifth can appear in mid-range layers. In drops, use root-position triads for clarity and punch. In breakdowns, use inversions and spread voicings for atmosphere. The V-I progression (dominant to tonic) creates the strongest resolution—use this for drop impact. Separate your bass (root) and chord stack (full triad) into different tracks for better mix control.",
      },
    ],
  },
  {
    key: "DIATONIC_TRIADS",
    heroSummary:
      "Learn how chords fit within a key using Roman numerals. Master the seven diatonic triads and understand how they create the harmonic framework for entire songs.",
    sections: [
      {
        id: "diatonic-intro",
        title: "Chords Within a Key",
        kind: "text",
        body:
          "Every major or minor key contains seven natural chords built from the scale notes. These are called diatonic chords. In C major, the pattern is: I (C major), ii (D minor), iii (E minor), IV (F major), V (G major), vi (A minor), vii° (B diminished). This sequence is universal across all major keys. In A minor (natural minor), the pattern is: i (A minor), ii° (B diminished), III (C major), iv (D minor), v (E minor), VI (F major), VII (G major).",
      },
      {
        id: "diatonic-roman",
        title: "Roman Numeral Notation",
        kind: "text",
        body:
          "Roman numerals represent chord functions within a key, not specific notes. I, IV, and V are major; ii, iii, and vi are minor; vii° is diminished. This system lets you understand chord progressions abstractly—the same progression works in any key. For example, I-V-vi-IV is a common pop/EDM progression. In C major, that's C-G-Am-F. In G major, it's G-D-Em-C. The function is identical, just transposed. This abstraction is powerful for songwriting and remixing.",
      },
      {
        id: "diatonic-demo",
        title: "Explore Diatonic Chords",
        kind: "pianoRollDemo",
        body:
          "Play through all seven diatonic triads in C major (I, ii, iii, IV, V, vi, vii°) and hear how each chord functions within the key.",
      },
      {
        id: "diatonic-progressions",
        title: "Common Diatonic Progressions",
        kind: "text",
        body:
          "Many iconic songs use simple diatonic progressions. The vi-IV-I-V progression (Am-F-C-G in C major) appears in countless tracks. I-vi-IV-V (C-Am-F-G) is another classic. Understanding these patterns helps you recognize and create progressions quickly. In EDM, these progressions often repeat with variations, creating the harmonic foundation for entire tracks. The repetition works because the progression creates a loop that feels complete yet wants to continue.",
      },
      {
        id: "diatonic-edm",
        title: "Diatonic Progressions in EDM",
        kind: "text",
        body:
          "EDM producers use diatonic progressions as the harmonic foundation, then add interest through rhythm, sound design, and arrangement. A simple I-V-vi-IV loop can drive an entire track when paired with evolving pads, rhythmic variation, and dynamic builds. The predictability of diatonic progressions creates familiarity, while production elements add surprise. This is why so many hit EDM tracks use 'simple' progressions—the complexity is in the execution, not the harmony.",
      },
      {
        id: "diatonic-tip",
        title: "Tip",
        kind: "info",
        body:
          "Memorize the quality pattern: Major keys = I, IV, V are major; ii, iii, vi are minor. This pattern is consistent across all major keys, making it easy to build progressions in any key. For minor keys, remember: i, iv, v are minor; III, VI, VII are major. This mental framework speeds up your chord selection process.",
      },
      {
        id: "diatonic-production-notes",
        title: "EDM Production Notes",
        kind: "info",
        body:
          "Roman numerals let you transpose progressions instantly in Ableton—write your progression as I-V-vi-IV, then change the root key in your Scale device. For chord stacks, use diatonic triads from the same key to ensure harmonic coherence. The V chord (dominant) creates tension perfect for builds; resolve to I (tonic) at the drop for maximum impact. In breakdowns, use vi and ii (submediant and supertonic) for softer, less resolved movement. Keep your bass on scale roots while your chord stack uses full triads—this separation creates clarity in the mix. Use Ableton's Chord device with diatonic intervals to quickly build chord stacks from single-note progressions.",
      },
    ],
  },
  {
    key: "CIRCLE_OF_FIFTHS",
    heroSummary:
      "Master the circle of fifths to navigate keys, find relative minors, and understand key relationships. This visual tool connects all keys and unlocks modulation techniques used in progressive EDM.",
    sections: [
      {
        id: "circle-intro",
        title: "What is the Circle of Fifths?",
        kind: "text",
        body:
          "The circle of fifths is a visual representation of all 12 keys arranged by their relationship. Moving clockwise, each key adds one sharp (or removes one flat). Moving counter-clockwise, each key adds one flat (or removes one sharp). C major sits at the top (12 o'clock) with no sharps or flats. This arrangement reveals key signatures, relative relationships, and modulation paths. It's the roadmap for understanding how all keys connect.",
      },
      {
        id: "circle-demo",
        title: "Explore the Circle",
        kind: "circleDemo",
        body:
          "Navigate the circle of fifths to see key relationships, find relative minors, and understand how sharps and flats accumulate around the circle.",
      },
      {
        id: "circle-relative",
        title: "Finding Relative Minors",
        kind: "text",
        body:
          "Each major key has a relative minor located three positions clockwise on the circle. For example, C major's relative minor is A minor (three positions clockwise). This relationship is consistent: the relative minor is always a minor third below the major root. Understanding this helps you switch between major and minor modes. In production, this means you can use the same scale notes but change the tonal center—powerful for creating emotional shifts without changing keys.",
      },
      {
        id: "circle-neighbors",
        title: "Neighbor Keys (IV and V)",
        kind: "text",
        body:
          "On the circle, each key's closest neighbors are its IV (subdominant) and V (dominant) chords. These are the most common chord progressions in music. For example, in C major, F (IV) is one position counter-clockwise and G (V) is one position clockwise. These relationships create smooth, natural-sounding progressions. The circle makes it easy to see why I-IV-V progressions are so common—they're literally neighbors on the circle.",
      },
      {
        id: "circle-modulation",
        title: "Using the Circle for Modulation",
        kind: "text",
        body:
          "The circle helps you understand key changes (modulations). Moving to adjacent keys on the circle creates smooth transitions. Moving further creates more dramatic shifts. In EDM, subtle modulations can add energy to a track—moving from C to G (one step clockwise) feels natural and uplifting. Dramatic shifts (like C to F#) create powerful moments. Many progressive house tracks use gradual modulations up the circle to build energy throughout the track.",
      },
      {
        id: "circle-production",
        title: "Circle of Fifths in Production",
        kind: "text",
        body:
          "Use the circle to choose keys that work well together in your DAW. Adjacent keys share many notes, making transitions smooth. This helps with breakdowns, bridges, and energy builds. Many EDM tracks modulate up the circle during the drop—moving from C to G to D creates rising energy. The circle shows why certain key combinations sound good together and why others create tension.",
      },
      {
        id: "circle-tip",
        title: "Tip",
        kind: "info",
        body:
          "Memorize the circle positions. Start with C at 12 o'clock, then learn the sharp keys clockwise (G, D, A, E, B, F#) and flat keys counter-clockwise (F, Bb, Eb, Ab, Db, Gb). This mental map speeds up key navigation and helps you make quick decisions in your productions. Practice identifying relative minors and neighbor keys to build your harmonic intuition.",
      },
      {
        id: "circle-production-notes",
        title: "EDM Production Notes",
        kind: "info",
        body:
          "Use the circle to plan key modulations in your arrangement—adjacent keys share many notes, making transitions smooth. In Ableton, modulate up the circle (C→G→D) during builds to create rising energy. The IV and V relationships are your strongest progressions—use them for drop sections. For breakdowns, move to the relative minor (same notes, different center) to create emotional contrast without harmonic clash. When layering bass and leads, ensure they're in the same key or closely related keys on the circle. The circle helps you choose complementary keys for different sections—use it to plan your track's harmonic journey.",
      },
    ],
  },
  {
    key: "SEVENTH_CHORDS",
    heroSummary:
      "Add 7ths to your triads for richer harmonies and more expressive EDM progressions. Seventh chords create tension, color, and movement that triads alone can't provide.",
    sections: [
      {
        id: "seventh-basics",
        title: "What Are 7th Chords?",
        kind: "text",
        body:
          "Seventh chords add a fourth note to triads, creating richer harmonic color. The major 7th (maj7) adds a major third above the fifth: C-E-G-B. The minor 7th (min7) adds a minor third above the fifth: A-C-E-G. The dominant 7th (dom7) combines a major triad with a minor 7th: G-B-D-F. Each type creates a different emotional quality—maj7 sounds dreamy and open, min7 sounds smooth and jazzy, dom7 sounds tense and wants to resolve.",
      },
      {
        id: "seventh-construction",
        title: "Building 7th Chords",
        kind: "text",
        body:
          "To build a 7th chord, start with a triad and add the 7th scale degree. In C major, Cmaj7 is C-E-G-B (I chord with added 7th). Am7 is A-C-E-G (vi chord with added 7th). G7 is G-B-D-F (V chord with dominant 7th). The dominant 7th is special—it's the most common 7th chord because the V chord naturally wants to resolve to I. In C major, G7 creates strong tension that resolves beautifully to C or Cmaj7.",
      },
      {
        id: "seventh-demo",
        title: "Explore 7th Chords",
        kind: "pianoRollDemo",
        body:
          "Compare maj7, min7, and dominant 7th chords to hear how adding the 7th degree creates richer harmonic color and stronger voice leading.",
      },
      {
        id: "seventh-diatonic",
        title: "Diatonic 7th Chords in a Key",
        kind: "text",
        body:
          "In C major, the diatonic 7th chords are: Cmaj7 (I), Dm7 (ii), Em7 (iii), Fmaj7 (IV), G7 (V), Am7 (vi), Bm7b5 (vii°). Notice that most are minor 7ths, but I and IV are major 7ths, and V is dominant 7th. This pattern is consistent across all major keys. In A minor, the pattern is: Am7 (i), Bm7b5 (ii°), Cmaj7 (III), Dm7 (iv), Em7 (v), Fmaj7 (VI), G7 (VII). Understanding these patterns helps you build extended progressions.",
      },
      {
        id: "seventh-edm",
        title: "7th Chords in EDM",
        kind: "text",
        body:
          "Seventh chords add sophistication to EDM progressions without complexity. A simple progression like Cmaj7-Am7-Fmaj7-G7 creates more movement and color than the triadic version. In deep house and progressive genres, 7th chords work well in pads and chord stacks. The dominant 7th (G7) is particularly useful—it creates strong tension that resolves to the tonic, perfect for builds and drops. Many melodic techno tracks use extended 7th chord progressions to create evolving harmonic landscapes.",
      },
      {
        id: "seventh-progressions",
        title: "Common 7th Chord Progressions",
        kind: "text",
        body:
          "Classic 7th chord progressions include: I-vi-ii-V (Cmaj7-Am7-Dm7-G7), which is the jazz turnaround adapted for EDM. Another is I-iii-vi-IV (Cmaj7-Em7-Am7-Fmaj7), which creates smooth voice leading. In A minor, try i-VI-III-VII (Am7-Fmaj7-Cmaj7-G7) for a modal, open sound. These progressions work because the 7ths create smooth connections between chords—each chord shares notes with the next, creating flowing harmonic motion.",
      },
      {
        id: "seventh-tip",
        title: "Tip",
        kind: "info",
        body:
          "Start by adding 7ths to your existing triadic progressions. Take a simple I-V-vi-IV and try I7-V7-vi7-IV7, or mix triads and 7ths: I-V7-vi-IV. The dominant 7th on V is the most important—it creates the strongest resolution back to I. Experiment with voice leading: keep common tones between chords to create smooth transitions.",
      },
      {
        id: "seventh-production-notes",
        title: "EDM Production Notes",
        kind: "info",
        body:
          "7th chords add harmonic color without complexity—use them in pad layers and chord stacks for sophistication. In Ableton, add 7ths to your chord progressions by extending your triads with the 7th scale degree. The dominant 7th (V7) creates the strongest tension—use it in builds before resolving to I at the drop. For bass design, keep the root in the bass; let the 7th appear in mid-range chord layers to avoid mud. In breakdowns, use maj7 and min7 chords for open, floating atmospheres. The 7th creates smooth voice leading between chords—each chord shares notes with the next, creating flowing harmonic motion perfect for evolving pads.",
      },
    ],
  },
  {
    key: "MODES",
    heroSummary:
      "Explore Dorian, Mixolydian, and Phrygian modes—the modal flavors that color bass-heavy tracks and create distinctive harmonic character in electronic music.",
    sections: [
      {
        id: "modes-intro",
        title: "What Are Modes?",
        kind: "text",
        body:
          "Modes are scales that use the same notes as major or minor but start from a different degree. Think of them as 'flavors' of the parent scale. Dorian starts on the 2nd degree (D-E-F-G-A-B-C-D in C major), Mixolydian on the 5th (G-A-B-C-D-E-F-G), and Phrygian on the 3rd (E-F-G-A-B-C-D-E). Each mode has a unique character: Dorian is minor with a raised 6th (bright minor), Mixolydian is major with a lowered 7th (bluesy major), Phrygian is minor with a lowered 2nd (dark, exotic minor).",
      },
      {
        id: "modes-dorian",
        title: "Dorian Mode",
        kind: "text",
        body:
          "Dorian is a minor mode with a raised 6th degree. In D Dorian, the pattern is: D-E-F-G-A-B-C-D. Compare this to D natural minor (D-E-F-G-A-Bb-C-D)—the B natural creates a brighter, more open sound. Dorian is popular in bass music because it's minor (dark, emotional) but with a lifted quality from the raised 6th. Many deep house and techno basslines use Dorian to create that characteristic minor-but-not-too-dark vibe. The raised 6th also creates interesting chord options, like the major IV chord in a minor context.",
      },
      {
        id: "modes-mixolydian",
        title: "Mixolydian Mode",
        kind: "text",
        body:
          "Mixolydian is a major mode with a lowered 7th degree. In G Mixolydian, the pattern is: G-A-B-C-D-E-F-G. Compare this to G major (G-A-B-C-D-E-F#-G)—the F natural creates a bluesy, slightly unresolved sound. Mixolydian is common in electronic music because it's major (bright, uplifting) but with a hint of tension from the lowered 7th. This creates interesting harmonic possibilities—the dominant 7th chord (G7) feels at home in Mixolydian, creating a bluesy major sound perfect for leads and chord progressions.",
      },
      {
        id: "modes-phrygian",
        title: "Phrygian Mode",
        kind: "text",
        body:
          "Phrygian is a minor mode with a lowered 2nd degree. In E Phrygian, the pattern is: E-F-G-A-B-C-D-E. The F natural (lowered 2nd) creates a dark, exotic, almost Middle Eastern sound. Phrygian is less common in mainstream EDM but appears in darker genres like industrial techno and some bass music. The lowered 2nd creates strong tension and a distinctive character. In E Phrygian, the bII chord (F major) is common, creating that characteristic Phrygian sound heard in flamenco and metal—adapted for electronic music.",
      },
      {
        id: "modes-demo",
        title: "Explore Modal Scales",
        kind: "pianoRollDemo",
        body:
          "Compare Dorian, Mixolydian, and Phrygian modes—each using the same notes but starting from different degrees—to hear their unique modal flavors.",
      },
      {
        id: "modes-bass",
        title: "Modes in Bass Music",
        kind: "text",
        body:
          "Modes give bass music its distinctive character. Dorian creates that minor-but-bright bassline sound common in deep house. Mixolydian adds bluesy flavor to major progressions, perfect for leads and chord stacks. Phrygian provides dark, exotic colors for industrial and experimental genres. Understanding modes lets you choose the right 'flavor' for your track's emotional character. Many producers use modes intuitively—now you can use them intentionally. Modal interchange (mixing modes) is common in progressive genres and creates evolving harmonic landscapes.",
      },
      {
        id: "modes-progressions",
        title: "Modal Progressions",
        kind: "text",
        body:
          "Modal progressions emphasize the characteristic notes of each mode. In D Dorian, progressions like Dm-G-C (i-IV-bVII) highlight the raised 6th. In G Mixolydian, G-C-F (I-IV-bVII) uses the lowered 7th. In E Phrygian, E-F-Am (i-bII-iv) emphasizes the lowered 2nd. These progressions work because they avoid the leading tone resolution of major/minor, creating open, floating harmonic motion. This is why modal progressions feel less 'resolved' and more atmospheric—perfect for electronic music.",
      },
      {
        id: "modes-tip",
        title: "Tip",
        kind: "info",
        body:
          "Start with Dorian—it's the most accessible mode for EDM. Try D Dorian (same notes as C major, starting on D) and build a bassline using D-E-F-G-A-B-C-D. Notice how it feels minor but brighter than natural minor. Then experiment with Mixolydian for leads and Phrygian for darker textures. Modal thinking opens up new harmonic possibilities beyond major and minor.",
      },
      {
        id: "modes-production-notes",
        title: "EDM Production Notes",
        kind: "info",
        body:
          "Dorian excels for bass design—the raised 6th creates minor tonality with brightness, perfect for deep house and techno. In Ableton, set your Scale device to Dorian and program basslines using the characteristic raised 6th. Mixolydian works well for leads—the lowered 7th adds bluesy tension to major progressions. For chord stacks, use modal progressions (i-IV-bVII in Dorian) to create open, floating atmospheres in breakdowns. Phrygian's lowered 2nd creates dark, exotic basslines for industrial genres. Modal interchange—mixing modes within a track—creates evolving harmonic landscapes. Use modes intentionally: Dorian for bass, Mixolydian for leads, Phrygian for dark textures.",
      },
    ],
  },
  {
    key: "ADVANCED",
    heroSummary:
      "Explore advanced harmonic concepts: diminished and augmented triads, borrowed chords, and chromatic harmony. These tools add sophisticated color and tension to your productions.",
    sections: [
      {
        id: "advanced-diminished",
        title: "Diminished Triads",
        kind: "text",
        body:
          "Diminished triads stack two minor thirds, creating a tense, unstable sound. In C major, B diminished (B-D-F) is the vii° chord. Diminished triads want to resolve—they create strong tension. In EDM, diminished chords are less common but useful for creating dramatic moments, breakdowns, and tension before drops. They're also useful for voice leading—the symmetrical structure means they can resolve to multiple keys, useful for modulations. Try using a diminished chord as a passing chord between more stable triads.",
      },
      {
        id: "advanced-augmented",
        title: "Augmented Triads",
        kind: "text",
        body:
          "Augmented triads stack two major thirds, creating a bright, open, slightly unstable sound. C augmented is C-E-G#. Unlike diminished triads, augmented triads are less common in diatonic harmony but useful for creating color and tension. They have a dreamy, floating quality—perfect for pads and atmospheric sections. Augmented chords can resolve to major or minor chords, making them flexible for modulations. In electronic music, they're often used in ambient and experimental genres for their unique harmonic color.",
      },
      {
        id: "advanced-demo",
        title: "Explore Advanced Voicings",
        kind: "pianoRollDemo",
        body:
          "Compare diminished and augmented triads, and experiment with borrowed chords (like bVI and bVII) to hear how advanced harmony adds sophisticated color and tension.",
      },
      {
        id: "advanced-borrowed",
        title: "Borrowed Chords (Modal Interchange)",
        kind: "text",
        body:
          "Borrowed chords come from parallel keys—using chords from C minor while in C major, or vice versa. In C major, you might borrow bVI (Ab), bVII (Bb), or iv (Fm) from C minor. This creates interesting harmonic color without leaving the key. In EDM, borrowed chords are common in progressive genres—they add surprise and color to otherwise diatonic progressions. For example, a C-Fm-G progression borrows Fm from C minor, creating a darker moment in a major context. This technique is powerful for creating emotional shifts.",
      },
      {
        id: "advanced-secondary",
        title: "Secondary Dominants (Future)",
        kind: "text",
        body:
          "Secondary dominants are dominant chords that resolve to chords other than the tonic. For example, in C major, D7 (V of V) resolves to G, which then resolves to C. This creates stronger harmonic motion and more interesting progressions. Secondary dominants are common in jazz and classical music, and they're starting to appear more in sophisticated electronic music. They add complexity and forward motion to progressions. This is an advanced topic that will be expanded in future updates.",
      },
      {
        id: "advanced-production",
        title: "Advanced Harmony in Production",
        kind: "text",
        body:
          "Use advanced harmonic concepts sparingly and intentionally. Diminished and augmented triads create strong effects—use them for specific moments, not entire progressions. Borrowed chords add color without complexity—they're more accessible than secondary dominants. In EDM, these techniques work best when paired with strong production elements. A simple progression with great sound design often beats a complex progression with weak production. Use advanced harmony to enhance your tracks, not to show off theory knowledge.",
      },
      {
        id: "advanced-tip",
        title: "Tip",
        kind: "info",
        body:
          "Start with borrowed chords—they're the most practical advanced technique. Try borrowing bVI or bVII from the parallel minor in a major progression. For example, in C major, use Ab or Bb to create a moment of harmonic surprise. Diminished and augmented triads are more specialized—experiment with them in breakdowns and transitions where you want strong tension. Remember: advanced harmony is a tool, not a requirement. Many great tracks use simple diatonic progressions with excellent production. Practice adding one borrowed chord to a diatonic progression to hear the effect.",
      },
      {
        id: "advanced-production-notes",
        title: "EDM Production Notes",
        kind: "info",
        body:
          "Borrowed chords (modal interchange) add color without complexity—use bVI or bVII from the parallel minor to create harmonic surprise in major progressions. In Ableton, insert borrowed chords strategically in breakdowns for emotional shifts. Diminished triads create strong tension—use them as passing chords between stable triads, or in pre-drop builds for maximum impact. Augmented triads have a dreamy, floating quality—layer them in pad stacks for atmospheric sections. Keep advanced harmony sparse: use it for specific moments (breakdowns, transitions) rather than entire progressions. The power comes from contrast—simple diatonic sections make advanced moments stand out. Always pair advanced harmony with strong sound design and arrangement.",
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

