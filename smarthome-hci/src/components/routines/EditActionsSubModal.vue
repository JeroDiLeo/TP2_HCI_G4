<template>
  <v-dialog
    :model-value="open"
    width="540"
    :z-index="2400"
    @update:model-value="onDialogUpdate"
  >
    <div
      class="sub-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-actions-title"
      aria-describedby="edit-actions-desc"
    >
      <button
        type="button"
        class="sub-modal__close"
        aria-label="Cerrar acciones"
        @click="close"
      >
        <v-icon icon="mdi-close" size="14" aria-hidden="true" />
      </button>

      <!-- Header -->
      <header class="sub-modal__header">
        <div class="sub-modal__icon" aria-hidden="true">
          <v-icon icon="mdi-flash" size="22" />
        </div>
        <div class="sub-modal__meta">
          <p class="sub-modal__eyebrow">{{ (routineName || 'Rutina').toUpperCase() }}</p>
          <h2 id="edit-actions-title" class="sub-modal__title">Acciones de la rutina</h2>
          <p id="edit-actions-desc" class="sub-modal__desc">
            Se ejecutarán en orden al activar la rutina
          </p>
        </div>
      </header>

      <!-- Body -->
      <div class="sub-modal__body">
        <ul
          v-if="localActions.length > 0"
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
              :style="{
                background: action.visual.bg,
                color: action.visual.fg,
              }"
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
            <v-icon icon="mdi-flash-off-outline" size="48" />
          </div>
          <p class="empty-state__title">Aún no agregaste acciones a esta rutina</p>
          <p class="empty-state__subtitle">Tocá "Añadir acción" para empezar</p>
        </div>
      </div>

      <!-- Footer -->
      <footer class="sub-modal__footer">
        <button
          type="button"
          class="btn-add-action"
          @click="onAddAction"
        >
          <v-icon icon="mdi-plus" size="16" aria-hidden="true" />
          Añadir acción
        </button>

        <button
          type="button"
          class="btn-done"
          @click="confirm"
        >
          Listo
        </button>
      </footer>
    </div>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getDeviceVisual, parseActionString } from '@/utils/deviceIcons.js'

const props = defineProps({
  open:        { type: Boolean, default: false },
  actions:     { type: Array,   default: () => [] },
  routineName: { type: String,  default: '' },
})
const emit = defineEmits(['update:open', 'update:actions'])

const localActions = ref([...props.actions])

watch(() => props.open, (val) => {
  if (val) localActions.value = [...props.actions]
})

const parsedActions = computed(() =>
  localActions.value.map(a => {
    const { device, detail } = parseActionString(a)
    return { device, detail, visual: getDeviceVisual(device) }
  })
)

function removeAction(idx) {
  const action = parsedActions.value[idx]
  const label = action?.device || `acción ${idx + 1}`
  if (!window.confirm(`¿Eliminar "${label}"?`)) return
  localActions.value.splice(idx, 1)
}

function onAddAction() {
  // TODO: builder de acciones (dispositivo + acción + valor) — fuera del scope de esta entrega.
  window.alert('Builder de acciones — próximamente')
}

function close() {
  emit('update:open', false)
}

function confirm() {
  emit('update:actions', [...localActions.value])
  emit('update:open', false)
}

function onDialogUpdate(val) {
  if (!val) close()
}
</script>

<style scoped>
.sub-modal {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid var(--sh-border);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, .04),
    0 24px 48px -12px rgba(15, 23, 42, .18);
  position: relative;
  font-family: var(--sh-font);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

:deep(.v-overlay__scrim) {
  background: rgba(15, 23, 42, .42) !important;
  backdrop-filter: blur(2px);
}

/* Close */
.sub-modal__close {
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
  z-index: 1;
}
.sub-modal__close:hover {
  background: var(--sh-primary-light);
  color: var(--sh-text-main);
}
.sub-modal__close:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

/* Header */
.sub-modal__header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 22px 60px 18px 24px;
  border-bottom: 1px solid var(--sh-border);
}
.sub-modal__icon {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: var(--sh-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sub-modal__icon :deep(.v-icon) { color: #ffffff !important; }
.sub-modal__meta { min-width: 0; }
.sub-modal__eyebrow {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--sh-text-light);
  text-transform: uppercase;
}
.sub-modal__title {
  margin: 4px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.2;
}
.sub-modal__desc {
  margin: 0;
  font-size: 12px;
  color: var(--sh-text-muted);
}

/* Body */
.sub-modal__body {
  padding: 16px 24px;
  overflow-y: auto;
  flex: 1 1 auto;
}

/* Action list */
.action-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--sh-border);
  border-radius: 12px;
  margin-bottom: 8px;
  transition: border-color 150ms, box-shadow 150ms;
}
.action-item:last-child { margin-bottom: 0; }
.action-item:hover {
  border-color: var(--sh-text-muted);
}
.action-item:hover .action-item__delete,
.action-item:focus-within .action-item__delete {
  opacity: 1;
}

.action-item__number {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #F1F5F9;
  color: var(--sh-text-light);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-item__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-item__info {
  flex: 1;
  min-width: 0;
}
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
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--sh-text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  flex-shrink: 0;
  transition: opacity 150ms, background-color 150ms, color 150ms;
}
.action-item__delete:hover {
  background: rgba(239, 68, 68, .12);
  color: var(--sh-error);
}
.action-item__delete:focus-visible {
  opacity: 1;
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 32px 16px;
}
.empty-state__icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #F1F5F9;
  color: var(--sh-text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
.empty-state__title {
  margin: 16px 0 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--sh-text-main);
}
.empty-state__subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--sh-text-muted);
}

/* Footer */
.sub-modal__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  border-top: 1px solid var(--sh-border);
  background: #F8FAFC;
  border-radius: 0 0 18px 18px;
}

.btn-add-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--sh-primary);
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms;
}
.btn-add-action:hover { background: var(--sh-primary-light); }
.btn-add-action:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

.btn-done {
  padding: 9px 18px;
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
.btn-done:hover { background: var(--sh-primary-dark); }
.btn-done:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
</style>
