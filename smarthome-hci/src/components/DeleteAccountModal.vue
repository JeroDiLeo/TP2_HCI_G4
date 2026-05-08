<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content modal-delete">
        <div class="modal-header modal-header--danger">
          <div class="modal-header__icon">
            <i class="mdi mdi-alert-circle"></i>
          </div>
          <div>
            <h2>Eliminar cuenta</h2>
            <p class="modal-header__subtitle">Esta acción no se puede deshacer</p>
          </div>
          <button class="modal-close" @click="close" aria-label="Cerrar">
            <i class="mdi mdi-close"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <!-- Advertencias -->
          <div class="warning-section">
            <div class="warning-item">
              <i class="mdi mdi-information"></i>
              <span>Se eliminarán todos tus datos personales</span>
            </div>
            <div class="warning-item">
              <i class="mdi mdi-information"></i>
              <span>Se cancelarán todos tus dispositivos y automatizaciones</span>
            </div>
            <div class="warning-item">
              <i class="mdi mdi-information"></i>
              <span>No podrás recuperar tu cuenta después de esto</span>
            </div>
          </div>

          <!-- Checkbox de confirmación -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                v-model="hasConfirmed"
                type="checkbox"
                required
              />
              <span>Entiendo que se eliminarán todos mis datos permanentemente</span>
            </label>
          </div>

          <!-- Campo de contraseña -->
          <div v-if="hasConfirmed" class="form-group password-section">
            <label for="delete-password">
              Ingresa tu contraseña para confirmar
            </label>
            <div class="password-input-wrapper">
              <input
                id="delete-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Tu contraseña"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar' : 'Mostrar'"
              >
                <i :class="['mdi', showPassword ? 'mdi-eye-off' : 'mdi-eye']"></i>
              </button>
            </div>
          </div>

          <!-- Mensaje de error -->
          <div v-if="error" class="form-error">
            <i class="mdi mdi-alert-circle"></i>
            <span>{{ error }}</span>
          </div>

          <!-- Acciones -->
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="close">
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-danger"
              :disabled="!hasConfirmed || isLoading"
            >
              <span v-if="!isLoading">Eliminar mi cuenta</span>
              <span v-else>
                <i class="mdi mdi-loading spin"></i> Procesando...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const isLoading = ref(false)
const error = ref('')
const hasConfirmed = ref(false)
const password = ref('')
const showPassword = ref(false)

let resolveCallback = null

const open = () => {
  isOpen.value = true
  error.value = ''
  hasConfirmed.value = false
  password.value = ''
  showPassword.value = false
}

const close = () => {
  isOpen.value = false
  if (resolveCallback) {
    resolveCallback(null)
    resolveCallback = null
  }
}

const handleSubmit = async () => {
  error.value = ''

  if (!password.value) {
    error.value = 'Debes ingresar tu contraseña'
    return
  }

  isLoading.value = true

  try {
    if (resolveCallback) {
      resolveCallback({ password: password.value })
      resolveCallback = null
    }
    isOpen.value = false
  } finally {
    isLoading.value = false
  }
}

const showModal = () => {
  return new Promise((resolve) => {
    resolveCallback = resolve
    open()
  })
}

defineExpose({
  showModal,
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header--danger {
  background: #fef2f2;
  border-bottom-color: #fecaca;
}

.modal-header__icon {
  font-size: 24px;
  color: #dc2626;
  margin-top: 2px;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.modal-header__subtitle {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
  font-weight: 500;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #94a3b8;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  margin-left: auto;
  flex-shrink: 0;
}

.modal-close:hover {
  color: #0f172a;
}

.modal-form {
  padding: 24px;
}

.warning-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #fef2f2;
  border-radius: 8px;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #991b1b;
}

.warning-item i {
  font-size: 16px;
  flex-shrink: 0;
}

.form-group {
  margin-bottom: 20px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #0f172a;
}

.checkbox-group input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-group input:checked {
  accent-color: #dc2626;
}

.password-section label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.password-input-wrapper input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 18px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #0f172a;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  margin-bottom: 24px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
}

.form-error i {
  font-size: 16px;
  flex-shrink: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary,
.btn-danger {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-secondary {
  background: white;
  color: #0f172a;
  border: 1px solid #cbd5e1;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .modal-content {
    max-width: 90%;
    margin: 16px;
  }

  .modal-header,
  .modal-form {
    padding: 16px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-danger {
    width: 100%;
    justify-content: center;
  }
}
</style>
