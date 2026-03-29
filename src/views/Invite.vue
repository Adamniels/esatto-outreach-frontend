<template>
  <div class="max-w-2xl mx-auto p-8">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900 m-0">Invite</h2>
      <p class="mt-2 text-gray-500">Create an invitation link to add a team member to your company.</p>
    </div>

    <form @submit.prevent="createLink" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="colleague@example.com"
          class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="px-5 py-2.5 bg-blue-500 text-white border-0 rounded-md text-sm font-medium cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ loading ? 'Creating…' : 'Create invite link' }}
      </button>
    </form>

    <div v-if="inviteLink" class="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p class="text-sm font-medium text-gray-700 mb-2">Invite link</p>
      <div class="flex gap-2">
        <input
          :value="inviteLink"
          readonly
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
        />
        <button
          type="button"
          @click="copyLink"
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authService } from '@/services/auth'

const email = ref('')
const loading = ref(false)
const error = ref('')
const inviteLink = ref('')
const copied = ref(false)

async function createLink() {
  error.value = ''
  inviteLink.value = ''
  loading.value = true
  try {
    const res = await authService.createInvitation(email.value)
    inviteLink.value = res.inviteLink ?? `${window.location.origin}/accept-invite?token=${encodeURIComponent(res.token)}`
  } catch (err: any) {
    error.value = err.response?.data?.error ?? err.message ?? 'Failed to create invitation'
  } finally {
    loading.value = false
  }
}

function copyLink() {
  if (!inviteLink.value) return
  navigator.clipboard.writeText(inviteLink.value).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}
</script>
