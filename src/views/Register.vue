<template>
  <div class="register-container">
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

small {
  display: block;
  margin-top: 0.25rem;
  color: #888;
  font-size: 0.875rem;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
