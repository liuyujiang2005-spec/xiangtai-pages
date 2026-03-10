<template>
  <div class="video-download-page">
    <h2>下载视频</h2>
    <p class="subtitle">露脸视频需兼职绑定，讲解视频支持按组下载防关联</p>

    <div class="download-types">
      <!-- 露脸视频 -->
      <section class="card">
        <h3>露脸视频</h3>
        <p class="desc">费用较高，需客户代码与达人代码一对一绑定</p>
        <div class="form">
          <label>客户代码</label>
          <input v-model="faceForm.clientCode" placeholder="输入客户代码" />
          <label>绑定达人代码</label>
          <input v-model="faceForm.influencerCode" placeholder="输入达人代码（一对一绑定）" />
          <label>选择视频</label>
          <select v-model="faceForm.videoId">
            <option value="">请选择</option>
            <option v-for="v in videos" :key="v.id" :value="v.id">{{ v.title }}</option>
          </select>
          <p class="cost">预计消耗：{{ faceCost }} 积分（1 积分 = 1 泰铢）</p>
          <button @click="downloadFace" :disabled="!canDownloadFace || loading">
            {{ loading ? '处理中...' : '下载' }}
          </button>
        </div>
      </section>

      <!-- 讲解视频 -->
      <section class="card">
        <h3>讲解视频</h3>
        <p class="desc">按组形式下载，防关联</p>
        <div class="form">
          <label>每组数量</label>
          <input v-model.number="explainForm.groupSize" type="number" min="1" max="20" />
          <button @click="loadGroups" :disabled="loading">加载分组</button>
          <div v-if="groups.length" class="groups">
            <div v-for="(g, i) in groups" :key="i" class="group-item">
              <span>第 {{ i + 1 }} 组（{{ g.videos?.length || 0 }} 个）</span>
              <button @click="downloadGroup(g)" :disabled="loading">下载</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <p v-if="message" :class="messageType">{{ message }}</p>
  </div>
</template>

<script setup>
/**
 * 客户端下载视频页面
 * 露脸视频：费用较高、兼职绑定（客户代码与达人代码一对一）
 * 讲解视频：按组下载、防关联
 */

import { ref, computed, onMounted } from 'vue'
import { getPublishedVideos, downloadVideos, getDownloadGroups } from '../../api/video.js'
import { toast } from '../../utils/toast.js'

const videos = ref([])
const groups = ref([])
const loading = ref(false)
const message = ref('')
const messageType = ref('')

const faceForm = ref({
  clientCode: '',
  influencerCode: '',
  videoId: ''
})

const explainForm = ref({
  groupSize: 5
})

/** 露脸视频单价（积分），费用较高 */
const FACE_VIDEO_COST = 50

const faceCost = computed(() => FACE_VIDEO_COST)

const canDownloadFace = computed(() => {
  return (
    faceForm.value.clientCode &&
    faceForm.value.influencerCode &&
    faceForm.value.videoId
  )
})

onMounted(async () => {
  try {
    const res = await getPublishedVideos()
    videos.value = res.list || []
  } catch {
    videos.value = []
  }
})

async function downloadFace() {
  if (!canDownloadFace.value) return
  loading.value = true
  message.value = ''
  try {
    const res = await downloadVideos({
      type: 'face',
      videoId: Number(faceForm.value.videoId),
      clientCode: faceForm.value.clientCode,
      influencerCode: faceForm.value.influencerCode
    })
    if (res.downloadUrl) {
      window.open(res.downloadUrl, '_blank')
      toast('success', `下载成功，消耗 ${res.cost ?? FACE_VIDEO_COST} 积分`)
    } else {
      toast('success', res.message || '下载链接已生成')
    }
  } catch (e) {
    message.value = e?.message || e?.error || '下载失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

async function loadGroups() {
  loading.value = true
  groups.value = []
  message.value = ''
  try {
    const res = await getDownloadGroups(explainForm.value.groupSize || 5)
    groups.value = res.groups || []
    if (groups.value.length === 0) {
      toast('info', '暂无可用分组')
    }
  } catch (e) {
    message.value = e?.message || '加载失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

async function downloadGroup(group) {
  loading.value = true
  message.value = ''
  try {
    const res = await downloadVideos({
      type: 'explain',
      videoIds: group.videos?.map((v) => v.id) || [],
      groupSize: explainForm.value.groupSize
    })
    if (res.groupUrls?.length) {
      res.groupUrls.forEach((url) => window.open(url, '_blank'))
      toast('success', '分组下载已开始')
    } else {
      toast('success', res.message || '下载已发起')
    }
  } catch (e) {
    message.value = e?.message || '下载失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.video-download-page {
  max-width: 800px;
}

.video-download-page h2 {
  margin-bottom: 0.25rem;
  font-size: 1.5rem;
  color: #fafafa;
}

.subtitle {
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #71717a;
}

.download-types {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  padding: 1.5rem;
  background: #18181b;
  border-radius: 12px;
  border: 1px solid #27272a;
}

.card h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #fafafa;
}

.desc {
  margin-bottom: 1rem;
  font-size: 0.8125rem;
  color: #71717a;
}

.form label {
  display: block;
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
  font-size: 0.8125rem;
  color: #a1a1aa;
}

.form input,
.form select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #fafafa;
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  box-sizing: border-box;
}

.form button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #fff;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cost {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #a1a1aa;
}

.groups {
  margin-top: 1rem;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #27272a;
}

.group-item button {
  margin-top: 0;
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
