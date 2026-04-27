/* ai-operations.js
 * COMMENT: Extracted AI-related methods from content.js PromptUIManager
 * to reduce file size and improve maintainability.
 *
 * These methods depend on globals injected by content.js:
 *   createEl, qs, SELECTORS, PromptStorageManager, PromptUIManager
 */

/* --------------------------------------------------------------------------
   Inline toast helper — avoids alert() blocking dialogs
   -------------------------------------------------------------------------- */
function _toast(msg, type = 'info', duration = 2500) {
  const t = createEl('div', {}, [msg]);
  t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:8px 16px;border-radius:8px;font-size:13px;z-index:100001;color:#fff;transition:opacity 0.2s;';
  t.style.backgroundColor = type === 'error' ? '#dc3545' : type === 'success' ? '#198754' : '#1a73e8';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 200); }, duration);
}

/**
 * COMMENT: Improve a prompt via Ollama and update it in place.
 * @param {string} promptUuid
 * @param {HTMLElement|null} listEl
 */
async function improvePrompt(promptUuid, listEl) {
  try {
    const { improvePrompt: ollamaImprove, looksLikeResponseInsteadOfPrompt } = await import(chrome.runtime.getURL('ollama-service.js'));
    const prompts = await PromptStorageManager.getPrompts();
    const prompt = prompts.find(p => p.uuid === promptUuid);
    if (!prompt) return;

    const original = prompt.content;
    let buffer = '';
    let improving = true;

    // Show improving state
    const statusDiv = createEl('div', { className: 'opm-improving-status' });
    statusDiv.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a73e8;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;z-index:100000;display:flex;align-items:center;gap:8px;';
    statusDiv.innerHTML = '<span>Improving…</span><button style="background:rgba(255,255,255,0.3);border:none;color:#fff;padding:2px 8px;border-radius:4px;cursor:pointer;">Stop</button>';
    statusDiv.querySelector('button').addEventListener('click', () => { improving = false; statusDiv.remove(); });
    document.body.appendChild(statusDiv);

    const gen = await ollamaImprove(original);
    for await (const chunk of gen) {
      if (!improving) break;
      buffer += chunk;
    }

    statusDiv.remove();
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
      _toast('Prompt improved!', 'success');
    }
  } catch (e) { console.error('Improve failed:', e); _toast('Improvement failed: ' + e.message, 'error'); }
}

/**
 * COMMENT: Generate prompt variants via Ollama and store as version history.
 * @param {string} promptUuid
 * @param {HTMLElement|null} listEl
 */
async function generateVariants(promptUuid, listEl) {
  try {
    const { generateVariants: ollamaVariants } = await import(chrome.runtime.getURL('ollama-service.js'));
    const prompts = await PromptStorageManager.getPrompts();
    const prompt = prompts.find(p => p.uuid === promptUuid);
    if (!prompt) return;

    const statusDiv = createEl('div', { className: 'opm-improving-status' });
    statusDiv.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a73e8;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;z-index:100000;';
    statusDiv.textContent = 'Generating variants…';
    document.body.appendChild(statusDiv);

    const variants = await ollamaVariants(prompt.content, 3);
    statusDiv.remove();

    if (variants && variants.length > 0) {
      const g = 'variant-group-' + Date.now();
      for (let i = 0; i < variants.length; i++) {
        await PromptStorageManager.addVersion(promptUuid, variants[i], 'ai_variant', { variantGroup: g, variantIndex: i + 1 });
      }
      if (listEl) PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
      _toast(`Generated ${variants.length} variants!`, 'success');
    }
  } catch (e) { console.error('Variants failed:', e); _toast('Variant generation failed: ' + e.message, 'error'); }
}

/**
 * COMMENT: Auto-suggest title, category, and tags for a newly saved prompt.
 * @param {string} promptUuid
 * @param {HTMLElement|null} listEl
 */
async function autoSuggestMetadata(promptUuid, listEl) {
  try {
    const { suggestAllMetadata } = await import(chrome.runtime.getURL('ollama-service.js'));
    const prompts = await PromptStorageManager.getPrompts();
    const prompt = prompts.find(p => p.uuid === promptUuid);
    if (!prompt) return;

    const data = await chrome.storage.local.get({ autoSuggestMetadata: true });
    if (!data.autoSuggestMetadata) return;

    // Only suggest on first save (title is empty or default)
    if (prompt.title && prompt.title !== 'Untitled Prompt') return;

    const metadata = await suggestAllMetadata(prompt.content);
    const updates = {};
    if (metadata.title && metadata.title !== 'Untitled Prompt') updates.title = metadata.title;
    if (metadata.category && metadata.category !== 'Other') updates.category = metadata.category;
    const filteredTags = metadata.tags.filter(t => t !== 'untagged');
    if (filteredTags.length > 0) updates.tags = filteredTags;

    if (Object.keys(updates).length > 0) {
      const ps = await PromptStorageManager._ps();
      await ps.updatePrompt(promptUuid, { ...updates, updatedAt: new Date().toISOString() });
      if (listEl) PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
    }
  } catch (e) { console.warn('Auto-suggest failed:', e); }
}

// COMMENT: Expose globally so content.js and PromptUIManager can reference them
window.PFAIOperations = { improvePrompt, generateVariants, autoSuggestMetadata };
