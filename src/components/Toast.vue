<template>
  <Transition 
    enter-active-class="transition ease-out duration-300"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition ease-in duration-300"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <div v-if="show" class="fixed top-8 right-8 z-50 max-w-[400px] bg-white rounded-xl shadow-xl border p-5 flex gap-4 items-start" :class="borderClass">
      <div class="shrink-0 w-8 h-8">
        <svg v-if="type === 'error'" class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <svg v-else-if="type === 'success'" class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <svg v-else-if="type === 'warning'" class="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.082 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <svg v-else class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold text-gray-900 mb-1">{{ title }}</div>
        <div class="text-xs text-gray-600">{{ message }}</div>
      </div>
      
      <button @click="close" class="shrink-0 w-5 h-5 text-gray-400 bg-transparent border-none cursor-pointer p-0 transition-colors hover:text-gray-600">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  show: boolean
  type?: 'error' | 'success' | 'warning' | 'info'
  title: string
  message: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info'
})

const emit = defineEmits<{
  close: []
}>()

const borderClass = computed(() => {
  switch (props.type) {
    case 'error': return 'border-red-500 border-l-4 border-l-red-500'
    case 'success': return 'border-emerald-500 border-l-4 border-l-emerald-500'
    case 'warning': return 'border-amber-500 border-l-4 border-l-amber-500'
    default: return 'border-blue-500 border-l-4 border-l-blue-500'
  }
})

const close = () => emit('close')
</script>
