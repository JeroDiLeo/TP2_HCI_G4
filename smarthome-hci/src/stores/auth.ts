import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const email = ref<string>('')
  const fullName = ref<string>('')

  const isAuthenticated = computed(() => !!email.value)

  const displayName = computed(() => {
    if (fullName.value) return fullName.value
    if (!email.value) return 'Usuario'
    const local = email.value.split('@')[0]
    return local
      .split(/[._-]+/)
      .filter(Boolean)
      .map(p => p[0].toUpperCase() + p.slice(1))
      .join(' ')
  })

  const initial = computed(() =>
    (displayName.value.trim()[0] ?? 'U').toUpperCase()
  )

  function loginAs(emailValue: string, nameValue = '') {
    email.value = emailValue
    fullName.value = nameValue
  }

  function logout() {
    email.value = ''
    fullName.value = ''
  }

  return { email, fullName, isAuthenticated, displayName, initial, loginAs, logout }
})
