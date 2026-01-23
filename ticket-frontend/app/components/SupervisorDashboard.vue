<script setup lang="ts">

import { onMounted, onUnmounted, reactive } from 'vue'
import { getOpenTickets, getPendingTickets, getClosedTickets } from '~/api/stats/stats'

type Card = {
  key: 'open' | 'pending' | 'closed'
  label: string
  value: number
  icon: string
  iconBg: string
  badgeColor: string
  dot: string
}

const cards = reactive<Card[]>([
  {
    key: 'open',
    label: 'Open tickets',
    value: 0,
    icon: 'i-lucide-flame',
    iconBg: 'bg-amber-500',
    badgeColor: 'amber',
    dot: 'bg-amber-500'
  },
  {
    key: 'pending',
    label: 'Pending tickets',
    value: 0,
    icon: 'i-lucide-clock-3',
    iconBg: 'bg-sky-500',
    badgeColor: 'sky',
    dot: 'bg-sky-500'
  },
  {
    key: 'closed',
    label: 'Closed tickets',
    value: 0,
    icon: 'i-lucide-check-circle-2',
    iconBg: 'bg-emerald-500',
    badgeColor: 'emerald',
    dot: 'bg-emerald-500'
  }
])

let intervalId: NodeJS.Timeout | null = null

const fetchStats = async () => {
  try {
    const [open, pending, closed] = await Promise.all([
      getOpenTickets(),
      getPendingTickets(),
      getClosedTickets()
    ])

    const openCard = cards.find(c => c.key === 'open')
    if (openCard) openCard.value = open
    
    const pendingCard = cards.find(c => c.key === 'pending')
    if (pendingCard) pendingCard.value = pending
    
    const closedCard = cards.find(c => c.key === 'closed')
    if (closedCard) closedCard.value = closed
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

onMounted(() => {
  fetchStats()
  intervalId = setInterval(fetchStats, 5000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})



</script>



<template>
	<section class="space-y-4">
		<div class="flex items-center justify-between gap-3">
			<div class="space-y-0.5">
				<p class="text-sm text-muted-500">Supervisor</p>
				<h2 class="text-lg font-semibold text-gray-900">Ticket status</h2>
				<p class="text-sm text-muted-500">Snapshot of tickets by status</p>
			</div>
			<UBadge color="primary" variant="soft" icon="i-lucide-activity">Live</UBadge>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			<UCard
				v-for="card in cards"
				:key="card.key"
				class="h-full"
				:ui="{
					body: 'flex flex-col gap-3',
					background: 'bg-white'
				}"
			>
				<div class="flex items-start justify-between">
					<div class="space-y-1">
						<p class="text-xs font-semibold uppercase tracking-wide text-muted-500">{{ card.label }}</p>
						<p class="text-3xl font-semibold text-gray-900">{{ card.value.toLocaleString() }}</p>
						<p class="text-sm text-muted-500">{{ card.hint }}</p>
					</div>

					<div :class="['flex h-12 w-12 items-center justify-center rounded-xl text-white', card.iconBg]">
						<UIcon :name="card.icon" class="h-6 w-6" />
					</div>
				</div>

				<div class="flex items-center gap-2 text-sm">
					<UBadge :color="card.badgeColor" variant="soft" class="flex items-center gap-2">
						<span :class="['h-2 w-2 rounded-full', card.dot]"></span>
						{{ card.trend }}
					</UBadge>
					<span class="text-muted-500">{{ card.note }}</span>
				</div>
			</UCard>
		</div>
	</section>
</template>

