// ProspectStatus as const values instead of enum
export const ProspectStatus = {
  New: 0,
  Researched: 1,
  Drafted: 2,
  Emailed: 3,
  Responded: 4,
  Archived: 5
} as const;

export type ProspectStatus = typeof ProspectStatus[keyof typeof ProspectStatus];

// Nested types for Capsule CRM data
export interface WebsiteDto {
  url?: string | null;
  service?: string | null;
  type?: string | null;
}

export interface EmailAddressDto {
  address?: string | null;
  type?: string | null;
}

export interface PhoneNumberDto {
  number?: string | null;
  type?: string | null;
}

export interface AddressDto {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  type?: string | null;
}

export interface CapsuleTag {
  id: number;
  name: string;
  dataTag: boolean;
}

export interface CapsuleCustomField {
  id: number;
  fieldName?: string | null;
  fieldDefinitionId?: number | null;
  value?: string | null;
  tagId?: number | null;
}

export interface Prospect {
  id: string;
  name: string;
  isFromCapsule: boolean;
  capsuleId?: number | null;
  isPending: boolean;
  about?: string | null;
  websites: WebsiteDto[];
  emailAddresses: EmailAddressDto[];
  phoneNumbers: PhoneNumberDto[];
  addresses: AddressDto[];
  tags: CapsuleTag[];
  customFields: CapsuleCustomField[];
  pictureURL?: string | null;
  capsuleCreatedAt?: string | null;
  capsuleUpdatedAt?: string | null;
  lastContactedAt?: string | null;
  notes?: string | null;
  status: ProspectStatus;
  createdUtc: string;
  updatedUtc?: string | null;
  mailTitle?: string | null;
  mailBodyPlain?: string | null;
  mailBodyHTML?: string | null;
  ownerId?: string | null;
  softCompanyData?: SoftCompanyDataDto | null;
}

export interface CreateProspectRequest {
  name: string;
  websites?: string[];
  emailAddresses?: string[];
  phoneNumbers?: string[];
  notes?: string | null;
}

export interface UpdateProspectRequest {
  name?: string;
  websites?: string[];
  emailAddresses?: string[];
  phoneNumbers?: string[];
  notes?: string | null;
  status?: ProspectStatus;
  mailTitle?: string | null;
  mailBodyPlain?: string | null;
  mailBodyHTML?: string | null;
}

export interface PendingProspectDto {
  id: string;
  name: string;
  capsuleId: number;
  about?: string | null;
  pictureURL?: string | null;
  websites: WebsiteDto[];
  emailAddresses: EmailAddressDto[];
  createdUtc: string;
}

export interface EmailDraft {
  mailTitle?: string;
  mailBodyPlain?: string;
  mailBodyHTML?: string;
}

// Chat types
export interface ChatRequest {
  userInput: string;
  mailTitle?: string;
  mailBodyPlain?: string;
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
  [ProspectStatus.Drafted]: 'Utkast',
  [ProspectStatus.Emailed]: 'Mejlad',
  [ProspectStatus.Responded]: 'Svarat',
  [ProspectStatus.Archived]: 'Arkiverad'
};

// Soft Company Data Types
export interface PersonalizationHook {
  text: string;
  source: string;
  date: string;
  relevance: 'high' | 'medium' | 'low';
}

export interface CompanyEvent {
  title: string;
  date: string;
  type: string;
  url: string;
}

export interface NewsItem {
  headline: string;
  date: string;
  source: string;
  url: string;
}

export interface SocialActivity {
  platform: string;
  text: string;
  date: string;
  url: string;
}

export interface SoftCompanyDataDto {
  id: string;
  prospectId: string;
  hooksJson?: string | null;
  recentEventsJson?: string | null;
  newsItemsJson?: string | null;
  socialActivityJson?: string | null;
  sourcesJson?: string | null;
  researchedAt: string;
  createdUtc: string;
  updatedUtc?: string | null;
}

export interface ParsedSoftCompanyData {
  hooks: PersonalizationHook[];
  events: CompanyEvent[];
  news: NewsItem[];
  socialActivity: SocialActivity[];
  sources: string[];
  researchedAt: Date;
}
