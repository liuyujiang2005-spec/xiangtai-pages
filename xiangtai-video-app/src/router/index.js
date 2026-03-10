/**
 * 三端路由配置（Admin / Client / Influencer 独立入口）
 */

import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../utils/auth.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { public: true }
  },

  // 客户端
  {
    path: '/client',
    component: () => import('../layouts/ClientLayout.vue'),
    meta: { role: 'client' },
    children: [
      { path: '', redirect: '/client/videos' },
      { path: 'login', name: 'ClientLogin', component: () => import('../views/client/Login.vue'), meta: { public: true } },
      { path: 'videos', name: 'ClientVideos', component: () => import('../views/client/VideoList.vue') },
      { path: 'download', name: 'ClientDownload', component: () => import('../views/client/VideoDownload.vue') },
      { path: 'recharge', name: 'ClientRecharge', component: () => import('../views/client/PointsRecharge.vue') }
    ]
  },

  // 达人端
  {
    path: '/influencer',
    component: () => import('../layouts/InfluencerLayout.vue'),
    meta: { role: 'influencer' },
    children: [
      { path: '', redirect: '/influencer/tasks' },
      { path: 'login', name: 'InfluencerLogin', component: () => import('../views/influencer/Login.vue'), meta: { public: true } },
      { path: 'tasks', name: 'InfluencerTasks', component: () => import('../views/influencer/TaskList.vue') },
      { path: 'upload', name: 'InfluencerUpload', component: () => import('../views/influencer/VideoUpload.vue') }
    ]
  },

  // 管理员端
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { role: 'admin' },
    children: [
      { path: '', redirect: '/admin/stats' },
      { path: 'login', name: 'AdminLogin', component: () => import('../views/admin/Login.vue'), meta: { public: true } },
      { path: 'stats', name: 'AdminStats', component: () => import('../views/admin/Stats.vue') },
      { path: 'influencers', name: 'AdminInfluencers', component: () => import('../views/admin/InfluencerReview.vue') },
      { path: 'points', name: 'AdminPoints', component: () => import('../views/admin/PointsManage.vue') },
      { path: 'actions', name: 'AdminActions', component: () => import('../views/admin/ActionReview.vue') },
      { path: 'cloud', name: 'AdminCloud', component: () => import('../views/admin/CloudUpload.vue') },
      { path: 'videos', name: 'AdminVideos', component: () => import('../views/admin/VideoManage.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  if (to.meta.public) return next()
  const role = to.meta.role || to.matched.find((r) => r.meta?.role)?.meta?.role
  if (!role || isAuthenticated(role)) return next()
  next({ path: `/${role}/login`, query: { redirect: to.fullPath } })
})

export default router
