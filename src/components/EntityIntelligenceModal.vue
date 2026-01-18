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
                   <!-- Snapshot -->
                   <section class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📝</span> Company Snapshot
                      </h3>
                      <div class="space-y-4" v-if="richData?.snapshot">
                         <div>
                           <p class="text-sm font-bold text-gray-500 uppercase tracking-wide">What They Do</p>
                           <p class="text-gray-800 text-lg">{{ richData.snapshot.whatTheyDo }}</p>
                         </div>
                         <div>
                           <p class="text-sm font-bold text-gray-500 uppercase tracking-wide">Target Customer</p>
                           <p class="text-gray-700">{{ richData.snapshot.targetCustomer }}</p>
                         </div>
                         <div>
                           <p class="text-sm font-bold text-gray-500 uppercase tracking-wide">Value Proposition</p>
                           <p class="text-gray-700">{{ richData.snapshot.primaryValueProposition }}</p>
                         </div>
                      </div>
                      <p class="text-gray-700 leading-relaxed text-lg mt-4 pt-4 border-t border-gray-100" v-else-if="data.summarizedContext">
                        {{ data.summarizedContext }}
                      </p>
                      <p class="text-gray-400 italic" v-else>No summary available.</p>
                   </section>

                   <div class="grid grid-cols-2 gap-8">
                      <!-- Model & Competitors -->
                      <section class="bg-white p-6 rounded-xl shadow-sm border border-gray-100" v-if="richData?.profile">
                        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span>🏢</span> Business Profile
                        </h3>
                        <div class="mb-4">
                           <p class="text-sm font-bold text-gray-500 uppercase tracking-wide">Business Model</p>
                           <p class="text-gray-800">{{ richData.profile.businessModel }}</p>
                        </div>
                         <div v-if="richData.profile.competitors?.length">
                           <p class="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Competitors</p>
                           <div class="flex flex-wrap gap-2">
                              <span v-for="(comp, i) in richData.profile.competitors" :key="i" class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {{ comp }}
                              </span>
                           </div>
                         </div>
                      </section>

                      <!-- Tech Stack -->
                      <section class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span>🛠️</span> Tech Stack
                        </h3>
                        <div class="flex flex-wrap gap-2" v-if="richData?.profile?.currentTechStack?.length">
                           <span v-for="(tech, i) in richData.profile.currentTechStack" :key="i" 
                             class="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-medium border border-slate-200">
                             {{ tech }}
                           </span>
                        </div>
                        <p v-else class="text-gray-400 italic">No tech stack detected.</p>
                      </section>
                   </div>
                </div>

                <!-- CHALLENGES TAB -->
                <div v-if="activeTab === 'challenges'" class="space-y-6">
                   <div v-if="richData?.challenges" class="space-y-8">
                      <!-- Confirmed Challenges -->
                      <section v-if="richData.challenges.confirmed?.length">
                          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>✅</span> Confirmed Pain Points
                          </h3>
                          <div class="grid gap-4">
                            <div v-for="(c, i) in richData.challenges.confirmed" :key="'conf-'+i" class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <p class="text-gray-900 font-medium text-lg mb-3">{{ c.challengeDescription }}</p>
                                <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 italic text-gray-600 mb-3 text-sm">
                                  "{{ c.evidenceSnippet }}"
                                </div>
                                <a :href="c.sourceUrl" target="_blank" class="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                  <span>🔗</span> Source
                                </a>
                            </div>
                          </div>
                      </section>

                      <!-- Inferred Challenges -->
                       <section v-if="richData.challenges.inferred?.length">
                          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>🧠</span> Inferred Needs
                          </h3>
                          <div class="grid gap-4">
                            <div v-for="(c, i) in richData.challenges.inferred" :key="'inf-'+i" class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-400">
                                <p class="text-gray-900 font-medium text-lg mb-2">{{ c.challengeDescription }}</p>
                                <p class="text-sm text-gray-600">
                                  <span class="font-semibold text-purple-700">Reasoning:</span> {{ c.reasoning }}
                                </p>
                            </div>
                          </div>
                      </section>
                   </div>
                   <div v-else class="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                      No specific challenges identified.
                   </div>
                </div>

                <!-- HOOKS & SIGNALS TAB -->
                <div v-if="activeTab === 'hooks'" class="space-y-8">
                   
                   <!-- Outreach Hooks -->
                   <section v-if="richData?.outreachHooks?.length" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span>🎣</span> Outreach Hooks</h3>
                      <div class="space-y-4">
                         <div v-for="(h, i) in richData.outreachHooks" :key="i" class="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                           <div class="flex justify-between items-start mb-2">
                             <p class="text-gray-900 font-medium">{{ h.hookDescription }}</p>
                             <span class="px-2 py-0.5 bg-white text-indigo-600 text-xs font-bold rounded shadow-sm border border-indigo-100">
                               {{ h.confidenceLevel }}
                             </span>
                           </div>
                           <p class="text-sm text-gray-600 italic">Context: {{ h.whyItMatters }}</p>
                           <a v-if="h.source" :href="h.source" target="_blank" rel="noopener noreferrer" class="text-xs text-indigo-500 hover:text-indigo-700 mt-2 flex items-center gap-1 group">
                             <span class="group-hover:underline truncate max-w-md">🔗 {{ h.source }}</span>
                           </a>
                         </div>
                      </div>
                   </section>

                   <!-- Hiring Trends -->
                   <section v-if="richData?.profile?.hiringTrends?.length" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span>💼</span> Hiring Trends</h3>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="(h, i) in richData.profile.hiringTrends" :key="i" class="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100">
                           {{ h }}
                        </span>
                      </div>
                   </section>

                   <!-- Strategic Priorities -->
                   <section v-if="richData?.profile?.strategicPriorities?.length" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span>🎯</span> Strategic Priorities</h3>
                      <ul class="space-y-2">
                         <li v-for="(p, i) in richData.profile.strategicPriorities" :key="i" class="flex items-center gap-2 text-gray-700">
                           <span class="text-indigo-400">›</span> {{ p }}
                         </li>
                      </ul>
                   </section>

                    <!-- Legacy Hooks (Fallback) -->
                   <section v-if="data.companyHooks?.length && !richData?.outreachHooks?.length" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 class="text-lg font-bold text-gray-900 mb-4">Hooks (Legacy)</h3>
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
  { id: 'challenges', label: 'Challenges' },
  { id: 'hooks', label: 'Hooks & Signals' },
];

const richData = computed(() => props.data?.enrichedData);

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-US', { 
     month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
};
</script>
