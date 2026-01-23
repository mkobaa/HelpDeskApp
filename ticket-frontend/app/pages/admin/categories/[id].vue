<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import { getCategories } from '~/api/categories/categories'
import { getCategory } from '~/api/categories/categories'
import { updateCategory } from '~/api/categories/updateCategory'
import { computed, onMounted, ref, reactive, watchEffect } from 'vue'

const route = useRoute()
const router = useRouter()
const categoryId = computed(() => route.params.id as string)
const isEditing = ref(false)
const isSubmitting = ref(false)

const form = reactive({
  name: '',
  description: '',
  parent_category_id: null as number | null
})

const roles = ['user', 'technician', 'supervisor', 'admin']

const { data: category, status, error, refresh } = await useAsyncData(
  () => `category-${categoryId.value}`,
  () => getCategory(categoryId.value),
  {
    server: false,
    lazy: false,
    immediate: true,
    watch: [categoryId]
  }
)

onMounted(() => refresh())

watchEffect(() => {
  if (category.value) {
    form.name = category.value.name ?? ''
    form.description = category.value.description ?? ''
    form.parent_category_id = category.value.parent_category_id ?? null
  }
})

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value) {
    // Reset form when canceling
    if (category.value) {
      form.name = category.value.name || ''
      form.description = category.value.description || ''
      form.parent_category_id = category.value.parent_category_id || ''
    }
  }
}


const { data: categories } = await useAsyncData(
  'categories',
  () => getCategories(),
  { server: false }
)


// Async search for parent categories by name
const parentOptions = async (query = '') => {
  const cats = await getCategories(query)
  const arr = Array.isArray(cats) ? cats : (Array.isArray(cats.data) ? cats.data : [])
  return [
    { label: 'None', value: null },
    ...arr.filter(cat => cat.id !== Number(categoryId.value)).map(cat => ({
      label: cat.name,
      value: cat.id
    }))
  ]
}

const handleSave = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    await updateCategory(categoryId.value, {
      name: form.name,
      description: form.description,
      parent_category_id: form.parent_category_id
    })
    await refresh()
    isEditing.value = false
  } catch (err) {
    console.error('Failed to update category', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <Navbar title="Category details" icon="i-lucide-folder" class="w-full" />
      <div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
        <div class="flex items-center justify-between gap-3">
          <UDashboardPageHeader
            :title="category?.name || 'Category details'"
            :description="category?.description || ''"
          />
          <UButton 
            size="sm" 
            :icon="isEditing ? 'i-lucide-x' : 'i-lucide-pencil'" 
            :color="isEditing ? 'neutral' : 'primary'"
            @click="toggleEdit"
          >
            {{ isEditing ? 'Cancel' : 'Edit' }}
          </UButton>
        </div>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-highlighted">Profile</p>
              <div class="text-xs text-muted" v-if="status === 'pending'">Loading...</div>
            </div>
          </template>

          <!-- View Mode -->
          <div v-if="!isEditing" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p class="text-xs text-muted">Name</p>
              <p class="text-sm text-highlighted">{{ category?.name || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">Description</p>
              <p class="text-sm text-highlighted">{{ category?.description || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">Parent Category</p>
              <p class="text-sm text-highlighted">{{ category?.parent?.name || '—' }}</p>
            </div>
          </div>

          <!-- Edit Mode -->
          <form v-else class="flex flex-col gap-4" @submit.prevent="handleSave">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UFormGroup label="Name" name="name">
                <UInput v-model="form.name" required maxlength="255" />
              </UFormGroup>
              <UFormGroup label="Description" name="description">
                <UInput v-model="form.description" required maxlength="255" />
              </UFormGroup>
            </div>


            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <UFormGroup label="Parent Category" name="parent_category_id">
                  <USelect
                    v-model="form.parent_category_id"
                    :options="parentOptions"
                    placeholder="Select parent category"
                    searchable
                    clearable
                  />
                </UFormGroup>
            </div>


            <div class="flex justify-end gap-3 pt-2">
              <UButton type="button" color="neutral" variant="ghost" @click="toggleEdit">Cancel</UButton>
              <UButton type="submit" color="primary" icon="i-lucide-check" :loading="isSubmitting" :disabled="isSubmitting">
                Save Changes
              </UButton>
            </div>
          </form>

          <div v-if="error" class="mt-4 text-sm text-error">Failed to load user.</div>
        </UCard>

        <div class="flex gap-3">
          <UButton color="neutral" variant="ghost" to="/admin/users">Back to list</UButton>
          <UButton size="sm" icon="i-lucide-refresh-ccw" variant="outline" @click="refresh">Refresh</UButton>
        </div>
      </div>
    </UDashboardPage>
  </UDashboardGroup>
</template>
