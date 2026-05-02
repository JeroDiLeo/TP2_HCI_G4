<template>
  <v-dialog
    :model-value="open"
    width="720"
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
        class="modal__close"
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
            Nombre del hogar
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

        <!-- Block 3: Footer -->
        <div
          class="modal__footer stagger"
          :class="{ 'is-entered': entered }"
          :style="staggerStyle(3)"
        >
          <button type="button" class="btn btn--ghost" @click="handleClose">
            Cancelar
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

      </div>
    </div>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useHomesStore } from '@/stores/homes'
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
  { value: 'quinta',       label: 'Quinta',       icon: 'mdi-tree-outline'             },
  { value: 'otro',         label: 'Otro',         icon: 'mdi-dots-horizontal'          },
]

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
    selectedPreset.value     !== null
  )
}

// ── Reset ─────────────────────────────────────────────
function resetForm() {
  form.value           = { name: '', type: 'casa' }
  errors.value         = { name: '' }
  selectedPreset.value     = null
  customImagePreview.value = null
  imageError.value         = ''
  entered.value            = false
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
    nextTick(() => nameInputRef.value?.focus())
    return
  }

  submitting.value = true
  try {
    await homesStore.addHome({
      name: form.value.name.trim(),
      metadata: resolvedImage.value ? { image: resolvedImage.value } : {},
    })
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
/* ── Local design tokens ─────────────────────────────── */
.modal {
  --primary:       #6366F1;
  --primary-dark:  #4F46E5;
  --primary-light: #EEF2FF;
  --bg:            #FFFFFF;
  --border:        #E2E8F0;
  --text-main:     #0F172A;
  --text-muted:    #64748B;
  --text-light:    #94A3B8;
  --error:         #EF4444;
  --font:          'Inter', sans-serif;
  --mono:          ui-monospace, 'SF Mono', Menlo, monospace;

  display: flex;
  width: 100%;
  min-height: 480px;
  background: var(--bg);
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, .04),
    0 24px 48px -12px rgba(15, 23, 42, .18);
  overflow: hidden;
  position: relative;
  font-family: var(--font);
}

:deep(.v-overlay__scrim) {
  background: rgba(15, 23, 42, .42) !important;
  backdrop-filter: blur(2px);
}

/* ── Close button ──────────────────────────────────── */
.modal__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-muted);
  transition: background-color 150ms cubic-bezier(.4, 0, .2, 1);
  z-index: 1;
}
.modal__close:hover         { background-color: var(--primary-light); }
.modal__close:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

/* ── Left column ────────────────────────────────────── */
.modal__left {
  width: 40%;
  flex-shrink: 0;
  background-color: var(--primary-light);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: outline 150ms;
}
.modal__left--dragover {
  outline: 2px dashed var(--primary);
  outline-offset: -4px;
}

/* ── Preset list ──────────────────────────────────── */
.preset-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-item {
  position: relative;
  width: 100%;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  background: none;
  transition: border-color 150ms cubic-bezier(.4, 0, .2, 1), transform 100ms;
}
.preset-item:hover        { border-color: rgba(99, 102, 241, .4); transform: scale(1.01); }
.preset-item:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.preset-item--selected    { border-color: var(--primary); }

.preset-item__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preset-item__check {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(15, 23, 42, .3);
}

/* ── Upload button ────────────────────────────────── */
.upload-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 40px;
  border-radius: 10px;
  border: 1.5px dashed var(--border);
  background: rgba(255, 255, 255, .7);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  overflow: hidden;
  transition:
    border-color     150ms cubic-bezier(.4, 0, .2, 1),
    background-color 150ms cubic-bezier(.4, 0, .2, 1),
    color            150ms cubic-bezier(.4, 0, .2, 1);
}
.upload-btn:hover {
  border-color: var(--primary);
  background-color: rgba(99, 102, 241, .06);
  color: var(--primary);
}
.upload-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.upload-btn--custom {
  height: 56px;
  border-style: solid;
  border-color: var(--primary);
  padding: 0;
}

.upload-btn__preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-btn__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: rgba(15, 23, 42, .45);
  opacity: 0;
  transition: opacity 150ms;
}
.upload-btn--custom:hover .upload-btn__overlay { opacity: 1; }

.upload-btn__remove {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(15, 23, 42, .2);
  color: var(--text-muted);
  transition: background-color 150ms, color 150ms;
  z-index: 1;
}
.upload-btn__remove:hover { background-color: var(--error); color: #fff; }

.upload-hint {
  font-size: 11px;
  color: var(--text-light);
  text-align: center;
  margin: 0;
}
.upload-hint--error { color: var(--error); }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

/* ── Right column ──────────────────────────────────── */
.modal__right {
  flex: 1;
  padding: 40px 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

/* ── Stagger animation ─────────────────────────────── */
.stagger {
  opacity: 0;
  transform: translateY(6px);
}
.stagger.is-entered {
  animation: stagger-in 260ms cubic-bezier(.4, 0, .2, 1) both;
  animation-delay: var(--stagger-delay, 0ms);
}

@keyframes stagger-in {
  to { opacity: 1; transform: translateY(0); }
}

/* ── Modal header ──────────────────────────────────── */
.modal__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}
.modal__subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* ── Fields ────────────────────────────────────────── */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 4px;
}
.field__required { color: var(--error); }

.field__input {
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-family: var(--font);
  font-size: 15px;
  color: var(--text-main);
  background: var(--bg);
  outline: none;
  transition:
    border-color 150ms cubic-bezier(.4, 0, .2, 1),
    box-shadow   150ms cubic-bezier(.4, 0, .2, 1);
}
.field__input::placeholder { color: var(--text-light); }
.field__input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, .15);
}
.field__input--error { border-color: var(--error); }
.field__input--error:focus {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, .12);
}

.field__error {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 12px;
  color: var(--error);
}

/* ── Chips ─────────────────────────────────────────── */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    border-color     150ms cubic-bezier(.4, 0, .2, 1),
    background-color 150ms cubic-bezier(.4, 0, .2, 1),
    color            150ms cubic-bezier(.4, 0, .2, 1);
}
.chip:hover:not(.chip--selected) {
  border-color: var(--text-muted);
  background-color: #F8FAFC;
}
.chip:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.chip--selected {
  background-color: var(--primary-light);
  border: 1.5px solid var(--primary);
  color: var(--primary-dark);
}

/* ── Stepper ───────────────────────────────────────── */
.stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border);
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
  background: var(--bg);
  border: none;
  cursor: pointer;
  color: var(--text-main);
  transition: background-color 150ms, color 150ms;
}
.stepper__btn:hover:not(:disabled) { background-color: var(--primary-light); color: var(--primary); }
.stepper__btn:focus-visible        { outline: 2px solid var(--primary); outline-offset: -2px; }
.stepper__btn:disabled             { opacity: .4; cursor: not-allowed; }

.stepper__value {
  width: 48px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
  user-select: none;
}
.stepper__value:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }

/* ── Footer ────────────────────────────────────────── */
.modal__footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

/* ── Buttons ───────────────────────────────────────── */
.btn {
  height: 44px;
  padding: 0 24px;
  border-radius: 10px;
  font-family: var(--font);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition:
    background-color 150ms cubic-bezier(.4, 0, .2, 1),
    color            150ms cubic-bezier(.4, 0, .2, 1);
}
.btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.btn--ghost { background: transparent; color: var(--text-muted); }
.btn--ghost:hover { background-color: #F8FAFC; color: var(--text-main); }

.btn--primary {
  padding: 0 32px;
  font-size: 15px;
  font-weight: 600;
  background: var(--primary);
  color: #fff;
}
.btn--primary:hover:not(:disabled) { background: var(--primary-dark); }
.btn--primary:disabled             { opacity: .5; cursor: not-allowed; }

/* ── Reduced motion ────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .stagger.is-entered { animation-duration: 0ms; }
  .modal__close, .preset-item, .upload-btn, .chip,
  .stepper__btn, .field__input, .btn { transition-duration: 0ms; }
}
</style>
