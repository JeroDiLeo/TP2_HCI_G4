<template>
  <section class="profile-section">
    <h2 class="profile-section__title">Datos personales</h2>
    <form class="profile-form" @submit.prevent="$emit('save')">
      <div class="profile-form__grid">
        <!-- Nombre -->
        <div class="profile-form__field">
          <label class="profile-form__label" for="firstName">Nombre</label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            class="profile-form__input"
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
            placeholder="Tu apellido"
          />
        </div>

        <!-- Email -->
        <div class="profile-form__field">
          <label class="profile-form__label" for="email">Correo</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="profile-form__input"
            placeholder="tu@email.com"
            disabled
          />
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

.profile-form__grid {
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

.profile-form__label {
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
}

.profile-form__input,
.profile-form__select {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  background: white;
  transition: border-color 0.2s;
}

.profile-form__input:focus,
.profile-form__select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.profile-form__input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.profile-form__select {
  cursor: pointer;
}

@media (max-width: 768px) {
  .profile-form__grid {
    grid-template-columns: 1fr;
  }

  .profile-form__field--full {
    grid-column: 1;
  }
}
</style>
