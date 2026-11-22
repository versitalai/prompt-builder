# Prompt Builder

A tabbed website for writing better AI prompts. Fill in each tab, then copy one clean prompt into ChatGPT, Claude, Gemini or any other AI.

**Live site:** https://versitalai.github.io/prompt-builder/

Based on the techniques in NetworkChuck's video [*You SUCK at Prompting AI (Here's the secret)*](https://www.youtube.com/watch?v=pwWBcsxEoLk).

## Tabs

| # | Tab | What it adds to your prompt | Technique |
|---|-----|-----------------------------|-----------|
| 1 | Persona | `## Role`: who is answering, for whom | Personas |
| 2 | Task | `## Task`: what to do, what success looks like | Clarity of thought ("think first, prompt second") |
| 3 | Context | `## Context`: facts, constraints, "say I don't know", web search | Context / permission to fail |
| 4 | Format | `## Output format`: type, length, tone, structure, avoid | Output requirements |
| 5 | Examples | `## Examples`: short snippets to imitate | Few-shot prompting |
| 6 | Advanced | `## Approach`: chain of thought, tree of thoughts, battle of the bots | Advanced techniques |
| 7 | Preview & Copy | Final prompt, clarity check, copy button, prompt library | Prompt library |
| – | Rules | Not part of the prompt. The rules, checklist and example lines | All |

Empty tabs are left out of the final prompt.

## Features

- **Presets**: pick what you're making (game design doc, Roblox script, essay, quiz, image prompt, and more). Placeholders and suggestion chips change to match, and **Fill example** loads a complete worked example.
- **Section preview**: every tab shows exactly what it adds to the final prompt, live.
- **Rules page**: the 10 rules from the video, a quick checklist, copyable example lines, and links to the matching tabs.

- **Autosave**: your inputs survive a page refresh (stored in your browser).
- **Prompt library**: name and save prompts that work, then load them later.
- **Export / import JSON**: back up your library or move it to another device.
- **Clarity check**: warns when key parts are missing (for example, no context means hallucination risk).
- **Prompt summary panel**: shows which sections are filled, live word count, and Copy from any tab.
- Light and dark mode follow your system setting.
- Works on phones. No accounts, no server, nothing uploaded.

## Run locally

No build step. ES modules need a local server, because opening `index.html` directly from disk won't load them:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Tests

```bash
npm test   # Node 18+, no dependencies
```

## Deploy (GitHub Pages)

Settings → Pages → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save.
The site appears at `https://<user>.github.io/prompt-builder/` within a minute or two.

## Adding or changing a tab

Edit **only** `js/sections.js`. Add an object to `SECTIONS` (pick an `icon` from `js/icons.js`):

```js
{
  id: 'audience',            // unique, used in saved data
  label: 'Audience',         // tab name
  icon: 'user',              // sidebar icon
  subtitle: 'Who reads it',  // line under the title
  heading: 'Audience',       // ## heading in the output
  tip: 'Why this matters…',  // teaching text at top of tab
  fields: [{ id: 'who', type: 'text', label: 'Who reads this?' }],
  build: (v) => v.who ? `Written for ${v.who}.` : '',
  check: (v) => v.who ? null : { level: 'info', text: 'No audience set.' },
}
```

The tab, inputs, autosave, library, export and preview all pick it up automatically. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Adding a preset

Add one object to `PRESETS` in `js/presets.js` (see the existing ones). Run `npm test`: it checks every key is valid.
