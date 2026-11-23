# PromptForge — Chrome Web Store Listing Copy

Ready-to-paste copy for every field in the Chrome Web Store developer dashboard.
Consumer-facing copy first; review/compliance fields below.

---

## Extension name

```
PromptForge — AI Prompt Manager
```

(If the dashboard prefers the bare brand: `PromptForge`. The suffix adds the
search keyword "AI Prompt Manager" without exceeding the 75-char name limit.)

## Category

**Productivity** → sub-category **Workflow & Planning**.
(Alternative: **Developer Tools** if targeting the coding-prompt audience.)

## Homepage / support URLs

- Homepage: `https://github.com/OnDemandWorld/promptforge-v2`
- Support: `https://github.com/OnDemandWorld/promptforge-v2/issues`

---

## Summary / short description (≤ 132 characters)

```
Local-first AI prompt manager: write, version, translate & reuse prompts on 19 LLM sites. Optional Ollama AI + folder sync.
```

Alternate (privacy-forward):
```
Your AI prompt library, on-device. Organize, version & translate prompts across 19 LLM sites. Private by design.
```

---

## Detailed description (≤ 16,000 characters)

```
Stop rewriting the same prompts. PromptForge is your personal AI prompt library — it lives on your device, follows you across 19 AI sites, and helps you write, organize, version, translate, and reuse your best prompts in seconds.

No account. No backend. No data collection. Your prompts never leave your machine unless you choose to sync them to your own cloud folder.

▸ ONE LIBRARY, EVERY AI SITE
A discreet floating panel appears on ChatGPT, Claude, Gemini, DeepSeek, Grok, Microsoft Copilot, Perplexity, Genspark, Poe, GitHub Copilot, Kimi, Mistral Le Chat, OpenAI Playground, OpenRouter, Google AI Studio, LMArena, Qwen, NotebookLM, and ChatLLM. Search your library, then copy a prompt or send it straight into the page's input box — no tab-switching, no paste juggling.

▸ A POWERFUL FULL-PAGE EDITOR
Open the full tab for the complete workspace: a searchable library with five sort modes, category and language filters, favorites, and archive; a rich editor; and per-prompt version history you can restore in one click.

▸ ORGANIZE ONCE, REUSE FOREVER
• Search by title, content, tag, or category
• Sort by recently used, most used, recently updated, or A–Z
• Categories, tags, favorites, and archive
• Variables: write #variable# placeholders and a fill-in form appears when you send
• Version history: every edit is saved — restore any earlier version
• JSON export/import with smart UUID-based merge or replace
• Optional automatic file backup

▸ MULTILINGUAL PROMPTS — ENGLISH · 繁體中文 · 简体中文
• Every prompt carries a language, auto-detected offline (it even tells Traditional from Simplified Chinese) — or set it yourself
• Translate a prompt in one click; 繁⇄简 converts script only, without rephrasing
• Fork a prompt into language-linked groups: clickable EN · 简 · 繁 chips jump between your translations
• Filter and badge your library by language
• The whole interface is localized in English, 繁體中文, and 简体中文

▸ BRING-YOUR-OWN-CLOUD FOLDER SYNC
Point PromptForge at any folder — iCloud Drive, Dropbox, Box, OneDrive — and your library syncs through a single JSON file. Three-way merge with conflict resolution and deletion tracking keeps your machines in step. Nothing touches a third-party server: the file moves through YOUR cloud, not ours. Works in Chrome and Edge via the browser folder API, and in Brave via an optional one-time open-source local helper.

▸ OPTIONAL AI ASSISTANCE — YOUR OLLAMA, LOCAL OR CLOUD
Connect your own Ollama instance (localhost) or your ollama.com account:
• Improve with AI — streams a clearer rewrite into the editor, in the prompt's language
• Generate Variants — 2–5 meaningfully different versions
• Translate / Fork — language-aware translation and language-group forking
• Auto-suggest Metadata — title, tags, and category suggested on first save
• Thinking Mode toggle for reasoning models
PromptForge has no AI backend of its own — every AI call goes to YOUR Ollama.

▸ LOCAL OLLAMA JUST WORKS
Running Ollama locally? Just `ollama serve`. PromptForge handles the request origin automatically — no OLLAMA_ORIGINS env var, no special restart flags.

▸ PRIVATE BY DESIGN
• All prompt data stays on your device. Optional sync writes only to a folder YOU choose on your own cloud storage.
• Content scripts only WRITE into input boxes — they never read page content.
• Direct injection is opt-in, granted per site through Chrome's optional host permissions. Nothing is granted at install.
• Clipboard fallback works everywhere with zero permissions.
• No analytics, no tracking, no account, no PromptForge server.

▸ PERMISSIONS, IN PLAIN ENGLISH
• storage — save your library locally
• tabs / scripting — show the panel on AI sites and send prompts into input boxes (opt-in per site)
• contextMenus / notifications — "Save as prompt" from selected text, plus a send-prompt right-click menu
• downloads — optional file backup and JSON export
• declarativeNetRequest — rewrites the Origin header on the extension's OWN requests to your configured Ollama host only, so local Ollama accepts them. It touches no other traffic.
• nativeMessaging — talks only to the optional open-source sync helper YOU install, for folder sync in browsers that block the web folder API (e.g. Brave). Inactive unless you set it up.

PromptForge is open source (MIT). Built on Open Prompt Manager by Jonathan Bertholet; AI features, full-page UI, multilingual prompts, folder sync, and site-injection enhancements by the ODW Team.

Your best prompts deserve a home. Install PromptForge and reuse them everywhere.
```

---

## Single-purpose statement

```
PromptForge manages and reuses the user's AI prompts across LLM provider sites, with optional local AI assistance through the user's own Ollama instance and optional sync to a user-chosen folder.
```

## Permission justification (dashboard "Privacy practices" / permission notes)

```
• storage — stores the user's prompt library locally on their device.
• tabs, scripting — displays the floating panel on supported AI sites and inserts prompts into their input boxes. Direct injection is opt-in, granted per provider via optional host permissions; nothing is granted at install. A clipboard fallback requires no host access.
• contextMenus — "Save as prompt" from selected text and a "send prompt" right-click menu.
• notifications — confirms when a prompt is saved, copied, or sent.
• downloads — optional file-based backup and JSON export of the user's library.
• declarativeNetRequest — rewrites the Origin header on the extension's own requests to the user's configured Ollama host only (so local Ollama accepts them without OLLAMA_ORIGINS). The rule is scoped via initiatorDomains to the extension's own id; it does not inspect, read, or modify any other traffic, and no page content is read.
• nativeMessaging — communicates only with the optional open-source sync helper the user installs themselves (native-host/ in the package), used for folder sync in browsers that block the File System Access API. Inactive unless configured.
```

## Privacy practice disclosure (data usage)

```
PromptForge does not collect, transmit, or sell any personal or sensitive data.

• All prompt content, tags, categories, versions, and settings are stored locally on the user's device (chrome.storage.local).
• No analytics, no tracking, no remote backend, no account.
• Optional folder sync writes a single JSON file to a folder the user explicitly chooses on their own cloud storage (iCloud/Dropbox/Box/OneDrive). The data moves through the user's own cloud provider, not through any PromptForge server.
• Optional AI features send prompt text only to the Ollama endpoint the user configures — their own local instance (localhost) or their own ollama.com account.
• Content scripts write into AI-site input boxes only; they never read page content.
• The declarativeNetRequest rule modifies the Origin header solely on the extension's own requests to the user-configured Ollama host.

Data handled: user-generated prompt content (stored locally; optionally synced to the user's own folder; optionally sent to the user's own Ollama endpoint). No data is sold or shared with third parties by the developer.
```

---

## What's new (version notes — v3.1.0)

```
NEW — MULTILINGUAL PROMPTS
• Per-prompt language (English / 繁體中文 / 简体中文) with offline auto-detection, library filter, and badges.
• Translate in one click; 繁⇄简 converts script only, without rephrasing.
• Fork ▾: duplicate or fork a translated sibling; linked groups show clickable EN · 简 · 繁 chips.
• Full UI localization: English, 繁體中文, 简体中文 (follows your browser language).
• AI features now work in the prompt's language.

NEW — FOLDER SYNC (BRING YOUR OWN CLOUD)
• Sync through a JSON file in any cloud-synced folder (iCloud Drive, Dropbox, Box, OneDrive).
• Three-way merge with conflict resolution and deletion tracking across machines.
• Brave support via an optional one-time open-source native helper.

RELIABILITY & SECURITY HARDENING
• Full code audit resolved 77 findings across storage, sync, injection, AI, backup, and packaging.
• Safer imports (validate before replace, with rollback), an unsaved-changes guard, and race-safe library writes.
• Fixed prompt injection on OpenRouter and React-based editors; tighter, host-anchored site matching.
• Fail-closed Ollama origin handling; release package no longer includes any development artifacts.
• Many bug fixes — see CHANGELOG.md for the full list.
```

---

## Promotional tile (440×280) — text overlay

Headline:
```
Your AI prompts, everywhere.
```
Subline:
```
19 AI sites · EN / 繁 / 简 · local-first · optional sync
```

## Screenshot captions (1280×800 or 640×400, 1–5)

1. Full-page library with language badges + EN/简/繁 chips — "One library for every AI site."
2. Editor with Translate / Fork buttons — "Translate & fork prompts in one click."
3. Floating panel on an AI site (show the UI in 中文) — "Send prompts straight into the input box."
4. Folder Sync settings — "Sync through your own iCloud / Dropbox / Box / OneDrive."
5. Languages settings + version history — "Version history, language detection, and full localization."

## Search keywords / tags (for discoverability)

```
prompt manager, AI prompts, ChatGPT prompts, prompt library, prompt organizer,
Ollama, local AI, prompt versioning, prompt translator, multilingual prompts,
繁體中文, 简体中文, productivity, workflow, prompt sync, privacy
```

---

## Assets checklist (dashboard)

- Store icon (128×128): `icons/icon128.png` (in package).
- Screenshots (1–5): see captions above.
- Promotional tile (440×280): optional; text above.
- Privacy practice disclosure: use the section above (no data collected/transmitted by developer).
```
