<template>
  <div class="flex justify-center items-center min-h-screen bg-neutral-50 relative font-sans">
    <div class="absolute top-0 left-0 z-10">
      <img src="/EsattoOutreachLogo2.png" alt="Esatto Outreach" class="h-[400px] w-auto block -mt-[120px] -ml-[70px]" />
    </div>
    <div class="bg-white px-10 py-12 rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] w-full max-w-[420px] border border-gray-100">
      <template v-if="invalidLink">
        <h1 class="text-center mb-6 text-gray-900 text-[1.5rem] font-bold tracking-tight">Invalid or expired invite link</h1>
        <p class="text-gray-600 text-center mb-8">This invitation link is no longer valid. You can create an account or log in instead.</p>
        <div class="flex flex-col gap-3">
          <router-link
            to="/register"
            class="w-full p-4 bg-gray-900 text-white text-center rounded-lg text-[1.05rem] font-semibold no-underline hover:bg-gray-800 transition-colors"
          >
            Create account
          </router-link>
          <router-link
            to="/login"
            class="w-full p-4 border-2 border-gray-200 text-gray-900 text-center rounded-lg text-[1.05rem] font-semibold no-underline hover:border-[#ffb3c8] transition-colors"
          >
            Log in
          </router-link>
        </div>
      </template>

      <template v-else-if="validInvite">
        <h1 class="text-center mb-10 text-gray-900 text-[2.5rem] font-bold tracking-tight">Join your team</h1>
        <p class="text-center text-gray-600 mb-6">You're joining <strong class="text-gray-900">{{ companyName }}</strong></p>

        <form @submit.prevent="handleAccept">
          <div class="mb-7">
            <label for="inviteEmail" class="block mb-2.5 text-gray-900 font-medium text-[0.95rem]">Email</label>
            <input
              id="inviteEmail"
              :value="email"
              type="email"
              disabled
              class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg text-base bg-gray-100 text-gray-600 cursor-not-allowed"
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
            {{ loading ? 'Creating account...' : 'Accept invitation' }}
          </button>
        </form>
      </template>

      <template v-else>
        <p class="text-center text-gray-600">Checking invitation...</p>
      </template>

      <div v-if="validInvite || invalidLink" class="text-center mt-8 text-gray-500 text-[0.95rem]">
        Already have an account?
        <router-link to="/login" class="text-gray-900 no-underline font-semibold transition-colors hover:text-[#ff6b9d] hover:underline">
          Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { authService } from '@/services/auth';

const route = useRoute();
const { acceptInvitation } = useAuth();

const token = ref('');
const companyName = ref('');
const email = ref('');
const fullName = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);
const validInvite = ref(false);
const invalidLink = ref(false);

const isValidForm = computed(() =>
  password.value.length >= 8 && password.value === confirmPassword.value
);

onMounted(async () => {
  const t = route.query.token;
  if (!t || typeof t !== 'string') {
    invalidLink.value = true;
    return;
  }
  token.value = t;
  try {
    const data = await authService.validateInvitation(t);
    companyName.value = data.companyName;
    email.value = data.email;
    validInvite.value = true;
  } catch {
    invalidLink.value = true;
  }
});

const handleAccept = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  loading.value = true;
  error.value = '';
  const result = await acceptInvitation({
    token: token.value,
    email: email.value,
    password: password.value,
    fullName: fullName.value || undefined
  });
  loading.value = false;
  if (!result.success) {
    error.value = result.error || 'Failed to accept invitation';
  }
};
</script>
