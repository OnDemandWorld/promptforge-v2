// autoBackup.js — File-based backup for cross-computer prompt sync
//
// Strategy:
// 1. User picks a backup file location via Chrome's save-as dialog (saveAs: true)
// 2. Subsequent auto-backups overwrite that same path via chrome.downloads.download
// 3. On app open, user can merge from the backup file
// 4. If the user uses iCloud/Dropbox, the backup file syncs across machines

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
  const data = JSON.stringify({
    version: 3,
    prompts,
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
            clearInterval(poll);
            URL.revokeObjectURL(url);
            saveSettings({ mode: 'file', enabled: true, downloadPath: BACKUP_PATH });
            resolve({ mode: 'file', enabled: true, filePath: BACKUP_PATH });
            return;
          }
        }
      } catch {
        // ignore polling errors
      }
      if (attempts >= 30) {
        clearInterval(poll);
        URL.revokeObjectURL(url);
        saveSettings({ mode: 'file', enabled: true, downloadPath: BACKUP_PATH });
        resolve({ mode: 'file', enabled: true, filePath: BACKUP_PATH });
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
 * Returns null — not applicable for file mode.
 */
export async function getBackupHandle() {
  return null;
}

/**
 * Write current prompts to backup.
 * Always writes to Downloads/promptforge/promptforge-backup.json (overwrites).
 * @param {Array} prompts - Array of prompt objects
 */
export async function writeBackup(prompts) {
  const settings = await getSettings();
  if (!settings || !settings.enabled) return;

  const data = JSON.stringify({
    version: 3,
    prompts,
    exportedAt: new Date().toISOString()
  }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url,
    filename: BACKUP_PATH,
    saveAs: false,
    conflictAction: 'overwrite'
  }, () => setTimeout(() => URL.revokeObjectURL(url), 1000));
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
        resolve(parsed.prompts || []);
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

  if (!backupPrompts || backupPrompts.length === 0) return 0;

  const { mergePrompts } = await import('./promptStorage.js');
  const merged = await mergePrompts(backupPrompts);
  return merged.length;
}

/**
 * Returns null — file-based backup cannot be read programmatically.
 * Use autoImport() with a file picker instead.
 */
export async function readBackup() {
  return null;
}

/**
 * Always returns { hasBackup: false } — file backups cannot be checked automatically.
 * User must manually import via the UI.
 */
export async function checkBackupStatus() {
  return { hasBackup: false, exportedAt: null, isNewer: false };
}

/**
 * Setup auto-export: watches for prompt changes and triggers backup.
 * Call this once when app.html loads.
 */
export function startAutoBackup() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.prompts_storage) return;
    const store = changes.prompts_storage.newValue;
    if (store && Array.isArray(store.prompts)) {
      clearTimeout(window._pfbackupTimer);
      window._pfbackupTimer = setTimeout(() => {
        writeBackup(store.prompts).catch(() => {});
      }, 2000);
    }
  });
}
