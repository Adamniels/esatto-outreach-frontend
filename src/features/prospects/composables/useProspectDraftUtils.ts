import type { EmailDraft, Prospect } from '@/types/prospect'

function pickString(source: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return undefined
}

export function extractEmailDraft(payload: unknown): EmailDraft | null {
  if (!payload) return null

  if (typeof payload === 'string') {
    const plain = payload.trim()
    return plain ? { mailBodyPlain: plain } : null
  }

  if (typeof payload === 'object') {
    const data = payload as Record<string, unknown>

    let mailTitle = pickString(data, ['mailTitle', 'MailTitle'])
    let mailBodyPlain = pickString(data, ['mailBodyPlain', 'MailBodyPlain'])
    let mailBodyHTML = pickString(data, ['mailBodyHTML', 'MailBodyHTML'])

    if (!mailTitle) {
      mailTitle = pickString(data, ['subject', 'title', 'mail_title'])
    }

    if (!mailBodyPlain) {
      mailBodyPlain = pickString(data, ['draft', 'email', 'body', 'text', 'content', 'MailBodyPlain', 'mail_body_plain'])
    }

    if (!mailBodyHTML) {
      mailBodyHTML = pickString(data, ['html', 'mailBodyHTML', 'MailBodyHTML', 'mail_body_html'])
    }

    if (mailTitle || mailBodyPlain || mailBodyHTML) {
      return { mailTitle, mailBodyPlain, mailBodyHTML }
    }
  }

  return null
}

export function htmlToPlainText(html: string) {
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function draftHasContent(draft: EmailDraft | null | undefined): draft is EmailDraft {
  if (!draft) return false
  return Boolean(
    (draft.mailTitle && draft.mailTitle.trim()) ||
    (draft.mailBodyPlain && draft.mailBodyPlain.trim()) ||
    (draft.mailBodyHTML && draft.mailBodyHTML.trim())
  )
}

export function draftFromProspect(p: Prospect | null): EmailDraft | null {
  if (!p) return null
  const { mailTitle, mailBodyPlain, mailBodyHTML } = p
  if (!mailTitle && !mailBodyPlain && !mailBodyHTML) return null
  return {
    mailTitle: mailTitle?.trim() || undefined,
    mailBodyPlain: mailBodyPlain?.trim() || undefined,
    mailBodyHTML: mailBodyHTML?.trim() || undefined
  }
}

