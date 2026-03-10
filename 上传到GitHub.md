# 把网站上传到 GitHub

当前已在本机完成提交，只需在 GitHub 创建仓库并推送即可。

## 步骤一：在 GitHub 上新建仓库

1. 打开 **https://github.com/new**
2. **Repository name** 填：`xiangtai-pages`（或任意名称，如 `xiangtai-web`）
3. 选择 **Public**
4. **不要**勾选 “Add a README file”
5. 点击 **Create repository**

## 步骤二：在本地推送

在 PowerShell 中执行（把 `你的用户名` 和 `仓库名` 换成你刚创建的）：

```powershell
cd d:\xiangtai-deploy

# 若你新建的仓库名不是 xiangtai-pages，改一下远程地址：
git remote set-url origin https://github.com/你的用户名/仓库名.git

# 推送
git push -u origin main
```

例如仓库是 `https://github.com/wentingznb666/xiangtai-pages`，则：

```powershell
git remote set-url origin https://github.com/wentingznb666/xiangtai-pages.git
git push -u origin main
```

若提示输入账号密码，请使用 **Personal Access Token** 代替密码（GitHub → Settings → Developer settings → Personal access tokens）。

## 步骤三：确认

打开 `https://github.com/你的用户名/仓库名`，能看到所有网站文件即表示上传成功。
