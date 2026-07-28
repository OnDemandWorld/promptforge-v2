# Build Report — PromptForge v2.1.1 → v2.2 (in progress)

**Report type:** Machine-parseable build report for downstream autonomous agents.
**Repository:** `git@github.com:OnDemandWorld/promptforge-v2.git` — branch `main`, default branch `main`, not archived, no GitHub Releases published.
**HEAD:** `68dea54` (local tag `v2.1.1`; parent `b654d5e` = v2.1.0). `main` is **1 commit ahead of `origin/main`; not pushed** (push requires explicit user approval).
**Uncommitted working-tree changes:** yes — the v2.2 items in §1.2 are uncommitted by design (user approval for commits beyond v2.1.1 has not been granted).
**Verification level:** all changes pass `npm run lint` (0 errors). **No automated tests exist** (`tests/` directory absent; `npm test` exits with "no tests found"). **No browser runtime verification has been performed.** Manual smoke checklist: `V3_PLAN.md` → "Progress log".

---

## 1. Executive Summary

Work completed in this build phase comprises four units:

### 1.1 Full-codebase audit (complete)

- Three parallel read-only audits covered: (a) background/extension modules (`service-worker.js`, `promptStorage.js`, `ollama-service.js`, `integration-manager.js`, `autoBackup.js`, `utils.js`, `cors-rules.js`, `popup.js`); (b) content scripts (`content.js`, `content.shared.js`, `content.styles.js`, `inputBoxHandler.js`, `ai-operations.js`); (c) full-page UI + packaging (`app.js`, HTML pages, `css/`, `manifest.json`, `llm_providers.json`, `package.json`, `permissions/`).
- Supplementary cross-cutting sweeps: 62 `innerHTML`/`insertAdjacentHTML` sinks inventoried; 39 raw `chrome.storage` accesses outside `promptStorage.js`; listener add/remove ratio 13:1; zero `eval`/`new Function`; zero timers in the service worker.
- **Total findings: ~70.** The 4 findings rated CRITICAL were adversarially re-verified by direct source inspection before any fix was applied; all 4 confirmed genuine.

### 1.2 v2.1.1 remediation release (committed `68dea54`, tagged `v2.1.1` locally, NOT pushed)

- 16 files changed, +928/−277 lines. Lint baseline preserved (0 errors, 110 warnings pre/post).
- **Critical defects fixed:** (1) floating-panel AI buttons called `PromptUI.*` methods that exist only on `PromptUIManager` — every click threw `TypeError`; (2) `ai-operations.js` had no ES exports while `content.js` destructured named imports — all panel AI operations resolved to `undefined`; (3) the `_ps()` storage adapter exposed 6 of 15 methods and failures were swallowed by empty `catch {}` — version history was never written from the panel; (4) stored XSS via tags rendered through `innerHTML` (normalization `trim().toLowerCase().replace(/\s+/g,'-')` admits spaceless payloads via Import; execution context has full `chrome.storage.local` access).
- **High/medium defects fixed:** silent data loss on `chrome.runtime.lastError` (storage promises now reject); unlocked `setPrompts`; TOCTOU in folder/tag mutators; duplicate-uuid corruption in `savePrompt` (now upsert); merge duplication + NaN-date handling; unbounded version growth (capped at 100/prompt); backup payloads excluded folders; cancelled save-dialog left backups "enabled"; double-injection (dead `__PF_INJECTED_CHECK` probe replaced with the real init-flag pre-check; top-level message/matchMedia listeners moved inside the guard); `PROMPT_CLOSE_DELAY` 10000→1000 ms; `hideEl` timer race; TagUI listener leak (3 permanent listeners per form open → one shared set); deleted dead `InputBoxHandler.getInputContent` (latent privacy-contract violation); anchored/escaped provider matcher + provider-list caching + true shadow-DOM recursion; SPA input-box staleness (re-acquire at submit); version-modal dark-mode theming (referenced CSS vars do not exist in the theme sheet); per-session `improveController` with abort-on-navigate; NaN settings writes; dead `categories` storage key; scoped "Delete All Data"; runtime host-permission request for custom Ollama URLs; `web_accessible_resources` narrowed from `<all_urls>` to the 19 provider origins; permissions pills DOM-built with URL-scheme guards.
- Full itemized list: `CHANGELOG.md` `[2.1.1]`; audit-to-fix mapping: `V3_PLAN.md` Part A.

### 1.3 v2.2 foundation work (UNCOMMITTED, lint-verified, browser-unverified)

- **B1 — Ollama proxied through the service worker.** New `chrome.runtime.onConnect` port RPC (port name `pf-ai`; protocol: `{id, op}` requests, `{id, chunk}/{id, done}` streaming, `{id, result}` unary, `{id, error}` failures, `{id, cancel}` abort; per-request `AbortController` map; abort-all on disconnect). `ai-operations.js` rewritten as a thin client (`ollamaRPC`, `ollamaStream` with `.cancel()`). `cors-rules.js` **deleted**; `declarativeNetRequest` permission **removed**; `ollama-service.js` removed from `web_accessible_resources`; README prose updated (3 locations).
- **B2 — prompt content removed from host-page DOM.** `data-title`/`data-content`/`data-tags`/`data-tagsList` attributes eliminated; items now carry only `data-uuid` (+ `data-index` for reorder). Search/tag filtering reads `window.__PF_PROMPT_INDEX` (in-memory `Map<uuid, {title, content, tags}>`, lowercased at write time). `filterPromptItems` rewritten accordingly (per-tag `includes` replaces space-joined substring matching — eliminates cross-tag-boundary false matches).
- **C1 — content scripts bundled.** esbuild (devDependency, v0.28.1) bundles `content.bundle.entry.js` → `content.bundle.js` (IIFE, 176,971 bytes, committed as generated artifact so "Load unpacked" needs no build). Evaluation order verified in artifact: `content.styles.js` → `inputBoxHandler.js` (pos 926) → `content.shared.js` registration (pos 929) → `content.js` init flag (pos 2256). `content.js` now **statically imports** `ai-operations.js` (3 dynamic `getURL` imports removed); `ai-operations.js` removed from WAR. Service worker injects `['content.bundle.js']` at both injection sites. Internal cross-file `window.*` globals contract **retained** (dissolution deferred — see §4). `eslint.config.js` ignores: `content.bundle.js`, `dist/**`, `scripts/**`.
- **C5 — build tooling.** `npm run bundle` (esbuild CLI) and `npm run build` (lint → bundle → `scripts/package.sh`). Verified zip: `dist/promptforge-v2.1.1.zip`, 364 KB, 10 runtime JS files, dev files/sources excluded.
- **Lint state:** 0 errors, **53 warnings** (down from 110 baseline; reduction caused by `dist/**` ignore removing stale duplicate-code warnings, plus dead-code removal).

### 1.4 Planning artifacts

- `V3_PLAN.md` created and maintained: audit results (Parts A–B), refactor plan (Part C), multilingual design en/zh-HK/zh-CN (Part D), folder-sync design (Part E), sequence (Part F), open questions (Part G), live progress log with browser test checklist.
- Locked product decisions: planned sequence honored; SW proxy approved; zh variant = auto-detect with ask-if-unsure; ambiguous-language default = first Chinese variant in the user's active language set.

---

## 2. Challenges & Resolutions

| # | Challenge | Resolution |
|---|-----------|------------|
| 1 | Audit findings from parallel agents carried false-positive risk; a plan asserting non-bugs would misdirect downstream work | Adversarial verification pass: all 4 CRITICAL claims re-derived by direct source inspection (`ai-operations.js` export absence; `Object.freeze({State, Elements, Views, Behaviors, Events})` vs call sites; `_ps()` adapter contents; tag `innerHTML` sink + normalization regex). All 4 confirmed before fixing. |
| 2 | `withLock` in `promptStorage.js` is **not reentrant** — wrapping `saveFolder`/`updateFolder` via the already-locked `setFolders` would self-deadlock (inner op queues behind the outer op that awaits it) | Folder/tag mutators perform raw `readRawStorage` + `writeStore` inside a single `withLock`; constraint documented in code comments and `V3_PLAN.md` Part B (B5). |
| 3 | `createEl` (content.js) destructures a fixed options set including `innerHTML` but **not** `textContent`; naive `textContent:` option would be silently ignored | XSS fixes use `createEl`'s third `children` argument (creates text nodes). Verified all user-data sinks converted; `grep dataset\.(title\|content\|tags\|tagsList)` returns zero post-fix. |
| 4 | Edit-tool failure mid-sequence: an `old_string` for the content.js action-row no longer matched because an earlier fix (PromptUI→PromptUIManager) had changed the same lines | Re-read the current region; split into two edits (declaration insert + `replace_all` on the identical cssText string ×3). |
| 5 | Bundle evaluation-order hazard: `content.js` calls `window.__initPromptShared()` **during module evaluation** (line 1825); if `content.shared.js` evaluated after, init would silently skip (guarded by `typeof === 'function'`) | Analyzed eval-time vs call-time dependencies of all 5 modules (shared exposes only at eval; all cross-module usage is call-time except line 1825). Fixed order encoded in `content.bundle.entry.js` (styles → inputBoxHandler → shared → content; ai-operations hoisted before content by esbuild as its dependency — eval-time-safe). Order verified by symbol positions in the built artifact. |
| 6 | No test infrastructure and no browser access in the build environment — fixes could not be runtime-verified | Mitigations: lint gate after every batch (0 errors maintained throughout); structural verification of the bundle (IIFE header, symbol positions, zero residual `getURL('ai-operations')` references); explicit untested-status labeling in `V3_PLAN.md` with a 5-point manual smoke checklist. Debt recorded in §5. |
| 7 | Transient tool-infrastructure failures: Bash safety classifier unavailable twice (git fetch; first `npm install esbuild` denied with "retrying often succeeds") | Retried after continuing independent work; second attempts succeeded. No state corruption. |
| 8 | esbuild `postinstall` script blocked by the environment's `npm allow-scripts` policy (`npm warn allow-scripts`) | Verified the platform binary ships via `optionalDependencies` and works without postinstall (`npx esbuild --version` → 0.28.1). No script approval required or requested. |
| 9 | Initial settings-diagnostic (`~/.claude/settings.json` "Invalid or malformed JSON") not reproducible | Parser verification (Python + Node `JSON.parse`, byte-level scan for BOM/non-ASCII) proved the file valid; mtime indicated repair before session start → diagnostic stale. Genuine issue found instead: 3 junk `env` keys (`attribution: "[object Object]"`, `includeCoAuthoredBy`, `gitAttribution`). **Removal remains pending explicit user approval — file untouched.** |
| 10 | v2.1.0's `chrome.downloads`-based backup cannot write outside `<Downloads>` (filename must be relative), so "sync to iCloud folder" was structurally impossible on the old mechanism | Documented as redesign requirement (`V3_PLAN.md` Part E); v3 sync specified on the File System Access API (`showDirectoryPicker`, IndexedDB handle persistence, window-context-only constraint shapes the architecture). No code attempted in this phase. |

---

## 3. Documentation Delta

### 3.1 Referenced specification documents — NOT PRESENT

**The documents named in the report request do not exist in this repository.** A case-insensitive search excluding `node_modules/` and `.git/` found:

- `research.md` — **ABSENT**
- `tbk.md` — **ABSENT**
- `tsd.md` — **ABSENT**
- `sad.md` — **ABSENT**
- `prd.md` — **ABSENT**

**Therefore no delta against those documents can be computed; none was inferred.** The closest functional equivalent to a PRD/specification set in this repository is `V3_PLAN.md` (authored during this build phase; see §3.2) plus the pre-existing `CLAUDE.md` (architecture guidance) and `store-listing.md` (marketing copy). If the referenced documents exist outside this repository, they were not made available to this build phase; a downstream agent must obtain them before performing a true spec-vs-implementation delta.

### 3.2 Delta against documents that DO exist

| Document | Change class | Detail |
|----------|--------------|--------|
| `V3_PLAN.md` | **ADDED** (this phase) | Audit results (Part A fixed list; Part B deferred items B1–B10), refactor plan (C1–C5), multilingual design (D1–D5: schema v4 `language` field BCP-47, offline detection incl. Traditional/Simplified heuristic, ollama prompt factories, `chrome.i18n` for ~170 strings), folder-sync design (E1–E5: File System Access API, `promptforge-sync.json` with per-prompt `rev`/`modifiedBy`/tombstones, provider edge cases), sequence (Part F), open questions (Part G). Later edit: progress log table + browser test checklist prepended. |
| `CHANGELOG.md` | **MODIFIED** | `[2.1.1] - 2026-07-27` section inserted (Highlights / Security / Fixed / Removed / Migration). Format consistent with existing Keep-a-Changelog entries. No changes to `[2.1.0]` or earlier. **No v2.2 entry yet** (uncommitted work). |
| `README.md` | **MODIFIED** | 3 surgical edits: (1) Quick-Start comment "rewrites the Origin header" → "proxied through the extension's service worker"; (2) architecture listing: `cors-rules.js` line removed, `ai-operations.js` description updated; (3) troubleshooting row for Ollama 403 rewritten. Provider count (19), feature claims untouched. |
| `CLAUDE.md` | **MODIFIED** | Section "Two execution contexts" ¶2 rewritten: 4-file ordered injection → single `content.bundle.js` with source-order table, rebuild rule ("re-run `npm run bundle` after editing content sources"). "AI feature surface" `ai-operations.js` bullet rewritten: WAR dynamic import → bundled + `pf-ai` port proxy; states `ollama-service.js` is not web-accessible. All other sections (sources of truth, privacy contract, storage shape, ESLint conventions, provider-add procedure) unchanged. |
| `manifest.json` (declarative) | **MODIFIED** | `version` 2.1.0→2.1.1; `permissions`: `declarativeNetRequest` **removed** (v2.2); `web_accessible_resources.matches`: `<all_urls>` → 19 provider patterns (v2.1.1), then `ai-operations.js` + `ollama-service.js` **removed** from resources (v2.2). **`default_locale` still absent** (required for Part D i18n — see §4). |
| `eslint.config.js` (declarative) | **MODIFIED** | `ignores` extended: `content.bundle.js`, `dist/**`, `scripts/**`. The ~40-entry content-script `globals` block is **unchanged** (still required — internal window-globals contract survives inside the bundle; removal tracked as future work). |
| `store-listing.md` | **UNCHANGED** | Consistency with the new security model (no more Origin-rewrite messaging) **not verified** — flagged for review. |
| `package.json` (declarative) | **MODIFIED** | `version` 2.1.1; `devDependencies`: `esbuild ^0.28.1` added; `scripts`: `bundle` and `build` added. Dead weight unchanged: `jest`/`jest-environment-jsdom`/`puppeteer` remain with no `tests/` directory (removal-or-land-tests decision pending — §4). |

### 3.3 Scope changes vs initial phase objectives

- **Removed from scope (explicit user-approved deferrals):** CORS architecture redesign was a "flagged for your call" item → user approved SW proxy (executed). Sync and multilingual remain future phases by plan, not by deviation.
- **Added to scope (within approval):** `V3_PLAN.md` authoring (user-requested); `content.bundle.js` committed as generated artifact (deviation from the repo's historical no-build-step norm — justified and documented in CLAUDE.md so "Load unpacked" still works without tooling).

---

## 4. Future Roadmap & Required Edits

Priority key: **P0** = blocking next action; **P1** = next feature phase; **P2/P3** = sequenced later. Source of truth: `V3_PLAN.md` Parts B–G.

### P0 — Stabilization (requires user interaction)

1. **Browser smoke test** the uncommitted v2.2 work using `V3_PLAN.md` checklist: panel Improve (stream + Stop aborts server-side), Variants, Versions, auto-suggest on save, search + tag-pill filtering (B2 path), single-injection on fresh load, popup copy→backup.
2. **Commit + tag v2.2.0** (CHANGELOG entry first). Authorization status: v2.1.1 commit/tag approved and done; **v2.2 commit NOT yet authorized**; **push to origin NOT authorized** for any tag.
3. **`~/.claude/settings.json` cleanup** — remove 3 junk `env` keys (`attribution`, `includeCoAuthoredBy`, `gitAttribution`). Status: **pending explicit user approval; file untouched.** Investigate writer (suspected: external tooling; `"[object Object]"` indicates a serialization bug in whatever wrote it) to prevent recurrence.
4. **Unanswered product questions** (`V3_PLAN.md` Part G): sync-file encryption (passphrase-derived) yes/no; add `zh_TW` as fourth locale yes/no.

### P1 — Multilingual feature (phase D; designs in `V3_PLAN.md` D1–D5)

1. **Schema v4**: per-prompt `language` (BCP-47, nullable; lazy migration — no pass needed; unknown-key passthrough already shipped in v2.1.1). Settings: `promptLanguages`, `defaultPromptLanguage`, `uiLanguage`.
2. **`language.js` module** (new): CJK-vs-Latin Unicode-range detection; zh-HK/zh-CN via ~200-pair Traditional/Simplified frequency table; low-confidence → ask; ambiguous default = first Chinese variant in active set.
3. **Editor/library UI**: language selector (active set + Auto), card badge, filter chips.
4. **`ollama-service.js` refactor**: convert `IMPROVE_SYSTEM_PROMPT`/`TITLE_SYSTEM_PROMPT`/`TAGS_SYSTEM_PROMPT` constants to `make*SystemPrompt(language)` factories (pattern exists: `makeVariantsSystemPrompt`); thread `language` through `ollamaChat` options from prompt field / editor selection.
5. **REQUIRED EDITS in existing code:** `suggestTags` fallback filter `/^[a-z0-9-]+$/` (ollama-service.js) discards non-ASCII — must accept `\p{Script=Han}` (`u` flag); tag normalization lowercasing is CJK-safe (no-op) — verify only.
6. **Model guidance**: default `gemma4:latest` is weak at Chinese — surface a settings hint when CJK languages are active (documented behavior, not a blocker).

### P2 — UI localization + category canonicalization (D-III/D-IV + C4)

1. **C4 (prerequisite, do first):** canonical `categoryId` (repurpose unused legacy field); `category` display string derived from locale tables; AI system prompt + `cleanCategory()` keep English matching.
2. `manifest.json`: add `"default_locale": "en"` (currently absent); create `_locales/{en,zh_HK,zh_CN}/messages.json`; manifest strings via `__MSG_*__`; `t(key, subs)` helper; static HTML hydrated via `data-i18n` scan (no build step available for `__MSG__` in HTML); `relativeTime` → `Intl.RelativeTimeFormat` (gives "3天前"); manual plural handling (~5 strings — `chrome.i18n` has no plural support); ~170 strings to extract (census: app.js ≈100, content ≈80, popup/permissions/info ≈45); CJK layout QA (settings `min-width:140px` labels, `flex-wrap` action rows).

### P3 — Folder sync (phase E; designs in `V3_PLAN.md` E1–E5)

1. `sync/` module: `showDirectoryPicker({mode:'readwrite'})`, IndexedDB handle persistence, `queryPermission`/`requestPermission` lifecycle, reconnect banner.
2. `promptforge-sync.json` format: `deviceId`, per-prompt `rev` + `modifiedBy`, `tombstones` (90-day prune); merge = higher `rev` wins → later `updatedAt` → keep local; atomic `createWritable`; debounce 2–3 s; loop guard on sync-originated writes.
3. **P0 prerequisite from Part B: B5** — replace per-context `withLock` with Web Locks (cross-context) before sync ships; sync multiplies data-integrity bugs by device count.
4. Provider edge cases: Dropbox conflicted-copy detection/merge; iCloud `startDownloadingIfStale`; write-error backoff. Supersedes (not removes) `autoBackup.js` when enabled.
5. Documented limitations: sync runs only while an app tab is open (FS Access unavailable in SW); poll-based (~30 s), not real-time.

### Ongoing / parallel debt (Part B–C backlog)

- **B1-related residual:** none (complete). **B2 residual:** none (complete).
- **B4:** 16 `alert()`/`confirm()` in content scripts → existing toast/modal patterns.
- **B6 dead code:** `Views.createEditView` (94 lines), `EventBus`, `checkCurrentSitePermission` — delete.
- **B7:** split DOM-bound `exportPrompts`/`importPrompts` out of `promptStorage.js` (imported by SW; not context-safe).
- **C2/C3:** decompose `app.js` (1,265 lines; section map in `V3_PLAN.md` §C2); share `el()`/toast/status-dot logic between app.js and popup.js.
- **C1 completion:** dissolve the window-globals contract inside bundled sources into real imports (then delete the eslint globals block); consider shadow-root isolation for the panel (B3).
- **C5 completion:** land `tests/` for `promptStorage.js` (normalisation/merge/lock semantics) or delete jest+puppeteer (~300 MB) dead weight; delete stale `dist/promptforge-v2/` hand-assembled copy and `.DS_Store` files.
- **app.js modal unification:** three divergent modal implementations + no Esc/focus management (Part B, low).
- Regenerate `dist/` artifact via `npm run build` once v2.2 is tagged.

---

## 5. Retrospective Analysis

### 5.1 What Went Well

- **Verify-before-fix discipline on critical findings.** All 4 CRITICAL claims were re-derived from source before editing; 4/4 confirmed. The plan and fixes contained zero false-positive bug claims. This matters specifically because one verified finding (stored XSS via Import) directly constrains the v3 sync design (synced JSON is an attack vector).
- **Lint-gated incremental batches.** Every fix batch ended with a lint checkpoint; error count stayed 0 throughout ~100 edits; warning count monotonically improved 110 → 109 → 108 → 53, each delta explainable (dead-code removal, `dist/**` ignore).
- **Reentrancy hazards caught at design time, not runtime.** The `withLock` non-reentrancy deadlock (folder mutators via `setFolders`) and the bundle evaluation-order hazard (`__initPromptShared` called during module eval) were both identified from source analysis and solved structurally; the latter was additionally verified against symbol positions in the built artifact (lines 926/929/2256).
- **Security work sequenced ahead of the feature that amplifies it.** B1 (CORS proxy) and B2 (DOM leak) landed before sync — the plan explicitly refused the reverse order because sync multiplies both threat surfaces. `declarativeNetRequest` and two WAR entries were eliminated entirely rather than patched.
- **Release hygiene checkpoint.** v2.1.1 committed and tagged before v2.2 work began; the tag makes the uncommitted v2.2 delta reviewable as one unit and every deleted artifact recoverable (`git show v2.1.1:cors-rules.js`).
- **Generated-artifact decision kept zero-friction installation.** Committing `content.bundle.js` (with banner + rebuild rule in CLAUDE.md) preserves the project's "Load unpacked, no build step" user contract while gaining single-file injection.

### 5.2 Areas for Improvement / Accumulated Debt

- **No runtime verification occurred in this phase (largest single risk).** Every fix is lint-verified only; the project has no tests, no CI, and the build environment has no browser. The 5-point manual checklist is the sole runtime gate and depends on the user. **Required mitigation:** P2-era test suite for `promptStorage.js` at minimum; ideally a puppeteer-driven smoke test (the dependency already exists, unused).
- **C1 is half-done by design.** Single-file injection achieved, but the ~24-symbol `window.*` contract and the eslint globals block survive inside the bundle; `content.shared.js` still snapshots globals and uses the `__initPromptShared` deferred-init dance. The class of bug C1 targets (drifting globals, dead window constants) remains possible until real imports replace the contract.
- **Cross-context write safety still unsolved (B5).** `withLock` serializes within one JS context only; app tab + popup + SW + (future) sync each hold independent chains. Known since audit; deliberately deferred to the sync phase, but any pre-sync data-corruption report would trace here.
- **`ai-operations.js` still reaches into `PromptStorageManager._ps()` internals** (lines using `_ps().then(ps => ps.updatePrompt(...))`) — coupling to an adapter that was itself the site of Critical #3. Should call `PromptStorageManager.updatePrompt` directly after the adapter became full-module.
- **53 lint warnings remain** (mostly `no-empty` in `ollama-service.js` JSON-recovery try/catch chains and `caughtErrors` handling) — pre-existing, deliberately untouched, but noise for future static analysis.
- **Stale artifacts on disk:** `dist/promptforge-v2/` (hand-assembled v2.1.0-era copy with `.DS_Store`) still exists; excluded from lint and new zips but present in the working tree.
- **Unresolved external questions block full planning:** sync encryption model and `zh_TW` locale coverage (Part G items 4–5); the writer of the junk `settings.json` env keys is unidentified and may overwrite a cleanup.
- **Process note:** one Edit failure occurred from assuming file state after earlier edits to the same region (content.js action rows); subsequent batches re-read regions before editing. Downstream agents should treat multi-edit regions as dirty after each application.

---

*End of report. All claims verifiable via: `git show 68dea54` (v2.1.1), `git status`/`git diff` (v2.2 uncommitted), `npm run lint`, `V3_PLAN.md`, `CHANGELOG.md [2.1.1]`, and `content.bundle.js` symbol positions.*
