<template>
  <Transition name="toast-slide">
    <div v-if="show" class="batch-complete-toast" :class="type">
      <div class="toast-icon">
        <svg v-if="type === 'success'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <svg v-else-if="type === 'partial'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.082 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      </div>
      
      <div class="toast-content">
        <div class="toast-title">{{ title }}</div>
        <div class="toast-message">{{ message }}</div>
        <button @click="viewDetails" class="btn-view-details">Visa detaljer</button>
      </div>
      
      <button @click="close" class="toast-close">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  type: 'success' | 'partial'
  title: string
  message: string
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
  viewDetails: []
}>()

const close = () => emit('close')
const viewDetails = () => emit('viewDetails')
</script>

<style scoped>
.batch-complete-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 100;
  max-width: 400px;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.batch-complete-toast.success {
  border-left: 4px solid #10b981;
}

.batch-complete-toast.partial {
  border-left: 4px solid #f59e0b;
}

.toast-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
}

.success .toast-icon {
  color: #10b981;
}

.partial .toast-icon {
  color: #f59e0b;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.toast-message {
  font-size: 0.813rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.btn-view-details {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-view-details:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.toast-close {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}

.toast-close:hover {
  color: #6b7280;
}

/* Toast transitions */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
