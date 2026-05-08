<template>
  <article class="room-card">
    <div class="room-card__header">
      <div class="room-card__icon-wrap" aria-hidden="true">
        <v-icon :icon="room.icon" size="20" />
      </div>
      <div>
        <h3 class="room-card__name">{{ room.name }}</h3>
        <p class="room-card__count">{{ activeCount }} dispositivos activos</p>
      </div>
    </div>

    <ul class="room-card__devices" :aria-label="`Dispositivos en ${room.name}`">
      <li
        v-for="device in localDevices"
        :key="device.id"
        class="room-card__device"
      >
        <span class="room-card__device-name">{{ device.name }}</span>

        <div class="room-card__controls">
          <template v-if="device.hasSlider">
            <span class="room-card__value">{{ device.value }}{{ device.unit }}</span>
            <input
              type="range"
              class="room-card__slider"
              :min="device.min ?? (device.type === 'ac' ? 16 : 0)"
              :max="device.max ?? (device.type === 'ac' ? 30 : 100)"
              :step="device.step ?? (device.type === 'ac' ? 1 : 5)"
              :value="device.value"
              :disabled="!device.active"
              :aria-label="`${device.name}, nivel actual: ${device.value}${device.unit}`"
              @input="device.value = Number(($event.target as HTMLInputElement).value)"
            />
          </template>

          <button
            type="button"
            role="switch"
            :aria-checked="device.active"
            :aria-label="`${device.active ? 'Desactivar' : 'Activar'} ${device.name}`"
            class="toggle"
            :class="{ 'toggle--on': device.active }"
            @click="device.active = !device.active"
          >
            <span class="toggle__thumb" aria-hidden="true" />
          </button>
        </div>
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { Room } from '@/types/dashboard'

const props = defineProps<{ room: Room }>()

const localDevices = reactive(props.room.devices.map(d => ({ ...d })))

const activeCount = computed(() => localDevices.filter(d => d.active).length)

// Sync new devices pushed into the room after mount (e.g. via AddDeviceModal)
watch(
  () => props.room.devices.length,
  () => {
    for (const d of props.room.devices) {
      if (!localDevices.find(ld => ld.id === d.id)) {
        localDevices.push({ ...d })
      }
    }
  },
)
</script>

<style scoped>
.room-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.room-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-card__icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #6366f1;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.room-card__name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  font-family: 'Inter', sans-serif;
}

.room-card__count {
  margin: 2px 0 0;
  font-size: 12px;
  color: #94a3b8;
  font-family: 'Inter', sans-serif;
}

.room-card__devices {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.room-card__device {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-top: 1px solid #f1f5f9;
}

.room-card__device:first-child {
  border-top: none;
  padding-top: 0;
}

.room-card__device:last-child {
  padding-bottom: 0;
}

.room-card__device-name {
  font-size: 14px;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
  flex: 1;
  min-width: 0;
}

.room-card__controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.room-card__value {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  font-family: 'Inter', sans-serif;
  min-width: 30px;
  text-align: right;
}

.room-card__slider {
  width: 90px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 2px;
  background: #e2e8f0;
  outline: none;
  cursor: pointer;
  flex-shrink: 0;
}

.room-card__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(99, 102, 241, 0.4);
  border: 2px solid #ffffff;
}

.room-card__slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 4px rgba(99, 102, 241, 0.4);
}

.room-card__slider:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: #e2e8f0;
  border: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}

.toggle--on {
  background: #A5B4FC;
}

.toggle__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.2);
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.toggle--on .toggle__thumb {
  transform: translateX(20px);
}

.toggle:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

</style>
