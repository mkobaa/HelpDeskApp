# Frontend Components - Detailed Refactor Guide

**Generated**: January 28, 2026  
**Focus**: Component-by-component improvement recommendations

---

## 📁 Component Analysis by File

### `/components/ticketsTable.vue` (202 lines)

#### Issues Found:
1. **Complex pagination logic** (61 lines) - Should be extracted
2. **Duplicate helper functions** (prioritiesClass, statusClass, statusLabel, formatDate)
3. **Complex data normalization** (15 lines of nested checks)
4. **Non-standard useAsyncData key** - Using template string can cause cache issues

#### Current Code Smells:
```javascript
// Issue 1: Template string key with multiple dependencies
const { data: ticketsRaw } = useAsyncData(
  () => `tickets-page-${currentPage.value}-${props.filters?.status || ''}-${props.filters?.priority || ''}-${props.filters?.category_id || ''}`,
  // This creates too many cache keys!
)

// Issue 2: Overly complex pagination extraction
watch(ticketsRaw, (v) => {
  if (!v) { /* ... */ return }
  const meta = v?.data?.meta || v?.meta || v?.pagination || v?.data || null
  if (meta && (meta.total || meta.last_page || /* ... */)) {
    total.value = meta.total ?? meta.total_items ?? total.value
    lastPage.value = meta.last_page ?? meta.lastPage ?? meta.total_pages ?? 
      (meta.total && (meta.per_page ?? perPage.value) ? 
        Math.ceil((meta.total)/(meta.per_page ?? perPage.value)) : lastPage.value)
    // ... continues
  }
})

// Issue 3: Duplicate badge logic
const prioritiesClass = (s) => {
  const map = { low: 'bg-green-100 text-green-800', /* ... */ }
  return map[String(s)] || 'bg-gray-50 text-gray-700'
}
```

#### Refactor Plan:
```vue
<!-- AFTER REFACTOR -->
<script setup lang="ts">
import { useTicketFormatters } from '~/composables/useTicketFormatters'
import { usePagination } from '~/composables/usePagination'
import { normalizeArrayResponse } from '~/utils/normalize'
import { useRoleRoutes } from '~/composables/useRoleRoutes'

const props = defineProps<{
  filters?: TicketFilters
  forceStatus?: string
}>()

// Use composables
const { getPriorityClass, getStatusClass, formatLabel, formatDate } = useTicketFormatters()
const { ticketsBasePath } = useRoleRoutes()
const { 
  currentPage, 
  perPage, 
  total, 
  lastPage, 
  prevPage, 
  nextPage, 
  goToPage,
  extractPagination 
} = usePagination()

// Simplified data fetching
const { data: ticketsRaw, status, refresh } = useAsyncData(
  'tickets', // Simple constant key
  () => getTickets({ 
    ...props.filters, 
    status: props.filters?.status ?? props.forceStatus,
    page: currentPage.value, 
    per_page: perPage.value,
    _raw: true 
  }),
  {
    watch: [
      () => props.filters, 
      () => currentPage.value
    ]
  }
)

// Simplified normalization
const data = computed(() => normalizeArrayResponse(ticketsRaw.value))

// Auto-extract pagination from response
watch(ticketsRaw, (v) => extractPagination(v))
</script>

<template>
  <UTable :data="data" :columns="columns" :loading="status === 'pending'">
    <template #priority-cell="{ row }">
      <UBadge :class="getPriorityClass(row.original.priority)">
        {{ formatLabel(row.original.priority) }}
      </UBadge>
    </template>
    <template #status-cell="{ row }">
      <UBadge :class="getStatusClass(row.original.status)">
        {{ formatLabel(row.original.status) }}
      </UBadge>
    </template>
    <template #created_at-cell="{ row }">
      {{ formatDate(row.original.created_at) }}
    </template>
    <template #actions-cell="{ row }">
      <UButton size="xs" :to="`${ticketsBasePath}/${row.original.id}`">
        View
      </UButton>
    </template>
  </UTable>
  
  <!-- Pagination component -->
  <PaginationControls 
    v-model:page="currentPage"
    :last-page="lastPage"
    :total="total"
    :per-page="perPage"
    @prev="prevPage"
    @next="nextPage"
  />
</template>
```

**Lines Saved**: ~80 lines  
**Reusability**: 5+ other components can use same composables

---

### `/components/TechnicianTickets.vue` (128 lines)

#### Issues Found:
1. **Identical helper functions** to ticketsTable.vue (60+ lines)
2. **Non-reactive role link** (should be computed)
3. **Missing pagination** (API might return paginated data)
4. **await in useAsyncData** with `lazy: false` (anti-pattern)

#### Current Code Problems:
```javascript
// Problem 1: await with lazy:false is redundant
const { data: tickets, status, refresh } = await useAsyncData(
  'tickets',
  () => props.technicianId ? getAssignedTickets(props.technicianId) : getAssignedTickets(''),
  {
    watch: [() => props.filters, () => props.technicianId],
    server: false,
    lazy: false,  // ← Redundant with await
    default: () => []
  }
)

// Problem 2: Non-reactive link
const role = useCookie('role')  // Wrong cookie name!
let link = ''  // Not reactive
if (role.value === 'technician') {
  link = '/technician/tickets/'
}
```

#### Refactor Plan:
```vue
<script setup lang="ts">
import { useTicketFormatters } from '~/composables/useTicketFormatters'
import { useRoleRoutes } from '~/composables/useRoleRoutes'

const props = defineProps<{
  technicianId?: string
  filters?: TicketFilters
}>()

const { getPriorityClass, getStatusClass, formatLabel } = useTicketFormatters()
const { ticketsBasePath } = useRoleRoutes()

// Remove await if lazy: false
const { data: tickets, status, refresh } = useAsyncData(
  'assigned-tickets',
  () => getAssignedTickets(props.technicianId || ''),
  {
    watch: [() => props.filters, () => props.technicianId],
    server: false,
    default: () => []
  }
)

const data = computed(() => normalizeArrayResponse(tickets.value))
</script>
```

**Lines Saved**: ~60 lines  
**Fixed Issues**: Reactive routing, consistent cookie usage

---

### `/components/SupervisorDashboard.vue` (132 lines)

#### Issues Found:
1. **Aggressive polling** (5 seconds)
2. **No visibility API** (polls even when tab inactive)
3. **No error handling** for failed API calls
4. **Reactive array mutation** (should use proper updates)

#### Current Problems:
```javascript
// Problem 1: Too frequent polling
onMounted(() => {
  fetchStats()
  intervalId = setInterval(fetchStats, 5000)  // Every 5 seconds!
})

// Problem 2: Direct mutation of reactive array
const openCard = cards.find(c => c.key === 'open')
if (openCard) openCard.value = open  // Mutating reactive object
```

#### Refactor Plan:
```vue
<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { useDocumentVisibility } from '@vueuse/core'

const cards = ref([
  { key: 'open', label: 'Open tickets', value: 0, /* ... */ },
  { key: 'pending', label: 'Pending tickets', value: 0, /* ... */ },
  { key: 'closed', label: 'Closed tickets', value: 0, /* ... */ }
])

const visibility = useDocumentVisibility()
const loading = ref(false)
const error = ref<string | null>(null)

const fetchStats = async () => {
  if (visibility.value !== 'visible') return  // Don't poll when hidden
  
  loading.value = true
  error.value = null
  
  try {
    const [open, pending, closed] = await Promise.all([
      getOpenTickets(),
      getPendingTickets(),
      getClosedTickets()
    ])
    
    // Proper reactive update
    cards.value = cards.value.map(card => {
      const values = { open, pending, closed }
      return { ...card, value: values[card.key] ?? card.value }
    })
  } catch (err) {
    error.value = 'Failed to fetch dashboard stats'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Better polling with pause/resume
const { pause, resume } = useIntervalFn(
  fetchStats, 
  30_000,  // 30 seconds instead of 5
  { immediate: true }
)

// Pause when document hidden
watch(visibility, (current) => {
  if (current === 'visible') resume()
  else pause()
})
</script>

<template>
  <section class="space-y-4">
    <UAlert v-if="error" color="red" :description="error" />
    
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="card in cards" :key="card.key" :loading="loading">
        <!-- Card content -->
      </UCard>
    </div>
  </section>
</template>
```

**Performance Gain**: 6x reduction in API calls (30s vs 5s)  
**UX Improvement**: No wasted calls when tab hidden

---

### `/components/TicketComments.vue` (87 lines)

#### Issues Found:
1. **Manual watch on props** (should use `watch` properly)
2. **No optimistic updates** (slow UX when posting)
3. **Simple loading text** instead of skeleton
4. **Array manipulation** (unshift instead of proper reactive update)

#### Current Issues:
```javascript
// Issue 1: Manual loading in load function
const load = async () => {
  if (!props.ticketId) return
  loading.value = true  // Manual
  try {
    const data = await getComments(String(props.ticketId))
    comments.value = Array.isArray(data) ? data : (data?.data || [])
  } catch (e) {
    console.error('Failed to load comments', e)
  } finally {
    loading.value = false  // Manual
  }
}

// Issue 2: Direct mutation with unshift
const postComment = async () => {
  // ...
  const res = await addComment(String(props.ticketId), payload)
  const created = res?.data ? res.data : res
  if (created) comments.value.unshift(created)  // Mutating
}
```

#### Refactor Plan:
```vue
<script setup lang="ts">
const props = defineProps<{ ticketId: string | number }>()

const { 
  data: comments, 
  status, 
  refresh 
} = await useAsyncData(
  () => `comments-${props.ticketId}`,
  () => getComments(String(props.ticketId)),
  {
    watch: [() => props.ticketId],
    default: () => []
  }
)

const newComment = ref('')
const posting = ref(false)
const isUserVisible = ref(true)

const postComment = async () => {
  if (!newComment.value || posting.value) return
  
  const tempId = Date.now()
  const optimisticComment = {
    id: tempId,
    content: newComment.value,
    created_at: new Date().toISOString(),
    username: 'You'
  }
  
  // Optimistic update
  comments.value = [optimisticComment, ...comments.value]
  const originalValue = newComment.value
  newComment.value = ''
  
  posting.value = true
  try {
    await addComment(String(props.ticketId), {
      content: originalValue,
      is_user_visible: isUserVisible.value
    })
    await refresh()  // Get real data
  } catch (e) {
    // Rollback on error
    comments.value = comments.value.filter(c => c.id !== tempId)
    newComment.value = originalValue
    console.error('Failed to post comment', e)
  } finally {
    posting.value = false
  }
}
</script>

<template>
  <UCard>
    <h3 class="text-lg font-semibold mb-3">Comments</h3>
    
    <!-- Better loading state -->
    <div v-if="status === 'pending'" class="space-y-3">
      <USkeleton v-for="i in 3" :key="i" class="h-20 w-full" />
    </div>
    
    <div v-else class="space-y-3 max-h-80 overflow-y-auto">
      <div v-if="!comments.length" class="text-sm text-muted">
        No comments yet
      </div>
      <CommentItem 
        v-for="c in comments" 
        :key="c.id" 
        :comment="c" 
      />
    </div>
    
    <CommentForm 
      v-model="newComment"
      v-model:visible="isUserVisible"
      :posting="posting"
      :can-set-visibility="canSetVisibility"
      @submit="postComment"
    />
  </UCard>
</template>
```

**UX Improvement**: Instant feedback with optimistic updates  
**Code Quality**: Proper separation of concerns

---

### `/pages/user/tickets/create.vue` (270 lines)

#### Issues Found:
1. **Massive component** - Does too much
2. **Complex file upload logic** inline (60+ lines)
3. **Category search debouncing** logic mixed with component
4. **No composables** - All logic in one place

#### Complexity Breakdown:
- Form state: 15 lines
- File upload + drag-drop: 60 lines
- Category search: 40 lines
- Preview generation: 30 lines
- Submit logic: 20 lines
- Template: 105 lines

#### Refactor Plan:

**Split into 4 files:**

```typescript
// /composables/useFileUpload.ts (50 lines)
export function useFileUpload(maxSizeMB = 10) {
  const files = ref<File[]>([])
  const previews = ref<Preview[]>([])
  const error = ref('')
  const dragActive = ref(false)
  
  const updatePreviews = () => {
    previews.value = files.value.map(file => ({
      url: URL.createObjectURL(file),
      type: getFileType(file),
      name: file.name
    }))
  }
  
  const handleFiles = (fileList: File[]) => {
    const invalid = fileList.find(f => f.size > maxSizeMB * 1024 * 1024)
    if (invalid) {
      error.value = `Files must be less than ${maxSizeMB}MB`
      return false
    }
    files.value = fileList
    updatePreviews()
    return true
  }
  
  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    dragActive.value = false
    if (e.dataTransfer?.files) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }
  
  return { 
    files, 
    previews, 
    error, 
    dragActive,
    handleFiles, 
    handleDrop 
  }
}

// /composables/useCategorySearch.ts (60 lines)
export function useCategorySearch() {
  const search = ref('')
  const options = ref<Category[]>([])
  const selected = ref<Category | null>(null)
  const loading = ref(false)
  
  const debouncedSearch = useDebounceFn(async (query: string) => {
    if (!query || query.length < 2) {
      options.value = []
      return
    }
    
    loading.value = true
    try {
      const res = await suggestCategories(query)
      options.value = normalizeArrayResponse(res, 'categories')
    } catch (err) {
      options.value = []
    } finally {
      loading.value = false
    }
  }, 300)
  
  const onInput = (value: string) => {
    search.value = value
    selected.value = null
    debouncedSearch(value)
  }
  
  const select = (category: Category) => {
    selected.value = category
    search.value = category.name
    options.value = []
  }
  
  return {
    search,
    options,
    selected,
    loading,
    onInput,
    select
  }
}

// /components/forms/FileUploadZone.vue (80 lines)
<script setup lang="ts">
const props = defineProps<{
  maxSizeMB?: number
  accept?: string
}>()

const emit = defineEmits<{
  'update:files': [files: File[]]
}>()

const { 
  files, 
  previews, 
  error, 
  dragActive, 
  handleFiles, 
  handleDrop 
} = useFileUpload(props.maxSizeMB)

watch(files, (newFiles) => emit('update:files', newFiles))
</script>

<template>
  <div>
    <div
      class="border-2 border-dashed rounded-md p-6 transition-colors cursor-pointer"
      :class="dragActive ? 'border-primary bg-primary/10' : 'border-gray-300'"
      @dragover.prevent="dragActive = true"
      @dragleave.prevent="dragActive = false"
      @drop="handleDrop"
      @click="$refs.fileInput.click()"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        :accept="accept"
        class="hidden"
        @change="(e) => handleFiles(Array.from(e.target.files))"
      />
      <slot :drag-active="dragActive" />
    </div>
    
    <UAlert v-if="error" color="red" class="mt-2">{{ error }}</UAlert>
    
    <FilePreviewList v-if="previews.length" :previews="previews" />
  </div>
</template>

// /pages/user/tickets/create.vue (NOW 120 lines instead of 270)
<script setup lang="ts">
const form = reactive({
  title: '',
  description: '',
  priority: '',
  status: ''
})

const { files, handleFiles } = useFileUpload(10)
const { search, options, selected, onInput, select } = useCategorySearch()

const isSubmitting = ref(false)
const router = useRouter()

// Auto-suggest categories based on title
watchDebounced(
  () => form.title,
  (val) => {
    if (!selected.value && val.length >= 2) {
      onInput(val)
    }
  },
  { debounce: 300 }
)

const handleCreate = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  
  try {
    await createTicket({
      ...form,
      category_id: selected.value?.id,
      attachments: files.value
    })
    router.push('/user/tickets')
  } catch (error) {
    console.error('Failed to create ticket', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage>
      <Navbar title="Create ticket" icon="i-lucide-ticket-plus" />
      
      <div class="p-6">
        <UForm :state="form" @submit="handleCreate" class="max-w-3xl space-y-4">
          <UFormGroup label="Title" name="title">
            <UInput v-model="form.title" required maxlength="255" />
          </UFormGroup>
          
          <UFormGroup label="Description" name="description">
            <UTextarea v-model="form.description" rows="6" maxlength="2000" />
          </UFormGroup>
          
          <UFormGroup label="Priority" name="priority">
            <USelect v-model="form.priority" :options="priorityOptions" />
          </UFormGroup>
          
          <CategorySearchInput
            v-model:search="search"
            v-model:selected="selected"
            :options="options"
            @input="onInput"
            @select="select"
          />
          
          <FileUploadZone v-model:files="files" />
          
          <div class="flex justify-end gap-3">
            <UButton variant="ghost" to="/user/tickets">Cancel</UButton>
            <UButton type="submit" :loading="isSubmitting">Create</UButton>
          </div>
        </UForm>
      </div>
    </UDashboardPage>
  </UDashboardGroup>
</template>
```

**Lines Saved**: 150 lines moved to reusable composables/components  
**Reusability**: File upload and category search now reusable across app  
**Testability**: Each piece can be unit tested independently

---

### `/pages/supervisor/reports/index.vue` (233 lines)

#### Issues Found:
1. **God component** - Handles fetching, transformation, charts, exports
2. **Manual URL building** instead of using API client
3. **Duplicate data transformation** logic
4. **Complex state management**

#### Refactor Plan:

```typescript
// /composables/useReportData.ts
export function useReportData() {
  const filters = ref({
    range: '7',
    status: '',
    priority: '',
    technician: ''
  })
  
  const { data: tickets, status, refresh } = useAsyncData(
    'report-tickets',
    () => getTickets(filters.value),
    { watch: [filters] }
  )
  
  const { data: avgResolution } = useAsyncData(
    'report-avg-resolution',
    () => getAverageResolutionTime(filters.value),
    { watch: [filters] }
  )
  
  const { data: resolvedOverTime } = useAsyncData(
    'report-resolved-over-time',
    () => getTicketsResolvedOverTime(filters.value),
    { watch: [filters] }
  )
  
  return {
    filters,
    tickets,
    avgResolution,
    resolvedOverTime,
    loading: computed(() => status.value === 'pending'),
    refresh
  }
}

// /composables/useReportExport.ts
export function useReportExport(tickets: Ref<Ticket[]>) {
  const downloadCSV = () => {
    const csv = tickets.value.map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      // ...
    }))
    const blob = new Blob([generateCSV(csv)], { type: 'text/csv' })
    downloadBlob(blob, 'reports.csv')
  }
  
  const exportPDF = () => {
    // PDF export logic
  }
  
  return { downloadCSV, exportPDF }
}

// /pages/supervisor/reports/index.vue (NOW 80 lines)
<script setup lang="ts">
const {
  filters,
  tickets,
  avgResolution,
  resolvedOverTime,
  loading,
  refresh
} = useReportData()

const { downloadCSV, exportPDF } = useReportExport(tickets)
</script>

<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage>
      <Navbar title="Reports" />
      
      <div class="p-6 space-y-6">
        <div class="flex justify-between items-center">
          <UDashboardPageHeader 
            title="Reports / Analytics" 
            description="Key metrics and trends"
          />
          <ReportsExportButtons 
            @csv="downloadCSV" 
            @pdf="exportPDF" 
          />
        </div>
        
        <ReportsFilterBar 
          v-model="filters"
          @apply="refresh"
        />
        
        <ReportsKPICards 
          :tickets="tickets"
          :avg-resolution="avgResolution"
        />
        
        <ReportsCharts 
          :resolved-over-time="resolvedOverTime"
        />
      </div>
    </UDashboardPage>
  </UDashboardGroup>
</template>
```

**Complexity Reduced**: From 233 lines to 80 lines  
**Testability**: Business logic in composables, easy to test  
**Performance**: Parallel data fetching with useAsyncData

---

### `/pages/[role]/tickets/[id].vue` (Multiple similar files)

#### Issues Found:
1. **98% duplicate code** between user/technician/supervisor versions
2. **Each has 300+ lines** with minor differences
3. **Same bugs duplicated** across all three

#### Current Situation:
```
/pages/user/tickets/[id].vue          (310 lines)
/pages/technician/tickets/[id].vue    (305 lines)
/pages/supervisor/tickets/[id].vue    (Similar)
```

**Differences**:
- Supervisor can edit all fields
- Technician can edit status only
- User is view-only

#### Refactor Plan:

```vue
<!-- /components/ticket/TicketDetails.vue -->
<script setup lang="ts">
const props = defineProps<{
  ticketId: string
  canEdit?: boolean
  canEditStatus?: boolean
  canEditPriority?: boolean
  canAssignTechnician?: boolean
}>()

const { ticket, loading, error, refresh } = useTicket(props.ticketId)
const { elapsed } = useTicketTimer(ticket)
const { attachments } = useAttachments(ticket)
const { isEditing, form, save, cancel } = useTicketEdit(ticket, {
  canEditStatus: props.canEditStatus,
  canEditPriority: props.canEditPriority,
  canAssignTechnician: props.canAssignTechnician
})

// ... logic
</script>

<template>
  <UCard :loading="loading">
    <TicketInfo 
      v-if="!isEditing"
      :ticket="ticket"
      :elapsed="elapsed"
      :attachments="attachments"
    />
    <TicketEditForm 
      v-else
      v-model="form"
      :ticket="ticket"
      :can-edit-status="canEditStatus"
      :can-edit-priority="canEditPriority"
      :can-assign-technician="canAssignTechnician"
      @save="save"
      @cancel="cancel"
    />
  </UCard>
</template>

<!-- /pages/user/tickets/[id].vue (NOW 40 lines) -->
<script setup lang="ts">
const route = useRoute()
const ticketId = computed(() => route.params.id as string)
</script>

<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage>
      <Navbar title="Ticket" />
      <TicketDetails 
        :ticket-id="ticketId" 
        :can-edit="false"
      />
      <TicketComments :ticket-id="ticketId" />
    </UDashboardPage>
  </UDashboardGroup>
</template>

<!-- /pages/technician/tickets/[id].vue (40 lines) -->
<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage>
      <Navbar title="Ticket" />
      <TicketDetails 
        :ticket-id="ticketId" 
        :can-edit-status="true"
      />
      <TicketComments :ticket-id="ticketId" />
    </UDashboardPage>
  </UDashboardGroup>
</template>

<!-- /pages/supervisor/tickets/[id].vue (45 lines) -->
<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage>
      <Navbar title="Ticket" />
      <TicketDetails 
        :ticket-id="ticketId" 
        :can-edit="true"
        :can-edit-status="true"
        :can-edit-priority="true"
        :can-assign-technician="true"
      />
      <TicketComments :ticket-id="ticketId" />
    </UDashboardPage>
  </UDashboardGroup>
</template>
```

**Lines Saved**: ~600 lines of duplicate code eliminated  
**Maintainability**: One source of truth for ticket detail logic  
**Bug Prevention**: Fix once, fixes everywhere

---

## 📊 Summary: Before vs After

| Component | Before | After | Saved | Reusability |
|-----------|--------|-------|-------|-------------|
| ticketsTable.vue | 202 | 120 | 82 | High |
| TechnicianTickets.vue | 128 | 70 | 58 | High |
| SupervisorDashboard.vue | 132 | 90 | 42 | Medium |
| TicketComments.vue | 87 | 60 | 27 | Medium |
| user/tickets/create.vue | 270 | 120 | 150 | High |
| reports/index.vue | 233 | 80 | 153 | High |
| [role]/tickets/[id].vue × 3 | 900 | 300 | 600 | Very High |
| **Total** | **1,952** | **840** | **1,112** | |

**Total Reduction**: 57% fewer lines across major components  
**New Reusable Assets**: 
- 8 composables
- 6 utility functions
- 4 new components

---

## 🎯 Implementation Priority

### Week 1: Foundation
- [ ] Create useTicketFormatters composable
- [ ] Create usePagination composable
- [ ] Create normalize utilities
- [ ] Create useRoleRoutes composable

### Week 2: Extract Complex Logic
- [ ] Create useFileUpload composable
- [ ] Create useCategorySearch composable
- [ ] Create useTicket composable
- [ ] Create useAttachments composable

### Week 3: Refactor Large Components
- [ ] Refactor ticketsTable.vue
- [ ] Refactor TechnicianTickets.vue
- [ ] Refactor create.vue pages
- [ ] Refactor reports/index.vue

### Week 4: Consolidate Duplicates
- [ ] Create shared TicketDetails component
- [ ] Consolidate [role]/tickets/[id].vue files
- [ ] Improve SupervisorDashboard
- [ ] Add optimistic updates to TicketComments

---

**End of Component Analysis**
