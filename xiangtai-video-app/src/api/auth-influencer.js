/**
 * 达人端登录 API（独立于管理员、客户端）
 */

import axios from 'axios'
import { setAccessToken, setRefreshToken, clearToken } from '../utils/auth.js'
import { toast } from '../utils/toast.js'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 达人端登录
 * @param {string} username - 用户名/达人代码
 * @param {string} password - 密码
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: Object }>}
 */
export async function influencerLogin(username, password) {
  const { data } = await axios.post(`${baseURL}/influencer/auth/login`, {
    username,
    password
  })
  if (data.accessToken) {
    setAccessToken('influencer', data.accessToken)
  }
  if (data.refreshToken) {
    setRefreshToken('influencer', data.refreshToken)
  }
  toast('success', '登录成功')
  return data
}

/**
 * 达人端登出
 */
export function influencerLogout() {
  clearToken('influencer')
}
