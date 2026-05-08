<template>
  <div
    class="weekday-selector"
    :role="editable ? 'group' : undefined"
    :aria-label="editable ? 'Días de repetición' : undefined"
  >
    <button
      v-for="day in DAYS"
      :key="day.key"
      type="button"
      class="weekday"
      :class="{
        'weekday--active':   isActive(day.key),
        'weekday--readonly': !editable,
      }"
      :role="editable ? 'checkbox' : undefined"
      :aria-checked="editable ? String(isActive(day.key)) : undefined"
      :aria-label="editable ? `${day.full}${isActive(day.key) ? ' (activo)' : ''}` : undefined"
      :tabindex="editable ? 0 : -1"
      :disabled="!editable"
      @click="editable && toggle(day.key)"
      @keydown="onKeydown($event, day.key)"
    >
      {{ day.label }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  editable:   { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const DAYS = [
  { key: 'lun', label: 'L', full: 'Lunes' },
  { key: 'mar', label: 'M', full: 'Martes' },
  { key: 'mie', label: 'M', full: 'Miércoles' },
  { key: 'jue', label: 'J', full: 'Jueves' },
  { key: 'vie', label: 'V', full: 'Viernes' },
  { key: 'sab', label: 'S', full: 'Sábado' },
  { key: 'dom', label: 'D', full: 'Domingo' },
]

const value = computed(() => props.modelValue ?? [])

function isActive(key) {
  return value.value.includes(key)
}

function toggle(key) {
  const next = isActive(key)
    ? value.value.filter(d => d !== key)
    : [...value.value, key]
  emit('update:modelValue', next)
}

function onKeydown(e, key) {
  if (!props.editable) return
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    toggle(key)
  }
}
</script>

<style scoped>
.weekday-selector {
  display: flex;
  gap: 6px;
  width: 100%;
}

.weekday {
  flex: 1;
  padding: 8px 0;
  border-radius: 7px;
  border: 1px solid var(--sh-border);
  background: #ffffff;
  font-family: var(--sh-font);
  font-size: 11px;
  font-weight: 600;
  color: var(--sh-text-light);
  cursor: pointer;
  transition: background-color 150ms, color 150ms, border-color 150ms, box-shadow 150ms;
}
.weekday:hover:not(.weekday--active):not(:disabled) {
  border-color: var(--sh-text-muted);
  color: var(--sh-text-muted);
}
.weekday:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
.weekday--active {
  background: var(--sh-primary);
  color: #ffffff;
  border-color: var(--sh-primary);
  box-shadow: 0 2px 4px rgba(99, 102, 241, .25);
}
.weekday--readonly {
  cursor: default;
}
.weekday:disabled {
  cursor: default;
}
</style>
