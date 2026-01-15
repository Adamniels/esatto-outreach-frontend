<template>
  <div class="flex flex-col gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
    <!-- Generator Type Selector -->
    <div class="flex p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
      <button 
        v-for="type in generatorTypes" 
        :key="type.value"
        @click="$emit('update:selectedType', type.value)"
        class="flex-1 py-2 px-3 rounded-md text-sm font-medium cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :class="selectedType === type.value ? 'bg-blue-100 text-blue-700 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-50'"
      >
        {{ type.label }}
      </button>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <button 
        @click="$emit('generate')"
        :disabled="isGenerating"
        class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
      >
        <svg v-if="isGenerating" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isGenerating ? 'Generating...' : 'Generate Email' }}
      </button>

      <button
        v-if="showClear"
        @click="$emit('clear')"
        class="bg-red-100 text-red-700 px-6 py-2 rounded-md hover:bg-red-200 transition-colors text-sm font-medium h-[42px] border border-red-200"
      >
        Clear Email
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedType: 'WebSearch' | 'UseCollectedData' | 'EsattoRag'
  isGenerating: boolean
  showClear: boolean
}>()

defineEmits<{
  (e: 'update:selectedType', value: 'WebSearch' | 'UseCollectedData' | 'EsattoRag'): void
  (e: 'generate'): void
  (e: 'clear'): void
}>()

const generatorTypes = [
  { value: 'WebSearch' as const, label: 'Web Search' },
  { value: 'UseCollectedData' as const, label: 'Use Collected Data' },
  { value: 'EsattoRag' as const, label: 'Esatto RAG' }
]
</script>
