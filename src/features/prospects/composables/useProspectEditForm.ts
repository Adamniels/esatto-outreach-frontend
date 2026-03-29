import { computed, ref, type Ref } from 'vue'
import type { Prospect, ProspectStatus } from '@/types/prospect'
import { joinWebsiteLines, splitLines } from '@/shared/utils/text'
import { confirmDialog } from '@/shared/utils/dialog'

export interface ProspectEditFormData {
  name: string
  websitesText: string
  status: ProspectStatus
  notes: string
}

export function useProspectEditForm(prospect: Ref<Prospect | null>) {
  const isEditing = ref(false)
  const isSaving = ref(false)
  const formData = ref<ProspectEditFormData>({
    name: '',
    websitesText: '',
    status: 0 as ProspectStatus,
    notes: ''
  })

  const isFormValid = computed(() => formData.value.name.trim().length > 0)

  function startEditing() {
    if (!prospect.value) return

    formData.value = {
      name: prospect.value.name,
      websitesText: joinWebsiteLines(prospect.value.websites),
      status: prospect.value.status,
      notes: prospect.value.notes || ''
    }

    isEditing.value = true
  }

  function hasUnsavedEditChanges(): boolean {
    if (!prospect.value) return false

    return (
      formData.value.name !== prospect.value.name ||
      formData.value.websitesText !== joinWebsiteLines(prospect.value.websites) ||
      formData.value.status !== prospect.value.status ||
      formData.value.notes !== (prospect.value.notes || '')
    )
  }

  function cancelEditing(): boolean {
    if (hasUnsavedEditChanges()) {
      if (!confirmDialog('You have unsaved changes. Do you really want to cancel?')) {
        return false
      }
    }

    isEditing.value = false
    return true
  }

  function buildUpdatePayload() {
    return {
      name: formData.value.name.trim(),
      websites: splitLines(formData.value.websitesText),
      status: formData.value.status,
      notes: formData.value.notes.trim() || undefined
    }
  }

  return {
    isEditing,
    isSaving,
    formData,
    isFormValid,
    startEditing,
    hasUnsavedEditChanges,
    cancelEditing,
    buildUpdatePayload
  }
}

