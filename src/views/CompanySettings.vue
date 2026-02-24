<template>
  <div class="max-w-7xl mx-auto p-8">
    <div v-if="loadingCompanyInfo" class="text-center p-12">
      <p class="text-gray-500">Laddar företagsinformation...</p>
    </div>

    <div v-else-if="companyInfoError" class="text-center p-12">
      <p class="text-red-500 mb-4">{{ companyInfoError }}</p>
      <button @click="loadCompanyInfo" class="px-5 py-2.5 bg-blue-500 text-white border-0 rounded-md text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors">Try again</button>
    </div>

    <div v-else-if="companyInfo" class="flex flex-col gap-6">
      <!-- Overview Section -->
      <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Overview</h3>
        <div class="text-gray-700 leading-relaxed">
          <p class="whitespace-pre-wrap m-0">{{ companyInfo.overview }}</p>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div class="flex flex-col gap-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for case name, industry..."
            class="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          />
          <div class="flex gap-2 flex-wrap">
            <button
              @click="filterType = 'all'"
              class="px-4 py-2 border border-gray-300 rounded-md bg-white cursor-pointer text-sm transition-all hover:bg-gray-50"
              :class="{ 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600': filterType === 'all' }"
            >
              All ({{ companyInfo.cases.length }})
            </button>
            <button
              @click="filterType = 'case'"
              class="px-4 py-2 border border-gray-300 rounded-md bg-white cursor-pointer text-sm transition-all hover:bg-gray-50"
              :class="{ 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600': filterType === 'case' }"
            >
              Cases ({{ companyInfo.cases.filter(c => c.pageType === 'case').length }})
            </button>
            <button
              @click="filterType = 'service'"
              class="px-4 py-2 border border-gray-300 rounded-md bg-white cursor-pointer text-sm transition-all hover:bg-gray-50"
              :class="{ 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600': filterType === 'service' }"
            >
              Services ({{ companyInfo.cases.filter(c => c.pageType === 'service').length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Cases List -->
      <div class="flex flex-col gap-4">
        <div
          v-for="(caseItem, index) in filteredCases"
          :key="index"
          class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
        >
          <div class="flex justify-between items-center p-4 px-6 cursor-pointer" @click="toggleCase(index)">
            <div class="flex items-center gap-4 flex-1">
              <span 
                class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold uppercase"
                :class="{ 'bg-blue-100 text-blue-800': caseItem.pageType === 'case', 'bg-purple-100 text-purple-800': caseItem.pageType === 'service' }"
              >
                {{ caseItem.pageType === 'case' ? 'Case' : 'Service' }}
              </span>
              <h4 class="text-lg font-semibold text-gray-900 m-0">{{ caseItem.case.name || caseItem.pageTitle }}</h4>
              <span v-if="caseItem.case.industry" class="text-sm text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                {{ caseItem.case.industry }}
              </span>
            </div>
            <button class="bg-transparent border-none p-1 text-gray-400 cursor-pointer">
              <svg
                class="w-6 h-6 transition-transform duration-200"
                :class="{ 'rotate-180': expandedCases.has(index) }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>

          <div v-if="expandedCases.has(index)" class="p-6 border-t border-gray-100 bg-gray-50/50">
            <div v-if="caseItem.case.challenge" class="mb-4 last:mb-0">
              <strong class="block text-sm font-semibold text-gray-900 mb-1">Challenge:</strong>
              <p class="m-0 text-gray-700 leading-relaxed">{{ caseItem.case.challenge }}</p>
            </div>

            <div v-if="caseItem.case.solution" class="mb-4 last:mb-0">
              <strong class="block text-sm font-semibold text-gray-900 mb-1">Solution:</strong>
              <p class="m-0 text-gray-700 leading-relaxed">{{ caseItem.case.solution }}</p>
            </div>

            <div v-if="caseItem.case.result" class="mb-4 last:mb-0">
              <strong class="block text-sm font-semibold text-gray-900 mb-1">Result:</strong>
              <p class="m-0 text-gray-700 leading-relaxed">{{ caseItem.case.result }}</p>
            </div>

            <div v-if="caseItem.services.length > 0" class="mt-6">
              <strong class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Services:</strong>
              <div class="flex flex-wrap gap-2">
                <span v-for="service in caseItem.services" :key="service" class="px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded text-xs">
                  {{ service }}
                </span>
              </div>
            </div>

            <div v-if="caseItem.industries.length > 0" class="mt-4">
              <strong class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Industries:</strong>
              <div class="flex flex-wrap gap-2">
                <span v-for="industry in caseItem.industries" :key="industry" class="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                  {{ industry }}
                </span>
              </div>
            </div>

            <div v-if="caseItem.methodsOrTech.length > 0" class="mt-4">
              <strong class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Methods/Tech:</strong>
              <div class="flex flex-wrap gap-2">
                <span v-for="method in caseItem.methodsOrTech" :key="method" class="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-xs">
                  {{ method }}
                </span>
              </div>
            </div>

            <div v-if="caseItem.valuesOrTone.length > 0" class="mt-4">
              <strong class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Values/Tone:</strong>
              <div class="flex flex-wrap gap-2">
                <span v-for="value in caseItem.valuesOrTone" :key="value" class="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-xs">
                  {{ value }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredCases.length === 0" class="text-center p-12 bg-white border-2 border-dashed border-gray-300 rounded-lg">
          <p class="text-gray-500">No cases found</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { companyInfoAPI, type CompanyInfo, type CaseItem } from '@/services/companyInfo'

const loadingCompanyInfo = ref(false)
const companyInfoError = ref<string | null>(null)
const companyInfo = ref<CompanyInfo | null>(null)
const expandedCases = ref<Set<number>>(new Set())
const searchQuery = ref('')
const filterType = ref<'all' | 'case' | 'service'>('all')

const filteredCases = computed(() => {
  if (!companyInfo.value) return []
  
  let cases = companyInfo.value.cases
  
  if (filterType.value !== 'all') {
    cases = cases.filter(c => c.pageType === filterType.value)
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    cases = cases.filter(c =>
      c.case.name.toLowerCase().includes(query) ||
      c.case.industry.toLowerCase().includes(query) ||
      c.pageTitle.toLowerCase().includes(query)
    )
  }
  
  return cases
})

onMounted(async () => {
  await loadCompanyInfo()
})

const loadCompanyInfo = async () => {
  try {
    loadingCompanyInfo.value = true
    companyInfoError.value = null
    companyInfo.value = await companyInfoAPI.get()
  } catch (e: any) {
    companyInfoError.value = e.response?.data?.error || 'Could not load company info'
    console.error('Failed to load company info:', e)
  } finally {
    loadingCompanyInfo.value = false
  }
}

const toggleCase = (index: number) => {
  if (expandedCases.value.has(index)) {
    expandedCases.value.delete(index)
  } else {
    expandedCases.value.add(index)
  }
}
</script>
