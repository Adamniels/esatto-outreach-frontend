<template>
  <div class="dashboard-container">
    <!-- Stats Grid - Matches Prody layout -->
    <div class="stats-grid">
      <!-- Main Stats Cards -->
      <div class="stat-card">
        <div class="stat-card-content">
          <div class="stat-label">Totalt Prospects</div>
          <div class="stat-value">{{ totalProspects }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-content">
          <div class="stat-label">E-post Skickade</div>
          <div class="stat-value">{{ emailsSent }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-content">
          <div class="stat-label">Svar</div>
          <div class="stat-value">{{ responses }}</div>
        </div>
      </div>

      <!-- Empty space for balance like in Prody -->
      <div class="stat-card-empty">
        <!-- Could add another metric here -->
      </div>
    </div>

    <!-- Recent Activity - Clean table like Prody -->
    <div class="activity-container">
      <div class="activity-header">
        <h2 class="activity-title">Senaste Aktivitet</h2>
      </div>
      
      <div v-if="loading" class="loading-state">
        <svg class="loading-icon animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <p class="loading-text">Laddar data...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <p class="error-message">Network Error</p>
        <button 
          @click="refreshData"
          class="btn btn-secondary mt-3"
        >
          Försök igen
        </button>
      </div>

      <div v-else-if="prospects.length === 0" class="empty-state">
        <p class="empty-message">Inga prospects ännu</p>
        <router-link 
          to="/prospects"
          class="empty-action-link"
        >
          Lägg till första prospect →
        </router-link>
      </div>

      <div v-else class="overflow-hidden">
        <!-- Clean table like in Prody -->
        <table class="min-w-full">
          <tbody class="divide-y divide-gray-100">
            <tr v-for="prospect in recentProspects" :key="prospect.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900 text-sm">{{ prospect.companyName }}</div>
                <div class="text-gray-500 text-xs mt-1">{{ prospect.contactName || 'Ingen kontakt' }}</div>
              </td>
              <td class="px-6 py-4 text-right">
                <span 
                  :class="getStatusColor(prospect.status)"
                  class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                >
                  {{ getStatusLabel(prospect.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right text-sm text-gray-500">
                {{ formatDate(prospect.createdUtc) }}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <router-link 
            to="/prospects"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Visa alla prospects →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// Simple types
interface Prospect {
  id: string
  companyName: string
  domain?: string
  contactName?: string
  contactEmail?: string
  linkedinUrl?: string
  notes?: string
  status: number
  createdUtc: string
  updatedUtc?: string
}

// Simple reactive state
const prospects = ref<Prospect[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// API client
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Fetch prospects function
const fetchProspects = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/prospects')
    prospects.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message || 'Ett fel uppstod'
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
  prospects.value.filter(p => p.status >= 2).length // Emailed (2) or higher
)

const responses = computed(() => 
  prospects.value.filter(p => p.status === 3).length // Responded (3)
)

const recentProspects = computed(() => 
  prospects.value
    .sort((a, b) => new Date(b.createdUtc).getTime() - new Date(a.createdUtc).getTime())
    .slice(0, 5)
)

// Status helpers
const statusLabels: Record<number, string> = {
  0: 'Ny',
  1: 'Undersökt',
  2: 'E-post skickad',
  3: 'Svarat',
  4: 'Arkiverad'
}

const statusColors: Record<number, string> = {
  0: 'bg-blue-50 text-blue-700 border border-blue-200',
  1: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  2: 'bg-purple-50 text-purple-700 border border-purple-200',
  3: 'bg-green-50 text-green-700 border border-green-200',
  4: 'bg-gray-50 text-gray-700 border border-gray-200'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusLabel = (status: number) => statusLabels[status] || 'Okänd'
const getStatusColor = (status: number) => statusColors[status] || 'bg-gray-100 text-gray-800'

// Load data on mount
onMounted(() => {
  fetchProspects()
})
</script>

<style scoped>
/* Dashboard Styles */
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
  min-height: 100vh;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  transition: box-shadow 0.15s ease-in-out;
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-card-content {
  text-align: right;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
}

.stat-card-empty {
  visibility: hidden;
}

.activity-container {
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.activity-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.activity-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem 0;
}

.loading-icon,
.error-icon {
  width: 1.5rem;
  height: 1.5rem;
  margin-bottom: 0.5rem;
  color: #6b7280;
}

.error-icon {
  color: #f59e0b;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.error-message {
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.empty-message {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.empty-action-link {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.15s ease-in-out;
}

.empty-action-link:hover {
  color: #2563eb;
}

.mt-3 {
  margin-top: 0.75rem;
}
</style>