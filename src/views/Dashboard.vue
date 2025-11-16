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
        <button @click="refreshData" class="btn btn-secondary retry-btn">
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

      <div v-else class="table-wrapper">
        <!-- Clean table like in Prody -->
        <table class="activity-table">
          <tbody class="activity-tbody">
            <tr v-for="prospect in recentProspects" :key="prospect.id" class="activity-row">
              <td class="activity-cell">
                <div class="company-name">{{ prospect.companyName }}</div>
                <div class="contact-info">{{ prospect.contactName || 'Ingen kontakt' }}</div>
              </td>
              <td class="activity-cell-right">
                <span :class="['status-badge', getStatusClass(prospect.status)]">
                  {{ getStatusLabel(prospect.status) }}
                </span>
              </td>
              <td class="activity-cell-right date-cell">
                {{ formatDate(prospect.createdUtc) }}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="table-footer">
          <router-link to="/prospects" class="view-all-link">
            Visa alla prospects →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Prospect, ProspectStatus } from '@/types/prospect'
import { statusLabels, statusColors } from '@/types/prospect'
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
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusLabel = (status: ProspectStatus) => statusLabels[status] || 'Okänd'

const getStatusClass = (status: ProspectStatus) => {
  switch (status) {
    case 0: return 'status-new'
    case 1: return 'status-researched'
    case 2: return 'status-emailed'
    case 3: return 'status-responded'
    case 4: return 'status-archived'
    default: return 'status-unknown'
  }
}

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

.retry-btn {
  margin-top: 0.75rem;
}

/* Table styles */
.table-wrapper {
  overflow: hidden;
}

.activity-table {
  width: 100%;
  border-collapse: collapse;
}

.activity-tbody {
  border-top: 1px solid #f3f4f6;
}

.activity-row {
  transition: background-color 0.15s ease-in-out;
}

.activity-row:hover {
  background-color: #f9fafb;
}

.activity-row:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.activity-cell {
  padding: 1rem 1.5rem;
  text-align: left;
}

.activity-cell-right {
  padding: 1rem 1.5rem;
  text-align: right;
}

.company-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
}

.contact-info {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.date-cell {
  font-size: 0.875rem;
  color: #6b7280;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-new {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-researched {
  background-color: #fef3c7;
  color: #92400e;
}

.status-emailed {
  background-color: #e9d5ff;
  color: #6b21a8;
}

.status-responded {
  background-color: #d1fae5;
  color: #065f46;
}

.status-archived {
  background-color: #f3f4f6;
  color: #4b5563;
}

.status-unknown {
  background-color: #f3f4f6;
  color: #6b7280;
}

.table-footer {
  padding: 0.75rem 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #f3f4f6;
}

.view-all-link {
  font-size: 0.875rem;
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.15s ease-in-out;
}

.view-all-link:hover {
  color: #2563eb;
}
</style>