<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { getProfile } from '~/api/users/profile'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, startSSE, stopSSE } from '~/utils/notifications'
import getAssignedToMe from '~/api/tickets/acceptTicket'
import { accept as acceptAssignment, reject as rejectAssignment } from '~/api/tickets/acceptance'

defineProps<{
  title?: string
  icon?: string
}>()



type NotificationItem = {
  id: string | number
  title: string
  description: string
  time: string
  unread: boolean
}

const notifications = ref<NotificationItem[]>([])
const isLoading = ref(false)
let pollTimer: ReturnType<typeof setInterval> | undefined

const unreadCount = computed(() => notifications.value.filter(n => n.unread).length)

const formatTimeAgo = (isoDate: string) => {
  const then = new Date(isoDate).getTime()
  const now = Date.now()
  const diffSeconds = Math.max(0, Math.floor((now - then) / 1000))
  if (diffSeconds < 60) return `${diffSeconds}s ago`
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

const mapApiNotifications = (payload: any): NotificationItem[] => {
  const items = Array.isArray(payload?.data) ? payload.data : []
  return items.map((item: any) => ({
    id: item.id ?? crypto.randomUUID(),
    title: item.type?.split('\\').pop() || 'Notification',
    description: item.data?.message || item.data?.message || 'New update',
    time: item.created_at ? formatTimeAgo(item.created_at) : 'Just now',
    unread: !item.read_at
  }))
}

const loadNotifications = async () => {
  try {
    isLoading.value = true
    const data = await fetchNotifications()
    notifications.value = mapApiNotifications(data)
  } catch (err) {
    console.error('Failed to load notifications', err)
  } finally {
    isLoading.value = false
  }
}

const handleNotificationClick = async (notification) => {
  if (!notification.unread) return
  try {
    await markNotificationRead(notification.id)
    await loadNotifications()
  } catch (err) {
    console.error('Failed to mark notification as read', err)
  }
}
const handleMarkAllRead = async () => {
  try {
    await markAllNotificationsRead()
    await loadNotifications()
  } catch (err) {
    console.error('Failed to mark all notifications as read', err)
  }
}




onMounted(async () => {
  // sync role cookie with server-side user role
  try {
    const raw = await getProfile()
    const serverRole = raw?.data?.role
    if (serverRole) {
      const cookieUserRole = useCookie('user_role')
      if (cookieUserRole.value !== serverRole) cookieUserRole.value = serverRole
    }
  } catch (err) {
    // ignore if not authenticated or request fails
  }
  // load notifications once and start SSE for real-time updates
  await loadNotifications()
  startSSE({
    onMessage(payload) {
      try {
        const mapped = mapApiNotifications({ data: [payload] })[0]
        notifications.value = [mapped, ...notifications.value].slice(0, 50)
      } catch (e) {
        // ignore
      }
    },
    onError(err) {
      console.error('SSE error', err)
    }
  })

  if (useCookie('user_role').value === 'technician') {
    loadAssigned()
    assignedTimer = setInterval(loadAssigned, 10000)
  }
  // load surveys for users
  if (useCookie('user_role').value === 'user') {
    loadMySurveys()
    mySurveysTimer = setInterval(loadMySurveys, 10000)
  }
})



// Assigned-to-me banner logic (technician only)
const assigned = ref(null)
const assignedLoading = ref(false)
let assignedTimer: ReturnType<typeof setInterval> | undefined

const isTechnician = computed(() => useCookie('user_role').value === 'technician')

const loadAssigned = async () => {
  try {
    assignedLoading.value = true
    const data = await getAssignedToMe()
    // backend may return array or single item
    if (Array.isArray(data)) assigned.value = data[0] ?? null
    else assigned.value = data ?? null
  } catch (err) {
    console.error('Failed to load assigned ticket', err)
    assigned.value = null
  } finally {
    assignedLoading.value = false
  }
}

const respond = async (choice: 'accepted' | 'rejected') => {
  if (!assigned.value) return
  try {
    assignedLoading.value = true
    const ticketId = assigned.value.ticket_id ?? assigned.value.id ?? assigned.value._id
    if (choice === 'accepted') await acceptAssignment(ticketId)
    else await rejectAssignment(ticketId)
    assigned.value = null
  } catch (err) {
    console.error('Failed to respond to assignment', err)
  } finally {
    assignedLoading.value = false
  }
}

// My-surveys check for users
const mySurveys = ref<any[]>([])
const mySurveysLoading = ref(false)
let mySurveysTimer: ReturnType<typeof setInterval> | undefined

const isUser = computed(() => useCookie('user_role').value === 'user')

const loadMySurveys = async () => {
  try {
    mySurveysLoading.value = true
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try { bearer = decodeURIComponent(bearer) } catch {}
    const res = await fetch('http://localhost:8000/api/tickets/my-surveys', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`
      }
    })
    const raw = await res.json()
    if (!res.ok) throw raw
    mySurveys.value = Array.isArray(raw?.data) ? raw.data : []
  } catch (err) {
    console.error('Failed to load my-surveys', err)
    mySurveys.value = []
  } finally {
    mySurveysLoading.value = false
  }
}

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (assignedTimer) clearInterval(assignedTimer)
  if (mySurveysTimer) clearInterval(mySurveysTimer)
  try { stopSSE() } catch (e) {}
})
</script>
<template>
  <UDashboardNavbar :title="title || 'Dashboard'" :icon="icon || 'i-lucide-house'" class="w-full">
    <template #right>
      <UPopover :popper="{ placement: 'bottom-end' }">
        <template #default>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-bell">
            <UChip v-if="unreadCount" color="error" inset />
          </UButton>
        </template>
        <template #content>
          <div class="p-4 w-80">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900">Notifications</h3>
              <UButton size="xs" color="neutral" variant="ghost" label="Mark all read" @click="handleMarkAllRead" />
            </div>
            <div v-if="isLoading" class="text-sm text-gray-500">Loading...</div>
            <div v-else-if="!notifications.length" class="text-sm text-gray-500">No notifications</div>
            <div v-else class="space-y-3">
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="flex gap-3 text-sm cursor-pointer"
                :class="{ 'opacity-75': !notification.unread }"
                @click="handleNotificationClick(notification)"
              >
                <div class="mt-1">
                  <div class="w-2 h-2 rounded-full" :class="notification.unread ? 'bg-primary-500' : 'bg-transparent'" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ notification.title }}</p>
                  <p class="text-gray-500 text-xs mt-0.5">{{ notification.description }}</p>
                  <p class="text-gray-400 text-xs mt-1">{{ notification.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UPopover>
    </template>
  </UDashboardNavbar>
  <!-- Pending survey prompt for users -->
  <div v-if="isUser && mySurveys && mySurveys.length" class="w-full bg-green-50 border-t border-green-100">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <div class="text-sm text-green-900">
        <strong>Survey pending</strong>
        <div class="text-xs text-green-800">Ticket: {{ mySurveys[0].ticket_id ?? mySurveys[0].ticket ?? mySurveys[0].id }}</div>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink :to="`/user/survey/${mySurveys[0].ticket_id ?? mySurveys[0].ticket ?? mySurveys[0].id}`">
          <UButton color="primary" size="sm">Fill Survey</UButton>
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- Assigned ticket prompt for technicians -->
  <div v-if="isTechnician && assigned" class="w-full bg-yellow-50 border-t border-yellow-100">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <div class="text-sm text-yellow-900">
        <strong>Ticket assigned to you</strong>
        <div class="text-xs text-yellow-800">Ticket: {{ assigned.ticket_id ?? assigned.id ?? assigned._id }}</div>
      </div>
      <div class="flex items-center gap-2">
        <UButton color="success" size="sm" :loading="assignedLoading" @click="respond('accepted')">Accept</UButton>
        <UButton color="danger" size="sm" :loading="assignedLoading" @click="respond('rejected')">Reject</UButton>
      </div>
    </div>
  </div>
</template>