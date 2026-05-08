<template>
  <aside class="app-sidebar" aria-label="Navegación principal">
    <div class="app-sidebar__brand" aria-hidden="true">
      <span class="app-sidebar__logo">
        <v-icon icon="mdi-home-variant" size="22" aria-hidden="true" />
      </span>
    </div>

    <nav class="app-sidebar__nav" aria-label="Menú principal">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        custom
        v-slot="{ isActive, navigate }"
      >
        <button
          type="button"
          class="app-sidebar__btn"
          :class="{ 'app-sidebar__btn--active': isActive }"
          :aria-label="item.label"
          :aria-current="isActive ? 'page' : undefined"
          @click="navigate"
        >
          <span class="sr-only">{{ item.label }}</span>
          <v-icon :icon="item.icon" size="22" aria-hidden="true" />
        </button>
      </router-link>
    </nav>

    <div class="app-sidebar__bottom">
      <router-link to="/settings" custom v-slot="{ isActive, navigate }">
        <button
          type="button"
          class="app-sidebar__btn"
          :class="{ 'app-sidebar__btn--active': isActive }"
          aria-label="Configuración"
          :aria-current="isActive ? 'page' : undefined"
          @click="navigate"
        >
          <span class="sr-only">Configuración</span>
          <v-icon icon="mdi-cog-outline" size="22" aria-hidden="true" />
        </button>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
const navItems = [
  { to: '/dashboard', icon: 'mdi-home-outline',           label: 'Inicio'        },
  { to: '/rooms',     icon: 'mdi-door-open',              label: 'Habitaciones'  },
  { to: '/rutinas',   icon: 'mdi-lightning-bolt-outline', label: 'Rutinas'       },
  { to: '/stats',     icon: 'mdi-chart-line',             label: 'Estadísticas'  },
]
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 72px;
  height: 100vh;
  z-index: 100;
  background: #ffffff;
  border-right: 1px solid var(--sh-border);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-sidebar__brand {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--sh-border);
  flex-shrink: 0;
}

.app-sidebar__logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: var(--sh-primary-light);
  color: var(--sh-primary);
}

.app-sidebar__nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 0;
  flex: 1;
}

.app-sidebar__btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--sh-text-muted);
  cursor: pointer;
  transition: background-color 150ms cubic-bezier(.4,0,.2,1), color 150ms cubic-bezier(.4,0,.2,1);
}

.app-sidebar__btn:hover {
  background-color: var(--sh-primary-light);
  color: var(--sh-primary-dark);
}

.app-sidebar__btn:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

.app-sidebar__btn--active {
  background-color: var(--sh-primary);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, .25);
}

.app-sidebar__btn--active:hover {
  background-color: var(--sh-primary-dark);
  color: #ffffff;
}

.app-sidebar__bottom {
  padding: 16px 0;
  border-top: 1px solid var(--sh-border);
  width: 100%;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

</style>
