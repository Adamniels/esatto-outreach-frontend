<template>
  <div class="h-full flex flex-col p-6 max-w-7xl mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Sequences</h1>
        <p class="mt-1 text-sm text-gray-500">Manage multi-channel outreach campaigns and track active prospect generation.</p>
      </div>
      <div>
        <router-link
          to="/sequences/build"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          New Sequence
        </router-link>
      </div>
    </div>

    <!-- Stats / Overview (placeholder) -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Total Sequences</dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ sequences.length }}</dd>
        </div>
      </div>
      <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Active Sequences</dt>
          <dd class="mt-1 text-3xl font-semibold text-emerald-600">{{ activeCount }}</dd>
        </div>
      </div>
      <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Enrolled Prospects</dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ totalProspects }}</dd>
        </div>
      </div>
    </div>

    <!-- Sequence List -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200 flex-1">
      <div v-if="loading" class="p-12 text-center text-gray-500">
        <svg class="animate-spin h-8 w-8 mx-auto text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Loading sequences...</p>
      </div>
      <div v-else-if="error" class="p-12 text-center text-red-500">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="sequences.length === 0" class="p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No sequences</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by building a new outreach sequence.</p>
        <div class="mt-6">
          <router-link
            to="/sequences/build"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            New Sequence
          </router-link>
        </div>
      </div>
      <ul v-else role="list" class="divide-y divide-gray-200">
        <li v-for="sequence in sequences" :key="sequence.id">
          <router-link :to="`/sequences/${sequence.id}`" class="block hover:bg-gray-50 transition-colors">
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center truncate">
                  <p class="text-sm font-medium text-indigo-600 truncate">{{ sequence.title }}</p>
                  <span class="ml-2 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {{ sequence.mode }}
                  </span>
                </div>
                <div class="ml-4 flex-shrink-0 flex items-center space-x-4">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="statusBadgeClass(sequence.status)">
                    {{ sequence.status }}
                  </span>
                  <button
                    @click.prevent="handleDelete(sequence)"
                    class="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                    title="Delete sequence"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="mt-2 sm:flex sm:justify-between">
                <div class="sm:flex">
                  <p class="flex items-center text-sm text-gray-500">
                    <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {{ sequence.prospectCount }} prospects
                  </p>
                </div>
                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>
                    Created <time :datetime="sequence.createdUtc">{{ new Date(sequence.createdUtc).toLocaleDateString() }}</time>
                  </p>
                </div>
              </div>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { sequenceApi } from '@/features/sequences/api/sequenceApi'
import type { SequenceViewDto } from '@/types/sequence'
import { confirmDialog } from '@/shared/utils/dialog'

const sequences = ref<SequenceViewDto[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const activeCount = computed(() => sequences.value.filter(s => s.status === 'Active').length)
const totalProspects = computed(() => sequences.value.reduce((sum, s) => sum + s.prospectCount, 0))

const fetchSequences = async () => {
  try {
    loading.value = true
    error.value = null
    sequences.value = await sequenceApi.list()
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Failed to load sequences'
  } finally {
    loading.value = false
  }
}

const handleDelete = async (sequence: SequenceViewDto) => {
  if (confirmDialog(`Are you sure you want to delete the sequence "${sequence.title}"?`)) {
    try {
      await sequenceApi.delete(sequence.id);
      sequences.value = sequences.value.filter(s => s.id !== sequence.id);
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Failed to delete sequence';
    }
  }
}

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800'
    case 'Draft': return 'bg-gray-100 text-gray-800'
    case 'Paused': return 'bg-yellow-100 text-yellow-800'
    case 'Completed': return 'bg-blue-100 text-blue-800'
    case 'Archived': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  fetchSequences()
})
</script>
