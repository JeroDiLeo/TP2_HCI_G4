<template>
  <div class="view-toggle" role="group" aria-label="Modo de visualización">
    <button
      type="button"
      class="view-toggle__btn"
      :class="{ 'view-toggle__btn--active': modelValue === 'grid' }"
      aria-label="Vista en cuadrícula"
      :aria-pressed="String(modelValue === 'grid')"
      @click="emit('update:modelValue', 'grid')"
    >
      <v-icon icon="mdi-view-grid-outline" size="18" aria-hidden="true" />
    </button>
    <button
      type="button"
      class="view-toggle__btn"
      :class="{ 'view-toggle__btn--active': modelValue === 'list' }"
      aria-label="Vista en lista"
      :aria-pressed="String(modelValue === 'list')"
      @click="emit('update:modelValue', 'list')"
    >
      <v-icon icon="mdi-view-list-outline" size="18" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup>
defineProps({ modelValue: { type: String, default: 'grid' } })
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.view-toggle {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: 1px solid var(--sh-border);
  border-radius: 8px;
  padding: 2px;
  background: #ffffff;
}

.view-toggle__btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--sh-text-muted);
  cursor: pointer;
  transition: background-color 150ms cubic-bezier(.4,0,.2,1), color 150ms cubic-bezier(.4,0,.2,1);
}

.view-toggle__btn:hover:not(.view-toggle__btn--active) {
  background-color: #f1f5f9;
  color: var(--sh-text-main);
}

.view-toggle__btn:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 1px;
}

.view-toggle__btn--active {
  background-color: var(--sh-primary-light);
  color: var(--sh-primary);
}

</style>
