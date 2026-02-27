import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "piano-bg": "var(--piano-bg)",
        "piano-surface": "var(--piano-surface)",
        "piano-border": "var(--piano-border)",
        "piano-white-key": "var(--piano-white-key)",
        "piano-white-key-hover": "var(--piano-white-key-hover)",
        "piano-black-key": "var(--piano-black-key)",
        "piano-black-key-hover": "var(--piano-black-key-hover)",
        "piano-accent": "var(--piano-accent)",
        "piano-scale-white": "var(--piano-scale-white)",
        "piano-scale-black": "var(--piano-scale-black)",
        "piano-muted-white": "var(--piano-muted-white)",
        "piano-muted-black": "var(--piano-muted-black)",
        "piano-text-dim": "var(--piano-text-dim)",
        "piano-text-bright": "var(--piano-text-bright)",
        "music-highlight-bg": "var(--music-highlight-bg)",
        "music-neighbor-bg": "var(--music-neighbor-bg)",
        "music-minor-muted": "var(--music-minor-muted)",
        "music-minor-highlight": "var(--music-minor-highlight)",
        "music-minor-selected": "var(--music-minor-selected)",
      },
      borderColor: {
        subtle: "var(--border-subtle)",
        "piano-border": "var(--piano-border)",
      },
    },
  },
  plugins: [],
};
export default config;

