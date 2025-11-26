Palette and theme tokens
Core palette uses a “Scandinavian Minimalism” scheme defined as CSS custom properties: background #f5f5f0, foreground text #2c2c2c, surfaces #ffffff/#fafafa, border #e5e5e5, muted text #6b6b6b, and accent #4a4a4a. These variables are bound to Tailwind-style tokens via the @theme inline block for consistent usage across classes (bg-background, text-foreground, etc.).
Body styling applies the background/foreground tokens and enables font smoothing for a clean, light appearance.
Typography
Primary sans font: Geist (Google), exposed as --font-geist-sans; mono font: Geist Mono as --font-geist-mono. Both are loaded through next/font/google and attached as CSS variables on the <body> with the antialiased class for crisp text rendering.
Hero title uses a light weight (font-light) at 4xl, with supporting muted subtitle text for a refined header style.

Overall aesthetic cues
Color usage leans on very light neutrals and the Tailwind “stone” scale for subtle contrast, aligning with the minimal palette tokens.
Shapes favor rounded corners (from rounded-lg up to rounded-2xl/rounded-full) and thin borders to keep elements delicate.
Motion uses gentle opacity/translate transitions with short durations and easing curves for card/timeline animations.
Use these tokens (colors, fonts), spacing rules (large gaps, centered max-width container), and component patterns (soft borders, light neutral surfaces, stone palette accents, rounded pills/cards, understated shadows) as the basis for replicating the visual style in another project.