import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getRoomsByHome } from '@/services/api/roomApi'

export interface Room {
  id: string
  name: string
  home: { id: string }
  metadata: Record<string, unknown>
}

export const useRoomsStore = defineStore('rooms', () => {
  const rooms = ref<Room[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

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

  return { rooms, loading, error, fetchRoomsByHome, clearRooms }
})
