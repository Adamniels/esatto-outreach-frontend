<template>
  <div class="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3.5 bg-gray-50 border-b border-gray-200">
      <h3 class="flex items-center gap-2 m-0 text-[0.9375rem] font-semibold text-gray-900">
        <svg class="w-[1.125rem] h-[1.125rem] text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        Chat about email
      </h3>
      <button 
        v-if="messages.length > 0"
        @click="handleReset" 
        class="flex items-center justify-center p-1.5 bg-transparent border border-gray-300 rounded-md cursor-pointer transition-all hover:bg-gray-100 hover:border-gray-400"
        title="Reset conversation"
      >
        <svg class="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
          <path d="M3 21v-5h5"></path>
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto overflow-x-hidden p-3.5 pr-2 flex flex-col gap-3.5 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" ref="messagesContainer">
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center text-gray-500 p-6">
        <p class="mt-1 mb-1 text-[0.8125rem]">Ask questions or request improvements to the email.</p>
        <p class="text-[0.6875rem] text-gray-400 italic">Example: "Can you make the email shorter?" or "Add a CTA"</p>
      </div>

      <div 
        v-for="message in messages" 
        :key="message.id"
        class="flex gap-3 animate-[slideIn_0.3s_ease-out]"
        :class="message.role === 'user' ? 'flex-row' : 'flex-row'"
      >
        <div 
          class="shrink-0 w-8 h-8 flex items-center justify-center text-xl rounded-full"
          :class="message.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'"
        >
          <span v-if="message.role === 'user'">You</span>
          <span v-else>AI</span>
        </div>
        <div class="flex-1 flex flex-col gap-1 min-w-0">
          <div 
            class="px-3 py-2.5 rounded-lg text-[0.8125rem] leading-relaxed whitespace-pre-wrap break-words"
            :class="message.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'"
          >
            {{ message.content }}
          </div>
          <div v-if="message.improvedMail && message.mailData" class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium w-fit">
            ✨ Email updated
          </div>
          <div class="text-[0.625rem] text-gray-400 px-3">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>

      <div v-if="isLoading" class="flex gap-3 animate-[slideIn_0.3s_ease-out]">
        <div class="shrink-0 w-8 h-8 flex items-center justify-center text-xl rounded-full bg-purple-100">AI</div>
        <div class="flex-1 flex flex-col gap-1">
          <div class="flex gap-1 p-3 bg-gray-100 rounded-lg rounded-bl-sm w-fit">
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-[typing_1.4s_infinite]"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-[typing_1.4s_infinite_0.2s]"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-[typing_1.4s_infinite_0.4s]"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-3.5 bg-gray-50 border-t border-gray-200">
      <div class="flex gap-2 items-end mb-3">
        <textarea
          v-model="userInput"
          @keydown.enter.exact.prevent="handleSend"
          placeholder="Type your message here..."
          rows="2"
          class="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm font-sans resize-none transition-colors leading-[1.4] focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
          :disabled="isLoading"
        ></textarea>
        <button 
          @click="handleSend" 
          :disabled="!canSend"
          class="shrink-0 w-9 h-9 p-2 bg-blue-600 text-white border-none rounded-md cursor-pointer transition-colors flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          title="Send message"
        >
          <svg class="w-[1.125rem] h-[1.125rem]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div class="flex items-center justify-start pt-2 border-t border-gray-200">
        <label class="inline-flex items-center gap-2.5 cursor-pointer select-none relative group">
          <input type="checkbox" v-model="useWebSearch" class="absolute opacity-0 pointer-events-none peer" />
          <span class="relative w-10 h-5 bg-gray-300 rounded-full transition-colors shrink-0 peer-checked:bg-blue-600 group-hover:bg-gray-400 peer-checked:group-hover:bg-blue-700 before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4 before:h-4 before:bg-white before:rounded-full before:transition-transform before:shadow-sm peer-checked:before:translate-x-5"></span>
          <span class="text-[0.8125rem] text-gray-500 font-medium">Web search</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import type { ChatMessage, ChatRequest } from '@/types/prospect'
import { prospectsAPI } from '@/services/prospects'

interface Props {
  prospectId: string
  mailTitle?: string
  mailBodyPlain?: string
}

interface Emits {
  (e: 'emailUpdated', data: { mailTitle?: string; mailBodyPlain?: string; mailBodyHTML?: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const messages = ref<ChatMessage[]>([])
const userInput = ref('')
const isLoading = ref(false)
const useWebSearch = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// Load messages from localStorage
const storageKey = computed(() => `chat_messages_${props.prospectId}`)

function loadMessages() {
  try {
    const stored = localStorage.getItem(storageKey.value)
    if (stored) {
      const parsed = JSON.parse(stored)
      messages.value = parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }
  } catch (e) {
    console.error('Failed to load messages:', e)
  }
}

function saveMessages() {
  try {
    localStorage.setItem(storageKey.value, JSON.stringify(messages.value))
  } catch (e) {
    console.error('Failed to save messages:', e)
  }
}

function clearMessages() {
  try {
    localStorage.removeItem(storageKey.value)
  } catch (e) {
    console.error('Failed to clear messages:', e)
  }
}

// Load messages on mount
loadMessages()

// Watch messages and save to localStorage
watch(messages, () => {
  saveMessages()
}, { deep: true })

// Computed
const canSend = computed(() => {
  return userInput.value.trim().length > 0 && !isLoading.value
})

// Methods
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function handleSend() {
  if (!canSend.value) return

  const messageText = userInput.value.trim()
  userInput.value = ''

  // Add user message
  const userMessage: ChatMessage = {
    id: `user-${Date.now()}`,
    role: 'user',
    content: messageText,
    timestamp: new Date()
  }
  messages.value.push(userMessage)
  await scrollToBottom()

  // Send to API
  isLoading.value = true
  try {
    const request: ChatRequest = {
      userInput: messageText,
      mailTitle: props.mailTitle,
      mailBodyPlain: props.mailBodyPlain,
      useWebSearch: useWebSearch.value,
      temperature: 0.7,
      maxOutputTokens: 4000
    }

    const response = await prospectsAPI.chat(props.prospectId, request)

    // Add assistant message
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response.aiMessage,
      timestamp: new Date(),
      improvedMail: response.improvedMail
    }

    // If email was improved, add the mail data
    if (response.improvedMail) {
      assistantMessage.mailData = {
        mailTitle: response.mailTitle || undefined,
        mailBodyPlain: response.mailBodyPlain || undefined,
        mailBodyHTML: response.mailBodyHTML || undefined
      }

      // Emit event to parent to update email preview
      emit('emailUpdated', {
        mailTitle: response.mailTitle || undefined,
        mailBodyPlain: response.mailBodyPlain || undefined,
        mailBodyHTML: response.mailBodyHTML || undefined
      })
    }

    messages.value.push(assistantMessage)
    await scrollToBottom()

  } catch (error: any) {
    console.error('Chat error:', error)
    
    // Add error message
    const errorMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      role: 'assistant',
      content: `Error: ${error.response?.data?.error || error.message || 'Could not send message'}`,
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
    await scrollToBottom()
  } finally {
    isLoading.value = false
  }
}

async function handleReset() {
  if (!confirm('Do you want to reset the entire conversation?')) return

  isLoading.value = true
  try {
    await prospectsAPI.resetChat(props.prospectId)
    messages.value = []
    clearMessages()
  } catch (error: any) {
    console.error('Reset error:', error)
    alert('Could not reset conversation')
  } finally {
    isLoading.value = false
  }
}

// Expose methods for parent component if needed
defineExpose({
  resetChat: handleReset,
  clearLocalMessages: () => {
    messages.value = []
    clearMessages()
  }
})
</script>


