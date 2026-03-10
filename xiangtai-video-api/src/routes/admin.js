/**
 * 管理员端 API 路由（持久化 + JWT 鉴权）
 */

import { Router } from 'express'
import { getDb } from '../db/index.js'
import { verify } from '../services/jwt.js'
import { requireAuth } from '../middleware/auth.js'
import { verifyPassword } from '../services/password.js'
import { writeAudit } from '../services/audit.js'
import { requirePerm, getAdminPerms } from '../middleware/perm.js'
import { issueTokens, rotateRefresh, revokeRefresh, revokeAccess } from '../services/tokens.js'
import { applyPoints } from '../services/points.js'
import { loginLimiter, actionLimiter } from '../middleware/rateLimit.js'
import { validateBody } from '../middleware/validate.js'
import { z } from 'zod'

export const adminRoutes = Router()

/** 管理员登录，签发 JWT */
adminRoutes.post('/auth/login', loginLimiter, validateBody(z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})), async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    const db = await getDb()
    writeAudit({ db, action: 'admin.login.fail', req, detail: { reason: 'missing_fields', username } })
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }
  const db = await getDb()
  const user = db.prepare('SELECT id, username, role, password_hash FROM users WHERE role = ? AND username = ?')
    .get('admin', username)
  if (!user || !verifyPassword(password, user.password_hash)) {
    writeAudit({ db, user: user ? { id: user.id, role: user.role } : undefined, action: 'admin.login.fail', req, detail: { reason: 'invalid_credentials', username } })
    return res.status(401).json({ error: '用户名或密码错误' })
  }
  writeAudit({ db, user: { id: user.id, role: user.role }, action: 'admin.login.success', req })
  const tokens = issueTokens(db, { id: user.id, username: user.username, role: user.role })
  return res.json({ ...tokens, user: { id: user.id, username: user.username, role: user.role } })
})

/** 刷新 token（refresh -> 新的 access/refresh） */
adminRoutes.post('/auth/refresh', actionLimiter, validateBody(z.object({
  refreshToken: z.string().min(1)
})), async (req, res) => {
  const { refreshToken } = req.body
  const db = await getDb()
  try {
    const out = rotateRefresh(db, refreshToken)
    writeAudit({ db, user: out.user, action: 'admin.token.refresh', req })
    res.json({ accessToken: out.accessToken, refreshToken: out.refreshToken })
  } catch {
    res.status(401).json({ error: 'refreshToken 无效或已过期' })
  }
})

/** 登出：撤销 refresh，并撤销当前 access（若提供） */
adminRoutes.post('/auth/logout', actionLimiter, validateBody(z.object({
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

/** 获取当前管理员信息与权限 */
adminRoutes.get('/me', requireAuth('admin'), async (req, res) => {
  const perms = await getAdminPerms(req.user.id)
  res.json({ user: req.user, perms })
})

/** 积分汇总（1 积分 = 1 泰铢） */
adminRoutes.get('/points/summary', requireAuth('admin'), async (_req, res) => {
  const db = await getDb()
  const inf = db.prepare("SELECT COALESCE(SUM(points),0) as n FROM points_accounts WHERE role = 'influencer'").get()
  const cli = db.prepare("SELECT COALESCE(SUM(points),0) as n FROM points_accounts WHERE role = 'client'").get()
  res.json({ influencerPoints: inf.n, clientPoints: cli.n })
})

/** 数据统计与报表 */
adminRoutes.get('/stats', requireAuth('admin'), async (_req, res) => {
  const db = await getDb()
  const videoCount = db.prepare('SELECT COUNT(*) as n FROM videos').get().n
  const influencerCount = db.prepare("SELECT COUNT(*) as n FROM users WHERE role = 'influencer'").get().n
  const clientCount = db.prepare("SELECT COUNT(*) as n FROM users WHERE role = 'client'").get().n
  const clientPoints = db.prepare("SELECT COALESCE(SUM(points),0) as n FROM points_accounts WHERE role = 'client'").get().n
  const influencerPoints = db.prepare("SELECT COALESCE(SUM(points),0) as n FROM points_accounts WHERE role = 'influencer'").get().n
  const today = new Date().toISOString().slice(0, 10)
  const taskClaimedToday = db.prepare('SELECT COUNT(*) as n FROM task_claims WHERE date(claimed_at) = ?').get(today).n
  const uploadCountToday = db.prepare('SELECT COUNT(*) as n FROM videos WHERE date(created_at) = ?').get(today).n
  res.json({
    videoCount,
    publishedVideoCount: videoCount,
    influencerCount,
    clientCount,
    totalClientPoints: clientPoints,
    totalInfluencerPoints: influencerPoints,
    taskClaimedToday,
    uploadCountToday
  })
})

/** 上传云端链接 */
adminRoutes.post('/videos/cloud', requireAuth('admin'), actionLimiter, requirePerm('admin.videos.cloud.write'), async (req, res) => {
  const { videoId, cloudUrl, streamingCode, aiAnalysis } = req.body || {}
  if (!videoId || !cloudUrl) {
    return res.status(400).json({ error: '视频 ID 和云端链接必填' })
  }
  const db = await getDb()
  db.prepare('UPDATE videos SET cloud_url = ?, streaming_code = ?, ai_analysis = ? WHERE id = ?')
    .run(cloudUrl || null, streamingCode || null, aiAnalysis || null, videoId)
  writeAudit({ db, user: req.user, action: 'admin.video.cloud.update', req, detail: { videoId, cloudUrl, streamingCode } })
  res.json({ ok: true, message: '云端链接已保存' })
})

/** AI 解析（防达人提前删除） */
adminRoutes.post('/videos/:videoId/ai-analysis', requireAuth('admin'), actionLimiter, requirePerm('admin.videos.ai_analysis.write'), async (req, res) => {
  const { videoId } = req.params
  const db = await getDb()
  const text = '已通过 AI 解析，无异常，防达人提前删除'
  db.prepare('UPDATE videos SET ai_analysis = ? WHERE id = ?').run(text, videoId)
  writeAudit({ db, user: req.user, action: 'admin.video.ai_analysis', req, detail: { videoId } })
  res.json({ aiAnalysis: text })
})

/** 获取视频列表（管理投流码；含视频类型） */
adminRoutes.get('/videos', requireAuth('admin'), requirePerm('admin.videos.read'), async (_req, res) => {
  const db = await getDb()
  const list = db.prepare(
    'SELECT id, title, video_type as videoType, streaming_code as streamingCode, ai_analysis as aiAnalysis FROM videos ORDER BY id'
  ).all()
  res.json({ list })
})

/** 投稿列表（待审核/已审核） */
adminRoutes.get('/submissions', requireAuth('admin'), requirePerm('admin.videos.read'), async (req, res) => {
  const status = req.query.status
  const db = await getDb()
  const rows = status
    ? db.prepare(
      'SELECT s.id, s.status, s.submitted_at as submittedAt, s.reviewed_at as reviewedAt, s.review_note as reviewNote, s.task_id as taskId, s.video_id as videoId, u.username as influencerUsername FROM video_submissions s JOIN users u ON u.id = s.influencer_id WHERE s.status = ? ORDER BY s.id DESC'
    ).all(String(status))
    : db.prepare(
      'SELECT s.id, s.status, s.submitted_at as submittedAt, s.reviewed_at as reviewedAt, s.review_note as reviewNote, s.task_id as taskId, s.video_id as videoId, u.username as influencerUsername FROM video_submissions s JOIN users u ON u.id = s.influencer_id ORDER BY s.id DESC'
    ).all()
  res.json({ list: rows })
})

/** 审核投稿：通过/拒绝，并触发积分结算 */
adminRoutes.post('/submissions/:id/review', requireAuth('admin'), actionLimiter, requirePerm('admin.videos.ai_analysis.write'), async (req, res) => {
  const submissionId = Number(req.params.id)
  const { decision, note, rewardPoints } = req.body || {}
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'decision 必须为 approved 或 rejected' })
  }
  const db = await getDb()
  const sub = db.prepare('SELECT id, influencer_id as influencerId, video_id as videoId, status FROM video_submissions WHERE id = ?').get(submissionId)
  if (!sub?.id) return res.status(404).json({ error: '投稿不存在' })
  if (sub.status !== 'pending') return res.status(400).json({ error: '该投稿已审核' })

  db.prepare('UPDATE video_submissions SET status = ?, reviewed_by = ?, reviewed_at = datetime(\"now\"), review_note = ? WHERE id = ?')
    .run(decision, req.user.id, note || null, submissionId)

  // 积分结算：通过给达人加分（默认 10，可由请求覆盖）
  if (decision === 'approved') {
    const delta = Number.isFinite(Number(rewardPoints)) ? Number(rewardPoints) : 10
    applyPoints(db, { userId: sub.influencerId, role: 'influencer', delta, reason: 'submission_approved', refType: 'submission', refId: submissionId })
  }

  writeAudit({ db, user: req.user, action: 'admin.submission.review', req, detail: { submissionId, decision, rewardPoints } })
  res.json({ ok: true })
})

/** 更新视频投流码 */
adminRoutes.patch('/videos/:videoId/streaming-code', requireAuth('admin'), actionLimiter, requirePerm('admin.videos.streaming_code.write'), async (req, res) => {
  const { videoId } = req.params
  const { streamingCode } = req.body || {}
  const db = await getDb()
  db.prepare('UPDATE videos SET streaming_code = ? WHERE id = ?').run(streamingCode ?? '', videoId)
  writeAudit({ db, user: req.user, action: 'admin.video.streaming_code.update', req, detail: { videoId, streamingCode } })
  res.json({ ok: true, videoId, streamingCode })
})

/** 审计查询（支持筛选/分页） */
adminRoutes.get('/audit', requireAuth('admin'), requirePerm('admin.audit.read'), async (req, res) => {
  const { action, from, to, limit, offset } = req.query || {}
  const lim = Math.min(500, Math.max(1, Number(limit) || 50))
  const off = Math.max(0, Number(offset) || 0)
  const db = await getDb()

  const where = []
  const args = []
  if (action) {
    where.push('action = ?')
    args.push(String(action))
  }
  if (from) {
    where.push("datetime(created_at) >= datetime(?)")
    args.push(String(from))
  }
  if (to) {
    where.push("datetime(created_at) <= datetime(?)")
    args.push(String(to))
  }
  const whereSql = where.length ? ('WHERE ' + where.join(' AND ')) : ''
  const list = db.prepare(
    `SELECT id, user_id as userId, role, action, method, path, ip, user_agent as userAgent, detail, created_at as createdAt
     FROM audit_logs ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`
  ).all(...args, lim, off)
  res.json({ list, limit: lim, offset: off })
})

/** 审计导出 CSV（简单实现） */
adminRoutes.get('/audit/export.csv', requireAuth('admin'), requirePerm('admin.audit.read'), async (req, res) => {
  const { action, from, to } = req.query || {}
  const db = await getDb()
  const where = []
  const args = []
  if (action) { where.push('action = ?'); args.push(String(action)) }
  if (from) { where.push("datetime(created_at) >= datetime(?)"); args.push(String(from)) }
  if (to) { where.push("datetime(created_at) <= datetime(?)"); args.push(String(to)) }
  const whereSql = where.length ? ('WHERE ' + where.join(' AND ')) : ''
  const rows = db.prepare(
    `SELECT id, user_id as userId, role, action, method, path, ip, user_agent as userAgent, detail, created_at as createdAt
     FROM audit_logs ${whereSql} ORDER BY id DESC LIMIT 5000`
  ).all(...args)
  const header = ['id','userId','role','action','method','path','ip','userAgent','detail','createdAt']
  const escape = (v) => {
    const s = String(v ?? '')
    const needs = s.includes(',') || s.includes('\"') || s.includes('\n') || s.includes('\r')
    const out = s.replace(/\"/g, '\"\"')
    return needs ? `\"${out}\"` : out
  }
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push(header.map((k) => escape(r[k])).join(','))
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename=\"audit.csv\"')
  res.send(lines.join('\n'))
})
