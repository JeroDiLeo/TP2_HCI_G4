<template>
  <div class="profile-view">
    <!-- Encabezado -->
    <div class="profile-view__header">
      <h1>Configuración</h1>
      <p>Administrá tu perfil y preferencias de la aplicación.</p>
    </div>

    <div class="profile-view__container">
      <!-- Sidebar Menu Card -->
      <aside class="profile-view__sidebar">
        <button
          v-for="section in sections"
          :key="section.id"
          class="sidebar-item"
          :class="{ 'sidebar-item--active': activeSection === section.id }"
          @click="selectSection(section.id)"
        >
          <i :class="['mdi', section.icon]"></i>
          <span>{{ section.title }}</span>
        </button>

        <!-- Cerrar sesión -->
        <button class="sidebar-item sidebar-item--logout" @click="handleLogout">
          <i class="mdi mdi-logout"></i>
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <!-- Main Content Card -->
      <main class="profile-view__content">
        <!-- Datos personales -->
        <div v-if="activeSection === 'personal'" class="section-wrapper">
          <div class="section-header">
            <h2>Información personal</h2>
            <button class="btn-edit" @click="isEditingPersonal = !isEditingPersonal">
              <i class="mdi mdi-pencil"></i>
              Editar
            </button>
          </div>
          <ProfilePersonalData
            ref="personalDataRef"
            :initial-data="personalData"
            :is-editing="isEditingPersonal"
          />
          <div v-if="isEditingPersonal" class="profile-actions">
            <button type="button" class="btn-secondary" @click="handleCancelPersonal">
              Cancelar
            </button>
            <button type="button" class="btn-primary" @click="handleSavePersonal">
              Guardar cambios
            </button>
          </div>
        </div>

        <!-- Seguridad -->
        <div v-if="activeSection === 'security'" class="section-wrapper">
          <h2>Seguridad</h2>
          <ProfileSecurity
            @change-password="handleChangePassword"
            @delete-account="handleDeleteAccount"
          />
        </div>
      </main>
    </div>

    <!-- Modal para cambiar contraseña -->
    <ChangePasswordModal ref="changePasswordModalRef" />

    <!-- Modal para eliminar cuenta -->
    <DeleteAccountModal ref="deleteAccountModalRef" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { changePassword, deleteAccount } from '@/services/api/userApi'
import ProfilePersonalData from '@/components/profile/ProfilePersonalData.vue'
import ProfileSecurity from '@/components/profile/ProfileSecurity.vue'
import ChangePasswordModal from '@/components/ChangePasswordModal.vue'
import DeleteAccountModal from '@/components/DeleteAccountModal.vue'

const router = useRouter()
const authStore = useAuthStore()

// Estado de navegación
const activeSection = ref('personal')
const isEditingPersonal = ref(false)

// Definición de secciones del menú
const sections = [
  { id: 'personal', icon: 'mdi-account', title: 'Perfil' },
  { id: 'security', icon: 'mdi-lock-outline', title: 'Seguridad' },
]

// Refs para acceder a los datos de los componentes
const personalDataRef = ref(null)
const changePasswordModalRef = ref(null)
const deleteAccountModalRef = ref(null)

// Datos de formulario - Datos personales
const personalData = reactive({
  firstName: authStore.user?.name?.split(' ')[0] || '',
  lastName: authStore.user?.name?.split(' ').slice(1).join(' ') || '',
  email: authStore.user?.email || '',
})

// Actualizar datos cuando cambia el usuario en el store
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    personalData.firstName = newUser.name?.split(' ')[0] || ''
    personalData.lastName = newUser.name?.split(' ').slice(1).join(' ') || ''
    personalData.email = newUser.email || ''
  }
}, { deep: true })

const selectSection = (sectionId) => {
  activeSection.value = sectionId
  isEditingPersonal.value = false
}

const handleSavePersonal = async () => {
  const formData = personalDataRef.value?.formData
  if (formData) {
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`
      await authStore.updateProfile(fullName)

      // Actualizar personalData manualmente para reflejar cambios inmediatamente
      personalData.firstName = formData.firstName
      personalData.lastName = formData.lastName

      isEditingPersonal.value = false
      alert('Cambios guardados correctamente')
    } catch (error) {
      alert(`Error al guardar cambios: ${error.message}`)
    }
  }
}

const handleCancelPersonal = () => {
  isEditingPersonal.value = false
  // Reset form data
  if (personalDataRef.value) {
    personalDataRef.value.formData = { ...personalData }
  }
}

const handleChangePassword = async () => {
  const result = await changePasswordModalRef.value?.showModal()
  if (!result) return

  try {
    await changePassword(result)
    alert('Contraseña cambiada correctamente')
  } catch (error) {
    alert(`Error al cambiar contraseña: ${error.message}`)
  }
}

const handleLogout = async () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    await authStore.logout()
    router.push('/login')
  }
}

const handleDeleteAccount = async () => {
  const result = await deleteAccountModalRef.value?.showModal()
  if (!result) return

  try {
    await deleteAccount(result)
    alert('Cuenta eliminada correctamente')
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    alert(`Error al eliminar cuenta: ${error.message}`)
  }
}

onMounted(() => {
  console.log('Profile view mounted')
})
</script>

<style scoped>
.profile-view {
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-view__header {
  padding: 24px 24px 24px;
}

.profile-view__header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.profile-view__header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.profile-view__container {
  display: flex;
  gap: 24px;
  padding: 0 24px 24px;
}

.profile-view__sidebar {
  width: 200px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  height: fit-content;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
  text-align: left;
}

.sidebar-item i {
  font-size: 16px;
  flex-shrink: 0;
}

.sidebar-item:hover {
  background: #f8fafc;
  color: #0f172a;
}

.sidebar-item--active {
  background: #6366f1;
  color: white;
  font-weight: 600;
}

.sidebar-item--logout {
  color: #ef4444;
  margin-top: auto;
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
  margin-top: 10px;
}

.sidebar-item--logout:hover {
  background: #fef2f2;
  color: #dc2626;
}

.profile-view__content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.section-wrapper {
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

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.btn-edit:hover {
  background: #4f46e5;
}

.btn-edit i {
  font-size: 14px;
}

.profile-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
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

@media (max-width: 768px) {
  .profile-view__container {
    flex-direction: column;
    gap: 16px;
  }

  .profile-view__sidebar {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    height: auto;
    gap: 8px;
  }

  .sidebar-item {
    padding: 12px 8px;
    justify-content: center;
    text-align: center;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }

  .sidebar-item--logout {
    margin-top: 0;
    border-top: none;
    padding-top: 0;
  }

  .profile-view__content {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .profile-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
