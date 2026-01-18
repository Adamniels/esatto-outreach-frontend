<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="close"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
            {{ isEditing ? 'Edit Contact Person' : 'Add Contact Person' }}
          </h3>
          
          <!-- Tabs -->
          <div class="border-b border-gray-200 mb-4">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                @click="activeTab = 'details'"
                :class="[
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                ]"
              >
                Details
              </button>
              <button
                @click="activeTab = 'enrichment'"
                :class="[
                  activeTab === 'enrichment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                ]"
              >
                Enrichment
              </button>
            </nav>
          </div>

          <!-- Details Tab -->
          <div v-show="activeTab === 'details'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name <span class="text-red-500">*</span></label>
              <input 
                v-model="form.name"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ex. Jane Doe"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Title</label>
              <input 
                v-model="form.title"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ex. CEO"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input 
                v-model="form.email"
                type="email"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ex. jane@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">LinkedIn URL</label>
              <input 
                v-model="form.linkedInUrl"
                type="url"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>

          <!-- Enrichment Tab -->
          <div v-show="activeTab === 'enrichment'" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <!-- General Info -->
            <div>
              <label class="block text-sm font-medium text-gray-700">General Info</label>
              <textarea 
                v-model="form.generalInfo"
                rows="3"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Summary or general notes..."
              ></textarea>
            </div>

            <!-- Hooks -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-medium text-gray-700">Personal Hooks</label>
                <button @click="addHook" type="button" class="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Add Hook</button>
              </div>
              <div class="space-y-2">
                <div v-for="(hook, index) in form.personalHooks" :key="index" class="flex gap-2">
                  <input 
                    v-model="form.personalHooks![index]"
                    type="text"
                    class="flex-1 border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Hook..."
                  />
                  <button @click="removeHook(index)" type="button" class="text-red-500 hover:text-red-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                <div v-if="!form.personalHooks?.length" class="text-sm text-gray-400 italic">No hooks added.</div>
              </div>
            </div>

            <!-- News -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-medium text-gray-700">Personal News</label>
                <button @click="addNews" type="button" class="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Add News</button>
              </div>
              <div class="space-y-2">
                <div v-for="(news, index) in form.personalNews" :key="index" class="flex gap-2">
                  <input 
                    v-model="form.personalNews![index]"
                    type="text"
                    class="flex-1 border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="News item..."
                  />
                  <button @click="removeNews(index)" type="button" class="text-red-500 hover:text-red-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                <div v-if="!form.personalNews?.length" class="text-sm text-gray-400 italic">No news added.</div>
              </div>
            </div>
          </div>

          <div v-if="error" class="mt-4 text-sm text-red-600">
            {{ error }}
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            type="button" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            :disabled="loading || !isValid"
            @click="save"
          >
            <span v-if="loading">Saving...</span>
            <span v-else>Save</span>
          </button>
          <button 
            type="button" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            @click="close"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { CreateContactPersonRequest, ContactPersonDto } from '@/types/prospect';

const props = defineProps<{
  show: boolean;
  loading?: boolean;
  editData?: ContactPersonDto | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: CreateContactPersonRequest): void;
}>();

const activeTab = ref<'details' | 'enrichment'>('details');

const form = ref<CreateContactPersonRequest>({
  name: '',
  title: '',
  email: '',
  linkedInUrl: '',
  personalHooks: [],
  personalNews: [],
  generalInfo: ''
});

const error = ref<string | null>(null);

const isEditing = computed(() => !!props.editData);

watch(() => props.show, (newVal) => {
  if (newVal) {
    activeTab.value = 'details';
    if (props.editData) {
      form.value = {
        name: props.editData.name,
        title: props.editData.title || '',
        email: props.editData.email || '',
        linkedInUrl: props.editData.linkedInUrl || '',
        personalHooks: props.editData.personalHooks ? [...props.editData.personalHooks] : [],
        personalNews: props.editData.personalNews ? [...props.editData.personalNews] : [],
        generalInfo: props.editData.generalInfo || ''
      };
    } else {
      form.value = { 
        name: '', 
        title: '', 
        email: '', 
        linkedInUrl: '',
        personalHooks: [],
        personalNews: [],
        generalInfo: ''
      };
    }
    error.value = null;
  }
});

const isValid = computed(() => {
  return form.value.name.trim().length > 0;
});

function addHook() {
  if (!form.value.personalHooks) form.value.personalHooks = [];
  form.value.personalHooks.push('');
}

function removeHook(index: number) {
  form.value.personalHooks?.splice(index, 1);
}

function addNews() {
  if (!form.value.personalNews) form.value.personalNews = [];
  form.value.personalNews.push('');
}

function removeNews(index: number) {
  form.value.personalNews?.splice(index, 1);
}

function close() {
  emit('close');
}

function save() {
  if (!isValid.value) return;
  // Filter out empty strings
  const data = { ...form.value };
  if (data.personalHooks) data.personalHooks = data.personalHooks.filter(h => h.trim());
  if (data.personalNews) data.personalNews = data.personalNews.filter(n => n.trim());
  
  emit('save', data);
}
</script>
