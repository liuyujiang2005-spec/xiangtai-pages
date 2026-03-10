<template>
  <div class="video-list-page">
    <h2>达人已发布视频</h2>
    <p class="subtitle">通过 API 获取视频单量、播放量等数据</p>

    <div v-if="videoStore.loading" class="loading">加载中...</div>
    <div v-else-if="videoStore.list.length === 0" class="empty">
      <p>暂无视频数据</p>
      <p class="hint">请确保后端服务已启动，或使用 Mock 数据</p>
    </div>
    <div v-else class="video-grid">
      <VideoCard
        v-for="item in videoStore.list"
        :key="item.id"
        :video="item"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useVideoStore } from '../../stores/video.js'
import VideoCard from '../../components/VideoCard.vue'

const videoStore = useVideoStore()

onMounted(() => {
  videoStore.fetchVideos()
})
</script>

<style scoped>
.video-list-page {
  max-width: 1200px;
  margin: 0 auto;
}

.video-list-page h2 {
  margin-bottom: 0.25rem;
  font-size: 1.5rem;
  color: #fafafa;
}

.subtitle {
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #71717a;
}

.loading,
.empty {
  padding: 3rem;
  text-align: center;
  color: #a1a1aa;
}

.hint {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #71717a;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
</style>
