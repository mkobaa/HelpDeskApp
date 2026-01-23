<script setup lang="ts">
import SurveyForm from '~/components/survey/SurveyForm.vue'
</script>

<template>
    <UDashboardGroup>
        <Sidebar />
        <UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Navbar title="Survey" icon="i-lucide-clipboard-list" class="w-full" />
            <div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
                <SurveyForm />
            </div>
        </UDashboardPage>
    </UDashboardGroup>
</template>