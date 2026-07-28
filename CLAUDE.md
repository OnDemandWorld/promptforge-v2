# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PromptForge is a **Manifest V3 Chrome extension** — a local, privacy-first AI prompt manager that works on 19 LLM provider sites. There is no build step. JavaScript ships to the browser as ES modules.

## Commands

```bash
npm run lint          # ESLint (the only automated check)
npm run lint:fix      # Auto-fix fixable issues
npm test              # Jest — configured but no tests exist yet; tests/ dir is absent
```

To run the extension: `chrome://extensions/` → Developer mode → Load unpacked → select the `promptforge-v2/` directory. Changes take effect after reloading the extension and refreshing target tabs.

## Two execution contexts

Code runs in two completely different Chrome contexts. Mixing them up is the most common source of bugs.

**1. Extension context (ES modules, `chrome.*` APIs, full imports/exports)**
- `service-worker.js` — background; tab injection, context menus, message router
- `app.js` — full-page tab UI (library, editor, settings)
- Library modules imported by the above: `promptStorage.js`, `ollama-service.js`, `integration-manager.js`, `autoBackup.js`, `utils.js`

**2. Content-script context (bundled and injected into provider pages)**

The content sources are bundled by esbuild into a single `content.bundle.js` (`npm run bundle`; `npm run build` = lint + bundle + release zip). The service worker injects **only that file**. The sources and their evaluation order (defined in `content.bundle.entry.js` — do not change casually):

```
content.styles.js    → THEME_COLORS, UI_STYLES, timing constants, injectGlobalStyles()
inputBoxHandler.js   → InputBoxHandler class (input detection per provider)
content.shared.js    → TagService, TagUI, PromptUI; exposes window.__initPromptShared
content.js           → Panel, PromptUIManager, PromptProcessor, PromptMediator, bootstrap;
                       calls __initPromptShared; statically imports ai-operations.js
```

The cross-file window-globals contract still exists *inside* these sources (dissolving it into real imports is a planned refactor): the globals are declared in `eslint.config.js` under `languageOptions.globals` — if you add a new cross-file symbol in a content script, add it there too or ESLint will flag it. `content.js` has an internal section map (`[01]`..`[16]`) at the top; follow that structure when editing it. **After editing any content source, re-run `npm run bundle`** — Chrome loads the generated `content.bundle.js`, not the sources.

There is a double-injection guard (`window.__OPM_PROMPT_MANAGER_INITIALIZED` / `__PF_ALREADY_INITIALIZED`) because `onAdded` and `onUpdated` can race.

## Sources of truth

- **`llm_providers.json`** — the 19 supported AI sites. Defines `pattern` (URL match), `element_selector` (input box), and icon. `integration-manager.js` derives the provider list from this file; `inputBoxHandler.js` reads it directly; `service-worker.js` uses it for permission/injection decisions. Adding a provider = editing this one file.
- **`promptStorage.js`** — every prompt read/write must go through this module. Single key `prompts_storage` in `chrome.storage.local`, schema version 3. Exposes a Promise-based API (`getPrompts`, `savePrompt`, `updatePrompt`, `addVersion`, etc.) and normalises legacy shapes on read.
- **`ollama-service.js`** — all Ollama REST calls. Default model `gemma4:latest`. Supports both local (`localhost:11434`) and cloud (`ollama.com` with bearer token). Settings are read from `chrome.storage.local` on each call (`getOllamaSettings`).

## Privacy contract

Content scripts are **write-only** with respect to the host page — they inject prompts into input boxes but never read page content. This is an explicit design guarantee, not a missing feature. Don't add page-reading code to content scripts.

## AI feature surface

Two surfaces use Ollama differently:
- **`app.js`** calls `ollama-service.js` directly via ES module imports (improve, variants, auto-suggest metadata).
- **`ai-operations.js`** provides the same capabilities from the floating panel. It is bundled into `content.bundle.js` (statically imported by `content.js`) and never touches Ollama directly: every call goes over a `chrome.runtime.connect` port (`pf-ai`) to the service worker, which runs `ollama-service.js` with its host permissions. `ollama-service.js` is not web-accessible — no page-context code can import it. It still depends on content-script globals (`createEl`, `PromptStorageManager`, `PromptUIManager`) — see the header comment.

## Storage shape

```jsonc
// chrome.storage.local, key "prompts_storage"
{
  "version": 3,
  "prompts": [{
    "uuid": "...",            // crypto.randomUUID()
    "title", "content",
    "tags": [],               // normalised: lowercase, hyphenated, deduped
    "category": "Writing & Content",  // display string from CATEGORIES in app.js
    "categoryId": null, "folderId": null,  // legacy/compatibility
    "versions": [{ "content", "source", "metadata", "createdAt" }],
    "createdAt", "updatedAt", "favorite", "useCount", "lastUsedAt"
  }],
  "folders": []
}
```

Other `chrome.storage.local` keys of note: `aiProvidersMap` (rebuilt by service worker on install/permission change), `backup_settings`, `ollamaUrl`, `ollamaModel`, `ollamaBearerToken`, `theme`, `displayMode`, `onboardingCompleted`.

## ESLint conventions worth knowing

- Single quotes, semicolons required, `eqeqeq` enforced (`null` exempt).
- `argsIgnorePattern: '^_'` / `varsIgnorePattern: '^_'` for unused params.
- `chrome` is declared as a global — don't import it.
- `ecmaVersion: 2022`, `sourceType: 'module'`.
- Tests dir is ignored.

## Adding a new LLM provider

Edit `llm_providers.json` only — add an entry with `name`, `pattern`, `url`, `icon_url`, `element_selector`. The integration manager, input box handler, and service worker all pick it up automatically. If the provider needs a custom icon, drop it in `icons/`.
