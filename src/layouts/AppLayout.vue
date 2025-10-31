<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <span class="logo-text">E</span>
          </div>
          <h1 class="app-title">Esatto Outreach</h1>
        </div>
      </div>
      
      <nav class="nav-menu">
        <div class="nav-container">
          <router-link
            to="/"
            class="nav-link"
            :class="{ 'nav-link-active': $route.name === 'Dashboard' }"
          >
            <ChartBarIcon class="nav-icon" />
            Dashboard
          </router-link>
          
          <router-link
            to="/prospects"
            class="nav-link"
            :class="{ 'nav-link-active': $route.name === 'Prospects' }"
          >
            <BuildingOfficeIcon class="nav-icon" />
            Prospects
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-content">
          <h2 class="page-title">{{ pageTitle }}</h2>
          <div class="header-actions">
            <!-- Health Status -->
            <div class="health-status">
              <div :class="healthStatus === 'ok' ? 'status-dot status-online' : 'status-dot status-offline'"></div>
              <span class="status-text">{{ healthStatus === 'ok' ? 'Online' : 'Offline' }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="page-content">
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

<style scoped>
/* App Layout Styles */
.app-layout {
  min-height: 100vh;
  background-color: #f3f4f6;
  display: flex;
}

/* Sidebar */
.sidebar {
  width: 16rem;
  background-color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.sidebar-header {
  padding: 1.5rem;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  background-color: #2563eb;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
}

.app-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #111827;
}

.nav-menu {
  margin-top: 1.5rem;
}

.nav-container {
  padding: 0 0.75rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  color: #374151;
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;
  text-decoration: none;
  transition: background-color 0.15s ease-in-out;
}

.nav-link:hover {
  background-color: #f3f4f6;
}

.nav-link-active {
  background-color: #dbeafe;
  color: #1e40af;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-header {
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.health-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
}

.status-online {
  background-color: #4ade80;
}

.status-offline {
  background-color: #f87171;
}

.status-text {
  font-size: 0.875rem;
  color: #4b5563;
}

.page-content {
  flex: 1;
  padding: 1.5rem;
}
</style>