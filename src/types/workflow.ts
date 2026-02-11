export enum WorkflowStatus {
    Draft = "Draft",
    Active = "Active",
    Completed = "Completed",
    Cancelled = "Cancelled"
}

export enum WorkflowStepStatus {
    Pending = "Pending",
    Executing = "Executing",
    Succeeded = "Succeeded",
    Failed = "Failed",
    Skipped = "Skipped"
}

export enum WorkflowStepType {
    Email = "Email",
    LinkedInMessage = "LinkedInMessage",
    LinkedInConnectionRequest = "LinkedInConnectionRequest",
    LinkedInInteract = "LinkedInInteract"
}

export enum ContentGenerationStrategy {
    WebSearch = "WebSearch",
    UseCollectedData = "UseCollectedData",
    EsattoRag = "EsattoRag"
}

export interface WorkflowTemplateStep {
    type: WorkflowStepType;
    dayOffset: number;
    timeOfDay: string; // "HH:mm"
    orderIndex?: number;
    generationStrategy?: ContentGenerationStrategy;
}

export interface WorkflowTemplate {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    steps: WorkflowTemplateStep[];
}

export interface WorkflowStep {
    id: string;
    workflowInstanceId: string;
    type: WorkflowStepType;
    orderIndex: number;
    dayOffset: number;
    timeOfDay: string; // "HH:mm"
    generationStrategy?: ContentGenerationStrategy;
    runAt?: string;
    status: WorkflowStepStatus;

    // Content
    emailSubject?: string;
    bodyContent?: string;

    failureReason?: string;
    retryCount: number;
}

export interface WorkflowInstance {
    id: string;
    prospectId: string;
    status: WorkflowStatus;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    steps: WorkflowStep[];
}

export interface CreateWorkflowTemplateRequest {
    name: string;
    description?: string;
    steps: WorkflowTemplateStep[];
}
