<template>
  <div
    class="dashboard"
    :class="{ 'dashboard--initial-empty': showInitialHomeEmptyState }"
  >

    <!-- ── Hero ── -->
    <section class="hero" aria-label="Saludo">
      <div class="hero__main">
        <h1 class="hero__title">¡Hola, {{ auth.displayName }}!</h1>
        <p class="hero__message">Bienvenido a tu casa inteligente.</p>
      </div>
      <div class="hero__stats" aria-label="Resumen del hogar">
        <div class="hero-stat">
          <span class="hero-stat__icon" aria-hidden="true">
            <v-icon icon="mdi-devices" size="20" />
          </span>
          <div class="hero-stat__text">
            <p class="hero-stat__value">{{ totalActiveDevices }}</p>
            <p class="hero-stat__label">
              {{ totalActiveDevices === 1 ? 'dispositivo encendido' : 'dispositivos encendidos' }}
            </p>
          </div>
        </div>
        <div class="hero-stat">
          <span class="hero-stat__icon" aria-hidden="true">
            <v-icon icon="mdi-door" size="20" />
          </span>
          <div class="hero-stat__text">
            <p class="hero-stat__value">{{ totalRooms }}</p>
            <p class="hero-stat__label">
              {{ totalRooms === 1 ? 'habitación' : 'habitaciones' }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <div v-if="showRoomsLoadingState" class="dashboard-loader" role="status" aria-live="polite">
      <v-progress-circular indeterminate color="var(--sh-primary)" size="40" />
      <p class="dashboard-loader__text">Cargando habitaciones…</p>
    </div>

    <div v-else-if="showInitialHomeEmptyState" class="initial-empty-stage">
      <section
        class="initial-empty"
        aria-labelledby="initial-empty-title"
      >
        <div class="initial-empty__content">
          <div class="initial-empty__copy">
            <h2 id="initial-empty-title" class="initial-empty__title">
              Empezá organizando tu hogar
            </h2>
            <p class="initial-empty__text">
              Creá tu primera habitación para agrupar tus dispositivos por espacios y empezar a controlar tu casa de forma más ordenada.
            </p>
            <button type="button" class="initial-empty__cta" @click="openCreateRoomModal">
              <v-icon icon="mdi-door" size="18" aria-hidden="true" />
              Crear habitación
            </button>
            <p class="initial-empty__note">
              <v-icon icon="mdi-information-outline" size="16" aria-hidden="true" />
              Más adelante vas a poder crear rutinas para automatizar acciones frecuentes.
            </p>
          </div>

          <div class="initial-empty__visual" aria-hidden="true">
            <svg
              class="home-illustration"
              viewBox="0 0 520 260"
              role="img"
              focusable="false"
            >
              <circle class="home-illustration__glow" cx="261" cy="178" r="86" />
              <path class="home-illustration__stroke home-illustration__soft" d="M70 218H452" />
              <path class="home-illustration__fill" d="M178 144h166a26 26 0 0 1 26 26v48H152v-48a26 26 0 0 1 26-26Z" />
              <path class="home-illustration__stroke" d="M178 144h166a26 26 0 0 1 26 26v48H152v-48a26 26 0 0 1 26-26Z" />
              <path class="home-illustration__stroke home-illustration__soft" d="M261 144V218" />
              <path class="home-illustration__stroke home-illustration__soft" d="M176 178H346" />
              <path class="home-illustration__stroke" d="M404 104h42l18 114h-78l18-114Z" />
              <path class="home-illustration__stroke home-illustration__soft" d="M425 104V218" />
              <path class="home-illustration__stroke" d="M259 58v46" />
              <path class="home-illustration__stroke" d="M232 104h54" />
              <path class="home-illustration__fill" d="M238 104c4-26 40-26 44 0H238Z" />
              <path class="home-illustration__stroke" d="M238 104c4-26 40-26 44 0H238Z" />
              <path class="home-illustration__fill" d="M82 174h48v44H82z" />
              <path class="home-illustration__stroke" d="M82 174h48v44H82z" />
              <path class="home-illustration__stroke" d="M106 174c-18-34-44-36-58-22c24 6 42 16 58 22Z" />
              <path class="home-illustration__stroke" d="M108 174c7-42 30-58 58-54c-8 28-26 46-58 54Z" />
              <path class="home-illustration__stroke home-illustration__soft" d="M353 70H398V108H353z" />
            </svg>
          </div>
        </div>
      </section>
    </div>

    <template v-else>
      <DashboardSearchResults
        v-if="hasDashboardSearch"
        :query="dashboardSearchQuery"
        :sections="dashboardSearchSections"
        :total-results="dashboardSearchTotal"
        :loading="showSearchLoadingState"
        @clear="clearDashboardSearch"
        @select="handleSearchSelect"
        @action="handleSearchAction"
      />

      <template v-else>
        <!-- ── Habitaciones favoritas ── -->
        <section class="block" aria-labelledby="rooms-heading">
          <header class="block__header">
            <div class="block__heading">
              <h2 id="rooms-heading" class="block__title">Habitaciones favoritas</h2>
              <p class="block__subtitle">
                Creá nuevas habitaciones o sumá dispositivos a las que ya tenés.
              </p>
            </div>
            <button
              type="button"
              class="btn-add"
              aria-label="Crear habitación o sumar dispositivos a una existente"
              title="Crear habitación o agregar dispositivos a una existente"
              @click="addDeviceOpen = true"
            >
              <v-icon icon="mdi-plus" size="18" aria-hidden="true" />
              Crear habitación
            </button>
          </header>

          <!-- Estado B: hay habitaciones pero ninguna favorita -->
          <div v-if="favoriteRooms.length === 0" class="hint-empty">
            <span class="hint-empty__icon" aria-hidden="true">
              <v-icon icon="mdi-star-outline" size="20" />
            </span>
            <p class="hint-empty__text">
              Marcá tus habitaciones más usadas con la
              <v-icon icon="mdi-star" size="13" class="hint-empty__star" aria-hidden="true" />
              desde <RouterLink to="/rooms" class="hint-empty__link">Habitaciones</RouterLink>
              para tenerlas siempre a mano.
            </p>
          </div>

          <!-- Estado C: con favoritas -->
          <div v-else class="rooms-grid">
            <RoomCard
              v-for="(room, idx) in favoriteRooms"
              :key="room.id"
              :room="room"
              :style="cardDelay(idx)"
              @view-details="goToRooms"
              @toggle-favorite="roomsStore.toggleFavorite($event)"
            />
          </div>
        </section>

        <!-- ── Rutinas favoritas ── -->
        <section class="block" aria-labelledby="routines-heading">
          <header class="block__header">
            <div class="block__heading">
              <h2 id="routines-heading" class="block__title">Rutinas favoritas</h2>
              <p class="block__subtitle">
                Automatizá las acciones que más usás. Marcá favoritas para verlas acá.
              </p>
            </div>
            <button
              type="button"
              class="btn-add"
              aria-label="Crear nueva rutina"
              @click="createRoutineOpen = true"
            >
              <v-icon icon="mdi-plus" size="18" aria-hidden="true" />
              Crear rutina
            </button>
          </header>

          <div v-if="showRoutinesLoadingState" class="routine-empty routine-empty--loading" role="status" aria-live="polite">
            <v-progress-circular indeterminate color="var(--sh-primary)" size="28" />
            <p class="routine-empty__loading-text">Cargando rutinas…</p>
          </div>

          <!-- Estado A: usuario sin rutinas -->
          <div v-else-if="hasNoRoutines" class="routine-empty">
            <div class="routine-empty__icon" aria-hidden="true">
              <v-icon icon="mdi-flash-outline" size="34" />
            </div>
            <div class="routine-empty__body">
              <h3 class="routine-empty__title">Todavía no creaste ninguna rutina</h3>
              <p class="routine-empty__text">
                Automatizá acciones frecuentes para ahorrar tiempo y hacer tu hogar más cómodo.
              </p>
              <p class="routine-empty__example">Ejemplo: encender luces al atardecer</p>
              <p class="routine-empty__hint">Usá el botón “Crear rutina” para empezar.</p>
            </div>
            <div class="routine-empty__visual" aria-hidden="true">
              <svg class="routine-illustration" viewBox="0 0 260 120" focusable="false">
                <path class="routine-illustration__guide" d="M46 60H214" />
                <circle class="routine-illustration__node routine-illustration__node--trigger" cx="52" cy="60" r="24" />
                <circle class="routine-illustration__node" cx="130" cy="60" r="20" />
                <circle class="routine-illustration__node" cx="208" cy="60" r="24" />
                <path class="routine-illustration__clock" d="M52 48v13l9 6" />
                <path class="routine-illustration__bolt" d="M130 46l-10 18h10l-6 15l17-22h-10l5-11h-6Z" />
                <path class="routine-illustration__bulb" d="M198 58a10 10 0 1 1 20 0c0 6-5 8-5 14h-10c0-6-5-8-5-14Z" />
                <path class="routine-illustration__bulb-base" d="M203 78h10M205 86h6" />
                <path class="routine-illustration__soft" d="M76 38h28M156 82h26" />
              </svg>
            </div>
          </div>

          <!-- Estado B: rutinas sin favoritas -->
          <div v-else-if="hasRoutinesButNoFavorites" class="hint-empty">
            <span class="hint-empty__icon" aria-hidden="true">
              <v-icon icon="mdi-star-outline" size="20" />
            </span>
            <p class="hint-empty__text">
              Marcá tus rutinas favoritas con la
              <v-icon icon="mdi-star" size="13" class="hint-empty__star" aria-hidden="true" />
              desde <RouterLink to="/rutinas" class="hint-empty__link">Rutinas</RouterLink>
              para tenerlas a un click.
            </p>
          </div>

          <!-- Estado C: con favoritas -->
          <div v-else class="routines-grid" role="list">
            <RoutineCard
              v-for="routine in favoriteRoutines"
              :key="routine.id"
              :routine="routine"
              role="listitem"
              @execute="routinesStore.executeRoutine($event)"
              @edit="handleEditRoutine"
              @toggle-favorite="routinesStore.toggleFavorite($event)"
            />
          </div>
        </section>
      </template>
    </template>

    <!-- ── Modales ── -->
    <AddRoomModal v-model:open="addRoomOpen" />

    <AddDeviceModal
      v-model:open="addDeviceOpen"
      :rooms="modalRooms"
      @confirm="handleAddDevice"
    />

    <CreateRoutineModal
      :open="createRoutineOpen"
      @update:open="createRoutineOpen = $event"
    />

    <EditRoutineModal
      :routine-id="editingRoutineId"
      :open="editRoutineOpen"
      @update:open="onEditRoutineOpenChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRoomsStore } from '@/stores/rooms'
import { useRoutinesStore } from '@/stores/routines'
import { useDevicesStore } from '@/stores/devices'
import RoomCard from '@/components/rooms/RoomCard.vue'
import RoutineCard from '@/components/routines/RoutineCard.vue'
import AddRoomModal from '@/components/rooms/AddRoomModal.vue'
import AddDeviceModal from '@/components/dashboard/AddDeviceModal.vue'
import DashboardSearchResults from '@/components/dashboard/DashboardSearchResults.vue'
import CreateRoutineModal from '@/components/routines/CreateRoutineModal.vue'
import EditRoutineModal from '@/components/routines/EditRoutineModal.vue'
import { getDeviceIcon } from '@/utils/deviceIcons.js'
import type { Room } from '@/stores/rooms'
import type { RoomDevice } from '@/types/rooms'
import type { FrontRoutine } from '@/utils/routineMapper'
import {
  deviceSearchFields,
  formatDeviceState,
  formatRoutineActionCount,
  formatRoutineTrigger,
  getDeviceTypeLabel,
  getRoomActivityLabel,
  getRoomTypeLabel,
  matchesQuery,
  roomSearchFields,
  routineSearchFields,
  type DashboardSearchItem,
  type DashboardSearchSection,
} from '@/utils/dashboardSearch'

const auth          = useAuthStore()
const roomsStore    = useRoomsStore()
const routinesStore = useRoutinesStore()
const devicesStore  = useDevicesStore()
const router        = useRouter()
const layoutSearch  = inject<Ref<string>>('layoutSearchQuery', ref(''))

// ── Reactive views ──
const rooms            = computed(() => roomsStore.rooms)
const routines         = computed(() => routinesStore.filteredRoutines)
const favoriteRooms    = computed(() => roomsStore.favoriteRooms)
const favoriteRoutines = computed(() => routinesStore.favoriteRoutines)
const dashboardSearchQuery = computed(() => layoutSearch.value.trim())
const hasDashboardSearch = computed(() => dashboardSearchQuery.value.length > 0)
const showRoomsLoadingState = computed(() => !roomsStore.roomsLoaded || roomsStore.loading)
const showInitialHomeEmptyState = computed(() =>
  roomsStore.roomsLoaded && !roomsStore.loading && rooms.value.length === 0
)
const showRoutinesLoadingState = computed(() => routinesStore.loading)
const showSearchLoadingState = computed(() =>
  roomsStore.loading || devicesStore.loading || routinesStore.loading
)
const hasNoRoutines = computed(() =>
  !showRoutinesLoadingState.value && routines.value.length === 0
)
const hasRoutinesButNoFavorites = computed(() =>
  !showRoutinesLoadingState.value && routines.value.length > 0 && favoriteRoutines.value.length === 0
)

// ── Search ──
const executingRoutineId = ref<string | null>(null)

const matchingDevices = computed(() => {
  if (!hasDashboardSearch.value) return []
  return devicesStore.devicesForActiveHome.filter((device: RoomDevice) =>
    matchesQuery(dashboardSearchQuery.value, deviceSearchFields(device)),
  )
})

const matchingRooms = computed(() => {
  if (!hasDashboardSearch.value) return []
  return rooms.value.filter((room: Room) =>
    matchesQuery(dashboardSearchQuery.value, roomSearchFields(room)),
  )
})

const matchingRoutines = computed(() => {
  if (!hasDashboardSearch.value) return []
  return routines.value.filter((routine: FrontRoutine) =>
    matchesQuery(
      dashboardSearchQuery.value,
      routineSearchFields(routine, routineActionDeviceName),
    ),
  )
})

const dashboardSearchSections = computed<DashboardSearchSection[]>(() => [
  {
    id: 'device',
    title: 'Dispositivos',
    icon: 'mdi-devices',
    items: matchingDevices.value.map(toDeviceSearchItem),
  },
  {
    id: 'room',
    title: 'Habitaciones',
    icon: 'mdi-door',
    items: matchingRooms.value.map(toRoomSearchItem),
  },
  {
    id: 'routine',
    title: 'Rutinas',
    icon: 'mdi-flash-outline',
    items: matchingRoutines.value.map(toRoutineSearchItem),
  },
])

const dashboardSearchTotal = computed(() =>
  dashboardSearchSections.value.reduce((total, section) => total + section.items.length, 0),
)

// ── Stats ──
const totalActiveDevices = computed(() =>
  devicesStore.devicesForActiveHome.filter((device: { active?: boolean }) => device.active).length
)
const totalRooms = computed(() => rooms.value.length)

// ── Modals ──
const addRoomOpen       = ref(false)
const addDeviceOpen     = ref(false)
const createRoutineOpen = ref(false)
const editRoutineOpen   = ref(false)
const editingRoutineId  = ref<string | null>(null)

// AddDeviceModal expects a Room shape { id, name, icon, devices[] }; we adapt from store.
const ROOM_TYPE_ICONS: Record<string, string> = {
  living:   'mdi-sofa-outline',
  bedroom:  'mdi-bed-king-outline',
  kitchen:  'mdi-silverware-fork-knife',
  bathroom: 'mdi-shower',
  office:   'mdi-briefcase-outline',
  other:    'mdi-home-variant',
}

const modalRooms = computed(() =>
  rooms.value.map((r: {
    id: number | string
    name: string
    type?: string
    devicesTotal?: number
  }) => ({
    id:       r.id,
    name:     r.name,
    icon:     ROOM_TYPE_ICONS[r.type ?? 'other'] ?? 'mdi-home-variant',
    category: r.type ?? 'other',
    devices:  Array.from({ length: r.devicesTotal ?? 0 }, (_, i) => ({ id: i })) as any,
  })),
)

const TYPE_FROM_CATEGORY: Record<string, string> = {
  sala:       'living',
  habitacion: 'bedroom',
  cocina:     'kitchen',
  bano:       'bathroom',
  otro:       'other',
}

async function handleAddDevice(payload: {
  targetRoomId: number | string | null
  newRoom:      { name: string; category: string } | null
  devices:      { type: string; name: string; customIcon?: string }[]
}) {
  let targetId: number | string | null = payload.targetRoomId

  // Primero crear la room si es nueva
  if (payload.newRoom) {
    const created = await roomsStore.addRoom({
      name: payload.newRoom.name,
      type: TYPE_FROM_CATEGORY[payload.newRoom.category] ?? 'other',
    })
    targetId = created.id
  }

  // Luego crear los devices con el roomId correcto
  for (const dev of payload.devices) {
    try {
      await devicesStore.addDevice({
        name: dev.name,
        type: dev.type as any,
        ...(targetId ? { roomId: String(targetId) } : {}),
      })
    } catch (err) {
      console.error(`Error al crear dispositivo "${dev.name}":`, err)
    }
  }
}

function handleEditRoutine(id: string) {
  editingRoutineId.value = id
  editRoutineOpen.value = true
}

function routineActionDeviceName(deviceId: string) {
  return devicesStore.getDeviceById(String(deviceId))?.name ?? ''
}

function toDeviceSearchItem(device: RoomDevice): DashboardSearchItem {
  return {
    kind: 'device',
    id: String(device.id),
    title: device.name,
    icon: getDeviceIcon(device.type),
    eyebrow: getDeviceTypeLabel(device.type),
    meta: device.roomName ? `En ${device.roomName}` : 'Sin habitación',
    detail: formatDeviceState(device),
    targetRoomId: String(device.roomId),
  }
}

function toRoomSearchItem(room: Room): DashboardSearchItem {
  const total = room.devicesTotal ?? 0
  const favorite = !!room.favorite

  return {
    kind: 'room',
    id: String(room.id),
    title: room.name,
    icon: ROOM_TYPE_ICONS[room.type ?? 'other'] ?? 'mdi-home-variant',
    eyebrow: getRoomTypeLabel(room.type),
    meta: getRoomActivityLabel(room),
    detail: total === 0 ? 'Lista para sumar dispositivos' : `${total} dispositivo${total === 1 ? '' : 's'} vinculados`,
    favorite,
    targetRoomId: String(room.id),
  }
}

function toRoutineSearchItem(routine: FrontRoutine): DashboardSearchItem {
  const isExecuting = executingRoutineId.value === routine.id

  return {
    kind: 'routine',
    id: routine.id,
    title: routine.name,
    icon: routine.icon,
    eyebrow: routine.category,
    meta: formatRoutineTrigger(routine),
    detail: routine.description
      ? `${formatRoutineActionCount(routine)} · ${routine.description}`
      : formatRoutineActionCount(routine),
    favorite: routine.favorite,
    actionLabel: isExecuting ? 'Ejecutando' : 'Ejecutar',
    actionLoading: isExecuting,
  }
}

function clearDashboardSearch() {
  layoutSearch.value = ''
}

function handleSearchSelect(item: DashboardSearchItem) {
  if (item.kind === 'routine') {
    handleEditRoutine(item.id)
    return
  }

  const roomId = item.targetRoomId ?? item.id
  const routeLocation = {
    name: 'room-detail',
    params: { roomId },
    ...(item.kind === 'device' ? { query: { deviceId: item.id } } : {}),
  }
  router.push(routeLocation)
}

async function handleSearchAction(item: DashboardSearchItem) {
  if (item.kind !== 'routine' || executingRoutineId.value) return

  executingRoutineId.value = item.id
  try {
    await routinesStore.executeRoutine(item.id)
  } catch (err) {
    console.error(`Error al ejecutar rutina "${item.title}":`, err)
  } finally {
    executingRoutineId.value = null
  }
}

function onEditRoutineOpenChange(val: boolean) {
  editRoutineOpen.value = val
  if (!val) editingRoutineId.value = null
}

function cardDelay(idx: number | string) {
  return { '--card-delay': `${Number(idx) * 30}ms` }
}

function openCreateRoomModal() {
  addRoomOpen.value = true
}

function goToRooms() {
  router.push('/rooms')
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 22px;
  font-family: 'Inter', sans-serif;
}

.dashboard--initial-empty {
  min-height: calc(100vh - 128px);
}

/* ── Hero ── */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
  padding: 24px 28px;
  background: linear-gradient(135deg, var(--sh-primary-light) 0%, #F5F3FF 60%, #ffffff 100%);
  border: 1px solid rgba(99, 102, 241, .15);
  border-radius: 18px;
}
.hero__main { min-width: 0; flex: 1; }
.hero__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.2;
  letter-spacing: -0.01em;
}
.hero__message {
  margin: 6px 0 0;
  font-size: 15px;
  color: var(--sh-text-muted);
  line-height: 1.4;
}
.hero__stats {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}
.hero-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px 10px 12px;
  background: #ffffff;
  border: 1px solid rgba(99, 102, 241, .12);
  border-radius: 14px;
  box-shadow: 0 4px 12px -6px rgba(15, 23, 42, .12);
}
.hero-stat__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--sh-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 8px -2px rgba(99, 102, 241, .35);
}
.hero-stat__icon :deep(.v-icon) { color: #ffffff !important; }
.hero-stat__text { display: flex; flex-direction: column; min-width: 0; }
.hero-stat__value {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.hero-stat__label {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--sh-text-muted);
  line-height: 1.2;
  white-space: nowrap;
}

.dashboard-loader {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 24px;
  background: #ffffff;
  border: 1px solid var(--sh-border);
  border-radius: 18px;
  box-shadow: 0 10px 24px -18px rgba(15, 23, 42, .22);
}
.dashboard-loader__text {
  margin: 0;
  font-size: 14px;
  color: var(--sh-text-muted);
}

.initial-empty-stage {
  flex: 1;
  width: 100%;
  min-height: clamp(440px, calc(100vh - 280px), 680px);
  display: flex;
  align-items: center;
}

.initial-empty {
  box-sizing: border-box;
  width: 100%;
  min-height: clamp(420px, 48vh, 500px);
  padding: clamp(42px, 5vh, 56px) clamp(48px, 4vw, 64px);
  background: #ffffff;
  border: 1px solid var(--sh-border);
  border-radius: 18px;
  box-shadow: 0 14px 32px -24px rgba(15, 23, 42, .28);
  overflow: hidden;
}
.initial-empty__content {
  display: grid;
  grid-template-columns: minmax(360px, 1fr) minmax(360px, .9fr);
  align-items: center;
  gap: clamp(48px, 5vw, 80px);
  min-height: clamp(330px, 38vh, 390px);
}
.initial-empty__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
}
.initial-empty__title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.15;
}
.initial-empty__text {
  max-width: 520px;
  margin: 14px 0 0;
  font-size: 16px;
  color: var(--sh-text-muted);
  line-height: 1.6;
}
.initial-empty__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 190px;
  height: 46px;
  margin-top: 20px;
  padding: 0 24px;
  border: none;
  border-radius: 10px;
  background: var(--sh-primary);
  color: #ffffff;
  box-shadow: 0 10px 20px -10px rgba(99, 102, 241, .75);
  font-family: var(--sh-font);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 150ms, transform 150ms, box-shadow 150ms;
}
.initial-empty__cta:hover {
  background: var(--sh-primary-dark);
  box-shadow: 0 12px 24px -12px rgba(79, 70, 229, .8);
  transform: translateY(-1px);
}
.initial-empty__cta:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 3px;
}
.initial-empty__note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  margin: 16px 0 0;
  color: var(--sh-text-muted);
  font-size: 14px;
  line-height: 1.5;
}
.initial-empty__note :deep(.v-icon) {
  margin-top: 2px;
  color: var(--sh-text-light);
}
.initial-empty__visual {
  min-height: clamp(330px, 38vh, 390px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 28px;
  border: 1px solid rgba(99, 102, 241, .12);
  border-radius: 16px;
  background: linear-gradient(135deg, var(--sh-primary-light) 0%, #ffffff 72%);
}
.home-illustration {
  display: block;
  width: min(100%, 500px);
  height: auto;
  color: var(--sh-primary);
}
.home-illustration__glow {
  fill: rgba(99, 102, 241, .08);
}
.home-illustration__stroke {
  fill: none;
  stroke: currentColor;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.home-illustration__soft {
  opacity: .34;
}
.home-illustration__fill {
  fill: rgba(238, 242, 255, .72);
}

/* ── Block (sección) ── */
.block { display: flex; flex-direction: column; gap: 14px; }

.block__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.block__heading { flex: 1; min-width: 0; }
.block__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--sh-text-main);
}
.block__subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--sh-text-muted);
}

.btn-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  min-width: 190px;
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

/* ── Estado A: onboarding (sin items) ── */
.onboard {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--sh-primary-light) 0%, #F5F3FF 100%);
  border: 1px solid rgba(99, 102, 241, .18);
}
.onboard__icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--sh-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 16px -6px rgba(99, 102, 241, .45);
}
.onboard__icon :deep(.v-icon) { color: #fff !important; }
.onboard__body { flex: 1; min-width: 0; }
.onboard__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--sh-text-main);
}
.onboard__sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--sh-text-muted);
  line-height: 1.45;
}
.onboard__cta {
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  border: none;
  background: var(--sh-primary);
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 4px 8px -2px rgba(99, 102, 241, .3);
  transition: background-color 150ms;
}
.onboard__cta:hover { background: var(--sh-primary-dark); }
.onboard__cta:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.routine-empty {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(220px, .42fr);
  align-items: center;
  gap: 24px;
  min-height: 148px;
  padding: 24px 28px;
  border-radius: 16px;
  border: 1px solid rgba(99, 102, 241, .18);
  background: linear-gradient(90deg, var(--sh-primary-light) 0%, #F5F3FF 34%, #ffffff 100%);
  box-shadow: 0 10px 24px -22px rgba(15, 23, 42, .22);
}
.routine-empty--loading {
  grid-template-columns: auto 1fr;
  min-height: 96px;
}
.routine-empty__icon {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: rgba(99, 102, 241, .1);
  color: var(--sh-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.routine-empty__icon :deep(.v-icon) {
  color: var(--sh-primary) !important;
}
.routine-empty__body {
  min-width: 0;
}
.routine-empty__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--sh-text-main);
}
.routine-empty__text {
  margin: 6px 0 0;
  max-width: 620px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--sh-text-muted);
}
.routine-empty__example,
.routine-empty__hint,
.routine-empty__loading-text {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--sh-text-muted);
}
.routine-empty__example {
  color: #64748b;
  font-weight: 600;
}
.routine-empty__hint {
  margin-top: 4px;
}
.routine-empty__visual {
  justify-self: end;
  width: min(100%, 300px);
  display: flex;
  justify-content: flex-end;
}
.routine-illustration {
  display: block;
  width: 100%;
  max-width: 300px;
  height: auto;
  color: var(--sh-primary);
}
.routine-illustration__guide,
.routine-illustration__clock,
.routine-illustration__bolt,
.routine-illustration__bulb,
.routine-illustration__bulb-base,
.routine-illustration__soft {
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.routine-illustration__guide {
  opacity: .24;
}
.routine-illustration__node {
  fill: #ffffff;
  stroke: currentColor;
  stroke-width: 3;
  opacity: .64;
}
.routine-illustration__node--trigger {
  fill: rgba(99, 102, 241, .12);
  opacity: 1;
}
.routine-illustration__bolt {
  fill: rgba(99, 102, 241, .1);
}
.routine-illustration__soft {
  opacity: .22;
}

/* ── Estado B: hint-empty (sin favoritos) ── */
.hint-empty {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px dashed var(--sh-border);
  border-radius: 12px;
  background: #F8FAFC;
}
.hint-empty__icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #FEF3C7;
  color: #D97706;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hint-empty__text {
  margin: 0;
  font-size: 13px;
  color: var(--sh-text-muted);
  line-height: 1.45;
}
.hint-empty__star { color: #F59E0B; vertical-align: -2px; }
.hint-empty__link {
  color: var(--sh-primary);
  font-weight: 600;
  text-decoration: none;
}
.hint-empty__link:hover { text-decoration: underline; }

/* ── Grids ── */
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.routines-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

@media (max-width: 1280px) {
  .rooms-grid    { grid-template-columns: repeat(3, 1fr); }
  .routines-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .rooms-grid    { grid-template-columns: repeat(2, 1fr); }
  .routines-grid { grid-template-columns: repeat(2, 1fr); }
  .routine-empty { grid-template-columns: auto minmax(0, 1fr); }
  .routine-empty__visual { display: none; }
  .initial-empty { padding: 28px; }
  .initial-empty__content { grid-template-columns: 1fr; }
  .initial-empty__visual { min-height: 210px; }
}
@media (max-width: 720px) {
  .rooms-grid    { grid-template-columns: 1fr; }
  .routines-grid { grid-template-columns: 1fr; }
  .block__header { flex-direction: column; align-items: stretch; }
  .onboard       { flex-direction: column; align-items: flex-start; }
  .onboard__cta  { width: 100%; }
  .hero          { padding: 20px; }
  .hero__stats   { width: 100%; }
  .hero-stat     { flex: 1; }
  .initial-empty { padding: 26px 22px; }
  .initial-empty__title { font-size: 26px; }
  .initial-empty__text { font-size: 15px; }
  .initial-empty__cta { width: 100%; }
  .initial-empty__note { margin-top: 24px; }
  .initial-empty__visual { display: none; }
}
</style>
