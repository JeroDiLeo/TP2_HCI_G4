<template>
  <v-dialog
    :model-value="open"
    width="720"
    @update:model-value="onDialogUpdate"
  >
    <div
      v-if="form"
      class="edit-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-routine-title"
      aria-describedby="edit-routine-desc"
    >
      <!-- Close -->
      <button
        type="button"
        class="edit-modal__close"
        aria-label="Cerrar"
        @click="handleClose"
      >
        <v-icon icon="mdi-close" size="14" aria-hidden="true" />
      </button>

      <!-- Header -->
      <header class="edit-modal__header">
        <div class="edit-modal__header-row">
          <div class="edit-modal__icon" aria-hidden="true">
            <v-icon :icon="form.icon" size="28" color="white" />
          </div>

          <div class="edit-modal__meta">
            <p class="edit-modal__eyebrow">{{ form.category.toUpperCase() }}</p>
            <label for="edit-routine-title" class="sr-only">Nombre de la rutina</label>
            <input
              id="edit-routine-title"
              v-model="form.name"
              type="text"
              class="edit-modal__title-input"
              maxlength="40"
              autocomplete="off"
              :aria-invalid="!isValidName"
            />
            <label for="edit-routine-desc" class="sr-only">Descripción de la rutina</label>
            <input
              id="edit-routine-desc"
              v-model="form.description"
              type="text"
              class="edit-modal__desc-input"
              maxlength="80"
              autocomplete="off"
              placeholder="Sin descripción"
            />
          </div>
        </div>

      </header>

      <!-- Body -->
      <div class="edit-modal__body">
        <!-- Programación -->
        <section v-if="form.trigger.type === 'schedule'" class="section">
          <h3 class="section__title">Programación</h3>
          <div class="schedule-grid">
            <!-- Hora -->
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

            <!-- Repetición -->
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
        </section>

        <!-- Acciones -->
        <section class="section">
          <h3 class="section__title">Acciones</h3>
          <button
            type="button"
            class="actions-summary"
            :aria-label="actionsSummaryLabel"
            @click="openActionsSubModal"
          >
            <div class="actions-summary__icon" aria-hidden="true">
              <v-icon icon="mdi-flash" size="20" />
            </div>
            <div class="actions-summary__info">
              <p class="actions-summary__title">{{ actionsTitle }}</p>
              <p v-if="form.actions.length > 0" class="actions-summary__detail">
                {{ actionsDetail }}
              </p>
              <div v-if="form.actions.length > 0" class="actions-summary__chips" aria-hidden="true">
                <span
                  v-for="(action, idx) in actionMiniIcons"
                  :key="idx"
                  class="actions-summary__chip"
                  :style="{ background: action.bg, color: action.fg }"
                >
                  <v-icon :icon="action.icon" size="14" />
                </span>
              </div>
            </div>
            <v-icon icon="mdi-chevron-right" size="18" class="actions-summary__chevron" aria-hidden="true" />
          </button>
        </section>
      </div>

      <!-- Footer -->
      <footer class="edit-modal__footer">
        <div class="edit-modal__footer-left">
          <button type="button" class="btn-text btn-text--danger" @click="handleDelete">
            <v-icon icon="mdi-trash-can-outline" size="14" aria-hidden="true" />
            Eliminar
          </button>
          <button type="button" class="btn-text btn-text--muted" @click="handleDuplicate">
            <v-icon icon="mdi-content-duplicate" size="14" aria-hidden="true" />
            Duplicar
          </button>
        </div>
        <div class="edit-modal__footer-right">
          <button type="button" class="btn-cancel" @click="handleClose">Cancelar</button>
          <button
            type="button"
            class="btn-save"
            :disabled="!canSave"
            @click="handleSave"
          >
            <v-icon icon="mdi-check" size="14" aria-hidden="true" />
            Guardar cambios
          </button>
        </div>
      </footer>
    </div>

    <!-- Sub-modal de acciones -->
    <EditActionsSubModal
      v-if="form"
      :open="actionsSubOpen"
      :actions="form.actions"
      :routine-name="form.name"
      @update:open="actionsSubOpen = $event"
      @update:actions="onActionsUpdated"
    />
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoutinesStore } from '@/stores/routines'
import WeekdaySelector from './WeekdaySelector.vue'
import EditActionsSubModal from './EditActionsSubModal.vue'
import { getDeviceVisual, parseActionString } from '@/utils/deviceIcons.js'

const props = defineProps({
  routineId: { type: String, default: null },
  open:      { type: Boolean, default: false },
})
const emit = defineEmits(['update:open'])

const store = useRoutinesStore()

const original = computed(() =>
  store.routines.find(r => r.id === props.routineId) ?? null
)

const form = ref(null)
const actionsSubOpen = ref(false)

watch(
  () => [props.open, props.routineId],
  ([open]) => {
    if (open && original.value) {
      form.value = JSON.parse(JSON.stringify(original.value))
    } else if (!open) {
      // Defer reset slightly so closing animation doesn't flash empty content.
      setTimeout(() => { if (!props.open) form.value = null }, 250)
    }
  },
  { immediate: true }
)

// ── Validation / change detection ──
const isValidName = computed(() => {
  const n = form.value?.name?.trim() ?? ''
  return n.length >= 2 && n.length <= 40
})
const hasChanges = computed(() =>
  !!form.value && !!original.value &&
  JSON.stringify(form.value) !== JSON.stringify(original.value)
)
const canSave = computed(() => hasChanges.value && isValidName.value)

// ── Actions summary ──
const actionsTitle = computed(() => {
  const n = form.value?.actions?.length ?? 0
  if (n === 0) return 'Sin acciones configuradas'
  return `${n} ${n === 1 ? 'acción configurada' : 'acciones configuradas'}`
})

const actionsDetail = computed(() => {
  const list = (form.value?.actions ?? []).map(a => parseActionString(a).device)
  const visible = list.slice(0, 2).filter(Boolean).join(' · ')
  const extra = list.length > 2 ? ` y ${list.length - 2} más` : ''
  return visible + extra
})

const actionsSummaryLabel = computed(() =>
  `Editar acciones — ${actionsTitle.value}`
)

const actionMiniIcons = computed(() =>
  (form.value?.actions ?? []).slice(0, 4).map(a => getDeviceVisual(parseActionString(a).device))
)

// ── Handlers ──
function close() { emit('update:open', false) }

function handleClose() {
  if (hasChanges.value && !window.confirm('Hay cambios sin guardar. ¿Cerrar igual?')) return
  close()
}

function onDialogUpdate(val) {
  if (!val) handleClose()
}

function handleSave() {
  if (!canSave.value || !form.value) return
  store.updateRoutine(form.value.id, JSON.parse(JSON.stringify(form.value)))
  close()
}

function handleDelete() {
  if (!form.value) return
  if (!window.confirm(`¿Eliminar la rutina "${form.value.name}"?`)) return
  store.removeRoutine(form.value.id)
  close()
}

function handleDuplicate() {
  if (!form.value) return
  store.duplicateRoutine(form.value.id)
  close()
}

function openActionsSubModal() { actionsSubOpen.value = true }

function onActionsUpdated(newActions) {
  if (form.value) form.value.actions = newActions
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

/* Modal shell */
.edit-modal {
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

/* Close */
.edit-modal__close {
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
.edit-modal__close:hover {
  background: var(--sh-primary-light);
  color: var(--sh-text-main);
}
.edit-modal__close:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

/* Header */
.edit-modal__header {
  background: linear-gradient(135deg, var(--sh-primary-light) 0%, #F5F3FF 100%);
  padding: 24px 28px;
  border-radius: 18px 18px 0 0;
}
.edit-modal__header-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding-right: 40px;
}
.edit-modal__icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--sh-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 16px -4px rgba(99, 102, 241, .4);
}
.edit-modal__icon :deep(.v-icon) { color: #ffffff !important; }

.edit-modal__meta { flex: 1; min-width: 0; }
.edit-modal__eyebrow {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--sh-primary);
}

/* Title input (inline-editable) */
.edit-modal__title-input,
.edit-modal__desc-input {
  width: 100%;
  border: 1.5px solid transparent;
  background: transparent;
  font-family: var(--sh-font);
  color: var(--sh-text-main);
  outline: none;
  border-radius: 8px;
  margin-left: -8px;
  transition: background-color 150ms, border-color 150ms, box-shadow 150ms;
}
.edit-modal__title-input {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  padding: 4px 10px 4px 8px;
  margin-top: 2px;
}
.edit-modal__desc-input {
  font-size: 13px;
  color: var(--sh-text-muted);
  line-height: 1.4;
  padding: 4px 10px 4px 8px;
  margin-top: 2px;
}
.edit-modal__title-input:hover,
.edit-modal__desc-input:hover {
  background: rgba(255, 255, 255, .5);
}
.edit-modal__title-input:focus,
.edit-modal__desc-input:focus {
  background: #ffffff;
  border-color: var(--sh-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, .15);
}
.edit-modal__title-input[aria-invalid="true"]:focus {
  border-color: var(--sh-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, .12);
}

/* Body */
.edit-modal__body {
  padding: 22px 28px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  overflow-y: auto;
}

.section__title {
  margin: 0 0 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sh-text-muted);
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

/* Time input */
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
.time-input:focus::-webkit-calendar-picker-indicator {
  opacity: 1;
}

/* Actions summary card */
.actions-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  border: 1px solid var(--sh-border);
  border-radius: 12px;
  padding: 14px;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  font-family: var(--sh-font);
  transition: border-color 150ms, box-shadow 150ms;
}
.actions-summary:hover {
  border-color: var(--sh-primary);
  box-shadow: 0 2px 8px rgba(99, 102, 241, .08);
}
.actions-summary:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
.actions-summary__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--sh-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.actions-summary__icon :deep(.v-icon) { color: #ffffff !important; }
.actions-summary__info { flex: 1; min-width: 0; }
.actions-summary__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--sh-text-main);
}
.actions-summary__detail {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--sh-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.actions-summary__chips {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}
.actions-summary__chip {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.actions-summary__chevron {
  color: var(--sh-text-light);
  flex-shrink: 0;
}

/* Footer */
.edit-modal__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  border-top: 1px solid var(--sh-border);
  background: #F8FAFC;
  border-radius: 0 0 18px 18px;
}
.edit-modal__footer-left,
.edit-modal__footer-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms, color 150ms;
}
.btn-text:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
.btn-text--danger { color: var(--sh-error); }
.btn-text--danger:hover { background: rgba(239, 68, 68, .12); }
.btn-text--muted { color: var(--sh-text-muted); }
.btn-text--muted:hover { background: #F1F5F9; color: var(--sh-text-main); }

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
