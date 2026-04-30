<template>
  <section class="empty-state" aria-labelledby="empty-state-title">
    <div class="empty-state__icon-wrap" aria-hidden="true">
      <v-icon icon="mdi-home-plus-outline" size="64" class="empty-state__icon" />
    </div>

    <h2 id="empty-state-title" class="empty-state__title">
      Aún no tenés hogares registrados
    </h2>

    <p class="empty-state__desc">
      Empezá agregando tu primer hogar para comenzar a gestionar tus dispositivos
      inteligentes, habitaciones y rutinas desde un solo lugar.
    </p>

    <button
      type="button"
      class="empty-state__cta"
      aria-label="Agregar mi primer hogar"
      @click="$emit('add')"
    >
      <v-icon icon="mdi-plus" size="20" aria-hidden="true" />
      <span>Agregar mi primer hogar</span>
    </button>

  </section>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'add'): void }>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80px 32px;
  background-color: #ffffff;
  border: 2px dashed #e2e8f0;
  border-radius: 14px;
  font-family: 'Inter', sans-serif;
}

.empty-state__icon-wrap {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state__icon {
  color: #94a3b8;
}

.empty-state__title {
  margin: 24px 0 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.empty-state__desc {
  max-width: 480px;
  margin: 12px 0 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
}

.empty-state__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 28px;
  padding: 0 24px;
  height: 48px;
  background-color: #6366f1;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 15px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.15s, transform 0.1s;
}

.empty-state__cta:hover { background-color: #4f46e5; }
.empty-state__cta:active { transform: scale(0.99); }
.empty-state__cta:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 3px;
}
</style>
