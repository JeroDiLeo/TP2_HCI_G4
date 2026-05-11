<template>
  <ul
    v-if="items.length > 0"
    class="action-list"
    aria-label="Acciones configuradas"
  >
    <li
      v-for="(action, idx) in items"
      :key="idx"
      class="action-item"
    >
      <span class="action-item__number" aria-hidden="true">{{ idx + 1 }}</span>
      <div
        class="action-item__icon"
        :style="{ background: action.visual.bg, color: action.visual.fg }"
        aria-hidden="true"
      >
        <v-icon :icon="action.visual.icon" size="18" />
      </div>
      <div class="action-item__info">
        <p class="action-item__device">{{ action.device || 'Dispositivo' }}</p>
        <p v-if="action.detail" class="action-item__detail">{{ action.detail }}</p>
      </div>
      <button
        type="button"
        class="action-item__delete"
        :aria-label="`Eliminar acción ${action.device}`"
        @click="emit('remove', idx)"
      >
        <v-icon icon="mdi-trash-can-outline" size="14" aria-hidden="true" />
      </button>
    </li>
  </ul>

  <div v-else class="empty-state" role="status">
    <div class="empty-state__icon-wrap" aria-hidden="true">
      <v-icon icon="mdi-flash-off-outline" size="40" />
    </div>
    <p class="empty-state__title">Aún no hay acciones</p>
    <p class="empty-state__subtitle">{{ emptySubtitle }}</p>
  </div>

  <button
    type="button"
    class="add-action-trigger"
    @click="emit('add')"
  >
    <span class="add-action-trigger__icon" aria-hidden="true">
      <v-icon icon="mdi-plus" size="18" />
    </span>
    <span class="add-action-trigger__body">
      <span class="add-action-trigger__title">Añadir acción</span>
      <span class="add-action-trigger__sub">Elegí dispositivo, acción y valor</span>
    </span>
    <v-icon icon="mdi-chevron-right" size="18" class="add-action-trigger__chevron" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
import type { RoutineActionDisplayItem } from '@/utils/routineActionDisplay'

withDefaults(
  defineProps<{
    emptySubtitle?: string
    items: RoutineActionDisplayItem[]
  }>(),
  {
    emptySubtitle: 'Tocá "Añadir acción" para empezar',
  },
)

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'remove', index: number): void
}>()
</script>

<style scoped>
.action-list { list-style: none; margin: 0; padding: 0; }
.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--sh-border);
  border-radius: 12px;
  margin-bottom: 8px;
  transition: border-color 150ms;
}
.action-item:last-child { margin-bottom: 0; }
.action-item:hover { border-color: var(--sh-text-muted); }
.action-item:hover .action-item__delete,
.action-item:focus-within .action-item__delete { opacity: 1; }
.action-item__number {
  width: 24px; height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #F1F5F9;
  color: var(--sh-text-light);
  font-size: 11px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.action-item__icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.action-item__info { flex: 1; min-width: 0; }
.action-item__device {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--sh-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.action-item__detail {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--sh-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.action-item__delete {
  width: 28px; height: 28px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--sh-text-light);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0;
  flex-shrink: 0;
  transition: opacity 150ms, background-color 150ms, color 150ms;
}
.action-item__delete:hover { background: rgba(239, 68, 68, .12); color: var(--sh-error); }

.empty-state { text-align: center; padding: 24px 16px; }
.empty-state__icon-wrap {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: #F1F5F9;
  color: var(--sh-text-light);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto;
}
.empty-state__title { margin: 12px 0 0; font-size: 14px; font-weight: 600; color: var(--sh-text-main); }
.empty-state__subtitle { margin: 4px 0 0; font-size: 12px; color: var(--sh-text-muted); }

.add-action-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px dashed var(--sh-border);
  background: #ffffff;
  cursor: pointer;
  font-family: var(--sh-font);
  text-align: left;
  transition: border-color 150ms, background-color 150ms, color 150ms;
}
.add-action-trigger:hover {
  border-color: var(--sh-primary);
  background: var(--sh-primary-light);
}
.add-action-trigger:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.add-action-trigger__icon {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: #F1F5F9;
  color: var(--sh-text-muted);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background-color 150ms, color 150ms;
}
.add-action-trigger:hover .add-action-trigger__icon {
  background: var(--sh-primary);
  color: #fff;
}
.add-action-trigger__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.add-action-trigger__title { font-size: 13px; font-weight: 700; color: var(--sh-text-main); }
.add-action-trigger__sub { font-size: 11px; color: var(--sh-text-light); }
.add-action-trigger__chevron { color: var(--sh-text-light); flex-shrink: 0; }
.add-action-trigger:hover .add-action-trigger__chevron { color: var(--sh-primary); }
</style>
