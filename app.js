// app.js — Full-page tab UI for PromptForge
// Uses chrome.storage.local via PromptStorage instead of Dexie

import * as PromptStorage from './promptStorage.js';
import { generateUUID } from './utils.js';
import { improvePrompt, generateVariants, suggestAllMetadata, checkConnection, looksLikeResponseInsteadOfPrompt } from './ollama-service.js';
import { getOpenAiSiteTabs, sendPromptToTab } from './integration-manager.js';
import * as AutoBackup from './autoBackup.js';

const CATEGORIES = [
  'Writing & Content', 'Coding & Development', 'Analysis & Research',
  'Creative & Design', 'Business & Marketing', 'Education & Learning',
  'Data & Technical', 'Communication & Email', 'Productivity & Planning', 'Other'
];

// ─── DOM helpers ──────────────────────────────────────────────────────────

function $(sel, parent = document) { return parent.querySelector(sel); }
function $$(sel, parent = document) { return Array.from(parent.querySelectorAll(sel)); }

// COMMENT: Close all open send dropdown menus in the library view
function closeAllSendMenus() {
  $$('.send-dropdown-menu.show').forEach(m => m.classList.remove('show'));
}

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') e.className = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') { for (const [dk, dv] of Object.entries(v)) e.dataset[dk] = dv; }
    else if (v != null && typeof v !== 'function') e.setAttribute(k, v);
  }
  for (const c of children) {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  }
  return e;
}

function toast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.2s'; setTimeout(() => t.remove(), 200); }, 4000);
}

function relativeTime(ts) {
  if (!ts) return 'never';
  const d = Date.now() - new Date(ts).getTime();
  const s = Math.floor(d / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), days = Math.floor(h / 24);
  if (s < 60) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

// ─── Theme ────────────────────────────────────────────────────────────────

async function initTheme() {
  const data = await chrome.storage.local.get({ theme: 'system' });
  applyTheme(data.theme);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async () => {
    const d = await chrome.storage.local.get({ theme: 'system' });
    if (d.theme === 'system') applyTheme('system');
  });
}

function applyTheme(theme) {
  if (theme === 'system') {
    document.documentElement.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// ─── Router ───────────────────────────────────────────────────────────────

const mainContent = document.getElementById('main-content');
const topnavLinks = document.querySelectorAll('.topnav-link');

function navigate(hash) { window.location.hash = hash; }

function setActiveNav(hash) {
  const route = hash.startsWith('#/editor') ? 'editor' : hash.replace('#/', '');
  topnavLinks.forEach(a => {
    a.classList.toggle('active', a.dataset.route === route);
  });
}

async function handleRoute() {
  const hash = window.location.hash || '#/library';
  setActiveNav(hash);

  if (hash.startsWith('#/editor/')) {
    const uuid = hash.split('/').slice(2).join('/');
    await renderEditor(mainContent, decodeURIComponent(uuid), navigate);
  } else if (hash === '#/editor') {
    await renderEditor(mainContent, null, navigate);
  } else if (hash === '#/settings') {
    await renderSettings(mainContent);
  } else {
    await renderLibrary(mainContent, navigate);
  }
}

// Click handlers for nav links
topnavLinks.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    navigate(a.getAttribute('href'));
  });
});

window.addEventListener('hashchange', handleRoute);

// ─── Library View ─────────────────────────────────────────────────────────

async function renderLibrary(container, onNavigate) {
  container.innerHTML = '';
  const wrapper = el('div', { className: 'library-container' });

  // Header
  const header = el('div', { className: 'library-header' });
  header.appendChild(el('h2', {}, ['Library']));
  const newBtn = el('button', { className: 'btn btn-primary' }, ['+ New Prompt']);
  newBtn.addEventListener('click', () => onNavigate('#/editor'));
  header.appendChild(newBtn);
  wrapper.appendChild(header);

  // Controls
  const controls = el('div', { className: 'library-controls' });
  const search = el('input', { className: 'input library-search', type: 'text', placeholder: 'Search prompts…' });
  controls.appendChild(search);

  const sortSelect = el('select', { className: 'library-sort' });
  for (const [v, l] of [['recentlyCreated', 'Recently Created'], ['recentlyModified', 'Recently Modified'], ['recentlyUsed', 'Recently Used'], ['mostUsed', 'Most Used'], ['alphabetical', 'Alphabetical']]) {
    sortSelect.appendChild(el('option', { value: v }, [l]));
  }
  controls.appendChild(sortSelect);
  wrapper.appendChild(controls);

  // Category pills
  const pillsContainer = el('div', { className: 'category-pills' });
  const allPill = el('button', { className: 'category-pill active' }, ['All']);
  pillsContainer.appendChild(allPill);

  const data = await chrome.storage.local.get({ categories: CATEGORIES });
  const categories = data.categories || CATEGORIES;
  let activeCategory = null;

  for (const cat of categories.sort()) {
    const pill = el('button', { className: 'category-pill' }, [cat]);
    pill.addEventListener('click', () => {
      $$('.category-pill', pillsContainer).forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = cat;
      loadPrompts();
    });
    pillsContainer.appendChild(pill);
  }

  allPill.addEventListener('click', () => {
    $$('.category-pill', pillsContainer).forEach(p => p.classList.remove('active'));
    allPill.classList.add('active');
    activeCategory = null;
    loadPrompts();
  });

  wrapper.appendChild(pillsContainer);

  // Prompt list
  const listArea = el('div', { className: 'prompt-list' });
  wrapper.appendChild(listArea);
  container.appendChild(wrapper);

  let debounceTimer;
  search.addEventListener('input', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(loadPrompts, 200); });
  sortSelect.addEventListener('change', loadPrompts);

  await loadPrompts();

  async function loadPrompts() {
    listArea.innerHTML = '';
    const sortBy = sortSelect.value;
    const searchVal = search.value.trim();
    let prompts = await PromptStorage.getPrompts();

    // Filter by archive (hide archived by default)
    prompts = prompts.filter(p => !p._archived);

    // Filter by category
    if (activeCategory) prompts = prompts.filter(p => p.category === activeCategory);

    // Filter by search (title, content, tags, category)
    if (searchVal) {
      const lower = searchVal.toLowerCase();
      prompts = prompts.filter(p =>
        (p.title || '').toLowerCase().includes(lower) ||
        (p.content || '').toLowerCase().includes(lower) ||
        (p.tags || []).some(t => t.toLowerCase().includes(lower)) ||
        (p.category || '').toLowerCase().includes(lower)
      );
    }

    // Sort
    switch (sortBy) {
      case 'recentlyUsed': prompts.sort((a, b) => new Date(b.lastUsedAt || b.createdAt) - new Date(a.lastUsedAt || a.createdAt)); break;
      case 'mostUsed': prompts.sort((a, b) => (b.useCount || 0) - (a.useCount || 0)); break;
      case 'recentlyModified': prompts.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)); break;
      case 'alphabetical': prompts.sort((a, b) => ((a.title || '~~~~~').toLowerCase().localeCompare((b.title || '~~~~~').toLowerCase()))); break;
      default: prompts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    }

    if (prompts.length === 0) {
      listArea.appendChild(el('div', { className: 'empty-state' }, [
        el('p', {}, [searchVal ? 'No prompts match your search.' : 'No prompts yet. Click \'New Prompt\' to create your first one.'])
      ]));
      return;
    }

    for (const p of prompts) {
      const card = el('div', { className: 'prompt-list-card card' });

      // Header
      const hdr = el('div', { className: 'card-header' });
      hdr.appendChild(el('h4', {}, [p.title || 'Untitled Prompt']));
      const favBtn = el('button', { className: `btn btn-sm ${(p.favorite ? 'btn-primary' : 'btn-secondary')}`, title: p.favorite ? 'Unfavorite' : 'Favorite' }, [p.favorite ? '★' : '☆']);
      favBtn.addEventListener('click', async () => {
        await PromptStorage.updatePrompt(p.uuid, { favorite: !p.favorite });
        loadPrompts();
      });
      hdr.appendChild(favBtn);
      card.appendChild(hdr);

      // Body
      card.appendChild(el('div', { className: 'card-body' }, [(p.content || '').substring(0, 150)]));

      // Footer
      const footer = el('div', { className: 'card-footer' });
      const tagsDiv = el('div', { className: 'tags' });
      for (const t of (p.tags || [])) {
        const tagSpan = el('span', { className: 'tag', style: 'cursor:pointer;' }, [t]);
        tagSpan.title = `Search for "${t}"`;
        tagSpan.addEventListener('click', (e) => {
          e.stopPropagation();
          search.value = t;
          loadPrompts();
        });
        tagsDiv.appendChild(tagSpan);
      }
      footer.appendChild(tagsDiv);
      const vCount = (p.versions || []).length || 1;
      footer.appendChild(el('span', {}, [`v${vCount} · ${p.useCount || 0} uses · ${relativeTime(p.updatedAt || p.createdAt)}`]));
      card.appendChild(footer);

      // Actions
      const actions = el('div', { className: 'actions' });
      const copyBtn = el('button', { className: 'btn btn-sm btn-primary' }, ['Copy']);
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(p.content);
          await PromptStorage.updatePrompt(p.uuid, { useCount: (p.useCount || 0) + 1, lastUsedAt: new Date().toISOString() });
          toast('Copied!', 'success', 1000);
        } catch { toast('Copy failed', 'error'); }
      });
      actions.appendChild(copyBtn);

      const editBtn = el('button', { className: 'btn btn-sm btn-secondary' }, ['Edit']);
      editBtn.addEventListener('click', () => onNavigate(`#/editor/${encodeURIComponent(p.uuid)}`));
      actions.appendChild(editBtn);

      // AI Suggest button — re-generate title, tags, category from content
      const suggestBtn = el('button', { className: 'btn btn-sm btn-secondary' }, ['✨ Suggest']);
      suggestBtn.title = 'AI-suggest title, tags, and category from content';
      suggestBtn.addEventListener('click', async () => {
        suggestBtn.disabled = true;
        suggestBtn.textContent = '…';
        try {
          const metadata = await suggestAllMetadata(p.content);
          const filteredTags = metadata.tags.filter(t => t !== 'untagged');
          const titleApplied = !!(metadata.title && metadata.title !== 'Untitled Prompt');
          const tagsApplied = filteredTags.length > 0;
          const categoryApplied = !!(metadata.category && metadata.category !== 'Other');

          const newTitle = titleApplied ? metadata.title : p.title;
          const newCategory = categoryApplied ? metadata.category : p.category;
          const newTags = tagsApplied ? [...new Set([...(p.tags || []), ...filteredTags])] : p.tags;

          await PromptStorage.updatePrompt(p.uuid, {
            title: newTitle,
            category: newCategory,
            tags: newTags,
            updatedAt: new Date().toISOString()
          });

          const parts = [];
          if (titleApplied) parts.push('title');
          if (tagsApplied) parts.push('tags');
          if (categoryApplied) parts.push('category');
          toast(parts.length ? `Suggested: ${parts.join(', ')}` : 'No new suggestions', parts.length ? 'success' : 'warning');
          loadPrompts();
        } catch (e) {
          toast('Suggestion failed: ' + e.message, 'error');
        } finally {
          suggestBtn.disabled = false;
          suggestBtn.textContent = '✨ Suggest';
        }
      });
      actions.appendChild(suggestBtn);

      const archiveBtn = el('button', { className: 'btn btn-sm btn-secondary' }, ['Archive']);
      archiveBtn.addEventListener('click', async () => {
        await PromptStorage.updatePrompt(p.uuid, { _archived: true });
        loadPrompts();
      });
      actions.appendChild(archiveBtn);

      // Send dropdown
      const sendWrap = el('div', { className: 'send-dropdown' });
      const sendBtn = el('button', { className: 'btn btn-sm btn-secondary' }, ['Send', el('span', { style: 'margin-left:4px;font-size:10px;' }, ['▼'])]);
      const sendMenu = el('div', { className: 'send-dropdown-menu' });

      sendBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const isOpen = sendMenu.classList.contains('show');
        closeAllSendMenus();
        if (isOpen) return;

        sendMenu.innerHTML = '<div class="send-dropdown-item" style="color:var(--color-text-secondary);">Loading tabs…</div>';
        sendMenu.classList.add('show');

        try {
          const tabs = await getOpenAiSiteTabs();
          sendMenu.innerHTML = '';

          if (tabs.length === 0) {
            sendMenu.appendChild(el('div', { className: 'send-dropdown-item', style: 'color:var(--color-text-secondary);font-style:italic;' }, ['No AI site tabs open']));
          } else {
            // Group by provider
            const grouped = {};
            for (const t of tabs) {
              if (!grouped[t.providerName]) grouped[t.providerName] = [];
              grouped[t.providerName].push(t);
            }

            for (const [providerName, providerTabs] of Object.entries(grouped)) {
              const header = el('div', { className: 'send-dropdown-item', style: 'font-weight:600;color:var(--color-text-secondary);cursor:default;font-size:11px;' }, [providerName]);
              sendMenu.appendChild(header);

              for (const tab of providerTabs) {
                const item = el('div', { className: 'send-dropdown-item' }, [
                  el('span', { style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;' }, [tab.title || 'Untitled Tab'])
                ]);
                item.addEventListener('click', async () => {
                  closeAllSendMenus();
                  const result = await sendPromptToTab(tab.tabId, p.content);
                  if (result.success) {
                    toast(`Sent to ${tab.providerName}`, 'success');
                    await PromptStorage.updatePrompt(p.uuid, { useCount: (p.useCount || 0) + 1, lastUsedAt: new Date().toISOString() });
                  } else {
                    toast('Send failed: ' + (result.error || 'unknown error'), 'error');
                  }
                });
                sendMenu.appendChild(item);
              }
            }
          }
        } catch (err) {
          sendMenu.innerHTML = '<div class="send-dropdown-item" style="color:var(--color-danger);">Error loading tabs</div>';
        }
      });

      sendWrap.appendChild(sendBtn);
      sendWrap.appendChild(sendMenu);
      actions.appendChild(sendWrap);
      card.appendChild(actions);

      // Click card body to open editor (buttons still handle their own clicks)
      card.addEventListener('click', (e) => {
        if (e.target.closest('button, input, .send-dropdown-menu')) return;
        onNavigate(`#/editor/${encodeURIComponent(p.uuid)}`);
      });

      listArea.appendChild(card);
    }
  }
}

// ─── Editor View ──────────────────────────────────────────────────────────

let improveController = null;

async function renderEditor(container, promptUuid, onNavigate) {
  container.innerHTML = '';

  const wrapper = el('div', { className: 'editor-container' });

  // Header
  const header = el('div', { className: 'editor-header' });
  const backBtn = el('button', { className: 'btn btn-secondary' }, ['← Library']);
  backBtn.addEventListener('click', () => onNavigate('#/library'));
  header.appendChild(backBtn);
  const titleEl = el('h2', {}, [promptUuid ? 'Edit Prompt' : 'New Prompt']);
  header.appendChild(titleEl);
  header.appendChild(el('span', { className: 'editor-save-indicator', id: 'save-indicator' }));
  wrapper.appendChild(header);

  // Title
  const titleInput = el('input', { className: 'editor-title-input', type: 'text', placeholder: 'Prompt title…' });
  wrapper.appendChild(titleInput);

  // Meta row
  const metaRow = el('div', { className: 'editor-meta' });
  const data = await chrome.storage.local.get({ categories: CATEGORIES });
  const categories = data.categories || CATEGORIES;
  const catSelect = el('select', { className: 'editor-category-select' });
  catSelect.appendChild(el('option', { value: '' }, ['Uncategorized']));
  for (const c of categories.sort()) catSelect.appendChild(el('option', { value: c }, [c]));
  metaRow.appendChild(catSelect);

  // Tag input
  const tagContainer = el('div', { style: 'flex:1;display:flex;align-items:center;gap:4px;flex-wrap:wrap;' });
  const tagInput = el('input', { className: 'editor-tag-input', placeholder: 'Add tag…', autocomplete: 'off' });
  let currentTags = [];
  function renderTags() {
    tagContainer.innerHTML = '';
    for (const t of currentTags) {
      const pill = el('span', { className: 'tag' }, [t, ' ', el('span', { className: 'remove' }, ['×'])]);
      pill.querySelector('.remove').addEventListener('click', () => { currentTags = currentTags.filter(x => x !== t); renderTags(); });
      tagContainer.appendChild(pill);
    }
    tagContainer.appendChild(tagInput);
  }
  tagInput.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.value.trim()) {
      e.preventDefault();
      const t = tagInput.value.replace(',', '').trim().toLowerCase().replace(/\s+/g, '-');
      if (!currentTags.includes(t)) { currentTags.push(t); renderTags(); }
      tagInput.value = '';
    }
  });
  renderTags();
  metaRow.appendChild(tagContainer);
  wrapper.appendChild(metaRow);

  // Textarea
  const textarea = el('textarea', { className: 'editor-textarea', placeholder: 'Write your prompt here…' });
  wrapper.appendChild(textarea);

  // Actions
  const actions = el('div', { className: 'editor-actions' });
  const saveBtn = el('button', { className: 'btn btn-primary' }, ['Save Prompt']);
  actions.appendChild(saveBtn);
  const improveBtn = el('button', { className: 'btn btn-secondary' }, ['Improve with AI']);
  actions.appendChild(improveBtn);
  const stopBtn = el('button', { className: 'btn btn-danger', style: 'display:none;' }, ['Stop']);
  actions.appendChild(stopBtn);
  const variantsBtn = el('button', { className: 'btn btn-secondary' }, ['Variants']);
  actions.appendChild(variantsBtn);
  const versionBtn = el('button', { className: 'btn btn-secondary' }, ['Version History']);
  actions.appendChild(versionBtn);
  wrapper.appendChild(actions);
  container.appendChild(wrapper);

  // Load existing prompt
  if (promptUuid) {
    try {
      const prompts = await PromptStorage.getPrompts();
      const p = prompts.find(x => x.uuid === promptUuid);
      if (p) {
        textarea.value = p.content || '';
        if (p.title) titleInput.value = p.title;
        if (p.category) catSelect.value = p.category;
        currentTags = [...(p.tags || [])];
        renderTags();
      } else {
        toast('Prompt not found', 'error');
        onNavigate('#/library');
        return;
      }
    } catch (e) { toast('Error loading prompt: ' + e.message, 'error'); }
  }

  // Events
  let dirty = false;
  textarea.addEventListener('input', () => { dirty = true; });
  textarea.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      if (e.shiftKey && textarea.value.substring(start - 2, start) === '  ') {
        textarea.value = textarea.value.substring(0, start - 2) + textarea.value.substring(start);
        textarea.selectionStart = textarea.selectionEnd = start - 2;
      } else {
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(textarea.selectionEnd);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }
      dirty = true;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); doSave(); }
  });

  saveBtn.addEventListener('click', doSave);
  improveBtn.addEventListener('click', doImprove);
  stopBtn.addEventListener('click', doStop);
  variantsBtn.addEventListener('click', doVariants);
  versionBtn.addEventListener('click', doVersionHistory);

  async function doSave() {
    const content = textarea.value.trim();
    if (!content) { toast('Prompt content cannot be empty', 'warning'); return; }

    const saveIndicator = document.getElementById('save-indicator');
    const isFirstSave = !promptUuid;
    const needsAutoSuggest = isFirstSave &&
      (titleInput.value.trim() === '' || titleInput.value.trim() === 'Untitled Prompt') &&
      currentTags.length === 0 &&
      !catSelect.value;

    // Check if auto-suggest is enabled in settings
    let willAutoSuggest = false;
    if (needsAutoSuggest) {
      const settings = await chrome.storage.local.get({ autoSuggestMetadata: true });
      willAutoSuggest = settings.autoSuggestMetadata;
    }

    saveBtn.disabled = true;
    if (saveIndicator) saveIndicator.textContent = 'Saving…';

    try {
      if (isFirstSave) {
        const result = await PromptStorage.savePrompt({
          title: titleInput.value.trim() || 'Untitled Prompt',
          content,
          tags: [...currentTags],
          category: catSelect.value || null
        });
        promptUuid = result.prompt.uuid;
        titleEl.textContent = 'Edit Prompt';
      } else {
        await PromptStorage.updatePrompt(promptUuid, {
          content,
          title: titleInput.value.trim() || null,
          tags: [...currentTags],
          category: catSelect.value || null,
          updatedAt: new Date().toISOString()
        });
        await PromptStorage.addVersion(promptUuid, content, 'manual_edit');
      }
      dirty = false;

      // Auto-suggest metadata on first save (only when user didn't provide title, tags, or category)
      if (willAutoSuggest) {
        if (saveIndicator) saveIndicator.textContent = 'Analyzing prompt…';

        try {
          const metadata = await suggestAllMetadata(content);
          const filteredTags = metadata.tags.filter(t => t !== 'untagged');
          const titleApplied = !!(metadata.title && metadata.title !== 'Untitled Prompt');
          const tagsApplied = filteredTags.length > 0;
          const categoryApplied = !!(metadata.category && metadata.category !== 'Other');

          if (titleApplied) titleInput.value = metadata.title;
          if (categoryApplied) catSelect.value = metadata.category;
          if (tagsApplied) { currentTags = filteredTags; renderTags(); }

          await PromptStorage.updatePrompt(promptUuid, {
            title: titleInput.value || metadata.title,
            category: catSelect.value || metadata.category,
            tags: currentTags.length > 0 ? currentTags : filteredTags,
            updatedAt: new Date().toISOString()
          });

          const parts = [];
          if (titleApplied) parts.push('title');
          if (tagsApplied) parts.push('tags');
          if (categoryApplied) parts.push('category');

          if (parts.length > 0) {
            toast(`Saved! Auto-filled ${parts.join(', ')}.`, 'success', 2500);
          } else {
            toast('Saved!', 'success', 1500);
          }
        } catch (_) {
          toast('Saved! (AI suggestion skipped)', 'warning', 2000);
        }
      } else {
        toast('Saved!', 'success', 1500);
      }
    } catch (e) {
      toast('Save failed: ' + e.message, 'error');
    } finally {
      saveBtn.disabled = false;
      if (saveIndicator) saveIndicator.textContent = '';
    }
  }

  async function doImprove() {
    const content = textarea.value.trim();
    if (!content) { toast('Nothing to improve', 'warning'); return; }
    const snapshot = textarea.value;
    if (promptUuid) await PromptStorage.addVersion(promptUuid, content, 'manual_edit');

    improveBtn.disabled = true; improveBtn.textContent = 'Improving…';
    stopBtn.style.display = 'inline-flex';
    textarea.setAttribute('readonly', ''); textarea.style.opacity = '0.6';
    improveController = new AbortController();

    try {
      let buffer = '';
      const gen = await improvePrompt(content, { signal: improveController.signal });
      for await (const chunk of gen) { buffer += chunk; textarea.value = buffer; }
      buffer = buffer.replace(/^(?:here|sure|okay|the improved|improved|below)[^\n]*\n?/i, '').trim();
      textarea.value = buffer;

      // Sanity check: did the model produce a response instead of a rewritten prompt?
      if (buffer && looksLikeResponseInsteadOfPrompt(buffer)) {
        throw new Error('Model produced a response instead of a rewritten prompt');
      }

      if (promptUuid && buffer) {
        await PromptStorage.addVersion(promptUuid, buffer, 'ai_improvement');
        toast('Prompt improved!', 'success');
      }
    } catch (e) {
      if (!e.message.includes('aborted')) toast('Improvement failed: ' + e.message, 'error');
      textarea.value = snapshot;
    } finally {
      improveController = null; textarea.removeAttribute('readonly'); textarea.style.opacity = '1';
      improveBtn.disabled = false; improveBtn.textContent = 'Improve with AI'; stopBtn.style.display = 'none';
    }
  }

  function doStop() { if (improveController) { improveController.abort(); improveController = null; } }

  async function doVariants() {
    const content = textarea.value.trim();
    if (!content) { toast('Nothing to generate variants for', 'warning'); return; }
    variantsBtn.disabled = true; variantsBtn.textContent = 'Generating…';
    try {
      const variants = await generateVariants(content, 3);
      if (promptUuid) {
        const g = generateUUID();
        for (let i = 0; i < variants.length; i++) {
          await PromptStorage.addVersion(promptUuid, variants[i], 'ai_variant', { variantGroup: g, variantIndex: i + 1 });
        }
      }
      // Show modal
      showVariantModal(variants, (text) => { textarea.value = text; dirty = true; toast('Variant loaded — edit and save', 'success'); });
    } catch (e) { toast('Variant generation failed: ' + e.message, 'error'); }
    finally { variantsBtn.disabled = false; variantsBtn.textContent = 'Variants'; }
  }

  async function doVersionHistory() {
    if (!promptUuid) { toast('Save the prompt first', 'warning'); return; }
    const versions = await PromptStorage.getVersions(promptUuid);
    showVersionModal(versions);
  }
}

// ─── Modal helpers ────────────────────────────────────────────────────────

function showVariantModal(variants, onUse) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('div');
  header.className = 'modal-header';
  header.appendChild(document.createElement('h3')).textContent = 'AI Variants';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close'; closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => overlay.remove());
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  for (let i = 0; i < variants.length; i++) {
    const card = document.createElement('div');
    card.style.cssText = 'border:1px solid var(--color-border);border-radius:8px;padding:16px;margin-bottom:12px;';
    const hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
    hdr.appendChild(document.createElement('strong')).textContent = `Variant ${i + 1}`;
    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:4px;';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-sm btn-secondary'; copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => navigator.clipboard.writeText(variants[i]));
    btns.appendChild(copyBtn);
    const useBtn = document.createElement('button');
    useBtn.className = 'btn btn-sm btn-primary'; useBtn.textContent = 'Use ▶';
    useBtn.addEventListener('click', () => { onUse(variants[i]); overlay.remove(); });
    btns.appendChild(useBtn);
    hdr.appendChild(btns);
    card.appendChild(hdr);
    const pre = document.createElement('div');
    pre.style.cssText = 'font-family:var(--font-mono);font-size:13px;line-height:1.6;white-space:pre-wrap;color:var(--color-text-secondary);';
    pre.textContent = variants[i];
    card.appendChild(pre);
    body.appendChild(card);
  }

  modal.appendChild(header); modal.appendChild(body);
  overlay.appendChild(modal); overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.getElementById('modal-root').appendChild(overlay);
}

function showVersionModal(versions) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const modal = document.createElement('div');
  modal.className = 'modal';
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.appendChild(document.createElement('h3')).textContent = 'Version History';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close'; closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => overlay.remove());
  header.appendChild(closeBtn);
  const body = document.createElement('div');
  if (versions.length === 0) {
    body.appendChild(document.createElement('p')).textContent = 'No version history yet.';
  } else {
    for (let i = versions.length - 1; i >= 0; i--) {
      const v = versions[i];
      const row = document.createElement('div');
      row.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center;';
      const info = document.createElement('div');
      info.innerHTML = `<span>v${i + 1}</span> <span style="color:var(--color-text-secondary);font-size:12px;">${v.source} · ${relativeTime(v.createdAt)}</span>`;
      row.appendChild(info);
      const viewBtn = document.createElement('button');
      viewBtn.className = 'btn btn-sm btn-secondary'; viewBtn.textContent = 'View';
      viewBtn.addEventListener('click', () => {
        const m = document.createElement('div');
        m.className = 'modal';
        m.innerHTML = `<div class="modal-header"><h3>Version ${i + 1}</h3><button class="modal-close">×</button></div><div style="font-family:var(--font-mono);font-size:13px;white-space:pre-wrap;">${v.content.replace(/</g, '&lt;')}</div>`;
        m.querySelector('.modal-close').addEventListener('click', () => m.remove());
        document.getElementById('modal-root').appendChild(m);
      });
      row.appendChild(viewBtn);
      body.appendChild(row);
    }
  }
  modal.appendChild(header); modal.appendChild(body);
  overlay.appendChild(modal); overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.getElementById('modal-root').appendChild(overlay);
}

// ─── Settings View ────────────────────────────────────────────────────────

async function renderSettings(container) {
  container.innerHTML = '';
  const wrapper = el('div', { className: 'editor-container', style: 'max-width:700px;' });
  wrapper.appendChild(el('h2', {}, ['Settings']));

  // ── General Section ──
  wrapper.appendChild(await buildGeneralSettings());

  // ── Ollama Section ──
  wrapper.appendChild(await buildOllamaSettings());

  // ── AI Features Section ──
  wrapper.appendChild(await buildAIFeaturesSettings());

  // ── AI Site Integrations ──
  wrapper.appendChild(await buildIntegrationsSettings());

  // ── Data Management ──
  wrapper.appendChild(await buildDataSettings());

  container.appendChild(wrapper);
}

async function buildGeneralSettings() {
  const sec = document.createElement('div');
  sec.style.cssText = 'margin-bottom:24px;';
  sec.appendChild(el('h3', {}, ['General']));

  const data = await chrome.storage.local.get({
    theme: 'system',
    displayMode: 'standard',
    disableOverwrite: false,
    enableTags: true,
    forceDarkMode: false
  });
  const body = el('div', { style: 'display:flex;flex-direction:column;gap:12px;' });

  // Theme
  const themeRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  themeRow.appendChild(el('label', { style: 'min-width:140px;' }, ['Theme']));
  const themeSel = el('select');
  for (const opt of ['system', 'light', 'dark']) themeSel.appendChild(el('option', { value: opt }, [opt.charAt(0).toUpperCase() + opt.slice(1)]));
  themeSel.value = data.theme;
  themeSel.addEventListener('change', async () => {
    await chrome.storage.local.set({ theme: themeSel.value });
    applyTheme(themeSel.value);
  });
  themeRow.appendChild(themeSel);
  body.appendChild(themeRow);

  // Display Mode
  const displayRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  displayRow.appendChild(el('label', { style: 'min-width:140px;' }, ['Display Mode']));
  const displaySel = el('select');
  for (const opt of [['standard', 'Floating Button'], ['hotcorner', 'Hot Corner']]) {
    displaySel.appendChild(el('option', { value: opt[0] }, [opt[1]]));
  }
  displaySel.value = data.displayMode;
  displaySel.addEventListener('change', async () => {
    await chrome.storage.local.set({ displayMode: displaySel.value });
  });
  displayRow.appendChild(displaySel);
  body.appendChild(displayRow);

  // Append to text (disable overwrite)
  const appendRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  appendRow.appendChild(el('label', { style: 'min-width:140px;' }, ['Append to Input']));
  const appendCb = el('input', { type: 'checkbox' });
  appendCb.checked = data.disableOverwrite;
  appendCb.addEventListener('change', async () => {
    await chrome.storage.local.set({ disableOverwrite: appendCb.checked });
  });
  appendRow.appendChild(appendCb);
  body.appendChild(appendRow);

  // Enable Tags
  const tagsRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  tagsRow.appendChild(el('label', { style: 'min-width:140px;' }, ['Enable Tags']));
  const tagsCb = el('input', { type: 'checkbox' });
  tagsCb.checked = data.enableTags;
  tagsCb.addEventListener('change', async () => {
    await chrome.storage.local.set({ enableTags: tagsCb.checked });
  });
  tagsRow.appendChild(tagsCb);
  body.appendChild(tagsRow);

  // Force Dark Mode
  const darkRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  darkRow.appendChild(el('label', { style: 'min-width:140px;' }, ['Force Dark Panel']));
  const darkCb = el('input', { type: 'checkbox' });
  darkCb.checked = data.forceDarkMode;
  darkCb.addEventListener('change', async () => {
    await chrome.storage.local.set({ forceDarkMode: darkCb.checked });
  });
  darkRow.appendChild(darkCb);
  body.appendChild(darkRow);

  const heading = sec.querySelector('h3');
  heading.parentNode.insertBefore(body, heading.nextSibling);
  return sec;
}

async function buildOllamaSettings() {
  const sec = document.createElement('div');
  sec.style.cssText = 'margin-bottom:24px;';
  sec.appendChild(el('h3', {}, ['Ollama Connection']));

  const data = await chrome.storage.local.get({
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'gemma4:latest',
    ollamaNumCtx: 8192,
    useThinking: true,
    ollamaBearerToken: ''
  });

  const body = el('div', { style: 'display:flex;flex-direction:column;gap:12px;' });

  // URL
  const urlRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  urlRow.appendChild(el('label', { style: 'min-width:140px;' }, ['Ollama URL']));
  const urlInput = el('input', { type: 'text', style: 'flex:1;' });
  urlInput.value = data.ollamaUrl;
  urlInput.addEventListener('change', async () => {
    await chrome.storage.local.set({ ollamaUrl: urlInput.value });
  });
  urlRow.appendChild(urlInput);
  body.appendChild(urlRow);

  // Model
  const modelRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  modelRow.appendChild(el('label', { style: 'min-width:140px;' }, ['Model']));
  const modelSel = el('select', { style: 'flex:1;' });
  modelSel.appendChild(el('option', {}, ['Loading models…']));
  try {
    const res = await fetch(`${data.ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const json = await res.json();
      modelSel.innerHTML = '';
      const models = json.models?.map(m => m.name) || [];
      if (models.length === 0) {
        modelSel.appendChild(el('option', {}, ['No models found']));
      } else {
        for (const m of models) {
          const o = el('option', { value: m }, [m]);
          if (m === data.ollamaModel) o.selected = true;
          modelSel.appendChild(o);
        }
      }
    }
  } catch {
    modelSel.innerHTML = '';
    modelSel.appendChild(el('option', {}, ['Could not connect']));
  }
  modelSel.addEventListener('change', async () => {
    if (modelSel.value && modelSel.value !== 'No models found' && modelSel.value !== 'Could not connect') {
      await chrome.storage.local.set({ ollamaModel: modelSel.value });
    }
  });
  modelRow.appendChild(modelSel);
  body.appendChild(modelRow);

  // Context Window
  const ctxRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  ctxRow.appendChild(el('label', { style: 'min-width:140px;' }, ['Context Window']));
  const ctxInput = el('input', { type: 'number', min: '2048', max: '32768', style: 'width:100px;' });
  ctxInput.value = data.ollamaNumCtx;
  ctxInput.addEventListener('change', async () => {
    const v = Math.max(2048, Math.min(32768, parseInt(ctxInput.value, 10)));
    ctxInput.value = v;
    await chrome.storage.local.set({ ollamaNumCtx: v });
  });
  ctxRow.appendChild(ctxInput);
  body.appendChild(ctxRow);

  // Thinking Mode
  const thinkRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  thinkRow.appendChild(el('label', { style: 'min-width:140px;' }, ['Thinking Mode']));
  const thinkToggle = el('input', { type: 'checkbox' });
  thinkToggle.checked = data.useThinking;
  thinkToggle.addEventListener('change', async () => {
    await chrome.storage.local.set({ useThinking: thinkToggle.checked });
  });
  thinkRow.appendChild(thinkToggle);
  body.appendChild(thinkRow);

  // API Key (for remote Ollama servers, e.g. ollama.com)
  const tokenRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  tokenRow.appendChild(el('label', { style: 'min-width:140px;' }, ['API Key']));
  const tokenInput = el('input', { type: 'password', style: 'flex:1;', placeholder: 'Optional — for authenticated remote Ollama (Bearer token)' });
  tokenInput.value = data.ollamaBearerToken || '';
  tokenInput.addEventListener('change', async () => {
    await chrome.storage.local.set({ ollamaBearerToken: tokenInput.value.trim() });
  });
  tokenRow.appendChild(tokenInput);
  body.appendChild(tokenRow);

  // Test Connection
  const testBtn = el('button', { className: 'btn btn-secondary' }, ['Test Connection']);
  testBtn.addEventListener('click', async () => {
    const { checkConnection } = await import('./ollama-service.js');
    const result = await checkConnection();
    if (result.connected) toast(`Connected! ${result.models.length} model(s) available.`, 'success');
    else toast('Connection failed: ' + result.error, 'error');
  });
  body.appendChild(testBtn);

  const help = el('div', { style: 'font-size:12px;color:var(--color-text-secondary);margin-top:4px;' });
  help.innerHTML = 'Make sure Ollama is running with Chrome extension support:<br><code style="background:var(--color-bg-secondary);padding:2px 6px;border-radius:3px;">OLLAMA_ORIGINS="chrome-extension://*" ollama serve</code>';
  body.appendChild(help);

  const heading = sec.querySelector('h3');
  heading.parentNode.insertBefore(body, heading.nextSibling);
  return sec;
}

async function buildAIFeaturesSettings() {
  const sec = document.createElement('div');
  sec.style.cssText = 'margin-bottom:24px;';
  sec.appendChild(el('h3', {}, ['AI Features']));

  const data = await chrome.storage.local.get({ variantCount: 3, autoSuggestMetadata: true });
  const body = el('div', { style: 'display:flex;flex-direction:column;gap:12px;' });

  // Variant Count
  const vcRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  vcRow.appendChild(el('label', { style: 'min-width:140px;' }, ['Variant Count']));
  const vcInput = el('input', { type: 'number', min: '2', max: '5', style: 'width:60px;' });
  vcInput.value = data.variantCount;
  vcInput.addEventListener('change', async () => {
    const v = Math.max(2, Math.min(5, parseInt(vcInput.value, 10)));
    vcInput.value = v;
    await chrome.storage.local.set({ variantCount: v });
  });
  vcRow.appendChild(vcInput);
  body.appendChild(vcRow);

  // Auto-suggest Metadata
  const asmRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  asmRow.appendChild(el('label', { style: 'min-width:140px;' }, ['Auto-suggest Metadata']));
  const asmToggle = el('input', { type: 'checkbox' });
  asmToggle.checked = data.autoSuggestMetadata;
  asmToggle.addEventListener('change', async () => {
    await chrome.storage.local.set({ autoSuggestMetadata: asmToggle.checked });
  });
  asmRow.appendChild(asmToggle);
  body.appendChild(asmRow);

  const heading = sec.querySelector('h3');
  heading.parentNode.insertBefore(body, heading.nextSibling);
  return sec;
}

async function buildIntegrationsSettings() {
  const sec = document.createElement('div');
  sec.style.cssText = 'margin-bottom:24px;';
  sec.appendChild(el('h3', {}, ['AI Site Integrations']));

  try {
    const response = await fetch(chrome.runtime.getURL('llm_providers.json'));
    const providersData = await response.json();
    const stored = await chrome.storage.local.get({ aiProvidersMap: {} });
    const aiProvidersMap = stored.aiProvidersMap || {};

    const body = el('div', { style: 'display:flex;flex-direction:column;gap:8px;' });

    for (const provider of providersData.llm_providers) {
      const row = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
      const cb = el('input', { type: 'checkbox' });
      cb.checked = aiProvidersMap[provider.name]?.hasPermission === 'Yes';
      cb.addEventListener('change', async () => {
        if (cb.checked) {
          const granted = await chrome.permissions.request({ origins: [provider.pattern] });
          if (granted) {
            aiProvidersMap[provider.name] = { ...aiProvidersMap[provider.name], hasPermission: 'Yes' };
            await chrome.storage.local.set({ aiProvidersMap });
            toast(`${provider.name} enabled`, 'success');
          } else {
            cb.checked = false;
          }
        } else {
          try { await chrome.permissions.remove({ origins: [provider.pattern] }); } catch {}
          aiProvidersMap[provider.name] = { ...aiProvidersMap[provider.name], hasPermission: 'No' };
          await chrome.storage.local.set({ aiProvidersMap });
          toast(`${provider.name} disabled`, 'info');
        }
      });
      row.appendChild(cb);
      row.appendChild(el('span', {}, [provider.name]));
      body.appendChild(row);
    }

    const heading = sec.querySelector('h3');
    heading.parentNode.insertBefore(body, heading.nextSibling);
  } catch (e) {
    sec.appendChild(el('p', { style: 'color:var(--color-text-secondary);' }, ['Failed to load providers: ' + e.message]));
  }

  return sec;
}

async function buildDataSettings() {
  const sec = document.createElement('div');
  sec.style.cssText = 'margin-bottom:24px;';
  sec.appendChild(el('h3', {}, ['Data Management']));

  const body = el('div', { style: 'display:flex;flex-direction:column;gap:12px;' });

  // ── Auto Backup Section ──
  const backupSection = el('div', { style: 'margin-bottom:8px;' });
  backupSection.appendChild(el('h4', { style: 'font-size:13px;margin:0 0 8px;color:var(--color-text-secondary);' }, ['Backup to File']));

  // Description explaining the workflow
  const descEl = el('div', { style: 'font-size:12px;color:var(--color-text-secondary);margin:0 0 12px;line-height:1.5;' });
  descEl.textContent = 'Save your prompts to a JSON file in a cloud-synced folder (iCloud, Dropbox, etc.). On another machine, point to the same file to merge your prompts.';
  backupSection.appendChild(descEl);

  const statusRow = el('div', { style: 'display:flex;gap:8px;align-items:center;margin-bottom:8px;' });
  const statusLabel = el('span', { style: 'min-width:120px;font-size:13px;color:var(--color-text-secondary);' }, ['Backup:']);
  const statusText = el('span', { style: 'font-size:13px;' }, ['Off']);
  const pickBtn = el('button', { className: 'btn btn-sm btn-secondary' }, ['Choose Backup Location…']);
  const disableBtn = el('button', { className: 'btn btn-sm btn-danger', style: 'display:none;' }, ['Disable']);

  async function refreshBackupStatus() {
    const settings = await AutoBackup.getBackupSettings();
    if (settings && settings.enabled) {
      statusText.textContent = `On — Downloads/promptforge/`;
      disableBtn.style.display = '';
      pickBtn.style.display = '';
      pickBtn.textContent = 'Backup Now';
    } else {
      statusText.textContent = 'Off';
      pickBtn.style.display = '';
      pickBtn.textContent = 'Choose Backup Location…';
      disableBtn.style.display = 'none';
    }
  }

  async function handlePick(_repick = false) {
    try {
      const prompts = await PromptStorage.getPrompts();
      const result = await AutoBackup.pickBackupFile(prompts);
      if (result.enabled) {
        toast('Backup file saved. Auto-backup is now active.', 'success');
        await refreshBackupStatus();
        AutoBackup.startAutoBackup();
      }
    } catch (e) {
      toast('Failed: ' + e.message, 'error');
    }
  }

  pickBtn.addEventListener('click', () => handlePick(false));

  disableBtn.addEventListener('click', async () => {
    await AutoBackup.clearBackupFile();
    toast('Auto backup disabled', 'info');
    await refreshBackupStatus();
  });

  statusRow.appendChild(statusLabel);
  statusRow.appendChild(statusText);
  statusRow.appendChild(pickBtn);
  statusRow.appendChild(disableBtn);
  backupSection.appendChild(statusRow);

  // Import from backup button
  const importBackupBtn = el('button', { className: 'btn btn-sm btn-secondary' }, ['Import from Backup File']);
  importBackupBtn.addEventListener('click', async () => {
    try {
      const count = await AutoBackup.autoImport();
      if (count > 0) {
        toast(`Merged ${count} prompts from backup`, 'success');
      } else {
        toast('No backup data to import (or no file selected)', 'info');
      }
    } catch (e) {
      toast('Import failed: ' + e.message, 'error');
    }
  });
  backupSection.appendChild(importBackupBtn);

  body.appendChild(backupSection);

  // ── Manual Export/Import ──
  body.appendChild(el('hr', { style: 'border:none;border-top:1px solid var(--color-border);margin:8px 0;' }));

  // Export
  const exportBtn = el('button', { className: 'btn btn-secondary' }, ['Export All Data (JSON File)']);
  exportBtn.addEventListener('click', () => PromptStorage.exportPrompts());
  body.appendChild(exportBtn);

  // Import
  const importRow = el('div', { style: 'display:flex;gap:8px;align-items:center;' });
  const fileInput = el('input', { type: 'file', accept: '.json', style: 'flex:1;' });
  const mergeBtn = el('button', { className: 'btn btn-secondary' }, ['Import (Merge)']);
  const replaceBtn = el('button', { className: 'btn btn-danger' }, ['Import (Replace)']);

  async function doImport(mode) {
    if (!fileInput.files || fileInput.files.length === 0) { toast('Select a file first', 'warning'); return; }
    const file = fileInput.files[0];
    const text = await file.text();
    try {
      if (mode === 'replace') {
        // Replace mode: clear storage first
        await chrome.storage.local.clear();
        // Then import as merge
        const result = await PromptStorage.importPrompts(file);
        toast(`Replaced with ${Array.isArray(result) ? result.length : 'unknown'} prompts`, 'success');
      } else {
        const result = await PromptStorage.importPrompts(file);
        toast(`Imported ${Array.isArray(result) ? result.length : 'unknown'} prompts`, 'success');
      }
    } catch (e) { toast('Import failed: ' + e.message, 'error'); }
  }

  mergeBtn.addEventListener('click', () => doImport('merge'));
  replaceBtn.addEventListener('click', () => {
    if (confirm('This will REPLACE all your data. Are you sure?')) doImport('replace');
  });

  importRow.appendChild(fileInput);
  importRow.appendChild(mergeBtn);
  importRow.appendChild(replaceBtn);
  body.appendChild(importRow);

  // Delete all
  const deleteBtn = el('button', { className: 'btn btn-danger' }, ['Delete All Data']);
  deleteBtn.addEventListener('click', () => {
    const confirmation = prompt('Type DELETE to confirm:');
    if (confirmation === 'DELETE') chrome.storage.local.clear(() => location.reload());
  });
  body.appendChild(deleteBtn);

  // Refresh status on mount
  await refreshBackupStatus();

  const heading = sec.querySelector('h3');
  heading.parentNode.insertBefore(body, heading.nextSibling);
  return sec;
}

function createSettingSection(title, builder) {
  const sec = document.createElement('div');
  sec.style.cssText = 'margin-bottom:24px;';
  const heading = el('h3', {}, [title]);
  heading.style.cssText = 'font-size:15px;font-weight:600;margin-bottom:12px;';
  sec.appendChild(heading);
  builder().then(el => sec.appendChild(el));
  return sec;
}

// ─── Init ─────────────────────────────────────────────────────────────────

initTheme().catch(() => {});
handleRoute();

// Auto-backup: start listener on app load
(async function initAutoBackup() {
  try {
    const settings = await AutoBackup.getBackupSettings();
    if (!settings || !settings.enabled) return;

    // Start watching for changes
    AutoBackup.startAutoBackup();
  } catch { /* silently skip */ }
})();

// Ollama status
async function updateOllamaStatus() {
  const result = await checkConnection();
  const dot = document.querySelector('#ollama-status .status-dot');
  const text = document.getElementById('ollama-status-text');
  if (dot) dot.className = `status-dot ${result.connected ? 'connected' : 'disconnected'}`;
  if (text) {
    if (result.connected) {
      const modelName = result.model;
      text.textContent = modelName ? `Ollama · ${modelName}` : 'Ollama Connected';
    } else {
      text.textContent = 'Ollama disconnected';
    }
  }
}
updateOllamaStatus().catch(() => {});
window.addEventListener('focus', () => updateOllamaStatus().catch(() => {}));
