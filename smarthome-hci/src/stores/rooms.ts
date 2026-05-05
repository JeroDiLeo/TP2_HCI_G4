import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getRoomsByHome } from '@/services/api/roomApi'

export interface Room {
  id: number | string
  name: string
  type?: string
  devicesTotal?: number
  devicesActive?: number
  home?: { id: string }
  metadata?: Record<string, unknown>
}

const MOCK_ROOMS: Room[] = [
  { id: 1, name: 'Sala de Estar',        type: 'living',   devicesTotal: 4, devicesActive: 3 },
  { id: 2, name: 'Habitación Principal', type: 'bedroom',  devicesTotal: 4, devicesActive: 2 },
  { id: 3, name: 'Cocina',               type: 'kitchen',  devicesTotal: 4, devicesActive: 1 },
  { id: 4, name: 'Habitación de Tomi',   type: 'bedroom',  devicesTotal: 4, devicesActive: 0 },
  { id: 5, name: 'Baño Principal',       type: 'bathroom', devicesTotal: 4, devicesActive: 0 },
  { id: 6, name: 'Oficina',              type: 'office',   devicesTotal: 4, devicesActive: 2 },
]

export const useRoomsStore = defineStore('rooms', () => {
  const rooms = ref<Room[]>([...MOCK_ROOMS])
  const searchQuery = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalRooms = computed(() => rooms.value.length)
  const activeDevices = computed(() =>
    rooms.value.reduce((acc, r) => acc + (r.devicesActive ?? 0), 0)
  )

  const filteredRooms = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return rooms.value
    return rooms.value.filter(r => r.name.toLowerCase().includes(q))
  })

  function addRoom({ name, type }: { name: string; type?: string }) {
    rooms.value.push({
      id: Date.now(),
      name,
      type,
      devicesTotal: 0,
      devicesActive: 0,
    })
  }

  function removeRoom(id: number | string) {
    rooms.value = rooms.value.filter(r => r.id !== id)
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
    rooms, searchQuery, loading, error,
    totalRooms, activeDevices, filteredRooms,
    addRoom, removeRoom, fetchRoomsByHome, clearRooms,
  }
})
