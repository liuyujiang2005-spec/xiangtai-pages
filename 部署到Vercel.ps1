# 方式一：在本机执行 Vercel 生产部署（使用你当前登录的 Vercel 账号）
Set-Location $PSScriptRoot
Write-Host "正在部署到 Vercel 生产环境..." -ForegroundColor Cyan
npx vercel --prod
Write-Host ""
Write-Host "按任意键关闭窗口..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
