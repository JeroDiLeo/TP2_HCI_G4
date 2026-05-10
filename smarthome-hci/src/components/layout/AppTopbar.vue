<template>
  <header class="app-topbar" role="banner">

    <!-- Selector de hogar -->
    <v-menu location="bottom start" offset="8" content-class="homes-dropdown-menu">
      <template #activator="{ props: menuProps }">
        <button
          v-bind="menuProps"
          type="button"
          class="app-topbar__home-btn"
          aria-label="Cambiar hogar activo"
          aria-haspopup="menu"
        >
          <span class="app-topbar__home-name">{{ activeHomeName }}</span>
          <v-icon icon="mdi-chevron-down" size="20" class="app-topbar__home-chevron" aria-hidden="true" />
        </button>
      </template>

      <div class="homes-menu">
        <div v-if="homes.loading" class="homes-menu__loading">
          <v-progress-circular size="16" width="2" indeterminate color="#6366f1" />
          <span>Cargando…</span>
        </div>

        <template v-else>
          <button
            v-for="home in homes.homes"
            :key="home.id"
            type="button"
            class="homes-menu__item"
            :class="{ 'homes-menu__item--active': home.id === currentHomeId }"
            :disabled="home.id === currentHomeId"
            @click="goToHome(home.id)"
          >
            <span class="homes-menu__thumb" aria-hidden="true">
              <v-icon :icon="homeTypeIcon(home)" size="18" />
            </span>
            <span class="homes-menu__name">{{ home.name }}</span>
            <v-icon
              v-if="home.id === currentHomeId"
              icon="mdi-check"
              size="16"
              class="homes-menu__check"
              aria-hidden="true"
            />
          </button>

          <div v-if="homes.homes.length === 0" class="homes-menu__empty">
            Sin hogares disponibles
          </div>

          <div class="homes-menu__divider" aria-hidden="true" />

          <button
            type="button"
            class="homes-menu__add-btn"
            aria-label="Agregar nuevo hogar"
            @click="addHomeOpen = true"
          >
            <span class="homes-menu__add-icon" aria-hidden="true">
              <v-icon icon="mdi-plus" size="18" />
            </span>
            <span class="homes-menu__add-label">Agregar hogar</span>
          </button>
        </template>
      </div>
    </v-menu>

    <AddHomeModal v-model:open="addHomeOpen" />

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
        autocomplete="off"
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

          <div class="user-menu__section">
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

            <!-- Historial -->
            <button
              type="button"
              class="user-menu__item"
              role="menuitem"
              @click="goToHistory"
            >
              <v-icon icon="mdi-history" size="20" aria-hidden="true" />
              Historial
            </button>
          </div>

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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHomesStore } from '@/stores/homes'
import AddHomeModal from '@/components/dashboard/AddHomeModal.vue'

defineProps({
  modelValue:        { type: String, default: '' },
  searchPlaceholder: { type: String, default: 'Buscar...' },
})
const emit = defineEmits(['update:modelValue'])

const auth   = useAuthStore()
const homes  = useHomesStore()
const router = useRouter()
const route  = useRoute()

const userMenuOpen  = ref(false)
const loggingOut    = ref(false)
const userMenuAnchor = ref(null)
const configItemRef  = ref(null)
const addHomeOpen   = ref(false)

const currentHomeId = computed(() => route.params.homeId ?? homes.selectedHome?.id)

const activeHomeName = computed(() => {
  if (currentHomeId.value) {
    const found = homes.homes.find(h => h.id === currentHomeId.value)
    if (found) return found.name
  }
  return homes.selectedHome?.name ?? homes.homes[0]?.name ?? 'Seleccionar hogar'
})

const TYPE_ICONS = {
  casa:         'mdi-home-outline',
  departamento: 'mdi-office-building-outline',
  oficina:      'mdi-briefcase-outline',
  otro:         'mdi-dots-horizontal',
}

function homeTypeIcon(home) {
  const type = home?.metadata?.type
  return TYPE_ICONS[type ?? ''] ?? 'mdi-home-outline'
}

function goToHome(homeId) {
  if (typeof homes.selectHome === 'function') homes.selectHome(homeId)
  router.push({ name: 'home-detail', params: { homeId } })
}

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

function goToHistory() {
  userMenuOpen.value = false
  router.push('/historial')
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

</script>

<style scoped>
.app-topbar {
  position: fixed;
  top: 0;
  left: var(--app-sidebar-width, 72px);
  right: 0;
  height: 64px;
  z-index: 90;
  background: #ffffff;
  border-bottom: 1px solid var(--sh-border);
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 32px;
  /* needed so the absolutely-centered search aligns to topbar bounds */
  transition: left 180ms cubic-bezier(.4, 0, .2, 1);
}

/* ── Home selector ── */
.app-topbar__home-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  color: var(--sh-text-main);
  white-space: nowrap;
  flex-shrink: 0;
  transition: background-color 150ms cubic-bezier(.4,0,.2,1);
}
.app-topbar__home-btn:hover {
  background-color: var(--sh-primary-light);
}
.app-topbar__home-btn:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
.app-topbar__home-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--sh-text-main);
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.app-topbar__home-chevron {
  color: var(--sh-text-muted);
  margin-top: 1px;
}
.app-topbar__no-homes { color: var(--sh-text-muted); font-style: italic; }

/* ── Search (centered horizontally in topbar) ── */
.app-topbar__search {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(420px, 38vw);
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

.user-menu__section {
  display: flex;
  flex-direction: column;
  gap: 2px;
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

/* ── Homes dropdown (teleported) ── */
:deep(.homes-dropdown-menu) {
  border-radius: 14px !important;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.12) !important;
  overflow: hidden !important;
}

.homes-menu {
  background: #ffffff;
  border: 1px solid var(--sh-border);
  border-radius: 14px;
  padding: 8px;
  min-width: 220px;
  font-family: 'Inter', sans-serif;
}

.homes-menu__loading,
.homes-menu__empty {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  font-size: 14px;
  color: var(--sh-text-light);
}

.homes-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--sh-text-main);
  cursor: pointer;
  transition: background-color 120ms;
  text-align: left;
}

.homes-menu__item:hover:not(:disabled) {
  background-color: var(--sh-primary-light);
}

.homes-menu__item--active {
  color: var(--sh-primary);
  cursor: default;
}

.homes-menu__item:disabled {
  cursor: default;
}

.homes-menu__thumb {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
  background: var(--sh-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sh-primary);
}

.homes-menu__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.homes-menu__check {
  color: var(--sh-primary);
  flex-shrink: 0;
}

.homes-menu__divider {
  height: 1px;
  background: var(--sh-border);
  margin: 6px 4px;
}

.homes-menu__add-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--sh-primary);
  cursor: pointer;
  transition: background-color 120ms, border-color 120ms;
  text-align: left;
}
.homes-menu__add-btn:hover {
  background-color: var(--sh-primary-light);
}
.homes-menu__add-btn:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

.homes-menu__add-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
  background: var(--sh-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sh-primary);
}

.homes-menu__add-label {
  flex: 1;
}

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
