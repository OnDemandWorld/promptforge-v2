// promptStorage.js – unified, versioned prompt storage manager
//
// Everything that needs to read/write prompts should go through this file ONLY.
// It normalises structures, performs legacy-key migration, mirrors data for
// backwards compatibility, and exposes a tiny Promise-based API.
//
// Added: version history (versions array on each prompt)

import { generateUUID } from './utils.js';

// ---------------------------
// Constants & helpers
// ---------------------------
export const PROMPT_STORAGE_VERSION = 3;            // v3 adds versions array
const STORAGE_KEY = 'prompts_storage';
const LEGACY_KEY  = 'prompts';

function storageGet(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}
function storageSet(obj) {
  return new Promise(resolve => chrome.storage.local.set(obj, resolve));
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
  // category: the display-name string used by the UI
  out.category = typeof p.category === 'string' && p.category.length > 0 ? p.category : null;
  // categoryId: legacy/ID reference (mapped from category if not provided)
  out.categoryId = typeof p.categoryId === 'string' && p.categoryId.length > 0
    ? p.categoryId
    : (typeof p.category === 'string' && p.category.length > 0 ? p.category : null);
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
  await writeStorage(prompts);
}

export async function savePrompt({ title, content, uuid, tags = [], folderId = null, categoryId = null, category = null }) {
  if (!title && !content) throw new Error('Title or content is required');
  const prompts = await getPrompts();
  const prompt = normalisePrompt({ uuid, title, content, tags, folderId, categoryId: categoryId || category });
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
}

export async function updatePrompt(uuid, partial) {
  const prompts = await getPrompts();
  const idx = prompts.findIndex(p => p.uuid === uuid);
  if (idx === -1) throw new Error('Prompt not found');
  prompts[idx] = normalisePrompt({ ...prompts[idx], ...partial, updatedAt: new Date().toISOString() });
  await writeStorage(prompts);
  return prompts[idx];
}

export async function deletePrompt(uuid) {
  const prompts = (await getPrompts()).filter(p => p.uuid !== uuid);
  await writeStorage(prompts);
  return true;
}

export async function mergePrompts(imported) {
  const base = await getPrompts();
  const map = new Map(base.map(p => [p.uuid, p]));
  imported.forEach(raw => {
    const p = normalisePrompt(raw);
    const existing = map.get(p.uuid);
    if (existing) {
      const oldDate = new Date(existing.updatedAt || existing.createdAt);
      const newDate = new Date(p.updatedAt || p.createdAt);
      if (newDate > oldDate) map.set(p.uuid, p);
    } else {
      map.set(p.uuid, p);
    }
  });
  const merged = Array.from(map.values());
  await writeStorage(merged);
  return merged;
}

// ---------------------------
// Version History API
// ---------------------------
export async function addVersion(promptUuid, content, source = 'manual_edit', metadata = {}) {
  const prompts = await getPrompts();
  const idx = prompts.findIndex(p => p.uuid === promptUuid);
  if (idx === -1) throw new Error('Prompt not found');
  // Dedup: skip if content identical to latest version
  const versions = prompts[idx].versions || [];
  if (versions.length > 0 && versions[versions.length - 1].content === content) {
    return versions[versions.length - 1];
  }
  const version = {
    content,
    source,
    metadata,
    createdAt: new Date().toISOString()
  };
  if (!prompts[idx].versions) prompts[idx].versions = [];
  prompts[idx].versions.push(version);
  // Also update main content
  prompts[idx].content = content;
  prompts[idx].updatedAt = version.createdAt;
  await writeStorage(prompts);
  return version;
}

export async function getVersions(promptUuid) {
  const prompts = await getPrompts();
  const prompt = prompts.find(p => p.uuid === promptUuid);
  if (!prompt) throw new Error('Prompt not found');
  return prompt.versions || [];
}

export async function restoreVersion(promptUuid, versionIndex) {
  const prompts = await getPrompts();
  const idx = prompts.findIndex(p => p.uuid === promptUuid);
  if (idx === -1) throw new Error('Prompt not found');
  const versions = prompts[idx].versions || [];
  if (versionIndex < 0 || versionIndex >= versions.length) throw new Error('Version not found');
  const version = versions[versionIndex];
  return addVersion(promptUuid, version.content, 'manual_edit', { restoredFrom: versionIndex });
}

// ---------------------------
// Folder CRUD
// ---------------------------
export async function getFolders() {
  const { folders } = await readRawStorage();
  return folders;
}

export async function setFolders(folders) {
  const { prompts } = await readRawStorage();
  await writeStore({ version: PROMPT_STORAGE_VERSION, prompts, folders });
}

export async function saveFolder({ name, parentId = null, id }) {
  if (!name || typeof name !== 'string') throw new Error('Folder name is required');
  const folders = await getFolders();
  const folder = normaliseFolder({ id, name: name.trim(), parentId });
  folders.push(folder);
  await setFolders(folders);
  return folder;
}

export async function updateFolder(id, partial) {
  const folders = await getFolders();
  const idx = folders.findIndex(f => f.id === id);
  if (idx === -1) throw new Error('Folder not found');
  folders[idx] = normaliseFolder({ ...folders[idx], ...partial, updatedAt: new Date().toISOString() });
  await setFolders(folders);
  return folders[idx];
}

export async function deleteFolder(id) {
  const { prompts, folders } = await readRawStorage();
  const remainingFolders = folders.filter(f => f.id !== id);
  const updatedPrompts = prompts.map(p => (p.folderId === id ? { ...p, folderId: null } : p));
  await writeStore({ version: PROMPT_STORAGE_VERSION, prompts: updatedPrompts, folders: remainingFolders });
  return true;
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
  if (!clean) return await getPrompts();
  const prompts = await getPrompts();
  const idx = prompts.findIndex(p => p.uuid === promptUuid);
  if (idx === -1) throw new Error('Prompt not found');
  const set = new Set(prompts[idx].tags || []);
  set.add(clean);
  return await updatePrompt(promptUuid, { tags: Array.from(set) });
}

export async function removeTagFromPrompt(promptUuid, tag) {
  const prompts = await getPrompts();
  const idx = prompts.findIndex(p => p.uuid === promptUuid);
  if (idx === -1) throw new Error('Prompt not found');
  const next = (prompts[idx].tags || []).filter(t => t !== tag);
  return await updatePrompt(promptUuid, { tags: next });
}

export async function setTagsForPrompt(promptUuid, tags = []) {
  return await updatePrompt(promptUuid, { tags });
}

// ---------- import / export helpers ----------
export async function exportPrompts() {
  const json = JSON.stringify(await getPrompts(), null, 2);
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
    if (changes[STORAGE_KEY] || changes[LEGACY_KEY]) {
      getPrompts().then(callback);
    }
  });
}
