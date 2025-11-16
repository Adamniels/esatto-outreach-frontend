import api from './api';
import type { EmailPrompt, CreateEmailPromptRequest, UpdateEmailPromptRequest } from '@/types/emailPrompt';

export const emailPromptsAPI = {
  // Hämta aktiv prompt
  getActive: async (): Promise<EmailPrompt | null> => {
    try {
      const response = await api.get('/settings/email-prompt');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Lista alla prompts
  getAll: async (): Promise<EmailPrompt[]> => {
    const response = await api.get('/settings/email-prompts');
    return response.data;
  },

  // Skapa ny prompt
  create: async (data: CreateEmailPromptRequest): Promise<EmailPrompt> => {
    const response = await api.post('/settings/email-prompts', data);
    return response.data;
  },

  // Uppdatera prompt
  update: async (id: string, data: UpdateEmailPromptRequest): Promise<EmailPrompt> => {
    const response = await api.put(`/settings/email-prompts/${id}`, data);
    return response.data;
  },

  // Aktivera specifik prompt
  activate: async (id: string): Promise<EmailPrompt> => {
    const response = await api.post(`/settings/email-prompts/${id}/activate`);
    return response.data;
  },

  // Ta bort prompt
  delete: async (id: string): Promise<void> => {
    await api.delete(`/settings/email-prompts/${id}`);
  }
};
