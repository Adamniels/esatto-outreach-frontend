<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">
              <svg class="title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Mjuk Företagsdata
            </h2>
            <button @click="emit('close')" class="close-button" aria-label="Stäng">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="modal-body">
            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <svg class="loading-spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <p>Genererar mjuk företagsdata...</p>
            </div>

            <!-- No Data State -->
            <div v-else-if="!parsedData" class="empty-state">
              <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <p>Ingen mjuk företagsdata tillgänglig</p>
            </div>

            <!-- Data Display -->
            <div v-else class="data-content">
              <!-- Research Date -->
              <div class="research-date">
                <svg class="date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Genererad: {{ formatDate(parsedData.researchedAt) }}</span>
              </div>

              <!-- Personalization Hooks -->
              <div v-if="parsedData.hooks.length > 0" class="data-section">
                <h3 class="section-title">
                  <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Personalization Hooks
                </h3>
                <div class="items-list">
                  <div v-for="(hook, idx) in parsedData.hooks" :key="idx" class="item-card">
                    <div class="item-header">
                      <span :class="['relevance-badge', `relevance-${hook.relevance}`]">
                        {{ hook.relevance }}
                      </span>
                      <span class="item-date">{{ hook.date }}</span>
                    </div>
                    <p class="item-text">{{ hook.text }}</p>
                    <span class="item-source">Källa: {{ hook.source }}</span>
                  </div>
                </div>
              </div>

              <!-- Recent Events -->
              <div v-if="parsedData.events.length > 0" class="data-section">
                <h3 class="section-title">
                  <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Recent Events
                </h3>
                <div class="items-list">
                  <div v-for="(event, idx) in parsedData.events" :key="idx" class="item-card">
                    <div class="item-header">
                      <span class="event-type">{{ event.type }}</span>
                      <span class="item-date">{{ event.date }}</span>
                    </div>
                    <p class="item-title">{{ event.title }}</p>
                    <a v-if="event.url" :href="event.url" target="_blank" class="item-link">
                      Läs mer →
                    </a>
                  </div>
                </div>
              </div>

              <!-- News Items -->
              <div v-if="parsedData.news.length > 0" class="data-section">
                <h3 class="section-title">
                  <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                  </svg>
                  News Items
                </h3>
                <div class="items-list">
                  <div v-for="(news, idx) in parsedData.news" :key="idx" class="item-card">
                    <div class="item-header">
                      <span class="news-source">{{ news.source }}</span>
                      <span class="item-date">{{ news.date }}</span>
                    </div>
                    <p class="item-title">{{ news.headline }}</p>
                    <a v-if="news.url" :href="news.url" target="_blank" class="item-link">
                      Läs artikel →
                    </a>
                  </div>
                </div>
              </div>

              <!-- Social Activity -->
              <div v-if="parsedData.socialActivity.length > 0" class="data-section">
                <h3 class="section-title">
                  <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                  </svg>
                  Social Media Activity
                </h3>
                <div class="items-list">
                  <div v-for="(social, idx) in parsedData.socialActivity" :key="idx" class="item-card">
                    <div class="item-header">
                      <span class="social-platform">{{ social.platform }}</span>
                      <span class="item-date">{{ social.date }}</span>
                    </div>
                    <p class="item-text">{{ social.text }}</p>
                    <a v-if="social.url" :href="social.url" target="_blank" class="item-link">
                      Se inlägg →
                    </a>
                  </div>
                </div>
              </div>

              <!-- Sources -->
              <div v-if="parsedData.sources.length > 0" class="data-section">
                <h3 class="section-title">
                  <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                  Källor
                </h3>
                <ul class="sources-list">
                  <li v-for="(source, idx) in parsedData.sources" :key="idx" class="source-item">
                    {{ source }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button @click="emit('close')" class="btn-secondary">
              Stäng
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SoftCompanyDataDto, ParsedSoftCompanyData } from '@/types/prospect';
import { useSoftCompanyData } from '@/composables/useSoftCompanyData';

interface Props {
  show: boolean;
  softData: SoftCompanyDataDto | null | undefined;
  loading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const { parseSoftData } = useSoftCompanyData();

const parsedData = computed<ParsedSoftCompanyData | null>(() => {
  if (!props.softData) {
    console.log('SoftCompanyDataModal: No soft data provided', props.softData);
    return null;
  }
  
  try {
    const parsed = parseSoftData(props.softData);
    console.log('SoftCompanyDataModal: Parsed data', parsed);
    return parsed;
  } catch (err) {
    console.error('SoftCompanyDataModal: Failed to parse', err);
    return null;
  }
});

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
/* Modal Overlay */
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
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.title-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: #3b82f6;
}

.close-button {
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.close-button svg {
  width: 1.5rem;
  height: 1.5rem;
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #9ca3af;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
}

/* Research Date */
.research-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #eff6ff;
  border-radius: 0.5rem;
  color: #1e40af;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.date-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Data Section */
.data-section {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.section-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #3b82f6;
}

/* Items List */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-card {
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.item-card:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.item-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.item-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.item-text {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.item-source {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

.item-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  margin-top: 0.5rem;
}

.item-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* Badges */
.relevance-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.relevance-high {
  background-color: #fee2e2;
  color: #991b1b;
}

.relevance-medium {
  background-color: #fef3c7;
  color: #92400e;
}

.relevance-low {
  background-color: #e0e7ff;
  color: #3730a3;
}

.event-type,
.news-source,
.social-platform {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Sources List */
.sources-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.source-item {
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-left: 3px solid #3b82f6;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #374151;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
