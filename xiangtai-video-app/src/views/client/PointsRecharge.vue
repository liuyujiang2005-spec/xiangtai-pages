<template>
  <div class="recharge-page">
    <h2>积分充值</h2>
    <p class="subtitle">积分兑换规则：<strong>1 积分 = 1 泰铢</strong>，充值得积分</p>

    <div class="recharge-card">
      <p class="balance">当前积分：<strong>{{ points }}</strong></p>
      <div class="form">
        <input v-model.number="amount" type="number" min="1" placeholder="充值金额（泰铢）" />
        <button @click="handleRecharge" :disabled="!amount || amount < 1 || loading">
          {{ loading ? '处理中...' : '充值' }}
        </button>
      </div>
      <p v-if="message" :class="messageType">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getClientPoints, rechargePoints } from '../../api/points.js'
import { toast } from '../../utils/toast.js'

const points = ref(0)
const amount = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref('')

onMounted(async () => {
  try {
    const res = await getClientPoints()
    points.value = res.points ?? 0
  } catch {
    points.value = 0
  }
})

async function handleRecharge() {
  if (!amount.value || amount.value < 1) return
  loading.value = true
  message.value = ''
  try {
    const res = await rechargePoints(Number(amount.value))
    points.value = res.points ?? points.value + amount.value
    toast('success', '充值成功')
    amount.value = ''
  } catch (e) {
    message.value = e?.message || '充值失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.recharge-page {
  max-width: 480px;
}

.recharge-page h2 {
  margin-bottom: 0.25rem;
  font-size: 1.5rem;
  color: #fafafa;
}

.subtitle {
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #71717a;
}

.recharge-card {
  padding: 1.5rem;
  background: #18181b;
  border-radius: 12px;
  border: 1px solid #27272a;
}

.balance {
  margin-bottom: 1rem;
  font-size: 0.9375rem;
  color: #a1a1aa;
}

.balance strong {
  color: #fafafa;
}

.form input {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #fafafa;
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  box-sizing: border-box;
}

.form button {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.form button:disabled {
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
