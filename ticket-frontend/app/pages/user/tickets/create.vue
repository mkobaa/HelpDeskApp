<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import suggestCategories from '~/api/categories/suggest'
import { createTicket } from '~/api/tickets/createTicket'
import { useRouter } from '#imports'


const form = reactive({
	title: '',
	description: '',
    priority: '',
    status: '',
    category_id: null,
    submitter_id: null,
    assigned_to_id: null
})


const priorityOptions = ref([
  'low', 'medium', 'critical'
])



const isSubmitting = ref(false)
const router = useRouter()

const attachments = ref([])
const previews = ref([])
const dragActive = ref(false)
const uploadError = ref('')
const categorySearch = ref('')
const categoryOptions = ref([])
const categoryLoading = ref(false)
let categoryDebounce: ReturnType<typeof setTimeout> | null = null
const selectedCategoryId = ref<number|null>(null)
const selectedCategoryName = ref('')
let titleDebounce: ReturnType<typeof setTimeout> | null = null
const updatePreviews = () => {
	previews.value = attachments.value.map(file => {
		if (file.type.startsWith('image/')) {
			return { url: URL.createObjectURL(file), type: 'image', name: file.name };
		} else if (file.type === 'application/pdf') {
			return { url: URL.createObjectURL(file), type: 'pdf', name: file.name };
		}
		return { url: '', type: 'other', name: file.name };
	});
}
const handleFileChange = (event) => {
	const files = Array.from(event.target.files || [])
	const invalid = files.find(f => f.size > 10 * 1024 * 1024)
	if (invalid) {
		uploadError.value = 'Each file must be less than 10MB.'
		attachments.value = []
		previews.value = []
		return
	}
	uploadError.value = ''
	attachments.value = files
	updatePreviews()
}
const handleDrop = (event) => {
	event.preventDefault()
	dragActive.value = false
	if (event.dataTransfer?.files) {
		const files = Array.from(event.dataTransfer.files)
		const invalid = files.find(f => f.size > 10 * 1024 * 1024)
		if (invalid) {
			uploadError.value = 'Each file must be less than 10MB.'
			attachments.value = []
			previews.value = []
			return
		}
		uploadError.value = ''
		attachments.value = files
		updatePreviews()
	}
}
const handleDragOver = (event) => {
	event.preventDefault()
	dragActive.value = true
}
const handleDragLeave = (event) => {
	event.preventDefault()
	dragActive.value = false
}
const searchCategories = async (q: string) => {
	categoryLoading.value = true
	try {
		const res = await suggestCategories(q)
		categoryOptions.value = Array.isArray(res) ? res : (res.data || res.categories || [])
	} catch (err) {
		categoryOptions.value = []
	} finally {
		categoryLoading.value = false
	}
}

const onCategoryInput = (e) => {
	categorySearch.value = e.target.value
	// clear previously selected id when user types
	selectedCategoryId.value = null
	selectedCategoryName.value = ''
	if (categoryDebounce) clearTimeout(categoryDebounce)
	categoryDebounce = setTimeout(() => searchCategories(categorySearch.value), 300)
}

// Suggest categories from the ticket title (debounced). Only run when user
// hasn't already selected a category.
watch(() => form.title, (val) => {
	if (selectedCategoryId.value) return
	if (titleDebounce) clearTimeout(titleDebounce)
	titleDebounce = setTimeout(() => {
		if (val && String(val).length >= 2) {
			// populate suggestions based on title text but don't overwrite user's
			// category input until they select one
			searchCategories(String(val))
		} else {
			categoryOptions.value = []
		}
	}, 300)
})

const selectCategory = (c) => {
	const id = c?.id ?? c?.value ?? null
	selectedCategoryId.value = id
	selectedCategoryName.value = c?.name || c?.title || c?.label || ''
	form.category_id = id
	categorySearch.value = selectedCategoryName.value
	categoryOptions.value = []
}

const clearCategory = () => {
	selectedCategoryId.value = null
	selectedCategoryName.value = ''
	categorySearch.value = ''
	form.category_id = null
	categoryOptions.value = []
}
const handleCreate = async () => {
	if (isSubmitting.value) return
	isSubmitting.value = true
	try {
		await createTicket({
			title: form.title,
			description: form.description,
			priority: form.priority,
			status: form.status,
			category_id: selectedCategoryId.value ?? null,
			submitter_id: form.submitter_id,
			assigned_to_id: form.assigned_to_id,
			attachments: attachments.value
		})
		await router.push('/user/tickets')
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
		<UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
			<Navbar title="Create Ticket" icon="i-lucide-ticket-plus" class="w-full" />
			<div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
				<div class="flex items-center justify-between gap-3">
					<UDashboardPageHeader 
						title="Create New Ticket" 
						description="Submit a new support request by filling out the form below." 
					/>
					<UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" to="/user/tickets">
						Back
					</UButton>
				</div>

				<form @submit.prevent="handleCreate">
					<!-- Ticket Details Card -->
					<UCard class="mb-6">
						<template #header>
							<div class="flex items-center gap-2">
								<span class="i-lucide-file-text text-lg text-primary" />
								<p class="text-sm font-semibold text-highlighted">Ticket Details</p>
							</div>
						</template>
						<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
							<UFormGroup label="Title" name="title" required class="sm:col-span-2">
								<UInput 
									v-model="form.title" 
									placeholder="Brief summary of your issue" 
									required 
									maxlength="255" 
									size="lg"
								/>
							</UFormGroup>
							<UFormGroup label="Description" name="description" class="sm:col-span-2">
								<UTextarea 
									v-model="form.description" 
									placeholder="Please describe your issue in detail. Include any relevant information that could help us resolve it faster." 
									rows="5" 
									class="resize-y" 
									maxlength="2000" 
								/>
								<template #hint>
									<span class="text-xs text-muted">{{ form.description?.length || 0 }} / 2000 characters</span>
								</template>
							</UFormGroup>
							<UFormGroup label="Priority" name="priority">
								<USelect
									v-model="form.priority"
									:items="priorityOptions"
									placeholder="Select priority level"
									size="lg"
								/>
							</UFormGroup>
							<UFormGroup label="Category" name="category_id">
								<div class="relative">
									<UInput
										:value="categorySearch"
										placeholder="Type to search categories..."
										@input="onCategoryInput"
										@focus="() => { if (!categorySearch) searchCategories('') }"
										aria-label="Search categories"
										size="lg"
									/>
									<div v-if="categoryLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
										<span class="i-lucide-loader-2 animate-spin text-muted" />
									</div>
									<div v-else-if="selectedCategoryId" class="absolute right-3 top-1/2 -translate-y-1/2">
										<button type="button" class="text-xs text-muted hover:text-highlighted flex items-center gap-1" @click="clearCategory">
											<span class="i-lucide-x text-sm" /> Clear
										</button>
									</div>
									<ul v-if="categoryOptions.length" class="absolute z-50 mt-1 w-full bg-elevated border border-default rounded-lg shadow-lg max-h-48 overflow-auto">
										<li 
											v-for="opt in categoryOptions" 
											:key="opt.id || opt.value" 
											class="px-4 py-2.5 hover:bg-accented cursor-pointer text-sm transition-colors first:rounded-t-lg last:rounded-b-lg" 
											@click="selectCategory(opt)"
										>
											{{ opt.name || opt.title || opt.label || opt.value }}
										</li>
									</ul>
									<div v-else-if="!selectedCategoryId && categorySearch.length >= 2 && !categoryLoading" class="absolute z-50 mt-1 w-full bg-elevated border border-default rounded-lg shadow-lg px-4 py-3 text-sm text-muted">
										No matching category found
									</div>
								</div>
								<template #hint v-if="selectedCategoryName">
									<span class="text-xs text-primary flex items-center gap-1">
										<span class="i-lucide-check text-sm" /> {{ selectedCategoryName }}
									</span>
								</template>
							</UFormGroup>
						</div>
					</UCard>

					<!-- Attachments Card -->
					<UCard class="mb-6">
						<template #header>
							<div class="flex items-center gap-2">
								<span class="i-lucide-paperclip text-lg text-primary" />
								<p class="text-sm font-semibold text-highlighted">Attachments</p>
								<span class="text-xs text-muted">(Optional)</span>
							</div>
						</template>
						<div
							class="border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer"
							:class="dragActive ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-default bg-muted/30 hover:border-primary/50 hover:bg-muted/50'"
							@dragover="handleDragOver"
							@dragleave="handleDragLeave"
							@drop="handleDrop"
							@click="$refs.fileInput.click()"
						>
							<input
								ref="fileInput"
								type="file"
								multiple
								class="hidden"
								@change="handleFileChange"
							/>
							<div class="flex flex-col items-center gap-3">
								<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
									<span class="i-lucide-upload-cloud text-2xl text-primary" />
								</div>
								<div>
									<span class="font-medium text-highlighted">Drag & drop files here</span>
									<span class="text-muted"> or </span>
									<span class="font-medium text-primary cursor-pointer hover:underline">browse</span>
								</div>
								<span class="text-xs text-muted">Supports images and PDFs up to 10MB each</span>
							</div>
						</div>
						<div v-if="uploadError" class="mt-3 flex items-center gap-2 text-sm text-error">
							<span class="i-lucide-alert-circle" />
							{{ uploadError }}
						</div>
						<div v-if="attachments.length" class="mt-4">
							<p class="text-xs text-muted mb-2">{{ attachments.length }} file{{ attachments.length > 1 ? 's' : '' }} selected</p>
							<ul class="divide-y divide-default bg-elevated rounded-lg border border-default">
								<li v-for="(file, idx) in attachments" :key="file.name" class="flex items-start gap-3 px-4 py-3">
									<!-- Preview thumbnail -->
									<div class="flex-shrink-0">
										<div v-if="previews[idx]?.type === 'image'" class="w-16 h-16 rounded-md overflow-hidden border border-default">
											<img :src="previews[idx].url" :alt="file.name" class="w-full h-full object-cover" />
										</div>
										<div v-else-if="previews[idx]?.type === 'pdf'" class="w-16 h-16 rounded-md border border-default bg-muted/50 flex items-center justify-center">
											<span class="i-lucide-file-text text-2xl text-error" />
										</div>
										<div v-else class="w-16 h-16 rounded-md border border-default bg-muted/50 flex items-center justify-center">
											<span class="i-lucide-file text-2xl text-muted" />
										</div>
									</div>
									<!-- File info -->
									<div class="flex-1 min-w-0">
										<p class="font-medium text-sm text-highlighted truncate">{{ file.name }}</p>
										<p class="text-xs text-muted mt-0.5">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
									</div>
								</li>
							</ul>
						</div>
					</UCard>

					<!-- Action Buttons -->
					<div class="flex items-center justify-end gap-3">
						<UButton color="neutral" variant="ghost" to="/user/tickets" size="lg">
							Cancel
						</UButton>
						<UButton 
							:loading="isSubmitting" 
							:disabled="isSubmitting || !form.title" 
							type="submit" 
							color="primary" 
							icon="i-lucide-send"
							size="lg"
						>
							Submit Ticket
						</UButton>
					</div>
				</form>
			</div>
		</UDashboardPage>
	</UDashboardGroup>
</template>