interface ApiErrorPayload {
  error?: string
  detail?: string
  message?: string
}

interface ApiLikeError {
  response?: {
    data?: ApiErrorPayload
    status?: number
  }
  message?: string
}

export function getApiErrorMessage(
  err: unknown,
  fallback: string = 'An unexpected error occurred'
): string {
  const apiErr = err as ApiLikeError
  return (
    apiErr?.response?.data?.error ||
    apiErr?.response?.data?.detail ||
    apiErr?.response?.data?.message ||
    apiErr?.message ||
    fallback
  )
}

