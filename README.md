# PromptForge v2

**A local, privacy-first AI-powered prompt manager for Chrome.**

Write, organize, version, and reuse AI prompts on every LLM provider site. All data stays on your device. AI features run through Ollama — local or cloud.

---

## Quick Start

```bash
# Option A: Local Ollama
ollama pull gemma4:latest
OLLAMA_ORIGINS="chrome-extension://*" ollama serve

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

### AI Features (Ollama)

| Feature | What It Does |
|---|---|
| **Improve with AI** | Streams real-time improvements into the editor |
| **Generate Variants** | Creates 2–5 meaningfully different versions |
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
├── service-worker.js          # Background: tab injection, context menus, message router
├── app.html / app.js          # Full-page tab UI (Library, Editor, Settings)
├── popup.html / popup.js      # Toolbar popup (Ollama status + app link)
│
├── content.js                 # Floating panel + icon button on AI sites
├── content.shared.js          # Shared UI helpers (tags, elements, version history)
├── content.styles.js          # In-page CSS injection + UI constants
├── inputBoxHandler.js         # Input detection for 19 LLM providers
│
├── promptStorage.js           # chrome.storage.local, v3 schema, version history
├── ollama-service.js          # Ollama REST client (local + cloud with bearer token)
├── integration-manager.js     # Provider list (derived from llm_providers.json)
├── ai-operations.js           # Improve, variants, auto-suggest (extracted from content.js)
├── llm_providers.json         # 19 provider definitions (pattern, selector, icon)
├── utils.js                   # UUID generator (crypto.randomUUID)
│
├── css/                       # App styles (variables, base, components, editor, library, popup)
├── icons/                     # Extension icons + UI SVGs + provider icons
├── permissions/               # Provider permissions onboarding page
├── info.html                  # Keyboard shortcuts reference
└── changelog.html             # Version history
```

### Storage Schema (v3)

Single key `prompts_storage` in `chrome.storage.local`:

```json
{
  "version": 3,
  "prompts": [{
    "uuid": "abc-123",
    "title": "My Prompt",
    "content": "prompt text...",
    "tags": ["coding", "react"],
    "category": "Coding & Development",
    "categoryId": null,
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
| **chrome.storage.local** | Simple API, serializable, ~50MB limit is fine for text-only. |
| **Version history per prompt** | Array on each prompt — simpler queries than a separate table. |
| **Two UI surfaces** | Floating panel for quick access; full-page tab for management. |
| **Content scripts only write** | Never read page content — privacy guarantee. |

---

## Development

```bash
npm install
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix fixable issues
```

### Debugging

- **Content script logs**: Open DevTools on the AI site page
- **Service worker logs**: `chrome://extensions/` → PromptForge → "Service Worker" link
- **Storage inspector**: `chrome://extensions/` → PromptForge → "Storage"

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Ollama connection fails (403) | Local: `OLLAMA_ORIGINS="chrome-extension://*" ollama serve`. Cloud: check API key |
| Prompt won't inject into site | 1) Enable integration in Settings, 2) Refresh the site, 3) Click into input first |
| Floating panel not appearing | Check provider integration is enabled; reload the page |
| Variables not processing | Use `#variable_name#` syntax (letters, numbers, underscores only) |

---

## Credits

Built on [Open Prompt Manager](https://github.com/jonathanbertholet/promptmanager) by Jonathan Bertholet (MIT License). 
AI features, full-page tab UI, and site injection enhancements by [ODW Team](https://ondemandworld.com/).

## License

MIT
