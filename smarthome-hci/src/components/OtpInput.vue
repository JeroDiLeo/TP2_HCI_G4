<template>
  <div
    class="otp-input"
    role="group"
    aria-label="Código de verificación de 6 dígitos"
  >
    <input
      v-for="(digit, index) in digits"
      :key="index"
      :ref="el => { if (el) inputRefs[index] = el }"
      v-model="digits[index]"
      type="text"
      inputmode="numeric"
      maxlength="1"
      pattern="[0-9]"
      autocomplete="one-time-code"
      class="otp-input__box"
      :class="{ 'otp-input__box--filled': digit !== '' }"
      :aria-label="`Dígito ${index + 1} del código`"
      @keydown="(e) => handleKeydown(e, index)"
      @input="(e) => handleInput(e, index)"
      @paste="(e) => handlePaste(e, index)"
      @focus="(e) => e.target.select()"
    >
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  length: {
    type: Number,
    default: 6,
  },
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

// ── Estado ───────────────────────────────────────────────────
const digits = ref(Array(props.length).fill(''))
const inputRefs = ref([])

// ── Focus al montar ──────────────────────────────────────────
onMounted(() => {
  nextTick(() => {
    if (inputRefs.value[0]) inputRefs.value[0].focus()
  })
})

// ── Emitir valor actualizado ─────────────────────────────────
watch(digits, (newDigits) => {
  emit('update:modelValue', newDigits.join(''))
}, { deep: true })

// ── Manejar input ────────────────────────────────────────────
function handleInput(event, index) {
  const raw = event.target.value
  // Solo aceptar dígitos
  const digit = raw.replace(/\D/g, '').slice(-1)

  digits.value[index] = digit

  if (digit && index < props.length - 1) {
    nextTick(() => inputRefs.value[index + 1]?.focus())
  }
}

// ── Manejar teclas especiales ────────────────────────────────
function handleKeydown(event, index) {
  if (event.key === 'Backspace') {
    if (digits.value[index] !== '') {
      // Borrar el contenido del input actual
      digits.value[index] = ''
    } else if (index > 0) {
      // Input vacío: volver al anterior y borrar su contenido
      digits.value[index - 1] = ''
      nextTick(() => inputRefs.value[index - 1]?.focus())
    }
    event.preventDefault()
    return
  }

  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    inputRefs.value[index - 1]?.focus()
    return
  }

  if (event.key === 'ArrowRight' && index < props.length - 1) {
    event.preventDefault()
    inputRefs.value[index + 1]?.focus()
    return
  }

  // Bloquear todo lo que no sea dígito, Tab, Enter o teclas de control
  if (
    event.key !== 'Tab' &&
    event.key !== 'Enter' &&
    !event.ctrlKey &&
    !event.metaKey &&
    !/^[0-9]$/.test(event.key)
  ) {
    event.preventDefault()
  }
}

// ── Manejar paste ────────────────────────────────────────────
function handlePaste(event, index) {
  event.preventDefault()
  const pasted = (event.clipboardData || window.clipboardData)
    .getData('text')
    .replace(/\D/g, '')
    .slice(0, props.length)

  if (!pasted) return

  const newDigits = [...digits.value]
  let lastFilled = index

  for (let i = 0; i < pasted.length && index + i < props.length; i++) {
    newDigits[index + i] = pasted[i]
    lastFilled = index + i
  }

  digits.value = newDigits

  // Focus al último relleno o al siguiente disponible
  const focusTarget = Math.min(lastFilled + 1, props.length - 1)
  nextTick(() => inputRefs.value[focusTarget]?.focus())
}

// ── Reset externo (watcher en modelValue '') ─────────────────
watch(() => props.modelValue, (val) => {
  if (val === '') {
    digits.value = Array(props.length).fill('')
    nextTick(() => inputRefs.value[0]?.focus())
  }
})
</script>

<style scoped>
.otp-input {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: nowrap;
}

.otp-input__box {
  width: 56px;
  height: 64px;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  background-color: #ffffff;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #0F172A;
  outline: none;
  caret-color: #6366F1;
  transition: border-color 0.15s, box-shadow 0.15s;
  /* Quitar flechas en inputs numéricos */
  -moz-appearance: textfield;
  appearance: textfield;
}

.otp-input__box::-webkit-outer-spin-button,
.otp-input__box::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.otp-input__box:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.otp-input__box--filled {
  border-color: #6366F1;
}

/* ── Responsive ── */
@media (max-width: 479px) {
  .otp-input {
    gap: 0.5rem;
  }

  .otp-input__box {
    width: 44px;
    height: 54px;
    font-size: 1.25rem;
    border-radius: 10px;
  }
}

@media (max-width: 359px) {
  .otp-input {
    gap: 0.375rem;
  }

  .otp-input__box {
    width: 38px;
    height: 48px;
    font-size: 1.1rem;
  }
}
</style>
