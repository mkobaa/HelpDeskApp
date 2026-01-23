<script setup lang="ts">
</script>

<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <Navbar title="Dashboard" icon="i-lucide-house" class="w-full" />
      <div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
        <div class="flex items-center justify-between gap-3">
          <UDashboardPageHeader title="Dashboard" description="Welcome to your dashboard." />
          <UButton size="sm" icon="i-lucide-plus" to="/admin/users/create">Create</UButton>
        </div>
        <UsersTable class="flex-1 w-full" />
      </div>
    </UDashboardPage>
  </UDashboardGroup>
</template>
