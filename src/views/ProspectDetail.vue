<template>
  <div class="prospect-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Laddar...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="router.push('/prospects')" class="btn-secondary">
        Tillbaka till listan
      </button>
    </div>

    <!-- Prospect Detail Content -->
    <div v-else-if="prospect" class="detail-content">
      <!-- Back Button and Title -->
      <div class="detail-header">
        <h2 class="detail-title">{{ isEditing ? formData.companyName : prospect.companyName }}</h2>
        <div class="header-actions">
          <button 
            v-if="!isEditing" 
            @click="startEditing" 
            class="btn-edit"
          >
            Redigera
          </button>
          <button @click="router.push('/prospects')" class="back-button">
            ← Tillbaka till listan
          </button>
        </div>
      </div>

      <!-- Edit Mode Actions -->
      <div v-if="isEditing" class="edit-actions">
        <button 
          @click="saveChanges" 
          :disabled="isSaving || !isFormValid"
          class="btn-save"
        >
          {{ isSaving ? 'Sparar...' : 'Spara ändringar' }}
        </button>
        <button 
          @click="cancelEditing" 
          :disabled="isSaving"
          class="btn-cancel"
        >
          Avbryt
        </button>
      </div>

      <!-- Company Information Grid -->
      <div class="company-info-grid">
        <div class="info-row">
          <label class="info-label">Företagsnamn: <span v-if="isEditing" class="required">*</span></label>
          <input 
            v-if="isEditing"
            v-model="formData.companyName"
            type="text"
            class="info-input"
            :class="{ 'input-error': !formData.companyName?.trim() }"
            placeholder="Företagsnamn (obligatoriskt)"
            required
          />
          <span v-else class="info-value">{{ prospect.companyName }}</span>
        </div>

        <div class="info-row">
          <label class="info-label">Kontaktperson:</label>
          <input 
            v-if="isEditing"
            v-model="formData.contactName"
            type="text"
            class="info-input"
            placeholder="Kontaktperson"
          />
          <span v-else class="info-value">{{ prospect.contactName || 'N/A' }}</span>
        </div>

        <div class="info-row">
          <label class="info-label">Email:</label>
          <input 
            v-if="isEditing"
            v-model="formData.contactEmail"
            type="email"
            class="info-input"
            placeholder="email@example.com"
          />
          <span v-else class="info-value">{{ prospect.contactEmail || 'N/A' }}</span>
        </div>

        <div class="info-row">
          <label class="info-label">Domän:</label>
          <input 
            v-if="isEditing"
            v-model="formData.domain"
            type="url"
            class="info-input"
            placeholder="https://example.com"
          />
          <span v-else class="info-value">{{ prospect.domain || 'N/A' }}</span>
        </div>

        <div class="info-row">
          <label class="info-label">LinkedIn:</label>
          <input 
            v-if="isEditing"
            v-model="formData.linkedinUrl"
            type="url"
            class="info-input"
            placeholder="https://linkedin.com/company/..."
          />
          <span v-else class="info-value">{{ prospect.linkedinUrl || 'N/A' }}</span>
        </div>

        <div class="info-row">
          <label class="info-label">Status:</label>
          <select 
            v-if="isEditing"
            v-model="formData.status"
            class="info-select"
          >
            <option :value="0">Ny</option>
            <option :value="1">Undersökt</option>
            <option :value="2">Utkast</option>
            <option :value="3">Mejlad</option>
            <option :value="4">Svarat</option>
            <option :value="5">Arkiverad</option>
          </select>
          <span v-else class="info-value">
            <span :class="['status-badge', `status-${prospect.status}`]">
              {{ statusLabels[prospect.status as ProspectStatus] || 'Okänd' }}
            </span>
          </span>
        </div>

        <div class="info-row">
          <label class="info-label">Skapad:</label>
          <span class="info-value">{{ new Date(prospect.createdUtc).toLocaleDateString('sv-SE') }}</span>
        </div>
      </div>

      <!-- Notes Section (Editable) -->
      <div class="notes-section" :class="{ 'notes-editing': isEditing }">
        <label class="notes-label">Anteckningar</label>
        <textarea 
          v-if="isEditing"
          v-model="formData.notes"
          class="notes-textarea"
          placeholder="Lägg till anteckningar..."
          rows="4"
        ></textarea>
        <p v-else class="notes-text">{{ prospect.notes || 'Inga anteckningar' }}</p>
      </div>

      <!-- Soft Company Data Section -->
      <div class="soft-data-section">
        <h3>Mjuk Företagsdata</h3>
        <SoftDataButton
          :prospectId="prospect.id"
          :softData="prospect.softCompanyData"
          :loading="isGeneratingSoftData"
          @generate="handleGenerateSoftData"
          @view="showSoftDataModal = true"
        />
      </div>

      <!-- Notes Section -->
      <div class="notes-section">
        <h3>Anteckningar</h3>
        <p class="notes-text">{{ prospect.notes || 'Inga anteckningar' }}</p>
      </div>

      <!-- Email and Chat Section (Two Columns) -->
      <div class="email-chat-container">
        <!-- Email Section (Left) -->
        <div class="email-section">
          <!-- Email Action Buttons -->
          <div class="email-actions">
            <button 
              @click="generateEmail" 
              :disabled="isGenerating"
              class="btn-primary"
            >
              {{ isGenerating ? 'Genererar...' : 'Generera Mejl' }}
            </button>

            <button 
              v-if="canResetToBackend"
              @click="resetToBackendVersion"
              :disabled="isGenerating"
              class="btn-reset"
            >
              Återställ till Sparat
            </button>

            <button 
              v-if="hasGeneratedEmailContent"
              @click="clearGeneratedEmail"
              :disabled="isGenerating"
              class="btn-danger"
            >
              Rensa Mejl
            </button>

            <button 
              v-if="canSaveGeneratedEmail"
              @click="saveEmailToProspect"
              :disabled="isGenerating"
              class="btn-success"
            >
              Spara Mejl
            </button>

            <button 
              v-if="canSendEmail"
              @click="sendEmailToN8n"
              :disabled="isSendingEmail"
              class="btn-send"
            >
              {{ isSendingEmail ? 'Skickar...' : 'Skicka Mejl via n8n' }}
            </button>
          </div>

          <!-- Generated Email Preview -->
          <div v-if="hasGeneratedEmail" class="email-preview">
            <div class="email-field">
              <label>Ämne:</label>
              <textarea 
                v-model="generatedEmailSubject"
                placeholder="Email ämne..."
                rows="2"
                class="email-input"
              ></textarea>
            </div>

            <div class="email-field">
              <label>Meddelande:</label>
              <textarea 
                v-model="generatedEmailBody"
                placeholder="Email meddelande..."
                rows="12"
                class="email-input"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Chat Section (Right) -->
        <div class="chat-section">
          <ChatBox 
            :prospectId="prospect.id"
            :mailTitle="generatedEmail?.mailTitle"
            :mailBodyPlain="generatedEmail?.mailBodyPlain"
            @emailUpdated="handleEmailUpdated"
          />
        </div>
      </div>

      <!-- Soft Company Data Modal -->
      <SoftCompanyDataModal
        :show="showSoftDataModal"
        :softData="prospect.softCompanyData"
        :loading="isGeneratingSoftData"
        @close="showSoftDataModal = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Prospect, EmailDraft, ProspectStatus } from '../types/prospect'
import { ProspectStatus as ProspectStatusEnum, statusLabels } from '../types/prospect'
import { prospectsAPI } from '../services/prospects'
import ChatBox from '../components/ChatBox.vue'
import SoftDataButton from '../components/SoftDataButton.vue'
import SoftCompanyDataModal from '../components/SoftCompanyDataModal.vue'
import { useSoftCompanyData } from '../composables/useSoftCompanyData'

const route = useRoute()
const router = useRouter()

// Composables
const { generateSoftData } = useSoftCompanyData()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const prospect = ref<Prospect | null>(null)
const isGenerating = ref(false)
const isSendingEmail = ref(false)
const generatedEmail = ref<EmailDraft | null>(null)
const originalServerDraft = ref<EmailDraft | null>(null)
const hasUnsavedChatChanges = ref(false)

// Soft Company Data State
const showSoftDataModal = ref(false)
const isGeneratingSoftData = ref(false)

// Edit Mode State
const isEditing = ref(false)
const isSaving = ref(false)
const formData = ref({
  companyName: '',
  contactName: '',
  contactEmail: '',
  domain: '',
  linkedinUrl: '',
  status: 0 as ProspectStatus,
  notes: ''
})

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
  return formData.value.companyName.trim().length > 0
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
  if (!p || !p.contactEmail) return false
  
  const hasSavedContent = Boolean(
    (p.mailTitle && p.mailTitle.trim()) ||
    (p.mailBodyPlain && p.mailBodyPlain.trim()) ||
    (p.mailBodyHTML && p.mailBodyHTML.trim())
  )
  
  return hasSavedContent && !isSendingEmail.value
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

// Actions
// Edit Mode Actions
function startEditing() {
  if (!prospect.value) return
  
  // Populate form with current values
  formData.value = {
    companyName: prospect.value.companyName,
    contactName: prospect.value.contactName || '',
    contactEmail: prospect.value.contactEmail || '',
    domain: prospect.value.domain || '',
    linkedinUrl: prospect.value.linkedinUrl || '',
    status: prospect.value.status,
    notes: prospect.value.notes || ''
  }
  
  isEditing.value = true
}

function cancelEditing() {
  if (hasUnsavedEditChanges()) {
    if (!confirm('Du har osparade ändringar. Vill du verkligen avbryta?')) {
      return
    }
  }
  
  isEditing.value = false
}

function hasUnsavedEditChanges(): boolean {
  if (!prospect.value) return false
  
  return (
    formData.value.companyName !== prospect.value.companyName ||
    formData.value.contactName !== (prospect.value.contactName || '') ||
    formData.value.contactEmail !== (prospect.value.contactEmail || '') ||
    formData.value.domain !== (prospect.value.domain || '') ||
    formData.value.linkedinUrl !== (prospect.value.linkedinUrl || '') ||
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
      companyName: formData.value.companyName.trim(),
      contactName: formData.value.contactName.trim() || undefined,
      contactEmail: formData.value.contactEmail.trim() || undefined,
      domain: formData.value.domain.trim() || undefined,
      linkedinUrl: formData.value.linkedinUrl.trim() || undefined,
      status: formData.value.status,
      notes: formData.value.notes.trim() || undefined
    }
    
    const updated = await prospectsAPI.update(prospect.value.id, updatePayload)
    prospect.value = updated
    isEditing.value = false
    
    // Show success message briefly
    const successMsg = document.createElement('div')
    successMsg.textContent = 'Ändringar sparade'
    successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; z-index: 9999; font-weight: 500;'
    document.body.appendChild(successMsg)
    setTimeout(() => successMsg.remove(), 3000)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Kunde inte spara ändringar'
    alert(`Fel: ${error.value}`)
  } finally {
    isSaving.value = false
  }
}

// Email and Soft Data Actions
async function handleGenerateSoftData(prospectId: string, provider: 'OpenAI' | 'Claude' | 'Hybrid') {
  if (!prospect.value) return
  
  isGeneratingSoftData.value = true
  error.value = null
  
  console.log('ProspectDetail: Starting soft data generation for', prospect.value.id, 'with provider:', provider)
  
  try {
    const softData = await generateSoftData(prospect.value.id, provider)
    
    console.log('ProspectDetail: Received soft data', softData)
    
    // Update the prospect with the new soft data
    if (prospect.value && softData) {
      prospect.value.softCompanyData = softData
      // Uppdatera status till Undersökt när research är klar
      if (prospect.value.status === ProspectStatusEnum.New) {
        prospect.value.status = ProspectStatusEnum.Researched
      }
      console.log('ProspectDetail: Updated prospect with soft data and status')
    }
    
    // Automatically show the modal after generation
    showSoftDataModal.value = true
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Kunde inte generera mjuk företagsdata'
    console.error('Error generating soft company data:', err)
  } finally {
    isGeneratingSoftData.value = false
  }
}

async function fetchProspect() {
  const id = route.params.id as string
  if (!id) {
    error.value = 'Inget prospect-ID angivet'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null
    prospect.value = await prospectsAPI.getById(id)
    
    console.log('ProspectDetail: Loaded prospect', {
      id: prospect.value.id,
      companyName: prospect.value.companyName,
      hasSoftData: !!prospect.value.softCompanyData,
      softDataKeys: prospect.value.softCompanyData ? Object.keys(prospect.value.softCompanyData) : null
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
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Kunde inte ladda prospect'
    console.error('Error fetching prospect:', err)
  } finally {
    loading.value = false
  }
}

const generateEmail = async () => {
  if (!prospect.value) return
  const prospectId = prospect.value.id
  isGenerating.value = true
  try {
    const response = await prospectsAPI.generateEmailDraft(prospect.value.id)
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

const resetToBackendVersion = () => {
  if (!originalServerDraft.value) return
  
  if (!confirm('Vill du återställa mejlet till den sparade versionen? Alla ändringar går förlorade.')) return
  
  // Återställ till backend-versionen
  generatedEmail.value = { ...originalServerDraft.value }
  hasUnsavedChatChanges.value = false
  
  if (prospect.value) {
    storeDraft(prospect.value.id, originalServerDraft.value)
  }
}

const saveEmailToProspect = async () => {
  const p = prospect.value
  const draft = generatedEmail.value
  if (!p || !draftHasContent(draft)) return

  const existingDraft = draftFromProspect(p)
  if (existingDraft && !confirm('Det finns redan ett mejlutkast sparat. Vill du skriva över det?')) return

  try {
    isGenerating.value = true
    const updatePayload: Record<string, any> = {}
    if (draft.mailTitle !== undefined) updatePayload.mailTitle = draft.mailTitle
    if (draft.mailBodyPlain !== undefined) updatePayload.mailBodyPlain = draft.mailBodyPlain
    if (draft.mailBodyHTML !== undefined) updatePayload.mailBodyHTML = draft.mailBodyHTML
    
    const updated = await prospectsAPI.update(p.id, updatePayload)
    prospect.value = updated
    
    const savedDraft = draftFromProspect(updated)
    generatedEmail.value = savedDraft
    originalServerDraft.value = savedDraft
    
    // Återställ chat-ändringar flaggan efter sparning
    hasUnsavedChatChanges.value = false
    
    if (savedDraft) {
      storeDraft(updated.id, savedDraft)
    } else {
      clearStoredDraft(updated.id)
    }
    alert('Mejlutkast sparat till prospect')
  } catch (err: any) {
    alert(err.response?.data?.error || 'Kunde inte spara mejlutkast på prospect')
  } finally {
    isGenerating.value = false
  }
}

const sendEmailToN8n = async () => {
  const p = prospect.value
  if (!p) return

  if (!p.contactEmail) {
    alert('⚠️ Ingen email-adress finns för denna prospect')
    return
  }

  const hasContent = Boolean(
    (p.mailTitle && p.mailTitle.trim()) ||
    (p.mailBodyPlain && p.mailBodyPlain.trim())
  )

  if (!hasContent) {
    alert('⚠️ Inget mejlutkast finns sparat. Generera och spara ett mejlutkast först.')
    return
  }

  const confirmMessage = `Skicka email till ${p.contactEmail} för ${p.companyName}?`
  if (!confirm(confirmMessage)) return

  isSendingEmail.value = true
  try {
    const result = await prospectsAPI.sendEmail(p.id)
    
    if (result.success) {
      // Uppdatera status till Utkast när email skickas till n8n
      if (prospect.value) {
        prospect.value.status = ProspectStatusEnum.Drafted
      }
      alert(`Email skickat till ditt utkast`)
      await fetchProspect()
    } else {
      alert(`❌ Kunde inte skicka email till ditt utkast: ${result.message || 'Okänt fel'}`)
    }
  } catch (err: any) {
    const errorMsg = err.response?.data?.error || err.message || 'Ett fel uppstod'
    alert(`❌ Kunde inte skicka email till ditt utkast: ${errorMsg}`)
    console.error('Send email error:', err)
  } finally {
    isSendingEmail.value = false
  }
}

// Handle email update from chat
function handleEmailUpdated(data: { mailTitle?: string; mailBodyPlain?: string; mailBodyHTML?: string }) {
  if (!generatedEmail.value) {
    generatedEmail.value = {}
  }
  
  if (data.mailTitle !== undefined) {
    generatedEmail.value.mailTitle = data.mailTitle
  }
  if (data.mailBodyPlain !== undefined) {
    generatedEmail.value.mailBodyPlain = data.mailBodyPlain
  }
  if (data.mailBodyHTML !== undefined) {
    generatedEmail.value.mailBodyHTML = data.mailBodyHTML
  }
  
  syncDraftState()
  
  // Markera att chatten har gjort ändringar som behöver sparas
  hasUnsavedChatChanges.value = true
}

// Load prospect on mount
onMounted(() => {
  fetchProspect()
})
</script>

<style scoped>
.prospect-detail-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.75rem 2rem;
  min-height: 100vh;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.error-state p {
  color: #dc2626;
  margin-bottom: 1rem;
}

.detail-content {
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 2rem;
}

.email-chat-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

@media (max-width: 1200px) {
  .email-chat-container {
    grid-template-columns: 1fr;
  }
}

.email-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-section {
  display: flex;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.back-button {
  padding: 0.5rem 1rem;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.back-button:hover {
  background-color: #4b5563;
}

.detail-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.company-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 0.875rem;
  color: #111827;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-0,
.status-new {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-1,
.status-researched {
  background-color: #fef3c7;
  color: #92400e;
}

.status-2,
.status-drafted {
  background-color: #e0e7ff;
  color: #4338ca;
}

.status-3,
.status-emailed {
  background-color: #ddd6fe;
  color: #5b21b6;
}

.status-4,
.status-responded {
  background-color: #d1fae5;
  color: #065f46;
}

.status-5,
.status-archived {
  background-color: #fee2e2;
  color: #991b1b;
}

.notes-text {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: pre-wrap;
}

.soft-data-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f0f9ff;
  border-radius: 0.375rem;
  border: 1px solid #bfdbfe;
}

.soft-data-section h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.email-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.btn-primary,
.btn-secondary,
.btn-success,
.btn-send,
.btn-danger,
.btn-reset {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-success {
  background-color: #16a34a;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #15803d;
}

.btn-send {
  background-color: #7c3aed;
  color: white;
}

.btn-send:hover:not(:disabled) {
  background-color: #6d28d9;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-reset {
  background-color: #9ca3af;
  color: white;
}

.btn-reset:hover:not(:disabled) {
  background-color: #6b7280;
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-success:disabled,
.btn-send:disabled,
.btn-danger:disabled,
.btn-reset:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.email-preview {
  margin-top: 1.5rem;
}

.email-field {
  margin-bottom: 1rem;
}

.email-field label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.email-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
}

.email-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Edit Mode Styles */
.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn-edit {
  padding: 0.5rem 1rem;
  background-color: #f59e0b;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-edit:hover {
  background-color: #d97706;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #fef3c7;
  border-radius: 0.375rem;
  border: 1px solid #fbbf24;
}

.btn-save {
  padding: 0.625rem 1.25rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background-color: #059669;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 0.625rem 1.25rem;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-input,
.info-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s;
  background-color: white;
}

.info-input:focus,
.info-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.info-input.input-error {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.info-input.input-error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.required {
  color: #dc2626;
  font-weight: 700;
}

.notes-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}

.notes-section.notes-editing {
  background-color: #eff6ff;
  border: 2px solid #3b82f6;
}

.notes-section h3,
.notes-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

.notes-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.notes-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
