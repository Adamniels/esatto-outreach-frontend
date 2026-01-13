<template>
  <div class="flex flex-col gap-8 p-6 min-h-screen">
    <!-- Stats Grid - Matches Prody layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Main Stats Cards -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 transition-shadow duration-150 ease-in-out hover:shadow-md">
        <div class="text-right">
          <div class="text-sm text-gray-500 font-medium mb-2">Total Prospects</div>
          <div class="text-3xl font-bold text-gray-800">{{ totalProspects }}</div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-6 transition-shadow duration-150 ease-in-out hover:shadow-md">
        <div class="text-right">
          <div class="text-sm text-gray-500 font-medium mb-2">Emails Sent</div>
          <div class="text-3xl font-bold text-gray-800">{{ emailsSent }}</div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-6 transition-shadow duration-150 ease-in-out hover:shadow-md">
        <div class="text-right">
          <div class="text-sm text-gray-500 font-medium mb-2">Responses</div>
          <div class="text-3xl font-bold text-gray-800">{{ responses }}</div>
        </div>
      </div>

      <!-- Empty space for balance like in Prody -->
      <div class="invisible">
        <!-- Could add another metric here -->
      </div>
    </div>

    <!-- Recent Activity - Clean table like Prody -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="p-4 px-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">Recent Activity</h2>
      </div>
      
      <div v-if="loading" class="text-center py-12">
        <svg class="w-6 h-6 mb-2 text-gray-500 animate-spin mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <p class="text-sm text-gray-500">Loading data...</p>
      </div>
      
      <div v-else-if="error" class="text-center py-12">
        <svg class="w-6 h-6 mb-2 text-amber-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <p class="text-gray-700 font-medium mb-3">Network Error</p>
        <button @click="refreshData" class="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium leading-5 rounded-md border border-gray-300 bg-white text-gray-700 transition-all duration-200 ease-in-out cursor-pointer hover:bg-gray-50 hover:border-gray-400 mt-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          Try again
        </button>
      </div>

      <div v-else-if="prospects.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-sm mb-3">No prospects yet</p>
        <router-link 
          to="/prospects"
          class="inline-flex items-center px-4 py-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
        >
          Add first prospect →
        </router-link>
      </div>

      <div v-else class="overflow-hidden">
        <!-- Clean table like in Prody -->
        <table class="w-full border-collapse">
          <tbody class="divide-y divide-gray-100">
            <tr v-for="prospect in recentProspects" :key="prospect.id" class="transition-colors hover:bg-gray-50 border-b border-gray-100 last:border-0">
              <td class="p-4 px-6 text-left">
                <div class="font-medium text-gray-900 text-sm">{{ prospect.name }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ prospect.emailAddresses[0]?.address || prospect.about || 'No contact' }}</div>
              </td>
              <td class="p-4 px-6 text-right">
                <span :class="['inline-flex items-center px-2 py-1 rounded text-xs font-medium', getStatusClass(prospect.status)]">
                  {{ getStatusLabel(prospect.status) }}
                </span>
              </td>
              <td class="p-4 px-6 text-right text-sm text-gray-500">
                {{ formatDate(prospect.createdUtc) }}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="p-3 px-6 bg-gray-50 border-t border-gray-100">
          <router-link to="/prospects" class="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors">
            View all prospects →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Prospect, ProspectStatus } from '@/types/prospect'
import { statusLabels } from '@/types/prospect'
import { prospectsAPI } from '@/services/prospects'

// Simple reactive state
const prospects = ref<Prospect[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Fetch prospects function
const fetchProspects = async () => {
  loading.value = true
  error.value = null
  try {
    prospects.value = await prospectsAPI.getAll()
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchProspects()
}

// Computed properties
const totalProspects = computed(() => prospects.value.length)

const emailsSent = computed(() => 
  prospects.value.filter(p => p.status === 3 || p.status === 4).length // Emailed (3) or Responded (4)
)

const responses = computed(() => 
  prospects.value.filter(p => p.status === 4).length // Responded (4)
)

const recentProspects = computed(() => 
  prospects.value
    .sort((a, b) => new Date(b.createdUtc).getTime() - new Date(a.createdUtc).getTime())
    .slice(0, 5)
)

// Helper functions using imported constants
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusLabel = (status: ProspectStatus) => statusLabels[status] || 'Unknown'

const getStatusClass = (status: ProspectStatus) => {
  switch (status) {
    case 0: return 'bg-blue-100 text-blue-800' // New
    case 1: return 'bg-amber-100 text-amber-800' // Researched
    case 2: return 'bg-purple-100 text-purple-800' // Emailed
    case 3: return 'bg-emerald-100 text-emerald-800' // Responded
    case 4: return 'bg-gray-100 text-gray-600' // Archived
    default: return 'bg-gray-100 text-gray-500' // Unknown
  }
}

// Load data on mount
onMounted(() => {
  fetchProspects()
})
</script>