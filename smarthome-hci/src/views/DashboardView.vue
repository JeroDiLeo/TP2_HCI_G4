<template>
  <div class="dashboard">

    <!-- Greeting -->
    <section class="greeting" aria-label="Saludo">
      <h1 class="greeting__title">¡Hola, {{ auth.displayName }}!</h1>
      <p class="greeting__subtitle">
        Bienvenido a casa, la calidad del aire es buena y el ambiente está fresco.
      </p>
    </section>

    <!-- Category filters -->
    <div class="dashboard__filters" role="group" aria-label="Filtrar por categoría">
      <p class="dashboard__filter-label">Filtrar por categoría</p>
      <div class="dashboard__chips">
        <button
          v-for="filter in filters"
          :key="filter.id"
          type="button"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeFilter === filter.id }"
          :aria-pressed="activeFilter === filter.id"
          @click="activeFilter = filter.id"
        >
          <v-icon :icon="filter.icon" size="14" aria-hidden="true" />
          {{ filter.label }}
          <span class="filter-chip__count">{{ filterCounts[filter.id] }}</span>
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
        <button type="button" class="btn-add" aria-label="Agregar nueva habitación" @click="addDeviceOpen = true">
          <v-icon icon="mdi-plus" size="18" aria-hidden="true" />
          Agregar habitación
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
  targetRoomId: number | null
  newRoom:      { name: string; category: string } | null
  devices:      { type: string; name: string }[]
}) {
  const maxRoomId   = rooms.reduce((m, r) => Math.max(m, r.id), 0)
  const maxDeviceId = rooms.flatMap(r => r.devices).reduce((m, d) => Math.max(m, d.id), 0)
  let nextDeviceId = maxDeviceId + 1

  let targetRoom: Room | undefined
  if (payload.newRoom) {
    targetRoom = {
      id:       maxRoomId + 1,
      name:     payload.newRoom.name,
      icon:     CATEGORY_ICONS[payload.newRoom.category] ?? 'mdi-home-variant',
      category: payload.newRoom.category,
      devices:  [],
    }
    rooms.push(targetRoom)
  } else if (payload.targetRoomId !== null) {
    targetRoom = rooms.find(r => r.id === payload.targetRoomId)
  }

  if (!targetRoom) return

  for (const dev of payload.devices) {
    const defaults = DEVICE_DEFAULTS[dev.type]
    if (!defaults) continue
    targetRoom.devices.push({
      id:   nextDeviceId++,
      name: dev.name || DEVICE_LABELS[dev.type] || dev.type,
      ...defaults,
    } as Device)
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

const filterCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = { todas: rooms.length }
  for (const f of filters) {
    if (f.id === 'todas') continue
    counts[f.id] = rooms.filter(r => r.category === f.id).length
  }
  return counts
})

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

/* ── Filters (mismo estilo que /rutinas) ── */
.dashboard__filters { margin-bottom: 4px; }
.dashboard__filter-label {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  font-family: 'Inter', sans-serif;
}
.dashboard__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1.5px solid var(--sh-border);
  background: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  cursor: pointer;
  transition: border-color 150ms, background-color 150ms, color 150ms;
}
.filter-chip:hover:not(.filter-chip--active) {
  border-color: var(--sh-text-muted);
  background-color: #F8FAFC;
}
.filter-chip:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.filter-chip--active {
  background: var(--sh-primary);
  border-color: var(--sh-primary);
  color: #ffffff;
}
.filter-chip--active .filter-chip__count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}
.filter-chip__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--sh-primary-light);
  color: var(--sh-primary-dark);
  font-size: 11px;
  font-weight: 700;
}

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
}
@media (min-width: 841px) and (max-width: 1100px) {
  .routines-grid { grid-template-columns: repeat(2, 1fr); }
}

</style>
