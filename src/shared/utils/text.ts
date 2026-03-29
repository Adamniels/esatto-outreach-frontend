export function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

export function joinWebsiteLines(arr: Array<{ url?: string | null }>): string {
  return arr
    .map((item) => item.url || '')
    .filter(Boolean)
    .join('\n')
}

