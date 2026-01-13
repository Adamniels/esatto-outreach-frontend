<template>
  <Teleport to="body">
    <Transition 
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" @click.self="emit('close')">
        <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col transition-transform duration-300 ease-in-out transform scale-100" :class="{ 'scale-95': !show }">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="flex items-center gap-3 m-0 text-2xl font-bold text-gray-900">
              <svg class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Soft Company Data
            </h2>
            <button @click="emit('close')" class="p-2 border-none bg-transparent text-gray-500 rounded-md cursor-pointer transition-all hover:bg-gray-100 hover:text-gray-900" aria-label="Close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Loading State -->
            <div v-if="loading" class="flex flex-col items-center justify-center p-12 text-gray-500">
              <svg class="w-12 h-12 mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <p>Generating soft company data...</p>
            </div>

            <!-- No Data State -->
            <div v-else-if="!parsedData" class="flex flex-col items-center justify-center p-12 text-gray-400">
              <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <p>No soft company data available</p>
            </div>

            <!-- Data Display -->
            <div v-else class="flex flex-col gap-8">
              <!-- Research Date -->
              <div class="flex items-center gap-2 p-3 px-4 bg-blue-50 rounded-lg text-blue-800 text-sm font-medium">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Generated: {{ formatDate(parsedData.researchedAt) }}</span>
              </div>

              <!-- Personalization Hooks -->
              <div v-if="parsedData.hooks.length > 0" class="flex flex-col gap-4">
                <h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900 m-0">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Personalization Hooks
                </h3>
                <div class="flex flex-col gap-3">
                  <div v-for="(hook, idx) in parsedData.hooks" :key="idx" class="p-4 bg-gray-50 border border-gray-200 rounded-lg transition-all hover:bg-gray-100 hover:border-gray-300">
                    <div class="flex items-center justify-between mb-2">
                      <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase" :class="{
                        'bg-red-100 text-red-800': hook.relevance === 'high',
                        'bg-amber-100 text-amber-800': hook.relevance === 'medium',
                        'bg-indigo-100 text-indigo-800': hook.relevance === 'low'
                      }">
                        {{ hook.relevance }}
                      </span>
                      <span class="text-xs text-gray-500">{{ hook.date }}</span>
                    </div>
                    <p class="text-sm text-gray-700 leading-relaxed m-0 mb-2">{{ hook.text }}</p>
                    <span class="text-xs text-gray-500 italic">Source: {{ hook.source }}</span>
                  </div>
                </div>
              </div>

              <!-- Recent Events -->
              <div v-if="parsedData.events.length > 0" class="flex flex-col gap-4">
                <h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900 m-0">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Recent Events
                </h3>
                <div class="flex flex-col gap-3">
                  <div v-for="(event, idx) in parsedData.events" :key="idx" class="p-4 bg-gray-50 border border-gray-200 rounded-lg transition-all hover:bg-gray-100 hover:border-gray-300">
                    <div class="flex items-center justify-between mb-2">
                      <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-semibold">{{ event.type }}</span>
                      <span class="text-xs text-gray-500">{{ event.date }}</span>
                    </div>
                    <p class="text-sm font-semibold text-gray-900 m-0 mb-2">{{ event.title }}</p>
                    <a v-if="event.url" :href="event.url" target="_blank" class="inline-flex items-center gap-1 text-sm text-blue-500 font-medium no-underline hover:text-blue-600 hover:underline">
                      Read more →
                    </a>
                  </div>
                </div>
              </div>

              <!-- News Items -->
              <div v-if="parsedData.news.length > 0" class="flex flex-col gap-4">
                <h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900 m-0">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                  </svg>
                  News Items
                </h3>
                <div class="flex flex-col gap-3">
                  <div v-for="(news, idx) in parsedData.news" :key="idx" class="p-4 bg-gray-50 border border-gray-200 rounded-lg transition-all hover:bg-gray-100 hover:border-gray-300">
                    <div class="flex items-center justify-between mb-2">
                      <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-semibold">{{ news.source }}</span>
                      <span class="text-xs text-gray-500">{{ news.date }}</span>
                    </div>
                    <p class="text-sm font-semibold text-gray-900 m-0 mb-2">{{ news.headline }}</p>
                    <a v-if="news.url" :href="news.url" target="_blank" class="inline-flex items-center gap-1 text-sm text-blue-500 font-medium no-underline hover:text-blue-600 hover:underline">
                      Read article →
                    </a>
                  </div>
                </div>
              </div>

              <!-- Social Activity -->
              <div v-if="parsedData.socialActivity.length > 0" class="flex flex-col gap-4">
                <h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900 m-0">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                  </svg>
                  Social Media Activity
                </h3>
                <div class="flex flex-col gap-3">
                  <div v-for="(social, idx) in parsedData.socialActivity" :key="idx" class="p-4 bg-gray-50 border border-gray-200 rounded-lg transition-all hover:bg-gray-100 hover:border-gray-300">
                    <div class="flex items-center justify-between mb-2">
                      <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-semibold">{{ social.platform }}</span>
                      <span class="text-xs text-gray-500">{{ social.date }}</span>
                    </div>
                    <p class="text-sm text-gray-700 leading-relaxed m-0 mb-2">{{ social.text }}</p>
                    <a v-if="social.url" :href="social.url" target="_blank" class="inline-flex items-center gap-1 text-sm text-blue-500 font-medium no-underline hover:text-blue-600 hover:underline">
                      View post →
                    </a>
                  </div>
                </div>
              </div>

              <!-- Sources -->
              <div v-if="parsedData.sources.length > 0" class="flex flex-col gap-4">
                <h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900 m-0">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                  Sources
                </h3>
                <ul class="flex flex-col gap-2 list-none p-0 m-0">
                  <li v-for="(source, idx) in parsedData.sources" :key="idx" class="p-3 bg-gray-50 border-l-[3px] border-blue-500 rounded-r-md text-sm text-gray-700 break-all">
                    {{ source }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button @click="emit('close')" class="px-5 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-gray-200 hover:border-gray-400">
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SoftCompanyDataDto, ParsedSoftCompanyData } from '@/types/prospect';
import { useSoftCompanyData } from '@/composables/useSoftCompanyData';

interface Props {
  show: boolean;
  softData: SoftCompanyDataDto | null | undefined;
  loading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const { parseSoftData } = useSoftCompanyData();

const parsedData = computed<ParsedSoftCompanyData | null>(() => {
  if (!props.softData) {
    console.log('SoftCompanyDataModal: No soft data provided', props.softData);
    return null;
  }
  
  try {
    const parsed = parseSoftData(props.softData);
    console.log('SoftCompanyDataModal: Parsed data', parsed);
    return parsed;
  } catch (err) {
    console.error('SoftCompanyDataModal: Failed to parse', err);
    return null;
  }
});

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
