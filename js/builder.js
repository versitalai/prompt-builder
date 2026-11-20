// builder.js — pure functions (no DOM). Turns state into the final prompt.
// Pure = easy to unit test (see tests/builder.test.mjs).

import { SECTIONS } from './sections.js';
import { PRESETS, DEFAULT_PRESET_ID, placeholderFor } from './presets.js';

/** Default values for every field, from sections.js. `meta` holds non-prompt state (chosen preset). */
export function defaultValues() {
  const values = { meta: { preset: DEFAULT_PRESET_ID } };
  for (const s of SECTIONS) {
    values[s.id] = {};
    for (const f of s.fields) {
      if (f.type === 'checkbox') values[s.id][f.id] = f.default ?? false;
      else if (f.type === 'list') values[s.id][f.id] = [];
      else values[s.id][f.id] = '';
    }
  }
  return values;
}

/** Merge saved values over defaults, so new fields added later still exist. */
export function normalizeValues(saved) {
  const base = defaultValues();
  if (!saved || typeof saved !== 'object') return base;
  const presetId = saved.meta?.preset;
  if (typeof presetId === 'string' && PRESETS.some((p) => p.id === presetId)) base.meta.preset = presetId;
  for (const s of SECTIONS) {
    const src = saved[s.id];
    if (!src || typeof src !== 'object') continue;
    for (const f of s.fields) {
      if (!(f.id in src)) continue;
      const val = src[f.id];
      if (f.type === 'checkbox' && typeof val === 'boolean') base[s.id][f.id] = val;
      else if (f.type === 'list' && Array.isArray(val)) base[s.id][f.id] = val.filter((x) => x && typeof x === 'object');
      else if ((f.type === 'text' || f.type === 'textarea') && typeof val === 'string') base[s.id][f.id] = val;
    }
  }
  return base;
}

/** Values built from a preset's placeholders + toggles ("Fill example"). */
export function exampleValuesFor(preset) {
  const values = defaultValues();
  values.meta.preset = preset.id;
  for (const s of SECTIONS) {
    for (const f of s.fields) {
      if (f.type === 'checkbox') values[s.id][f.id] = preset.toggles?.[s.id]?.[f.id] ?? f.default ?? false;
      else if (f.type === 'list') values[s.id][f.id] = [Object.fromEntries(f.itemFields.map((sub) => [sub.id, placeholderFor(preset, s.id, sub.id, sub.placeholder || '')]))];
      else values[s.id][f.id] = placeholderFor(preset, s.id, f.id, f.placeholder || '');
    }
  }
  return values;
}

/** One section's block ("## Heading\nbody"), or '' if it adds nothing. */
export function buildSection(sectionId, values) {
  const s = SECTIONS.find((x) => x.id === sectionId);
  if (!s) return '';
  const body = (s.build(values[s.id] || {}) || '').trim();
  return body ? `## ${s.heading}\n${body}` : '';
}

/** Where a section lands in the final prompt: {position, total} (1-based), or null if skipped. */
export function sectionPosition(sectionId, values) {
  const included = SECTIONS.filter((s) => buildSection(s.id, values)).map((s) => s.id);
  const i = included.indexOf(sectionId);
  return i < 0 ? null : { position: i + 1, total: included.length };
}

/** Build the final markdown prompt. Empty sections are skipped. */
export function buildPrompt(values) {
  return SECTIONS.map((s) => buildSection(s.id, values)).filter(Boolean).join('\n\n');
}

/** Clarity warnings for the Preview tab. */
export function runChecks(values) {
  const out = [];
  for (const s of SECTIONS) {
    const r = s.check ? s.check(values[s.id] || {}) : null;
    if (r) out.push({ section: s.label, sectionId: s.id, ...r });
  }
  return out;
}

/** True if user typed anything in a section (for tab dots). Ignores default checkboxes. */
export function sectionHasContent(sectionId, values) {
  const s = SECTIONS.find((x) => x.id === sectionId);
  if (!s) return false;
  const v = values[sectionId] || {};
  return s.fields.some((f) => {
    const val = v[f.id];
    if (f.type === 'checkbox') return val !== (f.default ?? false);
    if (f.type === 'list') return Array.isArray(val) && val.some((i) => Object.values(i).some((x) => typeof x === 'string' && x.trim()));
    return typeof val === 'string' && val.trim().length > 0;
  });
}

export function wordCount(text) {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}
