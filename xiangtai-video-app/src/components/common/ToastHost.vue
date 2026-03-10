<template>
  <div class="toast-host" aria-live="polite" aria-atomic="true">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast"
      :class="t.type"
      role="status"
    >
      <strong class="title">{{ titleMap[t.type] }}</strong>
      <div class="message">{{ t.message }}</div>
    </div>
  </div>
</template>

<script setup>
/**
 * 全局 Toast 宿主组件
 * - 通过 window 事件接收 toast：window.dispatchEvent(new CustomEvent('app:toast', { detail: { type, message } }))
 */

import { onMounted, onBeforeUnmount, ref } from 'vue'

const toasts = ref([])

const titleMap = {
  success: '成功',
  error: '错误',
  info: '提示'
}

/**
 * 推送一条 toast
 * @param {{ type?: 'success'|'error'|'info', message: string, durationMs?: number }} payload
 */
function push(payload) {
  const id = Date.now() + Math.random()
  const type = payload?.type || 'info'
  const message = payload?.message || ''
  const durationMs = Number(payload?.durationMs || 2500)
  const item = { id, type, message }
  toasts.value = [item, ...toasts.value].slice(0, 5)
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((x) => x.id !== id)
  }, durationMs)
}

/**
 * 事件处理：接收 app:toast
 * @param {CustomEvent} e
 */
function onToast(e) {
  push(e.detail || {})
}

onMounted(() => {
  window.addEventListener('app:toast', onToast)
})

onBeforeUnmount(() => {
  window.removeEventListener('app:toast', onToast)
})
</script>

<style scoped>
.toast-host {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(360px, calc(100vw - 2rem));
}

.toast {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #27272a;
  background: rgba(24, 24, 27, 0.92);
  backdrop-filter: blur(8px);
  color: #e4e4e7;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.toast.success {
  border-color: rgba(34, 197, 94, 0.35);
}

.toast.error {
  border-color: rgba(248, 113, 113, 0.35);
}

.toast.info {
  border-color: rgba(59, 130, 246, 0.35);
}

.title {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.8125rem;
  color: #fafafa;
}

.message {
  font-size: 0.875rem;
  line-height: 1.4;
  color: #d4d4d8;
  word-break: break-word;
}
</style>

