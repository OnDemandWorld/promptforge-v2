import { getProviders } from './integration-manager.js';
import { getPrompts, onPromptsChanged, savePrompt } from './promptStorage.js';
import { checkConnection } from './ollama-service.js';

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
});

chrome.runtime.onStartup.addListener(() => {
  createPromptContextMenu();
  rebuildProviderMap();
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

          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['inputBoxHandler.js', 'content.styles.js', 'content.shared.js', 'content.js']
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
        // Inject on ALL LLM sites regardless of permissions
        // The content script will check permissions at runtime for injection vs clipboard
        const regexPattern = originPattern
          .replace(/\\/g, '\\\\')
          .replace(/[.]/g, '\\.')
          .replace(/[*]/g, '.*');
        const urlRegex = new RegExp(`^${regexPattern}`);

        if (urlRegex.test(tab.url)) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId },
              func: () => { window.__PF_INJECTED_CHECK = true; }
            });
            await chrome.scripting.executeScript({
              target: { tabId },
              files: ['inputBoxHandler.js', 'content.styles.js', 'content.shared.js', 'content.js']
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
    return null;
  }
}

// ---------------------------
// Context Menu
// ---------------------------
async function createPromptContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'open-promptforge',
      title: 'Open PromptForge',
      contexts: ['all']
    });
    chrome.contextMenus.create({
      id: 'save-as-prompt',
      parentId: 'open-promptforge',
      title: 'Save new prompt',
      contexts: ['selection']
    });
    chrome.contextMenus.create({
      id: 'save-separator',
      parentId: 'open-promptforge',
      type: 'separator',
      contexts: ['selection']
    });
    getPrompts().then(prompts => {
      prompts.forEach((prompt) => {
        chrome.contextMenus.create({
          id: 'prompt-' + prompt.uuid,
          parentId: 'open-promptforge',
          title: prompt.title || 'Untitled Prompt',
          contexts: ['all']
        });
      });
    });
  });
}

onPromptsChanged(() => createPromptContextMenu());

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
    const uuid = info.menuItemId.replace('prompt-', '');
    const prompts = await getPrompts();
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
              await chrome.storage.local.get({ prompts_storage: null }, (data) => {
                const store = data.prompts_storage;
                if (store && Array.isArray(store.prompts)) {
                  const idx = store.prompts.findIndex(p => p.uuid === prompt.uuid);
                  if (idx !== -1) {
                    store.prompts[idx].useCount = (store.prompts[idx].useCount || 0) + 1;
                    store.prompts[idx].lastUsedAt = new Date().toISOString();
                    chrome.storage.local.set({ prompts_storage: store });
                  }
                }
              });
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
// Message Router
// ---------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'OPEN_APP_TAB') {
    openOrFocusAppTab(message.path || '').then(tab => sendResponse({ tabId: tab.id }));
    return true;
  }

  if (message?.type === 'CHECK_OLLAMA') {
    checkConnection().then(result => sendResponse(result));
    return true;
  }

  if (message?.type === 'QUERY_AI_SITE_TABS') {
    queryAiSiteTabs().then(tabs => sendResponse({ tabs }));
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
