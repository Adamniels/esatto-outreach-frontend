import type { ProspectStatus } from './prospect'

export type SortField = 'companyName' | 'contactName' | 'contactEmail' | 'status' | 'createdUtc'
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
  { value: 'companyName-asc', label: 'Företagsnamn (A-Ö)', field: 'companyName', direction: 'asc' },
  { value: 'companyName-desc', label: 'Företagsnamn (Ö-A)', field: 'companyName', direction: 'desc' },
  { value: 'status-asc', label: 'Status (Stigande)', field: 'status', direction: 'asc' },
  { value: 'status-desc', label: 'Status (Fallande)', field: 'status', direction: 'desc' },
  { value: 'contactName-asc', label: 'Kontakt (A-Ö)', field: 'contactName', direction: 'asc' },
  { value: 'contactName-desc', label: 'Kontakt (Ö-A)', field: 'contactName', direction: 'desc' },
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
