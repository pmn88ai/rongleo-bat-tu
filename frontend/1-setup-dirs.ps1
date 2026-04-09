# ================================================================
# STEP 1 — Run this script FIRST to create all directories
# Run from: tinix-bazi-main\tinix-bazi-main\frontend\
# PowerShell: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
# ================================================================

param([string]$base = $PSScriptRoot)

Write-Host "Creating directory structure..." -ForegroundColor Cyan

$dirs = @(
    "api", "api\consultant", "api\que", "api\articles", "api\auth", "api\matching",
    "lib", "lib\services", "lib\utils", "lib\bazi", "lib\data"
)

foreach ($dir in $dirs) {
    $path = Join-Path $base $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  Exists:  $dir" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Copying bazi engine from backendjs..." -ForegroundColor Cyan

$baziSrc = Resolve-Path (Join-Path $base "..\backendjs\src\bazi") -ErrorAction SilentlyContinue
if ($baziSrc) {
    Copy-Item -Recurse -Force "$baziSrc\*" (Join-Path $base "lib\bazi\")
    Write-Host "  Copied: lib/bazi/" -ForegroundColor Green
} else {
    Write-Host "  WARN: backendjs/src/bazi not found — copy manually" -ForegroundColor Yellow
}

$utilsSrc = Resolve-Path (Join-Path $base "..\backendjs\src\utils") -ErrorAction SilentlyContinue
if ($utilsSrc) {
    $dateUtilsSrc = Join-Path $utilsSrc "dateUtils.js"
    $randomSrc = Join-Path $utilsSrc "random.js"
    if (Test-Path $dateUtilsSrc) { Copy-Item -Force $dateUtilsSrc (Join-Path $base "lib\utils\") }
    if (Test-Path $randomSrc)    { Copy-Item -Force $randomSrc    (Join-Path $base "lib\utils\") }
    Write-Host "  Copied: lib/utils/" -ForegroundColor Green
}

Write-Host ""
Write-Host "Directory setup complete!" -ForegroundColor Green
Write-Host "Now run: .\write-api-files.ps1" -ForegroundColor Yellow
