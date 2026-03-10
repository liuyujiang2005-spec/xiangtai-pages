<template>
  <div class="video-manage-page">
    <h2>视频管理</h2>
    <p class="subtitle">管理投流码、AI 解析结果</p>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="list.length === 0" class="empty">暂无视频</div>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>投流码</th>
            <th>AI 解析</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.title || '-' }}</td>
            <td>
              <input
                v-if="editingId === item.id"
                v-model="editForm.streamingCode"
                class="inline-input"
                @keyup.enter="saveStreamingCode(item.id)"
              />
              <span v-else>{{ item.streamingCode || '-' }}</span>
            </td>
            <td class="ai-cell">{{ item.aiAnalysis || '-' }}</td>
            <td>
              <button
                v-if="editingId === item.id"
                class="btn-save"
                @click="saveStreamingCode(item.id)"
              >
                保存
              </button>
              <button
                v-else
                class="btn-edit"
                @click="startEdit(item)"
              >
                编辑投流码
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="message" :class="messageType">{{ message }}</p>
  </div>
</template>

<script setup>
/**
 * 管理员视频管理
 * 投流码展示与编辑
 */

import { ref, onMounted } from 'vue'
import { adminGetVideos, adminUpdateStreamingCode } from '../../api/video.js'
import { toast } from '../../utils/toast.js'

const list = ref([])
const loading = ref(false)
const editingId = ref(null)
const editForm = ref({ streamingCode: '' })
const message = ref('')
const messageType = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const res = await adminGetVideos()
    list.value = res.list || []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
})

function startEdit(item) {
  editingId.value = item.id
  editForm.value.streamingCode = item.streamingCode || ''
}

async function saveStreamingCode(videoId) {
  loading.value = true
  message.value = ''
  try {
    await adminUpdateStreamingCode(videoId, editForm.value.streamingCode)
    const item = list.value.find((v) => v.id === videoId)
    if (item) item.streamingCode = editForm.value.streamingCode
    editingId.value = null
    toast('success', '保存成功')
  } catch (e) {
    message.value = e?.message || '保存失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.video-manage-page h2 {
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
  padding: 2rem;
  color: #a1a1aa;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #27272a;
}

th {
  font-size: 0.8125rem;
  color: #71717a;
}

td {
  font-size: 0.875rem;
  color: #e4e4e7;
}

.ai-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inline-input {
  width: 120px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8125rem;
  color: #fafafa;
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 4px;
}

.btn-edit,
.btn-save {
  padding: 0.25rem 0.5rem;
  font-size: 0.8125rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit {
  color: #3b82f6;
  background: transparent;
}

.btn-save {
  color: #fff;
  background: #22c55e;
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
