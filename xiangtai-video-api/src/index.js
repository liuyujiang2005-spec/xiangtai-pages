/**
 * 达人短视频分发 APP - 自建后端入口
 * 持久化 SQLite + JWT 鉴权 + 三端独立 API
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { randomUUID } from 'crypto'
import { getDb } from './db/index.js'
import { corsOrigins, uploadDir } from './config/runtime.js'
import { adminRoutes } from './routes/admin.js'
import { clientRoutes } from './routes/client.js'
import { influencerRoutes } from './routes/influencer.js'

const app = express()
const PORT = process.env.PORT || 3000

await getDb()

app.use(helmet({
  // 本项目前后端分离，默认 CSP 可能影响本地开发；生产可按部署再收紧
  contentSecurityPolicy: false
}))

// request-id：便于排障/追踪（也可由上游网关传入 x-request-id）
app.use((req, res, next) => {
  const id = req.headers['x-request-id']?.toString() || randomUUID()
  req.id = id
  res.setHeader('x-request-id', id)
  next()
})

app.use(cors({
  origin: (origin, cb) => {
    // 无 Origin：如 curl / 本地 server-to-server
    if (!origin) return cb(null, true)
    // 未配置白名单：开发期放行
    if (corsOrigins.length === 0) return cb(null, true)
    return cb(null, corsOrigins.includes(origin))
  }
}))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(uploadDir))

app.use('/api/admin', adminRoutes)
app.use('/api/client', clientRoutes)
app.use('/api/influencer', influencerRoutes)

app.get('/api/health', (_, res) => {
  res.json({ ok: true, message: 'xiangtai-video-api' })
})

app.listen(PORT, () => {
  console.log(`API 服务已启动: http://localhost:${PORT}`)
})
