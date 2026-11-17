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
