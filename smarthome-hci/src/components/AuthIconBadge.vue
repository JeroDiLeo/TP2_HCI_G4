<template>
  <div
    class="auth-icon-badge"
    :style="{ backgroundColor: bgColor }"
    aria-hidden="true"
  >
    <v-icon :icon="icon" size="32" :color="iconColor" />
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  iconColor: {
    type: String,
    default: '#6366F1',
  },
  bgColor: {
    type: String,
    default: 'rgba(99, 102, 241, 0.10)',
  },
})
</script>

<style scoped>
.auth-icon-badge {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
