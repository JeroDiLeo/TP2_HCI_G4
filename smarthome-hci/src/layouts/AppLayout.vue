<template>
  <div class="app-layout">
    <AppSidebar />
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

const route = useRoute()
const homesStore = useHomesStore()
const roomsStore = useRoomsStore()
const deviceTypesStore = useDeviceTypesStore()
const devicesStore = useDevicesStore()

onMounted(async () => {
  deviceTypesStore.fetchAll()

  // Cargar homes si no están cargados
  if (homesStore.homes.length === 0) {
    await homesStore.fetchHomes()
  }

  // Si no hay home seleccionado, auto-seleccionar el primero
  if (!homesStore.selectedHomeId && homesStore.homes.length > 0) {
    homesStore.selectHome(homesStore.homes[0].id)
  }

  // Cargar rooms y devices del home activo
  const homeId = homesStore.selectedHomeId
  if (homeId) {
    roomsStore.fetchRoomsByHome(homeId)
    devicesStore.fetchAll()
  }
})

const searchQuery = ref('')

const PLACEHOLDERS = {
  'dashboard': 'Buscar dispositivos...',
  'rooms': 'Buscar habitaciones...',
  'room-detail': 'Buscar dispositivos...',
  'devices': 'Buscar dispositivos...',
  'stats': 'Buscar estadísticas...',
  'profile': 'Buscar en perfil...',
  'settings': 'Buscar configuración...',
  'historical': 'Buscar dispositivos, acciones, rutinas...',
}

const searchPlaceholder = computed(() =>
  PLACEHOLDERS[route.name] ?? 'Buscar...'
)

// Reset search when navigating between views
watch(() => route.name, () => { searchQuery.value = '' })

// Provide search to child views so they can sync to their store
provide('layoutSearchQuery', searchQuery)
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', sans-serif;
}

.app-layout__content {
  margin-left: 72px;
  margin-top: 64px;
  padding: 32px 40px;
  min-height: calc(100vh - 64px);
}
</style>
