<template>
  <article class="routine-card">
    <div class="routine-card__top">
      <div class="routine-card__left">
        <div class="routine-card__icon-wrap" aria-hidden="true">
          <v-icon :icon="routine.icon" size="18" />
        </div>
        <div class="routine-card__info">
          <h3 class="routine-card__name">{{ routine.name }}</h3>
          <p class="routine-card__time">{{ routine.time }}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        :aria-checked="localActive"
        :aria-label="`${localActive ? 'Desactivar' : 'Activar'} rutina ${routine.name}`"
        class="toggle"
        :class="{ 'toggle--on': localActive }"
        @click="localActive = !localActive"
      >
        <span class="toggle__thumb" aria-hidden="true" />
      </button>
    </div>

    <ul class="routine-card__actions" :aria-label="`Acciones de ${routine.name}`">
      <li
        v-for="(action, i) in visibleActions"
        :key="i"
        class="routine-card__action"
      >
        <span class="routine-card__dot" aria-hidden="true" />
        {{ action }}
      </li>
      <li v-if="routine.actions.length > 2" class="routine-card__more">
        +{{ routine.actions.length - 2 }} más
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Routine } from '@/types/dashboard'

const props = defineProps<{ routine: Routine }>()

const localActive = ref(props.routine.active)
const visibleActions = computed(() => props.routine.actions.slice(0, 2))
</script>

<style scoped>
.routine-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.routine-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.routine-card__left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.routine-card__icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: #eef2ff;
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.routine-card__info {
  min-width: 0;
}

.routine-card__name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.routine-card__time {
  margin: 3px 0 0;
  font-size: 12px;
  color: #94a3b8;
  font-family: 'Inter', sans-serif;
}

.routine-card__actions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.routine-card__action {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: #64748b;
  font-family: 'Inter', sans-serif;
}

.routine-card__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #94a3b8;
  flex-shrink: 0;
}

.routine-card__more {
  font-size: 12px;
  color: #94a3b8;
  font-family: 'Inter', sans-serif;
  padding-left: 12px;
}

.toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: #e2e8f0;
  border: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}

.toggle--on {
  background: #A5B4FC;
}

.toggle__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.2);
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.toggle--on .toggle__thumb {
  transform: translateX(20px);
}

.toggle:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

</style>
