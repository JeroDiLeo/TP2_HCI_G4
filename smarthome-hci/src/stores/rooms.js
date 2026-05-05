import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRoomsStore = defineStore('rooms', () => {
  const rooms = ref([
    { id: 1, name: 'Sala de Estar',        type: 'living',   devicesTotal: 4, devicesActive: 3 },
    { id: 2, name: 'Habitación Principal', type: 'bedroom',  devicesTotal: 4, devicesActive: 2 },
    { id: 3, name: 'Cocina',               type: 'kitchen',  devicesTotal: 4, devicesActive: 1 },
    { id: 4, name: 'Habitación de Tomi',   type: 'bedroom',  devicesTotal: 4, devicesActive: 0 },
    { id: 5, name: 'Baño Principal',       type: 'bathroom', devicesTotal: 4, devicesActive: 0 },
    { id: 6, name: 'Oficina',              type: 'office',   devicesTotal: 4, devicesActive: 2 },
  ])

  const searchQuery = ref('')

  const totalRooms    = computed(() => rooms.value.length)
  const activeDevices = computed(() => rooms.value.reduce((acc, r) => acc + r.devicesActive, 0))

  const filteredRooms = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return rooms.value
    return rooms.value.filter(r => r.name.toLowerCase().includes(q))
  })

  function addRoom({ name, type }) {
    rooms.value.push({ id: Date.now(), name, type, devicesTotal: 0, devicesActive: 0 })
  }

  function removeRoom(id) {
    rooms.value = rooms.value.filter(r => r.id !== id)
  }

  return {
    rooms, searchQuery,
    totalRooms, activeDevices, filteredRooms,
    addRoom, removeRoom,
  }
})
