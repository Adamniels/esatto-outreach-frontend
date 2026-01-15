<template>
  <div class="w-full px-4 py-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-lg text-gray-500">Loading...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-base text-red-600 mb-4">{{ error }}</p>
      <button @click="router.push('/prospects')" class="px-5 py-2.5 bg-gray-500 text-white border-none rounded-md cursor-pointer text-sm font-semibold hover:bg-gray-600 transition-colors">
        Back to list
      </button>
    </div>

    <!-- Prospect Detail Content -->
    <div v-else-if="prospect" class="flex flex-col gap-8">
      <!-- Back Button and Title -->
      <div class="flex items-center justify-between pb-6 border-b-2 border-gray-100">
        <h2 class="text-3xl font-bold text-gray-900 m-0 leading-tight">{{ isEditing ? formData.name : prospect.name }}</h2>
        <div class="flex gap-4">
          <button 
            v-if="!isEditing" 
            @click="startEditing" 
            class="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md cursor-pointer text-sm font-semibold transition-all hover:bg-blue-50"
          >
            Edit
          </button>
          <button @click="router.push('/prospects')" class="px-4 py-2 bg-transparent text-gray-500 border border-transparent rounded-md cursor-pointer text-sm font-semibold transition-all hover:text-gray-900 hover:bg-gray-100">
            ← Back to list
          </button>
        </div>
      </div>

      <!-- Edit Mode Actions -->
      <div v-if="isEditing" class="flex gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg justify-end">
        <button 
          @click="saveChanges" 
          :disabled="isSaving || !isFormValid"
          class="px-5 py-2.5 bg-blue-600 text-white border-none rounded-md cursor-pointer text-sm font-semibold shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSaving ? 'Saving...' : 'Save changes' }}
        </button>
        <button 
          @click="cancelEditing" 
          :disabled="isSaving"
          class="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-md cursor-pointer text-sm font-semibold shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>

      <!-- Company Information Grid -->
      <div class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4 items-baseline bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div class="contents">
          <label class="font-bold text-gray-500 text-right text-sm uppercase tracking-wide min-w-[140px]">Company Name: <span v-if="isEditing" class="text-red-500">*</span></label>
          <div class="text-base text-gray-900">
            <input 
              v-if="isEditing"
              v-model="formData.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              :class="{ 'border-red-500': !formData.name?.trim() }"
              placeholder="Company Name (required)"
              required
            />
            <span v-else class="font-bold text-xl">{{ prospect.name }}</span>
          </div>
        </div>

        <div class="contents">
          <label class="font-bold text-gray-500 text-right text-sm uppercase tracking-wide min-w-[140px]">Websites:</label>
          <div class="text-base text-gray-900">
            <textarea 
              v-if="isEditing"
              v-model="formData.websitesText"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans resize-y"
              rows="2"
              placeholder="One URL per line&#10;https://example.com&#10;https://shop.example.com"
            ></textarea>
            <div v-else>
              <div v-if="prospect.websites.length > 0" class="flex flex-col gap-1">
                <a v-for="(site, idx) in prospect.websites" :key="idx" :href="site.url || '#'" target="_blank" class="text-blue-600 hover:text-blue-800 hover:underline break-all">{{ site.url || 'N/A' }}</a>
              </div>
              <span v-else class="text-gray-400 italic">N/A</span>
            </div>
          </div>
        </div>



        <div class="contents">
          <label class="font-bold text-gray-500 text-right text-sm uppercase tracking-wide min-w-[140px]">Status:</label>
          <div class="text-base text-gray-900">
            <select 
              v-if="isEditing"
              v-model="formData.status"
              class="w-full max-w-[200px] px-3 py-2 border border-gray-300 rounded-md text-sm cursor-pointer bg-white"
            >
              <option :value="0">New</option>
              <option :value="1">Researched</option>
              <option :value="2">Drafted</option>
              <option :value="3">Emailed</option>
              <option :value="4">Responded</option>
              <option :value="5">Archived</option>
            </select>
            <span v-else>
              <span :class="['inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium uppercase tracking-wide', getStatusClass(prospect.status)]">
                {{ statusLabels[prospect.status as ProspectStatus] || 'Unknown' }}
              </span>
            </span>
          </div>
        </div>

        <div class="contents">
          <label class="font-bold text-gray-500 text-right text-sm uppercase tracking-wide min-w-[140px]">Created:</label>
          <div class="text-base text-gray-900">{{ new Date(prospect.createdUtc).toLocaleDateString('en-US') }}</div>
        </div>
      </div>

      <!-- Tags Section -->
      <div v-if="prospect.tags && prospect.tags.length > 0" class="pb-6 border-b-2 border-gray-100">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tags from Capsule:</label>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="tag in prospect.tags" 
            :key="tag.id"
            class="px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            :class="{ 'bg-amber-100 text-amber-800': tag.dataTag }"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>

      <!-- Custom Fields Section -->
      <div v-if="prospect.customFields && prospect.customFields.length > 0" class="pb-6 border-b-2 border-gray-100">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Custom Fields from Capsule:</label>
        <div class="flex flex-col gap-2">
          <div 
            v-for="field in prospect.customFields" 
            :key="field.id"
            class="flex items-start gap-2 text-sm bg-gray-50 p-2 rounded-md"
          >
            <strong class="font-bold text-gray-600 uppercase text-xs">{{ field.fieldName }}:</strong>
            <span class="text-gray-900">{{ field.value || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <!-- Notes Section (Editable) -->
      <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-100" :class="{ 'ring-2 ring-blue-500 border-transparent': isEditing }">
        <label class="block text-xs font-bold text-yellow-800 uppercase tracking-wide mb-2">Notes</label>
        <textarea 
          v-if="isEditing"
          v-model="formData.notes"
          class="w-full bg-white border border-yellow-200 rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 resize-y min-h-[100px]"
          placeholder="Add notes..."
          rows="4"
        ></textarea>
        <p v-else class="m-0 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{{ prospect.notes || 'No notes' }}</p>
      </div>

      <!-- Entity Intelligence Section -->
      <div class="pb-6 border-b-2 border-gray-100">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Entity Intelligence</h3>
        <EnrichDataButton
          :prospectId="prospect.id"
          :data="prospect.entityIntelligence"
          :loading="isEnriching"
          @enrich="handleEnrichProspect"
          @view="showEntityModal = true"
        />
      </div>

      <!-- Contact Persons Section -->
      <div class="pb-6 border-b-2 border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900 m-0">Contact Persons</h3>
          <button 
            @click="openAddContactModal"
            class="px-3 py-1.5 bg-white text-blue-600 border border-blue-600 rounded-md text-xs font-semibold hover:bg-blue-50 transition-colors"
          >
            + Add Contact
          </button>
        </div>
        
        <div v-if="prospect.contactPersons && prospect.contactPersons.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="person in prospect.contactPersons" 
            :key="person.id"
            class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm group relative"
          >
            <!-- Actions -->
            <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                @click="handleEnrichContact(person)"
                :disabled="enrichingContactId === person.id"
                class="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                :class="enrichingContactId === person.id ? 'text-blue-600' : 'text-gray-400 hover:text-green-600'"
                :title="enrichingContactId === person.id ? 'Enriching...' : 'Enrich with AI'"
              >
                 <svg v-if="enrichingContactId === person.id" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                   <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                   <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </button>
              <button 
                @click="openEditContactModal(person)"
                class="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100"
                title="Edit"
              >
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <button 
                @click="handleDeleteContact(person)"
                class="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                title="Delete"
              >
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>

            <div class="flex items-start gap-3 mb-2 pr-12">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h4 class="text-lg font-bold text-gray-900 m-0">{{ person.name }}</h4>
                  <a 
                    v-if="person.linkedInUrl" 
                    :href="person.linkedInUrl" 
                    target="_blank"
                    class="text-blue-600 hover:text-blue-800 flex-shrink-0"
                    title="LinkedIn Profile"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                </div>
                <p v-if="person.title" class="text-sm text-gray-600 m-0">{{ person.title }}</p>
              </div>
            </div>
            
            <div v-if="person.email" class="flex items-center gap-2 mb-3 text-sm">
               <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
               <a :href="`mailto:${person.email}`" class="text-gray-600 hover:text-blue-600">{{ person.email }}</a>
            </div>

            <!-- Enrichment Data Display -->
            <div v-if="person.generalInfo" class="mt-3 text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 italic">
               {{ person.generalInfo }}
            </div>

            <div v-if="person.personalHooks && person.personalHooks.length > 0" class="mt-3">
               <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Hooks</p>
               <ul class="list-disc pl-4 space-y-1">
                 <li v-for="(hook, idx) in person.personalHooks" :key="idx" class="text-xs text-gray-600">
                   {{ hook }}
                 </li>
               </ul>
            </div>

            <div v-if="person.personalNews && person.personalNews.length > 0" class="mt-3">
               <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">News</p>
               <ul class="list-disc pl-4 space-y-1">
                 <li v-for="(news, idx) in person.personalNews" :key="idx" class="text-xs text-gray-600">
                   {{ news }}
                 </li>
               </ul>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-400 italic text-sm">
           No contact persons added yet.
        </div>
      </div>

      <!-- Content Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            @click="activeView = 'email'"
            :class="[
              activeView === 'email'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
            ]"
          >
            Write Email
          </button>
          <button
            @click="activeView = 'linkedin'"
            :class="[
              activeView === 'linkedin'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
            ]"
          >
            Write LinkedIn Message
          </button>
          <button
            @click="activeView = 'workflow'"
            :class="[
              activeView === 'workflow'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
            ]"
          >
            Workflow
          </button>
        </nav>
      </div>

      <!-- Write Email Tab -->
      <div v-if="activeView === 'email'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[850px]">
        <!-- Left Column: Settings & Preview -->
        <div class="lg:col-span-2 flex flex-col gap-4 h-full overflow-hidden">
          <!-- Generation Settings -->
          <div class="flex flex-col gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
             <!-- Generator Type Selector -->
             <div class="flex p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
               <button 
                 v-for="type in emailGeneratorTypes" 
                 :key="type.value"
                 @click="selectedEmailGeneratorType = type.value"
                 class="flex-1 py-2 px-3 rounded-md text-sm font-medium cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                 :class="selectedEmailGeneratorType === type.value ? 'bg-blue-100 text-blue-700 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-50'"
               >
                 {{ type.label }}
               </button>
             </div>

             <!-- Action Buttons -->
             <div class="flex gap-3">
               <button 
                 @click="handleGenerateEmail"
                 :disabled="isGenerating"
                 class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
               >
                 <svg v-if="isGenerating" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                   <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 {{ isGenerating ? 'Generating...' : 'Generate Email' }}
               </button>

               <button
                  v-if="canResetToBackend"
                  @click="resetToBackendDraft"
                  class="bg-red-100 text-red-700 px-6 py-2 rounded-md hover:bg-red-200 transition-colors text-sm font-medium h-[42px] border border-red-200"
               >
                 Clear Email
               </button>
             </div>
          </div>

          <!-- Email Preview Editor -->
          <div class="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-0">
             <!-- Editor Toolbar -->
             <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
               <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                 PREVIEW
               </div>
               <div class="flex items-center gap-2">
                 <span v-if="hasUnsavedChanges" class="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                   Unsaved changes
                 </span>
                 <button 
                   v-if="canSaveGeneratedEmail"
                   @click="saveGeneratedEmail"
                   class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                   title="Save changes"
                 >
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                   </svg>
                 </button>
               </div>
             </div>

             <!-- Editor Content -->
             <div class="flex-1 flex flex-col p-6 min-h-0 bg-white">
               <div class="mb-4 flex-shrink-0">
                 <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject:</label>
                 <input 
                   v-model="generatedEmailSubject"
                   type="text" 
                   class="w-full text-base text-gray-600 border border-gray-200 p-3 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 rounded-md bg-white placeholder-gray-300 transition-all font-sans"
                   placeholder="Subject line..." 
                 />
               </div>
               
               <div class="flex-1 flex flex-col min-h-0">
                 <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message:</label>
                 <div class="flex-1 relative border border-gray-200 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all bg-white">
                    <textarea 
                      v-model="generatedEmailBody"
                      class="absolute inset-0 w-full h-full p-4 resize-none border-none text-gray-600 leading-relaxed focus:ring-0 rounded-md bg-transparent placeholder-gray-300 text-base overflow-y-auto"
                      placeholder="Generated email appears here..."
                    ></textarea>
                 </div>
               </div>
             </div>
             
             <!-- Send Button Footer -->
             <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
               <button 
                 @click="handleSendEmail"
                 :disabled="!canSendEmail"
                 class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm gap-2"
               >
                 <svg v-if="isSendingEmail" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                   <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                 </svg>
                 {{ isSendingEmail ? 'Sending...' : 'Send Email' }}
               </button>
             </div>
          </div>
        </div>

        <!-- Chat Section (Right) -->
        <div class="lg:col-span-1 h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <ChatBox 
            v-if="prospect"
            :prospectId="prospect.id"
            :mailTitle="generatedEmail?.mailTitle"
            :mailBodyPlain="generatedEmail?.mailBodyPlain"
            @emailUpdated="handleEmailUpdated"
          />
        </div>
      </div>

      <!-- Write LinkedIn Message Tab -->
      <div v-else-if="activeView === 'linkedin'" class="flex items-center justify-center h-[400px] bg-white rounded-xl border border-gray-200 border-dashed">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">LinkedIn Message</h3>
          <p class="mt-1 text-sm text-gray-500">Feature coming soon.</p>
        </div>
      </div>

      <!-- Workflow Tab -->
      <div v-else-if="activeView === 'workflow'" class="flex items-center justify-center h-[400px] bg-white rounded-xl border border-gray-200 border-dashed">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Workflow</h3>
          <p class="mt-1 text-sm text-gray-500">Workflow automation coming soon.</p>
        </div>
      </div>

      <!-- Entity Intelligence Modal -->
      <EntityIntelligenceModal
        v-if="prospect"
        :show="showEntityModal"
        :data="prospect.entityIntelligence"
        :loading="isEnriching"
        @close="showEntityModal = false"
      />

      <!-- Contact Person Modal -->
      <ContactPersonModal 
        :show="showContactModal"
        :loading="isSavingContact"
        :edit-data="editingContact"
        @close="showContactModal = false"
        @save="handleSaveContact"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Prospect, EmailDraft, ProspectStatus, CreateContactPersonRequest, ContactPersonDto } from '../types/prospect'
import { ProspectStatus as ProspectStatusEnum, statusLabels } from '../types/prospect'
import { prospectsAPI } from '../services/prospects'
import ChatBox from '../components/ChatBox.vue'
import EnrichDataButton from '../components/EnrichDataButton.vue'
import EntityIntelligenceModal from '../components/EntityIntelligenceModal.vue'
import ContactPersonModal from '../components/ContactPersonModal.vue'
import { useEntityIntelligence } from '../composables/useEntityIntelligence'

const route = useRoute()
const router = useRouter()

// Composables
const { enrichProspect } = useEntityIntelligence()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const prospect = ref<Prospect | null>(null)
const isGenerating = ref(false)
const isSendingEmail = ref(false)
const generatedEmail = ref<EmailDraft | null>(null)
const originalServerDraft = ref<EmailDraft | null>(null)
const hasUnsavedChatChanges = ref(false)
const activeView = ref<'email' | 'linkedin' | 'workflow'>('email')

// Entity Intelligence State
const showEntityModal = ref(false)
const isEnriching = ref(false)

// Contact Person State
const showContactModal = ref(false)
const isSavingContact = ref(false)
const editingContact = ref<ContactPersonDto | null>(null)
const enrichingContactId = ref<string | null>(null)

// Email Generator Type State
const emailGeneratorTypes = [
  { value: 'WebSearch' as const, label: 'Web Search' },
  { value: 'UseCollectedData' as const, label: 'Use Collected Data' },
  { value: 'EsattoRag' as const, label: 'Esatto RAG' }
]
const selectedEmailGeneratorType = ref<'WebSearch' | 'UseCollectedData' | 'EsattoRag'>('WebSearch')

// Edit Mode State
const isEditing = ref(false)
const isSaving = ref(false)
const formData = ref({
  name: '',
  websitesText: '',
  emailsText: '',
  phonesText: '',
  status: 0 as ProspectStatus,
  notes: ''
})

// Helper functions for array conversion
const splitLines = (text: string): string[] => {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

const arrayToText = (arr: Array<{ url?: string | null; address?: string | null; number?: string | null }>): string => {
  return arr
    .map(item => item.url || item.address || item.number || '')
    .filter(Boolean)
    .join('\n')
}

// Storage helper
const storageKey = (id: string) => `generatedEmail_${id}`

// Helper functions
function pickString(source: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return undefined
}

function extractEmailDraft(payload: unknown): EmailDraft | null {
  if (!payload) return null

  if (typeof payload === 'string') {
    const plain = payload.trim()
    return plain ? { mailBodyPlain: plain } : null
  }

  if (typeof payload === 'object') {
    const data = payload as Record<string, unknown>

    let mailTitle = pickString(data, ['mailTitle', 'MailTitle'])
    let mailBodyPlain = pickString(data, ['mailBodyPlain', 'MailBodyPlain'])
    let mailBodyHTML = pickString(data, ['mailBodyHTML', 'MailBodyHTML'])

    if (!mailTitle) {
      mailTitle = pickString(data, ['subject', 'title', 'mail_title'])
    }

    if (!mailBodyPlain) {
      mailBodyPlain = pickString(data, ['draft', 'email', 'body', 'text', 'content', 'MailBodyPlain', 'mail_body_plain'])
    }

    if (!mailBodyHTML) {
      mailBodyHTML = pickString(data, ['html', 'mailBodyHTML', 'MailBodyHTML', 'mail_body_html'])
    }

    if (mailTitle || mailBodyPlain || mailBodyHTML) {
      return { mailTitle, mailBodyPlain, mailBodyHTML }
    }
  }

  return null
}

function htmlToPlainText(html: string) {
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function draftHasContent(draft: EmailDraft | null | undefined): draft is EmailDraft {
  if (!draft) return false
  return Boolean(
    (draft.mailTitle && draft.mailTitle.trim()) ||
    (draft.mailBodyPlain && draft.mailBodyPlain.trim()) ||
    (draft.mailBodyHTML && draft.mailBodyHTML.trim())
  )
}

function loadDraftFromStorage(id: string): EmailDraft | null {
  try {
    const stored = localStorage.getItem(storageKey(id))
    if (!stored) return null
    try {
      return extractEmailDraft(JSON.parse(stored))
    } catch (e) {
      return extractEmailDraft(stored)
    }
  } catch (e) {
    return null
  }
}

function storeDraft(id: string, draft: EmailDraft) {
  if (!draftHasContent(draft)) return
  try { localStorage.setItem(storageKey(id), JSON.stringify(draft)) } catch (e) {}
}

function clearStoredDraft(id: string) {
  try { localStorage.removeItem(storageKey(id)) } catch (e) {}
}

function draftFromProspect(p: Prospect | null): EmailDraft | null {
  if (!p) return null
  const { mailTitle, mailBodyPlain, mailBodyHTML } = p
  if (!mailTitle && !mailBodyPlain && !mailBodyHTML) return null
  return {
    mailTitle: mailTitle?.trim() || undefined,
    mailBodyPlain: mailBodyPlain?.trim() || undefined,
    mailBodyHTML: mailBodyHTML?.trim() || undefined
  }
}

function syncDraftState() {
  if (!prospect.value) return

  const draft = generatedEmail.value
  const updatedProspect: Prospect = {
    ...prospect.value,
    mailTitle: draft?.mailTitle ?? undefined,
    mailBodyPlain: draft?.mailBodyPlain ?? undefined,
    mailBodyHTML: draft?.mailBodyHTML ?? undefined
  }

  prospect.value = updatedProspect

  if (!draft) {
    clearStoredDraft(updatedProspect.id)
    return
  }

  if (draftHasContent(draft)) {
    storeDraft(updatedProspect.id, draft)
  } else {
    clearStoredDraft(updatedProspect.id)
  }
}

// Computed properties
const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0
})

const hasGeneratedEmail = computed(() => generatedEmail.value !== null)
const hasGeneratedEmailContent = computed(() => draftHasContent(generatedEmail.value))

const hasUnsavedChanges = computed(() => {
  // Om chatten har gjort ändringar, räknas det alltid som osparade ändringar
  if (hasUnsavedChatChanges.value) return true
  
  const current = generatedEmail.value
  const original = originalServerDraft.value

  if (!current && !original) return false
  if (!current || !original) return true

  const currentTitle = current.mailTitle?.trim() || ''
  const originalTitle = original.mailTitle?.trim() || ''
  
  const currentBody = current.mailBodyPlain?.trim() || ''
  const originalBody = original.mailBodyPlain?.trim() || ''

  return currentTitle !== originalTitle || currentBody !== originalBody
})

const canSaveGeneratedEmail = computed(() => 
  hasGeneratedEmailContent.value && !isGenerating.value && hasUnsavedChanges.value
)

const canResetToBackend = computed(() => {
  // Visa knappen om det finns ett sparat mejl på backend OCH det är olika från nuvarande
  const serverDraft = originalServerDraft.value
  if (!serverDraft || !draftHasContent(serverDraft)) return false
  
  const current = generatedEmail.value
  if (!current) return false
  
  // Visa bara om det faktiskt är olika
  const currentTitle = current.mailTitle?.trim() || ''
  const serverTitle = serverDraft.mailTitle?.trim() || ''
  const currentBody = current.mailBodyPlain?.trim() || ''
  const serverBody = serverDraft.mailBodyPlain?.trim() || ''
  
  return currentTitle !== serverTitle || currentBody !== serverBody
})

const canSendEmail = computed(() => {
  const p = prospect.value
  if (!p || !p.emailAddresses || p.emailAddresses.length === 0) return false
  
  const hasSavedContent = Boolean(
    (p.mailTitle && p.mailTitle.trim()) ||
    (p.mailBodyPlain && p.mailBodyPlain.trim()) ||
    (p.mailBodyHTML && p.mailBodyHTML.trim())
  )
  
  return hasSavedContent && !isSendingEmail.value
})

const generatedEmailSubject = computed({
  get: () => generatedEmail.value?.mailTitle ?? '',
  set: value => {
    const subject = typeof value === 'string' ? value : ''
    const trimmed = subject.trim()
    const current = generatedEmail.value ?? {}
    const next: EmailDraft = {
      ...current,
      mailTitle: trimmed ? trimmed : undefined
    }
    if (!trimmed) {
      delete next.mailTitle
    }
    generatedEmail.value = draftHasContent(next) ? next : {}
    syncDraftState()
  }
})

const generatedEmailBody = computed({
  get: () => {
    const draft = generatedEmail.value
    if (!draft) return ''
    if (typeof draft.mailBodyPlain === 'string') return draft.mailBodyPlain
    if (typeof draft.mailBodyHTML === 'string') return htmlToPlainText(draft.mailBodyHTML)
    return ''
  },
  set: value => {
    const bodyInput = typeof value === 'string' ? value.replace(/\r\n/g, '\n') : ''
    const trimmed = bodyInput.trim()
    const current = generatedEmail.value ?? {}
    const next: EmailDraft = {
      ...current,
      mailBodyPlain: trimmed ? bodyInput : undefined
    }
    delete next.mailBodyHTML
    if (!trimmed) {
      delete next.mailBodyPlain
    }
    generatedEmail.value = draftHasContent(next) ? next : {}
    syncDraftState()
  }
})

// Status -> local CSS class names
const getStatusClass = (status: number) => {
  switch (status) {
    case 0: return 'bg-blue-100 text-blue-800'
    case 1: return 'bg-amber-100 text-amber-800'
    case 2: return 'bg-purple-100 text-purple-800'
    case 3: return 'bg-indigo-100 text-indigo-800'
    case 4: return 'bg-emerald-100 text-emerald-800'
    case 5: return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

// Edit Mode Actions
function startEditing() {
  if (!prospect.value) return
  
  // Populate form with current values
  formData.value = {
    name: prospect.value.name,
    websitesText: arrayToText(prospect.value.websites),
    emailsText: arrayToText(prospect.value.emailAddresses),
    phonesText: arrayToText(prospect.value.phoneNumbers),
    status: prospect.value.status,
    notes: prospect.value.notes || ''
  }
  
  isEditing.value = true
}

function cancelEditing() {
  if (hasUnsavedEditChanges()) {
    if (!confirm('You have unsaved changes. Do you really want to cancel?')) {
      return
    }
  }
  
  isEditing.value = false
}

function hasUnsavedEditChanges(): boolean {
  if (!prospect.value) return false
  
  return (
    formData.value.name !== prospect.value.name ||
    formData.value.websitesText !== arrayToText(prospect.value.websites) ||
    formData.value.emailsText !== arrayToText(prospect.value.emailAddresses) ||
    formData.value.phonesText !== arrayToText(prospect.value.phoneNumbers) ||
    formData.value.status !== prospect.value.status ||
    formData.value.notes !== (prospect.value.notes || '')
  )
}

async function saveChanges() {
  if (!prospect.value || !isFormValid.value) return
  
  isSaving.value = true
  error.value = null
  
  try {
    const updatePayload: Record<string, any> = {
      name: formData.value.name.trim(),
      websites: splitLines(formData.value.websitesText),
      emailAddresses: splitLines(formData.value.emailsText),
      phoneNumbers: splitLines(formData.value.phonesText),
      status: formData.value.status,
      notes: formData.value.notes.trim() || undefined
    }
    
    const updated = await prospectsAPI.update(prospect.value.id, updatePayload)
    prospect.value = updated
    isEditing.value = false
    
    // Show success message briefly
    const successMsg = document.createElement('div')
    successMsg.textContent = 'Changes saved'
    successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; z-index: 9999; font-weight: 500;'
    document.body.appendChild(successMsg)
    setTimeout(() => successMsg.remove(), 3000)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Could not save changes'
    alert(`Error: ${error.value}`)
  } finally {
    isSaving.value = false
  }
}

// Email and Entity Intelligence Actions
async function handleEnrichProspect(prospectId: string) {
  if (!prospect.value) return
  
  isEnriching.value = true
  error.value = null
  
  console.log('ProspectDetail: Starting enrichment for', prospect.value.id)
  
  try {
    const intelligence = await enrichProspect(prospect.value.id)
    
    console.log('ProspectDetail: Received intelligence', intelligence)
    
    // Update the prospect with the new intelligence
    if (prospect.value && intelligence) {
      prospect.value.entityIntelligence = intelligence
      // Uppdatera status till Undersökt när research är klar
      if (prospect.value.status === ProspectStatusEnum.New) {
        prospect.value.status = ProspectStatusEnum.Researched
      }
      console.log('ProspectDetail: Updated prospect with intelligence data')
    }
    
    // Automatically show the modal after generation
    showEntityModal.value = true
    
    // Reload full prospect to get discovered contacts (in background to avoid full page spinner)
    await fetchProspect(true)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to enrich prospect data'
    console.error('Error enriching prospect:', err)
  } finally {
    isEnriching.value = false
  }
}

async function fetchProspect(background = false) {
  const id = route.params.id as string
  if (!id) {
    error.value = 'Inget prospect-ID angivet'
    loading.value = false
    return
  }

  try {
    if (!background) loading.value = true
    error.value = null
    prospect.value = await prospectsAPI.getById(id)
    
    console.log('ProspectDetail: Loaded prospect', {
      id: prospect.value.id,
      name: prospect.value.name,
      hasIntelligence: !!prospect.value.entityIntelligence,
      intelligenceKeys: prospect.value.entityIntelligence ? Object.keys(prospect.value.entityIntelligence) : null
    })

    const serverDraft = draftFromProspect(prospect.value)
    originalServerDraft.value = serverDraft
    
    if (serverDraft) {
      generatedEmail.value = serverDraft
      if (prospect.value) {
        storeDraft(prospect.value.id, serverDraft)
      }
    } else {
      if (prospect.value) {
        generatedEmail.value = loadDraftFromStorage(prospect.value.id)
      }
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Kunde inte ladda prospect'
    console.error('Error fetching prospect:', err)
  } finally {
    loading.value = false
  }
}

const handleGenerateEmail = async () => {
  if (!prospect.value) return
  const prospectId = prospect.value.id
  isGenerating.value = true
  try {
    const response = await prospectsAPI.generateEmailDraft(prospect.value.id, selectedEmailGeneratorType.value)
    const draft = extractEmailDraft(response)

    if (!draft) {
      throw new Error('Ingen mejltext genererades')
    }

    generatedEmail.value = draft
    prospect.value = { ...prospect.value, ...draft }
    storeDraft(prospectId, draft)
    // Återställ chat-flaggan när nytt mejl genereras
    hasUnsavedChatChanges.value = false
  } catch (err: any) {
    const message = err.response?.data?.error || err.message || 'Kunde inte generera mejl'
    alert(message)
  } finally {
    isGenerating.value = false
  }
}

const clearGeneratedEmail = () => {
  if (!prospect.value) return
  const prospectId = prospect.value.id
  clearStoredDraft(prospectId)
  generatedEmail.value = null
  originalServerDraft.value = null
  hasUnsavedChatChanges.value = false
  prospect.value = {
    ...prospect.value,
    mailTitle: undefined,
    mailBodyPlain: undefined,
    mailBodyHTML: undefined
  }
}

const resetToBackendDraft = () => {
  if (!originalServerDraft.value) return
  generatedEmail.value = originalServerDraft.value
  hasUnsavedChatChanges.value = false
  syncDraftState()
}

const saveGeneratedEmail = async () => {
  if (!prospect.value) return
  const draft = generatedEmail.value
  if (!draft) return
  
  isGenerating.value = true
  try {
    const updatePayload: Record<string, any> = {
      mailTitle: draft.mailTitle?.trim() || undefined,
      mailBodyPlain: draft.mailBodyPlain?.trim() || undefined,
      mailBodyHTML: draft.mailBodyHTML?.trim() || undefined
    }

    if (prospect.value.status === ProspectStatusEnum.Researched || prospect.value.status === ProspectStatusEnum.New) {
      updatePayload.status = ProspectStatusEnum.Drafted
    }

    const updated = await prospectsAPI.update(prospect.value.id, updatePayload)
    prospect.value = updated
    originalServerDraft.value = draftFromProspect(updated)
    generatedEmail.value = originalServerDraft.value
    storeDraft(updated.id, generatedEmail.value!)
    hasUnsavedChatChanges.value = false
  } catch (err: any) {
    const message = err.response?.data?.error || err.message || 'Kunde inte spara mejl'
    alert(message)
  } finally {
    isGenerating.value = false
  }
}

const handleSendEmail = async () => {
  if (!prospect.value) return
  // Beuser bekräfta först
  if (!confirm(`Ska vi skicka mejlet till ${prospect.value.emailAddresses[0]?.address}?`)) {
    return
  }

  isSendingEmail.value = true
  try {
    await prospectsAPI.sendEmail(prospect.value.id)
    alert('Mejl skickat via n8n!')
    
    const updated = await prospectsAPI.getById(prospect.value.id)
    prospect.value = updated
  } catch (err: any) {
    const message = err.response?.data?.error || err.message || 'Kunde inte skicka mejl'
    alert(message)
  } finally {
    isSendingEmail.value = false
  }
}

// Hantera uppdateringar från chatten
const handleEmailUpdated = (data: { mailTitle?: string; mailBodyPlain?: string; mailBodyHTML?: string }) => {
  if (!prospect.value || !data.mailBodyPlain) return
  
  // Uppdatera state med nytt innehåll från chatten
  const current = generatedEmail.value ?? {}
  const next: EmailDraft = {
    ...current,
    mailBodyPlain: data.mailBodyPlain
  }
  
  if (data.mailTitle) {
    next.mailTitle = data.mailTitle
  }
  
  // Ta bort HTML-versionen då den inte längre matchar plain text
  delete next.mailBodyHTML
  
  generatedEmail.value = next
  hasUnsavedChatChanges.value = true
  syncDraftState()
}

function openAddContactModal() {
  editingContact.value = null
  showContactModal.value = true
}

function openEditContactModal(contact: ContactPersonDto) {
  editingContact.value = contact
  showContactModal.value = true
}

async function handleSaveContact(data: CreateContactPersonRequest) {
  if (!prospect.value) return
  
  isSavingContact.value = true
  try {
     let savedContact: ContactPersonDto;
     
     if (editingContact.value) {
        // Update existing
        savedContact = await prospectsAPI.updateContact(prospect.value.id, editingContact.value.id, data)
        // Update local list
        const index = prospect.value.contactPersons?.findIndex(c => c.id === savedContact.id)
        if (index !== undefined && index !== -1 && prospect.value.contactPersons) {
           prospect.value.contactPersons[index] = savedContact
        }
     } else {
        // Create new
        savedContact = await prospectsAPI.addContact(prospect.value.id, data)
        if (!prospect.value.contactPersons) {
           prospect.value.contactPersons = []
        }
        prospect.value.contactPersons.push(savedContact)
     }
     
     showContactModal.value = false
  } catch(err: any) {
     alert('Failed to save contact: ' + (err.response?.data?.error || err.message))
  } finally {
     isSavingContact.value = false
  }
}

async function handleDeleteContact(contact: ContactPersonDto) {
   if (!prospect.value || !confirm(`Are you sure you want to delete ${contact.name}?`)) return
   
   try {
      await prospectsAPI.deleteContact(prospect.value.id, contact.id)
      // Remove from local list
      prospect.value.contactPersons = prospect.value.contactPersons?.filter(c => c.id !== contact.id)
   } catch(err: any) {
      alert('Failed to delete contact: ' + (err.response?.data?.error || err.message))
   }
}

async function handleEnrichContact(contact: ContactPersonDto) {
   if (!prospect.value) return
   
   enrichingContactId.value = contact.id
   try {
      const enriched = await prospectsAPI.enrichContact(prospect.value.id, contact.id)
      
      // Update local contact with enriched data
      const index = prospect.value.contactPersons?.findIndex(c => c.id === enriched.id)
      if (index !== undefined && index !== -1 && prospect.value.contactPersons) {
         prospect.value.contactPersons[index] = enriched
      }
      
      alert(`Successfully enriched ${contact.name}!`)
   } catch(err: any) {
      alert('Failed to enrich contact: ' + (err.response?.data?.error || err.message))
   } finally {
      enrichingContactId.value = null
   }
}

onMounted(() => {
  fetchProspect()
})
</script>
