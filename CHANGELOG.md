# Changelog

All notable changes to PromptForge are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/),
and the project adheres to [Semantic Versioning](https://semver.org/).

## [2.2.1] - 2026-07-28

### Fixed

- **Extension failed to load: "Invalid value for 'web_accessible_resources[0]'. Invalid match pattern."** Chrome rejects match patterns containing paths in `web_accessible_resources.matches` (unlike content-script matches), so `*://github.com/copilot/*` and `*://apps.abacus.ai/chatllm/*` made the manifest unloadable. Both are now origin-only (`*://github.com/*`, `*://apps.abacus.ai/*`); the provider list in `llm_providers.json` keeps the path-scoped patterns for injection targeting.

## [2.2.0] - 2026-07-28

### Highlights

- **Ollama calls from the floating panel now run through the service worker** — no more `declarativeNetRequest` Origin rewriting (which also covered requests initiated by provider-page scripts).
- **Prompt content no longer exposed in host-page DOM** — search/filter moved to an in-memory index.
- **Content scripts ship as one bundle** — single injection, no file-order races.
- **Fresh installs pick a real model** from your Ollama instead of assuming `gemma4:latest`.
- **Version + project footer** on the Settings page.

### Added

- **Service-worker Ollama proxy** (`pf-ai` runtime port): streaming `improve`, unary `variants`/`suggest`/`check`, per-request abort (Stop truly cancels the server-side request), abort-all on disconnect. `ollama-service.js` is no longer web-accessible — page-context code cannot import it.
- **`autoSelectModel()`** (`ollama-service.js`): when connected, if the stored model is unset or absent from Ollama's live model list, the first available model is selected and persisted — on app load and in the Settings model dropdown (with a toast when an existing selection was invalid).
- **Settings → About footer**: version from `chrome.runtime.getManifest()`, ODW branding (odw.ai), GitHub source link.
- **Build tooling**: `npm run bundle` (esbuild) and `npm run build` (lint → bundle → reproducible release zip via `scripts/package.sh`).

### Changed

- **Content scripts bundled**: `content.bundle.entry.js` → `content.bundle.js` (esbuild IIFE); the service worker injects only that file. `ai-operations.js` is statically imported (no longer web-accessible). Evaluation order is documented in the entry file and CLAUDE.md. Editing content sources now requires `npm run bundle` before reloading.
- **Panel search/tag filtering** reads `window.__PF_PROMPT_INDEX` (in-memory, keyed by `data-uuid`) instead of `data-title`/`data-content`/`data-tags`/`data-tagsList` attributes — host-page JavaScript can no longer scrape the prompt library off DOM attributes. Tag search is now per-tag (no cross-tag-boundary substring matches).
- `web_accessible_resources` reduced to `icons/*`, `icon-nocircle.svg`, `info.html`, `promptStorage.js`, `utils.js`, `llm_providers.json`, scoped to the 19 provider origins.
- README: Origin-rewrite messaging replaced with the service-worker-proxy description; architecture and troubleshooting updated.

### Removed

- `cors-rules.js` and the `declarativeNetRequest` permission (replaced by the service-worker proxy; no `OLLAMA_ORIGINS` env var needed, same as before).
- `ai-operations.js` and `ollama-service.js` from `web_accessible_resources`.
- Raw content-script sources from the release zip (runtime loads the bundle only).

### Migration / Upgrade notes

- Reload the unpacked extension after updating. The removed permission clears silently.
- Custom Ollama URLs (LAN servers): re-save the URL once in Settings so the host-permission request fires — the proxy uses the same granted permissions.
- `dist/promptforge-v2/` (hand-assembled 2.1.0-era copy) is obsolete; use `npm run build` output.

## [2.1.1] - 2026-07-27

### Highlights

- **The floating panel's AI features work again** — the Versions, Improve, and Variants buttons threw on every click in 2.1.0 (they called methods on the wrong object), and even via the correct path the operations could never run (`ai-operations.js` had no ES exports). Version history was also never written from the panel because the storage adapter exposed only 6 of 15 methods. All three paths fixed and verified.
- **Security hardening** — closed a stored-XSS vector reachable via Import, narrowed web-accessible resources from all sites to the 19 supported providers, and hardened the permissions page against corrupted storage data.
- **Silent data loss fixed** — storage quota/serialization failures no longer resolve as successes; backups include folders and respect a cancelled save dialog.
- **Reliability across the board** — injection races, listener leaks/doubling, SPA navigation races, dark-mode theming of the version modal, and ~25 more (full list below). Roadmap for v3 (multilingual prompts, folder sync) added in `V3_PLAN.md`.

### Security

- **Stored XSS via tags.** Tags were rendered with `innerHTML`, and tag normalization (`trim/lowercase/hyphenate`) let spaceless payloads such as `<svg/onload=…>` survive the Import flow, executing in the isolated world with full `chrome.storage.local` access. Tags, tag suggestions, tag-management labels, and version-history rows now render as text nodes; the app's version modals were rebuilt with DOM APIs (the old innerHTML escaping covered only `<`).
- **`web_accessible_resources` narrowed** from `<all_urls>` to the 19 provider origins — arbitrary websites can no longer fetch the extension's modules (including `ai-operations.js` and `ollama-service.js`).
- **Permissions page hardened** — provider pills are built with DOM APIs instead of `insertAdjacentHTML` on values from the writable `aiProvidersMap` storage key, with `http(s)` scheme guards on links and icons.
- **Latent privacy-contract risk removed** — `InputBoxHandler.getInputContent()` (a dead method that reads host-page input content, exported one caller away from a violation) was deleted; verified zero callers.

### Fixed

- **Dead panel AI buttons** — `content.js` called `PromptUI.showVersionHistory/improvePrompt/generateVariants/autoSuggestMetadata`, but those methods live on `PromptUIManager`; every click threw `TypeError`.
- **`ai-operations.js` had no exports** — `content.js` destructures named exports from the dynamic import and always received `undefined`.
- **Version history never written from the panel** — the `_ps()` storage adapter exposed 6 of 15 methods (`addVersion`, `getVersions`, `restoreVersion`, `bumpUseCount` missing) and failures were swallowed by empty `catch {}`. The adapter now exposes the full module API.
- **Auto-suggest metadata could never run** — it early-returned unless the title was empty, but the create form requires a title. It now fills only fields the user left empty and never overwrites.
- **Silent data loss on storage failure** — `storageGet`/`storageSet` resolved without checking `chrome.runtime.lastError`; quota errors looked like successful saves. They now reject.
- **Concurrency** — `setPrompts` ran without the write lock; folder and tag helpers read outside the lock (TOCTOU); `savePrompt` with a duplicate uuid pushed a corrupting second copy (now upserts); re-importing files without uuids duplicated instead of merging; invalid dates silently kept stale records.
- **Unbounded version growth** — per-prompt version history is capped at 100 entries (the whole store is rewritten on every edit).
- **Backups** — payload now includes folders (restore previously lost folder structure); cancelling the save-as dialog no longer leaves backups "enabled"; download errors are checked; the popup and app duplicated the debounce logic, now unified in one exported `scheduleBackup()`.
- **Double injection** — the service worker's `onUpdated` path ran a dead probe instead of the real init-flag pre-check used by `onAdded`; the content script's top-level `chrome.runtime.onMessage` and `matchMedia` listeners registered outside the init guard. Doubled listeners caused double prompt insertion and a dead-feeling keyboard shortcut. All guarded.
- **Panel hover delay was 10 seconds** (`PROMPT_CLOSE_DELAY = 10000`, a 10× typo) — now 1 s.
- **`hideEl` timer race** — a quick reopen within the hide delay left a stale timer that hid the panel mid-interaction; timers are now tracked, cancellable, and re-check visibility.
- **TagUI listener leak** — every tag input added three permanent document/window listeners; now one shared listener set per page.
- **SPA robustness** — the variable-input form re-acquires the input box at submit time (detached-node inserts were silent no-ops); the MutationObserver watches `documentElement` instead of `<main>` (SPAs replace it); the provider matcher in `inputBoxHandler` is anchored/escaped (substring matches like `chatXopenaiYcom` passed before), caches the provider list, and shadow-DOM search truly recurses.
- **Dark mode** — the version modal and edit-form action buttons used CSS variables (`--opm-bg/--opm-text/--opm-border`) that don't exist in the theme sheet, leaving them permanently light. Colors now resolve from the current mode.
- **App page** — `parseInt('')` wrote `NaN` into settings (context window, variant count); a dead `categories` storage key could white-screen Library and Editor on legacy installs; imported categories are preserved instead of silently nulled on the next save; send-dropdowns close on outside click/Escape; a malformed editor hash (`#/editor/%ff`) no longer blanks the whole app; Copy uses the atomic `bumpUseCount`; toast duration arguments are honored; the tag input strips all commas; `relativeTime` guards invalid dates; leaving the editor mid-stream aborts the Improve request (per-session controller — the shared one let an old stream kill a new session's Stop button); custom Ollama URLs trigger a host-permission request instead of failing silently.
- **Settings hygiene** — "Delete All Data" removes only data keys; `local.clear()` previously wiped the provider map (integrations UI showed disabled while permissions stayed granted), theme, and onboarding, and an enabled auto-backup would have rewritten the backup file with the empty library.
- **Service worker** — context-menu rebuilds are debounced, capped (30 prompts), and error-checked (every `bumpUseCount` used to rebuild the whole menu); async message branches `.catch` into `sendResponse` instead of hanging senders; provider-URL regex escaping fixed; a failed provider-map rebuild stores `{}` instead of `null`.
- Unknown prompt keys now pass through normalisation instead of being silently stripped — groundwork for the v3 `language` field and sync metadata.
- Copy: permissions page said "18 LLMs"; there are 19.

### Removed

- Legacy `prompts` storage key is deleted after migration (was kept forever, wasting quota).
- `InputBoxHandler.getInputContent()` (dead, privacy-risk).
- Dead `createSettingSection` helper in `app.js`.

### Migration / Upgrade notes

- **No data migration required.** Reload the unpacked extension after updating.
- Backups written by 2.1.1 include `folders`; older backup files restore fine (folders default to empty).
- See `V3_PLAN.md` for the audited roadmap: content-script bundling, service-worker Ollama proxy (replacing the DNR Origin-rewrite), multilingual prompts (en/zh-HK/zh-CN), and folder-based sync.

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
