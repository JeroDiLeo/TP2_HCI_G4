import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getAllHomes, addHome as apiAddHome } from '@/services/api/homeApi'

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
}

export const useHomesStore = defineStore('homes', () => {
  const homes = ref<Home[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const selectedHomeId = ref<string | null>(null)

  const selectedHome = computed(
    () => homes.value.find(h => h.id === selectedHomeId.value) ?? null
  )

  function selectHome(id: string) {
    selectedHomeId.value = id
  }

  async function fetchHomes() {
    loading.value = true
    error.value = null
    try {
      const data = await getAllHomes()
      homes.value = data.map((h: any) => ({
        ...h,
        // TODO: rooms y devices vendrán de endpoints dedicados
        rooms: 0,
        devices: 0,
        image: h.metadata?.image ?? null,
      }))
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los hogares'
    } finally {
      loading.value = false
    }
  }

  async function addHome({ name, metadata = {} }: { name: string; metadata?: Record<string, unknown> }) {
    error.value = null
    try {
      const created = await apiAddHome({ name, metadata })
      homes.value.push({
        ...created,
        // TODO: rooms y devices vendrán de endpoints dedicados
        rooms: 0,
        devices: 0,
        image: created.metadata?.image ?? null,
      })
      return created
    } catch (err: any) {
      error.value = err.message || 'Error al crear el hogar'
      throw err
    }
  }

  function clearHomes() {
    homes.value = []
    selectedHomeId.value = null
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
    clearHomes,
  }
})
