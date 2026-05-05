<template>
  <v-dialog
    :model-value="open"
    width="440"
    @update:model-value="onDialogUpdate"
  >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-room-title"
      aria-describedby="add-room-desc"
    >
      <!-- Close button -->
      <button
        type="button"
        class="modal__close"
        aria-label="Cerrar modal"
        @click="handleClose"
      >
        <v-icon icon="mdi-close" size="18" aria-hidden="true" />
      </button>

      <!-- Header: icon + title -->
      <div
        class="modal__header stagger"
        :class="{ 'is-entered': entered }"
        :style="staggerStyle(0)"
      >
        <div class="modal__header-icon" aria-hidden="true">
          <v-icon icon="mdi-home-plus-outline" size="22" aria-hidden="true" />
        </div>
        <div>
          <h2 id="add-room-title" class="modal__title">Nueva Habitación</h2>
          <p id="add-room-desc" class="modal__subtitle">Agrega un nuevo espacio a tu hogar inteligente</p>
        </div>
      </div>

      <!-- Field: Nombre -->
      <div
        class="field stagger"
        :class="{ 'is-entered': entered }"
        :style="staggerStyle(1)"
      >
        <label for="room-name" class="field__label">NOMBRE</label>
        <input
          id="room-name"
          ref="nameInputRef"
          v-model="name"
          type="text"
          class="field__input"
          :class="{ 'field__input--error': errors.name }"
          placeholder="Ej: Sala Principal"
          maxlength="40"
          autocomplete="off"
          :aria-invalid="!!errors.name"
          :aria-describedby="errors.name ? 'room-name-error' : undefined"
          @blur="touched.name = true; validateName()"
        />
        <p
          v-if="errors.name"
          id="room-name-error"
          class="field__error"
          role="alert"
          aria-live="polite"
        >
          <v-icon icon="mdi-alert-circle-outline" size="13" aria-hidden="true" />
          {{ errors.name }}
        </p>
      </div>

      <!-- Field: Tipo -->
      <div
        class="field field--dropdown stagger"
        :class="{ 'is-entered': entered, 'field--dropdown-open': dropdownOpen }"
        :style="staggerStyle(2)"
        v-click-outside="closeDropdown"
      >
        <span id="tipo-label" class="field__label">TIPO</span>
        <div class="dropdown" :class="{ 'dropdown--open': dropdownOpen }">
          <button
            type="button"
            class="dropdown__trigger"
            :class="{ 'dropdown__trigger--error': errors.type, 'dropdown__trigger--open': dropdownOpen }"
            role="combobox"
            aria-haspopup="listbox"
            :aria-expanded="String(dropdownOpen)"
            aria-labelledby="tipo-label"
            aria-label="Seleccionar tipo de habitación"
            :aria-invalid="!!errors.type"
            @click="toggleDropdown"
            @keydown="handleTriggerKeydown"
          >
            <template v-if="type">
              <v-icon :icon="selectedOption.icon" size="16" class="dropdown__trigger-icon" aria-hidden="true" />
              <span class="dropdown__trigger-text">{{ selectedOption.label }}</span>
            </template>
            <span v-else class="dropdown__trigger-placeholder">Seleccionar</span>
            <v-icon
              icon="mdi-chevron-down"
              size="18"
              class="dropdown__chevron"
              aria-hidden="true"
            />
          </button>

          <ul
            v-if="dropdownOpen"
            class="dropdown__list"
            role="listbox"
            aria-label="Tipo de habitación"
            @keydown="handleListKeydown"
          >
            <li
              v-for="(opt, idx) in typeOptions"
              :key="opt.value"
              :ref="el => { optionRefs[idx] = el }"
              class="dropdown__option"
              :class="{ 'dropdown__option--selected': type === opt.value }"
              role="option"
              :aria-selected="String(type === opt.value)"
              tabindex="-1"
              @click="selectType(opt.value)"
              @keydown.enter.prevent="selectType(opt.value)"
              @keydown.space.prevent="selectType(opt.value)"
            >
              <v-icon :icon="opt.icon" size="16" class="dropdown__option-icon" aria-hidden="true" />
              <span class="dropdown__option-label">{{ opt.label }}</span>
              <v-icon
                v-if="type === opt.value"
                icon="mdi-check"
                size="14"
                class="dropdown__option-check"
                aria-hidden="true"
              />
            </li>
          </ul>
        </div>
        <p
          v-if="errors.type"
          class="field__error"
          role="alert"
          aria-live="polite"
        >
          <v-icon icon="mdi-alert-circle-outline" size="13" aria-hidden="true" />
          {{ errors.type }}
        </p>
      </div>

      <!-- Footer -->
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
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          Agregar Habitación
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoomsStore } from '@/stores/rooms'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit  = defineEmits(['update:open'])

const store        = useRoomsStore()
const nameInputRef = ref(null)
const optionRefs   = ref([])
const entered      = ref(false)

// ── Form state ──
const name    = ref('')
const type    = ref(null)
const errors  = ref({ name: '', type: '' })
const touched = ref({ name: false, type: false })

// ── Dropdown state ──
const dropdownOpen = ref(false)

const typeOptions = [
  { value: 'living',   label: 'Sala / Living', icon: 'mdi-sofa-outline'          },
  { value: 'bedroom',  label: 'Dormitorio',    icon: 'mdi-bed-king-outline'       },
  { value: 'kitchen',  label: 'Cocina',        icon: 'mdi-silverware-fork-knife'  },
  { value: 'bathroom', label: 'Baño',          icon: 'mdi-shower'                 },
  { value: 'office',   label: 'Oficina',       icon: 'mdi-desk'                   },
  { value: 'other',    label: 'Otro',          icon: 'mdi-door'                   },
]

const selectedOption = computed(() =>
  typeOptions.find(o => o.value === type.value) ?? null
)

// ── Computed validity ──
const isFormValid = computed(() => {
  const n = name.value.trim()
  const nameOk = n.length >= 2 && n.length <= 40 &&
    !store.rooms.some(r => r.name.toLowerCase() === n.toLowerCase())
  return nameOk && !!type.value
})

// ── Stagger ──
function staggerStyle(idx) {
  return { '--stagger-delay': `${idx * 30}ms` }
}

// ── Validation ──
function validateName() {
  const n = name.value.trim()
  if (!n) {
    errors.value.name = 'El nombre es obligatorio.'
  } else if (n.length < 2) {
    errors.value.name = 'Mínimo 2 caracteres.'
  } else if (n.length > 40) {
    errors.value.name = 'Máximo 40 caracteres.'
  } else if (store.rooms.some(r => r.name.toLowerCase() === n.toLowerCase())) {
    errors.value.name = 'Ya existe una habitación con ese nombre.'
  } else {
    errors.value.name = ''
  }
}

function validateType() {
  errors.value.type = type.value ? '' : 'Seleccioná un tipo de habitación.'
}

function validateAll() {
  touched.value.name = true
  touched.value.type = true
  validateName()
  validateType()
}

// ── Dropdown ──
function openDropdown() {
  dropdownOpen.value = true
  nextTick(() => {
    const selected = typeOptions.findIndex(o => o.value === type.value)
    const idx = selected >= 0 ? selected : 0
    optionRefs.value[idx]?.focus()
  })
}

function closeDropdown() {
  dropdownOpen.value = false
}

function toggleDropdown() {
  dropdownOpen.value ? closeDropdown() : openDropdown()
}

function selectType(value) {
  type.value = value
  errors.value.type = ''
  closeDropdown()
}

function handleTriggerKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleDropdown()
  } else if (event.key === 'Escape') {
    closeDropdown()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    openDropdown()
  }
}

function handleListKeydown(event) {
  const focused = optionRefs.value.findIndex(el => el === document.activeElement)
  if (event.key === 'Escape') {
    closeDropdown()
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const next = (focused + 1) % typeOptions.length
    optionRefs.value[next]?.focus()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    const prev = (focused - 1 + typeOptions.length) % typeOptions.length
    optionRefs.value[prev]?.focus()
  } else if (event.key === 'Tab') {
    closeDropdown()
  }
}

// ── Click outside directive (inline) ──
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutsideHandler = (e) => {
      if (!el.contains(e.target)) binding.value()
    }
    document.addEventListener('mousedown', el._clickOutsideHandler)
  },
  unmounted(el) {
    document.removeEventListener('mousedown', el._clickOutsideHandler)
  },
}

// ── Dirty check ──
function isDirty() {
  return name.value.trim() !== '' || !!type.value
}

// ── Reset ──
function resetForm() {
  name.value         = ''
  type.value         = null
  errors.value       = { name: '', type: '' }
  touched.value      = { name: false, type: false }
  dropdownOpen.value = false
  entered.value      = false
}

// ── Close ──
function handleClose() {
  if (isDirty() && !window.confirm('¿Seguro que querés cerrar? Los datos no se guardarán.')) return
  emit('update:open', false)
  resetForm()
}

function onDialogUpdate(val) {
  if (!val) handleClose()
}

// ── Submit ──
function handleSubmit() {
  validateAll()
  if (!isFormValid.value) {
    nextTick(() => {
      if (errors.value.name) nameInputRef.value?.focus()
    })
    return
  }
  store.addRoom({ name: name.value.trim(), type: type.value })
  emit('update:open', false)
  resetForm()
}

// ── Lifecycle ──
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
/* ── Modal shell ── */
.modal {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--sh-border);
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04), 0 24px 48px -12px rgba(15, 23, 42, .18);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  font-family: 'Inter', sans-serif;
}

:deep(.v-overlay__scrim) {
  background: rgba(15, 23, 42, .42) !important;
  backdrop-filter: blur(2px);
}

/* ── Close button ── */
.modal__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--sh-text-muted);
  transition: background-color 150ms cubic-bezier(.4,0,.2,1), color 150ms cubic-bezier(.4,0,.2,1);
}
.modal__close:hover { background-color: var(--sh-primary-light); color: var(--sh-text-main); }
.modal__close:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

/* ── Header ── */
.modal__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-right: 36px;
}

.modal__header-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.3;
}

.modal__subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--sh-text-muted);
  line-height: 1.5;
}

/* ── Fields ── */
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--sh-text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.field__input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--sh-border);
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--sh-text-main);
  background: #ffffff;
  outline: none;
  transition: border-color 150ms cubic-bezier(.4,0,.2,1), box-shadow 150ms cubic-bezier(.4,0,.2,1);
}
.field__input::placeholder { color: var(--sh-text-light); }
.field__input:focus {
  border-color: var(--sh-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, .15);
}
.field__input--error { border-color: var(--sh-error); }
.field__input--error:focus {
  border-color: var(--sh-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, .12);
}

.field__error {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 12px;
  color: var(--sh-error);
}

/* ── Dropdown ── */
.field--dropdown { position: relative; }
.field--dropdown-open { z-index: 30; }

.dropdown {
  position: relative;
}

.dropdown__trigger {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--sh-border);
  border-radius: 10px;
  background: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--sh-text-main);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  outline: none;
  transition: border-color 150ms cubic-bezier(.4,0,.2,1), box-shadow 150ms cubic-bezier(.4,0,.2,1);
}

.dropdown__trigger:focus,
.dropdown__trigger--open {
  border-color: var(--sh-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, .15);
}

.dropdown__trigger--error { border-color: var(--sh-error); }
.dropdown__trigger--error:focus {
  border-color: var(--sh-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, .12);
}

.dropdown__trigger:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

.dropdown__trigger-icon { color: var(--sh-primary); flex-shrink: 0; }

.dropdown__trigger-text { flex: 1; text-align: left; }

.dropdown__trigger-placeholder {
  flex: 1;
  text-align: left;
  color: var(--sh-text-light);
}

.dropdown__chevron {
  color: var(--sh-text-muted);
  margin-left: auto;
  flex-shrink: 0;
  transition: transform 160ms cubic-bezier(.4,0,.2,1);
}

.dropdown--open .dropdown__chevron { transform: rotate(180deg); }

.dropdown__list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 200;
  background: #ffffff;
  border: 1px solid var(--sh-border);
  border-radius: 10px;
  box-shadow: 0 8px 24px -8px rgba(15, 23, 42, .15);
  padding: 4px 0;
  margin: 0;
  list-style: none;
  animation: dropdown-in 160ms cubic-bezier(.4,0,.2,1) both;
}

@keyframes dropdown-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.dropdown__option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--sh-text-main);
  cursor: pointer;
  outline: none;
  transition: background-color 150ms cubic-bezier(.4,0,.2,1);
}

.dropdown__option:hover,
.dropdown__option:focus {
  background-color: var(--sh-primary-light);
}

.dropdown__option:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: -2px;
}

.dropdown__option--selected {
  background-color: var(--sh-primary-light);
  font-weight: 600;
}

.dropdown__option-icon { color: var(--sh-primary); flex-shrink: 0; }

.dropdown__option-label { flex: 1; }

.dropdown__option-check { color: var(--sh-primary); margin-left: auto; }

/* ── Footer ── */
.modal__footer {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.btn {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 150ms cubic-bezier(.4,0,.2,1), color 150ms cubic-bezier(.4,0,.2,1);
}
.btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.btn--ghost {
  background: #ffffff;
  border: 1px solid var(--sh-border);
  color: var(--sh-text-muted);
}
.btn--ghost:hover { background-color: #f8fafc; color: var(--sh-text-main); }

.btn--primary {
  font-weight: 600;
  background: var(--sh-primary);
  color: #ffffff;
}
.btn--primary:hover:not(:disabled) { background: var(--sh-primary-dark); }
.btn--primary:disabled { opacity: .5; cursor: not-allowed; }

/* ── Stagger animation ── */
.stagger { opacity: 0; transform: translateY(4px); }
.stagger.is-entered {
  animation: stagger-in 260ms cubic-bezier(.4, 0, .2, 1) both;
  animation-delay: var(--stagger-delay, 0ms);
}
@keyframes stagger-in { to { opacity: 1; transform: translateY(0); } }

</style>
