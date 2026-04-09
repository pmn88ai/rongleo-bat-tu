# setup-migration.ps1
# Chạy script này 1 lần để tạo toàn bộ folder structure cho migration
# Chạy từ thư mục: tinix-bazi-main\tinix-bazi-main\frontend\

$base = $PSScriptRoot

$dirs = @(
    "api",
    "api\consultant",
    "api\que",
    "api\articles",
    "api\auth",
    "api\matching",
    "lib",
    "lib\services",
    "lib\utils",
    "lib\bazi"
)

foreach ($dir in $dirs) {
    $path = Join-Path $base $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Created: $path" -ForegroundColor Green
    } else {
        Write-Host "Exists:  $path" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== NEXT STEP ===" -ForegroundColor Cyan
Write-Host "Now copy bazi engine from backendjs to lib:" -ForegroundColor Yellow
Write-Host ""
Write-Host 'Copy-Item -Recurse -Force "..\backendjs\src\bazi\*" "lib\bazi\"' -ForegroundColor White
Write-Host 'Copy-Item -Force "..\backendjs\src\utils\dateUtils.js" "lib\utils\"' -ForegroundColor White
Write-Host 'Copy-Item -Force "..\backendjs\src\utils\random.js" "lib\utils\"' -ForegroundColor White
Write-Host ""
Write-Host "Done! Folder structure ready." -ForegroundColor Green
