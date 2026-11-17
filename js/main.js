// main.js — wiring. Holds app state and connects ui <-> builder <-> storage.

import { SECTIONS } from './sections.js';
import { buildPrompt, runChecks, sectionHasContent, wordCount, defaultValues } from './builder.js';
import * as store from './storage.js';
import { el, renderTabs, setActiveTab, setTabDots, renderSectionPanel, toast, PREVIEW_ID } from './ui.js';

const TAB_ORDER = [...SECTIONS.map((s) => s.id), PREVIEW_ID];
let values = store.loadDraft();
let active = SECTIONS[0].id;

const $ = (id) => document.getElementById(id);

// ---------- Render ----------
function renderSections() {
  const host = $('section-panels');
  host.replaceChildren(...SECTIONS.map((s, i) => renderSectionPanel(s, i, values, onFieldChange, (dir) => go(dir))));
}

function go(dir) {
  const i = TAB_ORDER.indexOf(active);
  select(TAB_ORDER[Math.max(0, Math.min(TAB_ORDER.length - 1, i + dir))]);
}

function select(id) {
  active = id;
  setActiveTab(id);
  if (id === PREVIEW_ID) refreshPreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function refreshPreview() {
  const prompt = buildPrompt(values);
  $('output').textContent = prompt || '(Empty. Fill in some tabs first.)';
  $('output').classList.toggle('empty', !prompt);
  $('counts').textContent = `${wordCount(prompt)} words · ${prompt.length} characters`;
  $('copy-btn').disabled = !prompt;

  const checks = runChecks(values);
  const list = $('checks');
  list.replaceChildren(...checks.map((c) => el('li', { class: `check check-${c.level}` },
    el('button', { type: 'button', class: 'link', onclick: () => select(c.sectionId) }, c.section), ` — ${c.text}`)));
  $('checks-wrap').hidden = checks.length === 0;
}

function renderLibrary(lib = store.loadLibrary()) {
  const list = $('library-list');
  if (!lib.length) {
    list.replaceChildren(el('li', { class: 'muted' }, 'No saved prompts yet.'));
    return;
  }
  list.replaceChildren(...lib.map((e) => el('li', { class: 'lib-item' },
    el('div', {},
      el('strong', {}, e.name),
      el('div', { class: 'muted small' }, new Date(e.savedAt).toLocaleString())),
    el('div', { class: 'lib-actions' },
      el('button', { type: 'button', class: 'btn btn-secondary btn-sm', onclick: () => loadEntry(e) }, 'Load'),
      el('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => deleteEntry(e) }, 'Delete')))));
}

// ---------- State changes ----------
let saveTimer;
function onFieldChange(sectionId, fieldId, value) {
  values[sectionId][fieldId] = value;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const ok = store.saveDraft(values);
    $('autosave').textContent = ok ? 'Autosaved' : 'Autosave unavailable in this browser';
  }, 400);
  setTabDots((id) => sectionHasContent(id, values));
}

function replaceAll(next) {
  values = next;
  store.saveDraft(values);
  renderSections();
  setTabDots((id) => sectionHasContent(id, values));
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
  const dirty = SECTIONS.some((s) => sectionHasContent(s.id, values));
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
    toast(`Imported ${res.total} prompt(s) (${res.added} new)`);
  } catch (err) {
    toast(`Import failed: ${err.message}`, 'error');
  }
}

function clearAll() {
  if (!window.confirm('Clear every tab? Your saved library is not affected.')) return;
  replaceAll(defaultValues());
  $('save-name').value = '';
  select(SECTIONS[0].id);
  toast('Cleared');
}

// ---------- Boot ----------
renderTabs($('tabs'), select);
renderSections();
setTabDots((id) => sectionHasContent(id, values));
renderLibrary();
select(active);

$('copy-btn').addEventListener('click', copyPrompt);
$('save-form').addEventListener('submit', savePrompt);
$('export-btn').addEventListener('click', exportJson);
$('import-input').addEventListener('change', importJson);
$('clear-btn').addEventListener('click', clearAll);
$('back-btn').addEventListener('click', () => go(-1));
