// main.js — wiring. Holds app state and connects ui <-> builder <-> storage.

import { SECTIONS } from './sections.js';
import { buildPrompt, buildSection, sectionPosition, exampleValuesFor, runChecks, sectionHasContent, wordCount, defaultValues } from './builder.js';
import { getPreset } from './presets.js';
import * as store from './storage.js';
import { icon } from './icons.js';
import { el, withIcon, renderTabs, setActiveTab, setTabDots, renderSectionPanel, updateSectionPreview, renderPromptText, renderPresetBar, alertBox, toast, PREVIEW_ID } from './ui.js';

const TAB_ORDER = [...SECTIONS.map((s) => s.id), PREVIEW_ID];
const COPY_BUTTONS = ['copy-btn', 'top-copy', 'side-copy', 'mb-copy'];
let values = store.loadDraft();
let active = SECTIONS[0].id;

const $ = (id) => document.getElementById(id);
const hasContent = (id) => sectionHasContent(id, values);

// ---------- Static chrome (icons on fixed buttons) ----------
function decorate() {
  $('brand-mark').append(icon('logo', 18));
  $('tip-card-icon').append(icon('bulb', 16));
  COPY_BUTTONS.forEach((id) => $(id).append(...withIcon('copy', id === 'copy-btn' || id === 'side-copy' ? 'Copy prompt' : 'Copy')));
  $('export-btn').append(...withIcon('download', 'Export JSON'));
  $('import-label').prepend(...withIcon('upload', 'Import JSON'));
  $('clear-btn').append(...withIcon('trash', 'Clear all tabs'));
  $('back-btn').append(...withIcon('arrowLeft', 'Back'));
}

// ---------- Render ----------
const preset = () => getPreset(values.meta?.preset);

function renderSections() {
  const ctx = { values, onChange: onFieldChange, preset: preset() };
  $('section-panels').replaceChildren(...SECTIONS.map((s, i) => renderSectionPanel(s, i, ctx, go)));
  setActiveTab(active); // keep the current tab visible after a re-render
  refreshSectionPreviews();
}

function refreshSectionPreviews() {
  for (const s of SECTIONS) updateSectionPreview(s.id, buildSection(s.id, values), sectionPosition(s.id, values));
}

// ---------- Presets ----------
function drawPresetBar() {
  renderPresetBar($('preset-bar'), { presetId: preset().id, onPick: pickPreset, onFill: fillExample });
}

function pickPreset(id) {
  values.meta.preset = id;
  store.saveDraft(values);
  renderSections();
  $('preset-desc').textContent = preset().description;
  toast(`Preset: ${preset().label}. Placeholders and suggestions updated.`);
}

function fillExample() {
  if (!confirmReplace()) return;
  replaceAll(exampleValuesFor(preset()));
  toast(`Filled with the ${preset().label} example. Edit anything.`);
}

function go(dir) {
  const i = TAB_ORDER.indexOf(active);
  select(TAB_ORDER[Math.max(0, Math.min(TAB_ORDER.length - 1, i + dir))]);
}

function select(id) {
  active = id;
  setActiveTab(id);
  $('crumb').textContent = id === PREVIEW_ID ? 'Preview & Copy' : SECTIONS.find((s) => s.id === id).label;
  if (id === PREVIEW_ID) refreshPreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Summary panel, mobile bar, copy buttons, tab dots. Cheap: runs on every keystroke. */
function refreshSummary() {
  const prompt = buildPrompt(values);
  const words = wordCount(prompt);
  const filled = SECTIONS.filter((s) => hasContent(s.id)).length;
  const warnIds = new Set(runChecks(values).filter((c) => c.level === 'warn').map((c) => c.sectionId));

  $('stat-words').textContent = words;
  $('mb-words').textContent = words;
  $('stat-sections').textContent = `${filled}/${SECTIONS.length}`;
  COPY_BUTTONS.forEach((id) => { $(id).disabled = !prompt; });

  $('summary-list').replaceChildren(...SECTIONS.map((s) => {
    const done = hasContent(s.id);
    const pill = done
      ? el('span', { class: 'pill pill-ok' }, 'Filled')
      : warnIds.has(s.id) ? el('span', { class: 'pill pill-warn' }, 'Needed') : el('span', { class: 'pill pill-empty' }, 'Empty');
    return el('li', {}, el('button', { type: 'button', class: 'summary-item', onclick: () => select(s.id) },
      icon(s.icon, 16), el('span', { class: 'lbl' }, s.label), pill));
  }));
  setTabDots(hasContent);
  refreshSectionPreviews();
}

function refreshPreview() {
  const prompt = buildPrompt(values);
  const out = $('output');
  if (prompt) renderPromptText(out, prompt);
  else out.textContent = 'Nothing here yet. Fill in a few tabs, or pick a preset and tap "Fill example".';
  out.classList.toggle('empty', !prompt);
  $('counts').textContent = `${wordCount(prompt)} words · ${prompt.length} characters`;

  const checks = runChecks(values);
  $('checks').replaceChildren(...checks.map((c) => alertBox(c.level, c.section, c.text,
    el('button', { type: 'button', class: 'link', onclick: () => select(c.sectionId) }, `Go to ${c.section} →`))));
  $('checks-wrap').hidden = checks.length === 0;
}

function renderLibrary(lib = store.loadLibrary()) {
  const body = $('library-list');
  if (!lib.length) {
    body.replaceChildren(el('tr', { class: 'empty-row' }, el('td', { colspan: '3' }, 'No saved prompts yet.')));
    return;
  }
  body.replaceChildren(...lib.map((e) => el('tr', { class: 'lib-item' },
    el('td', { class: 'lib-name' }, e.name),
    el('td', { class: 'muted' }, new Date(e.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })),
    el('td', { class: 't-right' },
      el('button', { type: 'button', class: 'btn btn-secondary btn-sm', onclick: () => loadEntry(e) }, 'Load'),
      el('button', { type: 'button', class: 'btn btn-ghost btn-sm btn-icon btn-danger', title: 'Delete', 'aria-label': `Delete ${e.name}`, onclick: () => deleteEntry(e) }, icon('trash', 15))))));
}

// ---------- State changes ----------
let saveTimer;
function onFieldChange(sectionId, fieldId, value) {
  values[sectionId][fieldId] = value;
  clearTimeout(saveTimer);
  $('autosave').textContent = 'Saving…';
  saveTimer = setTimeout(() => {
    const ok = store.saveDraft(values);
    $('autosave').textContent = ok ? 'All changes saved' : 'Autosave unavailable in this browser';
  }, 400);
  refreshSummary();
}

function replaceAll(next) {
  values = next;
  store.saveDraft(values);
  drawPresetBar();
  renderSections();
  refreshSummary();
  select(active);
}

function loadEntry(e) {
  if (!confirmReplace()) return;
  replaceAll(structuredClone(e.values));
  $('save-name').value = e.name;
  toast(`Loaded "${e.name}"`);
}

function deleteEntry(e) {
  if (!window.confirm(`Delete "${e.name}" from your library?`)) return;
  renderLibrary(store.deleteFromLibrary(e.id));
  toast('Deleted');
}

function confirmReplace() {
  const dirty = SECTIONS.some((s) => hasContent(s.id));
  return !dirty || window.confirm('Replace what you have now? (Save it to your library first if you want to keep it.)');
}

// ---------- Actions ----------
async function copyPrompt() {
  const text = buildPrompt(values);
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for browsers/contexts without the async clipboard API.
    const ta = el('textarea', { value: text });
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (!ok) return toast('Copy failed. Select the text and copy manually.', 'error');
  }
  toast('Copied! Paste it into your AI.');
}

function savePrompt(ev) {
  ev.preventDefault();
  const name = $('save-name').value.trim();
  if (!name) return toast('Give it a name first', 'error');
  const { ok, library } = store.saveToLibrary(name, values);
  renderLibrary(library);
  toast(ok ? `Saved "${name}"` : 'Could not save (browser storage blocked or full)', ok ? 'ok' : 'error');
}

function exportJson() {
  const blob = new Blob([store.exportData(values)], { type: 'application/json' });
  const a = el('a', { href: URL.createObjectURL(blob), download: `prompt-builder-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  toast('Exported');
}

async function importJson(ev) {
  const file = ev.target.files?.[0];
  ev.target.value = '';
  if (!file) return;
  try {
    const res = store.importData(await file.text());
    renderLibrary(res.library);
    if (res.draft && window.confirm('This file also has a draft. Load it into the editor?')) replaceAll(res.draft);
    toast(`Imported ${res.total} prompt(s), ${res.added} new`);
  } catch (err) {
    toast(`Import failed: ${err.message}`, 'error');
  }
}

function clearAll() {
  if (!window.confirm('Clear every tab? Your saved library is not affected.')) return;
  const fresh = defaultValues();
  fresh.meta.preset = preset().id; // clearing keeps your chosen preset
  replaceAll(fresh);
  $('save-name').value = '';
  select(SECTIONS[0].id);
  toast('Cleared');
}

// ---------- Boot ----------
decorate();
renderTabs($('tabs'), select);
drawPresetBar();
renderSections();
refreshSummary();
renderLibrary();
select(active);

COPY_BUTTONS.forEach((id) => $(id).addEventListener('click', copyPrompt));
$('side-preview').addEventListener('click', () => select(PREVIEW_ID));
$('save-form').addEventListener('submit', savePrompt);
$('export-btn').addEventListener('click', exportJson);
$('import-input').addEventListener('change', importJson);
$('clear-btn').addEventListener('click', clearAll);
$('back-btn').addEventListener('click', () => go(-1));
