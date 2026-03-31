<template>
  <div class="h-full flex flex-col p-6 max-w-7xl mx-auto space-y-6">
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ sequence?.title || 'Sequence Overview' }}</h1>
        <p class="mt-1 text-sm text-gray-500">{{ sequence?.description || 'Review sequence details and generated outreach text.' }}</p>
      </div>
      <div v-if="sequence && !isGenerating" class="flex gap-2">
        <span 
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          :class="statusBadgeClass(sequence.status)"
        >
          {{ sequence.status }}
        </span>
        
        <button
          @click="deleteSequence"
          :disabled="isSubmitting"
          class="inline-flex items-center px-4 py-2 border border-red-200 shadow-sm text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
        <button 
          v-if="sequence.status === 'Draft' || sequence.status === 'Paused'"
          @click="activateSequence"
          :disabled="isSubmitting"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          Activate Sequence
        </button>
      </div>
    </div>
    
    <!-- Background Generation State -->
    <div v-if="isGenerating" class="bg-white shadow sm:rounded-lg border border-gray-200 p-12 flex flex-col items-center justify-center flex-1">
      <svg class="animate-spin h-10 w-10 mx-auto text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h3 class="mt-2 text-lg font-medium text-gray-900">Generating outreach material...</h3>
      <p class="mt-2 text-sm text-gray-500 max-w-md mx-auto text-center">
        We are analyzing the prospects and researching data uniquely for the compiled sequence. 
        This process can take a while. You are free to leave this page—you will receive a notification when the generation is complete.
      </p>
      <button @click="refreshState" class="mt-6 text-sm text-indigo-600 hover:underline">
        Check Status Manually
      </button>
    </div>

    <!-- Active Overview -->
    <div v-else-if="sequence" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Steps & Content List -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white border rounded-lg shadow-sm">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="text-sm font-semibold text-gray-900">Configured Steps & Content</h3>
          </div>
          <div class="p-4 space-y-6">
            <div v-for="step in sortedSteps" :key="step.id" class="relative pl-6 pb-6">
              <!-- Timeline line -->
              <span class="absolute top-4 left-2 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              
              <div class="relative flex items-start space-x-3">
                <div class="relative">
                  <span class="h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white mt-1"></span>
                </div>
                <div class="min-w-0 flex-1 bg-gray-50 rounded-md p-4 border border-gray-100">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-semibold text-gray-900">{{ step.stepType.replace(/([A-Z])/g, ' $1').trim() }}</span>
                    <span class="text-xs text-gray-500">Wait length: {{ step.delayInDays }} Days</span>
                  </div>
                  
                  <div class="mt-2 relative group">
                    <div 
                      v-if="step.generatedBody"
                      :contenteditable="sequence.status === 'Draft' || sequence.status === 'Paused'"
                      @blur="updateStepContent(step.id, ($event.target as HTMLElement).innerHTML)"
                      class="text-sm text-gray-800 bg-white p-4 rounded border shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] prose prose-sm max-w-none transition-colors hover:border-indigo-300"
                      v-html="step.generatedBody"
                    ></div>
                    <div v-else class="text-sm text-gray-700 bg-gray-50 p-4 rounded border min-h-[100px] flex items-center justify-center text-amber-600 italic">
                      Content has not been generated for this step yet.
                    </div>
                    
                    <div v-if="step.generatedBody && (sequence.status === 'Draft' || sequence.status === 'Paused')" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-xs text-indigo-500 font-medium bg-white/90 px-2 py-1 rounded shadow-sm border border-indigo-100">
                      Click text to edit
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <!-- Sidebar Status -->
      <div class="space-y-6">
        <div class="bg-white border rounded-lg shadow-sm p-4">
          <h3 class="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">Sequence Specs</h3>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-500">Mode</dt>
              <dd class="font-medium text-gray-900">{{ sequence.mode }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Enrolled Prospects</dt>
              <dd class="font-medium text-gray-900">{{ sequence.prospects.length }}</dd>
            </div>
            <div class="flex justify-between">
               <dt class="text-gray-500">Total Steps</dt>
               <dd class="font-medium text-gray-900">{{ sequence.steps.length }}</dd>
            </div>
          </dl>
        </div>

        <div class="bg-white border rounded-lg shadow-sm p-4">
          <h3 class="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">Sequence Settings</h3>
          <dl class="space-y-3 text-sm">
            <template v-if="sequence.mode === 'Focused'">
              <div class="flex justify-between">
                <dt class="text-gray-500">Enrich Company Data</dt>
                <dd class="font-medium" :class="sequence.settings.enrichCompany ? 'text-green-600' : 'text-gray-400'">{{ sequence.settings.enrichCompany ? 'Yes' : 'No' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Enrich Contact Data</dt>
                <dd class="font-medium" :class="sequence.settings.enrichContact ? 'text-green-600' : 'text-gray-400'">{{ sequence.settings.enrichContact ? 'Yes' : 'No' }}</dd>
              </div>
            </template>
            <template v-else-if="sequence.mode === 'Multi'">
              <div class="flex justify-between">
                <dt class="text-gray-500">Research Similarities</dt>
                <dd class="font-medium" :class="sequence.settings.researchSimilarities ? 'text-green-600' : 'text-gray-400'">{{ sequence.settings.researchSimilarities ? 'Yes' : 'No' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Prospects / Day</dt>
                <dd class="font-medium text-gray-900">{{ sequence.settings.maxActiveProspectsPerDay || 'Unlimited' }}</dd>
              </div>
            </template>
          </dl>
        </div>

        <div class="bg-white border rounded-lg shadow-sm p-4">
          <h3 class="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">Enrolled Prospects</h3>
          <ul class="space-y-3">
            <li v-for="p in sequence.prospects" :key="p.id" class="text-sm flex justify-between">
               <span class="text-gray-900 font-medium">{{ p.prospectName }}</span>
               <span class="text-gray-500 text-xs">{{ p.status }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sequenceApi } from '@/features/sequences/api/sequenceApi'
import { useToast } from '@/composables/useToast'
import type { SequenceDetailsDto } from '@/types/sequence'
import { confirmDialog } from '@/shared/utils/dialog'

const route = useRoute()
const router = useRouter()
const sequenceId = route.params.id as string
const { notifyError, notifySuccess } = useToast()

const sequence = ref<SequenceDetailsDto | null>(null)
const isSubmitting = ref(false)
let pollingInterval: number | null = null

const isGenerating = computed(() => {
  if (!sequence.value) return true
  // If it's Draft, and any step is missing generatedBody, we assume it's still generating
  if (sequence.value.status === 'Draft' && sequence.value.steps.some(s => !s.generatedBody)) {
    return true
  }
  return false
})

const sortedSteps = computed(() => {
  if (!sequence.value?.steps) return []
  return [...sequence.value.steps].sort((a, b) => a.orderIndex - b.orderIndex)
})

const fetchSequence = async () => {
  try {
    sequence.value = await sequenceApi.getById(sequenceId)
    
    // Safety redirect if still in setup
    if (sequence.value.status === 'Setup') {
      router.replace(`/sequences/build?id=${sequenceId}`)
      return
    }

    // Stop polling if generation is complete natively
    if (!isGenerating.value && pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  } catch (e: any) {
    if (!pollingInterval) notifyError(e.response?.data?.error || 'Failed to fetch sequence details')
  }
}

const refreshState = () => {
  fetchSequence()
}

const activateSequence = async () => {
  try {
    isSubmitting.value = true
    await sequenceApi.activate(sequenceId)
    notifySuccess('Sequence activated! It is now running in the background orchestrator.')
    await fetchSequence()
  } catch (e: any) {
    notifyError(e.response?.data?.error || 'Failed to activate sequence')
  } finally {
    isSubmitting.value = false
  }
}

const updateStepContent = async (stepId: string, newHtml: string) => {
  if (!sequence.value || !newHtml) return;
  const step = sequence.value.steps.find(s => s.id === stepId);
  if (!step || step.generatedBody === newHtml) return;

  try {
    step.generatedBody = newHtml;
    await sequenceApi.updateStepContent(sequenceId, stepId, {
      generatedBody: newHtml,
      generatedSubject: step.generatedSubject
    });
  } catch (e: any) {
    notifyError(e.response?.data?.error || 'Failed to save text edits');
    fetchSequence();
  }
}

const deleteSequence = async () => {
  if (!sequence.value) return;
  if (confirmDialog(`Are you sure you want to delete the sequence "${sequence.value.title}"?`)) {
    try {
      isSubmitting.value = true;
      await sequenceApi.delete(sequenceId);
      notifySuccess('Sequence deleted');
      // No need to clear interval manually here, onUnmounted handles it
      router.push('/sequences');
    } catch (e: any) {
      notifyError(e.response?.data?.error || 'Failed to delete sequence');
      isSubmitting.value = false;
    }
  }
}

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'Setup': return 'bg-gray-100 text-gray-500'
    case 'Active': return 'bg-green-100 text-green-800'
    case 'Draft': return 'bg-gray-100 text-gray-800'
    case 'Paused': return 'bg-yellow-100 text-yellow-800'
    case 'Completed': return 'bg-blue-100 text-blue-800'
    case 'Archived': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  fetchSequence()
  // Poll every 5s just in case we are in generating state
  pollingInterval = window.setInterval(fetchSequence, 5000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>
