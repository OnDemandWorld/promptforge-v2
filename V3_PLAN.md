# PromptForge — v2 Review, v2.1.1 Fixes & v3 Plan

**Date:** 2026-07-27
**Scope:** Full audit of the v2.1.0 codebase (all three layers: background/extension modules, content scripts, full-page UI + packaging), the bug fixes applied in this pass, the refactor roadmap, and detailed designs for the two proposed v3 features: **multilingual prompts (en / zh-HK / zh-CN)** and **folder-based sync (iCloud / Dropbox / Box / OneDrive)**.

---

## Progress log

| Date | Milestone | Status |
|------|-----------|--------|
| 2026-07-27 | **v2.1.1** — audit + 40+ fixes (Part A), committed & tagged locally (not pushed) | ✅ Done |
| 2026-07-27 | **B1** — Ollama proxied through service worker (`pf-ai` port RPC); `cors-rules.js` deleted, `declarativeNetRequest` permission dropped, `ollama-service.js` no longer web-accessible | ✅ Done (browser-untested) |
| 2026-07-27 | **B2** — prompt bodies removed from host-page DOM; search/filter via in-memory `__PF_PROMPT_INDEX` keyed by `data-uuid` | ✅ Done (browser-untested) |
| 2026-07-27 | **C1** — content scripts bundled by esbuild → single `content.bundle.js` injection (order contract moved into `content.bundle.entry.js`); `ai-operations.js` dropped from WAR | ✅ Done (browser-untested) |
| 2026-07-27 | **C5** — `npm run bundle` / `npm run build` (lint + bundle + reproducible zip via `scripts/package.sh`) | ✅ Done |
| 2026-07-28 | **v2.2.0 released** — committed `2899c1f`, tagged, **pushed to origin** (`main` + tags `v2.1.1`, `v2.2.0`). Also shipped: Settings About footer (version + ODW branding) and `autoSelectModel()` (fresh installs pick a real Ollama model) | ✅ Done |
| 2026-07-28 | **D-I** — schema v4 `language` field (BCP-47, null = unknown, lazy migration); new pure module `language.js` (registry + normalisation + offline detection with ~450-pair Trad/Simp table, unit-checked in Node); editor language selector (Auto-detect default, resolved at save, stored language reflected on load); library language filter + per-card badge | ✅ Done (browser-untested) |
| 2026-07-28 | **D-II** — system-prompt factories with target-language directives (`makeImproveSystemPrompt(language)` etc.); `language` threaded through app editor, SW port RPC, and panel operations; `suggestTags` fallback filter now Unicode-aware; panel forms + Settings language-set picker + default-language preference | ✅ Done (browser-untested) |
| 2026-07-28 | **D-III** — C4 canonical `categoryId` (`categories.js`, derived from legacy names in `promptStorage`); `i18n.js` (`t()` with English fallbacks, `Intl.RelativeTimeFormat`); `i18n-html.js` hydration for static HTML; `default_locale: "en"`; manifest strings via `__MSG_*__`; ~120 app/popup/settings strings extracted | ✅ Done |
| 2026-07-28 | **D-IV** — `_locales/{en,zh_HK,zh_CN}/messages.json`, 194 keys, full parity, valid JSON; ~75 content-script strings via `window.PFI18n` bridge (icons, placeholders, buttons, settings, modals, confirms); ai-operations toasts localised. **Known gaps:** sync-UI strings, a few settings rows (Theme/Display/AI-Features labels), the marketing banner, info/permissions pages — all fall back to English, none blank | ✅ Done |
| 2026-07-28 | **E (core)** — `sync/syncStore.js` (IndexedDB directory-handle persistence, device id, settings) + `sync/syncEngine.js` (three-way merge with shadow digests, rev/tombstones, atomic writes, Dropbox conflicted-copy folding, 30 s poll + on-edit debounce + focus sync, permission-lapse Reconnect flow); Settings → Folder Sync section; merge engine unit-verified (7 scenarios incl. steady-state idempotency). **Needs your 2-machine test**; sync-UI strings English-only | ✅ Done (browser-untested) |
| 2026-07-28 | **B6** — deleted dead `Views.createEditView` (~93 lines) and `checkCurrentSitePermission`; fixed stale SW comment. (`EventBus` is NOT dead — powers prompt-select events; kept.) | ✅ Done |
| 2026-07-28 | **E-fix — Brave compatibility**: Brave blocks the File System Access API by policy, so sync now has a **dual transport**: FS Access (Chrome/Edge) + **Native Messaging helper** (`native-host/promptforge-sync-host.cjs`, dependency-free Node; OS-native folder picker; atomic tmp+rename writes; `~/.promptforge-sync/config.json`), installed via `native-host/install.sh <extension-id>` (macOS/Linux, Chrome/Brave/Edge/Arc profiles) and `install.ps1` (Windows). Engine dispatches on `settings.transport`; same merge code both paths. Host protocol end-to-end verified (ping/set-folder/write/read/list-conflicted all pass). `nativeMessaging` permission added. **Requires one-time install on each machine** (needs the unpacked extension's ID) | ✅ Done (needs your install + test) |
| — | Follow-ups: sync-UI i18n, remaining settings-row strings, info/permissions page i18n, B4 alerts→toasts, B5 cross-context Web Locks, C2/C3 app.js decomposition, jest tests beyond merge engine, CJK layout QA pass | Backlog |
| 2026-07-28 | **D-VI — linked forks** (workflow-driven): prompts reuse across languages are now one click — **Fork ▾** in editor + panel: "Duplicate (same language)" or "Fork to {language}" (streams a translation via the existing pipeline). Forked siblings share a **`groupId`** (schema v5; created and back-filled onto the source on first fork, titles kept identical). Library cards in a group render **EN · 简 · 繁 chips** — bold marks the current prompt, clicking jumps to the sibling. Per-entry versions/tags/usage-stats preserved by design; `groupId` added to the sync digest — verified both directions (assignment pushes, remote assignment received, sibling forks sync in as new prompts). Chosen over "translations-inside-one-entry" (option A) for blast-radius reasons; `groupId` leaves an A-style grouped view open as an additive follow-up. | ✅ Done (browser-untested) |
| 2026-07-28 | **D-V — Translate/convert button** (user-requested): editor + panel button → inline target-language picker (excludes the prompt's current language) → streams the translation into the editor, snapshots pre-translation text as a version, stores the result as an `ai_translation` version with `{from, to}` metadata, and **updates the prompt's `language` field** so detection/rewrite stay consistent. `makeTranslateSystemPrompt(to, from)` has two modes: strict **script-only conversion** for zh-HK↔zh-CN ("convert characters/terminology, never rephrase") and full translation otherwise. New `translate` RPC op; 9 new catalog keys × 3 locales (203 total, parity verified). Decision locked: LLM conversion now, deterministic OpenCC-style table later only if wording drift is observed. | ✅ Done (browser-untested) |
| 2026-07-28 | **Regression fix (B1 root-cause correction):** user-reported 403 "Ollama rejected the request (origin or auth)" on all AI features. B1 wrongly assumed host-permissioned fetches need no Origin handling — the browser enforces CORS, but **Ollama enforces its own origin allow-list server-side**, and extension contexts always send `Origin: chrome-extension://…` (a forbidden header for fetch). `cors-rules.js` restored: Origin→`http://localhost` rewrite, now scoped to `initiatorDomains: [chrome.runtime.id]` only (tighter than 2.1.0's extension+provider scope, since all Ollama fetches are now extension-context), with unscoped fallback if Chrome rejects the self-scoped rule. `declarativeNetRequest` permission re-added; SW re-syncs on install/startup/URL change. **Lesson recorded:** server-side auth/origin checks are invisible to browser-permission analysis — integration assumptions need a live-environment test. | ✅ Fixed (needs reload + your retest) |
| — | B4 alerts→toasts, B6 dead code, B7 context-safe storage split, C2 app.js decomposition, C3 shared modules, C4 category IDs, B5 cross-context locking | Pending |
| — | **D** — multilingual (en/zh-HK/zh-CN) | Pending |
| — | **E** — folder sync | Pending |

**Decisions locked:** planned sequence; CORS proxy via SW; zh variant = auto-detect with ask-if-unsure (ambiguous default: first Chinese variant in the user's active set).

**Browser test checklist for v2.2 work** (lint-only verified so far):
1. Provider page → panel: Improve (streaming + Stop actually stops), Variants, Versions button, auto-suggest on new prompt save.
2. Panel search + tag-pill filtering still filter correctly (B2).
3. App tab editor: Improve/Variants/Version History (unchanged path, sanity).
4. Popup copy → backup trigger still works (scheduleBackup).
5. Fresh install: single `content.bundle.js` injection, no double panel.

---

## Executive summary

The v2.1.0 codebase is structurally sound — storage is centralized, the provider list is data-driven, and the privacy contract (content scripts never read page content) is intact. But the audit found **~70 issues**, and three of them were **critical functional breaks in the shipped product**:

1. The floating panel's **AI buttons (Versions / Improve / Variants) all threw on click** — they called methods on the wrong object (`PromptUI` instead of `PromptUIManager`).
2. Even via the correct path, the AI operations **could never run** — `ai-operations.js` had no ES exports, and the code imports it by named destructure.
3. **Version history was never written** from the panel — the storage adapter exposed 6 of 15 methods and every failure was swallowed by empty `catch {}`.

Plus a **stored XSS vector** via tags (exploitable through Import — and it would become far more dangerous once sync/shared libraries exist), silent data loss on storage quota errors, a lock that didn't lock across contexts, and more.

**This pass fixed 40+ issues across 13 files** (all criticals, all highs, most mediums). Lint: 0 errors, 109 warnings (baseline was 110). Nothing is committed — review the diff, then we tag **v2.1.1**.

What remains splits cleanly into: (B) deferred issues needing design decisions, (C) the refactor foundation, (D) multilingual support, (E) folder sync.

---

## Part A — Fixed in this pass (v2.1.1)

### Critical (verified before fixing)

| # | Location | Problem | Fix |
|---|----------|---------|-----|
| A1 | `content.js` ×4 call sites | Buttons called `PromptUI.showVersionHistory/improvePrompt/generateVariants/autoSuggestMetadata` — methods that live on `PromptUIManager`; every click threw `TypeError` | Call `PromptUIManager.*` |
| A2 | `ai-operations.js` | No `export` statements; `content.js` destructures `{ improvePrompt }` from the dynamic import → always `undefined` | Added real ES exports (kept `window.PFAIOperations` for compat) |
| A3 | `content.js` `_ps()` adapter | Mapped only 6 of 15 storage methods; `addVersion`/`getVersions`/`restoreVersion`/`bumpUseCount` threw and were swallowed → version history never written, always showed "No version history yet" | Adapter now exposes the full module |
| A4 | `content.shared.js` ×3, `content.js` ×1 | **Stored XSS**: tags rendered via `innerHTML`; tag normalization (`trim/lowercase/hyphenate`) lets spaceless payloads like `<svg/onload=…>` through the Import flow; executes in the isolated world with full `chrome.storage.local` access | All user-derived strings now render as text nodes; version modal rebuilt with DOM APIs |
| A5 | `ai-operations.js` `autoSuggestMetadata` | Early-returned unless title was empty, but the create form requires a title → feature could never run | Now fills only fields the user left empty (title/tags/category), never overwrites |

### High

| # | Location | Problem → Fix |
|---|----------|---------------|
| A6 | `promptStorage.js` `storageGet/storageSet` | Quota/serialization failures resolved silently → callers believed saves succeeded (**silent data loss**). Now reject on `chrome.runtime.lastError` |
| A7 | `promptStorage.js` `setPrompts` | Bulk replace ran without the write lock → raced every other mutation. Now locked |
| A8 | `promptStorage.js` folders/tags | `saveFolder`/`updateFolder`/`addTagToPrompt`/`removeTagFromPrompt` read outside the lock (TOCTOU) → concurrent edits lost updates. Now single-lock read-modify-write (note: `withLock` is not reentrant — documented) |
| A9 | `promptStorage.js` `savePrompt` | Duplicate uuid pushed a second prompt; later updates hit the first, deletes removed both. Now upserts |
| A10 | `promptStorage.js` `mergePrompts` | Re-importing a file without uuids created duplicates; NaN dates silently kept stale records. Now content-matches when uuid is absent + NaN guards |
| A11 | `promptStorage.js` versions | Unbounded per-prompt version growth → slow march to quota. Capped at 100 per prompt |
| A12 | `autoBackup.js` | Backup payload excluded **folders** (restore lost folder structure); `pickBackupFile` marked backups "enabled" even when the user cancelled the dialog; download errors unchecked. All fixed; folders included in write + restore |
| A13 | `service-worker.js` `onUpdated` | Injection probe wrote `window.__PF_INJECTED_CHECK = true` which nothing ever read (dead guard) → double injection on `onAdded`/`onUpdated` race. Now pre-checks `__OPM_PROMPT_MANAGER_INITIALIZED` like `onAdded` |
| A14 | `content.js` top-level | `chrome.runtime.onMessage` + `matchMedia` listeners registered **outside** the init guard → re-injection doubled them → double prompt insertion, keyboard shortcut toggled twice. Both guarded |
| A15 | `content.styles.js` | `PROMPT_CLOSE_DELAY = 10000` — panel hovered over the page for 10 s after mouseleave (10× typo). Now 1000 ms |
| A16 | `content.js` `hideEl` | Pending hide timer wasn't cancellable → quick reopen within 200 ms left a timer that hid the panel mid-interaction. Timer now tracked/cleared + visibility re-checked |
| A17 | `content.shared.js` `TagUI` | Every `createTagInput()` added 3 permanent document/window listeners, never removed → leaked per form open, retained detached DOM. Now one shared global listener set |
| A18 | `inputBoxHandler.js` `getInputContent` | Dead method that reads host-page input content — one caller away from a privacy-contract violation. Deleted (verified zero callers) |
| A19 | `inputBoxHandler.js` provider matching | Unanchored, unescaped regex (`chatXopenaiYcom` matched); providers JSON re-fetched on every click/poll; shadow-DOM search hardcoded 2 levels + full-document walk per call. Anchored/escaped regex, module cache (not cached on failure), true recursion |
| A20 | `content.js` variable form | `inputBox` captured at form mount; SPA navigation left inserts writing into a detached node (silent no-op). Re-acquired at submit with clipboard fallback (both call sites) |
| A21 | `content.js` version modal | Styled with `var(--opm-bg/--opm-text/--opm-border)` — **none of those variables exist** → permanently light-themed in dark mode. Colors resolved from `isDarkMode()` directly; same for the edit-form action buttons |
| A22 | `content.js` MutationObserver | Bound once to `<main>` — SPAs replacing `<main>` killed it. Now observes `documentElement` |
| A23 | `app.js` `improveController` | Module-level controller shared across editor sessions → old stream's `finally{}` nulled the new session's controller (dead Stop button) while writing into a detached textarea. Per-session controller + abort-on-navigate |
| A24 | `app.js` modals | Version rows interpolated `v.source` (storage data) via `innerHTML` with incomplete escaping; inner "View" modal escaped only `<`. Both rebuilt with DOM APIs |

### Medium / Low (selected)

- **`service-worker.js`**: context-menu rebuild now debounced (300 ms), capped at 30 prompts, with error callbacks (was: full rebuild per `bumpUseCount`, duplicate-id spam, unbounded items); async message branches now `.catch` into `sendResponse` (senders no longer hang); provider regex escaping fixed; `aiProvidersMap` failure stores `{}` not `null`
- **`promptStorage.js`**: unknown keys now pass through normalisation (prerequisite for the v3 `language` field and sync metadata — previously silently stripped on every read+write); legacy `prompts` key removed after migration
- **`app.js`**: `parseInt('')` → NaN written to storage for numCtx/variantCount (now falls back to defaults); dead `categories` storage key removed (legacy object shape there white-screened Library+Editor); Copy button uses atomic `bumpUseCount`; imported categories preserved instead of silently nulled on next save; send-dropdowns close on outside click/Escape; `decodeURIComponent` crash on malformed hash guarded (was: blank screen, dead nav); "Delete All Data" scoped to data keys only (was wiping `aiProvidersMap`, theme, onboarding — and would have overwritten sync backups with the empty library); toast `duration` arg honored; tag input strips all commas; `relativeTime` guards invalid dates; Ollama URL change now requests host permission for custom origins (LAN servers failed silently before)
- **`permissions/permissions.js`**: provider pills built with DOM APIs instead of `insertAdjacentHTML` on writable-storage values, with `http(s)` scheme guards on `href`/`src`
- **`manifest.json`**: `web_accessible_resources` narrowed from `<all_urls>` to the 19 provider origins (any website could previously fetch the extension's modules)
- **`popup.js` / `autoBackup.js`**: duplicated backup-debounce logic unified into one exported `scheduleBackup()`; popup element lookups null-guarded
- **Copy**: permissions page "18 LLMs" → 19

---

## Part B — Known issues deliberately deferred (need design decisions)

These are real but are redesigns, not fixes — flagged for your call:

| # | Issue | Why deferred |
|---|-------|--------------|
| B1 | **`cors-rules.js` Origin rewrite weakens Ollama's origin protection**: the rule applies to requests *initiated by the provider page origin* — which includes the provider's own JS. A compromised/XSS'd provider site could call your local Ollama (compute abuse; no data access). Proper fix: proxy Ollama calls through the service worker and drop page-origin initiators | Architecture change to the AI-in-panel path; wants its own review. **Recommend for v3** |
| B2 | **Full prompt bodies mirrored into `data-content`/`data-title` attributes in the host page DOM** (content.shared.js) — host-page JS can scrape your entire library. Not a read *by us*, so the privacy contract stands, but it's an exposure we create | Fix = move list filtering to an in-memory map; touches the list/search code. **Recommend for v3 (before sync ships)** |
| B3 | Panel UI injected into page DOM with no isolation (host CSS can leak in). Proper fix: closed shadow root | Large, mechanical, test-heavy. v3 refactor candidate |
| B4 | 16 `alert()`/`confirm()` calls in content scripts (host-origin blocking dialogs) | Replace with the existing toast/modal pattern; mechanical |
| B5 | `withLock` is per-context (app tab, popup, SW each have their own) — serialization only holds *within* a context. True cross-context safety needs Web Locks or optimistic concurrency (store hash + retry) | Design decision; sync feature (Part E) needs this solved properly — plan to do it there |
| B6 | Dead code: `Views.createEditView` (94 lines), `EventBus`, `checkCurrentSitePermission` (never called, contradicts SW comment), `window.__PF_INJECTED_CHECK` (removed ✓) | Delete in refactor pass |
| B7 | `promptStorage.js` exports DOM-bound helpers (`exportPrompts`/`importPrompts` use `document`) yet is imported by the service worker — not context-safe | Split DOM helpers into `ui/` modules in refactor |
| B8 | No tests; Jest configured against a nonexistent `tests/` dir; puppeteer (~300 MB) is dead weight in `package-lock` | Test strategy in Part C |
| B9 | Packaging is manual (`dist/` hand-assembled, stray `.DS_Store`, no zip script) | Add `npm run build` in Part C |
| B10 | `suggestTags` fallback filter `/^[a-z0-9-]+$/` discards non-ASCII tags; `cleanCategory` matches English names only | Fixed **as part of the multilingual feature** (Part D) — it's the same work |

---

## Part C — Refactor plan (the v3 foundation)

Sequenced so each step leaves the extension shippable.

### C1. Bundle the content scripts (kills the globals contract)

Today four files are injected in order and communicate via ~24 `window.*` globals mirrored in `eslint.config.js` — the source of the A1/A3-class bugs (`PromptUI` vs `PromptUIManager`, the drifting `_ps()` adapter, `window.IMPORT_SUCCESS_RESET_MS` that was never on `window`, the `__initPromptShared` dance).

- Add **esbuild** as a dev dependency; bundle `src/content/*.js` → one IIFE `content.bundle.js` with real `import`/`export`. Zero runtime, no framework. The service worker injects one file instead of four; injection order stops being a constraint.
- Move the four current files under `src/content/`, keep the `[01]..[16]` section discipline as module boundaries.
- `eslint.config.js` globals block shrinks to just the injection guards.
- `ai-operations.js` becomes a normal module bundled in — deletes the web-accessible-resource exposure of the AI logic entirely (partially addresses B1's surface).
- Ship path unchanged: `dist/` build script (C5) produces the unpacked dir + zip.

**Risk:** low-medium. The bundle is a build concern only; runtime behavior is identical. Do this first — every later step benefits.

### C2. Decompose `app.js` (54 KB → modules, still plain ES modules)

Current implicit structure: Library (272 lines) / Editor (291) / Modals (87, three divergent implementations) / Settings (443) / bootstrap. Proposed split:

```
src/app/
  dom.js            # el(), $, $$, toast(), relativeTime() → Intl-based (D)
  theme.js
  modals.js         # one openModal(content) with overlay + Esc + focus restore
  router.js
  views/library.js  # + components/promptCard.js, components/sendDropdown.js
  views/editor.js   # + editor/aiActions.js
  settings/         # declarative settingRow(label, control, onChange) — the same
                    # row boilerplate repeats ~20×; this cuts settings code ~40%
  status/ollama.js  # dedup with popup.js's copy of the status-dot logic
```

### C3. Shared modules between app/popup/content

`el()` vs `createEl` are the same helper written twice (and the same children-array bug was fixed in both per CHANGELOG). Toast exists three times. Ollama status-dot logic twice. Search filter twice. After C1, content can't literally share app modules (different worlds), but **app.js and popup.js can share everything today**, and the design tokens (CSS vars) are already the shared layer for content.

### C4. Canonical category IDs (prerequisite for i18n)

The category string is simultaneously the stored value, the display label, and the literal the AI emits and `cleanCategory()` matches. Translating display names without canonical IDs breaks classification and cross-locale data portability. The schema has an unused legacy `categoryId` field — repurpose it:

- `categoryId: 'writing' | 'coding' | …` (stable, English, kebab-case)
- `category` display string derived from locale tables; stored `category` becomes display-only and is re-derived on read
- AI system prompt keeps English category names (model reliability); `cleanCategory()` keeps matching English; mapping to ID is one table

### C5. Tests + packaging

- Delete puppeteer/jest dead weight **or** land the first real tests. Recommend: **Jest + jsdom for `promptStorage.js`** (pure logic, the highest-value target: normalisation, merge, lock semantics) and a small `tests/` suite; keep it growing per feature.
- `npm run build`: stage a clean dir (explicit excludes: node_modules, .git, .DS_Store, dev configs), zip reproducibly, version-stamp.

---

## Part D — v3 Feature 1: Multilingual support

### Requirements (as discussed)

- Prompts carry a language: **en, zh-HK, zh-CN** to start; user picks their own set of active languages.
- The AI rewrite features (improve, variants, title/tags/category suggestions) adapt to the prompt's language.
- UI localizes to the same languages.

### D1. Data model (schema v4)

`promptStorage.js` already passes unknown keys through (A-fix), so this is additive:

```jsonc
// per prompt
{ "language": "zh-HK" }        // BCP-47; null = unknown (legacy prompts)
// settings (chrome.storage.local)
{ "promptLanguages": ["en", "zh-HK", "zh-CN"],   // user's active set
  "defaultPromptLanguage": "en",                  // or "auto"
  "uiLanguage": "system" }                        // system | en | zh-HK | zh-CN
```

- Schema version bump to 4 is **lazy** (like v3): missing `language` tolerated, defaulted `null`. No migration pass needed.
- BCP-47 casing (`zh-HK` not `zh-hk`) normalized on write. Chrome locale IDs use underscores (`zh_HK`) — one mapping helper.

### D2. Language handling in the library/editor

- **Editor**: language selector populated from the user's active set + "Auto". Auto = detection on save.
- **Detection** (no network needed):
  - CJK vs Latin by Unicode range (`一-鿿`, `㐀-䶿`) → if CJK dominates, Chinese; else Latin → `en` (default Latin locale; extensible later).
  - **zh-HK vs zh-CN**: Traditional vs Simplified discrimination. A small frequency table of ~200 common character pairs (學/学、東/东、國/国…) scores the text; fallback to the user's default Chinese variant. Accurate enough for prompts (short text) — this is a heuristic, documented as such.
  - Detection lives in a new `language.js` module (shared by app + bundled content).
- **Library**: language badge on cards; filter chips alongside categories/tags; search stays substring-based (works across scripts already).

### D3. AI features adapt to language (`ollama-service.js`)

The system prompts are module-level constants — convert to factories (the `makeVariantsSystemPrompt(count)` pattern already exists):

```js
makeImproveSystemPrompt(language)   // appends: "Write the rewritten prompt in
                                    // {LANGUAGE_NAME}. Preserve the user's
                                    // terminology; do not translate code,
                                    // proper nouns, or #variables#."
```

- Thread `language` through `ollamaChat` options, sourced from the prompt's `language` field (panel) or editor selection (app).
- **Model caveat for you**: the default `gemma4:latest` is weak at Chinese. The language feature should surface a settings hint when a CJK language is active and the configured model is known-small; long-term, recommend `qwen3:*` or similar for CJK users. (Documented behavior, not a blocker.)
- **Fix B10 as part of this**: `suggestTags` fallback filter drops non-ASCII today — must accept CJK (`\p{Script=Han}` in the regex, `u` flag). `cleanCategory` keeps English matching (C4) so it's language-neutral by design.
- Metadata suggestions (title/tags) asked to produce output **in the prompt's language**; tags normalized without lowercasing Han characters (lowercasing is a no-op for CJK but keep the ASCII path).

### D4. UI localization (~170 strings)

Census from the audit: app.js ≈100, content scripts ≈80, popup/permissions/info/HTML ≈45 (some overlap). Zero centralization today.

1. `"default_locale": "en"` in manifest; `_locales/{en,zh_HK,zh_CN}/messages.json`. (Add `zh_TW` fallback consideration — some HK users' browsers report zh-TW.)
2. Manifest-visible strings via `__MSG_*__` (name, description, command, default_title).
3. `t(key, subs)` helper wrapping `chrome.i18n.getMessage` with missing-key fallback.
4. Static HTML (app/popup/info/permissions) hydrated via `data-i18n` scan on `DOMContentLoaded` (no build step to do substitution).
5. `relativeTime` → `Intl.RelativeTimeFormat` / `Intl.DateTimeFormat` (gives "3天前" for free).
6. Plurals: `chrome.i18n` has no plural support — the ~5 plural strings ("uses", "model(s)") need manual per-locale handling.
7. Category display names from the C4 ID tables, translated.
8. CJK layout QA: settings labels (`min-width:140px`), button rows with `flex-wrap`, tag pills. CJK is denser so risk is low, but the editor action row needs a visual pass.

### D5. Milestones

| M | Deliverable | Rough effort |
|---|-------------|--------------|
| D-I | Schema v4 + `language.js` detection + editor selector + library badge/filter | 2-3 days |
| D-II | ollama-service factories + language threading + tag/category CJK fixes | 1-2 days |
| D-III | `_locales` extraction (mechanical but wide) + Intl dates + category IDs (C4) | 2-3 days |
| D-IV | zh_HK/zh_CN translation pass + layout QA | 1-2 days (translation quality matters — machine-first then your review) |

---

## Part E — v3 Feature 2: Folder-based sync

### What exists today (and why it isn't sync)

`autoBackup.js` is **one-way**: writes `promptforge-backup.json` via `chrome.downloads` on change; restore is a manual file picker. Critically, `chrome.downloads` can only write **relative to the Downloads folder** — the save-as dialog lets the user aim at iCloud once, but subsequent automatic writes go back to `Downloads/promptforge/`. So "sync" today only works if `Downloads/promptforge` is itself synced. This feature is a genuine redesign.

### E1. Mechanism: File System Access API

- `window.showDirectoryPicker({ mode: 'readwrite' })` — user picks **any** folder: `~/Library/Mobile Documents/com~apple~CloudDocs/PromptForge` (iCloud), `~/Dropbox`, `~/OneDrive`, `~/Box`.
- Available in **window contexts only** (the app tab — and the panel could expose setup via `OPEN_APP_TAB`). Not available in the service worker. This shapes the whole architecture: **sync lives in the app tab**, not the background.
- `FileSystemDirectoryHandle` persists in **IndexedDB** and survives restarts; permission survives with it (Chrome remembers per origin; extension origins are durable). On launch: re-query permission (`handle.queryPermission({mode:'readwrite'})`), `requestPermission` needs a gesture — a one-click "Reconnect sync" banner in the app.
- No FS-change events on the web → **poll** the sync file's `getFile()` mtime/size every N seconds while the app tab is open, plus on window focus.

**Rejected alternatives:** Native Messaging helper (true background sync, but a separate install — too much friction for v3); `chrome.storage.sync` (100 KB total cap — could later carry *settings* sync, not prompts).

### E2. Sync file format & conflict resolution

Single file `promptforge-sync.json` in the chosen folder (human-inspectable, and it rides whatever sync the provider already does):

```jsonc
{
  "version": 1,
  "schemaVersion": 4,
  "deviceId": "uuid-per-install",        // crypto.randomUUID(), stored locally
  "updatedAt": "ISO",
  "prompts": [
    { "...prompt fields", "rev": 7, "modifiedBy": "deviceId", "updatedAt": "ISO" }
  ],
  "folders": [ ... ],
  "tombstones": [ { "uuid": "...", "deletedAt": "ISO", "rev": 8 } ]
}
```

- **Per-prompt `rev` counter + `updatedAt`**: merge = for each uuid across (local, remote): higher rev wins; equal rev → later `updatedAt` wins; still tied → keep local. `rev` increments on every local mutation.
- **Deletions** must sync too → tombstone list (pruned after 90 days), else a device that hasn't heard about a delete re-uploads the prompt forever.
- Writes are **atomic** (`createWritable` → write → close); debounced 2–3 s like today's backup; a write lock (Web Locks API — also solves B5) prevents app-tab/popup clobber.
- **Loop guard**: incoming sync writes hit `chrome.storage.local` → fires `onChanged` → would re-upload. Tag sync-originated writes (module flag) and skip.
- **Cloud-provider realities** (documented in UI, handled defensively):
  - Dropbox/Box may create **conflicted copies** (`promptforge-sync (Device X's conflicted copy).json`) when two devices write simultaneously. Debounce + rev-merge makes true conflicts rare; optionally detect and merge conflicted-copy files, then delete them.
  - iCloud can **evict** files to the cloud (`startDownloadingIfStale` check before read; handle the not-yet-downloaded state).
  - Files open in another app → write errors; retry with backoff.
- **Trust model**: a synced/shared JSON is now an import vector from other machines — which is exactly why the A4 XSS fix matters. All sync data goes through `normalisePrompt` + text-node rendering. (Also argues for fixing B2 before this ships.)

### E3. UX flow

1. Settings → Sync → **Choose Sync Folder** → directory picker → permission granted → initial merge (local ↔ file; empty file = upload local as seed).
2. Status row: folder path, last sync time, device ID, "Reconnect" button (after restart if permission lapsed), Pause/Disable.
3. First run on a new device: pick the same folder → merge pulls the library down.
4. Coexistence with the existing backup: **sync supersedes auto-backup when enabled** (backup becomes the fallback for non-sync users; keep both code paths — the backup code is now fixed and useful).

### E4. Known limitations (be honest in the UI)

- Sync runs **while an app tab is open** (+ a service-worker alarm can nudge a reminder, but can't do FS Access). No silent background sync without Native Messaging.
- Not real-time: poll interval (e.g. 30 s) + provider sync latency.
- Two PromptForge windows on one machine share one device ID — fine (same storage).

### E5. Milestones

| M | Deliverable | Rough effort |
|---|-------------|--------------|
| E-I | `sync/` module: directory picker, IndexedDB handle store, permission lifecycle, reconnect banner | 2 days |
| E-II | File format, atomic read/write, polling, loop guard, Web Locks (also fixes B5) | 2-3 days |
| E-III | Merge engine: rev/updatedAt resolution, tombstones, folder merge; migration seeding from current storage | 2-3 days (this is the part that deserves unit tests — C5) |
| E-IV | Provider edge cases (conflicted copies, iCloud eviction), settings UI, status, docs | 2 days |
| E-V | Soak test across two machines with each provider | 1-2 days |

---

## Part F — Recommended sequence

```
v2.1.1 (now)      → review diff, tag, ship the 40+ fixes (store update)
v2.2  (1-2 wks)   → C1 bundling + C5 build script + B2 dataset leak + B1 CORS proxy
                   (the two security items before sync makes them worse)
v3.0-alpha        → C4 category IDs + D-I/D-II (language data + AI adaptation)
v3.0-beta         → D-III/D-IV (full UI i18n) — your zh-HK/zh-CN review pass
v3.0              → E-I..E-V (sync) — landed last because it's the highest-risk
                   and benefits from the schema v4 + tests + refactor being done
```

Sync lands last deliberately: it multiplies every data-integrity bug by device count, so it wants the fixed storage layer (✓), cross-context locking (B5), tests (C5), and the XSS hardening (✓) underneath it.

## Part G — Open questions for you

1. **CORS proxy (B1)** — OK to move all panel Ollama calls through the service worker in v2.2? Slight latency cost, real security gain.
2. **Detection granularity** — auto-detect zh-HK vs zh-CN by character set (heuristic, ~95% on short text), or always ask when a Chinese variant is active? Your workflow would tell me which.
3. **Default Chinese variant** for ambiguous text — zh-HK or zh-CN?
4. **Sync trust model** — should sync files be optionally encrypted (passphrase-derived key) so a shared Box/Dropbox folder doesn't expose prompt content to folder collaborators? Adds friction; the alternative is "only sync to folders you own."
5. **zh_TW** — add as a fourth locale (fallback for HK users whose browser reports zh-TW)?
6. **Release mechanics** — want a CHANGELOG 2.1.1 entry + `dist/` rebuild + commit/tag as the next step once you've reviewed the diff?

---

*Generated from a three-way parallel audit (background layer / content scripts / UI+packaging) plus an adversarial verification pass on all critical findings. Lint baseline preserved: 0 errors, 109 warnings (was 110).*
