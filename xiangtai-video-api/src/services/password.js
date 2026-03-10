/**
 * 密码哈希与校验（bcrypt）
 */

import bcrypt from 'bcryptjs'

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10)

/**
 * 是否为 bcrypt hash
 * @param {string} s
 * @returns {boolean}
 */
function isBcryptHash(s) {
  return typeof s === 'string' && s.startsWith('$2')
}

/**
 * 生成密码 hash
 * @param {string} plain
 * @returns {string}
 */
export function hashPassword(plain) {
  return bcrypt.hashSync(String(plain), SALT_ROUNDS)
}

/**
 * 校验密码（兼容历史明文存储：仅用于过渡）
 * @param {string} plain
 * @param {string} stored
 * @returns {boolean}
 */
export function verifyPassword(plain, stored) {
  if (isBcryptHash(stored)) {
    return bcrypt.compareSync(String(plain), stored)
  }
  // 过渡：兼容旧 data.db 里明文 password_hash
  return String(plain) === String(stored)
}

