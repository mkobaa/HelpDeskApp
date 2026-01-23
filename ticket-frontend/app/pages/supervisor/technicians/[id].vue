<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import { getTechnician } from '~/api/users/users'
import TechnicianTickets from '~/components/TechnicianTickets.vue'
import { computed, onMounted, ref, reactive, watch } from 'vue'

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

const user = ref(null as any)
const status = ref<'idle'|'pending'|'success'|'error'>('idle')
const error = ref(null as any)

const roles = ['user', 'technician', 'supervisor', 'admin']

const loadUser = async () => {
  if (!userId.value) return
  status.value = 'pending'
  error.value = null
  try {
    const data = await getTechnician(userId.value)
    user.value = data
    form.username = data?.username || ''
    form.email = data?.email || ''
    form.role = data?.role || ''
    form.department = data?.department || ''
    status.value = 'success'
  } catch (err) {
    error.value = err
    status.value = 'error'
  }
}

const refresh = () => loadUser()


onMounted(() => loadUser())
watch(userId, (v, ov) => { if (v && v !== ov) loadUser() })

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

        </UCard>

        <div class="mt-6">
          <p class="text-sm font-semibold text-highlighted mb-2">Assigned Tickets</p>
          <TechnicianTickets v-if="user?.id" :technicianId="user.id" />
        </div>
      </div>
    </UDashboardPage>
  </UDashboardGroup>
</template>
