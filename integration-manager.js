// integration-manager.js — AI site integration management
// COMMENT: Derives provider list from llm_providers.json (single source of truth)
// so the Send-to-Tab feature stays in sync with the content-script provider list.

let _providers = null;

async function _loadProviders() {
  if (_providers) return _providers;
  try {
    const resp = await fetch(chrome.runtime.getURL('llm_providers.json'));
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    _providers = data.llm_providers.map((p, i) => ({
      id: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
      name: p.name,
      origins: [p.pattern]
    }));
  } catch (e) {
    console.error('[IntegrationManager] Failed to load llm_providers.json:', e);
    _providers = [];
  }
  return _providers;
}

export async function getProviders() {
  return await _loadProviders();
}

export async function getOpenAiSiteTabs() {
  const providers = await getProviders();
  const results = [];
  for (const p of providers) {
    try {
      const tabs = await chrome.tabs.query({ url: p.origins });
      for (const t of tabs) {
        results.push({ tabId: t.id, providerId: p.id, providerName: p.name, url: t.url, title: t.title });
      }
    } catch {}
  }
  return results;
}

export async function sendPromptToTab(tabId, text) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: 'PROMPTFORGE_INSERT',
      text
    });
    if (response?.success) {
      return { success: true };
    }
    return { success: false, error: response?.error || 'No response from tab' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function getProviderById(id) {
  const providers = await getProviders();
  return providers.find(p => p.id === id);
}

export async function getAllProviders() {
  return await getProviders();
}
