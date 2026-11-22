// ui.js — DOM rendering. Generic: renders whatever sections.js describes.
// No prompt logic here (that's builder.js), no storage here (storage.js).
//
// Layout rules (driven by field config, no per-tab code):
//   - consecutive checkbox fields -> one bordered toggle group (settings style)
//   - a field with showIf: '<checkboxId>' renders inside that toggle's group, under it
//   - consecutive fields with half: true -> side-by-side row (stacks on mobile)
//   - placeholders + suggestion chips come from the active preset (presets.js)

import { SECTIONS } from './sections.js';
import { icon } from './icons.js';
import { placeholderFor, suggestionsFor, groupedPresets, getPreset } from './presets.js';

export const PREVIEW_ID = 'preview';
export const RULES_ID = 'rules';
/** Tabs that aren't prompt sections (no fill status). */
export const EXTRA_TABS = [
  { id: PREVIEW_ID, label: 'Preview & Copy', icon: 'clipboard' },
  { id: RULES_ID, label: 'Rules', icon: 'book' },
];
const isExtra = (id) => EXTRA_TABS.some((t) => t.id === id);

/** Tiny element helper. Children can be strings or nodes. Text is never parsed as HTML. */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'value' || k === 'checked' || k === 'hidden') node[k] = v; // properties, not attributes (textarea ignores value attr)
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/** Button/label content: icon + text. */
export const withIcon = (name, text) => [icon(name, 16), el('span', {}, text)];

// ---------- Nav ----------
export function renderTabs(nav, onSelect) {
  const all = [...SECTIONS.map((s) => ({ id: s.id, label: s.label, icon: s.icon })), ...EXTRA_TABS];
  nav.replaceChildren(...all.map((t) => el('button', {
    class: 'tab', role: 'tab', type: 'button', id: `tab-${t.id}`,
    'aria-controls': `panel-${t.id}`, 'data-tab': t.id,
    onclick: () => onSelect(t.id),
  }, icon(t.icon || 'info'), el('span', { class: 'tab-label' }, t.label), el('span', { class: 'tab-status', 'aria-hidden': 'true' }, icon('check', 11)))));
}

export function setActiveTab(id) {
  document.querySelectorAll('.tab').forEach((b) => {
    const on = b.dataset.tab === id;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
    if (on && window.matchMedia('(max-width: 900px)').matches) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  });
  document.querySelectorAll('.panel').forEach((p) => { p.hidden = p.dataset.panel !== id; });
}

export function setTabDots(hasContentFn) {
  document.querySelectorAll('.tab').forEach((b) => {
    b.classList.toggle('filled', !isExtra(b.dataset.tab) && hasContentFn(b.dataset.tab));
  });
}

// ---------- Fields ----------
// ctx = { values, onChange(sectionId, fieldId, value), preset }

function textInput(field, value, onInput, id, placeholder) {
  if (field.type === 'textarea') {
    return el('textarea', { id, rows: field.rows || 3, placeholder, value: value ?? '', oninput: (e) => onInput(e.target.value) });
  }
  return el('input', { id, type: 'text', placeholder, value: value ?? '', oninput: (e) => onInput(e.target.value) });
}

/** Tap-to-fill chips. Text inputs: replace. Textareas: add as a new line. */
function chipRow(chips, input, onPick) {
  if (!chips.length) return null;
  return el('div', { class: 'chips', role: 'group', 'aria-label': 'Suggestions' },
    ...chips.map((c) => el('button', { type: 'button', class: 'chip', onclick: () => {
      let next = c;
      if (input.tagName === 'TEXTAREA' && input.value.trim()) {
        const lines = input.value.split('\n').map((l) => l.trim());
        next = lines.includes(c) ? input.value : `${input.value.replace(/\s+$/, '')}\n${c}`;
      }
      input.value = next;
      onPick(next);
      input.focus();
    } }, c)));
}

function textField(section, field, ctx) {
  const id = `f-${section.id}-${field.id}`;
  const onInput = (val) => ctx.onChange(section.id, field.id, val);
  const input = textInput(field, ctx.values[section.id][field.id], onInput, id, placeholderFor(ctx.preset, section.id, field.id, field.placeholder || ''));
  return el('div', { class: 'field', 'data-field': field.id },
    el('label', { class: 'field-label', for: id }, field.label),
    input,
    chipRow(suggestionsFor(ctx.preset, section.id, field.id), input, onInput));
}

function toggleRow(section, field, ctx) {
  const id = `f-${section.id}-${field.id}`;
  return el('div', { class: 'toggle-row', 'data-field': field.id },
    el('div', { class: 'toggle-text' },
      el('label', { class: 'toggle-label', for: id }, field.label),
      field.hint ? el('p', { class: 'toggle-hint' }, field.hint) : null),
    el('span', { class: 'switch' },
      el('input', { id, type: 'checkbox', role: 'switch', checked: !!ctx.values[section.id][field.id], onchange: (e) => ctx.onChange(section.id, field.id, e.target.checked) }),
      el('span', { class: 'slider' })));
}

function listField(section, field, ctx) {
  const { values, onChange } = ctx;
  const wrap = el('div', { class: 'field field-list', 'data-field': field.id });
  const prefix = `f-${section.id}-${field.id}`;
  const draw = (focusLast = false) => {
    const items = values[section.id][field.id];
    wrap.replaceChildren(
      items.length ? null : el('div', { class: 'empty-state' }, 'No examples yet. Add a short snippet of what good output looks like.'),
      ...items.map((item, idx) => el('div', { class: 'list-item' },
        el('div', { class: 'list-item-head' },
          el('div', { class: 'list-item-title' }, el('span', { class: 'badge-num' }, String(idx + 1)), `Example ${idx + 1}`),
          el('button', { type: 'button', class: 'btn btn-ghost btn-sm btn-icon btn-danger', title: 'Remove', 'aria-label': `Remove example ${idx + 1}`, onclick: () => {
            onChange(section.id, field.id, items.filter((_, i) => i !== idx));
            draw();
          } }, icon('trash', 16))),
        ...field.itemFields.map((sub) => {
          const id = `${prefix}-${idx}-${sub.id}`;
          return el('div', { class: 'field' },
            el('label', { class: 'field-label', for: id }, sub.label),
            textInput(sub, item[sub.id], (val) => {
              const next = values[section.id][field.id].map((it, i) => (i === idx ? { ...it, [sub.id]: val } : it));
              onChange(section.id, field.id, next);
            }, id, placeholderFor(ctx.preset, section.id, sub.id, sub.placeholder || '')));
        }))),
      el('button', { type: 'button', class: 'btn btn-dashed', onclick: () => {
        const blank = Object.fromEntries(field.itemFields.map((s) => [s.id, '']));
        onChange(section.id, field.id, [...values[section.id][field.id], blank]);
        draw(true);
      } }, ...withIcon('plus', (field.addLabel || 'Add').replace(/^\+\s*/, ''))),
    );
    if (focusLast) {
      const all = wrap.querySelectorAll('.list-item');
      all[all.length - 1]?.querySelector('input,textarea')?.focus();
    }
  };
  draw();
  return wrap;
}

/** Group fields into rows / toggle groups per the layout rules at the top of this file. */
function layoutFields(section, ctx) {
  const out = [];
  let group = null;
  let row = null;
  for (const f of section.fields) {
    if (f.type === 'checkbox') {
      row = null;
      if (!group) { group = el('div', { class: 'toggle-group' }); out.push(group); }
      group.append(toggleRow(section, f, ctx));
      continue;
    }
    if (f.showIf && group) {
      group.append(el('div', { class: 'toggle-sub', 'data-show-if': f.showIf }, textField(section, f, ctx)));
      continue;
    }
    group = null;
    if (f.type === 'list') { row = null; out.push(listField(section, f, ctx)); continue; }
    const node = textField(section, f, ctx);
    if (f.half) {
      if (!row) { row = el('div', { class: 'field-row' }); out.push(row); }
      row.append(node);
      if (row.children.length === 2) row = null;
    } else {
      row = null;
      if (f.showIf) node.dataset.showIf = f.showIf;
      out.push(node);
    }
  }
  return out;
}

/** Hide fields whose showIf checkbox is off. */
export function applyShowIf(panel, sectionValues) {
  panel.querySelectorAll('[data-show-if]').forEach((n) => { n.hidden = !sectionValues[n.dataset.showIf]; });
}

// ---------- Prompt text rendering (safe: text nodes only) ----------
/** Render markdown-ish prompt text into `pre` with light syntax colouring. Copy still uses the raw string. */
export function renderPromptText(pre, text) {
  const lines = text.split('\n');
  pre.replaceChildren(...lines.flatMap((line, i) => {
    let cls = null;
    if (line.startsWith('### ')) cls = 'md-h3';
    else if (line.startsWith('## ')) cls = 'md-h2';
    else if (line.startsWith('> ')) cls = 'md-quote';
    else if (/^\s*(- |\d+\. )/.test(line)) cls = 'md-li';
    const node = cls ? el('span', { class: cls }, line) : document.createTextNode(line);
    return i < lines.length - 1 ? [node, document.createTextNode('\n')] : [node];
  }));
}

// ---------- Section panel ----------
export function renderSectionPanel(section, index, ctx, onNav) {
  const panel = el('section', { class: 'panel', role: 'tabpanel', id: `panel-${section.id}`, 'data-panel': section.id, 'aria-labelledby': `tab-${section.id}`, hidden: true });
  const inner = {
    ...ctx,
    onChange: (sid, fid, val) => {
      ctx.onChange(sid, fid, val);
      if (typeof val === 'boolean') applyShowIf(panel, ctx.values[sid]);
    },
  };
  panel.append(
    el('div', { class: 'page-head' },
      el('h1', {}, section.label),
      section.subtitle ? el('p', { class: 'muted' }, section.subtitle) : null),
    el('div', { class: 'card' },
      el('div', { class: 'alert alert-tip' }, icon('bulb'), el('div', { class: 'alert-body' }, section.tip)),
      ...layoutFields(section, inner)),
    el('div', { class: 'card section-preview' },
      el('div', { class: 'card-head' },
        el('div', {},
          el('h2', { class: 'card-title' }, 'Section preview'),
          el('p', { class: 'muted small', id: `pv-note-${section.id}` })),
        el('span', { class: 'pill', id: `pv-pill-${section.id}` })),
      el('pre', { class: 'output output-sm', id: `pv-${section.id}`, tabindex: '0', 'aria-live': 'polite' })),
    el('div', { class: 'panel-nav' },
      index > 0 ? el('button', { type: 'button', class: 'btn btn-ghost', onclick: () => onNav(-1) }, ...withIcon('arrowLeft', 'Back')) : el('span'),
      el('button', { type: 'button', class: 'btn btn-primary', onclick: () => onNav(1) }, el('span', {}, 'Next'), icon('arrowRight', 16))),
  );
  applyShowIf(panel, ctx.values[section.id]);
  return panel;
}

/** Update one tab's preview card. pos = {position,total} or null (skipped). */
export function updateSectionPreview(sectionId, text, pos) {
  const pre = document.getElementById(`pv-${sectionId}`);
  if (!pre) return;
  const pill = document.getElementById(`pv-pill-${sectionId}`);
  const note = document.getElementById(`pv-note-${sectionId}`);
  if (text) {
    renderPromptText(pre, text);
    pre.classList.remove('empty');
    pill.className = 'pill pill-ok';
    pill.textContent = 'Included';
    note.textContent = `Exactly what this tab adds. Part ${pos.position} of ${pos.total} in your prompt.`;
  } else {
    pre.textContent = 'Nothing yet. This section is left out of your prompt until you fill something in.';
    pre.classList.add('empty');
    pill.className = 'pill pill-empty';
    pill.textContent = 'Skipped';
    note.textContent = 'Exactly what this tab adds to your prompt.';
  }
}

// ---------- Preset picker ----------
export function renderPresetBar(host, { presetId, onPick, onFill }) {
  const id = 'preset-select';
  const select = el('select', { id, class: 'select', onchange: (e) => onPick(e.target.value) },
    ...groupedPresets().map(([group, list]) => el('optgroup', { label: group },
      ...list.map((p) => el('option', { value: p.id }, p.label)))));
  select.value = presetId;
  const desc = el('p', { class: 'muted small preset-desc', id: 'preset-desc' }, getPreset(presetId).description);
  host.replaceChildren(
    el('div', { class: 'preset-text' },
      el('label', { class: 'field-label', for: id }, 'What are you making?'),
      desc),
    el('div', { class: 'preset-controls' },
      el('div', { class: 'select-wrap' }, select, icon('chevron', 16)),
      el('button', { type: 'button', class: 'btn btn-secondary', id: 'fill-example', onclick: onFill }, ...withIcon('sparkles', 'Fill example'))));
}

// ---------- Rules page ----------
/** Render the Rules page (data: rules.js). onGo(tabId) jumps to a tab; onCopy(text) copies a "Try" line. */
export function renderRulesPanel(host, { rules, checklist, source, onGo, onCopy }) {
  const tabLabel = (id) => SECTIONS.find((s) => s.id === id)?.label || id;
  const goLink = (id) => el('button', { type: 'button', class: 'link', onclick: () => onGo(id) }, `Go to ${tabLabel(id)} →`);
  host.replaceChildren(
    el('div', { class: 'page-head' },
      el('h1', {}, 'Prompting rules'),
      el('p', { class: 'muted' }, 'The rules from the video this builder is based on. Each tab follows one of them.')),
    el('div', { class: 'card' },
      el('h2', { class: 'card-title' }, 'Quick checklist'),
      el('ol', { class: 'checklist' }, ...checklist.map((c) => el('li', {}, el('span', {}, c.text), goLink(c.tab))))),
    ...rules.map((r, i) => el('article', { class: 'card rule', id: `rule-${r.id}` },
      el('div', { class: 'card-head' },
        el('div', { class: 'rule-title' }, el('span', { class: 'badge-num' }, String(i + 1)), el('h2', { class: 'card-title' }, r.title)),
        r.tab ? goLink(r.tab) : null),
      el('p', { class: 'rule-summary' }, r.summary),
      ...r.quotes.map((q) => el('blockquote', { class: 'rule-quote' },
        el('p', {}, `“${q.text}”`),
        el('cite', {}, `— ${q.by || source.by}`))),
      r.tryLine ? el('div', { class: 'try' },
        el('span', { class: 'try-label' }, 'Try'),
        el('code', {}, r.tryLine),
        el('button', { type: 'button', class: 'btn btn-ghost btn-sm btn-icon', title: 'Copy', 'aria-label': `Copy example for ${r.title}`, onclick: () => onCopy(r.tryLine) }, icon('copy', 15))) : null)),
    el('p', { class: 'muted small' }, 'Source: ',
      el('a', { href: source.url, target: '_blank', rel: 'noopener' }, source.title), `, ${source.by}. Quotes are short excerpts from the auto-captions.`),
  );
}

// ---------- Alerts ----------
export function alertBox(level, title, body, action) {
  return el('div', { class: `alert alert-${level}` },
    icon(level === 'warn' ? 'warn' : 'info'),
    el('div', {}, el('div', { class: 'alert-title' }, title), el('div', { class: 'alert-body' }, body)),
    action || null);
}

// ---------- Toast ----------
let toastTimer;
export function toast(msg, kind = 'ok') {
  const t = document.getElementById('toast');
  t.replaceChildren(icon(kind === 'error' ? 'warn' : 'check', 16), el('span', {}, msg));
  t.dataset.kind = kind;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
