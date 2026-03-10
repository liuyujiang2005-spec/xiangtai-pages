<template>
  <div class="points-manage-page">
    <h2>积分管理</h2>
    <p class="subtitle">达人积分、客户积分 · 兑换规则：1 积分 = 1 泰铢</p>
    <div class="cards">
      <div class="card">
        <h3>达人积分</h3>
        <p class="value">{{ influencerPoints }}</p>
      </div>
      <div class="card">
        <h3>客户积分</h3>
        <p class="value">{{ clientPoints }}</p>
      </div>
    </div>
    <p class="hint">1 积分 = 1 泰铢</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminGetPointsSummary } from '../../api/points.js'

const influencerPoints = ref(0)
const clientPoints = ref(0)

onMounted(async () => {
  try {
    const res = await adminGetPointsSummary()
    influencerPoints.value = res.influencerPoints ?? 0
    clientPoints.value = res.clientPoints ?? 0
  } catch {
    influencerPoints.value = 0
    clientPoints.value = 0
  }
})
</script>

<style scoped>
.points-manage-page h2 {
  margin-bottom: 0.25rem;
  font-size: 1.5rem;
  color: #fafafa;
}

.subtitle {
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #71717a;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.card {
  padding: 1.25rem;
  background: #18181b;
  border-radius: 12px;
  border: 1px solid #27272a;
}

.card h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #71717a;
}

.card .value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fafafa;
}

.hint {
  margin-top: 1.5rem;
  font-size: 0.8125rem;
  color: #71717a;
}
</style>
