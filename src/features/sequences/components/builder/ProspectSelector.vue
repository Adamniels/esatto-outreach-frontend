<template>
  <div class="px-4 py-8 max-w-4xl mx-auto space-y-6">
    <div class="border-b border-gray-200 pb-5">
      <h3 class="text-base font-semibold text-gray-900">Enroll Prospects</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ 
          draftSequence?.mode === 'Focused' 
            ? 'Focused mode only allows a single prospect.' 
            : 'Select multiple prospects to execute this sequence against.' 
        }}
      </p>
    </div>

    <!-- Currently Enrolled -->
    <div v-if="draftSequence?.prospects.length" class="space-y-4">
      <h4 class="text-sm font-medium text-gray-700">Currently Enrolled ({{ draftSequence.prospects.length }})</h4>
      <div 
        v-for="sp in draftSequence.prospects" 
        :key="sp.id" 
        class="bg-white border rounded-lg shadow-sm p-4 relative flex items-center gap-4"
      >
        <div class="h-10 w-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
          {{ sp.prospectName.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ sp.prospectName }}</p>
          <p class="text-xs text-gray-500 truncate">Contact: {{ sp.contactPersonName }}</p>
        </div>
        <div class="flex-shrink-0">
          <button @click="removeProspect(sp.id)" class="text-gray-400 hover:text-red-500 p-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="loadingProspects" class="text-center py-4 text-gray-500 flex items-center justify-center">
       <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
         <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
         <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
       </svg>
       Loading available prospects...
    </div>
    <div v-else-if="canAddMore" class="bg-gray-50 rounded-lg p-6 border border-gray-200 mt-6">
      <h4 class="text-sm font-medium text-gray-900 mb-4">Add Prospect</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-700">Select Prospect</label>
          <select v-model="selectedProspectId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option value="">-- Choose a company/prospect --</option>
            <option v-for="p in availableProspects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700">Select Target Contact</label>
          <select v-model="selectedContactId" :disabled="!selectedProspect" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400">
            <option value="">-- Choose a contact person --</option>
            <option v-for="c in selectedProspect?.contactPersons || []" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>
      
      <div class="mt-4 flex justify-end">
        <button 
          type="button" 
          @click="enrollProspect"
          :disabled="isSubmitting || !selectedProspectId || !selectedContactId"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {{ isSubmitting ? 'Enrolling...' : 'Enroll Prospect' }}
        </button>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { prospectsApi } from '@/services/prospects'
import { sequenceApi } from '@/features/sequences/api/sequenceApi'
import { useSequenceBuilder } from '@/features/sequences/composables/useSequenceBuilder'
import { useToast } from '@/composables/useToast'
import type { Prospect } from '@/types/prospect'

const { draftSequence } = useSequenceBuilder()
const { notifyError } = useToast()

const prospects = ref<Prospect[]>([])
const loadingProspects = ref(true)
const isSubmitting = ref(false)

const selectedProspectId = ref('')
const selectedContactId = ref('')

const fetchProspects = async () => {
  try {
    loadingProspects.value = true
    prospects.value = await prospectsApi.getAll()
  } catch(e) {
    notifyError('Failed to load prospects')
  } finally {
    loadingProspects.value = false
  }
}

const availableProspects = computed(() => {
  if (!prospects.value) return []
  // Filter out those already in the draft sequence
  const enrolledIds = draftSequence.value?.prospects.map(p => p.prospectId) || []
  return prospects.value.filter(p => !enrolledIds.includes(p.id))
})

const selectedProspect = computed(() => {
  if (!selectedProspectId.value) return null
  return prospects.value.find(p => p.id === selectedProspectId.value)
})

watch(selectedProspectId, () => {
  selectedContactId.value = ''
})

const canAddMore = computed(() => {
  if (!draftSequence.value) return false
  if (draftSequence.value.mode === 'Focused' && draftSequence.value.prospects.length >= 1) return false
  return true
})

const enrollProspect = async () => {
  if (!draftSequence.value || !selectedProspectId.value || !selectedContactId.value) return
  
  try {
    isSubmitting.value = true
    const result = await sequenceApi.enrollProspect(draftSequence.value.id, {
      prospectId: selectedProspectId.value,
      contactPersonId: selectedContactId.value
    })
    
    draftSequence.value.prospects.push(result)
    selectedProspectId.value = ''
    selectedContactId.value = ''
  } catch(e: any) {
    notifyError(e.response?.data?.error || 'Failed to enroll prospect')
  } finally {
    isSubmitting.value = false
  }
}

const removeProspect = async (prospectDraftId: string) => {
  if (!draftSequence.value) return
  try {
    await sequenceApi.removeProspect(draftSequence.value.id, prospectDraftId)
    draftSequence.value.prospects = draftSequence.value.prospects.filter(p => p.id !== prospectDraftId)
  } catch(e: any) {
    notifyError(e.response?.data?.error || 'Failed to remove prospect')
  }
}

onMounted(() => {
  fetchProspects()
})
</script>
