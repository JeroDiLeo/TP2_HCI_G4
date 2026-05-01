<template>
  <header class="dash-header" role="banner">
    <button type="button" class="dash-header__house" aria-label="Cambiar casa activa">
      <v-icon icon="mdi-home-outline" size="18" class="dash-header__house-icon" aria-hidden="true" />
      <span class="dash-header__house-name">Casa Principal</span>
      <v-icon icon="mdi-chevron-down" size="18" aria-hidden="true" />
    </button>

    <div class="dash-header__search">
      <v-icon icon="mdi-magnify" size="18" class="dash-header__search-icon" aria-hidden="true" />
      <label for="dash-search" class="sr-only">Buscar dispositivos</label>
      <input
        id="dash-search"
        v-model="searchQuery"
        type="search"
        class="dash-header__search-input"
        placeholder="Buscar dispositivos..."
        aria-label="Buscar dispositivos"
      />
    </div>

    <div class="dash-header__right">
      <button type="button" class="dash-header__icon-btn" aria-label="Notificaciones (3 nuevas)">
        <v-icon icon="mdi-bell-outline" size="22" />
        <span class="dash-header__badge" aria-hidden="true">3</span>
      </button>

      <v-menu offset="8">
        <template #activator="{ props }">
          <button
            v-bind="props"
            type="button"
            class="dash-header__user"
            aria-label="Menú de cuenta"
          >
            <span class="dash-header__user-name">{{ auth.displayName }}</span>
            <span class="dash-header__avatar" aria-hidden="true">{{ auth.initial }}</span>
          </button>
        </template>
        <v-list>
          <v-list-item @click="handleLogout">
            <template #prepend>
              <v-icon icon="mdi-logout" />
            </template>
            <v-list-item-title>Cerrar sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const searchQuery = ref('')

function handleLogout() {
  auth.logout()
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

.dash-header {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
}

.dash-header__house {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  transition: border-color 150ms, background-color 150ms;
  flex-shrink: 0;
}

.dash-header__house:hover {
  border-color: #6366f1;
  background-color: #eef2ff;
}

.dash-header__house:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.dash-header__house-icon {
  color: #6366f1;
}

.dash-header__search {
  flex: 1;
  max-width: 340px;
  position: relative;
}

.dash-header__search-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.dash-header__search-input {
  width: 100%;
  height: 40px;
  padding: 0 16px 0 38px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #f8fafc;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: border-color 150ms, background-color 150ms, box-shadow 150ms;
}

.dash-header__search-input::placeholder {
  color: #94a3b8;
}

.dash-header__search-input:focus {
  border-color: #6366f1;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.dash-header__right {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.dash-header__icon-btn {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: background-color 150ms, color 150ms;
}

.dash-header__icon-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.dash-header__icon-btn:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.dash-header__badge {
  position: absolute;
  top: 6px;
  right: 5px;
  min-width: 16px;
  height: 16px;
  background: #6366f1;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
}

.dash-header__user {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 4px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: background-color 150ms, border-color 150ms;
}

.dash-header__user:hover {
  background-color: #eef2ff;
}

.dash-header__user:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.dash-header__user-name {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  white-space: nowrap;
}

.dash-header__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #6366f1;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
