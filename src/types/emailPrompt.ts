export interface EmailPrompt {
  id: string;
  instructions: string;
  isActive: boolean;
  createdUtc: string;
  updatedUtc: string;
}

export interface CreateEmailPromptRequest {
  instructions: string;
  isActive?: boolean;
}

export interface UpdateEmailPromptRequest {
  instructions: string;
}
