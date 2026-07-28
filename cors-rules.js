// cors-rules.js — Rewrite the Origin header on Ollama requests
//
// Ollama rejects requests carrying a chrome-extension://* Origin header with
// 403 (server-side origin allow-list; "OLLAMA_ORIGINS" env var). Extension
// contexts — the service worker AND extension pages — always send that
// origin, and Origin is a forbidden header for fetch(), so the only in-
// browser fix is a declarativeNetRequest modifyHeaders rule.
//
// History: v2.1.0 shipped this rule scoped to the extension + the 19 provider
// hostnames (content scripts fetched Ollama from page context then). The v2.2
// audit flagged that provider-initiated requests were also rewritten (any
// provider-page script could reach local Ollama), and the rule was removed
// when panel calls moved to the service worker — which broke Ollama entirely,
// because the SW's own requests still carry the extension origin and get 403'd
// by Ollama. This is the corrected restoration: ALL Ollama fetches now
// originate in extension contexts (SW proxy for the panel, app page for the
// editor), so the rule is scoped to THIS extension's id only — no web page,
// provider or otherwise, gets its origin rewritten.
//
// Fallback: if Chrome ever rejects the self-scoped rule, it is retried
// WITHOUT initiator scoping (degraded but functional; logged loudly).

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

async function getOllamaUrl() {
  try {
    const data = await chrome.storage.local.get({ ollamaUrl: DEFAULTS.url });
    return data.ollamaUrl || DEFAULTS.url;
  } catch {
    return DEFAULTS.url;
  }
}

function rewriteRule(host, initiatorDomains) {
  const condition = { requestDomains: [host] };
  if (initiatorDomains && initiatorDomains.length > 0) condition.initiatorDomains = initiatorDomains;
  return {
    id: RULE_ID,
    priority: 1,
    action: {
      type: 'modifyHeaders',
      requestHeaders: [{ header: 'origin', operation: 'set', value: REWRITE_ORIGIN }],
    },
    condition,
  };
}

// (Re)build the dynamic rule from the current ollamaUrl. Safe to call repeatedly.
export async function syncOllamaCorsRules() {
  const url = await getOllamaUrl();
  const host = hostnameOf(url);

  // Always remove our previous rule first so a changed/invalid URL clears it.
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID] });

  if (!host) return;

  // Preferred: scoped to this extension's own requests only.
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [rewriteRule(host, [chrome.runtime.id])],
    });
    return;
  } catch (e) {
    console.warn('[PromptForge] Self-scoped Ollama CORS rule rejected, falling back to unscoped:', e);
  }

  // Fallback: unscoped (any initiator reaching the Ollama host gets the
  // rewrite). Degraded posture, functional extension.
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [rewriteRule(host, null)],
    });
  } catch (e) {
    console.error('[PromptForge] Failed to install Ollama CORS rule — AI features will 403:', e);
  }
}

// Remove the rule entirely (e.g. on uninstall or when the URL is cleared).
export async function clearOllamaCorsRules() {
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID] });
}
