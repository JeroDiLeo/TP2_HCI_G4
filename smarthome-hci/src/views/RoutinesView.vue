<template>
  <div class="routines-view">

    <!-- Page header -->
    <div class="routines-view__header">
      <div class="routines-view__heading">
        <h1 class="routines-view__title">Rutinas Automatizadas</h1>
        <p class="routines-view__subtitle">Crea y gestiona rutinas para automatizar tu hogar</p>
      </div>
      <div class="routines-view__actions">
        <!-- Botón Editar / Finalizar -->
        <button
          type="button"
          :class="editMode ? 'btn-edit-active' : 'btn-edit'"
          :aria-pressed="editMode"
          :aria-label="editMode ? 'Finalizar modo edición' : 'Activar modo edición de rutinas'"
          @click="toggleEditMode"
        >
          <v-icon icon="mdi-pencil-outline" size="18" aria-hidden="true" />
          <span v-if="editMode">Finalizar rutinas</span>
        </button>

        <button
          type="button"
          class="btn-create"
          :class="{ 'btn-create--secondary': editMode }"
          :disabled="editMode"
          aria-label="Crear nueva rutina"
          @click="isCreateOpen = true"
        >
          <v-icon icon="mdi-plus" size="18" aria-hidden="true" />
          Crear rutina
        </button>
      </div>
    </div>

    <!-- Category filters -->
    <div class="routines-view__filters" role="group" aria-label="Filtrar por categoría">
      <p class="routines-view__filter-label">Filtrar por categoría</p>
      <div class="routines-view__chips">
        <button
          v-for="cat in visibleCategories"
          :key="cat"
          type="button"
          class="filter-chip"
          :class="{ 'filter-chip--active': selectedCategory === cat }"
          :aria-pressed="selectedCategory === cat"
          @click="selectedCategory = cat"
        >
          {{ cat }}
          <span class="filter-chip__count">{{ categoryCounts[cat] }}</span>
        </button>
      </div>
    </div>

    <!-- Routines grid -->
    <div class="routines-view__grid" role="list" aria-label="Lista de rutinas">
      <div
        v-for="routine in filteredRoutines"
        :key="routine.id"
        role="listitem"
      >
        <RoutineCard
          :routine="routine"
          :edit-mode="editMode"
          @edit="handleEdit"
          @toggle-favorite="store.toggleFavorite($event)"
          @open-edit="handleEdit($event.id)"
          @open-delete="openDeleteModal"
        />
      </div>
    </div>

    <!-- Snackbar de errores -->
    <v-snackbar v-model="showError" color="error" timeout="4000" location="bottom">
      {{ errorMessage }}
    </v-snackbar>

    <!-- Edit routine modal -->
    <EditRoutineModal
      :routine-id="editingRoutineId"
      :open="isEditOpen"
      @update:open="onEditOpenChange"
    />

    <!-- Create routine modal -->
    <CreateRoutineModal
      :open="isCreateOpen"
      @update:open="isCreateOpen = $event"
      @created="handleCreated"
    />

    <!-- Modal: confirmar eliminación -->
    <v-dialog v-model="deleteModalOpen" width="400">
      <div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-routine-title">
        <div class="confirm-modal__icon" aria-hidden="true">
          <v-icon icon="mdi-trash-can-outline" size="28" />
        </div>
        <h2 id="delete-routine-title" class="confirm-modal__title">¿Eliminar rutina?</h2>
        <p class="confirm-modal__body">
          Esta acción no se puede deshacer.
          <strong>{{ deletingRoutine?.name }}</strong> será eliminada permanentemente.
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
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import RoutineCard from '@/components/routines/RoutineCard.vue'
import EditRoutineModal from '@/components/routines/EditRoutineModal.vue'
import CreateRoutineModal from '@/components/routines/CreateRoutineModal.vue'
import { useRoutinesStore } from '@/stores/routines'

const store = useRoutinesStore()
const { filteredRoutines: storeFilteredRoutines } = storeToRefs(store)


// ── Filter logic ──
const CATEGORIES = ['Todas', 'Mañana', 'Noche', 'Confort', 'Seguridad', 'Personalizada']

const selectedCategory = ref('Todas')

const filteredRoutines = computed(() => {
  if (selectedCategory.value === 'Todas') return storeFilteredRoutines.value
  return storeFilteredRoutines.value.filter(r => r.category === selectedCategory.value)
})

const categoryCounts = computed(() => ({
  Todas:         storeFilteredRoutines.value.length,
  Mañana:        storeFilteredRoutines.value.filter(r => r.category === 'Mañana').length,
  Noche:         storeFilteredRoutines.value.filter(r => r.category === 'Noche').length,
  Confort:       storeFilteredRoutines.value.filter(r => r.category === 'Confort').length,
  Seguridad:     storeFilteredRoutines.value.filter(r => r.category === 'Seguridad').length,
  Personalizada: storeFilteredRoutines.value.filter(r => r.category === 'Personalizada').length,
}))

const visibleCategories = computed(() =>
  CATEGORIES.filter(cat => cat === 'Todas' || categoryCounts.value[cat] > 0)
)

watch(visibleCategories, (categories) => {
  if (store.loading) return

  if (!categories.includes(selectedCategory.value)) selectedCategory.value = 'Todas'
}, { immediate: true })

// ── Edit modal ──
const editingRoutineId = ref(null)
const isEditOpen       = ref(false)

function handleEdit(id) {
  editingRoutineId.value = id
  isEditOpen.value = true
}

function onEditOpenChange(val) {
  isEditOpen.value = val
  if (!val) editingRoutineId.value = null
}

// ── Create modal ──
const isCreateOpen = ref(false)

function handleCreated(_id) {
  // El modal de creación ahora incluye el paso de acciones; no abrimos edición automáticamente.
}

// ── Edit mode ──
const editMode    = ref(false)
const showError   = ref(false)
const errorMessage = ref('')

function toggleEditMode() {
  editMode.value = !editMode.value
}

// ── Delete modal ──
const deleteModalOpen  = ref(false)
const deletingRoutine  = ref(null)
const deleting         = ref(false)

function openDeleteModal(routine) {
  deletingRoutine.value = routine
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!deletingRoutine.value) return
  deleting.value = true
  try {
    await store.removeRoutine(String(deletingRoutine.value.id))
    deleteModalOpen.value = false
  } catch (err) {
    errorMessage.value = err.message || 'No se pudo eliminar la rutina'
    showError.value = true
    deleteModalOpen.value = false
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.routines-view {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Header ── */
.routines-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.routines-view__heading { flex: 1; }

.routines-view__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--sh-text-main);
  font-family: 'Inter', sans-serif;
  line-height: 1.2;
}

.routines-view__subtitle {
  margin: 6px 0 0;
  font-size: 15px;
  color: var(--sh-text-muted);
  font-family: 'Inter', sans-serif;
}

/* ── Header actions ── */
.routines-view__actions {
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
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 150ms, border-color 150ms, color 150ms;
}
.btn-edit:hover { background: var(--sh-primary-light); border-color: var(--sh-primary); color: var(--sh-primary); }
.btn-edit:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

/* Botón Finalizar rutinas (morado filled) */
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
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 8px -2px rgba(99, 102, 241, .3);
  transition: background-color 150ms;
}
.btn-edit-active:hover { background: var(--sh-primary-dark, #4f46e5); }
.btn-edit-active:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

/* ── Create button ── */
.btn-create {
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
.btn-create:hover { background: var(--sh-primary-dark); }
.btn-create:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
.btn-create--secondary {
  background: transparent;
  color: var(--sh-primary);
  border: 1.5px solid var(--sh-primary);
  box-shadow: none;
}
.btn-create--secondary:hover { background: var(--sh-primary-light); }
.btn-create:disabled { opacity: .45; cursor: not-allowed; }

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
  font-family: 'Inter', sans-serif;
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
.confirm-modal__title { margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; }
.confirm-modal__body { margin: 0; font-size: 14px; color: #64748b; line-height: 1.5; }
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
  font-family: 'Inter', sans-serif;
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

/* ── Filters ── */
.routines-view__filters {
  margin-bottom: 28px;
}

.routines-view__filter-label {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  font-family: 'Inter', sans-serif;
}

.routines-view__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ── Filter chip ── */
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
.filter-chip:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
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

/* ── Routines grid ── */
.routines-view__grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: 1fr;
  gap: 16px;
}

.routines-view__grid > [role="listitem"] {
  display: flex;
}

.routines-view__grid > [role="listitem"] > * {
  width: 100%;
}

@media (min-width: 720px) {
  .routines-view__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1100px) {
  .routines-view__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
