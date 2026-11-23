// app.js — Full-page tab UI for PromptForge
// Uses chrome.storage.local via PromptStorage instead of Dexie

import * as PromptStorage from './promptStorage.js';
import { generateUUID } from './utils.js';
import { improvePrompt, generateVariants, suggestAllMetadata, checkConnection, autoSelectModel, looksLikeResponseInsteadOfPrompt, translatePrompt, DEFAULTS } from './ollama-service.js';
import { CATEGORIES as CATEGORY_DEFS, categoryNameFromId, canonicalCategoryId } from './categories.js';
import { t, relativeTimeLocalized } from './i18n.js';
import { getOpenAiSiteTabs, sendPromptToTab } from './integration-manager.js';
import * as AutoBackup from './autoBackup.js';
import { getSyncSettings, patchSyncSettings, saveDirHandle } from './sync/syncStore.js';
import { runSyncCycle, requestPermissionAndSync, startSyncWatcher, disconnectSync, nativeConnectFolder, nativeGetFolder } from './sync/syncEngine.js';
import { nativeHostAvailable } from './sync/nativeBridge.js';
import { SUPPORTED_LANGUAGES, DEFAULT_PROMPT_LANGUAGES, detectLanguage, languageMeta } from './language.js';

// ─── DOM helpers ──────────────────────────────────────────────────────────

function $(sel, parent = document) { return parent.querySelector(sel); }
function $$(sel, parent = document) { return Array.from(parent.querySelectorAll(sel)); }

// COMMENT: Close all open send dropdown menus in the library view
function closeAllSendMenus() {
  $$('.send-dropdown-menu.show').forEach(m => m.classList.remove('show'));
}
// COMMENT: Menus previously stayed open until another Send button happened to
// be clicked. Send buttons stopPropagation, so opening one doesn't trip this.
document.addEventListener('click', () => closeAllSendMenus());
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllSendMenus(); });

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

function toast(msg, type = 'info', duration = 4000) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  // COMMENT: Callers always passed a third duration arg that was ignored.
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.2s'; setTimeout(() => t.remove(), 200); }, duration);
}

// COMMENT: v3 D-III — locale-aware relative time ("3天前" in zh locales).
function relativeTime(ts) {
  return relativeTimeLocalized(ts);
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

let _routeSeq = 0; // #30 — generation token; stale overlapping renders bail before appending
async function handleRoute() {
  ++_routeSeq;
  const hash = window.location.hash || '#/library';
  setActiveNav(hash);

  if (hash.startsWith('#/editor/')) {
    const rawUuid = hash.split('/').slice(2).join('/');
    let uuid;
    try {
      uuid = decodeURIComponent(rawUuid);
    } catch {
      // COMMENT: Malformed hash (e.g. #/editor/%ff) threw URIError and left
      // the whole app on a blank screen with dead navigation.
      toast('Invalid editor link.', 'error');
      navigate('#/library');
      return;
    }
    await renderEditor(mainContent, uuid, navigate);
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

// COMMENT: #2 — guard against losing unsaved editor drafts. renderEditor
// registers a live dirty-check; navigation away from the editor (and tab
// close) prompts before discarding. Cleared when a non-editor view renders.
let _editorDirtyCheck = null;
let _editorHash = null;
window.addEventListener('beforeunload', e => {
  if (_editorDirtyCheck && _editorDirtyCheck()) {
    e.preventDefault();
    e.returnValue = '';
  }
});
window.addEventListener('hashchange', () => {
  const hash = window.location.hash || '#/library';
  if (_editorDirtyCheck && _editorDirtyCheck() && !hash.startsWith('#/editor')) {
    if (!confirm(t('editor_unsaved_confirm', null, 'You have unsaved changes. Leave without saving?'))) {
      // Stay on the editor: restore its hash without re-rendering.
      history.replaceState(null, '', _editorHash || '#/editor');
      return;
    }
  }
  handleRoute();
});

// ─── Library View ─────────────────────────────────────────────────────────

async function renderLibrary(container, onNavigate) {
  _editorDirtyCheck = null; // #2 — leaving the editor clears the unsaved guard
  const myRoute = _routeSeq; // #30
  container.innerHTML = '';
  const wrapper = el('div', { className: 'library-container' });

  // Header
  const header = el('div', { className: 'library-header' });
  header.appendChild(el('h2', {}, [t('lib_title', null, 'Library')]));
  const newBtn = el('button', { className: 'btn btn-primary' }, [t('lib_new', null, '+ New Prompt')]);
  newBtn.addEventListener('click', () => onNavigate('#/editor'));
  header.appendChild(newBtn);
  wrapper.appendChild(header);

  // Controls
  const controls = el('div', { className: 'library-controls' });
  const search = el('input', { className: 'input library-search', type: 'text', placeholder: t('lib_search_ph', null, 'Search prompts…') });
  controls.appendChild(search);

  const sortSelect = el('select', { className: 'library-sort' });
  for (const [v, key, fb] of [
    ['recentlyCreated', 'sort_recently_created', 'Recently Created'],
    ['recentlyModified', 'sort_recently_modified', 'Recently Modified'],
    ['recentlyUsed', 'sort_recently_used', 'Recently Used'],
    ['mostUsed', 'sort_most_used', 'Most Used'],
    ['alphabetical', 'sort_alphabetical', 'Alphabetical'],
  ]) {
    sortSelect.appendChild(el('option', { value: v }, [t(key, null, fb)]));
  }
  controls.appendChild(sortSelect);

  // COMMENT: v3 feature D — filter prompts by language. Prompts without a
  // language (legacy, undetected) appear only under "All Languages".
  const langFilter = el('select', { className: 'library-sort' });
  langFilter.appendChild(el('option', { value: '' }, [t('lib_all_languages', null, 'All Languages')]));
  for (const l of SUPPORTED_LANGUAGES) langFilter.appendChild(el('option', { value: l.code }, [l.label]));
  langFilter.addEventListener('change', loadPrompts);
  controls.appendChild(langFilter);

  wrapper.appendChild(controls);

  // Category pills
  const pillsContainer = el('div', { className: 'category-pills' });
  const allPill = el('button', { className: 'category-pill active' }, [t('lib_all', null, 'All')]);
  pillsContainer.appendChild(allPill);

  // COMMENT: C4 — category pills are keyed by canonical id; display names
  // come from the registry (localised display names arrive with D-III).
  let activeCategory = null;

  for (const cat of [...CATEGORY_DEFS].sort((a, b) => a.name.localeCompare(b.name))) {
    const pill = el('button', { className: 'category-pill' }, [t(`cat_${cat.id}`, null, cat.name)]);
    pill.addEventListener('click', () => {
      $$('.category-pill', pillsContainer).forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = cat.id;
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
  if (myRoute !== _routeSeq) return; // #30 — a newer route superseded this render
  container.appendChild(wrapper);

  let debounceTimer;
  search.addEventListener('input', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(loadPrompts, 200); });
  sortSelect.addEventListener('change', loadPrompts);

  let loadSeq = 0; // #29 — declared before the first call (let is not hoisted like the function)
  await loadPrompts();

  async function loadPrompts() {
    const seq = ++loadSeq;
    listArea.innerHTML = '';
    const sortBy = sortSelect.value;
    const searchVal = search.value.trim();
    let prompts = await PromptStorage.getPrompts();
    if (seq !== loadSeq) return; // #29 — a newer load superseded this one

    // Filter by archive (hide archived by default)
    prompts = prompts.filter(p => !p._archived);

    // Filter by category (C4 — match canonical id, deriving from legacy names)
    if (activeCategory) prompts = prompts.filter(p => (p.categoryId || canonicalCategoryId(p.category)) === activeCategory);

    // Filter by language (v3 feature D)
    const langVal = langFilter.value;
    if (langVal) prompts = prompts.filter(p => p.language === langVal);

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

    // v3 D-VI — group siblings by groupId for the language chips on cards.
    const groupMates = new Map();
    for (const p of prompts) {
      if (!p.groupId) continue;
      const arr = groupMates.get(p.groupId) || [];
      arr.push(p);
      groupMates.set(p.groupId, arr);
    }

    if (prompts.length === 0) {
      listArea.appendChild(el('div', { className: 'empty-state' }, [
        el('p', {}, [searchVal
          ? t('lib_empty_search', null, 'No prompts match your search.')
          : t('lib_empty_none', null, 'No prompts yet. Click \'New Prompt\' to create your first one.')])
      ]));
      return;
    }

    for (const p of prompts) {
      const card = el('div', { className: 'prompt-list-card card' });

      // Header
      const hdr = el('div', { className: 'card-header' });
      hdr.appendChild(el('h4', {}, [p.title || t('untitled', null, 'Untitled Prompt')]));
      const favBtn = el('button', { className: `btn btn-sm ${(p.favorite ? 'btn-primary' : 'btn-secondary')}`, title: p.favorite ? t('fav_remove', null, 'Unfavorite') : t('fav_add', null, 'Favorite') }, [p.favorite ? '★' : '☆']);
      favBtn.addEventListener('click', async () => {
        try { await PromptStorage.updatePrompt(p.uuid, { favorite: !p.favorite }); loadPrompts(); }
        catch (e) { toast(t('toast_failed', [e.message], 'Failed: ' + e.message), 'error'); } // #69
      });
      hdr.appendChild(favBtn);
      card.appendChild(hdr);

      // Body
      card.appendChild(el('div', { className: 'card-body' }, [(p.content || '').substring(0, 150)]));

      // Footer
      const footer = el('div', { className: 'card-footer' });
      // v3 D-VI — group chips: EN · 简 · 繁 jump buttons across forked siblings.
      const mates = p.groupId ? groupMates.get(p.groupId) : null;
      const grouped = !!(mates && mates.length > 1);
      if (p.language && !grouped) {
        // COMMENT: Standalone language badge — suppressed for grouped prompts,
        // where the chips below already mark the current language (bold).
        const meta = languageMeta(p.language);
        footer.appendChild(el('span', { className: 'tag', title: meta.label }, [meta.short]));
      }
      if (grouped) {
        const LANG_ORDER = ['en', 'zh-HK', 'zh-CN'];
        // COMMENT: Legacy/undetected siblings have language:null — fall back to
        // offline detection so chips never render "NULL".
        const effective = (m) => m.language || detectLanguage(m.content || '').code;
        const sorted = [...mates].sort((a, b) => LANG_ORDER.indexOf(effective(a)) - LANG_ORDER.indexOf(effective(b)));
        for (const m of sorted) {
          const lang = effective(m);
          if (!lang) continue;
          const meta = languageMeta(lang);
          const isCurrent = m.uuid === p.uuid;
          const chip = el('span', {
            className: 'tag',
            title: `${meta.label} — ${m.title || t('untitled', null, 'Untitled Prompt')}`,
            style: isCurrent
              ? 'cursor:default;font-weight:700;outline:1px solid var(--color-primary);'
              : 'cursor:pointer;opacity:0.75;',
          }, [meta.short]);
          if (!isCurrent) {
            chip.addEventListener('click', (e) => {
              e.stopPropagation();
              onNavigate(`#/editor/${encodeURIComponent(m.uuid)}`);
            });
          }
          footer.appendChild(chip);
        }
      }
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
      const when = relativeTime(p.updatedAt || p.createdAt);
      footer.appendChild(el('span', {}, [t('card_stats', [String(vCount), String(p.useCount || 0), when], `v${vCount} · ${p.useCount || 0} uses · ${when}`)]));
      card.appendChild(footer);

      // Actions
      const actions = el('div', { className: 'actions' });
      const copyBtn = el('button', { className: 'btn btn-sm btn-primary' }, [t('btn_copy', null, 'Copy')]);
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(p.content);
          // COMMENT: Atomic bump — the old read-from-stale-card-snapshot write
          // raced with the floating panel and dropped increments.
          await PromptStorage.bumpUseCount(p.uuid);
          toast(t('toast_copied', null, 'Copied!'), 'success', 1000);
        } catch { toast(t('toast_copy_failed', null, 'Copy failed'), 'error'); }
      });
      actions.appendChild(copyBtn);

      const editBtn = el('button', { className: 'btn btn-sm btn-secondary' }, [t('btn_edit', null, 'Edit')]);
      editBtn.addEventListener('click', () => onNavigate(`#/editor/${encodeURIComponent(p.uuid)}`));
      actions.appendChild(editBtn);

      // AI Suggest button — re-generate title, tags, category from content
      const suggestBtn = el('button', { className: 'btn btn-sm btn-secondary' }, [t('btn_suggest', null, '✨ Suggest')]);
      suggestBtn.title = t('btn_suggest_title', null, 'AI-suggest title, tags, and category from content');
      suggestBtn.addEventListener('click', async () => {
        suggestBtn.disabled = true;
        suggestBtn.textContent = '…';
        try {
          // COMMENT: v3 feature D-II — suggest in the prompt's own language.
          const metadata = await suggestAllMetadata(p.content, p.language || detectLanguage(p.content).code);
          const filteredTags = metadata.tags.filter(t => t !== 'untagged');
          const titleApplied = !!(metadata.title && metadata.title !== 'Untitled Prompt');
          const tagsApplied = filteredTags.length > 0;
          const categoryApplied = !!(metadata.category && metadata.category !== 'Other');

          const newTitle = titleApplied ? metadata.title : p.title;
          const newCategory = categoryApplied ? metadata.category : p.category;
          const newTags = tagsApplied ? [...new Set([...(p.tags || []), ...filteredTags])] : p.tags;

          // COMMENT: #20 — persist categoryId too. normalisePrompt prefers the
          // existing categoryId over the category name, so writing only
          // `category` left the stale id in place and the suggestion never took
          // effect in filtering/the editor.
          const suggestUpdate = {
            title: newTitle,
            category: newCategory,
            tags: newTags,
            updatedAt: new Date().toISOString()
          };
          if (categoryApplied) suggestUpdate.categoryId = canonicalCategoryId(newCategory) || null;
          await PromptStorage.updatePrompt(p.uuid, suggestUpdate);

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

      const archiveBtn = el('button', { className: 'btn btn-sm btn-secondary' }, [t('btn_archive', null, 'Archive')]);
      archiveBtn.addEventListener('click', async () => {
        try { await PromptStorage.updatePrompt(p.uuid, { _archived: true }); loadPrompts(); }
        catch (e) { toast(t('toast_failed', [e.message], 'Failed: ' + e.message), 'error'); } // #69
      });
      actions.appendChild(archiveBtn);

      // Send dropdown
      const sendWrap = el('div', { className: 'send-dropdown' });
      const sendBtn = el('button', { className: 'btn btn-sm btn-secondary' }, [t('btn_send', null, 'Send'), el('span', { style: 'margin-left:4px;font-size:10px;' }, ['▼'])]);
      const sendMenu = el('div', { className: 'send-dropdown-menu' });

      sendBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const isOpen = sendMenu.classList.contains('show');
        closeAllSendMenus();
        if (isOpen) return;

        sendMenu.innerHTML = '';
        sendMenu.appendChild(el('div', { className: 'send-dropdown-item', style: 'color:var(--color-text-secondary);' }, [t('send_loading', null, 'Loading tabs…')]));
        sendMenu.classList.add('show');

        try {
          const tabs = await getOpenAiSiteTabs();
          sendMenu.innerHTML = '';

          if (tabs.length === 0) {
            sendMenu.appendChild(el('div', { className: 'send-dropdown-item', style: 'color:var(--color-text-secondary);font-style:italic;' }, [t('send_no_tabs', null, 'No AI site tabs open')]));
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
                    toast(t('send_sent', [tab.providerName], `Sent to ${tab.providerName}`), 'success');
                    await PromptStorage.bumpUseCount(p.uuid);
                  } else {
                    toast(t('send_failed', [result.error || 'unknown error'], 'Send failed: ' + (result.error || 'unknown error')), 'error');
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

// COMMENT: Teardown ref only — the live controller is per-editor-session
// (declared inside renderEditor). The old module-level controller was shared
// across sessions: navigating away mid-stream then starting a new Improve let
// the old stream's finally{} null the new session's controller, killing its
// Stop button while the orphan kept writing into a detached textarea.
let activeEditorAbort = null;

async function renderEditor(container, promptUuid, onNavigate) {
  // Abort any stream still running from the previous editor session.
  if (activeEditorAbort) { activeEditorAbort.abort(); activeEditorAbort = null; }
  const myRoute = _routeSeq; // #30
  container.innerHTML = '';

  let improveController = null;

  // COMMENT: #2 — dirty tracking lives for the whole editor view so every
  // field (not just the textarea) can mark it, and the router guard can read it.
  let dirty = false;
  _editorDirtyCheck = () => dirty;
  _editorHash = window.location.hash || '#/editor';

  const wrapper = el('div', { className: 'editor-container' });

  // Header
  const header = el('div', { className: 'editor-header' });
  const backBtn = el('button', { className: 'btn btn-secondary' }, ['← Library']);
  backBtn.addEventListener('click', () => onNavigate('#/library'));
  header.appendChild(backBtn);
  const titleEl = el('h2', {}, [promptUuid ? t('editor_edit', null, 'Edit Prompt') : t('editor_new', null, 'New Prompt')]);
  header.appendChild(titleEl);
  header.appendChild(el('span', { className: 'editor-save-indicator', id: 'save-indicator' }));
  // AI processing indicator: spinner + label, shown while Ollama is working
  // (Improve / Variants / Auto-suggest). Stop for streaming Improve is the
  // existing stopBtn in the actions row.
  const aiStatus = el('span', { className: 'editor-ai-status', id: 'ai-status', style: 'display:none;' });
  header.appendChild(aiStatus);
  wrapper.appendChild(header);

  function setAiStatus(label) {
    aiStatus.innerHTML = '';
    aiStatus.appendChild(el('span', { className: 'ai-spinner' }));
    aiStatus.appendChild(document.createTextNode(' ' + label));
    aiStatus.style.display = 'inline-flex';
  }
  function clearAiStatus() {
    aiStatus.style.display = 'none';
    aiStatus.innerHTML = '';
  }

  // Title
  const titleInput = el('input', { className: 'editor-title-input', type: 'text', placeholder: t('editor_title_ph', null, 'Prompt title…') });
  wrapper.appendChild(titleInput);

  // Meta row
  const metaRow = el('div', { className: 'editor-meta' });
  // COMMENT: C4 — category select values are canonical ids; display names
  // from the registry.
  const catSelect = el('select', { className: 'editor-category-select' });
  catSelect.appendChild(el('option', { value: '' }, [t('editor_uncategorized', null, 'Uncategorized')]));
  for (const c of [...CATEGORY_DEFS].sort((a, b) => a.name.localeCompare(b.name))) {
    catSelect.appendChild(el('option', { value: c.id }, [t(`cat_${c.id}`, null, c.name)]));
  }
  metaRow.appendChild(catSelect);

  // COMMENT: v3 feature D — per-prompt language. "Auto" detects from content
  // at save time; low-confidence/undetected results store null and can be set
  // manually here afterwards.
  const { promptLanguages } = await chrome.storage.local.get({ promptLanguages: DEFAULT_PROMPT_LANGUAGES });
  const langSel = el('select', { className: 'editor-category-select' });
  langSel.appendChild(el('option', { value: 'auto' }, [t('editor_lang_auto', null, 'Auto-detect language')]));
  const langCodes = (Array.isArray(promptLanguages) && promptLanguages.length > 0) ? promptLanguages : DEFAULT_PROMPT_LANGUAGES;
  for (const code of langCodes) {
    const meta = languageMeta(code);
    langSel.appendChild(el('option', { value: meta.code }, [meta.label]));
  }
  // COMMENT: v3 feature D-II — honor the user's default-language preference
  // for new prompts (loading an existing prompt overrides this below).
  const { defaultPromptLanguage } = await chrome.storage.local.get({ defaultPromptLanguage: 'auto' });
  if (defaultPromptLanguage && defaultPromptLanguage !== 'auto'
      && [...langSel.options].some(o => o.value === defaultPromptLanguage)) {
    langSel.value = defaultPromptLanguage;
  }
  metaRow.appendChild(langSel);

  // COMMENT: v3 feature D-II — the effective language for AI operations:
  // the selected one, or offline detection when the selector is on Auto.
  function currentLanguage() {
    if (langSel.value !== 'auto') return langSel.value;
    const d = detectLanguage(textarea.value); // #22 — ignore low-confidence guesses
    return d.confidence >= 0.75 ? d.code : null;
  }

  // Tag input
  const tagContainer = el('div', { style: 'flex:1;display:flex;align-items:center;gap:4px;flex-wrap:wrap;' });
  const tagInput = el('input', { className: 'editor-tag-input', placeholder: t('editor_tag_ph', null, 'Add tag…'), autocomplete: 'off' });
  let currentTags = [];
  let currentGroupId = null; // v3 D-VI — language-linked fork group
  function renderTags() {
    tagContainer.innerHTML = '';
    for (const t of currentTags) {
      const pill = el('span', { className: 'tag' }, [t, ' ', el('span', { className: 'remove' }, ['×'])]);
      pill.querySelector('.remove').addEventListener('click', () => { currentTags = currentTags.filter(x => x !== t); dirty = true; renderTags(); });
      tagContainer.appendChild(pill);
    }
    tagContainer.appendChild(tagInput);
  }
  tagInput.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.value.trim()) {
      e.preventDefault();
      // COMMENT: Strip ALL commas — only the first was removed, so pasting
      // "a, b, c" created one tag containing commas.
      const t = tagInput.value.replace(/,/g, '').trim().toLowerCase().replace(/\s+/g, '-');
      if (!currentTags.includes(t)) { currentTags.push(t); dirty = true; renderTags(); }
      tagInput.value = '';
    }
  });
  renderTags();
  metaRow.appendChild(tagContainer);
  wrapper.appendChild(metaRow);

  // Textarea
  const textarea = el('textarea', { className: 'editor-textarea', placeholder: t('editor_content_ph', null, 'Write your prompt here…') });
  wrapper.appendChild(textarea);

  // Actions
  const actions = el('div', { className: 'editor-actions' });
  const saveBtn = el('button', { className: 'btn btn-primary' }, [t('editor_save', null, 'Save Prompt')]);
  actions.appendChild(saveBtn);
  const improveBtn = el('button', { className: 'btn btn-secondary' }, [t('editor_improve', null, 'Improve with AI')]);
  actions.appendChild(improveBtn);
  const stopBtn = el('button', { className: 'btn btn-danger', style: 'display:none;' }, [t('editor_stop', null, 'Stop')]);
  actions.appendChild(stopBtn);
  const variantsBtn = el('button', { className: 'btn btn-secondary' }, [t('editor_variants', null, 'Variants')]);
  actions.appendChild(variantsBtn);
  const translateBtn = el('button', { className: 'btn btn-secondary' }, [t('editor_translate', null, 'Translate')]);
  actions.appendChild(translateBtn);
  const forkBtn = el('button', { className: 'btn btn-secondary' }, [t('editor_fork', null, 'Fork ▾')]);
  actions.appendChild(forkBtn);
  const versionBtn = el('button', { className: 'btn btn-secondary' }, [t('editor_versions', null, 'Version History')]);
  actions.appendChild(versionBtn);
  wrapper.appendChild(actions);
  if (myRoute !== _routeSeq) return; // #30 — a newer route superseded this render
  container.appendChild(wrapper);

  // Load existing prompt
  if (promptUuid) {
    try {
      const prompts = await PromptStorage.getPrompts();
      const p = prompts.find(x => x.uuid === promptUuid);
      if (p) {
        textarea.value = p.content || '';
        currentGroupId = p.groupId || null;
        if (p.title) titleInput.value = p.title;
        const pCatId = p.categoryId || canonicalCategoryId(p.category);
        if (pCatId) {
          catSelect.value = pCatId;
        } else if (p.category) {
          // COMMENT: Custom/unknown category — keep it selectable verbatim so
          // the next save doesn't silently wipe it.
          if (![...catSelect.options].some(o => o.value === p.category)) {
            catSelect.appendChild(el('option', { value: p.category }, [p.category]));
          }
          catSelect.value = p.category;
        }
        // COMMENT: #23 — reflect the stored language even when it isn't in the
        // active set: append it as an option (like custom categories above) so
        // saving doesn't silently overwrite it with auto/default detection.
        if (p.language) {
          if (![...langSel.options].some(o => o.value === p.language)) {
            const meta = languageMeta(p.language);
            langSel.appendChild(el('option', { value: meta.code }, [meta.label]));
          }
          langSel.value = p.language;
        }
        currentTags = [...(p.tags || [])];
        renderTags();
      } else {
        toast('Prompt not found', 'error');
        onNavigate('#/library');
        return;
      }
    } catch (e) {
      toast('Error loading prompt: ' + e.message, 'error');
      // COMMENT: #62 — don't leave a blank editor still bound to the uuid (a
      // subsequent Save would wipe the stored prompt). Return to the library.
      onNavigate('#/library');
      return;
    }
  }

  // Events
  textarea.addEventListener('input', () => { dirty = true; });
  // COMMENT: #2 — title/category/language edits also mark the draft dirty.
  titleInput.addEventListener('input', () => { dirty = true; });
  catSelect.addEventListener('change', () => { dirty = true; });
  langSel.addEventListener('change', () => { dirty = true; });
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
  translateBtn.addEventListener('click', doTranslate);
  forkBtn.addEventListener('click', () => {
    // COMMENT: v3 feature D-VI — Fork ▾: duplicate (same language) or fork a
    // translated copy into a language-linked group (shared groupId).
    if (actions.querySelector('.fork-pick')) return;
    const fromLang = currentLanguage();
    const pick = el('select', { className: 'fork-pick', style: 'margin-left:8px;' });
    pick.appendChild(el('option', { value: '' }, [t('editor_fork_menu', null, 'Fork / duplicate…')]));
    pick.appendChild(el('option', { value: 'duplicate' }, [t('editor_duplicate', null, 'Duplicate (same language)')]));
    for (const l of SUPPORTED_LANGUAGES) {
      if (fromLang && l.code === fromLang) continue;
      pick.appendChild(el('option', { value: 'fork:' + l.code }, [t('editor_fork_lang', [l.label], `Fork to ${l.label}`)]));
    }
    pick.addEventListener('change', () => {
      const v = pick.value;
      pick.remove();
      if (v === 'duplicate') runFork(null);
      else if (v.startsWith('fork:')) runFork(v.slice(5));
    });
    actions.appendChild(pick);
  });
  versionBtn.addEventListener('click', doVersionHistory);

  async function doSave() {
    const content = textarea.value.trim();
    if (!content) { toast(t('toast_content_empty', null, 'Prompt content cannot be empty'), 'warning'); return; }

    // COMMENT: v3 feature D — resolve the prompt's language. "Auto" runs
    // offline detection; undetectable/mixed-script text stores null (no badge
    // until the user picks one from the selector).
    // COMMENT: #22 — only trust auto-detection at confidence >= 0.75; mixed
    // Traditional/Simplified text scores 0.2/0.5 and must store null (Auto),
    // not a guessed language (per language.js's documented contract).
    const detected = detectLanguage(content);
    const languageResolved = langSel.value === 'auto'
      ? (detected.confidence >= 0.75 ? detected.code : null)
      : langSel.value;

    // COMMENT: C4 — resolve category to (canonical id, English display name).
    const catIdResolved = canonicalCategoryId(catSelect.value);
    const categoryResolved = catIdResolved ? categoryNameFromId(catIdResolved) : (catSelect.value || null);

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
    if (saveIndicator) saveIndicator.textContent = t('editor_saving', null, 'Saving…'); // #68

    try {
      if (isFirstSave) {
        const result = await PromptStorage.savePrompt({
          title: titleInput.value.trim() || 'Untitled Prompt',
          content,
          tags: [...currentTags],
          category: categoryResolved,
          categoryId: catIdResolved,
          language: languageResolved
        });
        promptUuid = result.prompt.uuid;
        titleEl.textContent = t('editor_edit', null, 'Edit Prompt');
      } else {
        await PromptStorage.updatePrompt(promptUuid, {
          content,
          title: titleInput.value.trim() || null,
          tags: [...currentTags],
          category: categoryResolved,
          categoryId: catIdResolved,
          language: languageResolved,
          updatedAt: new Date().toISOString()
        });
        await PromptStorage.addVersion(promptUuid, content, 'manual_edit');
      }
      dirty = false;

      // Auto-suggest metadata on first save (only when user didn't provide title, tags, or category)
      if (willAutoSuggest) {
        setAiStatus('Analyzing prompt…');

        try {
          // COMMENT: #28 — capture field values before the AI round-trip so we
          // only fill fields the user hasn't edited while it was running.
          const titleAtSave = titleInput.value;
          const catAtSave = catSelect.value;
          const tagsAtSave = JSON.stringify(currentTags);
          const metadata = await suggestAllMetadata(content, languageResolved);
          const filteredTags = metadata.tags.filter(t => t !== 'untagged');
          const titleApplied = !!(metadata.title && metadata.title !== 'Untitled Prompt');
          const tagsApplied = filteredTags.length > 0;
          const categoryApplied = !!(metadata.category && metadata.category !== 'Other');

          if (titleApplied && titleInput.value === titleAtSave) titleInput.value = metadata.title;
          if (categoryApplied && catSelect.value === catAtSave) catSelect.value = canonicalCategoryId(metadata.category) || metadata.category;
          if (tagsApplied && JSON.stringify(currentTags) === tagsAtSave) { currentTags = filteredTags; renderTags(); }

          const aiCatId = canonicalCategoryId(catSelect.value);
          await PromptStorage.updatePrompt(promptUuid, {
            title: titleInput.value || metadata.title,
            category: aiCatId ? categoryNameFromId(aiCatId) : (catSelect.value || metadata.category),
            categoryId: aiCatId,
            tags: currentTags.length > 0 ? currentTags : filteredTags,
            updatedAt: new Date().toISOString()
          });

          const parts = [];
          if (titleApplied) parts.push(t('suggest_title', null, 'title'));
          if (tagsApplied) parts.push(t('suggest_tags', null, 'tags'));
          if (categoryApplied) parts.push(t('suggest_category', null, 'category'));

          if (parts.length > 0) {
            toast(t('toast_saved_auto', [parts.join(', ')], `Saved! Auto-filled ${parts.join(', ')}.`), 'success', 2500);
          } else {
            toast(t('toast_saved', null, 'Saved!'), 'success', 1500);
          }
        } catch (_) {
          toast(t('toast_saved_skip', null, 'Saved! (AI suggestion skipped)'), 'warning', 2000);
        }
      } else {
        toast(t('toast_saved', null, 'Saved!'), 'success', 1500); // #68
      }
    } catch (e) {
      toast(t('toast_save_failed', [e.message], 'Save failed: ' + e.message), 'error'); // #68
    } finally {
      saveBtn.disabled = false;
      if (saveIndicator) saveIndicator.textContent = '';
      clearAiStatus();
    }
  }

  async function doImprove() {
    const content = textarea.value.trim();
    if (!content) { toast(t('toast_nothing_improve', null, 'Nothing to improve'), 'warning'); return; }
    const snapshot = textarea.value;
    if (promptUuid) await PromptStorage.addVersion(promptUuid, content, 'manual_edit');

    improveBtn.disabled = true; improveBtn.textContent = t('panel_improving', null, 'Improving…');
    stopBtn.style.display = 'inline-flex';
    setAiStatus(t('panel_improving', null, 'Improving…'));
    textarea.setAttribute('readonly', ''); textarea.style.opacity = '0.6';
    improveController = new AbortController();
    activeEditorAbort = improveController;

    try {
      let buffer = '';
      const gen = await improvePrompt(content, { signal: improveController.signal, language: currentLanguage() });
      for await (const chunk of gen) { buffer += chunk; textarea.value = buffer; }
      buffer = buffer.replace(/^(?:here|sure|okay|the improved|improved|below)[^\n]*\n?/i, '').trim();
      // COMMENT: #26 — an empty model response must not silently wipe the draft
      // (the old unconditional assignment cleared the textarea with no toast).
      if (!buffer) {
        textarea.value = snapshot;
        toast(t('toast_improve_failed', ['empty model response'], 'Improvement failed: empty model response'), 'error');
        return;
      }
      textarea.value = buffer;

      // Sanity check: did the model produce a response instead of a rewritten prompt?
      if (buffer && looksLikeResponseInsteadOfPrompt(buffer)) {
        throw new Error('Model produced a response instead of a rewritten prompt');
      }

      if (promptUuid && buffer) {
        await PromptStorage.addVersion(promptUuid, buffer, 'ai_improvement');
        toast(t('toast_improved', null, 'Prompt improved!'), 'success');
      }
    } catch (e) {
      if (!e.message.includes('aborted')) toast(t('toast_improve_failed', [e.message], 'Improvement failed: ' + e.message), 'error');
      textarea.value = snapshot;
    } finally {
      if (activeEditorAbort === improveController) activeEditorAbort = null;
      improveController = null; textarea.removeAttribute('readonly'); textarea.style.opacity = '1';
      improveBtn.disabled = false; improveBtn.textContent = t('editor_improve', null, 'Improve with AI'); stopBtn.style.display = 'none';
      clearAiStatus();
    }
  }

  function doStop() { if (improveController) { improveController.abort(); improveController = null; } }

  async function doVariants() {
    const content = textarea.value.trim();
    if (!content) { toast(t('toast_nothing_variants', null, 'Nothing to generate variants for'), 'warning'); return; }
    variantsBtn.disabled = true; variantsBtn.textContent = t('panel_generating', null, 'Generating variants…');
    setAiStatus(t('panel_generating', null, 'Generating variants…'));
    try {
      // COMMENT: #21 — pass null so generateVariants falls back to the user's
      // variantCount setting; the hardcoded 3 always overrode it.
      const variants = await generateVariants(content, null, { language: currentLanguage() });
      if (promptUuid) {
        const g = generateUUID();
        for (let i = 0; i < variants.length; i++) {
          await PromptStorage.addVersion(promptUuid, variants[i], 'ai_variant', { variantGroup: g, variantIndex: i + 1 });
        }
      }
      // Show modal
      showVariantModal(variants, (text) => { textarea.value = text; dirty = true; toast(t('toast_variant_loaded', null, 'Variant loaded — edit and save'), 'success'); });
    } catch (e) { toast(t('toast_variants_failed', [e.message], 'Variant generation failed: ' + e.message), 'error'); }
    finally { variantsBtn.disabled = false; variantsBtn.textContent = t('editor_variants', null, 'Variants'); clearAiStatus(); }
  }

  // ── v3 feature D-V — translate/convert to another language ──
  // Click shows an inline target picker; choosing a language streams the
  // translation into the textarea (same UX as Improve), then stores it as a
  // version ('ai_translation') and flips the prompt's language field.
  function doTranslate() {
    if (!promptUuid) { toast(t('toast_save_first', null, 'Save the prompt first'), 'warning'); return; }
    if (actions.querySelector('.translate-pick')) return;
    const fromLang = currentLanguage();
    const pick = el('select', { className: 'translate-pick', style: 'margin-left:8px;' });
    pick.appendChild(el('option', { value: '' }, [t('editor_translate_to', null, 'Translate to…')]));
    for (const l of SUPPORTED_LANGUAGES) {
      if (fromLang && l.code === fromLang) continue;
      pick.appendChild(el('option', { value: l.code }, [l.label]));
    }
    pick.addEventListener('change', () => {
      const to = pick.value;
      pick.remove();
      if (to) runTranslate(fromLang, to);
    });
    actions.appendChild(pick);
  }

  async function runTranslate(fromLang, toLang) {
    const content = textarea.value.trim();
    if (!content) return;
    // COMMENT: #25 — keep the pre-translation text so a failure/Stop/empty
    // result can restore it instead of leaving a partial translation behind.
    const snapshot = textarea.value;
    // Snapshot the current text as a version before overwriting it.
    if (promptUuid) await PromptStorage.addVersion(promptUuid, content, 'manual_edit');
    improveBtn.disabled = true;
    translateBtn.disabled = true;
    stopBtn.style.display = 'inline-flex';
    textarea.setAttribute('readonly', ''); textarea.style.opacity = '0.6';
    setAiStatus(t('editor_translating', null, 'Translating…'));
    improveController = new AbortController();
    activeEditorAbort = improveController;
    try {
      let buffer = '';
      const gen = translatePrompt(content, toLang, { fromLang, signal: improveController.signal });
      for await (const chunk of gen) { buffer += chunk; textarea.value = buffer; }
      buffer = buffer.trim();
      // COMMENT: #25 — empty result: restore the original instead of leaving
      // the textarea cleared by the stream.
      if (!buffer) {
        textarea.value = snapshot;
        toast(t('toast_translate_failed', ['empty model response'], 'Translation failed: empty model response'), 'error');
        return;
      }
      if (buffer && promptUuid) {
        await PromptStorage.addVersion(promptUuid, buffer, 'ai_translation', { from: fromLang, to: toLang });
        await PromptStorage.updatePrompt(promptUuid, { content: buffer, language: toLang, updatedAt: new Date().toISOString() });
        langSel.value = toLang;
        const label = languageMeta(toLang).label;
        toast(t('toast_translated', [label], `Translated to ${label}`), 'success');
      }
    } catch (e) {
      if (!e.message.includes('aborted')) toast(t('toast_translate_failed', [e.message], 'Translation failed: ' + e.message), 'error');
      // COMMENT: #25 — restore the original text on failure/Stop so a partial
      // translation isn't left in the editor (mirrors doImprove).
      textarea.value = snapshot;
    } finally {
      if (activeEditorAbort === improveController) activeEditorAbort = null;
      improveController = null; textarea.removeAttribute('readonly'); textarea.style.opacity = '1';
      improveBtn.disabled = false; translateBtn.disabled = false; stopBtn.style.display = 'none';
      clearAiStatus();
    }
  }

  // ── v3 feature D-VI — fork/duplicate into a language-linked group ──
  // toLang = null → plain duplicate; otherwise translate into a new sibling
  // prompt sharing a groupId (created and back-filled onto the source on the
  // first fork). Keeps titles identical — the group chips carry the language.
  async function runFork(toLang) {
    const content = textarea.value.trim();
    if (!content) { toast(t('toast_content_empty', null, 'Prompt content cannot be empty'), 'warning'); return; }
    const title = titleInput.value.trim() || t('untitled', null, 'Untitled Prompt');
    const fromLang = currentLanguage();

    let groupId = currentGroupId;
    if (!groupId) {
      groupId = generateUUID();
      if (promptUuid) {
        await PromptStorage.updatePrompt(promptUuid, { groupId });
        currentGroupId = groupId;
      }
    }

    // COMMENT: Bugfix — back-fill the source's stored language when it was
    // never set (legacy/undetected), so the group's chips show a real
    // language for the original instead of "NULL".
    if (promptUuid && fromLang) {
      const all = await PromptStorage.getPrompts();
      const src = all.find(x => x.uuid === promptUuid);
      if (src && !src.language) {
        await PromptStorage.updatePrompt(promptUuid, { language: fromLang });
      }
    }

    forkBtn.disabled = true;
    let newContent = content;
    let newLang = fromLang;
    if (toLang && toLang !== fromLang) {
      stopBtn.style.display = 'inline-flex';
      // COMMENT: #31 — block Improve/Translate while fork translates so they
      // can't overwrite the shared improveController and orphan this stream.
      improveBtn.disabled = true; translateBtn.disabled = true;
      setAiStatus(t('editor_translating', null, 'Translating…'));
      improveController = new AbortController();
      activeEditorAbort = improveController;
      try {
        let buffer = '';
        const gen = translatePrompt(content, toLang, { fromLang, signal: improveController.signal });
        for await (const chunk of gen) { buffer += chunk; }
        newContent = buffer.trim();
        if (!newContent) throw new Error('empty translation');
        newLang = toLang;
      } catch (e) {
        if (!e.message.includes('aborted')) toast(t('toast_translate_failed', [e.message], 'Translation failed: ' + e.message), 'error');
        // COMMENT: #24 — re-enable Fork before returning; the outer try/finally
        // that normally re-enables it is never reached on this early return.
        forkBtn.disabled = false;
        improveBtn.disabled = false; translateBtn.disabled = false; // #31
        return;
      } finally {
        if (activeEditorAbort === improveController) activeEditorAbort = null;
        improveController = null;
        stopBtn.style.display = 'none';
        improveBtn.disabled = false; translateBtn.disabled = false; // #31
        clearAiStatus();
      }
    }
    try {
      const forkCatId = canonicalCategoryId(catSelect.value);
      const forkCat = forkCatId ? categoryNameFromId(forkCatId) : (catSelect.value || null);
      const res = await PromptStorage.savePrompt({
        title, content: newContent, language: newLang, groupId,
        tags: [...currentTags], category: forkCat, categoryId: forkCatId,
      });
      if (toLang) {
        const label = languageMeta(toLang).label;
        toast(t('toast_forked', [label], `Forked to ${label}`), 'success');
      } else {
        toast(t('toast_duplicated', null, 'Duplicated'), 'success');
      }
      onNavigate(`#/editor/${encodeURIComponent(res.prompt.uuid)}`);
    } catch (e) {
      toast(t('toast_failed', [e.message], 'Failed: ' + e.message), 'error');
    } finally {
      forkBtn.disabled = false;
    }
  }

  async function doVersionHistory() {
    if (!promptUuid) { toast(t('toast_save_first', null, 'Save the prompt first'), 'warning'); return; }
    // COMMENT: #69 — getVersions throws if the prompt was deleted elsewhere;
    // surface it instead of an unhandled rejection / dead button.
    try {
      const versions = await PromptStorage.getVersions(promptUuid);
      showVersionModal(versions);
    } catch (e) { toast(t('toast_failed', [e.message], 'Failed: ' + e.message), 'error'); }
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
  header.appendChild(document.createElement('h3')).textContent = t('modal_variants', null, 'AI Variants');
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
    hdr.appendChild(document.createElement('strong')).textContent = t('modal_variant', [String(i + 1)], `Variant ${i + 1}`);
    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:4px;';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-sm btn-secondary'; copyBtn.textContent = t('btn_copy', null, 'Copy');
    copyBtn.addEventListener('click', () => navigator.clipboard.writeText(variants[i]));
    btns.appendChild(copyBtn);
    const useBtn = document.createElement('button');
    useBtn.className = 'btn btn-sm btn-primary'; useBtn.textContent = t('modal_use', null, 'Use ▶');
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
  header.appendChild(document.createElement('h3')).textContent = t('modal_versions', null, 'Version History');
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close'; closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => overlay.remove());
  header.appendChild(closeBtn);
  const body = document.createElement('div');
  if (versions.length === 0) {
    body.appendChild(document.createElement('p')).textContent = t('modal_no_versions', null, 'No version history yet.');
  } else {
    for (let i = versions.length - 1; i >= 0; i--) {
      const v = versions[i];
      const row = document.createElement('div');
      row.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center;';
      const info = document.createElement('div');
      // COMMENT: textContent, not innerHTML — v.source comes from storage
      // (and with sync/import, potentially untrusted data).
      const vLabel = document.createElement('span');
      vLabel.textContent = `v${i + 1}`;
      const vMeta = document.createElement('span');
      vMeta.style.cssText = 'color:var(--color-text-secondary);font-size:12px;';
      vMeta.textContent = `${v.source} · ${relativeTime(v.createdAt)}`;
      info.append(vLabel, document.createTextNode(' '), vMeta);
      row.appendChild(info);
      const viewBtn = document.createElement('button');
      viewBtn.className = 'btn btn-sm btn-secondary'; viewBtn.textContent = t('modal_view', null, 'View');
      viewBtn.addEventListener('click', () => {
        // COMMENT: Built with DOM APIs — the old innerHTML version escaped
        // only "<" and would have become XSS the moment it moved into an
        // attribute context.
        // COMMENT: #70 — wrap in its own overlay nested inside the history
        // overlay, so closing the history modal also closes this one (the old
        // bare modal orphaned on the page and stacked on repeated View clicks).
        const mOverlay = document.createElement('div');
        mOverlay.className = 'modal-overlay';
        const m = document.createElement('div');
        m.className = 'modal';
        const mHeader = document.createElement('div');
        mHeader.className = 'modal-header';
        mHeader.appendChild(document.createElement('h3')).textContent = t('modal_version', [String(i + 1)], `Version ${i + 1}`);
        const mClose = document.createElement('button');
        mClose.className = 'modal-close'; mClose.textContent = '×';
        mClose.addEventListener('click', () => mOverlay.remove());
        mHeader.appendChild(mClose);
        m.appendChild(mHeader);
        const pre = document.createElement('div');
        pre.style.cssText = 'font-family:var(--font-mono);font-size:13px;white-space:pre-wrap;';
        pre.textContent = v.content;
        m.appendChild(pre);
        mOverlay.appendChild(m);
        mOverlay.addEventListener('click', e => { if (e.target === mOverlay) mOverlay.remove(); });
        overlay.appendChild(mOverlay);
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
  _editorDirtyCheck = null; // #2 — leaving the editor clears the unsaved guard
  const myRoute = _routeSeq; // #30
  container.innerHTML = '';
  const wrapper = el('div', { className: 'editor-container', style: 'max-width:700px;' });
  wrapper.appendChild(el('h2', {}, [t('settings_title', null, 'Settings')]));

  // ── General Section ──
  wrapper.appendChild(await buildGeneralSettings());

  // ── Languages Section (v3 feature D) ──
  wrapper.appendChild(await buildLanguageSettings());

  // ── Ollama Section ──
  wrapper.appendChild(await buildOllamaSettings());

  // ── AI Features Section ──
  wrapper.appendChild(await buildAIFeaturesSettings());

  // ── AI Site Integrations ──
  wrapper.appendChild(await buildIntegrationsSettings());

  // ── Folder Sync (v3 feature E) ──
  wrapper.appendChild(await buildSyncSettings());

  // ── Data Management ──
  wrapper.appendChild(await buildDataSettings());

  // ── About footer (version + branding) ──
  wrapper.appendChild(buildAboutFooter());

  if (myRoute !== _routeSeq) return; // #30 — a newer route superseded this render
  container.appendChild(wrapper);
}

function buildAboutFooter() {
  // COMMENT: Version comes from the manifest so it can never drift from the
  // shipped release; no need to dig it out of chrome://extensions.
  const version = chrome.runtime.getManifest().version;
  const linkStyle = 'color:var(--color-primary);text-decoration:none;';
  const footer = el('div', { style: 'margin-top:32px;padding-top:16px;border-top:1px solid var(--color-border);text-align:center;color:var(--color-text-secondary);font-size:12px;display:flex;flex-direction:column;gap:6px;align-items:center;' });
  footer.appendChild(el('div', { style: 'font-weight:600;' }, [`PromptForge v${version}`]));
  footer.appendChild(el('div', {}, [
    t('about_project_pre', null, 'An '),
    el('a', { href: 'https://odw.ai', target: '_blank', rel: 'noopener', style: linkStyle }, [t('about_project', null, 'ODW')]),
    t('about_project_mid', null, ' project · '),
    el('a', { href: 'https://github.com/OnDemandWorld/promptforge-v2', target: '_blank', rel: 'noopener', style: linkStyle }, [t('about_source', null, 'Source on GitHub')]),
  ]));
  return footer;
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

async function buildLanguageSettings() {
  const sec = document.createElement('div');
  sec.style.cssText = 'margin-bottom:24px;';
  sec.appendChild(el('h3', {}, [t('set_languages', null, 'Languages')]));

  const data = await chrome.storage.local.get({ promptLanguages: DEFAULT_PROMPT_LANGUAGES, defaultPromptLanguage: 'auto' });
  const active = (Array.isArray(data.promptLanguages) && data.promptLanguages.length > 0)
    ? data.promptLanguages
    : [...DEFAULT_PROMPT_LANGUAGES];

  const body = el('div', { style: 'display:flex;flex-direction:column;gap:12px;' });
  body.appendChild(el('div', { style: 'font-size:12px;color:var(--color-text-secondary);' },
    [t('set_lang_desc', null, 'Prompt languages shown in the editor selector and library filter.')]));

  // COMMENT: v3 feature D-II — user-chosen active language set. At least one
  // must stay active (re-check + toast if the last one is unchecked).
  const boxes = new Map();
  for (const lang of SUPPORTED_LANGUAGES) {
    const row = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
    const cb = el('input', { type: 'checkbox' });
    cb.checked = active.includes(lang.code);
    boxes.set(lang.code, cb);
    cb.addEventListener('change', async () => {
      const chosen = SUPPORTED_LANGUAGES.map(l => l.code).filter(code => boxes.get(code).checked);
      if (chosen.length === 0) {
        cb.checked = true;
        toast(t('toast_lang_min', null, 'At least one language must stay active'), 'warning');
        return;
      }
      await chrome.storage.local.set({ promptLanguages: chosen });
      toast(t('toast_lang_saved', null, 'Language preferences saved'), 'success', 1500);
    });
    row.append(cb, el('span', {}, [`${lang.label} (${lang.code})`]));
    body.appendChild(row);
  }

  // Default language for new prompts (Auto = detect on save)
  const defRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  defRow.appendChild(el('label', { style: 'min-width:140px;' }, [t('set_lang_default', null, 'Default for new prompts')]));
  const defSel = el('select', { style: 'flex:1;' });
  defSel.appendChild(el('option', { value: 'auto' }, [t('lang_default_auto', null, 'Auto-detect')]));
  for (const l of SUPPORTED_LANGUAGES) defSel.appendChild(el('option', { value: l.code }, [l.label]));
  defSel.value = (data.defaultPromptLanguage && [...defSel.options].some(o => o.value === data.defaultPromptLanguage))
    ? data.defaultPromptLanguage
    : 'auto';
  defSel.addEventListener('change', async () => {
    await chrome.storage.local.set({ defaultPromptLanguage: defSel.value });
    toast(t('toast_lang_default_saved', null, 'Default language saved'), 'success', 1500);
  });
  defRow.appendChild(defSel);
  body.appendChild(defRow);

  const heading = sec.querySelector('h3');
  heading.parentNode.insertBefore(body, heading.nextSibling);
  return sec;
}

async function buildOllamaSettings() {
  const sec = document.createElement('div');
  sec.style.cssText = 'margin-bottom:24px;';
  sec.appendChild(el('h3', {}, [t('set_ollama', null, 'Ollama Connection')]));

  const data = await chrome.storage.local.get({
    ollamaUrl: DEFAULTS.url,
    ollamaModel: DEFAULTS.model,
    ollamaNumCtx: DEFAULTS.numCtx,
    useThinking: true,
    ollamaBearerToken: ''
  });

  const body = el('div', { style: 'display:flex;flex-direction:column;gap:12px;' });

  // URL
  const urlRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  urlRow.appendChild(el('label', { style: 'min-width:140px;' }, [t('set_ollama_url', null, 'Ollama URL')]));
  const urlInput = el('input', { type: 'text', style: 'flex:1;' });
  urlInput.value = data.ollamaUrl;
  urlInput.addEventListener('change', async () => {
    const url = urlInput.value.trim();
    await chrome.storage.local.set({ ollamaUrl: url });
    // COMMENT: MV3 extension pages can only fetch hosts covered by
    // host_permissions (localhost/127.0.0.1:11434, ollama.com). For any other
    // origin, request permission now (user gesture) so the URL can work at
    // all — previously custom LAN servers failed silently with no clue why.
    try {
      const u = new URL(url);
      const builtIn = (u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === 'ollama.com');
      if (!builtIn) {
        const granted = await chrome.permissions.request({ origins: [`${u.protocol}//${u.host}/*`] });
        if (!granted) toast('Host permission not granted — this URL will fail to connect.', 'warning');
      }
    } catch { /* malformed URL — Test Connection will surface it */ }
  });
  urlRow.appendChild(urlInput);
  body.appendChild(urlRow);

  // Model
  const modelRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  modelRow.appendChild(el('label', { style: 'min-width:140px;' }, [t('set_model', null, 'Model')]));
  const modelSel = el('select', { style: 'flex:1;' });
  const OPT_LOADING = t('model_loading', null, 'Loading models…');
  const OPT_NONE = t('model_none', null, 'No models found');
  const OPT_NOCONN = t('model_noconn', null, 'Could not connect');
  modelSel.appendChild(el('option', {}, [OPT_LOADING]));
  try {
    const res = await fetch(`${data.ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const json = await res.json();
      modelSel.innerHTML = '';
      const models = json.models?.map(m => m.name) || [];
      if (models.length === 0) {
        modelSel.appendChild(el('option', {}, [OPT_NONE]));
      } else {
        for (const m of models) {
          const o = el('option', { value: m }, [m]);
          if (m === data.ollamaModel) o.selected = true;
          modelSel.appendChild(o);
        }
        // COMMENT: If the stored model no longer exists (or was never chosen
        // — fresh install), fall back to the first available model and
        // persist it so AI features target something that actually exists.
        if (models.length > 0 && !models.includes(data.ollamaModel)) {
          modelSel.value = models[0];
          await chrome.storage.local.set({ ollamaModel: models[0] });
          if (data.ollamaModel) toast(t('toast_model_switch', [data.ollamaModel, models[0]], `Model "${data.ollamaModel}" not found — switched to ${models[0]}`), 'warning');
        }
      }
    } else {
      // COMMENT: #32 — a non-OK response (401 without a token, 404 bad path)
      // must not leave the selector stuck on "Loading models…" forever.
      modelSel.innerHTML = '';
      modelSel.appendChild(el('option', {}, [OPT_NOCONN]));
    }
  } catch {
    modelSel.innerHTML = '';
    modelSel.appendChild(el('option', {}, [OPT_NOCONN]));
  }
  modelSel.addEventListener('change', async () => {
    if (modelSel.value && modelSel.value !== OPT_NONE && modelSel.value !== OPT_NOCONN) {
      await chrome.storage.local.set({ ollamaModel: modelSel.value });
    }
  });
  modelRow.appendChild(modelSel);
  body.appendChild(modelRow);

  // Context Window
  const ctxRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  ctxRow.appendChild(el('label', { style: 'min-width:140px;' }, [t('set_ctx', null, 'Context Window')]));
  const ctxInput = el('input', { type: 'number', min: '2048', max: '32768', style: 'width:100px;' });
  ctxInput.value = data.ollamaNumCtx;
  ctxInput.addEventListener('change', async () => {
    // COMMENT: parseInt('') is NaN, which Math.max/min propagate into storage
    // (the input then rendered "NaN"). Fall back to the default instead.
    const parsed = Number.parseInt(ctxInput.value, 10);
    const v = Number.isNaN(parsed) ? DEFAULTS.numCtx : Math.max(2048, Math.min(32768, parsed));
    ctxInput.value = v;
    await chrome.storage.local.set({ ollamaNumCtx: v });
  });
  ctxRow.appendChild(ctxInput);
  body.appendChild(ctxRow);

  // Thinking Mode
  const thinkRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  thinkRow.appendChild(el('label', { style: 'min-width:140px;' }, [t('set_thinking', null, 'Thinking Mode')]));
  const thinkToggle = el('input', { type: 'checkbox' });
  thinkToggle.checked = data.useThinking;
  thinkToggle.addEventListener('change', async () => {
    await chrome.storage.local.set({ useThinking: thinkToggle.checked });
  });
  thinkRow.appendChild(thinkToggle);
  body.appendChild(thinkRow);

  // API Key (for remote Ollama servers, e.g. ollama.com)
  const tokenRow = el('div', { style: 'display:flex;align-items:center;gap:8px;' });
  tokenRow.appendChild(el('label', { style: 'min-width:140px;' }, [t('set_api_key', null, 'API Key')]));
  const tokenInput = el('input', { type: 'password', style: 'flex:1;', placeholder: t('set_api_key_ph', null, 'Optional — for authenticated remote Ollama (Bearer token)') });
  tokenInput.value = data.ollamaBearerToken || '';
  tokenInput.addEventListener('change', async () => {
    await chrome.storage.local.set({ ollamaBearerToken: tokenInput.value.trim() });
  });
  tokenRow.appendChild(tokenInput);
  body.appendChild(tokenRow);

  // Test Connection
  const testBtn = el('button', { className: 'btn btn-secondary' }, [t('set_test_conn', null, 'Test Connection')]);
  testBtn.addEventListener('click', async () => {
    const { checkConnection } = await import('./ollama-service.js');
    const result = await checkConnection();
    if (result.connected) toast(t('toast_connected', [String(result.models.length)], `Connected! ${result.models.length} model(s) available.`), 'success');
    else toast(t('toast_conn_failed', [result.error], 'Connection failed: ' + result.error), 'error');
  });
  body.appendChild(testBtn);

  // COMMENT: Corrected for v2.2 — AI calls are proxied through the service
  // worker now; nothing rewrites the Origin header anymore.
  const help = el('div', { style: 'font-size:12px;color:var(--color-text-secondary);margin-top:4px;' });
  help.innerHTML = 'Just run <code style="background:var(--color-bg-secondary);padding:2px 6px;border-radius:3px;">ollama serve</code> — no <code>OLLAMA_ORIGINS</code> needed. PromptForge routes AI requests through its service worker automatically. For cloud, set the URL to https://ollama.com and add your API key above.';
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
    // COMMENT: Same NaN guard as the context-window input.
    const parsed = Number.parseInt(vcInput.value, 10);
    const v = Number.isNaN(parsed) ? DEFAULTS.variantCount : Math.max(2, Math.min(5, parsed));
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

async function buildSyncSettings() {
  // COMMENT: v3 feature E — folder-based sync. Strings are English-only for
  // now; catalog extraction is a documented follow-up.
  const sec = document.createElement('div');
  sec.style.cssText = 'margin-bottom:24px;';
  sec.appendChild(el('h3', {}, ['Folder Sync']));

  const body = el('div', { style: 'display:flex;flex-direction:column;gap:12px;' });
  body.appendChild(el('div', { style: 'font-size:12px;color:var(--color-text-secondary);' },
    ['Sync your library through a JSON file in any cloud-synced folder (iCloud Drive, Dropbox, Box, OneDrive). Syncs while this tab is open.']));

  const statusLine = el('div', { style: 'font-size:13px;' });
  body.appendChild(statusLine);

  const btnRow = el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;' });
  const pickBtn = el('button', { className: 'btn btn-primary' }, ['Choose Sync Folder…']);
  const syncNowBtn = el('button', { className: 'btn btn-secondary' }, ['Sync Now']);
  const reconnectBtn = el('button', { className: 'btn btn-secondary', style: 'display:none;' }, ['Reconnect']);
  const pauseBtn = el('button', { className: 'btn btn-secondary', style: 'display:none;' }, ['Pause']);
  const disconnectBtn = el('button', { className: 'btn btn-danger', style: 'display:none;' }, ['Disconnect']);
  btnRow.append(pickBtn, syncNowBtn, reconnectBtn, pauseBtn, disconnectBtn);
  body.appendChild(btnRow);

  // ── Native helper subsection (v3 E-fix: Brave & flag-less browsers) ──
  body.appendChild(el('div', { style: 'font-weight:600;font-size:13px;margin-top:8px;' }, ['Native helper (works in Brave and any Chromium browser)']));
  const nativeStatus = el('div', { style: 'font-size:12px;color:var(--color-text-secondary);' });
  body.appendChild(nativeStatus);
  const nativeBtnRow = el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;' });
  const nativePickBtn = el('button', { className: 'btn btn-secondary' }, ['Choose Folder… (system dialog)']);
  const pathInput = el('input', { type: 'text', placeholder: '/path/to/sync/folder', style: 'flex:1;min-width:200px;' });
  const pathBtn = el('button', { className: 'btn btn-secondary' }, ['Use This Path']);
  nativeBtnRow.append(nativePickBtn, pathInput, pathBtn);
  body.appendChild(nativeBtnRow);
  const setupBox = el('div', { style: 'font-size:12px;color:var(--color-text-secondary);border:1px dashed var(--color-border);border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:6px;' });
  setupBox.appendChild(el('div', {}, ['One-time setup (Node.js required). From the extension source folder, run:']));
  setupBox.appendChild(el('code', { style: 'user-select:all;background:var(--color-bg-secondary);padding:4px 8px;border-radius:4px;display:block;overflow-x:auto;' },
    ['bash native-host/install.sh ' + chrome.runtime.id]));
  setupBox.appendChild(el('div', {}, ['Then fully restart the browser. Windows: native-host\\install.ps1 -ExtensionId ' + chrome.runtime.id]));
  body.appendChild(setupBox);

  nativePickBtn.addEventListener('click', async () => {
    nativePickBtn.disabled = true;
    const r = await nativeConnectFolder();
    if (!r.ok) {
      toast(r.notInstalled ? 'Native helper not installed — see the setup box.' : 'Native folder error: ' + (r.error || 'unknown'), 'error', 5000);
      await refresh();
      return;
    }
    startSyncWatcher();
    toast('Sync folder connected via native helper', 'success');
    await refresh();
  });
  pathBtn.addEventListener('click', async () => {
    const p = pathInput.value.trim();
    if (!p) { toast('Enter a folder path first', 'warning'); return; }
    const r = await nativeConnectFolder(p);
    if (!r.ok) { toast('Native folder error: ' + (r.error || 'unknown'), 'error', 5000); return; }
    startSyncWatcher();
    toast('Sync folder connected via native helper', 'success');
    await refresh();
  });

  async function refresh() {
    const s = await getSyncSettings();
    if (!s || !s.enabled) {
      statusLine.textContent = 'Not connected. Pick a folder to start syncing.';
      pickBtn.style.display = '';
      syncNowBtn.style.display = 'none';
      reconnectBtn.style.display = 'none';
      pauseBtn.style.display = 'none';
      disconnectBtn.style.display = 'none';
    } else {
      const when = s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleString() : 'never';
      const via = s.transport === 'native' ? 'native helper' : 'browser folder API';
      statusLine.textContent = `Folder: ${s.folderName || 'unknown'} · via ${via} · Last sync: ${when}`
        + (s.paused ? ' · Paused' : '')
        + (s.lastError ? ` · Error: ${s.lastError}` : '');
      pickBtn.style.display = 'none';
      syncNowBtn.style.display = '';
      disconnectBtn.style.display = '';
      reconnectBtn.style.display = (s.needsPermission && s.transport !== 'native') ? '' : 'none';
      pauseBtn.style.display = (s.needsPermission && s.transport !== 'native') ? 'none' : '';
      pauseBtn.textContent = s.paused ? 'Resume' : 'Pause';
    }

    // Native helper subsection state.
    const hostUp = await nativeHostAvailable();
    if (!hostUp) {
      nativeStatus.textContent = 'Not installed — run the one-time setup below (needs Node.js).';
      setupBox.style.display = '';
      nativePickBtn.disabled = true;
      pathBtn.disabled = true;
    } else {
      setupBox.style.display = 'none';
      nativePickBtn.disabled = false;
      pathBtn.disabled = false;
      const f = await nativeGetFolder();
      nativeStatus.textContent = f.folderPath ? `Helper folder: ${f.folderPath}` : 'Helper installed — no folder chosen yet.';
    }
  }

  pickBtn.addEventListener('click', async () => {
    if (typeof window.showDirectoryPicker !== 'function') {
      // Brave (and some other browsers) block the File System Access API.
      toast('This browser blocks folder access — use the Native helper below (Brave: or enable brave://flags → “File System Access API”).', 'error', 6000);
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const perm = await handle.requestPermission({ mode: 'readwrite' });
      if (perm !== 'granted') { toast('Folder permission not granted.', 'warning'); return; }
      await saveDirHandle(handle);
      await patchSyncSettings({ enabled: true, paused: false, transport: 'fsaccess', folderName: handle.name, needsPermission: false, lastError: null });
      startSyncWatcher();
      toast('Sync folder connected', 'success');
      await refresh();
    } catch (e) {
      if (e && e.name === 'AbortError') return; // user cancelled the picker
      toast('Could not connect folder: ' + e.message, 'error');
    }
  });

  syncNowBtn.addEventListener('click', async () => {
    const r = await runSyncCycle();
    if (r === 'needs-permission') toast('Permission needed — click Reconnect.', 'warning');
    else if (r === 'error') toast('Sync failed — see the status line.', 'error');
    else toast('Sync complete', 'success', 1500);
    await refresh();
  });

  reconnectBtn.addEventListener('click', async () => {
    const r = await requestPermissionAndSync();
    if (r === 'needs-permission') toast('Permission still not granted.', 'warning');
    else toast('Reconnected', 'success', 1500);
    await refresh();
  });

  pauseBtn.addEventListener('click', async () => {
    const s = await getSyncSettings();
    const pausing = !s.paused;
    await patchSyncSettings({ paused: pausing });
    toast(pausing ? 'Sync paused' : 'Sync resumed', 'info', 1500);
    await refresh();
  });

  disconnectBtn.addEventListener('click', async () => {
    if (!confirm('Disconnect sync? Your local prompts are kept; the sync file stays in the folder.')) return;
    await disconnectSync();
    toast('Sync disconnected', 'info');
    await refresh();
  });

  await refresh();
  const heading = sec.querySelector('h3');
  heading.parentNode.insertBefore(body, heading.nextSibling);
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
  const pickBtn = el('button', { className: 'btn btn-sm btn-secondary' }, ['Enable Auto-Backup']);
  const disableBtn = el('button', { className: 'btn btn-sm btn-danger', style: 'display:none;' }, ['Disable']);

  async function refreshBackupStatus() {
    const settings = await AutoBackup.getBackupSettings();
    if (settings && settings.enabled) {
      statusText.textContent = 'On — Downloads/promptforge/';
      disableBtn.style.display = '';
      pickBtn.style.display = '';
      pickBtn.textContent = 'Backup Now';
    } else {
      statusText.textContent = 'Off';
      pickBtn.style.display = '';
      pickBtn.textContent = 'Enable Auto-Backup';
      disableBtn.style.display = 'none';
    }
  }

  async function handlePick(_repick = false) {
    try {
      const prompts = await PromptStorage.getPrompts();
      const result = await AutoBackup.pickBackupFile(prompts);
      if (result.enabled) {
        toast(t('toast_backup_active', null, 'Backup file saved. Auto-backup is now active.'), 'success');
        await refreshBackupStatus();
        AutoBackup.startAutoBackup();
      }
    } catch (e) {
      toast(t('toast_failed', [e.message], 'Failed: ' + e.message), 'error');
    }
  }

  pickBtn.addEventListener('click', () => handlePick(false));

  disableBtn.addEventListener('click', async () => {
    await AutoBackup.clearBackupFile();
    toast(t('toast_backup_disabled', null, 'Auto backup disabled'), 'info');
    await refreshBackupStatus();
  });

  statusRow.appendChild(statusLabel);
  statusRow.appendChild(statusText);
  statusRow.appendChild(pickBtn);
  statusRow.appendChild(disableBtn);
  backupSection.appendChild(statusRow);

  // Import from backup button
  const importBackupBtn = el('button', { className: 'btn btn-sm btn-secondary' }, [t('data_backup_import', null, 'Import from Backup File')]);
  importBackupBtn.addEventListener('click', async () => {
    try {
      const count = await AutoBackup.autoImport();
      if (count > 0) {
        toast(t('toast_backup_merged', [String(count)], `Merged ${count} prompts from backup`), 'success');
      } else {
        toast(t('toast_backup_none', null, 'No backup data to import (or no file selected)'), 'info');
      }
    } catch (e) {
      toast(t('toast_import_failed', [e.message], 'Import failed: ' + e.message), 'error');
    }
  });
  backupSection.appendChild(importBackupBtn);

  body.appendChild(backupSection);

  // ── Manual Export/Import ──
  body.appendChild(el('hr', { style: 'border:none;border-top:1px solid var(--color-border);margin:8px 0;' }));

  // Export
  const exportBtn = el('button', { className: 'btn btn-secondary' }, [t('data_export', null, 'Export All Data (JSON File)')]);
  exportBtn.addEventListener('click', () => PromptStorage.exportPrompts());
  body.appendChild(exportBtn);

  // Import
  const importRow = el('div', { style: 'display:flex;gap:8px;align-items:center;' });
  const fileInput = el('input', { type: 'file', accept: '.json', style: 'flex:1;' });
  const mergeBtn = el('button', { className: 'btn btn-secondary' }, [t('data_import_merge', null, 'Import (Merge)')]);
  const replaceBtn = el('button', { className: 'btn btn-danger' }, [t('data_import_replace', null, 'Import (Replace)')]);

  async function doImport(mode) {
    if (!fileInput.files || fileInput.files.length === 0) { toast(t('toast_select_file', null, 'Select a file first'), 'warning'); return; }
    const file = fileInput.files[0];
    try {
      // COMMENT: #1/#71 — read AND validate the file before touching existing
      // data. The old code removed prompts_storage first, so a corrupt file
      // wiped the library (and auto-backup then overwrote the backup with it).
      const text = await file.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch { throw new Error('Invalid JSON: file could not be parsed'); }
      const validShape = Array.isArray(parsed) || (parsed && typeof parsed === 'object' && Array.isArray(parsed.prompts));
      if (!validShape) throw new Error('Invalid JSON format – expected an array or store object');

      if (mode === 'replace') {
        // Replace only prompt data; preserve all other settings (Ollama URL,
        // model, API key, backup, theme, etc.). Previously this called
        // chrome.storage.local.clear(), which wiped every setting.
        // COMMENT: #1 — snapshot so a post-wipe import failure can roll back.
        const snapshot = await chrome.storage.local.get(['prompts_storage', 'prompts']);
        await chrome.storage.local.remove(['prompts_storage', 'prompts']);
        try {
          const result = await PromptStorage.importPrompts(text);
          toast(t('toast_replaced', [String(Array.isArray(result) ? result.length : 'unknown')], `Replaced with ${Array.isArray(result) ? result.length : 'unknown'} prompts`), 'success');
        } catch (e) {
          await chrome.storage.local.set(snapshot); // restore the pre-import library
          throw e;
        }
      } else {
        // COMMENT: #53 — report net newly-added prompts, not the total library
        // size (importPrompts returns the full merged array).
        const beforeCount = (await PromptStorage.getPrompts()).length;
        const result = await PromptStorage.importPrompts(text);
        const added = Array.isArray(result) ? Math.max(0, result.length - beforeCount) : 0;
        toast(t('toast_imported', [String(added)], `Imported ${added} prompts`), 'success');
      }
    } catch (e) { toast(t('toast_import_failed', [e.message], 'Import failed: ' + e.message), 'error'); }
  }

  mergeBtn.addEventListener('click', () => doImport('merge'));
  replaceBtn.addEventListener('click', () => {
    if (confirm(t('data_replace_confirm', null, 'This will REPLACE all your data. Are you sure?'))) doImport('replace');
  });

  importRow.appendChild(fileInput);
  importRow.appendChild(mergeBtn);
  importRow.appendChild(replaceBtn);
  body.appendChild(importRow);

  // Delete all
  const deleteBtn = el('button', { className: 'btn btn-danger' }, [t('data_delete_all', null, 'Delete All Data')]);
  deleteBtn.addEventListener('click', async () => {
    const confirmation = prompt(t('data_delete_prompt', null, 'Type DELETE to confirm:'));
    if (confirmation !== 'DELETE') return;
    // COMMENT: #34 — disconnect folder sync first; otherwise initSync restarts
    // the watcher after reload and re-imports every prompt from the sync file,
    // silently undoing the deletion. disconnectSync clears the shadow+settings.
    try {
      const s = await getSyncSettings();
      if (s && s.enabled) {
        await disconnectSync();
        toast(t('toast_sync_disabled', null, 'Folder sync disconnected so deleted data is not restored.'), 'info');
      }
    } catch { /* best-effort */ }
    // COMMENT: Remove prompt data only. local.clear() also wiped
    // aiProvidersMap (integrations UI then showed everything disabled while
    // host permissions stayed granted), onboarding, theme, and — left alone —
    // an enabled auto-backup would immediately rewrite the backup file with
    // the now-empty library, destroying the user's sync/restore copy.
    chrome.storage.local.remove(['prompts_storage', 'prompts', 'backup_settings'], () => location.reload());
  });
  body.appendChild(deleteBtn);

  // Refresh status on mount
  await refreshBackupStatus();

  const heading = sec.querySelector('h3');
  heading.parentNode.insertBefore(body, heading.nextSibling);
  return sec;
}

// ─── Init ─────────────────────────────────────────────────────────────────

initTheme().catch(() => {});
// COMMENT: #72 — surface an initial render failure instead of leaving a blank
// page with no retry affordance.
handleRoute().catch(e => {
  console.error('[PromptForge] initial render failed:', e);
  const c = document.getElementById('main-content');
  if (c) c.textContent = 'Failed to load PromptForge. Reload the page to retry.';
});

// Auto-backup: start listener on app load
(async function initAutoBackup() {
  try {
    const settings = await AutoBackup.getBackupSettings();
    if (!settings || !settings.enabled) return;

    // Start watching for changes
    AutoBackup.startAutoBackup();
  } catch { /* silently skip */ }
})();

// COMMENT: v3 feature E — resume folder sync on app load. If the directory
// permission lapsed (browser restart), the watcher's cycle flags
// needsPermission and Settings shows a Reconnect button (gesture-gated).
(async function initSync() {
  try {
    const s = await getSyncSettings();
    if (s && s.enabled && !s.paused) startSyncWatcher();
  } catch { /* sync unavailable */ }
})();

// Ollama status
async function updateOllamaStatus() {
  const result = await checkConnection();
  // COMMENT: On a fresh install (or after a model was deleted) the stored
  // model may not exist in Ollama — instead of pretending gemma4:latest is a
  // working default, pick the first model from the live list and persist it.
  if (result.connected && result.models?.length) {
    const effective = await autoSelectModel(result.models);
    if (effective && effective !== result.model) result.model = effective;
  }
  const dot = document.querySelector('#ollama-status .status-dot');
  const text = document.getElementById('ollama-status-text');
  if (dot) dot.className = `status-dot ${result.connected ? 'connected' : 'disconnected'}`;
  if (text) {
    if (result.connected) {
      const modelName = result.model;
      text.textContent = modelName
        ? t('status_connected_model', [modelName], `Ollama · ${modelName}`)
        : t('status_connected', null, 'Ollama Connected');
    } else {
      text.textContent = t('status_disconnected', null, 'Ollama disconnected');
    }
  }
}
updateOllamaStatus().catch(() => {});
window.addEventListener('focus', () => updateOllamaStatus().catch(() => {}));

// COMMENT: Keep the top-right model label live when the user changes the model or URL
// in Settings, instead of waiting for the next window focus.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.ollamaModel || changes.ollamaUrl)) {
    updateOllamaStatus().catch(() => {});
  }
});
