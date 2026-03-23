<template>
  <div class="workflow-tab h-full flex flex-col">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading workflows...</p>
    </div>

    <!-- No Workflows -> Create New -->
    <div v-else-if="instances.length === 0" class="flex-1 flex items-center justify-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
      <div class="text-center max-w-md w-full">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6">
          <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No active workflow</h3>
        <p class="text-gray-500 mb-6">Start by selecting a template to generate a workflow for this prospect.</p>
        
        <div class="flex flex-col gap-3">
            <select v-model="selectedTemplateId" class="w-full border-gray-300 rounded-md shadow-sm p-2.5 bg-white border">
                <option value="" disabled>Select a template...</option>
                <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }} <span v-if="t.isDefault">(Default)</span></option>
            </select>
            <button 
                @click="createInstance" 
                :disabled="!selectedTemplateId || creating"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
            >
                {{ creating ? 'Creating...' : 'Create Workflow' }}
            </button>
        </div>
      </div>
    </div>

    <!-- Active Workflows -->
    <div v-else class="flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto pr-2 pb-4">
      <div v-for="instance in instances" :key="instance.id" class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
        <!-- Instance Header -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-20">
            <div>
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Workflow</span>
                <div class="flex items-center gap-2 mt-1">
                    <span 
                        class="px-2.5 py-0.5 rounded-full text-xs font-medium uppercase"
                        :class="getStatusClass(instance.status)"
                    >
                        {{ instance.status }}
                    </span>
                    <span class="text-sm text-gray-500">Created {{ new Date(instance.createdAt).toLocaleDateString() }}</span>
                </div>
            </div>
            
            <div v-if="instance.status === 'Draft'" class="flex gap-2">
                <button 
                    @click="deleteWorkflowInstance(instance.id)"
                    :disabled="deleting === instance.id"
                    class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer border-none"
                >
                    {{ deleting === instance.id ? 'Deleting...' : 'Delete Workflow' }}
                </button>
                <button 
                    @click="activateInstance(instance.id)"
                    :disabled="activating === instance.id"
                    class="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer border-none"
                >
                    {{ activating === instance.id ? 'Activating...' : 'Activate Workflow' }}
                </button>
            </div>
        </div>

        <!-- Steps Timeline -->
        <div class="p-6">
            <div class="relative">
                <!-- Vertical Line -->
                <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" aria-hidden="true"></div>

                <div class="space-y-8">
                    <div v-for="(step, idx) in sortedSteps(instance)" :key="step.id" class="relative flex gap-4 group">
                        <!-- Status Icon -->
                        <div 
                            class="relative flex h-12 w-12 flex-none items-center justify-center rounded-full border-2 bg-white z-10"
                            :class="getStepBorderClass(step.status)"
                        >
                            <span class="text-xs font-bold" :class="getStepTextClass(step.status)">{{ idx + 1 }}</span>
                        </div>

                        <!-- Content -->
                        <div class="flex-1 pt-1.5">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h4 class="text-base font-semibold text-gray-900 m-0">{{ formatStepType(step.type) }}</h4>
                                    <span v-if="step.generationStrategy" class="ml-2 inline-block px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800">
                                        {{ formatStrategy(step.generationStrategy) }}
                                    </span>
                                    <span 
                                        class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600"
                                        :class="getStepStatusBadge(step.status)"
                                    >
                                        {{ step.status }}
                                    </span>
                                </div>
                                <div class="text-right flex items-center gap-2">
                                    <template v-if="editingStepId !== step.id">
                                        <p class="text-xs text-gray-500 m-0 font-medium">Day {{ step.dayOffset }} at {{ step.timeOfDay }}</p>
                                        <p v-if="step.runAt" class="text-xs text-gray-500 m-0">Run At: {{ new Date(step.runAt).toLocaleString() }}</p>
                                        
                                        <!-- Edit Config/Delete Buttons (Draft only) -->
                                        <div v-if="instance.status === 'Draft'" class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 items-center ml-2 border-l pl-2 border-gray-200">
                                            <button @click="startEditingConfig(step)" class="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 text-xs cursor-pointer border-none bg-transparent" title="Edit Time">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </button>
                                            <button @click="deleteStep(instance.id, step.id)" class="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 text-xs cursor-pointer border-none bg-transparent" title="Delete Step">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <!-- EDIT MODE -->
                            <div v-if="editingStepId === step.id" class="mt-3 bg-white rounded-md border border-blue-300 p-4 shadow-sm ring-2 ring-blue-100">
                                <div class="mb-3" v-if="step.type === 'Email'">
                                    <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Subject</label>
                                    <input 
                                        v-model="editForm.subject" 
                                        class="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Email Subject"
                                    />
                                </div>
                                <div class="mb-3">
                                    <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Content</label>
                                    <textarea 
                                        v-model="editForm.body" 
                                        rows="6"
                                        class="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono"
                                        placeholder="Message content..."
                                    ></textarea>
                                </div>
                                <div class="flex justify-end gap-2">
                                    <button @click="cancelEdit" class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer border-none">Cancel</button>
                                    <button @click="saveStep(step.id)" class="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded cursor-pointer border-none">Save Changes</button>
                                </div>
                            </div>

                            <!-- VIEW MODE -->
                            <div v-else>
                                <!-- Draft Content Review -->
                                <div v-if="step.emailSubject || step.bodyContent" class="mt-3 bg-gray-50 rounded-md border border-gray-200 p-4 group/content relative">
                                    <div v-if="step.emailSubject" class="mb-2 pb-2 border-b border-gray-200">
                                        <span class="text-xs font-semibold text-gray-500 uppercase">Subject</span>
                                        <p class="text-sm text-gray-900 m-0 font-medium">{{ step.emailSubject }}</p>
                                    </div>
                                    <div>
                                        <span class="text-xs font-semibold text-gray-500 uppercase">Content</span>
                                        <p class="text-sm text-gray-700 m-0 whitespace-pre-wrap font-mono text-xs mt-1">{{ step.bodyContent }}</p>
                                    </div>

                                    <!-- Edit Content Button -->
                                    <button 
                                        v-if="(step.status === 'Pending' || step.status === 'Failed') && instance.status === 'Draft'"
                                        @click="startEdit(step)"
                                        class="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-md shadow-sm text-gray-500 hover:text-blue-600 opacity-0 group-hover/content:opacity-100 transition-opacity cursor-pointer"
                                        title="Edit Content"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                </div>
                                
                                <!-- Actions -->
                                <div v-if="step.status === 'Pending' || step.status === 'Failed'" class="mt-3 flex gap-2">
                                    <button 
                                        @click="regenerateDraft(step.id)"
                                        class="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer border-none bg-transparent flex items-center gap-1"
                                    >
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        Regenerate Draft
                                    </button>
                                </div>
                                <div v-if="step.failureReason" class="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                    Error: {{ step.failureReason }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Add Step Button (Draft only) -->
                    <div v-if="instance.status === 'Draft'" class="relative flex gap-4 pt-4">
                         <div class="relative flex h-12 w-12 flex-none items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 z-10 text-gray-400">
                            <span class="text-lg font-bold">+</span>
                        </div>
                        <div class="flex-1 pt-2">
                            <div v-if="!addingStep">
                                <button @click="addingStep = true" class="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors cursor-pointer border-dashed border border-blue-200 w-full text-left">
                                    + Add Step
                                </button>
                            </div>
                            <div v-else class="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <h4 class="text-sm font-semibold text-gray-900 mb-3">Add New Step</h4>
                                <div class="grid grid-cols-12 gap-4 mb-4">
                                    <div class="col-span-6">
                                        <label class="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                                        <select v-model="addForm.type" class="w-full text-sm border-gray-300 rounded h-9">
                                            <option value="Email">Email</option>
                                            <option value="LinkedInMessage">LinkedIn Message</option>
                                            <option value="LinkedInConnectionRequest">Connection Request</option>
                                        </select>
                                        
                                        <div v-if="addForm.type === 'Email' || addForm.type === 'LinkedInMessage'" class="mt-2">
                                            <label class="block text-xs font-semibold text-gray-700 mb-1">Content Strategy</label>
                                            <select v-model="addForm.generationStrategy" class="w-full text-sm border-gray-300 rounded h-9">
                                                <option value="WebSearch">Web Search</option>
                                                <option value="UseCollectedData">Use Collected Data</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-span-3">
                                        <label class="block text-xs font-semibold text-gray-700 mb-1">Day Offset</label>
                                        <input type="number" v-model.number="addForm.dayOffset" min="0" class="w-full text-sm border-gray-300 rounded h-9" />
                                    </div>
                                    <div class="col-span-3">
                                        <label class="block text-xs font-semibold text-gray-700 mb-1">Time (24h)</label>
                                        <input type="text" v-model="addForm.timeOfDay" placeholder="HH:mm (e.g. 09:00)" pattern="[0-2][0-9]:[0-5][0-9]" class="w-full text-sm border-gray-300 rounded h-9" />
                                    </div>
                                </div>
                                <div class="flex justify-end gap-2">
                                     <button @click="addingStep = false" class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded cursor-pointer">Cancel</button>
                                     <button @click="addStep(instance.id)" class="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded cursor-pointer border-none">Add Step</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
    
    <!-- Config Edit Modal -->
    <div v-if="editingConfigStepId" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 class="text-lg font-semibold mb-4">Edit Step Timing</h3>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Step Type</label>
                    <select v-model="configEditForm.type" class="w-full border-gray-300 rounded-md shadow-sm p-2 border">
                        <option value="Email">Email</option>
                        <option value="LinkedInMessage">LinkedIn Message</option>
                        <option value="LinkedInConnectionRequest">LinkedIn Connect</option>
                        <option value="LinkedInInteract">LinkedIn Interact</option>
                    </select>
                </div>
                
                <div v-if="configEditForm.type === 'Email' || configEditForm.type === 'LinkedInMessage'">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Content Strategy</label>
                    <select v-model="configEditForm.generationStrategy" class="w-full border-gray-300 rounded-md shadow-sm p-2 border">
                        <option value="WebSearch">Web Search</option>
                        <option value="UseCollectedData">Use Collected Data</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Day Offset</label>
                    <input v-model.number="configEditForm.dayOffset" type="number" min="0" class="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="e.g. 0 for same day, 1 for next day" />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Time of Day (24-hour format)</label>
                    <input v-model="configEditForm.timeOfDay" type="text" placeholder="HH:mm (e.g. 09:00, 13:30)" pattern="[0-2][0-9]:[0-5][0-9]" class="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
                </div>
            </div>
            
            <div class="flex justify-end gap-3 mt-6">
                <button @click="cancelConfigEdit" class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button @click="saveConfigEdit" class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">Save Changes</button>
            </div>
        </div>
    </div>
    
    <!-- Toast Notification -->
    <Toast 
      :show="toast.show" 
      :type="toast.type" 
      :title="toast.title" 
      :message="toast.message"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { workflowAPI } from '@/services/workflowService';
import { type WorkflowInstance, type WorkflowTemplate, ContentGenerationStrategy } from '@/types/workflow';
import Toast from '@/components/Toast.vue';

const props = defineProps<{
    prospectId: string;
}>();

const loading = ref(false);
const creating = ref(false);
const activating = ref<string | null>(null);
const deleting = ref<string | null>(null);
const instances = ref<WorkflowInstance[]>([]);
const templates = ref<WorkflowTemplate[]>([]);
const selectedTemplateId = ref('');

// Editing State
const editingStepId = ref<string | null>(null);
const editForm = reactive({ subject: '', body: '' });

// Config Editing State
const editingConfigStepId = ref<string | null>(null);
const configEditForm = reactive({ type: 'Email', dayOffset: 0, timeOfDay: '09:00', generationStrategy: ContentGenerationStrategy.WebSearch });

// Adding State
const addingStep = ref(false);
const addForm = reactive({ type: 'Email', dayOffset: 0, timeOfDay: '09:00', generationStrategy: ContentGenerationStrategy.WebSearch });

const toast = reactive({
    show: false,
    type: 'error' as 'error' | 'success' | 'warning' | 'info',
    title: '',
    message: ''
});

const showToast = (type: 'error' | 'success' | 'warning' | 'info', title: string, message: string) => {
    toast.type = type;
    toast.title = title;
    toast.message = message;
    toast.show = true;
    setTimeout(() => { toast.show = false; }, 5000);
};

onMounted(async () => {
    await loadWorkflows();
    if (instances.value.length === 0) {
        await loadTemplates();
    }
});

const loadWorkflows = async () => {
    loading.value = true;
    try {
        instances.value = await workflowAPI.getInstances(props.prospectId);
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const loadTemplates = async () => {
    try {
        templates.value = await workflowAPI.getAllTemplates();
        const def = templates.value.find(t => t.isDefault);
        if (def) selectedTemplateId.value = def.id;
    } catch (e) {
        console.error(e);
    }
};

const createInstance = async () => {
    if (!selectedTemplateId.value) return;
    creating.value = true;
    try {
        await workflowAPI.createInstance(props.prospectId, selectedTemplateId.value);
        await loadWorkflows();
        showToast('success', 'Workflow Created', 'The workflow has been created successfully.');
    } catch (e: any) {
        const msg = e.response?.data?.error || e.message || 'Failed to create workflow';
        showToast('error', 'Creation Failed', msg);
    } finally {
        creating.value = false;
    }
};

const activateInstance = async (id: string) => {
    activating.value = id;
    try {
        // Validation check
        const validation = await workflowAPI.validateCanActivate(id);
        if (!validation.canActivate) {
             showToast('error', 'Cannot Activate', validation.errors.join('. '));
             return;
        }

        await workflowAPI.activateInstance(id);
        await loadWorkflows();
        showToast('success', 'Workflow Activated', 'The workflow has been activated and will start running.');
    } catch (e: any) {
         const msg = e.response?.data?.error || e.message || 'Failed to activate';
         if (e.response?.data?.validationErrors) {
             showToast('error', 'Activation Failed', e.response.data.validationErrors.join('. '));
         } else {
             showToast('error', 'Activation Failed', msg);
         }
    } finally {
        activating.value = null;
    }
};

const regenerateDraft = async (stepId: string) => {
    if (!confirm('Regenerate draft? Current content will be lost.')) return;
    try {
        await workflowAPI.regenerateDraft(stepId);
        await loadWorkflows();
        showToast('success', 'Draft Regenerated', 'The draft has been regenerated successfully.');
    } catch (e: any) {
        const msg = e.response?.data?.error || e.message || 'Failed to regenerate';
        showToast('error', 'Regeneration Failed', msg);
    }
};

// Edit Actions
const startEdit = (step: any) => {
    editingStepId.value = step.id;
    editForm.subject = step.emailSubject || '';
    editForm.body = step.bodyContent || '';
};

const cancelEdit = () => {
    editingStepId.value = null;
};

const saveStep = async (stepId: string) => {
    try {
        await workflowAPI.updateStepContent(stepId, editForm.subject, editForm.body);
        await loadWorkflows();
        editingStepId.value = null;
        showToast('success', 'Step Updated', 'Content save successfully.');
    } catch (e: any) {
        showToast('error', 'Save Failed', e.message);
    }
};

const deleteStep = async (instanceId: string, stepId: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return;
    try {
        await workflowAPI.deleteStep(instanceId, stepId);
        await loadWorkflows();
        showToast('success', 'Step Deleted', 'Step removed successfully.');
    } catch (e: any) {
        showToast('error', 'Delete Failed', e.message);
    }
};

const addStep = async (instanceId: string) => {
    try {
        await workflowAPI.addStep(
            instanceId, 
            addForm.type, 
            addForm.dayOffset, 
            addForm.timeOfDay,
            (addForm.type === 'Email' || addForm.type === 'LinkedInMessage') ? addForm.generationStrategy : undefined
        );
        await loadWorkflows();
        addingStep.value = false;
        showToast('success', 'Step Added', 'New step added to workflow.');
    } catch (e: any) {
        showToast('error', 'Add Failed', e.message);
    }
};

// Formatting Helpers
const getStatusClass = (status: string) => {
    switch(status) {
        case 'Active': return 'bg-green-100 text-green-800';
        case 'Completed': return 'bg-blue-100 text-blue-800';
        case 'Cancelled': return 'bg-gray-100 text-gray-800';
        default: return 'bg-yellow-100 text-yellow-800';
    }
};

const getStepBorderClass = (status: string) => {
    switch(status) {
        case 'Succeeded': return 'border-green-500 text-green-500';
        case 'Failed': return 'border-red-500 text-red-500';
        case 'Executing': return 'border-blue-500 text-blue-500 animate-pulse';
        case 'Pending': return 'border-gray-300 text-gray-400';
        case 'Skipped': return 'border-gray-200 text-gray-300';
        default: return 'border-gray-300';
    }
};

const getStepTextClass = (status: string) => { return ''; };

const getStepStatusBadge = (status: string) => {
    switch(status) {
        case 'Succeeded': return 'bg-green-100 text-green-800';
        case 'Failed': return 'bg-red-100 text-red-800';
        case 'Executing': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-600';
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
        default: return s;
    }
};

const startEditingConfig = (step: any) => {
    editingConfigStepId.value = step.id;
    configEditForm.type = step.type;
    configEditForm.dayOffset = step.dayOffset;
    configEditForm.timeOfDay = step.timeOfDay;
    configEditForm.generationStrategy = step.generationStrategy || ContentGenerationStrategy.WebSearch;
};

const cancelConfigEdit = () => {
    editingConfigStepId.value = null;
};

const saveConfigEdit = async () => {
    if (!editingConfigStepId.value) return;
    
    try {
        await workflowAPI.updateStepConfig(
            editingConfigStepId.value,
            configEditForm.type,
            configEditForm.dayOffset,
            configEditForm.timeOfDay,
            (configEditForm.type === 'Email' || configEditForm.type === 'LinkedInMessage') ? configEditForm.generationStrategy : undefined
        );
        editingConfigStepId.value = null;
        await loadWorkflows();
        showToast('success', 'Success', 'Step configuration updated');
    } catch (error: any) {
        showToast('error', 'Error', error.message || 'Failed to update step configuration');
    }
};

const sortedSteps = (instance: WorkflowInstance) => {
    return [...instance.steps].sort((a, b) => {
        // Sort by dayOffset first
        if (a.dayOffset !== b.dayOffset) {
            return a.dayOffset - b.dayOffset;
        }
        // Then by timeOfDay
        return a.timeOfDay.localeCompare(b.timeOfDay);
    });
};

const deleteWorkflowInstance = async (instanceId: string) => {
    if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
        return;
    }
    
    deleting.value = instanceId;
    try {
        await workflowAPI.deleteWorkflow(props.prospectId);
        await loadWorkflows();
        // Load templates if no instances remain
        if (instances.value.length === 0) {
            await loadTemplates();
        }
        showToast('success', 'Success', 'Workflow deleted successfully');
    } catch (error: any) {
        showToast('error', 'Error', error.message || 'Failed to delete workflow');
    } finally {
        deleting.value = null;
    }
};
</script>
