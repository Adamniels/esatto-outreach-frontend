<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Batch Operation Progress</h2>
        <button @click="closeModal" class="close-button">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Progress Bar -->
        <div class="progress-section">
          <div class="progress-stats">
            <span class="stat-item">
              <strong>Total:</strong> {{ progress.total }}
            </span>
            <span class="stat-item success">
              <strong>Completed:</strong> {{ progress.completed }}
            </span>
            <span class="stat-item error" v-if="progress.failed > 0">
              <strong>Failed:</strong> {{ progress.failed }}
            </span>
          </div>

          <div class="progress-bar-container">
            <div 
              class="progress-bar-fill" 
              :style="{ width: progressPercentage + '%' }"
              :class="{ 'pulsing': progress.isRunning }"
            ></div>
          </div>

          <p class="progress-text">
            {{ progressText }}
          </p>
        </div>

        <!-- Results Summary (shown when complete) -->
        <div v-if="!progress.isRunning && results" class="results-section">
          <h3>Results Summary</h3>
          
          <div v-if="results.successCount > 0" class="success-box">
            <p>✅ <strong>{{ results.successCount }}</strong> prospect(s) processed successfully</p>
          </div>

          <div v-if="results.failureCount > 0" class="error-box">
            <p>❌ <strong>{{ results.failureCount }}</strong> prospect(s) failed</p>
            <details class="error-details">
              <summary>View failed prospects</summary>
              <ul class="error-list">
                <li v-for="failure in results.failures" :key="failure.prospectId">
                  <strong>ID:</strong> {{ failure.prospectId.substring(0, 8) }}...
                  <br>
                  <span class="error-message">{{ failure.errorMessage }}</span>
                </li>
              </ul>
            </details>
          </div>
        </div>

        <!-- Loading Spinner (shown while running) -->
        <div v-if="progress.isRunning" class="loading-section">
          <div class="spinner"></div>
          <p>Processing prospects... Please wait.</p>
        </div>
      </div>

      <div class="modal-footer">
        <button 
          @click="closeModal" 
          class="btn-primary"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BatchProgress } from '@/composables/useBatchOperations'
import type { BatchOperationResult } from '@/services/prospects'

interface Props {
  show: boolean
  progress: BatchProgress
  results: BatchOperationResult<any> | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const progressPercentage = computed(() => {
  if (props.progress.total === 0) return 0
  return Math.round(((props.progress.completed + props.progress.failed) / props.progress.total) * 100)
})

const progressText = computed(() => {
  if (props.progress.isRunning) {
    return `Processing ${props.progress.completed + props.progress.failed} of ${props.progress.total}...`
  }
  return `Completed: ${props.progress.completed} succeeded, ${props.progress.failed} failed`
})

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: background-color 0.15s;
}

.close-button:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.progress-section {
  margin-bottom: 1.5rem;
}

.progress-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.stat-item {
  color: #4b5563;
}

.stat-item.success {
  color: #10b981;
}

.stat-item.error {
  color: #dc2626;
}

.progress-bar-container {
  width: 100%;
  height: 1.5rem;
  background-color: #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transition: width 0.3s ease;
  border-radius: 0.75rem;
}

.progress-bar-fill.pulsing {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.progress-text {
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.results-section {
  margin-top: 1.5rem;
}

.results-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.success-box {
  background-color: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.success-box p {
  margin: 0;
  color: #065f46;
}

.error-box {
  background-color: #fee2e2;
  border: 1px solid #dc2626;
  border-radius: 0.375rem;
  padding: 1rem;
}

.error-box > p {
  margin: 0 0 0.75rem 0;
  color: #991b1b;
}

.error-details {
  margin-top: 0.75rem;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #991b1b;
  user-select: none;
}

.error-details summary:hover {
  text-decoration: underline;
}

.error-list {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0 0;
}

.error-list li {
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #fecaca;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.error-message {
  color: #6b7280;
  font-size: 0.813rem;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-section p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>
