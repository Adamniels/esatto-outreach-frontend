<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-container">
      <!-- Background overlay -->
      <div 
        @click="closeModal"
        class="modal-backdrop"
      ></div>

      <!-- Modal container -->
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <div class="flex justify-between align-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ isEditing ? 'Redigera Prospect' : 'Lägg till Ny Prospect' }}
            </h3>
            <button
              @click="closeModal"
              class="modal-close-btn"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="submitForm" class="form-container">
            <!-- Company Name (Required) -->
            <div class="form-group">
              <label class="form-label required">
                Företagsnamn
              </label>
              <input
                v-model="formData.companyName"
                type="text"
                required
                class="form-input"
                :class="{ 'form-input-error': errors.companyName }"
                placeholder="Ex. Acme Corp"
              />
              <p v-if="errors.companyName" class="form-error">{{ errors.companyName }}</p>
            </div>

            <!-- Domain -->
            <div class="form-group">
              <label class="form-label">
                Domän
              </label>
              <input
                v-model="formData.domain"
                type="url"
                class="form-input"
                placeholder="Ex. https://acme.com"
              />
            </div>

            <!-- Contact Name -->
            <div class="form-group">
              <label class="form-label">
                Kontaktperson
              </label>
              <input
                v-model="formData.contactName"
                type="text"
                class="form-input"
                placeholder="Ex. John Doe"
              />
            </div>

            <!-- Contact Email -->
            <div class="form-group">
              <label class="form-label">
                E-post
              </label>
              <input
                v-model="formData.contactEmail"
                type="email"
                class="form-input"
                :class="{ 'form-input-error': errors.contactEmail }"
                placeholder="Ex. john@acme.com"
              />
              <p v-if="errors.contactEmail" class="form-error">{{ errors.contactEmail }}</p>
            </div>

            <!-- LinkedIn URL -->
            <div class="form-group">
              <label class="form-label">
                LinkedIn URL
              </label>
              <input
                v-model="formData.linkedinUrl"
                type="url"
                class="form-input"
                placeholder="Ex. https://linkedin.com/company/acme"
              />
            </div>

            <!-- Status (only when editing) -->
            <div v-if="isEditing" class="form-group">
              <label class="form-label">
                Status
              </label>
              <select 
                v-model="formData.status"
                class="form-select"
              >
                <option v-for="(label, status) in statusLabels" :key="status" :value="status">
                  {{ label }}
                </option>
              </select>
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label class="form-label">
                Anteckningar
              </label>
              <textarea
                v-model="formData.notes"
                rows="3"
                class="form-textarea"
                placeholder="Anteckningar om detta prospect..."
              ></textarea>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button
            @click="submitForm"
            :disabled="isSubmitting"
            class="btn btn-primary"
            :class="{ 'btn-loading': isSubmitting }"
          >
            <span v-if="isSubmitting" class="loading-spinner"></span>
            {{ isSubmitting ? (isEditing ? 'Uppdaterar...' : 'Skapar...') : (isEditing ? 'Uppdatera' : 'Skapa Prospect') }}
          </button>
          <button
            @click="closeModal"
            :disabled="isSubmitting"
            class="btn btn-secondary"
          >
            Avbryt
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Prospect, CreateProspectRequest, UpdateProspectRequest } from '@/types/prospect';
import { ProspectStatus, statusLabels } from '@/types/prospect';

interface Props {
  isOpen: boolean;
  editingProspect?: Prospect | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: CreateProspectRequest | UpdateProspectRequest): Promise<void>;
}

const props = withDefaults(defineProps<Props>(), {
  editingProspect: null
});

const emit = defineEmits<Emits>();

const isSubmitting = ref(false);
const errors = ref<Record<string, string>>({});

const isEditing = computed(() => !!props.editingProspect);

const formData = ref<CreateProspectRequest & { status?: ProspectStatus }>({
  companyName: '',
  domain: '',
  contactName: '',
  contactEmail: '',
  linkedinUrl: '',
  notes: '',
  status: ProspectStatus.New
});

// Watch för editing prospect changes
watch(() => props.editingProspect, (prospect) => {
  if (prospect) {
    formData.value = {
      companyName: prospect.companyName,
      domain: prospect.domain || '',
      contactName: prospect.contactName || '',
      contactEmail: prospect.contactEmail || '',
      linkedinUrl: prospect.linkedinUrl || '',
      notes: prospect.notes || '',
      status: prospect.status
    };
  } else {
    resetForm();
  }
});

// Watch för modal close
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm();
  }
});

const resetForm = () => {
  formData.value = {
    companyName: '',
    domain: '',
    contactName: '',
    contactEmail: '',
    linkedinUrl: '',
    notes: '',
    status: ProspectStatus.New
  };
  errors.value = {};
};

const validateForm = (): boolean => {
  errors.value = {};
  
  if (!formData.value.companyName.trim()) {
    errors.value.companyName = 'Företagsnamn är obligatoriskt';
  }
  
  if (formData.value.contactEmail && !isValidEmail(formData.value.contactEmail)) {
    errors.value.contactEmail = 'Ange en giltig e-postadress';
  }
  
  return Object.keys(errors.value).length === 0;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const submitForm = async () => {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  
  try {
    const data = {
      ...formData.value,
      domain: formData.value.domain || undefined,
      contactName: formData.value.contactName || undefined,
      contactEmail: formData.value.contactEmail || undefined,
      linkedinUrl: formData.value.linkedinUrl || undefined,
      notes: formData.value.notes || undefined
    };
    
    await emit('save', data);
    closeModal();
  } catch (error) {
    console.error('Error saving prospect:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 1rem;
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 32rem;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transform: scale(1);
  transition: all 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: #6b7280;
  background-color: transparent;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: color 0.15s ease-in-out;
}

.modal-close-btn:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

/* Form Styles */
.form-container {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input-error {
  border-color: #ef4444;
}

.form-input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-error {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #ef4444;
}

.form-textarea {
  resize: vertical;
  min-height: 4rem;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>