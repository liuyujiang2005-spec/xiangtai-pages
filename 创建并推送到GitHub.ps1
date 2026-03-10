# 登录完成后运行此脚本：创建 GitHub 仓库并推送
Set-Location $PSScriptRoot

Write-Host "检查 GitHub 登录状态..." -ForegroundColor Cyan
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "请先运行: gh auth login --web" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "创建仓库 xiangtai-pages 并推送..." -ForegroundColor Cyan
gh repo create xiangtai-pages --public --source=. --remote=origin --push --description "湘泰出海 静态站点"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "已上传到: https://github.com/wentingznb666/xiangtai-pages" -ForegroundColor Green
} else {
    Write-Host "若仓库已存在，直接推送: git push -u origin main" -ForegroundColor Yellow
    git push -u origin main
}
Write-Host ""
pause
