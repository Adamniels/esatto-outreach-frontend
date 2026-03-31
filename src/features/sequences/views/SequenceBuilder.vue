<template>
  <div class="h-full flex flex-col p-6 max-w-7xl mx-auto space-y-6">
    <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow border border-gray-200">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Sequence Builder</h1>
        <p class="text-sm text-gray-500">Step {{ currentStep }} of 3 - {{ stepTitle }}</p>
      </div>
      <!-- Steps Indicator -->
      <nav aria-label="Progress">
        <ol role="list" class="flex items-center">
          <li v-for="step in 4" :key="step" class="relative" :class="[step < 4 ? 'pr-8 sm:pr-20' : '']">
            <div class="absolute inset-0 flex items-center" aria-hidden="true" v-if="step < 4">
              <div class="h-0.5 w-full" :class="step < currentStep + 1 ? 'bg-indigo-600' : 'bg-gray-200'"></div>
            </div>
            <a href="#" class="relative flex h-8 w-8 items-center justify-center rounded-full"
               :class="step === currentStep + 1 ? 'bg-indigo-600 hover:bg-indigo-900 ring-2 ring-indigo-600 ring-offset-2' : 
                       step < currentStep + 1 ? 'bg-indigo-600 hover:bg-indigo-900' : 'bg-white border-2 border-gray-300 hover:border-gray-400'">
               <span v-if="step < currentStep + 1" class="text-white">
                 <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                   <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                 </svg>
               </span>
               <span v-else class="text-sm font-medium" :class="step === currentStep + 1 ? 'text-white' : 'text-gray-500'">{{ step - 1 }}</span>
            </a>
          </li>
        </ol>
      </nav>
    </div>

    <!-- Main Builder Content Area -->
    <div class="bg-white shadow sm:rounded-lg border border-gray-200 flex-1 overflow-auto">
      <div class="p-6">
        <ModeSelection v-if="currentStep === 0" />
        <StepEditor v-if="currentStep === 1" />
        <ProspectSelector v-if="currentStep === 2" />
        <SequenceSettings v-if="currentStep === 3" />
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow border border-gray-200">
      <button 
        type="button" 
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        @click="goBack"
        :disabled="currentStep === 0"
      >
        Back
      </button>
      
      <button 
        type="button" 
        class="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="goNext"
        :disabled="!canProceed"
      >
        <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ currentStep === 3 ? 'Generate Outreach' : 'Next Step' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSequenceBuilder } from '@/features/sequences/composables/useSequenceBuilder'
import ModeSelection from '@/features/sequences/components/builder/ModeSelection.vue'
import StepEditor from '@/features/sequences/components/builder/StepEditor.vue'
import ProspectSelector from '@/features/sequences/components/builder/ProspectSelector.vue'
import SequenceSettings from '@/features/sequences/components/builder/SequenceSettings.vue'

const { currentStep, isSaving, goNext, goBack, canProceed } = useSequenceBuilder()

const stepTitle = computed(() => {
  switch (currentStep.value) {
    case 0: return 'Mode Selection'
    case 1: return 'Sequence Steps'
    case 2: return 'Add Prospects'
    case 3: return 'Configure Settings'
    default: return ''
  }
})
</script>
