import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getAllHomes, addHome as apiAddHome, updateHome as apiUpdateHome, deleteHome as apiDeleteHome, getHomeShareInfo } from '@/services/api/homeApi'
import { useAuthStore } from '@/stores/auth'

export interface SharedUser {
  id: string
  email: string
  name: string
  sharedAt: string
}

export interface Home {
  id: string
  name: string
  metadata: Record<string, unknown>
  sharedWith: SharedUser[]
  // TODO: rooms y devices se obtendrán de los endpoints /rooms y /devices en una próxima integración
  rooms: number
  devices: number
  image: string | null
  sharedByName: string | null
  sharedByEmail: string | null
  isOwner: boolean
}

interface UserSummary {
  id: string
  email: string
  name: string
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeEmail(value: unknown): string {
  return cleanText(value).toLowerCase()
}

function normalizeName(value: unknown): string {
  return cleanText(value).toLowerCase()
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = cleanText(value)
    if (text) return text
  }
  return ''
}

function userId(user: any): string {
  return firstText(user?.id, user?.userId, user?.uuid)
}

function userEmail(user: any): string {
  if (typeof user === 'string' && user.includes('@')) return normalizeEmail(user)
  return normalizeEmail(user?.email ?? user?.mail)
}

function userName(user: any): string {
  if (typeof user === 'string') return user
  const fullName = firstText(user?.name, user?.fullName, user?.displayName)
  if (fullName) return fullName

  const composedName = `${cleanText(user?.firstName)} ${cleanText(user?.lastName)}`.trim()
  return composedName || firstText(user?.email, user?.mail)
}

function summarizeUser(user: any): UserSummary {
  return {
    id: userId(user),
    email: userEmail(user),
    name: userName(user),
  }
}

function sameUser(a: UserSummary, b: UserSummary): boolean {
  if (a.email && b.email) return a.email === b.email
  if (a.id && b.id) return a.id === b.id
  if (a.name && b.name) return normalizeName(a.name) === normalizeName(b.name)
  return false
}

function differentUser(a: UserSummary, b: UserSummary): boolean {
  if (a.email && b.email) return a.email !== b.email
  if (a.id && b.id) return a.id !== b.id
  if (a.name && b.name) return normalizeName(a.name) !== normalizeName(b.name)
  return false
}

function currentUserSummary(authStore: ReturnType<typeof useAuthStore>): UserSummary {
  return {
    id: userId(authStore.user),
    email: normalizeEmail(authStore.user?.email || authStore.email),
    name: authStore.displayName,
  }
}

function homeAttribution(home: any) {
  const metadata = home.metadata ?? {}
  const owner = summarizeUser(
    home.owner ??
    home.createdBy ??
    home.creator ??
    home.user ??
    metadata.owner ??
    metadata.createdBy ??
    metadata.creator ??
    metadata.user
  )
  const sharedBy = summarizeUser(
    home.sharedBy ??
    home.sharedByUser ??
    metadata.sharedBy ??
    metadata.sharedByUser
  )

  owner.name = firstText(
    home.ownerName,
    home.createdByName,
    metadata.ownerName,
    metadata.createdByName,
    owner.name,
  )
  owner.email = normalizeEmail(firstText(
    home.ownerEmail,
    home.createdByEmail,
    metadata.ownerEmail,
    metadata.createdByEmail,
    owner.email,
  ))

  sharedBy.name = firstText(
    home.sharedByName,
    metadata.sharedByName,
    sharedBy.name,
  )
  sharedBy.email = normalizeEmail(firstText(
    home.sharedByEmail,
    metadata.sharedByEmail,
    sharedBy.email,
  ))

  return { owner, sharedBy }
}

function sharedByFromHome(home: any, currentUser: UserSummary): UserSummary | null {
  const { owner, sharedBy } = homeAttribution(home)

  if ((sharedBy.name || sharedBy.email) && differentUser(sharedBy, currentUser)) {
    return sharedBy
  }
  if ((owner.name || owner.email) && differentUser(owner, currentUser)) {
    return owner
  }
  return null
}

function isExplicitOwner(home: any, currentUser: UserSummary): boolean | null {
  const { owner } = homeAttribution(home)

  if ((owner.email || owner.id) && sameUser(owner, currentUser)) return true
  if ((owner.email || owner.id) && differentUser(owner, currentUser)) return false

  const role = firstText(home.role, home.permission, home.access, home.metadata?.role).toLowerCase()
  if (['owner', 'dueño', 'dueno', 'admin'].some(token => role.includes(token))) return true
  if (['shared', 'member', 'guest', 'invitado', 'miembro'].some(token => role.includes(token))) return false

  return null
}

function normalizeSharedUsers(users: any[]): SharedUser[] {
  return users.map(user => ({
    id: userId(user),
    email: userEmail(user),
    name: userName(user),
    sharedAt: firstText(user?.sharedAt, user?.createdAt, user?.date),
  }))
}

function mapApiHome(home: any, currentUser: UserSummary): Home {
  const sharedBy = sharedByFromHome(home, currentUser)
  const explicitOwner = isExplicitOwner(home, currentUser)

  return {
    ...home,
    sharedWith: Array.isArray(home.sharedWith) ? normalizeSharedUsers(home.sharedWith) : [],
    rooms: 0,
    devices: 0,
    image: home.metadata?.image ?? null,
    sharedByName: sharedBy?.name || sharedBy?.email || null,
    sharedByEmail: sharedBy?.email || null,
    isOwner: explicitOwner ?? !sharedBy,
  }
}

export const useHomesStore = defineStore('homes', () => {
  const homes = ref<Home[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const selectedHomeId = ref<string | null>(
    localStorage.getItem('selectedHomeId'),
  )

  const selectedHome = computed(
    () => homes.value.find(h => h.id === selectedHomeId.value) ?? null
  )

  function selectHome(id: string) {
    selectedHomeId.value = id
    localStorage.setItem('selectedHomeId', id)
  }

  async function fetchHomes() {
    loading.value = true
    error.value = null
    try {
      const authStore = useAuthStore()
      const currentUser = currentUserSummary(authStore)
      const data = await getAllHomes()
      const mapped = data.map((h: any) => mapApiHome(h, currentUser))
      homes.value = mapped

      // Para cada hogar, buscar usuarios compartidos y completar la atribución si la API la expone.
      const promises = mapped.map(async (h: any) => {
        try {
          const shareInfo = await getHomeShareInfo(h.id)
          const users = normalizeSharedUsers(shareInfo.users)
          const idx = homes.value.findIndex((home: any) => home.id === h.id)
          if (idx === -1) return

          const currentIsSharedUser = users.some(user => sameUser(summarizeUser(user), currentUser))
          const currentHome = homes.value[idx]
          const ownerFromShareInfo = summarizeUser(shareInfo.sharedBy ?? shareInfo.owner)
          const fallbackOwner = currentIsSharedUser
            ? users.find(user => !sameUser(summarizeUser(user), currentUser))
            : null
          const sharedBy = differentUser(ownerFromShareInfo, currentUser)
            ? ownerFromShareInfo
            : fallbackOwner
              ? summarizeUser(fallbackOwner)
              : sharedByFromHome(currentHome, currentUser)

          homes.value.splice(idx, 1, {
            ...currentHome,
            sharedWith: users,
            sharedByName: sharedBy?.name || sharedBy?.email || currentHome.sharedByName,
            sharedByEmail: sharedBy?.email || currentHome.sharedByEmail,
            isOwner: currentIsSharedUser ? false : currentHome.isOwner,
          })
        } catch (err: any) {
          const idx = homes.value.findIndex((home: any) => home.id === h.id)
          if (idx !== -1 && err?.status === 403) {
            homes.value.splice(idx, 1, {
              ...homes.value[idx],
              isOwner: false,
            })
          }
          // Si falla por otro motivo, no bloqueamos la carga de hogares.
        }
      })
      await Promise.all(promises)
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los hogares'
    } finally {
      loading.value = false
    }
  }

  async function addHome({ name, metadata = {} }: { name: string; metadata?: Record<string, unknown> }) {
    error.value = null
    try {
      const authStore = useAuthStore()
      const ownerEmail = authStore.user?.email || authStore.email
      const ownerMetadata = {
        ...metadata,
        ownerName: metadata.ownerName ?? authStore.displayName,
        ownerEmail: metadata.ownerEmail ?? ownerEmail,
      }
      const created = await apiAddHome({ name, metadata: ownerMetadata })
      homes.value.push({
        ...created,
        // TODO: rooms y devices vendrán de endpoints dedicados
        sharedWith: [],
        rooms: 0,
        devices: 0,
        image: created.metadata?.image ?? null,
        sharedByName: null,
        sharedByEmail: null,
        isOwner: true,
      })
      return created
    } catch (err: any) {
      error.value = err.message || 'Error al crear el hogar'
      throw err
    }
  }

  async function updateHome(homeId: string, { name, metadata = {} }: { name: string; metadata?: Record<string, unknown> }) {
    error.value = null
    try {
      const updated = await apiUpdateHome(homeId, { name, metadata })
      const index = homes.value.findIndex(h => h.id === homeId)
      if (index !== -1) {
        homes.value.splice(index, 1, {
          ...homes.value[index],
          ...updated,
          image: updated.metadata?.image ?? null,
        })
      }
      return updated
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el hogar'
      throw err
    }
  }

  async function removeHome(homeId: string) {
    error.value = null
    try {
      await apiDeleteHome(homeId)
      const index = homes.value.findIndex(h => h.id === homeId)
      if (index !== -1) {
        homes.value.splice(index, 1)
      }
      if (selectedHomeId.value === homeId) {
        selectedHomeId.value = null
        localStorage.removeItem('selectedHomeId')
      }
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar el hogar'
      throw err
    }
  }

  function clearHomes() {
    homes.value = []
    selectedHomeId.value = null
    localStorage.removeItem('selectedHomeId')
  }

  return {
    homes,
    loading,
    error,
    selectedHomeId,
    selectedHome,
    selectHome,
    fetchHomes,
    addHome,
    updateHome,
    removeHome,
    clearHomes,
  }
})
