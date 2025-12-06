import api from './api';
import type { Prospect, CreateProspectRequest, UpdateProspectRequest, ChatRequest, ChatResponse, SoftCompanyDataDto, PendingProspectDto } from '@/types/prospect';

// Batch operation types
export interface BatchOperationResult<TData> {
  successes: SuccessResult<TData>[]
  failures: FailureResult[]
  totalCount: number
  successCount: number
  failureCount: number
}

export interface SuccessResult<TData> {
  prospectId: string
  data: TData
}

export interface FailureResult {
  prospectId: string
  errorMessage: string
}

export interface EmailDraft {
  title: string
  bodyPlain: string
  bodyHTML: string
}

export const prospectsAPI = {
  // Lista alla prospects
  getAll: async (): Promise<Prospect[]> => {
    const response = await api.get('/prospects');
    return response.data;
  },

  // Hämta en specifik prospect
  getById: async (id: string): Promise<Prospect> => {
    const response = await api.get(`/prospects/${id}`);
    return response.data;
  },

  // Skapa ny prospect
  create: async (data: CreateProspectRequest): Promise<Prospect> => {
    const response = await api.post('/prospects', data);
    return response.data;
  },

  // Uppdatera prospect
  update: async (id: string, data: UpdateProspectRequest): Promise<Prospect> => {
    const response = await api.put(`/prospects/${id}`, data);
    return response.data;
  },

  // Generera mejlutkast
  generateEmailDraft: async (id: string, type?: 'WebSearch' | 'UseCollectedData'): Promise<unknown> => {
    const url = type 
      ? `/prospects/${id}/email/draft?type=${type}`
      : `/prospects/${id}/email/draft`;
    const response = await api.post(url, {});
    return response.data;
  },

  // Skicka email via n8n
  sendEmail: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post(`/prospects/${id}/email/send`, {});
    return response.data;
  },

  // Ta bort prospect
  delete: async (id: string): Promise<void> => {
    await api.delete(`/prospects/${id}`);
  },

  // Chatta om prospect
  chat: async (id: string, data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post(`/prospects/${id}/chat`, data);
    return response.data;
  },

  // Återställ chat-konversation
  resetChat: async (id: string): Promise<void> => {
    await api.post(`/prospects/${id}/chat/reset`);
  },

  // Generera soft company data (research via AI providers)
  generateSoftCompanyData: async (id: string, provider?: 'OpenAI' | 'Claude' | 'Hybrid'): Promise<SoftCompanyDataDto> => {
    const url = provider 
      ? `/prospects/${id}/soft-data/generate?provider=${provider}`
      : `/prospects/${id}/soft-data/generate`;
    const response = await api.post(url);
    return response.data;
  },

  // ============ BATCH OPERATIONS ============

  // Batch: Generera soft data för flera prospects
  generateSoftDataBatch: async (
    prospectIds: string[],
    provider?: 'OpenAI' | 'Claude' | 'Hybrid'
  ): Promise<BatchOperationResult<SoftCompanyDataDto>> => {
    const response = await api.post('/prospects/batch/soft-data/generate', {
      prospectIds,
      provider
    });
    return response.data;
  },

  // Batch: Generera emails för flera prospects
  generateEmailBatch: async (
    prospectIds: string[],
    type?: 'WebSearch' | 'UseCollectedData',
    autoGenerateSoftData: boolean = true,
    softDataProvider: string = 'Claude'
  ): Promise<BatchOperationResult<EmailDraft>> => {
    const response = await api.post('/prospects/batch/email/generate', {
      prospectIds,
      type,
      autoGenerateSoftData,
      softDataProvider
    });
    return response.data;
  },

  // ============ CAPSULE CRM INTEGRATION ============

  // Get pending prospects from Capsule CRM
  getPending: async (): Promise<PendingProspectDto[]> => {
    const response = await api.get('/prospects/pending');
    return response.data;
  },

  // Claim a pending prospect
  claimPending: async (id: string): Promise<Prospect> => {
    const response = await api.post(`/prospects/${id}/claim`);
    return response.data;
  },

  // Reject a pending prospect
  rejectPending: async (id: string): Promise<void> => {
    await api.post(`/prospects/${id}/pending/reject`);
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/healthz');
    return response.data;
  }
};