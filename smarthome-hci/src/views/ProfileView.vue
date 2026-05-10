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
          />
        </div>

        <!-- Accesibilidad -->
        <div v-if="activeSection === 'accessibility'" class="section-wrapper">
          <div class="a11y-header">
            <h2>Accesibilidad</h2>
            <p>Personalizá cómo se muestran los dispositivos y otras listas.</p>
          </div>

          <!-- Modo de visualización -->
          <fieldset class="a11y-block" aria-labelledby="a11y-viewmode-label">
            <legend id="a11y-viewmode-label" class="a11y-block__title">Modo de visualización - dispositivos en habitaciones</legend>
            <div class="a11y-options" role="radiogroup" aria-labelledby="a11y-viewmode-label">
              <button
                type="button"
                class="a11y-option"
                :class="{ 'a11y-option--selected': prefs.viewMode === 'scroll' }"
                role="radio"
                :aria-checked="String(prefs.viewMode === 'scroll')"
                @click="prefs.setViewMode('scroll')"
              >
                <span class="a11y-option__icon" aria-hidden="true">
                  <v-icon icon="mdi-view-sequential-outline" size="20" />
                </span>
                <span class="a11y-option__body">
                  <span class="a11y-option__name">Lista continua</span>
                  <span class="a11y-option__desc">Mostrar todos los dispositivos seguidos, deslizando hacia abajo.</span>
                </span>
                <span v-if="prefs.viewMode === 'scroll'" class="a11y-option__check" aria-hidden="true">
                  <v-icon icon="mdi-check-circle" size="18" />
                </span>
              </button>

              <button
                type="button"
                class="a11y-option"
                :class="{ 'a11y-option--selected': prefs.viewMode === 'pagination' }"
                role="radio"
                :aria-checked="String(prefs.viewMode === 'pagination')"
                @click="prefs.setViewMode('pagination')"
              >
                <span class="a11y-option__icon" aria-hidden="true">
                  <v-icon icon="mdi-view-grid-outline" size="20" />
                </span>
                <span class="a11y-option__body">
                  <span class="a11y-option__name">Por páginas</span>
                  <span class="a11y-option__desc">Dividir los dispositivos en páginas con botones para avanzar.</span>
                </span>
                <span v-if="prefs.viewMode === 'pagination'" class="a11y-option__check" aria-hidden="true">
                  <v-icon icon="mdi-check-circle" size="18" />
                </span>
              </button>
            </div>
          </fieldset>

          <!-- Dispositivos por página -->
          <fieldset
            class="a11y-block"
            :class="{ 'a11y-block--disabled': prefs.viewMode !== 'pagination' }"
            aria-labelledby="a11y-pagesize-label"
            :aria-disabled="String(prefs.viewMode !== 'pagination')"
          >
            <legend id="a11y-pagesize-label" class="a11y-block__title">
              Dispositivos por página
            </legend>
            <p class="a11y-block__subtitle">
              {{ prefs.viewMode === 'pagination'
                ? 'Cuántos dispositivos se muestran en cada página.'
                : 'Disponible solo en el modo "Por páginas".' }}
            </p>
            <div
              class="a11y-chips"
              role="group"
              aria-labelledby="a11y-pagesize-label"
            >
              <button
                v-for="n in PAGE_SIZE_OPTIONS"
                :key="n"
                type="button"
                class="a11y-chip"
                :class="{ 'a11y-chip--active': prefs.pageSize === n }"
                :disabled="prefs.viewMode !== 'pagination'"
                :aria-pressed="String(prefs.pageSize === n)"
                :aria-label="`${n} dispositivos por página`"
                @click="prefs.setPageSize(n)"
              >{{ n }}</button>
            </div>
          </fieldset>
        </div>
      </main>
    </div>

    <!-- Modal para cambiar contraseña -->
    <ChangePasswordModal ref="changePasswordModalRef" />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'
import { changePassword } from '@/services/api/userApi'
import ProfilePersonalData from '@/components/profile/ProfilePersonalData.vue'
import ProfileSecurity from '@/components/profile/ProfileSecurity.vue'
import ChangePasswordModal from '@/components/ChangePasswordModal.vue'

const authStore = useAuthStore()
const prefs = usePreferencesStore()

// Estado de navegación
const activeSection = ref('personal')
const isEditingPersonal = ref(false)

// Definición de secciones del menú
const sections = [
  { id: 'personal',      icon: 'mdi-account',      title: 'Perfil'         },
  { id: 'security',      icon: 'mdi-lock-outline',  title: 'Seguridad'      },
  { id: 'accessibility', icon: 'mdi-tune',          title: 'Accesibilidad'  },
]

const PAGE_SIZE_OPTIONS = [2, 3, 4, 5, 6]

// Refs para acceder a los datos de los componentes
const personalDataRef = ref(null)
const changePasswordModalRef = ref(null)

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

/* ── Accesibilidad ── */
.a11y-header {
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}
.a11y-header h2 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}
.a11y-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.a11y-block {
  border: none;
  padding: 0;
  margin: 0 0 28px;
}
.a11y-block--disabled { opacity: 0.5; }

.a11y-block__title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
  padding: 0;
}
.a11y-block__subtitle {
  margin: 0 0 14px;
  font-size: 13px;
  color: #64748b;
}

.a11y-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.a11y-option {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  font-family: 'Inter', sans-serif;
  transition: border-color 150ms, background-color 150ms;
}
.a11y-option:hover:not(:disabled) {
  background: #eef2ff;
  border-color: #a5b4fc;
}
.a11y-option:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
.a11y-option--selected {
  background: #eef2ff;
  border-color: #6366f1;
}

.a11y-option__icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #e0e7ff;
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.a11y-option--selected .a11y-option__icon {
  background: #6366f1;
  color: #fff;
}

.a11y-option__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.a11y-option__name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}
.a11y-option__desc {
  font-size: 13px;
  color: #64748b;
}

.a11y-option__check {
  color: #6366f1;
  flex-shrink: 0;
}

.a11y-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.a11y-chip {
  width: 44px;
  height: 44px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: border-color 150ms, background-color 150ms, color 150ms;
}
.a11y-chip:hover:not(:disabled) {
  background: #eef2ff;
  border-color: #a5b4fc;
  color: #6366f1;
}
.a11y-chip:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
.a11y-chip--active {
  background: #6366f1;
  border-color: #6366f1;
  color: #fff;
}
.a11y-chip:disabled {
  cursor: not-allowed;
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
