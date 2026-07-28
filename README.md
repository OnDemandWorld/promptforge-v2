# PromptForge

**A local, privacy-first AI-powered prompt manager for Chrome.**

Write, organize, version, translate, and reuse AI prompts on every LLM provider site — in English, 繁體中文, or 简体中文. All data stays on your device (or in a sync folder *you* choose). AI features run through Ollama — local or cloud.

---

## Quick Start

```bash
# Option A: Local Ollama
ollama pull gemma4:latest
ollama serve
# No OLLAMA_ORIGINS needed — the extension handles the Origin header for you.

# Option B: Cloud (ollama.com) — no install needed
#   1. Create free account at ollama.com
#   2. Get API key from dashboard
#   3. In PromptForge Settings → URL: https://ollama.com, paste API key as Bearer Token
```

Load the extension: `chrome://extensions/` → Developer mode → Load unpacked → `promptforge-v2/`

---

## Two UI Surfaces

| Surface | Where | What |
|---|---|---|
| **Floating Panel** | On every AI site | Search, copy, send with variable support |
| **Full-Page Tab** | `app.html` | Library, editor, settings |

### Core Features

- **Prompt library** — Search (title, content, tags, category), sort (5 modes), category filter, favorites, archive
- **Version history** — Every edit saved; restore any version
- **Variables** — Use `#variable#` syntax; a form appears when sending
- **Hot corner mode** — Minimal indicator that opens panel on hover
- **Clipboard fallback** — When no provider permission is granted, copies to clipboard with toast
- **Export/Import** — JSON backup with UUID-based merge or replace

### Multilingual (v3)

- **Per-prompt language** — `en`, `zh-HK`, `zh-CN`; auto-detected offline (CJK + Traditional/Simplified discrimination), or set manually. Badges + a language filter in the library.
- **Translate / convert** — One click translates a prompt (or converts 繁⇄简 script-only, without rephrasing), stored as a version.
- **Fork into language-linked groups** — Duplicate or fork a translated copy; siblings share a group and show clickable **EN · 简 · 繁** chips.
- **Localized UI** — English, 繁體中文, 简体中文 (follows the browser language).

### Folder Sync (v3)

Settings → **Folder Sync**: sync your library through a single JSON file in any cloud-synced folder (iCloud Drive, Dropbox, Box, OneDrive). Three-way merge with change detection, tombstoned deletions, conflict resolution (later edit wins). Two transports: the browser File System Access API (Chrome/Edge) and a **Native Messaging helper** for Brave and other browsers (`native-host/install.sh <extension-id>` one-time setup — see Settings for the exact command). Syncs while a PromptForge tab is open.

### AI Features (Ollama)

| Feature | What It Does |
|---|---|
| **Improve with AI** | Streams real-time improvements into the editor — in the prompt's language |
| **Generate Variants** | Creates 2–5 meaningfully different versions |
| **Translate** | Translate/convert a prompt into another language (or script) |
| **Fork ▾** | Duplicate, or fork a translated sibling into a language group |
| **Auto-suggest Metadata** | Suggests title, tags, category on first save |
| **✨ Suggest (Library)** | Re-run metadata suggestion on any existing prompt |
| **Thinking Mode** | Toggle `think` field for Gemma reasoning models |

### Supported AI Providers (19)

ChatGPT, Claude, Gemini, DeepSeek, Grok, Microsoft Copilot, Perplexity, Genspark, Poe, GitHub Copilot, Kimi, Mistral Le Chat, OpenAI Playground, OpenRouter, Google AI Studio, LMArena, Qwen, NotebookLM, ChatLLM

---

## Architecture

```
promptforge-v2/
├── manifest.json              # MV3 manifest
├── service-worker.js          # Background: tab injection, context menus, Ollama proxy (pf-ai port)
├── app.html / app.js          # Full-page tab UI (Library, Editor, Settings)
├── popup.html / popup.js      # Toolbar popup (Ollama status + app link)
│
├── content.bundle.js          # GENERATED — the one file injected into AI sites (npm run bundle)
├── content.bundle.entry.js    # Bundle entry (evaluation order of the content sources)
├── content.js                 # Floating panel + icon button on AI sites
├── content.shared.js          # Shared UI helpers (tags, elements, version history)
├── content.styles.js          # In-page CSS injection + UI constants
├── inputBoxHandler.js         # Input detection for 19 LLM providers
│
├── promptStorage.js           # chrome.storage.local, v5 schema, version history
├── autoBackup.js              # Debounced file backup (downloads API) + restore
├── ollama-service.js          # Ollama REST client + AI meta-prompts (local + cloud)
├── cors-rules.js              # Origin-rewrite rule so Ollama accepts extension requests
├── integration-manager.js     # Provider list (derived from llm_providers.json)
├── ai-operations.js           # Improve / variants / translate / auto-suggest (bundled)
├── language.js                # Language registry + offline detection (en/zh-HK/zh-CN)
├── categories.js              # Canonical category ids + names
├── i18n.js / i18n-html.js     # chrome.i18n wrapper + static-HTML hydration
├── _locales/{en,zh_HK,zh_CN}/ # UI string catalogs (209 keys each)
├── sync/                      # Folder sync engine (merge, transports, IndexedDB handles)
├── native-host/               # Native messaging helper for Brave + install scripts
├── llm_providers.json         # 19 provider definitions (pattern, selector, icon)
├── utils.js                   # UUID generator (crypto.randomUUID)
│
├── css/                       # App styles (variables, base, components, editor, library, popup)
├── icons/                     # Extension icons + UI SVGs + provider icons
├── permissions/               # Provider permissions onboarding page
└── info.html                  # Keyboard shortcuts reference
```

### Storage Schema (v5)

Single key `prompts_storage` in `chrome.storage.local`:

```json
{
  "version": 5,
  "prompts": [{
    "uuid": "abc-123",
    "title": "My Prompt",
    "content": "prompt text...",
    "tags": ["coding", "react"],
    "category": "Coding & Development",
    "categoryId": "coding",
    "language": "zh-HK",
    "groupId": "group-uuid-or-null",
    "folderId": null,
    "versions": [{ "content": "...", "source": "user_input", "metadata": {}, "createdAt": "..." }],
    "createdAt": "...",
    "updatedAt": "...",
    "favorite": false,
    "useCount": 5,
    "lastUsedAt": "..."
  }],
  "folders": []
}
```

---

## Key Design Decisions

| Decision | Why |
|---|---|
| **Clipboard by default** | Zero permissions at install. Works on every site immediately. |
| **Opt-in direct injection** | Uses `optional_host_permissions` — user grants per provider. |
| **chrome.storage.local** | Simple API, serializable; the 10MB default quota is plenty for text-only prompts. |
| **Version history per prompt** | Array on each prompt — simpler queries than a separate table. |
| **Two UI surfaces** | Floating panel for quick access; full-page tab for management. |
| **Content scripts only write** | Never read page content — privacy guarantee. |
| **Sync via user-owned folder** | No backend: sync rides the user's own cloud client (iCloud/Dropbox/Box/OneDrive) through one merge-able JSON file; native helper only for browsers without the folder API. |
| **Language-linked forks, not nested translations** | Separate entries with a shared `groupId` — keeps versions/tags/stats per entry and every feature orthogonal; chips provide the language toggle. |

---

## Development

```bash
npm install
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix fixable issues
npm run bundle        # Rebuild content.bundle.js (required after editing content sources)
npm run build         # lint + bundle + release zip in dist/
```

Release history is in [CHANGELOG.md](CHANGELOG.md).

### Debugging

- **Content script logs**: Open DevTools on the AI site page
- **Service worker logs**: `chrome://extensions/` → PromptForge → "Service Worker" link
- **Storage inspector**: `chrome://extensions/` → PromptForge → "Storage"

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Ollama connection fails (403) | No `OLLAMA_ORIGINS` env var needed — the extension rewrites the Origin header automatically (scoped to its own requests). If it still fails: confirm Ollama is running at the configured URL, and (cloud) check the API key |
| "This browser blocks folder access" (sync) | Brave blocks the File System Access API — use Settings → Folder Sync → **Native helper** (one-time `native-host/install.sh <extension-id>`, shown in the UI), or enable `brave://flags` → File System Access API |
| Sync not updating | Sync runs while a PromptForge tab is open (30 s poll + on edit). Check the status line in Settings → Folder Sync; use **Sync Now** to force a cycle |
| Prompt won't inject into site | 1) Enable integration in Settings, 2) Refresh the site, 3) Click into input first |
| Floating panel not appearing | Check provider integration is enabled; reload the page |
| Variables not processing | Use `#variable_name#` syntax (letters, numbers, underscores only) |

---

## Credits

Built on [Open Prompt Manager](https://github.com/jonathanbertholet/promptmanager) by Jonathan Bertholet (MIT License). 
AI features, full-page tab UI, and site injection enhancements by [ODW Team](https://ondemandworld.com/).

## License

MIT
