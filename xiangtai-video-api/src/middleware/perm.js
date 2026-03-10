/**
 * 权限中间件（细粒度权限）
 */

import { getDb } from '../db/index.js'

/**
 * 要求当前用户具备指定权限
 * - 目前用于 admin 端（可扩展到 client/influencer）
 * @param {string} perm
 */
export function requirePerm(perm) {
  return async (req, res, next) => {
    if (!req.user?.id || req.user?.role !== 'admin') {
      return res.status(403).json({ error: '无权限' })
    }
    const db = await getDb()
    const row = db.prepare('SELECT 1 as ok FROM admin_permissions WHERE user_id = ? AND perm = ?').get(req.user.id, perm)
    if (!row?.ok) {
      return res.status(403).json({ error: '无权限' })
    }
    next()
  }
}

/**
 * 获取当前用户权限列表（admin）
 * @param {number} userId
 * @returns {Promise<string[]>}
 */
export async function getAdminPerms(userId) {
  const db = await getDb()
  return db.prepare('SELECT perm FROM admin_permissions WHERE user_id = ? ORDER BY perm').all(userId).map((r) => r.perm)
}

