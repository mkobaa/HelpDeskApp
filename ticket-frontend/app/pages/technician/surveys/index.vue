<script setup lang="ts">
import { getSurveys } from '~/api/surveys/getSurveys'
import SurveysTable from '~/components/SurveysTable.vue'
import { computed, ref, watch } from 'vue'

const currentPage = ref(1)
const perPage = ref(20)

const key = computed(() => `supervisor-surveys-page-${currentPage.value}`)

const { data: surveysRaw, status, refresh } = await useAsyncData(
  key,
  () => getSurveys({ page: currentPage.value, per_page: perPage.value, _raw: true }),
  { server: false, watch: [currentPage, perPage] }
)

const surveys = computed(() => {
  const v = surveysRaw.value
  if (!v) return []
  if (Array.isArray(v)) return v
  if (v?.data?.data && Array.isArray(v.data.data)) return v.data.data
  if (Array.isArray(v.data)) return v.data
  return []
})

const extractMeta = (v) => {
  if (!v) return null
  if (v?.data?.meta) return v.data.meta
  if (v?.data && typeof v.data === 'object' && (v.data.total || v.data.last_page || v.data.current_page || v.data.per_page)) return v.data
  if (v?.meta) return v.meta
  if (v?.pagination) return v.pagination
  return null
}

const meta = computed(() => extractMeta(surveysRaw.value))

const total = computed(() => {
  const m = meta.value
  if (m) return m.total ?? m.total_items ?? 0
  return surveys.value.length
})

const lastPage = computed(() => {
  const m = meta.value
  if (m) return Number(m.last_page ?? m.lastPage ?? m.total_pages ?? 1)
  return 1
})

const perPageDisplay = computed(() => {
  const m = meta.value
  if (m) return Number(m.per_page ?? m.perPage ?? perPage.value)
  return perPage.value
})

watch(surveysRaw, (v) => {
  const m = extractMeta(v)
  if (m && m.current_page) {
    currentPage.value = Number(m.current_page)
  }
})



const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < lastPage.value) currentPage.value++ }
</script>

<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-y-auto">
      <Navbar title="Surveys" icon="i-lucide-clipboard-list" class="w-full" />

      <div class="p-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Surveys</h2>
          <UButton size="sm" variant="outline" icon="i-lucide-refresh-ccw" @click="refresh">Refresh</UButton>
        </div>

        <UCard>

          <div class="p-2">
            <SurveysTable :surveys="surveys" :loading="status === 'pending'" />
          </div>

          <div v-if="surveys.length === 0 && surveysRaw" class="mt-4 p-2 bg-gray-50 rounded text-xs text-muted">
            <div class="mb-2">Debug: server response (empty results)</div>
            <pre class="whitespace-pre-wrap max-h-48 overflow-auto">{{ JSON.stringify(surveysRaw, null, 2) }}</pre>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <div class="text-sm text-gray-600">Showing <span v-if="surveys.length">{{ ((currentPage-1)*perPage)+1 }}-{{ ((currentPage-1)*perPage) + surveys.length }}</span><span v-else>0</span> of {{ total }}</div>
            <div class="flex items-center gap-2">
              <UButton size="sm" variant="ghost" :disabled="currentPage === 1" @click="prevPage">Prev</UButton>
              <div class="px-3 text-sm">Page {{ currentPage }} / {{ lastPage }}</div>
              <UButton size="sm" variant="ghost" :disabled="currentPage === lastPage" @click="nextPage">Next</UButton>
            </div>
          </div>
        </UCard>
      </div>
    </UDashboardPage>
  </UDashboardGroup>
</template>
