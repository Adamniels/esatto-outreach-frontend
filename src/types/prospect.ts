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
  entityIntelligence?: EntityIntelligenceDto | null;
  contactPersons?: ContactPersonDto[];
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
  [ProspectStatus.New]: 'New',
  [ProspectStatus.Researched]: 'Researched',
  [ProspectStatus.Drafted]: 'Drafted',
  [ProspectStatus.Emailed]: 'Emailed',
  [ProspectStatus.Responded]: 'Responded',
  [ProspectStatus.Archived]: 'Archived'
};

// Entity Intelligence Types
export interface CaseStudyDto {
  client: string;
  challenge: string;
  solution: string;
  outcome: string;
}

export interface NewsEventDto {
  date: string;
  description: string;
  source: string;
}

export interface HiringSignalDto {
  role: string;
  date: string;
  source: string;
}

export interface EnrichedCompanyDataDto {
  summary: string;
  keyValueProps?: string[];
  techStack?: string[];
  caseStudies?: CaseStudyDto[];
  news?: NewsEventDto[];
  hiring?: HiringSignalDto[];
}

export interface EntityIntelligenceDto {
  id: string;
  prospectId: string;
  companyHooks: string[];
  personalHooks: string[];
  summarizedContext: string;
  sourcesJson?: string | null;
  richData?: EnrichedCompanyDataDto | null;
  researchedAt: string;
  createdUtc: string;
  updatedUtc?: string | null;
}

export interface ParsedEntityIntelligence {
  companyHooks: string[];
  personalHooks: string[];
  summarizedContext: string;
  researchedAt: Date;
  richData?: EnrichedCompanyDataDto | null;
}

export interface ContactPersonDto {
  id: string;
  prospectId: string;
  name: string;
  title?: string | null;
  email?: string | null;
  linkedInUrl?: string | null;
  personalHooks?: string[] | null;
  personalNews?: string[] | null;
  generalInfo?: string | null;
  researchedAt?: string | null;
}

export interface CreateContactPersonRequest {
  name: string;
  title?: string;
  email?: string;
  linkedInUrl?: string;
  personalHooks?: string[];
  personalNews?: string[];
  generalInfo?: string;
}
