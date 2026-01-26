<script setup lang="ts">
import { getTicketById } from '~/api/tickets/tickets'
import { updateTicketStatus } from '~/api/tickets/updateTicketStatus'

const route = useRoute()
const ticketId = computed(() => route.params.id as string)

const isEditing = ref(false)
const isSubmitting = ref(false)
const form = reactive({
  status: '',
  priority: '',
  technicianId: ''
})

const statusOptions = ['open', 'in_progress', 'pending', 'resolved', 'closed']
const priorityOptions = ['low', 'medium', 'high', 'critical']

const { data: ticket, status, refresh, error } = await useAsyncData(
  () => getTicketById(ticketId.value),
  {
    watch: [ticketId],
    server: false
  }
)




const technicianOptions = computed(() => {
  return (users.value || [])
    .map((u) => ({ label: u.username || u.email || `Tech #${u.id}`, value: String(u.id) }))
})

const resolveFileUrl = (file) => {
  const raw = file?.url || file?.path || file?.file_path || file?.attachment_url || file?.location
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  const base = process.client ? window.location.origin.replace(/\/+$/, '') : 'http://localhost:8000/storage/'
  const cleaned = String(raw).replace(/^\/+/, '')
  if (cleaned.startsWith('storage/')) return `${base}/${cleaned}`
  if (cleaned.startsWith('attachments/')) return `${base}/storage/${cleaned}`
  if (cleaned.startsWith('storage\\')) return `${base}/${cleaned.replace('\\', '/')}`
  return `${base}/${cleaned}`
}

const displayAttachments = computed(() => {
  const files = ticket.value?.attachments
    || ticket.value?.files
    || ticket.value?.attachments?.data
    || ticket.value?.media
    || ticket.value?.documents
    || []

  return (files || []).map((file) => ({
    url: resolveFileUrl(file),
    name: file?.name || file?.filename || file?.original_name || file?.file_name || file?.display_name || file?.path || file?.url || 'File',
    type: file?.mime_type || file?.type || ''
  })).filter(f => f.url)
})

const assignedTechnician = computed(() => {
  if (!ticket.value) return null
  const techId = ticket.value.assigned_tech_id || ticket.value.technician_id
  if (!techId) return null
  return (users.value || []).find(u => u.id == techId)
})



const elapsedTime = ref('')
let timerInterval: NodeJS.Timeout | null = null

const updateTimer = () => {
  if (!ticket.value?.created_at) return
  
  const created = new Date(ticket.value.created_at).getTime()
  const now = new Date().getTime()
  const diff = now - created
  
  if (diff < 0) {
    elapsedTime.value = '0s'
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)
  
  elapsedTime.value = parts.join(' ')
}

onMounted(() => {
  updateTimer()
  timerInterval = setInterval(updateTimer, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

watchEffect(() => {
  if (ticket.value) {

    form.status = ticket.value.status || ''
    form.priority = ticket.value.priority || ''
    const techId = ticket.value.assigned_tech_id || ticket.value.technician_id || ticket.value.technicianId || ticket.value.technician?.id
    form.technicianId = techId ? String(techId) : ''
  }
})

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value && ticket.value) {
    form.status = ticket.value.status || ''
    form.priority = ticket.value.priority || ''
    const techId = ticket.value.assigned_tech_id || ticket.value.technician_id || ticket.value.technicianId || ticket.value.technician?.id
    form.technicianId = techId ? String(techId) : ''
  }
}

const handleSave = async () => {
  if (isSubmitting.value || !ticketId.value) return
  isSubmitting.value = true
  try {
    const payload = {
      status: form.status || undefined,
      priority: form.priority || undefined,
      assigned_tech_id: form.technicianId ? Number(form.technicianId) : undefined
    }
    // console.log('Saving ticket with payload:', payload)
    
    await updateTicketStatus(ticketId.value, form.status)
    await refresh()
    isEditing.value = false
  } catch (err) {
    console.error('Failed to update ticket', err)
  } finally {
    isSubmitting.value = false
  }
}


onNuxtReady(() => {
  refresh()
})
</script>

<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <Navbar title="Ticket" icon="i-lucide-ticket" class="w-full" />
      <div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
        <div class="flex items-center justify-between gap-3">
          <UDashboardPageHeader
            :title="ticket ? `Ticket #${ticket.id}` : 'Ticket'"
            :description="ticket?.title || 'Ticket details'"
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
            <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" to="/supervisor/tickets">
              Back
            </UButton>
          </div>
        </div>

        <UCard :ui="{ body: 'grid gap-4 sm:grid-cols-2' }" :loading="status === 'pending'">
          <!-- View mode -->
          <template v-if="!isEditing">
            <div class="space-y-1">
              <p class="text-xs text-muted-500">Title</p>
              <p class="text-base font-medium text-gray-900">{{ ticket?.title || '-' }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-xs text-muted-500">Status</p>
              <UBadge color="primary" variant="soft">{{ ticket?.status || '-' }}</UBadge>
            </div>
            <div class="space-y-1">
              <p class="text-xs text-muted-500">Time Elapsed</p>
              <p class="text-base text-gray-900 font-mono">{{ elapsedTime }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-xs text-muted-500">Priority</p>
              <p class="text-base text-gray-900">{{ ticket?.priority || '-' }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-xs text-muted-500">Technician</p>
              <p class="text-base text-gray-900">
                {{ technicianDisplayName }}
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-xs text-muted-500">Category</p>
              <p class="text-base text-gray-900">{{ ticket?.category?.name || '-' }}</p>
            </div>
            <div class="space-y-1 sm:col-span-2">
              <p class="text-xs text-muted-500">Description</p>
              <p class="text-base text-gray-900 whitespace-pre-line">{{ ticket?.description || '-' }}</p>
            </div>
            <div v-if="displayAttachments.length" class="space-y-1 sm:col-span-2">
              <p class="text-xs text-muted-500">Attachments</p>
              <div class="flex flex-wrap gap-4">
                <div v-for="file in displayAttachments" :key="file.url || file.name" class="flex flex-col items-center w-32">
                  <template v-if="file.url && (file.url.endsWith('.png') || file.url.endsWith('.jpg') || file.url.endsWith('.jpeg') || file.url.endsWith('.gif'))">
                    <img :src="file.url" :alt="file.name" class="w-28 h-28 object-cover rounded border" />
                  </template>
                  <template v-else-if="file.url && file.url.endsWith('.pdf')">
                    <embed :src="file.url" type="application/pdf" class="w-28 h-28 border rounded" />
                  </template>
                  <template v-else>
                    <span class="i-lucide-file text-3xl text-gray-400 mb-2" />
                  </template>
                  <a :href="file.url" target="_blank" class="text-xs text-primary underline mt-1 break-all">{{ file.name || file.url }}</a>
                </div>
              </div>
            </div>
          </template>

          <!-- Edit mode -->
          <template v-else>
            <div class="space-y-1">
              <p class="text-xs text-muted-500">Title</p>
              <p class="text-base font-medium text-gray-900">{{ ticket?.title || '-' }}</p>
            </div>
            <UFormGroup label="Status" name="status">
              <USelect v-model="form.status" :items="statusOptions" placeholder="Select status" />
            </UFormGroup>
            <UFormGroup label="Priority" name="priority">
              <p class="text-base text-gray-900">{{ ticket?.priority || '-' }}</p>
            </UFormGroup>
            <UFormGroup label="Assign technician" name="technician">
              <p class="text-base text-gray-900">
                {{ technicianDisplayName }}
              </p>
            </UFormGroup>
            <div class="space-y-1">
              <p class="text-xs text-muted-500">Category</p>
              <p class="text-base text-gray-900">{{ ticket?.category?.name || '-' }}</p>
            </div>
            <div class="space-y-1 sm:col-span-2">
              <p class="text-xs text-muted-500">Description</p>
              <p class="text-base text-gray-900 whitespace-pre-line">{{ ticket?.description || '-' }}</p>
            </div>
            <div class="sm:col-span-2 flex justify-end gap-3 pt-2">
              <UButton type="button" color="neutral" variant="ghost" @click="toggleEdit">Cancel</UButton>
              <UButton type="button" color="primary" icon="i-lucide-check" :loading="isSubmitting" :disabled="isSubmitting" @click="handleSave">
                Save Changes
              </UButton>
            </div>
          </template>
        </UCard>
        <TicketComments :ticket-id="ticketId" />


        <UAlert
          v-if="error"
          icon="i-lucide-alert-triangle"
          color="red"
          variant="soft"
          title="Unable to load ticket"
          :description="error?.message || 'Please try again.'"
        />
      </div>
    </UDashboardPage>
  </UDashboardGroup>
</template>
