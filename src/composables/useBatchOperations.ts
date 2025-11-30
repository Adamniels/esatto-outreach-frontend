import { ref } from 'vue'
import { prospectsAPI, type BatchOperationResult, type EmailDraft } from '@/services/prospects'
import type { Prospect, SoftCompanyDataDto } from '@/types/prospect'

export interface BatchProgress {
  total: number
  completed: number
  failed: number
  isRunning: boolean
}

export interface BatchCompleteNotification {
  show: boolean
  type: 'success' | 'partial'
  title: string
  message: string
}

// Global state that persists across component instances
const globalCompleteNotification = ref<BatchCompleteNotification>({
  show: false,
  type: 'success',
  title: '',
  message: ''
})

/**
 * Composable for managing batch operations on prospects
 * Handles soft data collection and email generation for multiple prospects
 */
export function useBatchOperations() {
  const isBatchProcessing = ref(false)
  const batchProgress = ref<BatchProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    isRunning: false
  })
  const lastBatchResults = ref<BatchOperationResult<any> | null>(null)

  /**
   * Reset progress state
   */
  const resetProgress = () => {
    batchProgress.value = {
      total: 0,
      completed: 0,
      failed: 0,
      isRunning: false
    }
    lastBatchResults.value = null
  }

  /**
   * Show completion notification
   */
  const showCompleteNotification = (succeeded: number, failed: number) => {
    if (failed === 0) {
      globalCompleteNotification.value = {
        show: true,
        type: 'success',
        title: 'Batch-process klar!',
        message: `${succeeded} ${succeeded === 1 ? 'operation' : 'operationer'} slutfördes framgångsrikt.`
      }
    } else if (succeeded === 0) {
      globalCompleteNotification.value = {
        show: true,
        type: 'partial',
        title: 'Batch-process misslyckades',
        message: `${failed} ${failed === 1 ? 'operation' : 'operationer'} misslyckades.`
      }
    } else {
      globalCompleteNotification.value = {
        show: true,
        type: 'partial',
        title: 'Batch-process delvis klar',
        message: `${succeeded} lyckades, ${failed} misslyckades.`
      }
    }

    // Auto-hide after 10 seconds
    setTimeout(() => {
      globalCompleteNotification.value.show = false
    }, 10000)
  }

  /**
   * Hide completion notification
   */
  const hideCompleteNotification = () => {
    globalCompleteNotification.value.show = false
  }

  /**
   * Run batch soft data generation for selected prospects
   */
  const runBatchSoftData = async (
    prospectIds: string[],
    provider: 'OpenAI' | 'Claude' | 'Hybrid' = 'Claude',
    onSuccess?: (results: BatchOperationResult<SoftCompanyDataDto>) => void
  ): Promise<BatchOperationResult<SoftCompanyDataDto> | null> => {
    if (prospectIds.length === 0) {
      alert('Inga prospects valda')
      return null
    }

    isBatchProcessing.value = true
    batchProgress.value = {
      total: prospectIds.length,
      completed: 0,
      failed: 0,
      isRunning: true
    }

    try {
      const results = await prospectsAPI.generateSoftDataBatch(prospectIds, provider)
      
      batchProgress.value.completed = results.successCount
      batchProgress.value.failed = results.failureCount
      batchProgress.value.isRunning = false
      lastBatchResults.value = results

      // Show completion notification
      showCompleteNotification(results.successCount, results.failureCount)

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(results)
      }

      return results
    } catch (error: any) {
      console.error('Batch soft data generation failed:', error)
      batchProgress.value.isRunning = false
      alert(`Batch-operation misslyckades: ${error.response?.data?.error || error.message}`)
      return null
    } finally {
      isBatchProcessing.value = false
    }
  }

  /**
   * Run batch email generation for selected prospects
   */
  const runBatchEmailGeneration = async (
    prospectIds: string[],
    type: 'WebSearch' | 'UseCollectedData' | null = null,
    autoGenerateSoftData: boolean = true,
    softDataProvider: string = 'Claude',
    onSuccess?: (results: BatchOperationResult<EmailDraft>) => void
  ): Promise<BatchOperationResult<EmailDraft> | null> => {
    if (prospectIds.length === 0) {
      alert('Inga prospects valda')
      return null
    }

    isBatchProcessing.value = true
    batchProgress.value = {
      total: prospectIds.length,
      completed: 0,
      failed: 0,
      isRunning: true
    }

    try {
      const results = await prospectsAPI.generateEmailBatch(
        prospectIds,
        type || undefined,
        autoGenerateSoftData,
        softDataProvider
      )
      
      batchProgress.value.completed = results.successCount
      batchProgress.value.failed = results.failureCount
      batchProgress.value.isRunning = false
      lastBatchResults.value = results

      // Show completion notification
      showCompleteNotification(results.successCount, results.failureCount)

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(results)
      }

      return results
    } catch (error: any) {
      console.error('Batch email generation failed:', error)
      batchProgress.value.isRunning = false
      alert(`Batch-operation misslyckades: ${error.response?.data?.error || error.message}`)
      return null
    } finally {
      isBatchProcessing.value = false
    }
  }

  /**
   * Run complete flow: soft data + email generation
   */
  const runCompleteFlow = async (
    prospectIds: string[],
    softDataProvider: 'OpenAI' | 'Claude' | 'Hybrid' = 'Claude',
    emailType: 'WebSearch' | 'UseCollectedData' = 'UseCollectedData',
    onSoftDataComplete?: (results: BatchOperationResult<SoftCompanyDataDto>) => void,
    onEmailComplete?: (results: BatchOperationResult<EmailDraft>) => void
  ): Promise<boolean> => {
    if (prospectIds.length === 0) {
      alert('Inga prospects valda')
      return false
    }

    // Step 1: Generate soft data
    const softDataResults = await runBatchSoftData(prospectIds, softDataProvider, onSoftDataComplete)
    if (!softDataResults) {
      return false
    }

    // Step 2: Generate emails (will use the soft data just collected)
    const emailResults = await runBatchEmailGeneration(
      prospectIds,
      emailType,
      false, // Don't auto-generate since we just did it
      softDataProvider,
      onEmailComplete
    )

    return emailResults !== null
  }

  return {
    isBatchProcessing,
    batchProgress,
    lastBatchResults,
    completeNotification: globalCompleteNotification,
    resetProgress,
    hideCompleteNotification,
    runBatchSoftData,
    runBatchEmailGeneration,
    runCompleteFlow
  }
}
