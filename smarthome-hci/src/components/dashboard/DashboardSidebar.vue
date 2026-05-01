<template>
  <aside class="sidebar" aria-label="Navegación principal">
    <div class="sidebar__brand" aria-hidden="true">
      <span class="sidebar__brand-mark">
        <v-icon icon="mdi-home-lightning-bolt" size="24" />
      </span>
    </div>

    <nav class="sidebar__nav" aria-label="Menú principal">
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="sidebar__btn"
        :class="{ 'sidebar__btn--active': modelValue === item.id }"
        :aria-label="item.label"
        :aria-current="modelValue === item.id ? 'page' : undefined"
        @click="$emit('update:modelValue', item.id)"
      >
        <v-icon :icon="item.icon" size="22" />
      </button>
    </nav>

    <div class="sidebar__bottom">
      <button type="button" class="sidebar__btn" aria-label="Configuración">
        <v-icon icon="mdi-cog-outline" size="22" />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const navItems = [
  { id: 'home',       icon: 'mdi-home',                  label: 'Inicio'           },
  { id: 'devices',    icon: 'mdi-view-grid-outline',      label: 'Dispositivos'     },
  { id: 'automation', icon: 'mdi-lightning-bolt-outline', label: 'Automatizaciones' },
  { id: 'stats',      icon: 'mdi-chart-line',             label: 'Estadísticas'     },
]

withDefaults(defineProps<{ modelValue?: string }>(), { modelValue: 'home' })
defineEmits<{ (e: 'update:modelValue', id: string): void }>()
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 72px;
  height: 100vh;
  z-index: 100;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sidebar__brand {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.sidebar__brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #eef2ff;
  color: #6366f1;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 0;
  flex: 1;
}

.sidebar__btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: background-color 150ms, color 150ms;
}

.sidebar__btn:hover {
  background-color: #f1f5f9;
  color: #64748b;
}

.sidebar__btn:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.sidebar__btn--active {
  background-color: #6366f1;
  color: #ffffff;
}

.sidebar__btn--active:hover {
  background-color: #4f46e5;
  color: #ffffff;
}

.sidebar__bottom {
  padding: 16px 0;
  border-top: 1px solid #e2e8f0;
  width: 100%;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

@media (max-width: 840px) {
  .sidebar {
    display: none;
  }
}
</style>
