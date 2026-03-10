<template>
  <div class="video-card">
    <div v-if="video.coverUrl" class="cover">
      <img :src="video.coverUrl" :alt="video.title || '视频封面'" />
    </div>
    <div v-else class="cover-placeholder">
      <span>暂无封面</span>
    </div>
    <div class="info">
      <h3 class="title">{{ video.title || '未命名视频' }}</h3>
      <span v-if="video.videoType" class="type-badge">{{ video.videoType === 'face' ? '露脸' : '讲解' }}</span>
      <a v-if="video.videoLink" :href="video.videoLink" target="_blank" class="link">视频链接</a>
      <div class="api-data">
        <span class="label">视频单量：</span>
        <span class="value">{{ video.orderCount ?? '-' }}</span>
      </div>
      <div class="api-data">
        <span class="label">播放量：</span>
        <span class="value">{{ formatNumber(video.playCount) }}</span>
      </div>
      <div v-if="video.streamingCode" class="api-data">
        <span class="label">投流码：</span>
        <span class="value code">{{ video.streamingCode }}</span>
      </div>
      <div v-if="video.aiAnalysis" class="ai">
        <span class="label">AI 解析：</span>
        <span class="value">{{ video.aiAnalysis }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 视频卡片组件
 * 展示视频链接、投流码、API 数据（视频单量、播放量）、AI 解析结果
 */

defineProps({
  video: {
    type: Object,
    default: () => ({})
  }
})

/**
 * 格式化数字（千、万）
 * @param {number} n
 * @returns {string}
 */
function formatNumber(n) {
  if (n == null || n === '') return '-'
  const num = Number(n)
  if (isNaN(num)) return '-'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  if (num >= 1000) return (num / 1000).toFixed(1) + '千'
  return String(num)
}
</script>

<style scoped>
.video-card {
  background: #18181b;
  border-radius: 12px;
  border: 1px solid #27272a;
  overflow: hidden;
}

.cover,
.cover-placeholder {
  aspect-ratio: 16 / 9;
  background: #27272a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder span {
  font-size: 0.8125rem;
  color: #71717a;
}

.info {
  padding: 1rem;
}

.title {
  margin-bottom: 0.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #fafafa;
  line-height: 1.4;
}

.type-badge {
  display: inline-block;
  margin-bottom: 0.5rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
  color: #a1a1aa;
  background: #27272a;
  border-radius: 4px;
}

.link {
  display: inline-block;
  margin-bottom: 0.75rem;
  font-size: 0.8125rem;
  color: #3b82f6;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.api-data,
.ai {
  margin-bottom: 0.375rem;
  font-size: 0.8125rem;
}

.label {
  color: #71717a;
}

.value {
  color: #e4e4e7;
}

.value.code {
  font-family: monospace;
  font-size: 0.75rem;
}
</style>
