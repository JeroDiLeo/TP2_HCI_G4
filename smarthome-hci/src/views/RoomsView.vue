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
          Crear habitación
        </button>
      </div>
    </div>

    <!-- Category filters -->
    <div class="rooms-view__filters" role="group" aria-label="Filtrar por categoría">
      <p class="rooms-view__filter-label">Filtrar por categoría</p>
      <div class="rooms-view__chips">
        <button
          v-for="cat in CATEGORIES"
          :key="cat.id"
          type="button"
          class="filter-chip"
          :class="{ 'filter-chip--active': roomsStore.categoryFilter === cat.id }"
          :aria-pressed="roomsStore.categoryFilter === cat.id"
          @click="roomsStore.categoryFilter = cat.id"
        >
          {{ cat.label }}
          <span class="filter-chip__count">{{ categoryCounts[cat.id] }}</span>
        </button>
      </div>
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
import { ref, inject, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomsStore } from '@/stores/rooms'
import ViewModeToggle from '@/components/rooms/ViewModeToggle.vue'
import RoomsGrid     from '@/components/rooms/RoomsGrid.vue'
import AddRoomModal  from '@/components/rooms/AddRoomModal.vue'

const roomsStore     = useRoomsStore()
const router         = useRouter()
const viewMode       = ref('grid')
const isAddModalOpen = ref(false)

const CATEGORIES = [
  { id: 'todas',    label: 'Todas'      },
  { id: 'living',   label: 'Sala'       },
  { id: 'bedroom',  label: 'Dormitorio' },
  { id: 'kitchen',  label: 'Cocina'     },
  { id: 'bathroom', label: 'Baño'       },
  { id: 'office',   label: 'Oficina'    },
  { id: 'other',    label: 'Otro'       },
]

const categoryCounts = computed(() => {
  const counts = { todas: roomsStore.rooms.length }
  for (const cat of CATEGORIES) {
    if (cat.id === 'todas') continue
    counts[cat.id] = roomsStore.rooms.filter(r => (r.type ?? 'other') === cat.id).length
  }
  return counts
})

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

/* ── Filters (mismo estilo que /rutinas) ── */
.rooms-view__filters { margin-bottom: 24px; }
.rooms-view__filter-label {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  font-family: 'Inter', sans-serif;
}
.rooms-view__chips {
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

.rooms-view__grid {
  flex: 1;
}

</style>
