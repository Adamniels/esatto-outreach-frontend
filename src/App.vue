<template>
  <div id="app" class="h-screen overflow-hidden">
    <!-- Show sidebar and header only when authenticated -->
    <div v-if="isAuthenticated" class="flex h-full w-full overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 shadow-sm flex-shrink-0 flex flex-col">
        <!-- Logo -->
        <div class="h-16 px-6 flex items-center border-b border-gray-200 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gray-800 rounded flex items-center justify-center shrink-0">
              <span class="text-white font-bold text-sm">E</span>
            </div>
            <span class="text-lg font-semibold text-gray-800">Esatto Outreach</span>
          </div>
        </div>
        
        <!-- Navigation -->
        <nav class="mt-6 px-3 flex-1 flex flex-col justify-between overflow-y-auto">
          <div class="flex flex-col gap-1">
            <router-link
              to="/"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              active-class="bg-gray-100 text-gray-900"
            >
              <svg class="mr-3 w-5 h-5 text-gray-400 group-hover:text-gray-500 group-[.router-link-active]:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Dashboard
            </router-link>
            
            <router-link
              to="/prospects"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              active-class="bg-gray-100 text-gray-900"
            >
              <svg class="mr-3 w-5 h-5 text-gray-400 group-hover:text-gray-500 group-[.router-link-active]:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-6 4h6"></path>
              </svg>
              Prospects
            </router-link>
            
            <router-link
              to="/prospects/pending"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              active-class="bg-gray-100 text-gray-900"
            >
              <svg class="mr-3 w-5 h-5 text-gray-400 group-hover:text-gray-500 group-[.router-link-active]:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Pending Prospects
            </router-link>
            
            <router-link
              to="/invite"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              active-class="bg-gray-100 text-gray-900"
            >
              <svg class="mr-3 w-5 h-5 text-gray-400 group-hover:text-gray-500 group-[.router-link-active]:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              Invite
            </router-link>
            
            <router-link
              to="/settings"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              active-class="bg-gray-100 text-gray-900"
            >
              <svg class="mr-3 w-5 h-5 text-gray-400 group-hover:text-gray-500 group-[.router-link-active]:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Settings
            </router-link>
          </div>

          <!-- User section at bottom -->
          <div class="border-t border-gray-200 py-4 px-3 mt-auto">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {{ userInitial }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-gray-900 truncate">{{ userName }}</div>
                <div class="text-xs text-gray-500 truncate">{{ userEmail }}</div>
              </div>
            </div>
            <button @click="handleLogout" class="w-full flex items-center justify-center gap-2 p-2 bg-gray-100 border-none rounded-md text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </div>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden min-w-0 bg-gray-50">
        <!-- Top Header -->
        <header class="h-16 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div class="h-full px-6 flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 leading-tight">{{ pageTitle }}</h1>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full transition-colors duration-300" :class="statusClass"></div>
              <span class="text-sm font-medium text-gray-500">{{ statusText }}</span>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-0">
          <router-view />
        </main>
      </div>
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

const route = useRoute()
const router = useRouter()
const { isOnline, isChecking } = useBackendStatus()
const { user, isAuthenticated, logout } = useAuth()

const pageTitle = computed(() => {
  switch (route.path) {
    case '/':
      return 'Dashboard'
    case '/prospects':
      return 'Prospects'
    case '/settings':
      return 'Settings'
    case '/invite':
      return 'Invite'
    default:
      return 'Esatto Outreach'
  }
})

const statusText = computed(() => {
  if (isChecking.value) return 'Checking...'
  return isOnline.value ? 'Online' : 'Offline'
})

const statusClass = computed(() => {
  if (isChecking.value) return 'bg-amber-500 shadow-[0_0_0_2px_rgba(245,158,11,0.2)] animate-pulse'
  return isOnline.value ? 'bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]' : 'bg-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]'
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
