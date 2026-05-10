<template>
  <div class="log-item" tabindex="0">
    <div class="log-item__icon" aria-hidden="true">
      <i :class="['mdi', deviceIcon]"></i>
    </div>

    <div class="log-item__content">
      <span class="log-item__action">{{ actionLabel }}</span>
      <span class="log-item__meta">
        {{ entry.deviceName }}
        <span v-if="entry.roomName" class="log-item__room">· {{ entry.roomName }}</span>
      </span>
    </div>

    <time
      class="log-item__time"
      :datetime="entry.timestamp"
      :title="absoluteTime"
    >{{ relativeTime }}</time>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LogEntry } from '@/types/logs'
import { formatLogAction, formatRelativeTime, formatAbsoluteTime } from '@/utils/logFormatter'
import { getDeviceIcon } from '@/utils/deviceIcons'

const props = defineProps<{
  entry: LogEntry
  catalogDescription?: string
}>()

const deviceIcon   = computed(() => getDeviceIcon(props.entry.deviceType, 'mdi-devices'))
const actionLabel  = computed(() => formatLogAction(props.entry, props.catalogDescription))
const relativeTime = computed(() => formatRelativeTime(props.entry.timestamp))
const absoluteTime = computed(() => formatAbsoluteTime(props.entry.timestamp))
</script>

<style scoped>
.log-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: white;
  border: 1px solid var(--sh-border);
  border-radius: 10px;
  transition: background-color 0.15s;
}

.log-item:hover,
.log-item:focus-visible {
  background: #f8fafc;
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

.log-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #EDE9FE;
  color: #7C3AED;
  font-size: 20px;
  flex-shrink: 0;
}

.log-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.log-item__action {
  font-size: 14px;
  font-weight: 600;
  color: var(--sh-text-main);
  font-family: var(--sh-font);
  white-space: normal;
  overflow-wrap: anywhere;
}

.log-item__meta {
  font-size: 13px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
}

.log-item__room {
  color: var(--sh-text-muted);
}

.log-item__time {
  font-size: 12px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
  white-space: nowrap;
  flex-shrink: 0;
  cursor: default;
}

@media (max-width: 768px) {
  .log-item {
    gap: 12px;
    padding: 12px;
  }

  .log-item__icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
}
</style>
