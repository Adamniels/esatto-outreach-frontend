import api from './api';
import type { OutreachPrompt, CreateOutreachPromptRequest, UpdateOutreachPromptRequest, PromptType } from '@/types/outreachPrompt';

export const outreachPromptsApi = {
  // Hämta aktiv prompt per typ
  getActive: async (type: PromptType): Promise<OutreachPrompt | null> => {
    try {
      const response = await api.get(`/settings/outreach-prompts/active?type=${type}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Lista alla prompts
  getAll: async (): Promise<OutreachPrompt[]> => {
    const response = await api.get('/settings/outreach-prompts');
    return response.data;
  },

  // Skapa ny prompt
  create: async (data: CreateOutreachPromptRequest): Promise<OutreachPrompt> => {
    const response = await api.post('/settings/outreach-prompts', data);
    return response.data;
  },

  // Uppdatera prompt
  update: async (id: string, data: UpdateOutreachPromptRequest): Promise<OutreachPrompt> => {
    const response = await api.put(`/settings/outreach-prompts/${id}`, data);
    return response.data;
  },

  // Aktivera specifik prompt
  activate: async (id: string): Promise<OutreachPrompt> => {
    const response = await api.post(`/settings/outreach-prompts/${id}/activate`);
    return response.data;
  },

  // Ta bort prompt
  delete: async (id: string): Promise<void> => {
    await api.delete(`/settings/outreach-prompts/${id}`);
  }
};

// Backward-compatible alias during migration
export const outreachPromptsAPI = outreachPromptsApi;
