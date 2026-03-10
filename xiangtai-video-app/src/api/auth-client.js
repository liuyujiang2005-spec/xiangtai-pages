/**
 * 客户端登录 API（独立于管理员、达人端）
 */

import axios from 'axios'
import { setAccessToken, setRefreshToken, clearToken } from '../utils/auth.js'
import { toast } from '../utils/toast.js'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 客户端登录
 * @param {string} username - 用户名/手机号
 * @param {string} password - 密码
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: Object }>}
 */
export async function clientLogin(username, password) {
  const { data } = await axios.post(`${baseURL}/client/auth/login`, {
    username,
    password
  })
  if (data.accessToken) {
    setAccessToken('client', data.accessToken)
  }
  if (data.refreshToken) {
    setRefreshToken('client', data.refreshToken)
  }
  toast('success', '登录成功')
  return data
}

/**
 * 客户端登出
 */
export function clientLogout() {
  clearToken('client')
}
