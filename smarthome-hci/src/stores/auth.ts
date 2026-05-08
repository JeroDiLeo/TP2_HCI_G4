import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { loginUser, logoutUser, updateUserProfile } from '@/services/api/userApi'

export const useAuthStore = defineStore('auth', () => {
  const email = ref<string>(JSON.parse(localStorage.getItem('user') || 'null')?.email || '')
  const fullName = ref<string>(JSON.parse(localStorage.getItem('user') || 'null')?.name || '')
  const user = ref<Record<string, any> | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)

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

  async function login(credentials: { email: string; password: string }) {
    const data = await loginUser(credentials)
    user.value = data.user
    token.value = data.token
    email.value = data.user.email
    fullName.value = data.user.name || ''
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
    return data
  }

  function loginAs(emailValue: string, nameValue = '') {
    email.value = emailValue
    fullName.value = nameValue
  }

  async function logout() {
    await logoutUser()
    email.value = ''
    fullName.value = ''
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  async function updateProfile(name: string) {
    const userData = await updateUserProfile({ name })
    if (userData) {
      user.value = userData
      fullName.value = userData.name || ''
      localStorage.setItem('user', JSON.stringify(userData))
    }
    return userData
  }

  return { email, fullName, user, token, isAuthenticated, displayName, initial, login, loginAs, logout, updateProfile }
})
