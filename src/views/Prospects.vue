<template>
  <div class="prospects-container">
    <!-- Top Controls - Like Prody -->
    <div class="prospects-header">
      <div class="filter-controls">
        <!-- Filter Controls -->
        <div class="filter-item">
          <svg class="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          <span class="filter-label">Filter</span>
        </div>
        <div class="filter-item">
          <svg class="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
          </svg>
          <span class="filter-label">Sort</span>
        </div>
        <div class="filter-item">
          <svg class="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Search..." class="search-input" />
        </div>
      </div>
      
      <div class="action-controls">
        <button @click="showCreateModal = true" class="btn btn-success">Add New</button>
      </div>
    </div>

    <!-- Main Table -->
    <div class="prospects-table-container">
      <div v-if="loading" class="loading-state">
        <svg class="loading-icon animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <p class="loading-text">Laddar prospects...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <p class="error-message">{{ error }}</p>
        <button @click="fetchProspects" class="btn btn-secondary mt-3">Försök igen</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="prospects-table">
          <colgroup>
            <col class="col-id" />
            <col class="col-company" />
            <col class="col-contact" />
            <col class="col-email" />
            <col class="col-status" />
            <col class="col-actions" />
          </colgroup>
          <thead class="prospects-thead">
            <tr>
              <th class="table-header">ID</th>
              <th class="table-header">Company</th>
              <th class="table-header">Contact</th>
              <th class="table-header">Email</th>
              <th class="table-header">Status</th>
              <th class="table-header actions-header"> </th>
            </tr>
          </thead>
          <tbody class="prospects-tbody">
            <tr v-for="prospect in filteredProspects" :key="prospect.id" class="table-row">
              <td class="table-cell id-cell"><span class="id-text" :title="prospect.id">{{ prospect.id }}</span></td>
              <td class="table-cell company-cell">{{ prospect.companyName }}</td>
              <td class="table-cell contact-cell">
                <div class="contact-inner">
                  <div class="avatar">
                    <span class="avatar-letter">{{ (prospect.contactName || '-').charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="contact-name">{{ prospect.contactName || '-' }}</div>
                </div>
              </td>
              <td class="table-cell email-cell">{{ prospect.contactEmail || '-' }}</td>
              <td class="table-cell status-cell">
                <span :class="['status-badge', getStatusClass(prospect.status)]">{{ getStatusLabel(prospect.status) }}</span>
              </td>
              <td class="table-cell actions-cell">
                <button @click="openCompanyModal(prospect)" class="view-btn">View</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredProspects.length === 0" class="text-center py-12">
          <p class="text-gray-500">Inga prospects hittades</p>
          <p class="text-gray-400 text-sm mt-1">{{ searchQuery ? 'Prova att ändra din sökning' : 'Lägg till ditt första prospect för att komma igång' }}</p>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-backdrop" @click="closeModal"></div>
        <div class="modal-content">
          <div class="modal-header">
            <div class="header-title-container">
              <h3 class="modal-title">{{ editingProspect ? 'Edit Prospect' : 'Add New Prospect' }}</h3>
              <button @click="closeModal" class="modal-close-btn">✕</button>
            </div>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProspect" class="form-container">
              <div class="form-group">
                <label class="form-label required">Company Name</label>
                <input v-model="formData.companyName" type="text" required class="form-input" placeholder="e.g. Acme Corp" />
              </div>
              <div class="form-group">
                <label class="form-label">Website</label>
                <input v-model="formData.domain" type="url" class="form-input" placeholder="https://acme.com" />
              </div>
              <div class="form-group">
                <label class="form-label">Contact Person</label>
                <input v-model="formData.contactName" type="text" class="form-input" placeholder="John Doe" />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input v-model="formData.contactEmail" type="email" class="form-input" placeholder="john@acme.com" />
              </div>
              <div v-if="editingProspect" class="form-group">
                <label class="form-label">Status</label>
                <select v-model="formData.status" class="form-select">
                  <option v-for="(label, status) in statusLabels" :key="status" :value="Number(status)">{{ label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea v-model="formData.notes" rows="3" class="form-textarea" placeholder="Notes about this prospect..."></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" :disabled="isSubmitting" class="btn btn-secondary">Cancel</button>
            <button @click="saveProspect" :disabled="isSubmitting" class="btn btn-success" :class="{ 'btn-loading': isSubmitting }">
              <span v-if="isSubmitting" class="loading-spinner"></span>
              {{ isSubmitting ? 'Saving...' : (editingProspect ? 'Update' : 'Create') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Company Details / Email Generation Modal -->
    <div v-if="showCompanyModal" class="modal-overlay" @keydown.esc="closeCompanyModal">
      <div class="modal-container">
        <div class="modal-backdrop" @click="closeCompanyModal"></div>
        <div class="modal-content">
          <div class="modal-header">
            <div class="header-title-container">
              <h3 class="modal-title">Företagsdetaljer</h3>
              <button @click="closeCompanyModal" class="modal-close-btn">✕</button>
            </div>
          </div>
          <div class="modal-body">
            <div style="padding:1rem;">
              <p class="text-sm text-gray-600">Företag: <strong>{{ companyProspect?.companyName }}</strong></p>
              <p class="text-sm text-gray-600">Kontakt: <strong>{{ companyProspect?.contactName || '-' }}</strong></p>
              <p class="text-sm text-gray-600">E-post sparad: <strong>{{ companyProspect?.contactEmail || '-' }}</strong></p>
              <div style="margin-top:0.75rem;">
                <button @click="generateEmail" :disabled="isGenerating" class="btn btn-success">{{ generatedEmail ? 'Generera ny' : 'Generera mejl' }}</button>
                <button v-if="generatedEmail" @click="clearGeneratedEmail" class="btn btn-secondary ml-2">Rensa genererad</button>
                <button v-if="generatedEmail" @click="saveEmailToProspect" :disabled="isGenerating" class="btn btn-success ml-2">Spara till prospect</button>
              </div>
              <div v-if="generatedEmail" style="margin-top:1rem;">
                <label class="form-label">Förhandsgranskning</label>
                <textarea readonly class="form-textarea" rows="8">{{ generatedEmail }}</textarea>
              </div>
              <div v-else style="margin-top:1rem; color:#6b7280;">Ingen genererad mejl än.</div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeCompanyModal" class="btn btn-secondary">Stäng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// Types
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

// State
const prospects = ref<Prospect[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedStatus = ref('')
const showCreateModal = ref(false)
const editingProspect = ref<Prospect | null>(null)
const isSubmitting = ref(false)

const formData = ref({
  companyName: '',
  domain: '',
  contactName: '',
  contactEmail: '',
  linkedinUrl: '',
  notes: '',
  status: 0
})

// API
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' }
})

// Functions
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

const saveProspect = async () => {
  if (!formData.value.companyName.trim()) return
  
  isSubmitting.value = true
  try {
    const data = {
      ...formData.value,
      domain: formData.value.domain || undefined,
      contactName: formData.value.contactName || undefined,
      contactEmail: formData.value.contactEmail || undefined,
      notes: formData.value.notes || undefined
    }
    
    if (editingProspect.value) {
      await api.put(`/prospects/${editingProspect.value.id}`, data)
    } else {
      await api.post('/prospects', data)
    }
    
    await fetchProspects()
    closeModal()
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Kunde inte spara prospect'
  } finally {
    isSubmitting.value = false
  }
}

const editProspect = (prospect: Prospect) => {
  editingProspect.value = prospect
  formData.value = {
    companyName: prospect.companyName,
    domain: prospect.domain || '',
    contactName: prospect.contactName || '',
    contactEmail: prospect.contactEmail || '',
    linkedinUrl: prospect.linkedinUrl || '',
    notes: prospect.notes || '',
    status: prospect.status
  }
  showCreateModal.value = true
}

const confirmDelete = async (prospect: Prospect) => {
  if (confirm(`Är du säker på att du vill ta bort "${prospect.companyName}"?`)) {
    try {
      await api.delete(`/prospects/${prospect.id}`)
      await fetchProspects()
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Kunde inte ta bort prospect'
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingProspect.value = null
  formData.value = {
    companyName: '',
    domain: '',
    contactName: '',
    contactEmail: '',
    linkedinUrl: '',
    notes: '',
    status: 0
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
}

// Computed
const filteredProspects = computed(() => {
  let filtered = prospects.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((p: Prospect) => 
      p.companyName.toLowerCase().includes(query) ||
      (p.contactName && p.contactName.toLowerCase().includes(query)) ||
      (p.contactEmail && p.contactEmail.toLowerCase().includes(query)) ||
      (p.domain && p.domain.toLowerCase().includes(query))
    )
  }
  
  if (selectedStatus.value !== '') {
    filtered = filtered.filter((p: Prospect) => p.status.toString() === selectedStatus.value)
  }
  
  return filtered
})

// Status helpers
const statusLabels: Record<number, string> = {
  0: 'Ny',
  1: 'Undersökt', 
  2: 'E-post skickad',
  3: 'Svarat',
  4: 'Arkiverad'
}

// Status -> local CSS class names
const getStatusClass = (status: number) => {
  switch (status) {
    case 0: return 'status-new'
    case 1: return 'status-investigated'
    case 2: return 'status-emailed'
    case 3: return 'status-replied'
    case 4: return 'status-archived'
    default: return 'status-unknown'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric'
  })
}

const getStatusLabel = (status: number) => statusLabels[status] || 'Okänd'
// removed Tailwind status color mapping; use getStatusClass() instead

// Load data
onMounted(() => {
  fetchProspects()
})

// Company modal state + helpers
const showCompanyModal = ref(false)
const companyProspect = ref<Prospect | null>(null)
const isGenerating = ref(false)
const generatedEmail = ref<string | null>(null)

const storageKey = (id: string) => `generatedEmail_${id}`

const openCompanyModal = (prospect: Prospect) => {
  companyProspect.value = prospect
  showCompanyModal.value = true
  try {
    const saved = localStorage.getItem(storageKey(prospect.id))
    generatedEmail.value = saved ? saved : null
  } catch (e) {
    generatedEmail.value = null
  }
}

const closeCompanyModal = () => {
  showCompanyModal.value = false
  companyProspect.value = null
  generatedEmail.value = null
}

const generateEmail = async () => {
  if (!companyProspect.value) return
  isGenerating.value = true
  await new Promise(r => setTimeout(r, 400))

  const name = companyProspect.value.contactName || 'Hej'
  const company = companyProspect.value.companyName || ''
  const domain = companyProspect.value.domain ? ` (${companyProspect.value.domain})` : ''

  const subject = `Hej ${name} — kort fråga om ${company}`
  const body = `Hej ${name},\n\nJag heter [Ditt namn] och jobbar med outreach för ${company}${domain}. Jag ville bara höra om ni är intresserade av att diskutera möjligheter att samarbeta kring [kort pitch här].\n\nHälsningar,\n[Ditt namn]`

  generatedEmail.value = `Subject: ${subject}\n\n${body}`
  try { localStorage.setItem(storageKey(companyProspect.value.id), generatedEmail.value) } catch (e) {}
  isGenerating.value = false
}

const clearGeneratedEmail = () => {
  if (!companyProspect.value) return
  try { localStorage.removeItem(storageKey(companyProspect.value.id)) } catch (e) {}
  generatedEmail.value = null
}

const saveEmailToProspect = async () => {
  if (!companyProspect.value || !generatedEmail.value) return
  const current = companyProspect.value.contactEmail
  if (current && !confirm('Det finns redan en e-post sparad för denna kontakt. Vill du skriva över den?')) return

  try {
    isGenerating.value = true
    await api.put(`/prospects/${companyProspect.value.id}`, { contactEmail: generatedEmail.value })
    await fetchProspects()
    const updated = prospects.value.find(p => p.id === companyProspect.value?.id) || null
    companyProspect.value = updated
    isGenerating.value = false
    alert('E-post sparad till prospect')
  } catch (err: any) {
    isGenerating.value = false
    alert(err.response?.data?.error || 'Kunde inte spara e-post på prospect')
  }
}
</script>

<style scoped>
/* Prospects Page Styles */
.prospects-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  min-height: 100vh;
}

.prospects-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.search-input {
  font-size: 0.875rem;
  border: none;
  background: transparent;
  outline: none;
  width: 8rem;
  color: #374151;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  outline: none;
}

.action-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.prospects-table-container {
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 1rem;
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 32rem;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transform: scale(1);
  transition: all 0.3s ease-out;
  border: 1px solid #e5e7eb;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.header-title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: #6b7280;
  background-color: transparent;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: color 0.15s ease-in-out;
}

.modal-close-btn:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.modal-body {
  background-color: white;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

/* Form Styles */
.form-container {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: none;
  min-height: 4rem;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Center table cells for the prospects table so rows look balanced */
/* Table layout: fixed so columns can be evenly distributed. Reduce padding so content
   isn't pushed far from the left edge and columns have equal spacing. */
.prospects-table-container .min-w-full {
  width: 100%;
  table-layout: auto; /* allow columns to size naturally */
}

.prospects-table-container table th,
.prospects-table-container table td {
  vertical-align: middle;
  word-break: break-word;
  padding: 0.6rem 0.75rem;
  text-align: left;
}

/* Action column (view button) should be right aligned and not wrap */
.prospects-table-container td.text-right {
  text-align: right;
  white-space: nowrap;
}

/* Center avatar + name inside the contact cell */
.prospects-table-container td .flex.items-center {
  justify-content: center;
  gap: 0.5rem;
}

/* Ensure status badges are centered and aligned */
.prospects-table-container td .inline-flex {
  margin-left: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

/* Local table styles (no Tailwind) */
.prospects-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto; /* natural sizing */
}
.prospects-thead {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}
.table-header {
  padding: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}
.prospects-tbody .table-row {
  transition: background-color 0.15s ease;
}
.prospects-tbody .table-row:hover {
  background: #f9fafb;
}
.table-cell { padding: 0.75rem; vertical-align: middle; }
.id-cell { color: #111827; font-size: 0.9rem; }
.company-cell { font-weight: 600; color: #111827; }
.col-id { width: 1%; } /* let ID column shrink to minimal width without fixing pixels */
.id-text { display:block; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.contact-inner { display: flex; align-items: center; gap: 0.5rem; }
.avatar { width: 36px; height: 36px; border-radius: 9999px; background: #e5e7eb; display:flex; align-items:center; justify-content:center; }
.avatar-letter { font-size: 0.75rem; color:#374151; font-weight:600 }
.contact-name { color:#111827 }
.email-cell { color:#6b7280 }
.status-badge { display:inline-block; padding: 0.25rem 0.5rem; border-radius:6px; font-size:0.75rem; font-weight:600; }
.status-new { background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe }
.status-investigated { background:#fffbeb; color:#92400e; border:1px solid #fde68a }
.status-emailed { background:#f5f3ff; color:#6d28d9; border:1px solid #ddd6fe }
.status-replied { background:#ecfdf5; color:#166534; border:1px solid #bbf7d0 }
.status-archived { background:#f3f4f6; color:#374151; border:1px solid #e5e7eb }
.status-unknown { background:#fafafa; color:#374151; border:1px solid #e5e7eb }
.actions-cell { text-align: right; white-space:nowrap }
.btn { display:inline-flex; align-items:center; justify-content:center; gap:0.5rem; padding:0.5rem 0.75rem; border-radius:0.375rem; border:1px solid transparent; cursor:pointer; font-weight:600; }
.btn-success { background: #10b981; color: white; border-color: #10b981; }
.btn-success:hover { background:#059669 }
.btn-secondary { background: #f3f4f6; color:#111827; border-color:#e5e7eb }
.view-btn { background: #2563eb; color: white; border: 1px solid #2563eb; padding: 0.4rem 0.7rem; border-radius: 0.375rem; cursor: pointer; font-weight:600 }
.view-btn:hover { background:#1e40af; border-color:#1e40af }

/* Responsive fallback: on small screens revert to auto layout and a bit less padding */
@media (max-width: 640px) {
  .prospects-table-container .min-w-full {
    table-layout: auto;
  }

  .prospects-table-container table th,
  .prospects-table-container table td {
    width: auto;
    padding: 0.5rem 0.6rem;
    text-align: left; /* easier to read on small screens */
  }
}
</style>
