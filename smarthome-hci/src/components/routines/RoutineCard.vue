<template>
  <article
    class="routine-card"
    role="button"
    tabindex="0"
    :aria-label="`Editar rutina ${routine.name}`"
    @click="$emit('edit', routine.id)"
    @keydown.enter.prevent="$emit('edit', routine.id)"
    @keydown.space.prevent="$emit('edit', routine.id)"
  >
    <!-- Favorite star (top-right) -->
    <button
      type="button"
      class="routine-card__fav"
      :class="{ 'routine-card__fav--on': routine.favorite }"
      :aria-label="routine.favorite ? 'Quitar de favoritas' : 'Marcar como favorita'"
      :aria-pressed="!!routine.favorite"
      @click.stop="$emit('toggle-favorite', routine.id)"
      @keydown.enter.stop
      @keydown.space.stop
    >
      <v-icon :icon="routine.favorite ? 'mdi-star' : 'mdi-star-outline'" size="16" aria-hidden="true" />
    </button>

    <!-- Play button (absolute, bottom-right) -->
    <button
      type="button"
      class="routine-card__play"
      :aria-label="`Ejecutar rutina ${routine.name}`"
      @click.stop="$emit('execute', routine.id)"
    >
      <v-icon icon="mdi-play" size="22" aria-hidden="true" />
    </button>

    <!-- Header: icon + title + badge -->
    <div class="routine-card__header">
      <div class="routine-card__icon-wrap" aria-hidden="true">
        <v-icon :icon="routine.icon" size="20" color="white" />
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

defineEmits(['execute', 'edit', 'toggle-favorite'])

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

const visibleActions = computed(() => props.routine.actions.slice(0, 2))
const hiddenCount    = computed(() => Math.max(0, props.routine.actions.length - 2))

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
  border-radius: 14px;
  border: 1px solid var(--sh-border);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  text-align: left;
  transition: box-shadow 200ms, border-color 150ms;
}
.routine-card:hover {
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.10);
  border-color: rgba(99, 102, 241, .35);
}
.routine-card:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

/* ── Favorite star ───────────────────────────────────── */
.routine-card__fav {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--sh-text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 150ms, color 150ms, transform 100ms;
  z-index: 3;
}
.routine-card__fav:hover { background: #FEF3C7; color: #D97706; }
.routine-card__fav:active { transform: scale(0.92); }
.routine-card__fav:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.routine-card__fav--on { color: #F59E0B; }
.routine-card__fav--on:hover { color: #D97706; }

/* Reserve room in the header so name doesn't crash with the star */
.routine-card__header { padding-right: 36px; }

/* ── Play button ─────────────────────────────────────── */
.routine-card__play {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--sh-primary);
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  transition: background-color 150ms, transform 150ms, box-shadow 150ms;
  flex-shrink: 0;
  z-index: 2;
}
.routine-card__play:hover {
  background: var(--sh-primary-dark);
  transform: scale(1.06);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
}
.routine-card__play :deep(.v-icon) {
  margin-left: 2px; /* optical centering of play glyph */
}
.routine-card__play:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 3px;
}

/* ── Header row ──────────────────────────────────────── */
.routine-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.routine-card__icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
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
  gap: 2px;
  min-width: 0;
}

.routine-card__name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--sh-text-main);
  font-family: 'Inter', sans-serif;
  line-height: 1.2;
}

/* ── Category badge ──────────────────────────────────── */
.routine-card__badge {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 10px;
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
  font-size: 12px;
  color: var(--sh-text-muted);
  font-family: 'Inter', sans-serif;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Trigger pill ────────────────────────────────────── */
.routine-card__trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  background: #F8FAFC;
  border: 1px solid var(--sh-border);
  font-size: 11px;
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
  gap: 3px;
}

.routine-card__action {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--sh-text-main);
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.routine-card__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--sh-primary);
  flex-shrink: 0;
}

.routine-card__more {
  font-size: 11px;
  font-style: italic;
  color: var(--sh-text-light);
  font-family: 'Inter', sans-serif;
  padding-left: 12px;
}

/* ── Days footer (always at bottom via margin-top: auto) */
.routine-card__days {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: auto;
  padding-top: 8px;
  padding-right: 56px; /* leave room for play button */
  border-top: 1px solid var(--sh-border);
}

.routine-card__day {
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 10px;
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
