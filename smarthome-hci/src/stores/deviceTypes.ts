import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAllDeviceTypes,
  getDeviceType as apiGetDeviceType,
} from '@/services/api/deviceTypeApi'
import type { ApiDeviceType } from '@/utils/deviceMapper'
import { TYPE_ID_TO_FRONT } from '@/utils/deviceMapper'

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

export const useDeviceTypesStore = defineStore('deviceTypes', () => {
  const deviceTypes = ref<ApiDeviceType[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  const deviceTypesMap = computed(() => {
    const map: Record<string, ApiDeviceType> = {}
    for (const dt of deviceTypes.value) {
      map[dt.id] = dt
    }
    return map
  })

  function getById(id: string): ApiDeviceType | undefined {
    return deviceTypesMap.value[id]
  }

  function getByFrontType(frontType: string): ApiDeviceType | undefined {
    const entry = Object.entries(TYPE_ID_TO_FRONT).find(([, v]) => v === frontType)
    if (!entry) return undefined
    return deviceTypesMap.value[entry[0]]
  }

  async function fetchAll(force = false) {
    if (!force && loaded.value) return
    loading.value = true
    error.value = null
    try {
      const data = await getAllDeviceTypes()
      const raw = extractList(data) as ApiDeviceType[]
      deviceTypes.value = raw.filter(t => t.name?.toLowerCase() !== 'timer')
      loaded.value = true
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los tipos de dispositivo'
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string) {
    error.value = null
    try {
      const data = await apiGetDeviceType(id)
      const dt = extractOne(data) as ApiDeviceType
      const idx = deviceTypes.value.findIndex(t => t.id === id)
      if (idx !== -1) {
        deviceTypes.value.splice(idx, 1, dt)
      } else {
        deviceTypes.value.push(dt)
      }
      return dt
    } catch (err: any) {
      error.value = err.message || 'Error al cargar el tipo de dispositivo'
      throw err
    }
  }

  function getAction(deviceTypeId: string, actionName: string) {
    return getById(deviceTypeId)?.actions?.find(a => a.name === actionName) ?? null
  }

  function clear() {
    deviceTypes.value = []
    loaded.value = false
    error.value = null
  }

  return {
    deviceTypes,
    loading,
    error,
    loaded,
    deviceTypesMap,
    getById,
    getByFrontType,
    getAction,
    fetchAll,
    fetchOne,
    clear,
  }
})
