/**
 * 管理员数据统计 API
 */

import { adminApi } from './client.js'

/**
 * 获取数据统计与报表
 * @returns {Promise<Object>}
 */
export function getAdminStats() {
  return adminApi.get('/admin/stats')
}
