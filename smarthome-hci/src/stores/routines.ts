import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAllRoutines,
  addRoutine as apiAddRoutine,
  updateRoutine as apiUpdateRoutine,
  deleteRoutine as apiDeleteRoutine,
  executeRoutine as apiExecuteRoutine,
} from '@/services/api/routineApi'
import { fromApi, toApi, type FrontRoutine, type FrontRoutineAction } from '@/utils/routineMapper'
import { useHomesStore } from '@/stores/homes'

export type { FrontRoutineAction }
export type Routine = FrontRoutine

export interface RoutineTrigger {
  type: 'schedule' | 'manual'
  time?: string
}

// mock anterior, queda comentado por si hay que hacer rollback
/*
const MOCK_ROUTINES: Routine[] = [
  {
    id: 'r1', name: 'Buenos Días', description: 'Despierta con el ambiente perfecto',
    category: 'Mañana', icon: 'mdi-white-balance-sunny',
    trigger: { type: 'schedule', time: '07:00' },
    actions: [],
    days: ['lun', 'mar', 'mie', 'jue', 'vie'],
    favorite: true, homeId: null,
  },
  {
    id: 'r2', name: 'Buenas Noches', description: 'Prepara tu casa para dormir',
    category: 'Noche', icon: 'mdi-weather-night',
    trigger: { type: 'schedule', time: '22:00' },
    actions: [],
    days: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'],
    favorite: true, homeId: null,
  },
  {
    id: 'r3', name: 'Modo Película', description: 'Configura la sala para una buena peli',
    category: 'Confort', icon: 'mdi-movie-open',
    trigger: { type: 'manual' },
    actions: [],
    days: [],
    favorite: true, homeId: null,
  },
  {
    id: 'r4', name: 'Modo Ahorro', description: 'Reduce el consumo energético',
    category: 'Personalizada', icon: 'mdi-leaf',
    trigger: { type: 'schedule', time: '23:00' },
    actions: [],
    days: ['mie', 'jue', 'vie'],
    homeId: null,
  },
  {
    id: 'r5', name: 'Seguridad Nocturna', description: 'Asegura la casa antes de dormir',
    category: 'Seguridad', icon: 'mdi-shield-check',
    trigger: { type: 'schedule', time: '23:00' },
    actions: [],
    days: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'],
    homeId: null,
  },
  {
    id: 'r6', name: 'Hora del Café', description: 'Prepara el ambiente para tu café',
    category: 'Confort', icon: 'mdi-coffee',
    trigger: { type: 'schedule', time: '15:00' },
    actions: [],
    days: ['sab', 'dom'],
    homeId: null,
  },
]
*/

function extractList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray((data as any).result)) {
    return (data as any).result
  }
  return []
}

function extractOne(data: unknown): unknown {
  if (data && typeof data === 'object' && 'result' in (data as any)) {
    return (data as any).result
  }
  return data
}


export const useRoutinesStore = defineStore('routines', () => {
  const routines = ref<FrontRoutine[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filteredRoutines = computed(() => {
    const homesStore = useHomesStore()
    const homeId = homesStore.selectedHomeId
    if (!homeId) return routines.value
    return routines.value.filter(r => r.homeId === homeId)
  })

  const favoriteRoutines = computed(() =>
    filteredRoutines.value.filter(r => r.favorite),
  )

  async function fetchRoutines() {
    loading.value = true
    error.value = null
    try {
      const data = await getAllRoutines()
      routines.value = extractList(data).map(r => fromApi(r as any))
    } catch (err: any) {
      error.value = err.message || 'Error al cargar las rutinas'
    } finally {
      loading.value = false
    }
  }

  async function addRoutine(data: Omit<FrontRoutine, 'id'>) {
    error.value = null
    try {
      const homesStore = useHomesStore()
      const withHome: Omit<FrontRoutine, 'id'> = {
        ...data,
        homeId: data.homeId ?? homesStore.selectedHomeId,
      }
      const payload = toApi(withHome)
      const response = await apiAddRoutine(payload)
      const mapped = fromApi(extractOne(response) as any)
      routines.value.push(mapped)
      return mapped
    } catch (err: any) {
      error.value = err.message || 'Error al crear la rutina'
      throw err
    }
  }

  async function updateRoutine(id: string, patch: Partial<FrontRoutine>) {
    error.value = null
    try {
      const idx = routines.value.findIndex(r => r.id === id)
      if (idx === -1) return
      const merged: Omit<FrontRoutine, 'id'> = { ...routines.value[idx], ...patch }
      const payload = toApi(merged)
      const response = await apiUpdateRoutine(id, payload)
      const mapped = fromApi(extractOne(response) as any)
      routines.value.splice(idx, 1, mapped)
      return mapped
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar la rutina'
      throw err
    }
  }

  async function removeRoutine(id: string) {
    error.value = null
    try {
      await apiDeleteRoutine(id)
      routines.value = routines.value.filter(r => r.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar la rutina'
      throw err
    }
  }

  async function executeRoutine(id: string) {
    error.value = null
    try {
      return await apiExecuteRoutine(id)
    } catch (err: any) {
      error.value = err.message || 'Error al ejecutar la rutina'
      throw err
    }
  }

  async function duplicateRoutine(id: string) {
    const orig = routines.value.find(r => r.id === id)
    if (!orig) return
    const { id: _id, ...rest } = orig
    return await addRoutine({ ...rest, name: `${orig.name} (copia)` })
  }

  async function toggleFavorite(id: string) {
    const routine = routines.value.find(r => r.id === id)
    if (!routine) return
    return await updateRoutine(id, { favorite: !routine.favorite })
  }

  return {
    routines,
    loading,
    error,
    filteredRoutines,
    favoriteRoutines,
    fetchRoutines,
    addRoutine,
    updateRoutine,
    removeRoutine,
    executeRoutine,
    duplicateRoutine,
    toggleFavorite,
  }
})
