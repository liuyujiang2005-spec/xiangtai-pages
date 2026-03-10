/**
 * Refresh Token 存取与撤销
 */

import { hashRefreshToken, signAccess, signRefresh, verify } from './jwt.js'

/**
 * 创建一对 access/refresh，并把 refresh 存库
 * @param {{ prepare: Function }} db
 * @param {{ id: number, username: string, role: string }} user
 */
export function issueTokens(db, user) {
  const access = signAccess(user)
  const refresh = signRefresh(user)
  const tokenHash = hashRefreshToken(refresh.token)
  const expiresAt = unixToSqlite(refresh.exp)
  db.prepare('INSERT INTO refresh_tokens (user_id, role, token_hash, expires_at) VALUES (?, ?, ?, ?)').run(
    user.id,
    user.role,
    tokenHash,
    expiresAt
  )
  return { accessToken: access.token, refreshToken: refresh.token }
}

/**
 * 使用 refresh token 换取新的 access/refresh（旋转 refresh）
 * @param {{ prepare: Function }} db
 * @param {string} refreshToken
 * @returns {{ accessToken: string, refreshToken: string, user: {id:number, username:string, role:string} }}
 */
export function rotateRefresh(db, refreshToken) {
  const payload = verify(refreshToken)
  if (payload.tokenType !== 'refresh') {
    throw new Error('invalid_refresh')
  }
  const tokenHash = hashRefreshToken(refreshToken)
  const row = db.prepare('SELECT id, user_id as userId, role, revoked_at as revokedAt, expires_at as expiresAt FROM refresh_tokens WHERE token_hash = ?').get(tokenHash)
  if (!row || row.revokedAt) throw new Error('invalid_refresh')
  // 简单过期判断（依赖 sqlite datetime 格式）
  // 如果数据库里已过期，视为无效
  const expired = db.prepare("SELECT 1 as ok WHERE datetime(?) <= datetime('now')").get(row.expiresAt)
  if (expired?.ok) throw new Error('invalid_refresh')

  // 读取用户（保证账号存在）
  const user = db.prepare('SELECT id, username, role FROM users WHERE id = ? AND role = ?').get(row.userId, row.role)
  if (!user) throw new Error('invalid_refresh')

  // 撤销旧 refresh，签发新一对
  db.prepare("UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE id = ?").run(row.id)
  return { ...issueTokens(db, user), user }
}

/**
 * 撤销 refresh token（登出）
 * @param {{ prepare: Function }} db
 * @param {string} refreshToken
 */
export function revokeRefresh(db, refreshToken) {
  const tokenHash = hashRefreshToken(refreshToken)
  db.prepare("UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE token_hash = ?").run(tokenHash)
}

/**
 * 撤销当前 access token（按 jti）
 * @param {{ prepare: Function }} db
 * @param {{ jti?: string, id?: number, role?: string, exp?: number }} accessPayload
 */
export function revokeAccess(db, accessPayload) {
  if (!accessPayload?.jti || !accessPayload?.exp) return
  db.prepare('INSERT OR IGNORE INTO revoked_access_tokens (jti, user_id, role, expires_at) VALUES (?, ?, ?, ?)').run(
    accessPayload.jti,
    accessPayload.id ?? null,
    accessPayload.role ?? null,
    unixToSqlite(accessPayload.exp)
  )
}

/**
 * Unix 秒 -> SQLite datetime 字符串
 * @param {number} unixSeconds
 * @returns {string}
 */
function unixToSqlite(unixSeconds) {
  const ms = Number(unixSeconds) * 1000
  const d = new Date(ms)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
}

