import type { ProspectStatus } from './prospect'

export type SortField = 'name' | 'status' | 'createdUtc'
export type SortDirection = 'asc' | 'desc'

export interface SortOption {
  value: string
  label: string
  field: SortField
  direction: SortDirection
}

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface FilterState {
  status: ProspectStatus | 'all'
  hasEmail: boolean | 'all'
  hasContact: boolean | 'all'
  search: string
}

export interface SortState {
  field: SortField
  direction: SortDirection
}

// Predefined sort options
export const SORT_OPTIONS: SortOption[] = [
  { value: 'name-asc', label: 'Företagsnamn (A-Ö)', field: 'name', direction: 'asc' },
  { value: 'name-desc', label: 'Företagsnamn (Ö-A)', field: 'name', direction: 'desc' },
  { value: 'status-asc', label: 'Status (Stigande)', field: 'status', direction: 'asc' },
  { value: 'status-desc', label: 'Status (Fallande)', field: 'status', direction: 'desc' },
  { value: 'createdUtc-desc', label: 'Senast skapad', field: 'createdUtc', direction: 'desc' },
  { value: 'createdUtc-asc', label: 'Äldst skapad', field: 'createdUtc', direction: 'asc' },
]

// Default filter state
export const DEFAULT_FILTER_STATE: FilterState = {
  status: 'all',
  hasEmail: 'all',
  hasContact: 'all',
  search: ''
}

// Default sort state
export const DEFAULT_SORT_STATE: SortState = {
  field: 'createdUtc',
  direction: 'desc'
}
