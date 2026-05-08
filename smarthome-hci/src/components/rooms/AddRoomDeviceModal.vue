<template>
  <v-dialog
    :model-value="open"
    width="640"
    @update:model-value="onDialogUpdate"
  >
    <div class="add-modal" role="dialog" aria-modal="true" aria-labelledby="add-room-device-title">

      <button
        type="button"
        class="add-modal__close"
        aria-label="Cerrar"
        @click="handleClose"
      >
        <v-icon icon="mdi-close" size="14" aria-hidden="true" />
      </button>

      <!-- Header -->
      <header class="add-modal__header">
        <div class="add-modal__header-row">
          <div class="add-modal__icon" aria-hidden="true">
            <v-icon :icon="headerIcon" size="24" />
          </div>
          <div class="add-modal__meta">
            <p class="add-modal__eyebrow">AGREGAR DISPOSITIVOS · PASO {{ step }} DE 2</p>
            <h2 id="add-room-device-title" class="add-modal__title">{{ stepTitle }}</h2>
            <p class="add-modal__desc">{{ stepDesc }}</p>
          </div>
        </div>

        <ol class="stepper" aria-label="Pasos">
          <li class="stepper__item" :class="stepClass(1)">
            <span class="stepper__dot">1</span>
            <span class="stepper__label">Dispositivos</span>
          </li>
          <li class="stepper__bar" aria-hidden="true" />
          <li class="stepper__item" :class="stepClass(2)">
            <span class="stepper__dot">2</span>
            <span class="stepper__label">Revisión</span>
          </li>
        </ol>
      </header>

      <!-- Body -->
      <div class="add-modal__body">

        <!-- ── STEP 1: pick types + add named instances ── -->
        <template v-if="step === 1">
          <div>
            <p class="section-label">
              Tipos disponibles
              <span class="section-label__hint">Tocá uno para agregarlo</span>
            </p>
            <div class="device-grid" role="group" aria-label="Tipos de dispositivo">
              <button
                v-for="d in DEVICE_CATALOG"
                :key="d.type"
                type="button"
                class="device-tile"
                :class="{ 'device-tile--has': instanceCount(d.type) > 0 }"
                :aria-label="`Agregar ${d.label}`"
                @click="addDeviceInstance(d.type)"
              >
                <span v-if="instanceCount(d.type) > 0" class="device-tile__count" aria-hidden="true">
                  {{ instanceCount(d.type) }}
                </span>
                <span class="device-tile__icon" aria-hidden="true">
                  <v-icon :icon="d.icon" size="20" />
                </span>
                <span class="device-tile__label">{{ d.label }}</span>
              </button>
            </div>
          </div>

          <div class="added-section">
            <p class="section-label">
              Dispositivos agregados
              <span class="section-count">{{ instances.length }}</span>
            </p>

            <ul v-if="instances.length > 0" class="added-list">
              <li
                v-for="(inst, idx) in instances"
                :key="inst.id"
                class="added-item"
              >
                <span class="added-item__icon" aria-hidden="true">
                  <v-icon :icon="deviceIcon(inst.type)" size="16" />
                </span>
                <input
                  v-model="inst.name"
                  type="text"
                  class="added-item__name"
                  :placeholder="deviceLabel(inst.type)"
                  maxlength="30"
                  :aria-label="`Nombre del ${deviceLabel(inst.type)}`"
                />
                <span class="added-item__type">{{ deviceLabel(inst.type) }}</span>
                <button
                  type="button"
                  class="added-item__del"
                  :aria-label="`Eliminar ${inst.name || deviceLabel(inst.type)}`"
                  @click="removeInstance(idx)"
                >
                  <v-icon icon="mdi-trash-can-outline" size="14" aria-hidden="true" />
                </button>
              </li>
            </ul>

            <div v-else class="empty-added" role="status">
              <span class="empty-added__icon" aria-hidden="true">
                <v-icon icon="mdi-power-plug-off-outline" size="22" />
              </span>
              <p>Elegí un tipo de dispositivo de arriba para agregarlo.</p>
            </div>
          </div>

          <p v-if="stepError" class="step-error" role="alert">{{ stepError }}</p>
        </template>

        <!-- ── STEP 2: review ── -->
        <template v-else>
          <div class="summary-card">
            <p class="summary-card__label">Habitación</p>
            <div class="summary-room">
              <span class="summary-room__icon" aria-hidden="true">
                <v-icon :icon="roomIcon" size="18" />
              </span>
              <p class="summary-room__name">{{ roomName }}</p>
            </div>
          </div>

          <div class="summary-card">
            <p class="summary-card__label">
              Dispositivos
              <span class="summary-card__count">{{ instances.length }}</span>
            </p>
            <ul v-if="instances.length > 0" class="summary-list">
              <li v-for="inst in instances" :key="inst.id" class="summary-row">
                <span class="summary-row__icon" aria-hidden="true">
                  <v-icon :icon="deviceIcon(inst.type)" size="14" />
                </span>
                <span class="summary-row__name">{{ inst.name || deviceLabel(inst.type) }}</span>
                <span class="summary-row__type">{{ deviceLabel(inst.type) }}</span>
              </li>
            </ul>
            <p v-else class="summary-empty">Sin dispositivos seleccionados.</p>
          </div>
        </template>

      </div>

      <!-- Footer -->
      <footer class="add-modal__footer">
        <div class="add-modal__footer-left">
          <button
            v-if="step > 1"
            type="button"
            class="btn-back"
            @click="prevStep"
          >
            <v-icon icon="mdi-chevron-left" size="16" aria-hidden="true" />
            Atrás
          </button>
        </div>
        <div class="add-modal__footer-right">
          <button type="button" class="btn-cancel" @click="handleClose">Cancelar</button>
          <button
            v-if="step < 2"
            type="button"
            class="btn-save"
            :disabled="instances.length === 0"
            @click="nextStep"
          >
            Siguiente
            <v-icon icon="mdi-arrow-right" size="14" aria-hidden="true" />
          </button>
          <button
            v-else
            type="button"
            class="btn-save"
            :disabled="instances.length === 0"
            @click="handleConfirm"
          >
            <v-icon icon="mdi-check" size="14" aria-hidden="true" />
            {{ instances.length === 1 ? 'Agregar dispositivo' : 'Agregar dispositivos' }}
          </button>
        </div>
      </footer>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDevicesStore } from '@/stores/devices'
import { resolveTypeId } from '@/utils/deviceMapper'
import type { RoomDeviceType } from '@/types/rooms'

const props = defineProps<{
  open: boolean
  roomId: string
  roomName: string
  roomIcon: string
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'added'): void
}>()

const devicesStore = useDevicesStore()

// ── Catalog ──

const DEVICE_CATALOG = [
  { type: 'vacuum',  label: 'Aspiradora',  icon: 'mdi-robot-vacuum'        },
  { type: 'speaker', label: 'Parlante',    icon: 'mdi-speaker'             },
  { type: 'faucet',  label: 'Grifo',       icon: 'mdi-water-pump'          },
  { type: 'blind',   label: 'Persiana',    icon: 'mdi-blinds'              },
  { type: 'light',   label: 'Lámpara',     icon: 'mdi-lightbulb-outline'   },
  { type: 'oven',    label: 'Horno',       icon: 'mdi-stove'               },
  { type: 'ac',      label: 'Aire acond.', icon: 'mdi-air-conditioner'     },
  { type: 'door',    label: 'Puerta',      icon: 'mdi-door'                },
  { type: 'alarm',   label: 'Alarma',      icon: 'mdi-alarm-light-outline' },
  { type: 'fridge',  label: 'Heladera',    icon: 'mdi-fridge-outline'      },
] as const

// ── State ──

interface Instance { id: string; type: string; name: string }

const step = ref<1 | 2>(1)
const instances = ref<Instance[]>([])
const stepError = ref('')

// ── Helpers ──

function deviceIcon(type: string) {
  return DEVICE_CATALOG.find(d => d.type === type)?.icon ?? 'mdi-help-circle-outline'
}
function deviceLabel(type: string) {
  return DEVICE_CATALOG.find(d => d.type === type)?.label ?? type
}
function instanceCount(type: string) {
  return instances.value.filter(i => i.type === type).length
}
function defaultNameFor(type: string) {
  const base = deviceLabel(type)
  const sameType = instances.value.filter(i => i.type === type).length
  return sameType === 0 ? base : `${base} ${sameType + 1}`
}

// ── Actions ──

function addDeviceInstance(type: string) {
  instances.value.push({
    id: `dev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    name: defaultNameFor(type),
  })
  stepError.value = ''
}

function removeInstance(idx: number) {
  instances.value.splice(idx, 1)
}

// ── Step header ──

const stepTitle = computed(() =>
  step.value === 1 ? '¿Qué dispositivos?' : 'Revisión'
)
const stepDesc = computed(() =>
  step.value === 1
    ? `Agregá dispositivos a ${props.roomName}`
    : 'Confirmá antes de agregar los dispositivos'
)
const headerIcon = computed(() =>
  step.value === 1 ? 'mdi-power-plug-outline' : 'mdi-check-circle-outline'
)

function stepClass(n: number) {
  return {
    'stepper__item--active': step.value === n,
    'stepper__item--done':   step.value > n,
  }
}

// ── Navigation ──

function nextStep() {
  if (instances.value.length === 0) {
    stepError.value = 'Agregá al menos un dispositivo.'
    return
  }
  stepError.value = ''
  step.value = 2
}

function prevStep() {
  stepError.value = ''
  step.value = 1
}

// ── Confirm / close ──

async function handleConfirm() {
  for (const inst of instances.value) {
    const name = inst.name.trim() || deviceLabel(inst.type)
    const typeId = resolveTypeId(inst.type as RoomDeviceType)
    if (!typeId) continue

    try {
      await devicesStore.addDevice({
        name,
        type: inst.type as RoomDeviceType,
        roomId: props.roomId,
      })
    } catch (err) {
      console.error(`Error al crear dispositivo "${name}":`, err)
    }
  }

  emit('added')
  close()
}

function close() {
  emit('update:open', false)
  setTimeout(reset, 250)
}

function handleClose() { close() }

function onDialogUpdate(val: boolean) {
  if (!val) close()
}

function reset() {
  step.value = 1
  instances.value = []
  stepError.value = ''
}

watch(() => props.open, (val) => {
  if (val) reset()
})
</script>

<style scoped>
.add-modal {
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

.add-modal__close {
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
.add-modal__close:hover {
  background: var(--sh-primary-light);
  color: var(--sh-text-main);
}
.add-modal__close:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

/* ── Header ── */
.add-modal__header {
  background: linear-gradient(135deg, var(--sh-primary-light) 0%, #F5F3FF 100%);
  padding: 18px 28px 14px;
  border-radius: 18px 18px 0 0;
}
.add-modal__header-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-right: 40px;
}
.add-modal__icon {
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
.add-modal__icon :deep(.v-icon) { color: #ffffff !important; }
.add-modal__meta { min-width: 0; flex: 1; }
.add-modal__eyebrow {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--sh-primary);
}
.add-modal__title {
  margin: 4px 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.2;
}
.add-modal__desc {
  margin: 0;
  font-size: 13px;
  color: var(--sh-text-muted);
}

/* ── Stepper ── */
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  flex: 0 0 60px;
  height: 2px;
  background: var(--sh-border);
  border-radius: 2px;
  margin-top: 15px;
  transition: background-color 200ms;
}

/* ── Body ── */
.add-modal__body {
  padding: 16px 28px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: visible;
  min-height: 380px;
}

/* ── Device tile grid ── */
.section-label {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--sh-text-main);
  display: flex;
  align-items: center;
  gap: 6px;
}
.section-label__hint {
  font-weight: 500;
  font-size: 11px;
  color: var(--sh-text-light);
}
.section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--sh-primary-light);
  color: var(--sh-primary-dark);
  font-size: 10px;
  font-weight: 700;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
.device-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 10px;
  border: 1.5px solid var(--sh-border);
  background: #ffffff;
  font-family: var(--sh-font);
  cursor: pointer;
  transition: border-color 150ms, background-color 150ms, transform 100ms;
}
.device-tile:hover {
  border-color: var(--sh-primary);
  background: var(--sh-primary-light);
}
.device-tile:active { transform: scale(0.97); }
.device-tile:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.device-tile--has {
  border-color: var(--sh-primary);
  background: var(--sh-primary-light);
}
.device-tile__icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  background: #F1F5F9;
  color: var(--sh-text-muted);
  display: flex; align-items: center; justify-content: center;
  transition: background-color 150ms, color 150ms;
}
.device-tile:hover .device-tile__icon,
.device-tile--has .device-tile__icon {
  background: var(--sh-primary);
  color: #fff;
}
.device-tile__label {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--sh-text-main);
  line-height: 1.2;
  text-align: center;
}
.device-tile__count {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--sh-primary);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(99, 102, 241, .3);
}

/* ── Added list ── */
.added-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-height: 0;
}
.added-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}
.added-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--sh-border);
  border-radius: 10px;
  background: #ffffff;
}
.added-item__icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.added-item__name {
  flex: 1;
  min-width: 0;
  height: 30px;
  border: 1px solid transparent;
  border-radius: 7px;
  padding: 0 8px;
  background: transparent;
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 600;
  color: var(--sh-text-main);
  outline: none;
  transition: border-color 150ms, background-color 150ms;
}
.added-item__name:hover { background: #F8FAFC; }
.added-item__name:focus {
  border-color: var(--sh-primary);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, .12);
}
.added-item__type {
  font-size: 11px;
  color: var(--sh-text-light);
  white-space: nowrap;
  flex-shrink: 0;
}
.added-item__del {
  width: 28px; height: 28px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--sh-text-light);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background-color 150ms, color 150ms;
}
.added-item__del:hover { background: rgba(239, 68, 68, .12); color: var(--sh-error); }

.empty-added {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px dashed var(--sh-border);
  background: #F8FAFC;
  color: var(--sh-text-muted);
}
.empty-added__icon {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: #F1F5F9;
  color: var(--sh-text-light);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.empty-added p { margin: 0; font-size: 12px; line-height: 1.4; }

/* ── Summary ── */
.summary-card {
  border: 1px solid var(--sh-border);
  border-radius: 12px;
  padding: 12px 14px;
  background: #F8FAFC;
}
.summary-card__label {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--sh-text-muted);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;
}
.summary-card__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--sh-primary-light);
  color: var(--sh-primary-dark);
  font-size: 10px;
}
.summary-room {
  display: flex;
  align-items: center;
  gap: 10px;
}
.summary-room__icon {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: var(--sh-primary);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.summary-room__name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--sh-text-main);
}
.summary-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 180px;
  overflow-y: auto;
}
.summary-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--sh-text-main);
}
.summary-row__icon {
  width: 24px; height: 24px;
  border-radius: 6px;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  display: flex; align-items: center; justify-content: center;
}
.summary-row__name { flex: 1; min-width: 0; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.summary-row__type { font-size: 11px; color: var(--sh-text-light); }
.summary-empty {
  margin: 0;
  font-size: 12px;
  color: var(--sh-text-light);
  font-style: italic;
}

/* ── Errors ── */
.step-error {
  margin: 0;
  font-size: 12px;
  color: var(--sh-error);
}

/* ── Footer ── */
.add-modal__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-top: 1px solid var(--sh-border);
  background: #F8FAFC;
  border-radius: 0 0 18px 18px;
}
.add-modal__footer-left,
.add-modal__footer-right {
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
