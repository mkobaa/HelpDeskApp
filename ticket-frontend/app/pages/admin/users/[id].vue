<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import { getUser } from '~/api/users/users'
import { updateUser } from '~/api/users/updateUser'
import { activateUser, deactivateUser, getAccountStatus } from '~/api/users/accoutActivation'
import { computed, onMounted, ref, reactive, watchEffect } from 'vue'

const route = useRoute()
const router = useRouter()
const userId = computed(() => route.params.id as string)
const isEditing = ref(false)
const isSubmitting = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  role: '',
  department: ''
})

const roles = ['user', 'technician', 'supervisor', 'admin']

const { data: user, status, error, refresh } = await useAsyncData(
  () => `user-${userId.value}`,
  () => getUser(userId.value),
  {
    server: false,
    lazy: false,
    immediate: true,
    watch: [userId]
  }
)

onMounted(() => refresh())

const accountActive = ref(null)
const activationLoading = ref(false)

const loadAccountStatus = async () => {
  if (!userId.value) return
  try {
    const res = await getAccountStatus(userId.value)
    accountActive.value = res?.is_active ?? null
  } catch (err) {
    console.error('Failed to load account status', err)
    accountActive.value = null
  }
}

onMounted(() => {
  refresh()
  loadAccountStatus()
})

watchEffect(() => {
  if (user.value) {
    loadAccountStatus()
  }
})

const activateAccount = async () => {
  if (!userId.value) return
  activationLoading.value = true
  try {
    await activateUser(userId.value)
    await refresh()
    await loadAccountStatus()
  } catch (err) {
    console.error('Failed to activate account', err)
  } finally {
    activationLoading.value = false
  }
}

const deactivateAccount = async () => {
  if (!userId.value) return
  activationLoading.value = true
  try {
    await deactivateUser(userId.value)
    await refresh()
    await loadAccountStatus()
  } catch (err) {
    console.error('Failed to deactivate account', err)
  } finally {
    activationLoading.value = false
  }
}

watchEffect(() => {
  if (user.value) {
    form.username = user.value.username || ''
    form.email = user.value.email || ''
    form.role = user.value.role || ''
    form.department = user.value.department || ''
  }
})

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value) {
    // Reset form when canceling
    if (user.value) {
      form.username = user.value.username || ''
      form.email = user.value.email || ''
      form.role = user.value.role || ''
      form.department = user.value.department || ''
      form.password = ''
    }
  }
}

const handleSave = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    await updateUser(userId.value, {
      username: form.username,
      email: form.email,
      password: form.password || undefined,
      role: form.role || undefined,
      department: form.department || undefined
    })
    await refresh()
    isEditing.value = false
    form.password = ''
  } catch (err) {
    console.error('Failed to update user', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <Navbar title="User details" icon="i-lucide-user" class="w-full" />
      <div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
        <div class="flex items-center justify-between gap-3">
          <UDashboardPageHeader
            :title="user?.username || 'User'"
            :description="user?.email || ''"
          />
          <div class="flex gap-2">
            <UButton 
              size="sm" 
              :icon="isEditing ? 'i-lucide-x' : 'i-lucide-pencil'" 
              :color="isEditing ? 'neutral' : 'primary'"
              @click="toggleEdit"
            >
              {{ isEditing ? 'Cancel' : 'Edit' }}
            </UButton>

            <UButton
              v-if="accountActive === true"
              size="sm"
              :loading="activationLoading"
              @click="deactivateAccount"
              class="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded"
            >
              Deactivate
            </UButton>

            <UButton
              v-else-if="accountActive === false"
              size="sm"
              :loading="activationLoading"
              @click="activateAccount"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded"
            >
              Activate
            </UButton>
          </div>
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
              <p class="text-xs text-muted">Username</p>
              <p class="text-sm text-highlighted">{{ user?.username || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">Email</p>
              <p class="text-sm text-highlighted">{{ user?.email || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">Role</p>
              <p class="text-sm text-highlighted">{{ user?.role || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">Department</p>
              <p class="text-sm text-highlighted">{{ user?.department || '—' }}</p>
            </div>
          </div>

          <!-- Edit Mode -->
          <form v-else class="flex flex-col gap-4" @submit.prevent="handleSave">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UFormGroup label="Username" name="username">
                <UInput v-model="form.username" required maxlength="255" />
              </UFormGroup>
              <UFormGroup label="Email" name="email">
                <UInput v-model="form.email" type="email" required maxlength="255" />
              </UFormGroup>
            </div>

            <UFormGroup label="Password (leave blank to keep current)" name="password">
              <UInput v-model="form.password" type="password" minlength="8" />
            </UFormGroup>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UFormGroup label="Role" name="role">
                <USelect v-model="form.role" :items="roles" placeholder="Select role" />
              </UFormGroup>
              <UFormGroup label="Department" name="department">
                <UInput v-model="form.department" maxlength="255" />
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
