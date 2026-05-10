<template>
  <button
    type="button"
    class="home-card"
    :class="{ 'home-card--selected': selected }"
    :aria-pressed="selected"
    :aria-label="cardAriaLabel"
    @click="router.push({ name: 'home-detail', params: { homeId: home.id } })"
  >
    <div class="home-card__media">
      <img
        v-if="home.image"
        :src="home.image"
        :alt="`Foto del hogar ${home.name}`"
        class="home-card__img"
      >
      <div v-else class="home-card__placeholder" aria-hidden="true">
        foto exterior casa
      </div>
    </div>

    <div class="home-card__body">
      <div class="home-card__name-row">
        <div class="home-card__title-block">
          <h3 class="home-card__name">{{ home.name }}</h3>
          <p v-if="sharedByText" class="home-card__shared-by">
            <v-icon icon="mdi-account-arrow-left-outline" size="14" aria-hidden="true" />
            <span>{{ sharedByText }}</span>
          </p>
        </div>

        <!-- Menú de 3 puntos -->
        <div @click.stop>
          <v-menu location="bottom end" content-class="home-card-menu">
            <template #activator="{ props }">
              <button
                v-bind="props"
                type="button"
                class="home-card__menu-btn"
                aria-label="Opciones del hogar"
              >
                <v-icon icon="mdi-dots-vertical" size="20" aria-hidden="true" />
              </button>
            </template>
            <div class="hc-menu">
              <button class="hc-menu__item" type="button" @click="openEdit">
                <v-icon icon="mdi-pencil-outline" size="16" aria-hidden="true" />
                Editar
              </button>
              <button v-if="isOwner" class="hc-menu__item" type="button" @click="openShare">
                <v-icon icon="mdi-share-variant-outline" size="16" aria-hidden="true" />
                Compartir
              </button>
              <button v-if="isOwner" class="hc-menu__item hc-menu__item--danger" type="button" @click="openDelete">
                <v-icon icon="mdi-trash-can-outline" size="16" aria-hidden="true" />
                Eliminar
              </button>
            </div>
          </v-menu>
        </div>
      </div>

      <p class="home-card__metric">
        <v-icon icon="mdi-door" size="18" class="home-card__icon" aria-hidden="true" />
        <span>{{ home.rooms }} habitaciones</span>
      </p>
      <p class="home-card__metric">
        <v-icon icon="mdi-flash" size="18" class="home-card__icon" aria-hidden="true" />
        <span>{{ home.devices }} dispositivos</span>
      </p>
    </div>
  </button>

  <!-- Dialog: Editar -->
  <v-dialog v-model="editDialog" width="720" @update:model-value="onEditDialogUpdate">
    <div
      class="edit-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <!-- Close button -->
      <button
        class="modal-close"
        type="button"
        aria-label="Cerrar"
        @click="editDialog = false"
      >
        <v-icon icon="mdi-close" size="20" aria-hidden="true" />
      </button>

      <!-- Left column (photo) -->
      <div
        class="em__left"
        :class="{ 'em__left--dragover': editIsDragOver }"
        @dragover.prevent="editIsDragOver = true"
        @dragleave.prevent="editIsDragOver = false"
        @drop.prevent="handleEditDrop"
      >
        <div class="preset-list" role="radiogroup" aria-label="Foto del hogar">
          <button
            v-for="(preset, idx) in presetImages"
            :key="idx"
            type="button"
            class="preset-item"
            :class="{ 'preset-item--selected': editSelectedPreset === idx }"
            role="radio"
            :aria-checked="editSelectedPreset === idx"
            :aria-label="`Foto ${idx + 1}: ${preset.label}`"
            @click="selectEditPreset(idx)"
          >
            <img :src="preset.src" :alt="preset.label" class="preset-item__img" />
            <div v-if="editSelectedPreset === idx" class="preset-item__check" aria-hidden="true">
              <v-icon icon="mdi-check" size="16" />
            </div>
          </button>
        </div>

        <button
          type="button"
          class="upload-btn"
          :class="{ 'upload-btn--custom': editCustomImagePreview }"
          aria-label="Subir foto propia"
          @click="triggerEditFileInput"
        >
          <template v-if="editCustomImagePreview">
            <img :src="editCustomImagePreview" alt="Foto subida" class="upload-btn__preview" />
            <span class="upload-btn__overlay">
              <v-icon icon="mdi-camera-plus-outline" size="18" aria-hidden="true" />
              Cambiar foto
            </span>
            <button
              class="upload-btn__remove"
              type="button"
              aria-label="Quitar foto subida"
              @click.stop="removeEditCustomImage"
            >
              <v-icon icon="mdi-close" size="14" aria-hidden="true" />
            </button>
          </template>
          <template v-else>
            <v-icon icon="mdi-upload-outline" size="18" aria-hidden="true" />
            Subir foto o arrastrar
          </template>
        </button>

        <p v-if="editImageError" class="upload-hint upload-hint--error" role="alert">{{ editImageError }}</p>
        <p v-else class="upload-hint">JPG o PNG · máx 5MB</p>

        <input
          ref="editFileInputRef"
          type="file"
          accept="image/jpeg,image/png"
          class="sr-only"
          aria-hidden="true"
          tabindex="-1"
          @change="handleEditFileChange"
        />
      </div>

      <!-- Right column -->
      <div class="em__right">

        <div class="em__header">
          <h2 id="edit-modal-title" class="em__title">Editar hogar</h2>
          <p class="em__subtitle">Modificá los datos de tu hogar.</p>
        </div>

        <!-- Nombre -->
        <div class="field">
          <label for="edit-home-name" class="field__label">
            Nombre
            <span class="field__required" aria-hidden="true">*</span>
          </label>
          <input
            id="edit-home-name"
            v-model="editName"
            type="text"
            class="field__input"
            :class="{ 'field__input--error': editNameError }"
            placeholder="Ej: Casa de la sierra"
            maxlength="50"
            autocomplete="off"
          />
          <p v-if="editNameError" class="field__error" role="alert">
            <v-icon icon="mdi-alert-circle-outline" size="14" aria-hidden="true" />
            {{ editNameError }}
          </p>
        </div>

        <!-- Tipo -->
        <div class="field">
          <span class="field__label">Tipo</span>
          <div class="chips" role="radiogroup">
            <button
              v-for="option in typeOptions"
              :key="option.value"
              type="button"
              class="chip"
              :class="{ 'chip--selected': editType === option.value }"
              role="radio"
              :aria-checked="editType === option.value"
              @click="editType = option.value"
            >
              <v-icon :icon="option.icon" size="16" aria-hidden="true" />
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="em__footer">
          <button type="button" class="btn btn--ghost" :disabled="editLoading" @click="editDialog = false">
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn--primary"
            :disabled="editLoading || !editName.trim()"
            @click="submitEdit"
          >
            {{ editLoading ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>

      </div>
    </div>
  </v-dialog>

  <!-- Dialog: Eliminar -->
  <v-dialog v-model="deleteDialog" max-width="420">
    <div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <button class="modal-close" type="button" aria-label="Cerrar" @click="deleteDialog = false">
        <v-icon icon="mdi-close" size="20" aria-hidden="true" />
      </button>

      <div class="confirm-modal__icon" aria-hidden="true">
        <v-icon icon="mdi-trash-can-outline" size="24" />
      </div>

      <h2 id="delete-modal-title" class="confirm-modal__title">Eliminar hogar</h2>
      <p class="confirm-modal__text">
        ¿Seguro que querés eliminar el hogar <strong>{{ home.name }}</strong>?
        Esta acción no se puede deshacer.
      </p>

      <div class="confirm-modal__footer">
        <button type="button" class="btn btn--ghost" :disabled="deleteLoading" @click="deleteDialog = false">
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn--danger"
          :disabled="deleteLoading"
          @click="submitDelete"
        >
          {{ deleteLoading ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </div>
    </div>
  </v-dialog>

  <!-- Dialog: Compartir -->
  <ShareHomeDialog
    :home-id="home.id"
    :open="shareDialog"
    @update:open="shareDialog = $event"
  />

  <!-- Snackbar -->
  <v-snackbar
    v-model="snackbar"
    timeout="4000"
    location="bottom center"
    content-class="hc-snackbar"
    :class="`hc-snackbar--${snackbarColor}`"
  >
    <div class="hc-snackbar__inner">
      <v-icon
        :icon="snackbarColor === 'error' ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline'"
        size="18"
        class="hc-snackbar__icon"
        aria-hidden="true"
      />
      <span>{{ snackbarText }}</span>
    </div>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Home } from '@/stores/homes'
import { useHomesStore } from '@/stores/homes'
import { useAuthStore } from '@/stores/auth'
import ShareHomeDialog from '@/components/homes/ShareHomeDialog.vue'
import casaPrincipalImg from '@/assets/images/homes/casaPrincipal.jpg'
import casaFindeImg     from '@/assets/images/homes/casaFinde.jpg'
import deptoImg         from '@/assets/images/homes/depto.jpg'

const props = defineProps<{ home: Home; selected: boolean }>()
defineEmits<{ (e: 'select', id: string): void }>()

const router = useRouter()
const homesStore = useHomesStore()
const authStore = useAuthStore()

// ── Static data ──────────────────────────────────────
const presetImages = [
  { src: casaPrincipalImg, label: 'Casa principal' },
  { src: casaFindeImg,     label: 'Casa de finde'  },
  { src: deptoImg,         label: 'Departamento'   },
]

const typeOptions = [
  { value: 'casa',         label: 'Casa',         icon: 'mdi-home-outline'             },
  { value: 'departamento', label: 'Departamento', icon: 'mdi-office-building-outline'  },
  { value: 'oficina',      label: 'Oficina',      icon: 'mdi-briefcase-outline'        },
  { value: 'otro',         label: 'Otro',         icon: 'mdi-dots-horizontal'          },
]

// Ownership: only expose admin actions after the store confirms the user owns the home.
const isOwner = computed(() => {
  if (typeof props.home.isOwner === 'boolean') return props.home.isOwner
  if (props.home.sharedByName) return false

  const sharedWith = props.home.sharedWith || []
  const currentEmail = authStore.user?.email || authStore.email
  if (!currentEmail) return false
  if (sharedWith.some((u: any) => u.email?.toLowerCase() === currentEmail.toLowerCase())) return false

  return false
})

const sharedByText = computed(() => {
  if (props.home.sharedByName) return `Compartido por ${props.home.sharedByName}`
  if (props.home.isOwner === false) return 'Hogar compartido'
  return ''
})

const cardAriaLabel = computed(() => {
  const sharedText = sharedByText.value ? `, ${sharedByText.value}` : ''
  return `Seleccionar hogar ${props.home.name}${sharedText}, ${props.home.rooms} habitaciones, ${props.home.devices} dispositivos`
})

// Snackbar
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref<string>('success')

function showSnackbar(text: string, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

function handleApiError(err: any) {
  const status = err.status
  if (status === 401) {
    authStore.logout()
    router.push('/login')
  } else if (status === 403) {
    showSnackbar('No tenés permisos para esta acción', 'error')
  } else if (status === 404) {
    showSnackbar('Hogar no encontrado', 'error')
    homesStore.fetchHomes()
  } else {
    showSnackbar(err.message || 'Error inesperado', 'error')
  }
}

// --- Editar ---
const editDialog          = ref(false)
const editName            = ref('')
const editNameError       = ref('')
const editType            = ref('casa')
const editLoading         = ref(false)
const editSelectedPreset  = ref<number | null>(null)
const editCustomImagePreview = ref<string | null>(null)
const editImageError      = ref('')
const editIsDragOver      = ref(false)
const editFileInputRef    = ref<HTMLInputElement | null>(null)

const editResolvedImage = computed(() =>
  editCustomImagePreview.value ?? (editSelectedPreset.value !== null ? presetImages[editSelectedPreset.value].src : null)
)

function openEdit() {
  editName.value       = props.home.name
  editNameError.value  = ''
  editType.value       = (props.home.metadata?.type as string) || 'casa'
  editImageError.value = ''
  editIsDragOver.value = false

  // Pre-select preset if current image matches one
  const currentImage = props.home.image
  const matchedPreset = presetImages.findIndex(p => p.src === currentImage)
  if (matchedPreset !== -1) {
    editSelectedPreset.value     = matchedPreset
    editCustomImagePreview.value = null
  } else if (currentImage) {
    editSelectedPreset.value     = null
    editCustomImagePreview.value = currentImage
  } else {
    editSelectedPreset.value     = null
    editCustomImagePreview.value = null
  }

  editDialog.value = true
}

function onEditDialogUpdate(val: boolean) {
  if (!val) editDialog.value = false
}

function selectEditPreset(idx: number) {
  editSelectedPreset.value = editSelectedPreset.value === idx ? null : idx
  if (editSelectedPreset.value !== null) editCustomImagePreview.value = null
}

function triggerEditFileInput() {
  editFileInputRef.value?.click()
}

function handleEditFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) processEditFile(file)
  ;(event.target as HTMLInputElement).value = ''
}

function handleEditDrop(event: DragEvent) {
  editIsDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) processEditFile(file)
}

function processEditFile(file: File) {
  editImageError.value = ''
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    editImageError.value = 'Solo se aceptan archivos JPG o PNG.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    editImageError.value = 'La imagen no puede superar los 5MB.'
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    editCustomImagePreview.value = e.target!.result as string
    editSelectedPreset.value = null
  }
  reader.readAsDataURL(file)
}

function removeEditCustomImage() {
  editCustomImagePreview.value = null
  editImageError.value = ''
}

async function submitEdit() {
  editNameError.value = ''
  const name = editName.value.trim()
  if (!name) {
    editNameError.value = 'El nombre es obligatorio.'
    return
  }
  if (name.length < 2) {
    editNameError.value = 'El nombre debe tener al menos 2 caracteres.'
    return
  }

  editLoading.value = true
  try {
    const metadata: Record<string, unknown> = {
      ...props.home.metadata,
      type: editType.value,
    }
    if (editResolvedImage.value) metadata.image = editResolvedImage.value

    await homesStore.updateHome(props.home.id, { name, metadata })
    editDialog.value = false
    showSnackbar('Hogar actualizado correctamente')
  } catch (err: any) {
    if (err.status === 400) {
      editNameError.value = err.message
    } else {
      editDialog.value = false
      handleApiError(err)
    }
  } finally {
    editLoading.value = false
  }
}

// --- Compartir ---
const shareDialog = ref(false)

function openShare() {
  shareDialog.value = true
}

// --- Eliminar ---
const deleteDialog  = ref(false)
const deleteLoading = ref(false)

function openDelete() {
  deleteDialog.value = true
}

async function submitDelete() {
  deleteLoading.value = true
  try {
    await homesStore.removeHome(props.home.id)
    deleteDialog.value = false
    showSnackbar('Hogar eliminado correctamente')
  } catch (err: any) {
    deleteDialog.value = false
    handleApiError(err)
  } finally {
    deleteLoading.value = false
  }
}
</script>

<style scoped>
/* ── Card ───────────────────────────────────────────── */
.home-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  background-color: #ffffff;
  border: 2px solid transparent;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  font-family: var(--sh-font);
  text-align: left;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}
.home-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}
.home-card:focus-visible {
  outline: none;
  border-color: var(--sh-primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.18);
}
.home-card--selected {
  border-color: var(--sh-primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
}

.home-card__media {
  position: relative;
  width: 100%;
  height: 220px;
  flex-shrink: 0;
  background-color: #0f172a;
  overflow: hidden;
}

.home-card__name-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 6px;
}

.home-card__title-block {
  min-width: 0;
  flex: 1 1 auto;
}

.home-card__menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  margin-top: -2px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--sh-text-muted);
  transition: background-color 120ms, color 120ms;
}
.home-card__menu-btn:hover { background: #f1f5f9; color: var(--sh-text-main); }
.home-card__menu-btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.home-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.home-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sh-text-light);
  font-size: 13px;
  letter-spacing: 0.02em;
}

.home-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 10px 16px 20px;
  flex: 1 1 auto;
}

.home-card__name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

.home-card__shared-by {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  margin: 2px 0 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--sh-text-muted);
  line-height: 1.3;
}
.home-card__shared-by span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-card__metric {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  color: var(--sh-text-muted);
}

.home-card__icon { color: var(--sh-primary); flex-shrink: 0; }

/* ── Dropdown menu ─────────────────────────────────── */
:deep(.home-card-menu) {
  border-radius: 12px !important;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.12) !important;
  overflow: hidden !important;
}

.hc-menu {
  background: #ffffff;
  border: 1px solid var(--sh-border);
  border-radius: 12px;
  padding: 6px;
  min-width: 148px;
  font-family: var(--sh-font);
}

.hc-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-family: var(--sh-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--sh-text-main);
  cursor: pointer;
  transition: background-color 120ms;
  text-align: left;
}
.hc-menu__item:hover { background-color: #f1f5f9; }
.hc-menu__item--danger { color: var(--sh-error); }
.hc-menu__item--danger:hover { background-color: #fef2f2; }

/* ── Edit modal layout ─────────────────────────────── */
.edit-modal {
  display: flex;
  width: 100%;
  min-height: 480px;
  background: var(--sh-bg);
  border-radius: 16px;
  border: 1px solid var(--sh-border);
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04), 0 24px 48px -12px rgba(15, 23, 42, .18);
  overflow: hidden;
  position: relative;
  font-family: var(--sh-font);
}

.em__left {
  width: 40%;
  flex-shrink: 0;
  background-color: var(--sh-primary-light);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: outline 150ms;
}
.em__left--dragover { outline: 2px dashed var(--sh-primary); outline-offset: -4px; }

.em__right {
  flex: 1;
  padding: 40px 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.em__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.2;
}
.em__subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--sh-text-muted);
  line-height: 1.5;
}

.em__footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--sh-border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

/* ── Confirm (delete) modal ────────────────────────── */
.confirm-modal {
  position: relative;
  background: var(--sh-bg);
  border-radius: 16px;
  border: 1px solid var(--sh-border);
  box-shadow: 0 4px 32px rgba(15, 23, 42, 0.14);
  padding: 36px 32px 28px;
  font-family: var(--sh-font);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.confirm-modal__icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #FEF2F2;
  color: var(--sh-error);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.confirm-modal__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--sh-text-main);
}

.confirm-modal__text {
  margin: 0;
  font-size: 14px;
  color: var(--sh-text-muted);
  line-height: 1.55;
  max-width: 300px;
}

.confirm-modal__footer {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
}

</style>
