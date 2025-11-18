import api from './api';
import type { Prospect, CreateProspectRequest, UpdateProspectRequest, ChatRequest, ChatResponse, SoftCompanyDataDto } from '@/types/prospect';

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
  generateEmailDraft: async (id: string): Promise<unknown> => {
    const response = await api.post(`/prospects/${id}/email/draft`, {});
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
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/healthz');
    return response.data;
  }
};