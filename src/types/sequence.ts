export enum SequenceMode {
    Focused = 'Focused',
    Multi = 'Multi'
}

export enum SequenceStatus {
    Setup = 'Setup',
    Draft = 'Draft',
    Active = 'Active',
    Paused = 'Paused',
    Completed = 'Completed',
    Failed = 'Failed',
    Archived = 'Archived'
}

export enum SequenceStepType {
    Email = 'Email',
    LinkedInMessage = 'LinkedInMessage',
    LinkedInConnectionRequest = 'LinkedInConnectionRequest',
    LinkedInInteraction = 'LinkedInInteraction'
}

export enum SequenceProspectStatus {
    Pending = 'Pending',
    Active = 'Active',
    Completed = 'Completed',
    Failed = 'Failed',
    Archived = 'Archived'
}

export interface SequenceSettingsDto {
    enrichCompany?: boolean;
    enrichContact?: boolean;
    researchSimilarities?: boolean;
    maxActiveProspectsPerDay?: number;
}

export interface SequenceViewDto {
    id: string;
    title: string;
    description?: string;
    mode: SequenceMode;
    status: SequenceStatus;
    settings: SequenceSettingsDto;
    prospectCount: number;
    currentBuilderStep: number;
    createdUtc: string;
    updatedUtc?: string;
}

export interface SequenceStepViewDto {
    id: string;
    orderIndex: number;
    stepType: SequenceStepType;
    delayInDays: number;
    timeOfDayToRun?: string;
    generatedSubject?: string;
    generatedBody?: string;
    generationType?: 'WebSearch' | 'UseCollectedData';
}

export interface SequenceProspectViewDto {
    id: string;
    prospectId: string;
    prospectName: string;
    contactPersonId: string;
    contactPersonName: string;
    status: SequenceProspectStatus;
    currentStepIndex: number;
    nextStepScheduledAt?: string;
    lastStepExecutedAt?: string;
    failureReason?: string;
}

export interface SequenceDetailsDto {
    id: string;
    title: string;
    description?: string;
    mode: SequenceMode;
    status: SequenceStatus;
    settings: SequenceSettingsDto;
    steps: SequenceStepViewDto[];
    prospects: SequenceProspectViewDto[];
    currentBuilderStep: number;
    createdUtc: string;
    updatedUtc?: string;
}

// Request DTOs
export interface CreateSequenceRequest {
    title: string;
    description?: string;
    mode: SequenceMode;
}

export interface UpdateSequenceRequest {
    title: string;
    description?: string;
    /** When omitted, server keeps existing sequence settings. */
    settings?: SequenceSettingsDto;
}

export interface AddSequenceStepRequest {
    stepType: SequenceStepType;
    delayInDays: number;
    timeOfDayToRun?: string;
    generationType?: 'WebSearch' | 'UseCollectedData';
}

export interface UpdateSequenceStepRequest {
    stepType: SequenceStepType;
    delayInDays: number;
    timeOfDayToRun?: string;
    generationType?: 'WebSearch' | 'UseCollectedData';
}

export interface UpdateSequenceStepContentRequest {
    generatedSubject?: string;
    generatedBody?: string;
}

export interface ReorderSequenceStepsRequest {
    stepIdsInOrder: string[];
}

export interface EnrollProspectRequest {
    prospectId: string;
    contactPersonId: string;
}

export interface SaveBuilderProgressRequest {
    currentBuilderStep: number;
}
