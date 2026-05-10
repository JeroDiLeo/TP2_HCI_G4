<template>
  <div class="rooms-view">
    <!-- Page header -->
    <div class="rooms-view__header">
      <div class="rooms-view__heading">
        <h1 class="rooms-view__title">Gestión de Habitaciones</h1>
        <p class="rooms-view__subtitle">Administra y organiza las habitaciones de tu hogar</p>
      </div>
      <div class="rooms-view__actions">
        <!-- Botón Editar / Finalizar -->
        <button
          type="button"
          :class="editMode ? 'btn-edit-active' : 'btn-edit'"
          :aria-pressed="editMode"
          :aria-label="editMode ? 'Finalizar modo edición' : 'Activar modo edición de habitaciones'"
          @click="toggleEditMode"
        >
          <v-icon icon="mdi-pencil-outline" size="18" aria-hidden="true" />
          <span v-if="editMode">Finalizar cambios</span>
        </button>

        <button type="button" :class="editMode ? 'btn-primary btn-primary--secondary' : 'btn-primary'" :disabled="editMode" @click="isAddModalOpen = true">
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
          v-for="cat in visibleCategories"
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
      :edit-mode="editMode"
      class="rooms-view__grid"
      @view-details="handleViewDetails"
      @add-room="isAddModalOpen = true"
      @edit="openEditModal"
      @delete="openDeleteModal"
    />

    <!-- Snackbar de errores -->
    <v-snackbar v-model="showError" color="error" timeout="4000" location="bottom">
      {{ errorMessage }}
    </v-snackbar>

    <!-- Modal: crear habitación -->
    <AddRoomModal v-model:open="isAddModalOpen" />

    <!-- Modal: editar habitación -->
    <EditRoomModal v-model:open="editModalOpen" :room="editingRoom" />

    <!-- Modal: confirmar eliminación -->
    <v-dialog v-model="deleteModalOpen" width="400">
      <div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-room-title">
        <div class="confirm-modal__icon" aria-hidden="true">
          <v-icon icon="mdi-trash-can-outline" size="28" />
        </div>
        <h2 id="delete-room-title" class="confirm-modal__title">¿Eliminar habitación?</h2>
        <p class="confirm-modal__body">
          Esta acción no se puede deshacer.
          <strong>{{ deletingRoom?.name }}</strong> y todos sus dispositivos serán eliminados.
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
  </div>
</template>

<script setup>
import { ref, inject, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomsStore } from '@/stores/rooms'
import RoomsGrid     from '@/components/rooms/RoomsGrid.vue'
import AddRoomModal  from '@/components/rooms/AddRoomModal.vue'
import EditRoomModal from '@/components/rooms/EditRoomModal.vue'

const roomsStore     = useRoomsStore()
const router         = useRouter()
const isAddModalOpen = ref(false)

// ── Edit mode ──────────────────────────────────────────────────────────
const editMode       = ref(false)
const showError      = ref(false)
const errorMessage   = ref('')

const editModalOpen  = ref(false)
const editingRoom    = ref(null)

const deleteModalOpen = ref(false)
const deletingRoom    = ref(null)
const deleting        = ref(false)

function toggleEditMode() {
  editMode.value = !editMode.value
}

function openEditModal(room) {
  editingRoom.value = room
  editModalOpen.value = true
}

function openDeleteModal(room) {
  deletingRoom.value = room
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!deletingRoom.value) return
  deleting.value = true
  try {
    await roomsStore.removeRoom(String(deletingRoom.value.id))
    deleteModalOpen.value = false
  } catch (err) {
    errorMessage.value = err.message || 'No se pudo eliminar la habitación'
    showError.value = true
    deleteModalOpen.value = false
  } finally {
    deleting.value = false
  }
}

// ── Categories ─────────────────────────────────────────────────────────
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

const visibleCategories = computed(() =>
  CATEGORIES.filter(cat => cat.id === 'todas' || categoryCounts.value[cat.id] > 0)
)

watch(visibleCategories, (categories) => {
  if (roomsStore.loading || !roomsStore.roomsLoaded) return
  const hasActiveCategory = categories.some(cat => cat.id === roomsStore.categoryFilter)
  if (!hasActiveCategory) roomsStore.categoryFilter = 'todas'
}, { immediate: true })

// Sync layout search → store
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
  font-family: var(--sh-font);
  line-height: 1.2;
}

.rooms-view__subtitle {
  margin: 6px 0 0;
  font-size: 15px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
}

.rooms-view__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Botón editar (solo lápiz cuando está apagado) */
.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
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
.btn-edit:hover { background: var(--sh-primary-light); border-color: var(--sh-primary); color: var(--sh-primary); }
.btn-edit:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

/* Botón Finalizar cambios (morado filled) */
.btn-edit-active {
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
.btn-edit-active:hover { background: var(--sh-primary-dark, #4f46e5); }
.btn-edit-active:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

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
  font-family: var(--sh-font);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 150ms cubic-bezier(.4,0,.2,1);
}
.btn-primary:hover { background: var(--sh-primary-dark); }
.btn-primary:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.btn-primary--secondary {
  background: transparent;
  color: var(--sh-primary);
  border: 1.5px solid var(--sh-primary);
  box-shadow: none;
}
.btn-primary--secondary:hover { background: var(--sh-primary-light); }
.btn-primary:disabled { opacity: .45; cursor: not-allowed; }

/* ── Filters ── */
.rooms-view__filters { margin-bottom: 24px; }
.rooms-view__filter-label {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
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
  font-family: var(--sh-font);
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

.rooms-view__grid { flex: 1; }

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
</style>
