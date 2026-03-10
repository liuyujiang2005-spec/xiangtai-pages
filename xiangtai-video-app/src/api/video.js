/**
 * 短视频相关 API
 * 通过调用后端接口获取视频单量、播放量等数据
 */

import { clientApi, influencerApi, adminApi } from './client.js'

/**
 * 获取达人已发布视频列表（含 API 数据：视频单量、播放量）
 * @param {Object} params - 分页、筛选参数
 * @returns {Promise<{ list: Array, total: number }>}
 */
export function getPublishedVideos(params = {}) {
  return clientApi.get('/client/videos', { params })
}

/**
 * 客户端：下载视频
 * 露脸视频：费用较高，需兼职绑定（客户代码与达人代码一对一）
 * 讲解视频：按组下载，防关联
 * @param {Object} params - { type: 'face'|'explain', videoIds?: number[], groupSize?: number }
 * @returns {Promise<{ downloadUrl?: string, groupUrls?: string[], cost?: number }>}
 */
export function downloadVideos(params) {
  return clientApi.post('/client/videos/download', params)
}

/**
 * 客户端：获取可下载的讲解视频分组（按组形式，防关联）
 * @param {number} groupSize - 每组数量
 * @returns {Promise<{ groups: Array }>}
 */
export function getDownloadGroups(groupSize = 5) {
  return clientApi.get('/client/videos/download-groups', { params: { groupSize } })
}

/**
 * 获取单个视频详情（含投流码、AI 解析结果）
 * @param {string} videoId - 视频 ID
 * @returns {Promise<Object>}
 */
export function getVideoDetail(videoId) {
  return clientApi.get(`/client/videos/${videoId}`)
}

/**
 * 达人端：获取可领取的任务列表（含每日领取额度）
 * @param {Object} params
 * @returns {Promise<{ list: Array, dailyLimit: number, claimedToday: number }>}
 */
export function getInfluencerTasks(params = {}) {
  return influencerApi.get('/influencer/tasks', { params })
}

/**
 * 达人端：领取任务（受每日上限限制）
 * @param {number} taskId - 任务 ID
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
export function claimTask(taskId) {
  return influencerApi.post('/influencer/tasks/claim', { taskId })
}

/**
 * 达人端：上传视频（支持查重）
 * @param {FormData} formData - 视频文件及元数据，可含 fileHash 用于查重
 * @returns {Promise<Object>} 含 duplicate 表示与已有视频重复
 */
export function uploadVideo(formData) {
  return influencerApi.post('/influencer/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 管理员：上传云端链接
 * @param {Object} data - { videoId, cloudUrl, streamingCode?, aiAnalysis? }
 * @returns {Promise<Object>}
 */
export function adminUploadCloudLink(data) {
  return adminApi.post('/admin/videos/cloud', data)
}

/**
 * 管理员：AI 解析（防达人提前删除）
 * @param {string} videoId - 视频 ID
 * @returns {Promise<{ aiAnalysis: string }>}
 */
export function adminRunAiAnalysis(videoId) {
  return adminApi.post(`/admin/videos/${videoId}/ai-analysis`)
}

/**
 * 管理员：获取视频列表并管理投流码
 * @param {Object} params
 * @returns {Promise<{ list: Array }>}
 */
export function adminGetVideos(params = {}) {
  return adminApi.get('/admin/videos', { params })
}

/**
 * 管理员：更新视频投流码
 * @param {string} videoId - 视频 ID
 * @param {string} streamingCode - 投流码
 * @returns {Promise<Object>}
 */
export function adminUpdateStreamingCode(videoId, streamingCode) {
  return adminApi.patch(`/admin/videos/${videoId}/streaming-code`, { streamingCode })
}
