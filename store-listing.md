# PromptForge — Chrome Web Store Listing

## Category

**Productivity**

Workflow tool that helps users manage and reuse prompts across 19 AI sites.
Alternatives if the dashboard requires a more specific one: **Workflow & Planning**
or **Developer Tools** (if leaning into the coding-prompt angle). Avoid
"Extension & Accessibility" — it is not accurate.

---

## Short description (132-char limit)

```
Manage, version, and reuse AI prompts across 19 LLM sites. Local-first; Ollama works without OLLAMA_ORIGINS.
```

---

## Detailed description (16,000-char limit)

```
PromptForge is a local, privacy-first prompt manager for Chrome. Write, organize, version, and reuse AI prompts on every major LLM provider site — with optional AI assistance through Ollama (local or cloud). Your data never leaves your device.

WORKS ON 19 AI SITES
A floating panel appears on ChatGPT, Claude, Gemini, DeepSeek, Grok, Microsoft Copilot, Perplexity, Genspark, Poe, GitHub Copilot, Kimi, Mistral Le Chat, OpenAI Playground, OpenRouter, Google AI Studio, LMArena, Qwen, NotebookLM, and ChatLLM. Search your library, copy a prompt, or send it straight into the page's input box — with variable support.

A FULL-PAGE LIBRARY, TOO
Open the full-page tab for the complete editor: a prompt library with search, five sort modes, category filter, favorites, and archive; a per-prompt version history you can restore; and a settings page for Ollama and the extension.

ORGANIZE YOUR PROMPTS
• Search by title, content, tags, or category
• Sort by recently used, most used, recently updated, or alphabetical
• Categories, tags, favorites, and archive
• Variables: use #variable# syntax and a form appears when you send
• Version history: every edit is saved; restore any past version
• Export / import JSON backups (with UUID-based merge or replace)
• Optional file-based auto-backup for cross-computer sync via iCloud/Dropbox folders

AI FEATURES (OLLAMA — LOCAL OR CLOUD)
• Improve with AI: streams an improved rewrite into the editor in real time
• Generate Variants: creates 2–5 meaningfully different versions
• Auto-suggest Metadata: suggests title, tags, and category on first save
• Suggest (✨): re-run metadata suggestions on any existing prompt
• Thinking Mode toggle for Gemma reasoning models

NO OLLAMA ORIGINS SETUP NEEDED
Running a local Ollama? Just start it with `ollama serve`. PromptForge rewrites the request origin automatically, so you do not need to set OLLAMA_ORIGINS or restart Ollama with special flags. For cloud, point the URL at https://ollama.com and add your API key.

PRIVACY-FIRST BY DESIGN
• All prompt data stays in chrome.storage.local on your device — never sent to any server
• Content scripts only write into input boxes; they never read page content
• Direct injection into AI sites is opt-in, granted per provider through Chrome's optional host permissions
• Clipboard fallback works everywhere with zero permissions at install
• AI features route through your own Ollama instance or your own ollama.com account — PromptForge has no backend

PERMISSIONS, EXPLAINED
• storage — save your prompt library locally
• tabs, scripting — show the floating panel on AI sites and send prompts into their input boxes (opt-in per site)
• contextMenus, notifications — "Save as prompt" from selected text and "send prompt" right-click menu
• downloads — optional file-based backup and JSON export
• declarativeNetRequest — rewrites the Origin header on requests to your configured Ollama host only, so local Ollama accepts the request without OLLAMA_ORIGINS. Scoped to this extension and supported AI sites; it does not touch any other traffic.

Built on Open Prompt Manager by Jonathan Bertholet (MIT). AI features, full-page UI, and site-injection enhancements by the ODW Team.
```

---

## Single-purpose statement

```
Manage and reuse AI prompts across LLM provider sites, with optional local AI assistance via Ollama.
```

## Permission justification

```
• storage — save the user's prompt library locally on their device.
• tabs, scripting — display the floating panel on supported AI sites and insert prompts into their input boxes. Direct injection is opt-in, granted per provider via optional host permissions; nothing is granted at install.
• contextMenus — "Save as prompt" from selected text and a "send prompt" right-click menu.
• notifications — confirm when a prompt is saved, copied, or sent.
• downloads — optional file-based backup and JSON export of the user's library.
• declarativeNetRequest — rewrites the Origin header on requests to the user's configured Ollama host only (so local Ollama accepts them without OLLAMA_ORIGINS). The rule is scoped via initiatorDomains to this extension and the supported AI-site hosts; it does not inspect, read, or modify any other traffic, and no page content is read.
```

---

## What's new in this version (v2.1.0)

```
• Local Ollama now works without OLLAMA_ORIGINS — the extension rewrites the request origin for you.
• Fixed: favorites, archive, and use-counts were not persisting — they now survive across reloads.
• New: an AI processing indicator (spinner + label) in the editor while Ollama is working.
• Fixed: "Import (Replace)" no longer wipes your Ollama/theme/backup settings.
• Fixed: the model name in the top-right status stays in sync with the selected model.
• Tightened permissions and privacy posture (scoped CORS rule, trimmed web-accessible resources, dropped an unused permission).
```

See CHANGELOG.md for the full list.

---

## Assets still needed in the dashboard

- **Store icon (128×128):** use `icons/icon128.png` (included in the package).
- **Screenshots (1280×800 or 640×400, 1–5):** suggested shots — full-page library; editor with the AI processing indicator visible; version-history restore; floating panel on an AI site.
- **Promotional tile (440×280):** optional.
- **Privacy practice disclosure:** state that no personal/sensitive data is collected or transmitted; all prompt data is stored locally; AI features route through the user's own Ollama.
