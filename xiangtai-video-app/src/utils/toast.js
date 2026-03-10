/**
 * 全局 toast 工具
 * 通过 `app:toast` 事件通知 ToastHost 渲染提示
 */

/**
 * 发送 toast 事件
 * @param {'success'|'error'|'info'} type
 * @param {string} message
 * @param {number=} durationMs
 */
export function toast(type, message, durationMs) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { type, message, durationMs } }))
}

