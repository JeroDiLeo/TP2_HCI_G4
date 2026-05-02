<template>
  <AuthLayout
    :hero-image="heroImage"
    hero-image-alt="Smartphone sobre mesa de madera"
    hero-title="Recuperá el acceso de forma segura"
    hero-subtitle="Tu hogar y tus dispositivos están protegidos. Te ayudamos a volver a entrar en pocos pasos sin comprometer tu seguridad."
  >
    <div class="forgot-form">

      <!-- ══════════════════════════════════════════
           ESTADO 1: Formulario
      ══════════════════════════════════════════ -->
      <template v-if="!emailSent">

        <!-- Ícono candado -->
        <AuthIconBadge icon="mdi-lock-outline" />

        <!-- Título -->
        <h1 class="forgot-form__title">¿Olvidaste tu contraseña?</h1>

        <!-- Descripción -->
        <p class="forgot-form__desc">
          Ingresá el email asociado a tu cuenta y te enviaremos un enlace
          para crear una nueva contraseña.
        </p>

        <!-- Formulario -->
        <form
          novalidate
          class="forgot-form__fields"
          @submit.prevent="handleSubmit"
        >
          <!-- Campo email -->
          <div class="forgot-form__field">
            <label class="forgot-form__label" for="forgot-email">Email</label>
            <input
              id="forgot-email"
              v-model="email"
              type="email"
              class="forgot-form__input"
              :class="{ 'forgot-form__input--error': errorMessage }"
              placeholder="tu@email.com"
              autocomplete="email"
              @blur="validateEmail"
              @input="errorMessage = ''"
            >
            <span
              v-if="errorMessage"
              class="forgot-form__error"
              role="alert"
              aria-live="polite"
            >{{ errorMessage }}</span>
          </div>

          <!-- Botón principal -->
          <button
            type="submit"
            class="forgot-form__btn forgot-form__btn--primary"
            :disabled="loading"
          >
            {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
          </button>
        </form>

        <!-- Escape route -->
        <button
          type="button"
          class="forgot-form__back-btn"
          @click="router.push('/login')"
        >
          ← Volver a iniciar sesión
        </button>

      </template>

      <!--ESTADO 2: Éxito-->
      <template v-else>
        <div role="status" aria-live="polite" class="forgot-form__success">

          <!-- Ícono éxito (verde) -->
          <AuthIconBadge
            icon="mdi-email-check-outline"
            icon-color="#10B981"
            bg-color="rgba(16, 185, 129, 0.12)"
          />

          <!-- Título éxito -->
          <h1 class="forgot-form__title">Revisá tu email</h1>

          <!-- Descripción éxito con email destacado -->
          <p class="forgot-form__desc">
            Te enviamos un enlace de recuperación a
            <strong class="forgot-form__email-highlight">{{ email }}</strong>.
            Revisá tu bandeja de entrada y la carpeta de spam.
          </p>

          <!-- Botón primario: ingresar código -->
          <button
            type="button"
            class="forgot-form__btn forgot-form__btn--primary"
            @click="router.push({ path: '/reset-password', query: { email } })"
          >
            Ingresar código
          </button>

          <!-- Volver al login -->
          <button
            type="button"
            class="forgot-form__btn forgot-form__btn--secondary"
            @click="router.push('/login')"
          >
            Volver a iniciar sesión
          </button>

          <!-- Reenviar (mismo patrón que VerifyAccount) -->
          <p class="forgot-form__resend-row">
            <span class="forgot-form__resend-text">¿No recibiste el email?</span>
            <button
              type="button"
              class="forgot-form__resend-btn"
              :class="{ 'forgot-form__resend-btn--disabled': cooldown > 0 }"
              :disabled="cooldown > 0"
              @click="handleResend"
            >
              {{ cooldown > 0 ? `Reenviar (${cooldown}s)` : 'Reenviar' }}
            </button>
          </p>

        </div>
      </template>

    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AuthIconBadge from '@/components/AuthIconBadge.vue'
import { useResendCooldown } from '@/composables/useResendCooldown.js'
import heroImage from '@/assets/images/resetPasswordPhoto.jpg'
import { forgotPassword } from '@/services/api/userApi'

const router = useRouter()

//Estado:
const email = ref('')
const emailSent = ref(false)
const errorMessage = ref('')
const loading = ref(false)

//Cooldown reutilizable:
const { cooldown, startCooldown } = useResendCooldown(30)

//Validación de email:
const isValidEmail = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value),
)

function validateEmail() {
  if (!email.value.trim()) {
    errorMessage.value = 'El email es requerido.'
  } else if (!isValidEmail.value) {
    errorMessage.value = 'Ingresá un email válido.'
  } else {
    errorMessage.value = ''
  }
}

//Submit:
async function handleSubmit() {
  validateEmail()
  if (errorMessage.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    await forgotPassword(email.value)
    emailSent.value = true
    startCooldown()
  } catch (error) {
    if (error.status === 404) {
      errorMessage.value = 'No existe una cuenta con ese email.'
    } else if (error.status === 400) {
      errorMessage.value = error.message || 'Email inválido.'
    } else {
      errorMessage.value = 'Ocurrió un error inesperado. Intentá de nuevo.'
    }
  } finally {
    loading.value = false
  }
}

//Reenviar:
async function handleResend() {
  if (cooldown.value > 0) return
  try {
    await forgotPassword(email.value)
    startCooldown()
    errorMessage.value = ''
  } catch (error) {
    if (error.status === 404) {
      errorMessage.value = 'No existe una cuenta con ese email.'
    } else {
      errorMessage.value = 'No se pudo reenviar. Intentá de nuevo.'
    }
  }
}
</script>

<style scoped>
/*Contenedor principal*/
.forgot-form {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  font-family: 'Inter', sans-serif;
}

/*Bloque de éxito (mismo flex layout)*/
.forgot-form__success {
  display: contents; /* hereda el flex del padre, no agrega capa extra */
}

/*Título*/
.forgot-form__title {
  font-size: 2rem;
  font-weight: 700;
  color: #0F172A;
  text-align: center;
  margin: 0;
  line-height: 1.2;
}

/*Descripción*/
.forgot-form__desc {
  font-size: 0.95rem;
  color: #64748B;
  text-align: center;
  line-height: 1.6;
  margin: 0;
  text-wrap: balance;
}

.forgot-form__email-highlight {
  color: #0F172A;
  font-weight: 600;
}

/*Campos del formulario*/
.forgot-form__fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

/*Campo*/
.forgot-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

/*Label*/
.forgot-form__label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0F172A;
  text-align: left;
}

/*Input*/
.forgot-form__input {
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

.forgot-form__input::placeholder {
  color: #94A3B8;
}

.forgot-form__input:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.forgot-form__input--error {
  border-color: #EF4444;
}

.forgot-form__input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}

/*Error*/
.forgot-form__error {
  font-size: 0.8rem;
  color: #EF4444;
}

/*Botones*/
.forgot-form__btn {
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

.forgot-form__btn:active {
  transform: scale(0.99);
}

.forgot-form__btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 3px;
}

.forgot-form__btn--primary {
  background-color: #6366F1;
  color: #ffffff;
}

.forgot-form__btn--primary:hover {
  background-color: #4F46E5;
}

.forgot-form__btn--secondary {
  background-color: #ffffff;
  color: #6366F1;
  border: 1.5px solid #6366F1;
}

.forgot-form__btn--secondary:hover {
  background-color: #EEF2FF;
}

/*Link volver (escape route, gris, menor jerarquía)*/
.forgot-form__back-btn {
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

.forgot-form__back-btn:hover {
  color: #64748B;
}

.forgot-form__back-btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
  border-radius: 4px;
}

/*Reenviar (estado éxito)*/
.forgot-form__resend-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0;
}

.forgot-form__resend-text {
  font-size: 0.9rem;
  color: #64748B;
}

/* "Reenviar" en violeta: acción esperada en estado éxito */
.forgot-form__resend-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #6366F1;
  font-weight: 600;
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  transition: color 0.15s;
}

.forgot-form__resend-btn:hover:not(.forgot-form__resend-btn--disabled) {
  color: #4F46E5;
  text-decoration: underline;
}

.forgot-form__resend-btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
  border-radius: 4px;
}

.forgot-form__resend-btn--disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
