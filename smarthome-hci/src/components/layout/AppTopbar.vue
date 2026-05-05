<template>
  <header class="app-topbar" role="banner">

    <!-- Selector de hogar -->
    <v-menu offset="8">
      <template #activator="{ props: menuProps }">
        <button
          v-bind="menuProps"
          type="button"
          class="app-topbar__home-btn"
          aria-label="Cambiar hogar activo"
          aria-haspopup="menu"
        >
          <v-icon icon="mdi-home-outline" size="16" class="app-topbar__home-icon" aria-hidden="true" />
          <span class="app-topbar__home-name">{{ activeHomeName }}</span>
          <v-icon icon="mdi-chevron-down" size="16" aria-hidden="true" />
        </button>
      </template>
      <v-list>
        <v-list-item
          v-for="home in homes.homes"
          :key="home.id"
          :value="home.id"
          @click="homes.selectHome(home.id)"
        >
          <v-list-item-title>{{ home.name }}</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="homes.homes.length === 0">
          <v-list-item-title class="app-topbar__no-homes">Casa Principal</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Buscador -->
    <div class="app-topbar__search">
      <v-icon icon="mdi-magnify" size="18" class="app-topbar__search-icon" aria-hidden="true" />
      <label for="app-topbar-search" class="sr-only">{{ searchPlaceholder }}</label>
      <input
        id="app-topbar-search"
        type="search"
        class="app-topbar__search-input"
        :placeholder="searchPlaceholder"
        :value="modelValue"
        @input="emit('update:modelValue', $event.target.value)"
      />
    </div>

    <!-- Usuario -->
    <div class="app-topbar__right" ref="userMenuAnchor">
      <button
        id="user-menu-trigger"
        type="button"
        class="app-topbar__user"
        aria-label="Menú de usuario"
        aria-haspopup="menu"
        :aria-expanded="String(userMenuOpen)"
        @click="userMenuOpen = !userMenuOpen"
      >
        <span class="app-topbar__user-name">{{ auth.displayName }}</span>
        <span class="app-topbar__avatar" aria-hidden="true">{{ auth.initial }}</span>
      </button>

      <transition name="user-menu">
        <div
          v-if="userMenuOpen"
          class="user-menu"
          role="menu"
          aria-labelledby="user-menu-trigger"
          @keydown="handleMenuKeydown"
        >
          <!-- Identidad -->
          <div class="user-menu__header">
            <span class="user-menu__avatar" aria-hidden="true">{{ auth.initial }}</span>
            <div class="user-menu__info">
              <p class="user-menu__name">{{ auth.displayName }}</p>
              <p class="user-menu__email" :title="auth.email">{{ auth.email || 'usuario@smarthome.app' }}</p>
            </div>
          </div>

          <div class="user-menu__divider" aria-hidden="true" />

          <!-- Configuración -->
          <button
            type="button"
            class="user-menu__item"
            role="menuitem"
            ref="configItemRef"
            @click="goToConfig"
          >
            <v-icon icon="mdi-cog-outline" size="20" aria-hidden="true" />
            Configuración
          </button>

          <div class="user-menu__divider" aria-hidden="true" />

          <!-- Cerrar sesión -->
          <button
            type="button"
            class="user-menu__item user-menu__item--danger"
            role="menuitem"
            :disabled="loggingOut"
            @click="handleLogout"
          >
            <v-icon icon="mdi-logout" size="20" aria-hidden="true" />
            {{ loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión' }}
          </button>
        </div>
      </transition>
    </div>

  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHomesStore } from '@/stores/homes'

defineProps({
  modelValue:        { type: String, default: '' },
  searchPlaceholder: { type: String, default: 'Buscar...' },
})
const emit = defineEmits(['update:modelValue'])

const auth   = useAuthStore()
const homes  = useHomesStore()
const router = useRouter()

const userMenuOpen  = ref(false)
const loggingOut    = ref(false)
const userMenuAnchor = ref(null)
const configItemRef  = ref(null)

const activeHomeName = computed(() =>
  homes.selectedHome?.name ?? homes.homes[0]?.name ?? 'Mi Hogar'
)

// ── Click outside ──
function onDocClick(e) {
  if (userMenuAnchor.value && !userMenuAnchor.value.contains(e.target)) {
    userMenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))

// ── Keyboard nav ──
function handleMenuKeydown(event) {
  if (event.key === 'Escape') {
    userMenuOpen.value = false
    document.getElementById('user-menu-trigger')?.focus()
  }
}

// ── Actions ──
function goToConfig() {
  userMenuOpen.value = false
  router.push('/settings')
}

async function handleLogout() {
  loggingOut.value = true
  try {
    await auth.logout()
    router.push('/login')
  } finally {
    loggingOut.value = false
    userMenuOpen.value = false
  }
}

// Open → focus first item
function openMenu() {
  userMenuOpen.value = true
  nextTick(() => configItemRef.value?.focus())
}
</script>

<style scoped>
.app-topbar {
  position: fixed;
  top: 0;
  left: 72px;
  right: 0;
  height: 64px;
  z-index: 90;
  background: #ffffff;
  border-bottom: 1px solid var(--sh-border);
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 32px;
}

/* ── Home selector ── */
.app-topbar__home-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid var(--sh-border);
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-main);
  white-space: nowrap;
  flex-shrink: 0;
  transition: background-color 150ms cubic-bezier(.4,0,.2,1), border-color 150ms cubic-bezier(.4,0,.2,1);
}
.app-topbar__home-btn:hover {
  background-color: var(--sh-primary-light);
  border-color: var(--sh-primary);
}
.app-topbar__home-btn:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
.app-topbar__home-icon  { color: var(--sh-primary); }
.app-topbar__home-name  { font-weight: 500; color: var(--sh-text-main); }
.app-topbar__no-homes   { color: var(--sh-text-muted); font-style: italic; }

/* ── Search ── */
.app-topbar__search {
  flex: 1;
  max-width: 360px;
  position: relative;
}
.app-topbar__search-icon {
  position: absolute;
  top: 50%;
  left: 13px;
  transform: translateY(-50%);
  color: var(--sh-text-light);
  pointer-events: none;
}
.app-topbar__search-input {
  width: 100%;
  height: 40px;
  padding: 0 16px 0 40px;
  border: 1px solid var(--sh-border);
  border-radius: 999px;
  background: #f8fafc;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--sh-text-main);
  outline: none;
  transition: border-color 150ms, background-color 150ms, box-shadow 150ms;
}
.app-topbar__search-input::placeholder { color: var(--sh-text-light); }
.app-topbar__search-input:focus {
  border-color: var(--sh-primary);
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, .12);
}

/* ── Right side ── */
.app-topbar__right {
  display: flex;
  align-items: center;
  margin-left: auto;
  position: relative;
}

.app-topbar__user {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 4px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: background-color 150ms;
}
.app-topbar__user:hover { background-color: var(--sh-primary-light); }
.app-topbar__user:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
.app-topbar__user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--sh-text-main);
  white-space: nowrap;
}
.app-topbar__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--sh-primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── User dropdown menu ── */
.user-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: #ffffff;
  border: 1px solid var(--sh-border);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, .08), 0 16px 32px -8px rgba(15, 23, 42, .16);
  z-index: 200;
  font-family: 'Inter', sans-serif;
}

.user-menu__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--sh-border);
}

.user-menu__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--sh-primary);
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-menu__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-menu__name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--sh-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu__email {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  color: var(--sh-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu__divider {
  height: 1px;
  background: var(--sh-border);
  margin: 12px 0;
}

.user-menu__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 4px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--sh-text-muted);
  cursor: pointer;
  text-align: left;
  transition: background-color 150ms, color 150ms;
}
.user-menu__item:hover:not(:disabled) {
  background-color: var(--sh-primary-light);
  color: var(--sh-text-main);
}
.user-menu__item:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
.user-menu__item:disabled { opacity: .5; cursor: not-allowed; }

.user-menu__item--danger        { color: var(--sh-error); }
.user-menu__item--danger:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, .08);
  color: var(--sh-error);
}

/* ── Transition ── */
.user-menu-enter-active { transition: opacity 180ms ease-out, transform 180ms ease-out; }
.user-menu-leave-active { transition: opacity 120ms ease-in, transform 120ms ease-in; }
.user-menu-enter-from   { opacity: 0; transform: translateY(-4px); }
.user-menu-leave-to     { opacity: 0; transform: translateY(-4px); }

/* ── Misc ── */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

</style>
