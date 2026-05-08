<template>
  <div class="rooms-view">
    <!-- Page header -->
    <div class="rooms-view__header">
      <div class="rooms-view__heading">
        <h1 class="rooms-view__title">Gestión de Habitaciones</h1>
        <p class="rooms-view__subtitle">Administra y organiza las habitaciones de tu hogar</p>
      </div>
      <div class="rooms-view__actions">
        <ViewModeToggle v-model="viewMode" />
        <button type="button" class="btn-primary" @click="isAddModalOpen = true">
          <v-icon icon="mdi-plus" size="18" aria-hidden="true" />
          Agregar Habitación
        </button>
      </div>
    </div>

    <!-- Stats row -->
    <div class="rooms-view__stats" aria-label="Estadísticas del hogar">
      <RoomStatsCard
        icon="mdi-door"
        :value="roomsStore.totalRooms"
        label="Habitaciones"
        style="--card-delay: 0ms"
      />
      <RoomStatsCard
        icon="mdi-flash"
        :value="roomsStore.activeDevices"
        label="Dispositivos activos"
        style="--card-delay: 50ms"
      />
    </div>

    <!-- Rooms grid -->
    <RoomsGrid
      :view-mode="viewMode"
      class="rooms-view__grid"
      @view-details="handleViewDetails"
      @add-room="isAddModalOpen = true"
    />

    <!-- Modal -->
    <AddRoomModal v-model:open="isAddModalOpen" />
  </div>
</template>

<script setup>
import { ref, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomsStore } from '@/stores/rooms'
import RoomStatsCard  from '@/components/rooms/RoomStatsCard.vue'
import ViewModeToggle from '@/components/rooms/ViewModeToggle.vue'
import RoomsGrid     from '@/components/rooms/RoomsGrid.vue'
import AddRoomModal  from '@/components/rooms/AddRoomModal.vue'

const roomsStore     = useRoomsStore()
const router         = useRouter()
const viewMode       = ref('grid')
const isAddModalOpen = ref(false)

// Sync layout search → store so filteredRooms computed stays working
const layoutSearch = inject('layoutSearchQuery', ref(''))
watch(layoutSearch, (q) => { roomsStore.searchQuery = q }, { immediate: true })

function handleViewDetails(roomId) {
  router.push({ name: 'room-detail', params: { roomId } })
}
</script>

<style scoped>
.rooms-view {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.rooms-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.rooms-view__heading { flex: 1; }

.rooms-view__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--sh-text-main);
  font-family: 'Inter', sans-serif;
  line-height: 1.2;
}

.rooms-view__subtitle {
  margin: 6px 0 0;
  font-size: 15px;
  color: var(--sh-text-muted);
  font-family: 'Inter', sans-serif;
}

.rooms-view__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.btn-primary {
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
  transition: background-color 150ms cubic-bezier(.4,0,.2,1);
}
.btn-primary:hover { background: var(--sh-primary-dark); }
.btn-primary:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.rooms-view__stats {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.rooms-view__grid {
  flex: 1;
}

</style>
