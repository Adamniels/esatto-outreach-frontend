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

export const statusLabels: Record<ProspectStatus, string> = {
  [ProspectStatus.New]: 'Ny',
  [ProspectStatus.Researched]: 'Undersökt',
  [ProspectStatus.Emailed]: 'E-post skickad',
  [ProspectStatus.Responded]: 'Svarat',
  [ProspectStatus.Archived]: 'Arkiverad'
};

export const statusColors: Record<ProspectStatus, string> = {
  [ProspectStatus.New]: 'bg-blue-100 text-blue-800',
  [ProspectStatus.Researched]: 'bg-yellow-100 text-yellow-800',
  [ProspectStatus.Emailed]: 'bg-purple-100 text-purple-800',
  [ProspectStatus.Responded]: 'bg-green-100 text-green-800',
  [ProspectStatus.Archived]: 'bg-gray-100 text-gray-800'
};