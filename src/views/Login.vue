<template>
  <div class="login-container">
    <div class="logo-header">
      <img src="/EsattoOutreachLogo2.png" alt="Esatto Outreach" class="logo-image" />
    </div>
    <div class="login-card">
      <h1>Login</h1>
      <form @submit.prevent="handleLogin">
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
            placeholder="********"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Loggar in...' : 'Logga in' }}
        </button>
      </form>

      <div class="register-link">
        Har du inget konto? <router-link to="/register">Registrera dig</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const { login } = useAuth();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  const result = await login({
    email: email.value,
    password: password.value
  });

  loading.value = false;

  if (!result.success) {
    error.value = result.error || 'Inloggning misslyckades';
  }
};
</script>

<style scoped>
.login-container {
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

.login-card {
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

.register-link {
  text-align: center;
  margin-top: 2rem;
  color: #666;
  font-size: 0.95rem;
}

.register-link a {
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.register-link a:hover {
  color: #ff6b9d;
  text-decoration: underline;
}
</style>
