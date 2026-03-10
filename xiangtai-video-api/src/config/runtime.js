/**
 * 运行时配置（环境变量解析）
 */

import { resolve } from 'path'

/**
 * 上传目录（绝对路径）
 * - multer 写入与 express.static 读取必须一致
 */
export const uploadDir = resolve(process.env.UPLOAD_DIR || 'uploads')

/**
 * 允许的 CORS Origin 列表
 * - 生产环境建议配置为前端域名（支持逗号分隔）
 */
export const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

