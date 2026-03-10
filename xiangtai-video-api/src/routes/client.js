/**
 * 客户端 API 路由（持久化 + JWT 鉴权）
 */

import { Router } from 'express'
import { getDb } from '../db/index.js'
import { verify } from '../services/jwt.js'
import { requireAuth } from '../middleware/auth.js'
import { verifyPassword } from '../services/password.js'
import { writeAudit } from '../services/audit.js'
import { issueTokens, rotateRefresh, revokeRefresh, revokeAccess } from '../services/tokens.js'
import { applyPoints } from '../services/points.js'
import { getDownloadUrl } from '../services/upload.js'
import { loginLimiter, actionLimiter } from '../middleware/rateLimit.js'
import { validateBody } from '../middleware/validate.js'
import { z } from 'zod'

export const clientRoutes = Router()

/** 客户端登录，签发 JWT */
clientRoutes.post('/auth/login', loginLimiter, validateBody(z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})), async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    const db = await getDb()
    writeAudit({ db, action: 'client.login.fail', req, detail: { reason: 'missing_fields', username } })
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }
  const db = await getDb()
  const user = db.prepare('SELECT id, username, role, password_hash FROM users WHERE role = ? AND username = ?')
    .get('client', username)
  if (!user || !verifyPassword(password, user.password_hash)) {
    writeAudit({ db, user: user ? { id: user.id, role: user.role } : undefined, action: 'client.login.fail', req, detail: { reason: 'invalid_credentials', username } })
    return res.status(401).json({ error: '用户名或密码错误' })
  }
  writeAudit({ db, user: { id: user.id, role: user.role }, action: 'client.login.success', req })
  const tokens = issueTokens(db, { id: user.id, username: user.username, role: user.role })
  return res.json({ ...tokens, user: { id: user.id, username: user.username, role: user.role } })
})

/** 刷新 token（refresh -> 新的 access/refresh） */
clientRoutes.post('/auth/refresh', actionLimiter, validateBody(z.object({
  refreshToken: z.string().min(1)
})), async (req, res) => {
  const { refreshToken } = req.body
  const db = await getDb()
  try {
    const out = rotateRefresh(db, refreshToken)
    writeAudit({ db, user: out.user, action: 'client.token.refresh', req })
    res.json({ accessToken: out.accessToken, refreshToken: out.refreshToken })
  } catch {
    res.status(401).json({ error: 'refreshToken 无效或已过期' })
  }
})

/** 登出：撤销 refresh，并撤销当前 access（若提供） */
clientRoutes.post('/auth/logout', actionLimiter, validateBody(z.object({
  refreshToken: z.string().optional(),
  accessToken: z.string().optional()
})), async (req, res) => {
  const { refreshToken, accessToken } = req.body
  const db = await getDb()
  if (refreshToken) revokeRefresh(db, refreshToken)
  if (accessToken) {
    try {
      const payload = verify(accessToken)
      revokeAccess(db, payload)
    } catch {
      // ignore
    }
  }
  res.json({ ok: true })
})

/** 达人已发布视频列表（含类型：露脸/讲解） */
clientRoutes.get('/videos', requireAuth('client'), async (_req, res) => {
  const db = await getDb()
  const rows = db.prepare(
    'SELECT id, title, video_type as videoType, video_link as videoLink, order_count as orderCount, play_count as playCount, streaming_code as streamingCode, ai_analysis as aiAnalysis FROM videos ORDER BY id'
  ).all()
  res.json({ list: rows, total: rows.length })
})

/** 获取客户端积分 */
clientRoutes.get('/points', requireAuth('client'), async (req, res) => {
  const db = await getDb()
  const row = db.prepare('SELECT points FROM points_accounts WHERE user_id = ?').get(req.user.id)
  res.json({ points: row ? row.points : 0 })
})

/** 积分充值（1 积分 = 1 泰铢） */
clientRoutes.post('/points/recharge', requireAuth('client'), actionLimiter, validateBody(z.object({
  amount: z.number().min(1)
})), async (req, res) => {
  const { amount } = req.body
  const pointsEarned = Math.floor(amount)
  const db = await getDb()
  const out = applyPoints(db, { userId: req.user.id, role: 'client', delta: pointsEarned, reason: 'recharge', refType: 'order', refId: Date.now() })
  writeAudit({ db, user: req.user, action: 'client.points.recharge', req, detail: { amount, pointsEarned, points: out.points } })
  res.json({ points: out.points, orderId: 'ORD-' + Date.now() })
})

/** 下载视频：露脸（兼职绑定）/ 讲解（按组下载，防关联） */
clientRoutes.post('/videos/download', requireAuth('client'), actionLimiter, async (req, res) => {
  const { type, videoId, videoIds, clientCode, influencerCode, groupSize } = req.body || {}
  const db = await getDb()
  if (type === 'face') {
    if (!clientCode || !influencerCode || !videoId) {
      return res.status(400).json({ error: '露脸视频需提供客户代码、达人代码及视频 ID' })
    }
    const binding = db.prepare('SELECT id FROM client_influencer_bindings WHERE client_code = ? AND influencer_code = ?').get(clientCode, influencerCode)
    if (!binding) {
      db.prepare('INSERT INTO client_influencer_bindings (client_code, influencer_code) VALUES (?, ?)').run(clientCode, influencerCode)
    }
    // 扣积分并写下载记录/流水
    const cost = 50
    const bal = db.prepare('SELECT points FROM points_accounts WHERE user_id = ?').get(req.user.id)?.points ?? 0
    if (bal < cost) return res.status(400).json({ error: '积分不足' })
    applyPoints(db, { userId: req.user.id, role: 'client', delta: -cost, reason: 'download_face', refType: 'video', refId: Number(videoId) })
    db.prepare('INSERT INTO download_records (client_id, video_id, download_type, cost_points) VALUES (?, ?, ?, ?)').run(req.user.id, Number(videoId), 'face', cost)
    writeAudit({ db, user: req.user, action: 'client.video.download.face', req, detail: { videoId, clientCode, influencerCode, cost: 50 } })
    const v = db.prepare('SELECT file_storage as storage, file_key as key, video_link as url FROM videos WHERE id = ?').get(Number(videoId))
    const downloadUrl = await getDownloadUrl(v, 300)
    return res.json({
      downloadUrl: downloadUrl || ('https://example.com/download/face-' + videoId),
      cost,
      message: '下载链接已生成（客户与达人已绑定）'
    })
  }
  if (type === 'explain') {
    const size = Math.min(20, Math.max(1, Number(groupSize) || 5))
    const ids = (videoIds || []).slice(0, size).map((x) => Number(x))
    const urls = []
    for (const id of ids) {
      const v = db.prepare('SELECT file_storage as storage, file_key as key, video_link as url FROM videos WHERE id = ?').get(id)
      const u = await getDownloadUrl(v, 300)
      urls.push(u || `https://example.com/download/group-${id}`)
    }
    // 演示：讲解视频暂不扣费，只记录下载行为（后续可按规则扣费）
    for (const id of ids) {
      db.prepare('INSERT INTO download_records (client_id, video_id, download_type, cost_points) VALUES (?, ?, ?, ?)').run(req.user.id, id, 'explain', 0)
    }
    writeAudit({ db, user: req.user, action: 'client.video.download.explain', req, detail: { videoIds: videoIds || [], groupSize: size } })
    return res.json({ groupUrls: urls, message: '按组下载，防关联' })
  }
  res.status(400).json({ error: '无效的下载类型' })
})

/** 讲解视频下载分组（按组形式，防关联；组大小默认 5，最大 20） */
const DEFAULT_GROUP_SIZE = 5
const MAX_GROUP_SIZE = 20
clientRoutes.get('/videos/download-groups', requireAuth('client'), async (req, res) => {
  const groupSize = Math.min(MAX_GROUP_SIZE, Math.max(1, Number(req.query.groupSize) || DEFAULT_GROUP_SIZE))
  const db = await getDb()
  const videos = db.prepare('SELECT id, title FROM videos WHERE video_type = ? ORDER BY id').all('explain')
  const groups = []
  for (let i = 0; i < videos.length; i += groupSize) {
    groups.push({ videos: videos.slice(i, i + groupSize) })
  }
  res.json({ groups: groups.length ? groups : [{ videos }] })
})
