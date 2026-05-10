<template>
  <div>
    <div
      v-if="filteredRooms.length > 0"
      class="rooms-grid"
      role="list"
    >
      <RoomCard
        v-for="(room, idx) in filteredRooms"
        :key="room.id"
        :room="room"
        :list-mode="false"
        :edit-mode="editMode"
        :style="{ '--card-delay': `${idx * 30}ms` }"
        role="listitem"
        @view-details="emit('view-details', $event)"
        @toggle-favorite="store.toggleFavorite($event)"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </div>

    <div v-else-if="hasSearch" class="rooms-empty" role="status">
      <v-icon icon="mdi-magnify-remove-outline" size="48" class="rooms-empty__icon" aria-hidden="true" />
      <p class="rooms-empty__title">Sin resultados</p>
      <p class="rooms-empty__sub">No se encontraron habitaciones que coincidan con tu búsqueda.</p>
      <button type="button" class="rooms-empty__btn" @click="clearSearch">
        Limpiar búsqueda
      </button>
    </div>

    <div v-else-if="store.loading" class="rooms-empty" role="status">
      <v-progress-circular indeterminate color="var(--sh-primary)" size="40" />
      <p class="rooms-empty__title">Cargando habitaciones…</p>
    </div>

    <div v-else class="rooms-empty" role="status">
      <v-icon icon="mdi-door-closed" size="48" class="rooms-empty__icon" aria-hidden="true" />
      <p class="rooms-empty__title">Sin habitaciones</p>
      <p class="rooms-empty__sub">Aún no hay habitaciones en este hogar.</p>
      <button type="button" class="rooms-empty__btn" @click="emit('add-room')">
        Agregar primera habitación
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoomsStore } from '@/stores/rooms'
import RoomCard from './RoomCard.vue'

defineProps({
  editMode: { type: Boolean, default: false },
})

const emit = defineEmits(['view-details', 'add-room', 'edit', 'delete'])

const store = useRoomsStore()

const filteredRooms = computed(() => store.filteredRooms)
const hasSearch = computed(() => store.searchQuery.trim() !== '')

function clearSearch() {
  store.searchQuery = ''
}
</script>

<style scoped>
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rooms-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  gap: 12px;
}

.rooms-empty__icon {
  color: var(--sh-text-light);
}

.rooms-empty__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--sh-text-main);
  font-family: var(--sh-font);
}

.rooms-empty__sub {
  margin: 0;
  font-size: 14px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
  max-width: 300px;
}

.rooms-empty__btn {
  margin-top: 4px;
  height: 40px;
  padding: 0 24px;
  background: var(--sh-primary);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-family: var(--sh-font);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms;
}

.rooms-empty__btn:hover { background: var(--sh-primary-dark); }

.rooms-empty__btn:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

@media (max-width: 1200px) {
  .rooms-grid { grid-template-columns: repeat(2, 1fr); }
}

</style>
