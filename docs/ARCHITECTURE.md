# Architecture

Static site, vanilla JS ES modules, no framework, no build, no dependencies.

```
index.html          shell: header, tab bar, Preview panel, toast
css/styles.css      all styling. Theme = :root tokens only (light default, auto dark mode)
js/sections.js      DATA: tab definitions + how each becomes prompt text   ← edit this to add tabs
js/builder.js       PURE LOGIC: defaults, normalize, buildPrompt, checks   (no DOM, unit tested)
js/storage.js       localStorage: draft autosave, library, export/import
js/ui.js            DOM rendering, generic over sections.js (layout rules at top of file)
js/icons.js         inline SVG icon set (static strings only)
js/main.js          wiring: state, events, actions
tests/              node:test unit tests for builder.js
tools/              spacing_audit.py (Playwright layout check)
```

## Data flow

```
sections.js ──defines──▶ ui.js renders tabs/fields
                              │ onChange(sectionId, fieldId, value)
                              ▼
                         main.js `values` state ──▶ storage.saveDraft (debounced 400ms)
                              │
                              ▼
                         builder.buildPrompt(values) ──▶ Preview + Copy
```

## State shape

```js
values = {
  persona:  { role: '', audience: '', perspective: '' },
  task:     { task: '', goal: '' },
  context:  { facts: '', constraints: '', allowUnknown: true, useSearch: false },
  format:   { outputType: '', length: '', tone: '', structure: '', avoid: '' },
  examples: { items: [{ label: '', content: '' }] },
  advanced: { cot: false, cotSteps: '', tot: false, totBranches: '', battle: false, battlePersonas: '' },
}
```

Generated from `sections.js` by `defaultValues()`. Never hand-write it.

## Key decisions

- **Config-driven tabs.** One array in `sections.js` drives the UI, output, checks and storage, so a new tab costs one object and zero UI code.
- **`normalizeValues()` on every load.** Saved or imported data is merged over fresh defaults and type-checked. New fields added later get defaults, unknown or invalid keys are dropped, and old saves don't break.
- **Versioned storage keys** (`promptBuilder:draft:v1`). If the shape changes incompatibly, bump to `v2` and migrate in `storage.js`.
- **All `localStorage` calls in try/catch.** Storage can be blocked (private mode) or full; the app still works, it just can't save.
- **No `innerHTML` with user text.** `ui.el()` uses text nodes, so pasted prompts can't inject HTML.
- **Markdown output** with `##` headings. Readable by every major AI and by humans.
- **Checkboxes with defaults don't count as "content"** for tab dots, so a fresh page shows no green dots.

## Field types

| type | value | notes |
|------|-------|-------|
| `text` | string | single line |
| `textarea` | string | `rows` optional |
| `checkbox` | boolean | `default` optional |
| `list` | array of objects | `itemFields` (text/textarea), `addLabel` |

Field options:
- `showIf: '<checkboxFieldId>'` (same section): hidden until that toggle is on; rendered inside the toggle's group.
- `half: true` (text fields): two consecutive half fields share a row; they stack under 560px.
- `hint` (checkbox fields): grey description under the toggle label.

Section options: `icon` (name from `js/icons.js`) and `subtitle` (line under the page title).

## Spacing rules

4px grid, tokens in `:root`: `--sp-1` 4 (text pairs), `--sp-2` 8 (label→input, button rows), `--sp-3` 12, `--sp-4` 16 (items inside a card), `--sp-6` 24 (page blocks, card padding).
Containers use `display:flex/grid` + `gap`; children never set vertical margins. Run `python3 tools/spacing_audit.py .` after layout changes. It should print `mismatches: 0`.

## UI regions

| Region | Desktop | Mobile (≤900px) |
|--------|---------|-----------------|
| Nav | left sidebar | one-row sticky header: logo + scrolling pills |
| Content | center column, one card per tab | full width |
| Summary | right sticky panel | hidden; replaced by bottom bar (words + Copy) |

Adding a new field type: handle it in `ui.js → renderField`, `builder.js → defaultValues / normalizeValues / sectionHasContent`.
