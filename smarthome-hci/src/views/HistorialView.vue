<template>
  <div class="historial-view">

    <!-- Header -->
    <div class="historial-header">
      <div>
        <h1 class="historial-header__title">Historial</h1>
        <p class="historial-header__subtitle">Acciones realizadas con tus dispositivos</p>
      </div>
      <button
        class="refresh-btn"
        :disabled="logsStore.loading"
        aria-label="Refrescar historial"
        @click="reloadLogsForCurrentContext()"
      >
        <i class="mdi mdi-refresh" :class="{ 'refresh-btn--spinning': logsStore.loading }"></i>
      </button>
    </div>

    <!-- Device filter -->
    <HistorialFilters
      :devices="homeDevices"
      :selected-device-id="logsStore.selectedDeviceId"
      @update-device="onDeviceFilter"
    />

    <!-- Base data loading (rooms / devices) -->
    <div v-if="isBaseLoading" class="log-skeleton-list" aria-label="Cargando historial">
      <div v-for="n in 4" :key="n" class="log-skeleton-item" aria-hidden="true" />
    </div>

    <!-- Base data error -->
    <div v-else-if="baseError" class="historial-state">
      <i class="mdi mdi-alert-circle-outline historial-state__icon historial-state__icon--error"></i>
      <p class="historial-state__title">Error al cargar los datos del hogar</p>
      <p class="historial-state__subtitle">{{ baseError }}</p>
    </div>

    <!-- Home has no devices -->
    <div v-else-if="homeHasNoDevices" class="historial-state">
      <i class="mdi mdi-devices historial-state__icon"></i>
      <p class="historial-state__title">Este hogar no tiene dispositivos aún</p>
      <p class="historial-state__subtitle">Agregá dispositivos desde la sección de habitaciones</p>
    </div>

    <template v-else>
      <!-- Logs first-page loading -->
      <div
        v-if="logsStore.loading && logsStore.filteredLogs.length === 0"
        class="log-skeleton-list"
        aria-label="Cargando logs"
      >
        <div v-for="n in 4" :key="n" class="log-skeleton-item" aria-hidden="true" />
      </div>

      <!-- Logs error -->
      <div
        v-else-if="logsStore.error && logsStore.filteredLogs.length === 0"
        class="historial-state"
      >
        <i class="mdi mdi-wifi-off historial-state__icon historial-state__icon--error"></i>
        <p class="historial-state__title">No se pudo cargar el historial</p>
        <p class="historial-state__subtitle">{{ logsStore.error }}</p>
        <button class="state-btn" @click="reloadLogsForCurrentContext()">Reintentar</button>
      </div>

      <!-- Searching: logs fetched but none match active home yet, more available -->
      <div
        v-else-if="logsStore.filteredLogs.length === 0 && logsStore.hasMore && !logsStore.loading"
        class="historial-state"
      >
        <i class="mdi mdi-magnify historial-state__icon"></i>
        <p class="historial-state__title">Buscando actividad de este hogar</p>
        <p class="historial-state__subtitle">
          Estamos filtrando los logs visibles para encontrar actividad de este hogar
        </p>
        <button
          class="state-btn"
          @click="logsStore.fetchUntilFull(logsStore.filteredLogs.length + prefsStore.pageSize)"
        >
          Cargar más
        </button>
      </div>

      <!-- Empty: no logs, no active filter -->
      <div
        v-else-if="logsStore.filteredLogs.length === 0 && !logsStore.hasMore && !logsStore.selectedDeviceId"
        class="historial-state"
      >
        <i class="mdi mdi-history historial-state__icon"></i>
        <p class="historial-state__title">Todavía no hay actividad en este hogar</p>
        <p class="historial-state__subtitle">
          Las acciones que ejecutes en tus dispositivos van a aparecer acá
        </p>
      </div>

      <!-- Empty: filter active but no results -->
      <div
        v-else-if="logsStore.filteredLogs.length === 0 && !logsStore.hasMore && logsStore.selectedDeviceId"
        class="historial-state"
      >
        <i class="mdi mdi-filter-off-outline historial-state__icon"></i>
        <p class="historial-state__title">No hay actividad para este dispositivo</p>
        <button class="state-btn" @click="onDeviceFilter(null)">Limpiar filtro</button>
      </div>

      <!-- Log list -->
      <div
        v-else
        class="historial-logs"
        aria-live="polite"
        aria-label="Historial de acciones"
      >
        <HistorialEventItem
          v-for="entry in currentLogs"
          :key="entry.id"
          :entry="entry"
          :catalog-description="catalogDescriptionFor(entry)"
        />
      </div>

      <!-- Pagination controls -->
      <div
        v-if="prefsStore.viewMode === 'pagination' && logsStore.filteredLogs.length > 0"
        class="historial-pagination"
      >
        <button
          class="pagination-btn"
          :disabled="!hasPrev"
          aria-label="Página anterior"
          @click="goPrev"
        >
          <i class="mdi mdi-chevron-left"></i> Anterior
        </button>
        <span class="pagination-info">Mostrando {{ showingFrom }}–{{ showingTo }}</span>
        <button
          class="pagination-btn"
          :disabled="!hasNext || logsStore.loading"
          aria-label="Página siguiente"
          @click="goNext"
        >
          Siguiente <i class="mdi mdi-chevron-right"></i>
        </button>
      </div>

      <!-- Scroll: loading more indicator -->
      <div
        v-if="prefsStore.viewMode === 'scroll' && logsStore.loading && logsStore.filteredLogs.length > 0"
        class="historial-loading-more"
      >
        <span class="loading-spinner" aria-label="Cargando más logs"></span>
      </div>

      <!-- Scroll: sentinel for IntersectionObserver -->
      <div
        v-if="prefsStore.viewMode === 'scroll'"
        ref="sentinel"
        class="scroll-sentinel"
        aria-hidden="true"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import HistorialFilters from '@/components/historial/HistorialFilters.vue'
import HistorialEventItem from '@/components/historial/HistorialEventItem.vue'
import { useLogsStore } from '@/stores/logs'
import { usePreferencesStore } from '@/stores/preferences'
import { useDevicesStore } from '@/stores/devices'
import { useRoomsStore } from '@/stores/rooms'
import { useHomesStore } from '@/stores/homes'
import { useDeviceTypesStore } from '@/stores/deviceTypes'
import type { LogEntry } from '@/types/logs'
import type { RoomDevice } from '@/types/rooms'

const logsStore        = useLogsStore()
const prefsStore       = usePreferencesStore()
const devicesStore     = useDevicesStore()
const roomsStore       = useRoomsStore()
const homesStore       = useHomesStore()
const deviceTypesStore = useDeviceTypesStore()

// ── Base data state ──────────────────────────────────────────────────
const isBaseLoading = computed(() => devicesStore.loading || roomsStore.loading)
const baseError     = computed(() => devicesStore.error || roomsStore.error)

const homeDevices = computed(() => {
  if (isBaseLoading.value) return []
  const activeRoomIds = new Set(roomsStore.rooms.map((r: { id: string | number }) => String(r.id)))
  return devicesStore.devices
    .filter((d: RoomDevice) => activeRoomIds.has(String(d.roomId)))
    .map((d: RoomDevice) => ({ id: String(d.id), name: d.name }))
})

const homeHasNoDevices = computed(() =>
  !isBaseLoading.value &&
  !baseError.value &&
  homeDevices.value.length === 0
)

// ── Catalog description helper ───────────────────────────────────────
function catalogDescriptionFor(entry: LogEntry): string | undefined {
  return deviceTypesStore.getAction(entry.deviceTypeApiId, entry.actionName)?.description
}

// ── Reload ───────────────────────────────────────────────────────────
async function reloadLogsForCurrentContext({ reset = true }: { reset?: boolean } = {}) {
  if (reset) logsStore.reset()
  if (roomsStore.loading || devicesStore.loading) return
  await logsStore.fetchUntilFull(prefsStore.pageSize)
}

// ── Device filter ────────────────────────────────────────────────────
function onDeviceFilter(deviceId: string | null) {
  logsStore.setDeviceFilter(deviceId)
  reloadLogsForCurrentContext({ reset: false })
}

// ── Pagination (viewMode === 'pagination') ───────────────────────────
const pageStart   = computed(() => (logsStore.currentPage - 1) * prefsStore.pageSize)
const currentLogs = computed(() =>
  prefsStore.viewMode === 'pagination'
    ? logsStore.filteredLogs.slice(pageStart.value, pageStart.value + prefsStore.pageSize)
    : logsStore.filteredLogs
)
const hasPrev    = computed(() => logsStore.currentPage > 1)
const hasNext    = computed(() =>
  logsStore.currentPage * prefsStore.pageSize < logsStore.filteredLogs.length ||
  logsStore.hasMore
)
const showingFrom = computed(() =>
  Math.min(pageStart.value + 1, logsStore.filteredLogs.length)
)
const showingTo = computed(() =>
  Math.min(pageStart.value + prefsStore.pageSize, logsStore.filteredLogs.length)
)

async function goNext() {
  const nextPage = logsStore.currentPage + 1
  await logsStore.fetchUntilFull(nextPage * prefsStore.pageSize)
  if ((nextPage - 1) * prefsStore.pageSize < logsStore.filteredLogs.length) {
    logsStore.currentPage = nextPage
  }
}

function goPrev() {
  if (logsStore.currentPage > 1) logsStore.currentPage--
}

// ── Scroll infinite (viewMode === 'scroll') ──────────────────────────
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function setupObserver() {
  observer?.disconnect()
  if (!sentinel.value) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !logsStore.loading && logsStore.hasMore) {
        logsStore.fetchUntilFull(logsStore.filteredLogs.length + prefsStore.pageSize)
      }
    },
    { threshold: 0.1 }
  )
  observer.observe(sentinel.value)
}

watch(
  () => prefsStore.viewMode,
  (mode) => {
    if (mode === 'scroll') nextTick(setupObserver)
    else { observer?.disconnect(); observer = null }
  },
  { immediate: true }
)

watch(sentinel, () => {
  if (prefsStore.viewMode === 'scroll') nextTick(setupObserver)
})

// ── Watchers ─────────────────────────────────────────────────────────
watch(() => homesStore.selectedHomeId, () => {
  logsStore.setDeviceFilter(null)
  reloadLogsForCurrentContext()
})

watch(
  () => devicesStore.loading || roomsStore.loading,
  (stillLoading) => {
    if (!stillLoading && !logsStore.loading && logsStore.hasMore) {
      reloadLogsForCurrentContext({ reset: false })
    }
  }
)

watch(() => prefsStore.pageSize, () => {
  logsStore.currentPage = 1
  if (prefsStore.viewMode === 'pagination') {
    reloadLogsForCurrentContext()
  }
})

// ── Lifecycle ─────────────────────────────────────────────────────────
onMounted(() => { reloadLogsForCurrentContext() })
onUnmounted(() => { observer?.disconnect() })
</script>

<style scoped>
.historial-view { padding: 0; }

.historial-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
  padding: 0 24px;
}

.historial-header__title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--sh-text-main);
  font-family: var(--sh-font);
}

.historial-header__subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--sh-border);
  border-radius: 10px;
  background: white;
  color: var(--sh-text-muted);
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
  flex-shrink: 0;
}

.refresh-btn:hover:not(:disabled) { background: #f8fafc; color: var(--sh-primary); }
.refresh-btn:disabled { opacity: 0.5; cursor: default; }

@keyframes spin { to { transform: rotate(360deg); } }
.refresh-btn--spinning { animation: spin 0.8s linear infinite; display: inline-block; }

.historial-logs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 24px;
}

.log-skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 24px;
}

.log-skeleton-item {
  height: 68px;
  border-radius: 10px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.historial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 24px;
  text-align: center;
}

.historial-state__icon { font-size: 48px; color: var(--sh-text-muted); }
.historial-state__icon--error { color: #EF4444; }

.historial-state__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--sh-text-main);
  font-family: var(--sh-font);
}

.historial-state__subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
}

.state-btn {
  margin-top: 4px;
  padding: 8px 20px;
  border: 1.5px solid var(--sh-primary);
  border-radius: 8px;
  background: white;
  color: var(--sh-primary);
  font-family: var(--sh-font);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
}

.state-btn:hover { background: var(--sh-primary-light); }

.historial-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: 1px solid var(--sh-border);
  border-radius: 8px;
  background: white;
  color: var(--sh-text-main);
  font-family: var(--sh-font);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: var(--sh-primary);
  color: var(--sh-primary);
}

.pagination-btn:disabled { opacity: 0.4; cursor: default; }

.pagination-info {
  font-size: 13px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
}

.historial-loading-more {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid var(--sh-border);
  border-top-color: var(--sh-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.scroll-sentinel { height: 1px; margin: 0 24px; }

@media (max-width: 768px) {
  .historial-header {
    flex-direction: column;
    padding: 0 16px;
    margin-bottom: 24px;
  }

  .historial-logs,
  .log-skeleton-list { padding: 0 16px; }
}
</style>
