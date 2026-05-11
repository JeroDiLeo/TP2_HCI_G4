import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAllDevices,
  getDevice as apiGetDevice,
  getDevicesByRoom as apiGetDevicesByRoom,
  addDevice as apiAddDevice,
  updateDevice as apiUpdateDevice,
  deleteDevice as apiDeleteDevice,
  executeAction as apiExecuteAction,
  type ApiDeviceListResponse,
  type ApiDeviceResponse,
} from '@/services/api/deviceApi'
import {
  fromApi,
  toApiCreate,
  type ApiDevice,
} from '@/utils/deviceMapper'
import type { RoomDevice, RoomDeviceType, RoomId } from '@/types/rooms'
import { useHomesStore } from '@/stores/homes'

function extractList(data: ApiDeviceListResponse): ApiDevice[] {
  if (Array.isArray(data)) return data
  return data.result
}

function extractOne(data: ApiDeviceResponse): ApiDevice {
  return 'result' in data ? data.result : data
}

function preserveVacuumPauseState(
  mapped: RoomDevice,
  actionName?: string,
): RoomDevice {
  if (
    actionName !== 'pause' ||
    mapped.type !== 'vacuum' ||
    mapped.vacuumStatus !== 'apagada'
  ) {
    return mapped
  }

  return {
    ...mapped,
    active: true,
    vacuumStatus: 'pausada',
  }
}


export const useDevicesStore = defineStore('devices', () => {
  const devices = ref<RoomDevice[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)
  const actionLoadingById = ref<Record<string, boolean>>({})
  const actionErrorById = ref<Record<string, string | null>>({})
  const activeHomeRoomIds = ref<Set<string> | null>(null)
  const roomNamesById = ref<Record<string, string>>({})
  let fetchAllPromise: Promise<void> | null = null

  // ── Computed ────────────────────────────────────────────────────────

  function resolveRoomName(roomId: string | undefined): string {
    if (!roomId) return ''
    return roomNamesById.value[String(roomId)] ?? ''
  }

  function mapDevice(apiDevice: ApiDevice): RoomDevice {
    const roomName = apiDevice.room?.name ?? resolveRoomName(apiDevice.room?.id)
    return fromApi(apiDevice, roomName)
  }

  function devicesByRoom(roomId: RoomId): RoomDevice[] {
    return devices.value.filter(d => String(d.roomId) === String(roomId))
  }

  const devicesForActiveHome = computed<RoomDevice[]>(() => {
    const homesStore = useHomesStore()

    if (!homesStore.selectedHomeId) return devices.value

    const roomIds = activeHomeRoomIds.value

    if (!roomIds) return devices.value
    if (roomIds.size === 0) return []

    return devices.value.filter(device =>
      roomIds.has(String(device.roomId)),
    )
  })

  const activeDevices = computed<RoomDevice[]>(() =>
    devicesForActiveHome.value.filter(d => d.active),
  )

  // ── Fetch ──────────────────────────────────────────────────────────

  async function fetchAll(force = false) {
    if (!force && loaded.value) return
    if (fetchAllPromise) return fetchAllPromise

    fetchAllPromise = (async () => {
      loading.value = true
      error.value = null
      try {
        const data = await getAllDevices()
        devices.value = extractList(data).map(d => mapDevice(d))
        loaded.value = true
      } catch (err: any) {
        error.value = err.message || 'Error al cargar los dispositivos'
      } finally {
        loading.value = false
        fetchAllPromise = null
      }
    })()

    return fetchAllPromise
  }

  async function fetchByRoom(roomId: string) {
    loading.value = true
    error.value = null
    try {
      const data = await apiGetDevicesByRoom(roomId)
      const fetched = extractList(data).map(d => mapDevice(d))
      // Reemplaza solo los devices de esa room en el array local
      const otherDevices = devices.value.filter(d => String(d.roomId) !== String(roomId))
      devices.value = [...otherDevices, ...fetched]
      loaded.value = true
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
      const apiDevice = extractOne(response)
      // Asegurar que el roomId se preserve si la API no lo devuelve en el response
      if (deviceData.roomId && !apiDevice.room?.id) {
        apiDevice.room = { id: String(deviceData.roomId) }
      }
      const mapped = mapDevice(apiDevice)
      devices.value.push(mapped)
      loaded.value = true
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
      const mapped = mapDevice(extractOne(response))
      const idx = devices.value.findIndex(d => String(d.id) === id)
      if (idx !== -1) devices.value.splice(idx, 1, mapped)
      loaded.value = true
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
      loaded.value = true
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
      await refreshDeviceState(id, actionName)
    } catch (err: any) {
      const message = err.message || 'Error al ejecutar la acción'
      error.value = message
      actionErrorById.value = { ...actionErrorById.value, [id]: message }
      throw err
    } finally {
      actionLoadingById.value = { ...actionLoadingById.value, [id]: false }
    }
  }

  async function refreshDeviceState(deviceId: string, actionName?: string) {
    const data = await apiGetDevice(deviceId)
    const mapped = preserveVacuumPauseState(
      mapDevice(extractOne(data)),
      actionName,
    )
    const idx = devices.value.findIndex(d => String(d.id) === String(deviceId))
    if (idx !== -1) devices.value.splice(idx, 1, mapped)
  }

  // ── Helpers ────────────────────────────────────────────────────────

  function getDeviceById(id: string): RoomDevice | undefined {
    return devices.value.find(d => String(d.id) === id)
  }

  function refreshRoomNames() {
    devices.value = devices.value.map(device => ({
      ...device,
      roomName: resolveRoomName(String(device.roomId)) || device.roomName,
    }))
  }

  function syncRoomsForActiveHome(rooms: Array<{ id: RoomId; name: string }>) {
    activeHomeRoomIds.value = new Set(rooms.map(room => String(room.id)))
    roomNamesById.value = rooms.reduce<Record<string, string>>((acc, room) => {
      acc[String(room.id)] = room.name
      return acc
    }, {})
    refreshRoomNames()
  }

  function clearActiveHomeRooms() {
    activeHomeRoomIds.value = null
    roomNamesById.value = {}
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
    loaded.value = false
    error.value = null
    actionLoadingById.value = {}
    actionErrorById.value = {}
    clearActiveHomeRooms()
  }

  return {
    devices,
    loading,
    loaded,
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
    refreshRoomNames,
    syncRoomsForActiveHome,
    clearActiveHomeRooms,
    isActionLoading,
    getActionError,
    setActionError,
    clearActionError,
    clear,
  }
})
