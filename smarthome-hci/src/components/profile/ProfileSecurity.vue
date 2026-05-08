<template>
  <section class="profile-section">
    <!-- Cambiar contraseña -->
    <div class="profile-security-option">
      <div class="profile-security-option__content">
        <h3 class="profile-security-option__title">Contraseña</h3>
        <p class="profile-security-option__description">Protege tu cuenta con una contraseña segura</p>
      </div>
      <button
        type="button"
        class="btn-secondary"
        @click="$emit('change-password')"
      >
        Cambiar
      </button>
    </div>

    <hr class="profile-divider" />

    <!-- Eliminar cuenta -->
    <div class="profile-security-option">
      <div class="profile-security-option__content">
        <h3 class="profile-security-option__title">Eliminar cuenta</h3>
        <p class="profile-security-option__description">Esta acción no se puede deshacer</p>
      </div>
      <button
        type="button"
        class="btn-danger"
        @click="$emit('delete-account')"
      >
        Eliminar
      </button>
    </div>
  </section>
</template>

<script setup>
defineEmits(['change-password', 'delete-account'])
</script>

<style scoped>
.profile-section {
  background: transparent;
  border-radius: 0;
  padding: 0;
  margin-bottom: 0;
}

.profile-security-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  gap: 16px;
}

.profile-security-option__content {
  flex: 1;
}

.profile-security-option__title {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.profile-security-option__description {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.profile-divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 12px 0;
}

/* Buttons */
.btn-secondary,
.btn-danger {
  padding: 7px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
}

.btn-secondary {
  background: white;
  color: #0f172a;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-danger {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.btn-danger:hover {
  background: #fecaca;
  border-color: #f87171;
}

@media (max-width: 768px) {
  .profile-security-option {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-secondary,
  .btn-danger {
    align-self: flex-start;
  }
}
</style>
