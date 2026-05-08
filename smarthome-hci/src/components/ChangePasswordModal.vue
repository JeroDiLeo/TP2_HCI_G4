<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Cambiar contraseña</h2>
          <button class="modal-close" @click="close" aria-label="Cerrar">
            <i class="mdi mdi-close"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label for="old-password">Contraseña actual</label>
            <div class="password-input-wrapper">
              <input
                id="old-password"
                v-model="formData.oldPassword"
                :type="showPasswords.old ? 'text' : 'password'"
                placeholder="Ingresa tu contraseña actual"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPasswords.old = !showPasswords.old"
                :aria-label="showPasswords.old ? 'Ocultar' : 'Mostrar'"
              >
                <i :class="['mdi', showPasswords.old ? 'mdi-eye-off' : 'mdi-eye']"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="new-password">Nueva contraseña</label>
            <div class="password-input-wrapper">
              <input
                id="new-password"
                v-model="formData.newPassword"
                :type="showPasswords.new ? 'text' : 'password'"
                placeholder="Ingresa tu nueva contraseña"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPasswords.new = !showPasswords.new"
                :aria-label="showPasswords.new ? 'Ocultar' : 'Mostrar'"
              >
                <i :class="['mdi', showPasswords.new ? 'mdi-eye-off' : 'mdi-eye']"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirmar contraseña</label>
            <div class="password-input-wrapper">
              <input
                id="confirm-password"
                v-model="formData.confirmPassword"
                :type="showPasswords.confirm ? 'text' : 'password'"
                placeholder="Confirma tu nueva contraseña"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPasswords.confirm = !showPasswords.confirm"
                :aria-label="showPasswords.confirm ? 'Ocultar' : 'Mostrar'"
              >
                <i :class="['mdi', showPasswords.confirm ? 'mdi-eye-off' : 'mdi-eye']"></i>
              </button>
            </div>
          </div>

          <div v-if="error" class="form-error">
            <i class="mdi mdi-alert-circle"></i>
            <span>{{ error }}</span>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="close">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="isLoading">
              <span v-if="!isLoading">Cambiar contraseña</span>
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
import { ref, reactive } from 'vue'

const isOpen = ref(false)
const isLoading = ref(false)
const error = ref('')

const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showPasswords = reactive({
  old: false,
  new: false,
  confirm: false,
})

let resolveCallback = null

const open = () => {
  isOpen.value = true
  error.value = ''
  formData.oldPassword = ''
  formData.newPassword = ''
  formData.confirmPassword = ''
  showPasswords.old = false
  showPasswords.new = false
  showPasswords.confirm = false
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

  // Validar que las contraseñas coincidan
  if (formData.newPassword !== formData.confirmPassword) {
    error.value = 'Las contraseñas nuevas no coinciden'
    return
  }

  // Validar que la nueva contraseña no sea igual a la actual
  if (formData.newPassword === formData.oldPassword) {
    error.value = 'La nueva contraseña debe ser diferente a la actual'
    return
  }

  // Validar longitud mínima
  if (formData.newPassword.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  isLoading.value = true

  try {
    if (resolveCallback) {
      resolveCallback({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      })
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
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
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
}

.modal-close:hover {
  color: #0f172a;
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-of-type {
  margin-bottom: 24px;
}

.form-group label {
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
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

.btn-primary,
.btn-secondary {
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

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
