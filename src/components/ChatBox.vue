<template>
  <div class="chat-box">
    <div class="chat-header">
      <h3 class="chat-title">
        <svg class="chat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        Chatta om mejlet
      </h3>
      <button 
        v-if="messages.length > 0"
        @click="handleReset" 
        class="reset-button"
        title="Återställ konversation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
          <path d="M3 21v-5h5"></path>
        </svg>
      </button>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <p>Ställ frågor eller be om förbättringar av mejlet.</p>
        <p class="empty-state-hint">Exempel: "Kan du göra mejlet kortare?" eller "Lägg till en CTA"</p>
      </div>

      <div 
        v-for="message in messages" 
        :key="message.id"
        :class="['message', `message-${message.role}`]"
      >
        <div class="message-avatar">
          <span v-if="message.role === 'user'">Du</span>
          <span v-else>Ai</span>
        </div>
        <div class="message-content">
          <div class="message-text">{{ message.content }}</div>
          <div v-if="message.improvedMail && message.mailData" class="mail-indicator">
            ✨ Mejl uppdaterat
          </div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>

      <div v-if="isLoading" class="message message-assistant">
        <div class="message-avatar">Ai</div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input-container">
      <div class="input-wrapper">
        <textarea
          v-model="userInput"
          @keydown.enter.exact.prevent="handleSend"
          placeholder="Skriv ditt meddelande här..."
          rows="2"
          class="chat-input"
          :disabled="isLoading"
        ></textarea>
        <button 
          @click="handleSend" 
          :disabled="!canSend"
          class="send-button"
          title="Skicka meddelande"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div class="chat-footer">
        <label class="toggle-switch">
          <input type="checkbox" v-model="useWebSearch" />
          <span class="toggle-slider"></span>
          <span class="toggle-label">Websökning</span>
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
  return new Date(date).toLocaleTimeString('sv-SE', {
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
      content: `Fel: ${error.response?.data?.error || error.message || 'Kunde inte skicka meddelandet'}`,
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
    await scrollToBottom()
  } finally {
    isLoading.value = false
  }
}

async function handleReset() {
  if (!confirm('Vill du återställa hela konversationen?')) return

  isLoading.value = true
  try {
    await prospectsAPI.resetChat(props.prospectId)
    messages.value = []
    clearMessages()
  } catch (error: any) {
    console.error('Reset error:', error)
    alert('Kunde inte återställa konversationen')
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

<style scoped>
.chat-box {
  display: flex;
  flex-direction: column;
  height: 525px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
}

.chat-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: #6b7280;
}

.reset-button {
  padding: 0.375rem;
  background-color: transparent;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-button svg {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.reset-button:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.875rem;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  min-height: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6b7280;
  padding: 1.5rem;
}

.empty-state p {
  margin: 0.25rem 0;
  font-size: 0.8125rem;
}

.empty-state-hint {
  font-size: 0.6875rem;
  color: #9ca3af;
  font-style: italic;
}

.message {
  display: flex;
  gap: 0.75rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border-radius: 50%;
  background-color: #f3f4f6;
}

.message-user .message-avatar {
  background-color: #dbeafe;
}

.message-assistant .message-avatar {
  background-color: #f3e8ff;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-text {
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message-user .message-text {
  background-color: #2563eb;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.message-assistant .message-text {
  background-color: #f3f4f6;
  color: #111827;
  border-bottom-left-radius: 0.25rem;
}

.mail-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #dcfce7;
  color: #166534;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
}

.message-time {
  font-size: 0.625rem;
  color: #9ca3af;
  padding: 0 0.75rem;
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  width: fit-content;
}

.typing-indicator span {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-0.5rem);
    opacity: 1;
  }
}

.chat-input-container {
  padding: 0.875rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  margin-bottom: 0.75rem;
}

.chat-input {
  flex: 1;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: none;
  transition: border-color 0.2s;
  line-height: 1.4;
}

.chat-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.chat-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.send-button {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0.5rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.send-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.send-button svg {
  width: 1.125rem;
  height: 1.125rem;
}

.chat-footer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.toggle-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  user-select: none;
}

.toggle-switch input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.toggle-slider {
  position: relative;
  width: 2.5rem;
  height: 1.25rem;
  background-color: #d1d5db;
  border-radius: 9999px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1rem;
  height: 1rem;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-switch input[type="checkbox"]:checked + .toggle-slider {
  background-color: #2563eb;
}

.toggle-switch input[type="checkbox"]:checked + .toggle-slider::before {
  transform: translateX(1.25rem);
}

.toggle-switch:hover .toggle-slider {
  background-color: #9ca3af;
}

.toggle-switch input[type="checkbox"]:checked:hover + .toggle-slider {
  background-color: #1d4ed8;
}

.toggle-label {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 500;
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 0.375rem;
}

.chat-messages::-webkit-scrollbar-track {
  background-color: transparent;
  margin: 0.25rem 0;
}

.chat-messages::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 0.25rem;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

/* Firefox scrollbar */
.chat-messages {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}
</style>
