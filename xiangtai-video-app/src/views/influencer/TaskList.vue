<template>
  <div class="task-list-page">
    <h2>任务列表</h2>
    <p class="subtitle">产品类型、视频下载链接 · 每日领取上限防止一天领太多任务</p>

    <div v-if="quotaText" class="quota">{{ quotaText }}</div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="tasks.length === 0" class="empty">
      <p>暂无任务</p>
    </div>
    <div v-else class="task-list">
      <div v-for="task in tasks" :key="task.id" class="task-card">
        <h3>{{ task.productType || '未分类' }}</h3>
        <a v-if="task.videoDownloadLink" :href="task.videoDownloadLink" target="_blank" class="link">下载视频</a>
        <p v-else class="no-link">暂无下载链接</p>
        <div class="actions">
          <button
            v-if="!isClaimed(task.id)"
            class="btn btn-claim"
            :disabled="isOverLimit || claimLoading"
            @click="claimTask(task.id)"
          >
            {{ isOverLimit ? '今日已满' : claimLoading ? '领取中...' : '领取' }}
          </button>
          <router-link v-else :to="`/influencer/upload?taskId=${task.id}`" class="btn">去上传</router-link>
        </div>
      </div>
    </div>
    <p v-if="message" :class="messageType">{{ message }}</p>
  </div>
</template>

<script setup>
/**
 * 达人任务列表
 * 每日领取上限，防止一天领太多任务
 */

import { ref, computed, onMounted } from 'vue'
import { getInfluencerTasks, claimTask as claimTaskApi } from '../../api/video.js'
import { toast } from '../../utils/toast.js'

const tasks = ref([])
const loading = ref(false)
const claimLoading = ref(false)
const dailyLimit = ref(10)
const claimedToday = ref(0)
const claimedTaskIds = ref([])
const message = ref('')
const messageType = ref('')

const quotaText = computed(() => `今日已领取 ${claimedToday.value} / ${dailyLimit.value} 个任务`)

const isOverLimit = computed(() => claimedToday.value >= dailyLimit.value)

function isClaimed(taskId) {
  return claimedTaskIds.value.includes(String(taskId))
}

async function fetchTasks() {
  loading.value = true
  try {
    const res = await getInfluencerTasks()
    tasks.value = res.list || []
    dailyLimit.value = res.dailyLimit ?? 10
    claimedToday.value = res.claimedToday ?? 0
    claimedTaskIds.value = res.claimedTaskIds || []
  } catch {
    tasks.value = []
  } finally {
    loading.value = false
  }
}

async function claimTask(taskId) {
  if (isOverLimit.value || isClaimed(taskId)) return
  claimLoading.value = true
  message.value = ''
  try {
    const res = await claimTaskApi(taskId)
    claimedToday.value = res.claimedToday ?? claimedToday.value + 1
    claimedTaskIds.value = [...claimedTaskIds.value, String(taskId)]
    toast('success', '领取成功，请去上传')
  } catch (e) {
    message.value = e?.error || e?.message || '领取失败'
    messageType.value = 'error'
  } finally {
    claimLoading.value = false
  }
}

onMounted(fetchTasks)
</script>

<style scoped>
.task-list-page {
  max-width: 800px;
}

.task-list-page h2 {
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

.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  padding: 1.25rem;
  background: #18181b;
  border-radius: 12px;
  border: 1px solid #27272a;
}

.task-card h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #fafafa;
}

.link {
  display: inline-block;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #3b82f6;
  text-decoration: none;
}

.no-link {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #71717a;
}

.quota {
  margin-bottom: 1rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #a1a1aa;
  background: #18181b;
  border-radius: 8px;
  border: 1px solid #27272a;
}

.actions {
  margin-top: 0.5rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  color: #fff;
  background: #3b82f6;
  border-radius: 6px;
  text-decoration: none;
  border: none;
  cursor: pointer;
}

.btn-claim:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #22c55e;
}

.error {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #f87171;
}
</style>
