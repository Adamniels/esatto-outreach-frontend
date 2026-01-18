<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-100">
    <div class="p-6 border-b border-gray-200">
      <h3 class="m-0 text-xl font-semibold text-gray-900">{{ isNew ? 'New Email Prompt' : 'Edit Email Prompt' }}</h3>
    </div>

    <div class="p-6">
      <div class="mb-6">
        <label class="block mb-2 text-sm font-medium text-gray-700">
          Instructions <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="localInstructions"
          class="w-full p-3 border border-gray-300 rounded-md text-sm font-mono resize-y transition-colors focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': showError }"
          placeholder="Write instructions for how AI should generate emails..."
          rows="15"
        ></textarea>
        <p v-if="showError" class="mt-2 text-sm text-red-500">Instructions cannot be empty</p>
        <p class="mt-2 text-sm text-gray-500">
          These instructions are added after the system context and company information.
        </p>
      </div>

      <div class="flex gap-3 justify-end">
        <button
          @click="handleSave"
          :disabled="isSaving || !isValid"
          class="px-5 py-2.5 bg-blue-500 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
        <button
          @click="handleCancel"
          :disabled="isSaving"
          class="px-5 py-2.5 bg-gray-100 text-gray-700 border-none rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  instructions?: string
  isNew?: boolean
  isSaving?: boolean
}>()

const emit = defineEmits<{
  save: [instructions: string]
  cancel: []
}>()

const localInstructions = ref(props.instructions || '')
const showError = ref(false)

const isValid = computed(() => {
  return localInstructions.value.trim().length > 0
})

watch(() => props.instructions, (newVal) => {
  if (newVal !== undefined) {
    localInstructions.value = newVal
  }
})

const handleSave = () => {
  if (!isValid.value) {
    showError.value = true
    return
  }
  showError.value = false
  emit('save', localInstructions.value)
}

const handleCancel = () => {
  showError.value = false
  emit('cancel')
}
</script>
