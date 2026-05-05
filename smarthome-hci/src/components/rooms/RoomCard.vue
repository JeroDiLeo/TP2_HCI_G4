<template>
  <article
    class="room-card"
    :class="{
      'room-card--list':   listMode,
      'room-card--active': hasActiveDevices,
    }"
    :aria-label="cardAriaLabel"
    :role="listMode ? undefined : 'button'"
    :tabindex="listMode ? undefined : 0"
    @click="!listMode && emit('view-details', room.id)"
    @keydown.enter.prevent="!listMode && emit('view-details', room.id)"
    @keydown.space.prevent="!listMode && emit('view-details', room.id)"
  >
    <!-- Compact (grid) layout -->
    <template v-if="!listMode">
      <div class="room-card__content">
        <header class="room-card__header">
          <div class="room-card__icon-wrap" aria-hidden="true">
            <v-icon :icon="roomIcon" size="18" aria-hidden="true" />
          </div>
          <h2 class="room-card__name">{{ room.name }}</h2>
        </header>

        <p class="room-card__activity-label">{{ activityLabel }}</p>

        <button
          type="button"
          class="room-card__details-link"
          @click.stop="emit('view-details', room.id)"
        >
          <span>Ver Detalles</span>
          <v-icon icon="mdi-chevron-right" size="14" class="room-card__details-chevron" aria-hidden="true" />
        </button>
      </div>

      <svg
        class="room-card__donut"
        viewBox="0 0 84 84"
        width="64"
        height="64"
        role="img"
        :aria-label="donutAriaLabel"
      >
        <circle
          class="room-card__donut-bg"
          cx="42"
          cy="42"
          r="32"
          fill="none"
          stroke-width="9"
        />
        <circle
          v-if="hasDevices && activeDevices > 0"
          class="room-card__donut-arc"
          cx="42"
          cy="42"
          r="32"
          fill="none"
          stroke-width="9"
          stroke-linecap="round"
          :stroke-dasharray="dashArray"
          transform="rotate(-90 42 42)"
        />
        <text
          class="room-card__donut-value"
          :class="{ 'room-card__donut-value--muted': !hasDevices || activeDevices === 0 }"
          x="42"
          :y="hasDevices ? 40 : 46"
          text-anchor="middle"
          dominant-baseline="middle"
        >{{ activeDevices }}</text>
        <text
          v-if="hasDevices"
          class="room-card__donut-total"
          x="42"
          y="58"
          text-anchor="middle"
        >de {{ totalDevices }}</text>
      </svg>
    </template>

    <!-- List layout (preserved) -->
    <template v-else>
      <div class="room-card__icon-wrap" aria-hidden="true">
        <v-icon :icon="roomIcon" size="18" aria-hidden="true" />
      </div>
      <h2 class="room-card__name">{{ room.name }}</h2>
      <span class="room-card__list-count" aria-hidden="true">
        {{ activeDevices }}/{{ totalDevices }} activos
      </span>
    </template>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  room:     { type: Object,  required: true },
  listMode: { type: Boolean, default: false },
})

const emit = defineEmits(['view-details'])

const ROOM_ICONS = {
  living:   'mdi-sofa-outline',
  bedroom:  'mdi-bed-king-outline',
  kitchen:  'mdi-silverware-fork-knife',
  bathroom: 'mdi-shower',
  office:   'mdi-briefcase-outline',
}

const roomIcon = computed(() => ROOM_ICONS[props.room.type] ?? 'mdi-door')

const CIRCUMFERENCE = 2 * Math.PI * 32

const totalDevices      = computed(() => props.room.devicesTotal  ?? 0)
const activeDevices     = computed(() => props.room.devicesActive ?? 0)
const hasDevices        = computed(() => totalDevices.value > 0)
const hasActiveDevices  = computed(() => activeDevices.value > 0)

const dashArray = computed(() => {
  if (!hasDevices.value || activeDevices.value === 0) return `0 ${CIRCUMFERENCE}`
  const ratio = Math.min(activeDevices.value / totalDevices.value, 1)
  const arc   = CIRCUMFERENCE * ratio
  return `${arc.toFixed(2)} ${(CIRCUMFERENCE - arc).toFixed(2)}`
})

const activityLabel = computed(() =>
  hasDevices.value ? 'Dispositivos activos' : 'Sin dispositivos vinculados'
)

const donutAriaLabel = computed(() =>
  hasDevices.value
    ? `${activeDevices.value} de ${totalDevices.value} dispositivos activos`
    : 'Sin dispositivos vinculados'
)

const cardAriaLabel = computed(() =>
  hasDevices.value
    ? `${props.room.name}, ${activeDevices.value} de ${totalDevices.value} dispositivos activos`
    : `${props.room.name}, sin dispositivos vinculados`
)
</script>

<style scoped>
/* ── Card shell ── */
.room-card {
  background: #ffffff;
  border: 1px solid var(--sh-border);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: transform 200ms cubic-bezier(.4,0,.2,1),
              box-shadow 200ms cubic-bezier(.4,0,.2,1),
              border-color 200ms cubic-bezier(.4,0,.2,1);
  animation: card-in 260ms cubic-bezier(.4,0,.2,1) both;
  animation-delay: var(--card-delay, 0ms);
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, .06);
}

.room-card:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

/* ── Left content block ── */
.room-card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.room-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  min-width: 0;
}

.room-card__icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--sh-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.room-card__name {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--sh-text-main);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.room-card__activity-label {
  margin: 0 0 8px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--sh-text-muted);
}

.room-card:not(.room-card--active) .room-card__activity-label {
  /* When totalDevices === 0 the label text is "Sin dispositivos vinculados".
     Soften its tone so the empty state reads as truly empty. */
}

/* ── Details link ── */
.room-card__details-link {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--sh-primary);
  cursor: pointer;
  transition: color 150ms cubic-bezier(.4,0,.2,1);
}

.room-card__details-link:hover { color: var(--sh-primary-dark); }

.room-card__details-chevron {
  transition: transform 150ms cubic-bezier(.4,0,.2,1);
}

.room-card__details-link:hover .room-card__details-chevron {
  transform: translateX(2px);
}

.room-card__details-link:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

/* ── Donut SVG ── */
.room-card__donut {
  flex-shrink: 0;
}

.room-card__donut-bg { stroke: var(--sh-border); }

.room-card__donut-arc {
  stroke: var(--sh-primary);
  transition: stroke-dasharray 400ms cubic-bezier(.4,0,.2,1);
}

.room-card__donut-value {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 500;
  fill: var(--sh-text-main);
}

.room-card__donut-value--muted { fill: var(--sh-text-light); }

.room-card__donut-total {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  fill: var(--sh-text-muted);
}

/* ── List mode (preserved from ViewModeToggle) ── */
.room-card--list {
  padding: 12px 18px;
  cursor: default;
}

.room-card--list .room-card__name { flex: 1; }

.room-card__list-count {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--sh-text-main);
  flex-shrink: 0;
}

/* ── Animations ── */
@keyframes card-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0);   }
}

</style>
