<template>
  <div class="w-full px-4 py-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-lg text-gray-500">Loading...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-base text-red-600 mb-4">{{ error }}</p>
      <button @click="router.push('/prospects')" class="px-5 py-2.5 bg-gray-500 text-white border-none rounded-md cursor-pointer text-sm font-semibold hover:bg-gray-600 transition-colors">
        Back to list
      </button>
    </div>

    <!-- Prospect Detail Content -->
    <div v-else-if="prospect" class="flex flex-col gap-8">
      <!-- Back Button and Title -->
      <div class="flex items-center justify-between pb-6 border-b-2 border-gray-100">
        <h2 class="text-3xl font-bold text-gray-900 m-0 leading-tight">{{ isEditing ? formData.name : prospect.name }}</h2>
        <div class="flex gap-4">
          <button 
            v-if="!isEditing" 
            @click="startEditing" 
            class="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md cursor-pointer text-sm font-semibold transition-all hover:bg-blue-50"
          >
            Edit
          </button>
          <button @click="router.push('/prospects')" class="px-4 py-2 bg-transparent text-gray-500 border border-transparent rounded-md cursor-pointer text-sm font-semibold transition-all hover:text-gray-900 hover:bg-gray-100">
            ← Back to list
          </button>
        </div>
      </div>

      <!-- Edit Mode Actions -->
      <div v-if="isEditing" class="flex gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg justify-end">
        <button 
          @click="saveChanges" 
          :disabled="isSaving || !isFormValid"
          class="px-5 py-2.5 bg-blue-600 text-white border-none rounded-md cursor-pointer text-sm font-semibold shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSaving ? 'Saving...' : 'Save changes' }}
        </button>
        <button 
          @click="cancelEditing" 
          :disabled="isSaving"
          class="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-md cursor-pointer text-sm font-semibold shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>

      <!-- Company Information Grid -->
      <div class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4 items-baseline bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div class="contents">
          <label class="font-bold text-gray-500 text-right text-sm uppercase tracking-wide min-w-[140px]">Company Name: <span v-if="isEditing" class="text-red-500">*</span></label>
          <div class="text-base text-gray-900">
            <input 
              v-if="isEditing"
              v-model="formData.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              :class="{ 'border-red-500': !formData.name?.trim() }"
              placeholder="Company Name (required)"
              required
            />
            <span v-else class="font-bold text-xl">{{ prospect.name }}</span>
          </div>
        </div>

        <div class="contents">
          <label class="font-bold text-gray-500 text-right text-sm uppercase tracking-wide min-w-[140px]">Websites:</label>
          <div class="text-base text-gray-900">
            <textarea 
              v-if="isEditing"
              v-model="formData.websitesText"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans resize-y"
              rows="2"
              placeholder="One URL per line&#10;https://example.com&#10;https://shop.example.com"
            ></textarea>
            <div v-else>
              <div v-if="prospect.websites.length > 0" class="flex flex-col gap-1">
                <a v-for="(site, idx) in prospect.websites" :key="idx" :href="site.url || '#'" target="_blank" class="text-blue-600 hover:text-blue-800 hover:underline break-all">{{ site.url || 'N/A' }}</a>
              </div>
              <span v-else class="text-gray-400 italic">N/A</span>
            </div>
          </div>
        </div>



        <div class="contents">
          <label class="font-bold text-gray-500 text-right text-sm uppercase tracking-wide min-w-[140px]">Status:</label>
          <div class="text-base text-gray-900">
            <select 
              v-if="isEditing"
              v-model="formData.status"
              class="w-full max-w-[200px] px-3 py-2 border border-gray-300 rounded-md text-sm cursor-pointer bg-white"
            >
              <option :value="0">New</option>
              <option :value="1">Researched</option>
              <option :value="2">Drafted</option>
              <option :value="3">Emailed</option>
              <option :value="4">Responded</option>
              <option :value="5">Archived</option>
            </select>
            <span v-else>
              <span :class="['inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium uppercase tracking-wide', getStatusClass(prospect.status)]">
                {{ statusLabels[prospect.status as ProspectStatus] || 'Unknown' }}
              </span>
            </span>
          </div>
        </div>

        <div class="contents">
          <label class="font-bold text-gray-500 text-right text-sm uppercase tracking-wide min-w-[140px]">Created:</label>
          <div class="text-base text-gray-900">{{ new Date(prospect.createdUtc).toLocaleDateString('en-US') }}</div>
        </div>
      </div>

      <!-- Tags Section -->
      <div v-if="prospect.tags && prospect.tags.length > 0" class="pb-6 border-b-2 border-gray-100">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tags:</label>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="tag in prospect.tags" 
            :key="tag.id"
            class="px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            :class="{ 'bg-amber-100 text-amber-800': tag.dataTag }"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>

      <!-- Custom Fields Section -->
      <div v-if="prospect.customFields && prospect.customFields.length > 0" class="pb-6 border-b-2 border-gray-100">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Custom Fields:</label>
        <div class="flex flex-col gap-2">
          <div 
            v-for="field in prospect.customFields" 
            :key="field.id"
            class="flex items-start gap-2 text-sm bg-gray-50 p-2 rounded-md"
          >
            <strong class="font-bold text-gray-600 uppercase text-xs">{{ field.fieldName }}:</strong>
            <span class="text-gray-900">{{ field.value || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <!-- Notes Section (Editable) -->
      <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-100" :class="{ 'ring-2 ring-blue-500 border-transparent': isEditing }">
        <label class="block text-xs font-bold text-yellow-800 uppercase tracking-wide mb-2">Notes</label>
        <textarea 
          v-if="isEditing"
          v-model="formData.notes"
          class="w-full bg-white border border-yellow-200 rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 resize-y min-h-[100px]"
          placeholder="Add notes..."
          rows="4"
        ></textarea>
        <p v-else class="m-0 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{{ prospect.notes || 'No notes' }}</p>
      </div>

      <!-- Entity Intelligence Section -->
      <div class="pb-6 border-b-2 border-gray-100">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Entity Intelligence</h3>
        <EnrichDataButton
          :prospectId="prospect.id"
          :data="prospect.entityIntelligence"
          :loading="isEnriching"
          @enrich="handleEnrichProspect"
          @view="showEntityModal = true"
        />
      </div>

      <!-- Contact Persons Section -->
      <div class="pb-6 border-b-2 border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900 m-0">Contact Persons</h3>
          <button 
            @click="openAddContactModal"
            class="px-3 py-1.5 bg-white text-blue-600 border border-blue-600 rounded-md text-xs font-semibold hover:bg-blue-50 transition-colors"
          >
            + Add Contact
          </button>
        </div>
        
        <div v-if="prospect.contactPersons && prospect.contactPersons.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContactPersonCard
            v-for="person in prospect.contactPersons"
            :key="person.id"
            :person="person"
            :is-enriching="enrichingContactId === person.id"
            @edit="openEditContactModal"
            @delete="handleDeleteContact"
            @enrich="handleEnrichContact"
            @set-active="handleSetActiveContact"
            @clear-active="handleClearActiveContact"
          />
        </div>

        <div v-else class="text-gray-400 italic text-sm">
           No contact persons added yet.
        </div>
      </div>

      <!-- Content Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            @click="activeView = 'email'"
            :class="[
              activeView === 'email'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
            ]"
          >
            Write Email
          </button>
          <button
            @click="activeView = 'linkedin'"
            :class="[
              activeView === 'linkedin'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
            ]"
          >
            Write LinkedIn Message
          </button>
          <button
            @click="activeView = 'workflow'"
            :class="[
              activeView === 'workflow'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
            ]"
          >
            Workflow
          </button>
        </nav>
      </div>

      <!-- Write Email Tab -->
      <div v-if="activeView === 'email'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[850px]">
        <!-- Left Column: Settings & Preview -->
        <div class="lg:col-span-2 flex flex-col gap-4 h-full overflow-hidden">
          <!-- Generation Settings -->
          <EmailGeneratorControls
            v-model:selected-type="selectedEmailGeneratorType"
            :is-generating="isGenerating"
            :show-clear="canResetToBackend"
            @generate="handleGenerateEmail"
            @clear="resetToBackendDraft"
          />

          <!-- Email Preview Editor -->
          <EmailEditor
            :subject="generatedEmailSubject"
            :body="generatedEmailBody"
            :has-unsaved-changes="hasUnsavedChanges"
            :can-save="canSaveGeneratedEmail"
            :can-send="canSendEmail"
            :is-sending="isSendingEmail"
            @update:subject="generatedEmailSubject = $event"
            @update:body="generatedEmailBody = $event"
            @save="saveGeneratedEmail"
            @send="handleSendEmail"
          />
        </div>


        <!-- Chat Section (Right) -->
        <div class="lg:col-span-1 h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <ChatBox 
            v-if="prospect"
            :prospectId="prospect.id"
            :mailTitle="generatedEmail?.mailTitle"
            :mailBodyPlain="generatedEmail?.mailBodyPlain"
            @emailUpdated="handleEmailUpdated"
          />
        </div>
      </div>

      <!-- Write LinkedIn Message Tab -->
      <div v-else-if="activeView === 'linkedin'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[850px]">
        <!-- Left Column: Settings & Preview -->
        <div class="lg:col-span-2 flex flex-col gap-4 h-full overflow-hidden">
          <LinkedInGeneratorControls
            v-model:selected-type="selectedLinkedInGeneratorType"
            :is-generating="isGeneratingLinkedIn"
            :show-clear="canResetLinkedInToBackend"
            @generate="handleGenerateLinkedIn"
            @clear="resetToBackendLinkedInDraft"
          />

          <LinkedInEditor
            :body="generatedLinkedInMessage || ''"
            :has-unsaved-changes="hasUnsavedLinkedInChanges"
            :can-save="canSaveGeneratedLinkedIn"
            :can-send="canSendLinkedIn"
            :is-sending="isSendingLinkedIn"
            @update:body="generatedLinkedInMessage = $event"
            @save="saveGeneratedLinkedInMessage"
            @send="handleSendLinkedIn"
          />
        </div>

        <!-- Chat Section (Right) -->
        <div class="lg:col-span-1 h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <ChatBox 
            v-if="prospect"
            :prospectId="prospect.id"
            :mailTitle="''"
            :mailBodyPlain="generatedLinkedInMessage || ''"
            @emailUpdated="handleLinkedInChatUpdated"
          />
        </div>
      </div>

      <!-- Workflow Tab -->
      <div v-else-if="activeView === 'workflow'" class="h-[850px] bg-white rounded-xl border border-gray-200 overflow-hidden">
        <WorkflowTab :prospectId="prospect.id" />
      </div>

      <!-- Entity Intelligence Modal -->
      <EntityIntelligenceModal
        v-if="prospect"
        :show="showEntityModal"
        :data="prospect.entityIntelligence"
        :loading="isEnriching"
        @close="showEntityModal = false"
      />

      <!-- Contact Person Modal -->
      <ContactPersonModal 
        :show="showContactModal"
        :loading="isSavingContact"
        :edit-data="editingContact"
        @close="showContactModal = false"
        @save="handleSaveContact"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Prospect, EmailDraft, ProspectStatus, CreateContactPersonRequest, ContactPersonDto } from '../types/prospect'
import { ProspectStatus as ProspectStatusEnum, statusLabels } from '../types/prospect'
import { prospectsAPI } from '../services/prospects'
import ChatBox from '../components/ChatBox.vue'
import EnrichDataButton from '../components/EnrichDataButton.vue'
import EntityIntelligenceModal from '../components/EntityIntelligenceModal.vue'
import ContactPersonModal from '../components/ContactPersonModal.vue'
import ContactPersonCard from '../components/prospect/ContactPersonCard.vue'
import EmailEditor from '../components/prospect/EmailEditor.vue'
import EmailGeneratorControls from '../components/prospect/EmailGeneratorControls.vue'
import LinkedInEditor from '../components/prospect/LinkedInEditor.vue'
import LinkedInGeneratorControls from '../components/prospect/LinkedInGeneratorControls.vue'
import WorkflowTab from '../components/prospect/WorkflowTab.vue'
import { useEntityIntelligence } from '../composables/useEntityIntelligence'

const route = useRoute()
const router = useRouter()

// Composables
const { enrichProspect } = useEntityIntelligence()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const prospect = ref<Prospect | null>(null)
const isGenerating = ref(false)
const isSendingEmail = ref(false)
const generatedEmail = ref<EmailDraft | null>(null)
const originalServerDraft = ref<EmailDraft | null>(null)

const isGeneratingLinkedIn = ref(false)
const isSendingLinkedIn = ref(false)
const generatedLinkedInMessage = ref<string | null>(null)
const originalServerLinkedInDraft = ref<string | null>(null)

const hasUnsavedChatChanges = ref(false)
const hasUnsavedLinkedInChatChanges = ref(false)
const activeView = ref<'email' | 'linkedin' | 'workflow'>('email')

// Entity Intelligence State
const showEntityModal = ref(false)
const isEnriching = ref(false)

// Contact Person State
const showContactModal = ref(false)
const isSavingContact = ref(false)
const editingContact = ref<ContactPersonDto | null>(null)
const enrichingContactId = ref<string | null>(null)

// Email Generator Type State
const emailGeneratorTypes = [
  { value: 'WebSearch' as const, label: 'Web Search' },
  { value: 'UseCollectedData' as const, label: 'Use Collected Data' },
  { value: 'EsattoRag' as const, label: 'Esatto RAG' }
]
const selectedEmailGeneratorType = ref<'WebSearch' | 'UseCollectedData' | 'EsattoRag'>('WebSearch')
const selectedLinkedInGeneratorType = ref<'WebSearch' | 'UseCollectedData' | 'EsattoRag'>('WebSearch')

// Edit Mode State
const isEditing = ref(false)
const isSaving = ref(false)
const formData = ref({
  name: '',
  websitesText: '',
  status: 0 as ProspectStatus,
  notes: ''
})

// Helper functions for array conversion
const splitLines = (text: string): string[] => {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

const arrayToText = (arr: Array<{ url?: string | null }>): string => {
  return arr
    .map(item => item.url || '')
    .filter(Boolean)
    .join('\n')
}

// Storage helper
const storageKey = (id: string) => `generatedEmail_${id}`

// Helper functions
function pickString(source: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return undefined
}

function extractEmailDraft(payload: unknown): EmailDraft | null {
  if (!payload) return null

  if (typeof payload === 'string') {
    const plain = payload.trim()
    return plain ? { mailBodyPlain: plain } : null
  }

  if (typeof payload === 'object') {
    const data = payload as Record<string, unknown>

    let mailTitle = pickString(data, ['mailTitle', 'MailTitle'])
    let mailBodyPlain = pickString(data, ['mailBodyPlain', 'MailBodyPlain'])
    let mailBodyHTML = pickString(data, ['mailBodyHTML', 'MailBodyHTML'])

    if (!mailTitle) {
      mailTitle = pickString(data, ['subject', 'title', 'mail_title'])
    }

    if (!mailBodyPlain) {
      mailBodyPlain = pickString(data, ['draft', 'email', 'body', 'text', 'content', 'MailBodyPlain', 'mail_body_plain'])
    }

    if (!mailBodyHTML) {
      mailBodyHTML = pickString(data, ['html', 'mailBodyHTML', 'MailBodyHTML', 'mail_body_html'])
    }

    if (mailTitle || mailBodyPlain || mailBodyHTML) {
      return { mailTitle, mailBodyPlain, mailBodyHTML }
    }
  }

  return null
}

function htmlToPlainText(html: string) {
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function draftHasContent(draft: EmailDraft | null | undefined): draft is EmailDraft {
  if (!draft) return false
  return Boolean(
    (draft.mailTitle && draft.mailTitle.trim()) ||
    (draft.mailBodyPlain && draft.mailBodyPlain.trim()) ||
    (draft.mailBodyHTML && draft.mailBodyHTML.trim())
  )
}

function loadDraftFromStorage(id: string): EmailDraft | null {
  try {
    const stored = localStorage.getItem(storageKey(id))
    if (!stored) return null
    try {
      return extractEmailDraft(JSON.parse(stored))
    } catch (e) {
      return extractEmailDraft(stored)
    }
  } catch (e) {
    return null
  }
}

function storeDraft(id: string, draft: EmailDraft) {
  if (!draftHasContent(draft)) return
  try { localStorage.setItem(storageKey(id), JSON.stringify(draft)) } catch (e) {}
}

function clearStoredDraft(id: string) {
  try { localStorage.removeItem(storageKey(id)) } catch (e) {}
}

function draftFromProspect(p: Prospect | null): EmailDraft | null {
  if (!p) return null
  const { mailTitle, mailBodyPlain, mailBodyHTML } = p
  if (!mailTitle && !mailBodyPlain && !mailBodyHTML) return null
  return {
    mailTitle: mailTitle?.trim() || undefined,
    mailBodyPlain: mailBodyPlain?.trim() || undefined,
    mailBodyHTML: mailBodyHTML?.trim() || undefined
  }
}

function syncDraftState() {
  if (!prospect.value) return

  const draft = generatedEmail.value
  const updatedProspect: Prospect = {
    ...prospect.value,
    mailTitle: draft?.mailTitle ?? undefined,
    mailBodyPlain: draft?.mailBodyPlain ?? undefined,
    mailBodyHTML: draft?.mailBodyHTML ?? undefined
  }

  prospect.value = updatedProspect

  if (!draft) {
    clearStoredDraft(updatedProspect.id)
    return
  }

  if (draftHasContent(draft)) {
    storeDraft(updatedProspect.id, draft)
  } else {
    clearStoredDraft(updatedProspect.id)
  }
}

// Computed properties
const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0
})

const hasGeneratedEmail = computed(() => generatedEmail.value !== null)
const hasGeneratedEmailContent = computed(() => draftHasContent(generatedEmail.value))

const hasUnsavedChanges = computed(() => {
  // Om chatten har gjort ändringar, räknas det alltid som osparade ändringar
  if (hasUnsavedChatChanges.value) return true
  
  const current = generatedEmail.value
  const original = originalServerDraft.value

  if (!current && !original) return false
  if (!current || !original) return true

  const currentTitle = current.mailTitle?.trim() || ''
  const originalTitle = original.mailTitle?.trim() || ''
  
  const currentBody = current.mailBodyPlain?.trim() || ''
  const originalBody = original.mailBodyPlain?.trim() || ''

  return currentTitle !== originalTitle || currentBody !== originalBody
})

const canSaveGeneratedEmail = computed(() => 
  hasGeneratedEmailContent.value && !isGenerating.value && hasUnsavedChanges.value
)

const canResetToBackend = computed(() => {
  // Visa knappen om det finns ett sparat mejl på backend OCH det är olika från nuvarande
  const serverDraft = originalServerDraft.value
  if (!serverDraft || !draftHasContent(serverDraft)) return false
  
  const current = generatedEmail.value
  if (!current) return false
  
  // Visa bara om det faktiskt är olika
  const currentTitle = current.mailTitle?.trim() || ''
  const serverTitle = serverDraft.mailTitle?.trim() || ''
  const currentBody = current.mailBodyPlain?.trim() || ''
  const serverBody = serverDraft.mailBodyPlain?.trim() || ''
  
  return currentTitle !== serverTitle || currentBody !== serverBody
})

const canSendEmail = computed(() => {
  const p = prospect.value
  if (!p || !p.contactPersons || p.contactPersons.length === 0) return false
  
  const hasSavedContent = Boolean(
    (p.mailTitle && p.mailTitle.trim()) ||
    (p.mailBodyPlain && p.mailBodyPlain.trim()) ||
    (p.mailBodyHTML && p.mailBodyHTML.trim())
  )
  
  return hasSavedContent && !isSendingEmail.value
})

const hasGeneratedLinkedInContent = computed(() => !!generatedLinkedInMessage.value?.trim())

const hasUnsavedLinkedInChanges = computed(() => {
  if (hasUnsavedLinkedInChatChanges.value) return true
  
  const current = generatedLinkedInMessage.value?.trim() || ''
  const original = originalServerLinkedInDraft.value?.trim() || ''

  return current !== original
})

const canSaveGeneratedLinkedIn = computed(() => 
  hasGeneratedLinkedInContent.value && !isGeneratingLinkedIn.value && hasUnsavedLinkedInChanges.value
)

const canResetLinkedInToBackend = computed(() => {
  const serverDraft = originalServerLinkedInDraft.value
  if (!serverDraft?.trim()) return false
  
  const current = generatedLinkedInMessage.value?.trim() || ''
  const serverText = serverDraft.trim() || ''
  
  return current !== serverText
})

const canSendLinkedIn = computed(() => {
  const p = prospect.value
  if (!p) return false
  
  const hasSavedContent = Boolean(p.linkedInMessage && p.linkedInMessage.trim())
  return hasSavedContent && !isSendingLinkedIn.value
})

const generatedEmailSubject = computed({
  get: () => generatedEmail.value?.mailTitle ?? '',
  set: value => {
    const subject = typeof value === 'string' ? value : ''
    const trimmed = subject.trim()
    const current = generatedEmail.value ?? {}
    const next: EmailDraft = {
      ...current,
      mailTitle: trimmed ? trimmed : undefined
    }
    if (!trimmed) {
      delete next.mailTitle
    }
    generatedEmail.value = draftHasContent(next) ? next : {}
    syncDraftState()
  }
})

const generatedEmailBody = computed({
  get: () => {
    const draft = generatedEmail.value
    if (!draft) return ''
    if (typeof draft.mailBodyPlain === 'string') return draft.mailBodyPlain
    if (typeof draft.mailBodyHTML === 'string') return htmlToPlainText(draft.mailBodyHTML)
    return ''
  },
  set: value => {
    const bodyInput = typeof value === 'string' ? value.replace(/\r\n/g, '\n') : ''
    const trimmed = bodyInput.trim()
    const current = generatedEmail.value ?? {}
    const next: EmailDraft = {
      ...current,
      mailBodyPlain: trimmed ? bodyInput : undefined
    }
    delete next.mailBodyHTML
    if (!trimmed) {
      delete next.mailBodyPlain
    }
    generatedEmail.value = draftHasContent(next) ? next : {}
    syncDraftState()
  }
})

// Status -> local CSS class names
const getStatusClass = (status: number) => {
  switch (status) {
    case 0: return 'bg-blue-100 text-blue-800'
    case 1: return 'bg-amber-100 text-amber-800'
    case 2: return 'bg-purple-100 text-purple-800'
    case 3: return 'bg-indigo-100 text-indigo-800'
    case 4: return 'bg-emerald-100 text-emerald-800'
    case 5: return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

// Edit Mode Actions
function startEditing() {
  if (!prospect.value) return
  
  // Populate form with current values
  formData.value = {
    name: prospect.value.name,
    websitesText: arrayToText(prospect.value.websites),
    status: prospect.value.status,
    notes: prospect.value.notes || ''
  }
  
  isEditing.value = true
}

function cancelEditing() {
  if (hasUnsavedEditChanges()) {
    if (!confirm('You have unsaved changes. Do you really want to cancel?')) {
      return
    }
  }
  
  isEditing.value = false
}

function hasUnsavedEditChanges(): boolean {
  if (!prospect.value) return false
  
  return (
    formData.value.name !== prospect.value.name ||
    formData.value.websitesText !== arrayToText(prospect.value.websites) ||
    formData.value.status !== prospect.value.status ||
    formData.value.notes !== (prospect.value.notes || '')
  )
}

async function saveChanges() {
  if (!prospect.value || !isFormValid.value) return
  
  isSaving.value = true
  error.value = null
  
  try {
    const updatePayload: Record<string, any> = {
      name: formData.value.name.trim(),
      websites: splitLines(formData.value.websitesText),
      status: formData.value.status,
      notes: formData.value.notes.trim() || undefined
    }
    
    const updated = await prospectsAPI.update(prospect.value.id, updatePayload)
    prospect.value = updated
    isEditing.value = false
    
    // Show success message briefly
    const successMsg = document.createElement('div')
    successMsg.textContent = 'Changes saved'
    successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; z-index: 9999; font-weight: 500;'
    document.body.appendChild(successMsg)
    setTimeout(() => successMsg.remove(), 3000)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Could not save changes'
    alert(`Error: ${error.value}`)
  } finally {
    isSaving.value = false
  }
}

// Email and Entity Intelligence Actions
async function handleEnrichProspect(prospectId: string) {
  if (!prospect.value) return
  
  isEnriching.value = true
  error.value = null
  
  console.log('ProspectDetail: Starting enrichment for', prospect.value.id)
  
  try {
    const intelligence = await enrichProspect(prospect.value.id)
    
    console.log('ProspectDetail: Received intelligence', intelligence)
    
    // Update the prospect with the new intelligence
    if (prospect.value && intelligence) {
      prospect.value.entityIntelligence = intelligence
      // Uppdatera status till Undersökt när research är klar
      if (prospect.value.status === ProspectStatusEnum.New) {
        prospect.value.status = ProspectStatusEnum.Researched
      }
      console.log('ProspectDetail: Updated prospect with intelligence data')
    }
    
    // Automatically show the modal after generation
    showEntityModal.value = true
    
    // Reload full prospect to get discovered contacts (in background to avoid full page spinner)
    await fetchProspect(true)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to enrich prospect data'
    console.error('Error enriching prospect:', err)
  } finally {
    isEnriching.value = false
  }
}

async function fetchProspect(background = false) {
  const id = route.params.id as string
  if (!id) {
    error.value = 'Inget prospect-ID angivet'
    loading.value = false
    return
  }

  try {
    if (!background) loading.value = true
    error.value = null
    prospect.value = await prospectsAPI.getById(id)
    
    console.log('ProspectDetail: Loaded prospect', {
      id: prospect.value.id,
      name: prospect.value.name,
      hasIntelligence: !!prospect.value.entityIntelligence,
      intelligenceKeys: prospect.value.entityIntelligence ? Object.keys(prospect.value.entityIntelligence) : null
    })

    const serverDraft = draftFromProspect(prospect.value)
    originalServerDraft.value = serverDraft
    
    if (serverDraft) {
      generatedEmail.value = serverDraft
      if (prospect.value) {
        storeDraft(prospect.value.id, serverDraft)
      }
    } else {
      if (prospect.value) {
        generatedEmail.value = loadDraftFromStorage(prospect.value.id)
      }
    }

    originalServerLinkedInDraft.value = prospect.value.linkedInMessage || null
    generatedLinkedInMessage.value = originalServerLinkedInDraft.value
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Kunde inte ladda prospect'
    console.error('Error fetching prospect:', err)
  } finally {
    loading.value = false
  }
}

const handleGenerateEmail = async () => {
  if (!prospect.value) return
  const prospectId = prospect.value.id
  isGenerating.value = true
  try {
    const response = await prospectsAPI.generateEmailDraft(prospect.value.id, selectedEmailGeneratorType.value)
    const draft = extractEmailDraft(response)

    if (!draft) {
      throw new Error('Ingen mejltext genererades')
    }

    generatedEmail.value = draft
    prospect.value = { ...prospect.value, ...draft }
    storeDraft(prospectId, draft)
    // Återställ chat-flaggan när nytt mejl genereras
    hasUnsavedChatChanges.value = false
  } catch (err: any) {
    const message = err.response?.data?.error || err.message || 'Kunde inte generera mejl'
    alert(message)
  } finally {
    isGenerating.value = false
  }
}

const clearGeneratedEmail = () => {
  if (!prospect.value) return
  const prospectId = prospect.value.id
  clearStoredDraft(prospectId)
  generatedEmail.value = null
  originalServerDraft.value = null
  hasUnsavedChatChanges.value = false
  prospect.value = {
    ...prospect.value,
    mailTitle: undefined,
    mailBodyPlain: undefined,
    mailBodyHTML: undefined
  }
}

const resetToBackendDraft = () => {
  if (!originalServerDraft.value) return
  generatedEmail.value = originalServerDraft.value
  hasUnsavedChatChanges.value = false
  syncDraftState()
}

const saveGeneratedEmail = async () => {
  if (!prospect.value) return
  const draft = generatedEmail.value
  if (!draft) return
  
  isGenerating.value = true
  try {
    const updatePayload: Record<string, any> = {
      mailTitle: draft.mailTitle?.trim() || undefined,
      mailBodyPlain: draft.mailBodyPlain?.trim() || undefined,
      mailBodyHTML: draft.mailBodyHTML?.trim() || undefined
    }

    if (prospect.value.status === ProspectStatusEnum.Researched || prospect.value.status === ProspectStatusEnum.New) {
      updatePayload.status = ProspectStatusEnum.Drafted
    }

    const updated = await prospectsAPI.update(prospect.value.id, updatePayload)
    prospect.value = updated
    originalServerDraft.value = draftFromProspect(updated)
    generatedEmail.value = originalServerDraft.value
    storeDraft(updated.id, generatedEmail.value!)
    hasUnsavedChatChanges.value = false
  } catch (err: any) {
    const message = err.response?.data?.error || err.message || 'Kunde inte spara mejl'
    alert(message)
  } finally {
    isGenerating.value = false
  }
}

const handleSendEmail = async () => {
  if (!prospect.value) return
  // Beuser bekräfta först
  const recipient = prospect.value.contactPersons?.[0]?.email || prospect.value.name
  if (!confirm(`Ska vi skicka mejlet till ${recipient}?`)) {
    return
  }

  isSendingEmail.value = true
  try {
    await prospectsAPI.sendEmail(prospect.value.id)
    alert('Mejl skickat via n8n!')
    
    const updated = await prospectsAPI.getById(prospect.value.id)
    prospect.value = updated
  } catch (err: any) {
    const message = err.response?.data?.error || err.message || 'Kunde inte skicka mejl'
    alert(message)
  } finally {
    isSendingEmail.value = false
  }
}

// Hantera uppdateringar från chatten
const handleEmailUpdated = (data: { mailTitle?: string; mailBodyPlain?: string; mailBodyHTML?: string }) => {
  if (!prospect.value || !data.mailBodyPlain) return
  
  // Uppdatera state med nytt innehåll från chatten
  const current = generatedEmail.value ?? {}
  const next: EmailDraft = {
    ...current,
    mailBodyPlain: data.mailBodyPlain
  }
  
  if (data.mailTitle) {
    next.mailTitle = data.mailTitle
  }
  
  // Ta bort HTML-versionen då den inte längre matchar plain text
  delete next.mailBodyHTML
  
  generatedEmail.value = next
  hasUnsavedChatChanges.value = true
  syncDraftState()
}

const handleGenerateLinkedIn = async () => {
  if (!prospect.value) return
  const prospectId = prospect.value.id
  isGeneratingLinkedIn.value = true
  try {
    const response = await prospectsAPI.generateLinkedInDraft(prospect.value.id, selectedLinkedInGeneratorType.value)
    
    // response is the updated Prospect object containing linkedInMessage
    const message = (response as any).linkedInMessage

    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('Ingen LinkedIn-text genererades')
    }

    generatedLinkedInMessage.value = message.trim()
    prospect.value = { ...prospect.value, linkedInMessage: message.trim() }
    hasUnsavedLinkedInChatChanges.value = false
  } catch (err: any) {
    const message = err.response?.data?.error || err.message || 'Kunde inte generera LinkedIn-meddelande'
    alert(message)
  } finally {
    isGeneratingLinkedIn.value = false
  }
}

const clearGeneratedLinkedIn = () => {
  if (!prospect.value) return
  generatedLinkedInMessage.value = null
  originalServerLinkedInDraft.value = null
  hasUnsavedLinkedInChatChanges.value = false
  prospect.value = {
    ...prospect.value,
    linkedInMessage: undefined
  }
}

const resetToBackendLinkedInDraft = () => {
  if (!originalServerLinkedInDraft.value) return
  generatedLinkedInMessage.value = originalServerLinkedInDraft.value
  hasUnsavedLinkedInChatChanges.value = false
}

const saveGeneratedLinkedInMessage = async () => {
  if (!prospect.value) return
  const draftBody = generatedLinkedInMessage.value
  if (!draftBody) return
  
  isGeneratingLinkedIn.value = true
  try {
    const updatePayload: Record<string, any> = {
      linkedInMessage: draftBody.trim() || undefined
    }

    if (prospect.value.status === ProspectStatusEnum.Researched || prospect.value.status === ProspectStatusEnum.New) {
      updatePayload.status = ProspectStatusEnum.Drafted
    }

    const updated = await prospectsAPI.update(prospect.value.id, updatePayload)
    prospect.value = updated
    originalServerLinkedInDraft.value = updated.linkedInMessage || null
    generatedLinkedInMessage.value = originalServerLinkedInDraft.value
    hasUnsavedLinkedInChatChanges.value = false
  } catch (err: any) {
    const message = err.response?.data?.error || err.message || 'Kunde inte spara LinkedIn-meddelande'
    alert(message)
  } finally {
    isGeneratingLinkedIn.value = false
  }
}

const handleSendLinkedIn = async () => {
  if (!prospect.value) return
  const recipient = prospect.value.contactPersons?.[0]?.name || prospect.value.name
  if (!confirm(`This is a mock. Should we simulate sending a LinkedIn message to ${recipient}?`)) {
    return
  }

  isSendingLinkedIn.value = true
  
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  alert('Mock LinkedIn message sent successfully!')
  isSendingLinkedIn.value = false
}

const handleLinkedInChatUpdated = (data: { mailBodyPlain?: string }) => {
  if (!prospect.value || !data.mailBodyPlain) return
  
  generatedLinkedInMessage.value = data.mailBodyPlain
  hasUnsavedLinkedInChatChanges.value = true
}

function openAddContactModal() {
  editingContact.value = null
  showContactModal.value = true
}

function openEditContactModal(contact: ContactPersonDto) {
  editingContact.value = contact
  showContactModal.value = true
}

async function handleSaveContact(data: CreateContactPersonRequest) {
  if (!prospect.value) return
  
  isSavingContact.value = true
  try {
     let savedContact: ContactPersonDto;
     
     if (editingContact.value) {
        // Update existing
        savedContact = await prospectsAPI.updateContact(prospect.value.id, editingContact.value.id, data)
        // Update local list
        const index = prospect.value.contactPersons?.findIndex(c => c.id === savedContact.id)
        if (index !== undefined && index !== -1 && prospect.value.contactPersons) {
           prospect.value.contactPersons[index] = savedContact
        }
     } else {
        // Create new
        savedContact = await prospectsAPI.addContact(prospect.value.id, data)
        if (!prospect.value.contactPersons) {
           prospect.value.contactPersons = []
        }
        prospect.value.contactPersons.push(savedContact)
     }
     
     showContactModal.value = false
  } catch(err: any) {
     alert('Failed to save contact: ' + (err.response?.data?.error || err.message))
  } finally {
     isSavingContact.value = false
  }
}

async function handleDeleteContact(contact: ContactPersonDto) {
   if (!prospect.value || !confirm(`Are you sure you want to delete ${contact.name}?`)) return
   
   try {
      await prospectsAPI.deleteContact(prospect.value.id, contact.id)
      // Remove from local list
      prospect.value.contactPersons = prospect.value.contactPersons?.filter(c => c.id !== contact.id)
   } catch(err: any) {
      alert('Failed to delete contact: ' + (err.response?.data?.error || err.message))
   }
}

async function handleEnrichContact(contact: ContactPersonDto) {
   if (!prospect.value) return
   
   enrichingContactId.value = contact.id
   try {
      const enriched = await prospectsAPI.enrichContact(prospect.value.id, contact.id)
      
      // Update local contact with enriched data
      const index = prospect.value.contactPersons?.findIndex(c => c.id === enriched.id)
      if (index !== undefined && index !== -1 && prospect.value.contactPersons) {
         prospect.value.contactPersons[index] = enriched
      }
      
      alert(`Successfully enriched ${contact.name}!`)
   } catch(err: any) {
      alert('Failed to enrich contact: ' + (err.response?.data?.error || err.message))
   } finally {
      enrichingContactId.value = null
   }
}


async function handleSetActiveContact(contact: ContactPersonDto) {
  if (!prospect.value) return
  
  try {
    await prospectsAPI.setActiveContact(prospect.value.id, contact.id)
    
    if (prospect.value.contactPersons) {
      prospect.value.contactPersons = prospect.value.contactPersons.map(c => ({
        ...c,
        isActive: c.id === contact.id
      }))
    }
    
    const successMsg = document.createElement('div')
    successMsg.textContent = `${contact.name} is now the active contact`
    successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; z-index: 9999; font-weight: 500;'
    document.body.appendChild(successMsg)
    setTimeout(() => successMsg.remove(), 3000)
  } catch (err: any) {
    const errMsg = err.response?.data?.error || 'Failed to set active contact'
    alert(`Error: ${errMsg}`)
    console.error('Error setting active contact:', err)
  }
}

async function handleClearActiveContact(contact: ContactPersonDto) {
  if (!prospect.value) return
  
  try {
    await prospectsAPI.clearActiveContact(prospect.value.id)
    
    if (prospect.value.contactPersons) {
      prospect.value.contactPersons = prospect.value.contactPersons.map(c => ({
        ...c,
        isActive: false
      }))
    }
    
    const successMsg = document.createElement('div')
    successMsg.textContent = 'Active contact cleared'
    successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; z-index: 9999; font-weight: 500;'
    document.body.appendChild(successMsg)
    setTimeout(() => successMsg.remove(), 3000)
  } catch (err: any) {
    const errMsg = err.response?.data?.error || 'Failed to clear active contact'
    alert(`Error: ${errMsg}`)
    console.error('Error clearing active contact:', err)
  }
}

onMounted(() => {
  fetchProspect()
})
</script>
