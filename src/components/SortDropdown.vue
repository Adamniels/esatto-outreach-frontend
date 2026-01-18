<template>
  <div class="relative" ref="dropdownRef">
    <button @click="toggleDropdown" class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer transition-all text-sm font-medium text-gray-700 min-w-[11rem] justify-start hover:bg-gray-50 hover:border-gray-300" :class="{ 'bg-blue-50 border-blue-500 text-blue-600': isOpen || !isDefaultSort }">
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
        ></path>
      </svg>
      <span class="flex-1 text-left font-medium">{{ currentSortLabel }}</span>
    </button>

    <transition 
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isOpen" class="absolute top-[calc(100%+0.5rem)] left-0 min-w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
        <div class="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          <h4 class="text-sm font-semibold text-gray-900 m-0">Sort prospects</h4>
          <button v-if="!isDefaultSort" @click="handleResetSort" class="px-2 py-1 text-xs font-medium text-blue-600 bg-transparent border-none rounded cursor-pointer transition-all hover:bg-blue-50">
            Reset
          </button>
        </div>

        <div class="p-2 flex flex-col gap-0.5">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            @click="handleSortChange(option.value)"
            class="flex items-center justify-between px-3 py-2.5 bg-white border-none rounded-md cursor-pointer transition-all text-left text-sm text-gray-700 hover:bg-gray-50"
            :class="{ 'bg-blue-50 text-blue-600 font-medium': currentSortValue === option.value }"
          >
            <span class="flex-1">{{ option.label }}</span>
            <svg
              v-if="currentSortValue === option.value"
              class="w-4 h-4 text-blue-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { SortState } from '@/types/filters'
import { SORT_OPTIONS, DEFAULT_SORT_STATE } from '@/types/filters'

interface Props {
  modelValue: SortState
}

interface Emits {
  (e: 'update:modelValue', value: SortState): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const sortOptions = SORT_OPTIONS

const currentSortValue = computed(() => {
  return `${props.modelValue.field}-${props.modelValue.direction}`
})

const currentSortLabel = computed(() => {
  const option = sortOptions.find((opt) => opt.value === currentSortValue.value)
  return option ? option.label : 'Sort'
})

const isDefaultSort = computed(() => {
  return (
    props.modelValue.field === DEFAULT_SORT_STATE.field &&
    props.modelValue.direction === DEFAULT_SORT_STATE.direction
  )
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleSortChange = (value: string) => {
  const [field, direction] = value.split('-')
  emit('update:modelValue', {
    field: field as SortState['field'],
    direction: direction as SortState['direction']
  })
  isOpen.value = false
}

const handleResetSort = () => {
  emit('reset')
  isOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
