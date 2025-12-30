import { ref, computed, type Ref } from 'vue'
import type { Prospect } from '@/types/prospect'

/**
 * Composable for managing prospect selection state in batch operations
 * Provides selection toggle, select all/none, and computed selected prospects
 */
export function useProspectSelection(prospects: Ref<Prospect[]>) {
  const selectedIds = ref<Set<string>>(new Set())

  /**
   * Check if a prospect is selected
   */
  const isSelected = (id: string): boolean => {
    return selectedIds.value.has(id)
  }

  /**
   * Toggle selection for a single prospect
   */
  const toggleSelection = (id: string): void => {
    if (isSelected(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
    // Trigger reactivity
    selectedIds.value = new Set(selectedIds.value)
  }

  /**
   * Select all visible prospects
   */
  const selectAll = (): void => {
    selectedIds.value = new Set(prospects.value.map(p => p.id))
  }

  /**
   * Clear all selections
   */
  const clearSelection = (): void => {
    selectedIds.value.clear()
    selectedIds.value = new Set() // Trigger reactivity
  }

  /**
   * Number of selected prospects
   */
  const selectedCount = computed(() => selectedIds.value.size)

  /**
   * Array of selected prospect objects
   */
  const selectedProspects = computed(() => 
    prospects.value.filter(p => isSelected(p.id))
  )

  /**
   * Check if all prospects are selected
   */
  const allSelected = computed(() => 
    prospects.value.length > 0 && selectedIds.value.size === prospects.value.length
  )

  /**
   * Check if some (but not all) prospects are selected
   */
  const someSelected = computed(() => 
    selectedIds.value.size > 0 && selectedIds.value.size < prospects.value.length
  )

  return {
    selectedIds,
    selectedCount,
    selectedProspects,
    allSelected,
    someSelected,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection
  }
}
