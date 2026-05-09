<template>
  <aside
    class="app-sidebar"
    :class="{ 'app-sidebar--expanded': expanded }"
    aria-label="Navegación principal"
  >
    <div class="app-sidebar__brand">
      <span v-if="!expanded" class="app-sidebar__monogram" aria-hidden="true">
        <span class="app-sidebar__monogram-s">S</span><span class="app-sidebar__monogram-h">H</span>
      </span>
      <span v-else class="app-sidebar__wordmark" aria-hidden="true">
        <span class="app-sidebar__wordmark-smart">Smart</span><span class="app-sidebar__wordmark-home">Home</span>
      </span>
    </div>

    <nav class="app-sidebar__nav" aria-label="Menú principal">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        custom
        v-slot="{ href, isActive, navigate }"
      >
        <a
          :href="href"
          class="app-sidebar__btn"
          :class="{ 'app-sidebar__btn--active': isActive }"
          :aria-label="item.label"
          :aria-current="isActive ? 'page' : undefined"
          :title="expanded ? undefined : item.label"
          @click="navigate"
        >
          <span class="sr-only">{{ item.label }}</span>
          <v-icon :icon="item.icon" :size="iconSize" aria-hidden="true" />
          <span v-if="expanded" class="app-sidebar__label">{{ item.label }}</span>
        </a>
      </router-link>
    </nav>

    <button
      type="button"
      class="app-sidebar__toggle"
      :aria-label="expanded ? 'Colapsar navegación' : 'Expandir navegación'"
      :title="expanded ? 'Colapsar' : 'Expandir'"
      @click="emit('toggle-expanded')"
    >
      <v-icon :icon="expanded ? 'mdi-chevron-left' : 'mdi-chevron-right'" size="20" aria-hidden="true" />
    </button>

  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  expanded: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-expanded'])

const navItems = [
  { to: '/dashboard', icon: 'mdi-home-outline',           label: 'Inicio'        },
  { to: '/rooms',     icon: 'mdi-door',                   label: 'Habitaciones'  },
  { to: '/rutinas',   icon: 'mdi-lightning-bolt-outline', label: 'Rutinas'       },
]

const iconSize = computed(() => props.expanded ? 22 : 24)
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--app-sidebar-width, 72px);
  height: 100vh;
  z-index: 100;
  background: #ffffff;
  border-right: 1px solid var(--sh-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  transition: width 180ms cubic-bezier(.4, 0, .2, 1);
}

.app-sidebar__brand {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-sidebar__monogram {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--sh-font);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1;
}

.app-sidebar__monogram-s {
  color: var(--sh-text-main);
}

.app-sidebar__monogram-h {
  color: #818CF8;
}

.app-sidebar__wordmark {
  display: inline-flex;
  align-items: baseline;
  font-family: var(--sh-font);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1;
}

.app-sidebar__wordmark-smart {
  color: var(--sh-text-main);
}

.app-sidebar__wordmark-home {
  color: #818CF8;
}

.app-sidebar__nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 16px 12px;
  flex: 1;
}

.app-sidebar__btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: var(--sh-text-muted);
  cursor: pointer;
  text-decoration: none;
  transition: background-color 150ms cubic-bezier(.4,0,.2,1), color 150ms cubic-bezier(.4,0,.2,1);
}

.app-sidebar--expanded .app-sidebar__nav {
  align-items: stretch;
}

.app-sidebar--expanded .app-sidebar__btn {
  width: 100%;
  height: 44px;
  justify-content: flex-start;
  padding: 0 14px;
}

.app-sidebar__label {
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  color: currentColor;
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

.app-sidebar__toggle {
  width: 28px;
  height: 28px;
  margin: 0 0 24px;
  border: 1px solid var(--sh-border);
  border-radius: 999px;
  background: #ffffff;
  color: var(--sh-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 14px -10px rgba(15, 23, 42, .35);
  transition: background-color 150ms, border-color 150ms, color 150ms, transform 150ms;
}

.app-sidebar__toggle:hover {
  background: var(--sh-primary-light);
  border-color: rgba(99, 102, 241, .22);
  color: var(--sh-primary-dark);
  transform: translateY(-1px);
}

.app-sidebar__toggle:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

.app-sidebar--expanded .app-sidebar__toggle {
  align-self: flex-end;
  margin-right: 22px;
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
