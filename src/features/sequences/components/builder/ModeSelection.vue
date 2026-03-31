<template>
  <div class="px-4 py-8 sm:px-6 sm:py-10 max-w-4xl mx-auto">
    <div class="text-center">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900">Choose your Sequence Mode</h2>
      <p class="mt-4 text-gray-500 text-lg">
        Determine how outreach will be targeted.
      </p>
    </div>

    <div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
      <!-- Focused Mode -->
      <div 
        class="relative flex cursor-pointer rounded-lg border bg-white p-6 shadow-sm focus:outline-none transition h-full flex-col justify-between"
        :class="selectedMode === SequenceMode.Focused ? 'border-indigo-500 ring-2 ring-indigo-500 shadow-md' : 'ring-2 ring-transparent hover:border-gray-300 hover:shadow-md'"
        @click="selectedMode = SequenceMode.Focused"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3">
             <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
               </svg>
             </div>
             <h3 class="text-xl font-semibold text-gray-900">Focused</h3>
          </div>
          <p class="mt-4 text-sm text-gray-500 leading-relaxed">
            Perfect for high-value targets. Add a single prospect and our AI will run deep web research 
            to personalize every single step of the sequence uniquely to them.
          </p>
        </div>
      </div>

      <!-- Multi Mode -->
      <div 
        class="relative flex cursor-pointer rounded-lg border bg-white p-6 shadow-sm focus:outline-none transition h-full flex-col justify-between"
        :class="selectedMode === SequenceMode.Multi ? 'border-emerald-500 ring-2 ring-emerald-500 shadow-md' : 'ring-2 ring-transparent hover:border-gray-300 hover:shadow-md'"
        @click="selectedMode = SequenceMode.Multi"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3">
             <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
               </svg>
             </div>
             <h3 class="text-xl font-semibold text-gray-900">Multi</h3>
          </div>
          <p class="mt-4 text-sm text-gray-500 leading-relaxed">
            Scale your outreach. Target multiple prospects at once using common templates and 
            generalized AI prompts. Paced automatically based on configuration limits.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSequenceBuilder } from '@/features/sequences/composables/useSequenceBuilder'
import { SequenceMode } from '@/types/sequence'

const { selectedMode } = useSequenceBuilder()
</script>
