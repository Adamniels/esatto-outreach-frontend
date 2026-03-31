<template>
  <div class="px-4 py-8 max-w-4xl mx-auto space-y-6">
    <div class="border-b border-gray-200 pb-5">
      <h3 class="text-base font-semibold text-gray-900">Configure Target Settings</h3>
      <p class="mt-1 text-sm text-gray-500">Fine tune the active bounds or data utilization before triggering sequence execution.</p>
    </div>

    <!-- Title and details standard -->
    <div class="space-y-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Sequence Title</label>
          <div class="mt-1">
            <input 
              v-model="form.title" 
              type="text" 
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
            />
          </div>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Description</label>
          <div class="mt-1">
            <textarea 
              v-model="form.description" 
              rows="3" 
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mode Specific Settings -->
    <div v-if="draftSequence?.mode === 'Focused'" class="bg-indigo-50 rounded-lg p-6 border border-indigo-100 space-y-4">
      <h4 class="text-sm font-medium text-indigo-900">Focused Execution Settings</h4>
      
      <fieldset>
        <div class="mt-4 space-y-4">
          <div class="relative flex items-start">
            <div class="flex h-5 items-center">
              <input v-model="form.settings.enrichCompany" id="enrichCompany" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            </div>
            <div class="ml-3 text-sm">
              <label for="enrichCompany" class="font-medium text-gray-900">Pre-enrich Company</label>
              <p class="text-gray-500">Automatically executes web scraping against company properties prior to sequence generation.</p>
            </div>
          </div>
          <div class="relative flex items-start">
            <div class="flex h-5 items-center">
              <input v-model="form.settings.enrichContact"  id="enrichContact" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            </div>
            <div class="ml-3 text-sm">
              <label for="enrichContact" class="font-medium text-gray-900">Pre-enrich Target Contact</label>
              <p class="text-gray-500">Automatically downloads recent LinkedIn posts and profile traits into local data memory.</p>
            </div>
          </div>
        </div>
      </fieldset>
    </div>

    <div v-if="draftSequence?.mode === 'Multi'" class="bg-emerald-50 rounded-lg p-6 border border-emerald-100 space-y-4">
      <h4 class="text-sm font-medium text-emerald-900">Multi Sequence Constraints</h4>
      
      <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        <div class="sm:col-span-1">
          <label class="block text-sm font-medium text-gray-700">Max Active Prospects Sent Per Day</label>
          <div class="mt-1">
            <input 
              v-model="form.settings.maxActiveProspectsPerDay" 
              type="number" min="1" max="100"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" 
            />
          </div>
          <p class="mt-2 text-xs text-gray-500">Our throttler limits sequence activations dynamically across this limit.</p>
        </div>
      </div>
    </div>

    <div class="flex justify-end pt-4">
      <button 
        type="button" 
        @click="saveSettings"
        :disabled="isSubmitting"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {{ isSubmitting ? 'Saving...' : 'Save Settings' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { sequenceApi } from '@/features/sequences/api/sequenceApi'
import { useSequenceBuilder } from '@/features/sequences/composables/useSequenceBuilder'
import { useToast } from '@/composables/useToast'

const { draftSequence } = useSequenceBuilder()
const { notifySuccess, notifyError } = useToast()

const isSubmitting = ref(false)

const form = ref({
  title: '',
  description: '',
  settings: {
    enrichCompany: true,
    enrichContact: true,
    researchSimilarities: false,
    maxActiveProspectsPerDay: 20
  }
})

onMounted(() => {
  if (draftSequence.value) {
    form.value.title = draftSequence.value.title
    form.value.description = draftSequence.value.description || ''
    if (draftSequence.value.settings) {
      form.value.settings.enrichCompany = draftSequence.value.settings.enrichCompany ?? true
      form.value.settings.enrichContact = draftSequence.value.settings.enrichContact ?? true
      form.value.settings.maxActiveProspectsPerDay = draftSequence.value.settings.maxActiveProspectsPerDay ?? 20
      form.value.settings.researchSimilarities = draftSequence.value.settings.researchSimilarities ?? false
    }
  }
})

const saveSettings = async () => {
  if (!draftSequence.value) return
  try {
    isSubmitting.value = true
    await sequenceApi.update(draftSequence.value.id, {
      title: form.value.title,
      description: form.value.description,
      settings: form.value.settings
    })
    
    // update local state model minimally
    draftSequence.value.title = form.value.title
    draftSequence.value.description = form.value.description
    
    notifySuccess('Settings saved successfully.')
  } catch(e: any) {
    notifyError(e.response?.data?.error || 'Failed to save settings')
  } finally {
    isSubmitting.value = false
  }
}
</script>
