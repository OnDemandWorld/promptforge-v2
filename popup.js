// popup.js
import * as PromptStorage from './promptStorage.js';
import { checkConnection } from './ollama-service.js';
import { writeBackup } from './autoBackup.js';
import { t } from './i18n.js';

// ─── Status ───────────────────────────────────────────────────────────────
async function initStatus() {
  try {
    const result = await checkConnection();
    const dot = document.querySelector('#popup-status .status-dot');
    const text = document.getElementById('status-text');
    if (dot) dot.className = `status-dot ${result.connected ? 'connected' : 'disconnected'}`;
    if (text) text.textContent = result.connected
      ? t('popup_ollama_connected', null, 'Ollama connected')
      : t('popup_not_connected', null, 'Not connected');
  } catch {
    const dot = document.querySelector('#popup-status .status-dot');
    const text = document.getElementById('status-text');
    if (dot) dot.className = 'status-dot disconnected';
    if (text) text.textContent = t('popup_not_connected', null, 'Not connected');
  }
}

// Search & List
const searchInput = document.getElementById('popup-search');
const listEl = document.getElementById('popup-list');
let debounceTimer;

// COMMENT: Guard element lookups — a missing element used to kill init entirely.
searchInput?.addEventListener('input', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(loadPrompts, 200); });

let loadSeq = 0; // #64 — drop stale overlapping renders
async function loadPrompts() {
  if (!listEl) return;
  const seq = ++loadSeq;
  listEl.innerHTML = '';
  const searchVal = searchInput.value.trim();
  let prompts = await PromptStorage.getPrompts();
  if (seq !== loadSeq) return; // #64 — a newer load superseded this one
  prompts = prompts.filter(p => !p._archived);

  if (searchVal) {
    const lower = searchVal.toLowerCase();
    prompts = prompts.filter(p => (p.title || '').toLowerCase().includes(lower) || (p.content || '').toLowerCase().includes(lower));
  }

  prompts.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  if (prompts.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;padding:24px;color:var(--color-text-secondary);font-size:13px;';
    empty.textContent = t('popup_no_prompts', null, 'No prompts found.');
    listEl.appendChild(empty);
    return;
  }

  for (const p of prompts) {
    const item = document.createElement('div');
    item.className = 'popup-prompt-item';
    const title = p.title || t('untitled', null, 'Untitled Prompt');
    const snippet = (p.content || '').substring(0, 80);

    const h4 = document.createElement('h4');
    h4.textContent = title;
    item.appendChild(h4);

    const para = document.createElement('p');
    para.textContent = snippet;
    item.appendChild(para);

    item.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(p.content);
        await PromptStorage.bumpUseCount(p.uuid);
        // COMMENT: #63 — write the backup now and await completion; the old 2s
        // debounce timer was killed by window.close() before it could fire.
        await writeBackup(await PromptStorage.getPrompts()).catch(() => {});
        h4.textContent = t('popup_copied', null, 'Copied! ✓');
        h4.style.color = 'var(--color-success)';
        setTimeout(() => window.close(), 800);
      } catch (e) {
        alert(t('popup_copy_failed', [e.message], 'Copy failed: ' + e.message));
      }
    });

    listEl.appendChild(item);
  }
}

// Open App
document.getElementById('open-app')?.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.sendMessage({ type: 'OPEN_APP_TAB' });
});

// Init
initStatus().catch(() => {});
loadPrompts().catch(() => {});
