<script setup lang="ts">
import { reactive, ref } from 'vue'
import { createUser } from '~/api/users/createUser'
import { useRouter } from '#imports'

const form = reactive({
	username: '',
	email: '',
	password: '',
	role: '',
	department: ''
})

const roles = ref(['user', 'technician', 'supervisor', 'admin'])
const isSubmitting = ref(false)
const router = useRouter()

const handleCreate = async () => {
	if (isSubmitting.value)
		return
	isSubmitting.value = true
	try {
		await createUser({
			username: form.username,
			email: form.email,
			password: form.password,
			role: form.role || undefined,
			department: form.department || undefined
		})
		await router.push('/admin/users')
	} catch (error) {
		console.error('Failed to create user', error)
	} finally {
		isSubmitting.value = false
	}
}
</script>

<template>
	<UDashboardGroup>
		<Sidebar />
		<UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
			<Navbar title="Create user" icon="i-lucide-user-plus" class="w-full" />
			<div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
				<form class="flex flex-col gap-4 max-w-3xl w-full" @submit.prevent="handleCreate">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<UFormGroup label="Username" name="username">
							<UInput v-model="form.username" placeholder="jane.doe" required maxlength="255" />
						</UFormGroup>
						<UFormGroup label="Email" name="email">
							<UInput v-model="form.email" type="email" placeholder="jane@example.com" required maxlength="255" />
						</UFormGroup>
					</div>

					<UFormGroup label="Password" name="password">
						<UInput v-model="form.password" type="password" placeholder="min 8 characters" required minlength="8" />
					</UFormGroup>

					<UFormGroup label="Role (optional)" name="role">
						<USelect v-model="form.role" :items="roles" placeholder="Select role" />
					</UFormGroup>

					<UFormGroup label="Department (optional)" name="department">
						<UInput v-model="form.department" placeholder="IT Support" maxlength="255" />
					</UFormGroup>

					<div class="flex justify-end gap-3 pt-2">
						<UButton color="neutral" variant="ghost" to="/admin/users">Cancel</UButton>
						<UButton :loading="isSubmitting" :disabled="isSubmitting" type="submit" color="primary" icon="i-lucide-check">Create</UButton>
					</div>
				</form>
			</div>
		</UDashboardPage>
	</UDashboardGroup>
</template>