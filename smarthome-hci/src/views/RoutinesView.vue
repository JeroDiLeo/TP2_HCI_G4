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
        @click="console.log('Abrir modal de crear rutina')"
      >
        <v-icon icon="mdi-plus" size="18" aria-hidden="true" />
        Crear Rutina
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
        />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import RoutineCard from '@/components/routines/RoutineCard.vue'

// ── Mock data ────────────────────────────────────────────────
const routines = ref([
  {
    id: 'r1',
    name: 'Buenos Días',
    description: 'Despierta con el ambiente perfecto',
    category: 'Mañana',
    icon: 'mdi-white-balance-sunny',
    trigger: { type: 'schedule', time: '07:00' },
    actions: [
      'Luces Sala · Encender (50%)',
      'Climatización · Ajustar temperatura (22°C)',
      'Cortina · Abrir (100%)',
      'Cafetera · Iniciar preparación',
    ],
    days: ['lun', 'mar', 'mie', 'jue', 'vie'],
  },
  {
    id: 'r2',
    name: 'Buenas Noches',
    description: 'Prepara tu casa para dormir',
    category: 'Noche',
    icon: 'mdi-weather-night',
    trigger: { type: 'schedule', time: '22:00' },
    actions: [
      'Todas las luces · Apagar',
      'Climatización · Ajustar temperatura (20°C)',
      'Puerta principal · Bloquear',
      'Alarma · Activar',
    ],
    days: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'],
  },
  {
    id: 'r3',
    name: 'Modo Película',
    description: 'Configura la sala para una buena peli',
    category: 'Confort',
    icon: 'mdi-movie-open',
    trigger: { type: 'manual' },
    actions: [
      'Luces Sala · Atenuar (20%)',
      'TV · Encender',
      'Cortinas · Cerrar',
    ],
    days: [],
  },
  {
    id: 'r4',
    name: 'Modo Ahorro',
    description: 'Reduce el consumo energético',
    category: 'Personalizada',
    icon: 'mdi-leaf',
    trigger: { type: 'schedule', time: '23:00' },
    actions: [
      'Luces · Reducir intensidad (50%)',
      'Climatización · Ajustar temperatura (25°C)',
      'TV · Apagar',
    ],
    days: ['mie', 'jue', 'vie'],
  },
  {
    id: 'r5',
    name: 'Seguridad Nocturna',
    description: 'Activa sensores y cámaras',
    category: 'Seguridad',
    icon: 'mdi-shield-check',
    trigger: { type: 'schedule', time: '23:00' },
    actions: [
      'Cámaras · Activar modo nocturno',
      'Sensores de movimiento · Activar',
      'Luces exteriores · Encender (30%)',
    ],
    days: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'],
  },
  {
    id: 'r6',
    name: 'Hora del Café',
    description: 'Prepara el ambiente para tu café',
    category: 'Confort',
    icon: 'mdi-coffee',
    trigger: { type: 'schedule', time: '15:00' },
    actions: [
      'Cafetera · Iniciar preparación',
      'Luces Cocina · Encender (70%)',
    ],
    days: ['sab', 'dom'],
  },
])

// ── Filter logic ─────────────────────────────────────────────
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

// Placeholder RF12 – se cableará al endpoint de ejecutar rutina
function handleExecute(id) {
  console.log('Ejecutar rutina:', id)
}
</script>

<style scoped>
.routines-view {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Header ─────────────────────────────────────────────── */
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

/* ── Create button ──────────────────────────────────────── */
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

/* ── Filters ────────────────────────────────────────────── */
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

/* ── Filter chip ────────────────────────────────────────── */
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

/* ── Routines grid ──────────────────────────────────────── */
.routines-view__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 1280px) {
  .routines-view__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
