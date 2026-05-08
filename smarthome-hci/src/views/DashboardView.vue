<template>
  <div class="dashboard">

    <!-- ── Hero ── -->
    <section class="hero" aria-label="Saludo">
      <div class="hero__main">
        <h1 class="hero__title">¡Hola, {{ auth.displayName }}!</h1>
        <p class="hero__message">Bienvenido a tu casa inteligente.</p>
      </div>
      <div class="hero__stats" aria-label="Resumen del hogar">
        <div class="hero-stat">
          <span class="hero-stat__icon" aria-hidden="true">
            <v-icon icon="mdi-flash" size="20" />
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

      <!-- Cargando -->
      <div v-if="roomsStore.loading" class="onboard" style="justify-content: center;">
        <v-progress-circular indeterminate color="var(--sh-primary)" size="40" />
      </div>

      <!-- Estado A: usuario sin habitaciones -->
      <div v-else-if="rooms.length === 0" class="onboard">
        <div class="onboard__icon" aria-hidden="true">
          <v-icon icon="mdi-home-plus-outline" size="32" />
        </div>
        <div class="onboard__body">
          <p class="onboard__title">Empezá creando tu primera habitación</p>
          <p class="onboard__sub">
            Después podrás sumarle dispositivos. Todo desde el botón
            <strong>+ Agregar habitación</strong>.
          </p>
        </div>
        <button type="button" class="onboard__cta" @click="addDeviceOpen = true">
          Crear habitación
        </button>
      </div>

      <!-- Estado B: hay habitaciones pero ninguna favorita -->
      <div v-else-if="favoriteRooms.length === 0" class="hint-empty">
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
          :style="{ '--card-delay': `${idx * 30}ms` }"
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

      <!-- Estado A: usuario sin rutinas -->
      <div v-if="routines.length === 0" class="onboard">
        <div class="onboard__icon" aria-hidden="true">
          <v-icon icon="mdi-flash-outline" size="32" />
        </div>
        <div class="onboard__body">
          <p class="onboard__title">Tu primera rutina automatiza el resto</p>
          <p class="onboard__sub">
            Encendé luces al amanecer, bloqueá la puerta al salir, lo que quieras.
          </p>
        </div>
        <button type="button" class="onboard__cta" @click="createRoutineOpen = true">
          Crear rutina
        </button>
      </div>

      <!-- Estado B: rutinas sin favoritas -->
      <div v-else-if="favoriteRoutines.length === 0" class="hint-empty">
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

    <!-- ── Modales ── -->
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRoomsStore } from '@/stores/rooms'
import { useRoutinesStore } from '@/stores/routines'
import { useDevicesStore } from '@/stores/devices'
import RoomCard from '@/components/rooms/RoomCard.vue'
import RoutineCard from '@/components/routines/RoutineCard.vue'
import AddDeviceModal from '@/components/dashboard/AddDeviceModal.vue'
import CreateRoutineModal from '@/components/routines/CreateRoutineModal.vue'
import EditRoutineModal from '@/components/routines/EditRoutineModal.vue'

const auth          = useAuthStore()
const roomsStore    = useRoomsStore()
const routinesStore = useRoutinesStore()
const devicesStore  = useDevicesStore()
const router        = useRouter()

// ── Reactive views ──
const rooms            = computed(() => roomsStore.rooms)
const routines         = computed(() => routinesStore.routines)
const favoriteRooms    = computed(() => roomsStore.favoriteRooms)
const favoriteRoutines = computed(() => routinesStore.favoriteRoutines)

// ── Stats ──
const totalActiveDevices = computed(() => devicesStore.activeDevices.length)
const totalRooms = computed(() => rooms.value.length)

// ── Modals ──
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
  rooms.value.map(r => ({
    id:       Number(r.id),
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
  targetRoomId: number | null
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

function onEditRoutineOpenChange(val: boolean) {
  editRoutineOpen.value = val
  if (!val) editingRoutineId.value = null
}

function goToRooms() {
  router.push('/rooms')
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 28px;
  font-family: 'Inter', sans-serif;
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
}
</style>
