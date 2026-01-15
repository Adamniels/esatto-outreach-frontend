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
        <div class="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col transition-transform duration-300 ease-in-out transform scale-100 h-[800px]" :class="{ 'scale-95': !show }">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="flex items-center gap-3 m-0 text-2xl font-bold text-gray-900">
              <span class="text-3xl">⚡</span>
              Entity Intelligence
            </h2>
            <button @click="emit('close')" class="p-2 border-none bg-transparent text-gray-400 rounded-md cursor-pointer transition-all hover:bg-gray-100 hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <!-- Loading -->
           <div v-if="loading" class="flex-1 flex flex-col items-center justify-center p-12 text-gray-500">
              <svg class="w-12 h-12 mb-4 animate-spin text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <p>Deep researching prospect (this may take up to 30s)...</p>
           </div>
           
           <div v-else-if="!data" class="flex-1 flex items-center justify-center text-gray-400">
             No data available.
           </div>

           <!-- Content -->
           <div v-else class="flex flex-col flex-1 overflow-hidden">
             <!-- Tabs -->
             <div class="flex border-b border-gray-200 px-6">
                <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                  class="px-6 py-4 text-sm font-medium border-b-2 transition-colors focus:outline-none"
                  :class="activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
                  {{ tab.label }}
                </button>
             </div>

             <!-- Tab Panels -->
             <div class="flex-1 overflow-y-auto p-8 bg-gray-50">
                
                <!-- OVERVIEW TAB -->
                <div v-if="activeTab === 'overview'" class="space-y-8">
                   <!-- Summary -->
                   <section class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📝</span> Executive Summary
                      </h3>
                      <p class="text-gray-700 leading-relaxed text-lg" v-if="richData?.summary">{{ richData.summary }}</p>
                      <p class="text-gray-700 leading-relaxed text-lg" v-else-if="data.summarizedContext">{{ data.summarizedContext }}</p>
                      <p class="text-gray-400 italic" v-else>No summary available.</p>
                   </section>

                   <div class="grid grid-cols-2 gap-8">
                      <!-- Value Props -->
                      <section class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span>💎</span> Key Value Props
                        </h3>
                        <ul class="space-y-3" v-if="richData?.keyValueProps?.length">
                           <li v-for="(vp, i) in richData.keyValueProps" :key="i" class="flex items-start gap-3 text-gray-700">
                             <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                             {{ vp }}
                           </li>
                        </ul>
                        <p v-else class="text-gray-400 italic">Not detected.</p>
                      </section>

                      <!-- Tech Stack -->
                      <section class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span>🛠️</span> Tech Stack & Methods
                        </h3>
                        <div class="flex flex-wrap gap-2" v-if="richData?.techStack?.length">
                           <span v-for="(tech, i) in richData.techStack" :key="i" 
                             class="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-medium border border-slate-200">
                             {{ tech }}
                           </span>
                        </div>
                        <p v-else class="text-gray-400 italic">No tech stack detected.</p>
                      </section>
                   </div>
                </div>

                <!-- CASES TAB -->
                <div v-if="activeTab === 'cases'" class="space-y-6">
                   <div v-if="richData?.caseStudies?.length" class="grid gap-6">
                      <div v-for="(c, i) in richData.caseStudies" :key="i" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                         <div class="flex justify-between items-start mb-4">
                           <h4 class="text-xl font-bold text-gray-900">{{ c.client }}</h4>
                           <span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">Case Study</span>
                         </div>
                         <div class="grid md:grid-cols-3 gap-6">
                            <div><p class="text-xs uppercase text-gray-400 font-bold mb-1">Challenge</p><p class="text-sm text-gray-700">{{ c.challenge }}</p></div>
                            <div><p class="text-xs uppercase text-gray-400 font-bold mb-1">Solution</p><p class="text-sm text-gray-700">{{ c.solution }}</p></div>
                            <div><p class="text-xs uppercase text-gray-400 font-bold mb-1">Outcome</p><p class="text-sm text-gray-700">{{ c.outcome }}</p></div>
                         </div>
                      </div>
                   </div>
                   <div v-else class="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                      No case studies were found on the website.
                   </div>
                </div>

                <!-- SIGNALS TAB -->
                <div v-if="activeTab === 'signals'" class="space-y-8">
                   
                   <!-- News -->
                   <section v-if="richData?.news?.length" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span>📰</span> Recent News</h3>
                      <div class="space-y-4">
                         <div v-for="(n, i) in richData.news" :key="i" class="flex gap-4 p-4 bg-gray-50 rounded-lg">
                           <div class="w-24 flex-shrink-0 text-xs font-mono text-gray-500 pt-1">{{ n.date }}</div>
                           <div>
                              <p class="text-gray-800 font-medium mb-1">{{ n.description }}</p>
                              <p class="text-xs text-indigo-600 truncate max-w-md">{{ n.source }}</p>
                           </div>
                         </div>
                      </div>
                   </section>

                   <!-- Hiring -->
                   <section v-if="richData?.hiring?.length" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span>💼</span> Hiring Signals</h3>
                      <div class="flex flex-wrap gap-4">
                        <div v-for="(h, i) in richData.hiring" :key="i" class="flex items-center gap-3 p-3 bg-indigo-50 text-indigo-900 rounded-lg border border-indigo-100">
                           <span class="font-bold">{{ h.role }}</span>
                           <span class="text-sm opacity-75">({{ h.date }})</span>
                        </div>
                      </div>
                   </section>

                    <!-- Legacy Hooks (Fallback) -->
                   <section v-if="data.companyHooks?.length && !richData?.news?.length" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 class="text-lg font-bold text-gray-900 mb-4">Hooks</h3>
                      <ul class="space-y-2">
                        <li v-for="(h, i) in data.companyHooks" :key="i" class="p-3 bg-gray-50 rounded text-gray-700">{{ h }}</li>
                      </ul>
                   </section>

                </div>

             </div>
           </div>

           <!-- Footer -->
           <div class="p-4 border-t border-gray-200 bg-white rounded-b-xl flex justify-between items-center text-xs text-gray-400">
              <span v-if="data">
                 Researched: {{ formatDate(data.researchedAt) }}
              </span>
              <button @click="emit('close')" class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">Close</button>
           </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { EntityIntelligenceDto } from '@/types/prospect';

interface Props {
  show: boolean;
  data: EntityIntelligenceDto | null | undefined;
  loading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const activeTab = ref('overview');
const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'cases', label: 'Case Studies' },
  { id: 'signals', label: 'Signals & News' },
];

const richData = computed(() => props.data?.richData);

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-US', { 
     month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
};
</script>
