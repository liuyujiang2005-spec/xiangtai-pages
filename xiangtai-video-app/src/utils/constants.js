/**
 * 应用常量配置
 */

/** 三端角色标识 */
export const ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
  INFLUENCER: 'influencer'
}

/** Token 存储键名（按端区分） */
export const TOKEN_KEYS = {
  [ROLES.ADMIN]: 'xiangtai_admin_token',
  [ROLES.CLIENT]: 'xiangtai_client_token',
  [ROLES.INFLUENCER]: 'xiangtai_influencer_token'
}

/** Refresh Token 存储键名（按端区分） */
export const REFRESH_TOKEN_KEYS = {
  [ROLES.ADMIN]: 'xiangtai_admin_refresh_token',
  [ROLES.CLIENT]: 'xiangtai_client_refresh_token',
  [ROLES.INFLUENCER]: 'xiangtai_influencer_refresh_token'
}

/** 积分兑换比例：1 积分 = 1 泰铢 */
export const POINTS_RATE = 1
