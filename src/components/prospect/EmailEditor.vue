<template>
  <div class="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-0">
    <!-- Editor Toolbar -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
      <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        PREVIEW
      </div>
      <div class="flex items-center gap-2">
        <span v-if="hasUnsavedChanges" class="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
          Unsaved changes
        </span>
        <button 
          v-if="canSave"
          @click="$emit('save')"
          class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Save changes"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="flex-1 flex flex-col p-6 min-h-0 bg-white">
      <div class="mb-4 flex-shrink-0">
        <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject:</label>
        <input 
          :value="subject"
          @input="$emit('update:subject', ($event.target as HTMLInputElement).value)"
          type="text" 
          class="w-full text-base text-gray-600 border border-gray-200 p-3 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 rounded-md bg-white placeholder-gray-300 transition-all font-sans"
          placeholder="Subject line..." 
        />
      </div>
      
      <div class="flex-1 flex flex-col min-h-0">
        <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message:</label>
        <div class="flex-1 relative border border-gray-200 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all bg-white">
          <textarea 
            :value="body"
            @input="$emit('update:body', ($event.target as HTMLTextAreaElement).value)"
            class="absolute inset-0 w-full h-full p-4 resize-none border-none text-gray-600 leading-relaxed focus:ring-0 rounded-md bg-transparent placeholder-gray-300 text-base overflow-y-auto"
            placeholder="Generated email appears here..."
          ></textarea>
        </div>
      </div>
    </div>
    
    <!-- Send Button Footer -->
    <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
      <button 
        @click="$emit('send')"
        :disabled="!canSend"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm gap-2"
      >
        <svg v-if="isSending" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
        </svg>
        {{ isSending ? 'Sending...' : 'Send Email' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  subject: string
  body: string
  hasUnsavedChanges: boolean
  canSave: boolean
  canSend: boolean
  isSending: boolean
}>()

defineEmits<{
  (e: 'update:subject', value: string): void
  (e: 'update:body', value: string): void
  (e: 'save'): void
  (e: 'send'): void
}>()
</script>
