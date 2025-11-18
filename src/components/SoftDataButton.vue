<template>
  <div class="soft-data-button-container">
    <!-- Provider selector (always visible) -->
    <div v-if="!loading" class="provider-selector">
      <button 
        v-for="p in providers" 
        :key="p"
        @click="selectedProvider = p"
        :class="['provider-btn', { active: selectedProvider === p }]"
        :title="`Använd ${p}`"
      >
        {{ p }}
      </button>
    </div>
    
    <button 
      @click="handleClick" 
      :disabled="loading"
      :class="['soft-data-btn', buttonClass]"
    >
      <svg v-if="loading" class="btn-icon loading-spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      <svg v-else class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <span class="btn-text">{{ buttonText }}</span>
    </button>
    
    <!-- Refresh button when data exists -->
    <button 
      v-if="hasData && !loading"
      @click="handleRefresh"
      class="btn-refresh"
      :title="`Generera ny mjuk data med ${selectedProvider}`"
    >
      <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { SoftCompanyDataDto } from '@/types/prospect';

interface Props {
  prospectId: string;
  softData: SoftCompanyDataDto | null | undefined;
  compact?: boolean;
  loading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  generate: [prospectId: string, provider: 'OpenAI' | 'Claude' | 'Hybrid'];
  view: [];
}>();

// State
const providers = ['OpenAI', 'Claude', 'Hybrid'] as const;
const selectedProvider = ref<'OpenAI' | 'Claude' | 'Hybrid'>('Claude');

// Computed properties
const hasData = computed(() => !!props.softData);

const buttonText = computed(() => {
  if (!hasData.value) {
    return 'Generera Mjuk Data'
  }
  
  return 'Visa Mjuk Data'
})

const buttonClass = computed(() => {
  if (props.loading) return 'btn-loading';
  if (!hasData.value) return 'btn-generate';
  return 'btn-view';
});

// Methods
const handleClick = () => {
  if (props.loading) return;
  
  if (!hasData.value) {
    emit('generate', props.prospectId, selectedProvider.value);
  } else {
    emit('view');
  }
};

const handleRefresh = () => {
  emit('generate', props.prospectId, selectedProvider.value);
};
</script>

<style scoped>
.soft-data-button-container {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  position: relative;
}

/* Provider Selector */
.provider-selector {
  display: flex;
  gap: 0.25rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  padding: 0.25rem;
}

.provider-btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: transparent;
  color: #6b7280;
}

.provider-btn:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.provider-btn.active {
  background-color: #3b82f6;
  color: white;
}

.soft-data-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.soft-data-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-text {
  flex: 1;
}

/* Button Variants */
.btn-generate {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.btn-generate:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-view {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
}

.btn-view:hover:not(:disabled) {
  background-color: #059669;
  border-color: #059669;
}

.btn-loading {
  background-color: #6b7280;
  border-color: #6b7280;
  color: white;
}

/* Refresh Button */
.btn-refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background-color: #f59e0b;
  border: 1px solid #f59e0b;
  border-radius: 0.375rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background-color: #d97706;
  border-color: #d97706;
  transform: translateY(-1px);
}

.btn-refresh .btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
