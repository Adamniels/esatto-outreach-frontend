<template>
  <div class="px-4 py-8 max-w-4xl mx-auto space-y-6">
    <div class="border-b border-gray-200 pb-5">
      <h3 class="text-base font-semibold text-gray-900">Outreach Steps</h3>
      <p class="mt-1 text-sm text-gray-500">Define the sequential actions to be taken for prospects in this campaign.</p>
    </div>

    <div v-if="draftSequence?.steps.length" class="space-y-4">
      <div 
        v-for="step in sortedSteps" 
        :key="step.id" 
        class="bg-white border rounded-lg shadow-sm p-4 relative flex items-center gap-6"
      >
        <div class="flex-shrink-0 text-xl font-bold text-gray-300 w-10 text-center">
          {{ step.orderIndex + 1 }}
        </div>
        <div class="flex-1">
          <h4 class="text-md font-medium text-gray-900">{{ formatStepType(step.stepType) }}</h4>
          <p class="text-xs text-gray-500 mt-1">Wait {{ step.delayInDays }} days before execution.</p>
        </div>
        <div class="flex-shrink-0">
          <button @click="deleteStep(step.id)" class="text-red-500 hover:text-red-700 p-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <p class="text-sm text-gray-500">No steps added yet.</p>
    </div>

    <!-- Add Step Form -->
    <div class="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
      <h4 class="text-sm font-medium text-indigo-900 mb-4">Add a new Step</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-xs font-medium text-gray-700">Type</label>
          <select v-model="form.stepType" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option value="Email">Email</option>
            <option value="LinkedInConnectionRequest">LinkedIn Connect</option>
            <option value="LinkedInMessage">LinkedIn Message</option>
            <option value="LinkedInInteraction">LinkedIn Interaction</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700">Delay (Days)</label>
          <input type="number" v-model="form.delayInDays" min="0" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700">Generation Type</label>
          <select v-model="form.generationType" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option value="WebSearch">Web Search (Real-time)</option>
            <option value="UseCollectedData">Use Enriched/Collected Data</option>
          </select>
        </div>
      </div>
      <button 
        type="button" 
        @click="handleAdd"
        :disabled="isSubmitting"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {{ isSubmitting ? 'Adding...' : 'Add Step' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { sequenceApi } from '@/features/sequences/api/sequenceApi'
import { SequenceStepType } from '@/types/sequence'
import { useSequenceBuilder } from '@/features/sequences/composables/useSequenceBuilder'
import { useToast } from '@/composables/useToast'

const { draftSequence } = useSequenceBuilder()
const { notifyError } = useToast()

const sortedSteps = computed(() => {
  if (!draftSequence.value?.steps) return []
  return [...draftSequence.value.steps].sort((a, b) => a.orderIndex - b.orderIndex)
})

const isSubmitting = ref(false)
const form = ref({
  stepType: SequenceStepType.Email,
  delayInDays: 0,
  generationType: 'WebSearch' as 'WebSearch' | 'UseCollectedData'
})

const formatStepType = (type: string) => {
  return type.replace(/([A-Z])/g, ' $1').trim()
}

const handleAdd = async () => {
  if (!draftSequence.value) return
  try {
    isSubmitting.value = true
    const newStep = await sequenceApi.addStep(draftSequence.value.id, {
      ...form.value
    })
    // Manual reactive update to avoid fetching the whole sequence again
    draftSequence.value.steps.push(newStep)
    // reset form for next step default
    form.value.delayInDays = 2
  } catch(e: any) {
    notifyError(e.response?.data?.error || 'Failed to add step')
  } finally {
    isSubmitting.value = false
  }
}

const deleteStep = async (id: string) => {
  if (!draftSequence.value) return
  if (!confirm('Are you sure you want to remove this step?')) return

  try {
    await sequenceApi.deleteStep(draftSequence.value.id, id)
    draftSequence.value.steps = draftSequence.value.steps.filter(s => s.id !== id)
  } catch(e: any) {
    notifyError(e.response?.data?.error || 'Failed to delete step')
  }
}
</script>
