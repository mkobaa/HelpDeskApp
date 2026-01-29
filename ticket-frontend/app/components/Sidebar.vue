<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
const userRole = useCookie('user_role')

const sidebarItems = computed(() => {
  switch (userRole.value) {
    case 'admin':
      return [
        { label: 'Dashboard', to: '/admin' },
        { label: 'Users', to: '/admin/users' },
        { label: 'Categories', to: '/admin/categories' },
        { label: 'History', to: '/admin/history' },
        { label: 'Settings', to: '/admin/settings' }
      ]

    case 'supervisor':
      return [
        { label: 'Dashboard', to: '/supervisor' },
        { label: 'Tickets', to: '/supervisor/tickets' },
        { label: 'Reports', to: '/supervisor/reports'},
        { label: 'Technicians', to: '/supervisor/technicians' }
      ]

    case 'technician':
      return [
        { label: 'My Tickets', to: '/technician/tickets' }
      ]

    case 'user':
      return [
        { label: 'My Tickets', to: '/user/tickets' },
        { label: 'Profile', to: '/profile' }
      ]

    default:
      return []
  }
})
const items = computed<NavigationMenuItem[][]>(() => {
  return [
    sidebarItems.value,
    [
      { label: 'Logout', to: '/logout' }
    ]
  ]
})
</script>

<template>
  <UDashboardSidebar collapsible resizable :ui="{ footer: 'border-t border-default' }">
    
    
    <template #header="{ collapsed }">
      <Logo v-if="!collapsed" class="h-5 w-auto shrink-0" />
      <UIcon v-else name="i-simple-icons-nuxtdotjs" class="size-5 text-primary mx-auto" />
    </template>

    <template #default="{ collapsed }">
      <UButton
        :label="collapsed ? undefined : 'Search...'"
        icon="i-lucide-search"
        color="neutral"
        variant="outline"
        block
        :square="collapsed"
      >
        <template v-if="!collapsed" #trailing>
          <div class="flex items-center gap-0.5 ms-auto">
            <UKbd value="meta" variant="subtle" />
            <UKbd value="K" variant="subtle" />
          </div>
        </template>
      </UButton>

      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[0]"
        orientation="vertical"
      />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[1]"
        orientation="vertical"
        class="mt-auto"
      />
    </template>

    <template #footer="{ collapsed }">
      <UButton
        :avatar="{
          src: 'https://github.com/benjamincanac.png'
        }"
        :label="collapsed ? undefined : 'Benjamin'"
        color="neutral"
        variant="ghost"
        class="w-full"
        :block="collapsed"
      />
    </template>
  </UDashboardSidebar>
</template>

