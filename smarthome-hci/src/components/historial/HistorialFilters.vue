<template>
  <div class="historial-filters" ref="filtersContainer" @click.stop>
    <div class="filters-left">
      <!-- Room Filters -->
      <div class="filters-section">
        <span class="filters-label">Filtrar:</span>
        <div class="filter-group">
          <button
            v-for="room in rooms"
            :key="room"
            :class="['filter-chip', { 'filter-chip--active': selectedRoom === room }]"
            @click="$emit('update-room', room)"
          >
            <i v-if="getRoomIcon(room)" :class="['mdi', getRoomIcon(room)]"></i>
            {{ room }}
          </button>
        </div>
      </div>

      <!-- Period Filters -->
      <div class="filters-section">
        <span class="filters-label">Periodo:</span>
        <div class="filter-group">
          <button
            v-for="period in periods"
            :key="period"
            :class="['filter-chip', { 'filter-chip--active': selectedPeriod === period }]"
            @click="$emit('update-period', period)"
          >
            {{ period }}
          </button>
        </div>
      </div>
    </div>

    <!-- Action and Origin Dropdowns -->
    <div class="filters-dropdown-group">
      <!-- Action Dropdown -->
      <div class="filter-dropdown">
        <button class="dropdown-button" @click="toggleActionDropdown">
          {{ selectedAction }}
          <i class="mdi mdi-chevron-down"></i>
        </button>
        <div v-if="showActionDropdown" class="dropdown-menu" @click.stop>
          <button
            v-for="action in actions"
            :key="action"
            :class="['dropdown-item', { 'dropdown-item--selected': selectedAction === action }]"
            @click="handleActionClick($event, action)"
          >
            {{ action }}
            <i v-if="selectedAction === action" class="mdi mdi-check"></i>
          </button>
        </div>
      </div>

      <!-- Origin Dropdown -->
      <div class="filter-dropdown">
        <button class="dropdown-button" @click="toggleOriginDropdown">
          Origen: <strong>{{ selectedOrigin }}</strong>
          <i class="mdi mdi-chevron-down"></i>
        </button>
        <div v-if="showOriginDropdown" class="dropdown-menu" @click.stop>
          <button
            v-for="origin in origins"
            :key="origin"
            :class="['dropdown-item', { 'dropdown-item--selected': selectedOrigin === origin }]"
            @click="handleOriginClick($event, origin)"
          >
            {{ origin }}
            <i v-if="selectedOrigin === origin" class="mdi mdi-check"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  selectedRoom: String,
  selectedPeriod: String,
  selectedAction: String,
  selectedOrigin: String,
})

const emit = defineEmits(['update-room', 'update-period', 'update-action', 'update-origin'])

const showActionDropdown = ref(false)
const showOriginDropdown = ref(false)
const filtersContainer = ref(null)

function closeDropdowns(event) {
  if (filtersContainer.value && !filtersContainer.value.contains(event.target)) {
    showActionDropdown.value = false
    showOriginDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})

const rooms = ['Todas', 'Sala', 'Habitación', 'Cocina', 'Baño', 'Otros']
const periods = ['Hoy', 'Esta semana', 'Este mes', 'Todo']
const actions = [
  'Todas las acciones',
  'Encendido',
  'Apagado',
  'Ajuste',
  'Bloqueo',
  'Desbloqueo',
  'Apertura',
  'Cierre',
]
const origins = ['Todos', 'Manual', 'Rutina', 'Automático']

function getRoomIcon(room) {
  const icons = {
    Todas: 'mdi-home',
    Sala: 'mdi-sofa',
    Habitación: 'mdi-bed',
    Cocina: 'mdi-silverware-fork-knife',
    Baño: 'mdi-shower',
    Otros: 'mdi-folder',
  }
  return icons[room]
}

function toggleActionDropdown(e) {
  e.stopPropagation()
  showActionDropdown.value = !showActionDropdown.value
  showOriginDropdown.value = false
}

function toggleOriginDropdown(e) {
  e.stopPropagation()
  showOriginDropdown.value = !showOriginDropdown.value
  showActionDropdown.value = false
}

function selectAction(action) {
  showActionDropdown.value = false
  emit('update-action', action)
}

function selectOrigin(origin) {
  showOriginDropdown.value = false
  emit('update-origin', origin)
}

function handleActionClick(e, action) {
  e.stopPropagation()
  selectAction(action)
}

function handleOriginClick(e, origin) {
  e.stopPropagation()
  selectOrigin(origin)
}
</script>

<style scoped>
.historial-filters {
  padding: 16px 24px;
  margin: 0 24px 24px 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
  background: white;
  border: 1px solid var(--sh-border);
  border-radius: 12px;
}

.filters-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filters-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filters-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
  white-space: nowrap;
}

.filter-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1.5px solid var(--sh-border);
  border-radius: 999px;
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-main);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover:not(.filter-chip--active) {
  border-color: var(--sh-text-muted);
  background: #f8fafc;
}

.filter-chip--active {
  background: var(--sh-primary-light);
  border-color: var(--sh-primary);
  color: var(--sh-primary);
}

.filter-chip i {
  font-size: 16px;
  color: var(--sh-text-muted);
}

.filters-dropdown-group {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.filter-dropdown {
  position: relative;
  width: 200px;
}

.dropdown-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  height: 40px;
  padding: 0 12px;
  background: white;
  border: 1px solid var(--sh-border);
  border-radius: 10px;
  font-family: var(--sh-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-main);
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-button:hover {
  border-color: var(--sh-text-muted);
  background: #f8fafc;
}

.dropdown-button i {
  font-size: 18px;
  color: #7C3AED;
  margin-left: auto;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 6px;
  background: white;
  border: 1px solid var(--sh-border);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  font-family: var(--sh-font);
  font-size: 14px;
  font-weight: 400;
  color: var(--sh-text-main);
  cursor: pointer;
  transition: background-color 0.15s;
  text-align: left;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.dropdown-item--selected {
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  font-weight: 600;
}

.dropdown-item i {
  font-size: 18px;
  color: #7C3AED;
}

@media (max-width: 768px) {
  .historial-filters {
    padding: 0 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .filters-dropdown-group {
    flex-direction: column;
  }

  .filter-dropdown {
    width: 100%;
  }
}
</style>
