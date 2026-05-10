import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getRoomsByHome,
  createRoom as apiCreateRoom,
  updateRoom as apiUpdateRoom,
  deleteRoom as apiDeleteRoom,
  type ApiOptionalRoomResponse,
  type ApiRoom,
  type ApiRoomListResponse,
  type ApiRoomPayload,
  type ApiRoomResponse,
} from '@/services/api/roomApi'
import { useDevicesStore } from '@/stores/devices'
import { useHomesStore } from '@/stores/homes'

export interface Room {
  id: number | string
  name: string
  type?: string
  devicesTotal?: number
  devicesActive?: number
  favorite?: boolean
  home?: { id: string }
  metadata?: Record<string, unknown>
}

function extractRoom(data: ApiRoomResponse): ApiRoom
function extractRoom(data: ApiOptionalRoomResponse): ApiRoom | null
function extractRoom(data: ApiRoomResponse | ApiOptionalRoomResponse): ApiRoom | null {
  if (!data) return null
  return 'result' in data ? data.result ?? null : data
}

function extractRoomList(data: ApiRoomListResponse): ApiRoom[] {
  if (Array.isArray(data)) return data
  return data?.result ?? []
}

function mapApiRoom(room: ApiRoom, fallbackType = 'other'): Room {
  const metadata = room.metadata ?? {}
  const roomType = typeof metadata.type === 'string' ? metadata.type : fallbackType

  return {
    id: room.id,
    name: room.name ?? '',
    type: roomType,
    favorite: metadata.favorite === true,
    home: room.home?.id !== undefined ? { id: String(room.home.id) } : undefined,
    metadata: room.metadata,
  }
}

export const useRoomsStore = defineStore('rooms', () => {
  const rooms = ref<Room[]>([])
  const searchQuery = ref('')
  const categoryFilter = ref<string>('todas')
  const loading = ref(false)
  const roomsLoaded = ref(false)
  const loadedHomeId = ref<string | null>(null)
  const error = ref<string | null>(null)
  let fetchRoomsPromise: Promise<void> | null = null
  let fetchRoomsHomeId: string | null = null

  const roomsWithStats = computed<Room[]>(() =>
    rooms.value.map(r => {
      const devicesStore = useDevicesStore()
      const roomDevices = devicesStore.devicesByRoom(r.id)
      return {
        ...r,
        devicesTotal: roomDevices.length,
        devicesActive: roomDevices.filter(d => d.active).length,
      }
    }),
  )

  const totalRooms = computed(() => rooms.value.length)

  const activeDevices = computed(() => {
    const devicesStore = useDevicesStore()
    return devicesStore.activeDevices.length
  })

  const filteredRooms = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    const cat = categoryFilter.value
    return roomsWithStats.value.filter(r => {
      const matchesSearch = !q || r.name.toLowerCase().includes(q)
      const matchesCategory = cat === 'todas' || (r.type ?? 'other') === cat
      return matchesSearch && matchesCategory
    })
  })

  const favoriteRooms = computed(() => roomsWithStats.value.filter(r => r.favorite))

  function getRoomById(id: number | string): Room | undefined {
    return roomsWithStats.value.find(r => String(r.id) === String(id))
  }

  function syncDeviceRoomContext() {
    const devicesStore = useDevicesStore()
    devicesStore.syncRoomsForActiveHome(rooms.value.map(room => ({
      id: room.id,
      name: room.name,
    })))
  }

  async function addRoom({ name, type }: { name: string; type?: string }): Promise<Room> {
    const homesStore = useHomesStore()
    const homeId = homesStore.selectedHomeId

    const body: ApiRoomPayload & { name: string } = {
      name,
      metadata: { type: type ?? 'other' },
    }
    if (homeId) {
      body.home = { id: homeId }
    }

    const data = await apiCreateRoom(body)
    const result = extractRoom(data)
    const created = mapApiRoom(result, type ?? 'other')
    rooms.value.push(created)
    syncDeviceRoomContext()
    roomsLoaded.value = true
    loadedHomeId.value = homeId
    return created
  }

  async function updateRoom(
    id: number | string,
    payload: { name?: string; metadata?: Record<string, unknown> },
  ) {
    const idx = rooms.value.findIndex(r => String(r.id) === String(id))
    const current = idx !== -1 ? rooms.value[idx] : null
    const metadata = payload.metadata
      ? { ...(current?.metadata ?? {}), ...payload.metadata }
      : current?.metadata
    const body: ApiRoomPayload = {}

    if (payload.name !== undefined) body.name = payload.name
    else if (current?.name) body.name = current.name
    if (metadata) body.metadata = metadata

    const data = await apiUpdateRoom(String(id), body)
    const result = extractRoom(data)
    if (idx !== -1) {
      const nextMetadata = result?.metadata ?? metadata ?? rooms.value[idx].metadata
      const nextType = typeof nextMetadata?.type === 'string'
        ? nextMetadata.type
        : rooms.value[idx].type
      rooms.value[idx] = {
        ...rooms.value[idx],
        name: result?.name ?? payload.name ?? rooms.value[idx].name,
        type: nextType,
        favorite: nextMetadata?.favorite === true,
        metadata: nextMetadata,
      }
      syncDeviceRoomContext()
    }
  }

  async function removeRoom(id: number | string) {
    const prev = rooms.value
    rooms.value = rooms.value.filter(r => String(r.id) !== String(id))
    syncDeviceRoomContext()
    try {
      await apiDeleteRoom(String(id))
    } catch (err) {
      rooms.value = prev
      syncDeviceRoomContext()
      throw err
    }
  }

  async function toggleFavorite(id: number | string) {
    const idx = rooms.value.findIndex(r => String(r.id) === String(id))
    if (idx === -1) return

    const previous = { ...rooms.value[idx], metadata: { ...(rooms.value[idx].metadata ?? {}) } }
    const nextFavorite = !rooms.value[idx].favorite
    const nextMetadata = {
      ...(rooms.value[idx].metadata ?? {}),
      type: rooms.value[idx].type ?? rooms.value[idx].metadata?.type ?? 'other',
      favorite: nextFavorite,
    }

    rooms.value[idx] = {
      ...rooms.value[idx],
      favorite: nextFavorite,
      metadata: nextMetadata,
    }

    try {
      await updateRoom(id, { metadata: nextMetadata })
    } catch (err: unknown) {
      rooms.value[idx] = previous
      error.value = (err as Error).message || 'Error al actualizar la habitación'
    }
  }

  async function fetchRoomsByHome(homeId: string, force = false) {
    if (!force && roomsLoaded.value && loadedHomeId.value === homeId) return
    if (fetchRoomsPromise) {
      if (fetchRoomsHomeId === homeId) return fetchRoomsPromise
      await fetchRoomsPromise
    }

    fetchRoomsHomeId = homeId
    fetchRoomsPromise = (async () => {
      loading.value = true
      roomsLoaded.value = false
      error.value = null
      try {
        const data = await getRoomsByHome(homeId)
        rooms.value = extractRoomList(data).map(room => mapApiRoom(room))
        syncDeviceRoomContext()
        loadedHomeId.value = homeId
      } catch (err: unknown) {
        error.value = (err as Error).message ?? 'Error al cargar las habitaciones'
      } finally {
        loading.value = false
        roomsLoaded.value = true
        fetchRoomsPromise = null
        fetchRoomsHomeId = null
      }
    })()

    return fetchRoomsPromise
  }

  function clearRooms() {
    rooms.value = []
    const devicesStore = useDevicesStore()
    devicesStore.clearActiveHomeRooms()
    roomsLoaded.value = true
    loadedHomeId.value = null
    error.value = null
  }

  return {
    rooms: roomsWithStats,
    searchQuery,
    categoryFilter,
    loading,
    roomsLoaded,
    error,
    totalRooms,
    activeDevices,
    filteredRooms,
    favoriteRooms,
    getRoomById,
    addRoom,
    updateRoom,
    removeRoom,
    toggleFavorite,
    fetchRoomsByHome,
    clearRooms,
  }
})
