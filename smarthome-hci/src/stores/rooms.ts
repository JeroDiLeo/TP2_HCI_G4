import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getRoomsByHome } from '@/services/api/roomApi'

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

const MOCK_ROOMS: Room[] = [
  { id: 1, name: 'Sala de Estar',        type: 'living',   devicesTotal: 4, devicesActive: 3, favorite: true  },
  { id: 2, name: 'Habitación Principal', type: 'bedroom',  devicesTotal: 4, devicesActive: 2, favorite: true  },
  { id: 3, name: 'Cocina',               type: 'kitchen',  devicesTotal: 4, devicesActive: 1, favorite: false },
  { id: 4, name: 'Habitación de Tomi',   type: 'bedroom',  devicesTotal: 4, devicesActive: 0, favorite: false },
  { id: 5, name: 'Baño Principal',       type: 'bathroom', devicesTotal: 4, devicesActive: 0, favorite: false },
  { id: 6, name: 'Oficina',              type: 'office',   devicesTotal: 4, devicesActive: 2, favorite: false },
]

export const useRoomsStore = defineStore('rooms', () => {
  const rooms = ref<Room[]>([...MOCK_ROOMS])
  const searchQuery = ref('')
  const categoryFilter = ref<string>('todas')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalRooms = computed(() => rooms.value.length)
  const activeDevices = computed(() =>
    rooms.value.reduce((acc, r) => acc + (r.devicesActive ?? 0), 0)
  )

  const filteredRooms = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    const cat = categoryFilter.value
    return rooms.value.filter(r => {
      const matchesSearch   = !q || r.name.toLowerCase().includes(q)
      const matchesCategory = cat === 'todas' || (r.type ?? 'other') === cat
      return matchesSearch && matchesCategory
    })
  })

  const favoriteRooms = computed(() => rooms.value.filter(r => r.favorite))

  function addRoom({ name, type }: { name: string; type?: string }): Room {
    const created: Room = {
      id: Date.now(),
      name,
      type,
      devicesTotal: 0,
      devicesActive: 0,
      favorite: false,
    }
    rooms.value.push(created)
    return created
  }

  function removeRoom(id: number | string) {
    rooms.value = rooms.value.filter(r => r.id !== id)
  }

  function toggleFavorite(id: number | string) {
    const room = rooms.value.find(r => r.id === id)
    if (room) room.favorite = !room.favorite
  }

  function addDevicesToRoom(id: number | string, count: number, activeCount = 0) {
    const room = rooms.value.find(r => r.id === id)
    if (!room) return
    room.devicesTotal  = (room.devicesTotal  ?? 0) + count
    room.devicesActive = (room.devicesActive ?? 0) + activeCount
  }

  async function fetchRoomsByHome(homeId: string) {
    loading.value = true
    error.value = null
    try {
      const data = await getRoomsByHome(homeId)
      rooms.value = data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar las habitaciones'
    } finally {
      loading.value = false
    }
  }

  function clearRooms() {
    rooms.value = []
    error.value = null
  }

  return {
    rooms, searchQuery, categoryFilter, loading, error,
    totalRooms, activeDevices, filteredRooms, favoriteRooms,
    addRoom, removeRoom, toggleFavorite, addDevicesToRoom,
    fetchRoomsByHome, clearRooms,
  }
})
