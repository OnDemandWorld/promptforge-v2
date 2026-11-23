// promptStorage.js – unified, versioned prompt storage manager
//
// Everything that needs to read/write prompts should go through this file ONLY.
// It normalises structures, performs legacy-key migration, mirrors data for
// backwards compatibility, and exposes a tiny Promise-based API.
//
// Added: version history (versions array on each prompt)

import { generateUUID } from './utils.js';
import { normalizeLangCode } from './language.js';
import { canonicalCategoryId } from './categories.js';

// ---------------------------
// Constants & helpers
// ---------------------------
export const PROMPT_STORAGE_VERSION = 5;            // v5 adds `groupId` (language-linked forks); v4 added `language`; v3 added versions
const STORAGE_KEY = 'prompts_storage';
const LEGACY_KEY  = 'prompts';
// COMMENT: Cap per-prompt version history so the whole-store rewrite on every
// edit doesn't slowly march toward the chrome.storage.local quota.
const MAX_VERSIONS_PER_PROMPT = 100;

// Keys normalisePrompt understands. Anything else is passed through untouched
// so fields added by newer versions (e.g. `language`, sync revision metadata)
// survive a read+write cycle on this version instead of being silently stripped.
const KNOWN_PROMPT_KEYS = new Set([
  'id', 'uuid', 'title', 'content', 'createdAt', 'updatedAt', 'tags',
  'folderId', 'category', 'categoryId', 'favorite', '_archived',
  'useCount', 'lastUsedAt', 'versions', 'language', 'groupId'
]);

function storageGet(keys) {
  return new Promise((resolve, reject) => chrome.storage.local.get(keys, result => {
    // COMMENT: Surface quota/serialization failures instead of resolving with
    // stale data — previously a failed read/write resolved silently and callers
    // believed a save succeeded (silent data loss).
    if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
    else resolve(result);
  }));
}
function storageSet(obj) {
  return new Promise((resolve, reject) => chrome.storage.local.set(obj, () => {
    if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
    else resolve();
  }));
}

// Normalise a single prompt
function normalisePrompt(p = {}) {
  const out = {
    uuid: p.uuid || p.id || generateUUID(),
    title: typeof p.title === 'string' ? p.title : '',
    content: typeof p.content === 'string' ? p.content : '',
    createdAt: p.createdAt || new Date().toISOString()
  };
  if (p.updatedAt) out.updatedAt = p.updatedAt;
  // tags
  if (Array.isArray(p.tags)) {
    const seen = new Set();
    out.tags = p.tags
      .map(t => (typeof t === 'string' ? t.trim().toLowerCase().replace(/\s+/g, '-') : ''))
      .filter(t => t.length > 0 && !seen.has(t) && seen.add(t));
  } else {
    out.tags = [];
  }
  // folderId (kept for compatibility, flat categories preferred)
  out.folderId = typeof p.folderId === 'string' && p.folderId.length > 0 ? p.folderId : null;
  // language: BCP-47 code (en, zh-HK, zh-CN, …) or null when unknown.
  // v3 feature D — lazy migration: old prompts simply have null until set.
  out.language = p.language ? normalizeLangCode(p.language) : null;
  // groupId: shared uuid linking translations forked from the same prompt
  // (v3 feature D-VI); null for standalone prompts.
  out.groupId = typeof p.groupId === 'string' && p.groupId.length > 0 ? p.groupId : null;
  // category: the display-name string used by the UI
  out.category = typeof p.category === 'string' && p.category.length > 0 ? p.category : null;
  // C4: canonical category id — accepts a legacy id or a category name and
  // normalises to the stable id (null when unknown/custom).
  out.categoryId = canonicalCategoryId(p.categoryId) || canonicalCategoryId(p.category) || null;
  // State fields that must survive normalisation (previously stripped on every
  // read+write, which silently broke favorites, archive, use-counts and sorts).
  if (typeof p.favorite === 'boolean') out.favorite = p.favorite;
  if (typeof p._archived === 'boolean') out._archived = p._archived;
  if (typeof p.useCount === 'number') out.useCount = p.useCount;
  if (p.lastUsedAt) out.lastUsedAt = p.lastUsedAt;
  // version history
  if (Array.isArray(p.versions)) {
    out.versions = p.versions.map(v => ({
      content: typeof v.content === 'string' ? v.content : '',
      source: v.source || 'user_input',
      metadata: v.metadata || {},
      createdAt: v.createdAt || new Date().toISOString()
    }));
  } else if (p.content) {
    // Seed initial version if none exists
    out.versions = [{
      content: p.content,
      source: 'user_input',
      metadata: {},
      createdAt: out.createdAt
    }];
  } else {
    out.versions = [];
  }
  // Pass through unknown keys (see KNOWN_PROMPT_KEYS).
  for (const key of Object.keys(p)) {
    if (!KNOWN_PROMPT_KEYS.has(key)) out[key] = p[key];
  }
  return out;
}

function normaliseArray(arr) {
  return Array.isArray(arr) ? arr.map(normalisePrompt) : [];
}

// ---------------------------
// Internal read / write
// ---------------------------
async function readRawStorage() {
  const data = await storageGet([STORAGE_KEY, LEGACY_KEY]);
  if (data[STORAGE_KEY] && Array.isArray(data[STORAGE_KEY].prompts)) {
    const store = data[STORAGE_KEY];
    if (store.version !== PROMPT_STORAGE_VERSION) {
      // Upgrade to v3
      const upgraded = {
        version: PROMPT_STORAGE_VERSION,
        prompts: normaliseArray(store.prompts),
        folders: Array.isArray(store.folders) ? normaliseFolderArray(store.folders) : []
      };
      await writeStore(upgraded);
      return upgraded;
    }
    if (!Array.isArray(store.folders)) {
      store.folders = [];
      await writeStore({ version: PROMPT_STORAGE_VERSION, prompts: normaliseArray(store.prompts), folders: [] });
    }
    return { version: store.version, prompts: normaliseArray(store.prompts), folders: normaliseFolderArray(store.folders) };
  }
  if (Array.isArray(data[LEGACY_KEY])) {
    const migrated = {
      version: PROMPT_STORAGE_VERSION,
      prompts: normaliseArray(data[LEGACY_KEY]),
      folders: []
    };
    await writeStore(migrated);
    // COMMENT: Drop the legacy key once migrated — it wastes quota otherwise,
    // and stray external writes to it used to trigger full UI rebuilds.
    await new Promise(resolve => chrome.storage.local.remove(LEGACY_KEY, resolve));
    return migrated;
  }
  return { version: PROMPT_STORAGE_VERSION, prompts: [], folders: [] };
}

async function writeStore(storeObj) {
  const normalizedStore = {
    version: PROMPT_STORAGE_VERSION,
    prompts: normaliseArray(storeObj.prompts || []),
    folders: normaliseFolderArray(storeObj.folders || [])
  };
  await storageSet({ [STORAGE_KEY]: normalizedStore });
}

async function writeStorage(prompts) {
  const data = await storageGet([STORAGE_KEY]);
  const currentFolders = (data[STORAGE_KEY] && Array.isArray(data[STORAGE_KEY].folders)) ? data[STORAGE_KEY].folders : [];
  await writeStore({ prompts, folders: currentFolders });
}

// ---------------------------
// Write serialization
// ---------------------------
// Every mutating public function does read → modify → write as separate storage
// calls. Without serialization, two interleaving mutations (e.g. double-click,
// floating panel + app tab racing) clobber each other. withLock runs each
// mutation sequentially on a shared promise chain.
let _writeChain = Promise.resolve();
function withLock(fn) {
  const run = _writeChain.then(fn, fn); // run whether or not the previous failed
  _writeChain = run.catch(() => {});     // keep the chain alive on rejection
  return run;
}

// ---------------------------
// Folder helpers
// ---------------------------
function normaliseFolder(folder = {}) {
  return {
    id: typeof folder.id === 'string' && folder.id ? folder.id : generateUUID(),
    name: typeof folder.name === 'string' ? folder.name : '',
    parentId: typeof folder.parentId === 'string' && folder.parentId ? folder.parentId : null,
    createdAt: folder.createdAt || new Date().toISOString(),
    ...(folder.updatedAt ? { updatedAt: folder.updatedAt } : {})
  };
}
function normaliseFolderArray(folders) {
  return Array.isArray(folders) ? folders.map(normaliseFolder) : [];
}

// ---------------------------
// Public API
// ---------------------------
export async function getPrompts() {
  const { prompts } = await readRawStorage();
  return prompts;
}

export async function setPrompts(prompts) {
  // COMMENT: Bulk replace must hold the write lock like every other mutation —
  // an unlocked setPrompts racing a save/bump clobbers the other write.
  return withLock(async () => {
    await writeStorage(prompts);
  });
}

// COMMENT: #6 — run a read-modify-write inside the write lock. Callers that
// snapshot state, do async work, then apply (e.g. the sync engine) use this to
// re-read the freshest store at apply time so edits committed during their
// multi-second span are not clobbered by a stale snapshot. fn(prompts, folders)
// returns { prompts, folders } to write, or null/undefined to skip the write.
export async function transact(fn) {
  return withLock(async () => {
    const { prompts, folders } = await readRawStorage();
    const next = await fn(prompts, folders);
    if (!next) return null;
    await writeStore({ prompts: next.prompts, folders: next.folders });
    return next;
  });
}

// COMMENT: #36 — locked read-modify-write for panel reorder. Reading fresh
// inside the lock (instead of bulk-replacing a render-time snapshot) preserves
// prompts added/edited elsewhere since the list was rendered. Prompts not in
// orderedUuids are appended so concurrent additions are never dropped.
export async function reorderPrompts(orderedUuids) {
  return withLock(async () => {
    const prompts = await getPrompts();
    const byUuid = new Map(prompts.map(p => [p.uuid, p]));
    const ordered = [];
    for (const uuid of orderedUuids) {
      const p = byUuid.get(uuid);
      if (p) { ordered.push(p); byUuid.delete(uuid); }
    }
    for (const p of byUuid.values()) ordered.push(p);
    await writeStorage(ordered);
    return ordered;
  });
}

// COMMENT: #36 — locked read-modify-write to strip a tag from every prompt,
// returning the updated array (callers recompute tag counts from it).
export async function removeTagEverywhere(tag) {
  return withLock(async () => {
    const prompts = await getPrompts();
    const updated = prompts.map(p => ({ ...p, tags: Array.isArray(p.tags) ? p.tags.filter(t => t !== tag) : [] }));
    await writeStorage(updated);
    return updated;
  });
}

export async function savePrompt({ title, content, uuid, tags, folderId, categoryId, category, language, groupId }) {
  return withLock(async () => {
    if (!title && !content) throw new Error('Title or content is required');
    const prompts = await getPrompts();
    // COMMENT: Upsert on an existing uuid — previously a duplicate uuid pushed
    // a second prompt, after which findIndex updated only the first and
    // filter-deletes removed both.
    const existingIdx = uuid ? prompts.findIndex(p => p.uuid === uuid) : -1;
    if (existingIdx !== -1) {
      // COMMENT: #55 — only override fields the caller actually provided. The
      // old destructured defaults (tags=[], language=null, …) wiped those
      // fields on an existing prompt whenever a caller omitted them.
      const patch = { title, content, updatedAt: new Date().toISOString() };
      if (tags !== undefined) patch.tags = tags;
      if (folderId !== undefined) patch.folderId = folderId;
      if (categoryId !== undefined || category !== undefined) patch.categoryId = categoryId || category;
      if (language !== undefined) patch.language = language;
      if (groupId !== undefined) patch.groupId = groupId;
      prompts[existingIdx] = normalisePrompt({ ...prompts[existingIdx], ...patch });
      await writeStorage(prompts);
      return { success: true, prompt: prompts[existingIdx] };
    }
    const prompt = normalisePrompt({ uuid, title, content, tags, folderId, categoryId: categoryId || category, language, groupId });
    // Seed version if not already set
    if (prompt.versions.length === 0 && prompt.content) {
      prompt.versions.push({
        content: prompt.content,
        source: 'user_input',
        metadata: {},
        createdAt: prompt.createdAt
      });
    }
    prompts.push(prompt);
    await writeStorage(prompts);
    return { success: true, prompt };
  });
}

export async function updatePrompt(uuid, partial) {
  return withLock(async () => {
    const prompts = await getPrompts();
    const idx = prompts.findIndex(p => p.uuid === uuid);
    if (idx === -1) throw new Error('Prompt not found');
    prompts[idx] = normalisePrompt({ ...prompts[idx], ...partial, updatedAt: new Date().toISOString() });
    await writeStorage(prompts);
    return prompts[idx];
  });
}

export async function deletePrompt(uuid) {
  return withLock(async () => {
    const prompts = (await getPrompts()).filter(p => p.uuid !== uuid);
    await writeStorage(prompts);
    return true;
  });
}

// Increment useCount + stamp lastUsedAt. Single source for "prompt was used"
// so callers stop mutating raw storage inline (which skipped normalisation
// and raced with other writes).
export async function bumpUseCount(uuid) {
  return withLock(async () => {
    const prompts = await getPrompts();
    const idx = prompts.findIndex(p => p.uuid === uuid);
    if (idx === -1) return null;
    prompts[idx] = normalisePrompt({
      ...prompts[idx],
      useCount: (prompts[idx].useCount || 0) + 1,
      lastUsedAt: new Date().toISOString()
    });
    await writeStorage(prompts);
    return prompts[idx];
  });
}

export async function mergePrompts(imported) {
  return withLock(async () => {
    const base = await getPrompts();
    const map = new Map(base.map(p => [p.uuid, p]));
    imported.forEach(raw => {
      const p = normalisePrompt(raw);
      // COMMENT: Match by uuid when present; when the imported record has no
      // uuid (normalisePrompt minted a fresh one), fall back to an exact
      // title+content match so re-importing the same file merges instead of
      // duplicating.
      const byContent = !raw.uuid
        ? Array.from(map.values()).find(e => e.title === p.title && e.content === p.content)
        : undefined;
      const existing = map.get(p.uuid) || byContent;
      if (existing) {
        const oldDate = new Date(existing.updatedAt || existing.createdAt);
        const newDate = new Date(p.updatedAt || p.createdAt);
        // COMMENT: Guard invalid dates — NaN comparisons are always false and
        // used to silently keep the older record.
        if (!isNaN(newDate) && (isNaN(oldDate) || newDate > oldDate)) {
          map.set(existing.uuid, { ...p, uuid: existing.uuid });
        }
      } else {
        map.set(p.uuid, p);
      }
    });
    const merged = Array.from(map.values());
    await writeStorage(merged);
    return merged;
  });
}

// ---------------------------
// Version History API
// ---------------------------
// COMMENT: #56 — shared in-lock version append (no read/write of its own) so
// addVersion and restoreVersion can both resolve+append atomically under one
// withLock. withLock is not reentrant, hence a plain helper rather than calling
// addVersion from inside restoreVersion's lock.
function applyVersion(prompts, idx, content, source, metadata) {
  const versions = prompts[idx].versions || [];
  // Dedup: skip if content identical to latest version
  if (versions.length > 0 && versions[versions.length - 1].content === content) {
    return versions[versions.length - 1];
  }
  const version = { content, source, metadata, createdAt: new Date().toISOString() };
  if (!prompts[idx].versions) prompts[idx].versions = [];
  prompts[idx].versions.push(version);
  if (prompts[idx].versions.length > MAX_VERSIONS_PER_PROMPT) {
    prompts[idx].versions = prompts[idx].versions.slice(-MAX_VERSIONS_PER_PROMPT);
  }
  prompts[idx].content = content;
  prompts[idx].updatedAt = version.createdAt;
  return version;
}

export async function addVersion(promptUuid, content, source = 'manual_edit', metadata = {}) {
  return withLock(async () => {
    const prompts = await getPrompts();
    const idx = prompts.findIndex(p => p.uuid === promptUuid);
    if (idx === -1) throw new Error('Prompt not found');
    const version = applyVersion(prompts, idx, content, source, metadata);
    await writeStorage(prompts);
    return version;
  });
}

export async function getVersions(promptUuid) {
  const prompts = await getPrompts();
  const prompt = prompts.find(p => p.uuid === promptUuid);
  if (!prompt) throw new Error('Prompt not found');
  return prompt.versions || [];
}

export async function restoreVersion(promptUuid, versionIndex) {
  // COMMENT: #56 — resolve the version AND append inside one lock. The old code
  // read versions[versionIndex] outside the lock, so a concurrent addVersion +
  // trim could shift the index and restore the wrong version's content.
  return withLock(async () => {
    const prompts = await getPrompts();
    const idx = prompts.findIndex(p => p.uuid === promptUuid);
    if (idx === -1) throw new Error('Prompt not found');
    const versions = prompts[idx].versions || [];
    if (versionIndex < 0 || versionIndex >= versions.length) throw new Error('Version not found');
    const version = applyVersion(prompts, idx, versions[versionIndex].content, 'manual_edit', { restoredFrom: versionIndex });
    await writeStorage(prompts);
    return version;
  });
}

// ---------------------------
// Folder CRUD
// ---------------------------
export async function getFolders() {
  const { folders } = await readRawStorage();
  return folders;
}

export async function setFolders(folders) {
  return withLock(async () => {
    const { prompts } = await readRawStorage();
    await writeStore({ version: PROMPT_STORAGE_VERSION, prompts, folders });
  });
}

export async function saveFolder({ name, parentId = null, id }) {
  if (!name || typeof name !== 'string') throw new Error('Folder name is required');
  // COMMENT: read+modify+write inside ONE lock — the old shape read folders
  // outside the lock (TOCTOU), and withLock is not reentrant, so we can't go
  // through setFolders() from in here.
  return withLock(async () => {
    const { prompts, folders } = await readRawStorage();
    const folder = normaliseFolder({ id, name: name.trim(), parentId });
    folders.push(folder);
    await writeStore({ version: PROMPT_STORAGE_VERSION, prompts, folders });
    return folder;
  });
}

export async function updateFolder(id, partial) {
  return withLock(async () => {
    const { prompts, folders } = await readRawStorage();
    const idx = folders.findIndex(f => f.id === id);
    if (idx === -1) throw new Error('Folder not found');
    folders[idx] = normaliseFolder({ ...folders[idx], ...partial, updatedAt: new Date().toISOString() });
    await writeStore({ version: PROMPT_STORAGE_VERSION, prompts, folders });
    return folders[idx];
  });
}

export async function deleteFolder(id) {
  return withLock(async () => {
    const { prompts, folders } = await readRawStorage();
    const remainingFolders = folders.filter(f => f.id !== id);
    const updatedPrompts = prompts.map(p => (p.folderId === id ? { ...p, folderId: null } : p));
    await writeStore({ version: PROMPT_STORAGE_VERSION, prompts: updatedPrompts, folders: remainingFolders });
    return true;
  });
}

export async function movePromptToFolder(promptUuid, folderId = null) {
  if (folderId) {
    const folders = await getFolders();
    if (!folders.find(f => f.id === folderId)) throw new Error('Target folder does not exist');
  }
  return await updatePrompt(promptUuid, { folderId });
}

// ---------------------------
// Tag helpers
// ---------------------------
export async function addTagToPrompt(promptUuid, tag) {
  const clean = typeof tag === 'string' ? tag.trim() : '';
  // COMMENT: #59 — return the (unchanged) prompt, not the whole array, so the
  // return type matches the normal path.
  if (!clean) {
    const prompts = await getPrompts();
    return prompts.find(p => p.uuid === promptUuid) || null;
  }
  // COMMENT: Compute the new tag set inside the locked mutation — an unlocked
  // read followed by updatePrompt lost one of two concurrent tag edits.
  return withLock(async () => {
    const prompts = await getPrompts();
    const idx = prompts.findIndex(p => p.uuid === promptUuid);
    if (idx === -1) throw new Error('Prompt not found');
    const set = new Set(prompts[idx].tags || []);
    set.add(clean);
    prompts[idx] = normalisePrompt({ ...prompts[idx], tags: Array.from(set), updatedAt: new Date().toISOString() });
    await writeStorage(prompts);
    return prompts[idx];
  });
}

export async function removeTagFromPrompt(promptUuid, tag) {
  return withLock(async () => {
    const prompts = await getPrompts();
    const idx = prompts.findIndex(p => p.uuid === promptUuid);
    if (idx === -1) throw new Error('Prompt not found');
    const next = (prompts[idx].tags || []).filter(t => t !== tag);
    prompts[idx] = normalisePrompt({ ...prompts[idx], tags: next, updatedAt: new Date().toISOString() });
    await writeStorage(prompts);
    return prompts[idx];
  });
}

export async function setTagsForPrompt(promptUuid, tags = []) {
  return await updatePrompt(promptUuid, { tags });
}

// ---------- import / export helpers ----------
export async function exportPrompts() {
  // COMMENT: #33 — "Export All Data" must include folders (and the schema
  // version), not just prompts; importPrompts already accepts this store shape.
  const prompts = await getPrompts();
  const folders = await getFolders();
  const json = JSON.stringify({ version: PROMPT_STORAGE_VERSION, prompts, folders }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prompts-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

export async function importPrompts(source) {
  let imported;
  if (Array.isArray(source)) {
    imported = source;
  } else if (source instanceof File) {
    const text = await source.text();
    imported = JSON.parse(text);
  } else if (typeof source === 'string') {
    imported = JSON.parse(source);
  } else {
    throw new Error('Unsupported import source');
  }
  if (Array.isArray(imported)) {
    return await mergePrompts(imported);
  }
  if (imported && typeof imported === 'object') {
    const { prompts = [], folders = [] } = imported;
    const mergedPrompts = await mergePrompts(prompts);
    const currentFolders = await getFolders();
    const map = new Map(currentFolders.map(f => [f.id, f]));
    normaliseFolderArray(folders).forEach(f => { map.set(f.id, f); });
    await setFolders(Array.from(map.values()));
    return mergedPrompts;
  }
  throw new Error('Invalid JSON format – expected an array or store object');
}

// Change listener
export function onPromptsChanged(callback) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    // COMMENT: The legacy key is removed after migration; no longer watched.
    if (changes[STORAGE_KEY]) {
      getPrompts().then(callback).catch(err => console.error('[PromptForge] onPromptsChanged read failed:', err));
    }
  });
}
