import type { EmailDraft } from '@/types/prospect'
import { draftHasContent, extractEmailDraft } from '@/features/prospects/composables/useProspectDraftUtils'

function storageKey(id: string) {
  return `generatedEmail_${id}`
}

export function loadDraftFromStorage(id: string): EmailDraft | null {
  try {
    const stored = localStorage.getItem(storageKey(id))
    if (!stored) return null
    try {
      return extractEmailDraft(JSON.parse(stored))
    } catch {
      return extractEmailDraft(stored)
    }
  } catch {
    return null
  }
}

export function storeDraft(id: string, draft: EmailDraft) {
  if (!draftHasContent(draft)) return
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(draft))
  } catch {
    // ignore storage errors
  }
}

export function clearStoredDraft(id: string) {
  try {
    localStorage.removeItem(storageKey(id))
  } catch {
    // ignore storage errors
  }
}

