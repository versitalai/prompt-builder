// ui.js — DOM rendering. Generic: renders whatever sections.js describes.
// No prompt logic here (that's builder.js), no storage here (storage.js).
//
// Layout rules (driven by field config, no per-tab code):
//   - consecutive checkbox fields -> one bordered toggle group (settings style)
//   - a field with showIf: '<checkboxId>' renders inside that toggle's group, under it
//   - consecutive fields with half: true -> side-by-side row (stacks on mobile)

import { SECTIONS } from './sections.js';
import { icon } from './icons.js';

export const PREVIEW_ID = 'preview';

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
  const all = [...SECTIONS.map((s) => ({ id: s.id, label: s.label, icon: s.icon })), { id: PREVIEW_ID, label: 'Preview & Copy', icon: 'clipboard' }];
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
    b.classList.toggle('filled', b.dataset.tab !== PREVIEW_ID && hasContentFn(b.dataset.tab));
  });
}

// ---------- Fields ----------
function textInput(field, value, onInput, id) {
  if (field.type === 'textarea') {
    return el('textarea', { id, rows: field.rows || 3, placeholder: field.placeholder || '', value: value ?? '', oninput: (e) => onInput(e.target.value) });
  }
  return el('input', { id, type: 'text', placeholder: field.placeholder || '', value: value ?? '', oninput: (e) => onInput(e.target.value) });
}

function textField(section, field, values, onChange) {
  const id = `f-${section.id}-${field.id}`;
  return el('div', { class: 'field', 'data-field': field.id },
    el('label', { class: 'field-label', for: id }, field.label),
    textInput(field, values[section.id][field.id], (val) => onChange(section.id, field.id, val), id));
}

function toggleRow(section, field, values, onChange) {
  const id = `f-${section.id}-${field.id}`;
  return el('div', { class: 'toggle-row', 'data-field': field.id },
    el('div', { class: 'toggle-text' },
      el('label', { class: 'toggle-label', for: id }, field.label),
      field.hint ? el('p', { class: 'toggle-hint' }, field.hint) : null),
    el('span', { class: 'switch' },
      el('input', { id, type: 'checkbox', role: 'switch', checked: !!values[section.id][field.id], onchange: (e) => onChange(section.id, field.id, e.target.checked) }),
      el('span', { class: 'slider' })));
}

function listField(section, field, values, onChange) {
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
            }, id));
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
function layoutFields(section, values, onChange) {
  const out = [];
  let group = null;
  let row = null;
  for (const f of section.fields) {
    if (f.type === 'checkbox') {
      row = null;
      if (!group) { group = el('div', { class: 'toggle-group' }); out.push(group); }
      group.append(toggleRow(section, f, values, onChange));
      continue;
    }
    if (f.showIf && group) {
      const sub = el('div', { class: 'toggle-sub', 'data-show-if': f.showIf }, textField(section, f, values, onChange));
      group.append(sub);
      continue;
    }
    group = null;
    if (f.type === 'list') { row = null; out.push(listField(section, f, values, onChange)); continue; }
    const node = textField(section, f, values, onChange);
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

export function renderSectionPanel(section, index, values, onChange, onNav) {
  const panel = el('section', { class: 'panel', role: 'tabpanel', id: `panel-${section.id}`, 'data-panel': section.id, 'aria-labelledby': `tab-${section.id}`, hidden: true });
  const wrapped = (sid, fid, val) => {
    onChange(sid, fid, val);
    if (typeof val === 'boolean') applyShowIf(panel, values[sid]);
  };
  panel.append(
    el('div', { class: 'page-head' },
      el('h1', {}, section.label),
      section.subtitle ? el('p', { class: 'muted' }, section.subtitle) : null),
    el('div', { class: 'card' },
      el('div', { class: 'alert alert-tip' }, icon('bulb'), el('div', { class: 'alert-body' }, section.tip)),
      ...layoutFields(section, values, wrapped)),
    el('div', { class: 'panel-nav' },
      index > 0 ? el('button', { type: 'button', class: 'btn btn-ghost', onclick: () => onNav(-1) }, ...withIcon('arrowLeft', 'Back')) : el('span'),
      el('button', { type: 'button', class: 'btn btn-primary', onclick: () => onNav(1) }, el('span', {}, 'Next'), icon('arrowRight', 16))),
  );
  applyShowIf(panel, values[section.id]);
  return panel;
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
