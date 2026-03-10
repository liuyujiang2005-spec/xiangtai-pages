/**
 * JWT 鉴权中间件（三端独立，按 role 校验）
 */

import { verify } from '../services/jwt.js'
import { getDb } from '../db/index.js'

/**
 * 要求请求带有效 JWT，且 role 匹配
 * @param {string} role - 'admin' | 'client' | 'influencer'
 */
export function requireAuth(role) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return res.status(401).json({ error: '未提供认证信息' })
    }
    try {
      const payload = verify(token)
      if (payload.tokenType && payload.tokenType !== 'access') {
        return res.status(401).json({ error: '认证无效或已过期' })
      }
      if (payload.role !== role) {
        return res.status(403).json({ error: '无权限' })
      }
      // 登出失效：检查 jti 是否被撤销
      const jti = payload.jti
      if (jti) {
        const db = await getDb()
        const revoked = db.prepare('SELECT 1 as ok FROM revoked_access_tokens WHERE jti = ?').get(jti)
        if (revoked?.ok) {
          return res.status(401).json({ error: '认证无效或已过期' })
        }
      }
      req.user = payload
      next()
    } catch (e) {
      return res.status(401).json({ error: '认证无效或已过期' })
    }
  }
}
