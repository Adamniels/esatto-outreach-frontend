<template>
  <div class="flex flex-row gap-2 items-center relative">
    <!-- Main action button -->
    <button 
      @click="handleClick" 
      :disabled="loading"
      class="inline-flex items-center gap-2 px-4 py-2.5 border border-transparent rounded-md text-sm font-medium cursor-pointer transition-all whitespace-nowrap shadow-sm"
      :class="buttonClass"
    >
      <svg v-if="loading" class="w-5 h-5 shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      <svg v-else class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
      <span class="flex-1">{{ buttonText }}</span>
    </button>
    
    <!-- Refresh/Re-enrich button when data exists -->
    <button 
      v-if="hasData && !loading"
      @click="handleEnrich"
      class="inline-flex items-center justify-center p-2.5 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-600 cursor-pointer transition-all hover:bg-indigo-100 hover:border-indigo-300 shadow-sm"
      title="Re-enrich data"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { EntityIntelligenceDto } from '@/types/prospect';

interface Props {
  prospectId: string;
  data: EntityIntelligenceDto | null | undefined;
  compact?: boolean;
  loading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  enrich: [prospectId: string];
  view: [];
}>();

// Computed properties
const hasData = computed(() => !!props.data);

const buttonText = computed(() => {
  if (!hasData.value) {
    return 'Enrich Data'
  }
  return 'View Intelligence'
})

const buttonClass = computed(() => {
  if (props.loading) return 'bg-gray-400 text-white cursor-not-allowed opacity-80';
  if (!hasData.value) return 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed';
  return 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed';
});

// Methods
const handleClick = () => {
  if (props.loading) return;
  
  if (!hasData.value) {
    emit('enrich', props.prospectId);
  } else {
    emit('view');
  }
};

const handleEnrich = () => {
  emit('enrich', props.prospectId);
};
</script>
