import { getProviders, urlMatchesPattern } from './integration-manager.js';
import { getPrompts, onPromptsChanged, savePrompt, bumpUseCount } from './promptStorage.js';
import { checkConnection, improvePrompt, generateVariants, suggestAllMetadata, translatePrompt } from './ollama-service.js';
import { syncOllamaCorsRules } from './cors-rules.js';

// ---------------------------
// Install / Update / Startup
// ---------------------------
chrome.runtime.onInstalled.addListener(function (details) {
  console.log('onInstalled', details);
  const shouldRebuild = ['install', 'update'].includes(details.reason);
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'app.html' });
  }
  if (shouldRebuild) {
    rebuildProviderMap();
  }
  createPromptContextMenu();
  // COMMENT: restored in 2.2.1 — Ollama 403s extension-origin requests;
  // the rule (self-scoped) rewrites Origin to http://localhost.
  syncOllamaCorsRules().catch(e => console.error('CORS rule sync failed:', e));
});

chrome.runtime.onStartup.addListener(() => {
  createPromptContextMenu();
  rebuildProviderMap();
  syncOllamaCorsRules().catch(e => console.error('CORS rule sync failed:', e));
});

// Keep the Origin-rewrite rule in sync with the configured Ollama URL.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.ollamaUrl) {
    syncOllamaCorsRules().catch(e => console.error('CORS rule sync failed:', e));
  }
});

async function rebuildProviderMap() {
  try {
    const providersMap = await checkProviderPermissions();
    await chrome.storage.local.set({ 'aiProvidersMap': providersMap });
  } catch (error) {
    console.error('Error rebuilding provider map:', error);
  }
}

// ---------------------------
// Permission changes → inject scripts
// ---------------------------
chrome.permissions.onAdded.addListener(async (permissions) => {
  if (permissions.origins && permissions.origins.length > 0) {
    for (const origin of permissions.origins) {
      try {
        const tabs = await chrome.tabs.query({ url: origin });
        for (const tab of tabs) {
          // COMMENT: Guard against double-injection if onUpdated fires concurrently
          try {
            const [{ result: alreadyInjected }] = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => !!window.__OPM_PROMPT_MANAGER_INITIALIZED
            });
            if (alreadyInjected) continue;
          } catch (_) { /* tab not accessible, skip guard check */ }

          // COMMENT: C1 — one bundled file; injection order is no longer a
          // constraint (evaluation order lives in content.bundle.entry.js).
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.bundle.js']
          });
        }
      } catch (err) {
        console.error(`Failed to inject for origin ${origin}:`, err);
      }
    }
  }
});

// ---------------------------
// Tab updates → auto-inject
// ---------------------------
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const providers = await getProviders();
      for (const provider of providers) {
        const originPattern = provider.origins[0];
        if (!originPattern) continue;
        // COMMENT: Inject on all 19 LLM sites regardless of host permission —
        // the panel is purely write-only (prompt injection); no site access
        // beyond the page's own DOM is required.
        // COMMENT: #17 — use proper match-pattern semantics (host-anchored),
        // not a regex whose '.*' scheme prefix could match a provider URL
        // embedded in another site's query string.
        if (urlMatchesPattern(originPattern, tab.url)) {
          try {
            // COMMENT: Pre-check the init flag (same guard onAdded uses) so the
            // onUpdated/onAdded race can't double-inject. The previous probe
            // wrote a flag nothing ever read.
            try {
              const [{ result: alreadyInjected }] = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => !!window.__OPM_PROMPT_MANAGER_INITIALIZED
              });
              if (alreadyInjected) break;
            } catch { /* tab not accessible yet, fall through to inject */ }
            await chrome.scripting.executeScript({
              target: { tabId },
              files: ['content.bundle.js']
            });
          } catch (e) {
            // Ignore common transient/injection errors
            const msg = e.message || '';
            const isIgnorable =
              msg.includes('Cannot access a chrome://') ||
              msg.includes('No matching window') ||
              msg.includes('Could not establish connection') ||
              msg.includes('The tab was closed') ||
              msg.includes('Cannot access contents of the page') ||
              msg.includes('Cannot access a chrome-extension://');

            if (!isIgnorable) {
              console.error(`Failed to inject tab ${tabId}:`, e);
            }
          }
          break;
        }
      }
    } catch (err) {
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        console.error(`Error during tab update for ${tab.url}:`, err);
      }
    }
  }
});

// ---------------------------
// Permission checker
// ---------------------------
async function checkProviderPermissions() {
  try {
    const response = await fetch(chrome.runtime.getURL('llm_providers.json'));
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const providersData = await response.json();

    const resolveIconUrl = (raw) => {
      if (!raw) return '';
      if (/^(https?:|data:|chrome-extension:)/.test(raw)) return raw;
      const normalized = raw.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
      return chrome.runtime.getURL(normalized);
    };

    const providersMap = {};
    for (const providerInfo of providersData.llm_providers) {
      const hasPermission = await chrome.permissions.contains({ origins: [providerInfo.pattern] });
      providersMap[providerInfo.name] = {
        hasPermission: hasPermission ? 'Yes' : 'No',
        urlPattern: providerInfo.pattern,
        url: providerInfo.url,
        iconUrl: resolveIconUrl(providerInfo.icon_url)
      };
    }
    return providersMap;
  } catch (error) {
    console.error('Error checking permissions:', error);
    // COMMENT: Return {} (not null) so consumers don't have to special-case a
    // failed rebuild and aiProvidersMap is never stored as null.
    return {};
  }
}

// ---------------------------
// Context Menu
// ---------------------------
// COMMENT: Rebuilds used to fire on every prompts_storage change — including
// each bumpUseCount — and overlapping removeAll/create runs raced (duplicate
// id lastError spam). Large libraries also produced unbounded menu items.
// Debounce the rebuild and cap the per-prompt items.
const MENU_PROMPT_CAP = 30;
let menuRebuildTimer = null;
function scheduleContextMenuRebuild() {
  if (menuRebuildTimer) clearTimeout(menuRebuildTimer);
  menuRebuildTimer = setTimeout(() => {
    menuRebuildTimer = null;
    createPromptContextMenu().catch(e => console.error('Context menu rebuild failed:', e));
  }, 300);
}

async function createPromptContextMenu() {
  const ignoreLastError = () => { if (chrome.runtime.lastError) { /* benign during overlapping rebuilds */ } };
  await new Promise(resolve => chrome.contextMenus.removeAll(resolve));
  chrome.contextMenus.create({
    id: 'open-promptforge',
    title: 'Open PromptForge',
    contexts: ['all']
  }, ignoreLastError);
  chrome.contextMenus.create({
    id: 'save-as-prompt',
    parentId: 'open-promptforge',
    title: 'Save new prompt',
    contexts: ['selection']
  }, ignoreLastError);
  chrome.contextMenus.create({
    id: 'save-separator',
    parentId: 'open-promptforge',
    type: 'separator',
    contexts: ['selection']
  }, ignoreLastError);
  let prompts = [];
  try {
    prompts = await getPrompts();
  } catch (e) {
    console.error('Failed to load prompts for context menu:', e);
  }
  prompts.slice(0, MENU_PROMPT_CAP).forEach((prompt) => {
    chrome.contextMenus.create({
      id: 'prompt-' + prompt.uuid,
      parentId: 'open-promptforge',
      title: prompt.title || 'Untitled Prompt',
      contexts: ['all']
    }, ignoreLastError);
  });
}

onPromptsChanged(() => scheduleContextMenuRebuild());

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'save-as-prompt') {
    try {
      const selected = info.selectionText || '';
      const [{ result: titleValue }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.prompt('Enter a title for your prompt', '')
      });
      const title = (titleValue || '').trim();
      if (!title) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.alert('Please add a title to your prompt.')
        });
        return;
      }
      await savePrompt({ title, content: selected });
      chrome.notifications?.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Prompt Saved',
        message: `Saved: ${title}`
      });
    } catch (err) {
      console.error('Failed to save prompt from selection:', err);
    }
    return;
  }
  if (info.menuItemId.startsWith('prompt-')) {
    if (!tab) return; // #58 — some menu contexts have no tab
    const uuid = info.menuItemId.replace('prompt-', '');
    let prompts;
    try { prompts = await getPrompts(); } catch (err) { console.error('[PromptForge] menu prompt load failed:', err); return; } // #58
    const prompt = prompts.find(p => p.uuid === uuid);
    if (prompt) {
      // COMMENT: Route through content script so variables are processed and injection is handled properly
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'PROMPTFORGE_SEND_PROMPT',
          prompt: { content: prompt.content, title: prompt.title, uuid: prompt.uuid }
        }, (_response) => {
          if (chrome.runtime.lastError) {
            // Fallback: content script not available, copy to clipboard
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (text) => navigator.clipboard.writeText(text),
              args: [prompt.content]
            }).then(async () => {
              chrome.notifications?.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'Prompt Copied',
                message: `Copied: ${prompt.title}`
              });
              await bumpUseCount(prompt.uuid).catch(() => {});
            }).catch(() => {});
          }
        });
      } catch (err) {
        console.error('Failed to send prompt via message:', err);
      }
    }
  }
});

// ---------------------------
// Ollama proxy (port RPC)
// ---------------------------
// COMMENT: B1 — every Ollama call from the floating panel now runs here, in
// the service worker, where host_permissions authorize the fetch. Previously
// the panel fetched Ollama from page context and a declarativeNetRequest rule
// rewrote the Origin header — but that rule applied to ALL requests initiated
// by the provider origin, so any script on a provider page (including a
// compromised one) could reach the user's local Ollama. The rule is gone;
// page-context code talks to Ollama only through this port.
//
// Protocol (port name 'pf-ai'):
//   client -> { id, op: 'improve'|'variants'|'suggest'|'check', ... }
//   client -> { id, cancel: true }                      (abort op `id`)
//   worker -> { id, chunk }*  then { id, done: true }   (streaming: improve)
//   worker -> { id, result }                            (unary ops)
//   worker -> { id, error: message }                    (failure)
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'pf-ai') return;
  const controllers = new Map(); // request id -> AbortController

  port.onDisconnect.addListener(() => {
    controllers.forEach(c => c.abort());
    controllers.clear();
  });

  port.onMessage.addListener(async (msg) => {
    const { id, op } = msg || {};
    if (msg && msg.cancel) {
      const c = controllers.get(id);
      if (c) c.abort();
      controllers.delete(id);
      return;
    }
    if (id === undefined || !op) return;

    const controller = new AbortController();
    controllers.set(id, controller);
    const signal = controller.signal;
    try {
      if (op === 'improve') {
        // COMMENT: msg.language (v3 feature D-II) carries the target language
        // from the prompt being processed.
        const gen = await improvePrompt(msg.promptText, { signal, language: msg.language });
        for await (const chunk of gen) {
          port.postMessage({ id, chunk });
        }
        port.postMessage({ id, done: true });
      } else if (op === 'translate') {
        // COMMENT: v3 feature D-V — msg.toLang is the target; msg.fromLang
        // enables script-only conversion for zh-HK↔zh-CN.
        const gen = await translatePrompt(msg.promptText, msg.toLang, { signal, fromLang: msg.fromLang });
        for await (const chunk of gen) {
          port.postMessage({ id, chunk });
        }
        port.postMessage({ id, done: true });
      } else if (op === 'variants') {
        const variants = await generateVariants(msg.promptText, msg.count, { signal, language: msg.language });
        port.postMessage({ id, result: variants });
      } else if (op === 'suggest') {
        const metadata = await suggestAllMetadata(msg.promptText, msg.language, signal); // #60
        port.postMessage({ id, result: metadata });
      } else if (op === 'check') {
        port.postMessage({ id, result: await checkConnection() });
      } else {
        port.postMessage({ id, error: `Unknown Ollama op: ${op}` });
      }
    } catch (e) {
      try { port.postMessage({ id, error: e.message || String(e) }); } catch { /* port already gone */ }
    } finally {
      controllers.delete(id);
    }
  });
});

// ---------------------------
// Message Router
// ---------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'OPEN_APP_TAB') {
    // COMMENT: Every async branch needs a .catch — a rejection used to leave
    // sendResponse uncalled, hanging the sender with an unhandled rejection.
    openOrFocusAppTab(message.path || '')
      .then(tab => sendResponse({ tabId: tab.id }))
      .catch(e => sendResponse({ error: e.message }));
    return true;
  }

  if (message?.type === 'CHECK_OLLAMA') {
    checkConnection()
      .then(result => sendResponse(result))
      .catch(e => sendResponse({ connected: false, models: [], model: null, error: e.message }));
    return true;
  }

  if (message?.type === 'QUERY_AI_SITE_TABS') {
    queryAiSiteTabs()
      .then(tabs => sendResponse({ tabs }))
      .catch(e => sendResponse({ tabs: [], error: e.message }));
    return true;
  }
});

async function openOrFocusAppTab(path) {
  const baseUrl = chrome.runtime.getURL('app.html');
  const targetUrl = path ? baseUrl + path : baseUrl;
  const tabs = await chrome.tabs.query({ url: baseUrl + '*' });
  if (tabs.length > 0) {
    const tab = tabs[0];
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
    // Navigate to the specific path if provided
    if (path && !tab.url.includes(path)) {
      await chrome.tabs.update(tab.id, { url: targetUrl });
    }
    return tab;
  }
  return chrome.tabs.create({ url: targetUrl });
}

async function queryAiSiteTabs() {
  const providers = await getProviders();
  const results = [];
  for (const provider of providers) {
    const pattern = provider.origins[0];
    if (!pattern) continue;
    const hasPermission = await chrome.permissions.contains({ origins: [pattern] });
    if (hasPermission) {
      try {
        const tabs = await chrome.tabs.query({ url: pattern });
        for (const t of tabs) results.push({ tabId: t.id, url: t.url, title: t.title });
      } catch { /* tab not accessible, skip */ }
    }
  }
  return results;
}
