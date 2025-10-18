import api from './api';
import type { Prospect, CreateProspectRequest, UpdateProspectRequest } from '@/types/prospect';

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
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/healthz');
    return response.data;
  }
};