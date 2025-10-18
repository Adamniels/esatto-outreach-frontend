<template>
  <div id="app" class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <span class="logo-text">E</span>
          </div>
          <span class="logo-title">Esatto Outreach</span>
        </div>
      </div>
      
      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-items">
          <router-link
            to="/"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/' }"
          >
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Dashboard
          </router-link>
          
          <router-link
            to="/prospects"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/prospects' }"
          >
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-6 4h6"></path>
            </svg>
            Prospects
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Top Header -->
      <header class="main-header">
        <div class="header-content">
          <div>
            <h1 class="page-title">{{ pageTitle }}</h1>
          </div>
          <div class="status-indicator">
            <div class="status-dot" :class="statusClass"></div>
            <span class="status-text">{{ statusText }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBackendStatus } from '@/composables/useBackendStatus'

const route = useRoute()
const { isOnline, isChecking } = useBackendStatus()

const pageTitle = computed(() => {
  switch (route.path) {
    case '/':
      return 'Dashboard'
    case '/prospects':
      return 'Prospects'
    default:
      return 'Esatto Outreach'
  }
})

const statusText = computed(() => {
  if (isChecking.value) return 'Kontrollerar...'
  return isOnline.value ? 'Online' : 'Offline'
})

const statusClass = computed(() => {
  if (isChecking.value) return 'status-checking'
  return isOnline.value ? 'status-online' : 'status-offline'
})
</script>

<style scoped>
/* App Layout */
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  width: 100%;
}

/* Sidebar */
.sidebar {
  width: 16rem;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.sidebar-header {
  height: 4rem;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  background-color: #1f2937;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
}

.logo-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.sidebar-nav {
  margin-top: 1.5rem;
  padding: 0 0.75rem;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  text-decoration: none;
  color: #6b7280;
  transition: all 0.15s ease-in-out;
}

.nav-item:hover {
  background-color: #f9fafb;
  color: #1f2937;
}

.nav-item-active {
  background-color: #f3f4f6;
  color: #1f2937;
}

.nav-icon {
  margin-right: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.main-header {
  height: 4rem;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.header-content {
  height: 100%;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.status-online {
  background-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.status-offline {
  background-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.status-checking {
  background-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  background-color: #f9fafb;
}
</style>
