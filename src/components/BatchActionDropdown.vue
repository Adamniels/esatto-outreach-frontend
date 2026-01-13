<template>
  <div class="relative min-w-[250px]" ref="dropdownRef">
    <button 
      @click="toggleDropdown" 
      class="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-white/40 rounded-md text-sm font-medium text-gray-800 cursor-pointer transition-all shadow-sm hover:border-white/60 hover:shadow-md"
      :class="{ 'border-white ring-2 ring-white/30 shadow-md': isOpen }"
    >
      <span class="flex-1 text-left">{{ selectedLabel }}</span>
      <svg class="w-5 h-5 text-gray-500 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <transition 
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isOpen" class="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div class="py-2 border-b border-gray-200 last:border-0">
          <div class="px-4 py-1 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50 mb-1">Soft Data Collection</div>
          <button 
            @click="selectOption('soft-data-openai')"
            class="w-full block px-4 py-2.5 text-left bg-white border-0 text-sm font-medium text-gray-800 cursor-pointer transition-all hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-500 text-white font-semibold hover:bg-blue-600 hover:text-white': modelValue === 'soft-data-openai' }"
          >
            Soft Data (OpenAI)
          </button>
          <button 
            @click="selectOption('soft-data-claude')"
            class="w-full block px-4 py-2.5 text-left bg-white border-0 text-sm font-medium text-gray-800 cursor-pointer transition-all hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-500 text-white font-semibold hover:bg-blue-600 hover:text-white': modelValue === 'soft-data-claude' }"
          >
            Soft Data (Claude)
          </button>
          <button 
            @click="selectOption('soft-data-hybrid')"
            class="w-full block px-4 py-2.5 text-left bg-white border-0 text-sm font-medium text-gray-800 cursor-pointer transition-all hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-500 text-white font-semibold hover:bg-blue-600 hover:text-white': modelValue === 'soft-data-hybrid' }"
          >
            Soft Data (Hybrid)
          </button>
        </div>

        <div class="py-2 border-b border-gray-200 last:border-0">
          <div class="px-4 py-1 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50 mb-1">Email Generation</div>
          <button 
            @click="selectOption('email-websearch')"
            class="w-full block px-4 py-2.5 text-left bg-white border-0 text-sm font-medium text-gray-800 cursor-pointer transition-all hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-500 text-white font-semibold hover:bg-blue-600 hover:text-white': modelValue === 'email-websearch' }"
          >
            Email (WebSearch)
          </button>
          <button 
            @click="selectOption('email-collected')"
            class="w-full block px-4 py-2.5 text-left bg-white border-0 text-sm font-medium text-gray-800 cursor-pointer transition-all hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-500 text-white font-semibold hover:bg-blue-600 hover:text-white': modelValue === 'email-collected' }"
          >
            Email (UseCollectedData)
          </button>
        </div>

        <div class="py-2 border-b border-gray-200 last:border-0">
          <div class="px-4 py-1 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50 mb-1">Complete Flow</div>
          <button 
            @click="selectOption('complete-flow')"
            class="w-full block px-4 py-2.5 text-left bg-white border-0 text-sm font-medium text-gray-800 cursor-pointer transition-all hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-500 text-white font-semibold hover:bg-blue-600 hover:text-white': modelValue === 'complete-flow' }"
          >
            Complete (Data + Email)
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const options: Record<string, string> = {
  '': 'Select operation...',
  'soft-data-openai': 'Soft Data (OpenAI)',
  'soft-data-claude': 'Soft Data (Claude)',
  'soft-data-hybrid': 'Soft Data (Hybrid)',
  'email-websearch': 'Email (WebSearch)',
  'email-collected': 'Email (UseCollectedData)',
  'complete-flow': 'Complete (Data + Email)'
}

const selectedLabel = computed(() => {
  return options[props.modelValue] || 'Select operation...'
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (value: string) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
