# 达人短视频分发 APP - 后端 API

Node.js + Express + SQLite + JWT，三端独立接口。

## 首次运行

```bash
npm install
npm run dev
```

- 首次启动会在项目根目录生成 `data.db`（SQLite），并写入种子数据。
- 测试账号：admin / client / influencer，密码均为 `123456`。
- 生产环境请设置环境变量 `JWT_SECRET`，并勿使用默认密码。

服务地址：http://localhost:3000

## API 概览

- `POST /api/admin/auth/login` - 管理员登录
- `POST /api/client/auth/login` - 客户端登录
- `GET /api/client/videos` - 达人已发布视频（含视频单量、播放量）
- `GET /api/client/points` - 客户端积分
- `POST /api/client/points/recharge` - 积分充值
- `POST /api/influencer/auth/login` - 达人端登录
- `GET /api/influencer/tasks` - 达人任务列表
- `POST /api/influencer/videos/upload` - 视频上传
