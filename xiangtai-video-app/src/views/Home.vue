<template>
  <div class="home-page">
    <div class="hero">
      <h1>达人短视频分发 APP</h1>
      <p class="subtitle">未登录引导：请选择你的身份入口，登录后进入对应工作台</p>
      <div class="links">
        <router-link to="/client/login" class="link primary">
          <span class="link-title">客户端</span>
          <span class="link-desc">看数据、下载视频、充值积分</span>
        </router-link>
        <router-link to="/influencer/login" class="link">
          <span class="link-title">达人端</span>
          <span class="link-desc">领取任务、上传视频、避免重复</span>
        </router-link>
        <router-link to="/admin/login" class="link">
          <span class="link-title">管理端</span>
          <span class="link-desc">数据报表、投流码、云端链接与 AI</span>
        </router-link>
      </div>
    </div>

    <div class="panel">
      <h2>测试账号（本地）</h2>
      <div class="accounts">
        <div class="account">
          <span class="tag">Admin</span>
          <span class="kv">admin / 123456</span>
        </div>
        <div class="account">
          <span class="tag">Client</span>
          <span class="kv">client / 123456</span>
        </div>
        <div class="account">
          <span class="tag">Influencer</span>
          <span class="kv">influencer / 123456</span>
        </div>
      </div>
      <p class="hint">提示：生产环境请更换默认密码，并设置 JWT_SECRET 与 CORS_ORIGIN。</p>
    </div>
  </div>
</template>

<script setup>
/**
 * 三端入口选择页（未登录落地页）
 */
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto auto;
  gap: 1.5rem;
  align-content: center;
  background: #0f0f12;
  color: #e4e4e7;
  padding: 2rem 1.25rem;
}

.hero {
  max-width: 980px;
  margin: 0 auto;
  text-align: center;
}

.home-page h1 {
  margin-bottom: 0.5rem;
  font-size: 2rem;
  color: #fafafa;
}

.subtitle {
  margin-bottom: 2rem;
  font-size: 0.9375rem;
  color: #71717a;
}

.links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.link {
  padding: 1rem 1.25rem;
  font-size: 0.9375rem;
  color: #fafafa;
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  text-decoration: none;
  text-align: left;
}

.link:hover {
  background: #3f3f46;
  border-color: #52525b;
}

.link.primary {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.35);
}

.link-title {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.link-desc {
  display: block;
  font-size: 0.8125rem;
  color: #a1a1aa;
}

.panel {
  max-width: 980px;
  margin: 0 auto;
  padding: 1.25rem;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
}

.panel h2 {
  font-size: 1rem;
  color: #fafafa;
  margin-bottom: 0.75rem;
}

.accounts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.account {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #111113;
  border: 1px solid #27272a;
  border-radius: 10px;
}

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 74px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: #a1a1aa;
  background: #27272a;
  border-radius: 999px;
}

.kv {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.8125rem;
  color: #e4e4e7;
}

.hint {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: #71717a;
}
</style>
