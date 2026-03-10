<template>
  <div class="stats-page">
    <h2>数据统计与报表</h2>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="stats-grid">
      <div class="stat-card">
        <h3>视频总数</h3>
        <p class="value">{{ stats.videoCount ?? '-' }}</p>
      </div>
      <div class="stat-card">
        <h3>已发布视频</h3>
        <p class="value">{{ stats.publishedVideoCount ?? '-' }}</p>
      </div>
      <div class="stat-card">
        <h3>达人数</h3>
        <p class="value">{{ stats.influencerCount ?? '-' }}</p>
      </div>
      <div class="stat-card">
        <h3>客户数</h3>
        <p class="value">{{ stats.clientCount ?? '-' }}</p>
      </div>
      <div class="stat-card">
        <h3>客户积分合计</h3>
        <p class="value">{{ stats.totalClientPoints ?? '-' }}</p>
        <span class="unit">1 积分 = 1 泰铢</span>
      </div>
      <div class="stat-card">
        <h3>达人积分合计</h3>
        <p class="value">{{ stats.totalInfluencerPoints ?? '-' }}</p>
        <span class="unit">1 积分 = 1 泰铢</span>
      </div>
      <div class="stat-card">
        <h3>今日任务领取</h3>
        <p class="value">{{ stats.taskClaimedToday ?? '-' }}</p>
      </div>
      <div class="stat-card">
        <h3>今日上传数</h3>
        <p class="value">{{ stats.uploadCountToday ?? '-' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminStats } from '../../api/stats.js'

const stats = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    stats.value = await getAdminStats()
  } catch {
    stats.value = {}
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.stats-page h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #fafafa;
}

.loading {
  padding: 2rem;
  color: #a1a1aa;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-card {
  padding: 1.25rem;
  background: #18181b;
  border-radius: 12px;
  border: 1px solid #27272a;
}

.stat-card h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #71717a;
}

.stat-card .value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fafafa;
}

.stat-card .unit {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #71717a;
}
</style>
