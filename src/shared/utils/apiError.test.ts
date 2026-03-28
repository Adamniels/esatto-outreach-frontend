import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from '@/shared/utils/apiError'

describe('getApiErrorMessage', () => {
  it('returns backend error when present', () => {
    const msg = getApiErrorMessage({ response: { data: { error: 'Oops' } } }, 'fallback')
    expect(msg).toBe('Oops')
  })

  it('returns fallback when no structured error exists', () => {
    const msg = getApiErrorMessage({}, 'fallback')
    expect(msg).toBe('fallback')
  })
})

