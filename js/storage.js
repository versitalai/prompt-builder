// storage.js — autosave draft + prompt library + JSON export/import.
// All localStorage access is wrapped in try/catch: storage can be
// disabled (private mode), full, or throw in some embedded browsers.

import { normalizeValues } from './builder.js';

const DRAFT_KEY = 'promptBuilder:draft:v1';
const LIBRARY_KEY = 'promptBuilder:library:v1';
export const EXPORT_VERSION = 1;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

// ---------- Draft (autosave) ----------
export const loadDraft = () => normalizeValues(read(DRAFT_KEY, null));
export const saveDraft = (values) => write(DRAFT_KEY, values);

// ---------- Library ----------
function cleanEntry(e) {
  if (!e || typeof e !== 'object' || typeof e.name !== 'string') return null;
  return {
    id: typeof e.id === 'string' ? e.id : makeId(),
    name: e.name.slice(0, 120),
    savedAt: typeof e.savedAt === 'number' ? e.savedAt : Date.now(),
    values: normalizeValues(e.values),
  };
}

export function loadLibrary() {
  const raw = read(LIBRARY_KEY, []);
  return Array.isArray(raw) ? raw.map(cleanEntry).filter(Boolean) : [];
}

const saveLibrary = (lib) => write(LIBRARY_KEY, lib);

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Save under a name. Same name (case-insensitive) overwrites. Returns new library. */
export function saveToLibrary(name, values) {
  const lib = loadLibrary();
  const trimmed = name.trim().slice(0, 120);
  const idx = lib.findIndex((e) => e.name.toLowerCase() === trimmed.toLowerCase());
  const entry = { id: idx >= 0 ? lib[idx].id : makeId(), name: trimmed, savedAt: Date.now(), values: structuredClone(values) };
  if (idx >= 0) lib[idx] = entry;
  else lib.unshift(entry);
  const ok = saveLibrary(lib);
  return { ok, library: lib };
}

export function deleteFromLibrary(id) {
  const lib = loadLibrary().filter((e) => e.id !== id);
  saveLibrary(lib);
  return lib;
}

// ---------- Export / import ----------
export function exportData(draftValues) {
  return JSON.stringify({ app: 'prompt-builder', version: EXPORT_VERSION, exportedAt: new Date().toISOString(), draft: draftValues, library: loadLibrary() }, null, 2);
}

/** Merge imported library into existing (by name). Returns {library, draft, added}. Throws on bad file. */
export function importData(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Not valid JSON.');
  }
  if (!data || data.app !== 'prompt-builder') throw new Error('Not a prompt-builder export file.');
  const incoming = Array.isArray(data.library) ? data.library.map(cleanEntry).filter(Boolean) : [];
  const lib = loadLibrary();
  let added = 0;
  for (const e of incoming) {
    const idx = lib.findIndex((x) => x.name.toLowerCase() === e.name.toLowerCase());
    if (idx >= 0) lib[idx] = e;
    else { lib.push(e); added++; }
  }
  saveLibrary(lib);
  return { library: lib, draft: data.draft ? normalizeValues(data.draft) : null, added, total: incoming.length };
}
