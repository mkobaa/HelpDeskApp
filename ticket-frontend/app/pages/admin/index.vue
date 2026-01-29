<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getNumberOfUsers, getNumberOfCategories, getNumberOfActions } from '~/api/stats/stats'

const range = ref('7')
const customFrom = ref('')
const customTo = ref('')
const status = ref('')
const priority = ref('')
const category_id = ref('')

const usersCount = ref<number | null>(null)
const categoriesCount = ref<number | null>(null)
const historyCount = ref<number | null>(null)
const loading = ref(false)

const buildParams = () => {
  const p = new URLSearchParams()
  if (status.value) p.append('status', status.value)
  if (priority.value) p.append('priority', priority.value)
  if (category_id.value) p.append('category_id', category_id.value)
  if (range.value !== 'custom') p.append('range', range.value)
  else {
    if (customFrom.value) p.append('from', customFrom.value)
    if (customTo.value) p.append('to', customTo.value)
  }
  return p.toString()
}

const fetchCounts = async () => {
  loading.value = true
  try {
    usersCount.value = await getNumberOfUsers()
  } catch (e) {
    usersCount.value = null
  }

  try {
    categoriesCount.value = await getNumberOfCategories()
  } catch (e) {
    categoriesCount.value = null
  }

  try {
    const params = {}
    if (status.value) params.status = status.value
    if (priority.value) params.priority = priority.value
    if (category_id.value) params.category_id = category_id.value
    historyCount.value = await getNumberOfActions(params)
  } catch (e) {
    historyCount.value = null
  }

  loading.value = false
}

onMounted(() => {
  fetchCounts()
})

const applyFilters = async (f) => {
  range.value = f.range || range.value
  customFrom.value = f.from || customFrom.value
  customTo.value = f.to || customTo.value
  status.value = f.status || ''
  priority.value = f.priority || ''
  category_id.value = f.category_id || ''
  await fetchCounts()
}
</script>

<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <Navbar title="Admin Dashboard" icon="i-lucide-shield" class="w-full" />
      <div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
        <div class="flex items-center justify-between gap-3">
          <UDashboardPageHeader title="Admin Dashboard" description="Overview of users, categories and history." />
        </div>


        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <UCard class="h-full">
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-muted-500">Users</p>
              <p class="text-3xl font-semibold text-gray-900">{{ usersCount === null ? '-' : usersCount }}</p>
              <p class="text-sm text-muted-500">Total users</p>
            </div>
          </UCard>

          <UCard class="h-full">
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-muted-500">Categories</p>
              <p class="text-3xl font-semibold text-gray-900">{{ categoriesCount === null ? '-' : categoriesCount }}</p>
              <p class="text-sm text-muted-500">Total categories</p>
            </div>
          </UCard>

          <UCard class="h-full">
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-muted-500">History actions</p>
              <p class="text-3xl font-semibold text-gray-900">{{ historyCount === null ? '-' : historyCount }}</p>
              <p class="text-sm text-muted-500">Filtered history actions</p>
            </div>
          </UCard>
        </div>
      </div>
    </UDashboardPage>
  </UDashboardGroup>
</template>

