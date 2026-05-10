<template>
  <div class="historial-filters">
    <span id="device-filter-label" class="filters-label">Dispositivo:</span>
    <v-select
      v-model="selected"
      :items="deviceOptions"
      item-title="name"
      item-value="id"
      density="compact"
      variant="outlined"
      hide-details
      class="device-select"
      aria-labelledby="device-filter-label"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  devices: { id: string; name: string }[]
  selectedDeviceId: string | null
}>()

const emit = defineEmits<{
  'update-device': [deviceId: string | null]
}>()

const ALL_DEVICES = '__all__'

type DeviceOption = { id: string; name: string }

const selected = computed({
  get: () => props.selectedDeviceId ?? ALL_DEVICES,
  set: (value: string) => emit('update-device', value === ALL_DEVICES ? null : value),
})

const deviceOptions = computed<DeviceOption[]>(() => [
  { id: ALL_DEVICES, name: 'Todos los dispositivos' },
  ...props.devices,
])
</script>

<style scoped>
.historial-filters {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  margin: 0 24px 24px;
  background: white;
  border: 1px solid var(--sh-border);
  border-radius: 12px;
}

.filters-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
  white-space: nowrap;
}

.device-select {
  max-width: 280px;
}

@media (max-width: 768px) {
  .historial-filters {
    padding: 12px 16px;
    margin: 0 16px 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .device-select {
    max-width: 100%;
  }
}
</style>
