import { ref } from 'vue'

export function useResendCooldown(seconds = 30) {
  const cooldown = ref(0)

  function startCooldown() {
    if (cooldown.value > 0) return

    cooldown.value = seconds

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) clearInterval(interval)
    }, 1000)
  }

  return { cooldown, startCooldown }
}
