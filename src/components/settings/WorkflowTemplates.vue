<template>
  <div class="workflow-templates">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-900 m-0">Workflow Templates</h3>
      <button 
        @click="startCreating" 
        class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border-none rounded-md text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors"
      >
        <span class="text-lg leading-none">+</span> Create Template
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- List Templates -->
    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading templates...
    </div>
    
    <div v-else-if="templates.length === 0" class="text-center py-12 bg-white border-2 border-dashed border-gray-300 rounded-lg">
      <p class="text-gray-500 mb-2">No templates found.</p>
      <button @click="startCreating" class="text-blue-500 hover:text-blue-700 font-medium cursor-pointer bg-transparent border-none">Create your first template</button>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="template in templates" 
        :key="template.id" 
        class="bg-white border rounded-lg p-5 shadow-sm transition-shadow hover:shadow-md"
        :class="template.isDefault ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'"
      >
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-lg font-medium text-gray-900 m-0">{{ template.name }}</h4>
              <span v-if="template.isDefault" class="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Default</span>
            </div>
            <p v-if="template.description" class="text-sm text-gray-500 mt-1 m-0">{{ template.description }}</p>
          </div>
          <div class="flex gap-2">
             <button 
               v-if="!template.isDefault"
               @click="setAsDefault(template)"
               class="p-2 text-gray-400 hover:text-blue-600 cursor-pointer bg-transparent border-none"
               title="Set as Default"
             >
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
             </button>
             <button 
               @click="editTemplate(template)"
               class="p-2 text-gray-400 hover:text-blue-600 cursor-pointer bg-transparent border-none"
               title="Edit"
             >
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
             </button>
             <button 
               @click="confirmDelete(template)"
               class="p-2 text-gray-400 hover:text-red-600 cursor-pointer bg-transparent border-none"
               title="Delete"
             >
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             </button>
          </div>
        </div>

        <!-- Steps Preview -->
        <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 m-0">Steps</h5>
        <div class="space-y-2">
            <div v-for="(step, idx) in sortedSteps(template.steps)" :key="idx" class="flex items-center text-sm text-gray-700 bg-gray-50 rounded px-3 py-2">
                <span class="w-6 text-gray-400 font-mono text-xs">{{ idx + 1 }}.</span>
                <span class="font-medium mr-2">{{ formatStepType(step.type) }}</span>
                <span v-if="step.generationStrategy" class="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded mr-2">
                    {{ formatStrategy(step.generationStrategy) }}
                </span>
                <span class="text-blue-600 text-xs">Day {{ step.dayOffset }} at {{ step.timeOfDay }}</span>
            </div>
        </div>
      </div>
    </div>

    <!-- Edit/Create Modal (Inlined for simplicity or separate?) -->
    <div v-if="isEditing" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <h2 class="text-xl font-bold mb-4">{{ editingId ? 'Edit Template' : 'Create Template' }}</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input v-model="editForm.name" type="text" class="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="e.g. Standard Outreach" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea v-model="editForm.description" rows="2" class="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Optional description"></textarea>
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="block text-sm font-medium text-gray-700">Steps</label>
                            <button @click="addStep" class="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer border-none bg-transparent">+ Add Step</button>
                        </div>
                        
                        <div v-if="editForm.steps.length === 0" class="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300">
                            <p class="text-gray-500 text-sm">No steps added yet.</p>
                        </div>

                        <div v-else class="space-y-3">
                            <div v-for="(step, idx) in sortedEditFormSteps" :key="idx" class="flex gap-3 items-end bg-gray-50 p-3 rounded border border-gray-200">
                                <span class="pb-2 text-gray-500 font-mono text-sm self-center">{{ idx + 1 }}</span>
                                <div class="flex-1">
                                    <label class="block text-xs text-gray-500 mb-1">Type</label>
                                    <select v-model="step.type" class="w-full text-sm border-gray-300 rounded p-1.5 border">
                                        <option value="Email">Email</option>
                                        <option value="LinkedInMessage">LinkedIn Message</option>
                                        <option value="LinkedInConnectionRequest">LinkedIn Connect</option>
                                        <option value="LinkedInInteract">LinkedIn Interact</option>
                                    </select>
                                    
                                    <div v-if="step.type === 'Email' || step.type === 'LinkedInMessage'" class="mt-2">
                                        <label class="block text-xs text-gray-500 mb-1">Content Strategy</label>
                                        <select v-model="step.generationStrategy" class="w-full text-sm border-gray-300 rounded p-1.5 border">
                                            <option value="WebSearch">Web Search</option>
                                            <option value="UseCollectedData">Use Collected Data</option>
                                            <option value="EsattoRag">Esatto RAG</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="w-24">
                                    <label class="block text-xs text-gray-500 mb-1">Day</label>
                                    <input v-model.number="step.dayOffset" type="number" min="0" class="w-full text-sm border-gray-300 rounded p-1.5 border" />
                                </div>
                                <div class="w-32">
                                    <label class="block text-xs text-gray-500 mb-1">Time (24h)</label>
                                    <input v-model="step.timeOfDay" type="text" placeholder="HH:mm" pattern="[0-2][0-9]:[0-5][0-9]" class="w-full text-sm border-gray-300 rounded p-1.5 border" />
                                </div>
                                <button @click="removeStep(idx)" class="text-red-500 hover:text-red-700 p-2 cursor-pointer border-none bg-transparent" title="Remove step">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-8">
                    <button @click="isEditing = false" class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">Cancel</button>
                    <button @click="saveTemplate" :disabled="saving" class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-50">
                        {{ saving ? 'Saving...' : 'Save Template' }}
                    </button>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { workflowAPI } from '@/services/workflowService';
import { type WorkflowTemplate, type WorkflowTemplateStep, ContentGenerationStrategy } from '@/types/workflow';

const loading = ref(false);
const error = ref<string | null>(null);
const templates = ref<WorkflowTemplate[]>([]);

const isEditing = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);

const editForm = ref<{
    name: string;
    description: string;
    steps: WorkflowTemplateStep[];
}>({
    name: '',
    description: '',
    steps: []
});

onMounted(() => {
    loadTemplates();
});

const loadTemplates = async () => {
    try {
        loading.value = true;
        templates.value = await workflowAPI.getAllTemplates();
    } catch (e: any) {
        error.value = e.message || 'Failed to load templates';
    } finally {
        loading.value = false;
    }
};

const formatStepType = (type: string) => {
    switch (type) {
        case 'Email': return 'Send Email';
        case 'LinkedInMessage': return 'LinkedIn Message';
        case 'LinkedInConnectionRequest': return 'Connection Request';
        case 'LinkedInInteract': return 'Interaction';
        default: return type;
    }
};

const formatStrategy = (s?: string) => {
    switch (s) {
        case ContentGenerationStrategy.WebSearch: return 'Web Search';
        case ContentGenerationStrategy.UseCollectedData: return 'Collected Data';
        case ContentGenerationStrategy.EsattoRag: return 'Esatto RAG';
        default: return s;
    }
};

const startCreating = () => {
    editingId.value = null;
    editForm.value = { name: '', description: '', steps: [] };
    isEditing.value = true;
};

const editTemplate = (tpl: WorkflowTemplate) => {
    editingId.value = tpl.id;
    // Deep copy steps to avoid mutating active view
    editForm.value = {
        name: tpl.name,
        description: tpl.description || '',
        steps: tpl.steps.map(s => ({ ...s }))
    };
    isEditing.value = true;
};

const addStep = () => {
    editForm.value.steps.push({
        type: 'Email' as any,
        dayOffset: 0,
        timeOfDay: '09:00',
        generationStrategy: ContentGenerationStrategy.WebSearch
    });
};

const removeStep = (idx: number) => {
    editForm.value.steps.splice(idx, 1);
};

const saveTemplate = async () => {
    if (!editForm.value.name) return;
    
    try {
        saving.value = true;
        if (editingId.value) {
            await workflowAPI.updateTemplate(editingId.value, editForm.value);
        } else {
            await workflowAPI.createTemplate(editForm.value);
        }
        isEditing.value = false;
        await loadTemplates();
    } catch (e: any) {
        alert('Failed to save: ' + e.message);
    } finally {
        saving.value = false;
    }
};

const confirmDelete = async (tpl: WorkflowTemplate) => {
    if (!confirm(`Delete template "${tpl.name}"?`)) return;
    try {
        await workflowAPI.deleteTemplate(tpl.id);
        await loadTemplates();
    } catch (e: any) {
        alert('Failed to delete: ' + e.message);
    }
};

const setAsDefault = async (tpl: WorkflowTemplate) => {
    try {
        await workflowAPI.setTemplateDefault(tpl.id);
        await loadTemplates();
    } catch (e: any) {
        alert('Failed to set default: ' + e.message);
    }
};

const sortedSteps = (steps: any[]) => {
    return [...steps].sort((a, b) => {
        if (a.dayOffset !== b.dayOffset) {
            return a.dayOffset - b.dayOffset;
        }
        return a.timeOfDay.localeCompare(b.timeOfDay);
    });
};

const sortedEditFormSteps = computed(() => {
    return sortedSteps(editForm.value.steps);
});
</script>
