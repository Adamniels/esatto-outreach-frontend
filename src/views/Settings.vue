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
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 m-0">Settings</h2>
      </div>

      <!-- Tabs -->
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
            Email Prompts
          </button>
          <button
            @click="activeTab = 'companyInfo'"
            :class="[
              activeTab === 'companyInfo'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer bg-transparent'
            ]"
          >
            Company Info
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
          <EmailPromptEditor
            :instructions="editingPromptId ? prompts.find(p => p.id === editingPromptId)?.instructions : ''"
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
                <span v-if="prompt.isActive" class="inline-block px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold uppercase">Active</span>
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
            <p class="text-gray-500 mb-4">Inga email prompts hittades</p>
            <button @click="startCreating" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-blue-600">Skapa din första prompt</button>
          </div>
        </div>
      </div>

      <!-- Company Info Tab -->
      <div v-if="activeTab === 'companyInfo'">
        <div v-if="loadingCompanyInfo" class="text-center p-12">
          <p class="text-gray-500">Laddar företagsinformation...</p>
        </div>

        <div v-else-if="companyInfoError" class="text-center p-12">
          <p class="text-red-500 mb-4">{{ companyInfoError }}</p>
          <button @click="loadCompanyInfo" class="px-5 py-2.5 bg-blue-500 text-white border-0 rounded-md text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors">Try again</button>
        </div>

        <div v-else-if="companyInfo" class="flex flex-col gap-6">
          <!-- Overview Section -->
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Overview</h3>
            <div class="text-gray-700 leading-relaxed">
              <p class="whitespace-pre-wrap m-0">{{ companyInfo.overview }}</p>
            </div>
          </div>

          <!-- Filter Section -->
          <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div class="flex flex-col gap-4">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search for case name, industry..."
                class="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
              />
              <div class="flex gap-2 flex-wrap">
                <button
                  @click="filterType = 'all'"
                  class="px-4 py-2 border border-gray-300 rounded-md bg-white cursor-pointer text-sm transition-all hover:bg-gray-50"
                  :class="{ 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600': filterType === 'all' }"
                >
                  All ({{ companyInfo.cases.length }})
                </button>
                <button
                  @click="filterType = 'case'"
                  class="px-4 py-2 border border-gray-300 rounded-md bg-white cursor-pointer text-sm transition-all hover:bg-gray-50"
                  :class="{ 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600': filterType === 'case' }"
                >
                  Cases ({{ companyInfo.cases.filter(c => c.pageType === 'case').length }})
                </button>
                <button
                  @click="filterType = 'service'"
                  class="px-4 py-2 border border-gray-300 rounded-md bg-white cursor-pointer text-sm transition-all hover:bg-gray-50"
                  :class="{ 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600': filterType === 'service' }"
                >
                  Services ({{ companyInfo.cases.filter(c => c.pageType === 'service').length }})
                </button>
              </div>
            </div>
          </div>

          <!-- Cases List -->
          <div class="flex flex-col gap-4">
            <div
              v-for="(caseItem, index) in filteredCases"
              :key="index"
              class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
            >
              <div class="flex justify-between items-center p-4 px-6 cursor-pointer" @click="toggleCase(index)">
                <div class="flex items-center gap-4 flex-1">
                  <span 
                    class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold uppercase"
                    :class="{ 'bg-blue-100 text-blue-800': caseItem.pageType === 'case', 'bg-purple-100 text-purple-800': caseItem.pageType === 'service' }"
                  >
                    {{ caseItem.pageType === 'case' ? 'Case' : 'Service' }}
                  </span>
                  <h4 class="text-lg font-semibold text-gray-900 m-0">{{ caseItem.case.name || caseItem.pageTitle }}</h4>
                  <span v-if="caseItem.case.industry" class="text-sm text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                    {{ caseItem.case.industry }}
                  </span>
                </div>
                <button class="bg-transparent border-none p-1 text-gray-400 cursor-pointer">
                  <svg
                    class="w-6 h-6 transition-transform duration-200"
                    :class="{ 'rotate-180': expandedCases.has(index) }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>

              <div v-if="expandedCases.has(index)" class="p-6 border-t border-gray-100 bg-gray-50/50">
                <div v-if="caseItem.case.challenge" class="mb-4 last:mb-0">
                  <strong class="block text-sm font-semibold text-gray-900 mb-1">Challenge:</strong>
                  <p class="m-0 text-gray-700 leading-relaxed">{{ caseItem.case.challenge }}</p>
                </div>

                <div v-if="caseItem.case.solution" class="mb-4 last:mb-0">
                  <strong class="block text-sm font-semibold text-gray-900 mb-1">Solution:</strong>
                  <p class="m-0 text-gray-700 leading-relaxed">{{ caseItem.case.solution }}</p>
                </div>

                <div v-if="caseItem.case.result" class="mb-4 last:mb-0">
                  <strong class="block text-sm font-semibold text-gray-900 mb-1">Result:</strong>
                  <p class="m-0 text-gray-700 leading-relaxed">{{ caseItem.case.result }}</p>
                </div>

                <div v-if="caseItem.services.length > 0" class="mt-6">
                  <strong class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Services:</strong>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="service in caseItem.services" :key="service" class="px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded text-xs">
                      {{ service }}
                    </span>
                  </div>
                </div>

                <div v-if="caseItem.industries.length > 0" class="mt-4">
                  <strong class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Industries:</strong>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="industry in caseItem.industries" :key="industry" class="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                      {{ industry }}
                    </span>
                  </div>
                </div>

                <div v-if="caseItem.methodsOrTech.length > 0" class="mt-4">
                  <strong class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Methods/Tech:</strong>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="method in caseItem.methodsOrTech" :key="method" class="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-xs">
                      {{ method }}
                    </span>
                  </div>
                </div>

                <div v-if="caseItem.valuesOrTone.length > 0" class="mt-4">
                  <strong class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Values/Tone:</strong>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="value in caseItem.valuesOrTone" :key="value" class="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-xs">
                      {{ value }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="filteredCases.length === 0" class="text-center p-12 bg-white border-2 border-dashed border-gray-300 rounded-lg">
              <p class="text-gray-500">No cases found</p>
            </div>
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
import { ref, onMounted, computed, watch } from 'vue'
import { emailPromptsAPI } from '@/services/emailPrompts'
import { companyInfoAPI, type CompanyInfo, type CaseItem } from '@/services/companyInfo'
import type { EmailPrompt } from '@/types/emailPrompt'
import EmailPromptEditor from '@/components/EmailPromptEditor.vue'
import WorkflowTemplates from '@/components/settings/WorkflowTemplates.vue'

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
    error.value = e.response?.data?.error || 'Could not load email prompts'
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
  if (!confirm('Are you sure you want to activate this prompt? The current active prompt will be deactivated.')) {
    return
  }
  
  try {
    isActivating.value = true
    await emailPromptsAPI.activate(promptId)
    await loadPrompts()
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Could not activate prompt'
    console.error('Failed to activate prompt:', e)
  } finally {
    isActivating.value = false
  }
}

const handleDeletePrompt = async (promptId: string) => {
  if (!confirm('Are you sure you want to delete this prompt? This cannot be undone.')) {
    return
  }
  
  try {
    isDeleting.value = true
    await emailPromptsAPI.delete(promptId)
    await loadPrompts()
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Could not delete prompt'
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

// Watch active tab to load data on demand
watch(activeTab, async (newTab) => {
  if (newTab === 'companyInfo' && !companyInfo.value) {
    await loadCompanyInfo()
  }
})

const loadCompanyInfo = async () => {
  try {
    loadingCompanyInfo.value = true
    companyInfoError.value = null
    companyInfo.value = await companyInfoAPI.get()
  } catch (e: any) {
    companyInfoError.value = e.response?.data?.error || 'Could not load company info'
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
