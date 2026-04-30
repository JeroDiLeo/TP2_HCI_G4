<template>
  <button
    type="button"
    class="home-card"
    :class="{ 'home-card--selected': selected }"
    :aria-pressed="selected"
    :aria-label="`Seleccionar hogar ${home.name}, ${home.rooms} habitaciones, ${home.devices} dispositivos`"
    @click="$emit('select', home.id)"
  >
    <div class="home-card__media">
      <img
        v-if="home.image"
        :src="home.image"
        :alt="`Foto del hogar ${home.name}`"
        class="home-card__img"
      >
      <div v-else class="home-card__placeholder" aria-hidden="true">
        foto exterior casa
      </div>
    </div>

    <div class="home-card__body">
      <h3 class="home-card__name">{{ home.name }}</h3>

      <p class="home-card__metric">
        <v-icon icon="mdi-door" size="18" class="home-card__icon" aria-hidden="true" />
        <span>{{ home.rooms }} habitaciones</span>
      </p>
      <p class="home-card__metric">
        <v-icon icon="mdi-flash" size="18" class="home-card__icon" aria-hidden="true" />
        <span>{{ home.devices }} dispositivos</span>
      </p>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { Home } from '@/stores/homes'

defineProps<{ home: Home; selected: boolean }>()
defineEmits<{ (e: 'select', id: number): void }>()
</script>

<style scoped>
.home-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  background-color: #ffffff;
  border: 2px solid transparent;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  text-align: left;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.home-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}

.home-card:focus-visible {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.18);
}

.home-card--selected {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
}

.home-card__media {
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #0f172a;
}

.home-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.home-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.02em;
}

.home-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  flex: 1 1 auto;
}

.home-card__name {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

.home-card__metric {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.home-card__icon {
  color: #6366f1;
  flex-shrink: 0;
}
</style>
