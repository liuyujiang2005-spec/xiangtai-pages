/**
 * 用户状态管理（按端区分，三端独立）
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isAuthenticated } from '../utils/auth.js'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const currentRole = ref(null) // 'admin' | 'client' | 'influencer'

  const isLoggedIn = computed(() => {
    if (!currentRole.value) return false
    return isAuthenticated(currentRole.value)
  })

  function setUser(info, role) {
    userInfo.value = info
    currentRole.value = role
  }

  function clearUser() {
    userInfo.value = null
    currentRole.value = null
  }

  return {
    userInfo,
    currentRole,
    isLoggedIn,
    setUser,
    clearUser
  }
})
