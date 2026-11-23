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
    _providers = data.llm_providers.map((p) => ({
      id: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
      name: p.name,
      origins: [p.pattern]
    }));
  } catch (e) {
    console.error('[IntegrationManager] Failed to load llm_providers.json:', e);
    // COMMENT: #16 — do NOT cache the failure: [] is truthy, so the old
    // `_providers = []` was returned forever and injection/Send-to-Tab stayed
    // dead for the whole SW lifetime. Leave _providers null so the next call
    // retries (mirrors inputBoxHandler.loadProviders).
    return [];
  }
  return _providers;
}

export async function getProviders() {
  const providers = await _loadProviders();
  return providers || []; // never return null
}

// COMMENT: #17 — correct Chrome match-pattern semantics for tab URLs. The old
// hand-rolled regex turned '*://host/*' into /^.*://host\/.*/, whose leading
// '.*' absorbed a preceding URL (https://evil.com/?next=https://chatgpt.com/
// matched). Parse the URL and compare scheme/host/path explicitly instead.
export function urlMatchesPattern(pattern, url) {
  try {
    const m = /^(\*|https?):\/\/([^/]+)(\/.*)$/.exec(pattern);
    if (!m) return false;
    const u = new URL(url);
    const scheme = m[1], host = m[2], path = m[3];
    if (scheme !== '*' && u.protocol !== scheme + ':') return false;
    if (host !== '*') {
      if (host.startsWith('*.')) {
        const base = host.slice(2);
        if (u.hostname !== base && !u.hostname.endsWith('.' + base)) return false;
      } else if (u.hostname !== host) {
        return false;
      }
    }
    const pathRe = new RegExp('^' + path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*') + '$');
    return pathRe.test(u.pathname);
  } catch {
    return false;
  }
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
