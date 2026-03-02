export type PromptType = 'General' | 'Email' | 'LinkedIn';

export interface OutreachPrompt {
  id: string;
  instructions: string;
  type: PromptType;
  isActive: boolean;
  createdUtc: string;
  updatedUtc: string;
}

export interface CreateOutreachPromptRequest {
  instructions: string;
  type: PromptType;
  isActive?: boolean;
}

export interface UpdateOutreachPromptRequest {
  instructions: string;
}
