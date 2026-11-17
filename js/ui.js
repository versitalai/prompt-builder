// ui.js — DOM rendering. Generic: renders whatever sections.js describes.
// No prompt logic here (that's builder.js), no storage here (storage.js).

import { SECTIONS } from './sections.js';

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

// ---------- Tabs ----------
export function renderTabs(nav, onSelect) {
  nav.replaceChildren();
  const all = [...SECTIONS.map((s) => ({ id: s.id, label: s.label })), { id: PREVIEW_ID, label: 'Preview & Copy' }];
  all.forEach((t, i) => {
    nav.append(el('button', {
      class: 'tab', role: 'tab', type: 'button', id: `tab-${t.id}`,
      'aria-controls': `panel-${t.id}`, 'data-tab': t.id,
      onclick: () => onSelect(t.id),
    }, el('span', { class: 'tab-num' }, String(i + 1)), t.label, el('span', { class: 'dot', 'aria-hidden': 'true' })));
  });
}

export function setActiveTab(id) {
  document.querySelectorAll('.tab').forEach((b) => {
    const on = b.dataset.tab === id;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
    if (on) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  });
  document.querySelectorAll('.panel').forEach((p) => { p.hidden = p.dataset.panel !== id; });
}

export function setTabDots(hasContentFn) {
  document.querySelectorAll('.tab').forEach((b) => {
    b.classList.toggle('filled', b.dataset.tab !== PREVIEW_ID && hasContentFn(b.dataset.tab));
  });
}

// ---------- Fields ----------
function inputFor(field, value, onInput, idPrefix) {
  const id = `${idPrefix}-${field.id}`;
  if (field.type === 'textarea') {
    return { id, node: el('textarea', { id, rows: field.rows || 3, placeholder: field.placeholder || '', value: value ?? '', oninput: (e) => onInput(e.target.value) }) };
  }
  return { id, node: el('input', { id, type: 'text', placeholder: field.placeholder || '', value: value ?? '', oninput: (e) => onInput(e.target.value) }) };
}

function renderField(section, field, values, onChange) {
  const v = values[section.id][field.id];
  const prefix = `f-${section.id}`;

  if (field.type === 'checkbox') {
    const id = `${prefix}-${field.id}`;
    return el('div', { class: 'field field-check', 'data-field': field.id },
      el('label', { for: id },
        el('input', { id, type: 'checkbox', checked: !!v, onchange: (e) => onChange(section.id, field.id, e.target.checked) }),
        el('span', {}, field.label)));
  }

  if (field.type === 'list') {
    const wrap = el('div', { class: 'field field-list', 'data-field': field.id });
    const draw = () => {
      const items = values[section.id][field.id];
      wrap.replaceChildren(
        ...items.map((item, idx) => el('div', { class: 'list-item' },
          el('div', { class: 'list-item-head' },
            el('strong', {}, `Example ${idx + 1}`),
            el('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'aria-label': `Remove example ${idx + 1}`, onclick: () => {
              const next = items.filter((_, i) => i !== idx);
              onChange(section.id, field.id, next);
              draw();
            } }, 'Remove')),
          ...field.itemFields.map((sub) => {
            const { id, node } = inputFor(sub, item[sub.id], (val) => {
              const next = values[section.id][field.id].map((it, i) => (i === idx ? { ...it, [sub.id]: val } : it));
              onChange(section.id, field.id, next);
            }, `${prefix}-${field.id}-${idx}`);
            return el('div', { class: 'field' }, el('label', { for: id }, sub.label), node);
          }))),
        el('button', { type: 'button', class: 'btn btn-secondary', onclick: () => {
          const blank = Object.fromEntries(field.itemFields.map((s) => [s.id, '']));
          onChange(section.id, field.id, [...values[section.id][field.id], blank]);
          draw();
          const last = wrap.querySelectorAll('.list-item');
          last[last.length - 1]?.querySelector('input,textarea')?.focus();
        } }, field.addLabel || '+ Add'),
      );
    };
    draw();
    return wrap;
  }

  const { id, node } = inputFor(field, v, (val) => onChange(section.id, field.id, val), prefix);
  return el('div', { class: 'field', 'data-field': field.id, 'data-show-if': field.showIf || null },
    el('label', { for: id }, field.label), node);
}

/** Hide fields whose showIf checkbox is off. */
export function applyShowIf(panel, sectionValues) {
  panel.querySelectorAll('[data-show-if]').forEach((n) => { n.hidden = !sectionValues[n.dataset.showIf]; });
}

export function renderSectionPanel(section, index, values, onChange, onNav) {
  const panel = el('section', { class: 'panel', role: 'tabpanel', id: `panel-${section.id}`, 'data-panel': section.id, 'aria-labelledby': `tab-${section.id}`, hidden: true },
    el('h2', {}, section.label),
    el('p', { class: 'tip' }, el('span', { class: 'tip-icon', 'aria-hidden': 'true' }, '💡'), section.tip),
    ...section.fields.map((f) => renderField(section, f, values, (sid, fid, val) => {
      onChange(sid, fid, val);
      if (f.type === 'checkbox') applyShowIf(panel, values[sid]);
    })),
    el('div', { class: 'panel-nav' },
      index > 0 ? el('button', { type: 'button', class: 'btn btn-ghost', onclick: () => onNav(-1) }, '← Back') : el('span'),
      el('button', { type: 'button', class: 'btn btn-primary', onclick: () => onNav(1) }, 'Next →')),
  );
  applyShowIf(panel, values[section.id]);
  return panel;
}

// ---------- Toast ----------
let toastTimer;
export function toast(msg, kind = 'ok') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.dataset.kind = kind;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
