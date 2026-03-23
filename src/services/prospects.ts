import api from './api';
import type { Prospect, CreateProspectRequest, UpdateProspectRequest, ChatRequest, ChatResponse, EntityIntelligenceDto, PendingProspectDto, CreateContactPersonRequest, ContactPersonDto } from '@/types/prospect';

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

  generateEmailDraft: async (id: string, type?: 'WebSearch' | 'UseCollectedData'): Promise<unknown> => {
    const url = type
      ? `/prospects/${id}/email/draft?type=${type}`
      : `/prospects/${id}/email/draft`;
    const response = await api.post(url, {});
    return response.data;
  },

  // Generera LinkedIn-utkast
  generateLinkedInDraft: async (id: string, type?: 'WebSearch' | 'UseCollectedData'): Promise<unknown> => {
    const url = type
      ? `/prospects/${id}/linkedin/draft?type=${type}`
      : `/prospects/${id}/linkedin/draft`;
    const response = await api.post(url, {});
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

  // Enrich Prospect (Entity Intelligence)
  enrichProspect: async (id: string): Promise<EntityIntelligenceDto> => {
    const url = `/prospects/${id}/soft-data/generate`;
    const response = await api.post(url);
    return response.data;
  },

  // Add manual contact person
  addContact: async (prospectId: string, data: CreateContactPersonRequest): Promise<ContactPersonDto> => {
    const response = await api.post(`/prospects/${prospectId}/contacts`, data);
    return response.data;
  },

  updateContact: async (prospectId: string, contactId: string, data: CreateContactPersonRequest): Promise<ContactPersonDto> => {
    const response = await api.put(`/prospects/${prospectId}/contacts/${contactId}`, data);
    return response.data;
  },

  deleteContact: async (prospectId: string, contactId: string): Promise<void> => {
    await api.delete(`/prospects/${prospectId}/contacts/${contactId}`);
  },

  enrichContact: async (prospectId: string, contactId: string): Promise<ContactPersonDto> => {
    const response = await api.post(`/prospects/${prospectId}/contacts/${contactId}/enrich`);
    return response.data;
  },

  // Set contact as active for email generation
  setActiveContact: async (prospectId: string, contactId: string): Promise<void> => {
    await api.post(`/prospects/${prospectId}/contacts/${contactId}/activate`);
  },

  // Clear active contact
  clearActiveContact: async (prospectId: string): Promise<void> => {
    await api.delete(`/prospects/${prospectId}/contacts/active`);
  },

  // Get active contact
  getActiveContact: async (prospectId: string): Promise<ContactPersonDto | null> => {
    try {
      const response = await api.get(`/prospects/${prospectId}/contacts/active`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
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
