<template>
  <div class="register-container">
    <div class="logo-header">
      <img src="/EsattoOutreachLogo2.png" alt="Esatto Outreach" class="logo-image" />
    </div>
    <div class="register-card">
      <h1>Skapa konto</h1>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="fullName">Namn (valfritt)</label>
          <input 
            id="fullName"
            v-model="fullName" 
            type="text" 
            placeholder="Ditt namn"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            required 
            placeholder="din@email.com"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            required 
            placeholder="Minst 8 tecken"
          />
          <small>Måste innehålla minst 8 tecken, en stor bokstav, en liten bokstav och en siffra</small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Bekräfta password</label>
          <input 
            id="confirmPassword"
            v-model="confirmPassword" 
            type="password" 
            required 
            placeholder="Samma som ovan"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading || !isValidForm" class="btn-primary">
          {{ loading ? 'Skapar konto...' : 'Registrera' }}
        </button>
      </form>

      <div class="login-link">
        Har du redan ett konto? <router-link to="/login">Logga in</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '../composables/useAuth';

const { register } = useAuth();

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

const isValidForm = computed(() => {
  return email.value && 
         password.value.length >= 8 && 
         password.value === confirmPassword.value;
});

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Lösenorden matchar inte';
    return;
  }

  loading.value = true;
  error.value = '';
  
  const result = await register({
    email: email.value,
    password: password.value,
    fullName: fullName.value || undefined
  });

  loading.value = false;

  if (!result.success) {
    error.value = result.error || 'Registrering misslyckades';
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  position: relative;
}

.logo-header {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}

.logo-image {
  height: 400px;
  width: auto;
  display: block;
  margin-top: -120px;
  margin-left: -70px;
}

.register-card {
  background: white;
  padding: 3rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
  border: 1px solid #f0f0f0;
}

h1 {
  text-align: center;
  margin-bottom: 2.5rem;
  color: #1a1a1a;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.form-group {
  margin-bottom: 1.75rem;
}

label {
  display: block;
  margin-bottom: 0.625rem;
  color: #1a1a1a;
  font-weight: 500;
  font-size: 0.95rem;
}

input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #fafafa;
}

input:focus {
  outline: none;
  border-color: #ffb3c8;
  background: white;
  box-shadow: 0 0 0 3px rgba(255, 179, 200, 0.15);
}

small {
  display: block;
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  border-left: 4px solid #ef5350;
  font-size: 0.9rem;
}

.btn-primary {
  width: 100%;
  padding: 1rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: none;
  letter-spacing: 0.3px;
}

.btn-primary:hover:not(:disabled) {
  background: #333;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.login-link {
  text-align: center;
  margin-top: 2rem;
  color: #666;
  font-size: 0.95rem;
}

.login-link a {
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.login-link a:hover {
  color: #ff6b9d;
  text-decoration: underline;
}
</style>
