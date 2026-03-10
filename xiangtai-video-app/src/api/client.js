/**
 * API 请求封装：统一 axios 实例、鉴权、错误处理
 */

import axios from 'axios'
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearToken } from '../utils/auth.js'
import { toast } from '../utils/toast.js'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const refreshInFlight = {
  admin: null,
  client: null,
  influencer: null
}

/**
 * 创建带鉴权的 axios 实例
 * @param {string} role - 角色：admin | client | influencer
 * @returns {import('axios').AxiosInstance}
 */
export function createApiClient(role) {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  instance.interceptors.request.use((config) => {
    const token = getAccessToken(role)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  instance.interceptors.response.use(
    (res) => res.data,
    async (err) => {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || '请求失败'
      if (err.response?.status === 401) {
        // 尝试 refresh，一次失败再跳登录
        const original = err.config || {}
        if (!original.__retried) {
          original.__retried = true
          try {
            await refreshAccess(role)
            return instance(original)
          } catch {
            clearToken(role)
            toast('error', '登录已过期，请重新登录')
            window.location.href = getLoginPath(role)
          }
        } else {
          clearToken(role)
          toast('error', '登录已过期，请重新登录')
          window.location.href = getLoginPath(role)
        }
      }
      if (err.response?.status && err.response?.status !== 401) {
        toast('error', msg)
      }
      return Promise.reject(err.response?.data || err.message)
    }
  )

  return instance
}

/** 根据角色返回登录页路径 */
function getLoginPath(role) {
  const paths = {
    admin: '/admin/login',
    client: '/client/login',
    influencer: '/influencer/login'
  }
  return paths[role] || '/'
}

/**
 * refresh access token（单飞：同一 role 并发只刷新一次）
 * @param {string} role
 */
async function refreshAccess(role) {
  if (refreshInFlight[role]) return refreshInFlight[role]
  const refreshToken = getRefreshToken(role)
  if (!refreshToken) throw new Error('no_refresh')
  refreshInFlight[role] = axios.post(`${baseURL}/${role}/auth/refresh`, { refreshToken })
    .then((r) => r.data)
    .then((data) => {
      if (data?.accessToken) setAccessToken(role, data.accessToken)
      if (data?.refreshToken) setRefreshToken(role, data.refreshToken)
      return data
    })
    .finally(() => {
      refreshInFlight[role] = null
    })
  return refreshInFlight[role]
}

/** 三端预置实例 */
export const adminApi = createApiClient('admin')
export const clientApi = createApiClient('client')
export const influencerApi = createApiClient('influencer')
