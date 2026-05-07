<template>
  <div class="routines-view">

    <!-- Page header -->
    <div class="routines-view__header">
      <div class="routines-view__heading">
        <h1 class="routines-view__title">Rutinas Automatizadas</h1>
        <p class="routines-view__subtitle">Crea y gestiona rutinas para automatizar tu hogar</p>
      </div>
      <button
        type="button"
        class="btn-create"
        aria-label="Crear nueva rutina"
        @click="isCreateOpen = true"
      >
        <v-icon icon="mdi-plus" size="18" aria-hidden="true" />
        Crear rutina
      </button>
    </div>

    <!-- Category filters -->
    <div class="routines-view__filters" role="group" aria-label="Filtrar por categoría">
      <p class="routines-view__filter-label">Filtrar por categoría</p>
      <div class="routines-view__chips">
        <button
          v-for="cat in CATEGORIES"
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
          @execute="handleExecute"
          @edit="handleEdit"
          @toggle-favorite="store.toggleFavorite($event)"
        />
      </div>
    </div>

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

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import RoutineCard from '@/components/routines/RoutineCard.vue'
import EditRoutineModal from '@/components/routines/EditRoutineModal.vue'
import CreateRoutineModal from '@/components/routines/CreateRoutineModal.vue'
import { useRoutinesStore } from '@/stores/routines'

const store = useRoutinesStore()
const { routines } = storeToRefs(store)

// ── Filter logic ──
const CATEGORIES = ['Todas', 'Mañana', 'Noche', 'Confort', 'Seguridad', 'Personalizada']

const selectedCategory = ref('Todas')

const filteredRoutines = computed(() => {
  if (selectedCategory.value === 'Todas') return routines.value
  return routines.value.filter(r => r.category === selectedCategory.value)
})

const categoryCounts = computed(() => ({
  Todas:        routines.value.length,
  Mañana:       routines.value.filter(r => r.category === 'Mañana').length,
  Noche:        routines.value.filter(r => r.category === 'Noche').length,
  Confort:      routines.value.filter(r => r.category === 'Confort').length,
  Seguridad:    routines.value.filter(r => r.category === 'Seguridad').length,
  Personalizada: routines.value.filter(r => r.category === 'Personalizada').length,
}))

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

function handleExecute(id) {
  store.executeRoutine(id)
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
