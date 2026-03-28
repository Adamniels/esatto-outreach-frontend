<template>
  <div class="max-w-7xl mx-auto p-8">
    <div v-if="loading" class="text-center p-12">
      <p class="text-gray-500">Laddar företagsinformation...</p>
    </div>

    <div v-else-if="error" class="text-center p-12">
      <p class="text-red-500 mb-4">{{ error }}</p>
      <button @click="loadData" class="px-5 py-2.5 bg-blue-500 text-white border-0 rounded-md text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors">Try again</button>
    </div>

    <div v-else class="flex flex-col gap-6">
      
      <!-- Company Info Section -->
      <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Company Information</h3>
        <div v-if="companyInfo" class="flex flex-col gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input v-model="companyInfo.name" type="text" class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Value Proposition</label>
            <input v-model="companyInfo.valueProposition" type="text" class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Overview</label>
            <textarea v-model="companyInfo.overview" rows="4" class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"></textarea>
          </div>
          <div class="flex justify-end">
            <button @click="saveCompanyInfo" :disabled="savingInfo" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
              {{ savingInfo ? 'Saving...' : 'Save Info' }}
            </button>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">No company information found. Create it by saving below.
          <div class="mt-4 flex flex-col gap-4">
            <input v-model="newCompanyInfo.name" placeholder="Company Name" class="w-full p-2 border border-gray-300 rounded-md" />
            <input v-model="newCompanyInfo.valueProposition" placeholder="Value Proposition" class="w-full p-2 border border-gray-300 rounded-md" />
            <textarea v-model="newCompanyInfo.overview" placeholder="Overview" rows="4" class="w-full p-2 border border-gray-300 rounded-md"></textarea>
            <button @click="createCompanyInfo" :disabled="savingInfo" class="px-4 py-2 bg-blue-600 text-white rounded-md w-fit">Create Info</button>
          </div>
        </div>
      </div>

      <!-- Project Cases Section -->
      <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900">Project Cases</h3>
          <button @click="showAddCase = !showAddCase" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
            {{ showAddCase ? 'Cancel' : 'Add Case' }}
          </button>
        </div>

        <div v-if="showAddCase" class="mb-6 p-4 border border-blue-100 bg-blue-50 rounded-md flex flex-col gap-3">
          <input v-model="newCase.clientName" placeholder="Client Name" class="p-2 border border-gray-300 rounded-md" />
          <textarea v-model="newCase.text" placeholder="Case Text" rows="3" class="p-2 border border-gray-300 rounded-md"></textarea>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="newCase.isActive" /> Active
          </label>
          <button @click="addCase" :disabled="savingCase" class="px-4 py-2 bg-blue-600 text-white rounded-md w-fit">Save new case</button>
        </div>

        <div class="flex flex-col gap-4">
          <div v-for="pc in cases" :key="pc.id" class="p-4 border border-gray-200 rounded-md relative flex flex-col gap-2">
            <button @click="deleteCase(pc.id)" class="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm">Delete</button>
            
            <input v-model="pc.clientName" class="font-semibold text-lg p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded" />
            <textarea v-model="pc.text" rows="3" class="w-full p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded leading-relaxed text-gray-700"></textarea>
            
            <div class="flex justify-between items-center mt-2">
              <label class="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" v-model="pc.isActive" /> Active
              </label>
              <button @click="updateCase(pc)" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors">
                Update
              </button>
            </div>
          </div>

          <div v-if="cases.length === 0" class="text-center p-8 text-gray-500 bg-gray-50 rounded border border-dashed border-gray-300">
            No project cases added yet.
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { companyInfoApi } from '@/features/settings/api/companyInfoApi'
import type { CompanyInfo, ProjectCase, CompanyInfoUpdateDto, ProjectCaseUpdateDto } from '@/types/companyInfo'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { alertDialog, confirmDialog } from '@/shared/utils/dialog'

const loading = ref(false)
const error = ref<string | null>(null)

const companyInfo = ref<CompanyInfo | null>(null)
const newCompanyInfo = ref<CompanyInfoUpdateDto>({ name: '', overview: '', valueProposition: '' })
const savingInfo = ref(false)

const cases = ref<ProjectCase[]>([])
const showAddCase = ref(false)
const newCase = ref<ProjectCaseUpdateDto>({ clientName: '', text: '', isActive: true })
const savingCase = ref(false)

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    loading.value = true
    error.value = null
    // Fallback if no company info is perfectly normal -> handle 404
    try {
      companyInfo.value = await companyInfoApi.getCompanyInfo()
    } catch (e: unknown) {
      const apiErr = e as { response?: { status?: number } }
      if (apiErr.response?.status !== 404) throw e
    }
    cases.value = await companyInfoApi.getProjectCases()
  } catch (e: unknown) {
    error.value = getApiErrorMessage(e, 'Could not load data')
  } finally {
    loading.value = false
  }
}

const saveCompanyInfo = async () => {
  if (!companyInfo.value) return
  savingInfo.value = true
  try {
    companyInfo.value = await companyInfoApi.updateCompanyInfo({
      name: companyInfo.value.name,
      overview: companyInfo.value.overview,
      valueProposition: companyInfo.value.valueProposition
    })
    alertDialog('Company info saved!')
  } catch (e: unknown) {
    alertDialog('Failed to save company info')
  } finally {
    savingInfo.value = false
  }
}

const createCompanyInfo = async () => {
  savingInfo.value = true
  try {
    companyInfo.value = await companyInfoApi.updateCompanyInfo(newCompanyInfo.value)
    alertDialog('Company info created!')
  } catch (e: unknown) {
    alertDialog('Failed to create company info')
  } finally {
    savingInfo.value = false
  }
}

const addCase = async () => {
  savingCase.value = true
  try {
    const created = await companyInfoApi.createProjectCase(newCase.value)
    cases.value.unshift(created)
    showAddCase.value = false
    newCase.value = { clientName: '', text: '', isActive: true }
  } catch (e: unknown) {
    alertDialog('Failed to create case')
  } finally {
    savingCase.value = false
  }
}

const updateCase = async (pc: ProjectCase) => {
  try {
    await companyInfoApi.updateProjectCase(pc.id, {
      clientName: pc.clientName,
      text: pc.text,
      isActive: pc.isActive
    })
    alertDialog('Case updated')
  } catch (e: unknown) {
    alertDialog('Failed to update case')
  }
}

const deleteCase = async (id: string) => {
  if (!confirmDialog('Are you sure you want to delete this case?')) return
  try {
    await companyInfoApi.deleteProjectCase(id)
    cases.value = cases.value.filter(c => c.id !== id)
  } catch (e: unknown) {
    alertDialog('Failed to delete case')
  }
}
</script>
