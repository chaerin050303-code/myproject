# Find cloudflared.exe in common installation paths
$paths = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe",
    "$env:ProgramFiles\cloudflared\cloudflared.exe",
    "$env:LOCALAPPDATA\cloudflared\cloudflared.exe",
    "$env:USERPROFILE\AppData\Local\cloudflared\cloudflared.exe",
    "$env:ProgramFiles(x86)\cloudflared\cloudflared.exe"
)

$exe = $null
foreach ($path in $paths) {
    if (Test-Path $path) {
        $exe = $path
        Write-Host "Found cloudflared at: $exe" -ForegroundColor Green
        break
    }
}

if (-not $exe) {
    Write-Error "cloudflared.exe not found in common paths. Please install it with: winget install -e --id Cloudflare.cloudflared"
    exit 1
}

Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Cyan
& $exe tunnel --url http://localhost:3000
