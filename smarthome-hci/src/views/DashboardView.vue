<template>
  <div class="dashboard">

    <!-- Greeting -->
    <section class="greeting" aria-label="Saludo">
      <h1 class="greeting__title">¡Hola, {{ auth.displayName }}!</h1>
      <p class="greeting__subtitle">
        Bienvenido a casa, la calidad del aire es buena y el ambiente está fresco.
      </p>
    </section>

    <!-- Quick Actions -->
    <section class="quick-section" aria-labelledby="quick-actions-heading">
      <p id="quick-actions-heading" class="quick-section__label">Acciones Rápidas</p>
      <div class="quick-section__card">
        <div class="quick-action">
          <v-icon
            :icon="doorLocked ? 'mdi-lock' : 'mdi-lock-open-outline'"
            size="22"
            class="quick-action__icon"
            aria-hidden="true"
          />
          <div class="quick-action__text">
            <p class="quick-action__name">Puerta Principal</p>
            <p class="quick-action__status">{{ doorLocked ? 'Bloqueada' : 'Desbloqueada' }}</p>
          </div>
        </div>
        <button
          type="button"
          class="btn-action"
          :class="doorLocked ? 'btn-action--primary' : 'btn-action--ghost'"
          @click="doorLocked = !doorLocked"
        >
          {{ doorLocked ? 'Desbloquear' : 'Bloquear' }}
        </button>
      </div>
    </section>

    <!-- Category filters -->
    <div class="filters" role="group" aria-label="Filtrar por categoría">
      <span class="filters__label" aria-hidden="true">Filtrar:</span>
      <div class="filters__row">
        <button
          v-for="filter in filters"
          :key="filter.id"
          type="button"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeFilter === filter.id }"
          :aria-pressed="activeFilter === filter.id"
          @click="activeFilter = filter.id"
        >
          <v-icon :icon="filter.icon" size="15" aria-hidden="true" />
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Rooms -->
    <section aria-labelledby="rooms-heading">
      <div class="section-header">
        <div>
          <h2 id="rooms-heading" class="section-header__title">Habitaciones</h2>
          <p class="section-header__sub">{{ filteredRooms.length }} habitaciones</p>
        </div>
        <button type="button" class="btn-add" aria-label="Agregar nuevo dispositivo" @click="addDeviceOpen = true">
          <v-icon icon="mdi-plus" size="18" aria-hidden="true" />
          Agregar Dispositivo
        </button>
      </div>
      <div class="rooms-grid">
        <RoomCard
          v-for="room in filteredRooms"
          :key="room.id"
          :room="room"
        />
      </div>
      <p v-if="filteredRooms.length === 0" class="empty-state" role="status">
        No hay habitaciones en esta categoría.
      </p>
    </section>

    <!-- Routines -->
    <section aria-labelledby="routines-heading">
      <div class="section-header">
        <div>
          <h2 id="routines-heading" class="section-header__title">Rutinas</h2>
          <p class="section-header__sub">Automatizá acciones según tu horario</p>
        </div>
        <button type="button" class="btn-add" aria-label="Agregar nueva rutina">
          <v-icon icon="mdi-plus" size="18" aria-hidden="true" />
          Agregar Rutina
        </button>
      </div>
      <div class="routines-grid">
        <RoutineCard
          v-for="routine in routines"
          :key="routine.id"
          :routine="routine"
        />
      </div>
    </section>

    <AddDeviceModal
      v-model:open="addDeviceOpen"
      :rooms="rooms"
      @confirm="handleAddDevice"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject, watch } from 'vue'
import type { Ref } from 'vue'
import RoomCard from '@/components/dashboard/RoomCard.vue'
import RoutineCard from '@/components/dashboard/RoutineCard.vue'
import AddDeviceModal from '@/components/dashboard/AddDeviceModal.vue'
import type { Room, Routine, Device } from '@/types/dashboard'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const activeFilter  = ref('todas')
const doorLocked    = ref(true)
const addDeviceOpen = ref(false)

// Search injected from AppLayout
const layoutSearch = inject<Ref<string>>('layoutSearchQuery', ref(''))

// ── Device creation constants ──

const CATEGORY_ICONS: Record<string, string> = {
  sala:       'mdi-sofa',
  habitacion: 'mdi-bed',
  cocina:     'mdi-silverware-fork-knife',
  bano:       'mdi-shower',
  otro:       'mdi-home-variant',
}

const DEVICE_LABELS: Record<string, string> = {
  vacuum:  'Aspiradora',
  speaker: 'Parlante',
  faucet:  'Grifo',
  blind:   'Persiana',
  light:   'Lámpara',
  oven:    'Horno',
  ac:      'Aire Acond.',
  door:    'Puerta',
  alarm:   'Alarma',
  fridge:  'Heladera',
}

type DeviceDefaults = Omit<Device, 'id' | 'name'>

const DEVICE_DEFAULTS: Record<string, DeviceDefaults> = {
  vacuum:  { type: 'vacuum',  value: 0,   unit: '',   hasSlider: false, active: false },
  speaker: { type: 'speaker', value: 5,   unit: '',   hasSlider: true,  active: false, min: 0,  max: 10,  step: 1  },
  faucet:  { type: 'faucet',  value: 0,   unit: 'L',  hasSlider: true,  active: false, min: 0,  max: 50,  step: 1  },
  blind:   { type: 'blind',   value: 0,   unit: '%',  hasSlider: true,  active: false, min: 0,  max: 100, step: 5  },
  light:   { type: 'light',   value: 75,  unit: '%',  hasSlider: true,  active: false, min: 0,  max: 100, step: 5  },
  oven:    { type: 'oven',    value: 180, unit: '°C', hasSlider: true,  active: false, min: 90, max: 230, step: 10 },
  ac:      { type: 'ac',      value: 22,  unit: '°C', hasSlider: true,  active: false, min: 18, max: 38,  step: 1  },
  door:    { type: 'door',    value: 0,   unit: '',   hasSlider: false, active: false },
  alarm:   { type: 'alarm',   value: 0,   unit: '',   hasSlider: false, active: false },
  fridge:  { type: 'fridge',  value: 4,   unit: '°C', hasSlider: true,  active: false, min: 2,  max: 8,   step: 1  },
}

function handleAddDevice(payload: {
  deviceTypes:   string[]
  targetRoomIds: number[]
  newRooms:      { name: string; category: string }[]
}) {
  const maxRoomId   = rooms.reduce((m, r) => Math.max(m, r.id), 0)
  const maxDeviceId = rooms.flatMap(r => r.devices).reduce((m, d) => Math.max(m, d.id), 0)
  let nextRoomId   = maxRoomId + 1
  let nextDeviceId = maxDeviceId + 1

  const created: Room[] = payload.newRooms.map((def, i) => ({
    id:       nextRoomId + i,
    name:     def.name,
    icon:     CATEGORY_ICONS[def.category] ?? 'mdi-home-variant',
    category: def.category,
    devices:  [],
  }))
  rooms.push(...created)

  const allTargetIds = [...payload.targetRoomIds, ...created.map(r => r.id)]
  for (const roomId of allTargetIds) {
    const room = rooms.find(r => r.id === roomId)
    if (!room) continue
    for (const deviceType of payload.deviceTypes) {
      const defaults = DEVICE_DEFAULTS[deviceType]
      if (!defaults) continue
      room.devices.push({ id: nextDeviceId++, name: DEVICE_LABELS[deviceType] ?? deviceType, ...defaults } as Device)
    }
  }
}

const filters = [
  { id: 'todas',      icon: 'mdi-apps',                  label: 'Todas'      },
  { id: 'sala',       icon: 'mdi-sofa',                  label: 'Sala'       },
  { id: 'habitacion', icon: 'mdi-bed',                   label: 'Habitación' },
  { id: 'cocina',     icon: 'mdi-silverware-fork-knife', label: 'Cocina'     },
  { id: 'bano',       icon: 'mdi-shower',                label: 'Baño'       },
]

const rooms = reactive<Room[]>([
  {
    id: 1, name: 'Sala de Estar', icon: 'mdi-sofa', category: 'sala',
    devices: [
      { id: 101, name: 'Luz Principal',  type: 'light',     value: 75, unit: '%', hasSlider: true,  active: true  },
      { id: 102, name: 'Luz Secundaria', type: 'light',     value: 75, unit: '%', hasSlider: true,  active: true  },
      { id: 103, name: 'Aspiradora',     type: 'appliance', value: 0,  unit: '',  hasSlider: false, active: true  },
    ],
  },
  {
    id: 2, name: 'Habitación Principal', icon: 'mdi-bed', category: 'habitacion',
    devices: [
      { id: 201, name: 'Luz Ambiente',       type: 'light',     value: 45, unit: '%', hasSlider: true,  active: true  },
      { id: 202, name: 'Aire acondicionado', type: 'ac',        value: 24, unit: 'C', hasSlider: true,  active: true  },
      { id: 203, name: 'Aspiradora',         type: 'appliance', value: 0,  unit: '',  hasSlider: false, active: false },
    ],
  },
  {
    id: 3, name: 'Cocina', icon: 'mdi-silverware-fork-knife', category: 'cocina',
    devices: [
      { id: 301, name: 'Luz Principal',      type: 'light',     value: 100, unit: '%', hasSlider: true,  active: true },
      { id: 302, name: 'Campana Extractora', type: 'appliance', value: 0,   unit: '',  hasSlider: false, active: true },
    ],
  },
  {
    id: 4, name: 'Habitación Secundaria', icon: 'mdi-bed-outline', category: 'habitacion',
    devices: [
      { id: 401, name: 'Luz Principal',      type: 'light', value: 45, unit: '%', hasSlider: true, active: true },
      { id: 402, name: 'Aire acondicionado', type: 'ac',    value: 24, unit: 'C', hasSlider: true, active: true },
    ],
  },
])

const routines = reactive<Routine[]>([
  { id: 1, name: 'Buenos Días',      time: '07:00 AM',           icon: 'mdi-weather-sunny',  active: true,  actions: ['Encender sala 50%', 'Subir temperatura a 22°C', 'Abrir persianas'] },
  { id: 2, name: 'Buenas Noches',    time: '10:00 PM',           icon: 'mdi-weather-night',  active: true,  actions: ['Apagar todas las luces', 'Bajar temperatura a 20°C', 'Cerrar persianas'] },
  { id: 3, name: 'Llegando a Casa',  time: 'Al detectar ubicación', icon: 'mdi-map-marker', active: false, actions: ['Encender luces entrada', 'Desbloquear puerta', 'Encender AC'] },
])

const filteredRooms = computed<Room[]>(() => {
  const q = layoutSearch.value.trim().toLowerCase()
  return rooms.filter(r => {
    const matchesCategory = activeFilter.value === 'todas' || r.category === activeFilter.value
    const matchesSearch   = !q || r.name.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: 'Inter', sans-serif;
}

.greeting__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.2;
}
.greeting__subtitle {
  margin: 6px 0 0;
  font-size: 15px;
  color: var(--sh-text-muted);
}

.quick-section__label {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--sh-text-light);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: 'Inter', sans-serif;
}
.quick-section__card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid var(--sh-border);
  box-shadow: 0 1px 3px rgba(15, 23, 42, .06);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.quick-action {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}
.quick-action__icon { color: var(--sh-primary); flex-shrink: 0; }
.quick-action__name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--sh-text-main);
  font-family: 'Inter', sans-serif;
}
.quick-action__status {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--sh-text-light);
  font-family: 'Inter', sans-serif;
}

.btn-action {
  height: 40px;
  padding: 0 24px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms;
}
.btn-action--primary { background: var(--sh-primary); color: #ffffff; border-color: var(--sh-primary); }
.btn-action--primary:hover { background: var(--sh-primary-dark); border-color: var(--sh-primary-dark); }
.btn-action--ghost { background: #f1f5f9; color: var(--sh-text-muted); border-color: var(--sh-border); }
.btn-action--ghost:hover { background: #e2e8f0; }
.btn-action:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.filters {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.filters__label { font-size: 14px; font-weight: 500; color: var(--sh-text-muted); flex-shrink: 0; }
.filters__row { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid var(--sh-border);
  background: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  cursor: pointer;
  transition: border-color 150ms, background-color 150ms, color 150ms;
}
.filter-chip:hover:not(.filter-chip--active) { border-color: var(--sh-text-muted); color: var(--sh-text-main); }
.filter-chip:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.filter-chip--active { background: var(--sh-primary); border-color: var(--sh-primary); color: #ffffff; }

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.section-header__title { margin: 0; font-size: 20px; font-weight: 700; color: var(--sh-text-main); font-family: 'Inter', sans-serif; }
.section-header__sub   { margin: 4px 0 0; font-size: 13px; color: var(--sh-text-light); font-family: 'Inter', sans-serif; }

.rooms-grid    { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.routines-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 20px;
  background: var(--sh-primary);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background-color 150ms;
}
.btn-add:hover { background: var(--sh-primary-dark); }
.btn-add:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.empty-state {
  padding: 40px 0;
  text-align: center;
  color: var(--sh-text-light);
  font-size: 15px;
  font-family: 'Inter', sans-serif;
}

@media (max-width: 840px) {
  .rooms-grid    { grid-template-columns: 1fr; }
  .routines-grid { grid-template-columns: 1fr; }
  .quick-section__card { flex-direction: column; align-items: flex-start; gap: 14px; }
}
@media (min-width: 841px) and (max-width: 1100px) {
  .routines-grid { grid-template-columns: repeat(2, 1fr); }
}

</style>
