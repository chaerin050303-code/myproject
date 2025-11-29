# Start dev server in hidden window
Write-Host "Starting dev server (LAN binding)..." -ForegroundColor Cyan
Start-Process -WindowStyle Hidden cmd "/c npm run dev:lan"

# Wait for server to start
Start-Sleep -Seconds 3

# Run tunnel script
& "$PSScriptRoot\tunnel-cloudflared.ps1"
