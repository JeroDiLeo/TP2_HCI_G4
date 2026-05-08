import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAllDevices,
  getDevice as apiGetDevice,
  getDevicesByRoom as apiGetDevicesByRoom,
  addDevice as apiAddDevice,
  updateDevice as apiUpdateDevice,
  deleteDevice as apiDeleteDevice,
  getDeviceState as apiGetDeviceState,
  executeAction as apiExecuteAction,
} from '@/services/api/deviceApi'
import {
  fromApi,
  toApiCreate,
  type ApiDevice,
} from '@/utils/deviceMapper'
import type { RoomDevice, RoomDeviceType, RoomId } from '@/types/rooms'
import { useRoomsStore } from '@/stores/rooms'

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

/** Resuelve el nombre de la room a partir del rooms store */
function resolveRoomName(roomId: string | undefined): string {
  if (!roomId) return ''
  const roomsStore = useRoomsStore()
  const room = roomsStore.getRoomById(roomId)
  return room?.name ?? ''
}

/** Convierte un device de la API al shape del front, resolviendo roomName */
function mapDevice(apiDevice: ApiDevice): RoomDevice {
  const roomName = resolveRoomName(apiDevice.room?.id)
  return fromApi(apiDevice, roomName)
}


export const useDevicesStore = defineStore('devices', () => {
  const devices = ref<RoomDevice[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ── Computed ────────────────────────────────────────────────────────

  function devicesByRoom(roomId: RoomId): RoomDevice[] {
    return devices.value.filter(d => String(d.roomId) === String(roomId))
  }

  const activeDevices = computed(() =>
    devices.value.filter(d => d.active),
  )

  // ── Fetch ──────────────────────────────────────────────────────────

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const data = await getAllDevices()
      devices.value = extractList(data).map(d => mapDevice(d as ApiDevice))
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los dispositivos'
    } finally {
      loading.value = false
    }
  }

  async function fetchByRoom(roomId: string) {
    loading.value = true
    error.value = null
    try {
      const data = await apiGetDevicesByRoom(roomId)
      const fetched = extractList(data).map(d => mapDevice(d as ApiDevice))
      // Reemplaza solo los devices de esa room en el array local
      const otherDevices = devices.value.filter(d => String(d.roomId) !== String(roomId))
      devices.value = [...otherDevices, ...fetched]
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los dispositivos de la habitación'
    } finally {
      loading.value = false
    }
  }

  // ── CRUD ───────────────────────────────────────────────────────────

  async function addDevice(deviceData: { name: string; type: RoomDeviceType; roomId?: RoomId }) {
    error.value = null
    try {
      const payload = toApiCreate(deviceData)
      const response = await apiAddDevice(payload)
      const apiDevice = extractOne(response) as ApiDevice
      // Asegurar que el roomId se preserve si la API no lo devuelve en el response
      if (deviceData.roomId && !apiDevice.room?.id) {
        apiDevice.room = { id: String(deviceData.roomId) }
      }
      const mapped = mapDevice(apiDevice)
      devices.value.push(mapped)
      return mapped
    } catch (err: any) {
      error.value = err.message || 'Error al crear el dispositivo'
      throw err
    }
  }

  async function updateDeviceName(id: string, name: string) {
    error.value = null
    try {
      const response = await apiUpdateDevice(id, { name })
      const mapped = mapDevice(extractOne(response) as ApiDevice)
      const idx = devices.value.findIndex(d => String(d.id) === id)
      if (idx !== -1) devices.value.splice(idx, 1, mapped)
      return mapped
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el dispositivo'
      throw err
    }
  }

  async function removeDevice(id: string) {
    error.value = null
    try {
      await apiDeleteDevice(id)
      devices.value = devices.value.filter(d => String(d.id) !== id)
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar el dispositivo'
      throw err
    }
  }

  // ── Acciones de dispositivo ────────────────────────────────────────

  async function executeAction(deviceId: string, actionName: string, params: unknown[] = []) {
    error.value = null
    try {
      await apiExecuteAction(deviceId, actionName, params)
      // Después de ejecutar la acción, refrescamos el state del device
      await refreshDeviceState(deviceId)
    } catch (err: any) {
      error.value = err.message || 'Error al ejecutar la acción'
      throw err
    }
  }

  async function refreshDeviceState(deviceId: string) {
    try {
      const data = await apiGetDevice(deviceId)
      const mapped = mapDevice(extractOne(data) as ApiDevice)
      const idx = devices.value.findIndex(d => String(d.id) === String(deviceId))
      if (idx !== -1) devices.value.splice(idx, 1, mapped)
    } catch (_) {
      // Si falla el refresh, no rompemos el flujo
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────

  function getDeviceById(id: string): RoomDevice | undefined {
    return devices.value.find(d => String(d.id) === id)
  }

  function clear() {
    devices.value = []
    error.value = null
  }

  return {
    devices,
    loading,
    error,
    activeDevices,
    devicesByRoom,
    fetchAll,
    fetchByRoom,
    addDevice,
    updateDeviceName,
    removeDevice,
    executeAction,
    refreshDeviceState,
    getDeviceById,
    clear,
  }
})
