// autoBackup.js — File-based backup for cross-computer prompt sync
//
// Strategy:
// 1. User picks a backup file location via Chrome's save-as dialog (saveAs: true)
// 2. Subsequent auto-backups overwrite that same path via chrome.downloads.download
// 3. On app open, user can merge from the backup file
// 4. If the user uses iCloud/Dropbox, the backup file syncs across machines

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

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Open Chrome's save-as dialog so the user can pick where to save the backup.
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
      saveAs: true,
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

  // Poll for download completion
  return new Promise((resolve) => {
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const items = await new Promise((r) => chrome.downloads.search({ id: downloadId }, r));
        if (items && items.length > 0) {
          const item = items[0];
          if (item.state === 'complete') {
            clearInterval(poll);
            URL.revokeObjectURL(url);
            saveSettings({ mode: 'file', enabled: true, downloadPath: BACKUP_PATH });
            resolve({ mode: 'file', enabled: true, filePath: BACKUP_PATH });
            return;
          }
          if (item.state === 'interrupted' || item.state === 'cancelled') {
            // COMMENT: A cancelled/interrupted save-as must NOT leave backups
            // "enabled" — the old code silently enabled writes to the default
            // Downloads path when the user said no.
            clearInterval(poll);
            URL.revokeObjectURL(url);
            resolve({ mode: 'file', enabled: false, filePath: null });
            return;
          }
        }
      } catch {
        // ignore polling errors
      }
      if (attempts >= 30) {
        clearInterval(poll);
        URL.revokeObjectURL(url);
        resolve({ mode: 'file', enabled: false, filePath: null });
      }
    }, 500);
  });
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

  chrome.downloads.download({
    url,
    filename: settings.downloadPath || BACKUP_PATH,
    saveAs: false,
    conflictAction: 'overwrite'
  }, () => {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (chrome.runtime.lastError) {
      console.error('[PromptForge] Backup write failed:', chrome.runtime.lastError.message);
    }
  });
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

  const merged = await importPrompts(backupPrompts);
  return Array.isArray(merged) ? merged.length : 0;
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
