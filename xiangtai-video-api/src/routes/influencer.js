/**
 * 达人端 API 路由（持久化 + JWT 鉴权 + 每日领取限制 + 查重 + 存储）
 */

import { Router } from 'express'
import multer from 'multer'
import { getDb } from '../db/index.js'
import { verify } from '../services/jwt.js'
import { requireAuth } from '../middleware/auth.js'
import { verifyPassword } from '../services/password.js'
import { writeAudit } from '../services/audit.js'
import { issueTokens, rotateRefresh, revokeRefresh, revokeAccess } from '../services/tokens.js'
import { saveFile } from '../services/upload.js'
import { loginLimiter, actionLimiter } from '../middleware/rateLimit.js'
import { validateBody } from '../middleware/validate.js'
import { z } from 'zod'

export const influencerRoutes = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
})

const DAILY_TASK_LIMIT = 10

/** 达人端登录，签发 JWT */
influencerRoutes.post('/auth/login', loginLimiter, validateBody(z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})), async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    const db = await getDb()
    writeAudit({ db, action: 'influencer.login.fail', req, detail: { reason: 'missing_fields', username } })
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }
  const db = await getDb()
  const user = db.prepare('SELECT id, username, role, password_hash FROM users WHERE role = ? AND username = ?')
    .get('influencer', username)
  if (!user || !verifyPassword(password, user.password_hash)) {
    writeAudit({ db, user: user ? { id: user.id, role: user.role } : undefined, action: 'influencer.login.fail', req, detail: { reason: 'invalid_credentials', username } })
    return res.status(401).json({ error: '用户名或密码错误' })
  }
  writeAudit({ db, user: { id: user.id, role: user.role }, action: 'influencer.login.success', req })
  const tokens = issueTokens(db, { id: user.id, username: user.username, role: user.role })
  return res.json({ ...tokens, user: { id: user.id, username: user.username, role: user.role } })
})

/** 刷新 token（refresh -> 新的 access/refresh） */
influencerRoutes.post('/auth/refresh', actionLimiter, validateBody(z.object({
  refreshToken: z.string().min(1)
})), async (req, res) => {
  const { refreshToken } = req.body
  const db = await getDb()
  try {
    const out = rotateRefresh(db, refreshToken)
    writeAudit({ db, user: out.user, action: 'influencer.token.refresh', req })
    res.json({ accessToken: out.accessToken, refreshToken: out.refreshToken })
  } catch {
    res.status(401).json({ error: 'refreshToken 无效或已过期' })
  }
})

/** 登出：撤销 refresh，并撤销当前 access（若提供） */
influencerRoutes.post('/auth/logout', actionLimiter, validateBody(z.object({
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

/** 达人任务列表（含今日领取额度） */
influencerRoutes.get('/tasks', requireAuth('influencer'), async (req, res) => {
  const db = await getDb()
  const list = db.prepare('SELECT id, product_type as productType, video_download_link as videoDownloadLink FROM tasks ORDER BY id').all()
  const today = new Date().toISOString().slice(0, 10)
  const claimed = db.prepare('SELECT COUNT(*) as n FROM task_claims WHERE user_id = ? AND date(claimed_at) = ?').get(req.user.id, today)
  const claimedTaskIds = db.prepare('SELECT task_id FROM task_claims WHERE user_id = ? AND date(claimed_at) = ?').all(req.user.id, today).map((r) => String(r.task_id))
  res.json({ list, dailyLimit: DAILY_TASK_LIMIT, claimedToday: claimed.n, claimedTaskIds })
})

/** 领取任务（防止一天领太多） */
influencerRoutes.post('/tasks/claim', requireAuth('influencer'), actionLimiter, async (req, res) => {
  const { taskId } = req.body || {}
  const db = await getDb()
  const today = new Date().toISOString().slice(0, 10)
  const claimed = db.prepare('SELECT COUNT(*) as n FROM task_claims WHERE user_id = ? AND date(claimed_at) = ?').get(req.user.id, today)
  if (claimed.n >= DAILY_TASK_LIMIT) {
    writeAudit({ db, user: req.user, action: 'influencer.task.claim.fail', req, detail: { reason: 'daily_limit', taskId } })
    return res.status(400).json({ error: '今日领取已达上限，请明日再试' })
  }
  if (taskId != null) {
    const exists = db.prepare('SELECT id FROM task_claims WHERE user_id = ? AND task_id = ? AND date(claimed_at) = ?').get(req.user.id, taskId, today)
    if (exists) {
      writeAudit({ db, user: req.user, action: 'influencer.task.claim.fail', req, detail: { reason: 'already_claimed', taskId } })
      return res.status(400).json({ error: '该任务今日已领取' })
    }
    db.prepare('INSERT INTO task_claims (user_id, task_id) VALUES (?, ?)').run(req.user.id, taskId)
  }
  const newCount = db.prepare('SELECT COUNT(*) as n FROM task_claims WHERE user_id = ? AND date(claimed_at) = ?').get(req.user.id, today).n
  writeAudit({ db, user: req.user, action: 'influencer.task.claim.success', req, detail: { taskId, claimedToday: newCount, dailyLimit: DAILY_TASK_LIMIT } })
  res.json({ ok: true, message: '领取成功', claimedToday: newCount, dailyLimit: DAILY_TASK_LIMIT })
})

/** 视频上传（查重：file_hash 存库） */
influencerRoutes.post('/videos/upload', requireAuth('influencer'), actionLimiter, upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择视频文件' })
  }
  const fileHash = req.body?.fileHash || ''
  const db = await getDb()
  if (fileHash) {
    const dup = db.prepare('SELECT id FROM videos WHERE file_hash = ?').get(fileHash)
    if (dup) {
      writeAudit({ db, user: req.user, action: 'influencer.video.upload.duplicate', req, detail: { fileHash } })
      return res.json({
        id: null,
        duplicate: true,
        message: '该视频与已发布视频重复，请勿重复上传'
      })
    }
  }
  const taskId = req.body?.taskId || null
  const stored = await saveFile(req.file.buffer, req.file.originalname)
  db.prepare('INSERT INTO videos (title, video_type, file_hash, file_storage, file_key, video_link) VALUES (?, ?, ?, ?, ?, ?)')
    .run('上传视频', 'explain', fileHash || null, stored.storage, stored.key, stored.url || null)
  // sql.js 环境下 last_insert_rowid() 可能不可用，这里用 sqlite_sequence 获取自增序列值
  const idRow = db.prepare("SELECT seq as id FROM sqlite_sequence WHERE name = 'videos'").get()
  // 创建投稿记录（待审核）
  db.prepare('INSERT INTO video_submissions (task_id, influencer_id, video_id, status) VALUES (?, ?, ?, ?)').run(
    taskId ? Number(taskId) : null,
    req.user.id,
    Number(idRow?.id),
    'pending'
  )
  writeAudit({ db, user: req.user, action: 'influencer.video.upload.success', req, detail: { videoId: idRow?.id || null, taskId } })
  res.json({
    id: idRow?.id || null,
    url: stored.url || null,
    taskId
  })
})
