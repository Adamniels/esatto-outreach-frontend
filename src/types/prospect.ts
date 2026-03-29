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

// CrmProvider from backend enum
export enum CrmProvider {
  None = 0,
  Capsule = 1
}

// Nested types for CRM data
export interface WebsiteDto {
  url?: string | null;
  service?: string | null;
  type?: string | null;
}

export interface Tag {
  id: number;
  name: string;
  dataTag: boolean;
}

export interface CustomField {
  id: number;
  fieldName?: string | null;
  fieldDefinitionId?: number | null;
  value?: string | null;
  tagId?: number | null;
}

export interface Prospect {
  id: string;
  name: string;

  // CRM Identity
  crmSource: CrmProvider;
  externalCrmId?: string | null;

  isPending: boolean;
  about?: string | null;
  websites: WebsiteDto[];
  tags: Tag[];
  customFields: CustomField[];
  pictureURL?: string | null;

  crmCreatedAt?: string | null;
  crmUpdatedAt?: string | null;
  lastContactedAt?: string | null;

  notes?: string | null;
  status: ProspectStatus;
  createdUtc: string;
  updatedUtc?: string | null;
  mailTitle?: string | null;
  mailBodyPlain?: string | null;
  mailBodyHTML?: string | null;
  linkedInMessage?: string | null;
  ownerId?: string | null;
  entityIntelligence?: EntityIntelligenceDto | null;
  contactPersons?: ContactPersonDto[];

  // Helpers (frontend only)
  isFromCrm?: boolean;
}

export interface CreateProspectRequest {
  name: string;
  websites?: string[];
  notes?: string | null;
}

export interface UpdateProspectRequest {
  name?: string;
  websites?: string[];
  notes?: string | null;
  status?: ProspectStatus;
  mailTitle?: string | null;
  mailBodyPlain?: string | null;
  mailBodyHTML?: string | null;
  linkedInMessage?: string | null;
}

export interface PendingProspectDto {
  id: string;
  name: string;
  externalCrmId: string;
  crmSource: CrmProvider;
  about?: string | null;
  pictureURL?: string | null;
  websites: WebsiteDto[];
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
// New Structured Enrichment Types
export interface CompanySnapshotDto {
  whatTheyDo: string;
  targetCustomer: string;
  primaryValueProposition: string;
}

export interface EvidenceSourceDto {
  title: string;
  url: string;
  extractionDate: string; // DateTime
}

export interface ConfirmedChallengeDto {
  challengeDescription: string;
  evidenceSnippet: string;
  sourceUrl: string;
}

export interface InferredChallengeDto {
  challengeDescription: string;
  reasoning: string;
}

export interface BusinessChallengesDto {
  confirmed: ConfirmedChallengeDto[];
  inferred: InferredChallengeDto[];
}

export interface SolutionRelevantProfileDto {
  businessModel: string;
  currentTechStack: string[];
  competitors: string[];
  strategicPriorities: string[];
  hiringTrends: string[];
}

export interface CompanyOutreachHookDto {
  hookDescription: string;
  whyItMatters: string;
  source: string;
  confidenceLevel: string;
  date?: string;
}

export interface CompanyEnrichmentResultDto {
  snapshot: CompanySnapshotDto;
  evidenceLog: EvidenceSourceDto[];
  challenges: BusinessChallengesDto;
  profile: SolutionRelevantProfileDto;
  outreachHooks: CompanyOutreachHookDto[];
  methodologyUsed?: string[];
  openQuestions?: string[];
}

export interface EntityIntelligenceDto {
  id: string;
  prospectId: string;
  companyHooks: string[];
  personalHooks: string[];
  summarizedContext: string;
  enrichmentVersion?: string | null;
  // stored as JSONB in backend, explicitly serialized
  enrichedData?: CompanyEnrichmentResultDto | null;
  // Legacy fields (optional/deprecated)
  sourcesJson?: string | null;
  richData?: any | null; // Kept for backward compat if needed during transition
  researchedAt: string;
  createdUtc: string;
  updatedUtc?: string | null;
}

export interface ParsedEntityIntelligence {
  companyHooks: string[];
  personalHooks: string[];
  summarizedContext: string;
  researchedAt: Date;
  enrichedData?: CompanyEnrichmentResultDto | null;
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
  isActive: boolean;
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


