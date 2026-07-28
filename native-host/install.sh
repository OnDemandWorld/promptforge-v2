#!/usr/bin/env bash
# Install the PromptForge sync native messaging host (macOS / Linux).
#
# Usage:  bash native-host/install.sh <extension-id>
#
# Find the extension ID at chrome://extensions (Developer mode on) — it's the
# string under "PromptForge". For unpacked installs the ID is per-machine;
# re-run this script on each machine. Requires Node.js on your PATH.
set -euo pipefail

EXT_ID="${1:-}"
if [[ -z "$EXT_ID" ]]; then
  echo "Usage: bash native-host/install.sh <extension-id>"
  echo "Find it at chrome://extensions (Developer mode) — the ID under PromptForge."
  exit 1
fi

command -v node >/dev/null 2>&1 || { echo "error: Node.js is required (node not on PATH)"; exit 1; }

HOST_NAME="com.odw.promptforge.sync"
DIR="$(cd "$(dirname "$0")" && pwd)"
HOST_PATH="$DIR/promptforge-sync-host.cjs"
chmod +x "$HOST_PATH"

install_manifest() { # $1 = NativeMessagingHosts directory
  mkdir -p "$1"
  cat > "$1/$HOST_NAME.json" <<EOF
{
  "name": "$HOST_NAME",
  "description": "PromptForge folder sync helper",
  "path": "$HOST_PATH",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://$EXT_ID/"]
}
EOF
  echo "  installed: $1/$HOST_NAME.json"
}

echo "Installing native host for extension $EXT_ID"
installed=0
# macOS profiles
for base in \
  "$HOME/Library/Application Support/Google/Chrome" \
  "$HOME/Library/Application Support/BraveSoftware/Brave-Browser" \
  "$HOME/Library/Application Support/Microsoft Edge" \
  "$HOME/Library/Application Support/Arc"
do
  [[ -d "$base" ]] && { install_manifest "$base/NativeMessagingHosts"; installed=1; }
done
# Linux profiles
for base in \
  "$HOME/.config/google-chrome" \
  "$HOME/.config/chromium" \
  "$HOME/.config/BraveSoftware/Brave-Browser" \
  "$HOME/.config/microsoft-edge"
do
  [[ -d "$base" ]] && { install_manifest "$base/NativeMessagingHosts"; installed=1; }
done

if [[ "$installed" -eq 0 ]]; then
  echo "No supported Chromium browser profile found (Chrome/Brave/Edge/Arc/Chromium)."
  exit 1
fi
echo "Done. Fully restart your browser, then: Settings → Folder Sync → Native helper."
