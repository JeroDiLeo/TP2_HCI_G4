<template>
  <div class="profile-view">
    <!-- Encabezado -->
    <ProfileHeader :user="userData" />

    <!-- Menú principal -->
    <div v-if="!activeSection" class="profile-view__menu">
      <button
        v-for="section in sections"
        :key="section.id"
        class="menu-card"
        @click="selectSection(section.id)"
      >
        <div class="menu-card__icon">
          <i :class="['mdi', section.icon]"></i>
        </div>
        <div class="menu-card__content">
          <h3 class="menu-card__title">{{ section.title }}</h3>
          <p class="menu-card__description">{{ section.description }}</p>
        </div>
        <i class="mdi mdi-chevron-right menu-card__chevron"></i>
      </button>
    </div>

    <!-- Contenido de sección -->
    <div v-else class="profile-view__section-content">
      <button class="back-button" @click="activeSection = null">
        <i class="mdi mdi-chevron-left"></i>
        Volver
      </button>

      <!-- Datos personales -->
      <ProfilePersonalData
        v-if="activeSection === 'personal'"
        ref="personalDataRef"
        :initial-data="personalData"
      />

      <!-- Apariencia -->
      <ProfileAppearance
        v-if="activeSection === 'appearance'"
        ref="appearanceRef"
        :initial-data="appearanceData"
      />

      <!-- Notificaciones -->
      <ProfileNotifications
        v-if="activeSection === 'notifications'"
        ref="notificationsRef"
        :initial-data="notificationsData"
      />

      <!-- Seguridad -->
      <ProfileSecurity
        v-if="activeSection === 'security'"
        @change-password="handleChangePassword"
        @manage-sessions="handleManageSessions"
        @logout="handleLogout"
        @delete-account="handleDeleteAccount"
      />

      <!-- Botones de acción (excepto para Seguridad) -->
      <div v-if="activeSection !== 'security'" class="profile-actions">
        <button
          type="button"
          class="btn-secondary"
          @click="handleCancel"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn-primary"
          @click="handleSave"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfilePersonalData from '@/components/profile/ProfilePersonalData.vue'
import ProfileAppearance from '@/components/profile/ProfileAppearance.vue'
import ProfileNotifications from '@/components/profile/ProfileNotifications.vue'
import ProfileSecurity from '@/components/profile/ProfileSecurity.vue'

const router = useRouter()
const authStore = useAuthStore()

// Estado de navegación
const activeSection = ref(null)

// Definición de secciones del menú
const sections = [
  { id: 'personal', icon: 'mdi-account', title: 'Mi perfil', description: 'Datos personales' },
  { id: 'appearance', icon: 'mdi-brightness-6', title: 'Apariencia', description: 'Tema y modo' },
  { id: 'notifications', icon: 'mdi-bell-outline', title: 'Notificaciones', description: 'Avisos y alertas' },
  { id: 'security', icon: 'mdi-lock-outline', title: 'Seguridad', description: 'Cuenta y sesión' },
]

// Refs para acceder a los datos de los componentes
const personalDataRef = ref(null)
const appearanceRef = ref(null)
const notificationsRef = ref(null)

// Datos del usuario desde el store
const userData = computed(() => ({
  name: authStore.user?.name?.split(' ')[0] || 'Usuario',
  lastName: authStore.user?.name?.split(' ').slice(1).join(' ') || '',
  role: authStore.user?.role || 'Usuario',
  email: authStore.user?.email || '',
}))

// Datos de formulario - Datos personales
const personalData = reactive({
  firstName: authStore.user?.name?.split(' ')[0] || '',
  lastName: authStore.user?.name?.split(' ').slice(1).join(' ') || '',
  email: authStore.user?.email || '',
})

// Datos de formulario - Apariencia
const appearanceData = reactive({
  theme: 'auto',
  largeText: false,
  highContrast: false,
  reduceMotion: false,
})

// Datos de formulario - Notificaciones
const notificationsData = reactive({
  motionDetection: true,
  offlineDevices: true,
  weeklySummary: true,
  pushNotifications: false,
})

const selectSection = (sectionId) => {
  activeSection.value = sectionId
}

const handleSave = async () => {
  // Aquí iría la lógica para guardar los cambios
  console.log('Saving changes...')
  console.log('Personal Data:', personalDataRef.value?.formData)
  console.log('Appearance:', appearanceRef.value?.formData)
  console.log('Notifications:', notificationsRef.value?.formData)
  // TODO: Llamar a API para guardar
}

const handleCancel = () => {
  // Volver al menú principal
  activeSection.value = null
}

const handleChangePassword = () => {
  console.log('Change password')
  // TODO: Implementar modal o navegar a nueva página
}

const handleManageSessions = () => {
  console.log('Manage sessions')
  // TODO: Implementar modal o navegar a nueva página
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const handleDeleteAccount = () => {
  console.log('Delete account')
  // TODO: Implementar confirmación y lógica de eliminación
}

onMounted(() => {
  // Aquí se cargarían los datos del usuario desde el store/API
  console.log('Profile view mounted')
})
</script>

<style scoped>
.profile-view {
  padding: 0;
  max-width: 900px;
  margin: 0 auto;
}

.profile-view__menu {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 24px;
}

.menu-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
  border-left: 4px solid transparent;
}

.menu-card:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  border-left-color: #6366f1;
}


.menu-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 10px;
  color: #6366f1;
  font-size: 24px;
  flex-shrink: 0;
}

.menu-card__content {
  flex: 1;
  text-align: left;
}

.menu-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.menu-card__description {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #64748b;
}

.menu-card__chevron {
  color: #cbd5e1;
  font-size: 24px;
  flex-shrink: 0;
}

.profile-view__section-content {
  margin-top: 32px;
  padding: 0 24px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  padding: 8px 0;
  margin-bottom: 24px;
  transition: color 0.2s;
}

.back-button:hover {
  color: #4f46e5;
}

.back-button .mdi {
  font-size: 20px;
}

.profile-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding: 24px;
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
}

.btn-primary,
.btn-secondary {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #4f46e5;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-primary:active {
  background: #4338ca;
}

.btn-secondary {
  background: white;
  color: #0f172a;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-secondary:active {
  background: #f1f5f9;
}

@media (max-width: 768px) {
  .profile-view {
    padding: 0;
  }

  .profile-actions {
    flex-direction: column;
    position: relative;
    bottom: auto;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .menu-card {
    padding: 16px;
  }

  .menu-card__icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>
