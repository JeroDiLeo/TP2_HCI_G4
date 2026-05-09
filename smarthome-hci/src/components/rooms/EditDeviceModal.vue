<template>
  <v-dialog :model-value="open" width="440" @update:model-value="onDialogUpdate">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="edit-device-title">

      <button class="modal__close" type="button" aria-label="Cerrar" @click="handleClose">
        <v-icon icon="mdi-close" size="20" aria-hidden="true" />
      </button>

      <div class="modal__header">
        <h2 id="edit-device-title" class="modal__title">Editar dispositivo</h2>
        <p class="modal__subtitle">Modificá el nombre del dispositivo.</p>
      </div>

      <div class="modal__body">
        <div class="field">
          <label for="device-name" class="field__label">
            Nombre
            <span class="field__required" aria-hidden="true">*</span>
          </label>
          <input
            id="device-name"
            ref="nameInputRef"
            v-model="form.name"
            type="text"
            class="field__input"
            :class="{ 'field__input--error': errors.name }"
            placeholder="Nombre del dispositivo"
            maxlength="50"
            autocomplete="off"
            :aria-describedby="errors.name ? 'device-name-error' : undefined"
            :aria-invalid="!!errors.name"
            @blur="validateName"
            @keyup.enter="handleSave"
          />
          <p v-if="errors.name" id="device-name-error" class="field__error" role="alert">
            <v-icon icon="mdi-alert-circle-outline" size="14" aria-hidden="true" />
            {{ errors.name }}
          </p>
        </div>
      </div>

      <div class="modal__footer">
        <button type="button" class="btn btn--ghost" @click="handleClose">Cancelar</button>
        <button
          type="button"
          class="btn btn--primary"
          :disabled="!isValid || saving"
          @click="handleSave"
        >
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>

    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { RoomDevice } from '@/types/rooms'
import { useDevicesStore } from '@/stores/devices'

const props = defineProps<{ open: boolean; device: RoomDevice | null }>()
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()

const devicesStore = useDevicesStore()

const nameInputRef = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const form = ref({ name: '' })
const errors = ref({ name: '' })

const isValid = computed(() => form.value.name.trim().length >= 1 && !errors.value.name)

function validateName() {
  const n = form.value.name.trim()
  if (!n) errors.value.name = 'El nombre es obligatorio.'
  else if (n.length < 1) errors.value.name = 'El nombre debe tener al menos 1 carácter.'
  else errors.value.name = ''
}

function handleClose() {
  emit('update:open', false)
}

function onDialogUpdate(val: boolean) {
  if (!val) handleClose()
}

async function handleSave() {
  validateName()
  if (!isValid.value || !props.device) return
  saving.value = true
  try {
    await devicesStore.updateDevice(String(props.device.id), { name: form.value.name.trim() })
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}

watch(() => props.open, (val) => {
  if (val && props.device) {
    form.value.name = props.device.name
    errors.value.name = ''
    nextTick(() => nameInputRef.value?.focus())
  }
})
</script>

<style scoped>
.modal {
  background: var(--sh-bg, #ffffff);
  border-radius: 16px;
  border: 1px solid var(--sh-border, #e2e8f0);
  box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 24px 48px -12px rgba(15,23,42,.18);
  padding: 32px;
  position: relative;
  font-family: var(--sh-font, 'Inter', sans-serif);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.modal__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sh-text-muted, #64748b);
  transition: background-color 150ms;
}
.modal__close:hover { background: var(--sh-primary-light, #eef2ff); }
.modal__close:focus-visible { outline: 2px solid var(--sh-primary, #6366f1); outline-offset: 2px; }

.modal__header { display: flex; flex-direction: column; gap: 6px; }
.modal__title { margin: 0; font-size: 20px; font-weight: 700; color: var(--sh-text-main, #0f172a); }
.modal__subtitle { margin: 0; font-size: 14px; color: var(--sh-text-muted, #64748b); }

.modal__body { display: flex; flex-direction: column; gap: 16px; }

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--sh-border, #e2e8f0);
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field__label { font-size: 13px; font-weight: 600; color: var(--sh-text-main, #0f172a); }
.field__required { color: var(--sh-error, #ef4444); margin-left: 2px; }
.field__input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--sh-border, #e2e8f0);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: var(--sh-text-main, #0f172a);
  background: #ffffff;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}
.field__input:focus { border-color: var(--sh-primary, #6366f1); box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
.field__input--error { border-color: var(--sh-error, #ef4444); }
.field__error { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--sh-error, #ef4444); margin: 0; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 150ms;
  border: none;
}
.btn:focus-visible { outline: 2px solid var(--sh-primary, #6366f1); outline-offset: 2px; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn--primary { background: var(--sh-primary, #6366f1); color: #fff; }
.btn--primary:hover:not(:disabled) { background: #4f46e5; }
.btn--ghost { background: transparent; border: 1px solid var(--sh-border, #e2e8f0); color: var(--sh-text-main, #0f172a); }
.btn--ghost:hover { background: #f8fafc; }
</style>
