<template>
  <AuthLayout>
    <!-- ── Formulario de login ── -->
    <form
      class="login-form"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <!-- Título -->
      <h1 class="login-form__title">Iniciá sesión</h1>

      <!-- Subtítulo con link a registro -->
      <p class="login-form__subtitle">
        ¿No tenés cuenta?
        <button
          type="button"
          class="login-form__link"
          @click="router.push('/register')"
        >
          Registrate
        </button>
      </p>

      <!-- ── Campo Email ── -->
      <div class="login-form__field">
        <label class="login-form__label" for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="login-form__input"
          :class="{ 'login-form__input--error': errors.email }"
          placeholder="tu@email.com"
          autocomplete="email"
          @blur="validateEmail"
        >
        <span
          v-if="errors.email"
          class="login-form__error"
          role="alert"
        >
          {{ errors.email }}
        </span>
      </div>

      <!-- ── Campo Contraseña ── -->
      <div class="login-form__field">
        <!-- Label + link "¿Olvidaste?" en la misma línea -->
        <div class="login-form__label-row">
          <label class="login-form__label" for="password">Contraseña</label>
          <button
            type="button"
            class="login-form__link login-form__link--small"
            @click="router.push('/forgot-password')"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <!-- ── Input con botón de visibilidad ── -->
        <div class="login-form__input-wrapper">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="login-form__input login-form__input--password"
            :class="{ 'login-form__input--error': errors.password }"
            placeholder="••••••••"
            autocomplete="current-password"
            @blur="validatePassword"
          >
          <button
            type="button"
            class="login-form__eye-btn"
            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            @click="showPassword = !showPassword"
          >
            <v-icon :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" size="20" />
          </button>
        </div>

        <span
          v-if="errors.password"
          class="login-form__error"
          role="alert"
        >
          {{ errors.password }}
        </span>
      </div>

      <!-- ── Botón Ingresar ── -->
      <button
        type="submit"
        class="login-form__submit-btn"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Ingresando...' : 'Ingresar' }}
      </button>

    </form>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = useRouter()

// ── Estado del formulario ──
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)

const errors = reactive({
  email: '',
  password: '',
})

// ── Validaciones ──
function validateEmail() {
  if (!email.value.trim()) {
    errors.email = 'El email es requerido.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Ingresá un email válido.'
  } else {
    errors.email = ''
  }
}

function validatePassword() {
  if (!password.value) {
    errors.password = 'La contraseña es requerida.'
  } else if (password.value.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres.'
  } else {
    errors.password = ''
  }
}

function isFormValid() {
  validateEmail()
  validatePassword()
  return !errors.email && !errors.password
}

// ── Submit ──
async function handleSubmit() {
  if (!isFormValid()) return

  isSubmitting.value = true

  // Simulación: en próximas iteraciones se conecta con la API
  console.log('Login attempt', { email: email.value, password: password.value })

  // Placeholder: navegar a home
  router.push('/home')

  isSubmitting.value = false
}
</script>

<style scoped>
/* ── Contenedor principal del formulario ── */
.login-form {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Inter', sans-serif;
}

/* ── Título ── */
.login-form__title {
  font-size: 2rem;
  font-weight: 700;
  color: #0F172A;
  text-align: center;
  margin: 0;
  line-height: 1.2;
}

/* ── Subtítulo ── */
.login-form__subtitle {
  font-size: 0.95rem;
  color: #64748B;
  text-align: center;
  margin: 0;
}

/* ── Links (registro, olvidé contraseña) ── */
.login-form__link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #6366F1;
  font-weight: 700;
  font-size: inherit;
  font-family: inherit;
  text-decoration: none;
  transition: color 0.15s;
}

.login-form__link:hover {
  color: #4F46E5;
  text-decoration: underline;
}

.login-form__link--small {
  font-size: 0.875rem;
  font-weight: 500;
}

/* ── Campo ── */
.login-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

/* ── Fila label + link ── */
.login-form__label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ── Label ── */
.login-form__label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0F172A;
}

/* ── Input base ── */
.login-form__input {
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border: 1.5px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  color: #0F172A;
  background-color: #ffffff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}

.login-form__input::placeholder {
  color: #94A3B8;
}

.login-form__input:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.login-form__input--error {
  border-color: #EF4444;
}

.login-form__input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}

/* ── Input con ícono de ojo ── */
.login-form__input-wrapper {
  position: relative;
}

.login-form__input--password {
  padding-right: 3rem;
}

.login-form__eye-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94A3B8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.15s;
}

.login-form__eye-btn:hover {
  color: #6366F1;
}

.login-form__eye-btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
}

/* ── Mensaje de error ── */
.login-form__error {
  font-size: 0.8rem;
  color: #EF4444;
}

/* ── Botón principal ── */
.login-form__submit-btn {
  width: 100%;
  height: 50px;
  background-color: #6366F1;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.15s, transform 0.1s;
  letter-spacing: 0.01em;
}

.login-form__submit-btn:hover:not(:disabled) {
  background-color: #4F46E5;
}

.login-form__submit-btn:active:not(:disabled) {
  transform: scale(0.99);
}

.login-form__submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-form__submit-btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 3px;
}

/* ── Texto legal ── */
.login-form__legal {
  font-size: 0.85rem;
  color: #94A3B8;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.login-form__legal-link {
  color: #94A3B8;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.login-form__legal-link:hover {
  color: #64748B;
}
</style>
