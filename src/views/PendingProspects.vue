<template>
  <div class="pending-prospects-container">
    <div class="page-header">
      <h1 class="page-title">Väntande Prospects från Capsule</h1>
      <p class="page-description">
        Granska och godkänn företag från Capsule CRM som har lagts till som prospects.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Laddar väntande prospects...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchPendingProspects" class="btn-retry">
        Försök igen
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="pendingProspects.length === 0" class="empty-state">
      <p class="empty-message">Inga väntande prospects just nu</p>
      <p class="empty-description">
        När nya företag läggs till i Capsule CRM kommer de att dyka upp här för godkännande.
      </p>
    </div>

    <!-- Pending Prospects List -->
    <div v-else class="prospects-grid">
      <div 
        v-for="prospect in pendingProspects" 
        :key="prospect.id"
        class="prospect-card"
      >
        <!-- Card Header with Picture -->
        <div class="card-header">
          <div class="company-info">
            <img 
              v-if="prospect.pictureURL" 
              :src="prospect.pictureURL" 
              :alt="prospect.name"
              class="company-logo"
            />
            <div v-else class="company-logo-placeholder">
              <span class="logo-letter">{{ prospect.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="company-title">
              <h3 class="company-name">{{ prospect.name }}</h3>
              <span v-if="prospect.capsuleId" class="capsule-badge">
                Capsule ID: {{ prospect.capsuleId }}
              </span>
            </div>
          </div>
        </div>

        <!-- About Section -->
        <div v-if="prospect.about" class="card-section">
          <label class="section-label">Om företaget:</label>
          <p class="section-text">{{ prospect.about }}</p>
        </div>

        <!-- Websites -->
        <div v-if="prospect.websites && prospect.websites.length > 0" class="card-section">
          <label class="section-label">Webbplatser:</label>
          <div class="links-list">
            <a 
              v-for="(site, idx) in prospect.websites" 
              :key="idx"
              :href="site.url || '#'" 
              target="_blank"
              class="link-item"
            >
              {{ site.url || 'N/A' }}
            </a>
          </div>
        </div>

        <!-- Email Addresses -->
        <div v-if="prospect.emailAddresses && prospect.emailAddresses.length > 0" class="card-section">
          <label class="section-label">Email-adresser:</label>
          <div class="links-list">
            <a 
              v-for="(email, idx) in prospect.emailAddresses" 
              :key="idx"
              :href="`mailto:${email.address}`"
              class="link-item"
            >
              {{ email.address }}
            </a>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <button 
            @click="handleClaim(prospect.id)"
            :disabled="isProcessing"
            class="btn-claim"
          >
            <span v-if="processingId === prospect.id">Godkänner...</span>
            <span v-else>✓ Godkänn och Lägg till</span>
          </button>
          <button 
            @click="handleReject(prospect.id)"
            :disabled="isProcessing"
            class="btn-reject"
          >
            <span v-if="processingId === prospect.id">Avvisar...</span>
            <span v-else>✗ Avvisa</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { PendingProspectDto } from '../types/prospect'
import { useProspects } from '../composables/useProspects'

const router = useRouter()
const { fetchPendingProspects, claimProspect, rejectProspect } = useProspects()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const pendingProspects = ref<PendingProspectDto[]>([])
const isProcessing = ref(false)
const processingId = ref<string | null>(null)

// Fetch pending prospects
const loadPendingProspects = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await fetchPendingProspects()
    pendingProspects.value = data
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Kunde inte ladda väntande prospects'
    console.error('Error fetching pending prospects:', err)
  } finally {
    loading.value = false
  }
}

// Handle claim
const handleClaim = async (id: string) => {
  if (isProcessing.value) return
  
  isProcessing.value = true
  processingId.value = id
  error.value = null
  
  try {
    const claimedProspect = await claimProspect(id)
    
    if (!claimedProspect) {
      throw new Error('Kunde inte godkänna prospect')
    }
    
    // Remove from pending list
    pendingProspects.value = pendingProspects.value.filter(p => p.id !== id)
    
    // Show success message
    const successMsg = document.createElement('div')
    successMsg.textContent = `${claimedProspect.name} har lagts till som prospect`
    successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; z-index: 9999; font-weight: 500;'
    document.body.appendChild(successMsg)
    setTimeout(() => successMsg.remove(), 3000)
    
    // Optionally redirect to the new prospect
    // router.push(`/prospects/${claimedProspect.id}`)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Kunde inte godkänna prospect'
    alert(`Fel: ${error.value}`)
  } finally {
    isProcessing.value = false
    processingId.value = null
  }
}

// Handle reject
const handleReject = async (id: string) => {
  if (isProcessing.value) return
  
  const prospect = pendingProspects.value.find(p => p.id === id)
  if (!prospect) return
  
  if (!confirm(`Är du säker på att du vill avvisa "${prospect.name}"?`)) {
    return
  }
  
  isProcessing.value = true
  processingId.value = id
  error.value = null
  
  try {
    await rejectProspect(id)
    
    // Remove from pending list
    pendingProspects.value = pendingProspects.value.filter(p => p.id !== id)
    
    // Show success message
    const successMsg = document.createElement('div')
    successMsg.textContent = `${prospect.name} har avvisats`
    successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #6b7280; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; z-index: 9999; font-weight: 500;'
    document.body.appendChild(successMsg)
    setTimeout(() => successMsg.remove(), 3000)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Kunde inte avvisa prospect'
    alert(`Fel: ${error.value}`)
  } finally {
    isProcessing.value = false
    processingId.value = null
  }
}

onMounted(() => {
  loadPendingProspects()
})
</script>

<style scoped>
.pending-prospects-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: 1rem;
  color: #6b7280;
}

/* Loading, Error, Empty States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-state p {
  font-size: 1.125rem;
  color: #6b7280;
}

.error-state {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
}

.error-message {
  font-size: 1rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

.btn-retry {
  padding: 0.625rem 1.25rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-retry:hover {
  background-color: #1d4ed8;
}

.empty-state {
  background-color: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
}

.empty-message {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 1rem;
  color: #6b7280;
}

/* Prospects Grid */
.prospects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.prospect-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.prospect-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Card Header */
.card-header {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.company-logo {
  width: 60px;
  height: 60px;
  border-radius: 0.5rem;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.company-logo-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-letter {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.company-title {
  flex: 1;
}

.company-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.capsule-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Card Sections */
.card-section {
  margin-bottom: 1rem;
}

.section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.section-text {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
}

.links-list,
.text-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.link-item {
  font-size: 0.875rem;
  color: #2563eb;
  text-decoration: none;
  transition: color 0.2s;
}

.link-item:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.text-item {
  font-size: 0.875rem;
  color: #374151;
}

.address-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}

/* Tags */
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s;
}

.tag-badge.data-tag {
  background-color: #fef3c7;
  color: #92400e;
}

/* Custom Fields */
.fields-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}

.field-name {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.field-value {
  font-size: 0.875rem;
  color: #374151;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px solid #f3f4f6;
}

.btn-claim,
.btn-reject {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-claim {
  background-color: #10b981;
  color: white;
}

.btn-claim:hover:not(:disabled) {
  background-color: #059669;
}

.btn-reject {
  background-color: #ef4444;
  color: white;
}

.btn-reject:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn-claim:disabled,
.btn-reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .prospects-grid {
    grid-template-columns: 1fr;
  }
  
  .pending-prospects-container {
    padding: 1rem;
  }
}
</style>
