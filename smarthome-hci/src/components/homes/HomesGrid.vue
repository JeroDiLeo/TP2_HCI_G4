<template>
  <section
    v-if="homes.length"
    class="homes-grid"
    aria-label="Lista de hogares"
  >
    <HomeCard
      v-for="home in homes"
      :key="home.id"
      :home="home"
      :selected="home.id === selectedId"
      @select="onSelect"
    />
  </section>
  <p v-else class="homes-grid__no-results" role="status">
    No se encontraron hogares que coincidan con la búsqueda.
  </p>
</template>

<script setup lang="ts">
import HomeCard from './HomeCard.vue'
import type { Home } from '@/stores/homes'

defineProps<{ homes: Home[]; selectedId: string | null }>()
const emit = defineEmits<{ (e: 'select', id: string): void }>()

function onSelect(id: string) {
  emit('select', id)
}
</script>

<style scoped>
.homes-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 24px;
}

.homes-grid__no-results {
  padding: 40px 0;
  color: #64748b;
  text-align: center;
  font-family: var(--sh-font);
  font-size: 15px;
}
</style>
