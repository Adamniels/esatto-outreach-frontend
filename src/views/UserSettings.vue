<template>
  <div class="max-w-7xl mx-auto p-8">
    <!-- Loading State -->
    <div v-if="loading" class="text-center p-12">
      <p class="text-gray-500">Loading Settings...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center p-12">
      <p class="text-red-500 mb-4">{{ error }}</p>
      <button @click="loadPrompts" class="px-5 py-2.5 bg-blue-500 text-white border-0 rounded-md text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors">Try again</button>
    </div>

    <!-- Settings Content -->
    <div v-else>
      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            @click="activeTab = 'prompts'"
            :class="[
              activeTab === 'prompts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer bg-transparent'
            ]"
          >
            Outreach Prompts
          </button>
          <button
            @click="activeTab = 'workflows'"
            :class="[
              activeTab === 'workflows'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer bg-transparent'
            ]"
          >
            Workflow Templates
          </button>
        </nav>
      </div>

      <!-- Email Prompts Tab -->
      <div v-if="activeTab === 'prompts'">
        <!-- Create New Prompt Button -->
        <div v-if="!isCreating && !editingPromptId" class="mb-6 flex justify-end">
          <button @click="startCreating" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-blue-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Create new prompt
          </button>
        </div>

        <!-- Create/Edit Prompt Form -->
        <div v-if="isCreating || editingPromptId" class="mb-8">
          <OutreachPromptEditor
            :instructions="editingPromptId ? prompts.find(p => p.id === editingPromptId)?.instructions : ''"
            :type="editingPromptId ? prompts.find(p => p.id === editingPromptId)?.type : 'Email'"
            :is-new="isCreating"
            :is-saving="isSaving"
            @save="handleSavePrompt"
            @cancel="handleCancelEdit"
          />
        </div>

        <!-- Prompts List -->
        <div v-if="!isCreating && !editingPromptId" class="flex flex-col gap-4">
          <div
            v-for="prompt in prompts"
            :key="prompt.id"
            class="bg-white border-2 border-gray-200 rounded-lg p-6 transition-all"
            :class="{ 'border-blue-500 bg-blue-50': prompt.isActive }"
          >
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center gap-4 flex-wrap">
                <span class="text-sm text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-md">Type: {{ prompt.type }}</span>
                <span class="text-sm text-gray-500">
                  Created: {{ formatDate(prompt.createdUtc) }}
                </span>
                <span v-if="prompt.updatedUtc !== prompt.createdUtc" class="text-sm text-gray-500">
                  Updated: {{ formatDate(prompt.updatedUtc) }}
                </span>
              </div>
              <div class="flex gap-2">
                <button
                  v-if="!prompt.isActive"
                  @click="handleActivatePrompt(prompt.id)"
                  :disabled="isActivating"
                  class="px-3 py-2 border border-blue-500 rounded-md bg-white cursor-pointer transition-all text-sm font-medium text-blue-500 hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Aktivera denna prompt"
                >
                  {{ isActivating ? 'Activating...' : 'Activate' }}
                </button>
                <button
                  @click="startEditing(prompt.id)"
                  class="px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer transition-all hover:bg-gray-100"
                  title="Redigera"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  v-if="!prompt.isActive"
                  @click="handleDeletePrompt(prompt.id)"
                  :disabled="isDeleting"
                  class="px-3 py-2 border border-red-500 rounded-md bg-white cursor-pointer transition-all text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Ta bort"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="bg-gray-50 rounded-md p-4">
              <pre class="m-0 font-mono text-sm text-gray-700 whitespace-pre-wrap break-words">{{ prompt.instructions }}</pre>
            </div>
          </div>

          <div v-if="prompts.length === 0" class="text-center p-12 bg-white border-2 border-dashed border-gray-300 rounded-lg">
            <p class="text-gray-500 mb-4">Inga outreach prompts hittades</p>
            <button @click="startCreating" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-blue-600">Skapa din första prompt</button>
          </div>
        </div>
      </div>

      <!-- Workflow Templates Tab -->
      <div v-if="activeTab === 'workflows'">
        <WorkflowTemplates />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { outreachPromptsApi } from '@/features/settings/api/outreachPromptsApi'
import type { OutreachPrompt, PromptType } from '@/types/outreachPrompt'
import OutreachPromptEditor from '@/components/OutreachPromptEditor.vue'
import WorkflowTemplates from '@/components/settings/WorkflowTemplates.vue'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { confirmDialog } from '@/shared/utils/dialog'

const loading = ref(true)
const error = ref<string | null>(null)
const prompts = ref<OutreachPrompt[]>([])
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
    prompts.value = await outreachPromptsApi.getAll()
  } catch (e: unknown) {
    error.value = getApiErrorMessage(e, 'Could not load outreach prompts')
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

const handleSavePrompt = async (instructions: string, type: string) => {
  try {
    isSaving.value = true
    
    if (isCreating.value) {
      await outreachPromptsApi.create({ instructions, type: type as PromptType, isActive: false })
    } else if (editingPromptId.value) {
      await outreachPromptsApi.update(editingPromptId.value, { instructions })
    }
    
    await loadPrompts()
    
    isCreating.value = false
    editingPromptId.value = null
  } catch (e: unknown) {
    error.value = getApiErrorMessage(e, 'Kunde inte spara prompt')
    console.error('Failed to save prompt:', e)
  } finally {
    isSaving.value = false
  }
}

const handleActivatePrompt = async (promptId: string) => {
  if (!confirmDialog('Are you sure you want to activate this prompt? The current active prompt will be deactivated.')) {
    return
  }
  
  try {
    isActivating.value = true
    await outreachPromptsApi.activate(promptId)
    await loadPrompts()
  } catch (e: unknown) {
    error.value = getApiErrorMessage(e, 'Could not activate prompt')
    console.error('Failed to activate prompt:', e)
  } finally {
    isActivating.value = false
  }
}

const handleDeletePrompt = async (promptId: string) => {
  if (!confirmDialog('Are you sure you want to delete this prompt? This cannot be undone.')) {
    return
  }
  
  try {
    isDeleting.value = true
    await outreachPromptsApi.delete(promptId)
    await loadPrompts()
  } catch (e: unknown) {
    error.value = getApiErrorMessage(e, 'Could not delete prompt')
    console.error('Failed to delete prompt:', e)
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
