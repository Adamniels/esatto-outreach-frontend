<template>
  <div class="settings-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Laddar Admin...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="loadPrompts" class="btn-retry">Försök igen</button>
    </div>

    <!-- Settings Content -->
    <div v-else class="settings-content">
      <!-- Header -->
      <div class="settings-header">
        <h2 class="settings-title">Admin</h2>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab"
          :class="{ 'tab-active': activeTab === 'prompts' }"
          @click="activeTab = 'prompts'"
        >
          Email Prompts
        </button>
        <button
          class="tab"
          :class="{ 'tab-active': activeTab === 'companyInfo' }"
          @click="switchToCompanyInfo"
        >
          Företagsinfo
        </button>
      </div>

      <!-- Email Prompts Tab -->
      <div v-if="activeTab === 'prompts'" class="tab-content">
        <!-- Create New Prompt Button -->
        <div v-if="!isCreating && !editingPromptId" class="actions-bar">
          <button @click="startCreating" class="btn-primary">
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Skapa ny prompt
          </button>
        </div>

        <!-- Create/Edit Prompt Form -->
        <div v-if="isCreating || editingPromptId" class="editor-section">
          <EmailPromptEditor
            :instructions="editingPromptId ? prompts.find(p => p.id === editingPromptId)?.instructions : ''"
            :is-new="isCreating"
            :is-saving="isSaving"
            @save="handleSavePrompt"
            @cancel="handleCancelEdit"
          />
        </div>

        <!-- Prompts List -->
        <div v-if="!isCreating && !editingPromptId" class="prompts-list">
          <div
            v-for="prompt in prompts"
            :key="prompt.id"
            class="prompt-card"
            :class="{ 'prompt-active': prompt.isActive }"
          >
            <div class="prompt-header">
              <div class="prompt-info">
                <span v-if="prompt.isActive" class="active-badge">Aktiv</span>
                <span class="prompt-date">
                  Skapad: {{ formatDate(prompt.createdUtc) }}
                </span>
                <span v-if="prompt.updatedUtc !== prompt.createdUtc" class="prompt-date">
                  Uppdaterad: {{ formatDate(prompt.updatedUtc) }}
                </span>
              </div>
              <div class="prompt-actions">
                <button
                  v-if="!prompt.isActive"
                  @click="handleActivatePrompt(prompt.id)"
                  :disabled="isActivating"
                  class="btn-activate"
                  title="Aktivera denna prompt"
                >
                  {{ isActivating ? 'Aktiverar...' : 'Aktivera' }}
                </button>
                <button
                  @click="startEditing(prompt.id)"
                  class="btn-edit"
                  title="Redigera"
                >
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  v-if="!prompt.isActive"
                  @click="handleDeletePrompt(prompt.id)"
                  :disabled="isDeleting"
                  class="btn-delete"
                  title="Ta bort"
                >
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="prompt-content">
              <pre class="prompt-text">{{ prompt.instructions }}</pre>
            </div>
          </div>

          <div v-if="prompts.length === 0" class="empty-state">
            <p>Inga email prompts hittades</p>
            <button @click="startCreating" class="btn-primary">Skapa din första prompt</button>
          </div>
        </div>
      </div>

      <!-- Company Info Tab -->
      <div v-if="activeTab === 'companyInfo'" class="tab-content">
        <div v-if="loadingCompanyInfo" class="loading-section">
          <p>Laddar företagsinformation...</p>
        </div>

        <div v-else-if="companyInfoError" class="error-section">
          <p class="error-message">{{ companyInfoError }}</p>
          <button @click="loadCompanyInfo" class="btn-retry">Försök igen</button>
        </div>

        <div v-else-if="companyInfo" class="company-info-section">
          <!-- Overview Section -->
          <div class="info-card">
            <h3 class="info-title">Översikt</h3>
            <div class="info-content">
              <p class="overview-text">{{ companyInfo.overview }}</p>
            </div>
          </div>

          <!-- Filter Section -->
          <div class="filter-section">
            <div class="filter-controls">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Sök efter case namn, industri..."
                class="search-input"
              />
              <div class="filter-buttons">
                <button
                  @click="filterType = 'all'"
                  class="filter-btn"
                  :class="{ 'filter-active': filterType === 'all' }"
                >
                  Alla ({{ companyInfo.cases.length }})
                </button>
                <button
                  @click="filterType = 'case'"
                  class="filter-btn"
                  :class="{ 'filter-active': filterType === 'case' }"
                >
                  Cases ({{ companyInfo.cases.filter(c => c.pageType === 'case').length }})
                </button>
                <button
                  @click="filterType = 'service'"
                  class="filter-btn"
                  :class="{ 'filter-active': filterType === 'service' }"
                >
                  Services ({{ companyInfo.cases.filter(c => c.pageType === 'service').length }})
                </button>
              </div>
            </div>
          </div>

          <!-- Cases List -->
          <div class="cases-list">
            <div
              v-for="(caseItem, index) in filteredCases"
              :key="index"
              class="case-card"
            >
              <div class="case-header" @click="toggleCase(index)">
                <div class="case-title-section">
                  <span class="case-type-badge" :class="caseItem.pageType">
                    {{ caseItem.pageType === 'case' ? 'Case' : 'Service' }}
                  </span>
                  <h4 class="case-name">{{ caseItem.case.name || caseItem.pageTitle }}</h4>
                  <span v-if="caseItem.case.industry" class="case-industry">
                    {{ caseItem.case.industry }}
                  </span>
                </div>
                <button class="expand-btn">
                  <svg
                    class="expand-icon"
                    :class="{ 'expanded': expandedCases.has(index) }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>

              <div v-if="expandedCases.has(index)" class="case-details">
                <div v-if="caseItem.case.challenge" class="detail-section">
                  <strong>Utmaning:</strong>
                  <p>{{ caseItem.case.challenge }}</p>
                </div>

                <div v-if="caseItem.case.solution" class="detail-section">
                  <strong>Lösning:</strong>
                  <p>{{ caseItem.case.solution }}</p>
                </div>

                <div v-if="caseItem.case.result" class="detail-section">
                  <strong>Resultat:</strong>
                  <p>{{ caseItem.case.result }}</p>
                </div>

                <div v-if="caseItem.services.length > 0" class="tags-section">
                  <strong>Tjänster:</strong>
                  <div class="tags">
                    <span v-for="service in caseItem.services" :key="service" class="tag tag-service">
                      {{ service }}
                    </span>
                  </div>
                </div>

                <div v-if="caseItem.industries.length > 0" class="tags-section">
                  <strong>Industrier:</strong>
                  <div class="tags">
                    <span v-for="industry in caseItem.industries" :key="industry" class="tag tag-industry">
                      {{ industry }}
                    </span>
                  </div>
                </div>

                <div v-if="caseItem.methodsOrTech.length > 0" class="tags-section">
                  <strong>Metoder/Tech:</strong>
                  <div class="tags">
                    <span v-for="method in caseItem.methodsOrTech" :key="method" class="tag tag-method">
                      {{ method }}
                    </span>
                  </div>
                </div>

                <div v-if="caseItem.valuesOrTone.length > 0" class="tags-section">
                  <strong>Värderingar/Ton:</strong>
                  <div class="tags">
                    <span v-for="value in caseItem.valuesOrTone" :key="value" class="tag tag-value">
                      {{ value }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="filteredCases.length === 0" class="empty-state">
              <p>Inga cases hittades</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { emailPromptsAPI } from '@/services/emailPrompts'
import { companyInfoAPI, type CompanyInfo, type CaseItem } from '@/services/companyInfo'
import type { EmailPrompt } from '@/types/emailPrompt'
import EmailPromptEditor from '@/components/EmailPromptEditor.vue'

const loading = ref(true)
const error = ref<string | null>(null)
const prompts = ref<EmailPrompt[]>([])
const activeTab = ref('prompts')
const isCreating = ref(false)
const editingPromptId = ref<string | null>(null)
const isSaving = ref(false)
const isActivating = ref(false)
const isDeleting = ref(false)

// Company Info state
const loadingCompanyInfo = ref(false)
const companyInfoError = ref<string | null>(null)
const companyInfo = ref<CompanyInfo | null>(null)
const expandedCases = ref<Set<number>>(new Set())
const searchQuery = ref('')
const filterType = ref<'all' | 'case' | 'service'>('all')

// Computed filtered cases
const filteredCases = computed(() => {
  if (!companyInfo.value) return []
  
  let cases = companyInfo.value.cases
  
  // Filter by type
  if (filterType.value !== 'all') {
    cases = cases.filter(c => c.pageType === filterType.value)
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    cases = cases.filter(c =>
      c.case.name.toLowerCase().includes(query) ||
      c.case.industry.toLowerCase().includes(query) ||
      c.pageTitle.toLowerCase().includes(query)
    )
  }
  
  return cases
})

onMounted(() => {
  loadPrompts()
})

const loadPrompts = async () => {
  try {
    loading.value = true
    error.value = null
    prompts.value = await emailPromptsAPI.getAll()
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Kunde inte ladda email prompts'
    console.error('Failed to load prompts:', e)
  } finally {
    loading.value = false
  }
}

const startCreating = () => {
  isCreating.value = true
  editingPromptId.value = null
}

const startEditing = (promptId: string) => {
  editingPromptId.value = promptId
  isCreating.value = false
}

const handleCancelEdit = () => {
  isCreating.value = false
  editingPromptId.value = null
}

const handleSavePrompt = async (instructions: string) => {
  try {
    isSaving.value = true
    
    if (isCreating.value) {
      // Create new prompt
      await emailPromptsAPI.create({ instructions, isActive: false })
    } else if (editingPromptId.value) {
      // Update existing prompt
      await emailPromptsAPI.update(editingPromptId.value, { instructions })
    }
    
    // Reload prompts
    await loadPrompts()
    
    // Reset state
    isCreating.value = false
    editingPromptId.value = null
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Kunde inte spara prompt'
    console.error('Failed to save prompt:', e)
  } finally {
    isSaving.value = false
  }
}

const handleActivatePrompt = async (promptId: string) => {
  if (!confirm('Är du säker på att du vill aktivera denna prompt? Den nuvarande aktiva prompten kommer att inaktiveras.')) {
    return
  }
  
  try {
    isActivating.value = true
    await emailPromptsAPI.activate(promptId)
    await loadPrompts()
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Kunde inte aktivera prompt'
    console.error('Failed to activate prompt:', e)
  } finally {
    isActivating.value = false
  }
}

const handleDeletePrompt = async (promptId: string) => {
  if (!confirm('Är du säker på att du vill ta bort denna prompt? Detta går inte att ångra.')) {
    return
  }
  
  try {
    isDeleting.value = true
    await emailPromptsAPI.delete(promptId)
    await loadPrompts()
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Kunde inte ta bort prompt'
    console.error('Failed to delete prompt:', e)
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const switchToCompanyInfo = async () => {
  activeTab.value = 'companyInfo'
  if (!companyInfo.value) {
    await loadCompanyInfo()
  }
}

const loadCompanyInfo = async () => {
  try {
    loadingCompanyInfo.value = true
    companyInfoError.value = null
    companyInfo.value = await companyInfoAPI.get()
  } catch (e: any) {
    companyInfoError.value = e.response?.data?.error || 'Kunde inte ladda företagsinformation'
    console.error('Failed to load company info:', e)
  } finally {
    loadingCompanyInfo.value = false
  }
}

const toggleCase = (index: number) => {
  if (expandedCases.value.has(index)) {
    expandedCases.value.delete(index)
  } else {
    expandedCases.value.add(index)
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
}

.error-message {
  color: #ef4444;
  margin-bottom: 1rem;
}

.btn-retry {
  padding: 0.625rem 1.25rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 2rem;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #111827;
}

.tab-active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.actions-bar {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.editor-section {
  margin-bottom: 2rem;
}

.prompts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prompt-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s;
}

.prompt-active {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.prompt-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.active-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.prompt-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.prompt-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-activate,
.btn-edit,
.btn-delete {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-activate {
  font-size: 0.875rem;
  font-weight: 500;
  color: #3b82f6;
  border-color: #3b82f6;
}

.btn-activate:hover:not(:disabled) {
  background-color: #3b82f6;
  color: white;
}

.btn-activate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-edit:hover {
  background-color: #f3f4f6;
}

.btn-delete {
  color: #ef4444;
  border-color: #ef4444;
}

.btn-delete:hover:not(:disabled) {
  background-color: #ef4444;
  color: white;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  width: 1rem;
  height: 1rem;
}

.prompt-content {
  background: #f9fafb;
  border-radius: 6px;
  padding: 1rem;
}

.prompt-text {
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  color: #374151;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1rem;
}

/* Company Info Styles */
.company-info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.info-content {
  color: #374151;
  line-height: 1.6;
}

.overview-text {
  white-space: pre-wrap;
  margin: 0;
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f3f4f6;
}

.filter-active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.filter-active:hover {
  background: #2563eb;
}

.cases-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.case-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.case-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  background: white;
  transition: background-color 0.2s;
}

.case-header:hover {
  background: #f9fafb;
}

.case-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.case-type-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.case-type-badge.case {
  background: #dbeafe;
  color: #1e40af;
}

.case-type-badge.service {
  background: #d1fae5;
  color: #065f46;
}

.case-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.case-industry {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6b7280;
  transition: color 0.2s;
}

.expand-btn:hover {
  color: #111827;
}

.expand-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: transform 0.2s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.case-details {
  padding: 0 1.5rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.detail-section {
  margin-top: 1rem;
}

.detail-section strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 600;
}

.detail-section p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.tags-section {
  margin-top: 1rem;
}

.tags-section strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 600;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.tag-service {
  background: #eff6ff;
  color: #1e40af;
}

.tag-industry {
  background: #fef3c7;
  color: #92400e;
}

.tag-method {
  background: #f3e8ff;
  color: #6b21a8;
}

.tag-value {
  background: #dcfce7;
  color: #166534;
}

.loading-section,
.error-section {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
}
</style>
