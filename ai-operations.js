/* ai-operations.js
 * COMMENT: AI operations for the floating panel (improve / variants /
 * auto-suggest metadata).
 *
 * B1: all Ollama traffic is proxied through the service worker over a
 * runtime port ('pf-ai'). This file no longer fetches Ollama from page
 * context — that required the declarativeNetRequest Origin-rewrite rule,
 * which also covered requests initiated by the provider page's own scripts.
 * The rule is gone; the SW authorizes fetches via host_permissions instead.
 *
 * Depends on content-script globals: createEl, PromptStorageManager,
 * PromptUIManager.
 */

/* --------------------------------------------------------------------------
   Port RPC to the service worker
   -------------------------------------------------------------------------- */
let _aiPort = null;
let _aiReqId = 0;

function aiPort() {
  // COMMENT: Reconnect lazily — the SW can terminate; a dead port throws on
  // postMessage and the next call rebuilds it.
  if (!_aiPort) {
    _aiPort = chrome.runtime.connect({ name: 'pf-ai' });
    _aiPort.onDisconnect.addListener(() => { _aiPort = null; });
  }
  return _aiPort;
}

/** Unary RPC: resolves with msg.result, rejects with msg.error. */
function ollamaRPC(message) {
  return new Promise((resolve, reject) => {
    const port = aiPort();
    const id = ++_aiReqId;
    const onMessage = (msg) => {
      if (!msg || msg.id !== id) return;
      if (msg.error !== undefined) {
        port.onMessage.removeListener(onMessage);
        reject(new Error(msg.error));
      } else if ('result' in msg) {
        port.onMessage.removeListener(onMessage);
        resolve(msg.result);
      }
    };
    port.onMessage.addListener(onMessage);
    port.postMessage({ id, ...message });
  });
}

/**
 * Streaming RPC: returns an async generator of chunks with a `.cancel()`
 * method that aborts the worker-side request.
 */
function ollamaStream(message) {
  const port = aiPort();
  const id = ++_aiReqId;
  const queue = [];
  let resolveNext = null;
  let done = false;
  let error = null;

  const onMessage = (msg) => {
    if (!msg || msg.id !== id) return;
    if (msg.error !== undefined) error = new Error(msg.error);
    else if (msg.chunk !== undefined) queue.push(msg.chunk);
    if (msg.done || msg.error !== undefined) done = true;
    if (resolveNext) { const r = resolveNext; resolveNext = null; r(); }
  };
  port.onMessage.addListener(onMessage);
  port.postMessage({ id, ...message });

  const gen = (async function* () {
    try {
      while (true) {
        if (queue.length > 0) { yield queue.shift(); continue; }
        if (done) { if (error) throw error; return; }
        await new Promise(r => { resolveNext = r; });
      }
    } finally {
      port.onMessage.removeListener(onMessage);
    }
  })();
  gen.cancel = () => {
    try { port.postMessage({ id, cancel: true }); } catch { /* port gone */ }
  };
  return gen;
}

// COMMENT: Local copy of ollama-service's sanity check — the page no longer
// imports that module. Detects when the model produced a response instead of
// a rewritten prompt.
function looksLikeResponseInsteadOfPrompt(text) {
  return /^(I |I'll |I can |I cannot |I'm |I am |As an AI|Sure,|Here's|Okay,|Great question)/i.test(text.trim());
}

/* --------------------------------------------------------------------------
   Inline toast helper — avoids alert() blocking dialogs
   -------------------------------------------------------------------------- */
// COMMENT: v3 D-IV — i18n via the window contract (bundled i18n.js).
const tt = (key, subs, fallback) => (window.PFI18n ? window.PFI18n.t(key, subs || null, fallback) : fallback);

function _toast(msg, type = 'info', duration = 2500) {
  const t = createEl('div', {}, [msg]);
  t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:8px 16px;border-radius:8px;font-size:13px;z-index:100001;color:#fff;transition:opacity 0.2s;';
  t.style.backgroundColor = type === 'error' ? '#dc3545' : type === 'success' ? '#198754' : '#1a73e8';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 200); }, duration);
}

/* --------------------------------------------------------------------------
   Operations
   -------------------------------------------------------------------------- */

/**
 * COMMENT: Improve a prompt via Ollama (SW-proxied) and update it in place.
 * @param {string} promptUuid
 * @param {HTMLElement|null} listEl
 */
export async function improvePrompt(promptUuid, listEl) {
  try {
    const prompts = await PromptStorageManager.getPrompts();
    const prompt = prompts.find(p => p.uuid === promptUuid);
    if (!prompt) return;

    const original = prompt.content;
    let buffer = '';
    let improving = true;

    // Show improving state
    const statusDiv = createEl('div', { className: 'opm-improving-status' });
    statusDiv.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a73e8;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;z-index:100000;display:flex;align-items:center;gap:8px;';
    const statusLabel = createEl('span', {}, [tt('panel_improving', null, 'Improving…')]);
    const stopButton = createEl('button');
    stopButton.style.cssText = 'background:rgba(255,255,255,0.3);border:none;color:#fff;padding:2px 8px;border-radius:4px;cursor:pointer;';
    stopButton.textContent = tt('panel_stop', null, 'Stop');
    statusDiv.append(statusLabel, stopButton);

    const stream = ollamaStream({ op: 'improve', promptText: original, language: prompt.language });
    stopButton.addEventListener('click', () => {
      improving = false;
      stream.cancel(); // COMMENT: aborts the SW-side request (old code left it running)
      statusDiv.remove();
    });
    document.body.appendChild(statusDiv);

    try {
      for await (const chunk of stream) {
        if (!improving) break;
        buffer += chunk;
      }
    } finally {
      statusDiv.remove();
    }
    if (!improving || !buffer.trim()) return;

    buffer = buffer.replace(/^(?:here|sure|okay|the improved|improved|below)[^\n]*\n?/i, '').trim();

    // Sanity check: did the model produce a response instead of a rewritten prompt?
    if (buffer && looksLikeResponseInsteadOfPrompt(buffer)) {
      throw new Error('Model produced a response instead of a rewritten prompt');
    }

    if (buffer) {
      await PromptStorageManager.addVersion(promptUuid, buffer, 'ai_improvement');
      await PromptStorageManager._ps().then(ps => ps.updatePrompt(promptUuid, { content: buffer }));
      if (listEl) PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
      _toast(tt('panel_improved', null, 'Prompt improved!'), 'success');
    }
  } catch (e) {
    if (!/abort/i.test(e.message || '')) {
      console.error('Improve failed:', e);
      _toast(tt('panel_improve_failed', [e.message], 'Improvement failed: ' + e.message), 'error');
    }
  }
}

/**
 * COMMENT: Generate prompt variants via Ollama (SW-proxied) and store as
 * version history.
 * @param {string} promptUuid
 * @param {HTMLElement|null} listEl
 */
export async function generateVariants(promptUuid, listEl) {
  try {
    const prompts = await PromptStorageManager.getPrompts();
    const prompt = prompts.find(p => p.uuid === promptUuid);
    if (!prompt) return;

    const statusDiv = createEl('div', { className: 'opm-improving-status' });
    statusDiv.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a73e8;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;z-index:100000;';
    statusDiv.textContent = tt('panel_generating', null, 'Generating variants…');
    document.body.appendChild(statusDiv);

    let variants = [];
    try {
      variants = await ollamaRPC({ op: 'variants', promptText: prompt.content, count: 3, language: prompt.language });
    } finally {
      statusDiv.remove();
    }

    if (variants && variants.length > 0) {
      const g = 'variant-group-' + Date.now();
      for (let i = 0; i < variants.length; i++) {
        await PromptStorageManager.addVersion(promptUuid, variants[i], 'ai_variant', { variantGroup: g, variantIndex: i + 1 });
      }
      if (listEl) PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
      _toast(tt('panel_variants_generated', [String(variants.length)], `Generated ${variants.length} variants!`), 'success');
    }
  } catch (e) { console.error('Variants failed:', e); _toast(tt('panel_variants_failed', [e.message], 'Variant generation failed: ' + e.message), 'error'); }
}

/**
 * COMMENT: v3 feature D-V — translate/convert a prompt to another language
 * (script-only conversion for zh-HK↔zh-CN, full translation otherwise).
 * Stores the result as a version ('ai_translation') and updates the prompt's
 * language field so detection/rewrite stay consistent.
 * @param {string} promptUuid
 * @param {string} toLang - BCP-47 target code
 * @param {HTMLElement|null} listEl
 */
export async function translatePrompt(promptUuid, toLang, listEl) {
  try {
    const prompts = await PromptStorageManager.getPrompts();
    const prompt = prompts.find(p => p.uuid === promptUuid);
    if (!prompt || !toLang) return;
    const fromLang = prompt.language || null;
    const targetLabel = (window.PFLanguage && window.PFLanguage.languageMeta(toLang).label) || toLang;

    let buffer = '';
    let running = true;

    const statusDiv = createEl('div', { className: 'opm-improving-status' });
    statusDiv.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a73e8;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;z-index:100000;display:flex;align-items:center;gap:8px;';
    statusDiv.appendChild(createEl('span', {}, [tt('panel_translating', null, 'Translating…')]));
    const stopButton = createEl('button');
    stopButton.style.cssText = 'background:rgba(255,255,255,0.3);border:none;color:#fff;padding:2px 8px;border-radius:4px;cursor:pointer;';
    stopButton.textContent = tt('panel_stop', null, 'Stop');
    statusDiv.appendChild(stopButton);

    const stream = ollamaStream({ op: 'translate', promptText: prompt.content, toLang, fromLang });
    stopButton.addEventListener('click', () => {
      running = false;
      stream.cancel();
      statusDiv.remove();
    });
    document.body.appendChild(statusDiv);

    try {
      for await (const chunk of stream) {
        if (!running) break;
        buffer += chunk;
      }
    } finally {
      statusDiv.remove();
    }
    if (!running || !buffer.trim()) return;
    buffer = buffer.trim();

    await PromptStorageManager.addVersion(promptUuid, buffer, 'ai_translation', { from: fromLang, to: toLang });
    await PromptStorageManager._ps().then(ps => ps.updatePrompt(promptUuid, { content: buffer, language: toLang }));
    if (listEl) PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
    _toast(tt('panel_translated', [targetLabel], `Translated to ${targetLabel}`), 'success');
  } catch (e) {
    if (!/abort/i.test(e.message || '')) {
      console.error('Translate failed:', e);
      _toast(tt('toast_translate_failed', [e.message], 'Translation failed: ' + e.message), 'error');
    }
  }
}

/**
 * COMMENT: v3 feature D-VI — non-streaming full translation used by forks
 * (the result becomes a NEW prompt, so there is no textarea to stream into).
 * @param {string} promptText
 * @param {string} toLang
 * @param {string|null} fromLang
 * @returns {Promise<string>}
 */
export async function translateText(promptText, toLang, fromLang = null) {
  const stream = ollamaStream({ op: 'translate', promptText, toLang, fromLang });
  let buffer = '';
  for await (const chunk of stream) buffer += chunk;
  return buffer.trim();
}

/**
 * COMMENT: Auto-suggest title, category, and tags for a newly saved prompt.
 * @param {string} promptUuid
 * @param {HTMLElement|null} listEl
 */
export async function autoSuggestMetadata(promptUuid, listEl) {
  try {
    const prompts = await PromptStorageManager.getPrompts();
    const prompt = prompts.find(p => p.uuid === promptUuid);
    if (!prompt) return;

    const data = await chrome.storage.local.get({ autoSuggestMetadata: true });
    if (!data.autoSuggestMetadata) return;

    const metadata = await ollamaRPC({ op: 'suggest', promptText: prompt.content, language: prompt.language });
    const updates = {};
    // COMMENT: Only fill fields the user left empty — never overwrite a
    // user-provided title/tags/category.
    if ((!prompt.title || prompt.title === 'Untitled Prompt') && metadata.title && metadata.title !== 'Untitled Prompt') {
      updates.title = metadata.title;
    }
    if (!prompt.category && metadata.category && metadata.category !== 'Other') {
      updates.category = metadata.category;
    }
    if (!Array.isArray(prompt.tags) || prompt.tags.length === 0) {
      const filteredTags = (metadata.tags || []).filter(t => t !== 'untagged');
      if (filteredTags.length > 0) updates.tags = filteredTags;
    }

    if (Object.keys(updates).length > 0) {
      const ps = await PromptStorageManager._ps();
      await ps.updatePrompt(promptUuid, { ...updates, updatedAt: new Date().toISOString() });
      if (listEl) PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
    }
  } catch (e) { console.warn('Auto-suggest failed:', e); }
}

// COMMENT: Kept for backwards compatibility — content.js imports the named
// ES exports above via dynamic import().
window.PFAIOperations = { improvePrompt, generateVariants, autoSuggestMetadata, translatePrompt };
