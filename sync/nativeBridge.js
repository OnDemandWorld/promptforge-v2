// sync/nativeBridge.js — RPC bridge to the native messaging host (v3 feature E)
//
// The host (native-host/promptforge-sync-host.cjs) gives the extension folder
// access in browsers that block the File System Access API (Brave). One fresh
// connection per call — the host is stateless apart from its config file, and
// per-call connections avoid the MV3 service-worker/port lifetime tangles.

const HOST_NAME = 'com.odw.promptforge.sync';
// Long timeout: 'pick-folder' waits on a human at an OS dialog.
const DEFAULT_TIMEOUT_MS = 120000;

/**
 * @param {object} message
 * @param {number} [timeoutMs]
 * @returns {Promise<{ok: boolean, error?: string, notInstalled?: boolean}>}
 */
export function nativeRPC(message, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve) => {
    let settled = false;
    let port;
    try {
      port = chrome.runtime.connectNative(HOST_NAME);
    } catch (e) {
      resolve({ ok: false, error: e.message || String(e), notInstalled: true });
      return;
    }
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try { port.disconnect(); } catch { /* already gone */ }
      resolve({ ok: false, error: 'Native helper timed out' });
    }, timeoutMs);
    port.onMessage.addListener((reply) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { port.disconnect(); } catch { /* already gone */ }
      resolve(reply && typeof reply === 'object' ? reply : { ok: false, error: 'Bad reply from native helper' });
    });
    port.onDisconnect.addListener(() => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const err = chrome.runtime.lastError;
      const msg = err ? err.message : 'Native helper disconnected';
      resolve({ ok: false, error: msg, notInstalled: /host not found|access/i.test(msg) });
    });
    port.postMessage(message);
  });
}

/** @returns {Promise<boolean>} true when the host is installed and answering. */
export async function nativeHostAvailable() {
  const r = await nativeRPC({ op: 'ping' }, 5000);
  return !!(r && r.ok);
}
