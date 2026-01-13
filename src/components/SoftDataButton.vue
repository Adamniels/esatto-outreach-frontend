<template>
  <div class="flex flex-row gap-2 items-center relative">
    <!-- Provider selector (always visible) -->
    <div v-if="!loading" class="flex gap-1 bg-gray-100 rounded-md p-1">
      <button 
        v-for="p in providers" 
        :key="p"
        @click="selectedProvider = p"
        class="px-3 py-1.5 border-none rounded text-xs font-medium cursor-pointer transition-all bg-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-700"
        :class="{ 'bg-blue-500 text-white shadow-sm hover:bg-blue-600 hover:text-white': selectedProvider === p }"
        :title="`Use ${p}`"
      >
        {{ p }}
      </button>
    </div>
    
    <button 
      @click="handleClick" 
      :disabled="loading"
      class="inline-flex items-center gap-2 px-4 py-2.5 border border-transparent rounded-md text-sm font-medium cursor-pointer transition-all whitespace-nowrap"
      :class="buttonClass"
    >
      <svg v-if="loading" class="w-5 h-5 shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      <svg v-else class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <span class="flex-1">{{ buttonText }}</span>
    </button>
    
    <!-- Refresh button when data exists -->
    <button 
      v-if="hasData && !loading"
      @click="handleRefresh"
      class="inline-flex items-center justify-center p-2 bg-amber-500 border border-amber-500 rounded-md text-white cursor-pointer transition-all hover:bg-amber-600 hover:border-amber-600 hover:-translate-y-px shadow-sm"
      :title="`Generate new soft data with ${selectedProvider}`"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    return 'Generate Soft Data'
  }
  
  return 'View Soft Data'
})

const buttonClass = computed(() => {
  if (props.loading) return 'bg-gray-500 text-white cursor-not-allowed opacity-60';
  if (!hasData.value) return 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
  return 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
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
