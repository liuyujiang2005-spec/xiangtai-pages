/**
 * 视频列表状态管理（客户端达人已发布视频）
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPublishedVideos } from '../api/video.js'

export const useVideoStore = defineStore('video', () => {
  const list = ref([])
  const total = ref(0)
  const loading = ref(false)

  /**
   * 拉取视频列表（含 API 数据：视频单量、播放量）
   * @param {Object} params - 分页、筛选
   */
  async function fetchVideos(params = {}) {
    loading.value = true
    try {
      const res = await getPublishedVideos(params)
      list.value = res.list || []
      total.value = res.total ?? 0
      return res
    } finally {
      loading.value = false
    }
  }

  function clearVideos() {
    list.value = []
    total.value = 0
  }

  return {
    list,
    total,
    loading,
    fetchVideos,
    clearVideos
  }
})
