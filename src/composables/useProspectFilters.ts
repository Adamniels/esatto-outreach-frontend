import { ref, computed, type Ref } from 'vue'
import type { Prospect } from '@/types/prospect'
import type { FilterState, SortState, SortField, SortDirection } from '@/types/filters'
import { DEFAULT_FILTER_STATE, DEFAULT_SORT_STATE } from '@/types/filters'

export function useProspectFilters(prospects: Ref<Prospect[]>) {
  // State
  const filterState = ref<FilterState>({ ...DEFAULT_FILTER_STATE })
  const sortState = ref<SortState>({ ...DEFAULT_SORT_STATE })

  // Computed - Filtered prospects
  const filteredProspects = computed(() => {
    let result = [...prospects.value]

    // Filter by search query
    if (filterState.value.search.trim()) {
      const query = filterState.value.search.toLowerCase().trim()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.emailAddresses.some(e => e.address?.toLowerCase().includes(query)) ||
        p.websites.some(w => w.url?.toLowerCase().includes(query))
      )
    }

    // Filter by status
    if (filterState.value.status !== 'all') {
      result = result.filter((p) => p.status === filterState.value.status)
    }

    // Filter by hasEmail
    if (filterState.value.hasEmail !== 'all') {
      result = result.filter((p) =>
        filterState.value.hasEmail ? p.emailAddresses.length > 0 : p.emailAddresses.length === 0
      )
    }

    // Filter by hasContact
    if (filterState.value.hasContact !== 'all') {
      result = result.filter((p) =>
        filterState.value.hasContact ? p.emailAddresses.length > 0 : p.emailAddresses.length === 0
      )
    }

    return result
  })

  // Computed - Sorted and filtered prospects
  const sortedProspects = computed(() => {
    const result = [...filteredProspects.value]

    const { field, direction } = sortState.value
    const sortMultiplier = direction === 'asc' ? 1 : -1

    result.sort((a, b) => {
      let aVal: any = a[field]
      let bVal: any = b[field]

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = ''
      if (bVal === null || bVal === undefined) bVal = ''

      // String comparison (case-insensitive)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.toLowerCase().localeCompare(bVal.toLowerCase(), 'sv-SE') * sortMultiplier
      }

      // Number comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * sortMultiplier
      }

      // Date comparison
      if (field === 'createdUtc') {
        const dateA = new Date(aVal).getTime()
        const dateB = new Date(bVal).getTime()
        return (dateA - dateB) * sortMultiplier
      }

      // Fallback
      return 0
    })

    return result
  })

  // Computed - Filter stats
  const filterStats = computed(() => {
    const total = prospects.value.length
    const filtered = filteredProspects.value.length
    const isFiltered = filterState.value.search ||
      filterState.value.status !== 'all' ||
      filterState.value.hasEmail !== 'all' ||
      filterState.value.hasContact !== 'all'

    return {
      total,
      filtered,
      isFiltered,
      showing: sortedProspects.value.length
    }
  })

  // Actions
  const setSearch = (search: string) => {
    filterState.value.search = search
  }

  const setStatusFilter = (status: FilterState['status']) => {
    filterState.value.status = status
  }

  const setHasEmailFilter = (hasEmail: FilterState['hasEmail']) => {
    filterState.value.hasEmail = hasEmail
  }

  const setHasContactFilter = (hasContact: FilterState['hasContact']) => {
    filterState.value.hasContact = hasContact
  }

  const setSort = (field: SortField, direction: SortDirection) => {
    sortState.value.field = field
    sortState.value.direction = direction
  }

  const setSortByValue = (value: string) => {
    const [field, direction] = value.split('-') as [SortField, SortDirection]
    setSort(field, direction)
  }

  const clearFilters = () => {
    filterState.value = { ...DEFAULT_FILTER_STATE }
  }

  const resetSort = () => {
    sortState.value = { ...DEFAULT_SORT_STATE }
  }

  const clearAll = () => {
    clearFilters()
    resetSort()
  }

  return {
    // State
    filterState,
    sortState,

    // Computed
    filteredProspects,
    sortedProspects,
    filterStats,

    // Actions
    setSearch,
    setStatusFilter,
    setHasEmailFilter,
    setHasContactFilter,
    setSort,
    setSortByValue,
    clearFilters,
    resetSort,
    clearAll
  }
}
