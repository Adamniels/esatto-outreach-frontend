<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-md flex-shrink-0">
      <div class="p-6">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">E</span>
          </div>
          <h1 class="text-xl font-bold text-gray-900">Esatto Outreach</h1>
        </div>
      </div>
      
      <nav class="mt-6">
        <div class="px-3">
          <router-link
            to="/"
            class="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 mb-1"
            :class="{ 'bg-blue-100 text-blue-700': $route.name === 'Dashboard' }"
          >
            <ChartBarIcon class="w-5 h-5 mr-3" />
            Dashboard
          </router-link>
          
          <router-link
            to="/prospects"
            class="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 mb-1"
            :class="{ 'bg-blue-100 text-blue-700': $route.name === 'Prospects' }"
          >
            <BuildingOfficeIcon class="w-5 h-5 mr-3" />
            Prospects
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <!-- Top Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="px-6 py-4 flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-gray-900">{{ pageTitle }}</h2>
          <div class="flex items-center space-x-4">
            <!-- Health Status -->
            <div class="flex items-center space-x-2">
              <div :class="healthStatus === 'ok' ? 'w-2 h-2 bg-green-400 rounded-full' : 'w-2 h-2 bg-red-400 rounded-full'"></div>
              <span class="text-sm text-gray-600">{{ healthStatus === 'ok' ? 'Online' : 'Offline' }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ChartBarIcon, BuildingOfficeIcon } from '@heroicons/vue/24/outline';
import { healthAPI } from '@/services/prospects';

const route = useRoute();
const healthStatus = ref<string>('checking');

const pageTitle = computed(() => {
  switch (route.name) {
    case 'Dashboard':
      return 'Dashboard';
    case 'Prospects':
      return 'Prospects';
    default:
      return 'Esatto Outreach';
  }
});

const checkHealth = async () => {
  try {
    await healthAPI.check();
    healthStatus.value = 'ok';
  } catch {
    healthStatus.value = 'error';
  }
};

onMounted(() => {
  checkHealth();
  // Check health every 30 seconds
  setInterval(checkHealth, 30000);
});
</script>