<template>
  <div class="event-item-wrapper">
    <div class="event-item">
      <!-- Icon -->
      <div class="event-item__icon-wrapper">
        <div :class="['event-item__icon', `icon-${getIconColor()}`]">
          <i :class="['mdi', event.icon]"></i>
        </div>
      </div>

      <!-- Content -->
      <div class="event-item__content">
        <!-- Main action line -->
        <div class="event-item__main">
          <span class="event-item__action">
            <strong>{{ event.action }}</strong>
            {{ event.device }}
          </span>
          <span v-if="event.room" class="event-item__room">{{ event.room }}</span>
        </div>

        <!-- Status/details line -->
        <div class="event-item__details">
          <span class="event-item__status">{{ event.status }}</span>
        </div>

        <!-- User info for routines -->
        <div v-if="event.user && !event.isRoutine" class="event-item__user">
          <div class="user-avatar">{{ event.user.charAt(0) }}</div>
          <span class="user-name">{{ event.user }}</span>
        </div>

        <!-- For routine execution, show sub-actions count with expand button -->
        <div v-if="event.isRoutine && event.actions" class="event-item__routine-info">
          <button
            class="expand-button"
            @click="isExpanded = !isExpanded"
            :aria-expanded="isExpanded"
          >
            <i :class="['mdi', isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right']"></i>
          </button>
          <i class="mdi mdi-play"></i>
          <span>{{ event.status }}</span>
        </div>
      </div>

      <!-- Status Badge and Time -->
      <div class="event-item__right">
        <span :class="['action-badge', `action-badge--${getActionType()}`]">
          <span class="action-badge__dot"></span>
          {{ event.actionType }}
        </span>
        <span class="event-item__time">{{ event.time }}</span>
      </div>
    </div>

    <!-- Expanded sub-actions list -->
    <div v-if="event.isRoutine && event.actions && isExpanded" class="sub-actions">
      <div
        v-for="(action, index) in event.actions"
        :key="index"
        class="sub-action-item"
      >
        <div class="sub-action-item__icon">
          <i :class="['mdi', action.icon]"></i>
        </div>
        <div class="sub-action-item__content">
          <div class="sub-action-item__main">
            <span class="sub-action-item__text">
              <strong>{{ action.action }}</strong> {{ action.device }}
            </span>
            <span v-if="action.room" class="sub-action-item__room">{{ action.room }}</span>
          </div>
          <div class="sub-action-item__detail">{{ action.detail }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
})

const isExpanded = ref(false)

function getIconColor() {
  const actionType = (props.event.actionType || '').toLowerCase()
  if (actionType.includes('encendido')) return 'green'
  if (actionType.includes('apagado')) return 'gray'
  if (actionType.includes('ajuste')) return 'blue'
  if (actionType.includes('bloqueo')) return 'orange'
  if (actionType.includes('desbloqueo')) return 'purple'
  if (actionType.includes('apertura')) return 'blue'
  if (actionType.includes('cierre')) return 'gray'
  if (actionType === 'Rutina') return 'purple'
  return 'blue'
}

function getActionType() {
  const actionType = (props.event.actionType || '').toLowerCase()
  return actionType.replace(/\s+/g, '-')
}
</script>

<style scoped>
.event-item-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.event-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid var(--sh-border);
  border-radius: 10px;
  transition: background-color 0.2s;
}

.event-item:hover {
  background: #f8fafc;
}

.event-item__icon-wrapper {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
}

.event-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  font-size: 20px;
  color: white;
}

.icon-green {
  background: #EDE9FE;
  color: #7C3AED;
}

.icon-blue {
  background: #EDE9FE;
  color: #7C3AED;
}

.icon-purple {
  background: #EDE9FE;
  color: #7C3AED;
}

.icon-gray {
  background: #EDE9FE;
  color: #7C3AED;
}

.icon-orange {
  background: #EDE9FE;
  color: #7C3AED;
}

.event-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-item__main {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: baseline;
}

.event-item__action {
  font-size: 14px;
  color: var(--sh-text-main);
  font-family: var(--sh-font);
}

.event-item__room {
  font-size: 13px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
}

.event-item__details {
  display: flex;
  gap: 8px;
  align-items: center;
}

.event-item__status {
  font-size: 13px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
}

.event-item__user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--sh-primary);
  color: white;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  font-size: 12px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
}

.event-item__routine-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
  margin-top: 4px;
}

.event-item__routine-info i {
  font-size: 14px;
  color: #7C3AED;
}

.expand-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #7C3AED;
  transition: transform 0.2s;
}

.expand-button:hover {
  transform: scale(1.1);
}

.sub-actions {
  background: #f8fafc;
  border: 1px solid var(--sh-border);
  border-top: none;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-action-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.sub-action-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #EDE9FE;
  color: #7C3AED;
  font-size: 16px;
  flex-shrink: 0;
}

.sub-action-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sub-action-item__main {
  display: flex;
  gap: 12px;
  align-items: baseline;
  flex-wrap: wrap;
}

.sub-action-item__text {
  font-size: 13px;
  color: var(--sh-text-main);
  font-family: var(--sh-font);
}

.sub-action-item__room {
  font-size: 13px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
}

.sub-action-item__detail {
  font-size: 12px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
}

.event-item__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.action-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  font-family: var(--sh-font);
}

.action-badge__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.action-badge--encendido {
  background: #DCFCE7;
  color: #059669;
}

.action-badge--encendido .action-badge__dot {
  background: #059669;
}

.action-badge--apagado {
  background: #F3F4F6;
  color: #6B7280;
}

.action-badge--apagado .action-badge__dot {
  background: #6B7280;
}

.action-badge--ajuste {
  background: #DBEAFE;
  color: #0284C7;
}

.action-badge--ajuste .action-badge__dot {
  background: #0284C7;
}

.action-badge--bloqueo {
  background: #FED7AA;
  color: #D97706;
}

.action-badge--bloqueo .action-badge__dot {
  background: #D97706;
}

.action-badge--desbloqueo {
  background: #EDE9FE;
  color: #7C3AED;
}

.action-badge--desbloqueo .action-badge__dot {
  background: #7C3AED;
}

.action-badge--apertura {
  background: #DBEAFE;
  color: #0284C7;
}

.action-badge--apertura .action-badge__dot {
  background: #0284C7;
}

.action-badge--cierre {
  background: #F3F4F6;
  color: #6B7280;
}

.action-badge--cierre .action-badge__dot {
  background: #6B7280;
}

.action-badge--rutina {
  background: #EDE9FE;
  color: #7C3AED;
}

.action-badge--rutina .action-badge__dot {
  background: #7C3AED;
}

.event-item__time {
  font-size: 13px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
  font-weight: 500;
}

@media (max-width: 768px) {
  .event-item {
    flex-wrap: wrap;
    gap: 12px;
  }

  .event-item__icon-wrapper {
    order: 1;
  }

  .event-item__content {
    order: 2;
    flex-basis: 100%;
  }

  .event-item__right {
    order: 3;
    flex-basis: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
