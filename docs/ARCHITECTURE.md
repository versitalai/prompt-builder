# Architecture

Static site, vanilla JS ES modules, no framework, no build, no dependencies.

```
index.html          shell: header, tab bar, Preview panel, toast
css/styles.css      all styling (dark default, auto light mode, mobile-first)
js/sections.js      DATA: tab definitions + how each becomes prompt text   ← edit this to add tabs
js/builder.js       PURE LOGIC: defaults, normalize, buildPrompt, checks   (no DOM, unit tested)
js/storage.js       localStorage: draft autosave, library, export/import
js/ui.js            DOM rendering, generic over sections.js
js/main.js          wiring: state, events, actions
tests/              node:test unit tests for builder.js
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

Any field can have `showIf: '<checkboxFieldId>'` (same section) to hide it until that box is ticked.

Adding a new field type: handle it in `ui.js → renderField`, `builder.js → defaultValues / normalizeValues / sectionHasContent`.
