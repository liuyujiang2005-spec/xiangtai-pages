/**
 * 审计日志服务
 * 记录登录、领取、上传、下载、管理操作等关键行为
 */

/**
 * 写入审计日志
 * @param {Object} params
 * @param {{ prepare: Function }} params.db - 数据库实例（getDb 返回）
 * @param {{ id?: number, role?: string }=} params.user - 当前用户（可选，登录失败场景可能为空）
 * @param {string} params.action - 行为标识，如 'client.login.success'
 * @param {import('express').Request} params.req - Express Request
 * @param {Object=} params.detail - 业务细节（会 JSON.stringify 存储）
 */
export function writeAudit({ db, user, action, req, detail }) {
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.socket?.remoteAddress || ''
  const ua = req.headers['user-agent'] || ''
  const payload = detail ? safeJson({ ...detail, requestId: req.id || undefined }) : safeJson({ requestId: req.id || undefined })
  db.prepare(
    'INSERT INTO audit_logs (user_id, role, action, method, path, ip, user_agent, detail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    user?.id ?? null,
    user?.role ?? null,
    action,
    req.method,
    req.path,
    ip,
    String(ua).slice(0, 512),
    payload
  )
}

/**
 * 安全 JSON 序列化（避免循环引用导致抛错）
 * @param {Object} obj
 * @returns {string}
 */
function safeJson(obj) {
  try {
    return JSON.stringify(obj)
  } catch {
    return JSON.stringify({ note: 'unserializable' })
  }
}

