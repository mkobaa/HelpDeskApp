<template>
  <UCard class="mt-4">
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-3">Comments</h3>
      <div class="space-y-3">
        <div v-if="loading" class="text-sm text-gray-500">Loading comments...</div>
        <div v-else>
          <div class="space-y-3 max-h-80 overflow-y-auto pr-2">
            <div v-if="!comments.length" class="text-sm text-gray-500">No comments yet</div>
            <div v-else class="space-y-3">
              <div v-for="c in comments" :key="c.id" class="p-3 border rounded">
                <div class="text-sm text-gray-800 whitespace-pre-line">{{ c.content }}</div>
                <div class="text-xs text-gray-400 mt-1">by {{ c.user_id ? `User #${c.username}` : (c.user?.name || 'Unknown') }} • {{ c.created_at ? formatDate(c.created_at) : (c.updated_at ? formatDate(c.updated_at) : '') }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-2">
          <UFormGroup label="Add comment" name="comment">
            <UInput v-model="newComment" placeholder="Write a comment..." />
          </UFormGroup>

          <div v-if="canSetVisibility" class="mt-2">
            <UFormGroup label="Visibility" name="visibility">
              <USelect v-model="isUserVisible" :items="[{ label: 'Public', value: true }, { label: 'Private', value: false }]" />
            </UFormGroup>
          </div>
          <div class="flex justify-end gap-2 mt-2">
            <UButton size="sm" color="neutral" variant="ghost" @click="newComment = ''">Cancel</UButton>
            <UButton size="sm" color="primary" :loading="posting" @click="postComment">Post</UButton>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useCookie } from 'nuxt/app'
import { getComments, addComment } from '~/api/comments/comments'

const props = defineProps({
  ticketId: {
    type: [String, Number],
    required: true
  }
})
const comments = ref([])
const loading = ref(false)
const newComment = ref('')
const posting = ref(false)
const isUserVisible = ref(true)

const userRoleCookie = useCookie('user_role')
const userRole = computed(() => String(userRoleCookie?.value || '').toLowerCase())
const canSetVisibility = computed(() => ['supervisor', 'technician'].includes(userRole.value))

const load = async () => {
  if (!props.ticketId) return
  loading.value = true
  try {
    const data = await getComments(String(props.ticketId))
    comments.value = Array.isArray(data) ? data : (data?.data || [])
  } catch (e) {
    console.error('Failed to load comments', e)
  } finally {
    loading.value = false
  }
}

const postComment = async () => {
  if (!newComment.value || posting.value) return
  posting.value = true
  try {
    const payload = { content: newComment.value, is_user_visible: Boolean(isUserVisible.value) }
    const res = await addComment(String(props.ticketId), payload)
    const created = res?.data ? res.data : res
    if (created) comments.value.unshift(created)
    newComment.value = ''
    isUserVisible.value = true
  } catch (e) {
    console.error('Failed to post comment', e)
  } finally {
    posting.value = false
  }
}

const formatDate = (iso) => new Date(iso).toLocaleString()

onMounted(load)
watch(() => props.ticketId, () => load())
</script>
