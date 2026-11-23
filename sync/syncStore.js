// sync/syncStore.js — persistence for folder sync (v3 feature E)
//
// Stores the File System Access directory handle in IndexedDB (the only
// browser storage that can hold FileSystemHandle objects) and sync metadata
// in chrome.storage.local. App-page only — service workers cannot use the
// File System Access API.

const DB_NAME = 'promptforge-sync';
const DB_VERSION = 1;
const HANDLE_STORE = 'handles';
const HANDLE_KEY = 'sync-dir';

const SETTINGS_KEY = 'sync_settings';
const DEVICE_ID_KEY = 'sync_device_id';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(HANDLE_STORE)) db.createObjectStore(HANDLE_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Persist the chosen sync directory handle. */
export async function saveDirHandle(handle) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HANDLE_STORE, 'readwrite');
    tx.objectStore(HANDLE_STORE).put(handle, HANDLE_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/** @returns {Promise<FileSystemDirectoryHandle|null>} */
export async function loadDirHandle() {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(HANDLE_STORE, 'readonly');
      const req = tx.objectStore(HANDLE_STORE).get(HANDLE_KEY);
      req.onsuccess = () => { db.close(); resolve(req.result || null); };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  } catch { return null; }
}

export async function clearDirHandle() {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(HANDLE_STORE, 'readwrite');
      tx.objectStore(HANDLE_STORE).delete(HANDLE_KEY);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  } catch { /* best-effort */ }
}

// ── Sync settings (chrome.storage.local) ──────────────────────────────────
// Shape: { enabled: bool, paused: bool, folderName: string|null,
//          lastSyncAt: ISO|null, lastError: string|null }

export async function getSyncSettings() {
  try {
    const data = await chrome.storage.local.get(SETTINGS_KEY);
    return data[SETTINGS_KEY] || null;
  } catch { return null; }
}

// COMMENT: #77 — serialize read-modify-write patches on a shared chain so two
// overlapping patches (e.g. cycle completion vs user Pause) can't drop each
// other's fields via a stale 'current' snapshot.
let _settingsChain = Promise.resolve();
export async function patchSyncSettings(patch) {
  const run = _settingsChain.then(async () => {
    const current = (await getSyncSettings()) || {};
    await chrome.storage.local.set({ [SETTINGS_KEY]: { ...current, ...patch } });
  });
  _settingsChain = run.catch(() => {});
  return run;
}

export async function clearSyncSettings() {
  await chrome.storage.local.remove(SETTINGS_KEY);
}

/** Stable per-install device id, used as modifiedBy in the sync file. */
export async function getDeviceId() {
  try {
    const data = await chrome.storage.local.get(DEVICE_ID_KEY);
    if (data[DEVICE_ID_KEY]) return data[DEVICE_ID_KEY];
    const id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()).slice(0, 8);
    await chrome.storage.local.set({ [DEVICE_ID_KEY]: id });
    return id;
  } catch {
    return 'unknown';
  }
}
