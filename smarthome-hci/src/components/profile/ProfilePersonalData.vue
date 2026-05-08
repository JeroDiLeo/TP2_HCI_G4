<template>
  <section class="profile-section">
    <form class="profile-form" @submit.prevent="$emit('save')">
      <div class="profile-grid">
        <!-- Nombre completo -->
        <div class="profile-form__field">
          <label class="profile-form__label" for="firstName">Nombre</label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            class="profile-form__input"
            :readonly="!isEditing"
            placeholder="Tu nombre"
          />
        </div>

        <!-- Apellido -->
        <div class="profile-form__field">
          <label class="profile-form__label" for="lastName">Apellido</label>
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            class="profile-form__input"
            :readonly="!isEditing"
            placeholder="Tu apellido"
          />
        </div>

        <!-- Email -->
        <div class="profile-form__field">
          <label class="profile-form__label" for="email">Correo electrónico</label>
          <div class="profile-form__input-wrapper">
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="profile-form__input profile-form__input--disabled"
              readonly
              disabled
              placeholder="tu@email.com"
            />
            <i class="mdi mdi-lock"></i>
          </div>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      firstName: '',
      lastName: '',
      email: '',
    }),
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save'])

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
  background: transparent;
  border-radius: 0;
  padding: 0;
  margin-bottom: 0;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.profile-form__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-form__field--full {
  grid-column: 1 / -1;
}

.profile-form__field:nth-child(3) {
  grid-column: 1;
}

.profile-form__label {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 6px;
}

.profile-form__label-hint {
  font-size: 11px;
  font-weight: 400;
  color: #94a3b8;
  text-transform: none;
}

.profile-form__input {
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.2s;
}

.profile-form__input:focus {
  outline: none;
  background: white;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.profile-form__input:readonly {
  background: #f1f5f9;
  color: #0f172a;
  cursor: not-allowed;
  border: 1px solid #e2e8f0;
}

.profile-form__input:readonly:focus {
  border: 1px solid #e2e8f0;
  box-shadow: none;
  background: #f1f5f9;
}

.profile-form__input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.profile-form__input-wrapper i {
  position: absolute;
  right: 12px;
  color: #cbd5e1;
  font-size: 16px;
  pointer-events: none;
}

.profile-form__input--disabled {
  width: 100%;
  background: #f1f5f9 !important;
  color: #94a3b8 !important;
  cursor: not-allowed !important;
  border-color: #e2e8f0 !important;
  padding-right: 40px;
}

.profile-form__input--disabled:focus {
  border: 1px solid #e2e8f0 !important;
  box-shadow: none !important;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-form__field--full {
    grid-column: 1;
  }
}
</style>
