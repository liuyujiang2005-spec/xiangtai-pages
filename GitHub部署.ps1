# GitHub Pages deploy - Run after creating repo at https://github.com/new
param([string]$User = "")
if ($User -eq "") { $User = Read-Host "GitHub username" }
$repo = "xiangtai-pages"
Set-Location $PSScriptRoot
git remote remove origin 2>$null
git remote add origin "https://github.com/$User/$repo.git"
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDone! Enable Pages: https://github.com/$User/$repo/settings/pages"
    Write-Host "Site: https://$User.github.io/$repo/"
    Start-Process "https://github.com/$User/$repo/settings/pages"
}
