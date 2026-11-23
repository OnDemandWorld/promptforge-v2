// autoBackup.js — File-based backup for cross-computer prompt sync
//
// Strategy:
// 1. Backups are written to a FIXED path under the Downloads directory
//    (Downloads/promptforge/promptforge-backup.json). chrome.downloads can only
//    write inside Downloads, so a save-as dialog could not honor an arbitrary
//    location for the recurring writes (#4) — the path is deterministic instead.
// 2. Subsequent auto-backups overwrite that same path via chrome.downloads.download
// 3. On app open, user can merge from the backup file
// 4. To sync across machines, point iCloud/Dropbox at the Downloads/promptforge
//    folder (or import the backup file manually on the other machine).

import { PROMPT_STORAGE_VERSION, getFolders, getPrompts, importPrompts } from './promptStorage.js';

const BACKUP_FILENAME = 'promptforge-backup.json';
const BACKUP_FOLDER = 'promptforge';
const BACKUP_PATH = `${BACKUP_FOLDER}/${BACKUP_FILENAME}`;
const SETTINGS_KEY = 'backup_settings';

// ─── Settings storage (chrome.storage.local) ──────────────────────────────

async function getSettings() {
  try {
    const data = await chrome.storage.local.get({ [SETTINGS_KEY]: null });
    return data[SETTINGS_KEY];
  } catch {
    return null;
  }
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

// COMMENT: #12/#13 — wait for a download's terminal state via onChanged instead
// of a short fixed poll. The blob URL is revoked only once the download finishes
// (revoking early invalidates an in-progress download); on timeout we resolve
// WITHOUT revoking so a slow download is not sabotaged. Resolves with the
// terminal state ('complete' | 'interrupted' | 'cancelled') or 'timeout'.
function waitForDownload(downloadId, url, timeoutMs) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (state) => {
      if (settled) return;
      settled = true;
      chrome.downloads.onChanged.removeListener(onChanged);
      clearTimeout(safety);
      if (state !== 'timeout') URL.revokeObjectURL(url);
      resolve(state);
    };
    const onChanged = (delta) => {
      if (delta.id !== downloadId || !delta.state) return;
      const st = delta.state.current;
      if (st === 'complete' || st === 'interrupted' || st === 'cancelled') finish(st);
    };
    chrome.downloads.onChanged.addListener(onChanged);
    const safety = setTimeout(() => finish('timeout'), timeoutMs);
    // Catch a state that already settled before the listener attached.
    chrome.downloads.search({ id: downloadId }, (items) => {
      const st = items && items[0] && items[0].state;
      if (st === 'complete' || st === 'interrupted' || st === 'cancelled') finish(st);
    });
  });
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Write the first backup to the fixed Downloads path and enable auto-backup.
 * COMMENT: #4 — uses saveAs:false so the file lands exactly at BACKUP_PATH,
 * which is what writeBackup() overwrites on every later cycle. A save-as
 * dialog let the user pick a location the recurring writes could not honor.
 * @param {Array} prompts - Array of prompt objects to write.
 * @returns {{ mode: string, enabled: boolean, filePath: string|null }}
 */
export async function pickBackupFile(prompts) {
  let folders = [];
  try { folders = await getFolders(); } catch { /* prompts-only backup is better than none */ }
  const data = JSON.stringify({
    version: PROMPT_STORAGE_VERSION,
    prompts,
    folders,
    exportedAt: new Date().toISOString()
  }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const downloadId = await new Promise((resolve, reject) => {
    chrome.downloads.download({
      url,
      filename: BACKUP_PATH,
      saveAs: false,
      conflictAction: 'overwrite'
    }, (id) => {
      if (chrome.runtime.lastError) {
        URL.revokeObjectURL(url);
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(id);
    });
  });

  // COMMENT: #12 — wait for the terminal state (no 15s guillotine that revoked
  // the blob while the download was still starting). A cancelled/interrupted
  // download must NOT leave backups "enabled".
  const state = await waitForDownload(downloadId, url, 120000);
  if (state === 'complete') {
    saveSettings({ mode: 'file', enabled: true, downloadPath: BACKUP_PATH });
    return { mode: 'file', enabled: true, filePath: BACKUP_PATH };
  }
  return { mode: 'file', enabled: false, filePath: null };
}

/**
 * Get current backup settings.
 */
export async function getBackupSettings() {
  return await getSettings();
}

/**
 * Clear backup settings.
 */
export async function clearBackupFile() {
  await chrome.storage.local.remove(SETTINGS_KEY);
}

/**
 * Write current prompts (and folders) to the backup file.
 * Writes to the stored backup path (default: Downloads/promptforge/promptforge-backup.json).
 * @param {Array} prompts - Array of prompt objects
 */
export async function writeBackup(prompts) {
  const settings = await getSettings();
  if (!settings || !settings.enabled) return;

  // COMMENT: Folders were previously excluded, so any restore silently lost
  // the user's folder structure.
  let folders = [];
  try { folders = await getFolders(); } catch { /* prompts-only backup is better than none */ }

  const data = JSON.stringify({
    version: PROMPT_STORAGE_VERSION,
    prompts,
    folders,
    exportedAt: new Date().toISOString()
  }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const downloadId = await new Promise((resolve, reject) => {
    chrome.downloads.download({
      url,
      filename: settings.downloadPath || BACKUP_PATH,
      saveAs: false,
      conflictAction: 'overwrite'
    }, (id) => {
      if (chrome.runtime.lastError) {
        URL.revokeObjectURL(url);
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(id);
    });
  });

  // COMMENT: #13 — the download callback fires at START, not completion. Wait
  // for the terminal state and surface interrupted/cancelled failures instead
  // of silently leaving a stale backup; revoke the blob only once done (the
  // old 1s revoke could invalidate a large download mid-flight).
  const state = await waitForDownload(downloadId, url, 60000);
  if (state === 'interrupted' || state === 'cancelled') {
    console.error('[PromptForge] Backup write failed: download ' + state);
  }
}

/**
 * Import prompts from a user-selected backup file.
 * @returns {number} Number of prompts merged
 */
export async function autoImport() {
  const backupPrompts = await new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';

    input.addEventListener('change', async () => {
      if (!input.files || input.files.length === 0) {
        resolve(null);
        if (input.parentNode) document.body.removeChild(input);
        return;
      }
      try {
        const text = await input.files[0].text();
        const parsed = JSON.parse(text);
        // COMMENT: Resolve the whole payload (not just .prompts) so folders
        // restore too — importPrompts handles both shapes.
        resolve(parsed);
      } catch {
        resolve(null);
      }
      if (input.parentNode) document.body.removeChild(input);
    });

    document.body.appendChild(input);
    input.click();
    setTimeout(() => {
      if (input.parentNode) {
        document.body.removeChild(input);
        resolve(null);
      }
    }, 60000);
  });

  if (!backupPrompts) return 0;
  if (Array.isArray(backupPrompts) && backupPrompts.length === 0) return 0;

  // COMMENT: #53 — return the net number of prompts added, not the total
  // library size, so the "Merged N prompts" toast is accurate.
  const before = (await getPrompts()).length;
  const merged = await importPrompts(backupPrompts);
  const after = Array.isArray(merged) ? merged.length : 0;
  return Math.max(0, after - before);
}

/**
 * Debounced backup trigger shared by every caller (popup.js, app.js, and the
 * storage-change listener below). COMMENT: Previously popup.js and this file
 * each hand-rolled the same 2s debounce; now there's one implementation, and
 * it always backs up the freshest state (prompts + folders).
 */
let _backupTimer = null;
export function scheduleBackup() {
  clearTimeout(_backupTimer);
  _backupTimer = setTimeout(async () => {
    try {
      writeBackup(await getPrompts()).catch(() => {});
    } catch { /* storage unavailable; skip this round */ }
  }, 2000);
}

/**
 * Setup auto-export: watches for prompt changes and triggers backup.
 * Call this once when app.html loads. Safe to call repeatedly — it replaces any
 * previously registered listener instead of stacking a new one each call.
 */
let _autoBackupListener = null;
export function startAutoBackup() {
  if (_autoBackupListener) {
    chrome.storage.onChanged.removeListener(_autoBackupListener);
  }
  _autoBackupListener = (changes, area) => {
    if (area !== 'local' || !changes.prompts_storage) return;
    scheduleBackup();
  };
  chrome.storage.onChanged.addListener(_autoBackupListener);
}
