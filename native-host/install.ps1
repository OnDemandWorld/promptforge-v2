# Install the PromptForge sync native messaging host (Windows).
#
# Usage (PowerShell):  .\native-host\install.ps1 -ExtensionId <extension-id>
#
# Find the extension ID at chrome://extensions (Developer mode) — the string
# under PromptForge. Requires Node.js on your PATH.
param(
  [Parameter(Mandatory = $true)] [string] $ExtensionId
)

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
$manifest | ConvertTo-Json | Set-Content -Path $manifestPath -Encoding ASCII
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
