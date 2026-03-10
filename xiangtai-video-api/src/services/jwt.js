/**
 * JWT 签发与校验（按端区分可配置不同密钥）
 */

import jwt from 'jsonwebtoken'
import { randomUUID, createHash } from 'crypto'

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET 未设置：生产环境必须配置强随机密钥')
}

const secret = process.env.JWT_SECRET || 'dev-secret'
const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d'

/**
 * 签发 Access Token（短有效期）
 * @param {{ id: number, username: string, role: string }} payload
 * @returns {{ token: string, jti: string, exp: number }}
 */
export function signAccess(payload) {
  const jti = randomUUID()
  const token = jwt.sign({ ...payload, tokenType: 'access' }, secret, { expiresIn: accessExpiresIn, jwtid: jti })
  const decoded = jwt.decode(token)
  return { token, jti, exp: decoded?.exp }
}

/**
 * 签发 Refresh Token（长有效期）
 * @param {{ id: number, username: string, role: string }} payload
 * @returns {{ token: string, exp: number }}
 */
export function signRefresh(payload) {
  const token = jwt.sign({ ...payload, tokenType: 'refresh' }, secret, { expiresIn: refreshExpiresIn })
  const decoded = jwt.decode(token)
  return { token, exp: decoded?.exp }
}

/**
 * 校验 JWT，返回 payload 或抛错
 * @param {string} token
 * @returns {{ id: number, username: string, role: string, tokenType: string, jti?: string, exp?: number }}
 */
export function verify(token) {
  return jwt.verify(token, secret)
}

/**
 * 计算 refresh token 的 hash（避免明文存库）
 * @param {string} refreshToken
 * @returns {string}
 */
export function hashRefreshToken(refreshToken) {
  return createHash('sha256').update(String(refreshToken)).digest('hex')
}
