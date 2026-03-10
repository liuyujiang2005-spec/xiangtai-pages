<template>
  <div class="cloud-upload-page">
    <h2>上传云端链接</h2>
    <p class="subtitle">为视频添加云端存储链接，支持 AI 解析防达人提前删除</p>

    <div class="upload-form">
      <div class="field">
        <label>视频 ID</label>
        <input v-model="form.videoId" type="text" placeholder="视频 ID" />
      </div>
      <div class="field">
        <label>云端链接 URL</label>
        <input v-model="form.cloudUrl" type="url" placeholder="https://..." />
      </div>
      <div class="field">
        <label>投流码（可选）</label>
        <input v-model="form.streamingCode" placeholder="如 ST-001" />
      </div>
      <div class="field">
        <label>AI 解析结果（可选，或点击下方按钮自动解析）</label>
        <textarea v-model="form.aiAnalysis" rows="3" placeholder="AI 解析结果，用于防达人提前删除"></textarea>
      </div>
      <div class="actions">
        <button @click="submitUpload" :disabled="!form.videoId || !form.cloudUrl || loading">
          {{ loading ? '提交中...' : '提交' }}
        </button>
        <button v-if="form.videoId" class="btn-secondary" @click="runAiAnalysis" :disabled="loading">
          AI 解析
        </button>
      </div>
    </div>

    <p v-if="message" :class="messageType">{{ message }}</p>
  </div>
</template>

<script setup>
/**
 * 管理员上传云端链接
 * 支持 AI 解析（防达人提前删除）
 */

import { ref } from 'vue'
import { adminUploadCloudLink, adminRunAiAnalysis } from '../../api/video.js'
import { toast } from '../../utils/toast.js'

const form = ref({
  videoId: '',
  cloudUrl: '',
  streamingCode: '',
  aiAnalysis: ''
})

const loading = ref(false)
const message = ref('')
const messageType = ref('')

async function submitUpload() {
  if (!form.value.videoId || !form.value.cloudUrl) return
  loading.value = true
  message.value = ''
  try {
    await adminUploadCloudLink({
      videoId: form.value.videoId,
      cloudUrl: form.value.cloudUrl,
      streamingCode: form.value.streamingCode || undefined,
      aiAnalysis: form.value.aiAnalysis || undefined
    })
    toast('success', '提交成功')
  } catch (e) {
    message.value = e?.message || e?.error || '提交失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

async function runAiAnalysis() {
  if (!form.value.videoId) return
  loading.value = true
  message.value = ''
  try {
    const res = await adminRunAiAnalysis(form.value.videoId)
    form.value.aiAnalysis = res.aiAnalysis || '已通过 AI 解析，无异常'
    toast('success', 'AI 解析完成')
  } catch (e) {
    message.value = e?.message || 'AI 解析失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cloud-upload-page {
  max-width: 560px;
}

.cloud-upload-page h2 {
  margin-bottom: 0.25rem;
  font-size: 1.5rem;
  color: #fafafa;
}

.subtitle {
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #71717a;
}

.upload-form {
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

.field input,
.field textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #fafafa;
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  box-sizing: border-box;
}

.field textarea {
  resize: vertical;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.actions button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #fff;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #3f3f46 !important;
}

.btn-secondary:hover:not(:disabled) {
  background: #52525b !important;
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
