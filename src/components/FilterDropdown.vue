<template>
  <div class="filter-dropdown" ref="dropdownRef">
    <button @click="toggleDropdown" class="filter-button" :class="{ 'active': isOpen || hasActiveFilters }">
      <svg class="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        ></path>
      </svg>
      <span class="filter-label">Filter</span>
      <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
    </button>

    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <div class="dropdown-header">
          <h4 class="dropdown-title">Filtrera prospects</h4>
          <button v-if="hasActiveFilters" @click="handleClearFilters" class="clear-button">
            Rensa alla
          </button>
        </div>

        <!-- Status Filter -->
        <div class="filter-section">
          <label class="filter-section-label">Status</label>
          <div class="filter-options">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              @click="handleStatusChange(option.value)"
              class="filter-option"
              :class="{ 'selected': modelValue.status === option.value }"
            >
              <span class="option-label">{{ option.label }}</span>
              <span v-if="option.count !== undefined" class="option-count">{{ option.count }}</span>
            </button>
          </div>
        </div>

        <!-- Has Email Filter -->
        <div class="filter-section">
          <label class="filter-section-label">Email</label>
          <div class="filter-options">
            <button
              @click="handleHasEmailChange('all')"
              class="filter-option"
              :class="{ 'selected': modelValue.hasEmail === 'all' }"
            >
              <span class="option-label">Alla</span>
            </button>
            <button
              @click="handleHasEmailChange(true)"
              class="filter-option"
              :class="{ 'selected': modelValue.hasEmail === true }"
            >
              <span class="option-label">Med email</span>
            </button>
            <button
              @click="handleHasEmailChange(false)"
              class="filter-option"
              :class="{ 'selected': modelValue.hasEmail === false }"
            >
              <span class="option-label">Utan email</span>
            </button>
          </div>
        </div>

        <!-- Has Contact Filter -->
        <div class="filter-section">
          <label class="filter-section-label">Kontaktperson</label>
          <div class="filter-options">
            <button
              @click="handleHasContactChange('all')"
              class="filter-option"
              :class="{ 'selected': modelValue.hasContact === 'all' }"
            >
              <span class="option-label">Alla</span>
            </button>
            <button
              @click="handleHasContactChange(true)"
              class="filter-option"
              :class="{ 'selected': modelValue.hasContact === true }"
            >
              <span class="option-label">Med kontakt</span>
            </button>
            <button
              @click="handleHasContactChange(false)"
              class="filter-option"
              :class="{ 'selected': modelValue.hasContact === false }"
            >
              <span class="option-label">Utan kontakt</span>
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
    { value: 'all', label: 'Alla', count: props.prospects.length },
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

<style scoped>
.filter-dropdown {
  position: relative;
}

.filter-button {
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
}

.filter-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-button.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #2563eb;
}

.filter-icon {
  width: 1rem;
  height: 1rem;
}

.filter-label {
  font-weight: 500;
}

.filter-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  background: #2563eb;
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 16rem;
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

.clear-button {
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

.clear-button:hover {
  background: #eff6ff;
}

.filter-section {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.filter-section:last-child {
  border-bottom: none;
}

.filter-section-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  font-size: 0.875rem;
}

.filter-option:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-option.selected {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #2563eb;
  font-weight: 500;
}

.option-label {
  flex: 1;
}

.option-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.filter-option.selected .option-count {
  background: #dbeafe;
  color: #1e40af;
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
