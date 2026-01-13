<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-[90%] max-h-[80vh] flex flex-col overflow-hidden">
      <div class="flex justify-between items-center p-6 border-b border-gray-100">
        <h2 class="m-0 text-2xl font-semibold text-gray-900">Batch Operation Progress</h2>
        <button @click="closeModal" class="bg-transparent border-none text-gray-400 cursor-pointer p-0 text-3xl leading-none w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-gray-100 hover:text-gray-600">&times;</button>
      </div>

      <div class="p-6 overflow-y-auto">
        <!-- Progress Bar -->
        <div class="mb-8">
          <div class="flex gap-6 mb-4 text-base">
            <span class="text-gray-600">
              <strong>Total:</strong> {{ progress.total }}
            </span>
            <span class="text-emerald-500">
              <strong>Completed:</strong> {{ progress.completed }}
            </span>
            <span class="text-red-600" v-if="progress.failed > 0">
              <strong>Failed:</strong> {{ progress.failed }}
            </span>
          </div>

          <div class="w-full h-6 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div 
              class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-linear" 
              :style="{ width: progressPercentage + '%' }"
              :class="{ 'animate-pulse opacity-80': progress.isRunning }"
            ></div>
          </div>

          <p class="text-center text-gray-500 text-sm m-0">
            {{ progressText }}
          </p>
        </div>

        <!-- Results Summary (shown when complete) -->
        <div v-if="!progress.isRunning && results" class="mt-6">
          <h3 class="m-0 mb-4 text-lg font-semibold text-gray-900">Results Summary</h3>
          
          <div v-if="results.successCount > 0" class="bg-emerald-50 border border-emerald-500 rounded-md p-4 mb-4">
            <p class="m-0 text-emerald-800">✅ <strong>{{ results.successCount }}</strong> prospect(s) processed successfully</p>
          </div>

          <div v-if="results.failureCount > 0" class="bg-red-50 border border-red-500 rounded-md p-4">
            <p class="m-0 mb-3 text-red-800">❌ <strong>{{ results.failureCount }}</strong> prospect(s) failed</p>
            <details class="text-sm mt-3">
              <summary class="cursor-pointer font-semibold text-red-800 select-none hover:underline">View failed prospects</summary>
              <ul class="list-none p-0 m-0 mt-3">
                <li v-for="failure in results.failures" :key="failure.prospectId" class="p-3 bg-white border border-red-200 rounded mb-2 text-sm">
                  <strong>ID:</strong> {{ failure.prospectId.substring(0, 8) }}...
                  <br>
                  <span class="text-gray-500 text-xs">{{ failure.errorMessage }}</span>
                </li>
              </ul>
            </details>
          </div>
        </div>

        <!-- Loading Spinner (shown while running) -->
        <div v-if="progress.isRunning" class="flex flex-col items-center gap-4 py-8">
          <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p class="m-0 text-gray-500 text-base">Processing prospects... Please wait.</p>
        </div>
      </div>

      <div class="flex justify-end p-4 px-6 border-t border-gray-100">
        <button 
          @click="closeModal" 
          class="bg-blue-500 text-white border-none py-2.5 px-5 rounded-md font-medium cursor-pointer transition-colors hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BatchProgress } from '@/composables/useBatchOperations'
import type { BatchOperationResult } from '@/services/prospects'

interface Props {
  show: boolean
  progress: BatchProgress
  results: BatchOperationResult<any> | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const progressPercentage = computed(() => {
  if (props.progress.total === 0) return 0
  return Math.round(((props.progress.completed + props.progress.failed) / props.progress.total) * 100)
})

const progressText = computed(() => {
  if (props.progress.isRunning) {
    return `Processing ${props.progress.completed + props.progress.failed} of ${props.progress.total}...`
  }
  return `Completed: ${props.progress.completed} succeeded, ${props.progress.failed} failed`
})

const closeModal = () => {
  emit('close')
}
</script>
