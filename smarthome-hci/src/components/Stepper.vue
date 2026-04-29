<template>
  <div
    class="stepper"
    role="progressbar"
    :aria-valuenow="currentStep"
    aria-valuemin="1"
    :aria-valuemax="steps.length"
    aria-label="Progreso del registro"
  >
    <div class="stepper__track">
      <template v-for="(step, index) in steps" :key="index">

        <div class="stepper__step">
          <div
            class="stepper__circle"
            :class="{
              'stepper__circle--active': currentStep === index + 1,
              'stepper__circle--completed': currentStep > index + 1,
            }"
          >
            <v-icon v-if="currentStep > index + 1" icon="mdi-check" size="18" />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span
            class="stepper__label"
            :class="{
              'stepper__label--active': currentStep === index + 1,
              'stepper__label--completed': currentStep > index + 1,
            }"
          >{{ step }}</span>
        </div>

        <div
          v-if="index < steps.length - 1"
          class="stepper__line"
          :class="{ 'stepper__line--reached': currentStep > index + 1 }"
        />

      </template>
    </div>
  </div>
</template>

<script setup>
defineProps({
  steps: {
    type: Array,
    required: true,
  },
  currentStep: {
    type: Number,
    required: true,
  },
})
</script>

<style scoped>
.stepper {
  width: 100%;
}

.stepper__track {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.stepper__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

/* ── Círculo ── */
.stepper__circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: background-color 0.25s, border-color 0.25s, box-shadow 0.25s;
  border: 2px solid #CBD5E1;
  background-color: #ffffff;
  color: #94A3B8;
}

.stepper__circle--active {
  background-color: #6366F1;
  border-color: #6366F1;
  color: #ffffff;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.18);
}

.stepper__circle--completed {
  background-color: #6366F1;
  border-color: #6366F1;
  color: #ffffff;
}

/* ── Label ── */
.stepper__label {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  font-family: 'Inter', sans-serif;
  color: #64748B;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
}

.stepper__label--active {
  color: #0F172A;
  font-weight: 600;
}

.stepper__label--completed {
  color: #0F172A;
  font-weight: 500;
}

/* ── Línea conectora ── */
/* margin-top: 19px centra la línea de 2px con los círculos de 40px: (40 - 2) / 2 = 19 */
.stepper__line {
  flex: 1;
  height: 2px;
  background-color: #E2E8F0;
  margin-top: 19px;
  min-width: 80px;
  max-width: 140px;
  transition: background-color 0.3s ease;
}

.stepper__line--reached {
  background-color: #6366F1;
}

/* ── Responsive ── */
@media (max-width: 767px) {
  .stepper__line {
    min-width: 48px;
  }
}
</style>
