# 达人短视频分发 APP - 前端

Vue 3 + Vite，三端独立（Admin / Client / Influencer）。

## 首次运行

**请先执行 `npm install` 安装依赖**，再启动开发服务器：

```bash
npm install
npm run dev
```

## 后端

前端依赖后端 API，需**先启动**后端：`xiangtai-video-api`

```bash
cd ../xiangtai-video-api
npm install
npm run dev
```

建议：先启动后端，再启动前端。

## 测试账号（MVP）

| 端   | 用户名     | 密码   |
|------|------------|--------|
| 管理端 | admin      | 123456 |
| 客户端 | client     | 123456 |
| 达人端 | influencer | 123456 |

## 入口

- 客户端：http://localhost:5173/client
- 达人端：http://localhost:5173/influencer
- 管理端：http://localhost:5173/admin
