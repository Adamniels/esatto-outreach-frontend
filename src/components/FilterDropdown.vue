<template>
  <div class="relative" ref="dropdownRef">
    <button @click="toggleDropdown" class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer transition-all text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300" :class="{ 'bg-blue-50 border-blue-500 text-blue-600': isOpen || hasActiveFilters }">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        ></path>
      </svg>
      <span class="font-medium">Filter</span>
      <span v-if="activeFilterCount > 0" class="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 bg-blue-600 text-white rounded-full text-xs font-semibold">{{ activeFilterCount }}</span>
    </button>

    <transition 
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isOpen" class="absolute top-[calc(100%+0.5rem)] left-0 min-w-[16rem] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
        <div class="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          <h4 class="text-sm font-semibold text-gray-900 m-0">Filter prospects</h4>
          <button v-if="hasActiveFilters" @click="handleClearFilters" class="px-2 py-1 text-xs font-medium text-blue-600 bg-transparent border-none rounded cursor-pointer transition-all hover:bg-blue-50">
            Clear all
          </button>
        </div>

        <!-- Status Filter -->
        <div class="p-3 border-b border-gray-100 last:border-0">
          <label class="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</label>
          <div class="flex flex-col gap-1">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              @click="handleStatusChange(option.value)"
              class="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer transition-all text-left text-sm hover:bg-gray-50 hover:border-gray-300"
              :class="{ 'bg-blue-50 border-blue-500 text-blue-600 font-medium': modelValue.status === option.value }"
            >
              <span class="flex-1">{{ option.label }}</span>
              <span v-if="option.count !== undefined" class="flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 bg-gray-100 text-gray-500 rounded text-xs font-semibold" :class="{ 'bg-blue-100 text-blue-800': modelValue.status === option.value }">{{ option.count }}</span>
            </button>
          </div>
        </div>

        <!-- Has Email Filter -->
        <div class="p-3 border-b border-gray-100 last:border-0">
          <label class="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Email</label>
          <div class="flex flex-col gap-1">
            <button
              @click="handleHasEmailChange('all')"
              class="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer transition-all text-left text-sm hover:bg-gray-50 hover:border-gray-300"
              :class="{ 'bg-blue-50 border-blue-500 text-blue-600 font-medium': modelValue.hasEmail === 'all' }"
            >
              <span class="flex-1">All</span>
            </button>
            <button
              @click="handleHasEmailChange(true)"
              class="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer transition-all text-left text-sm hover:bg-gray-50 hover:border-gray-300"
              :class="{ 'bg-blue-50 border-blue-500 text-blue-600 font-medium': modelValue.hasEmail === true }"
            >
              <span class="flex-1">With email</span>
            </button>
            <button
              @click="handleHasEmailChange(false)"
              class="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer transition-all text-left text-sm hover:bg-gray-50 hover:border-gray-300"
              :class="{ 'bg-blue-50 border-blue-500 text-blue-600 font-medium': modelValue.hasEmail === false }"
            >
              <span class="flex-1">Without email</span>
            </button>
          </div>
        </div>

        <!-- Has Contact Filter -->
        <div class="p-3 border-b border-gray-100 last:border-0">
          <label class="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Contact person</label>
          <div class="flex flex-col gap-1">
            <button
              @click="handleHasContactChange('all')"
              class="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer transition-all text-left text-sm hover:bg-gray-50 hover:border-gray-300"
              :class="{ 'bg-blue-50 border-blue-500 text-blue-600 font-medium': modelValue.hasContact === 'all' }"
            >
              <span class="flex-1">All</span>
            </button>
            <button
              @click="handleHasContactChange(true)"
              class="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer transition-all text-left text-sm hover:bg-gray-50 hover:border-gray-300"
              :class="{ 'bg-blue-50 border-blue-500 text-blue-600 font-medium': modelValue.hasContact === true }"
            >
              <span class="flex-1">With contact</span>
            </button>
            <button
              @click="handleHasContactChange(false)"
              class="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer transition-all text-left text-sm hover:bg-gray-50 hover:border-gray-300"
              :class="{ 'bg-blue-50 border-blue-500 text-blue-600 font-medium': modelValue.hasContact === false }"
            >
              <span class="flex-1">Without contact</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { FilterState, FilterOption } from '@/types/filters'
import { ProspectStatus, statusLabels, type Prospect } from '@/types/prospect'

interface Props {
  modelValue: FilterState
  prospects: Prospect[]
}

interface Emits {
  (e: 'update:modelValue', value: FilterState): void
  (e: 'clear'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Status options with counts
const statusOptions = computed<FilterOption[]>(() => {
  const statusCounts = props.prospects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  return [
    { value: 'all', label: 'All', count: props.prospects.length },
    { value: ProspectStatus.New.toString(), label: statusLabels[ProspectStatus.New], count: statusCounts[ProspectStatus.New] || 0 },
    { value: ProspectStatus.Researched.toString(), label: statusLabels[ProspectStatus.Researched], count: statusCounts[ProspectStatus.Researched] || 0 },
    { value: ProspectStatus.Drafted.toString(), label: statusLabels[ProspectStatus.Drafted], count: statusCounts[ProspectStatus.Drafted] || 0 },
    { value: ProspectStatus.Emailed.toString(), label: statusLabels[ProspectStatus.Emailed], count: statusCounts[ProspectStatus.Emailed] || 0 },
    { value: ProspectStatus.Responded.toString(), label: statusLabels[ProspectStatus.Responded], count: statusCounts[ProspectStatus.Responded] || 0 },
    { value: ProspectStatus.Archived.toString(), label: statusLabels[ProspectStatus.Archived], count: statusCounts[ProspectStatus.Archived] || 0 }
  ]
})

const hasActiveFilters = computed(() => {
  return (
    props.modelValue.status !== 'all' ||
    props.modelValue.hasEmail !== 'all' ||
    props.modelValue.hasContact !== 'all'
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (props.modelValue.status !== 'all') count++
  if (props.modelValue.hasEmail !== 'all') count++
  if (props.modelValue.hasContact !== 'all') count++
  return count
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleStatusChange = (value: string) => {
  const statusValue = value === 'all' ? 'all' : parseInt(value)
  emit('update:modelValue', {
    ...props.modelValue,
    status: statusValue as FilterState['status']
  })
}

const handleHasEmailChange = (value: boolean | 'all') => {
  emit('update:modelValue', {
    ...props.modelValue,
    hasEmail: value
  })
}

const handleHasContactChange = (value: boolean | 'all') => {
  emit('update:modelValue', {
    ...props.modelValue,
    hasContact: value
  })
}

const handleClearFilters = () => {
  emit('clear')
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
