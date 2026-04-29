import { ref } from 'vue'
/*
// maneja el cooldown del boton reenviar codigo
// arranca en 0, cuando lo llamas se pone en 'seconds' y baja 1 por segundo
// mientras sea mayor a 0 el boton queda deshabilitado
*/
export function useResendCooldown(seconds = 30) {
  const cooldown = ref(0)

  function startCooldown() {
    if (cooldown.value > 0) return
    cooldown.value = seconds
    const interval = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) clearInterval(interval)
    }, 1000)
  }

  return { cooldown, startCooldown }
}
