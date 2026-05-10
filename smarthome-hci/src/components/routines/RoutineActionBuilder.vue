<template>
  <div class="rab">
    <div class="rab__head">
      <p class="rab__step-label">Paso {{ step }} de 3 — {{ stepLabel }}</p>
    </div>
    <div class="rab__body">
      <!-- step 1 -->
      <template v-if="step === 1">
        <!-- search -->
        <div class="rab__search-row">
          <input
            v-model="searchQuery"
            type="text"
            class="rab__search"
            placeholder="Buscar por nombre o habitación…"
            autocomplete="off"
            aria-label="Buscar dispositivo"
          />
        </div>

        <!-- hint text -->
        <p class="rab__hint">
          <strong>Dispositivos disponibles</strong>
          <span class="rab__hint-sub">Tocá uno para seleccionarlo</span>
        </p>

        <!-- device grid -->
        <div v-if="filteredDevices.length > 0" class="dev-grid" role="listbox" aria-label="Dispositivos disponibles">
          <button
            v-for="device in filteredDevices"
            :key="device.id"
            type="button"
            class="dev-card"
            :class="{ 'dev-card--active': selectedDevice?.id === device.id }"
            role="option"
            :aria-selected="selectedDevice?.id === device.id"
            @click="selectDevice(device)"
          >
            <div class="dev-card__icon" aria-hidden="true">
              <v-icon :icon="getDeviceIcon(device.type)" size="18" />
            </div>
            <span class="dev-card__name">{{ device.name }}</span>
            <span class="dev-card__room">{{ device.roomName || '—' }}</span>
            <v-icon v-if="selectedDevice?.id === device.id" icon="mdi-check-circle" size="14" class="dev-card__check" aria-hidden="true" />
          </button>
        </div>
        <p v-else-if="searchQuery" class="rab__empty">No encontramos dispositivos con esa búsqueda.</p>
        <p v-else class="rab__empty">Todavía no tenés dispositivos en tu hogar. Agregá uno desde Habitaciones.</p>
      </template>

      <!-- step 2 -->
      <template v-else-if="step === 2">
        <p class="builder__hint">¿Qué acción querés ejecutar en <strong>{{ selectedDevice?.name }}</strong>?</p>
        <ul class="item-list" role="listbox" aria-label="Acciones disponibles">
          <li
            v-for="act in availableActions" :key="act.name"
            class="item-list__row" :class="{ 'item-list__row--active': selectedAction?.name === act.name }"
            role="option" :aria-selected="selectedAction?.name === act.name" tabindex="0"
            @click="selectAction(act)" @keydown.enter="selectAction(act)" @keydown.space.prevent="selectAction(act)"
          >
            <div class="item-list__info">
              <span class="item-list__name">{{ getActionLabel(act.name) }}</span>
              <span v-if="act.description" class="item-list__sub">{{ act.description }}</span>
            </div>
          </li>
        </ul>
        <p v-if="availableActions.length === 0" class="builder__empty">Este dispositivo no tiene acciones disponibles.</p>
      </template>

      <!-- step 3 -->
      <template v-else>
        <p class="builder__hint">Completá los parámetros para <strong>{{ getActionLabel(selectedAction?.name ?? '') }}</strong>.</p>
        <p v-if="!selectedAction?.params?.length" class="builder__hint">Esta acción no requiere parámetros.</p>
        <div v-for="(param, idx) in selectedAction?.params ?? []" :key="idx" class="pf">
          <label :for="`rab-p-${idx}`" class="pf__label">
            {{ param.name ?? `Parámetro ${idx + 1}` }}
            <span v-if="param.description" class="pf__desc">— {{ param.description }}</span>
          </label>
          <v-select v-if="hasSupportedValues(param)" :id="`rab-p-${idx}`" v-model="paramValues[idx]" :items="param.supportedValues" density="compact" hide-details variant="outlined" class="pf-select" :menu-props="{ contentClass: 'rab-menu' }" />
          <v-select v-else-if="isRoomIdParam(param)" :id="`rab-p-${idx}`" v-model="paramValues[idx]" :items="rooms" item-title="name" item-value="id" density="compact" hide-details variant="outlined" placeholder="Seleccioná una habitación" class="pf-select" :menu-props="{ contentClass: 'rab-menu' }" />
          <input v-else-if="isSecurityCodeParam(param)" :id="`rab-p-${idx}`" v-model="paramValues[idx]" type="password" class="pf__input" autocomplete="off" placeholder="Código de seguridad" />
          <div v-else-if="isColorParam(param, selectedAction?.name)" class="pf__row">
            <input :id="`rab-p-${idx}`" v-model="paramValues[idx]" type="text" class="pf__input" maxlength="7" placeholder="#FFFFFF" />
            <span class="pf__color-dot" :style="{ background: validHex(paramValues[idx]) ? String(paramValues[idx]) : '#eee' }" />
          </div>
          <v-switch v-else-if="param.type === 'boolean'" :id="`rab-p-${idx}`" v-model="paramValues[idx]" color="primary" hide-details density="compact" />
          <div v-else-if="(param.type === 'integer' || param.type === 'number') && hasRange(param)" class="pf__row">
            <v-slider :id="`rab-p-${idx}`" v-model="(paramValues as (string | number | undefined)[])[idx]" :min="getParamMin(param) ?? 0" :max="getParamMax(param) ?? 100" :step="param.type === 'integer' ? 1 : 0.1" color="#6366F1" track-color="#E2E8F0" hide-details density="compact" class="pf__slider" />
            <span class="pf__slider-val">{{ paramValues[idx] }}</span>
          </div>
          <input v-else-if="param.type === 'integer' || param.type === 'number'" :id="`rab-p-${idx}`" v-model.number="paramValues[idx]" type="number" class="pf__input" />
          <input v-else :id="`rab-p-${idx}`" v-model="paramValues[idx]" type="text" class="pf__input" />
          <p v-if="paramErrors[idx]" class="pf__error" role="alert">{{ paramErrors[idx] }}</p>
        </div>
      </template>
    </div>
    <footer class="rab__footer">
      <button v-if="step > 1" type="button" class="btn btn--ghost" @click="step--">
        <v-icon icon="mdi-chevron-left" size="16" /> Atrás
      </button>
      <div class="rab__footer-right">
        <button type="button" class="btn btn--outline" @click="cancel">Cancelar</button>
        <button v-if="step < 3" type="button" class="btn btn--primary" :disabled="!canAdvance" @click="advance">
          Siguiente <v-icon icon="mdi-arrow-right" size="14" />
        </button>
        <button v-else type="button" class="btn btn--primary" :disabled="!canConfirm" @click="confirm">
          <v-icon icon="mdi-plus" size="14" /> Agregar acción
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDevicesStore } from '@/stores/devices'
import { useDeviceTypesStore } from '@/stores/deviceTypes'
import { useRoomsStore } from '@/stores/rooms'
import {
  getParamMin, getParamMax, hasSupportedValues,
  isColorParam, isRoomIdParam, isSecurityCodeParam,
  hasRange, normalizeHexColor,
} from '@/utils/deviceTypeParam'
import type { ApiDeviceTypeAction, ApiDeviceTypeParam } from '@/utils/deviceMapper'
import type { RoomDevice } from '@/types/rooms'
import { getDeviceIcon } from '@/utils/deviceIcons.js'
import { getActionLabel } from '@/utils/deviceActionLabels'

const emit = defineEmits<{
  'cancel': []
  'confirm': [action: { device: { id: string }; actionName: string; params: unknown[] }]
}>()

const devicesStore     = useDevicesStore()
const deviceTypesStore = useDeviceTypesStore()
const roomsStore       = useRoomsStore()

const step           = ref(1)
const selectedDevice = ref<RoomDevice | null>(null)
const selectedAction = ref<ApiDeviceTypeAction | null>(null)
const paramValues    = ref<unknown[]>([])
const paramErrors    = ref<(string | null)[]>([])


const stepLabel        = computed(() => ['Elegí el dispositivo', 'Elegí la acción', 'Completá los parámetros'][step.value - 1])
const rooms            = computed(() => roomsStore.rooms)
const availableActions = computed(() =>
  selectedDevice.value ? (deviceTypesStore.getByFrontType(selectedDevice.value.type)?.actions ?? []) : []
)
const canAdvance = computed(() => step.value === 1 ? !!selectedDevice.value : !!selectedAction.value)
const canConfirm = computed(() => !!selectedAction.value && paramErrors.value.every(e => !e))

// search state
const searchQuery = ref('')

const TYPE_LABELS: Record<string, string> = {
  light: 'Lámpara', ac: 'Aire acond.', vacuum: 'Aspiradora',
  speaker: 'Parlante', faucet: 'Grifo', blind: 'Persiana',
  oven: 'Horno', door: 'Puerta', alarm: 'Alarma', fridge: 'Heladera',
}

const filteredDevices = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return devicesStore.devicesForActiveHome.filter(d => {
    if (!q) return true
    return (
      d.name.toLowerCase().includes(q) ||
      (d.roomName ?? '').toLowerCase().includes(q) ||
      (TYPE_LABELS[d.type] ?? '').toLowerCase().includes(q)
    )
  })
})

// if selected device is no longer visible, clear selection
watch(searchQuery, () => {
  if (selectedDevice.value && !filteredDevices.value.find(d => d.id === selectedDevice.value!.id)) {
    selectedDevice.value = null
  }
})

function clearParams() {
  paramValues.value = []
  paramErrors.value = []
}

function selectDevice(device: RoomDevice) {
  selectedDevice.value = device
  selectedAction.value = null
  clearParams()
}

function selectAction(act: ApiDeviceTypeAction) {
  selectedAction.value = act
  clearParams()
}

function initParamValues(action: ApiDeviceTypeAction) {
  paramValues.value = (action.params ?? []).map((p: ApiDeviceTypeParam) => {
    if (hasSupportedValues(p)) return p.supportedValues![0]
    if (isColorParam(p, action.name)) return '#FFFFFF'
    if (p.type === 'boolean') return false
    if (p.type === 'integer' || p.type === 'number') return getParamMin(p) ?? 0
    return ''
  })
  paramErrors.value = (action.params ?? []).map(() => null)
}

function advance() {
  if (step.value === 2 && selectedAction.value) initParamValues(selectedAction.value)
  step.value++
}

function validateParams(): boolean {
  if (!selectedAction.value) return false
  let valid = true
  paramErrors.value = (selectedAction.value.params ?? []).map((param: ApiDeviceTypeParam, i: number) => {
    const val = paramValues.value[i]
    const isEmpty = val === '' || val === null || val === undefined
    if (isSecurityCodeParam(param)) {
      if (isEmpty) { valid = false; return 'El código es obligatorio' }
      return null
    }
    if (isRoomIdParam(param)) {
      if (isEmpty) { valid = false; return 'Seleccioná una habitación' }
      return null
    }
    if (isColorParam(param, selectedAction.value!.name)) {
      if (!validHex(val)) { valid = false; return 'Formato inválido. Usá #RRGGBB' }
      return null
    }
    if (param.type === 'integer' || param.type === 'number') {
      if (isEmpty) { valid = false; return 'Este campo es obligatorio' }
      const min = getParamMin(param)
      const max = getParamMax(param)
      if (min !== undefined && Number(val) < min) { valid = false; return 'Mínimo ' + min }
      if (max !== undefined && Number(val) > max) { valid = false; return 'Máximo ' + max }
      return null
    }
    if (param.type === 'string' && isEmpty) { valid = false; return 'Este campo es obligatorio' }
    if (hasSupportedValues(param) && !param.supportedValues!.includes(val)) { valid = false; return 'Valor no permitido' }
    return null
  })
  return valid
}

function confirm() {
  if (!validateParams() || !selectedDevice.value || !selectedAction.value) return
  const params = (selectedAction.value.params ?? []).map((param: ApiDeviceTypeParam, i: number) => {
    const val = paramValues.value[i]
    if (isColorParam(param, selectedAction.value!.name)) return normalizeHexColor(String(val ?? '#FFFFFF'))
    if (param.type === 'integer' || param.type === 'number') return Number(val)
    return val
  })
  emit('confirm', {
    device: { id: String(selectedDevice.value.id) },
    actionName: selectedAction.value.name,
    params,
  })
  reset()
}

function cancel() { emit('cancel') }

function reset() {
  step.value = 1
  selectedDevice.value = null
  selectedAction.value = null
  searchQuery.value = ''
  clearParams()
}

onMounted(async () => {
  reset()
  if (devicesStore.devices.length === 0) {
    await devicesStore.fetchAll()
  }
})

function validHex(v: unknown): boolean {
  return typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v)
}
</script>

<style scoped>
.rab { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.rab__head { padding: 10px 28px 0; flex-shrink: 0; }
.rab__step-label { margin: 0; font-size: 11px; font-weight: 600; color: var(--sh-text-muted); text-transform: uppercase; letter-spacing: .05em; }
.rab__body { flex: 1 1 auto; overflow-y: auto; padding: 12px 28px; display: flex; flex-direction: column; gap: 10px; }
.rab__hint { margin: 0; display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--sh-text-main); }
.rab__hint-sub { font-weight: 400; font-size: 12px; color: var(--sh-text-muted); }
.rab__empty { margin: 0; font-size: 13px; color: var(--sh-text-light); text-align: center; padding: 16px 0; }
.rab__search-row { position: relative; }
.rab__search { width: 100%; height: 34px; padding: 0 12px; border: 1px solid var(--sh-border); border-radius: 8px; font-family: var(--sh-font); font-size: 13px; color: var(--sh-text-main); background: #fff; outline: none; transition: border-color 150ms; }
.rab__search:focus { border-color: var(--sh-primary); }
.dev-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
@media (max-width: 500px) { .dev-grid { grid-template-columns: repeat(2, 1fr); } }
.dev-card { position: relative; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 10px 6px; border-radius: 10px; border: 1.5px solid var(--sh-border); background: #fff; cursor: pointer; font-family: var(--sh-font); transition: border-color 150ms, background-color 150ms; }
.dev-card:hover { border-color: rgba(99,102,241,.4); background: #F8FAFC; }
.dev-card--active { border-color: var(--sh-primary); background: var(--sh-primary-light); }
.dev-card:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.dev-card__icon { width: 32px; height: 32px; border-radius: 9px; background: #F1F5F9; color: var(--sh-text-muted); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.dev-card--active .dev-card__icon { background: var(--sh-primary); color: #fff; }
.dev-card__name { font-size: 11px; font-weight: 600; color: var(--sh-text-main); text-align: center; line-height: 1.2; }
.dev-card__room { font-size: 10px; color: var(--sh-text-light); text-align: center; }
.dev-card__check { position: absolute; top: 5px; right: 5px; color: var(--sh-primary); }
.item-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.item-list__row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--sh-border); cursor: pointer; transition: border-color 150ms, background-color 150ms; }
.item-list__row:hover, .item-list__row--active { border-color: var(--sh-primary); background: var(--sh-primary-light); }
.item-list__row:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.item-list__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.item-list__name { font-size: 13px; font-weight: 600; color: var(--sh-text-main); }
.item-list__sub { font-size: 11px; color: var(--sh-text-light); }
.pf { display: flex; flex-direction: column; gap: 5px; }
.pf__label { font-size: 12px; font-weight: 600; color: var(--sh-text-main); }
.pf__desc { font-weight: 400; color: var(--sh-text-muted); }
.pf__input { width: 100%; height: 36px; padding: 0 12px; border: 1px solid var(--sh-border); border-radius: 8px; background: #fff; color: var(--sh-text-main); font-family: var(--sh-font); font-size: 14px; outline: none; transition: border-color 150ms; }
.pf__input:focus { border-color: var(--sh-primary); }
.pf__row { display: flex; align-items: center; gap: 8px; }
.pf__color-dot { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--sh-border); flex-shrink: 0; }
.pf__slider { flex: 1; }
.pf__slider-val { font-size: 13px; font-weight: 600; color: var(--sh-text-main); min-width: 32px; text-align: right; }
.pf__error { font-size: 12px; color: var(--sh-error); margin: 0; }
.rab__footer { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding: 16px 28px; border-top: 1px solid var(--sh-border); background: #F8FAFC; border-radius: 0 0 18px 18px; }
.rab__footer-right { display: flex; gap: 8px; align-items: center; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 9px; font-family: var(--sh-font); font-size: 13px; font-weight: 600; cursor: pointer; transition: background-color 150ms; }
.btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.btn--ghost { background: transparent; border: none; color: var(--sh-text-muted); padding: 8px 10px; border-radius: 8px; }
.btn--ghost:hover { background: #F1F5F9; color: var(--sh-text-main); }
.btn--outline { background: #fff; border: 1px solid var(--sh-border); color: var(--sh-text-muted); }
.btn--outline:hover { background: #F8FAFC; color: var(--sh-text-main); }
.btn--primary { background: var(--sh-primary); border: none; color: #fff; box-shadow: 0 4px 8px -2px rgba(99,102,241,.3); }
.btn--primary:hover:not(:disabled) { background: var(--sh-primary-dark); }
.btn--primary:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }

/* ── pf-select: v-select field matching design system ── */
:deep(.pf-select .v-field) {
  border-radius: 10px;
  transition: box-shadow 150ms;
}
:deep(.pf-select .v-field--variant-outlined .v-field__outline__start),
:deep(.pf-select .v-field--variant-outlined .v-field__outline__end),
:deep(.pf-select .v-field--variant-outlined .v-field__outline__notch) {
  border-color: var(--sh-border);
  transition: border-color 150ms;
}
:deep(.pf-select .v-field--variant-outlined.v-field--focused .v-field__outline__start),
:deep(.pf-select .v-field--variant-outlined.v-field--focused .v-field__outline__end),
:deep(.pf-select .v-field--variant-outlined.v-field--focused .v-field__outline__notch) {
  border-color: var(--sh-primary);
}
:deep(.pf-select .v-field--focused) {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, .15);
  border-radius: 10px;
}
:deep(.pf-select .v-field__input) {
  font-family: var(--sh-font);
  font-size: 14px;
  color: var(--sh-text-main);
  min-height: 36px;
  padding-top: 0;
  padding-bottom: 0;
  align-items: center;
}
:deep(.pf-select .v-select__selection-text) {
  font-size: 14px;
  color: var(--sh-text-main);
  font-family: var(--sh-font);
}
:deep(.pf-select .v-field__append-inner) {
  padding-top: 0;
  align-items: center;
  color: var(--sh-text-muted);
}
</style>

<!-- unscoped: targets the teleported overlay (.rab-menu applied via menu-props) -->
<style>
.rab-menu .v-list {
  border-radius: 12px !important;
  border: 1px solid var(--sh-border) !important;
  box-shadow:
    0 4px 16px -4px rgba(15, 23, 42, .12),
    0 1px 3px rgba(15, 23, 42, .06) !important;
  padding: 4px !important;
  font-family: var(--sh-font) !important;
}
.rab-menu .v-list-item {
  border-radius: 8px !important;
  font-size: 13px !important;
  font-family: var(--sh-font) !important;
  min-height: 36px !important;
  padding-inline: 10px !important;
  color: var(--sh-text-main) !important;
  transition: background-color 100ms !important;
}
.rab-menu .v-list-item:hover > .v-list-item__overlay {
  opacity: 0 !important;
}
.rab-menu .v-list-item:hover {
  background: var(--sh-primary-light) !important;
  color: var(--sh-primary-dark) !important;
}
.rab-menu .v-list-item--active {
  background: var(--sh-primary-light) !important;
  color: var(--sh-primary) !important;
  font-weight: 600 !important;
}
.rab-menu .v-list-item--active .v-list-item__overlay {
  opacity: 0 !important;
}
</style>
