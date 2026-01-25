import api from './api';
import type { WorkflowTemplate, CreateWorkflowTemplateRequest, WorkflowInstance, ContentGenerationStrategy } from '@/types/workflow';

export const workflowAPI = {
    // Templates
    getAllTemplates: async (): Promise<WorkflowTemplate[]> => {
        const response = await api.get('/workflow-templates');
        return response.data;
    },

    getTemplate: async (id: string): Promise<WorkflowTemplate> => {
        const response = await api.get(`/workflow-templates/${id}`);
        return response.data;
    },

    createTemplate: async (data: CreateWorkflowTemplateRequest): Promise<WorkflowTemplate> => {
        const response = await api.post('/workflow-templates', data);
        return response.data;
    },

    updateTemplate: async (id: string, data: CreateWorkflowTemplateRequest): Promise<void> => {
        await api.put(`/workflow-templates/${id}`, data);
    },

    deleteTemplate: async (id: string): Promise<void> => {
        await api.delete(`/workflow-templates/${id}`);
    },

    setTemplateDefault: async (id: string): Promise<void> => {
        await api.post(`/workflow-templates/${id}/default`);
    },

    // Instances
    getInstances: async (prospectId: string): Promise<WorkflowInstance[]> => {
        const response = await api.get(`/prospects/${prospectId}/workflows`);
        return response.data;
    },

    createInstance: async (prospectId: string, templateId: string): Promise<WorkflowInstance> => {
        const response = await api.post(`/prospects/${prospectId}/workflows`, templateId); // Sending simple string? 
        // Backend: [FromBody] Guid templateId
        // Axios usually sends object for JSON default.
        // It's safer to send { templateId } but my backend expects just the Guid as FromBody.
        // If FromBody is Guid, it expects just a JSON value like "guid" (with quotes).
        // Let's send header Content-Type: application/json and body: "guid"
        // Axios handles "string" as body correctly.
        return response.data;
    },

    activateInstance: async (instanceId: string): Promise<void> => {
        await api.post(`/workflow-instances/${instanceId}/activate`);
    },

    regenerateDraft: async (stepId: string): Promise<void> => {
        await api.post(`/workflow-steps/${stepId}/regenerate-draft`);
    },

    addStep: async (instanceId: string, type: string, dayOffset: number, timeOfDay: string, generationStrategy?: ContentGenerationStrategy): Promise<WorkflowInstance> => {
        const response = await api.post(`/workflow-instances/${instanceId}/steps`, { type, dayOffset, timeOfDay, generationStrategy });
        return response.data;
    },

    deleteStep: async (instanceId: string, stepId: string): Promise<void> => {
        await api.delete(`/workflow-instances/${instanceId}/steps/${stepId}`);
    },

    updateStepContent: async (stepId: string, subject: string, body: string): Promise<void> => {
        await api.patch(`/workflow-steps/${stepId}/content`, { subject, body });
    },

    updateStepConfig: async (stepId: string, type: string, dayOffset: number, timeOfDay: string, generationStrategy?: ContentGenerationStrategy): Promise<void> => {
        await api.put(`/workflow-steps/${stepId}`, { type, dayOffset, timeOfDay, generationStrategy });
    },

    updateTemplateStep: async (stepId: string, type: string, dayOffset: number, timeOfDay: string, generationStrategy?: ContentGenerationStrategy): Promise<void> => {
        await api.put(`/workflow-template-steps/${stepId}`, { type, dayOffset, timeOfDay, generationStrategy });
    },

    deleteWorkflow: async (prospectId: string): Promise<void> => {
        await api.delete(`/prospects/${prospectId}/workflow`);
    },

    validateCanActivate: async (instanceId: string): Promise<{ canActivate: boolean, errors: string[] }> => {
        const response = await api.get(`/workflow-instances/${instanceId}/can-activate`);
        return response.data;
    }
};
