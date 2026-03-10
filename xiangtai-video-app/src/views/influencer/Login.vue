<template>
  <div class="login-page">
    <div class="login-card">
      <h2>达人端登录</h2>
      <form @submit.prevent="handleLogin">
        <input v-model="username" type="text" placeholder="用户名/达人代码" required />
        <input v-model="password" type="password" placeholder="密码" required />
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { influencerLogin } from '../../api/auth-influencer.js'
import { useUserStore } from '../../stores/user.js'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const res = await influencerLogin(username.value, password.value)
    userStore.setUser(res.user || { username: username.value }, 'influencer')
    router.push((router.currentRoute.value.query.redirect) || '/influencer/tasks')
  } catch (e) {
    error.value = e?.message || e?.error || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.login-card {
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  background: #18181b;
  border-radius: 12px;
  border: 1px solid #27272a;
}

.login-card h2 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #fafafa;
}

.login-card input {
  display: block;
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

.login-card button {
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

.login-card button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin-bottom: 1rem;
  font-size: 0.8125rem;
  color: #f87171;
}
</style>
