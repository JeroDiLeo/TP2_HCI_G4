<template>
  <section class="profile-section">
    <h2 class="profile-section__title">Notificaciones</h2>

    <!-- Detección de movimiento -->
    <div class="profile-option">
      <div class="profile-option__content">
        <h3 class="profile-option__title">Detección de movimiento</h3>
        <p class="profile-option__description">Recibe alertas cuando se detecta movimiento</p>
      </div>
      <div class="profile-option__control">
        <label class="profile-toggle">
          <input
            v-model="formData.motionDetection"
            type="checkbox"
            class="profile-toggle__input"
          />
          <span class="profile-toggle__track"></span>
        </label>
      </div>
    </div>

    <hr class="profile-divider" />

    <!-- Dispositivos sin conexión -->
    <div class="profile-option">
      <div class="profile-option__content">
        <h3 class="profile-option__title">Dispositivos sin conexión</h3>
        <p class="profile-option__description">Notificaciones cuando un dispositivo se desconecta</p>
      </div>
      <div class="profile-option__control">
        <label class="profile-toggle">
          <input
            v-model="formData.offlineDevices"
            type="checkbox"
            class="profile-toggle__input"
          />
          <span class="profile-toggle__track"></span>
        </label>
      </div>
    </div>

    <hr class="profile-divider" />

    <!-- Resumen semanal -->
    <div class="profile-option">
      <div class="profile-option__content">
        <h3 class="profile-option__title">Resumen semanal</h3>
        <p class="profile-option__description">Recibe un resumen de tu actividad cada semana</p>
      </div>
      <div class="profile-option__control">
        <label class="profile-toggle">
          <input
            v-model="formData.weeklySummary"
            type="checkbox"
            class="profile-toggle__input"
          />
          <span class="profile-toggle__track"></span>
        </label>
      </div>
    </div>

    <hr class="profile-divider" />

    <!-- Notificaciones push -->
    <div class="profile-option">
      <div class="profile-option__content">
        <h3 class="profile-option__title">Notificaciones push</h3>
        <p class="profile-option__description">Recibe alertas en tu dispositivo móvil</p>
      </div>
      <div class="profile-option__control">
        <label class="profile-toggle">
          <input
            v-model="formData.pushNotifications"
            type="checkbox"
            class="profile-toggle__input"
          />
          <span class="profile-toggle__track"></span>
        </label>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      motionDetection: true,
      offlineDevices: true,
      weeklySummary: true,
      pushNotifications: false,
    }),
  },
})

const formData = ref({ ...props.initialData })

watch(() => props.initialData, (newVal) => {
  formData.value = { ...newVal }
}, { deep: true })

defineExpose({
  formData,
})
</script>

<style scoped>
.profile-section {
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.profile-section__title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 20px 0;
}

.profile-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.profile-option__content {
  flex: 1;
}

.profile-option__title {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.profile-option__description {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.profile-option__control {
  margin-left: 16px;
}

.profile-divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 0;
}

/* Toggle Switch */
.profile-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.profile-toggle__input {
  display: none;
}

.profile-toggle__track {
  width: 44px;
  height: 24px;
  background-color: #cbd5e1;
  border-radius: 12px;
  transition: background-color 0.2s;
  position: relative;
  display: block;
}

.profile-toggle__track::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: left 0.2s;
}

.profile-toggle__input:checked + .profile-toggle__track {
  background-color: #6366f1;
}

.profile-toggle__input:checked + .profile-toggle__track::after {
  left: 22px;
}

@media (max-width: 768px) {
  .profile-option {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .profile-option__control {
    margin-left: 0;
    align-self: flex-end;
  }
}
</style>
