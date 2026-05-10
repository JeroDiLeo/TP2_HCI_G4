<template>
  <v-dialog
    :model-value="open"
    width="820"
    @update:model-value="onDialogUpdate"
  >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
    >
      <!-- Close button -->
      <button
        class="modal-close"
        type="button"
        aria-label="Cerrar"
        @click="handleClose"
      >
        <v-icon icon="mdi-close" size="20" aria-hidden="true" />
      </button>

      <!-- ── Left column (40%) ── -->
      <div
        class="modal__left"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
        :class="{ 'modal__left--dragover': isDragOver }"
      >
        <!-- Left column title -->
        <p class="left-col-title">Elegí una foto</p>

        <!-- Preset photo list -->
        <div class="preset-list" role="radiogroup" aria-label="Foto del hogar">
          <button
            v-for="(preset, idx) in presetImages"
            :key="idx"
            type="button"
            class="preset-item"
            :class="{ 'preset-item--selected': selectedPreset === idx }"
            role="radio"
            :aria-checked="String(selectedPreset === idx)"
            :aria-label="`Foto ${idx + 1}: ${preset.label}`"
            @click="selectPreset(idx)"
          >
            <img :src="preset.src" :alt="preset.label" class="preset-item__img" />
            <div v-if="selectedPreset === idx" class="preset-item__check" aria-hidden="true">
              <v-icon icon="mdi-check" size="16" />
            </div>
          </button>
        </div>

        <!-- Upload button -->
        <button
          type="button"
          class="upload-btn"
          :class="{ 'upload-btn--custom': customImagePreview }"
          aria-label="Subir foto propia"
          @click="triggerFileInput"
        >
          <template v-if="customImagePreview">
            <img :src="customImagePreview" alt="Foto subida" class="upload-btn__preview" />
            <span class="upload-btn__overlay">
              <v-icon icon="mdi-camera-plus-outline" size="18" aria-hidden="true" />
              Cambiar foto
            </span>
            <button
              class="upload-btn__remove"
              type="button"
              aria-label="Quitar foto subida"
              @click.stop="removeCustomImage"
            >
              <v-icon icon="mdi-close" size="14" aria-hidden="true" />
            </button>
          </template>
          <template v-else>
            <v-icon icon="mdi-upload-outline" size="18" aria-hidden="true" />
            Subir foto o arrastrar
          </template>
        </button>

        <p
          v-if="imageError"
          class="upload-hint upload-hint--error"
          role="alert"
          aria-live="polite"
        >{{ imageError }}</p>
        <p v-else class="upload-hint">JPG o PNG · máx 5MB</p>

        <input
          ref="fileInputRef"
          type="file"
          accept="image/jpeg,image/png"
          class="sr-only"
          aria-hidden="true"
          tabindex="-1"
          @change="handleFileChange"
        />
      </div>

      <!-- ── Right column (60%) ── -->
      <div class="modal__right">

        <!-- ══ PASO 1: Datos del hogar ══ -->
        <template v-if="step === 1">
          <!-- Block 0: Header -->
          <div
            class="modal__header stagger"
            :class="{ 'is-entered': entered }"
            :style="staggerStyle(0)"
          >
            <h2 id="modal-title" class="modal__title">Agregar nuevo hogar</h2>
            <p id="modal-desc" class="modal__subtitle">
              Definí los datos básicos. Podrás editarlos cuando quieras.
            </p>
          </div>

          <!-- Block 1: Nombre -->
          <div
            class="field stagger"
            :class="{ 'is-entered': entered }"
            :style="staggerStyle(1)"
          >
            <label for="home-name" class="field__label">
              Nombre
              <span class="field__required" aria-hidden="true">*</span>
            </label>
            <input
              id="home-name"
              ref="nameInputRef"
              v-model="form.name"
              type="text"
              class="field__input"
              :class="{ 'field__input--error': errors.name }"
              placeholder="Ej: Casa de la sierra"
              maxlength="50"
              autocomplete="off"
              :aria-describedby="errors.name ? 'name-error' : undefined"
              :aria-invalid="!!errors.name"
              @blur="validateName"
            />
            <p
              v-if="errors.name"
              id="name-error"
              class="field__error"
              role="alert"
              aria-live="polite"
            >
              <v-icon icon="mdi-alert-circle-outline" size="14" aria-hidden="true" />
              {{ errors.name }}
            </p>
          </div>

          <!-- Block 2: Tipo (chips) -->
          <div
            class="field stagger"
            :class="{ 'is-entered': entered }"
            :style="staggerStyle(2)"
          >
            <span id="type-label" class="field__label">Tipo</span>
            <div
              class="chips"
              role="radiogroup"
              aria-labelledby="type-label"
              @keydown="handleChipKeydown"
            >
              <button
                v-for="(option, idx) in typeOptions"
                :key="option.value"
                :ref="el => { chipRefs[idx] = el }"
                type="button"
                class="chip"
                :class="{ 'chip--selected': form.type === option.value }"
                role="radio"
                :aria-checked="String(form.type === option.value)"
                :tabindex="form.type === option.value ? 0 : -1"
                @click="form.type = option.value"
              >
                <v-icon :icon="option.icon" size="16" aria-hidden="true" />
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Block 3: Compartir (inline) -->
          <div
            class="field stagger"
            :class="{ 'is-entered': entered }"
            :style="staggerStyle(3)"
          >
            <span class="field__label">Compartir <span class="field__optional">(opcional)</span></span>
            <div class="share-input-row">
              <input
                id="share-email"
                v-model="shareEmailInput"
                type="email"
                class="field__input"
                :class="{ 'field__input--error': shareEmailError }"
                placeholder="ejemplo@mail.com"
                autocomplete="off"
                @input="shareEmailError = ''"
                @keyup.enter="addPendingEmail"
              />
              <button
                type="button"
                class="btn btn--primary"
                style="padding: 0 18px; font-size: 14px;"
                @click="addPendingEmail"
              >
                Agregar
              </button>
            </div>
            <p v-if="shareEmailError" class="field__error" role="alert">
              <v-icon icon="mdi-alert-circle-outline" size="14" aria-hidden="true" />
              {{ shareEmailError }}
            </p>
            <!-- Badge compacto cuando hay emails -->
            <button
              v-if="pendingEmails.length > 0"
              type="button"
              class="share-pill"
              @click="showInvitesModal = true"
            >
              <v-icon icon="mdi-account-multiple-outline" size="15" aria-hidden="true" />
              {{ pendingEmails.length }} {{ pendingEmails.length === 1 ? 'invitado' : 'invitados' }}
              <v-icon icon="mdi-pencil-outline" size="13" aria-hidden="true" style="margin-left:4px; opacity:.7" />
            </button>
          </div>

          <!-- Mini-modal lista de invitados -->
          <v-dialog v-model="showInvitesModal" width="420" @update:model-value="val => { if(!val) showInvitesModal = false }">
            <div class="invites-modal">
              <div class="invites-modal__header">
                <span class="invites-modal__title">Invitados ({{ pendingEmails.length }})</span>
                <button type="button" class="modal__close" style="position:static; width:28px; height:28px;" @click="showInvitesModal = false">
                  <v-icon icon="mdi-close" size="16" />
                </button>
              </div>
              <ul class="pending-list" role="list">
                <li
                  v-for="(email, idx) in pendingEmails"
                  :key="email"
                  class="pending-item"
                >
                  <v-icon icon="mdi-email-outline" size="16" class="pending-item__icon" aria-hidden="true" />
                  <span class="pending-item__email">{{ email }}</span>
                  <button
                    type="button"
                    class="pending-item__remove"
                    :aria-label="`Quitar ${email}`"
                    @click="removePendingEmail(idx)"
                  >
                    <v-icon icon="mdi-close" size="14" aria-hidden="true" />
                  </button>
                </li>
              </ul>
              <button type="button" class="btn btn--primary" style="width:100%; margin-top:12px;" @click="showInvitesModal = false">
                Listo
              </button>
            </div>
          </v-dialog>

          <!-- Share result errors -->
          <div v-if="shareResultErrors.length > 0" class="share-errors" role="alert">
            <p class="share-errors__title">
              <v-icon icon="mdi-alert-circle-outline" size="16" aria-hidden="true" />
              El hogar se creó, pero no se pudo compartir con:
            </p>
            <ul class="share-errors__list">
              <li v-for="(fail, idx) in shareResultErrors" :key="idx">
                <strong>{{ fail.email }}</strong>: {{ fail.message }}
              </li>
            </ul>
            <button
              type="button"
              class="btn btn--ghost"
              style="font-size: 13px; height: 32px; padding: 0 12px;"
              @click="shareResultErrors = []; emit('update:open', false); resetForm()"
            >
              Cerrar de todas formas
            </button>
          </div>

          <!-- Block 4: Footer paso 1 -->
          <div
            class="modal__footer stagger"
            :class="{ 'is-entered': entered }"
            :style="staggerStyle(4)"
          >
            <button
              type="button"
              class="btn btn--primary btn--full"
              :disabled="!isFormValid || submitting"
              @click="handleSubmit"
            >
              {{ submitting ? 'Creando...' : 'Crear hogar' }}
            </button>
          </div>
        </template>

        <!-- ══ PASO 2: Compartir ══ -->
        <template v-else>
          <!-- Header paso 2 -->
          <div class="modal__header">
            <h2 id="modal-title" class="modal__title">Compartir hogar</h2>
            <p id="modal-desc" class="modal__subtitle">
              Invitá a otros usuarios al crear el hogar. Podés agregar varios emails.
            </p>
          </div>

          <!-- Input agregar email -->
          <div class="field">
            <label for="share-email" class="field__label">
              Agregar por email <span class="field__optional">(opcional)</span>
            </label>
            <div class="share-input-row">
              <input
                id="share-email"
                v-model="shareEmailInput"
                type="email"
                class="field__input"
                :class="{ 'field__input--error': shareEmailError }"
                placeholder="ejemplo@mail.com"
                autocomplete="off"
                @input="shareEmailError = ''"
                @keyup.enter="addPendingEmail"
              />
              <button
                type="button"
                class="btn btn--primary"
                style="padding: 0 18px; font-size: 14px;"
                @click="addPendingEmail"
              >
                Agregar
              </button>
            </div>
            <p v-if="shareEmailError" class="field__error" role="alert">
              <v-icon icon="mdi-alert-circle-outline" size="14" aria-hidden="true" />
              {{ shareEmailError }}
            </p>
          </div>

          <!-- Lista de emails pendientes -->
          <div class="field">
            <span class="field__label">Invitaciones ({{ pendingEmails.length }})</span>
            <p v-if="pendingEmails.length === 0" class="share-empty">
              Todavía no agregaste ningún email.
            </p>
            <ul v-else class="pending-list" role="list">
              <li
                v-for="(email, idx) in pendingEmails"
                :key="email"
                class="pending-item"
              >
                <v-icon icon="mdi-email-outline" size="16" class="pending-item__icon" aria-hidden="true" />
                <span class="pending-item__email">{{ email }}</span>
                <button
                  type="button"
                  class="pending-item__remove"
                  :aria-label="`Quitar ${email}`"
                  @click="removePendingEmail(idx)"
                >
                  <v-icon icon="mdi-close" size="14" aria-hidden="true" />
                </button>
              </li>
            </ul>
          </div>

          <!-- Footer paso 2 -->
          <div class="modal__footer">
            <button type="button" class="btn btn--ghost btn--back" @click="step = 1">
              <v-icon icon="mdi-arrow-left" size="16" aria-hidden="true" />
              Volver
            </button>
            <button
              type="button"
              class="btn btn--primary"
              :disabled="!isFormValid || submitting"
              @click="handleSubmit"
            >
              {{ submitting ? 'Creando...' : 'Crear hogar' }}
            </button>
          </div>
        </template>

      </div>
    </div>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useHomesStore } from '@/stores/homes'
import { shareHome } from '@/services/api/homeApi'
import casaPrincipalImg from '@/assets/images/homes/casaPrincipal.jpg'
import casaFindeImg     from '@/assets/images/homes/casaFinde.jpg'
import deptoImg         from '@/assets/images/homes/depto.jpg'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:open'])

const homesStore = useHomesStore()

// ── Refs ────────────────────────────────────────────
const nameInputRef = ref(null)
const fileInputRef = ref(null)
const chipRefs     = ref([])
const entered      = ref(false)

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

// ── Step ─────────────────────────────────────────────
const step = ref(1) // 1 = form, 2 = compartir

// ── Share step state ──────────────────────────────────
const shareEmailInput  = ref('')
const shareEmailError  = ref('')
const pendingEmails    = ref([]) // emails to share after home is created
const showInvitesModal = ref(false)
const shareResultErrors = ref([]) // errors from share API after home creation

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function addPendingEmail() {
  shareEmailError.value = ''
  const email = shareEmailInput.value.trim()
  if (!email) return
  if (!isValidEmail(email)) { shareEmailError.value = 'Ingresá un email válido.'; return }
  if (pendingEmails.value.includes(email)) { shareEmailError.value = 'Ya agregaste ese email.'; return }
  pendingEmails.value.push(email)
  shareEmailInput.value = ''
}

function removePendingEmail(idx) {
  pendingEmails.value.splice(idx, 1)
}

// ── Form state ───────────────────────────────────────
const form = ref({ name: '', type: 'casa' })

const errors             = ref({ name: '' })
const selectedPreset     = ref(null)   // index of selected preset, or null
const customImagePreview = ref(null)   // data URL of uploaded file
const imageError         = ref('')
const isDragOver         = ref(false)

// Final image sent to store: custom upload wins over preset
const resolvedImage = computed(() =>
  customImagePreview.value ?? (selectedPreset.value !== null ? presetImages[selectedPreset.value].src : null)
)

// ── Computed ──────────────────────────────────────────
const isFormValid = computed(() => {
  const n = form.value.name.trim()
  return n.length >= 2 && n.length <= 50
})

// ── Stagger helper ────────────────────────────────────
function staggerStyle(index) {
  return { '--stagger-delay': `${index * 40}ms` }
}

// ── Validation ────────────────────────────────────────
function validateName() {
  const n = form.value.name.trim()
  if (!n) {
    errors.value.name = 'El nombre es obligatorio.'
  } else if (n.length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres.'
  } else {
    errors.value.name = ''
  }
}

// ── Preset selection ──────────────────────────────────
function selectPreset(idx) {
  selectedPreset.value = selectedPreset.value === idx ? null : idx
}

// ── Image upload ──────────────────────────────────────
function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (file) processFile(file)
  event.target.value = ''
}

function handleDrop(event) {
  isDragOver.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) processFile(file)
}

function processFile(file) {
  imageError.value = ''
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    imageError.value = 'Solo se aceptan archivos JPG o PNG.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    imageError.value = 'La imagen no puede superar los 5MB.'
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    customImagePreview.value = e.target.result
    selectedPreset.value = null // custom upload overrides preset
  }
  reader.readAsDataURL(file)
}

function removeCustomImage() {
  customImagePreview.value = null
  imageError.value = ''
}

// ── Chip keyboard nav ─────────────────────────────────
function handleChipKeydown(event) {
  const focused = chipRefs.value.findIndex(el => el === document.activeElement)
  if (focused === -1) return

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    const next = (focused + 1) % typeOptions.length
    form.value.type = typeOptions[next].value
    nextTick(() => chipRefs.value[next]?.focus())
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    const prev = (focused - 1 + typeOptions.length) % typeOptions.length
    form.value.type = typeOptions[prev].value
    nextTick(() => chipRefs.value[prev]?.focus())
  }
}

// ── Dirty check ───────────────────────────────────────
function isDirty() {
  return (
    form.value.name.trim()   !== '' ||
    customImagePreview.value !== null ||
    selectedPreset.value     !== null ||
    pendingEmails.value.length > 0
  )
}

// ── Reset ─────────────────────────────────────────────
function resetForm() {
  form.value               = { name: '', type: 'casa' }
  errors.value             = { name: '' }
  selectedPreset.value     = null
  customImagePreview.value = null
  imageError.value         = ''
  entered.value            = false
  step.value               = 1
  shareEmailInput.value    = ''
  shareEmailError.value    = ''
  pendingEmails.value      = []
  showInvitesModal.value   = false
  shareResultErrors.value  = []
}

// ── Close ─────────────────────────────────────────────
function handleClose() {
  if (isDirty() && !window.confirm('¿Seguro que querés cerrar? Los datos no se guardarán.')) {
    return
  }
  emit('update:open', false)
  resetForm()
}

function onDialogUpdate(val) {
  if (!val) handleClose()
}

// ── Submit ────────────────────────────────────────────
const submitting = ref(false)

async function handleSubmit() {
  validateName()
  if (!isFormValid.value) {
    step.value = 1
    nextTick(() => nameInputRef.value?.focus())
    return
  }

  if (shareEmailInput.value.trim()) {
    addPendingEmail()
    if (shareEmailError.value) return
  }

  submitting.value = true
  try {
    const metadata = { type: form.value.type }
    if (resolvedImage.value) metadata.image = resolvedImage.value
    const newHome = await homesStore.addHome({
      name: form.value.name.trim(),
      metadata,
    })
    // Enviar invitaciones si el usuario agregó emails en el paso de compartir
    if (pendingEmails.value.length > 0 && newHome?.id) {
      try {
        await shareHome(newHome.id, pendingEmails.value)
      } catch (err) {
        shareResultErrors.value = [{ email: pendingEmails.value.join(', '), message: err.message || 'Error desconocido' }]
        // No cerramos el modal para que el usuario vea el error
        return
      }
    }
    emit('update:open', false)
    resetForm()
  } catch {
    // El error se muestra desde el store via snackbar en HomesView
  } finally {
    submitting.value = false
  }
}

// ── Lifecycle ─────────────────────────────────────────
watch(() => props.open, (val) => {
  if (val) {
    nextTick(() => {
      entered.value = true
      nameInputRef.value?.focus()
    })
  }
})
</script>

<style scoped>
/* ── Modal layout ──────────────────────────────────── */
.modal {
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

:deep(.v-overlay__scrim) {
  background: rgba(15, 23, 42, .42) !important;
  backdrop-filter: blur(2px);
}

.left-col-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--sh-text-muted);
}

.modal__left {
  width: 40%;
  flex-shrink: 0;
  background-color: var(--sh-primary-light);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: outline 150ms;
}
.modal__left--dragover { outline: 2px dashed var(--sh-primary); outline-offset: -4px; }

.modal__right {
  flex: 1;
  padding: 40px 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

/* ── Stagger animation ─────────────────────────────── */
.stagger { opacity: 0; transform: translateY(6px); }
.stagger.is-entered {
  animation: stagger-in 260ms cubic-bezier(.4, 0, .2, 1) both;
  animation-delay: var(--stagger-delay, 0ms);
}
@keyframes stagger-in { to { opacity: 1; transform: translateY(0); } }

.modal__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.2;
}
.modal__subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--sh-text-muted);
  line-height: 1.5;
}

/* ── Stepper ───────────────────────────────────────── */
.stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--sh-border);
  border-radius: 10px;
  overflow: hidden;
  width: fit-content;
}
.stepper__btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sh-bg);
  border: none;
  cursor: pointer;
  color: var(--sh-text-main);
  transition: background-color 150ms, color 150ms;
}
.stepper__btn:hover:not(:disabled) { background-color: var(--sh-primary-light); color: var(--sh-primary); }
.stepper__btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: -2px; }
.stepper__btn:disabled { opacity: .4; cursor: not-allowed; }
.stepper__value {
  width: 48px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  color: var(--sh-text-main);
  border-left: 1px solid var(--sh-border);
  border-right: 1px solid var(--sh-border);
  user-select: none;
}

/* ── Footer ────────────────────────────────────────── */
.modal__footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--sh-border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.btn--full { width: 100%; }

/* ── Share button ──────────────────────────────────── */
.btn--share-green {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  border-radius: 10px;
  font-family: var(--sh-font);
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: var(--sh-primary);
  color: #fff;
  transition: background-color 150ms;
}
.btn--share-green:hover { background: var(--sh-primary-dark); }
.btn--share-green:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.share-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  color: var(--sh-primary-dark);
  font-size: 11px;
  font-weight: 700;
}

.btn--back { display: inline-flex; align-items: center; gap: 6px; }

/* ── Share step ────────────────────────────────────── */
.share-input-row { display: flex; gap: 10px; align-items: center; }
.share-input-row .field__input { flex: 1; min-width: 0; }

.share-empty {
  margin: 0;
  font-size: 13px;
  color: var(--sh-text-light);
  padding: 8px 0;
}

/* ── Share pill ────────────────────────────────────── */
.share-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1.5px solid var(--sh-primary);
  background: var(--sh-primary-light);
  color: var(--sh-primary-dark);
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 150ms, border-color 150ms;
  width: fit-content;
}
.share-pill:hover { background-color: #dde4fd; }
.share-pill:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

/* ── Invites mini-modal ────────────────────────────── */
.invites-modal {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: var(--sh-font);
  box-shadow: 0 8px 32px rgba(15, 23, 42, .14);
}
.invites-modal__header { display: flex; align-items: center; justify-content: space-between; }
.invites-modal__title { font-size: 15px; font-weight: 600; color: var(--sh-text-main); }

/* ── Share errors ──────────────────────────────────── */
.share-errors {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.share-errors__title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--sh-error);
}
.share-errors__list {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: var(--sh-text-main);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

</style>
