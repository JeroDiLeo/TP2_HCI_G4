<template>
  <div class="stats-card" role="group" :aria-label="label">
    <div class="stats-card__icon-wrap" aria-hidden="true">
      <v-icon :icon="icon" size="24" aria-hidden="true" />
    </div>
    <div class="stats-card__body">
      <span class="stats-card__value">{{ value }}</span>
      <span class="stats-card__label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon:  { type: String,           required: true },
  value: { type: [String, Number], required: true },
  label: { type: String,           required: true },
})
</script>

<style scoped>
.stats-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  border-radius: 14px;
  padding: 20px 24px;
  border: 1px solid var(--sh-border);
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
  flex: 1;
  animation: card-in 260ms cubic-bezier(.4,0,.2,1) both;
}

.stats-card__icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stats-card__value {
  font-size: 22px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1;
  font-family: 'Inter', sans-serif;
}

.stats-card__label {
  font-size: 13px;
  color: var(--sh-text-muted);
  font-family: 'Inter', sans-serif;
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0);   }
}

</style>
