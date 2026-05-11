import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  getAllHomes,
  addHome as apiAddHome,
  updateHome as apiUpdateHome,
  deleteHome as apiDeleteHome,
  getHomeShareInfo,
  type ApiHome,
  type ApiHomeListResponse,
  type ApiHomeResponse,
} from '@/services/api/homeApi'
import {
  getRoomsByHome,
  type ApiRoom,
  type ApiRoomListResponse,
} from '@/services/api/roomApi'
import {
  getAllDevices,
  type ApiDevice,
  type ApiDeviceListResponse,
} from '@/services/api/deviceApi'
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
  rooms: number
  devices: number
  image: string | null
  sharedByName: string | null
  sharedByEmail: string | null
  isOwner: boolean | null
}

interface UserSummary {
  id: string
  email: string
  name: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function extractHome(data: ApiHomeResponse): ApiHome {
  const result = (data as { result?: ApiHome }).result
  return result ?? data as ApiHome
}

function extractHomeList(data: ApiHomeListResponse): ApiHome[] {
  if (Array.isArray(data)) return data
  return (data as { result?: ApiHome[] }).result ?? []
}

function extractRoomList(data: ApiRoomListResponse): ApiRoom[] {
  if (Array.isArray(data)) return data
  return data?.result ?? []
}

function extractDeviceList(data: ApiDeviceListResponse): ApiDevice[] {
  if (Array.isArray(data)) return data
  return data.result
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

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null
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

function homeAttribution(home: ApiHome | Home) {
  const source = home as ApiHome
  const metadata = source.metadata ?? {}
  const owner = summarizeUser(
    source.owner ??
    source.createdBy ??
    source.creator ??
    source.user ??
    metadata.owner ??
    metadata.createdBy ??
    metadata.creator ??
    metadata.user
  )
  const sharedBy = summarizeUser(
    source.sharedBy ??
    source.sharedByUser ??
    metadata.sharedBy ??
    metadata.sharedByUser
  )

  owner.name = firstText(
    source.ownerName,
    source.createdByName,
    metadata.ownerName,
    metadata.createdByName,
    owner.name,
  )
  owner.email = normalizeEmail(firstText(
    source.ownerEmail,
    source.createdByEmail,
    metadata.ownerEmail,
    metadata.createdByEmail,
    owner.email,
  ))

  sharedBy.name = firstText(
    source.sharedByName,
    metadata.sharedByName,
    sharedBy.name,
  )
  sharedBy.email = normalizeEmail(firstText(
    source.sharedByEmail,
    metadata.sharedByEmail,
    sharedBy.email,
  ))

  return { owner, sharedBy }
}

function sharedByFromHome(home: ApiHome | Home, currentUser: UserSummary): UserSummary | null {
  const { owner, sharedBy } = homeAttribution(home)

  if ((sharedBy.name || sharedBy.email) && differentUser(sharedBy, currentUser)) {
    return sharedBy
  }
  if ((owner.name || owner.email) && differentUser(owner, currentUser)) {
    return owner
  }
  return null
}

function isExplicitOwner(home: ApiHome | Home, currentUser: UserSummary): boolean | null {
  const { owner } = homeAttribution(home)
  const source = home as ApiHome

  if ((owner.email || owner.id) && sameUser(owner, currentUser)) return true
  if ((owner.email || owner.id) && differentUser(owner, currentUser)) return false

  const role = firstText(source.role, source.permission, source.access, source.metadata?.role).toLowerCase()
  if (['owner', 'dueño', 'dueno', 'admin'].some(token => role.includes(token))) return true
  if (['shared', 'member', 'guest', 'invitado', 'miembro'].some(token => role.includes(token))) return false

  return null
}

function normalizeSharedUsers(users: unknown[]): SharedUser[] {
  return users.map(user => {
    const source = isRecord(user) ? user : {}

    return {
      id: userId(user),
      email: userEmail(user),
      name: userName(user),
      sharedAt: firstText(source.sharedAt, source.createdAt, source.date),
    }
  })
}

function mapApiHome(home: ApiHome, currentUser: UserSummary): Home {
  const sharedBy = sharedByFromHome(home, currentUser)
  const explicitOwner = isExplicitOwner(home, currentUser)

  return {
    ...home,
    sharedWith: Array.isArray(home.sharedWith) ? normalizeSharedUsers(home.sharedWith) : [],
    rooms: 0,
    devices: 0,
    image: stringOrNull(home.metadata?.image),
    sharedByName: sharedBy?.name || sharedBy?.email || null,
    sharedByEmail: sharedBy?.email || null,
    isOwner: explicitOwner ?? (sharedBy ? false : null),
  }
}

export const useHomesStore = defineStore('homes', () => {
  const homes = ref<Home[]>([])
  const loading = ref(false)
  const shareLoading = ref(false)
  const countsLoading = ref(false)
  const error = ref<string | null>(null)
  const homesLoaded = ref(false)
  const shareInfoLoaded = ref(false)

  let fetchHomesBasicPromise: Promise<void> | null = null
  let hydrateHomesSharePromise: Promise<void> | null = null

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

  async function fetchHomesBasic(force = false) {
    if (!force && homesLoaded.value) return
    if (fetchHomesBasicPromise) return fetchHomesBasicPromise

    fetchHomesBasicPromise = (async () => {
      loading.value = true
      error.value = null
      try {
        const authStore = useAuthStore()
        const currentUser = currentUserSummary(authStore)
        const data = await getAllHomes()
        const mapped = extractHomeList(data).map(h => mapApiHome(h, currentUser))
        homes.value = mapped
        homesLoaded.value = true
        shareInfoLoaded.value = false
      } catch (err: any) {
        error.value = err.message || 'Error al cargar los hogares'
      } finally {
        loading.value = false
        fetchHomesBasicPromise = null
      }
    })()

    return fetchHomesBasicPromise
  }

  async function hydrateHomesShareInfo(force = false) {
    if (!force && shareInfoLoaded.value) return
    if (hydrateHomesSharePromise) return hydrateHomesSharePromise

    hydrateHomesSharePromise = (async () => {
      if (!homesLoaded.value) {
        await fetchHomesBasic()
      }
      if (!homesLoaded.value) return

      shareLoading.value = true
      error.value = null
      try {
        const authStore = useAuthStore()
        const currentUser = currentUserSummary(authStore)

        const promises = homes.value.map(async (h) => {
          try {
            const shareInfo = await getHomeShareInfo(h.id)
            const users = normalizeSharedUsers(shareInfo.users)
            const idx = homes.value.findIndex(home => home.id === h.id)
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
              isOwner: currentIsSharedUser ? false : currentHome.isOwner ?? true,
            })
          } catch (err: any) {
            const idx = homes.value.findIndex(home => home.id === h.id)
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
        shareInfoLoaded.value = true
      } finally {
        shareLoading.value = false
        hydrateHomesSharePromise = null
      }
    })()

    return hydrateHomesSharePromise
  }

  async function fetchHomes(force = false) {
    await fetchHomesBasic(force)
    await hydrateHomesShareInfo(force)
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
      const created = extractHome(await apiAddHome({ name, metadata: ownerMetadata }))
      homes.value.push({
        ...created,
        sharedWith: [],
        rooms: 0,
        devices: 0,
        image: stringOrNull(created.metadata?.image),
        sharedByName: null,
        sharedByEmail: null,
        isOwner: true,
      })
      homesLoaded.value = true
      return created
    } catch (err: any) {
      error.value = err.message || 'Error al crear el hogar'
      throw err
    }
  }

  async function updateHome(homeId: string, { name, metadata = {} }: { name: string; metadata?: Record<string, unknown> }) {
    error.value = null
    try {
      const updated = extractHome(await apiUpdateHome(homeId, { name, metadata }))
      const index = homes.value.findIndex(h => h.id === homeId)
      if (index !== -1) {
        homes.value.splice(index, 1, {
          ...homes.value[index],
          ...updated,
          image: stringOrNull(updated.metadata?.image),
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

  async function fetchHomeCounts() {
    if (countsLoading.value) return

    countsLoading.value = true
    let allDevices: ApiDevice[] = []
    try {
      const devData = await getAllDevices()
      allDevices = extractDeviceList(devData)
    } catch {
      // non-blocking
    }

    const countPromises = homes.value.map(async (home) => {
      try {
        const roomsData = await getRoomsByHome(home.id)
        const roomsList = extractRoomList(roomsData)
        const roomIds = new Set(roomsList.map(r => String(r.id)))
        const devicesCount = allDevices.filter((d) => {
          const roomId = d.room?.id
          return roomId && roomIds.has(String(roomId))
        }).length
        const idx = homes.value.findIndex(h => h.id === home.id)
        if (idx !== -1) {
          homes.value.splice(idx, 1, {
            ...homes.value[idx],
            rooms: roomsList.length,
            devices: devicesCount,
          })
        }
      } catch {
        // non-blocking: keep 0 on error
      }
    })
    try {
      await Promise.all(countPromises)
    } finally {
      countsLoading.value = false
    }
  }

  function clearHomes() {
    homes.value = []
    homesLoaded.value = false
    shareInfoLoaded.value = false
    selectedHomeId.value = null
    localStorage.removeItem('selectedHomeId')
  }

  return {
    homes,
    loading,
    shareLoading,
    countsLoading,
    error,
    homesLoaded,
    shareInfoLoaded,
    selectedHomeId,
    selectedHome,
    selectHome,
    fetchHomesBasic,
    hydrateHomesShareInfo,
    fetchHomes,
    fetchHomeCounts,
    addHome,
    updateHome,
    removeHome,
    clearHomes,
  }
})
