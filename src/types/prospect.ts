// ProspectStatus as const values instead of enum
export const ProspectStatus = {
  New: 0,
  Researched: 1,
  Emailed: 2,
  Responded: 3,
  Archived: 4
} as const;

export type ProspectStatus = typeof ProspectStatus[keyof typeof ProspectStatus];

export interface Prospect {
  id: string;
  companyName: string;
  domain?: string;
  contactName?: string;
  contactEmail?: string;
  linkedinUrl?: string;
  notes?: string;
  status: ProspectStatus;
  createdUtc: string;
  updatedUtc?: string;
  mailTitle?: string | null;
  mailBodyPlain?: string | null;
  mailBodyHTML?: string | null;
}

export interface CreateProspectRequest {
  companyName: string;
  domain?: string;
  contactName?: string;
  contactEmail?: string;
  linkedinUrl?: string;
  notes?: string;
}

export interface UpdateProspectRequest {
  companyName?: string;
  domain?: string;
  contactName?: string;
  contactEmail?: string;
  linkedinUrl?: string;
  notes?: string;
  status?: ProspectStatus;
  mailTitle?: string;
  mailBodyPlain?: string;
  mailBodyHTML?: string;
}

export interface EmailDraft {
  mailTitle?: string;
  mailBodyPlain?: string;
  mailBodyHTML?: string;
}

// Chat types
export interface ChatRequest {
  userInput: string;
  useWebSearch?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface ChatResponse {
  aiMessage: string;
  improvedMail: boolean;
  mailTitle?: string | null;
  mailBodyPlain?: string | null;
  mailBodyHTML?: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  improvedMail?: boolean;
  mailData?: {
    mailTitle?: string;
    mailBodyPlain?: string;
    mailBodyHTML?: string;
  };
}

export const statusLabels: Record<ProspectStatus, string> = {
  [ProspectStatus.New]: 'Ny',
  [ProspectStatus.Researched]: 'Undersökt',
  [ProspectStatus.Emailed]: 'E-post skickad',
  [ProspectStatus.Responded]: 'Svarat',
  [ProspectStatus.Archived]: 'Arkiverad'
};

// Status colors are now handled by CSS classes instead of inline Tailwind
// Use getStatusClass() function in components to get the appropriate CSS class
export const statusColors: Record<ProspectStatus, string> = {
  [ProspectStatus.New]: 'status-new',
  [ProspectStatus.Researched]: 'status-researched',
  [ProspectStatus.Emailed]: 'status-emailed',
  [ProspectStatus.Responded]: 'status-responded',
  [ProspectStatus.Archived]: 'status-archived'
};