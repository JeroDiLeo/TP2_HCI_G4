<template>
  <div
    class="app-layout"
    :class="{ 'app-layout--sidebar-expanded': sidebarExpanded }"
  >
    <AppSidebar
      :expanded="sidebarExpanded"
      @toggle-expanded="toggleSidebar"
    />
    <AppTopbar
      v-model="searchQuery"
      :search-placeholder="searchPlaceholder"
    />
    <main id="main-content" class="app-layout__content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, provide, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar  from '@/components/layout/AppTopbar.vue'
import { useHomesStore } from '@/stores/homes'
import { useRoomsStore } from '@/stores/rooms'
import { useDeviceTypesStore } from '@/stores/deviceTypes'
import { useDevicesStore } from '@/stores/devices'
import { useRoutinesStore } from '@/stores/routines'

const route = useRoute()
const homesStore = useHomesStore()
const roomsStore = useRoomsStore()
const deviceTypesStore = useDeviceTypesStore()
const devicesStore = useDevicesStore()
const routinesStore = useRoutinesStore()
let initializing = true

function dataNeedsForRoute(routeName) {
  switch (routeName) {
    case 'dashboard':
    case 'home-detail':
    case 'devices':
      return { rooms: true, devices: true, routines: true }
    case 'rooms':
    case 'room-detail':
    case 'historial':
      return { rooms: true, devices: true, routines: false }
    case 'rutinas':
      return { rooms: true, devices: true, routines: true }
    default:
      return { rooms: false, devices: false, routines: false }
  }
}

async function loadActiveHomeData(homeId, routeName = route.name) {
  if (!homeId) {
    roomsStore.clearRooms()
    return
  }

  const needs = dataNeedsForRoute(routeName)
  if (needs.rooms) {
    await roomsStore.fetchRoomsByHome(homeId)
    devicesStore.refreshRoomNames()
  }

  await Promise.all([
    needs.devices ? devicesStore.fetchAll() : Promise.resolve(),
    needs.routines ? routinesStore.fetchRoutines() : Promise.resolve(),
  ])

  if (needs.rooms && needs.devices) {
    devicesStore.refreshRoomNames()
  }
}

onMounted(async () => {
  await deviceTypesStore.fetchAll()

  // Cargar homes si no están cargados
  if (homesStore.homes.length === 0) {
    await homesStore.fetchHomesBasic()
  }

  const routeHomeId = typeof route.params.homeId === 'string'
    ? route.params.homeId
    : null

  if (routeHomeId && homesStore.homes.some(home => home.id === routeHomeId)) {
    homesStore.selectHome(routeHomeId)
  }

  // Si no hay home seleccionado, auto-seleccionar el primero
  if (!homesStore.selectedHomeId && homesStore.homes.length > 0) {
    homesStore.selectHome(homesStore.homes[0].id)
  }

  await loadActiveHomeData(homesStore.selectedHomeId)
  initializing = false
})

const searchQuery = ref('')
const SIDEBAR_STATE_KEY = 'smarthome.sidebarExpanded'
const sidebarExpanded = ref(localStorage.getItem(SIDEBAR_STATE_KEY) === 'true')

const PLACEHOLDERS = {
  'dashboard': 'Buscar dispositivos, habitaciones, rutinas...',
  'home-detail': 'Buscar dispositivos, habitaciones, rutinas...',
  'rooms': 'Buscar habitaciones...',
  'room-detail': 'Buscar dispositivos...',
  'devices': 'Buscar dispositivos, habitaciones, rutinas...',
  'rutinas': 'Buscar rutinas...',
  'profile': 'Buscar en perfil...',
  'settings': 'Buscar configuración...',
  'historial': 'Buscar dispositivos, acciones, rutinas...',
}

const searchPlaceholder = computed(() =>
  PLACEHOLDERS[route.name] ?? 'Buscar...'
)

function toggleSidebar() {
  sidebarExpanded.value = !sidebarExpanded.value
  localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarExpanded.value))
}

watch(() => route.name, (routeName) => {
  searchQuery.value = ''
  if (initializing) return
  loadActiveHomeData(homesStore.selectedHomeId, routeName)
})

watch(
  () => homesStore.selectedHomeId,
  (homeId) => {
    if (initializing) return
    loadActiveHomeData(homeId)
  }
)

// Provide search to child views so they can sync to their store
provide('layoutSearchQuery', searchQuery)
</script>

<style scoped>
.app-layout {
  --app-sidebar-width: 72px;
  min-height: 100vh;
  background: #f8fafc;
  font-family: var(--sh-font);
}

.app-layout--sidebar-expanded {
  --app-sidebar-width: 232px;
}

.app-layout__content {
  margin-left: var(--app-sidebar-width);
  margin-top: 64px;
  padding: 32px 40px;
  min-height: calc(100vh - 64px);
  transition: margin-left 180ms cubic-bezier(.4, 0, .2, 1);
}
</style>
