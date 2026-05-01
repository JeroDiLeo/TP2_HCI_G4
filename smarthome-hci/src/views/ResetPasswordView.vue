<template>
  <AuthLayout
    :hero-image="heroImage"
    hero-image-alt="Smartphone con aplicación de hogar inteligente"
    hero-title="Casi listo para volver a entrar"
    hero-subtitle="Ingresá el código que recibiste y elegí una contraseña nueva para recuperar el acceso."
  >
    <div class="reset-form">

      <AuthIconBadge icon="mdi-lock-reset" />

      <h1 class="reset-form__title">Crear nueva contraseña</h1>
      <p class="reset-form__desc">
        Pegá el código que recibiste por email y elegí tu nueva contraseña.
        <strong v-if="email" class="reset-form__email-highlight">{{ email }}</strong>
      </p>

      <form
        novalidate
        class="reset-form__fields"
        @submit.prevent="handleSubmit"
      >

        <!-- Código -->
        <div class="reset-form__field">
          <label class="reset-form__label" for="reset-code">Código de recuperación</label>
          <input
            id="reset-code"
            v-model="code"
            type="text"
            class="reset-form__input"
            :class="{ 'reset-form__input--error': errors.code }"
            placeholder="Pegá aquí el código recibido"
            autocomplete="one-time-code"
            spellcheck="false"
            @blur="validateCode"
            @input="errors.code = ''"
          >
          <span
            v-if="errors.code"
            class="reset-form__error"
            role="alert"
            aria-live="polite"
          >{{ errors.code }}</span>
        </div>

        <!-- Nueva contraseña -->
        <div class="reset-form__field">
          <label class="reset-form__label" for="reset-password">Nueva contraseña</label>
          <input
            id="reset-password"
            v-model="password"
            type="password"
            class="reset-form__input"
            :class="{ 'reset-form__input--error': errors.password }"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            @blur="validatePassword"
            @input="errors.password = ''"
          >
          <span
            v-if="errors.password"
            class="reset-form__error"
            role="alert"
            aria-live="polite"
          >{{ errors.password }}</span>
        </div>

        <!-- Confirmar contraseña -->
        <div class="reset-form__field">
          <label class="reset-form__label" for="reset-confirm">Confirmar contraseña</label>
          <input
            id="reset-confirm"
            v-model="confirmPassword"
            type="password"
            class="reset-form__input"
            :class="{ 'reset-form__input--error': errors.confirm }"
            placeholder="Repetí la contraseña"
            autocomplete="new-password"
            @blur="validateConfirm"
            @input="errors.confirm = ''"
          >
          <span
            v-if="errors.confirm"
            class="reset-form__error"
            role="alert"
            aria-live="polite"
          >{{ errors.confirm }}</span>
        </div>

        <!-- Error de API -->
        <span
          v-if="apiError"
          class="reset-form__error"
          role="alert"
          aria-live="polite"
        >{{ apiError }}</span>

        <!-- Botón principal -->
        <button
          type="submit"
          class="reset-form__btn reset-form__btn--primary"
          :disabled="loading"
        >
          {{ loading ? 'Guardando...' : 'Crear nueva contraseña' }}
        </button>

      </form>

      <button
        type="button"
        class="reset-form__back-btn"
        @click="router.push('/login')"
      >
        ← Volver a iniciar sesión
      </button>

    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AuthIconBadge from '@/components/AuthIconBadge.vue'
import heroImage from '@/assets/images/resetPasswordPhoto.jpg'
import { resetPassword } from '@/services/api/userApi'

const router = useRouter()
const route = useRoute()

const email = route.query.email || ''

const code = ref('')
const password = ref('')
const confirmPassword = ref('')
const apiError = ref('')
const loading = ref(false)

const errors = reactive({
  code: '',
  password: '',
  confirm: '',
})

function validateCode() {
  if (!code.value.trim()) {
    errors.code = 'El código es requerido.'
  } else {
    errors.code = ''
  }
}

function validatePassword() {
  if (!password.value) {
    errors.password = 'La contraseña es requerida.'
  } else if (password.value.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.'
  } else {
    errors.password = ''
  }
}

function validateConfirm() {
  if (!confirmPassword.value) {
    errors.confirm = 'Confirmá la contraseña.'
  } else if (confirmPassword.value !== password.value) {
    errors.confirm = 'Las contraseñas no coinciden.'
  } else {
    errors.confirm = ''
  }
}

function isFormValid() {
  validateCode()
  validatePassword()
  validateConfirm()
  return !errors.code && !errors.password && !errors.confirm
}

async function handleSubmit() {
  if (!isFormValid()) return

  apiError.value = ''
  loading.value = true
  try {
    await resetPassword({ code: code.value.trim(), password: password.value })
    router.push('/login')
  } catch (error) {
    if (error.status === 400) {
      apiError.value = error.message || 'Datos inválidos. Revisá los campos.'
    } else if (error.status === 404) {
      apiError.value = 'Código inválido o expirado. Solicitá uno nuevo.'
    } else {
      apiError.value = 'Ocurrió un error inesperado. Intentá de nuevo.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-form {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  font-family: 'Inter', sans-serif;
}

.reset-form__title {
  font-size: 2rem;
  font-weight: 700;
  color: #0F172A;
  text-align: center;
  margin: 0;
  line-height: 1.2;
}

.reset-form__desc {
  font-size: 0.95rem;
  color: #64748B;
  text-align: center;
  line-height: 1.6;
  margin: 0;
  text-wrap: balance;
}

.reset-form__email-highlight {
  color: #0F172A;
  font-weight: 600;
}

.reset-form__fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.reset-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.reset-form__label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0F172A;
  text-align: left;
}

.reset-form__input {
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

.reset-form__input::placeholder {
  color: #94A3B8;
}

.reset-form__input:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.reset-form__input--error {
  border-color: #EF4444;
}

.reset-form__input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}

.reset-form__error {
  font-size: 0.8rem;
  color: #EF4444;
}

.reset-form__btn {
  width: 100%;
  height: 52px;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background-color 0.15s, transform 0.1s;
  letter-spacing: 0.01em;
  border: none;
}

.reset-form__btn:active {
  transform: scale(0.99);
}

.reset-form__btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 3px;
}

.reset-form__btn--primary {
  background-color: #6366F1;
  color: #ffffff;
}

.reset-form__btn--primary:hover:not(:disabled) {
  background-color: #4F46E5;
}

.reset-form__btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-form__back-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #94A3B8;
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  transition: color 0.15s;
  margin-top: -0.5rem;
}

.reset-form__back-btn:hover {
  color: #64748B;
}

.reset-form__back-btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
