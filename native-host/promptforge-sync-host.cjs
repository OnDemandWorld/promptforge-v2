#!/usr/bin/env node
// native-host/promptforge-sync-host.cjs — PromptForge sync native messaging host
//
// A tiny dependency-free Node helper that gives the extension read/write
// access to ANY folder (iCloud/Dropbox/Box/OneDrive/…), including in browsers
// that block the File System Access API (Brave). Communicates with the
// extension via Chrome's native messaging protocol (4-byte LE length prefix
// + JSON over stdin/stdout).
//
// Ops:
//   {op:'ping'}                         → {ok:true, host:'promptforge-sync', version:1}
//   {op:'get-folder'}                   → {ok:true, folderPath|null}
//   {op:'set-folder', path}             → {ok:true, folderPath}        (manual path)
//   {op:'pick-folder'}                  → opens the OS folder dialog, persists
//                                         the choice, returns {ok:true, folderPath}
//   {op:'read'}                         → {ok:true, data|null, mtime}  (the sync file)
//   {op:'write', payload}               → {ok:true}                    (atomic write)
//   {op:'list-conflicted'}              → {ok:true, copies:[{name,data}]}
//
// Config lives at ~/.promptforge-sync/config.json — plain JSON, editable.

'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const SYNC_FILENAME = 'promptforge-sync.json';
const CONFIG_DIR = path.join(os.homedir(), '.promptforge-sync');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); }
  catch { return {}; }
}
function saveConfig(cfg) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
}

function send(msg) {
  const buf = Buffer.from(JSON.stringify(msg), 'utf8');
  const header = Buffer.alloc(4);
  header.writeUInt32LE(buf.length, 0);
  process.stdout.write(header);
  process.stdout.write(buf);
}

function syncFilePath(cfg) {
  if (!cfg.folderPath) return null;
  return path.join(cfg.folderPath, SYNC_FILENAME);
}

// ── OS folder pickers ─────────────────────────────────────────────────────
function pickFolderDarwin() {
  const script = 'tell application "System Events" to activate\nPOSIX path of (choose folder with prompt "Choose the PromptForge sync folder (e.g. inside iCloud Drive or Dropbox)")';
  const out = execFileSync('osascript', ['-e', script], { encoding: 'utf8' });
  return out.trim().replace(/\/$/, '') || null;
}
function pickFolderLinux() {
  try {
    return execFileSync('zenity', ['--file-selection', '--directory', '--title=PromptForge sync folder'], { encoding: 'utf8' }).trim() || null;
  } catch {
    return execFileSync('kdialog', ['--getexistingdirectory', os.homedir()], { encoding: 'utf8' }).trim() || null;
  }
}
function pickFolderWin32() {
  const ps = "Add-Type -AssemblyName System.Windows.Forms | Out-Null; $d = New-Object System.Windows.Forms.FolderBrowserDialog; $d.Description = 'PromptForge sync folder'; if ($d.ShowDialog() -eq 'OK') { $d.SelectedPath }";
  const out = execFileSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' });
  return out.trim() || null;
}
function pickFolder() {
  if (process.platform === 'darwin') return pickFolderDarwin();
  if (process.platform === 'win32') return pickFolderWin32();
  return pickFolderLinux();
}

// ── Ops ───────────────────────────────────────────────────────────────────
function handle(msg) {
  const cfg = loadConfig();
  switch (msg && msg.op) {
    case 'ping':
      return { ok: true, host: 'promptforge-sync', version: 1, platform: process.platform };

    case 'get-folder':
      return { ok: true, folderPath: cfg.folderPath || null };

    case 'set-folder': {
      if (typeof msg.path !== 'string' || !msg.path.trim()) return { ok: false, error: 'No path provided' };
      const p = msg.path.trim();
      if (!fs.existsSync(p) || !fs.statSync(p).isDirectory()) return { ok: false, error: 'Not an existing directory: ' + p };
      cfg.folderPath = p;
      saveConfig(cfg);
      return { ok: true, folderPath: p };
    }

    case 'pick-folder': {
      const p = pickFolder();
      if (!p) return { ok: false, error: 'No folder selected' };
      cfg.folderPath = p;
      saveConfig(cfg);
      return { ok: true, folderPath: p };
    }

    case 'read': {
      const f = syncFilePath(cfg);
      if (!f) return { ok: false, error: 'No sync folder configured' };
      try {
        const st = fs.statSync(f);
        const data = JSON.parse(fs.readFileSync(f, 'utf8'));
        return { ok: true, data, mtime: st.mtimeMs || 0 };
      } catch (e) {
        if (e.code === 'ENOENT') return { ok: true, data: null, mtime: 0 };
        return { ok: false, error: e.message };
      }
    }

    case 'write': {
      const f = syncFilePath(cfg);
      if (!f) return { ok: false, error: 'No sync folder configured' };
      try {
        // Atomic: write temp file in the same directory, then rename.
        const tmp = f + '.tmp-' + process.pid;
        fs.writeFileSync(tmp, JSON.stringify(msg.payload, null, 2));
        fs.renameSync(tmp, f);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    }

    case 'list-conflicted': {
      const copies = [];
      if (!cfg.folderPath) return { ok: true, copies };
      try {
        for (const name of fs.readdirSync(cfg.folderPath)) {
          if (!/conflicted copy/i.test(name) || !name.endsWith('.json')) continue;
          try {
            const data = JSON.parse(fs.readFileSync(path.join(cfg.folderPath, name), 'utf8'));
            if (data && Array.isArray(data.prompts)) copies.push({ name, data });
          } catch { /* unreadable copy — skip */ }
        }
      } catch (e) {
        return { ok: false, error: e.message };
      }
      return { ok: true, copies };
    }

    default:
      return { ok: false, error: 'Unknown op: ' + (msg && msg.op) };
  }
}

// ── Native messaging stdio loop ───────────────────────────────────────────
let buffer = Buffer.alloc(0);
process.stdin.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (buffer.length >= 4) {
    const len = buffer.readUInt32LE(0);
    if (buffer.length < 4 + len) break;
    const body = buffer.slice(4, 4 + len).toString('utf8');
    buffer = buffer.slice(4 + len);
    let msg = null;
    try { msg = JSON.parse(body); } catch { send({ ok: false, error: 'Bad JSON from extension' }); continue; }
    let reply;
    try { reply = handle(msg); }
    catch (e) { reply = { ok: false, error: e.message || String(e) }; }
    send(reply);
  }
});
process.stdin.on('end', () => process.exit(0));
