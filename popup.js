// popup.js
import * as PromptStorage from './promptStorage.js';
import { checkConnection } from './ollama-service.js';

// Status
async function initStatus() {
  try {
    const result = await checkConnection();
    const dot = document.querySelector('#popup-status .status-dot');
    const text = document.getElementById('status-text');
    if (dot) dot.className = `status-dot ${result.connected ? 'connected' : 'disconnected'}`;
    if (text) text.textContent = result.connected ? 'Ollama connected' : 'Not connected';
  } catch {
    const dot = document.querySelector('#popup-status .status-dot');
    const text = document.getElementById('status-text');
    if (dot) dot.className = 'status-dot disconnected';
    if (text) text.textContent = 'Not connected';
  }
}

// Search & List
const searchInput = document.getElementById('popup-search');
const listEl = document.getElementById('popup-list');
let debounceTimer;

searchInput.addEventListener('input', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(loadPrompts, 200); });

async function loadPrompts() {
  listEl.innerHTML = '';
  const searchVal = searchInput.value.trim();
  let prompts = await PromptStorage.getPrompts();
  prompts = prompts.filter(p => !p._archived);

  if (searchVal) {
    const lower = searchVal.toLowerCase();
    prompts = prompts.filter(p => (p.title || '').toLowerCase().includes(lower) || (p.content || '').toLowerCase().includes(lower));
  }

  prompts.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  if (prompts.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;padding:24px;color:var(--color-text-secondary);font-size:13px;';
    empty.textContent = 'No prompts found.';
    listEl.appendChild(empty);
    return;
  }

  for (const p of prompts) {
    const item = document.createElement('div');
    item.className = 'popup-prompt-item';
    const title = p.title || 'Untitled Prompt';
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
        await PromptStorage.updatePrompt(p.uuid, { useCount: (p.useCount || 0) + 1, lastUsedAt: new Date().toISOString() });
        h4.textContent = 'Copied! ✓';
        h4.style.color = 'var(--color-success)';
        setTimeout(() => window.close(), 800);
      } catch (e) {
        alert('Copy failed: ' + e.message);
      }
    });

    listEl.appendChild(item);
  }
}

// Open App
document.getElementById('open-app').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.sendMessage({ type: 'OPEN_APP_TAB' });
});

// Init
initStatus().catch(() => {});
loadPrompts().catch(() => {});
