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
	if (!q || q.length < 2) {
		categoryOptions.value = []
		return
	}
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
			<Navbar title="Create ticket" icon="i-lucide-ticket-plus" class="w-full" />
			<div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
				<form class="flex flex-col gap-4 max-w-3xl w-full" @submit.prevent="handleCreate">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<UFormGroup label="Title" name="title">
							<UInput v-model="form.title" placeholder="Ticket Title" required maxlength="255" />
						</UFormGroup>
						<UFormGroup label="Description" name="description" class="sm:col-span-2">
							<UTextarea v-model="form.description" placeholder="Ticket Description" rows="6" class="min-h-32 resize-vertical" maxlength="2000" />
							<p class="text-xs text-muted mt-1">Provide a clear, detailed description (max 2000 characters).</p>
						</UFormGroup>
                        <UFormGroup label="Priority" name="priority">
                            <USelect
                                v-model="form.priority"
                                :items="priorityOptions"
                                placeholder="Select priority"
                            />
                            </UFormGroup>

                            <!-- <UFormGroup label="Status" name="status">
                            <USelect
                                v-model="form.status"
                                :items="statusOptions"
                                placeholder="Select status"
                            />
                            </UFormGroup> -->

								<UFormGroup label="Category" name="category_id" class="sm:col-span-2">
										<div class="relative">
											<UInput
												:value="categorySearch"
												placeholder="Search categories by name"
												@input="onCategoryInput"
												aria-label="Search categories"
											/>
											<div v-if="categoryLoading" class="absolute right-2 top-2 text-xs text-muted">Searching...</div>
											<ul v-if="categoryOptions.length" class="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-sm max-h-48 overflow-auto">
												<li v-for="opt in categoryOptions" :key="opt.id || opt.value" class="px-3 py-2 hover:bg-gray-100 cursor-pointer" @click="selectCategory(opt)">
													{{ opt.name || opt.title || opt.label || opt.value }}
												</li>
											</ul>
											<div v-else-if="categorySearch.length >= 2 && !categoryLoading" class="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-sm px-3 py-2 text-sm text-muted">No matching category</div>
											<div v-if="selectedCategoryId" class="absolute right-2 top-2">
												<button type="button" class="text-xs text-muted hover:text-gray-700" @click="clearCategory">Clear</button>
											</div>
										</div>
										<p class="text-xs text-muted mt-1">Choose a category for the ticket. Selected: <span class="font-medium">{{ selectedCategoryName || (form.category_id ? form.category_id : 'none') }}</span></p>
								</UFormGroup>
								<UFormGroup label="Attachments" name="attachments" class="sm:col-span-2">
									<div
										class="border-2 border-dashed rounded-md p-6 min-h-28 text-center transition-colors cursor-pointer"
										:class="dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50'"
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
										<div class="flex flex-col items-center gap-2">
											<span class="i-lucide-upload-cloud text-3xl text-primary" />
											<span class="font-medium">Drag & drop files here or <span class="underline text-primary cursor-pointer">browse</span></span>
											<span class="text-xs text-muted">Max 10MB.</span>
										</div>
									</div>
									<div v-if="uploadError" class="mt-2 text-sm text-error">{{ uploadError }}</div>
									<div class="text-xs text-muted mt-2">You can attach images or PDFs. Max 10MB per file.</div>
									<div v-if="attachments.length" class="mt-3">
										<ul class="divide-y divide-gray-200 bg-white rounded-md shadow-sm">
											<li v-for="(file, idx) in attachments" :key="file.name" class="flex flex-col gap-2 px-3 py-2">
												<div class="flex items-center gap-2">
													<span class="i-lucide-file text-lg text-gray-400" />
													<span class="font-medium">{{ file.name }}</span>
													<span class="text-xs text-muted">({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</span>
												</div>
												<div v-if="previews[idx]?.type === 'image'" class="mt-1 flex items-center">
													<img :src="previews[idx].url" :alt="file.name" class="max-h-24 rounded border" />
												</div>
												<div v-else-if="previews[idx]?.type === 'pdf'" class="mt-1 flex items-center">
													<embed :src="previews[idx].url" type="application/pdf" class="max-h-32 w-full border rounded" />
												</div>
												<div v-else-if="previews[idx]?.type === 'other'" class="mt-1 text-xs text-muted">
													No preview available
												</div>
											</li>
										</ul>
									</div>
								</UFormGroup>
					</div>

					
					<div class="flex justify-end gap-3 pt-2">
						<UButton color="neutral" variant="ghost" to="/admin/categories">Cancel</UButton>
						<UButton :loading="isSubmitting" :disabled="isSubmitting" type="submit" color="primary" icon="i-lucide-check">Create</UButton>
					</div>
				</form>
			</div>
		</UDashboardPage>
	</UDashboardGroup>
</template>