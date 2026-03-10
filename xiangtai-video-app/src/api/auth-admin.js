/**
 * 管理员端登录 API（独立于客户端、达人端）
 */

import axios from 'axios'
import { setAccessToken, setRefreshToken, clearToken } from '../utils/auth.js'
import { toast } from '../utils/toast.js'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 管理员登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: Object }>}
 */
export async function adminLogin(username, password) {
  const { data } = await axios.post(`${baseURL}/admin/auth/login`, {
    username,
    password
  })
  if (data.accessToken) {
    setAccessToken('admin', data.accessToken)
  }
  if (data.refreshToken) {
    setRefreshToken('admin', data.refreshToken)
  }
  toast('success', '登录成功')
  return data
}

/**
 * 管理员登出
 */
export function adminLogout() {
  clearToken('admin')
}
