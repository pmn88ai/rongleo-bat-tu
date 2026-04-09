# articles-to-json.ps1
# Converts backendjs/src/utils/seed-articles.js into lib/data/articles.json
# Run from: tinix-bazi-main\tinix-bazi-main\frontend\

param([string]$base = $PSScriptRoot)

$seedFile = Join-Path $base "..\backendjs\src\utils\seed-articles.js"
$outputDir = Join-Path $base "lib\data"
$outputFile = Join-Path $outputDir "articles.json"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

if (-not (Test-Path $seedFile)) {
    Write-Host "ERROR: seed-articles.js not found at $seedFile" -ForegroundColor Red
    exit 1
}

# Use Node.js to parse and convert the CommonJS module to JSON
$nodeScript = @"
process.env.TZ = 'Asia/Ho_Chi_Minh';
const articles = require('$($seedFile -replace "\\","\\\\")');

const result = {
    articles: articles.map((a, index) => ({
        id: index + 1,
        title: a.title || '',
        slug: a.slug || a.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/, ''),
        excerpt: a.excerpt || '',
        content: a.content || '',
        thumbnail: a.thumbnail || '',
        category_slug: a.category_slug || 'khai-niem',
        author: a.author || 'Huyền Cơ Bát Tự',
        views: 0,
        is_published: a.is_published !== false,
        is_featured: a.is_featured || false,
        created_at: new Date().toISOString()
    }))
};

const fs = require('fs');
fs.writeFileSync('$($outputFile -replace "\\","\\\\")'.replace(/\\\\/g, '/'), JSON.stringify(result, null, 2), 'utf-8');
console.log('Generated ' + result.articles.length + ' articles to articles.json');
"@

$tempScript = Join-Path $env:TEMP "convert-articles-temp.js"
[System.IO.File]::WriteAllText($tempScript, $nodeScript, [System.Text.Encoding]::UTF8)

Write-Host "Converting seed-articles.js to JSON..." -ForegroundColor Cyan
node $tempScript

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] articles.json created at: $outputFile" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js conversion failed." -ForegroundColor Red
    Write-Host "Creating minimal fallback articles.json instead..." -ForegroundColor Yellow
    
    $fallback = @{
        articles = @(
            @{ id = 1; title = "Bát Tự là gì?"; slug = "bat-tu-la-gi"; excerpt = "Giới thiệu tổng quan về Bát Tự"; content = "<p>Bát Tự (八字) là một trong những bộ môn dự đoán học cổ xưa và quan trọng nhất trong văn hóa phương Đông.</p>"; category_slug = "khai-niem"; author = "Huyền Cơ Bát Tự"; is_published = $true; is_featured = $true; views = 0; created_at = (Get-Date -Format "o") }
        )
    }
    $fallback | ConvertTo-Json -Depth 10 | Set-Content $outputFile -Encoding UTF8
    Write-Host "[OK] Fallback articles.json created." -ForegroundColor Yellow
}

Remove-Item $tempScript -ErrorAction SilentlyContinue
