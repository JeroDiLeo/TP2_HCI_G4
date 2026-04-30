<template>
  <section class="eco-stats" aria-labelledby="eco-stats-title">
    <div class="eco-stats__intro">
      <h2 id="eco-stats-title" class="eco-stats__title">Estadísticas del ecosistema</h2>
      <p class="eco-stats__subtitle">Resumen en tiempo real de tus propiedades conectadas.</p>
    </div>

    <div class="eco-stats__cards">
      <div class="eco-stats__card">
        <p class="eco-stats__label">Total de dispositivos</p>
        <p class="eco-stats__value eco-stats__value--primary">{{ totalDevices }}</p>
      </div>
      <div class="eco-stats__card">
        <p class="eco-stats__label">Energía ahorrada</p>
        <p class="eco-stats__value eco-stats__value--success">{{ energySaved }}%</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ totalDevices: number; energySaved: number }>()
</script>

<style scoped>
.eco-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px;
  background-color: #eef2ff;
  border-radius: 14px;
  font-family: 'Inter', sans-serif;
}

.eco-stats__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.eco-stats__subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 14px;
}

.eco-stats__cards {
  display: flex;
  gap: 16px;
}

.eco-stats__card {
  min-width: 180px;
  padding: 16px 24px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.eco-stats__label {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.eco-stats__value {
  margin: 6px 0 0;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.1;
}

.eco-stats__value--primary { color: #6366f1; }
.eco-stats__value--success { color: #10b981; }
</style>
