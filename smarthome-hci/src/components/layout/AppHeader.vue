<template>
  <header class="app-header" role="banner">
    <div class="app-header__inner">
      <!-- Logo -->
      <a class="app-header__logo" href="/homes" aria-label="SmartHome — ir a mis hogares">
        <span class="app-header__logo-smart">Smart</span><span class="app-header__logo-home">Home</span>
      </a>

      <!-- Buscador -->
      <div class="app-header__search">
        <label for="home-search" class="sr-only">Buscar hogar</label>
        <v-icon icon="mdi-magnify" size="20" class="app-header__search-icon" aria-hidden="true" />
        <input
          id="home-search"
          type="search"
          class="app-header__search-input"
          placeholder="Buscar hogar"
          aria-label="Buscar hogar"
          :value="modelValue"
          @input="onInput"
        >
      </div>

      <!-- Usuario -->
      <v-menu offset="8">
      <v-menu location="bottom end" offset="8" content-class="app-header-menu">
        <template #activator="{ props }">
          <button
            v-bind="props"
            type="button"
            class="app-header__user"
            aria-label="Menú de cuenta"
          >
            <span class="app-header__user-name">{{ auth.displayName }}</span>
            <span class="app-header__avatar" aria-hidden="true">{{ auth.initial }}</span>
          </button>
        </template>

        <div class="user-menu">
          <!-- User info header -->
          <div class="user-menu__header">
            <span class="user-menu__avatar" aria-hidden="true">{{ auth.initial }}</span>
            <div class="user-menu__info">
              <span class="user-menu__name">{{ auth.displayName }}</span>
              <span class="user-menu__email">{{ auth.email }}</span>
            </div>
          </div>

          <div class="user-menu__divider" />

          <!-- Configuración -->
          <button type="button" class="user-menu__item" disabled aria-disabled="true">
            <v-icon icon="mdi-cog-outline" size="16" aria-hidden="true" />
            Configuración
          </button>

          <div class="user-menu__divider" />

          <!-- Cerrar sesión -->
          <button
            type="button"
            class="user-menu__item user-menu__item--danger"
            :disabled="loggingOut"
            @click="handleLogout"
          >
            <v-icon icon="mdi-logout" size="16" aria-hidden="true" />
            {{ loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión' }}
          </button>
        </div>
      </v-menu>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const router = useRouter()
const auth = useAuthStore()
const loggingOut = ref(false)

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

async function handleLogout() {
  loggingOut.value = true
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-header__inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 64px;
  padding: 0 32px;
  gap: 24px;
}

/* Logo */
.app-header__logo {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: -0.01em;
  justify-self: start;
}
.app-header__logo-smart { color: #0f172a; }
.app-header__logo-home  { color: #6366f1; }
.app-header__logo:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 4px;
  border-radius: 4px;
}

/* Search */
.app-header__search {
  position: relative;
  width: 480px;
  max-width: 100%;
  justify-self: center;
}
.app-header__search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}
.app-header__search-input {
  width: 100%;
  height: 42px;
  padding: 0 16px 0 42px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background-color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.app-header__search-input::placeholder { color: #94a3b8; }
.app-header__search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

/* User button */
.app-header__user {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px 6px 12px;
  background: none;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: background-color 0.15s, border-color 0.15s;
  justify-self: end;
}
.app-header__user:hover { background-color: #eef2ff; }
.app-header__user:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
.app-header__user-name {
  font-weight: 500;
  font-size: 14px;
  color: #0f172a;
}
.app-header__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #6366f1;
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
}

/* Dropdown menu (teleported) */
:deep(.app-header-menu) {
  border-radius: 14px !important;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.12) !important;
  overflow: hidden !important;
}

.user-menu {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 8px;
  min-width: 220px;
  font-family: 'Inter', sans-serif;
}

/* Header with avatar + name/email */
.user-menu__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px 12px;
}

.user-menu__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #6366f1;
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  flex-shrink: 0;
}

.user-menu__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-menu__name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu__email {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu__divider {
  height: 1px;
  background: #e2e8f0;
  margin: 4px 0;
}

.user-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  cursor: pointer;
  transition: background-color 120ms;
  text-align: left;
}
.user-menu__item:hover:not(:disabled) { background-color: #f1f5f9; }
.user-menu__item:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}
.user-menu__item--danger { color: #ef4444; }
.user-menu__item--danger:hover:not(:disabled) { background-color: #fef2f2; }
</style>
