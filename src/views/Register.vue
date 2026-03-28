<template>
  <div class="flex justify-center items-center min-h-screen bg-neutral-50 relative font-sans">
    <div class="absolute top-0 left-0 z-10">
      <img src="/EsattoOutreachLogo2.png" alt="Esatto Outreach" class="h-[400px] w-auto block -mt-[120px] -ml-[70px]" />
    </div>
    <div class="bg-white px-10 py-12 rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] w-full max-w-[420px] border border-gray-100">
      <h1 class="text-center mb-10 text-gray-900 text-[2.5rem] font-bold tracking-tight">Create account</h1>
      <form @submit.prevent="handleRegister">
        <div class="mb-7">
          <label for="companyName" class="block mb-2.5 text-gray-900 font-medium text-[0.95rem]">Company name</label>
          <input 
            id="companyName"
            v-model="companyName" 
            type="text" 
            required 
            placeholder="Your company name"
            class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg text-base transition-all bg-neutral-50 focus:outline-none focus:border-[#ffb3c8] focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,179,200,0.15)]"
          />
        </div>

        <div class="mb-7">
          <label for="fullName" class="block mb-2.5 text-gray-900 font-medium text-[0.95rem]">Your name (optional)</label>
          <input 
            id="fullName"
            v-model="fullName" 
            type="text" 
            placeholder="Your name"
            class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg text-base transition-all bg-neutral-50 focus:outline-none focus:border-[#ffb3c8] focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,179,200,0.15)]"
          />
        </div>

        <div class="mb-7">
          <label for="email" class="block mb-2.5 text-gray-900 font-medium text-[0.95rem]">Email</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            required 
            placeholder="your@email.com"
            class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg text-base transition-all bg-neutral-50 focus:outline-none focus:border-[#ffb3c8] focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,179,200,0.15)]"
          />
        </div>
        
        <div class="mb-7">
          <label for="password" class="block mb-2.5 text-gray-900 font-medium text-[0.95rem]">Password</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            required 
            placeholder="At least 8 characters"
            class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg text-base transition-all bg-neutral-50 focus:outline-none focus:border-[#ffb3c8] focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,179,200,0.15)]"
          />
          <small class="block mt-2 text-gray-500 text-[0.85rem] leading-snug">Must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number</small>
        </div>

        <div class="mb-7">
          <label for="confirmPassword" class="block mb-2.5 text-gray-900 font-medium text-[0.95rem]">Confirm password</label>
          <input 
            id="confirmPassword"
            v-model="confirmPassword" 
            type="password" 
            required 
            placeholder="Same as above"
            class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg text-base transition-all bg-neutral-50 focus:outline-none focus:border-[#ffb3c8] focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,179,200,0.15)]"
          />
        </div>

        <div v-if="error" class="bg-red-50 text-red-800 p-4 rounded-lg mb-5 border-l-4 border-red-500 text-[0.9rem]">
          {{ error }}
        </div>

        <button 
          type="submit" 
          :disabled="loading || !isValidForm" 
          class="w-full p-4 bg-gray-900 text-white border-none rounded-lg text-[1.05rem] font-semibold cursor-pointer transition-all tracking-wide hover:bg-gray-800 hover:-translate-y-px hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <div class="text-center mt-8 text-gray-500 text-[0.95rem]">
        Already have an account? 
        <router-link to="/login" class="text-gray-900 no-underline font-semibold transition-colors hover:text-[#ff6b9d] hover:underline">
          Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { register } = useAuth();

const companyName = ref('');
const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

const isValidForm = computed(() => {
  return companyName.value.trim() &&
         email.value && 
         password.value.length >= 8 && 
         password.value === confirmPassword.value;
});

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  loading.value = true;
  error.value = '';
  
  const result = await register({
    email: email.value,
    password: password.value,
    fullName: fullName.value || undefined,
    companyName: companyName.value.trim()
  });

  loading.value = false;

  if (!result.success) {
    error.value = result.error || 'Registration failed';
  }
};
</script>
