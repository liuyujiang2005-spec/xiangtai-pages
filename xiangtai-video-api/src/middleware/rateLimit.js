/**
 * 基础限流（登录/上传/下载等关键接口）
 */

import rateLimit from 'express-rate-limit'

/**
 * 登录限流：防爆破
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * 操作限流：防刷
 */
export const actionLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
})

