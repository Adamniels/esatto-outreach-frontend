<template>
  <div class="prompt-editor">
    <div class="editor-header">
      <h3 class="editor-title">{{ isNew ? 'Ny Email Prompt' : 'Redigera Email Prompt' }}</h3>
    </div>

    <div class="editor-content">
      <div class="form-group">
        <label class="form-label">
          Instruktioner <span class="required">*</span>
        </label>
        <textarea
          v-model="localInstructions"
          class="form-textarea"
          :class="{ 'input-error': showError }"
          placeholder="Skriv instruktioner för hur AI ska generera email..."
          rows="15"
        ></textarea>
        <p v-if="showError" class="error-message">Instruktioner kan inte vara tomma</p>
        <p class="help-text">
          Dessa instruktioner läggs till efter systemkontexten och företagsinformation.
        </p>
      </div>

      <div class="editor-actions">
        <button
          @click="handleSave"
          :disabled="isSaving || !isValid"
          class="btn-save"
        >
          {{ isSaving ? 'Sparar...' : 'Spara' }}
        </button>
        <button
          @click="handleCancel"
          :disabled="isSaving"
          class="btn-cancel"
        >
          Avbryt
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  instructions?: string
  isNew?: boolean
  isSaving?: boolean
}>()

const emit = defineEmits<{
  save: [instructions: string]
  cancel: []
}>()

const localInstructions = ref(props.instructions || '')
const showError = ref(false)

const isValid = computed(() => {
  return localInstructions.value.trim().length > 0
})

watch(() => props.instructions, (newVal) => {
  if (newVal !== undefined) {
    localInstructions.value = newVal
  }
})

const handleSave = () => {
  if (!isValid.value) {
    showError.value = true
    return
  }
  showError.value = false
  emit('save', localInstructions.value)
}

const handleCancel = () => {
  showError.value = false
  emit('cancel')
}
</script>

<style scoped>
.prompt-editor {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.editor-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.editor-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.editor-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', monospace;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-error {
  border-color: #ef4444;
}

.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #ef4444;
}

.help-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.editor-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-save,
.btn-cancel {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save {
  background-color: #3b82f6;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-save:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
