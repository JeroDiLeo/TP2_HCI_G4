<template>
  <article class="routine-card">
    <!-- Play button (absolute, top-right) -->
    <button
      type="button"
      class="routine-card__play"
      :aria-label="`Ejecutar rutina ${routine.name}`"
      @click="$emit('execute', routine.id)"
    >
      <v-icon icon="mdi-play" size="20" aria-hidden="true" />
    </button>

    <!-- Header: icon + title + badge -->
    <div class="routine-card__header">
      <div class="routine-card__icon-wrap" aria-hidden="true">
        <v-icon :icon="routine.icon" size="24" color="white" />
      </div>
      <div class="routine-card__title-group">
        <h3 class="routine-card__name">{{ routine.name }}</h3>
        <span class="routine-card__badge" :class="`routine-card__badge--${categoryKey}`">
          {{ routine.category }}
        </span>
      </div>
    </div>

    <!-- Description -->
    <p class="routine-card__desc">{{ routine.description }}</p>

    <!-- Trigger pill -->
    <div class="routine-card__trigger">
      <template v-if="routine.trigger.type === 'schedule'">
        <v-icon icon="mdi-clock-outline" size="14" aria-hidden="true" />
        <span>{{ formattedTime }}</span>
      </template>
      <template v-else>
        <v-icon icon="mdi-hand-pointing-right" size="14" aria-hidden="true" />
        <span>Activación manual</span>
      </template>
    </div>

    <!-- Actions list (flex:1 so it stretches) -->
    <ul class="routine-card__actions" :aria-label="`Acciones de ${routine.name}`">
      <li
        v-for="(action, i) in visibleActions"
        :key="i"
        class="routine-card__action"
      >
        <span class="routine-card__dot" aria-hidden="true" />
        {{ action }}
      </li>
      <li v-if="hiddenCount > 0" class="routine-card__more">
        +{{ hiddenCount }} acción{{ hiddenCount > 1 ? 'es' : '' }} más
      </li>
    </ul>

    <!-- Days footer (always at bottom) -->
    <div class="routine-card__days" aria-label="Días de activación">
      <template v-if="routine.days.length > 0">
        <span
          v-for="day in ALL_DAYS"
          :key="day.key"
          class="routine-card__day"
          :class="{ 'routine-card__day--active': routine.days.includes(day.key) }"
        >
          {{ day.label }}
        </span>
      </template>
      <span v-else class="routine-card__day-manual">Sin días programados</span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  routine: {
    type: Object,
    required: true,
  },
})

defineEmits(['execute'])

const ALL_DAYS = [
  { key: 'lun', label: 'Lun' },
  { key: 'mar', label: 'Mar' },
  { key: 'mie', label: 'Mié' },
  { key: 'jue', label: 'Jue' },
  { key: 'vie', label: 'Vie' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' },
]

const CATEGORY_KEYS = {
  'Mañana':      'morning',
  'Noche':       'night',
  'Confort':     'comfort',
  'Seguridad':   'security',
  'Personalizada': 'custom',
}

const categoryKey = computed(() => CATEGORY_KEYS[props.routine.category] ?? 'custom')

const visibleActions = computed(() => props.routine.actions.slice(0, 3))
const hiddenCount    = computed(() => Math.max(0, props.routine.actions.length - 3))

const formattedTime = computed(() => {
  if (props.routine.trigger.type !== 'schedule') return ''
  const [h, m] = props.routine.trigger.time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour   = h % 12 || 12
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`
})
</script>

<style scoped>
/* ── Card shell ──────────────────────────────────────── */
.routine-card {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--sh-border);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 360px;
  transition: box-shadow 200ms;
}
.routine-card:hover {
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.10);
}

/* ── Play button ─────────────────────────────────────── */
.routine-card__play {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--sh-primary);
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
  transition: background-color 150ms, transform 150ms, box-shadow 150ms;
  flex-shrink: 0;
}
.routine-card__play:hover {
  background: var(--sh-primary-dark);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.45);
}
.routine-card__play:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 3px;
}

/* ── Header row ──────────────────────────────────────── */
.routine-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  /* leave space for the absolute play button */
  padding-right: 52px;
}

.routine-card__icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--sh-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ffffff;
}
.routine-card__icon-wrap :deep(.v-icon) {
  color: #ffffff !important;
}

.routine-card__title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.routine-card__name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--sh-text-main);
  font-family: 'Inter', sans-serif;
  line-height: 1.2;
}

/* ── Category badge ──────────────────────────────────── */
.routine-card__badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  width: fit-content;
}
.routine-card__badge--morning,
.routine-card__badge--night {
  background: var(--sh-primary-light);
  color: var(--sh-primary-dark);
}
.routine-card__badge--comfort {
  background: #FEF9C3;
  color: #854D0E;
}
.routine-card__badge--security {
  background: #FEE2E2;
  color: #991B1B;
}
.routine-card__badge--custom {
  background: #F1F5F9;
  color: var(--sh-text-muted);
}

/* ── Description ─────────────────────────────────────── */
.routine-card__desc {
  margin: 0;
  font-size: 13px;
  color: var(--sh-text-muted);
  font-family: 'Inter', sans-serif;
  line-height: 1.5;
}

/* ── Trigger pill ────────────────────────────────────── */
.routine-card__trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  background: #F8FAFC;
  border: 1px solid var(--sh-border);
  font-size: 12px;
  font-weight: 500;
  color: var(--sh-text-muted);
  font-family: 'Inter', sans-serif;
  width: fit-content;
}

/* ── Actions list (flex:1 stretches to fill middle) ──── */
.routine-card__actions {
  flex: 1 1 auto;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.routine-card__action {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--sh-text-main);
  font-family: 'Inter', sans-serif;
}

.routine-card__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--sh-primary);
  flex-shrink: 0;
}

.routine-card__more {
  font-size: 12px;
  font-style: italic;
  color: var(--sh-text-light);
  font-family: 'Inter', sans-serif;
  padding-left: 14px;
}

/* ── Days footer (always at bottom via margin-top: auto) */
.routine-card__days {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--sh-border);
}

.routine-card__day {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: var(--sh-text-light);
  background: #F8FAFC;
}
.routine-card__day--active {
  background: var(--sh-primary-light);
  color: var(--sh-primary-dark);
}

.routine-card__day-manual {
  font-size: 11px;
  font-style: italic;
  color: var(--sh-text-light);
  font-family: 'Inter', sans-serif;
}
</style>
