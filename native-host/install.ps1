# Install the PromptForge sync native messaging host (Windows).
#
# Usage (PowerShell):  .\native-host\install.ps1 -ExtensionId <extension-id>
#
# Find the extension ID at chrome://extensions (Developer mode) — the string
# under PromptForge. Requires Node.js on your PATH.
param(
  [Parameter(Mandatory = $true)] [string] $ExtensionId
)

# COMMENT: #52/#74 — validate the extension ID (32 chars, a-p) before embedding
# it in the manifest; a stray quote/typo would break the JSON or mis-scope it.
if ($ExtensionId -notmatch '^[a-p]{32}$') {
  Write-Error "ExtensionId must be exactly 32 characters (a-p), from chrome://extensions. Got: '$ExtensionId'"
  exit 1
}

$name = "com.odw.promptforge.sync"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$hostPath = Join-Path $dir "promptforge-sync-host.bat"
$manifestPath = Join-Path $dir "$name.json"

$manifest = @{
  name            = $name
  description     = "PromptForge folder sync helper"
  path            = $hostPath
  type            = "stdio"
  allowed_origins = @("chrome-extension://$ExtensionId/")
}
# COMMENT: #52 — write UTF-8 WITHOUT BOM. -Encoding ASCII replaced non-ASCII
# characters in $hostPath (e.g. C:\Users\José\…) with '?', so Chrome could never
# launch the host. UTF8Encoding($false) avoids the BOM that PowerShell 5.1's
# -Encoding UTF8 would add (Chrome rejects a BOM-prefixed manifest).
$manifestJson = $manifest | ConvertTo-Json
[System.IO.File]::WriteAllText($manifestPath, $manifestJson, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Wrote host manifest: $manifestPath"

$browsers = @(
  "SOFTWARE\Google\Chrome",
  "SOFTWARE\BraveSoftware\Brave-Browser",
  "SOFTWARE\Microsoft\Edge"
)
foreach ($b in $browsers) {
  $key = "HKCU:\$b\NativeMessagingHosts\$name"
  New-Item -Path $key -Force | Out-Null
  Set-ItemProperty -Path $key -Name "(default)" -Value $manifestPath
  Write-Host "Registered under $b"
}
Write-Host "Done. Fully restart your browser, then: Settings → Folder Sync → Native helper."
