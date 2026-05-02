<template>
  <div class="homes-view">
    <AppHeader v-model="searchQuery" />

    <main class="homes-view__main" role="main">
    <!-- Saludo -->
      <section class="homes-view__hero" aria-labelledby="welcome-title">
        <div>
          <h1 id="welcome-title" class="homes-view__title">
            ¡Bienvenido, {{ auth.displayName }}!
          </h1>
          <p class="homes-view__subtitle">
            Seleccioná el entorno que querés gestionar hoy.
          </p>
        </div>

        <button
          v-if="homesStore.homes.length > 0"
          type="button"
          class="homes-view__add-btn"
          aria-label="Agregar nuevo hogar"
          @click="openAddDialog"
        >
          <v-icon icon="mdi-plus" size="20" aria-hidden="true" />
          <span>Agregar hogar</span>
        </button>
      </section>

      <!-- Loading -->
      <div v-if="homesStore.loading" class="homes-view__loading">
        <v-progress-circular indeterminate color="#6366f1" size="48" />
      </div>

      <!-- Error -->
      <v-snackbar
        v-model="showError"
        color="error"
        timeout="5000"
        location="bottom"
      >
        {{ homesStore.error }}
      </v-snackbar>

      <!-- Empty state vs grid + stats -->
      <template v-if="!homesStore.loading && homesStore.homes.length === 0">
        <EmptyHomesState class="homes-view__empty" @add="openAddDialog" />
      </template>
      <template v-if="!homesStore.loading && homesStore.homes.length > 0">
        <HomesGrid
          class="homes-view__grid"
          :homes="filteredHomes"
          :selected-id="homesStore.selectedHomeId"
          @select="homesStore.selectHome"
        />
      </template>
    </main>

    <AddHomeModal v-model:open="addDialog" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import HomesGrid from '@/components/homes/HomesGrid.vue'
import EmptyHomesState from '@/components/homes/EmptyHomesState.vue'
import AddHomeModal from '@/components/dashboard/AddHomeModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useHomesStore } from '@/stores/homes'

const auth = useAuthStore()
const homesStore = useHomesStore()

const searchQuery = ref('')
const addDialog = ref(false)
const showError = ref(false)

onMounted(() => {
  homesStore.fetchHomes()
})

watch(() => homesStore.error, (val) => {
  showError.value = !!val
})

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const filteredHomes = computed(() => {
  const q = normalize(searchQuery.value.trim())
  if (!q) return homesStore.homes
  return homesStore.homes.filter(h => normalize(h.name).includes(q))
})

function openAddDialog() {
  addDialog.value = true
}
</script>

<style scoped>
.homes-view {
  min-height: 100vh;
  background-color: #eef0ff;
  font-family: 'Inter', sans-serif;
}

.homes-view__main {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.homes-view__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.homes-view__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.25;
}

.homes-view__subtitle {
  margin: 6px 0 0;
  font-size: 15px;
  color: #64748b;
}

.homes-view__add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  height: 44px;
  background-color: #6366f1;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.15s, transform 0.1s;
  flex-shrink: 0;
}

.homes-view__add-btn:hover { background-color: #4f46e5; }
.homes-view__add-btn:active { transform: scale(0.99); }
.homes-view__add-btn:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 3px;
}

.homes-view__loading {
  display: flex;
  justify-content: center;
  padding: 64px 0;
}
</style>
