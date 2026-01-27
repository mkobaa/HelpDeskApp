<script setup lang="ts">
import { getCategories } from '~/api/categories/categories'

const filters = reactive({
  status: '',
  priority: '',
  category_id: ''
})

// Fetch categories on client only and lazily to avoid blocking SSR/hydration
const { data: categories, refresh: refreshCategories } = useAsyncData(
  'categories',
  () => getCategories(),
  {
    default: () => [],
    server: false,
    lazy: true,
  }
)

// trigger client-side fetch shortly after mount to avoid blocking initial paint
if (process.client) setTimeout(() => refreshCategories().catch(() => {}), 300)

const statusOptions = ['open', 'pending', 'closed']
const priorityOptions = ['low', 'medium', 'high']

const categoryOptions = computed(() => {
  return (categories.value || []).map(c => ({ label: c.name, value: String(c.id) }))
})
</script>

<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <Navbar title="Dashboard" icon="i-lucide-house" class="w-full" />
      <div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
        <div class="flex items-center justify-between gap-3">
          <UDashboardPageHeader title="Dashboard" description="Welcome to your dashboard." />
        </div>
        
        <div class="flex gap-4 items-end">
          <UFormGroup label="Status" class="w-40">
            <USelect v-model="filters.status" :items="statusOptions" placeholder="All Status" />
          </UFormGroup>
          <UFormGroup label="Priority" class="w-40">
            <USelect v-model="filters.priority" :items="priorityOptions" placeholder="All Priorities" />
          </UFormGroup>
          <UFormGroup label="Category" class="w-40">
            <USelect 
              v-model="filters.category_id" 
              :items="categoryOptions" 
              option-attribute="label"
              placeholder="All Categories" 
            />
          </UFormGroup>
          <UButton 
            color="gray" 
            variant="ghost" 
            icon="i-lucide-x" 
            @click="Object.assign(filters, { status: '', priority: '', category_id: '' })"
            :disabled="!filters.status && !filters.priority && !filters.category_id"
          >
            Clear
          </UButton>
        </div>

        <TicketsTable class="flex-1 w-full" :filters="filters" />
      </div>
    </UDashboardPage>
  </UDashboardGroup>
</template>
