<template>
  <div id="app">
    <!-- Show sidebar and header only when authenticated -->
    <div v-if="isAuthenticated" class="app-layout">
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
            
            <router-link
              to="/prospects/pending"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/prospects/pending' }"
            >
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Väntande Prospects
            </router-link>
            
            <router-link
              to="/settings"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/settings' }"
            >
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Admin
            </router-link>
          </div>

          <!-- User section at bottom -->
          <div class="sidebar-footer">
            <div class="user-info">
              <div class="user-avatar">{{ userInitial }}</div>
              <div class="user-details">
                <div class="user-name">{{ userName }}</div>
                <div class="user-email">{{ userEmail }}</div>
              </div>
            </div>
            <button @click="handleLogout" class="logout-btn">
              <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logga ut
            </button>
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
      
      <!-- Global Batch Complete Toast (shown on all authenticated pages) -->
      <BatchCompleteToast
        :show="completeNotification.show"
        :type="completeNotification.type"
        :title="completeNotification.title"
        :message="completeNotification.message"
        @close="hideCompleteNotification"
        @view-details="navigateToProspects"
      />
    </div>

    <!-- Auth views (login/register) without sidebar -->
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBackendStatus } from '@/composables/useBackendStatus'
import { useAuth } from '@/composables/useAuth'
import { useBatchOperations } from '@/composables/useBatchOperations'
import BatchCompleteToast from '@/components/BatchCompleteToast.vue'

const route = useRoute()
const router = useRouter()
const { isOnline, isChecking } = useBackendStatus()
const { user, isAuthenticated, logout } = useAuth()
const { completeNotification, hideCompleteNotification } = useBatchOperations()

const navigateToProspects = () => {
  hideCompleteNotification()
  router.push('/prospects')
}

const pageTitle = computed(() => {
  switch (route.path) {
    case '/':
      return 'Dashboard'
    case '/prospects':
      return 'Prospects'
    case '/settings':
      return 'Admin'
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

const userName = computed(() => user.value?.fullName || 'User')
const userEmail = computed(() => user.value?.email || '')
const userInitial = computed(() => {
  const name = user.value?.fullName || user.value?.email || 'U'
  return name.charAt(0).toUpperCase()
})

const handleLogout = () => {
  logout()
}
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
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

/* Sidebar Footer */
.sidebar-footer {
  border-top: 1px solid #e5e7eb;
  padding: 1rem 0.75rem;
  margin-top: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  font-size: 0.75rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.logout-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.logout-icon {
  width: 1rem;
  height: 1rem;
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
