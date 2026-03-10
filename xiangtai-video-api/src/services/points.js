/**
 * 积分服务：统一修改 points_accounts，并写入 points_ledger
 */

/**
 * 增减积分并写入流水
 * @param {{ prepare: Function }} db
 * @param {{ userId: number, role: string, delta: number, reason: string, refType?: string, refId?: number }} params
 * @returns {{ points: number }}
 */
export function applyPoints(db, params) {
  const { userId, role, delta, reason, refType, refId } = params
  // 确保账户存在
  const acc = db.prepare('SELECT id, points FROM points_accounts WHERE user_id = ?').get(userId)
  if (!acc?.id) {
    db.prepare('INSERT INTO points_accounts (user_id, role, points) VALUES (?, ?, ?)').run(userId, role, 0)
  }

  // 更新余额
  db.prepare('UPDATE points_accounts SET points = points + ?, updated_at = datetime(\"now\") WHERE user_id = ?')
    .run(delta, userId)

  // 写流水
  db.prepare('INSERT INTO points_ledger (user_id, role, delta, reason, ref_type, ref_id) VALUES (?, ?, ?, ?, ?, ?)')
    .run(userId, role, delta, reason, refType || null, refId || null)

  const row = db.prepare('SELECT points FROM points_accounts WHERE user_id = ?').get(userId)
  return { points: row?.points ?? 0 }
}

