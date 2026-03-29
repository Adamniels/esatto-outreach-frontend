<template>
  <div class="flex flex-col gap-6 p-7 min-h-screen">
    <!-- Top Controls -->
    <div class="flex items-center justify-between p-4 px-7 bg-white rounded-lg border border-gray-200">
      <div class="flex items-center gap-4 flex-wrap">
        <!-- Filter Dropdown Component -->
        <FilterDropdown
          v-model="filterState"
          :prospects="prospects"
          @clear="clearFilters"
        />
        
        <!-- Sort Dropdown Component -->
        <SortDropdown
          v-model="sortState"
          @reset="resetSort"
        />
        
        <!-- Search Input -->
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input v-model="filterState.search" type="text" placeholder="Search..." class="text-sm border-none bg-transparent outline-none w-32 text-gray-700 placeholder:text-gray-400 focus:outline-none" />
        </div>
        
        <!-- Filter Stats -->
        <div v-if="filterStats.isFiltered" class="flex items-center px-3 py-2 bg-gray-100 rounded-md border border-gray-200">
          <span class="text-sm font-medium text-gray-500">{{ filterStats.showing }} of {{ filterStats.total }}</span>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <button @click="openCreateModal" class="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium leading-5 rounded-md border border-transparent bg-emerald-500 text-white transition-all duration-200 ease-in-out cursor-pointer hover:bg-emerald-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Add New</button>
      </div>
    </div>

    <!-- Main Table -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <svg class="w-6 h-6 mb-2 text-gray-500 animate-spin mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <p class="text-sm text-gray-500">Loading prospects...</p>
      </div>

      <div v-else-if="error" class="text-center py-12 bg-red-50 border border-red-200 rounded-lg mx-4 my-4">
        <svg class="w-6 h-6 mb-2 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <p class="text-base font-medium text-red-700 mb-4">{{ error }}</p>
        <button @click="fetchProspects" class="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium leading-5 rounded-md border border-gray-300 bg-white text-gray-700 transition-all duration-200 ease-in-out cursor-pointer hover:bg-gray-50 hover:border-gray-400 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Try again</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse">
          <colgroup>
            <col class="w-16" />
            <col class="" />
            <col class="w-64" />
            <col class="w-32" />
            <col class="w-40" />
          </colgroup>
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Websites</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"> </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-for="prospect in sortedProspects" :key="prospect.id" class="transition-colors hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap"><span class="font-mono text-xs text-gray-400" :title="prospect.id">{{ prospect.id }}</span></td>
              <td class="px-6 py-4 font-medium text-gray-900 text-sm">{{ prospect.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-[200px]">{{ prospect.websites[0]?.url || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium', getStatusClass(prospect.status)]">{{ getStatusLabel(prospect.status) }}</span>
              </td>
              <td class="px-6 py-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-2">
                  <button @click="router.push(`/prospects/${prospect.id}`)" class="text-blue-600 hover:text-blue-900 text-sm font-medium bg-transparent border-none cursor-pointer p-1">View</button>
                  <button @click="confirmDelete(prospect)" class="text-red-600 hover:text-red-900 text-sm font-medium bg-transparent border-none cursor-pointer p-1">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="sortedProspects.length === 0" class="text-center py-12 bg-gray-50 m-4 rounded-lg border-2 border-dashed border-gray-200">
          <p class="text-lg font-semibold text-gray-800 mb-2">No prospects found</p>
          <p class="text-sm text-gray-500">{{ filterStats.isFiltered ? 'Try changing your filters or search' : 'Add your first prospect to get started' }}</p>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <h3 class="text-xl font-bold text-gray-900 m-0">Add New Prospect</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none text-2xl leading-none cursor-pointer">✕</button>
          </div>
        </div>
        <div class="p-6 overflow-y-auto">
          <form @submit.prevent="saveProspect" class="flex flex-col gap-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5 required">Company Name</label>
              <input v-model="formData.name" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. Acme Corp" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Websites (one per line)</label>
              <textarea 
                v-model="formData.websitesText" 
                rows="2" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans resize-y min-h-[80px]" 
                placeholder="https://acme.com&#10;https://shop.acme.com"
              ></textarea>
              <small class="block mt-1 text-xs text-gray-500">One URL per line</small>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
              <textarea v-model="formData.notes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans resize-y min-h-[100px]" placeholder="Notes about this prospect..."></textarea>
            </div>
          </form>
        </div>
        <div class="p-4 px-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
          <button @click="closeModal" :disabled="isSubmitting" class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-semibold cursor-pointer hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button @click="saveProspect" :disabled="isSubmitting" class="px-4 py-2 bg-emerald-500 text-white border border-emerald-500 rounded-md text-sm font-semibold cursor-pointer hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2">
            <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isSubmitting ? 'Saving...' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProspects } from '@/composables/useProspects'
import { useProspectFilters } from '@/composables/useProspectFilters'
import { statusLabels as STATUS_LABELS, type Prospect, type ProspectStatus } from '@/types/prospect'
import FilterDropdown from '@/components/FilterDropdown.vue'
import SortDropdown from '@/components/SortDropdown.vue'
import { splitLines } from '@/shared/utils/text'
import { getProspectStatusClass } from '@/shared/utils/prospectStatus'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { confirmDialog } from '@/shared/utils/dialog'

const router = useRouter()

// Use composable for prospects management
const { prospects, loading, error, fetchProspects, createProspect, deleteProspect } = useProspects()

// Use composable for filtering and sorting
const {
  filterState,
  sortState,
  sortedProspects,
  filterStats,
  clearFilters,
  resetSort
} = useProspectFilters(prospects)

interface ProspectFormData {
  name: string
  websitesText: string
  notes: string
}

// State
const showCreateModal = ref(false)
const isSubmitting = ref(false)

const statusLabels = STATUS_LABELS

const createEmptyForm = (): ProspectFormData => ({
  name: '',
  websitesText: '',
  notes: ''
})

const formData = ref<ProspectFormData>(createEmptyForm())

// Functions
const saveProspect = async () => {
  if (!formData.value.name.trim()) return
  
  isSubmitting.value = true
  try {
    // Create: send all fields
    const createPayload = {
      name: formData.value.name.trim(),
      websites: splitLines(formData.value.websitesText),
      notes: formData.value.notes || undefined
    }
    await createProspect(createPayload)
    
    closeModal()
    closeModal()
  } catch (err: unknown) {
    error.value = getApiErrorMessage(err, 'Could not save prospect')
  } finally {
    isSubmitting.value = false
  }
}

const openCreateModal = () => {
  formData.value = createEmptyForm()
  showCreateModal.value = true
}

const confirmDelete = async (prospect: Prospect) => {
  if (confirmDialog(`Are you sure you want to delete "${prospect.name}"?`)) {
    try {
      await deleteProspect(prospect.id)
    } catch (err: unknown) {
      // Error already handled by composable
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  formData.value = createEmptyForm()
}

// Status -> local CSS class names
const getStatusClass = (status: ProspectStatus) => getProspectStatusClass(status)

const getStatusLabel = (status: number) => statusLabels[status as ProspectStatus] || 'Unknown'

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  const parsed = new Date(dateString)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDomainUrl = (domain: string) => {
  if (!domain) return '#'
  return /^https?:\/\//i.test(domain) ? domain : `https://${domain}`
}
</script>
