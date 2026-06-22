// cors-rules.js — Rewrite the Origin header on Ollama requests
//
// Ollama rejects requests from chrome-extension://* origins by default (403).
// Traditionally the user must restart Ollama with OLLAMA_ORIGINS set. Instead,
// we use declarativeNetRequest (MV3) to rewrite the outgoing Origin header to
// http://localhost before the request leaves Chrome. Ollama's default allow-list
// accepts http://localhost, so no environment variable is needed.
//
// The rule is scoped to requests whose initiator is EITHER this extension OR one
// of the supported AI-site hosts, so it does NOT open the user's local Ollama to
// arbitrary web pages. Content scripts run in the page's network context, so their
// fetches carry the AI site's origin as initiator — hence the provider hostnames.

import { getProviders } from './integration-manager.js';
import { DEFAULTS } from './ollama-service.js';

const RULE_ID = 1;
const REWRITE_ORIGIN = 'http://localhost';

function hostnameOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// "*://chatgpt.com/*" -> "chatgpt.com"; "*://*.example.com/*" -> "example.com"
function hostFromPattern(pattern) {
  const m = /:\/\/([^/]+)/.exec(pattern || '');
  if (!m) return null;
  let host = m[1];
  if (host.startsWith('*.')) host = host.slice(2);
  return host || null;
}

async function getOllamaUrl() {
  try {
    const data = await chrome.storage.local.get({ ollamaUrl: DEFAULTS.url });
    return data.ollamaUrl || DEFAULTS.url;
  } catch {
    return DEFAULTS.url;
  }
}

async function initiatorDomainSet() {
  const set = new Set();
  if (chrome.runtime.id) set.add(chrome.runtime.id); // extension-originated fetches
  try {
    for (const p of await getProviders()) {
      for (const pat of p.origins || []) {
        const h = hostFromPattern(pat);
        if (h) set.add(h); // content-script fetches on AI sites
      }
    }
  } catch (e) {
    console.error('[PromptForge] Failed to load provider domains for CORS rule:', e);
  }
  return [...set];
}

// (Re)build the dynamic rule from the current ollamaUrl. Safe to call repeatedly.
export async function syncOllamaCorsRules() {
  const url = await getOllamaUrl();
  const host = hostnameOf(url);

  // Always remove our previous rule first so a changed/invalid URL clears it.
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID] });

  if (!host) return;

  const initiatorDomains = await initiatorDomainSet();
  // Chrome rejects an empty initiatorDomains array; in the (near-impossible)
  // empty case, omit the field rather than skip the rule entirely.
  const condition = { requestDomains: [host] };
  if (initiatorDomains.length > 0) condition.initiatorDomains = initiatorDomains;

  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
      id: RULE_ID,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [{ header: 'origin', operation: 'set', value: REWRITE_ORIGIN }]
      },
      condition
    }]
  });
}

// Remove the rule entirely (e.g. on uninstall or when the URL is cleared).
export async function clearOllamaCorsRules() {
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID] });
}
