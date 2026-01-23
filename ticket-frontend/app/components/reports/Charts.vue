<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

// Register required components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}

const props = defineProps({
  labels: { type: Array, required: true },
  data: { type: Array, required: true },
  // optional secondary dataset for the second chart
  secondaryData: { type: Array, required: false },
  secondaryLabel: { type: String, required: false }
})

const chartDataPrimary = computed(() => ({
  labels: props.labels || [],
  datasets: [
    {
      label: 'Tickets resolved',
      data: Array.isArray(props.data) ? props.data.map(v => Number(v) || 0) : [],
      tension: 0.3,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.08)'
    }
  ]
}))

const chartDataSecondary = computed(() => ({
  labels: props.labels || [],
  datasets: [
    {
      label: props.secondaryLabel || 'Average solution time (minutes)',
      data: Array.isArray(props.secondaryData) ? props.secondaryData.map(v => Number(v) || 0) : [],
      tension: 0.3,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.08)'
    }
  ]
}))
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <UCard>
      <p class="text-sm font-semibold text-gray-900 mb-2">Resolved over time</p>
        <div style="height: 300px;">
          <Line :data="chartDataPrimary" :options="chartOptions" />
        </div>
    </UCard>
    <UCard>
      <p class="text-sm font-semibold text-gray-900 mb-2">Average resolution time (trend)</p>
      <div style="height: 300px;">
          <Line :data="chartDataSecondary" :options="chartOptions" />
      </div>
    </UCard>
  </div>
</template>
