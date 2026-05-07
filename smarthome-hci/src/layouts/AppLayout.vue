<template>
  <div class="app-layout">
    <AppSidebar />
    <AppTopbar
      v-model="searchQuery"
      :search-placeholder="searchPlaceholder"
    />
    <main id="main-content" class="app-layout__content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar  from '@/components/layout/AppTopbar.vue'

const route = useRoute()

const searchQuery = ref('')

const PLACEHOLDERS = {
  'dashboard': 'Buscar dispositivos...',
  'rooms':     'Buscar habitaciones...',
  'devices':   'Buscar dispositivos...',
  'stats':     'Buscar estadísticas...',
  'profile':   'Buscar en perfil...',
  'settings':  'Buscar configuración...',
  'historial': 'Buscar dispositivos, acciones, rutinas...',
}

const searchPlaceholder = computed(() =>
  PLACEHOLDERS[route.name] ?? 'Buscar...'
)

// Reset search when navigating between views
watch(() => route.name, () => { searchQuery.value = '' })

// Provide search to child views so they can sync to their store
provide('layoutSearchQuery', searchQuery)
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', sans-serif;
}

.app-layout__content {
  margin-left: 72px;
  margin-top: 64px;
  padding: 32px 40px;
  min-height: calc(100vh - 64px);
}
</style>
