<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <Navbar title="Dashboard" icon="i-lucide-house" class="w-full" />
      <div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
        <UDashboardPageHeader title="Dashboard" description="Welcome to your dashboard." />
        <HistoryTable class="flex-1 w-full" />
      </div>
    </UDashboardPage>
  </UDashboardGroup>
</template>
