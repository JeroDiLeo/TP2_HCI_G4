<template>
  <AuthLayout
    :hero-image="verifyHeroImage"
    hero-image-alt="Pareja cocinando juntos en una cocina moderna"
    hero-title="Un último paso para asegurar tu hogar"
    hero-subtitle="Verificamos tu cuenta para proteger el acceso a tus dispositivos y mantener segura tu casa conectada."
  >
    <div class="verify-form">

      <!-- ── Ícono ilustrativo ── -->
      <AuthIconBadge icon="mdi-email-outline" />

      <!-- ── Título ── -->
      <h1 class="verify-form__title">Verificá tu cuenta</h1>

      <!-- ── Descripción + email + link ── -->
      <div class="verify-form__desc">
        <p class="verify-form__desc-text">Te enviamos un código de verificación a</p>
        <p class="verify-form__desc-email">{{ email }}</p>
        <button
          type="button"
          class="verify-form__change-email"
          @click="router.push('/register')"
        >
          Cambiar email
        </button>
      </div>

      <!-- ── Input código ── -->
      <div class="verify-form__code-field">
        <input
          v-model="otpCode"
          type="text"
          class="verify-form__code-input"
          :class="{ 'verify-form__code-input--error': errorMessage }"
          placeholder="ej: 635cedeef22759c5"
          maxlength="16"
          autocomplete="one-time-code"
          autofocus
          spellcheck="false"
          @input="onCodeInput"
        >
      </div>

      <!-- ── Helper / Error ── -->
      <p
        class="verify-form__helper"
        :class="{ 'verify-form__helper--error': errorMessage }"
        role="alert"
        aria-live="polite"
      >
        {{ errorMessage || 'Ingresá el código de 16 caracteres que recibiste por email' }}
      </p>

      <!-- ── Botón Verificar ── -->
      <button
        type="button"
        class="verify-form__btn"
        :class="{ 'verify-form__btn--disabled': !isComplete }"
        :disabled="!isComplete"
        @click="handleVerify"
      >
        Verificar cuenta
      </button>

      <!-- ── Acciones secundarias ── -->
      <div class="verify-form__footer">
        <!-- Reenviar (acción primaria esperada) -->
        <p class="verify-form__resend-row">
          <span class="verify-form__resend-text">¿No recibiste el código?</span>
          <button
            type="button"
            class="verify-form__resend-btn"
            :class="{ 'verify-form__resend-btn--disabled': cooldown > 0 }"
            :disabled="cooldown > 0"
            @click="handleResend"
          >
            {{ cooldown > 0 ? `Reenviar (${cooldown}s)` : 'Reenviar' }}
          </button>
        </p>

        <!-- Volver al login (escape route, menos jerarquía) -->
        <button
          type="button"
          class="verify-form__back-btn"
          @click="router.push('/login')"
        >
          ← Volver a iniciar sesión
        </button>
      </div>

    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AuthIconBadge from '@/components/AuthIconBadge.vue'
import { useResendCooldown } from '@/composables/useResendCooldown'
import verifyHeroImage from '@/assets/images/verifyPhoto.jpg'
import { verifyAccount, sendVerification } from '@/services/api/userApi'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// ── Email desde query param ──
const email = ref(route.query.email || 'tu@email.com')

// ── Estado OTP ──
const otpCode = ref('')
const errorMessage = ref('')

// ── Cooldown reutilizable ──
const { cooldown, startCooldown } = useResendCooldown(30)

// ── Computadas ──
const isComplete = computed(() => /^[0-9a-fA-F]{16}$/.test(otpCode.value.trim()))

function onCodeInput() {
  errorMessage.value = ''
}

// ── Verificar ──
async function handleVerify() {
  if (!isComplete.value) {
    errorMessage.value = 'El código debe tener 16 caracteres hexadecimales.'
    return
  }
  errorMessage.value = ''
  try {
    await verifyAccount(otpCode.value)
    // Auto-login si hay credenciales guardadas del registro
    const savedPassword = sessionStorage.getItem('registerPassword')
    if (savedPassword && email.value) {
      try {
        await authStore.login({ email: email.value, password: savedPassword })
        sessionStorage.removeItem('registerPassword')
        router.push('/homes')
        return
      } catch {
        // Si falla el auto-login, ir al login manual
      }
    }
    sessionStorage.removeItem('registerPassword')
    router.push('/login')
  } catch (error) {
    if (error.status === 409) {
      // Cuenta ya verificada — ir al login directamente
      router.push('/login')
    } else if (error.status === 400) {
      errorMessage.value = 'Código incorrecto. Revisalo e intentá de nuevo.'
    } else {
      errorMessage.value = 'Ocurrió un error. Intentá de nuevo.'
    }
  }
}

// ── Reenviar ──
async function handleResend() {
  if (cooldown.value > 0) return
  try {
    await sendVerification(email.value)
    startCooldown()
    errorMessage.value = ''
  } catch (error) {
    if (error.status === 409) {
      // La cuenta ya está verificada — redirigir al login
      router.push('/login')
    } else {
      errorMessage.value = 'No se pudo reenviar el código. Intentá de nuevo.'
    }
  }
}
</script>

<style scoped>
/* ── Contenedor principal ── */
.verify-form {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  font-family: var(--sh-font);
}

/* ── Título ── */
.verify-form__title {
  font-size: 2rem;
  font-weight: 700;
  color: #0F172A;
  text-align: center;
  margin: 0;
  line-height: 1.2;
}

/* ── Descripción ── */
.verify-form__desc {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
}

.verify-form__desc-text {
  font-size: 0.95rem;
  color: #64748B;
  margin: 0;
}

.verify-form__desc-email {
  font-size: 1rem;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
}

.verify-form__change-email {
  background: none;
  border: none;
  padding: 0;
  margin-top: 0.375rem;
  cursor: pointer;
  color: #6366F1;
  font-weight: 500;
  font-size: 0.95rem;
  font-family: var(--sh-font);
  transition: color 0.15s;
}

.verify-form__change-email:hover {
  color: #4F46E5;
  text-decoration: underline;
}

.verify-form__change-email:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
  border-radius: 4px;
}

/* ── Helper / Error ── */
.verify-form__helper {
  font-size: 0.9rem;
  color: #64748B;
  text-align: center;
  margin: 0;
  margin-top: -0.5rem;
}

.verify-form__helper--error {
  color: #EF4444;
  font-weight: 500;
}

/* ── Botón verificar ── */
.verify-form__btn {
  width: 100%;
  height: 52px;
  background-color: #6366F1;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--sh-font);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.15s, opacity 0.15s, transform 0.1s;
  letter-spacing: 0.01em;
}

.verify-form__btn:hover:not(.verify-form__btn--disabled) {
  background-color: #4F46E5;
}

.verify-form__btn:active:not(.verify-form__btn--disabled) {
  transform: scale(0.99);
}

.verify-form__btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 3px;
}

.verify-form__btn--disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ── Footer ── */
.verify-form__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.verify-form__resend-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0;
}

.verify-form__resend-text {
  font-size: 0.9rem;
  color: #64748B;
}

.verify-form__resend-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #6366F1;
  font-weight: 600;
  font-size: 0.9rem;
  font-family: var(--sh-font);
  transition: color 0.15s;
}

.verify-form__resend-btn:hover:not(.verify-form__resend-btn--disabled) {
  color: #4F46E5;
  text-decoration: underline;
}

.verify-form__resend-btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
  border-radius: 4px;
}

.verify-form__resend-btn--disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.verify-form__back-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #94A3B8;
  font-size: 0.9rem;
  font-family: var(--sh-font);
  font-weight: 400;
  transition: color 0.15s;
}

.verify-form__back-btn:hover {
  color: #64748B;
}

.verify-form__back-btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
  border-radius: 4px;
}

/* ── Input código ── */
.verify-form__code-field {
  width: 100%;
}

.verify-form__code-input {
  width: 100%;
  height: 52px;
  padding: 0 1rem;
  border: 1.5px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-family: var(--sh-font);
  text-align: center;
  color: #0F172A;
  background-color: #ffffff;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.verify-form__code-input::placeholder {
  color: #94A3B8;
}

.verify-form__code-input:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.verify-form__code-input--error {
  border-color: #EF4444;
}

.verify-form__code-input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}
</style>
