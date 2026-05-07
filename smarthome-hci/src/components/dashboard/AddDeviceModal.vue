<template>
  <v-dialog
    :model-value="open"
    width="640"
    @update:model-value="onDialogUpdate"
  >
    <div class="add-modal" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">

      <button
        type="button"
        class="add-modal__close"
        aria-label="Cerrar"
        @click="handleClose"
      >
        <v-icon icon="mdi-close" size="14" aria-hidden="true" />
      </button>

      <!-- Header (icon + meta + stepper, on the violet gradient) -->
      <header class="add-modal__header">
        <div class="add-modal__header-row">
          <div class="add-modal__icon" aria-hidden="true">
            <v-icon :icon="headerIcon" size="24" />
          </div>
          <div class="add-modal__meta">
            <p class="add-modal__eyebrow">HABITACIÓN Y DISPOSITIVOS · PASO {{ step }} DE 3</p>
            <h2 id="add-modal-title" class="add-modal__title">{{ stepTitle }}</h2>
            <p class="add-modal__desc">{{ stepDesc }}</p>
          </div>
        </div>

        <ol class="stepper" aria-label="Pasos">
          <li class="stepper__item" :class="stepClass(1)">
            <span class="stepper__dot">1</span>
            <span class="stepper__label">Habitación</span>
          </li>
          <li class="stepper__bar" aria-hidden="true" />
          <li class="stepper__item" :class="stepClass(2)">
            <span class="stepper__dot">2</span>
            <span class="stepper__label">Dispositivos</span>
          </li>
          <li class="stepper__bar" aria-hidden="true" />
          <li class="stepper__item" :class="stepClass(3)">
            <span class="stepper__dot">3</span>
            <span class="stepper__label">Revisión</span>
          </li>
        </ol>
      </header>

      <!-- Body -->
      <div class="add-modal__body">

        <!-- ── STEP 1: choose ONE room ── -->
        <template v-if="step === 1">
          <div v-if="!showNewRoomForm" class="rooms-block">
            <p class="hint-row">
              <v-icon icon="mdi-information-outline" size="13" aria-hidden="true" />
              Sólo podés elegir una habitación.
            </p>
            <div class="rooms-grid" role="radiogroup" aria-label="Habitaciones">
              <button
                v-for="room in rooms"
                :key="room.id"
                type="button"
                class="room-card"
                :class="{ 'room-card--on': roomMode === 'existing' && selectedRoomId === room.id }"
                role="radio"
                :aria-checked="roomMode === 'existing' && selectedRoomId === room.id"
                @click="selectExistingRoom(room.id)"
              >
                <span class="room-card__icon" aria-hidden="true">
                  <v-icon :icon="room.icon" size="20" />
                </span>
                <span class="room-card__body">
                  <span class="room-card__name">{{ room.name }}</span>
                  <span class="room-card__meta">{{ room.devices.length }} {{ room.devices.length === 1 ? 'dispositivo' : 'dispositivos' }}</span>
                </span>
                <v-icon
                  v-if="roomMode === 'existing' && selectedRoomId === room.id"
                  icon="mdi-check-circle"
                  size="18"
                  class="room-card__check"
                  aria-hidden="true"
                />
                <span
                  v-else
                  class="room-card__radio"
                  aria-hidden="true"
                />
              </button>
            </div>

            <button
              type="button"
              class="new-room-trigger"
              @click="openNewRoomForm"
            >
              <span class="new-room-trigger__icon" aria-hidden="true">
                <v-icon icon="mdi-plus" size="18" />
              </span>
              <span class="new-room-trigger__body">
                <span class="new-room-trigger__title">Crear nueva habitación</span>
                <span class="new-room-trigger__sub">Defení nombre y categoría</span>
              </span>
              <v-icon icon="mdi-chevron-right" size="18" class="new-room-trigger__chevron" aria-hidden="true" />
            </button>
          </div>

          <div v-else class="new-room-form" role="group" aria-label="Nueva habitación">
            <div class="new-room-form__head">
              <span class="new-room-form__title">Nueva habitación</span>
              <button
                type="button"
                class="new-room-form__cancel"
                aria-label="Cancelar nueva habitación"
                @click="cancelNewRoom"
              >
                <v-icon icon="mdi-close" size="14" aria-hidden="true" />
              </button>
            </div>

            <div class="field">
              <label for="new-room-name" class="field__label">Nombre</label>
              <input
                id="new-room-name"
                ref="newRoomNameRef"
                v-model.trim="newRoom.name"
                type="text"
                class="field__input"
                :class="{ 'field__input--error': showNewRoomError }"
                placeholder="Ej: Cuarto de juegos"
                maxlength="40"
                autocomplete="off"
              />
            </div>

            <div class="field">
              <span class="field__label">Categoría</span>
              <div class="cat-grid" role="radiogroup" aria-label="Categoría">
                <button
                  v-for="cat in CATEGORIES"
                  :key="cat.id"
                  type="button"
                  class="cat-chip"
                  :class="{ 'cat-chip--active': newRoom.category === cat.id }"
                  role="radio"
                  :aria-checked="newRoom.category === cat.id"
                  @click="newRoom.category = cat.id"
                >
                  <v-icon :icon="cat.icon" size="14" aria-hidden="true" />
                  {{ cat.label }}
                </button>
              </div>
            </div>
          </div>

          <p v-if="stepError" class="step-error" role="alert">{{ stepError }}</p>
        </template>

        <!-- ── STEP 2: pick types + add named instances ── -->
        <template v-else-if="step === 2">
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
                  <v-icon :icon="deviceIcon(inst.type, inst.customIcon)" size="16" />
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
              <p>Sin dispositivos por ahora — podés agregarlos más tarde.</p>
            </div>
          </div>

          <p v-if="stepError" class="step-error" role="alert">{{ stepError }}</p>
        </template>

        <!-- ── STEP 3: review ── -->
        <template v-else>
          <div class="summary-card">
            <p class="summary-card__label">Habitación</p>
            <div class="summary-room">
              <span class="summary-room__icon" aria-hidden="true">
                <v-icon :icon="summaryRoomIcon" size="18" />
              </span>
              <div>
                <p class="summary-room__name">{{ summaryRoomName }}</p>
                <p v-if="roomMode === 'new'" class="summary-room__badge">Nueva habitación</p>
              </div>
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
                  <v-icon :icon="deviceIcon(inst.type, inst.customIcon)" size="14" />
                </span>
                <span class="summary-row__name">{{ inst.name || deviceLabel(inst.type) }}</span>
                <span class="summary-row__type">{{ deviceLabel(inst.type) }}</span>
              </li>
            </ul>
            <p v-else class="summary-empty">Sin dispositivos — la habitación se creará vacía.</p>
          </div>
        </template>

      </div>

      <!-- Icon Selector Modal -->
      <v-dialog
        v-model="showIconSelector"
        width="400"
        @update:model-value="(val) => { if (!val) { showIconSelector = false; pendingDeviceType = null } }"
      >
        <div class="icon-selector" role="dialog" aria-modal="true">
          <div class="icon-selector__header">
            <h3 class="icon-selector__title">Seleccionar ícono</h3>
            <button
              type="button"
              class="icon-selector__close"
              aria-label="Cerrar"
              @click="showIconSelector = false; pendingDeviceType = null"
            >
              <v-icon icon="mdi-close" size="14" aria-hidden="true" />
            </button>
          </div>
          <div class="icon-selector__body">
            <div class="icon-grid">
              <button
                v-for="item in ICON_SELECTOR"
                :key="item.icon"
                type="button"
                class="icon-option"
                :aria-label="item.label"
                @click="selectCustomIcon(item.icon)"
              >
                <span class="icon-option__icon" aria-hidden="true">
                  <v-icon :icon="item.icon" size="24" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </v-dialog>

      <!-- Custom Device Name Modal -->
      <v-dialog
        v-model="showCustomNameModal"
        width="380"
        @update:model-value="(val) => { if (!val) showCustomNameModal = false }"
      >
        <div class="name-modal" role="dialog" aria-modal="true">
          <div class="name-modal__header">
            <div class="name-modal__icon" aria-hidden="true">
              <v-icon :icon="selectedCustomIcon" size="24" />
            </div>
            <h3 class="name-modal__title">Nombrar dispositivo</h3>
            <button
              type="button"
              class="name-modal__close"
              aria-label="Cerrar"
              @click="showCustomNameModal = false"
            >
              <v-icon icon="mdi-close" size="14" aria-hidden="true" />
            </button>
          </div>
          <div class="name-modal__body">
            <div class="field">
              <label for="custom-name" class="field__label">¿Cómo se llama?</label>
              <input
                id="custom-name"
                ref="customNameInputRef"
                v-model="customDeviceName"
                type="text"
                class="field__input"
                placeholder="Ej: Mi dispositivo"
                maxlength="30"
                @keyup.enter="addCustomDevice"
              />
            </div>
          </div>
          <div class="name-modal__footer">
            <button
              type="button"
              class="btn-cancel"
              @click="showCustomNameModal = false"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn-save"
              @click="addCustomDevice"
            >
              <v-icon icon="mdi-plus" size="14" aria-hidden="true" />
              Agregar
            </button>
          </div>
        </div>
      </v-dialog>

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
            v-if="step < 3"
            type="button"
            class="btn-save"
            :disabled="!canAdvance"
            @click="nextStep"
          >
            Siguiente
            <v-icon icon="mdi-arrow-right" size="14" aria-hidden="true" />
          </button>
          <button
            v-else
            type="button"
            class="btn-save"
            @click="handleConfirm"
          >
            <v-icon icon="mdi-check" size="14" aria-hidden="true" />
            {{ confirmLabel }}
          </button>
        </div>
      </footer>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { Room } from '@/types/dashboard'

const props = defineProps<{
  open: boolean
  rooms: Room[]
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'confirm', payload: {
    targetRoomId: number | null
    newRoom: { name: string; category: string } | null
    devices: { type: string; name: string; customIcon?: string }[]
  }): void
}>()

// ── Catalog ──────────────────────────────────────────────────────────────────

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
  { type: 'other',   label: 'Otro',        icon: 'mdi-plus-circle-outline'  },
] as const

const ICON_SELECTOR = [
  { icon: 'mdi-lightbulb-outline',      label: 'Lámpara' },
  { icon: 'mdi-fan',                    label: 'Ventilador' },
  { icon: 'mdi-microwave',              label: 'Microondas' },
  { icon: 'mdi-coffee-maker-outline',   label: 'Cafetera' },
  { icon: 'mdi-washing-machine',        label: 'Lavarropas' },
  { icon: 'mdi-tumble-dryer',           label: 'Secadora' },
  { icon: 'mdi-dishwasher',             label: 'Lavavajillas' },
  { icon: 'mdi-television',             label: 'Televisor' },
  { icon: 'mdi-speaker',                label: 'Parlante' },
  { icon: 'mdi-radio',                  label: 'Radio' },
  { icon: 'mdi-webcam',        label: 'Cámara' },
  { icon: 'mdi-lock',                   label: 'Cerradura' },
  { icon: 'mdi-bell',                   label: 'Timbre' },
  { icon: 'mdi-motion-sensor',          label: 'Sensor de movimiento' },
  { icon: 'mdi-thermometer',            label: 'Termómetro' },
  { icon: 'mdi-water-outline',          label: 'Sensor de agua' },
  { icon: 'mdi-fire-extinguisher',      label: 'Extintor' },
  { icon: 'mdi-power-plug-outline',     label: 'Enchufe' },
  { icon: 'mdi-gamepad-variant',        label: 'Control remoto' },
  { icon: 'mdi-brightness-percent',     label: 'Regulador' },
]

const CATEGORIES = [
  { id: 'sala',       label: 'Sala',       icon: 'mdi-sofa'                  },
  { id: 'habitacion', label: 'Habitación', icon: 'mdi-bed'                   },
  { id: 'cocina',     label: 'Cocina',     icon: 'mdi-silverware-fork-knife' },
  { id: 'bano',       label: 'Baño',       icon: 'mdi-shower'                },
  { id: 'otro',       label: 'Otro',       icon: 'mdi-home-variant'          },
]

// ── State ────────────────────────────────────────────────────────────────────

interface Instance { id: string; type: string; name: string; customIcon?: string }

const step = ref<1 | 2 | 3>(1)

const roomMode = ref<'existing' | 'new'>('existing')
const selectedRoomId = ref<number | null>(null)
const showNewRoomForm = ref(false)
const newRoom = ref<{ name: string; category: string }>({ name: '', category: 'sala' })
const newRoomNameRef = ref<HTMLInputElement | null>(null)

const instances = ref<Instance[]>([])
const showIconSelector = ref(false)
const showCustomNameModal = ref(false)
const pendingDeviceType = ref<string | null>(null)
const selectedCustomIcon = ref<string | null>(null)
const customDeviceName = ref('')
const customNameInputRef = ref<HTMLInputElement | null>(null)

const stepError = ref('')

// ── Helpers ──────────────────────────────────────────────────────────────────

function deviceIcon(type: string, customIcon?: string) {
  if (customIcon) return customIcon
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

// ── Step 1 actions ──────────────────────────────────────────────────────────

function selectExistingRoom(id: number) {
  roomMode.value = 'existing'
  selectedRoomId.value = id
  stepError.value = ''
}

function openNewRoomForm() {
  showNewRoomForm.value = true
  roomMode.value = 'new'
  selectedRoomId.value = null
  stepError.value = ''
  nextTick(() => newRoomNameRef.value?.focus())
}

function cancelNewRoom() {
  showNewRoomForm.value = false
  newRoom.value = { name: '', category: 'sala' }
  roomMode.value = 'existing'
}

const showNewRoomError = computed(() =>
  stepError.value !== '' && roomMode.value === 'new' && !newRoom.value.name.trim()
)

// ── Step 2 actions ──────────────────────────────────────────────────────────

function addDeviceInstance(type: string) {
  if (type === 'other') {
    pendingDeviceType.value = type
    showIconSelector.value = true
  } else {
    instances.value.push({
      id: `dev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      name: defaultNameFor(type),
    })
  }
  stepError.value = ''
}

function selectCustomIcon(icon: string) {
  selectedCustomIcon.value = icon
  customDeviceName.value = ''
  showIconSelector.value = false
  showCustomNameModal.value = true
  nextTick(() => customNameInputRef.value?.focus())
}

function addCustomDevice() {
  const name = customDeviceName.value.trim() || 'Dispositivo'
  instances.value.push({
    id: `dev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'other',
    name,
    customIcon: selectedCustomIcon.value!,
  })
  showCustomNameModal.value = false
  selectedCustomIcon.value = null
  customDeviceName.value = ''
  pendingDeviceType.value = null
}

function removeInstance(idx: number) {
  instances.value.splice(idx, 1)
}

// ── Step header copy ────────────────────────────────────────────────────────

const stepTitle = computed(() => {
  if (step.value === 1) return '¿En qué habitación?'
  if (step.value === 2) return '¿Qué dispositivos?'
  return 'Revisión'
})

const stepDesc = computed(() => {
  if (step.value === 1) return 'Sumá dispositivos a una habitación existente o creá una nueva'
  if (step.value === 2) return 'Opcional — podés crear la habitación sin dispositivos'
  return 'Confirmá antes de agregar los dispositivos'
})

const headerIcon = computed(() => {
  if (step.value === 1) return 'mdi-home-outline'
  if (step.value === 2) return 'mdi-power-plug-outline'
  return 'mdi-check-circle-outline'
})

function stepClass(n: number) {
  return {
    'stepper__item--active': step.value === n,
    'stepper__item--done':   step.value > n,
  }
}

// ── Validation ──────────────────────────────────────────────────────────────

const canAdvance = computed(() => {
  if (step.value === 1) {
    if (roomMode.value === 'existing') return selectedRoomId.value !== null
    return newRoom.value.name.trim().length >= 2
  }
  // Step 2: dispositivos son opcionales
  return true
})

// ── Summary ─────────────────────────────────────────────────────────────────

const summaryRoomName = computed(() => {
  if (roomMode.value === 'new') return newRoom.value.name.trim() || 'Nueva habitación'
  const r = props.rooms.find(r => r.id === selectedRoomId.value)
  return r?.name ?? '—'
})

const confirmLabel = computed(() => {
  if (instances.value.length === 0) {
    return roomMode.value === 'new' ? 'Crear habitación' : 'Listo'
  }
  return instances.value.length === 1 ? 'Agregar dispositivo' : 'Agregar dispositivos'
})

const summaryRoomIcon = computed(() => {
  if (roomMode.value === 'new') {
    return CATEGORIES.find(c => c.id === newRoom.value.category)?.icon ?? 'mdi-home-variant'
  }
  return props.rooms.find(r => r.id === selectedRoomId.value)?.icon ?? 'mdi-home-variant'
})

// ── Navigation ──────────────────────────────────────────────────────────────

function nextStep() {
  if (!canAdvance.value) {
    if (step.value === 1) {
      stepError.value = roomMode.value === 'new'
        ? 'Ingresá un nombre para la nueva habitación.'
        : 'Elegí una habitación o creá una nueva.'
    } else {
      stepError.value = 'Agregá al menos un dispositivo.'
    }
    return
  }
  stepError.value = ''
  if (step.value < 3) step.value = (step.value + 1) as 1 | 2 | 3
}

function prevStep() {
  stepError.value = ''
  if (step.value > 1) step.value = (step.value - 1) as 1 | 2 | 3
}

// ── Confirm / close ─────────────────────────────────────────────────────────

function handleConfirm() {
  emit('confirm', {
    targetRoomId: roomMode.value === 'existing' ? selectedRoomId.value : null,
    newRoom:      roomMode.value === 'new'
      ? { name: newRoom.value.name.trim(), category: newRoom.value.category }
      : null,
    devices: instances.value.map(i => ({
      type: i.type,
      name: i.name.trim() || deviceLabel(i.type),
      ...(i.customIcon && { customIcon: i.customIcon }),
    })),
  })
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
  roomMode.value = 'existing'
  selectedRoomId.value = null
  showNewRoomForm.value = false
  newRoom.value = { name: '', category: 'sala' }
  instances.value = []
  stepError.value = ''
  showIconSelector.value = false
  showCustomNameModal.value = false
  pendingDeviceType.value = null
  selectedCustomIcon.value = null
  customDeviceName.value = ''
}

watch(() => props.open, (val) => {
  if (val) reset()
})
</script>

<style scoped>
/* ── Shell ── */
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

/* ── Header (violet gradient with stepper) ── */
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

/* ── Step 1: rooms grid ── */
.rooms-block { display: flex; flex-direction: column; gap: 10px; }
.hint-row {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--sh-text-muted);
}
.rooms-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.room-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1.5px solid var(--sh-border);
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  font-family: var(--sh-font);
  transition: border-color 150ms, background-color 150ms, box-shadow 150ms;
}
.room-card:hover { border-color: rgba(99, 102, 241, .4); background: #F8FAFC; }
.room-card:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.room-card--on {
  border-color: var(--sh-primary);
  background: var(--sh-primary-light);
  box-shadow: 0 2px 8px -2px rgba(99, 102, 241, .25);
}
.room-card__icon {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.room-card--on .room-card__icon {
  background: var(--sh-primary);
  color: #fff;
}
.room-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.room-card__name {
  font-size: 13px;
  font-weight: 700;
  color: var(--sh-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.room-card__meta {
  font-size: 11px;
  color: var(--sh-text-light);
}
.room-card__radio {
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--sh-border);
  flex-shrink: 0;
}
.room-card__check { color: var(--sh-primary); flex-shrink: 0; }

/* "Crear nueva habitación" full-width trigger */
.new-room-trigger {
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
.new-room-trigger:hover {
  border-color: var(--sh-primary);
  background: var(--sh-primary-light);
}
.new-room-trigger:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.new-room-trigger__icon {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: #F1F5F9;
  color: var(--sh-text-muted);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background-color 150ms, color 150ms;
}
.new-room-trigger:hover .new-room-trigger__icon {
  background: var(--sh-primary);
  color: #fff;
}
.new-room-trigger__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.new-room-trigger__title { font-size: 13px; font-weight: 700; color: var(--sh-text-main); }
.new-room-trigger__sub { font-size: 11px; color: var(--sh-text-light); }
.new-room-trigger__chevron { color: var(--sh-text-light); flex-shrink: 0; }
.new-room-trigger:hover .new-room-trigger__chevron { color: var(--sh-primary); }

/* ── Step 1: new-room form ── */
.new-room-form {
  background: #F8FAFC;
  border: 1px solid var(--sh-border);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.new-room-form__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.new-room-form__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--sh-text-main);
}
.new-room-form__cancel {
  width: 26px; height: 26px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--sh-text-muted);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background-color 150ms, color 150ms;
}
.new-room-form__cancel:hover { background: #F1F5F9; color: var(--sh-text-main); }

/* ── Generic field ── */
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

/* ── Category chips ── */
.cat-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.cat-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--sh-border);
  background: #ffffff;
  font-family: var(--sh-font);
  font-size: 12px;
  font-weight: 500;
  color: var(--sh-text-muted);
  cursor: pointer;
  transition: border-color 150ms, background-color 150ms, color 150ms;
}
.cat-chip:hover:not(.cat-chip--active) {
  border-color: var(--sh-text-muted);
  color: var(--sh-text-main);
}
.cat-chip--active {
  background: var(--sh-primary-light);
  border-color: var(--sh-primary);
  color: var(--sh-primary-dark);
}

/* ── Step 2: device tile grid ── */
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

/* ── Step 2: added list ── */
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

/* ── Step 3: summary ── */
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
.summary-room__badge {
  margin: 2px 0 0;
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  background: #DCFCE7;
  color: #166534;
  padding: 1px 8px;
  border-radius: 999px;
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

/* ── Errors / hints ── */
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

/* ── Icon Selector Modal ── */
.icon-selector {
  position: relative;
  background: #ffffff;
  border-radius: 18px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, .04),
    0 24px 48px -12px rgba(15, 23, 42, .18),
    0 0 0 1px rgba(15, 23, 42, .04);
  padding: 0;
  font-family: var(--sh-font);
}

.icon-selector__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--sh-border);
  background: #F8FAFC;
  border-radius: 18px 18px 0 0;
}

.icon-selector__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--sh-text-main);
}

.icon-selector__close {
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
}

.icon-selector__close:hover {
  background: var(--sh-primary-light);
  color: var(--sh-text-main);
}

.icon-selector__body {
  padding: 16px 20px;
  max-height: 400px;
  overflow-y: auto;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.icon-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 10px;
  border: 1.5px solid var(--sh-border);
  background: #ffffff;
  cursor: pointer;
  transition: border-color 150ms, background-color 150ms;
}

.icon-option:hover {
  border-color: var(--sh-primary);
  background: var(--sh-primary-light);
}

.icon-option:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

.icon-option__icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #F1F5F9;
  color: var(--sh-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 150ms, color 150ms;
}

.icon-option:hover .icon-option__icon {
  background: var(--sh-primary);
  color: #fff;
}

/* ── Custom Name Modal ── */
.name-modal {
  position: relative;
  background: #ffffff;
  border-radius: 18px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, .04),
    0 24px 48px -12px rgba(15, 23, 42, .18),
    0 0 0 1px rgba(15, 23, 42, .04);
  padding: 0;
  font-family: var(--sh-font);
  display: flex;
  flex-direction: column;
}

.name-modal__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--sh-border);
  background: #F8FAFC;
  border-radius: 18px 18px 0 0;
  position: relative;
}

.name-modal__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.name-modal__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--sh-text-main);
  flex: 1;
}

.name-modal__close {
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
  flex-shrink: 0;
}

.name-modal__close:hover {
  background: var(--sh-primary-light);
  color: var(--sh-text-main);
}

.name-modal__body {
  padding: 16px 20px;
}

.name-modal__footer {
  display: flex;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--sh-border);
  background: #F8FAFC;
  border-radius: 0 0 18px 18px;
  justify-content: flex-end;
}
</style>
