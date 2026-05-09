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
import { useHomesStore } from '@/stores/homes'

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
  const actionLoadingById = ref<Record<string, boolean>>({})
  const actionErrorById = ref<Record<string, string | null>>({})

  // ── Computed ────────────────────────────────────────────────────────

  function devicesByRoom(roomId: RoomId): RoomDevice[] {
    return devices.value.filter(d => String(d.roomId) === String(roomId))
  }

  const devicesForActiveHome = computed(() => {
    const homesStore = useHomesStore()
    const roomsStore = useRoomsStore()

    if (!homesStore.selectedHomeId) return devices.value

    const activeHomeRoomIds = new Set(
      roomsStore.rooms.map(room => String(room.id)),
    )

    // If rooms haven't loaded yet, show all devices to avoid empty UI states
    if (activeHomeRoomIds.size === 0) return devices.value

    return devices.value.filter(device =>
      activeHomeRoomIds.has(String(device.roomId)),
    )
  })

  const activeDevices = computed(() =>
    devicesForActiveHome.value.filter(d => d.active),
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
    return updateDevice(id, { name })
  }

  async function updateDevice(id: string, payload: { name?: string; metadata?: Record<string, unknown> }) {
    error.value = null
    try {
      const response = await apiUpdateDevice(id, payload)
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
    const id = String(deviceId)
    if (actionLoadingById.value[id]) return

    error.value = null
    actionErrorById.value = { ...actionErrorById.value, [id]: null }
    actionLoadingById.value = { ...actionLoadingById.value, [id]: true }

    try {
      await apiExecuteAction(id, actionName, params)
      // Después de ejecutar la acción, refrescamos el state del device
      await refreshDeviceState(id)
    } catch (err: any) {
      const message = err.message || 'Error al ejecutar la acción'
      error.value = message
      actionErrorById.value = { ...actionErrorById.value, [id]: message }
      throw err
    } finally {
      actionLoadingById.value = { ...actionLoadingById.value, [id]: false }
    }
  }

  async function refreshDeviceState(deviceId: string) {
    const data = await apiGetDevice(deviceId)
    const mapped = mapDevice(extractOne(data) as ApiDevice)
    const idx = devices.value.findIndex(d => String(d.id) === String(deviceId))
    if (idx !== -1) devices.value.splice(idx, 1, mapped)
  }

  // ── Helpers ────────────────────────────────────────────────────────

  function getDeviceById(id: string): RoomDevice | undefined {
    return devices.value.find(d => String(d.id) === id)
  }

  function isActionLoading(deviceId: string): boolean {
    return !!actionLoadingById.value[String(deviceId)]
  }

  function getActionError(deviceId: string): string | null {
    return actionErrorById.value[String(deviceId)] ?? null
  }

  function setActionError(deviceId: string, message: string) {
    actionErrorById.value = {
      ...actionErrorById.value,
      [String(deviceId)]: message,
    }
  }

  function clearActionError(deviceId: string) {
    actionErrorById.value = {
      ...actionErrorById.value,
      [String(deviceId)]: null,
    }
  }

  function clear() {
    devices.value = []
    error.value = null
    actionLoadingById.value = {}
    actionErrorById.value = {}
  }

  return {
    devices,
    loading,
    error,
    actionLoadingById,
    actionErrorById,
    devicesForActiveHome,
    activeDevices,
    devicesByRoom,
    fetchAll,
    fetchByRoom,
    addDevice,
    updateDeviceName,
    updateDevice,
    removeDevice,
    executeAction,
    refreshDeviceState,
    getDeviceById,
    isActionLoading,
    getActionError,
    setActionError,
    clearActionError,
    clear,
  }
})
