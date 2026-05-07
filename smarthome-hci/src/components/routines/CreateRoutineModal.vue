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

      <!-- Header (icon + meta + stepper, all on the violet gradient) -->
      <header class="create-modal__header">
        <div class="create-modal__header-row">
          <div class="create-modal__icon" aria-hidden="true">
            <v-icon :icon="selectedIcon" size="24" />
          </div>
          <div class="create-modal__meta">
            <p class="create-modal__eyebrow">NUEVA RUTINA · PASO {{ step }} DE 2</p>
            <h2 id="create-routine-title" class="create-modal__title">
              {{ step === 1 ? 'Detalles y programación' : 'Acciones de la rutina' }}
            </h2>
            <p class="create-modal__desc">
              {{ step === 1
                ? 'Configurá nombre, categoría y cuándo se ejecuta'
                : 'Agregá las acciones que ejecutará la rutina' }}
            </p>
          </div>
        </div>

        <ol class="stepper" aria-label="Pasos">
          <li class="stepper__item" :class="{ 'stepper__item--active': step === 1, 'stepper__item--done': step > 1 }">
            <span class="stepper__dot">1</span>
            <span class="stepper__label">Detalles</span>
          </li>
          <li class="stepper__bar" aria-hidden="true" />
          <li class="stepper__item" :class="{ 'stepper__item--active': step === 2 }">
            <span class="stepper__dot">2</span>
            <span class="stepper__label">Acciones</span>
          </li>
        </ol>
      </header>

      <!-- Body -->
      <div class="create-modal__body">

        <!-- ── STEP 1 ── -->
        <template v-if="step === 1">
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
        </template>

        <!-- ── STEP 2: actions (inline) ── -->
        <template v-else>
          <ul
            v-if="form.actions.length > 0"
            class="action-list"
            aria-label="Acciones configuradas"
          >
            <li
              v-for="(action, idx) in parsedActions"
              :key="idx"
              class="action-item"
            >
              <span class="action-item__number" aria-hidden="true">{{ idx + 1 }}</span>
              <div
                class="action-item__icon"
                :style="{ background: action.visual.bg, color: action.visual.fg }"
                aria-hidden="true"
              >
                <v-icon :icon="action.visual.icon" size="18" />
              </div>
              <div class="action-item__info">
                <p class="action-item__device">{{ action.device || 'Dispositivo' }}</p>
                <p v-if="action.detail" class="action-item__detail">{{ action.detail }}</p>
              </div>
              <button
                type="button"
                class="action-item__delete"
                :aria-label="`Eliminar acción ${action.device}`"
                @click="removeAction(idx)"
              >
                <v-icon icon="mdi-trash-can-outline" size="14" aria-hidden="true" />
              </button>
            </li>
          </ul>

          <div v-else class="empty-state" role="status">
            <div class="empty-state__icon-wrap" aria-hidden="true">
              <v-icon icon="mdi-flash-off-outline" size="40" />
            </div>
            <p class="empty-state__title">Aún no hay acciones</p>
            <p class="empty-state__subtitle">Tocá "Añadir acción" para empezar</p>
          </div>

          <button
            type="button"
            class="add-action-trigger"
            @click="onAddAction"
          >
            <span class="add-action-trigger__icon" aria-hidden="true">
              <v-icon icon="mdi-plus" size="18" />
            </span>
            <span class="add-action-trigger__body">
              <span class="add-action-trigger__title">Añadir acción</span>
              <span class="add-action-trigger__sub">Elegí dispositivo, acción y valor</span>
            </span>
            <v-icon icon="mdi-chevron-right" size="18" class="add-action-trigger__chevron" aria-hidden="true" />
          </button>
        </template>
      </div>

      <!-- Footer -->
      <footer class="create-modal__footer">
        <div class="create-modal__footer-left">
          <button
            v-if="step === 2"
            type="button"
            class="btn-back"
            @click="step = 1"
          >
            <v-icon icon="mdi-chevron-left" size="16" aria-hidden="true" />
            Atrás
          </button>
        </div>
        <div class="create-modal__footer-right">
          <button type="button" class="btn-cancel" @click="handleClose">Cancelar</button>
          <button
            v-if="step === 1"
            type="button"
            class="btn-save"
            :disabled="!isValid"
            @click="goNext"
          >
            Siguiente
            <v-icon icon="mdi-arrow-right" size="14" aria-hidden="true" />
          </button>
          <button
            v-else
            type="button"
            class="btn-save"
            :disabled="!isValid"
            @click="handleCreate"
          >
            <v-icon icon="mdi-plus" size="14" aria-hidden="true" />
            Crear rutina
          </button>
        </div>
      </footer>
    </div>

  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoutinesStore } from '@/stores/routines'
import WeekdaySelector from './WeekdaySelector.vue'
import { getDeviceVisual, parseActionString } from '@/utils/deviceIcons.js'

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
const step = ref(1)

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

const parsedActions = computed(() =>
  form.value.actions.map(a => {
    const { device, detail } = parseActionString(a)
    return { device, detail, visual: getDeviceVisual(device) }
  })
)

function removeAction(idx) {
  const action = parsedActions.value[idx]
  const label = action?.device || `acción ${idx + 1}`
  if (!window.confirm(`¿Eliminar "${label}"?`)) return
  form.value.actions.splice(idx, 1)
}

function onAddAction() {
  // TODO: builder de acciones (dispositivo + acción + valor)
  window.alert('Builder de acciones — próximamente')
}

function reset() {
  form.value = makeEmptyForm()
  touched.value = { name: false }
  step.value = 1
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

function goNext() {
  touched.value.name = true
  if (!isValid.value) {
    nextTick(() => nameInputRef.value?.focus())
    return
  }
  step.value = 2
}

function handleCreate() {
  if (!isValid.value) return
  const created = store.addRoutine({
    name:        nameTrimmed.value,
    description: form.value.description.trim(),
    category:    form.value.category,
    icon:        selectedIcon.value,
    trigger:     form.value.trigger.type === 'manual'
      ? { type: 'manual' }
      : { type: 'schedule', time: form.value.trigger.time },
    actions:     [...form.value.actions],
    days:        form.value.trigger.type === 'manual' ? [] : form.value.days,
  })
  emit('created', created.id)
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
.create-modal {
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
  padding: 18px 28px 14px;
  border-radius: 18px 18px 0 0;
}
.create-modal__header-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-right: 40px;
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

/* Stepper */
.stepper {
  margin: 14px auto 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 14px;
}
.stepper__item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--sh-text-light);
}
.stepper__label { line-height: 1; }
.stepper__dot {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .7);
  color: var(--sh-text-light);
  border: 1.5px solid var(--sh-border);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 13px;
  transition: background-color 150ms, color 150ms, border-color 150ms, box-shadow 150ms;
}
.stepper__item--active .stepper__dot,
.stepper__item--done .stepper__dot {
  background: #A5B4FC;
  color: #fff;
  border-color: #A5B4FC;
  box-shadow: 0 3px 8px -2px rgba(165, 180, 252, .5);
}
.stepper__item--active .stepper__label,
.stepper__item--done .stepper__label {
  color: #6366F1;
}
.stepper__bar {
  flex: 0 0 90px;
  height: 2px;
  background: var(--sh-border);
  border-radius: 2px;
  margin-top: 15px;
  transition: background-color 200ms;
}
.stepper:has(.stepper__item--done) .stepper__bar {
  background: #A5B4FC;
}

/* Body */
.create-modal__body {
  padding: 16px 28px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: visible;
  min-height: 440px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field__label { font-size: 12px; font-weight: 600; color: var(--sh-text-main); }
.field__optional { color: var(--sh-text-light); font-weight: 400; }
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
  display: flex; align-items: center; gap: 4px;
  margin: 0;
  font-size: 12px;
  color: var(--sh-error);
}

.cat-grid { display: flex; flex-wrap: wrap; gap: 8px; }
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
.cat-chip:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.cat-chip--active {
  background: var(--sh-primary-light);
  border-color: var(--sh-primary);
  color: var(--sh-primary-dark);
}

.trigger-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.trigger-option {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 34px; border-radius: 8px;
  border: 1px solid var(--sh-border);
  background: #ffffff;
  font-family: var(--sh-font);
  font-size: 12px; font-weight: 600;
  color: var(--sh-text-muted);
  cursor: pointer;
  transition: border-color 150ms, background-color 150ms, color 150ms;
}
.trigger-option:hover:not(.trigger-option--active) {
  border-color: var(--sh-text-muted);
  color: var(--sh-text-main);
}
.trigger-option:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.trigger-option--active {
  background: var(--sh-primary-light);
  border-color: var(--sh-primary);
  color: var(--sh-primary-dark);
}

.schedule-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 10px; }
.schedule-card { border: 1px solid var(--sh-border); border-radius: 12px; padding: 10px 12px; }
.schedule-card__head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.schedule-card__icon {
  width: 26px; height: 26px;
  border-radius: 7px;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  display: flex; align-items: center; justify-content: center;
}
.schedule-card__label { font-size: 12px; font-weight: 500; color: var(--sh-text-muted); }

.time-input {
  width: 100%;
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

/* Action list (inline) */
.action-list { list-style: none; margin: 0; padding: 0; }
.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--sh-border);
  border-radius: 12px;
  margin-bottom: 8px;
  transition: border-color 150ms;
}
.action-item:last-child { margin-bottom: 0; }
.action-item:hover { border-color: var(--sh-text-muted); }
.action-item:hover .action-item__delete,
.action-item:focus-within .action-item__delete { opacity: 1; }
.action-item__number {
  width: 24px; height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #F1F5F9;
  color: var(--sh-text-light);
  font-size: 11px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.action-item__icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.action-item__info { flex: 1; min-width: 0; }
.action-item__device {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--sh-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.action-item__detail {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--sh-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.action-item__delete {
  width: 28px; height: 28px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--sh-text-light);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0;
  flex-shrink: 0;
  transition: opacity 150ms, background-color 150ms, color 150ms;
}
.action-item__delete:hover { background: rgba(239, 68, 68, .12); color: var(--sh-error); }

/* Empty state */
.empty-state { text-align: center; padding: 24px 16px; }
.empty-state__icon-wrap {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: #F1F5F9;
  color: var(--sh-text-light);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto;
}
.empty-state__title { margin: 12px 0 0; font-size: 14px; font-weight: 600; color: var(--sh-text-main); }
.empty-state__subtitle { margin: 4px 0 0; font-size: 12px; color: var(--sh-text-muted); }

/* Add action — full-width trigger to match AddDeviceModal style */
.add-action-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px dashed var(--sh-border);
  background: #ffffff;
  cursor: pointer;
  font-family: var(--sh-font);
  text-align: left;
  transition: border-color 150ms, background-color 150ms, color 150ms;
}
.add-action-trigger:hover {
  border-color: var(--sh-primary);
  background: var(--sh-primary-light);
}
.add-action-trigger:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.add-action-trigger__icon {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: #F1F5F9;
  color: var(--sh-text-muted);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background-color 150ms, color 150ms;
}
.add-action-trigger:hover .add-action-trigger__icon {
  background: var(--sh-primary);
  color: #fff;
}
.add-action-trigger__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.add-action-trigger__title { font-size: 13px; font-weight: 700; color: var(--sh-text-main); }
.add-action-trigger__sub { font-size: 11px; color: var(--sh-text-light); }
.add-action-trigger__chevron { color: var(--sh-text-light); flex-shrink: 0; }
.add-action-trigger:hover .add-action-trigger__chevron { color: var(--sh-primary); }

/* Footer */
.create-modal__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 16px 28px;
  border-top: 1px solid var(--sh-border);
  background: #F8FAFC;
  border-radius: 0 0 18px 18px;
}
.create-modal__footer-left,
.create-modal__footer-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-back {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 9px 12px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms, color 150ms;
}
.btn-back:hover { background: #F1F5F9; color: var(--sh-text-main); }
.btn-back:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.btn-cancel {
  display: inline-flex; align-items: center; gap: 6px;
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
