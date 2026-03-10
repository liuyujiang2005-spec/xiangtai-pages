# 达人短视频分发 APP - 部署说明

## 一、前端（Vue 3 + Vite）

### 部署到 Vercel

1. 将 `xiangtai-video-app` 推送到 GitHub。
2. 在 [Vercel](https://vercel.com) 导入该仓库。
3. 构建配置：
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `xiangtai-video-app`（若项目在子目录）
4. 环境变量：
   - `VITE_API_BASE_URL` = 后端 API 地址（如 `https://your-api.com/api`）
5. 部署后访问分配域名即可。

### 部署到 Netlify

1. 导入 Git 仓库，根目录选 `xiangtai-video-app`。
2. Build command: `npm run build`，Publish directory: `dist`。
3. 添加环境变量 `VITE_API_BASE_URL` 指向后端。
4. 可选：在项目根添加 `netlify.toml` 配置重定向（SPA）。

---

## 二、后端（Node.js + Express）

- 使用 **SQLite**（`data.db`），无需单独安装数据库。
- 首次启动会自动建表并写入种子账号（admin/client/influencer，密码 123456）。

### 部署到 Railway / Render / 任意 Node 主机

1. 根目录为 `xiangtai-video-api`。
2. 启动命令：`npm run start` 或 `node src/index.js`。
3. 环境变量建议：
   - `PORT`：服务端口（平台多会自动注入）
   - `JWT_SECRET`：**必须**设置为随机强密钥
   - `SQLITE_PATH`：可选，持久化路径（如 `/data/data.db`）
   - `UPLOAD_DIR`、`UPLOAD_PUBLIC_URL`：上传目录与访问前缀
4. 若使用持久化卷，将 `SQLITE_PATH` 指向卷内路径，避免重启丢数据。

### 本地生产式运行

```bash
cd xiangtai-video-api
export JWT_SECRET=your-strong-secret
npm run start
```

---

## 三、前后端联调

- 前端构建时通过 `VITE_API_BASE_URL` 请求后端。
- 后端需配置 CORS 允许前端域名（当前为 `*`，生产建议收紧为前端域名）。
- 三端登录后使用 JWT，请求头：`Authorization: Bearer <token>`。

---

## 四、可选：文件存 OSS/S3

- 当前上传保存在服务器 `uploads/` 目录。
- 若需存 OSS/S3：在 `src/services/upload.js` 中根据环境变量 `S3_*` 分支，上传到 S3 并返回公网 URL。
- 将 `UPLOAD_PUBLIC_URL` 设为 CDN 或 Bucket 域名，客户端用该 URL 访问视频。
