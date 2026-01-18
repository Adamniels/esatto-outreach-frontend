<template>
  <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm group relative">
    <!-- Actions -->
    <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        @click="$emit('enrich', person)"
        :disabled="isEnriching"
        class="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        :class="isEnriching ? 'text-blue-600' : 'text-gray-400 hover:text-green-600'"
        :title="isEnriching ? 'Enriching...' : 'Enrich with AI'"
      >
        <svg v-if="isEnriching" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
      </button>
      <button 
        @click="$emit('edit', person)"
        class="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100"
        title="Edit"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
      </button>
      <button 
        @click="$emit('delete', person)"
        class="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
        title="Delete"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      </button>
    </div>

    <!-- Contact Info -->
    <div class="flex items-start gap-3 mb-2 pr-12">
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <h4 class="text-lg font-bold text-gray-900 m-0">{{ person.name }}</h4>
          <a 
            v-if="person.linkedInUrl" 
            :href="person.linkedInUrl" 
            target="_blank"
            class="text-blue-600 hover:text-blue-800 flex-shrink-0"
            title="LinkedIn Profile"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
        </div>
        <p v-if="person.title" class="text-sm text-gray-600 m-0">{{ person.title }}</p>
      </div>
    </div>
    
    <!-- Email -->
    <div v-if="person.email" class="flex items-center gap-2 mb-3 text-sm">
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      <a :href="`mailto:${person.email}`" class="text-gray-600 hover:text-blue-600">{{ person.email }}</a>
    </div>

    <!-- Enrichment Data Display -->
    <div v-if="person.generalInfo" class="mt-3 text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 italic">
      {{ person.generalInfo }}
    </div>

    <div v-if="person.personalHooks && person.personalHooks.length > 0" class="mt-3">
      <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Hooks</p>
      <ul class="list-disc pl-4 space-y-1">
        <li v-for="(hook, idx) in person.personalHooks" :key="idx" class="text-xs text-gray-600">
          {{ hook }}
        </li>
      </ul>
    </div>

    <div v-if="person.personalNews && person.personalNews.length > 0" class="mt-3">
      <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">News</p>
      <ul class="list-disc pl-4 space-y-1">
        <li v-for="(news, idx) in person.personalNews" :key="idx" class="text-xs text-gray-600">
          {{ news }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContactPersonDto } from '../../types/prospect'

defineProps<{
  person: ContactPersonDto
  isEnriching?: boolean
}>()

defineEmits<{
  (e: 'edit', person: ContactPersonDto): void
  (e: 'delete', person: ContactPersonDto): void
  (e: 'enrich', person: ContactPersonDto): void
}>()
</script>
