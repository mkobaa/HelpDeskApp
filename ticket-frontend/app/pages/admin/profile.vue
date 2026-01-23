<script setup lang="ts">
import { onNuxtReady } from '#imports'

const token = useCookie('auth_token')

const fetchProfile = async () => {
	let bearer = token.value || ''
	try {
		bearer = decodeURIComponent(bearer)
	} catch {
		// keep original if decoding fails
	}

	const response = await fetch('http://localhost:8000/api/user', {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${bearer}`
		}
	})

	const raw = await response.json()
	if (!response.ok) {
		throw raw
	}

	return raw?.data || raw?.user || raw
}

const { data: user, status, error, refresh } = await useAsyncData(
	'current-user',
	fetchProfile,
	{
		server: false,
		lazy: true,
		immediate: false
	}
)

onNuxtReady(() => {
	refresh()
})
</script>

<template>
	<UDashboardGroup>
		<Sidebar />
		<UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
			<Navbar title="My profile" icon="i-lucide-user" class="w-full" />
			<div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
				<div class="flex items-center justify-between gap-3">
					<UDashboardPageHeader
						:title="user?.username || 'Profile'"
						:description="user?.email || ''"
					/>
					<UButton size="sm" icon="i-lucide-refresh-ccw" variant="outline" @click="refresh">
						Refresh
					</UButton>
				</div>

				<UCard>
					<template #header>
						<div class="flex items-center justify-between">
							<p class="text-sm font-semibold text-highlighted">Profile</p>
							<div class="text-xs text-muted" v-if="status === 'pending'">Loading...</div>
						</div>
					</template>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
					<div v-if="error" class="mt-4 text-sm text-error">Failed to load profile.</div>
				</UCard>
			</div>
		</UDashboardPage>
	</UDashboardGroup>
</template>
