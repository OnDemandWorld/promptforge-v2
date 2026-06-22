# Changelog

All notable changes to PromptForge are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/),
and the project adheres to [Semantic Versioning](https://semver.org/).

## [2.1.0] - 2026-06-23

### Highlights

- **Local Ollama works out of the box** — no `OLLAMA_ORIGINS` environment variable needed.
- **Fixed silent data loss** — favorites, archive, and use-counts now persist.
- **New AI processing indicator** in the editor while Ollama is working.
- **Tighter permissions and privacy posture** — scoped CORS rule, trimmed web-accessible resources, dropped an unused permission.

### Added

- **Automatic CORS handling for Ollama.** A `declarativeNetRequest` rule rewrites the outgoing `Origin` header to `http://localhost` for requests to the configured Ollama host, so Ollama accepts extension-originated requests without requiring `OLLAMA_ORIGINS`. The rule is re-synced on install, startup, and whenever the Ollama URL changes.
  - The rule is scoped via `initiatorDomains` to this extension and the supported AI-site hosts, so it does **not** expose the user's local Ollama to arbitrary web pages.
  - New module: `cors-rules.js`.
- **AI processing indicator.** The editor header shows a spinner + label (`Improving…`, `Generating variants…`, `Analyzing prompt…`) while Ollama is working. Streaming Improve keeps the existing Stop button. Respects `prefers-reduced-motion`.
- **`bumpUseCount(uuid)` storage API** — the single, atomic way to record prompt usage.
- **Single source of truth** for Ollama defaults (`DEFAULTS`) and prompt categories (`CATEGORY_NAMES` / `CATEGORIES`), exported from `ollama-service.js`.
- **`CHANGELOG.md`** (this file).

### Fixed

- **Favorites, archive, use-counts, and the "most used" / "recently used" sorts were broken.** `normalisePrompt` rebuilt each prompt from an allowlist that omitted `favorite`, `useCount`, `lastUsedAt`, and `_archived`, and it ran on every read **and** write — so toggles appeared to work but reverted on the next operation. These fields are now preserved.
- **Model name in the top-right status could be out of sync.** `checkConnection()` returned the hardcoded default model in its error path; a failed connection (e.g. CORS preflight failure) made the label show `gemma4:latest` instead of the selected model. It now always reports the stored model. The label also refreshes live when the model or URL is changed in Settings.
- **"Import (Replace)" wiped all settings.** It called `chrome.storage.local.clear()`, deleting the Ollama URL/model/API key, backup config, theme, and permission map — not just prompts. It now removes only the prompt-data keys.
- **DNR CORS rule opened local Ollama to every website** (a privacy regression introduced while fixing the CORS 403). Now scoped to the extension + AI-site initiators so arbitrary sites can no longer reach the user's local Ollama.
- **`autoBackup.startAutoBackup()` leaked a storage listener** on every call (app load + each backup-file pick), causing N duplicate `writeBackup` calls per change. It now removes the previous listener before re-registering.
- **Streaming Improve could hang indefinitely.** `ollamaChat` skipped its timeout when a caller passed an `AbortSignal`; the timeout now always arms and is cleared in a `finally` block (for both streaming and non-streaming paths).
- **Empty "Prompt copied to clipboard" toast** (and empty floating-panel category `<option>`s). `createEl` ignored a 3rd `children` argument and treated `class` as `className`'s missing cousin. `createEl` now accepts a children array; the toast uses `className`. The category dropdown in the floating panel now shows names.
- **Concurrent writes could clobber each other.** Storage mutators (`savePrompt`, `updatePrompt`, `deletePrompt`, `mergePrompts`, `addVersion`, `bumpUseCount`, `setFolders`, `deleteFolder`) now serialize through a write lock, so read-modify-write sequences from the app tab and the floating panel no longer race.
- **Three sites bypassed `promptStorage.js`** to bump `useCount` by mutating raw `prompts_storage` inline (service worker clipboard fallback, content-script send handler, popup). That skipped normalisation and raced with other writes. They now use `bumpUseCount`.
- **Raw Ollama HTTP error bodies were shown to users** in toasts/alerts. They now map to friendly messages; raw detail is logged to the console only.
- `autoBackup.js` hardcoded `version: 3` in backup files; now imports `PROMPT_STORAGE_VERSION`.
- `navigator.platform` (deprecated) replaced with `navigator.userAgentData?.platform ?? navigator.platform`.

### Changed

- `CATEGORIES` is now a single `[{ name, description }]` array; the category system prompt is generated from it. Adding a category is a one-line change instead of three.
- The editor's `doSave` auto-suggest now uses the AI status indicator instead of the save indicator for the "Analyzing prompt…" state.
- `package.json` and `manifest.json` versions are kept in sync (both `2.1.0`).
- README Quick Start and Troubleshooting updated: the `OLLAMA_ORIGINS` workaround is no longer required; `cors-rules.js` added to the architecture listing; the stale `changelog.html` reference removed.

### Removed

- Unused `activeTab` permission.
- Four entries from `web_accessible_resources` that no content script loads at runtime — `cors-rules.js`, `integration-manager.js`, `content.shared.js`, `content.styles.js` — reducing the extension's fingerprintable surface. (`utils.js` is retained because it is transitively imported by `promptStorage.js` in the content-script context.)
- Dead exports: `getProviderById`, `getAllProviders` (`integration-manager.js`); `getBackupHandle`, `readBackup`, `checkBackupStatus` (`autoBackup.js`).

### Migration / Upgrade notes

- **No data migration required.** Stored prompts are re-normalised on read; `favorite` / `useCount` / `lastUsedAt` / `_archived` begin persisting from this version forward. (Counts accrued before this update were being silently dropped, so "use" statistics effectively start fresh.)
- **Local Ollama users** can drop `OLLAMA_ORIGINS="chrome-extension://*"` from their `ollama serve` command.
- **Reload the unpacked extension** after updating. The new `declarativeNetRequest` permission is requested at install/update; the dynamic CORS rule is built on startup.
- **Cloud (ollama.com) users** are unaffected by the CORS change and continue to use the Bearer token.

### Files changed

| Area | Files |
|---|---|
| Storage | `promptStorage.js` (field preservation, write lock, `bumpUseCount`) |
| Ollama client | `ollama-service.js` (timeout, `DEFAULTS`, `CATEGORY_NAMES`, error sanitization, model-name fix) |
| CORS | `cors-rules.js` (new — `declarativeNetRequest` rule) |
| Background | `service-worker.js` (CORS sync, `bumpUseCount` migration) |
| Full-page UI | `app.js` (AI status indicator, import-replace fix, dedup, `bumpUseCount`) |
| Content scripts | `content.js` (`createEl` children, clipboard toast, `bumpUseCount`, `navigator.platform`), `content.shared.js` (benefits from `createEl` fix) |
| Backup | `autoBackup.js` (listener leak, version import, dead-export removal) |
| Provider list | `integration-manager.js` (dead-export removal) |
| Popup | `popup.js` (`bumpUseCount`) |
| Manifest / package | `manifest.json` (`declarativeNetRequest` permission, WAR trim, `activeTab` removal, version), `package.json` (version sync) |
| Styles | `css/editor.css` (AI status indicator) |
| Docs | `README.md`, `CHANGELOG.md` (new) |

---

## [2.0.1] - 2026-04-29

- File-based backup for cross-computer prompt sync.
- Use tracking (`useCount` / `lastUsedAt`) and "recently used" / "most used" sorts.
- Context menu fixes.
- Initial release of the v2 architecture.
