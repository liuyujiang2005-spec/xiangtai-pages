<template>
  <div class="upload-page">
    <h2>视频上传</h2>

    <div class="upload-card">
      <form @submit.prevent="handleUpload">
        <div class="field">
          <label>选择视频文件</label>
          <input type="file" accept="video/*" @change="onFileChange" required />
        </div>
        <div class="field">
          <label>任务 ID（可选）</label>
          <input v-model="taskId" type="text" placeholder="关联任务 ID" />
        </div>
        <p v-if="message" :class="messageType">{{ message }}</p>
        <p v-if="duplicateWarning" class="warning">发布视频查重：该视频与已发布视频重复，请勿重复上传</p>
        <button type="submit" :disabled="!file || loading">
          {{ loading ? '上传中...' : '上传' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { uploadVideo } from '../../api/video.js'
import { toast } from '../../utils/toast.js'

const route = useRoute()
const file = ref(null)
const taskId = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref('')
const duplicateWarning = ref(false)

onMounted(() => {
  taskId.value = route.query.taskId || ''
})

function onFileChange(e) {
  file.value = e.target.files?.[0] || null
}

async function handleUpload() {
  if (!file.value) return
  loading.value = true
  message.value = ''
  duplicateWarning.value = false
  const formData = new FormData()
  formData.append('video', file.value)
  if (taskId.value) formData.append('taskId', taskId.value)
  try {
    const res = await uploadVideo(formData)
    if (res.duplicate) {
      duplicateWarning.value = true
      message.value = res.message || '该视频与已发布视频重复'
      messageType.value = 'error'
      toast('error', message.value)
      return
    }
    toast('success', '上传成功')
    file.value = null
  } catch (e) {
    message.value = e?.message || '上传失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.upload-page {
  max-width: 480px;
}

.upload-page h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #fafafa;
}

.upload-card {
  padding: 1.5rem;
  background: #18181b;
  border-radius: 12px;
  border: 1px solid #27272a;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
  color: #a1a1aa;
}

.field input[type="file"],
.field input[type="text"] {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #fafafa;
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  box-sizing: border-box;
}

.upload-card button {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.upload-card button:disabled {
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

.warning {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: #f59e0b;
}
</style>
