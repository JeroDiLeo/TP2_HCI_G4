<template>
  <AuthLayout
    :hero-image="registerHeroImage"
    hero-image-alt="Cerradura inteligente controlada desde una app móvil"
    hero-title="Tu casa, siempre a un toque de distancia"
    hero-subtitle="Controlá luces, clima, persianas y rutinas desde un solo lugar."
  >
    <div class="register-form">

      <!-- ── Stepper ── -->
      <Stepper
        :steps="['Datos personales', 'Contraseña']"
        :current-step="currentStep"
      />

      <!-- ── Título y subtítulo ── -->
      <div class="register-form__header">
        <h1 class="register-form__title">Creá tu cuenta</h1>
        <p class="register-form__subtitle">
          {{ currentStep === 1 ? 'Ingresá tus datos para empezar' : 'Elegí una contraseña segura' }}
        </p>
      </div>

      <!-- ── Formulario (un único <form>, campos condicionales por paso) ── -->
      <form
        novalidate
        class="register-form__fields"
        @submit.prevent="handleSubmit"
      >

        <!-- ────────────── PASO 1: Datos personales ────────────── -->
        <template v-if="currentStep === 1">

          <!-- Nombre completo -->
          <div class="register-form__field">
            <label class="register-form__label" for="nombre-completo">
              Nombre completo
            </label>
            <input
              id="nombre-completo"
              v-model="formData.nombreCompleto"
              type="text"
              class="register-form__input"
              :class="{ 'register-form__input--error': errors.nombreCompleto }"
              placeholder="Ingresá tu nombre completo"
              autocomplete="name"
              @blur="validateNombre"
            >
            <span
              v-if="errors.nombreCompleto"
              class="register-form__error"
              role="alert"
              aria-live="polite"
            >{{ errors.nombreCompleto }}</span>
          </div>

          <!-- Email -->
          <div class="register-form__field">
            <label class="register-form__label" for="email">
              Email
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="register-form__input"
              :class="{ 'register-form__input--error': errors.email }"
              placeholder="tu@email.com"
              autocomplete="email"
              @blur="validateEmail"
            >
            <span
              v-if="errors.email"
              class="register-form__error"
              role="alert"
              aria-live="polite"
            >{{ errors.email }}</span>
          </div>

          <!-- Botón Continuar -->
          <button
            type="submit"
            class="register-form__btn register-form__btn--primary register-form__btn--full"
          >
            Continuar
          </button>

        </template>

        <!-- ── Paso 2: Contraseña ── -->
        <template v-if="currentStep === 2">

          <!-- Contraseña -->
          <div class="register-form__field">
            <label class="register-form__label" for="password">
              Contraseña
            </label>
            <div class="register-form__input-wrapper">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="register-form__input register-form__input--password"
                :class="{ 'register-form__input--error': errors.password }"
                placeholder="Mínimo 8 caracteres"
                autocomplete="new-password"
                @blur="validatePassword"
              >
              <button
                type="button"
                class="register-form__eye-btn"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <v-icon :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" size="20" />
              </button>
            </div>
            <span
              v-if="errors.password"
              class="register-form__error"
              role="alert"
              aria-live="polite"
            >{{ errors.password }}</span>

            <!-- Indicador de fortaleza -->
            <div v-if="formData.password" class="register-form__strength">
              <div class="register-form__strength-bars">
                <div
                  v-for="i in 3"
                  :key="i"
                  class="register-form__strength-bar"
                  :style="passwordStrength >= i ? { backgroundColor: strengthColor } : {}"
                />
              </div>
              <span class="register-form__strength-text" :style="{ color: strengthColor }">
                {{ strengthLabel }}
              </span>
            </div>
          </div>

          <!-- Confirmar contraseña -->
          <div class="register-form__field">
            <label class="register-form__label" for="confirm-password">
              Confirmar contraseña
            </label>
            <div class="register-form__input-wrapper">
              <input
                id="confirm-password"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="register-form__input register-form__input--password"
                :class="{ 'register-form__input--error': errors.confirmPassword }"
                placeholder="Repetí la contraseña"
                autocomplete="new-password"
                @blur="validateConfirmPassword"
              >
              <button
                type="button"
                class="register-form__eye-btn"
                :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <v-icon :icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'" size="20" />
              </button>
            </div>
            <span
              v-if="errors.confirmPassword"
              class="register-form__error"
              role="alert"
              aria-live="polite"
            >{{ errors.confirmPassword }}</span>
          </div>

          <!-- Error de API -->
          <span
            v-if="apiError"
            class="register-form__error"
            role="alert"
            aria-live="polite"
          >{{ apiError }}</span>

          <!-- Botones Volver / Crear cuenta -->
          <div class="register-form__btn-row">
            <button
              type="button"
              class="register-form__btn register-form__btn--secondary"
              :disabled="loading"
              @click="currentStep = 1"
            >
              Volver
            </button>
            <button
              type="submit"
              class="register-form__btn register-form__btn--primary register-form__btn--grow"
              :disabled="loading"
            >
              {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </div>

        </template>

      </form>

      <!-- ── Footer link ── -->
      <p class="register-form__footer">
        ¿Ya tenés cuenta?
        <button
          type="button"
          class="register-form__link"
          @click="router.push('/login')"
        >
          Iniciá sesión
        </button>
      </p>

    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Stepper from '@/components/Stepper.vue'
import registerHeroImage from '@/assets/images/RegisterPhoto.jpg'
import { registerUser } from '@/services/api/userApi'

const router = useRouter()

// ── Estado del stepper ──
const currentStep = ref(1)

// ── Datos del formulario (persisten al volver entre pasos) ──
const formData = reactive({
  nombreCompleto: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// ── Errores ──
const errors = reactive({
  nombreCompleto: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// ── Estado de la petición ──
const loading = ref(false)
const apiError = ref('')

// ── Visibilidad de contraseñas ──
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// ── Fortaleza de contraseña ──
const passwordStrength = computed(() => {
  const p = formData.password
  if (!p) return 0
  if (p.length < 8) return 1
  let score = 1
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthColor = computed(() => {
  const colors = { 1: '#EF4444', 2: '#F59E0B', 3: '#22C55E' }
  return colors[passwordStrength.value] || '#E2E8F0'
})

const strengthLabel = computed(() => {
  const labels = { 1: 'Débil', 2: 'Media', 3: 'Fuerte' }
  return labels[passwordStrength.value] || ''
})

// ── Validaciones ──
function validateNombre() {
  const v = formData.nombreCompleto.trim()
  if (!v) {
    errors.nombreCompleto = 'El nombre es requerido.'
  } else if (v.length < 2) {
    errors.nombreCompleto = 'El nombre debe tener al menos 2 caracteres.'
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(v)) {
    errors.nombreCompleto = 'Solo se permiten letras y espacios.'
  } else {
    errors.nombreCompleto = ''
  }
}

function validateEmail() {
  if (!formData.email.trim()) {
    errors.email = 'El email es requerido.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Ingresá un email válido.'
  } else {
    errors.email = ''
  }
}

function validatePassword() {
  if (!formData.password) {
    errors.password = 'La contraseña es requerida.'
  } else if (formData.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.'
  } else {
    errors.password = ''
  }
}

function validateConfirmPassword() {
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Confirmá la contraseña.'
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  } else {
    errors.confirmPassword = ''
  }
}

function isStep1Valid() {
  validateNombre()
  validateEmail()
  return !errors.nombreCompleto && !errors.email
}

function isStep2Valid() {
  validatePassword()
  validateConfirmPassword()
  return !errors.password && !errors.confirmPassword
}

// ── Submit ──
async function handleSubmit() {
  if (currentStep.value === 1) {
    if (isStep1Valid()) currentStep.value = 2
  } else if (currentStep.value === 2) {
    if (!isStep2Valid()) return
    apiError.value = ''
    loading.value = true
    try {
      await registerUser({
        email: formData.email,
        password: formData.password,
        name: formData.nombreCompleto,
        metadata: {},
      })
      router.push({ path: '/verify-account', query: { email: formData.email } })
    } catch (error) {
      if (error.status === 409) {
        apiError.value = 'Este email ya está registrado. Intentá con otro.'
      } else if (error.status === 400) {
        apiError.value = error.message || 'Datos inválidos. Revisá los campos.'
      } else {
        apiError.value = 'Ocurrió un error inesperado. Intentá de nuevo.'
      }
    } finally {
      loading.value = false
    }
  }
}
</script>

<style scoped>
/* ── Contenedor principal ── */
.register-form {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Inter', sans-serif;
}

/* ── Encabezado ── */
.register-form__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.register-form__title {
  font-size: 2rem;
  font-weight: 700;
  color: #0F172A;
  text-align: center;
  margin: 0;
  line-height: 1.2;
}

.register-form__subtitle {
  font-size: 0.95rem;
  color: #64748B;
  text-align: center;
  margin: 0;
}

/* ── Campos del formulario ── */
.register-form__fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Campo individual ── */
.register-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

/* ── Label ── */
.register-form__label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0F172A;
}

/* ── Input base ── */
.register-form__input {
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

.register-form__input::placeholder {
  color: #94A3B8;
}

.register-form__input:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.register-form__input--error {
  border-color: #EF4444;
}

.register-form__input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}

/* ── Input con ícono de ojo ── */
.register-form__input-wrapper {
  position: relative;
}

.register-form__input--password {
  padding-right: 3rem;
}

.register-form__eye-btn {
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

.register-form__eye-btn:hover {
  color: #6366F1;
}

.register-form__eye-btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
}

/* ── Mensaje de error ── */
.register-form__error {
  font-size: 0.8rem;
  color: #EF4444;
}

/* ── Indicador de fortaleza ── */
.register-form__strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.125rem;
}

.register-form__strength-bars {
  display: flex;
  gap: 0.3rem;
  flex: 1;
}

.register-form__strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background-color: #E2E8F0;
  transition: background-color 0.25s ease;
}

.register-form__strength-text {
  font-size: 0.78rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  transition: color 0.25s ease;
}

/* ── Botones ── */
.register-form__btn {
  height: 52px;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background-color 0.15s, transform 0.1s;
  letter-spacing: 0.01em;
}

.register-form__btn:active {
  transform: scale(0.99);
}

.register-form__btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 3px;
}

/* Primario */
.register-form__btn--primary {
  background-color: #6366F1;
  color: #ffffff;
  border: 2px solid #6366F1;
}

.register-form__btn--primary:hover {
  background-color: #4F46E5;
  border-color: #4F46E5;
}

/* Secundario */
.register-form__btn--secondary {
  background-color: #ffffff;
  color: #6366F1;
  border: 2px solid #6366F1;
}

.register-form__btn--secondary:hover {
  background-color: #F5F3FF;
}

/* Ancho completo */
.register-form__btn--full {
  width: 100%;
}

/* Crece para llenar el espacio disponible */
.register-form__btn--grow {
  flex: 1;
}

/* ── Fila de dos botones (paso 2) ── */
.register-form__btn-row {
  display: flex;
  gap: 0.75rem;
}

.register-form__btn-row .register-form__btn--secondary {
  flex: 0 0 34%;
}

/* ── Footer link ── */
.register-form__footer {
  font-size: 0.95rem;
  color: #64748B;
  text-align: center;
  margin: 0;
}

.register-form__link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #6366F1;
  font-weight: 700;
  font-size: inherit;
  font-family: inherit;
  transition: color 0.15s;
}

.register-form__link:hover {
  color: #4F46E5;
  text-decoration: underline;
}

/* ── Responsive mobile ── */
@media (max-width: 767px) {
  /* En mobile: botones apilados, "Crear cuenta" arriba */
  .register-form__btn-row {
    flex-direction: column-reverse;
  }

  .register-form__btn-row .register-form__btn--secondary,
  .register-form__btn-row .register-form__btn--grow {
    flex: none;
    width: 100%;
  }
}
</style>
