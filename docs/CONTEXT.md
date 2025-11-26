# Harmonia – Project Context

This repo contains a single-user music theory learning app focused on:
- Scales (major, natural minor, and a few modes)
- Chord construction and identification
- Circle of Fifths understanding
- Piano-roll based visualization (not traditional notation)
- Spaced repetition flashcards and progress tracking

## Source of Truth Documents

Cursor and other AI tools should treat these as authoritative:

- `/docs/PRD.md` – product requirements and feature list
- `/docs/API_SPEC.md` – HTTP API endpoints, request/response schemas
- `/docs/SCHEMA.md` – database or Prisma schema

Before making large architectural or API changes, first read these docs.

## Design Priorities

1. Robust piano-roll visualization (critical).
2. Clear Circle of Fifths UI with mastery heatmap.
3. Simple single-user state (no authentication).
4. Extensibility for future MIDI-based chord recognition and ear training.

## Non-goals

- No staff-notation-based reading requirement.
- No multi-tenant / multi-user auth complexity.
- No mobile-native app (web-first, responsive is enough).
