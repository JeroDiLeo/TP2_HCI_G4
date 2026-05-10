<template>
  <div class="room-detail">

    <!-- Not found -->
    <div v-if="!room" class="room-detail__not-found" role="status">
      <v-icon icon="mdi-door-closed-lock" size="64" class="room-detail__not-found-icon" aria-hidden="true" />
      <p class="room-detail__not-found-title">Habitación no encontrada</p>
      <button type="button" class="btn-back-primary" @click="goBack">
        Volver a Habitaciones
      </button>
    </div>

    <template v-else>

      <!-- Header -->
      <div class="room-detail__header">
        <button type="button" class="btn-back" @click="goBack" aria-label="Volver a Habitaciones">
          <v-icon icon="mdi-arrow-left" size="16" aria-hidden="true" />
          Habitaciones
        </button>
        <div class="room-detail__heading-row">
          <div class="room-detail__heading">
            <div class="room-detail__title-row">
              <div class="room-detail__icon-tile" aria-hidden="true">
                <v-icon :icon="roomIcon" size="20" />
              </div>
              <h1 class="room-detail__title">{{ room.name }}</h1>
            </div>
            <p class="room-detail__subtitle">Gestioná los dispositivos de esta habitación</p>
          </div>

          <div class="room-detail__header-actions">

            <!-- Botón Editar / Finalizar -->
            <button
              type="button"
              :class="editMode ? 'btn-add-device' : 'btn-edit-mode'"
              :aria-label="editMode ? 'Finalizar modo edición' : 'Activar modo edición de dispositivos'"
              :aria-pressed="editMode"
              @click="toggleEditMode"
            >
              <v-icon icon="mdi-pencil-outline" size="18" aria-hidden="true" />
              <span v-if="editMode">Finalizar dispositivos</span>
            </button>

            <!-- Botón Agregar -->
            <button
              type="button"
              :class="editMode ? 'btn-add-device btn-add-device--secondary' : 'btn-add-device'"
              aria-label="Agregar dispositivos a esta habitación"
              title="Agregar dispositivos"
              @click="addDeviceOpen = true"
            >
              <v-icon icon="mdi-plus" size="18" aria-hidden="true" />
              Agregar dispositivo
            </button>
          </div>
        </div>
      </div>

      <!-- Snackbar de errores -->
      <v-snackbar v-model="showError" color="error" timeout="4000" location="bottom">
        {{ errorMessage }}
      </v-snackbar>

      <!-- Devices grid -->
      <template v-if="filteredDevices.length > 0">
        <div
          class="room-detail__grid"
          :class="{ 'room-detail__grid--pagination': viewMode === 'pagination' }"
          :style="{ gridTemplateColumns: gridCols }"
          role="list"
          aria-label="Dispositivos de la habitación"
        >
          <div
            v-for="device in visibleDevices"
            :key="device.id"
            class="room-detail__device-shell"
            :class="{ 'room-detail__device-shell--focused': highlightedDeviceId === String(device.id) }"
            :data-focus-device-id="String(device.id)"
            role="listitem"
          >
            <DeviceControlCard
              :device="device"
              :edit-mode="editMode"
              @edit="openEditModal"
              @delete="openDeleteModal"
            />
          </div>
        </div>

        <!-- Pagination controls (pagination mode only) -->
        <div
          v-if="!editMode && viewMode === 'pagination' && totalPages > 1"
          class="room-detail__pagination"
          role="navigation"
          aria-label="Paginación de dispositivos"
        >
          <button
            type="button"
            class="pagination-btn"
            :disabled="currentPage === 1"
            aria-label="Página anterior"
            @click="currentPage--"
          >
            <v-icon icon="mdi-chevron-left" size="18" aria-hidden="true" />
            Anterior
          </button>
          <span class="pagination-info" aria-live="polite">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          <button
            type="button"
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            aria-label="Página siguiente"
            @click="currentPage++"
          >
            Siguiente
            <v-icon icon="mdi-chevron-right" size="18" aria-hidden="true" />
          </button>
        </div>
      </template>

      <!-- Loading -->
      <div v-else-if="devicesStore.loading" class="room-detail__empty" role="status">
        <v-progress-circular indeterminate color="var(--sh-primary)" size="40" />
        <p class="room-detail__empty-title">Cargando dispositivos…</p>
      </div>

      <!-- Empty: no devices in room -->
      <div v-else-if="allDevices.length === 0" class="room-detail__empty" role="status">
        <v-icon icon="mdi-devices" size="52" class="room-detail__empty-icon" aria-hidden="true" />
        <p class="room-detail__empty-title">Sin dispositivos</p>
        <p class="room-detail__empty-sub">Esta habitación todavía no tiene dispositivos vinculados.</p>
      </div>

      <!-- Empty: search returned nothing -->
      <div v-else class="room-detail__empty" role="status">
        <v-icon icon="mdi-magnify-remove-outline" size="52" class="room-detail__empty-icon" aria-hidden="true" />
        <p class="room-detail__empty-title">Sin resultados</p>
        <p class="room-detail__empty-sub">
          Ningún dispositivo coincide con "{{ searchQuery }}".
        </p>
        <button type="button" class="room-detail__clear-btn" @click="clearSearch">
          Limpiar búsqueda
        </button>
      </div>

      <!-- Modal: agregar dispositivos -->
      <AddRoomDeviceModal
        v-model:open="addDeviceOpen"
        :room-id="roomId"
        :room-name="room.name"
        :room-icon="roomIcon"
        @added="devicesStore.fetchAll(true)"
      />

      <!-- Modal: editar dispositivo -->
      <EditDeviceModal
        v-model:open="editModalOpen"
        :device="editingDevice"
      />

      <!-- Modal: confirmar eliminación -->
      <v-dialog v-model="deleteModalOpen" width="400">
        <div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-device-title">
          <div class="confirm-modal__icon" aria-hidden="true">
            <v-icon icon="mdi-trash-can-outline" size="28" />
          </div>
          <h2 id="delete-device-title" class="confirm-modal__title">¿Eliminar dispositivo?</h2>
          <p class="confirm-modal__body">
            Esta acción no se puede deshacer.
            <strong>{{ deletingDevice?.name }}</strong> se eliminará de la habitación.
          </p>
          <div class="confirm-modal__actions">
            <button type="button" class="btn btn--ghost" @click="deleteModalOpen = false">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn--danger"
              :disabled="deleting"
              @click="confirmDelete"
            >
              {{ deleting ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </v-dialog>

    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Ref } from 'vue'
import { useRoomsStore } from '@/stores/rooms'
import { useDevicesStore } from '@/stores/devices'
import { usePreferencesStore } from '@/stores/preferences'
import type { RoomDevice } from '@/types/rooms'
import DeviceControlCard from '@/components/rooms/DeviceControlCard.vue'
import AddRoomDeviceModal from '@/components/rooms/AddRoomDeviceModal.vue'
import EditDeviceModal from '@/components/rooms/EditDeviceModal.vue'

const router = useRouter()
const route  = useRoute()
const store       = useRoomsStore()
const devicesStore = useDevicesStore()
const prefs        = usePreferencesStore()

const roomId = computed(() => String(route.params.roomId))
const room   = computed(() => store.getRoomById(roomId.value))
const focusedDeviceId = computed(() => {
  const raw = route.query.deviceId
  if (Array.isArray(raw)) return raw[0] ? String(raw[0]) : ''
  return raw ? String(raw) : ''
})

const ROOM_ICONS: Record<string, string> = {
  living:   'mdi-sofa-outline',
  bedroom:  'mdi-bed-king-outline',
  kitchen:  'mdi-silverware-fork-knife',
  bathroom: 'mdi-shower',
  office:   'mdi-briefcase-outline',
}
const roomIcon = computed(() => ROOM_ICONS[room.value?.type ?? ''] ?? 'mdi-door')

const addDeviceOpen = ref(false)

// ── Edit mode ────────────────────────────────────────────────────────
const editMode     = ref(false)
const showError    = ref(false)
const errorMessage = ref('')

// Edit modal
const editModalOpen  = ref(false)
const editingDevice  = ref<RoomDevice | null>(null)
const highlightedDeviceId = ref<string | null>(null)
let highlightTimer: number | null = null

// Delete modal
const deleteModalOpen  = ref(false)
const deletingDevice   = ref<RoomDevice | null>(null)
const deleting         = ref(false)

function openEditModal(device: RoomDevice) {
  editingDevice.value = device
  editModalOpen.value = true
}

function openDeleteModal(device: RoomDevice) {
  deletingDevice.value = device
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!deletingDevice.value) return
  deleting.value = true
  try {
    await devicesStore.removeDevice(String(deletingDevice.value.id))
    deleteModalOpen.value = false
  } catch (err: any) {
    errorMessage.value = err.message || 'No se pudo eliminar el dispositivo'
    showError.value = true
    deleteModalOpen.value = false
  } finally {
    deleting.value = false
  }
}

function toggleEditMode() {
  editMode.value = !editMode.value
}

const allDevices = computed(() => {
  const list = devicesStore.devicesByRoom(roomId.value)
  return [...list].sort((a, b) => {
    const ao = a.metadata?.order ?? Infinity
    const bo = b.metadata?.order ?? Infinity
    return (ao as number) - (bo as number)
  })
})
// Search injected from AppLayout
const layoutSearch = inject<Ref<string>>('layoutSearchQuery', ref(''))
const searchQuery  = computed(() => layoutSearch.value)

const filteredDevices = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allDevices.value
  return allDevices.value.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.type.toLowerCase().includes(q) ||
    (d.active ? 'activo' : 'inactivo').includes(q)
  )
})

// ── View mode & pagination (from global preferences store) ───────────
const viewMode = computed(() => prefs.viewMode)
const pageSize = computed(() => prefs.pageSize)
const currentPage = ref(1)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredDevices.value.length / pageSize.value))
)

const visibleDevices = computed(() => {
  if (viewMode.value === 'scroll') return filteredDevices.value
  const start = (currentPage.value - 1) * pageSize.value
  return filteredDevices.value.slice(start, start + pageSize.value)
})

// Grid columns based on mode and page size
const gridCols = computed(() => {
  if (viewMode.value === 'scroll') return 'repeat(3, 1fr)'
  const ps = pageSize.value
  if (ps <= 2) return 'repeat(2, 1fr)'
  if (ps === 3) return 'repeat(3, 1fr)'
  if (ps === 4) return 'repeat(2, 1fr)'
  return 'repeat(3, 1fr)' // 5 or 6
})

// Reset to page 1 when search or mode changes
watch(searchQuery, () => { currentPage.value = 1 })
watch(viewMode,    () => { currentPage.value = 1 })

// Clamp page if results shrink below current page
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

watch(
  [focusedDeviceId, allDevices, filteredDevices, viewMode, pageSize],
  () => {
    revealFocusedDevice()
  },
  { immediate: true, flush: 'post' },
)

async function revealFocusedDevice() {
  const id = focusedDeviceId.value
  if (!id) return

  const existsInRoom = allDevices.value.some(device => String(device.id) === id)
  if (!existsInRoom) return

  const existsInCurrentFilter = filteredDevices.value.some(device => String(device.id) === id)
  if (!existsInCurrentFilter) {
    layoutSearch.value = ''
    await nextTick()
  }

  const visibleIndex = filteredDevices.value.findIndex(device => String(device.id) === id)
  if (visibleIndex === -1) return

  if (viewMode.value === 'pagination') {
    currentPage.value = Math.floor(visibleIndex / pageSize.value) + 1
  }

  await nextTick()

  const target = findDeviceElement(id)
  if (!target) return

  highlightedDeviceId.value = id
  if (highlightTimer !== null) window.clearTimeout(highlightTimer)
  highlightTimer = window.setTimeout(() => {
    if (highlightedDeviceId.value === id) highlightedDeviceId.value = null
    highlightTimer = null
  }, 2200)

  target.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function findDeviceElement(id: string): HTMLElement | null {
  const candidates = document.querySelectorAll<HTMLElement>('[data-focus-device-id]')
  return Array.from(candidates).find(el => el.dataset.focusDeviceId === id) ?? null
}

function clearSearch() {
  layoutSearch.value = ''
}

function goBack() {
  router.push({ name: 'rooms' })
}
</script>

<style scoped>
.room-detail {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: var(--sh-font);
}

/* ── Not found ── */
.room-detail__not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 24px;
  text-align: center;
}
.room-detail__not-found-icon { color: var(--sh-text-light); }
.room-detail__not-found-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--sh-text-main);
  margin: 0;
}

/* ── Back button ── */
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px 6px 8px;
  background: transparent;
  border: 1px solid var(--sh-border);
  border-radius: 8px;
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  cursor: pointer;
  transition: background-color 150ms, color 150ms, border-color 150ms;
  align-self: flex-start;
  white-space: nowrap;
}
.btn-back:hover {
  background-color: var(--sh-primary-light);
  color: var(--sh-primary);
  border-color: var(--sh-primary);
}
.btn-back:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.btn-back-primary {
  height: 40px;
  padding: 0 24px;
  background: var(--sh-primary);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: var(--sh-font);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms;
}
.btn-back-primary:hover { background: var(--sh-primary-dark); }

/* ── Header ── */
.room-detail__header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

/* Row: title+subtitle left, stats right */
.room-detail__heading-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.room-detail__heading { display: flex; flex-direction: column; gap: 6px; }

.room-detail__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-detail__icon-tile {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--sh-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.room-detail__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.2;
}

.btn-add-device {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  background: var(--sh-primary);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 8px -2px rgba(99, 102, 241, .3);
  transition: background-color 150ms;
}
.btn-add-device:hover { background: var(--sh-primary-dark, #4f46e5); }
.btn-add-device:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.btn-add-device--secondary {
  background: transparent;
  color: var(--sh-primary);
  border: 1.5px solid var(--sh-primary);
  box-shadow: none;
}
.btn-add-device--secondary:hover { background: var(--sh-primary-light); }

.btn-edit-mode {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  background: transparent;
  color: var(--sh-text-main);
  border: 1.5px solid var(--sh-border);
  border-radius: 10px;
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 150ms, border-color 150ms, color 150ms;
}
.btn-edit-mode:hover { background: var(--sh-primary-light); border-color: var(--sh-primary); color: var(--sh-primary); }
.btn-edit-mode:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }


.room-detail__subtitle {
  margin: 0;
  font-size: 15px;
  color: var(--sh-text-muted);
}

/* ── Confirm delete modal ── */
.confirm-modal {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  font-family: var(--sh-font);
}
.confirm-modal__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.confirm-modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.confirm-modal__body {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}
.confirm-modal__actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  width: 100%;
  justify-content: center;
}
.btn {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-family: var(--sh-font);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 150ms;
}
.btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn--ghost { background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0; }
.btn--ghost:hover:not(:disabled) { background: #e2e8f0; }
.btn--danger { background: #ef4444; color: #ffffff; }
.btn--danger:hover:not(:disabled) { background: #dc2626; }

.room-detail__header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  align-self: flex-start;
  flex-wrap: wrap;
}

/* ── Compact inline stats ── */
.room-detail__stats-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: var(--sh-font);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  background: #f1f5f9;
  color: var(--sh-text-muted);
  border: 1px solid var(--sh-border);
}
.stat-badge--active {
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  border-color: var(--sh-primary);
}
.stat-badge--inactive {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

/* ── View controls ── */
.room-detail__controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

/* Segmented toggle: Scroll / Paginación */
.room-detail__mode-toggle {
  display: flex;
  border: 1px solid var(--sh-border);
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 14px;
  background: #ffffff;
  border: none;
  border-right: 1px solid var(--sh-border);
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 120ms, color 120ms;
}
.mode-btn:last-child { border-right: none; }
.mode-btn--active {
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  font-weight: 700;
}
.mode-btn:hover:not(.mode-btn--active) { background: #f1f5f9; }
.mode-btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: -2px; }

/* Page size selector */
.room-detail__page-size-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.room-detail__page-size-label {
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  white-space: nowrap;
}

.room-detail__page-size-chips {
  display: flex;
  gap: 4px;
}

.page-size-chip {
  width: 28px;
  height: 28px;
  border: 1px solid var(--sh-border);
  border-radius: 6px;
  background: #ffffff;
  font-family: var(--sh-font);
  font-size: 12px;
  font-weight: 500;
  color: var(--sh-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 120ms, background-color 120ms, color 120ms;
}
.page-size-chip--active {
  background: var(--sh-primary-light);
  border-color: var(--sh-primary);
  color: var(--sh-primary);
  font-weight: 700;
}
.page-size-chip:hover:not(.page-size-chip--active) { border-color: var(--sh-text-muted); }
.page-size-chip:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

/* ── Devices grid ── */
.room-detail__grid {
  display: grid;
  gap: 16px;
}

.room-detail__device-shell {
  min-width: 0;
  border-radius: 14px;
}

.room-detail__device-shell--focused {
  animation: focus-device-ring 2200ms cubic-bezier(.16, 1, .3, 1);
}

.room-detail__device-shell--focused :deep(.dcc) {
  border-color: rgba(99, 102, 241, .68);
}

/* ── Pagination ── */
.room-detail__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 36px;
  padding: 0 16px;
  background: #ffffff;
  border: 1px solid var(--sh-border);
  border-radius: 8px;
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  cursor: pointer;
  transition: background-color 150ms, border-color 150ms, color 150ms;
  white-space: nowrap;
}
.pagination-btn:hover:not(:disabled) {
  background-color: var(--sh-primary-light);
  border-color: var(--sh-primary);
  color: var(--sh-primary);
}
.pagination-btn:disabled { opacity: .4; cursor: not-allowed; }
.pagination-btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.pagination-info {
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  white-space: nowrap;
}

/* ── Empty states ── */
.room-detail__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 64px 24px;
  text-align: center;
}
.room-detail__empty-icon { color: var(--sh-text-light); }
.room-detail__empty-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--sh-text-main);
}
.room-detail__empty-sub {
  margin: 0;
  font-size: 14px;
  color: var(--sh-text-muted);
  max-width: 320px;
}
.room-detail__clear-btn {
  margin-top: 4px;
  height: 38px;
  padding: 0 20px;
  background: transparent;
  border: 1px solid var(--sh-border);
  border-radius: 8px;
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  cursor: pointer;
  transition: background-color 150ms, border-color 150ms, color 150ms;
}
.room-detail__clear-btn:hover {
  background-color: var(--sh-primary-light);
  border-color: var(--sh-primary);
  color: var(--sh-primary);
}
.room-detail__clear-btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

@keyframes focus-device-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, .34);
  }
  24% {
    box-shadow: 0 0 0 5px rgba(99, 102, 241, .18), 0 12px 24px -18px rgba(15, 23, 42, .35);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}

/* ── Consistent card height in pagination mode ── */
/* min-height covers the tallest device card (Horno ~426px) with buffer.   */
/* Grid align-items:stretch (default) equalises cards within each page;    */
/* min-height makes height consistent across pages for the same pageSize.  */
/* Only applied when viewMode === 'pagination'; Scroll mode is untouched.  */
.room-detail__grid--pagination :deep(.dcc) {
  min-height: 450px;
}

/* ── Responsive ── */
@media (max-width: 1100px) {
  .room-detail__grid { grid-template-columns: repeat(2, 1fr) !important; }
}
@media (max-width: 700px) {
  .room-detail__grid { grid-template-columns: 1fr !important; }
  .room-detail__heading-row { flex-direction: column; gap: 10px; }
  .room-detail__header-actions { justify-content: flex-start; }
  .room-detail__controls { gap: 10px; }
  /* Mobile: reduce min-height to avoid excessive empty space in single-column layout */
  .room-detail__grid--pagination :deep(.dcc) {
    min-height: 360px;
  }
}
</style>
