<template>
  <div class="sort-dropdown" ref="dropdownRef">
    <button @click="toggleDropdown" class="sort-button" :class="{ 'active': isOpen || !isDefaultSort }">
      <svg class="sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
        ></path>
      </svg>
      <span class="sort-label">{{ currentSortLabel }}</span>
    </button>

    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <div class="dropdown-header">
          <h4 class="dropdown-title">Sortera prospects</h4>
          <button v-if="!isDefaultSort" @click="handleResetSort" class="reset-button">
            Återställ
          </button>
        </div>

        <div class="sort-options">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            @click="handleSortChange(option.value)"
            class="sort-option"
            :class="{ 'selected': currentSortValue === option.value }"
          >
            <span class="option-label">{{ option.label }}</span>
            <svg
              v-if="currentSortValue === option.value"
              class="check-icon"
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
  return option ? option.label : 'Sortera'
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

<style scoped>
.sort-dropdown {
  position: relative;
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  min-width: 11rem;
  justify-content: flex-start;
}

.sort-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.sort-button.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #2563eb;
}

.sort-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.sort-label {
  flex: 1;
  text-align: left;
  font-weight: 500;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 50;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dropdown-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.reset-button {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2563eb;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.reset-button:hover {
  background: #eff6ff;
}

.sort-options {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sort-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  background: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  font-size: 0.875rem;
  color: #374151;
}

.sort-option:hover {
  background: #f9fafb;
}

.sort-option.selected {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

.option-label {
  flex: 1;
}

.check-icon {
  width: 1rem;
  height: 1rem;
  color: #2563eb;
  flex-shrink: 0;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
