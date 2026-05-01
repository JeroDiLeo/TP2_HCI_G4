<template>
  <v-dialog
    :model-value="open"
    width="680"
    scrollable
    @update:model-value="handleOverlayClose"
  >
    <div class="adm" role="dialog" aria-modal="true" aria-labelledby="adm-title">
      <!-- Close -->
      <button class="adm__close" type="button" aria-label="Cerrar" @click="handleClose">
        <v-icon icon="mdi-close" size="20" aria-hidden="true" />
      </button>

      <!-- Step bar -->
      <div class="adm__steps" aria-hidden="true">
        <template v-for="(label, i) in STEP_LABELS" :key="i">
          <div
            class="adm__step"
            :class="{ 'adm__step--done': step > i + 1, 'adm__step--active': step === i + 1 }"
          >
            <span class="adm__step-circle">
              <v-icon v-if="step > i + 1" icon="mdi-check" size="13" />
              <span v-else>{{ i + 1 }}</span>
            </span>
            <span class="adm__step-label">{{ label }}</span>
          </div>
          <div v-if="i < 2" class="adm__step-line" :class="{ 'adm__step-line--done': step > i + 1 }" />
        </template>
      </div>

      <!-- Body -->
      <div class="adm__body">

        <!-- ── Step 1: choose devices ── -->
        <template v-if="step === 1">
          <h2 id="adm-title" class="adm__title">Elegí los dispositivos</h2>
          <p class="adm__hint">Podés seleccionar más de uno.</p>

          <div class="adm__device-grid" role="group" aria-label="Dispositivos disponibles">
            <button
              v-for="d in DEVICE_CATALOG"
              :key="d.type"
              type="button"
              class="adm__device-card"
              :class="{ 'adm__device-card--on': selectedTypes.includes(d.type) }"
              :aria-pressed="selectedTypes.includes(d.type)"
              :aria-label="`${d.label}${selectedTypes.includes(d.type) ? ', seleccionado' : ''}`"
              @click="toggleType(d.type)"
            >
              <div class="adm__device-icon-wrap" aria-hidden="true">
                <v-icon :icon="d.icon" size="26" />
              </div>
              <span class="adm__device-label">{{ d.label }}</span>
              <span v-if="selectedTypes.includes(d.type)" class="adm__device-checkmark" aria-hidden="true">
                <v-icon icon="mdi-check-circle" size="16" />
              </span>
            </button>
          </div>

          <p v-if="stepError" class="adm__error" role="alert">{{ stepError }}</p>
        </template>

        <!-- ── Step 2: choose rooms ── -->
        <template v-else-if="step === 2">
          <h2 id="adm-title" class="adm__title">¿A qué habitaciones?</h2>
          <p class="adm__hint">Podés agregar a varias a la vez.</p>

          <ul class="adm__room-list" aria-label="Habitaciones existentes">
            <li v-for="room in rooms" :key="room.id">
              <button
                type="button"
                class="adm__room-row"
                :class="{ 'adm__room-row--on': selectedRoomIds.includes(room.id) }"
                :aria-pressed="selectedRoomIds.includes(room.id)"
                @click="toggleRoom(room.id)"
              >
                <span class="adm__room-icon" aria-hidden="true">
                  <v-icon :icon="room.icon" size="18" />
                </span>
                <span class="adm__room-name">{{ room.name }}</span>
                <span class="adm__room-meta">{{ room.devices.length }} disp.</span>
                <v-icon
                  :icon="selectedRoomIds.includes(room.id) ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline'"
                  size="20"
                  class="adm__room-chk"
                  aria-hidden="true"
                />
              </button>
            </li>
          </ul>

          <!-- Pending new rooms -->
          <ul v-if="pendingRooms.length" class="adm__room-list" aria-label="Habitaciones nuevas">
            <li v-for="(pr, idx) in pendingRooms" :key="'pr-' + idx">
              <div class="adm__room-row adm__room-row--on adm__room-row--new">
                <span class="adm__room-icon" aria-hidden="true">
                  <v-icon :icon="CATEGORY_ICONS[pr.category] ?? 'mdi-home-variant'" size="18" />
                </span>
                <span class="adm__room-name">{{ pr.name }}</span>
                <span class="adm__room-badge">Nueva</span>
                <button
                  type="button"
                  class="adm__room-del"
                  :aria-label="`Quitar ${pr.name}`"
                  @click="removePendingRoom(idx)"
                >
                  <v-icon icon="mdi-close" size="14" aria-hidden="true" />
                </button>
              </div>
            </li>
          </ul>

          <!-- New room toggle / form -->
          <div v-if="!showNewRoomForm" class="adm__new-room-trigger">
            <button type="button" class="adm__add-room-btn" @click="openNewRoomForm">
              <v-icon icon="mdi-plus" size="16" aria-hidden="true" />
              Crear nueva habitación
            </button>
          </div>

          <div v-else class="adm__new-room-form" role="group" aria-label="Nueva habitación">
            <div class="adm__field">
              <label for="new-room-name" class="adm__label">
                Nombre <span class="adm__required" aria-hidden="true">*</span>
              </label>
              <input
                id="new-room-name"
                ref="newRoomNameRef"
                v-model.trim="newRoomName"
                type="text"
                class="adm__input"
                :class="{ 'adm__input--error': newRoomNameError }"
                placeholder="Ej: Cuarto de juegos"
                maxlength="40"
                autocomplete="off"
                @input="newRoomNameError = false"
                @keydown.enter.prevent="commitNewRoom"
              />
              <p v-if="newRoomNameError" class="adm__field-error" role="alert">
                El nombre es obligatorio.
              </p>
            </div>

            <div class="adm__field">
              <span id="cat-label" class="adm__label">Categoría</span>
              <div class="adm__chips" role="radiogroup" aria-labelledby="cat-label">
                <button
                  v-for="cat in CATEGORIES"
                  :key="cat.id"
                  type="button"
                  class="adm__chip"
                  :class="{ 'adm__chip--on': newRoomCategory === cat.id }"
                  :aria-pressed="newRoomCategory === cat.id"
                  @click="newRoomCategory = cat.id"
                >
                  <v-icon :icon="cat.icon" size="13" aria-hidden="true" />
                  {{ cat.label }}
                </button>
              </div>
            </div>

            <div class="adm__form-row">
              <button type="button" class="adm__btn adm__btn--ghost" @click="cancelNewRoom">
                Cancelar
              </button>
              <button type="button" class="adm__btn adm__btn--primary" @click="commitNewRoom">
                Agregar habitación
              </button>
            </div>
          </div>

          <p v-if="stepError" class="adm__error" role="alert">{{ stepError }}</p>
        </template>

        <!-- ── Step 3: summary ── -->
        <template v-else>
          <h2 id="adm-title" class="adm__title">Revisión</h2>
          <p class="adm__hint">Confirmá antes de agregar.</p>

          <div class="adm__summary-block">
            <h3 class="adm__summary-label">Dispositivos ({{ selectedTypes.length }})</h3>
            <div class="adm__summary-chips">
              <span v-for="t in selectedTypes" :key="t" class="adm__summary-chip">
                <v-icon :icon="deviceIcon(t)" size="13" aria-hidden="true" />
                {{ deviceLabel(t) }}
              </span>
            </div>
          </div>

          <div class="adm__summary-block">
            <h3 class="adm__summary-label">Habitaciones ({{ totalRoomsSelected }})</h3>
            <div class="adm__summary-chips">
              <span v-for="id in selectedRoomIds" :key="id" class="adm__summary-chip">
                {{ rooms.find(r => r.id === id)?.name }}
              </span>
              <span
                v-for="(pr, i) in pendingRooms"
                :key="'pr-' + i"
                class="adm__summary-chip adm__summary-chip--new"
              >
                {{ pr.name }}
                <span class="adm__new-badge">Nueva</span>
              </span>
            </div>
          </div>

          <div class="adm__summary-total">
            <v-icon icon="mdi-information-outline" size="16" aria-hidden="true" />
            Se agregarán
            <strong>{{ selectedTypes.length * totalRoomsSelected }}</strong>
            dispositivo{{ selectedTypes.length * totalRoomsSelected !== 1 ? 's' : '' }} en
            <strong>{{ totalRoomsSelected }}</strong>
            habitación{{ totalRoomsSelected !== 1 ? 'es' : '' }}.
          </div>
        </template>

      </div>

      <!-- Footer -->
      <div class="adm__footer">
        <button v-if="step > 1" type="button" class="adm__btn adm__btn--ghost" @click="prevStep">
          <v-icon icon="mdi-arrow-left" size="15" aria-hidden="true" />
          Atrás
        </button>
        <span class="adm__step-counter" aria-live="polite">{{ step }} / 3</span>
        <button
          v-if="step < 3"
          type="button"
          class="adm__btn adm__btn--primary"
          :disabled="!canAdvance"
          @click="nextStep"
        >
          Siguiente
          <v-icon icon="mdi-arrow-right" size="15" aria-hidden="true" />
        </button>
        <button
          v-else
          type="button"
          class="adm__btn adm__btn--primary"
          @click="handleConfirm"
        >
          <v-icon icon="mdi-check" size="15" aria-hidden="true" />
          Agregar dispositivo{{ selectedTypes.length !== 1 ? 's' : '' }}
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { Room } from '@/types/dashboard'

// ── Props / Emits ────────────────────────────────────────────────────────────

const props = defineProps<{
  open: boolean
  rooms: Room[]
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'confirm', payload: {
    deviceTypes: string[]
    targetRoomIds: number[]
    newRooms: { name: string; category: string }[]
  }): void
}>()

// ── Static data ──────────────────────────────────────────────────────────────

const STEP_LABELS = ['Dispositivos', 'Habitaciones', 'Revisión']

const DEVICE_CATALOG = [
  { type: 'vacuum',  label: 'Aspiradora',  icon: 'mdi-robot-vacuum'          },
  { type: 'speaker', label: 'Parlante',    icon: 'mdi-speaker'               },
  { type: 'faucet',  label: 'Grifo',       icon: 'mdi-water-pump'            },
  { type: 'blind',   label: 'Persiana',    icon: 'mdi-blinds'                },
  { type: 'light',   label: 'Lámpara',     icon: 'mdi-lightbulb-outline'     },
  { type: 'oven',    label: 'Horno',       icon: 'mdi-stove'                 },
  { type: 'ac',      label: 'Aire acond.', icon: 'mdi-air-conditioner'       },
  { type: 'door',    label: 'Puerta',      icon: 'mdi-door'                  },
  { type: 'alarm',   label: 'Alarma',      icon: 'mdi-alarm-light-outline'   },
  { type: 'fridge',  label: 'Heladera',    icon: 'mdi-fridge-outline'        },
] as const

const CATEGORIES = [
  { id: 'sala',       label: 'Sala',       icon: 'mdi-sofa'                  },
  { id: 'habitacion', label: 'Habitación', icon: 'mdi-bed'                   },
  { id: 'cocina',     label: 'Cocina',     icon: 'mdi-silverware-fork-knife'  },
  { id: 'bano',       label: 'Baño',       icon: 'mdi-shower'                },
  { id: 'otro',       label: 'Otro',       icon: 'mdi-home-variant'          },
]

const CATEGORY_ICONS: Record<string, string> = {
  sala:       'mdi-sofa',
  habitacion: 'mdi-bed',
  cocina:     'mdi-silverware-fork-knife',
  bano:       'mdi-shower',
  otro:       'mdi-home-variant',
}

// ── State ────────────────────────────────────────────────────────────────────

const step = ref(1)
const selectedTypes = ref<string[]>([])
const selectedRoomIds = ref<number[]>([])
const pendingRooms = ref<{ name: string; category: string }[]>([])
const stepError = ref('')

const showNewRoomForm = ref(false)
const newRoomName = ref('')
const newRoomCategory = ref('sala')
const newRoomNameError = ref(false)
const newRoomNameRef = ref<HTMLInputElement | null>(null)

// ── Computed ─────────────────────────────────────────────────────────────────

const totalRoomsSelected = computed(
  () => selectedRoomIds.value.length + pendingRooms.value.length,
)

const canAdvance = computed(() => {
  if (step.value === 1) return selectedTypes.value.length > 0
  if (step.value === 2) return totalRoomsSelected.value > 0
  return true
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function deviceIcon(type: string) {
  return DEVICE_CATALOG.find(d => d.type === type)?.icon ?? 'mdi-help-circle-outline'
}

function deviceLabel(type: string) {
  return DEVICE_CATALOG.find(d => d.type === type)?.label ?? type
}

// ── Actions ──────────────────────────────────────────────────────────────────

function toggleType(type: string) {
  stepError.value = ''
  const idx = selectedTypes.value.indexOf(type)
  if (idx === -1) selectedTypes.value.push(type)
  else selectedTypes.value.splice(idx, 1)
}

function toggleRoom(id: number) {
  stepError.value = ''
  const idx = selectedRoomIds.value.indexOf(id)
  if (idx === -1) selectedRoomIds.value.push(id)
  else selectedRoomIds.value.splice(idx, 1)
}

function removePendingRoom(idx: number) {
  pendingRooms.value.splice(idx, 1)
}

function openNewRoomForm() {
  showNewRoomForm.value = true
}

function commitNewRoom() {
  if (!newRoomName.value) {
    newRoomNameError.value = true
    newRoomNameRef.value?.focus()
    return
  }
  pendingRooms.value.push({ name: newRoomName.value, category: newRoomCategory.value })
  stepError.value = ''
  cancelNewRoom()
}

function cancelNewRoom() {
  showNewRoomForm.value = false
  newRoomName.value = ''
  newRoomCategory.value = 'sala'
  newRoomNameError.value = false
}

function nextStep() {
  if (!canAdvance.value) {
    stepError.value = step.value === 1
      ? 'Seleccioná al menos un dispositivo.'
      : 'Seleccioná al menos una habitación o creá una nueva.'
    return
  }
  stepError.value = ''
  step.value++
}

function prevStep() {
  stepError.value = ''
  step.value--
}

function handleConfirm() {
  emit('confirm', {
    deviceTypes:   [...selectedTypes.value],
    targetRoomIds: [...selectedRoomIds.value],
    newRooms:      [...pendingRooms.value],
  })
  emit('update:open', false)
  resetState()
}

function handleClose() {
  emit('update:open', false)
  resetState()
}

function handleOverlayClose(val: boolean) {
  if (!val) handleClose()
}

function resetState() {
  step.value = 1
  selectedTypes.value = []
  selectedRoomIds.value = []
  pendingRooms.value = []
  stepError.value = ''
  cancelNewRoom()
}

watch(showNewRoomForm, (val) => {
  if (val) nextTick(() => newRoomNameRef.value?.focus())
})
</script>

<style scoped>
.adm {
  --primary:       #6366F1;
  --primary-dark:  #4F46E5;
  --primary-light: #EEF2FF;
  --bg:            #FFFFFF;
  --surface:       #F8FAFC;
  --border:        #E2E8F0;
  --text-main:     #0F172A;
  --text-muted:    #64748B;
  --text-light:    #94A3B8;
  --error:         #EF4444;
  --success:       #10B981;
  --font:          'Inter', sans-serif;

  background: var(--bg);
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 24px 48px -12px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  font-family: var(--font);
}

:deep(.v-overlay__scrim) {
  background: rgba(15, 23, 42, 0.42) !important;
  backdrop-filter: blur(2px);
}

/* Close */
.adm__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  z-index: 1;
  transition: background-color 150ms;
}
.adm__close:hover { background: var(--primary-light); }
.adm__close:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

/* Step bar */
.adm__steps {
  display: flex;
  align-items: center;
  padding: 24px 40px 0;
  gap: 0;
  flex-shrink: 0;
}

.adm__step {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.adm__step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: var(--border);
  color: var(--text-muted);
  transition: background-color 150ms, color 150ms;
  flex-shrink: 0;
}

.adm__step--active .adm__step-circle {
  background: var(--primary);
  color: #fff;
}

.adm__step--done .adm__step-circle {
  background: var(--success);
  color: #fff;
}

.adm__step-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-light);
  transition: color 150ms;
}

.adm__step--active .adm__step-label { color: var(--primary);  font-weight: 600; }
.adm__step--done  .adm__step-label  { color: var(--success); }

.adm__step-line {
  flex: 1;
  min-width: 20px;
  height: 2px;
  background: var(--border);
  transition: background-color 150ms;
}

.adm__step-line--done { background: var(--success); }

/* Body */
.adm__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.adm__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}

.adm__hint {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

/* Device grid */
.adm__device-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.adm__device-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px 14px;
  border-radius: 12px;
  border: 2px solid var(--border);
  background: var(--bg);
  cursor: pointer;
  transition: border-color 150ms, background-color 150ms;
}

.adm__device-card:hover {
  border-color: rgba(99, 102, 241, 0.45);
  background: var(--primary-light);
}

.adm__device-card:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.adm__device-card--on {
  border-color: var(--primary);
  background: var(--primary-light);
}

.adm__device-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: background-color 150ms, color 150ms;
}

.adm__device-card--on .adm__device-icon-wrap {
  background: rgba(99, 102, 241, 0.12);
  color: var(--primary);
}

.adm__device-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.3;
}

.adm__device-card--on .adm__device-label {
  color: var(--primary-dark);
  font-weight: 600;
}

.adm__device-checkmark {
  position: absolute;
  top: 6px;
  right: 6px;
  color: var(--primary);
  line-height: 0;
}

/* Room list */
.adm__room-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.adm__room-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--border);
  background: var(--bg);
  cursor: pointer;
  text-align: left;
  transition: border-color 150ms, background-color 150ms;
}

.adm__room-row:hover {
  border-color: rgba(99, 102, 241, 0.4);
  background: var(--primary-light);
}

.adm__room-row:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.adm__room-row--on {
  border-color: var(--primary);
  background: var(--primary-light);
}

.adm__room-row--new { cursor: default; }
.adm__room-row--new:hover { border-color: var(--primary); }

.adm__room-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.adm__room-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  min-width: 0;
}

.adm__room-meta {
  font-size: 12px;
  color: var(--text-light);
  white-space: nowrap;
}

.adm__room-chk {
  flex-shrink: 0;
  color: var(--text-light);
  transition: color 150ms;
}

.adm__room-row--on .adm__room-chk { color: var(--primary); }

.adm__room-badge {
  font-size: 10px;
  font-weight: 700;
  background: var(--primary);
  color: #fff;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.adm__room-del {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: background-color 150ms, color 150ms;
}
.adm__room-del:hover { background: #fee2e2; color: var(--error); }
.adm__room-del:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

/* New room trigger */
.adm__new-room-trigger {
  padding-top: 2px;
}

.adm__add-room-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 8px;
  border: 1.5px dashed var(--border);
  background: transparent;
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: border-color 150ms, color 150ms, background-color 150ms;
}

.adm__add-room-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.adm__add-room-btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* New room form */
.adm__new-room-form {
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.adm__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.adm__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 3px;
}

.adm__required { color: var(--error); }

.adm__input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: var(--font);
  font-size: 14px;
  color: var(--text-main);
  background: var(--bg);
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}

.adm__input::placeholder { color: var(--text-light); }
.adm__input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}
.adm__input--error { border-color: var(--error); }
.adm__input--error:focus {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}

.adm__field-error {
  font-size: 11px;
  color: var(--error);
  margin: 0;
}

/* Chips */
.adm__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.adm__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg);
  font-family: var(--font);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: border-color 150ms, background-color 150ms, color 150ms;
}

.adm__chip:hover:not(.adm__chip--on) { border-color: var(--text-muted); }
.adm__chip:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.adm__chip--on {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary-dark);
  font-weight: 600;
}

.adm__form-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Step error */
.adm__error {
  font-size: 12px;
  color: var(--error);
  margin: 0;
}

/* Summary */
.adm__summary-block {
  background: var(--surface);
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.adm__summary-label {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.adm__summary-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.adm__summary-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--primary-light);
  color: var(--primary-dark);
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.adm__summary-chip--new {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.adm__new-badge {
  font-size: 10px;
  font-weight: 700;
  background: #22c55e;
  color: #fff;
  padding: 1px 6px;
  border-radius: 999px;
}

.adm__summary-total {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--primary-light);
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  font-size: 13px;
  color: var(--primary-dark);
}

/* Footer */
.adm__footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.adm__step-counter {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: var(--text-light);
}

/* Buttons */
.adm__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  font-family: var(--font);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  white-space: nowrap;
  transition: background-color 150ms, transform 100ms;
}

.adm__btn:active { transform: scale(0.98); }
.adm__btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.adm__btn--ghost {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
}
.adm__btn--ghost:hover { background: var(--surface); color: var(--text-main); }

.adm__btn--primary {
  background: var(--primary);
  color: #fff;
}
.adm__btn--primary:hover:not(:disabled) { background: var(--primary-dark); }
.adm__btn--primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

/* Responsive */
@media (max-width: 520px) {
  .adm__steps   { padding: 20px 20px 0; }
  .adm__body    { padding: 20px; }
  .adm__footer  { padding: 14px 20px 18px; }

  .adm__step-label { display: none; }

  .adm__device-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 360px) {
  .adm__device-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (prefers-reduced-motion: reduce) {
  .adm__btn,
  .adm__device-card,
  .adm__room-row,
  .adm__chip,
  .adm__input,
  .adm__step-circle,
  .adm__step-line { transition-duration: 0ms; }
}
</style>
