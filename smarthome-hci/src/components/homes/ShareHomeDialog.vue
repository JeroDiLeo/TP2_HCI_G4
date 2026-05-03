<template>
  <v-dialog v-model="internalOpen" width="560" @update:model-value="onDialogUpdate">
    <div
      class="share-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <!-- Close button -->
      <button
        class="modal-close"
        type="button"
        aria-label="Cerrar"
        @click="close"
      >
        <v-icon icon="mdi-close" size="20" aria-hidden="true" />
      </button>

      <!-- Header -->
      <div class="sm__header">
        <h2 id="share-modal-title" class="sm__title">Compartir hogar</h2>
        <p class="sm__subtitle">Invitá a otros usuarios a gestionar este hogar.</p>
      </div>

      <!-- Section 1: Add user -->
      <div class="sm__section">
        <label for="share-email" class="field__label">
          Agregar por email
          <span class="field__required" aria-hidden="true">*</span>
        </label>
        <div class="share-input-row">
          <input
            id="share-email"
            v-model="emailInput"
            type="email"
            class="field__input"
            :class="{ 'field__input--error': emailError }"
            placeholder="ejemplo@mail.com"
            :disabled="shareLoading"
            autocomplete="off"
            @keyup.enter="submitShare"
          />
          <button
            type="button"
            class="btn btn--primary"
            :disabled="shareLoading || !emailInput.trim()"
            @click="submitShare"
          >
            {{ shareLoading ? 'Enviando...' : 'Compartir' }}
          </button>
        </div>
        <p v-if="emailError" class="field__error" role="alert">
          <v-icon icon="mdi-alert-circle-outline" size="14" aria-hidden="true" />
          {{ emailError }}
        </p>
      </div>

      <!-- Divider -->
      <hr class="sm__divider" />

      <!-- Section 2: Shared users list -->
      <div class="sm__section">
        <p class="sm__list-title">
          Compartido con ({{ sharedUsers.length + (ownerUser ? 1 : 0) }})
        </p>

        <!-- Loading -->
        <div v-if="listLoading" class="sm__loading" aria-label="Cargando usuarios">
          <v-progress-circular indeterminate color="#6366f1" size="28" />
        </div>

        <!-- Empty state -->
        <p v-else-if="sharedUsers.length === 0 && !ownerUser" class="sm__empty">
          Todavía no compartiste este hogar.
        </p>

        <!-- List -->
        <ul v-else class="sm__user-list" role="list">
          <!-- Owner row (if current user is the owner) -->
          <li v-if="ownerUser" class="sm__user-item">
            <div class="sm__avatar" aria-hidden="true">
              {{ avatarInitial(ownerUser.name) }}
            </div>
            <div class="sm__user-info">
              <span class="sm__user-name">{{ ownerUser.name }}</span>
              <span class="sm__user-email">{{ ownerUser.email }}</span>
            </div>
            <span class="sm__role-badge sm__role-badge--owner">Dueño</span>
          </li>
          <!-- Shared members -->
          <li
            v-for="user in sharedUsers"
            :key="user.id"
            class="sm__user-item"
          >
            <div class="sm__avatar" aria-hidden="true">
              {{ avatarInitial(user.name) }}
            </div>
            <div class="sm__user-info">
              <span class="sm__user-name">{{ user.name }}</span>
              <span class="sm__user-email">{{ user.email }}</span>
            </div>
            <span class="sm__role-badge sm__role-badge--member">Miembro</span>
          </li>
        </ul>
      </div>

      <!-- Footer -->
      <div class="sm__footer">
        <button type="button" class="btn btn--ghost" @click="close">
          Cerrar
        </button>
      </div>
    </div>
  </v-dialog>

  <!-- Snackbar -->
  <v-snackbar
    v-model="snackbar"
    timeout="4000"
    location="bottom center"
    content-class="hc-snackbar"
    :class="`hc-snackbar--${snackbarColor}`"
  >
    <div class="hc-snackbar__inner">
      <v-icon
        :icon="snackbarColor === 'error' ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline'"
        size="18"
        class="hc-snackbar__icon"
        aria-hidden="true"
      />
      <span>{{ snackbarText }}</span>
    </div>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getSharedUsers, shareHome } from '@/services/api/homeApi'

const props = defineProps<{ homeId: string; open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', val: boolean): void }>()

const router = useRouter()
const authStore = useAuthStore()

const internalOpen = ref(false)

// Email input state
const emailInput = ref('')
const emailError = ref('')
const shareLoading = ref(false)

// List state
const sharedUsers = ref<{ id: string; email: string; name: string; sharedAt: string }[]>([])
const listLoading = ref(false)

// Snackbar
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

function showSnackbar(text: string, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

function handleApiError(err: any) {
  if (err.status === 401) {
    authStore.logout()
    router.push('/login')
  } else if (err.status === 404) {
    showSnackbar('Hogar no encontrado', 'error')
    close()
  } else {
    showSnackbar(err.message || 'Error inesperado', 'error')
  }
}

// Open/close sync
watch(() => props.open, async (val) => {
  internalOpen.value = val
  if (val) {
    emailInput.value = ''
    emailError.value = ''
    await fetchSharedUsers()
  }
})

function onDialogUpdate(val: boolean) {
  if (!val) close()
}

function close() {
  emit('update:open', false)
}

// Owner info — if current user is NOT in the shared list, they are the owner
const ownerUser = ref<{ name: string; email: string } | null>(null)

async function fetchSharedUsers() {
  listLoading.value = true
  ownerUser.value = null
  try {
    const data = await getSharedUsers(props.homeId)
    sharedUsers.value = data

    // Check if the logged-in user is in the shared list
    const authUser = authStore.user
    const currentEmail = authUser?.email || authStore.email
    const isCurrentUserShared = data.some((u: any) => u.email === currentEmail)

    if (!isCurrentUserShared && currentEmail) {
      // Current user is the owner (they can access the home but weren't shared it)
      ownerUser.value = {
        name: authStore.displayName,
        email: currentEmail,
      }
    }
  } catch (err: any) {
    handleApiError(err)
  } finally {
    listLoading.value = false
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function submitShare() {
  emailError.value = ''
  const email = emailInput.value.trim()

  if (!email) {
    emailError.value = 'El email es obligatorio.'
    return
  }
  if (!isValidEmail(email)) {
    emailError.value = 'Ingresá un email válido.'
    return
  }

  shareLoading.value = true
  try {
    const added = await shareHome(props.homeId, email)
    // La API puede devolver el usuario agregado o la lista actualizada
    if (Array.isArray(added)) {
      sharedUsers.value.push(...added)
    } else if (added && typeof added === 'object') {
      sharedUsers.value.push(added)
    }
    emailInput.value = ''
    showSnackbar('Compartido con éxito')
  } catch (err: any) {
    if (err.status === 409) {
      emailError.value = 'Este hogar ya está compartido con ese usuario.'
    } else if (err.status === 400) {
      emailError.value = err.message
    } else {
      handleApiError(err)
    }
  } finally {
    shareLoading.value = false
  }
}

// Everyone returned by GET /homes/{homeId}/share is a member, not the owner
function isOwner(_user: { id: string; email: string }): boolean {
  return false
}

function avatarInitial(name: string): string {
  return name ? name.charAt(0).toUpperCase() : '?'
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-AR')
}
</script>

<style scoped>
/* ── Modal layout ──────────────────────────────────── */
.share-modal {
  position: relative;
  background: var(--sh-bg);
  border-radius: 16px;
  border: 1px solid var(--sh-border);
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04), 0 24px 48px -12px rgba(15, 23, 42, .18);
  padding: 40px 40px 32px;
  font-family: var(--sh-font);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sm__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--sh-text-main);
  line-height: 1.2;
}
.sm__subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--sh-text-muted);
  line-height: 1.5;
}

.sm__section { display: flex; flex-direction: column; gap: 8px; }
.sm__divider { border: none; border-top: 1px solid var(--sh-border); margin: 0; }

.share-input-row { display: flex; gap: 10px; align-items: center; }
.share-input-row .field__input { flex: 1; min-width: 0; }

/* ── Share-specific btn override ───────────────────── */
.btn--primary { padding: 0 20px; font-size: 14px; }

/* ── User list ─────────────────────────────────────── */
.sm__list-title { margin: 0; font-size: 13px; font-weight: 600; color: var(--sh-text-main); }
.sm__loading { display: flex; justify-content: center; padding: 16px 0; }
.sm__empty { margin: 0; font-size: 14px; color: var(--sh-text-light); padding: 12px 0; }

.sm__user-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 220px;
  overflow-y: auto;
}

.sm__user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--sh-border);
  background: #f8fafc;
}

.sm__avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sm__user-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.sm__user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--sh-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sm__user-email {
  font-size: 12px;
  color: var(--sh-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sm__role-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}
.sm__role-badge--owner { background: #FEF3C7; color: #92400E; }
.sm__role-badge--member { background: var(--sh-primary-light); color: var(--sh-primary-dark); }

/* Footer */
.sm__footer {
  padding-top: 8px;
  border-top: 1px solid var(--sh-border);
  display: flex;
  justify-content: flex-end;
}
</style>
