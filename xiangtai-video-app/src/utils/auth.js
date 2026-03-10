/**
 * 认证工具函数（三端独立 Token 管理）
 */

import { TOKEN_KEYS, REFRESH_TOKEN_KEYS } from './constants.js'

/**
 * 获取当前端的 Access Token
 * @param {string} role - 角色：admin | client | influencer
 * @returns {string|null}
 */
export function getAccessToken(role) {
  const key = TOKEN_KEYS[role]
  return key ? localStorage.getItem(key) : null
}

/**
 * 获取当前端的 Refresh Token
 * @param {string} role
 * @returns {string|null}
 */
export function getRefreshToken(role) {
  const key = REFRESH_TOKEN_KEYS[role]
  return key ? localStorage.getItem(key) : null
}

/**
 * 设置 Access Token
 * @param {string} role - 角色
 * @param {string} token - JWT Access Token
 */
export function setAccessToken(role, token) {
  const key = TOKEN_KEYS[role]
  if (key) localStorage.setItem(key, token)
}

/**
 * 设置 Refresh Token
 * @param {string} role
 * @param {string} token
 */
export function setRefreshToken(role, token) {
  const key = REFRESH_TOKEN_KEYS[role]
  if (key) localStorage.setItem(key, token)
}

/**
 * 清除 Token（access + refresh）
 * @param {string} role - 角色
 */
export function clearToken(role) {
  const key = TOKEN_KEYS[role]
  if (key) localStorage.removeItem(key)
  const rKey = REFRESH_TOKEN_KEYS[role]
  if (rKey) localStorage.removeItem(rKey)
}

/**
 * 判断是否已登录
 * @param {string} role - 角色
 * @returns {boolean}
 */
export function isAuthenticated(role) {
  return !!getAccessToken(role)
}

/**
 * 兼容旧调用：getToken/setToken
 */
export const getToken = getAccessToken
export const setToken = setAccessToken
