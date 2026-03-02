# 湘泰出海 - 部署到 Vercel / GitHub Pages / Cloudflare Pages

当前目录 `d:\xiangtai-deploy` 为纯静态站点（HTML/CSS/JS），可按下面任选一种方式部署，替代 Netlify。

---

## 一、Vercel（推荐，免费额度大）

### 方式 A：用网页连接 GitHub 仓库（推荐）

1. **把本目录推送到 GitHub**
   - 若已有仓库（如 `xiangtai-pages`），在 `d:\xiangtai-deploy` 下执行：
     ```powershell
     git add .
     git commit -m "deploy: 静态文件"
     git push origin main
     ```
   - 若还没有仓库：在 GitHub 新建仓库，再在本目录执行：
     ```powershell
     git remote add origin https://github.com/你的用户名/仓库名.git
     git push -u origin main
     ```

2. **在 Vercel 导入项目**
   - 打开 [https://vercel.com](https://vercel.com) → 用 GitHub 登录
   - 点击 **Add New… → Project**，选择刚推送的仓库
   - **Root Directory** 保持默认（仓库根目录）
   - **Build and Output**：无需改，静态站无需构建
   - 点击 **Deploy**，等待完成

3. **记下网址**
   - 部署完成后会得到类似：`https://xxx.vercel.app`
   - 主站：`https://xxx.vercel.app/`
   - 评估方案：`https://xxx.vercel.app/#evaluate`
   - 客服：`https://xxx.vercel.app/admin-eval.html`
   - 物流：`https://xxx.vercel.app/xiangtai-logistics.html`

### 方式 B：用 Vercel CLI 直接部署文件夹

1. 安装 Node.js 后执行：
   ```powershell
   npx vercel
   ```
2. 按提示登录、选择或新建项目，项目根目录选当前文件夹即可。
3. 部署完成后会给出预览地址；之后更新文件再执行 `npx vercel --prod` 即可发布到生产。

---

## 二、GitHub Pages

1. **推送代码到 GitHub**（同上一、方式 A 的步骤 1）

2. **开启 Pages**
   - 打开仓库 → **Settings** → **Pages**
   - **Source** 选 **Deploy from a branch**
   - **Branch** 选 `main`，**Folder** 选 **/ (root)**
   - 保存后等 1～2 分钟

3. **访问地址**
   - 一般为：`https://你的用户名.github.io/仓库名/`
   - 若仓库名为 `xiangtai-pages`，则主站为：  
     `https://wentingznb666.github.io/xiangtai-pages/`
   - 评估方案：`.../xiangtai-pages/#evaluate`
   - 客服：`.../xiangtai-pages/admin-eval.html`
   - 物流：`.../xiangtai-pages/xiangtai-logistics.html`

---

## 三、Cloudflare Pages

### 方式 A：连接 GitHub（推荐）

1. 打开 [https://dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选择 GitHub 并授权，选中存放本静态文件的仓库
3. **Build**：Build command 留空；**Build output directory** 填 `/` 或 `.`
4. 保存并部署，记下生成的 `https://xxx.pages.dev` 网址

### 方式 B：直接上传文件夹

1. **Workers & Pages** → **Create** → **Pages** → **Upload assets**
2. 项目名随意（如 `xiangtai`）
3. 把 `d:\xiangtai-deploy` 里**除 `.git`、`.netlify` 外**的所有文件打成一个 zip（或只选 html/js/css 等必要文件），上传
4. 部署完成后使用给出的 `https://xxx.pages.dev` 链接

---

## 部署后请更新

- 在 **网址.txt** 中把 Netlify 的旧地址替换为你在 Vercel / GitHub Pages / Cloudflare 得到的新地址。
- 若有 **评估码配置说明** 或其它文档里写了旧域名，也一并改成新域名。

---

## 简要对比

| 平台           | 免费额度     | 适合场景           |
|----------------|--------------|--------------------|
| Vercel         | 带宽与构建较宽松 | 连 GitHub 自动部署 |
| GitHub Pages   | 公开仓库免费 | 已有 GitHub 仓库   |
| Cloudflare Pages | 带宽大、速度快 | 重视国内/海外访问  |

任选其一即可；若 Netlify 恢复后想保留备选，可同时保留一个 Vercel 或 Cloudflare 部署作为备用。
