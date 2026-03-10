<template>
  <router-view />
  <ToastHost />
</template>

<script setup>
/**
 * 根组件：路由出口 + 全局 Toast
 */

import ToastHost from './components/common/ToastHost.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>
