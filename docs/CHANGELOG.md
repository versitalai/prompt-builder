# Changelog

## 1.2.0 — 2026-11-20

- **Section preview** on every tab: live view of exactly what that tab adds (markdown block), an Included/Skipped pill, and "Part X of Y" position in the final prompt.
- **Presets** ("What are you making?"), 14 across 5 groups:
  General · Writing (Email / message, Essay / article, Social post) · Creative (Story, Image prompt) ·
  Code (Roblox / Luau script, Code feature, Debug an error) · Study (Explain a concept, Quiz / flashcards) ·
  Plans & data (Game design doc, Project plan, Data → table / JSON, Research summary).
  Each preset swaps every placeholder, adds tap-to-fill suggestion chips, and has a **Fill example** button.
  Presets never change typed text; Fill example asks first if tabs aren't empty.
- Default placeholders are now general-purpose (birthday-gift example); the Cloudflare email lives in the Email preset.
- Light syntax colouring in previews (headings, quotes, lists). Copy still uses raw text.
- Chosen preset saved with the draft, library entries, and exports (`values.meta.preset`).

## 1.1.0 — 2026-11-20

Full UI redesign, based on reference designs the user supplied (dashboard form, settings page, component kit).

- Layout: left sidebar nav with filled checkmarks; content in cards; right "Prompt summary" panel with per-section status pills (Filled / Needed / Empty), word and section counts, Copy and Open preview.
- Checkboxes became settings-style toggle switches with a description line (`hint`).
- Options that appear when a toggle is on sit inside that toggle's group.
- Short fields sit side by side (`half: true`); they stack on mobile.
- Clarity check uses alert cards with "Go to …" links; the library is a table.
- Copy works from any tab (top bar, summary panel, mobile bottom bar).
- Mobile: compact one-row header with logo + scrolling pills; sticky bottom bar with word count + Copy.
- New `js/icons.js` (inline SVG line icons). Inter + JetBrains Mono fonts, with system-font fallback.
- Sage-green theme tokens in `:root`; dark mode follows the system setting.
- Even spacing: 4px-grid scale (`--sp-1`…`--sp-6`). Gaps come from parent `gap`, never sibling margins. Checked by `tools/spacing_audit.py` (0 mismatches desktop + mobile).

## 1.0.0 — 2026-11-16

First release.

- 7 tabs: Persona, Task, Context, Format, Examples (few-shot list), Advanced (CoT / ToT / Battle of the Bots), Preview & Copy.
- Markdown output; empty sections are skipped.
- Clarity check warnings on the Preview tab, linking to the relevant tab.
- Autosave draft, named prompt library, JSON export/import (merges by name).
- Copy button with clipboard fallback.
- Dark/light mode follows the system setting; mobile-friendly scrolling tab bar.
- Unit tests for the prompt builder (`npm test`).
