# PromptForge v3.0.0 — Full-Repository Code Audit

- **Date:** 2026-11-24
- **Mode:** Open Code Review — delegation mode (host-agent review; no external `ocr` CLI / API config used)
- **Scope:** Entire working tree at `main` (commit `2d57890` + uncommitted docs), **all source code**, not just recent diffs
- **Method:** 42 source files partitioned into 4 review groups (extension core / app UI / content scripts / sync+native+build+CSS), each reviewed in full by a dedicated reviewer; every High finding and all Medium findings were then re-verified line-by-line against the source by the lead reviewer. `npm run lint` run as a supplementary signal.
- **Companion data:** [`full-audit.json`](./full-audit.json) — finding IDs below (`#1`…`#79`) match the `id` field there.
- **No source files were modified during this audit.**

## Summary

| Severity | Count |
|----------|-------|
| High     | 11    |
| Medium   | 41    |
| Low      | 27    |
| **Total**| **79**|

**Coverage:** 42 / 42 reviewable files reviewed, 0 skipped (100%).

<details>
<summary>Files reviewed (42)</summary>

- **Extension core (11):** `service-worker.js`, `promptStorage.js`, `autoBackup.js`, `ollama-service.js`, `integration-manager.js`, `utils.js`, `cors-rules.js`, `manifest.json`, `llm_providers.json`, `package.json`, `eslint.config.js`
- **App UI (11):** `app.js`, `app.html`, `popup.js`, `popup.html`, `info.html`, `categories.js`, `i18n.js`, `i18n-html.js`, `permissions/permissions.js`, `permissions/permissions.html`, `permissions/permissions_custom.css`
- **Content scripts (6):** `content.js`, `content.shared.js`, `content.styles.js`, `inputBoxHandler.js`, `ai-operations.js`, `content.bundle.entry.js`
- **Sync / native / build / CSS (14):** `sync/nativeBridge.js`, `sync/syncEngine.js`, `sync/syncStore.js`, `native-host/promptforge-sync-host.cjs`, `native-host/install.sh`, `native-host/install.ps1`, `native-host/promptforge-sync-host.bat`, `scripts/package.sh`, `css/base.css`, `css/components.css`, `css/editor.css`, `css/library.css`, `css/popup.css`, `css/variables.css`

**Excluded** (per audit guardrails): `node_modules/`, `.git/`, `dist/`, `content.bundle.js` (generated build output), `package-lock.json`, `icons/*` + `icon-nocircle.svg` (media), `_locales/*/messages.json` (data assets), `*.md` docs, `.DS_Store`, `.qwen/`, `.claude/`, and the root-level session-transcript `.txt`.
</details>

**Lint baseline:** `npm run lint` → **0 errors, 50 warnings**. Most warnings are `catch (_)` / destructured-`_` placeholders that the ESLint config fails to ignore (see #79); a few are genuine dead code, notably the never-read `dirty` flag in `app.js` (#2).

## Remediation progress (dev branch)

**Baseline (before edits):** `npm run lint` → exit 0, 50 warnings / 0 errors; `npm test` → exit 1 "No tests found" (tests/ absent). No type-checker configured (plain JS).

**Verification commands run after each batch:** `npm run lint`, `npm test`, `npm run bundle` (after content-source edits), `node --check native-host/promptforge-sync-host.cjs`.

**Current status:** lint exit 0 (0 errors, 28 genuine pre-existing warnings); `npm test` → **25/25 pass** across 6 suites (syncEngine, inputBoxHandler, promptStorage, integrationManager, urlMatch, language); bundle exit 0.

| Severity | Fixed | Skipped | Open |
|----------|-------|---------|------|
| High | 10 | 1 (#3) | 0 |
| Medium | 40 | 1 (#19) | 0 |
| Low | 27 | 0 | 0 |

**Skipped (architectural, documented in JSON):**
- **#3** — cross-context single-writer for `prompts_storage`: requires routing all writes through one owner or a storage advisory lock; chrome.storage.local has no atomic CAS, so a safe minimal fix isn't feasible without refactoring every caller. Partially mitigated by #6 (transact) and #36 (locked reorder/tag APIs).
- **#19** — double-read/normalise perf: core write-path refactor needing folder-state threading through every mutation + benchmarking; regression risk outweighs minimal-edit scope.

**Regression tests added** (tests/): syncEngine mergeAll deletion/shadow (#5), inputBoxHandler native-setter + <input> (#7/#8), promptStorage transact + reorder/tag (#6/#36), integrationManager retry (#16), urlMatchesPattern (#17), detectLanguage confidence (#22).

**Remaining open items:** none — all High, Medium, and Low findings are addressed (77 fixed, 2 architectural skips: #3, #19).

### Dominant themes

1. **Lost-update races on `prompts_storage`** — the write lock is per-JS-context (#3), and several flows bulk-replace stale snapshots (#6, #36) or wipe data before validating (#1, #34). This is the single highest-leverage fix area.
2. **Sync engine correctness** — stale shadow (#5), no compare-and-write (#51), overlap guard set too late (#50), conflicted-copy shape mismatch (#48).
3. **Provider injection gaps** — OpenRouter `<input>` unhandled (#7), React value-tracker bypass missing (#8).
4. **Panel edit-form data corruption** — language select read as category (#9), broken fork import (#10), dead save button (#47).
5. **AI flows that silently lose or clobber user text** — #25, #26, #28, #42, #43.

---

## High severity (11) — fix first

- [x] **#1 — Replace-import deletes the whole library before the file is parsed or validated**
  `app.js:1779-1790` · bug
  `chrome.storage.local.remove(['prompts_storage','prompts'])` runs at line 1783 *before* `importPrompts(file)` can throw on corrupt JSON; no rollback, and the removal triggers auto-backup to overwrite the backup file with the empty library 2s later.
  **Fix:** parse/validate (or stage) the import before removing data; or snapshot + restore on failure; prefer an atomic replace in `promptStorage.js`.

- [x] **#2 — Unsaved editor changes silently lost: `dirty` flag tracked but never read**
  `app.js:646-647` (also 85-128) · bug
  No `beforeunload`, no navigation guard; ESLint confirms `dirty` is never used. Title/tag/language edits don't even set it.
  **Fix:** consume the flag on hashchange/beforeunload with a save/discard prompt; mark dirty on all field changes.

- [ ] **#3 — `withLock` serializes only within one JS context**
  `promptStorage.js:171-180` · concurrency
  App tab, service worker, and content-script panel each import their own module instance → three independent locks on one storage key. The comment claiming it fixes panel/app races is wrong. Root cause of #6 and #36.
  **Fix:** single-writer architecture (route writes through the SW) or a `chrome.storage`-based advisory lock.

- [x] **#4 — Backup save-as location ignored; auto-backups always go to default Downloads path**
  `autoBackup.js:75-80` · bug
  `downloadPath: BACKUP_PATH` is hardcoded after the user picks a location; `item.filename` never read. Contradicts the file's own strategy header; cloud-synced backup copies go stale.
  **Fix:** persist the completed download's actual filename, or drop `saveAs` and document the Downloads-only limit of `chrome.downloads`.

- [x] **#5 — Sync shadow only saved when the file is written → deleted prompts resurrect**
  `sync/syncEngine.js:347-358` (native: 413-428) · bug
  Pull-only cycles (`localChanged=true, remoteChanged=false`) skip `saveShadow`, leaving stale digests; a later local deletion then hits the "deleted locally, edited remotely → remote wins" branch (225-228) and is undone every cycle.
  **Fix:** always `saveShadow(result.…)` after a successful merge, on both transports.

- [x] **#6 — Sync cycle's read-merge-write clobbers local edits made during the cycle**
  `sync/syncEngine.js:325-343` (native: 392-407) · concurrency
  Multi-second snapshot→merge→`setPrompts` span is unprotected; any save/edit/delete committing mid-cycle is overwritten by the stale snapshot.
  **Fix:** re-read + re-merge inside the final write lock, apply per-prompt deltas, or abort/retry on a storage generation counter.

- [x] **#7 — OpenRouter `input[type=text]` never injected**
  `inputBoxHandler.js:338-355` · bug
  Only `contenteditable` and `textarea` are handled; OpenRouter's selector (`llm_providers.json:99`) is an `<input>`, which hits the dead `else` ("Unknown input box type").
  **Fix:** add an `HTMLInputElement` branch using the native value setter + input/change events.

- [x] **#8 — React-controlled textareas: direct `.value` assignment is deduped by React's value tracker**
  `inputBoxHandler.js:338-351` · bug
  Plain `.value =` updates React's tracker, so the synthetic `input` event never triggers `onChange`; text shows but state stays empty (DeepSeek/Poe/Copilot/LMArena/Qwen-class sites).
  **Fix:** `Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el, v)` before dispatching the bubbling input event.

- [x] **#9 — Tags-enabled edit save reads the LANGUAGE select as category**
  `content.js:1566-1578` · bug
  `.opm-input-field` matches `[title, categorySelect, languageSelect]` (textarea has a different class), so index `[2]` is the language select; category gets `'auto'`/a language code and `language` is never persisted.
  **Fix:** select the category element explicitly; read and persist `language` like the non-tags path.

- [x] **#10 — `forkPrompt` dynamic-imports `ai-operations.js`, which is not web-accessible**
  `content.js:1692-1697` · bug
  The file was removed from WAR when bundled (manifest.json:45-54), so the `chrome.runtime.getURL` import rejects; panel language-forking is broken (unhandled rejection, no sibling created).
  **Fix:** add `translateText` to the existing static import at `content.js:26`; delete the dynamic import.

- [x] **#11 — Release zip blocklist ships private dev artifacts**
  `scripts/package.sh:13-30` · security
  The 853KB root-level Claude Code session transcript, `BUILD_REPORT.md`, and `.ocr-reports/` match no `-x` pattern → `npm run build` today bundles them into the distributable zip.
  **Fix:** switch to an allowlist of shipped paths (or extend exclusions); verify zip contents before every release.

---

## Medium severity (41)

### Storage, backup & service worker

- [x] **#12 — 15s poll timeout revokes blob while save-as dialog may still be open** — `autoBackup.js:95-99` · bug. Wait for a terminal download state instead of a fixed 15s; revoke only afterwards.
- [x] **#13 — `writeBackup` never verifies download completion; failures silent** — `autoBackup.js:141-151` · error-handling. Track to `complete`/`interrupted` via `onChanged`; the 1s blob revoke can also kill large downloads mid-flight.
- [x] **#16 — Provider list caches `[]` permanently after one transient fetch failure** — `integration-manager.js:18-22` · error-handling. `[]` is truthy → cached forever; injection/Send-to-Tab dead until browser restart. Don't cache failures (mirror `inputBoxHandler.js`).
- [x] **#17 — Match-pattern regex over-matches (`^.*://host/`)** — `service-worker.js:93-98` · bug. Scheme wildcard becomes an absorbent prefix; `https://evil.com/?next=https://chatgpt.com/` matches. Parse the URL and compare host/path properly.
- [x] **#18 — CORS fail-open fallback installs unscoped Origin rewrite** — `cors-rules.js:79-87` · security. If the self-scoped rule is rejected, any website's requests to local Ollama get the allowed Origin (CSRF-style writes). Fail closed instead.
- [ ] **#19 — Every mutation double-reads and double-normalises the whole library** — `promptStorage.js:162-166` · performance. `getPrompts` → `writeStorage` re-read → `writeStore` re-normalise. Read once, normalise once; also shrinks the #3 race window.

### Ollama service

- [x] **#14 — `improvePrompt` hardcodes `think:true`** — `ollama-service.js:482-484` · bug. Ignores the Thinking Mode toggle; 400s on non-thinking models. Honor `settings.useThinking` like `generateVariants`.
- [x] **#15 — Stream generator ignores mid-stream `{"error":…}` objects** — `ollama-service.js:282-289` · error-handling. Truncated output is treated as success and saved as a version. Throw on `data.error`.

### App tab — editor & AI flows

- [x] **#20 — Library AI-Suggest writes `category` without `categoryId`; stale id wins** — `app.js:369-378` · bug. `normalisePrompt` prefers existing `categoryId` (promptStorage.js:78), so the suggestion never takes effect. Pass `categoryId` too.
- [x] **#21 — Variant Count setting dead: editor hardcodes `3`** — `app.js:844` · bug. `count || settings.variantCount` — truthy 3 always wins. Pass the setting (or undefined).
- [x] **#22 — Language auto-detect ignores confidence** — `app.js:695-698` · bug. Mixed 繁/简 text stores a 0.2-confidence guess despite the comment promising null. Gate on confidence ≥ 0.75.
- [x] **#23 — Stored language outside the active set is silently overwritten on save** — `app.js:630-634` · bug. Selector falls back to auto/default; save destroys e.g. a zh-HK fork sibling's language. Append the stored language as an option or preserve it.
- [x] **#24 — Failed/aborted fork translation leaves Fork button disabled forever** — `app.js:943-966` · bug. Catch `return`s before the outer finally that re-enables. Move `disabled=true` inside the outer try.
- [x] **#25 — Translate failure/Stop leaves partial translation in textarea, no restore** — `app.js:891-910` · bug. Unlike Improve, no snapshot restore; abort path is also toast-silent. Restore snapshot or mark partial.
- [x] **#26 — Empty Improve result wipes the textarea silently** — `app.js:810-824` · bug. `textarea.value = buffer` unconditional; empty buffer skips toast/version/restore. Treat empty as failure and restore snapshot.
- [x] **#27 — AI timeouts indistinguishable from user Stop; fail silently** — `app.js:825-827` (also 904, 959) · error-handling. Timeout `abort()` has no reason; message contains 'aborted' → toast suppressed. Use abort reasons or a user-stop flag.
- [x] **#28 — First-save auto-suggest overwrites title/tags typed during the RPC** — `app.js:748-769` · concurrency. Unconditional assignment after await. Re-check field values before applying.
- [x] **#31 — Fork shares `improveController` with Improve/Translate without mutual exclusion** — `app.js:946-966` · concurrency. Overlapping streams orphan controllers; Stop/navigation abort breaks. Single busy flag or per-op controllers with ownership checks.

### App tab — rendering, settings & data management

- [x] **#29 — `loadPrompts` clear-before-await race renders duplicate cards** — `app.js:211-215` · concurrency. Sequence token or clear-after-await.
- [x] **#30 — Overlapping route renders stack two views in `#main-content`** — `app.js:94-118` · concurrency. Route generation counter; bail after awaits if stale.
- [x] **#32 — Non-OK `/api/tags` leaves model selector on "Loading models…" forever** — `app.js:1338-1364` · error-handling. Handle `!res.ok` like the catch path.
- [x] **#33 — "Export All Data" omits folders** — `app.js:1764-1765` · bug. `exportPrompts` serialises prompts only (promptStorage.js:462-463). Export the full store shape or rename the button.
- [x] **#34 — Delete All Data bypasses sync tombstones; sync resurrects the library** — `app.js:1805-1814` · bug. Raw `storage.remove` + reload; `initSync` restarts and re-imports everything. Route through promptStorage + tombstones, or disconnect/warn.

### Content scripts — panel & injection

- [x] **#35 — Port disconnect never settles pending AI RPC/stream promises** — `ai-operations.js:21-49` · error-handling. SW termination mid-request → status div stuck forever. Reject pending RPCs / terminate streams in `onDisconnect`.
- [x] **#36 — Reorder & tag-removal bulk-`setPrompts` a stale render-time snapshot** — `content.shared.js:608-621` (also 959-964) · concurrency. Instance of #3. Add locked `reorderPrompts`/`removeTagEverywhere` APIs.
- [x] **#37 — Drag reorder: stale DOM after mid-drag refresh; listener/interval leak if mouseup missed** — `content.shared.js:484-547` · concurrency. Cleanup on container rebuild + window blur/pointercancel fallback.
- [x] **#38 — Tag-suggestion portals accumulate in `#opm-root`; active registration overwritten** — `content.shared.js:140-145` (also 204) · bug. Remove portal on teardown; unregister `__pfActiveTagSuggestions`.
- [x] **#39 — `PanelRouter.mount` async views can overwrite each other** — `content.js:486-531` · concurrency. Re-check `state.currentView` after each await (mount token).
- [x] **#40 — `replaceVariables` expands `$&`/`$'`/`` $` `` patterns in user values** — `content.js:1935-1937` · bug. Use a replacer function `() => v`.
- [x] **#41 — Create-form save blocks on the AI auto-suggest round-trip; no double-submit guard** — `content.js:691-705` · bug. Fire auto-suggest async; guard the save button (second click creates duplicates).
- [x] **#42 — Panel `autoSuggestMetadata` applies updates from a stale pre-RPC snapshot** — `ai-operations.js:292-320` · concurrency. Re-fetch and re-evaluate "only fill empty fields" after the RPC.
- [x] **#43 — Improve/Translate refresh destroys the open edit form and unsaved edits** — `ai-operations.js:164-168` (also 262) · bug. `refreshPromptList` wipes `#opm-prompt-list` innerHTML (content.js:1102). Update the form field instead when in edit view.
- [x] **#44 — Shadow-DOM lookup walks every element on each poll/selector** — `inputBoxHandler.js:68-80` · performance. ~20 full-document traversals per insertion on big pages. Cache with MutationObserver invalidation / limit hosts.
- [x] **#45 — Duplicate `display:flex` overrides `display:none`: invisible click-blocking panel on load** — `content.styles.js:192-211` · bug. No `pointer-events:none` anywhere; the 280×450 opacity-0 panel intercepts host-page clicks before first open. Remove the duplicate / gate pointer-events on `.opm-visible`.
- [x] **#46 — Double-injection reassigns window globals but shared helpers keep stale closures** — `content.js:1922-1927` · concurrency. `__initPromptShared` early-returns (content.shared.js:7) while classes are re-created. Re-init shared helpers or freeze first instances.
- [x] **#47 — Tags-enabled save listener `{once:true}` consumed on validation failure → button dead** — `content.js:1566-1578` · error-handling. Drop `once:true`; use a double-submit flag.

### Sync & native host

- [x] **#48 — Native conflicted copies never folded: host returns `[{name,data}]`, engine expects raw payloads** — `sync/syncEngine.js:400` · bug. `foldConflicts` skips every wrapper (line 286); conflicted edits lost on Brave/native path. Map `c => c.data` before folding.
- [x] **#49 — No 1MB guard on native-host replies; large libraries permanently break native sync** — `native-host/promptforge-sync-host.cjs:41-47` · bug. Chrome kills hosts sending >1MB messages; `read` returns the whole library. Size-check in `send()`; chunk/page long term.
- [x] **#50 — Sync overlap guard set only after awaits → concurrent cycles** — `sync/syncEngine.js:306-315` · concurrency. Set `_cycleRunning` synchronously after the check; return a distinct 'busy' status.
- [x] **#51 — Sync file overwritten without re-checking mtime/hash since read (cross-device clobber)** — `sync/syncEngine.js:328-357` · concurrency. `mtime` captured (line 83) but never used. Compare-and-write or re-merge on change.
- [x] **#52 — install.ps1 writes manifest with ASCII encoding; non-ASCII user paths corrupted** — `native-host/install.ps1:23` · error-handling. `C:\Users\José\…` → `Jos?`; host never launches. Use UTF-8 (no BOM); validate ExtensionId.

---

## Low severity (27)

- [x] **#53 — Import/merge toasts report total library size as "imported N"** — `app.js:1785-1788` (also 1746-1748; `autoBackup.js:196-197`) · bug. Return a real delta from the import API.
- [x] **#54 — WAR exposes storage modules to all provider origins; GitHub matched site-wide** — `manifest.json:43-76` · security. Restrict matches to exact provider patterns (`github.com/copilot/*`); minimise page-reachable modules.
- [x] **#55 — `savePrompt` upsert resets tags/folderId/language/groupId when omitted** — `promptStorage.js:222-231` · bug. Latent API trap; only override provided fields or document create-only.
- [x] **#56 — `restoreVersion` reads versions outside the write lock (TOCTOU)** — `promptStorage.js:357-365` · concurrency. Resolve the version inside the same `withLock`.
- [x] **#57 — `suggestTags` fallback strips hyphens (`code-review` → `codereview`)** — `ollama-service.js:554-556` · bug. Remove `-` from the stripped character class.
- [x] **#58 — Context-menu prompt click: unhandled rejection + unguarded `tab`** — `service-worker.js:258-261` · error-handling. try/catch + `if (!tab) return;`.
- [x] **#59 — `addTagToPrompt` returns array on empty tag, prompt otherwise** — `promptStorage.js:428-430` · bug. Consistent return type.
- [x] **#60 — pf-ai `suggest` op cannot be cancelled (signal never threaded)** — `service-worker.js:352-354` · error-handling. Pass `options.signal` through `suggestAllMetadata`.
- [x] **#61 — Path-scoped provider patterns miss bare URLs (`/copilot` vs `/copilot/`)** — `llm_providers.json:66-72` (also 129-135) · bug. Add companion bare-path patterns.
- [x] **#62 — Editor load failure leaves blank editor bound to uuid; Save wipes the prompt** — `app.js:611-643` · error-handling. Navigate away or disable save on load failure.
- [x] **#63 — Popup `scheduleBackup` killed by `window.close()` at 800ms (2s debounce)** — `popup.js:69-80` · bug. Await an immediate backup or delegate to the SW before closing.
- [x] **#64 — Popup list clear-before-await duplicate-render race** — `popup.js:33-37` · concurrency. Same fix as #29.
- [x] **#65 — Get Started opens storage-supplied URL without scheme validation** — `permissions/permissions.js:54-65` · security. Apply the same `^https?://` allowlist the pills use (line 114).
- [x] **#66 — Get Started fallback fetch has no `.catch`; stale button when no URL resolves** — `permissions/permissions.js:39-52` · error-handling.
- [x] **#67 — Footer links are unreplaced placeholders (github.com / chromewebstore.google.com homepages)** — `permissions/permissions.html:133-141` · bug.
- [x] **#68 — Hardcoded English strings bypass i18n ('Saved!', 'Saving…', suggest toasts, …)** — `app.js:785-788` (also 106, 384, 387, 638, 719, 1157) · maintainability.
- [x] **#69 — Version-history/favorite/archive/send handlers: unhandled rejections, no UI feedback** — `app.js:989-993` (also 272-275, 396-399, 439-448) · error-handling.
- [x] **#70 — Version "View" modal orphaned without overlay when parent closes; stacks on repeat** — `app.js:1079-1093` · bug.
- [x] **#71 — `doImport` reads `file.text()` outside try/catch (and the result is unused)** — `app.js:1774-1777` · error-handling.
- [x] **#72 — Initial `handleRoute()` has no error boundary; storage failure → blank page** — `app.js:1828` · error-handling.
- [x] **#73 — Close-delay fallback still 10000ms, contradicting the styles' 1000ms fix** — `content.shared.js:993-1001` · maintainability.
- [x] **#74 — install.sh interpolates `$EXT_ID` into manifest JSON unvalidated** — `native-host/install.sh:27-35` · security. Validate `^[a-p]{32}$`; escape `$HOST_PATH`.
- [x] **#75 — `foldConflicts` drops tombstones/folders from conflicted copies (late resurrection)** — `sync/syncEngine.js:283-298` · bug. Union tombstones (newest per uuid) and folders.
- [x] **#76 — `_applyingRemote` loop guard released on a fixed 100ms timer** — `sync/syncEngine.js:334-343` (native: 409) · concurrency. Tag the write, not the clock.
- [x] **#77 — `patchSyncSettings` read-modify-write can lose concurrent patches (e.g. Pause)** — `sync/syncStore.js:75-78` · concurrency. Serialize patches.
- [x] **#78 — Failed rename leaves orphaned `.tmp-<pid>` files synced to all devices** — `native-host/promptforge-sync-host.cjs:118-130` · error-handling. Best-effort unlink in catch.
- [x] **#79 — ESLint `no-unused-vars` missing `caughtErrorsIgnorePattern`/`destructuredArrayIgnorePattern`** — `eslint.config.js:60` · maintainability. 50 warnings are mostly `catch (_)` noise; fix config, then triage genuine dead code (incl. #2's `dirty`).

---

## Suggested remediation order

1. **Data-loss cluster (highest leverage):** #1, #2, #3 → then #6, #36, #34 (they share the single-writer/locked-mutation fix).
2. **Sync correctness:** #5, #50, #51, #48, #75, #76, #77 (test `mergeAll` as a pure function — it is already exported for unit testing; the `tests/` dir is absent, so this is a good first test target).
3. **Injection coverage:** #7, #8, #61, #16, #17.
4. **Panel edit-form integrity:** #9, #10, #47, #43, #39, #46.
5. **AI-flow text safety:** #25, #26, #27, #28, #42, #14, #15, #35.
6. **Backup/release hygiene:** #4, #12, #13, #11, #33, #63.
7. Remaining Mediums, then Lows (several are one-liners: #40, #57, #59, #73, #79).

**Verification notes for future sessions:** after fixing any content source, re-run `npm run bundle` (Chrome loads `content.bundle.js`, not the sources). Re-run `npm run lint` and check the warning count drops as #79 and dead-code findings are resolved. Finding IDs are stable — reference them as `#N` from `full-audit.json`.

## Material behavior observations (not defects)

- The CORS self-scoping (`cors-rules.js`) and the SW-proxied AI port (`ai-operations.js`) are deliberate v2.2 security architecture; #18 concerns only the *fallback* path, not the primary design.
- The sync merge policy ("both changed → later `updatedAt` wins; local edit beats remote delete") is documented as an intentional trade-off in `syncEngine.js:8-17`; findings #5/#51 are about the shadow/mtime mechanics breaking that policy, not the policy itself.
- `content.bundle.js` and `dist/*.zip` are generated artifacts and were excluded from review; the current `dist/promptforge-v3.0.0.zip` predates the root-level transcript file, so it does not contain it — but the next `npm run build` will (#11).
