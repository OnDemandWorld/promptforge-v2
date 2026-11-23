# PromptForge Privacy Policy

**Effective date:** 24 November 2026
**Applies to:** the PromptForge browser extension ("PromptForge", "the extension"), published by the ODW Team ("we", "us").

PromptForge is a local, privacy-first AI prompt manager. This policy explains what data the extension handles, where it goes, and what we (the developer) do and do not receive. The short version: **we do not collect, receive, transmit, or sell any of your data.** Everything stays on your device unless you explicitly choose to sync it to your own cloud folder or send it to your own Ollama instance.

---

## 1. Who we are

PromptForge is an open-source extension (MIT license) developed by the ODW Team.
- Project / source: https://github.com/OnDemandWorld/promptforge-v2
- Contact / support: https://github.com/OnDemandWorld/promptforge-v2/issues

PromptForge has **no backend server, no user accounts, and no analytics**. We operate no service that receives your prompts or personal information.

## 2. Data the extension stores (locally, on your device)

To function, PromptForge stores the following **locally on your device** using the browser's local storage (`chrome.storage.local`) and, for folder sync, IndexedDB:

- Your prompts: title, content, tags, category, language, version history, favorites, archive status, and usage statistics (use count, last-used time).
- Your settings: Ollama URL/model/API key (if you configure cloud Ollama), theme, display mode, language preferences, backup and sync configuration.
- A randomly generated local device identifier used only to label sync writes.
- If you enable folder sync: a directory handle and a "shadow" snapshot used to merge changes.

**This data never leaves your device by default.** We cannot access it. It is not transmitted to us or to any third party by the extension.

## 3. Data you may choose to send elsewhere (optional, user-controlled)

These features are **off by default** and only act on destinations you configure:

### a) Folder sync (your own cloud storage)
If you enable folder sync, PromptForge writes a single JSON file containing your library to a folder **you explicitly choose** (for example inside iCloud Drive, Dropbox, Box, or OneDrive). The file is moved between your machines by **your own cloud provider**, not by us. We never receive this file. Your cloud provider's own privacy policy governs that storage. In browsers that block the web folder API (e.g. Brave), an optional open-source local helper (`native-host/` in the source) reads/writes that same folder on your machine; it communicates only with the extension and performs no network activity.

### b) AI features (your own Ollama)
If you use AI features (Improve, Variants, Translate, suggestions), PromptForge sends the relevant prompt text to the **Ollama endpoint you configure**:
- a local instance you run (e.g. `http://localhost:11434`), or
- your own `https://ollama.com` account using your API key.

These requests go directly from your browser to **your** Ollama endpoint. We do not proxy, receive, or store them. If you use ollama.com, Ollama's privacy policy applies to that service. Your API key is stored locally on your device and sent only to the endpoint you configured.

### c) Backup / export (your own files)
Optional auto-backup and JSON export write files to your device's Downloads folder (or a location you choose). These are local files under your control; we never receive them.

## 4. What the extension does NOT do

- **No data collection by the developer.** We do not collect, receive, store, or sell personal or sensitive data. There is no telemetry, analytics, advertising, or tracking.
- **No reading of page content.** Content scripts only *write* prompts into AI-site input boxes. They never read, scrape, or transmit the content of the pages you visit.
- **No account or sign-in.** PromptForge does not require or create any account.
- **No remote code.** All extension code ships in the package; nothing is loaded from a remote server.

## 5. Permissions and why they are needed

| Permission | Purpose | Data implication |
|---|---|---|
| `storage` | Save your library and settings locally | Local only |
| `tabs`, `scripting` | Show the floating panel on supported AI sites and insert prompts into input boxes | Opt-in per site via optional host permissions; nothing granted at install; write-only |
| `contextMenus` | "Save as prompt" from selected text; send-prompt menu | Acts on text you select |
| `notifications` | Confirm save/copy/send actions | Local only |
| `downloads` | Optional file backup and JSON export | Writes local files you control |
| `declarativeNetRequest` | Rewrite the `Origin` header on the extension's **own** requests to your configured Ollama host so local Ollama accepts them | Scoped to the extension's own id; does not inspect, read, or modify any other traffic |
| `nativeMessaging` | Talk to the optional open-source sync helper you install yourself | Inactive unless you set it up; local only |

Direct injection into AI sites is **opt-in**, granted per provider through Chrome's optional host permissions. A clipboard fallback works with no host permissions at all.

## 6. Third-party services

PromptForge itself integrates no third-party analytics, ads, or data services. The only third parties involved are ones **you** choose to use:
- **Your cloud storage provider** (iCloud/Dropbox/Box/OneDrive) if you enable folder sync.
- **Ollama** (your local instance or your ollama.com account) if you use AI features.
- **The AI provider sites** you visit (ChatGPT, Claude, etc.) — PromptForge only inserts text you choose into their input boxes; their own privacy policies govern your use of those sites.

We encourage you to review those providers' policies. We do not control and are not responsible for their practices.

## 7. Data retention and deletion

Because all data is stored locally on your device, **you control retention and deletion**:
- Delete individual prompts, or use "Delete All Data" in Settings, to remove your library.
- Disable folder sync and delete the sync file from your cloud folder to remove synced copies.
- Uninstalling the extension removes its local storage.
We hold no copies of your data, so there is nothing for us to retain or delete on our side.

## 8. Children's privacy

PromptForge is a general-purpose productivity tool and does not knowingly collect any data from anyone, including children. Since we collect no data at all, no children's data is collected, stored, or transmitted by us.

## 9. Security

Your data remains under your device's and browser's security controls. Optional sync uses your own cloud provider's security; optional AI uses your own Ollama endpoint (use HTTPS and an API key for cloud Ollama). The extension's content scripts are write-only and its network rule is scoped to its own requests, minimizing attack surface. No method of storage or transmission is 100% secure, but PromptForge is designed so that your data is never exposed to us or to unrelated third parties.

## 10. Changes to this policy

We may update this policy to reflect changes in the extension or for legal reasons. The "Effective date" above will change, and the updated policy will be published at the project repository. Material changes will be noted in the extension's changelog. Continued use after an update constitutes acceptance of the revised policy.

## 11. Contact

Questions about this policy or PromptForge's privacy practices:
- Open an issue: https://github.com/OnDemandWorld/promptforge-v2/issues
- Project: https://github.com/OnDemandWorld/promptforge-v2

---

*PromptForge is open source under the MIT license. You can inspect exactly how your data is handled in the source code.*
