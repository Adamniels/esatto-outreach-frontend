import api from '@/services/api';
import type {
    SequenceViewDto,
    SequenceDetailsDto,
    CreateSequenceRequest,
    UpdateSequenceRequest,
    AddSequenceStepRequest,
    UpdateSequenceStepRequest,
    UpdateSequenceStepContentRequest,
    ReorderSequenceStepsRequest,
    EnrollProspectRequest,
    SequenceStepViewDto,
    SequenceProspectViewDto
} from '@/types/sequence';

export const sequenceApi = {
    // Sequences CRUD
    async create(request: CreateSequenceRequest): Promise<SequenceViewDto> {
        const response = await api.post<SequenceViewDto>('/sequences', request);
        return response.data;
    },

    async list(): Promise<SequenceViewDto[]> {
        const response = await api.get<SequenceViewDto[]>('/sequences');
        return response.data;
    },

    async getById(id: string): Promise<SequenceDetailsDto> {
        const response = await api.get<SequenceDetailsDto>(`/sequences/${id}`);
        return response.data;
    },

    async update(id: string, request: UpdateSequenceRequest): Promise<SequenceViewDto> {
        const response = await api.put<SequenceViewDto>(`/sequences/${id}`, request);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/sequences/${id}`);
    },

    // Step Management
    async addStep(sequenceId: string, request: AddSequenceStepRequest): Promise<SequenceStepViewDto> {
        const response = await api.post<SequenceStepViewDto>(`/sequences/${sequenceId}/steps`, request);
        return response.data;
    },

    async updateStep(sequenceId: string, stepId: string, request: UpdateSequenceStepRequest): Promise<SequenceStepViewDto> {
        const response = await api.put<SequenceStepViewDto>(`/sequences/${sequenceId}/steps/${stepId}`, request);
        return response.data;
    },

    async updateStepContent(sequenceId: string, stepId: string, request: UpdateSequenceStepContentRequest): Promise<SequenceStepViewDto> {
        const response = await api.put<SequenceStepViewDto>(`/sequences/${sequenceId}/steps/${stepId}/content`, request);
        return response.data;
    },

    async deleteStep(sequenceId: string, stepId: string): Promise<void> {
        await api.delete(`/sequences/${sequenceId}/steps/${stepId}`);
    },

    async reorderSteps(sequenceId: string, request: ReorderSequenceStepsRequest): Promise<void> {
        await api.put(`/sequences/${sequenceId}/steps/reorder`, request);
    },

    // Prospect Enrollment
    async enrollProspect(sequenceId: string, request: EnrollProspectRequest): Promise<SequenceProspectViewDto> {
        const response = await api.post<SequenceProspectViewDto>(`/sequences/${sequenceId}/prospects`, request);
        return response.data;
    },

    async removeProspect(sequenceId: string, prospectId: string): Promise<void> {
        await api.delete(`/sequences/${sequenceId}/prospects/${prospectId}`);
    },

    // Execution Control
    async activate(sequenceId: string): Promise<void> {
        await api.post(`/sequences/${sequenceId}/activate`);
    },

    async pause(sequenceId: string): Promise<void> {
        await api.post(`/sequences/${sequenceId}/pause`);
    },

    async cancel(sequenceId: string): Promise<void> {
        await api.post(`/sequences/${sequenceId}/cancel`);
    },

    // AI Generation
    async generateStepContent(sequenceId: string, stepId: string): Promise<SequenceStepViewDto> {
        const response = await api.post<SequenceStepViewDto>(`/sequences/${sequenceId}/steps/${stepId}/generate`);
        return response.data;
    }
};
