import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Home {
  id: number
  name: string
  rooms: number
  devices: number
  image: string | null
}

export const useHomesStore = defineStore('homes', () => {
  const homes = ref<Home[]>([
    { id: 1, name: 'Casa Nordelta', rooms: 8, devices: 24, image: null },
    { id: 2, name: 'Depto Centro', rooms: 3, devices: 12, image: null },
    { id: 3, name: 'Casa de Playa', rooms: 5, devices: 24, image: null },
  ])

  const selectedHomeId = ref<number | null>(null)

  const selectedHome = computed(
    () => homes.value.find(h => h.id === selectedHomeId.value) ?? null
  )

  const totalDevices = computed(() =>
    homes.value.reduce((acc, h) => acc + h.devices, 0)
  )

  const energySaved = ref(12)

  function selectHome(id: number) {
    selectedHomeId.value = id
  }

  function addHome(home: Omit<Home, 'id'>) {
    homes.value.push({ ...home, id: Date.now() })
  }

  function clearHomes() {
    homes.value = []
    selectedHomeId.value = null
  }

  return {
    homes,
    selectedHomeId,
    selectedHome,
    totalDevices,
    energySaved,
    selectHome,
    addHome,
    clearHomes,
  }
})
