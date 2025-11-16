<template>
  <div class="settings-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Laddar inställningar...</p>
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
        <h2 class="settings-title">Inställningar</h2>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { emailPromptsAPI } from '@/services/emailPrompts'
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
</style>
