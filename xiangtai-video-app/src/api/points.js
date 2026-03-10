/**
 * 积分相关 API
 * 积分兑换规则：1 积分 = 1 泰铢
 */

import { clientApi, adminApi } from './client.js'

/**
 * 客户端：获取当前积分余额
 * @returns {Promise<{ points: number }>}
 */
export function getClientPoints() {
  return clientApi.get('/client/points')
}

/**
 * 客户端：积分充值（1 泰铢 = 1 积分）
 * @param {number} amount - 充值金额（泰铢）
 * @returns {Promise<{ points: number, orderId: string }>}
 */
export function rechargePoints(amount) {
  return clientApi.post('/client/points/recharge', { amount })
}

/**
 * 管理员：获取积分汇总（达人积分、客户积分）
 * @returns {Promise<{ influencerPoints: number, clientPoints: number }>}
 */
export function adminGetPointsSummary() {
  return adminApi.get('/admin/points/summary')
}
