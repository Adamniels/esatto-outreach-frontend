<template>
  <div class="p-8 max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Pending Prospects from Capsule</h1>
      <p class="text-base text-gray-500">
        Review and approve companies from Capsule CRM that have been added as prospects.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-lg text-gray-500">Loading pending prospects...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-base text-red-600 mb-4">{{ error }}</p>
      <button @click="fetchPendingProspects" class="px-5 py-2.5 bg-blue-600 text-white border-none rounded-md cursor-pointer text-sm font-semibold transition-colors hover:bg-blue-700">
        Try again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="pendingProspects.length === 0" class="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
      <p class="text-xl font-semibold text-gray-700 mb-2">No pending prospects right now</p>
      <p class="text-base text-gray-500">
        When new companies are added to Capsule CRM, they will appear here for approval.
      </p>
    </div>

    <!-- Pending Prospects List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="prospect in pendingProspects" 
        :key="prospect.id"
        class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
      >
        <!-- Card Header with Picture -->
        <div class="mb-5 pb-4 border-b-2 border-gray-100">
          <div class="flex items-center gap-4">
            <img 
              v-if="prospect.pictureURL" 
              :src="prospect.pictureURL" 
              :alt="prospect.name"
              class="w-[60px] h-[60px] rounded-lg object-cover border border-gray-200"
            />
            <div v-else class="w-[60px] h-[60px] rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
              <span class="text-2xl font-bold text-white">{{ prospect.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-bold text-gray-900 mb-1 truncate">{{ prospect.name }}</h3>
              <span v-if="prospect.capsuleId" class="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                Capsule ID: {{ prospect.capsuleId }}
              </span>
            </div>
          </div>
        </div>

        <!-- About Section -->
        <div v-if="prospect.about" class="mb-4">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">About the company:</label>
          <p class="text-sm text-gray-700 leading-relaxed m-0 line-clamp-3">{{ prospect.about }}</p>
        </div>

        <!-- Websites -->
        <div v-if="prospect.websites && prospect.websites.length > 0" class="mb-4">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Websites:</label>
          <div class="flex flex-col gap-1.5">
            <a 
              v-for="(site, idx) in prospect.websites" 
              :key="idx"
              :href="site.url || '#'" 
              target="_blank"
              class="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
            >
              {{ site.url || 'N/A' }}
            </a>
          </div>
        </div>

        <!-- Email Addresses -->
        <div v-if="prospect.emailAddresses && prospect.emailAddresses.length > 0" class="mb-4">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email Addresses:</label>
          <div class="flex flex-col gap-1.5">
            <a 
              v-for="(email, idx) in prospect.emailAddresses" 
              :key="idx"
              :href="`mailto:${email.address}`"
              class="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
            >
              {{ email.address }}
            </a>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 mt-6 pt-4 border-t-2 border-gray-100">
          <button 
            @click="handleClaim(prospect.id)"
            :disabled="isProcessing"
            class="flex-1 px-4 py-3 border-none rounded-lg cursor-pointer text-sm font-semibold transition-all bg-emerald-500 text-white hover:bg-emerald-600 hover:not(:disabled):shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="processingId === prospect.id">Approving...</span>
            <span v-else>✓ Approve and Add</span>
          </button>
          <button 
            @click="handleReject(prospect.id)"
            :disabled="isProcessing"
            class="flex-1 px-4 py-3 border-none rounded-lg cursor-pointer text-sm font-semibold transition-all bg-red-500 text-white hover:bg-red-600 hover:not(:disabled):shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="processingId === prospect.id">Rejecting...</span>
            <span v-else>✗ Reject</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { PendingProspectDto } from '../types/prospect'
import { useProspects } from '../composables/useProspects'

const router = useRouter()
const { fetchPendingProspects, claimProspect, rejectProspect } = useProspects()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const pendingProspects = ref<PendingProspectDto[]>([])
const isProcessing = ref(false)
const processingId = ref<string | null>(null)

// Fetch pending prospects
const loadPendingProspects = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await fetchPendingProspects()
    pendingProspects.value = data
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Could not load pending prospects'
    console.error('Error fetching pending prospects:', err)
  } finally {
    loading.value = false
  }
}

// Handle claim
const handleClaim = async (id: string) => {
  if (isProcessing.value) return
  
  isProcessing.value = true
  processingId.value = id
  error.value = null
  
  try {
    const claimedProspect = await claimProspect(id)
    
    if (!claimedProspect) {
      throw new Error('Could not approve prospect')
    }
    
    // Remove from pending list
    pendingProspects.value = pendingProspects.value.filter(p => p.id !== id)
    
    // Show success message
    const successMsg = document.createElement('div')
    successMsg.textContent = `${claimedProspect.name} has been added as a prospect`
    successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; z-index: 9999; font-weight: 500;'
    document.body.appendChild(successMsg)
    setTimeout(() => successMsg.remove(), 3000)
    
    // Optionally redirect to the new prospect
    // router.push(`/prospects/${claimedProspect.id}`)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Could not approve prospect'
    alert(`Error: ${error.value}`)
  } finally {
    isProcessing.value = false
    processingId.value = null
  }
}

// Handle reject
const handleReject = async (id: string) => {
  if (isProcessing.value) return
  
  const prospect = pendingProspects.value.find(p => p.id === id)
  if (!prospect) return
  
  if (!confirm(`Are you sure you want to reject "${prospect.name}"?`)) {
    return
  }
  
  isProcessing.value = true
  processingId.value = id
  error.value = null
  
  try {
    await rejectProspect(id)
    
    // Remove from pending list
    pendingProspects.value = pendingProspects.value.filter(p => p.id !== id)
    
    // Show success message
    const successMsg = document.createElement('div')
    successMsg.textContent = `${prospect.name} has been rejected`
    successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #6b7280; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; z-index: 9999; font-weight: 500;'
    document.body.appendChild(successMsg)
    setTimeout(() => successMsg.remove(), 3000)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Could not reject prospect'
    alert(`Error: ${error.value}`)
  } finally {
    isProcessing.value = false
    processingId.value = null
  }
}

onMounted(() => {
  loadPendingProspects()
})
</script>
