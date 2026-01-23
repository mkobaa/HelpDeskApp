<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getTicketById } from '~/api/tickets/tickets'
import Ratings from './Ratings.vue'
import Comments from './Comments.vue'
import SubmitButtons from './SubmitButtons.vue'
import SuccessBanner from './SuccessBanner.vue'

const route = useRoute()
const router = useRouter()
const ticketIdParam = route.params.id || ''

const ticket = ref(null)
const loadingTicket = ref(false)

const fetchTicket = async () => {
  if (!ticketIdParam) return
  loadingTicket.value = true
  try {
    ticket.value = await getTicketById(ticketIdParam)
  } catch (e) {
    ticket.value = null
  } finally {
    loadingTicket.value = false
  }
}

onMounted(fetchTicket)

const formatDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  return d.toLocaleString()
}

const form = ref({
  ticket_id: ticketIdParam || '',
  satisfaction_rating: 5,
  response_time_rating: 5,
  resolution_quality_rating: 5,
  comments: ''
})

const errors = ref<any>({})
const submitting = ref(false)
const successMessage = ref('')

const validate = () => {
  errors.value = {}
  const between = (v) => Number(v) >= 1 && Number(v) <= 5
  if (!between(form.value.satisfaction_rating)) errors.value.satisfaction_rating = 'Required (1-5)'
  if (!between(form.value.response_time_rating)) errors.value.response_time_rating = 'Required (1-5)'
  if (!between(form.value.resolution_quality_rating)) errors.value.resolution_quality_rating = 'Required (1-5)'
  return Object.keys(errors.value).length === 0
}

const submit = async () => {
  if (!validate()) return
  submitting.value = true
  try {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try { bearer = decodeURIComponent(bearer) } catch {}

    const payload = {
      satisfaction_rating: Number(form.value.satisfaction_rating),
      response_time_rating: Number(form.value.response_time_rating),
      resolution_quality_rating: Number(form.value.resolution_quality_rating),
      comments: form.value.comments
    }

    const ticketId = ticket.value?.id || form.value.ticket_id || ticketIdParam
    const url = `http://localhost:8000/api/tickets/${encodeURIComponent(ticketId)}/survey`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`
      },
      body: JSON.stringify(payload)
    })

    const raw = await res.json()
    if (!res.ok) throw raw

    successMessage.value = 'Thank you — your feedback has been submitted.'
    setTimeout(() => router.push('/user/tickets'), 1400)
  } catch (err) {
    console.error('submit survey', err)
    errors.value.form = err?.message || 'Submission failed'
  } finally {
    submitting.value = false
  }
}

</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-muted-500">User</p>
        <h2 class="text-lg font-semibold text-gray-900">Ticket Survey</h2>
        <p class="text-sm text-muted-500">Please provide feedback for the selected ticket.</p>
      </div>
      <SuccessBanner :message="successMessage" />
    </div>

    <UCard>
      <form @submit.prevent="submit" class="space-y-6">
        <div>
          <div v-if="loadingTicket" class="py-4">Loading ticket...</div>
          <div v-else-if="ticket" class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-500">Ticket</p>
              <p class="text-base font-semibold">{{ ticket.id }} - {{ ticket.title || ticket.subject }}</p>
              <p class="text-sm text-muted-500">{{ ticket.status }} • {{ formatDate(ticket.created_at) }}</p>
            </div>
            <div class="text-sm text-muted-500">Ticket provided by system</div>
          </div>
          <div v-else class="text-sm text-red-600">Ticket information not available.</div>
        </div>

        <div>
          <p class="text-sm font-semibold text-gray-700 mb-2">Ratings</p>
          <div class="grid gap-4 sm:grid-cols-3">
            <Ratings label="Satisfaction" v-model="form.satisfaction_rating" />
            <Ratings label="Response time" v-model="form.response_time_rating" />
            <Ratings label="Resolution quality" v-model="form.resolution_quality_rating" />
          </div>
        </div>

        <Comments v-model="form.comments" :maxLength="1000" />

        <div>
          <div v-if="errors.form" class="text-sm text-red-600 mb-2">{{ errors.form }}</div>
          <SubmitButtons :loading="submitting" @submit="submit" @cancel="$router.back()" />
        </div>
      </form>
    </UCard>
  </div>
</template>
