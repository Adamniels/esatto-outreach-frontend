<template>
  <div class="custom-dropdown" ref="dropdownRef">
    <button 
      @click="toggleDropdown" 
      class="dropdown-trigger"
      :class="{ 'is-open': isOpen }"
    >
      <span class="dropdown-value">{{ selectedLabel }}</span>
      <svg class="dropdown-arrow" :class="{ 'rotate': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <transition name="dropdown-fade">
      <div v-if="isOpen" class="dropdown-menu">
        <div class="dropdown-section">
          <div class="dropdown-section-title">Soft Data Collection</div>
          <button 
            @click="selectOption('soft-data-openai')"
            class="dropdown-item"
            :class="{ 'is-selected': modelValue === 'soft-data-openai' }"
          >
            Mjuk Data (OpenAI)
          </button>
          <button 
            @click="selectOption('soft-data-claude')"
            class="dropdown-item"
            :class="{ 'is-selected': modelValue === 'soft-data-claude' }"
          >
            Mjuk Data (Claude)
          </button>
          <button 
            @click="selectOption('soft-data-hybrid')"
            class="dropdown-item"
            :class="{ 'is-selected': modelValue === 'soft-data-hybrid' }"
          >
            Mjuk Data (Hybrid)
          </button>
        </div>

        <div class="dropdown-section">
          <div class="dropdown-section-title">Email Generation</div>
          <button 
            @click="selectOption('email-websearch')"
            class="dropdown-item"
            :class="{ 'is-selected': modelValue === 'email-websearch' }"
          >
            Mejl (WebSearch)
          </button>
          <button 
            @click="selectOption('email-collected')"
            class="dropdown-item"
            :class="{ 'is-selected': modelValue === 'email-collected' }"
          >
            Mejl (UseCollectedData)
          </button>
        </div>

        <div class="dropdown-section">
          <div class="dropdown-section-title">Complete Flow</div>
          <button 
            @click="selectOption('complete-flow')"
            class="dropdown-item"
            :class="{ 'is-selected': modelValue === 'complete-flow' }"
          >
            Komplett (Data + Mejl)
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
  '': 'Välj operation...',
  'soft-data-openai': 'Mjuk Data (OpenAI)',
  'soft-data-claude': 'Mjuk Data (Claude)',
  'soft-data-hybrid': 'Mjuk Data (Hybrid)',
  'email-websearch': 'Mejl (WebSearch)',
  'email-collected': 'Mejl (UseCollectedData)',
  'complete-flow': 'Komplett (Data + Mejl)'
}

const selectedLabel = computed(() => {
  return options[props.modelValue] || 'Välj operation...'
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

<style scoped>
.custom-dropdown {
  position: relative;
  min-width: 250px;
}

.dropdown-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  background: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dropdown-trigger:hover {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.dropdown-trigger.is-open {
  border-color: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3), 0 4px 6px rgba(0, 0, 0, 0.15);
}

.dropdown-value {
  flex: 1;
  text-align: left;
}

.dropdown-arrow {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-section {
  padding: 0.5rem 0;
}

.dropdown-section:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.dropdown-section-title {
  padding: 0.5rem 1rem 0.25rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  background: #f9fafb;
}

.dropdown-item {
  width: 100%;
  display: block;
  padding: 0.625rem 1rem 0.625rem 1.5rem;
  text-align: left;
  background: white;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: #eff6ff;
  color: #3b82f6;
}

.dropdown-item.is-selected {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

.dropdown-item.is-selected:hover {
  background: #2563eb;
}

/* Transition animations */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Scrollbar styling */
.dropdown-menu::-webkit-scrollbar {
  width: 0.5rem;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 0.25rem;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 0.25rem;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
