<template>
  <v-dialog
    :model-value="open"
    width="640"
    @update:model-value="onDialogUpdate"
  >
    <div
      class="create-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-routine-title"
    >
      <button
        type="button"
        class="create-modal__close"
        aria-label="Cerrar"
        @click="handleClose"
      >
        <v-icon icon="mdi-close" size="14" aria-hidden="true" />
      </button>

      <!-- Header -->
      <header class="create-modal__header">
        <div class="create-modal__icon" aria-hidden="true">
          <v-icon :icon="selectedIcon" size="24" />
        </div>
        <div class="create-modal__meta">
          <p class="create-modal__eyebrow">NUEVA RUTINA</p>
          <h2 id="create-routine-title" class="create-modal__title">
            Crear rutina automatizada
          </h2>
          <p class="create-modal__desc">
            Configura los detalles para automatizar tu hogar
          </p>
        </div>
      </header>

      <!-- Body -->
      <div class="create-modal__body">
        <!-- Nombre -->
        <div class="field">
          <label for="cr-name" class="field__label">Nombre</label>
          <input
            id="cr-name"
            ref="nameInputRef"
            v-model="form.name"
            type="text"
            class="field__input"
            :class="{ 'field__input--error': showNameError }"
            placeholder="Ej: Buenos Días"
            maxlength="40"
            autocomplete="off"
            :aria-invalid="showNameError"
            :aria-describedby="showNameError ? 'cr-name-error' : undefined"
            @blur="touched.name = true"
          />
          <p
            v-if="showNameError"
            id="cr-name-error"
            class="field__error"
            role="alert"
            aria-live="polite"
          >
            <v-icon icon="mdi-alert-circle-outline" size="13" aria-hidden="true" />
            {{ nameError }}
          </p>
        </div>

        <!-- Descripción -->
        <div class="field">
          <label for="cr-desc" class="field__label">
            Descripción <span class="field__optional">(opcional)</span>
          </label>
          <input
            id="cr-desc"
            v-model="form.description"
            type="text"
            class="field__input"
            placeholder="Ej: Despierta con el ambiente perfecto"
            maxlength="80"
            autocomplete="off"
          />
        </div>

        <!-- Categoría -->
        <div class="field">
          <span class="field__label">Categoría</span>
          <div class="cat-grid" role="radiogroup" aria-label="Categoría">
            <button
              v-for="cat in CATEGORIES"
              :key="cat.value"
              type="button"
              class="cat-chip"
              :class="{ 'cat-chip--active': form.category === cat.value }"
              role="radio"
              :aria-checked="form.category === cat.value"
              @click="form.category = cat.value"
            >
              <v-icon :icon="cat.icon" size="14" aria-hidden="true" />
              {{ cat.value }}
            </button>
          </div>
        </div>

        <!-- Trigger -->
        <div class="field">
          <span class="field__label">Activación</span>
          <div class="trigger-toggle" role="radiogroup" aria-label="Tipo de activación">
            <button
              type="button"
              class="trigger-option"
              :class="{ 'trigger-option--active': form.trigger.type === 'schedule' }"
              role="radio"
              :aria-checked="form.trigger.type === 'schedule'"
              @click="form.trigger.type = 'schedule'"
            >
              <v-icon icon="mdi-clock-outline" size="16" aria-hidden="true" />
              Por horario
            </button>
            <button
              type="button"
              class="trigger-option"
              :class="{ 'trigger-option--active': form.trigger.type === 'manual' }"
              role="radio"
              :aria-checked="form.trigger.type === 'manual'"
              @click="form.trigger.type = 'manual'"
            >
              <v-icon icon="mdi-hand-pointing-right" size="16" aria-hidden="true" />
              Manual
            </button>
          </div>
        </div>

        <!-- Hora + días (solo si schedule) -->
        <div v-if="form.trigger.type === 'schedule'" class="schedule-grid">
          <div class="schedule-card">
            <div class="schedule-card__head">
              <div class="schedule-card__icon" aria-hidden="true">
                <v-icon icon="mdi-clock-outline" size="14" />
              </div>
              <span class="schedule-card__label">Hora</span>
            </div>
            <input
              v-model="form.trigger.time"
              type="time"
              class="time-input"
              aria-label="Hora de la rutina"
            />
          </div>

          <div class="schedule-card">
            <div class="schedule-card__head">
              <div class="schedule-card__icon" aria-hidden="true">
                <v-icon icon="mdi-calendar-month-outline" size="14" />
              </div>
              <span class="schedule-card__label">Repetición</span>
            </div>
            <WeekdaySelector v-model="form.days" :editable="true" />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="create-modal__footer">
        <button type="button" class="btn-cancel" @click="handleClose">
          Cancelar
        </button>
        <button
          type="button"
          class="btn-save"
          :disabled="!isValid"
          @click="handleCreate"
        >
          <v-icon icon="mdi-plus" size="14" aria-hidden="true" />
          Crear rutina
        </button>
      </footer>
    </div>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoutinesStore } from '@/stores/routines'
import WeekdaySelector from './WeekdaySelector.vue'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit  = defineEmits(['update:open', 'created'])

const store = useRoutinesStore()

const CATEGORIES = [
  { value: 'Mañana',        icon: 'mdi-white-balance-sunny' },
  { value: 'Noche',         icon: 'mdi-weather-night' },
  { value: 'Confort',       icon: 'mdi-sofa-outline' },
  { value: 'Seguridad',     icon: 'mdi-shield-check' },
  { value: 'Personalizada', icon: 'mdi-cog-outline' },
]

const nameInputRef = ref(null)

function makeEmptyForm() {
  return {
    name: '',
    description: '',
    category: 'Mañana',
    trigger: { type: 'schedule', time: '07:00' },
    days: ['lun', 'mar', 'mie', 'jue', 'vie'],
    actions: [],
  }
}

const form = ref(makeEmptyForm())
const touched = ref({ name: false })

const selectedIcon = computed(() =>
  CATEGORIES.find(c => c.value === form.value.category)?.icon ?? 'mdi-cog-outline'
)

const nameTrimmed = computed(() => form.value.name.trim())

const nameError = computed(() => {
  const n = nameTrimmed.value
  if (!n) return 'El nombre es obligatorio.'
  if (n.length < 2) return 'Mínimo 2 caracteres.'
  if (n.length > 40) return 'Máximo 40 caracteres.'
  if (store.routines.some(r => r.name.toLowerCase() === n.toLowerCase())) {
    return 'Ya existe una rutina con ese nombre.'
  }
  return ''
})

const showNameError = computed(() => touched.value.name && !!nameError.value)

const isValid = computed(() => !nameError.value)

function reset() {
  form.value = makeEmptyForm()
  touched.value = { name: false }
}

function close() { emit('update:open', false) }

function isDirty() {
  const empty = makeEmptyForm()
  return JSON.stringify(form.value) !== JSON.stringify(empty)
}

function handleClose() {
  if (isDirty() && !window.confirm('¿Seguro que querés cerrar? Los datos no se guardarán.')) return
  close()
  setTimeout(reset, 250)
}

function onDialogUpdate(val) {
  if (!val) handleClose()
}

function handleCreate() {
  touched.value.name = true
  if (!isValid.value) {
    nextTick(() => nameInputRef.value?.focus())
    return
  }
  const created = store.addRoutine({
    name:        nameTrimmed.value,
    description: form.value.description.trim(),
    category:    form.value.category,
    icon:        selectedIcon.value,
    trigger:     form.value.trigger.type === 'manual'
      ? { type: 'manual' }
      : { type: 'schedule', time: form.value.trigger.time },
    actions:     [],
    days:        form.value.trigger.type === 'manual' ? [] : form.value.days,
  })
  emit('created', created.id)
  close()
  setTimeout(reset, 250)
}

watch(() => props.open, (val) => {
  if (val) {
    nextTick(() => nameInputRef.value?.focus())
  }
})
</script>

<style scoped>
.create-modal {
  position: relative;
  background: #ffffff;
  border-radius: 18px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, .04),
    0 24px 48px -12px rgba(15, 23, 42, .18),
    0 0 0 1px rgba(15, 23, 42, .04);
  font-family: var(--sh-font);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

:deep(.v-overlay__scrim) {
  background: rgba(15, 23, 42, .42) !important;
  backdrop-filter: blur(2px);
}

.create-modal__close {
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
.create-modal__close:hover {
  background: var(--sh-primary-light);
  color: var(--sh-text-main);
}
.create-modal__close:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

/* Header */
.create-modal__header {
  background: linear-gradient(135deg, var(--sh-primary-light) 0%, #F5F3FF 100%);
  padding: 22px 28px;
  border-radius: 18px 18px 0 0;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-right: 60px;
}
.create-modal__icon {
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
.create-modal__icon :deep(.v-icon) { color: #ffffff !important; }
.create-modal__meta { min-width: 0; }
.create-modal__eyebrow {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--sh-primary);
}
.create-modal__title {
  margin: 4px 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.2;
}
.create-modal__desc {
  margin: 0;
  font-size: 13px;
  color: var(--sh-text-muted);
}

/* Body */
.create-modal__body {
  padding: 22px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-y: auto;
}

/* Field */
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--sh-text-main);
}
.field__optional {
  color: var(--sh-text-light);
  font-weight: 400;
}
.field__input {
  width: 100%;
  height: 42px;
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

/* Category chips */
.cat-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cat-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--sh-border);
  background: #ffffff;
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  cursor: pointer;
  transition: border-color 150ms, background-color 150ms, color 150ms;
}
.cat-chip:hover:not(.cat-chip--active) {
  border-color: var(--sh-text-muted);
  color: var(--sh-text-main);
}
.cat-chip:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
.cat-chip--active {
  background: var(--sh-primary-light);
  border-color: var(--sh-primary);
  color: var(--sh-primary-dark);
}

/* Trigger toggle */
.trigger-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.trigger-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid var(--sh-border);
  background: #ffffff;
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 600;
  color: var(--sh-text-muted);
  cursor: pointer;
  transition: border-color 150ms, background-color 150ms, color 150ms;
}
.trigger-option:hover:not(.trigger-option--active) {
  border-color: var(--sh-text-muted);
  color: var(--sh-text-main);
}
.trigger-option:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
.trigger-option--active {
  background: var(--sh-primary-light);
  border-color: var(--sh-primary);
  color: var(--sh-primary-dark);
}

/* Schedule grid */
.schedule-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 12px;
}
.schedule-card {
  border: 1px solid var(--sh-border);
  border-radius: 12px;
  padding: 14px;
}
.schedule-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.schedule-card__icon {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.schedule-card__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--sh-text-muted);
}

.time-input {
  width: 100%;
  display: block;
  background: #F8FAFC;
  border: 1px solid var(--sh-border);
  border-radius: 8px;
  padding: 9px 12px;
  font-family: var(--sh-font);
  font-size: 14px;
  font-weight: 600;
  color: var(--sh-text-main);
  cursor: pointer;
  outline: none;
  transition: border-color 150ms, background-color 150ms, box-shadow 150ms;
}
.time-input:hover { border-color: var(--sh-primary); background: #ffffff; }
.time-input:focus {
  border-color: var(--sh-primary);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, .15);
}
.time-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: .6;
  transition: opacity 150ms;
}
.time-input:hover::-webkit-calendar-picker-indicator,
.time-input:focus::-webkit-calendar-picker-indicator { opacity: 1; }

/* Footer */
.create-modal__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 16px 28px;
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
.btn-cancel:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 9px;
  border: none;
  background: var(--sh-primary);
  color: #ffffff;
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 8px -2px rgba(99, 102, 241, .3);
  transition: background-color 150ms;
}
.btn-save:hover:not(:disabled) { background: var(--sh-primary-dark); }
.btn-save:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
.btn-save:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
</style>
