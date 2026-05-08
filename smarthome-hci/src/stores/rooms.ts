import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getRoomsByHome, createRoom as apiCreateRoom, deleteRoom as apiDeleteRoom } from '@/services/api/roomApi'
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

export const useRoomsStore = defineStore('rooms', () => {
  const rooms = ref<Room[]>([])
  const searchQuery = ref('')
  const categoryFilter = ref<string>('todas')
  const loading = ref(false)
  const error = ref<string | null>(null)

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

  async function addRoom({ name, type }: { name: string; type?: string }): Promise<Room> {
    const homesStore = useHomesStore()
    const homeId = homesStore.selectedHomeId

    const body: Record<string, unknown> = {
      name,
      metadata: { type: type ?? 'other' },
    }
    if (homeId) {
      body.home = { id: homeId }
    }

    const data = await apiCreateRoom(body)
    const result = data?.result ?? data
    const created: Room = {
      id: result.id,
      name: result.name,
      type: result.metadata?.type ?? type ?? 'other',
      favorite: false,
      home: result.home,
      metadata: result.metadata,
    }
    rooms.value.push(created)
    return created
  }

  async function removeRoom(id: number | string) {
    await apiDeleteRoom(String(id))
    rooms.value = rooms.value.filter(r => String(r.id) !== String(id))
  }

  function toggleFavorite(id: number | string) {
    const room = rooms.value.find(r => String(r.id) === String(id))
    if (room) room.favorite = !room.favorite
  }

  async function fetchRoomsByHome(homeId: string) {
    loading.value = true
    error.value = null
    try {
      const data = await getRoomsByHome(homeId)
      const list = Array.isArray(data) ? data : (data?.result ?? [])
      rooms.value = list.map((r: any) => ({
        id: r.id,
        name: r.name,
        type: r.metadata?.type ?? 'other',
        favorite: r.metadata?.favorite === true,
        home: r.home,
        metadata: r.metadata,
      }))
    } catch (err: unknown) {
      error.value = (err as Error).message ?? 'Error al cargar las habitaciones'
    } finally {
      loading.value = false
    }
  }

  function clearRooms() {
    rooms.value = []
    error.value = null
  }

  return {
    rooms: roomsWithStats,
    searchQuery,
    categoryFilter,
    loading,
    error,
    totalRooms,
    activeDevices,
    filteredRooms,
    favoriteRooms,
    getRoomById,
    addRoom,
    removeRoom,
    toggleFavorite,
    fetchRoomsByHome,
    clearRooms,
  }
})
