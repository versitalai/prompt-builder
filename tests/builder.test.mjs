// Run: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt, defaultValues, normalizeValues, runChecks, sectionHasContent, wordCount } from '../js/builder.js';

test('empty draft builds only the default "I don\'t know" line', () => {
  const p = buildPrompt(defaultValues());
  assert.match(p, /^## Context\n/);
  assert.match(p, /I don't know/);
  assert.doesNotMatch(p, /## Role/);
});

test('full prompt has sections in order', () => {
  const v = defaultValues();
  v.persona.role = 'a senior SRE at Cloudflare';
  v.persona.audience = 'customers and engineers';
  v.task.task = 'Write an apology email.';
  v.context.facts = 'Config file doubled in size.';
  v.context.constraints = 'No blame\n\nNo dates';
  v.format.length = 'under 200 words';
  v.format.structure = 'Subject\nTimeline';
  v.examples.items = [{ label: 'Tone', content: 'We let you down.\nI own that.' }, { label: 'empty', content: '  ' }];
  v.advanced.cot = true;
  v.advanced.battle = true;
  const p = buildPrompt(v);
  const order = ['## Role', '## Task', '## Context', '## Output format', '## Examples', '## Approach'].map((h) => p.indexOf(h));
  assert.ok(order.every((x, i) => x >= 0 && (i === 0 || x > order[i - 1])), `bad order: ${order}`);
  assert.match(p, /You are a senior SRE at Cloudflare\. Your audience is customers and engineers\./);
  assert.match(p, /- No blame\n- No dates/);
  assert.match(p, /  - Subject\n  - Timeline/);
  assert.match(p, /### Example 1: Tone\n> We let you down\.\n> I own that\./);
  assert.doesNotMatch(p, /Example 2/);
  assert.match(p, /Round 1: Engineer and PR crisis manager/);
  assert.match(p, /Round 2: Angry customer/);
});

test('custom battle personas: last is critic', () => {
  const v = defaultValues();
  v.advanced.battle = true;
  v.advanced.battlePersonas = 'Scripter\nBuilder\nPlayer';
  const p = buildPrompt(v);
  assert.match(p, /Round 1: Scripter and Builder/);
  assert.match(p, /Round 2: Player/);
});

test('sentence() does not double punctuation', () => {
  const v = defaultValues();
  v.persona.role = 'a teacher.';
  assert.match(buildPrompt(v), /You are a teacher\.(?!\.)/);
});

test('normalizeValues drops junk and keeps valid values', () => {
  const n = normalizeValues({ task: { task: 'x', bogus: 1 }, context: { allowUnknown: 'yes' }, examples: { items: [null, { content: 'a' }] }, nope: {} });
  assert.equal(n.task.task, 'x');
  assert.equal(n.task.bogus, undefined);
  assert.equal(n.context.allowUnknown, true); // invalid type -> default kept
  assert.deepEqual(n.examples.items, [{ content: 'a' }]);
  assert.equal(n.nope, undefined);
  assert.deepEqual(normalizeValues(null), defaultValues());
});

test('checks and content dots', () => {
  const v = defaultValues();
  assert.ok(runChecks(v).some((c) => c.sectionId === 'task' && c.level === 'warn'));
  assert.equal(sectionHasContent('context', v), false); // default checkbox isn't "content"
  v.context.allowUnknown = false;
  assert.equal(sectionHasContent('context', v), true);
  v.task.task = 'go';
  assert.ok(!runChecks(v).some((c) => c.sectionId === 'task'));
});

test('wordCount', () => {
  assert.equal(wordCount(''), 0);
  assert.equal(wordCount(' a  b\nc '), 3);
});

import { buildSection, sectionPosition } from '../js/builder.js';

test('buildSection matches its block in buildPrompt; position counts only included sections', () => {
  const v = defaultValues();
  v.persona.role = 'a tutor';
  v.format.tone = 'friendly';
  const full = buildPrompt(v);
  for (const id of ['persona', 'context', 'format']) assert.ok(full.includes(buildSection(id, v)));
  assert.equal(buildSection('task', v), '');
  assert.equal(sectionPosition('task', v), null);
  assert.deepEqual(sectionPosition('persona', v), { position: 1, total: 3 }); // persona, context(default "I don't know"), format
  assert.deepEqual(sectionPosition('format', v), { position: 3, total: 3 });
  assert.equal(buildSection('nope', v), '');
});

import { exampleValuesFor } from '../js/builder.js';
import { PRESETS, getPreset, suggestionsFor, placeholderFor } from '../js/presets.js';
import { SECTIONS } from '../js/sections.js';

test('presets: unique ids, valid keys, every example builds a full prompt', () => {
  const ids = PRESETS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  const validKeys = new Set();
  for (const s of SECTIONS) for (const f of s.fields) {
    validKeys.add(`${s.id}.${f.id}`);
    for (const sub of f.itemFields || []) validKeys.add(`${s.id}.${sub.id}`);
  }
  for (const p of PRESETS) {
    for (const k of Object.keys(p.placeholders || {})) assert.ok(validKeys.has(k), `${p.id}: bad placeholder key ${k}`);
    for (const k of Object.keys(p.suggestions || {})) assert.ok(validKeys.has(k), `${p.id}: bad suggestion key ${k}`);
    for (const [sid, t] of Object.entries(p.toggles || {})) for (const fid of Object.keys(t)) assert.ok(validKeys.has(`${sid}.${fid}`), `${p.id}: bad toggle ${sid}.${fid}`);
    const v = exampleValuesFor(p);
    const out = buildPrompt(v);
    for (const h of ['## Role', '## Task', '## Context', '## Output format', '## Examples']) assert.ok(out.includes(h), `${p.id} missing ${h}`);
    assert.equal(v.meta.preset, p.id);
  }
});

test('preset helpers fall back correctly; meta survives normalize', () => {
  const g = getPreset('nope');
  assert.equal(g.id, 'general');
  assert.equal(placeholderFor(getPreset('email'), 'task', 'task').includes('apology'), true);
  assert.equal(placeholderFor(g, 'task', 'task', 'fallback'), 'fallback');
  assert.ok(suggestionsFor(g, 'format', 'tone').length > 0);          // default chips
  assert.ok(suggestionsFor(getPreset('roblox'), 'format', 'outputType').some((x) => x.includes('Luau')));
  assert.deepEqual(suggestionsFor(g, 'task', 'task'), []);
  assert.equal(normalizeValues({ meta: { preset: 'roblox' } }).meta.preset, 'roblox');
  assert.equal(normalizeValues({ meta: { preset: 'hacker' } }).meta.preset, 'general');
  assert.ok(!buildPrompt(defaultValues()).includes('meta'));
});
