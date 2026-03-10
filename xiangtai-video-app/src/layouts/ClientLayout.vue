<template>
  <div class="client-layout">
    <header v-if="!isLoginPage" class="layout-header">
      <h1 class="logo">达人短视频 · 客户端</h1>
      <nav class="nav">
        <router-link to="/client/videos">视频列表</router-link>
        <router-link to="/client/download">下载视频</router-link>
        <router-link to="/client/recharge">积分充值</router-link>
        <button v-if="isLoggedIn" class="btn-logout" @click="handleLogout">退出</button>
      </nav>
    </header>
    <main class="layout-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { clientLogout } from '../api/auth-client.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isLoginPage = computed(() => route.path.includes('/login'))
const isLoggedIn = computed(() => userStore.isLoggedIn || !!localStorage.getItem('xiangtai_client_token'))

function handleLogout() {
  clientLogout()
  userStore.clearUser()
  router.push('/client/login')
}
</script>

<style scoped>
.client-layout {
  min-height: 100vh;
  background: #0f0f12;
  color: #e4e4e7;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #27272a;
}

.logo {
  font-size: 1.125rem;
  font-weight: 600;
  color: #fafafa;
}

.nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav a {
  color: #a1a1aa;
  text-decoration: none;
  font-size: 0.875rem;
}

.nav a.router-link-active {
  color: #fafafa;
}

.btn-logout {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: #a1a1aa;
  background: transparent;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  cursor: pointer;
}

.btn-logout:hover {
  color: #fafafa;
  border-color: #52525b;
}

.layout-main {
  padding: 1.5rem;
}
</style>
