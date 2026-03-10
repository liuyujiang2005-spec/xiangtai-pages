<template>
  <div class="influencer-review-page">
    <h2>审核达人</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="list.length === 0" class="empty">暂无待审核达人</div>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.username }}</td>
            <td>{{ item.status || '待审核' }}</td>
            <td>
              <button class="btn-approve" @click="approve(item.id)">通过</button>
              <button class="btn-reject" @click="reject(item.id)">拒绝</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const list = ref([])
const loading = ref(false)

onMounted(() => {
  loading.value = true
  // 后续对接 API
  setTimeout(() => {
    list.value = []
    loading.value = false
  }, 500)
})

function approve(id) {
  console.log('approve', id)
}

function reject(id) {
  console.log('reject', id)
}
</script>

<style scoped>
.influencer-review-page h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #fafafa;
}

.loading,
.empty {
  padding: 2rem;
  color: #a1a1aa;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #27272a;
}

th {
  font-size: 0.8125rem;
  color: #71717a;
}

td {
  font-size: 0.875rem;
  color: #e4e4e7;
}

.btn-approve,
.btn-reject {
  margin-right: 0.5rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-approve {
  color: #fff;
  background: #22c55e;
}

.btn-reject {
  color: #fff;
  background: #ef4444;
}
</style>
