<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { createCategory } from '~/api/categories/createCategory'
import { getCategories } from '~/api/categories/categories'
import { useRouter } from '#imports'


const form = reactive({
	name: '',
	description: '',
	parentId: null
})

// async provider for parent category select
const categoriesList = ref([])

const loadCategories = async () => {
	try {
		const cats = await getCategories('')
		const arr = Array.isArray(cats) ? cats : (Array.isArray(cats?.data) ? cats.data : [])
		categoriesList.value = arr.map(cat => ({ label: cat.name, value: cat.id }))
	} catch (e) {
		categoriesList.value = []
	}
}

onMounted(() => {
	loadCategories()
})

const isSubmitting = ref(false)
const router = useRouter()

const handleCreate = async () => {
	if (isSubmitting.value) return
	isSubmitting.value = true
	try {
		await createCategory({
			name: form.name,
			description: form.description,
			parentId: form.parentId || undefined
		})
		await router.push('/admin/categories')
	} catch (error) {
		console.error('Failed to create category', error)
	} finally {
		isSubmitting.value = false
	}
}
</script>

<template>
	<UDashboardGroup>
		<Sidebar />
		<UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
			<Navbar title="Create category" icon="i-lucide-folder-plus" class="w-full" />
			<div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
				<form class="flex flex-col gap-4 max-w-3xl w-full" @submit.prevent="handleCreate">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<UFormGroup label="Name" name="name">
							<UInput v-model="form.name" placeholder="Category Name" required maxlength="255" />
						</UFormGroup>
						<UFormGroup label="Description" name="description">
							<UInput v-model="form.description" placeholder="Category Description" maxlength="255" />
						</UFormGroup>
					</div>
					
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<UFormGroup label="Parent Category" name="parent_category_id">
							<USelect
								v-model="form.parentId"
								:items="[{ label: 'None', value: null }, ...categoriesList]"
								placeholder="Select parent category"
								searchable
								clearable
							/>
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