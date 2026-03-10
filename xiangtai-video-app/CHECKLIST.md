# 上线前检查清单

## 本地联调（阶段 5.1）

1. 启动后端：`cd xiangtai-video-api && npm install && npm run dev`
2. 启动前端：`cd xiangtai-video-app && npm install && npm run dev`
3. 客户端：访问 /client → 登录 client/123456 → 视频列表、下载、积分充值
4. 达人端：访问 /influencer → 登录 influencer/123456 → 任务列表领取、视频上传
5. 管理端：访问 /admin → 登录 admin/123456 → 数据报表、视频管理、云端链接

## 生产部署前（阶段 5.2）

- [ ] 后端设置 `JWT_SECRET`（强随机字符串）
- [ ] 修改或禁用默认账号密码（admin/client/influencer 的 123456）
- [ ] 前端构建时配置 `VITE_API_BASE_URL` 为生产 API 地址
- [ ] 后端 `SQLITE_PATH` 指向持久化卷（避免重启丢数据）

## 安全与体验（阶段 5.3）

- [ ] 生产环境 CORS 仅允许前端域名
- [ ] 全站 HTTPS
- [ ] 敏感配置仅通过环境变量注入，不提交仓库
