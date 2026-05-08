<template>
  <v-dialog
    :model-value="open"
    width="560"
    @update:model-value="onDialogUpdate"
  >
    <div
      class="add-room"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-room-title"
      aria-describedby="add-room-desc"
    >
      <button
        type="button"
        class="add-room__close"
        aria-label="Cerrar"
        @click="handleClose"
      >
        <v-icon icon="mdi-close" size="14" aria-hidden="true" />
      </button>

      <!-- Header on the violet gradient -->
      <header class="add-room__header">
        <div class="add-room__icon" aria-hidden="true">
          <v-icon :icon="selectedTypeIcon" size="24" />
        </div>
        <div class="add-room__meta">
          <p class="add-room__eyebrow">NUEVA HABITACIÓN</p>
          <h2 id="add-room-title" class="add-room__title">
            Agregar habitación
          </h2>
          <p id="add-room-desc" class="add-room__desc">
            Sumá un nuevo espacio a tu hogar inteligente
          </p>
        </div>
      </header>

      <!-- Body -->
      <div class="add-room__body">
        <div class="field">
          <label for="room-name" class="field__label">Nombre</label>
          <input
            id="room-name"
            ref="nameInputRef"
            v-model="name"
            type="text"
            class="field__input"
            :class="{ 'field__input--error': showNameError }"
            placeholder="Ej: Sala Principal"
            maxlength="40"
            autocomplete="off"
            :aria-invalid="showNameError"
            :aria-describedby="showNameError ? 'room-name-error' : undefined"
            @blur="touched.name = true"
          />
          <p
            v-if="showNameError"
            id="room-name-error"
            class="field__error"
            role="alert"
            aria-live="polite"
          >
            <v-icon icon="mdi-alert-circle-outline" size="13" aria-hidden="true" />
            {{ nameError }}
          </p>
        </div>

        <div class="field">
          <span class="field__label">Tipo</span>
          <div class="type-grid" role="radiogroup" aria-label="Tipo de habitación">
            <button
              v-for="opt in typeOptions"
              :key="opt.value"
              type="button"
              class="type-card"
              :class="{ 'type-card--on': type === opt.value }"
              role="radio"
              :aria-checked="type === opt.value"
              @click="type = opt.value"
            >
              <span class="type-card__icon" aria-hidden="true">
                <v-icon :icon="opt.icon" size="18" />
              </span>
              <span class="type-card__label">{{ opt.label }}</span>
              <v-icon
                v-if="type === opt.value"
                icon="mdi-check-circle"
                size="16"
                class="type-card__check"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="add-room__footer">
        <button type="button" class="btn-cancel" @click="handleClose">Cancelar</button>
        <button
          type="button"
          class="btn-save"
          :disabled="!isValid"
          @click="handleSubmit"
        >
          <v-icon icon="mdi-plus" size="14" aria-hidden="true" />
          Crear habitación
        </button>
      </footer>
    </div>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoomsStore } from '@/stores/rooms'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit  = defineEmits(['update:open'])

const store = useRoomsStore()

const typeOptions = [
  { value: 'living',   label: 'Sala / Living', icon: 'mdi-sofa-outline'         },
  { value: 'bedroom',  label: 'Dormitorio',    icon: 'mdi-bed-king-outline'      },
  { value: 'kitchen',  label: 'Cocina',        icon: 'mdi-silverware-fork-knife' },
  { value: 'bathroom', label: 'Baño',          icon: 'mdi-shower'                },
  { value: 'office',   label: 'Oficina',       icon: 'mdi-desk'                  },
  { value: 'other',    label: 'Otro',          icon: 'mdi-home-variant'          },
]

const nameInputRef = ref(null)

const name    = ref('')
const type    = ref('living')
const touched = ref({ name: false })

const nameTrimmed = computed(() => name.value.trim())

const nameError = computed(() => {
  const n = nameTrimmed.value
  if (!n) return 'El nombre es obligatorio.'
  if (n.length < 2) return 'Mínimo 2 caracteres.'
  if (n.length > 40) return 'Máximo 40 caracteres.'
  if (store.rooms.some(r => r.name.toLowerCase() === n.toLowerCase())) {
    return 'Ya existe una habitación con ese nombre.'
  }
  return ''
})

const showNameError = computed(() => touched.value.name && !!nameError.value)

const isValid = computed(() => !nameError.value && !!type.value)

const selectedTypeIcon = computed(() =>
  typeOptions.find(o => o.value === type.value)?.icon ?? 'mdi-home-plus-outline'
)

function reset() {
  name.value = ''
  type.value = 'living'
  touched.value = { name: false }
}

function isDirty() {
  return nameTrimmed.value !== '' || type.value !== 'living'
}

function close() { emit('update:open', false) }

function handleClose() {
  if (isDirty() && !window.confirm('¿Seguro que querés cerrar? Los datos no se guardarán.')) return
  close()
  setTimeout(reset, 250)
}

function onDialogUpdate(val) {
  if (!val) handleClose()
}

function handleSubmit() {
  touched.value.name = true
  if (!isValid.value) {
    nextTick(() => nameInputRef.value?.focus())
    return
  }
  store.addRoom({ name: nameTrimmed.value, type: type.value })
  close()
  setTimeout(reset, 250)
}

watch(() => props.open, (val) => {
  if (val) {
    reset()
    nextTick(() => nameInputRef.value?.focus())
  }
})
</script>

<style scoped>
.add-room {
  position: relative;
  width: 100%;
  background: #ffffff;
  border-radius: 18px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, .04),
    0 24px 48px -12px rgba(15, 23, 42, .18),
    0 0 0 1px rgba(15, 23, 42, .04);
  font-family: var(--sh-font);
  display: flex;
  flex-direction: column;
  max-height: 94vh;
}

:deep(.v-overlay__scrim) {
  background: rgba(15, 23, 42, .42) !important;
  backdrop-filter: blur(2px);
}

.add-room__close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, .08);
  background: #ffffff;
  color: var(--sh-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 150ms, color 150ms;
  z-index: 2;
}
.add-room__close:hover {
  background: var(--sh-primary-light);
  color: var(--sh-text-main);
}
.add-room__close:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

/* Header */
.add-room__header {
  background: linear-gradient(135deg, var(--sh-primary-light) 0%, #F5F3FF 100%);
  padding: 20px 28px 18px;
  border-radius: 18px 18px 0 0;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-right: 60px;
}
.add-room__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--sh-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 16px -4px rgba(99, 102, 241, .4);
}
.add-room__icon :deep(.v-icon) { color: #ffffff !important; }
.add-room__meta { min-width: 0; flex: 1; }
.add-room__eyebrow {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--sh-primary);
}
.add-room__title {
  margin: 4px 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.2;
}
.add-room__desc {
  margin: 0;
  font-size: 13px;
  color: var(--sh-text-muted);
}

/* Body */
.add-room__body {
  padding: 18px 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: visible;
}

/* Field */
.field { display: flex; flex-direction: column; gap: 6px; }
.field__label { font-size: 12px; font-weight: 600; color: var(--sh-text-main); }
.field__input {
  width: 100%;
  height: 38px;
  padding: 0 14px;
  border: 1px solid var(--sh-border);
  border-radius: 10px;
  font-family: var(--sh-font);
  font-size: 14px;
  color: var(--sh-text-main);
  background: #ffffff;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
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

/* Type grid */
.type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.type-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.5px solid var(--sh-border);
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  font-family: var(--sh-font);
  transition: border-color 150ms, background-color 150ms;
}
.type-card:hover { border-color: rgba(99, 102, 241, .4); background: #F8FAFC; }
.type-card:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.type-card--on {
  border-color: var(--sh-primary);
  background: var(--sh-primary-light);
}
.type-card__icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.type-card--on .type-card__icon {
  background: var(--sh-primary);
  color: #fff;
}
.type-card__label {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(--sh-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.type-card__check {
  color: var(--sh-primary);
  flex-shrink: 0;
}

/* Footer */
.add-room__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-top: 1px solid var(--sh-border);
  background: #F8FAFC;
  border-radius: 0 0 18px 18px;
}

.btn-cancel {
  padding: 9px 16px;
  border-radius: 9px;
  background: #ffffff;
  border: 1px solid var(--sh-border);
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms, color 150ms;
}
.btn-cancel:hover { background: #F8FAFC; color: var(--sh-text-main); }
.btn-cancel:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.btn-save {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 9px; border: none;
  background: var(--sh-primary); color: #ffffff;
  font-family: var(--sh-font);
  font-size: 13px; font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 8px -2px rgba(99, 102, 241, .3);
  transition: background-color 150ms;
}
.btn-save:hover:not(:disabled) { background: var(--sh-primary-dark); }
.btn-save:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
.btn-save:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
</style>
