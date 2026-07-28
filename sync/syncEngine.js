// sync/syncEngine.js — folder-based sync engine (v3 feature E)
//
// Syncs the prompt library through a single JSON file in a user-chosen
// folder (iCloud Drive / Dropbox / Box / OneDrive / anything else). The
// cloud provider's own client moves the file between machines; this engine
// merges it with the local library.
//
// Model:
//   - The sync file carries prompts + folders + tombstones (deletions must
//     propagate too, or a stale device re-uploads deleted prompts forever).
//   - A "shadow" digest snapshot (chrome.storage.local 'sync_shadow') records
//     the last-synced state so each side can detect "changed since last sync".
//   - Resolution per prompt: unchanged → keep; one side changed → take it;
//     BOTH changed → later updatedAt wins (ties → keep local). Documented
//     trade-off, not CRDT-grade — prompt editing is low-conflict in practice.
//   - useCount/lastUsedAt are per-device statistics: merged as max, excluded
//     from change detection.
//
// Runs in the APP TAB only — the File System Access API is unavailable in
// service workers, so sync happens while a PromptForge tab is open (polling
// every 30s, on window focus, and 3s after local edits).

import { getPrompts, getFolders, setPrompts, setFolders } from '../promptStorage.js';
import {
  loadDirHandle, clearDirHandle, getSyncSettings, patchSyncSettings, getDeviceId,
} from './syncStore.js';
import { nativeRPC } from './nativeBridge.js';

export const SYNC_FILENAME = 'promptforge-sync.json';
const SHADOW_KEY = 'sync_shadow';
const POLL_INTERVAL_MS = 30000;
const WRITE_DEBOUNCE_MS = 3000;
const TOMBSTONE_MAX_AGE_MS = 90 * 24 * 3600 * 1000;

let _applyingRemote = false;   // loop guard: storage writes from remote merge
let _cycleRunning = false;     // overlap guard
let _writeTimer = null;
let _pollTimer = null;
let _storageListener = null;

// ── Digests / change detection ────────────────────────────────────────────

// Fields that count as "content" for change detection. Deliberately excludes
// useCount/lastUsedAt (per-device stats) and rev/modifiedBy (sync metadata).
function promptDigest(p) {
  return JSON.stringify([
    p.title || '', p.content || '', p.tags || [], p.category || null,
    p.categoryId || null, p.language || null, p.groupId || null, p.folderId || null,
    !!p.favorite, !!p._archived,
    (p.versions || []).map(v => [v.content, v.source]),
  ]);
}

function folderDigest(f) {
  return JSON.stringify([f.name || '', f.parentId || null]);
}

async function loadShadow() {
  try {
    const data = await chrome.storage.local.get(SHADOW_KEY);
    return data[SHADOW_KEY] || { prompts: {}, folders: {}, tombstones: [] };
  } catch { return { prompts: {}, folders: {}, tombstones: [] }; }
}

async function saveShadow(prompts, folders, tombstones) {
  const shadow = {
    prompts: Object.fromEntries(prompts.map(p => [p.uuid, promptDigest(p)])),
    folders: Object.fromEntries(folders.map(f => [f.id, folderDigest(f)])),
    tombstones: tombstones.map(t => t.uuid),
  };
  await chrome.storage.local.set({ [SHADOW_KEY]: shadow });
}

// ── File I/O ──────────────────────────────────────────────────────────────

async function readSyncFile(dir) {
  try {
    const fh = await dir.getFileHandle(SYNC_FILENAME);
    const file = await fh.getFile(); // iCloud-evicted files resolve here (may take a moment)
    const text = await file.text();
    if (!text.trim()) return null;
    const data = JSON.parse(text);
    return { data, mtime: file.lastModified || 0 };
  } catch (e) {
    if (e && e.name === 'NotFoundError') return null; // no file yet
    throw e;
  }
}

// COMMENT: createWritable → write → close is atomic at the FS level, which is
// what makes a cloud-provider-watched file safe to overwrite in place.
async function writeSyncFile(dir, payload) {
  const fh = await dir.getFileHandle(SYNC_FILENAME, { create: true });
  const writable = await fh.createWritable();
  await writable.write(JSON.stringify(payload, null, 2));
  await writable.close();
}

// Dropbox-style conflicted copies: if the provider created one, fold the
// newer content into the merge instead of silently ignoring it. We do NOT
// delete provider files — only merge, then our normal write supersedes.
async function readConflictedCopies(dir) {
  const extras = [];
  try {
    for await (const [name, handle] of dir.entries()) {
      if (name === SYNC_FILENAME) continue;
      if (/conflicted copy/i.test(name) && name.endsWith('.json') && handle.kind === 'file') {
        try {
          const file = await handle.getFile();
          const data = JSON.parse(await file.text());
          if (data && Array.isArray(data.prompts)) extras.push(data);
        } catch { /* unreadable copy — skip */ }
      }
    }
  } catch { /* directory iteration unsupported/failed — skip */ }
  return extras;
}

// ── Merge ─────────────────────────────────────────────────────────────────

function mergeFields(local, remote) {
  // Both sides claim changes — later updatedAt wins; tie/invalid → local.
  const lt = new Date(local.updatedAt || local.createdAt || 0).getTime();
  const rt = new Date(remote.updatedAt || remote.createdAt || 0).getTime();
  const base = (isNaN(rt) || lt >= rt) ? { ...remote, ...local } : { ...local, ...remote };
  return {
    ...base,
    // per-device stats: keep the max
    useCount: Math.max(local.useCount || 0, remote.useCount || 0),
    lastUsedAt: (local.lastUsedAt || '') > (remote.lastUsedAt || '') ? local.lastUsedAt : remote.lastUsedAt,
    rev: Math.max(local.rev || 0, remote.rev || 0) + 1,
  };
}

/**
 * Three-way merge (local vs remote vs shadow).
 * @returns {{ prompts: object[], folders: object[], tombstones: object[],
 *             localChanged: boolean, remoteChanged: boolean }}
 */
// Exported for unit testing (pure function — no chrome/FS access).
export function mergeAll(localPrompts, localFolders, remote, shadow, deviceId) {
  const now = new Date().toISOString();
  const remotePrompts = (remote && Array.isArray(remote.prompts)) ? remote.prompts : [];
  const remoteFolders = (remote && Array.isArray(remote.folders)) ? remote.folders : [];
  const tombstones = (remote && Array.isArray(remote.tombstones)) ? remote.tombstones.slice() : [];
  const tombMap = new Map(tombstones.map(t => [t.uuid, t]));

  const localMap = new Map(localPrompts.map(p => [p.uuid, p]));
  const remoteMap = new Map(remotePrompts.map(p => [p.uuid, p]));
  const merged = new Map();
  let localChanged = false;   // merged-for-local differs from current local
  let remoteChanged = false;  // merged-for-file differs from current remote

  const allUuids = new Set([...localMap.keys(), ...remoteMap.keys(), ...Object.keys(shadow.prompts || {})]);

  for (const uuid of allUuids) {
    const L = localMap.get(uuid);
    const R = remoteMap.get(uuid);
    const S = shadow.prompts ? shadow.prompts[uuid] : undefined;
    const tomb = tombMap.get(uuid);

    // Deletion propagation via tombstones.
    if (tomb) {
      if (L) {
        const lt = new Date(L.updatedAt || L.createdAt || 0).getTime();
        const dt = new Date(tomb.deletedAt || 0).getTime();
        if (!isNaN(lt) && lt > dt) {
          // Local edited after the deletion → local wins, drop the tombstone.
          merged.set(uuid, { ...L, rev: Math.max(L.rev || 0, tomb.rev || 0) + 1, modifiedBy: deviceId });
          tombMap.delete(uuid);
          remoteChanged = true;
        } else {
          localChanged = true; // must delete locally
        }
      }
      continue;
    }

    const lChanged = L ? (S === undefined || promptDigest(L) !== S) : (S !== undefined);
    const rChanged = R ? (S === undefined || promptDigest(R) !== S) : (S !== undefined);

    if (L && R) {
      if (lChanged && rChanged) {
        const m = mergeFields(L, R);
        m.modifiedBy = deviceId;
        merged.set(uuid, m);
        if (promptDigest(m) !== promptDigest(L)) localChanged = true;
        if (promptDigest(m) !== promptDigest(R)) remoteChanged = true;
      } else if (rChanged) {
        merged.set(uuid, R);
        if (!lChanged && promptDigest(R) !== promptDigest(L)) localChanged = true;
      } else {
        merged.set(uuid, L);
        if (lChanged) {
          // Stamp sync metadata for the file; local copy stays untouched.
          merged.set(uuid, L);
          remoteChanged = true;
        }
      }
    } else if (L && !R) {
      if (lChanged && S === undefined) {
        // New local prompt — goes to the file.
        merged.set(uuid, { ...L, rev: (L.rev || 0) + 1, modifiedBy: deviceId });
        remoteChanged = true;
      } else if (S !== undefined && !lChanged) {
        // Existed at last sync, unchanged locally, gone remotely → remote deleted it.
        tombMap.set(uuid, { uuid, deletedAt: now, rev: (R && R.rev || 0) + 1 });
        localChanged = true;
      } else if (S !== undefined && lChanged) {
        // Locally edited AND remotely deleted → edit wins (documented policy).
        merged.set(uuid, { ...L, rev: (L.rev || 0) + 1, modifiedBy: deviceId });
        remoteChanged = true;
      } else {
        merged.set(uuid, L);
      }
    } else if (!L && R) {
      if (rChanged && S === undefined) {
        // New remote prompt — comes in locally.
        merged.set(uuid, R);
        localChanged = true;
      } else if (S !== undefined && !rChanged) {
        // We deleted it locally; keep the tombstone so other devices learn.
        tombMap.set(uuid, { uuid, deletedAt: now, rev: (R.rev || 0) + 1 });
        remoteChanged = true;
      } else if (S !== undefined && rChanged) {
        // Deleted locally, edited remotely → remote edit wins (documented).
        merged.set(uuid, R);
        localChanged = true;
      }
    }

    // Per-device stats propagate even when content is unchanged (the digest
    // excludes them, so fold them in explicitly — converges after one cycle).
    if (L && R && merged.has(uuid)) {
      const m = merged.get(uuid);
      const maxUse = Math.max(L.useCount || 0, R.useCount || 0);
      const latestUse = (L.lastUsedAt || '') > (R.lastUsedAt || '') ? L.lastUsedAt : R.lastUsedAt;
      if ((m.useCount || 0) !== maxUse) { m.useCount = maxUse; localChanged = true; }
      if (latestUse && (m.lastUsedAt || '') !== latestUse) { m.lastUsedAt = latestUse; localChanged = true; }
    }
  }

  // Folders: simpler (name/parent merge, no tombstones — folder deletion just
  // orphans prompts, which normalise to folderId:null on the other side).
  const folderMap = new Map(localFolders.map(f => [f.id, f]));
  const remoteFolderMap = new Map(remoteFolders.map(f => [f.id, f]));
  let foldersChangedLocal = false;
  let foldersChangedRemote = false;
  for (const [id, rf] of remoteFolderMap) {
    const lf = folderMap.get(id);
    const sf = shadow.folders ? shadow.folders[id] : undefined;
    const rCh = sf === undefined || folderDigest(rf) !== sf;
    const lCh = lf ? (sf === undefined || folderDigest(lf) !== sf) : (sf !== undefined);
    if (!lf && rCh) { folderMap.set(id, rf); foldersChangedLocal = true; }
    else if (lf && rCh && !lCh) { folderMap.set(id, rf); foldersChangedLocal = true; }
    else if (lf && lCh && !rCh) { foldersChangedRemote = true; }
  }
  for (const id of folderMap.keys()) {
    if (!remoteFolderMap.has(id)) foldersChangedRemote = true;
  }

  // Prune old tombstones.
  const cutoff = Date.now() - TOMBSTONE_MAX_AGE_MS;
  const finalTombs = [...tombMap.values()].filter(t => {
    const dt = new Date(t.deletedAt || 0).getTime();
    return isNaN(dt) || dt > cutoff;
  });
  if (finalTombs.length !== tombstones.length) remoteChanged = true;

  return {
    prompts: [...merged.values()],
    folders: [...folderMap.values()],
    tombstones: finalTombs,
    localChanged: localChanged || foldersChangedLocal,
    remoteChanged: remoteChanged || foldersChangedRemote,
  };
}

// ── Sync cycle ────────────────────────────────────────────────────────────

// Fold provider conflicted copies into the remote payload (shared by both
// transports). Never deletes provider files — merge only.
function foldConflicts(remote, extras) {
  let merged = remote;
  for (const extra of extras) {
    if (!extra || !Array.isArray(extra.prompts)) continue;
    if (!merged) { merged = extra; continue; }
    const seen = new Map((merged.prompts || []).map(p => [p.uuid, p]));
    for (const p of extra.prompts) {
      const existing = seen.get(p.uuid);
      if (!existing) { (merged.prompts = merged.prompts || []).push(p); continue; }
      const et = new Date(existing.updatedAt || 0).getTime();
      const pt = new Date(p.updatedAt || 0).getTime();
      if (pt > et) Object.assign(existing, p);
    }
  }
  return merged;
}

/**
 * One full sync cycle. Safe to call repeatedly; overlaps are skipped.
 * Dispatches on settings.transport: 'native' (messaging host — works in
 * Brave) or 'fsaccess' (File System Access API — Chrome/Edge).
 * @returns {Promise<'ok'|'disabled'|'needs-permission'|'error'>}
 */
export async function runSyncCycle() {
  if (_cycleRunning) return 'ok';
  const settings = await getSyncSettings();
  if (!settings || !settings.enabled || settings.paused) return 'disabled';
  if (settings.transport === 'native') return runNativeCycle(settings);

  const handle = await loadDirHandle();
  if (!handle) return 'disabled';

  _cycleRunning = true;
  try {
    const perm = await handle.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted') {
      await patchSyncSettings({ needsPermission: true });
      return 'needs-permission';
    }
    await patchSyncSettings({ needsPermission: false, folderName: handle.name });

    const deviceId = await getDeviceId();
    const [localPrompts, localFolders, shadow, conflicted] = await Promise.all([
      getPrompts(), getFolders(), loadShadow(), readConflictedCopies(handle),
    ]);
    const remoteRead = await readSyncFile(handle);
    const remote = foldConflicts(remoteRead ? remoteRead.data : null, conflicted);

    const result = mergeAll(localPrompts, localFolders, remote, shadow, deviceId);

    // Apply remote-driven changes to local storage under the loop guard.
    if (result.localChanged) {
      _applyingRemote = true;
      try {
        await setFolders(result.folders);
        await setPrompts(result.prompts);
      } finally {
        // Release after the storage listeners have fired (they're async).
        setTimeout(() => { _applyingRemote = false; }, 100);
      }
    }

    // Push the merged state to the file when either side contributed changes,
    // or when the file doesn't exist yet (seeding a new sync folder).
    if (result.remoteChanged || !remote) {
      const payload = {
        format: 1,
        updatedAt: new Date().toISOString(),
        writtenBy: deviceId,
        prompts: result.prompts,
        folders: result.folders,
        tombstones: result.tombstones,
      };
      await writeSyncFile(handle, payload);
      await saveShadow(result.prompts, result.folders, result.tombstones);
    }

    await patchSyncSettings({ lastSyncAt: new Date().toISOString(), lastError: null });
    return 'ok';
  } catch (e) {
    await patchSyncSettings({ lastError: e.message || String(e) });
    console.error('[PromptForge] sync cycle failed:', e);
    return 'error';
  } finally {
    _cycleRunning = false;
  }
}

/**
 * Sync cycle over the native messaging host (Brave & any browser).
 * The host owns the folder choice (~/.promptforge-sync/config.json).
 */
async function runNativeCycle(settings) {
  _cycleRunning = true;
  try {
    const ping = await nativeRPC({ op: 'ping' }, 5000);
    if (!ping.ok) {
      await patchSyncSettings({ lastError: ping.notInstalled ? 'Native helper not installed (see setup below)' : ping.error });
      return 'error';
    }
    const folderInfo = await nativeRPC({ op: 'get-folder' }, 5000);
    if (!folderInfo.ok || !folderInfo.folderPath) {
      await patchSyncSettings({ lastError: 'No sync folder chosen — use “Choose Folder” below' });
      return 'error';
    }
    const folderName = String(folderInfo.folderPath).split(/[\\/]/).filter(Boolean).pop() || folderInfo.folderPath;
    await patchSyncSettings({ folderName, needsPermission: false });

    const deviceId = await getDeviceId();
    const [localPrompts, localFolders, shadow, conflictedReply, remoteReply] = await Promise.all([
      getPrompts(), getFolders(), loadShadow(),
      nativeRPC({ op: 'list-conflicted' }), nativeRPC({ op: 'read' }),
    ]);
    if (!remoteReply.ok) {
      await patchSyncSettings({ lastError: remoteReply.error });
      return 'error';
    }
    const remote = foldConflicts(remoteReply.data, (conflictedReply.ok && conflictedReply.copies) || []);
    const result = mergeAll(localPrompts, localFolders, remote, shadow, deviceId);

    if (result.localChanged) {
      _applyingRemote = true;
      try {
        await setFolders(result.folders);
        await setPrompts(result.prompts);
      } finally {
        setTimeout(() => { _applyingRemote = false; }, 100);
      }
    }

    if (result.remoteChanged || !remote) {
      const payload = {
        format: 1,
        updatedAt: new Date().toISOString(),
        writtenBy: deviceId,
        prompts: result.prompts,
        folders: result.folders,
        tombstones: result.tombstones,
      };
      const w = await nativeRPC({ op: 'write', payload });
      if (!w.ok) {
        await patchSyncSettings({ lastError: w.error });
        return 'error';
      }
      await saveShadow(result.prompts, result.folders, result.tombstones);
    }

    await patchSyncSettings({ lastSyncAt: new Date().toISOString(), lastError: null });
    return 'ok';
  } catch (e) {
    await patchSyncSettings({ lastError: e.message || String(e) });
    console.error('[PromptForge] native sync cycle failed:', e);
    return 'error';
  } finally {
    _cycleRunning = false;
  }
}

/**
 * Choose (or set) the sync folder through the native host, enable sync, and
 * run a cycle. @param manualPath skips the OS dialog.
 */
export async function nativeConnectFolder(manualPath = null) {
  const r = manualPath
    ? await nativeRPC({ op: 'set-folder', path: manualPath })
    : await nativeRPC({ op: 'pick-folder' });
  if (!r || !r.ok) return { ok: false, error: (r && r.error) || 'Native helper unavailable', notInstalled: !!(r && r.notInstalled) };
  await patchSyncSettings({ enabled: true, paused: false, transport: 'native', folderName: r.folderPath, needsPermission: false, lastError: null });
  const cycle = await runSyncCycle();
  return { ok: cycle === 'ok', folderPath: r.folderPath, cycle };
}

/** @returns {Promise<{ok: boolean, folderPath: string|null}>} */
export async function nativeGetFolder() {
  const r = await nativeRPC({ op: 'get-folder' }, 5000);
  return { ok: !!(r && r.ok), folderPath: (r && r.folderPath) || null };
}

/** Schedule a debounced sync after local edits (skips remote-caused writes). */
function scheduleSync() {
  if (_applyingRemote) return;
  clearTimeout(_writeTimer);
  _writeTimer = setTimeout(() => { runSyncCycle().catch(() => {}); }, WRITE_DEBOUNCE_MS);
}

/** Request permission (must be called from a user gesture) and run a cycle. */
export async function requestPermissionAndSync() {
  const handle = await loadDirHandle();
  if (!handle) return 'disabled';
  const perm = await handle.requestPermission({ mode: 'readwrite' });
  if (perm !== 'granted') return 'needs-permission';
  await patchSyncSettings({ needsPermission: false });
  return runSyncCycle();
}

/** Start watching: storage changes + polling + window focus. App tab only. */
export function startSyncWatcher() {
  if (_storageListener) stopSyncWatcher();
  _storageListener = (changes, area) => {
    if (area !== 'local' || !changes.prompts_storage) return;
    scheduleSync();
  };
  chrome.storage.onChanged.addListener(_storageListener);
  _pollTimer = setInterval(() => { runSyncCycle().catch(() => {}); }, POLL_INTERVAL_MS);
  window.addEventListener('focus', scheduleSync);
  runSyncCycle().catch(() => {});
}

export function stopSyncWatcher() {
  if (_storageListener) chrome.storage.onChanged.removeListener(_storageListener);
  _storageListener = null;
  if (_pollTimer) clearInterval(_pollTimer);
  _pollTimer = null;
  window.removeEventListener('focus', scheduleSync);
}

/** Disconnect: stop watching, drop handle + settings. Keeps local data. */
export async function disconnectSync() {
  stopSyncWatcher();
  await clearDirHandle();
  await chrome.storage.local.remove([SHADOW_KEY, 'sync_settings']);
}
